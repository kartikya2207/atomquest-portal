# AtomQuest Hackathon 1.0 — Build Instructions

> **For: Claude Code CLI & Gemini CLI**
> **Project: In-House Goal Setting & Tracking Portal for Atomberg Technologies**
> **Builder: Solo participant (Kartik)**
> **Read this file fully before writing any code. Follow the phases in order.**

---

## 0. How to Use This File

This file is the single source of truth for the build. Treat it as the spec.

- Work top-to-bottom. Do not skip phases.
- After completing each phase, run the tests/checks listed for that phase before moving on.
- If you hit ambiguity, **prefer the simpler implementation** that satisfies the BRD. Do not over-engineer.
- Do not implement anything in the "Rejected Features" section at the bottom.

---

## 1. Project Context

### What we are building
A web-based **Goal Setting & Tracking Portal** for Atomberg Technologies — a Mumbai-based BLDC fan and home appliance company (~832 employees, ₹1000 Cr revenue, IPO-bound). The portal replaces their fragmented spreadsheet-based goal tracking with a structured, audit-ready system supporting Employee, Manager, and Admin roles.

### Why this design matters for Atomberg specifically
- They have **factory workers, sales reps across 60+ cities, and corporate staff** — UI must be dead-simple, mobile-friendly, not developer-y.
- Their brand color is **orange** (~#FF6B1A) — use as accent, white/grey base.
- Realistic thrust areas for them: Sales Revenue, Product Quality, Customer NPS, Energy Efficiency, On-time Delivery, Cost Reduction, Safety.
- They already use DarwinBox for HR — our portal should feel comparable in polish.

### Submission deliverables (do not forget any)
1. Live hosted demo URL
2. Source code repo (GitHub)
3. Architecture diagram (PDF or PNG)
4. Login credentials for all 3 roles (or role-switcher)

---

## 2. Locked Tech Stack

| Layer | Choice | Version |
|---|---|---|
| Backend language | Python | 3.11+ |
| Backend framework | FastAPI | latest |
| ORM | SQLAlchemy | 2.x (modern declarative syntax) |
| Migrations | Alembic | latest |
| Validation | Pydantic | v2 |
| Auth | JWT (python-jose) + bcrypt (passlib) | — |
| Database | PostgreSQL (via Supabase free tier) | 15+ |
| Frontend framework | React | 18 |
| Frontend tooling | Vite | latest |
| Frontend language | TypeScript | 5.x |
| Styling | Tailwind CSS | **v3** (not v4 — v3 is more stable for codegen) |
| UI components | shadcn/ui | latest |
| Forms | React Hook Form + Zod | latest |
| Server state | TanStack Query | v5 |
| Charts | Recharts | latest |
| HTTP client | Axios | latest |
| Routing | React Router | v6 |
| Email | Resend (free tier 100/day) | — |
| Backend hosting | Railway | — |
| Frontend hosting | Vercel | — |
| DB hosting | Supabase (free) | — |

**Do not deviate from this stack. Do not add Redux, Next.js, MongoDB, Prisma, or any other "alternative" tool.**

---

## 3. Repo Structure

```
atomquest-portal/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── deps.py                  # FastAPI dependencies (current_user, role guards)
│   │   ├── auth/
│   │   │   ├── routes.py
│   │   │   └── utils.py             # password hash, JWT encode/decode
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── cycle.py
│   │   │   ├── thrust_area.py
│   │   │   ├── goal.py
│   │   │   ├── achievement.py
│   │   │   ├── checkin.py
│   │   │   └── audit_log.py
│   │   ├── schemas/                 # Pydantic models (one file per model)
│   │   ├── routes/
│   │   │   ├── users.py
│   │   │   ├── cycles.py
│   │   │   ├── thrust_areas.py
│   │   │   ├── goals.py
│   │   │   ├── achievements.py
│   │   │   ├── checkins.py
│   │   │   ├── reports.py
│   │   │   ├── analytics.py
│   │   │   └── admin.py
│   │   ├── services/
│   │   │   ├── score.py             # all 4 UoM formulas
│   │   │   ├── window.py            # check if quarterly window is open
│   │   │   ├── audit.py             # audit log helpers
│   │   │   ├── shared_goals.py      # propagation logic
│   │   │   └── email.py             # Resend integration
│   │   └── utils/
│   ├── alembic/
│   │   ├── versions/
│   │   ├── env.py
│   │   └── alembic.ini
│   ├── seed.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── railway.toml
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── api/
│   │   │   ├── client.ts            # axios instance with auth interceptor
│   │   │   ├── auth.ts
│   │   │   ├── goals.ts
│   │   │   ├── cycles.ts
│   │   │   ├── checkins.ts
│   │   │   ├── reports.ts
│   │   │   └── analytics.ts
│   │   ├── components/
│   │   │   ├── ui/                  # shadcn components
│   │   │   ├── layout/
│   │   │   │   ├── AppShell.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── TopBar.tsx
│   │   │   ├── goals/
│   │   │   │   ├── GoalForm.tsx
│   │   │   │   ├── GoalCard.tsx
│   │   │   │   ├── GoalList.tsx
│   │   │   │   └── WeightagePie.tsx
│   │   │   ├── checkins/
│   │   │   │   └── CheckinForm.tsx
│   │   │   ├── manager/
│   │   │   │   ├── TeamDashboard.tsx
│   │   │   │   └── ApprovalCard.tsx
│   │   │   ├── admin/
│   │   │   │   ├── CycleManager.tsx
│   │   │   │   ├── UserManager.tsx
│   │   │   │   └── AuditLog.tsx
│   │   │   └── analytics/
│   │   │       ├── QoQChart.tsx
│   │   │       ├── CompletionHeatmap.tsx
│   │   │       └── ThrustAreaPie.tsx
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── employee/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── MyGoals.tsx
│   │   │   │   └── QuarterlyCheckin.tsx
│   │   │   ├── manager/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Approvals.tsx
│   │   │   │   └── TeamCheckins.tsx
│   │   │   └── admin/
│   │   │       ├── Dashboard.tsx
│   │   │       ├── Cycles.tsx
│   │   │       ├── Users.tsx
│   │   │       └── Audit.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useCurrentCycle.ts
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── lib/
│   │   │   ├── utils.ts
│   │   │   └── constants.ts
│   │   └── types/
│   │       └── index.ts
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── .env.example
├── docs/
│   ├── architecture.md
│   ├── architecture-diagram.png
│   └── demo-script.md
├── .gitignore
└── README.md
```

---

## 4. Database Schema (PostgreSQL)

Use SQLAlchemy 2.x declarative syntax. All tables have `id` as integer primary key. All tables have `created_at` and `updated_at` timestamps.

### `users`
| Column | Type | Notes |
|---|---|---|
| id | int PK | |
| email | str unique | login identifier |
| password_hash | str | bcrypt |
| name | str | full name |
| role | enum | `employee`, `manager`, `admin` |
| manager_id | int FK users.id nullable | self-ref, who they report to |
| department | str | e.g. "Sales North", "R&D", "HR" |
| designation | str | e.g. "Regional Sales Manager" |
| created_at, updated_at | timestamp | |

### `cycles`
The annual goal cycle with its quarterly windows.
| Column | Type | Notes |
|---|---|---|
| id | int PK | |
| name | str | e.g. "FY 2026-27" |
| year | int | |
| goal_setting_open | date | default May 1 |
| goal_setting_close | date | |
| q1_open, q1_close | date | |
| q2_open, q2_close | date | |
| q3_open, q3_close | date | |
| q4_open, q4_close | date | |
| is_active | bool | only one active at a time |
| created_at, updated_at | timestamp | |

### `thrust_areas`
| Column | Type | Notes |
|---|---|---|
| id | int PK | |
| name | str unique | "Sales Revenue", "Product Quality", etc. |
| description | str | |
| is_active | bool | default true |

### `goals`
| Column | Type | Notes |
|---|---|---|
| id | int PK | |
| employee_id | int FK users.id | owner of this goal sheet entry |
| cycle_id | int FK cycles.id | |
| thrust_area_id | int FK thrust_areas.id | |
| title | str | |
| description | text | |
| uom_type | enum | `numeric_min`, `numeric_max`, `percent_min`, `percent_max`, `timeline`, `zero` |
| target_value | numeric nullable | for numeric/percent UoMs |
| target_date | date nullable | for timeline UoM |
| weightage | int | 10-100, validated |
| status | enum | `draft`, `submitted`, `approved`, `locked`, `returned` |
| is_shared | bool | true if this goal was pushed by admin/manager |
| shared_parent_id | int FK goals.id nullable | the "master" goal copy if shared |
| is_shared_primary | bool | true if this is the master copy (achievement source of truth) |
| approved_by | int FK users.id nullable | |
| approved_at | timestamp nullable | |
| returned_comment | str nullable | manager's rework note |
| created_at, updated_at | timestamp | |

**Status flow:** `draft` → `submitted` → (`approved` → `locked`) | `returned` → `draft`

### `achievements`
One row per goal per quarter.
| Column | Type | Notes |
|---|---|---|
| id | int PK | |
| goal_id | int FK goals.id | |
| quarter | enum | `q1`, `q2`, `q3`, `q4` |
| actual_value | numeric nullable | |
| actual_date | date nullable | for timeline UoM |
| status | enum | `not_started`, `on_track`, `completed` |
| score_percent | numeric | computed by score service |
| created_at, updated_at | timestamp | |
| UNIQUE (goal_id, quarter) | | |

### `checkins`
Manager's check-in record per goal per quarter.
| Column | Type | Notes |
|---|---|---|
| id | int PK | |
| goal_id | int FK goals.id | |
| quarter | enum | `q1`, `q2`, `q3`, `q4` |
| manager_id | int FK users.id | the manager who did the check-in |
| comment | text | |
| created_at | timestamp | |
| UNIQUE (goal_id, quarter) | | |

### `audit_logs`
Every change to a goal *after* it is approved/locked is logged.
| Column | Type | Notes |
|---|---|---|
| id | int PK | |
| entity_type | str | "goal", "achievement", "user", "cycle" |
| entity_id | int | |
| action | enum | `create`, `update`, `delete`, `unlock`, `approve`, `return` |
| changed_by | int FK users.id | |
| old_value | jsonb nullable | snapshot before change |
| new_value | jsonb nullable | snapshot after change |
| reason | str nullable | admin must provide on unlock |
| timestamp | timestamp | |

---

## 5. Business Rules (Implement Exactly)

### 5.1 Goal validation (enforce on backend AND frontend)
- Total weightage across an employee's submitted goals for a cycle must equal **exactly 100**
- Minimum weightage per goal: **10**
- Maximum number of goals per employee per cycle: **8**
- A goal cannot be submitted if any field is missing
- An employee can only edit their own goals while status is `draft` or `returned`
- Once status = `locked`, only Admin can change anything (via unlock endpoint, which writes an audit log)

### 5.2 Quarterly window enforcement
- Employees can only log achievements when the current date is within the open window for that quarter
- Goal creation/submission only allowed within goal_setting_open → goal_setting_close
- Admin can override windows via an explicit unlock action (logged to audit)

### 5.3 Score computation (`services/score.py`)
Implement these functions exactly:

```python
def compute_score(uom_type: str, target, actual, target_date=None, actual_date=None) -> float:
    """Returns score percentage 0-100."""
    if actual is None:
        return 0.0

    if uom_type in ("numeric_min", "percent_min"):
        # Higher is better. e.g. Sales Revenue.
        if target == 0: return 0.0
        return min(100.0, (float(actual) / float(target)) * 100.0)

    if uom_type in ("numeric_max", "percent_max"):
        # Lower is better. e.g. Defect Rate, TAT, Cost.
        if actual == 0: return 100.0
        return min(100.0, (float(target) / float(actual)) * 100.0)

    if uom_type == "timeline":
        if actual_date is None or target_date is None:
            return 0.0
        if actual_date <= target_date:
            return 100.0
        return 0.0

    if uom_type == "zero":
        # Zero = success. e.g. Safety incidents.
        return 100.0 if float(actual) == 0 else 0.0

    return 0.0
```

The score is recomputed on every achievement update and stored in `achievements.score_percent`.

### 5.4 Shared goals
- An admin or manager can create a "shared goal" by selecting a goal definition + a list of recipient employees
- One goal row is created per recipient, all linked by `shared_parent_id`
- One of them is marked `is_shared_primary = true` (the source of truth for achievement)
- Recipients can only adjust `weightage` on their copy; `title`, `description`, `target_value`, `uom_type` are read-only
- When the primary owner updates achievement for any quarter, propagate that achievement to all linked goal rows (same actual_value, status, score)
- Implement propagation in `services/shared_goals.py`

### 5.5 Approval workflow
- Employee creates goals in `draft`
- Employee clicks "Submit for Approval" → status changes to `submitted` (only if validation passes)
- Manager sees a list of their team's `submitted` goals
- Manager can:
  - Edit `target_value`, `target_date`, `weightage` inline
  - Click "Approve" → status becomes `approved`, then immediately auto-transitions to `locked`
  - Click "Return for Rework" with a comment → status becomes `returned`
- After lock, only admin can unlock (with reason, logged to audit)

### 5.6 Audit trail
- Any update to a `goal` row when status is `approved` or `locked` must create an audit log entry
- Any admin unlock action must create an entry with `action=unlock` and a reason
- Implement via a SQLAlchemy event listener on `goals` table for `before_update`

### 5.7 Role-based access
Use FastAPI dependencies:
```python
def require_role(*allowed_roles):
    def checker(user = Depends(get_current_user)):
        if user.role not in allowed_roles:
            raise HTTPException(403, "Forbidden")
        return user
    return checker
```

Endpoint-level enforcement:
- `/api/goals` (POST, PATCH) — employee only, own goals
- `/api/goals/{id}/approve` — manager only, must be team member's manager
- `/api/cycles` (POST, PATCH, DELETE) — admin only
- `/api/admin/unlock/{goal_id}` — admin only
- `/api/reports/*` — manager + admin
- `/api/analytics/*` — manager + admin

---

## 6. Backend API Surface (FastAPI)

All endpoints return JSON. All require auth except `/auth/login`.

### Auth
- `POST /api/auth/login` → returns `{access_token, user}`
- `GET /api/auth/me` → current user

### Users
- `GET /api/users` (admin) — list all
- `GET /api/users/team` (manager) — list direct reports
- `GET /api/users/{id}` — get one
- `POST /api/users` (admin) — create
- `PATCH /api/users/{id}` (admin) — update

### Cycles
- `GET /api/cycles` — list
- `GET /api/cycles/active` — get current active cycle
- `POST /api/cycles` (admin) — create
- `PATCH /api/cycles/{id}` (admin) — update windows

### Thrust Areas
- `GET /api/thrust-areas` — list
- `POST /api/thrust-areas` (admin) — create
- `PATCH /api/thrust-areas/{id}` (admin) — update

### Goals
- `GET /api/goals/mine` (employee) — own goals in active cycle
- `GET /api/goals/team` (manager) — all goals of direct reports
- `POST /api/goals` (employee) — create a draft goal
- `PATCH /api/goals/{id}` (employee, own only, draft/returned only) — edit
- `DELETE /api/goals/{id}` (employee, draft only) — delete
- `POST /api/goals/submit` (employee) — validate (sum=100, count<=8, min=10) then move all draft goals to `submitted`
- `POST /api/goals/{id}/approve` (manager) — approve + auto lock
- `POST /api/goals/{id}/return` (manager) — return with comment
- `PATCH /api/goals/{id}/manager-edit` (manager) — inline edit target/weightage before approval
- `POST /api/goals/shared` (admin/manager) — body: `{goal_template, recipient_user_ids}` → fans out copies
- `POST /api/admin/goals/{id}/unlock` (admin) — body: `{reason}` → unlock + audit

### Achievements
- `GET /api/achievements/goal/{goal_id}` — list all quarters for a goal
- `PUT /api/achievements/goal/{goal_id}/quarter/{q}` (employee) — upsert this quarter's achievement; propagates if primary shared

### Check-ins
- `GET /api/checkins/team` (manager) — current quarter check-ins for team
- `PUT /api/checkins/goal/{goal_id}/quarter/{q}` (manager) — upsert check-in comment

### Reports
- `GET /api/reports/achievement.csv?cycle_id=X` — CSV download
- `GET /api/reports/achievement.xlsx?cycle_id=X` — Excel download
- `GET /api/reports/completion` — completion stats (who has done check-ins this quarter)

### Analytics
- `GET /api/analytics/qoq?user_id=X` — quarter-on-quarter scores for a user
- `GET /api/analytics/department?cycle_id=X` — per-department avg score
- `GET /api/analytics/thrust-distribution?cycle_id=X` — goal count by thrust area
- `GET /api/analytics/completion-heatmap?cycle_id=X` — completion % per dept per quarter

### Audit
- `GET /api/admin/audit?entity_type=X&entity_id=Y` (admin) — view audit log

---

## 7. Frontend Pages

### Public
- `/login` — email + password

### Employee (`role=employee`)
- `/` — Dashboard: my goals summary, weightage pie chart, current quarter status, next deadlines
- `/goals` — MyGoals: list + create form. Inline weightage validation showing live sum out of 100. "Submit for Approval" button enabled only when valid.
- `/checkin` — QuarterlyCheckin: log actuals per goal for current quarter. Only enabled inside window.

### Manager (`role=manager`)
- `/` — Manager Dashboard: team completion stats, pending approvals count
- `/approvals` — Approvals: list of submitted goal sheets per team member. Inline edit target/weightage. Approve / Return.
- `/team-checkins` — TeamCheckins: per team member view of planned vs achievement per goal. Add check-in comment.
- `/analytics` — same analytics module as admin (scoped to team)

### Admin (`role=admin`)
- `/` — Admin Dashboard: org-wide completion stats, active cycle status
- `/cycles` — manage cycles and window dates
- `/users` — manage users + org hierarchy
- `/thrust-areas` — manage thrust areas
- `/audit` — searchable audit log table
- `/analytics` — full analytics
- `/reports` — download CSV/Excel reports

### Shared components
- AppShell with sidebar nav, role-aware
- Goal form: dynamic fields based on UoM type (e.g. timeline shows date picker, numeric shows number input)
- Live weightage validator widget
- Status badges with consistent colors (draft=grey, submitted=blue, approved/locked=green, returned=amber)
- Toast notifications for all actions (use shadcn `sonner`)

### Styling
- Tailwind only, no custom CSS files except `index.css` for tailwind directives
- Primary color: `orange-500` (atomberg brand)
- Use shadcn components: button, input, select, dialog, table, card, badge, tabs, sonner, form, dropdown-menu, sheet, calendar, popover
- Mobile responsive: every page must work on 375px width

---

## 8. Phased Implementation Plan

**Do these in order. Do not jump ahead. Check off each phase before moving on.**

### Phase 0 — Scaffolding (target: 45 min)
- [ ] `git init` repo at root
- [ ] Create `backend/` and `frontend/` folders
- [ ] Backend: `pip install fastapi uvicorn sqlalchemy alembic psycopg2-binary "pydantic[email]" "python-jose[cryptography]" "passlib[bcrypt]" python-multipart resend pandas openpyxl python-dotenv`
- [ ] Backend: scaffold `app/main.py` with a `/health` endpoint, CORS for frontend origin
- [ ] Frontend: `npm create vite@latest frontend -- --template react-ts`
- [ ] Frontend: install Tailwind v3, configure
- [ ] Frontend: install shadcn (`npx shadcn@latest init`), install button/input/card/dialog/table/badge/form/sonner/sheet/tabs/select/calendar/popover
- [ ] Frontend: install axios, react-router-dom, @tanstack/react-query, react-hook-form, zod, @hookform/resolvers, recharts, date-fns, lucide-react
- [ ] Set up Supabase project, get DATABASE_URL, put in `.env`
- [ ] Verify: `uvicorn app.main:app --reload` runs, `npm run dev` runs, both hello-world.

### Phase 1 — DB schema + migrations (target: 1 hr)
- [ ] Define all SQLAlchemy models per Section 4
- [ ] Initialize alembic, generate first migration, apply to Supabase
- [ ] Verify all tables exist in Supabase dashboard

### Phase 2 — Auth (target: 1 hr)
- [ ] Implement password hashing utils (passlib bcrypt)
- [ ] Implement JWT encode/decode utils (python-jose, HS256, 24hr expiry)
- [ ] Build `POST /api/auth/login`, `GET /api/auth/me`
- [ ] FastAPI dependency `get_current_user` and `require_role`
- [ ] Frontend: AuthContext, login page, axios interceptor that attaches `Authorization: Bearer <token>`, redirects on 401
- [ ] Verify: login as a manually-inserted user, hit `/me`, get user info.

### Phase 3 — Seed data (target: 30 min)
Create `backend/seed.py` that inserts the data in Section 9. Run it once. From this point on, all dev/demo uses these seeded users.

### Phase 4 — Goals CRUD + validation (target: 2 hrs)
- [ ] Implement all `/api/goals/*` endpoints except shared, submit, approve, return
- [ ] Frontend: `/goals` page with list, create form (UoM-aware fields), edit, delete
- [ ] Implement live weightage validator on frontend
- [ ] Backend validation on submit: sum=100, count<=8, min=10
- [ ] Verify: employee can create up to 8 goals, validator blocks bad submissions, drafts persist.

### Phase 5 — Submit + Approval flow (target: 1.5 hrs)
- [ ] `POST /api/goals/submit` — flips all draft goals to submitted (run validation first)
- [ ] `POST /api/goals/{id}/approve` — approve and auto-lock
- [ ] `POST /api/goals/{id}/return` — return with comment, sets all back to draft + stores comment
- [ ] `PATCH /api/goals/{id}/manager-edit` — manager inline edit before approval
- [ ] Frontend: Manager `/approvals` page with inline edit, approve/return buttons
- [ ] Verify: full flow employee→submit→manager edit→approve→locked, then employee cannot edit.

### Phase 6 — Quarterly check-ins + score (target: 2 hrs)
- [ ] Implement `services/score.py` with all 4 UoM formulas
- [ ] Implement `services/window.py` — given a cycle and current date, return which quarter window is open (or none)
- [ ] `PUT /api/achievements/goal/{id}/quarter/{q}` — gated by window
- [ ] `PUT /api/checkins/goal/{id}/quarter/{q}` (manager)
- [ ] Frontend: Employee `/checkin` page (disabled if window closed, with friendly message)
- [ ] Frontend: Manager `/team-checkins` page showing planned vs actual + comment input
- [ ] Verify: log achievement, score is computed correctly for all 4 UoM types.

### Phase 7 — Shared goals (target: 1.5 hrs)
- [ ] `POST /api/goals/shared` — body validation, create N copies, link via shared_parent_id, mark one is_shared_primary
- [ ] Modify `PUT /api/achievements/...` — if goal is shared primary, propagate to all linked goal rows for that quarter
- [ ] Frontend: in admin/manager UI, "Push shared goal" dialog with user multi-select
- [ ] Frontend: in employee goal form, shared goals show title/target as read-only (only weightage editable)
- [ ] Verify: admin pushes a goal to 3 employees, primary updates achievement, other 2 sync automatically.

### Phase 8 — Cycle management + window enforcement (target: 1 hr)
- [ ] Admin endpoints for `/api/cycles`
- [ ] Frontend: `/cycles` admin page with date pickers per window
- [ ] All achievement/goal endpoints respect window state
- [ ] Verify: set Q1 window to past dates, employee gets "window closed" message.

### Phase 9 — Audit trail (target: 1 hr)
- [ ] SQLAlchemy `before_update` event listener on `goals` table
- [ ] If old status is `approved` or `locked` and any field changed, write audit log row with old/new JSON snapshot
- [ ] Admin unlock endpoint `POST /api/admin/goals/{id}/unlock` with required reason, status → returned, log entry
- [ ] Frontend: Admin `/audit` table with filters by entity, action, user
- [ ] Verify: lock a goal, admin unlocks with reason, audit row appears with diff.

### Phase 10 — Reports (target: 1.5 hrs)
- [ ] `GET /api/reports/achievement.csv` — pandas DataFrame → CSV stream
- [ ] `GET /api/reports/achievement.xlsx` — same as xlsx via openpyxl
- [ ] `GET /api/reports/completion` — JSON stats: per quarter, per dept, % done
- [ ] Frontend: Admin `/reports` page with download buttons and completion dashboard cards
- [ ] Verify: CSV opens in Excel cleanly, columns match BRD.

### Phase 11 — Analytics dashboard (target: 3 hrs)
- [ ] Implement 4 analytics endpoints
- [ ] Frontend: `/analytics` page with:
  - QoQ line chart per user (selector)
  - Department avg bar chart
  - Thrust area pie chart
  - Completion heatmap (dept × quarter)
- [ ] Use Recharts. Tailwind for layout.
- [ ] Verify: charts render with seeded data, no console errors.

### Phase 12 — Email notifications (target: 2 hrs)
- [ ] `services/email.py` with Resend SDK, templates for: goal submitted, goal approved, goal returned, check-in reminder
- [ ] Wire into routes (use FastAPI BackgroundTasks so request isn't blocked)
- [ ] Verify: submit a goal, manager gets email; manager approves, employee gets email.

### Phase 13 — Polish + Deploy (target: 2 hrs)
- [ ] Empty states for all lists, loading skeletons, error toasts
- [ ] Mobile responsive check (375px)
- [ ] Backend: write Dockerfile, push to Railway, env vars set
- [ ] Frontend: deploy to Vercel, env var `VITE_API_URL` set to Railway URL
- [ ] CORS on backend updated to include Vercel domain
- [ ] Architecture diagram (use excalidraw.com or draw.io, export PNG, save to `docs/`)
- [ ] README with: live URL, 3 role credentials, screenshots, stack, run instructions
- [ ] Verify: open the live URL from a phone, log in as each role, full happy path works.

---

## 9. Seed Data (`backend/seed.py`)

### Users (passwords all `Atomberg@123` for demo)
| Email | Role | Manager | Department | Designation |
|---|---|---|---|---|
| admin@atomberg.com | admin | — | HR | HR Head |
| priya.sharma@atomberg.com | manager | admin | Sales North | Regional Sales Manager |
| rajesh.kumar@atomberg.com | manager | admin | R&D | R&D Lead |
| anjali.iyer@atomberg.com | employee | priya | Sales North | Sales Executive (Delhi) |
| vikram.singh@atomberg.com | employee | priya | Sales North | Sales Executive (Mumbai) |
| sneha.patel@atomberg.com | employee | priya | Sales North | Sales Executive (Pune) |
| arjun.mehta@atomberg.com | employee | rajesh | R&D | BLDC Motor Engineer |
| kavya.reddy@atomberg.com | employee | rajesh | R&D | Embedded Systems Engineer |

### Thrust Areas
- Sales Revenue
- Product Quality
- Customer NPS
- Energy Efficiency
- On-time Delivery
- Cost Reduction
- Safety
- Innovation & R&D

### Active Cycle
- Name: "FY 2026-27"
- Year: 2026
- Goal setting window: include today's date so demo works (e.g. open ~30 days ago, close ~30 days from today)
- Q1: include today so check-in demo works
- Q2, Q3, Q4: future dates per BRD schedule
- Also create a previous cycle "FY 2025-26" with all windows closed but goals filled in (locked + completed quarterly achievements) so analytics has multi-quarter data to show.

### Sample Goals
Seed each Sales employee with 4-5 realistic goals like:
- "Achieve Q1 sales target of ₹50L" — numeric_min, target=5000000, weightage=30, thrust=Sales Revenue
- "Maintain customer NPS above 8.5" — numeric_min, target=8.5, weightage=20, thrust=Customer NPS
- "Zero safety incidents this year" — zero, weightage=10, thrust=Safety
- "Reduce dealer TAT to 2 days" — numeric_max, target=2, weightage=20, thrust=On-time Delivery
- "Onboard 15 new dealers" — numeric_min, target=15, weightage=20, thrust=Sales Revenue

Each R&D employee:
- "Complete 3 BLDC motor prototype iterations" — numeric_min, target=3, weightage=30, thrust=Innovation & R&D
- "Reduce production defect rate below 2%" — percent_max, target=2, weightage=30, thrust=Product Quality
- "Launch new fan SKU by Sep 30" — timeline, target_date=2026-09-30, weightage=25, thrust=Innovation & R&D
- "Zero critical bugs in firmware release" — zero, weightage=15, thrust=Product Quality

For the previous cycle (FY 2025-26), seed all goals as `locked` with realistic Q1-Q4 achievements filled in (mix of fully-achieved, partial, missed) so analytics charts show meaningful data.

Also seed **one shared goal** pushed by admin to all 3 Sales employees: "Department-wide: Q3 Sales Revenue ₹2 Cr collectively" — numeric_min, target=20000000, weightage=15.

---

## 10. Testing Checklist (before demo)

### Employee flow
- [ ] Login as `anjali.iyer@atomberg.com`
- [ ] See 3-5 goals in MyGoals
- [ ] Create a new draft goal, edit it, delete it
- [ ] Try to submit with weightage sum != 100 → blocked
- [ ] Try to create a 9th goal → blocked
- [ ] Submit valid set → status shows "Submitted"
- [ ] Cannot edit submitted goals (UI disabled)
- [ ] Open Quarterly Check-in → log actuals → score displayed correctly per UoM
- [ ] Outside Q1 window: page shows "Window closed"

### Manager flow
- [ ] Login as `priya.sharma@atomberg.com`
- [ ] See pending approvals for 3 Sales reps
- [ ] Inline edit a goal's target → save → reflected
- [ ] Approve a goal sheet → status becomes locked
- [ ] Return a goal sheet with comment "Rework targets" → employee sees the comment, can edit
- [ ] View team check-ins, add a comment

### Admin flow
- [ ] Login as `admin@atomberg.com`
- [ ] Create a new cycle
- [ ] Modify Q1 window dates
- [ ] Push a shared goal to 3 employees → each sees it as read-only (except weightage)
- [ ] Primary owner logs achievement → other 2 see same achievement
- [ ] Unlock a locked goal with reason "Target revised after market dip" → audit log shows entry
- [ ] Download CSV report → opens in Excel cleanly
- [ ] View analytics: QoQ chart, dept bar, thrust pie, heatmap all render

### Edge cases
- [ ] Numeric Min UoM: actual=50, target=100 → score=50
- [ ] Numeric Max UoM: actual=5, target=2 → score=40
- [ ] Numeric Max with actual=0 → score=100 (no div by zero)
- [ ] Timeline UoM: actual_date < target_date → 100, else 0
- [ ] Zero UoM: actual=0 → 100, actual=3 → 0
- [ ] Try editing a locked goal as employee → 403
- [ ] Try approving a goal that's not your team member's → 403
- [ ] Try accessing /admin/* as employee → 403

---

## 11. Deployment

### Backend (Railway)
1. Push repo to GitHub.
2. Railway → New Project → Deploy from GitHub → select repo, root = `backend/`.
3. Set env vars:
   - `DATABASE_URL` = Supabase Postgres connection string (use the connection pooler URL for serverless)
   - `JWT_SECRET` = random 64-char string
   - `RESEND_API_KEY` = from resend.com
   - `FRONTEND_ORIGIN` = your Vercel URL
4. Railway auto-detects Python, runs `pip install -r requirements.txt` and your `Procfile` or `railway.toml` start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Run alembic migrations: in Railway service → Settings → add a one-off command `alembic upgrade head`, run once.
6. Run seed: similar one-off command `python seed.py`.

### Frontend (Vercel)
1. Vercel → Import GitHub repo → root = `frontend/`.
2. Set env vars:
   - `VITE_API_URL` = your Railway URL (e.g. `https://atomquest-backend.up.railway.app`)
3. Build command auto-detected for Vite. Deploy.

### Post-deploy
- Update backend CORS to allow Vercel domain
- Test full flow live before submitting

---

## 12. Architecture Diagram (in `docs/architecture-diagram.png`)

Create a simple diagram showing:
- User (browser) → Vercel (Frontend: React + Vite + Tailwind + shadcn)
- Frontend → Railway (Backend: FastAPI + SQLAlchemy + JWT)
- Backend → Supabase (Postgres)
- Backend → Resend (Email service)
- Note labels: "TLS everywhere", "JWT auth", "Free tier hosting"

Use excalidraw.com or draw.io. Export as PNG.

---

## 13. Demo Script (5 minutes)

**Order matters. Practice it.**

1. (15s) Open the live URL. Show the login screen. Mention "3 roles, single portal."
2. (45s) **Admin login** → show Cycles page, point out window dates → show Users page → show one audit log entry.
3. (60s) **Employee login (anjali)** → Dashboard → "My Goals" → walk through the 4 UoM types in goal creation → show live weightage validator → submit.
4. (45s) **Manager login (priya)** → Approvals → inline edit a target → approve. Return another with comment.
5. (30s) **Back to employee** → see returned goal with comment, see locked goal can't be edited.
6. (45s) Open Quarterly Check-in window → log achievements → scores compute live → show different UoM scoring.
7. (30s) **Manager** → Team Check-ins → add comment.
8. (45s) **Admin** → Reports → download CSV → open in Excel. Unlock a goal → show audit entry.
9. (60s) Analytics dashboard → walk through 4 charts → QoQ, dept avg, thrust split, completion heatmap.
10. (15s) Close with: "Free hosting, JWT auth, full audit, mobile-friendly. Built solo."

---

## 14. Design Rationale (use this when judges ask)

### Why FastAPI + React + Postgres
- FastAPI is used by Netflix, Uber, and Microsoft internally for Python APIs because of its speed, auto-OpenAPI docs, and type safety via Pydantic.
- React is the universal frontend choice (Meta, Airbnb, Netflix).
- Postgres is the database of record at Instagram, Reddit, Notion, GitLab. Relational integrity matters for our audit/approval workflows.
- Vite is the modern build tool — Webpack's successor, used by the React community by default in 2025-26.
- TypeScript on the frontend prevents a class of bugs that would cost hours in a hackathon.

### Why Supabase
- Free Postgres tier with dashboard for live debugging during demo.
- Postgres under the hood — no vendor lock-in.
- We use it purely as managed Postgres (not Auth/Realtime) because role-based auth is simpler to control in-house.

### Why Railway + Vercel
- Vercel: best-in-class for Vite/React, instant deploys, free CDN.
- Railway: no-sleep free tier (unlike Render), simple Docker/Python deploys.
- Both have zero-config GitHub integration.

### Why TanStack Query
- Industry standard for server state in React (used at Vercel, Linear, etc.). Caching, refetch, optimistic updates without writing reducers.

### Why shadcn/ui
- The dominant React component library in 2025-26. Copy-paste, you own the code. Looks professional out of the box. Easy to theme to Atomberg orange.

### Cost optimization story (judges will ask)
- Total monthly cost: **₹0**. Supabase (500MB DB free), Railway ($5 free credit lasts months for low traffic), Vercel (free hobby tier), Resend (100 emails/day free).
- No paid APIs. No third-party auth providers.
- API call efficiency: TanStack Query caches GETs aggressively. No redundant refetches.
- DB efficiency: indexes on `goals.employee_id`, `goals.cycle_id`, `audit_logs.entity_id` for fast filters.

### Atomberg fit
- Mobile-responsive — field sales staff across 60+ cities can use it on phones.
- Role-based access — factory floor managers don't see HR analytics; HR sees everything.
- Orange brand color, clean spacing — feels like an Atomberg internal tool, not a generic admin panel.
- Realistic thrust areas seeded from Atomberg's actual KPI categories (Quality, Sales, Energy Efficiency, etc.)

---

## 15. What We Rejected & Why

### Escalation Module (Bonus Section 5.3) — REJECTED
**Why:** Requires APScheduler background jobs and time-based triggers. Can't be demonstrated convincingly in a 5-minute live demo without mocking dates. High implementation cost (~5-6 hrs) for low visible payoff. Better to harden mandatory features.

### Microsoft Entra ID / Azure AD SSO (Bonus Section 5.1) — REJECTED
**Why:**
1. Atomberg's actual HR stack uses DarwinBox, not Microsoft 365 — judges are unlikely to have an Azure AD tenant ready to test against.
2. OAuth2 PKCE flow + attribute mapping + group sync is 6-8 hours minimum and prone to flaky bugs.
3. If SSO breaks during demo, the entire app is unusable. Zero margin for error.
4. Our in-house JWT auth is simpler, faster to demo, and judges can verify it works in 30 seconds.

### Microsoft Teams Bot (Bonus Section 5.2 sub-feature) — REJECTED
**Why:** Same infrastructure problem as Azure AD — requires Teams tenant access for live demo. Email notifications already cover the same notification use case. Not worth the 4-5 hours.

### Next.js instead of Vite — REJECTED
**Why:** Server-side rendering and React Server Components are overkill for a CRUD admin portal. Vite + plain React deploys faster, builds in seconds, and Vercel handles both equally well. Next.js adds learning surface area without solving any problem we have.

### MongoDB / NoSQL — REJECTED
**Why:** Our data is deeply relational — users → manager_id (self-ref), goals → employees + cycles + thrust_areas, audit logs reference everything. Postgres with foreign keys gives us referential integrity for free. NoSQL would force us to write that integrity in code.

### Redux / Zustand — REJECTED
**Why:** Server state is handled by TanStack Query. Client state is minimal (just auth context). Redux would be ceremony for no benefit.

### Building Auth from Supabase Auth — REJECTED
**Why:** Supabase Auth complicates role-based access because user roles live in our app's `users` table, not Supabase's `auth.users`. Syncing the two is friction. In-house JWT auth gives us full control over the role logic and is ~50 lines of Python.

### Docker Compose for local dev — REJECTED for hackathon scope
**Why:** Adds setup overhead. Supabase is cloud Postgres, FastAPI runs natively with uvicorn, frontend runs with Vite dev server. Three terminals is fine for solo dev.

---

## 16. Quick Reference Commands

```bash
# Backend dev
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Migrations
alembic revision --autogenerate -m "message"
alembic upgrade head

# Seed
python seed.py

# Frontend dev
cd frontend
npm install
npm run dev

# Frontend build
npm run build
```

---

**End of instructions. Start with Phase 0.**
