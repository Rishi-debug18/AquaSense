"""
AI Feedback Service — AquaSense
Rule-based feedback processing with optional Google Gemini integration.

IMPORTANT: This service NEVER invents data.
All consumption, billing, and device facts are retrieved from the database.
Responses clearly label [DATABASE FACT] vs [GENERAL GUIDANCE].
"""
import os
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_
from typing import Optional

from app.models.area import WaterReading, Bill, Alert, Feedback, SupportTicket
from app.models.household import Household
from app.models.area import Device
import uuid


# Category keywords for classification
CATEGORY_KEYWORDS = {
    "BILLING": ["bill", "charge", "amount", "tariff", "payment", "invoice", "overcharge", "wrong amount"],
    "METER": ["meter", "gauge", "reading", "device", "sensor", "not updating", "offline"],
    "WATER_SUPPLY": ["supply", "no water", "water not coming", "shortage", "pressure", "interruption"],
    "LEAKAGE": ["leak", "leakage", "pipe burst", "water loss", "dripping", "overflow"],
    "HIGH_USAGE": ["high usage", "high consumption", "excessive", "suddenly increased", "too much"],
    "TECHNICAL": ["app", "website", "login", "error", "not working", "bug", "slow"],
}


def classify_category(text: str) -> str:
    text_lower = text.lower()
    scores = {cat: 0 for cat in CATEGORY_KEYWORDS}
    for cat, keywords in CATEGORY_KEYWORDS.items():
        for kw in keywords:
            if kw in text_lower:
                scores[cat] += 1
    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else "GENERAL"


async def get_household_context(household_id: str, db: AsyncSession) -> dict:
    """
    Fetch actual household data from DB for AI response grounding.
    NEVER invented — only real database values.
    """
    ctx = {}

    # Today's consumption
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    stmt = select(func.sum(WaterReading.volume_litre)).where(
        and_(
            WaterReading.household_id == household_id,
            WaterReading.reading_ts >= today_start,
            WaterReading.sensor_type == "MAIN",
        )
    )
    result = await db.execute(stmt)
    ctx["today_litres"] = round(result.scalar() or 0.0, 1)

    # 30-day total
    month_start = today_start - timedelta(days=30)
    stmt2 = select(func.sum(WaterReading.volume_litre)).where(
        and_(
            WaterReading.household_id == household_id,
            WaterReading.reading_ts >= month_start,
            WaterReading.sensor_type == "MAIN",
        )
    )
    r2 = await db.execute(stmt2)
    ctx["month_litres"] = round(r2.scalar() or 0.0, 1)
    ctx["month_m3"] = round(ctx["month_litres"] / 1000, 3)

    # 3-month average daily
    three_month_start = today_start - timedelta(days=90)
    stmt3 = select(func.sum(WaterReading.volume_litre)).where(
        and_(
            WaterReading.household_id == household_id,
            WaterReading.reading_ts >= three_month_start,
            WaterReading.sensor_type == "MAIN",
        )
    )
    r3 = await db.execute(stmt3)
    total_90 = r3.scalar() or 0.0
    ctx["avg_daily_90d"] = round(total_90 / 90, 1)

    # Latest bill
    stmt4 = select(Bill).where(
        Bill.household_id == household_id
    ).order_by(Bill.created_at.desc()).limit(1)
    r4 = await db.execute(stmt4)
    bill = r4.scalars().first()
    if bill:
        ctx["latest_bill_period"] = bill.billing_period
        ctx["latest_bill_amount"] = bill.total_amount
        ctx["latest_bill_status"] = bill.status
        ctx["latest_bill_consumption_m3"] = bill.total_consumption_m3
    else:
        ctx["latest_bill_period"] = None

    # Device status
    hh_stmt = select(Household).where(Household.id == household_id)
    hh_r = await db.execute(hh_stmt)
    hh = hh_r.scalars().first()
    if hh and hh.devices:
        pass  # Will be loaded separately

    # Active alerts
    stmt5 = select(Alert).where(
        and_(Alert.household_id == household_id, Alert.is_dismissed == False)
    ).order_by(Alert.created_at.desc()).limit(3)
    r5 = await db.execute(stmt5)
    alerts = r5.scalars().all()
    ctx["active_alerts"] = [
        {"type": a.alert_type, "message": a.message, "created_at": a.created_at.isoformat()}
        for a in alerts
    ]

    return ctx


