# AtomQuest - Goal Setting & Tracking Portal

A comprehensive portal for Atomberg Technologies to set, track, and review employee performance goals.

## Tech Stack

- **Backend:** FastAPI, SQLAlchemy, Alembic, PostgreSQL, Resend SDK, Pandas.
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v3, shadcn/ui, TanStack Query, Recharts.
- **Database:** Supabase (Managed Postgres).
- **Email:** Resend.

## Project Structure

```
atomquest-portal/
├── backend/            # FastAPI Application
│   ├── app/            # Core logic (models, schemas, routes, services)
│   ├── alembic/        # DB Migrations
│   ├── Dockerfile      # Production build
│   └── seed.py         # Initial data setup
└── frontend/           # React Application
    ├── src/
    │   ├── components/ # Shared UI components & layouts
    │   ├── pages/      # Role-specific screens
    │   ├── hooks/      # Custom React hooks
    │   └── contexts/   # Auth state management
    └── tailwind.config.js
```

## Setup & Installation

### Backend

1.  Navigate to `backend/`.
2.  Create a virtual environment: `python -m venv venv`.
3.  Activate it: `.\venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux).
4.  Install dependencies: `pip install -r requirements.txt`.
5.  Set up `.env` file (see `.env.example`).
6.  Run migrations: `alembic upgrade head`.
7.  Seed data: `python seed.py`.
8.  Start server: `uvicorn app.main:app --reload`.

### Frontend

1.  Navigate to `frontend/`.
2.  Install dependencies: `npm install`.
3.  Set up `.env` file (see `.env.example`).
4.  Start dev server: `npm run dev`.

## Demo Credentials

All passwords are `Atomberg@123`.

- **Admin:** `admin@atomberg.com`
- **Manager:** `priya.sharma@atomberg.com`
- **Employee:** `anjali.iyer@atomberg.com`

## Features

- **RBAC:** Role-based access for Admin, Manager, and Employee.
- **Goal Validation:** Real-time weightage check (total must be 100%).
- **Approval Workflow:** Managers can edit, approve, or return goal sheets.
- **Scoring Engine:** Automated calculation for Numeric, Percent, Timeline, and Zero-based goals.
- **Shared Goals:** Admin can push common goals to entire teams.
- **Analytics:** Visual charts for org health and department performance.
- **Bulk Upload:** Admin can import users via CSV/Excel.
- **Audit Log:** Every critical change is tracked for accountability.
- **Email Alerts:** Notifications sent via Resend for key events.
