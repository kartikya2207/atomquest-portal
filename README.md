# AtomQuest — Goal Setting & Tracking Portal for Atomberg Technologies

## Live URL
[https://atomquest-portal-theta.vercel.app](https://atomquest-portal-theta.vercel.app)

## Login Credentials
| Role | Email | Password |
|---|---|---|
| **Employee** | anjali.iyer@atomberg.com | Atomberg@123 |
| **Manager** | priya.sharma@atomberg.com | Atomberg@123 |
| **Admin** | admin@atomberg.com | Atomberg@123 |

## Tech Stack
- **Backend:** FastAPI (Python)
- **Frontend:** React 18, TypeScript, Vite
- **Styling:** TailwindCSS v3, shadcn/ui
- **Database:** PostgreSQL (Supabase)
- **Hosting (Backend):** Railway
- **Hosting (Frontend):** Vercel
- **State Management:** TanStack Query
- **Charts:** Recharts

## Features
- **Goal Setting:** 4 UoM types (Numeric Min/Max, Timeline, Zero-based).
- **Manager Approval Workflow:** Employee submission → manager approval/return cycle.
- **Quarterly Check-ins:** Achievement logging within quarterly windows.
- **Score Computation:** Business-rule based automatic scoring per UoM.
- **Shared Goals with Sync:** Propagate and synchronize goals from Admin/Managers.
- **Audit Trail:** Detailed history of changes to approved goals.
- **Analytics Dashboard:** 4 interactive charts (QoQ, Dept, Thrust Area, Heatmap).
- **Reports:** Downloadable Excel and CSV achievement reports.
- **Email Notifications:** Automated alerts via Resend for workflow transitions.

## Architecture
- **Frontend:** Hosted on **Vercel** (React 18).
- **Backend:** Hosted on **Railway** (FastAPI).
- **Database:** Managed **Supabase** (PostgreSQL).
- **Service Tier:** All components are hosted on **Free Tiers**.