def build_rule_based_response(category: str, user_message: str, ctx: dict) -> dict:
    """
    Generate a helpful, data-grounded response using rule-based logic.
    All data cited from ctx (database facts).
    """
    response_parts = []
    offer_ticket = False

    if category == "BILLING":
        if ctx.get("latest_bill_period"):
            response_parts.append(
                f"[DATABASE FACT] Your most recent bill is for **{ctx['latest_bill_period']}** — "
                f"consumption: **{ctx['latest_bill_consumption_m3']:.3f} m³**, "
                f"amount: **₹{ctx['latest_bill_amount']:.2f}** (status: {ctx['latest_bill_status']})."
            )
            month = ctx.get("month_litres", 0)
            avg = ctx.get("avg_daily_90d", 0) * 30
            if month > avg * 1.4 and avg > 0:
                pct = round(((month - avg) / avg) * 100, 1)
                response_parts.append(
                    f"[DATABASE FACT] Your last 30 days consumption ({month:.0f} L) is "
                    f"**{pct}% higher** than your 3-month average ({avg:.0f} L). "
                    "This explains the higher bill."
                )
                response_parts.append(
                    "[GENERAL GUIDANCE] Please check for running taps, leaking fixtures, "
                    "or increased household activity that may account for higher usage."
                )
            else:
                response_parts.append(
                    "[GENERAL GUIDANCE] Your recent consumption appears consistent with your history. "
                    "If you believe there is an error, I can create a support ticket for review."
                )
        else:
            response_parts.append(
                "[DATABASE FACT] No bills are currently generated for your account."
            )
        offer_ticket = True

    elif category == "HIGH_USAGE":
        today = ctx.get("today_litres", 0)
        avg_daily = ctx.get("avg_daily_90d", 0)
        response_parts.append(
            f"[DATABASE FACT] Your consumption today is **{today:.1f} L**. "
            f"Your 90-day average daily usage is **{avg_daily:.1f} L/day**."
        )
        if avg_daily > 0 and today > avg_daily * 1.5:
            pct = round(((today - avg_daily) / avg_daily) * 100, 1)
            response_parts.append(
                f"[DATABASE FACT] Today's usage is **{pct}% higher** than your average. "
                "This has been flagged as high usage."
            )
        response_parts.append(
            "[GENERAL GUIDANCE] Common causes: running taps left open, garden watering, "
            "full tank overflow, or a leaking fixture. Please inspect your premises."
        )
        offer_ticket = True

    elif category == "LEAKAGE":
        response_parts.append(
            "[GENERAL GUIDANCE] If you suspect a pipeline leak, please check all visible "
            "pipes, joints, and taps. Turn off the main valve if water loss is significant."
        )
        active = ctx.get("active_alerts", [])
        leak_alerts = [a for a in active if "LEAK" in a.get("type", "")]
        if leak_alerts:
            response_parts.append(
                f"[DATABASE FACT] There is an active leakage alert recorded: "
                f"\"{leak_alerts[0]['message']}\""
            )
        offer_ticket = True

    elif category == "METER":
        response_parts.append(
            f"[DATABASE FACT] Your last recorded daily consumption is **{ctx.get('today_litres', 0):.1f} L**."
        )
        response_parts.append(
            "[GENERAL GUIDANCE] If your meter is not updating, it may be due to device connectivity. "
            "Ensure the ESP32 device has Wi-Fi signal. The system marks a device OFFLINE "
            "if no reading is received for 15 minutes."
        )
        offer_ticket = True

    elif category == "WATER_SUPPLY":
        response_parts.append(
            "[GENERAL GUIDANCE] Water supply interruptions may be due to scheduled maintenance "
            "or infrastructure work. Please check your Notifications/Messages for any official "
            "announcements from the water authority."
        )
        response_parts.append(
            "[DATABASE FACT] Check the Messages section for any official supply interruption notices."
        )
        offer_ticket = True

    else:
        response_parts.append(
            "Thank you for reaching out to AquaSense Support. "
            "I can help with billing queries, meter issues, high usage, leakage, or water supply concerns."
        )
        if ctx.get("today_litres") is not None:
            response_parts.append(
                f"[DATABASE FACT] Your current data — Today: **{ctx['today_litres']:.1f} L**, "
                f"Last 30 days: **{ctx['month_m3']:.3f} m³**."
            )
        offer_ticket = True

    return {
        "response": "\n\n".join(response_parts),
        "category": category,
        "offer_ticket": offer_ticket,
        "data_source": "DATABASE + RULE_BASED_ANALYSIS",
        "disclaimer": "Responses are based on your recorded meter data. For complex issues, please create a support ticket.",
    }


