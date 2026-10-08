from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.auth.jwt import decode_token
from app.websocket.manager import manager

# Import all routers
from app.routers.auth import router as auth_router
from app.routers.readings import router as readings_router
from app.routers.household import router as household_router
from app.routers.admin_households import router as admin_households_router
from app.routers.admin_analytics import router as admin_analytics_router
from app.routers.admin_billing import router as admin_billing_router
from app.routers.admin_messages import router as admin_messages_router
from app.routers.demo import router as demo_router

# Combined admin routers from admin_leakage.py
from app.routers.admin_leakage import (
    leakage_router,
    alerts_router,
    tickets_router,
    settings_router,
    audit_router,
    reports_router,
)

app = FastAPI(
    title="AquaSense API",
    description=(
        "Smart Water Management System — IoT-based water monitoring, "
        "transparent billing, leakage detection, and municipal analytics.\n\n"
        "**DEMO PROTOTYPE** — Vangaon / Kumpare, Maharashtra"
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PREFIX = "/api/v1"

# Core routers
app.include_router(auth_router, prefix=PREFIX)
app.include_router(readings_router, prefix=PREFIX)
app.include_router(household_router, prefix=PREFIX)

# Admin routers
app.include_router(admin_households_router, prefix=PREFIX)
app.include_router(admin_analytics_router, prefix=PREFIX)
app.include_router(admin_billing_router, prefix=PREFIX)
app.include_router(admin_messages_router, prefix=PREFIX)
app.include_router(leakage_router, prefix=PREFIX)
app.include_router(alerts_router, prefix=PREFIX)
app.include_router(tickets_router, prefix=PREFIX)
app.include_router(settings_router, prefix=PREFIX)
app.include_router(audit_router, prefix=PREFIX)
app.include_router(reports_router, prefix=PREFIX)
app.include_router(demo_router, prefix=PREFIX)


@app.websocket("/ws/{room_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    room_id: str,
    token: str = Query(default=None),
):
    if token:
        try:
            decode_token(token)
        except Exception:
            await websocket.close(code=4001)
            return

    await manager.connect(websocket, room_id)
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)


@app.get("/", tags=["Health"])
async def root():
    return {
        "system": "AquaSense",
        "tagline": "Smart Water. Fair Billing. Sustainable Future.",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs",
        "note": "DEMO PROTOTYPE — Not actual government system",
    }


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok"}
