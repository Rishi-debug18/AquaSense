# AquaSense — Smart Water Management System

<p align="center">
  <strong>IoT-Based Water Monitoring • Real-Time Alerts • Automated Billing • AI Feedback</strong>
</p>

> ⚠️ **DEMO PROTOTYPE** — All data is simulated. Vangaon / Kumpare, Maharashtra region (clearly labelled).

---

## 🌊 What is AquaSense?

AquaSense is a full-stack IoT-based water management platform for:

| Feature | Description |
|---------|-------------|
| 📊 Real-time Monitoring | Live flow rate, daily/monthly consumption per household |
| 🚰 Leakage Detection | Dual inlet/outlet flow sensor comparison with % difference alerting |
| 💸 Automated Billing | Progressive slab-based billing (Maharashtra Municipal tariff structure) |
| 🤖 AI Feedback | Rule-based assistant + optional Gemini API fallback for water queries |
| 📢 Messaging | Admin broadcasts to all/area/individual households |
| 🔌 Hardware-Ready | ESP32 simulator uses the same API as real hardware — zero code changes needed |

---

## 🏗️ Architecture

```
aquasense/
├── backend/          FastAPI (Python) async REST API + WebSocket
│   ├── app/
│   │   ├── models/   SQLAlchemy ORM models
│   │   ├── routers/  14 API route files
│   │   ├── services/ Billing engine, anomaly detection, leakage engine, AI, simulator
│   │   ├── auth/     JWT + bcrypt authentication
│   │   └── websocket/ Real-time broadcast manager
│   ├── scripts/      create_tables, create_admin, seed_demo_data
│   └── migrations/   Alembic async migration environment
└── frontend/         React 18 + TypeScript + Tailwind CSS + Recharts
    └── src/
        ├── pages/    25 fully-implemented pages
        ├── api/      Axios client with JWT interceptors
        └── components/ Layouts with full navigation
```

---

## ⚡ Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

### 1. Database Setup

```sql
CREATE USER aquasense WITH PASSWORD 'aquasense123';
CREATE DATABASE aquasense OWNER aquasense;
```

### 2. Backend Setup

```powershell
cd aquasense\backend

# Install dependencies
pip install -r requirements.txt

# Copy environment config
copy .env.example .env

# Create tables
python scripts/create_tables.py

# Create admin user
python scripts/create_admin.py

# Seed demo data (550 households, 90-day readings, bills, etc.)
# WARNING: Takes 3-8 minutes. Do this once.
python scripts/seed_demo_data.py

# Start the API server
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup

```powershell
cd aquasense\frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open `http://localhost:5173`

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| 🔑 Admin | `admin@aquasense.demo` | `AquaSense@Admin2026` |
| 🏠 Household H-001 | `h001@aquasense.demo` | `House@001Demo` |
| 🏠 Household H-102 | `h102@aquasense.demo` | `House@102Demo` |

---

## 🎬 Demo Walkthrough (for Faculty/Evaluators)

### Demonstrate Real-time Data:
1. Login as Admin → go to **Demo Control**
2. Click **Start Simulation** (choose "High Usage") → enter household number
3. Open a second tab → Login as that Household → watch **Dashboard** update in real-time

### Demonstrate Leak Detection:
1. Admin → **Demo Control** → click **Simulate Leak** on any pipeline
2. Go to **Leakage Detection** → watch the dual-sensor chart diverge
3. An alert fires automatically to the admin panel

### Demonstrate Billing:
1. Admin → **Billing** → select month → click **Generate Bills**
2. Login as Household → **Bills** → click any bill → see full slab-by-slab breakdown
3. Click **Print** to generate PDF

### Demonstrate AI Assistant:
1. Login as Household → **AI Assistant**
2. Type: "Why is my bill so high this month?"
3. AI fetches actual database facts and provides a grounded response

---

## 📡 ESP32 Hardware Connection

The simulator uses the **exact same API endpoint** as real hardware:

```
POST /api/v1/readings
Header: X-Device-Token: <device-token>
Body: { "flow_rate_lpm": 2.5, "total_volume_litre": 12500.0 }
```

To connect real ESP32:
1. Stop the simulator (Admin → Demo Control)
2. Flash the ESP32 firmware with your `DEVICE_TOKEN` and API URL
3. Zero code changes needed

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Charts | Recharts |
| Backend | FastAPI, Python 3.11+, asyncio |
| Database | PostgreSQL + SQLAlchemy 2.0 (async) |
| Auth | JWT (access + refresh), bcrypt |
| Real-time | WebSocket (FastAPI native) |
| AI | Rule-based + Google Gemini API |
| IoT | ESP32-compatible REST API |

---

## 🏙️ Demo Region

**Vangaon / Kumpare, Maharashtra** — 5 areas, 550 households, 90 days of simulated data.

> ⚠️ All data is fictional and generated for demonstration purposes only.