async def process_feedback(
    household_id: str,
    user_message: str,
    conversation_history: list,
    db: AsyncSession,
) -> dict:
    """
    Main AI feedback processing pipeline.
    1. Classify message category
    2. Fetch actual household data from DB
    3. Generate grounded response
    4. Attempt Gemini if API key available (with fallback)
    """
    category = classify_category(user_message)
    ctx = await get_household_context(household_id, db)

    # Try Gemini if configured
    gemini_key = os.environ.get("GEMINI_API_KEY", "")
    if gemini_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel("gemini-1.5-flash")

            system_prompt = f"""You are AquaSense Support AI for a smart water management system.
You MUST ONLY use the following database facts about this household:
- Today's consumption: {ctx.get('today_litres', 'unavailable')} litres
- Last 30 days: {ctx.get('month_litres', 'unavailable')} litres ({ctx.get('month_m3', 'unavailable')} m³)
- 90-day daily average: {ctx.get('avg_daily_90d', 'unavailable')} L/day
- Latest bill: {ctx.get('latest_bill_period', 'none')} — ₹{ctx.get('latest_bill_amount', 'N/A')} ({ctx.get('latest_bill_status', 'N/A')})
- Active alerts: {ctx.get('active_alerts', [])}

RULES:
1. NEVER invent consumption numbers, bill amounts, or tariff rates
2. Always label: [DATABASE FACT] for data from above, [GENERAL GUIDANCE] for advice
3. Be concise, professional, and helpful
4. Category: {category}
5. If you cannot answer from the facts, say so clearly and offer a support ticket
"""
            history_text = "\n".join(
                [f"{m['role'].upper()}: {m['content']}" for m in conversation_history[-6:]]
            )
            prompt = f"{system_prompt}\n\nConversation:\n{history_text}\nUSER: {user_message}\nAI:"

            response = model.generate_content(prompt)
            return {
                "response": response.text,
                "category": category,
                "offer_ticket": True,
                "data_source": "GEMINI_AI + DATABASE",
                "disclaimer": "AI response is grounded in your actual meter data.",
            }
        except Exception:
            pass  # Fall back to rule-based

    # Rule-based fallback
    return build_rule_based_response(category, user_message, ctx)


async def create_support_ticket_from_feedback(
    feedback_id: str,
    household_id: str,
    category: str,
    description: str,
    db: AsyncSession,
) -> str:
    """Create a support ticket from a feedback session."""
    count_stmt = select(func.count(SupportTicket.id))
    count_r = await db.execute(count_stmt)
    count = count_r.scalar() or 0

    ticket_number = f"TKT-{datetime.utcnow().strftime('%Y%m%d')}-{count + 1:04d}"

    priority_map = {
        "LEAKAGE": "high",
        "BILLING": "normal",
        "HIGH_USAGE": "normal",
        "METER": "normal",
        "WATER_SUPPLY": "high",
        "TECHNICAL": "low",
        "GENERAL": "low",
    }

    ticket = SupportTicket(
        id=uuid.uuid4(),
        ticket_number=ticket_number,
        feedback_id=feedback_id,
        household_id=household_id,
        category=category,
        priority=priority_map.get(category, "normal"),
        status="open",
        description=description,
    )
    db.add(ticket)
    await db.commit()
    return ticket_number
