# AtomQuest — Goal Setting & Tracking Portal

A role-based web portal (FastAPI + React) that replaces spreadsheet-based goal tracking with a structured, audit-ready workflow — built solo for Atomberg Hackathon 1.0.

**Live demo:** [atomquest-portal-theta.vercel.app](https://atomquest-portal-theta.vercel.app)

| Role | Email | Password |
|---|---|---|
| Employee | `anjali.iyer@atomberg.com` | `***REMOVED***` |
| Manager | `priya.sharma@atomberg.com` | `***REMOVED***` |
| Admin | `admin@atomberg.com` | `***REMOVED***` |

(These are seeded demo accounts from `backend/seed.py`.)

## What it is

The hackathon brief was an in-house goal-setting portal for Atomberg Technologies. Employees set yearly goals mapped to company "thrust areas" (Sales Revenue, Product Quality, Customer NPS, Safety, ...), managers approve or return them, everyone logs quarterly achievements, and admins get org-wide analytics, an audit trail and Excel exports.

- **Employee:** create goals, submit a goal sheet, log quarterly achievements, see own scores.
- **Manager:** approve / return direct reports' goal sheets, leave per-goal check-in feedback, team analytics.
- **Admin:** manage cycles and users, push shared goals to a department, unlock locked goals, view the audit log, download reports.

## What I did

I wrote a detailed build spec first ([`INSTRUCTIONS.md`](INSTRUCTIONS.md)): locked tech stack, data model, phases, and an explicit "what we rejected and why" section (e.g. SSO and an escalation scheduler were cut because they'd cost hours and be hard to demo). I then built it phase by phase with AI coding assistants (Claude Code / Gemini CLI) working from that spec, and spent a lot of the time reviewing, testing and fixing.

**Backend (FastAPI, SQLAlchemy, Alembic, PostgreSQL)**
- JWT auth (python-jose, bcrypt via passlib) with role guards in `deps.py`; managers only see their direct reports.
- Goal workflow `Draft -> Submitted -> Locked / Returned`, with validation on submit: weightages must sum to exactly 100, at most 8 goals, at least 10% per goal.
- Scoring for six unit-of-measure types in `services/score.py`, capped at 100%:

  | UoM | Score |
  |---|---|
  | `numeric_min` / `percent_min` | `actual / target x 100` (higher is better) |
  | `numeric_max` / `percent_max` | `target / actual x 100` (lower is better) |
  | `timeline` | 100 if done on or before the target date, else 0 |
  | `zero` | 100 if actual is exactly 0 (e.g. safety incidents), else 0 |

- Quarterly check-in windows per cycle (`services/window.py`), so achievements can only be logged while a quarter is open.
- Shared goals: an admin/manager pushes one goal to many people; the primary owner's achievements sync to all copies.
- An `AuditLog` table storing JSON snapshots of old/new values, the actor and a reason for approvals, returns, unlocks and edits.
- Excel export with pandas + openpyxl, and email notifications through Resend sent as FastAPI background tasks.

**Frontend (React + TypeScript + Vite, Tailwind, shadcn/ui, TanStack Query, React Hook Form + Zod, Recharts)**
- Role-aware dashboard and sidebar; pages per role under `src/pages/{employee,manager,admin}`.
- Analytics: quarter-over-quarter scores, department performance, thrust-area distribution, and a department x quarter completion heatmap.

**Deployment:** frontend on Vercel, backend as a Docker container on Railway, database on Supabase. Architecture diagram: [`docs/architecture-diagram.png.png`](docs/architecture-diagram.png.png).

## What I learnt

- **Writing the spec was the most valuable hour.** Pinning the stack, the data model and the rejected features up front stopped scope creep and made the AI-assisted coding far more predictable. Deciding what *not* to build was as useful as deciding what to build.
- **Generated code still has to be debugged by a human.** About 20 of the commits are fixes: white-screen crashes from null data, "React error 31" from rendering an object as JSX, dropdowns hidden behind a modal (z-index), a TypeScript generic mismatch in the goal form, a bcrypt version issue in deployment. Most of these were integration bugs between frontend assumptions and API responses — shared types or an OpenAPI-generated client would have prevented many of them.
- **Secrets hygiene.** I committed `.env` files early on and only removed them from tracking later. Untracking a file doesn't remove it from git history, so anything that was ever committed has to be treated as leaked and rotated. Now I set up `.gitignore` and `.env.example` *before* the first commit.
- **Audit-first design pays off.** Writing an audit row for every state change made the approval workflow much easier to reason about and debug.
- **What's still missing:** there are no automated tests (I relied on manual testing through the UI), thrust areas are read-only in the admin panel, manager scoping is one level deep (no sub-team roll-up), achievements are entered one at a time, and table-heavy pages need horizontal scroll on mobile. Email uses Resend's sandbox sender, so delivery to the fake demo addresses isn't guaranteed. Tests for the scoring and workflow logic would be my first addition.

## Repo structure

```
atomquest-portal/
├── backend/
│   ├── app/
│   │   ├── auth/        JWT + password hashing, login route
│   │   ├── models/      SQLAlchemy models: user, cycle, thrust_area, goal, achievement, checkin, audit_log
│   │   ├── schemas/     Pydantic request/response models
│   │   ├── routes/      one router per domain (goals, checkins, analytics, reports, audit, ...)
│   │   ├── services/    score.py, window.py, email.py, excel.py
│   │   ├── utils/       audit-log helper
│   │   └── main.py      app, CORS, router registration
│   ├── alembic/         migrations
│   ├── seed.py          demo users, goals, achievements
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/  api/ components/ contexts/ hooks/ pages/ types/
│   ├── vercel.json      SPA rewrites
│   └── .env.example
├── docs/                architecture diagram
└── INSTRUCTIONS.md      the build spec I wrote before coding
```

## How to run

Prerequisites: Python 3.11+, Node.js 18+, and a PostgreSQL database (local, Docker or Supabase).

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # set DATABASE_URL, JWT_SECRET, RESEND_API_KEY, FRONTEND_ORIGIN
alembic upgrade head
python seed.py
uvicorn app.main:app --reload    # API on :8000, docs at /docs

# Frontend (new terminal)
cd frontend
npm install
cp .env.example .env        # VITE_API_URL, defaults to http://localhost:8000/api
npm run dev                 # http://localhost:5173
```

**Deploying:** import `frontend/` into Vercel and set `VITE_API_URL`; deploy `backend/` to Railway (it picks up the Dockerfile) with the four backend env vars; use Supabase's direct connection string as `DATABASE_URL`, then run `alembic upgrade head` and `python seed.py` once against it.
