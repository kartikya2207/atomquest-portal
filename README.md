# AtomQuest — Goal Setting & Tracking Portal

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
- **Frontend:** React, TypeScript, Vite
- **Styling:** TailwindCSS, shadcn/ui
- **Database:** PostgreSQL (Supabase)
- **Hosting (Backend):** Railway
- **Hosting (Frontend):** Vercel
- **Charts:** Recharts
- **State Management:** TanStack Query

## Features
- **Goal Setting:** Support for 4 UoM types (Numeric Min/Max, Percent Min/Max, Timeline, Zero-incident).
- **Approval Workflow:** Full employee submission → manager approval/return workflow.
- **Quarterly Check-ins:** Log achievements within specific quarterly windows.
- **Score Computation:** Automatic score calculation based on business rules for each UoM.
- **Shared Goals:** Propagate goals from Admin/Managers to team members.
- **Audit Trail:** Comprehensive logging of all changes to approved goals.
- **Analytics Dashboard:** Org-health, QoQ performance, Dept performance, Thrust area focus, and Completion heatmap.
- **Excel Reports:** Download achievement reports in .xlsx format.
- **Email Notifications:** Automated alerts for goal submissions, approvals, and returns.

## Architecture
- **Frontend:** Hosted on Vercel (React SPA).
- **Backend:** Hosted on Railway (FastAPI REST API).
- **Database:** Managed PostgreSQL on Supabase.
- **Email:** Resend integration.
