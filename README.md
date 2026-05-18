# AtomQuest — Strategic Performance Management System

[![Live Demo](https://img.shields.io/badge/demo-live-orange)](https://atomquest-portal-theta.vercel.app)
[![Tech Stack](https://img.shields.io/badge/stack-FastAPI%20%7C%20React-blue)](https://atomquest-portal-theta.vercel.app)

AtomQuest is a high-performance **Goal Setting & Tracking Portal** specifically designed for **Atomberg Technologies**. It replaces fragmented spreadsheet-based systems with a robust, audit-ready platform that aligns 800+ employees—from factory floor leads to regional sales heads—with the company's strategic thrust areas.

## 🚀 Live Demo & Credentials

**Deployment URL:** [https://atomquest-portal-theta.vercel.app](https://atomquest-portal-theta.vercel.app)

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Employee** | `anjali.iyer@atomberg.com` | `Atomberg@123` | Goal creation, check-ins |
| **Manager** | `priya.sharma@atomberg.com` | `Atomberg@123` | Approvals, team feedback |
| **Admin** | `admin@atomberg.com` | `Atomberg@123` | Full org control, Audit, Shared goals |

---

## ✨ Key Features

### 🎯 Goal Management
- **Six Unit of Measure (UoM) Types:** 
  - `numeric_min` (Higher is better, e.g., Sales Revenue)
  - `numeric_max` (Lower is better, e.g., Turnaround Time)
  - `percent_min` (e.g., Target Achievement %)
  - `percent_max` (e.g., Defect Rate %)
  - `timeline` (Binary date-based success)
  - `zero` (Absolute zero target, e.g., Safety Incidents)
- **Automatic Scoring:** Real-time percentage computation based on complex business logic for each UoM.
- **Validation Engine:** Enforces weightage sums (exactly 100), goal counts (max 8), and minimum impact (min 10% weightage).

### 🤝 Strategic Alignment
- **Shared Goals:** Admins and Managers can "push" goals to entire departments.
- **Propagation Sync:** Achievements logged by a primary goal owner automatically synchronize across all linked recipient goal sheets.
- **Thrust Area Mapping:** All goals align with core pillars: Sales, Quality, NPS, Efficiency, Safety, and Innovation.

### 🛡️ Governance & Audit
- **Immutable Approval Flow:** `Draft` → `Submitted` → `Approved/Locked` or `Returned for Rework`.
- **Full Audit Trail:** Every change to a locked goal is captured with JSON snapshots of old/new values, the actor, and the reason.
- **Role-Based Access Control (RBAC):** Scoped visibility for Managers (direct reports) and full visibility for Admins.

### 📊 Analytics & Reporting
- **Performance Heatmaps:** Department-wise completion rates across all four quarters.
- **QoQ Trends:** Interactive line charts showing score progression per employee.
- **Excel/CSV Export:** Production-grade reports using `pandas` and `openpyxl`.
- **Email Notifications:** Automated alerts via **Resend** for workflow transitions.

---

## 🛠️ Tech Stack & Rationale

| Component | Technology | Rationale |
|---|---|---|
| **Backend** | **FastAPI** | High-performance, asynchronous Python framework with native Pydantic validation and auto-generated OpenAPI docs. |
| **Frontend** | **React 18** | Industry-standard library for building interactive, state-driven user interfaces. |
| **Tooling** | **Vite** | Modern build tool providing near-instant Hot Module Replacement (HMR) for faster development. |
| **Language** | **TypeScript** | Static typing prevents a whole class of runtime errors and improves maintainability. |
| **Styling** | **Tailwind CSS v3** | Utility-first CSS for rapid, consistent styling without leaving the HTML. |
| **UI Kit** | **shadcn/ui** | Accessible, customizable components built on Radix UI and Tailwind. |
| **ORM** | **SQLAlchemy 2.0** | Modern declarative syntax with robust relationship handling and migration support via Alembic. |
| **Server State**| **TanStack Query** | Simplifies data fetching, caching, and synchronization between client and server. |

---

## 💻 Local Setup

### 1. Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL instance (or Supabase)

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```
Create a `.env` file in `backend/`:
```env
DATABASE_URL=your_postgres_url
JWT_SECRET=your_secret_key
RESEND_API_KEY=your_resend_key
FRONTEND_ORIGIN=http://localhost:5173
```
Run migrations and seed data:
```bash
alembic upgrade head
python seed.py
uvicorn app.main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```
Create a `.env` file in `frontend/`:
```env
VITE_API_URL=http://localhost:8000/api
```
Run the development server:
```bash
npm run dev
```

---

## 📐 Architecture Overview

- **Monolith with Scoped Services:** The backend is structured around specific services (Score, Audit, Shared Goals, Email) for high cohesion.
- **Relational Integrity:** Strict foreign key constraints ensure data consistency between Cycles, Users, Goals, and Achievements.
- **Stateless Auth:** JWT-based authentication with 24-hour expiry.
- **Deployment:** 
  - **Frontend:** Vercel (Edge Network)
  - **Backend:** Railway (Dockerized)
  - **Database:** Supabase (PostgreSQL 15)

---

## 📝 Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string. |
| `JWT_SECRET` | Secret key for signing access tokens. |
| `RESEND_API_KEY` | API key for Resend email service. |
| `VITE_API_URL` | Base URL for the backend API (frontend side). |

---

Built with ❤️ for the Atomberg Hackathon 1.0.
