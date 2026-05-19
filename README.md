# AtomQuest — Strategic Performance Management Portal

> Replace fragmented spreadsheets with an audit-ready, role-based goal-setting and tracking platform aligned to Atomberg's strategic thrust areas.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://atomquest-portal-theta.vercel.app)
[![FastAPI](https://img.shields.io/badge/backend-FastAPI-009688)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/frontend-React%2019-61dafb)](https://react.dev)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

---

## Live Demo

**URL:** [https://atomquest-portal-theta.vercel.app](https://atomquest-portal-theta.vercel.app)

| Role | Email | Password | What you can do |
|---|---|---|---|
| **Employee** | `anjali.iyer@atomberg.com` | `Atomberg@123` | Create goals, log quarterly achievements, view own analytics |
| **Manager** | `priya.sharma@atomberg.com` | `Atomberg@123` | Approve / return team goal sheets, leave check-in feedback, view team analytics |
| **Admin** | `admin@atomberg.com` | `Atomberg@123` | Full org control — manage cycles, users, shared goals, audit log, export reports |

---

## Features

### Goal Management
- **Six Unit-of-Measure (UoM) types** covering every business metric:
  | UoM | Scoring logic | Example |
  |---|---|---|
  | `numeric_min` | `actual / target × 100` — exceeding the threshold scores higher | Sales Revenue ≥ ₹50L |
  | `numeric_max` | `target / actual × 100` — staying below the ceiling scores higher | Dealer TAT ≤ 2 days |
  | `percent_min` | Same as `numeric_min` but percentage-native | Achievement Rate ≥ 90% |
  | `percent_max` | Same as `numeric_max` but percentage-native | Defect Rate ≤ 2% |
  | `timeline` | 100% if completed on or before the target date, else 0% | SKU launch by Sep 30 |
  | `zero` | 100% if actual is exactly zero, else 0% | Safety incidents = 0 |
- **Validation engine:** weightage sum must equal 100%, max 8 goals, minimum 10% per goal
- **Status workflow:** `Draft` → `Submitted` → `Locked` (approved) or `Returned` (rework)
- **Goal unlock:** Admin can reopen a locked goal with an audit reason

### Strategic Alignment
- **Thrust area mapping:** every goal links to a strategic pillar (Sales Revenue, Product Quality, Customer NPS, Energy Efficiency, On-time Delivery, Cost Reduction, Safety, Innovation & R&D)
- **Shared goals:** Admins / Managers push a goal to an entire department; all recipients get an auto-locked copy
- **Achievement sync:** the designated primary owner's quarterly log propagates to all shared copies

### Governance & Audit
- **Immutable audit trail:** every status change, approval, unlock, and manager edit is stored with a JSON snapshot of old/new values, the actor, and an optional reason
- **RBAC:** Managers see only their direct reports; Admins have org-wide visibility
- **Check-in feedback:** Managers leave per-goal, per-quarter comments visible to employees

### Analytics & Reporting
- **Dashboard (role-aware):** Employees see personal weightage and Q1 score; Managers see team pending approvals and team average score; Admins see org-wide totals
- **Org health:** completion rate (users with at least one locked goal vs total users)
- **QoQ performance:** line chart of per-employee quarterly average scores
- **Department performance:** bar chart of average score by department, manager-scoped for Managers
- **Thrust area distribution:** donut chart of goal count per strategic pillar
- **Completion heatmap:** department × quarter grid showing % of goals with logged achievements
- **Excel export:** admin can download a master `xlsx` with all goals and Q1 scores via `pandas` + `openpyxl`
- **Email notifications:** automated alerts on goal submission, approval, and return via Resend

---

## Tech Stack

| Layer | Technology | Version | Why |
|---|---|---|---|
| **Backend framework** | FastAPI | latest | Async Python with native Pydantic validation, auto-generated OpenAPI docs, and near-zero boilerplate for dependency injection |
| **ORM & migrations** | SQLAlchemy + Alembic | 2.x | Declarative models, robust relationship handling, and schema-diff migrations out of the box |
| **Database** | PostgreSQL | 15 | ACID compliance and JSON column support needed for the audit log's value snapshots |
| **Auth** | python-jose + passlib | — | Industry-standard JWT signing (HS256) with bcrypt password hashing |
| **Email** | Resend | latest | Simple REST API with generous free tier; no SMTP configuration required |
| **Frontend library** | React | 19.2 | Component model scales well for a multi-role SPA with complex state per page |
| **Build tool** | Vite | 8.x | Sub-second HMR and native ESM for fast iterative development |
| **Language** | TypeScript | ~6.0 | Catches interface mismatches between API responses and UI components at compile time |
| **Styling** | Tailwind CSS | 3.4 | Utility-first approach eliminates context-switching between CSS files |
| **UI components** | shadcn/ui + Radix UI | — | Accessible, headless primitives styled with Tailwind; no runtime CSS-in-JS overhead |
| **Server state** | TanStack Query | 5.x | Automatic caching, background refetching, and invalidation removes manual loading-state boilerplate |
| **Forms** | React Hook Form + Zod | 7.x / 4.x | Uncontrolled inputs keep re-renders minimal; Zod schemas serve as single source of truth for validation |
| **Charts** | Recharts | 3.x | SVG-based, composable, and works seamlessly inside responsive containers |
| **HTTP client** | Axios | 1.x | Interceptor pattern for attaching JWT headers and handling 401 redirects globally |
| **Routing** | React Router DOM | 7.x | File-free, declarative routing with nested layouts via `AppShell` |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Vercel Edge Network                       │
│  React 19 SPA  ──  Vite build  ──  vercel.json (SPA rewrite)│
└──────────────────────────┬──────────────────────────────────┘
                           │  HTTPS / JSON (Axios)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Railway (Docker)                          │
│  FastAPI  ──  Uvicorn  ──  CORS (FRONTEND_ORIGIN env var)   │
│  ├── /api/auth        JWT login & token validation           │
│  ├── /api/goals       CRUD + approval workflow               │
│  ├── /api/dashboard   Role-aware summary stats               │
│  ├── /api/analytics   Org / team / employee metrics          │
│  ├── /api/reports     Excel export (pandas)                  │
│  └── /api/* ...       cycles, users, thrust-areas, audit     │
└──────────────────────────┬──────────────────────────────────┘
                           │  SQLAlchemy + psycopg2
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                 Supabase (PostgreSQL 15)                     │
│  Users · Goals · Cycles · ThrustAreas · Achievements        │
│  Checkins · AuditLog                                        │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼ (background task)
┌─────────────────────────────────────────────────────────────┐
│                      Resend                                  │
│  Transactional email on goal submission / approval / return  │
└─────────────────────────────────────────────────────────────┘
```

**Key design decisions:**
- **Stateless auth:** JWT with 24-hour expiry; no server-side session store
- **Background tasks:** email notifications are dispatched via FastAPI `BackgroundTasks` so API responses are never blocked by SMTP
- **Monolith with scoped services:** a single FastAPI app with separate service modules (`score.py`, `email.py`, `excel.py`) for testability without microservice overhead
- **Audit-first:** every approval, unlock, and return writes an immutable `AuditLog` row with JSON snapshots before committing the state change

---

## Folder Structure

```
atomquest-portal/
├── backend/
│   ├── app/
│   │   ├── auth/              # JWT token creation & password hashing
│   │   ├── models/            # SQLAlchemy ORM models (User, Goal, Cycle…)
│   │   ├── routes/            # FastAPI routers (one file per domain)
│   │   ├── schemas/           # Pydantic request / response schemas
│   │   ├── services/          # Business logic: score.py, email.py, excel.py
│   │   ├── utils/             # audit.py — AuditLog helper
│   │   ├── database.py        # Engine, SessionLocal, Base
│   │   ├── deps.py            # get_current_user, require_role
│   │   └── main.py            # App factory, CORS, router registration
│   ├── alembic/               # Auto-generated migration scripts
│   ├── Dockerfile             # python:3.11-slim image for Railway
│   ├── requirements.txt       # Python dependencies
│   ├── seed.py                # Populates demo users, goals, and achievements
│   └── .env.example           # Environment variable template
├── frontend/
│   ├── src/
│   │   ├── api/               # client.ts (Axios + interceptors), users.ts
│   │   ├── components/
│   │   │   ├── goals/         # GoalForm.tsx — shared create/edit form
│   │   │   ├── layout/        # AppShell.tsx — sidebar + role-filtered nav
│   │   │   └── ui/            # shadcn/ui primitives
│   │   ├── contexts/          # AuthContext.tsx — user + token state
│   │   ├── hooks/             # useCurrentCycle.ts
│   │   ├── pages/
│   │   │   ├── admin/         # Analytics, AuditLog, CycleManagement,
│   │   │   │                  # Reports, SharedGoals, ThrustAreas,
│   │   │   │                  # UserManagement
│   │   │   ├── employee/      # MyGoals, QuarterlyCheckin
│   │   │   └── manager/       # Approvals, TeamCheckins
│   │   ├── types/             # index.ts — shared TypeScript interfaces
│   │   ├── App.tsx            # Router tree
│   │   └── main.tsx           # React root
│   ├── vercel.json            # Rewrites all paths to index.html for SPA
│   └── .env.example           # Frontend environment variable template
└── docs/
    └── architecture-diagram.png
```

---

## Local Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- A PostgreSQL database (local install, Docker, or a free Supabase project)

### 1. Clone

```bash
git clone https://github.com/your-org/atomquest-portal.git
cd atomquest-portal
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Copy the environment template and fill in your values:

```bash
cp .env.example .env
# then edit .env
```

Run migrations and seed the demo dataset:

```bash
alembic upgrade head
python seed.py
```

Start the development server:

```bash
uvicorn app.main:app --reload
# API available at http://localhost:8000
# Interactive docs at http://localhost:8000/docs
```

### 3. Frontend

```bash
cd ../frontend
npm install
cp .env.example .env
# .env already points to http://localhost:8000/api — no edits needed for local dev
npm run dev
# App available at http://localhost:5173
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example placeholder |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:password@host:5432/atomquest` |
| `JWT_SECRET` | Random secret for signing access tokens (min 32 chars) | `your-random-256-bit-secret-here` |
| `RESEND_API_KEY` | API key from [resend.com](https://resend.com) | `re_your_resend_key_here` |
| `FRONTEND_ORIGIN` | Allowed CORS origin in production | `https://your-vercel-deployment.vercel.app` |

### Frontend (`frontend/.env`)

| Variable | Description | Example placeholder |
|---|---|---|
| `VITE_API_URL` | Base URL for the backend API | `https://your-railway-backend.up.railway.app/api` |

> **Never commit real values.** Both `.env` files are in `.gitignore`. Only `.env.example` files (with placeholder values) are tracked.

---

## Deployment

### Frontend → Vercel

1. Import the `frontend/` folder as a Vercel project
2. Set `VITE_API_URL` in Vercel's Environment Variables settings
3. Vercel auto-detects Vite; the `vercel.json` handles SPA routing rewrites

### Backend → Railway

1. Create a new Railway project from the `backend/` directory
2. Railway auto-detects the `Dockerfile`
3. Set all four backend environment variables in Railway's Variables tab
4. Copy the generated Railway URL and paste it into Vercel's `VITE_API_URL` and Railway's own `FRONTEND_ORIGIN`

### Database → Supabase

1. Create a new Supabase project and copy the **direct connection string** (not the pooler) from Project Settings → Database
2. Set it as `DATABASE_URL` in Railway
3. Run `alembic upgrade head` once (via Railway's shell or a local connection to the remote DB)
4. Run `python seed.py` to populate demo data

---

## Project Status & Known Limitations

| Area | Status | Notes |
|---|---|---|
| Goal CRUD & approval workflow | ✅ Complete | All statuses: Draft, Submitted, Locked, Returned |
| Role-based dashboards | ✅ Complete | Employee / Manager / Admin each see role-appropriate stats |
| Analytics (all charts) | ✅ Complete | QoQ, dept performance, thrust distribution, heatmap |
| Shared goals | ✅ Complete | Push to multiple users; primary owner syncs achievements |
| Audit log | ✅ Complete | Immutable, JSON snapshots, filterable by admin |
| Excel export | ✅ Complete | Master data sheet with all goals and Q1 scores |
| Email notifications | ⚠️ Sandbox | Uses Resend's `onboarding@resend.dev` sender; demo users have fake emails so delivery is not guaranteed |
| Manager hierarchy | ⚠️ One level | Team scoping is limited to direct reports; no recursive sub-team roll-up |
| Thrust area CRUD | 🔲 Read-only | Admin can view thrust areas; create/edit/deactivate via admin panel is not yet wired |
| Bulk achievement log | 🔲 Not implemented | Achievements must be entered one at a time per goal per quarter |
| Mobile layout | 🔲 Partial | Sidebar collapses on mobile; table-heavy pages require horizontal scroll |

---

Built for **Atomberg Hackathon 1.0** — May 2026.
