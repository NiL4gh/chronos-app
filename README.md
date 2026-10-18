# Chronos — Enterprise Time Intelligence & Workforce Analytics

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_&_Auth-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Deployment: Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?logo=vercel&logoColor=white)](https://chronos-app-rosy.vercel.app)

> **Portfolio Engineering Case Study:** Chronos is a production-grade, multi-tenant B2B time tracking and workforce management platform designed with a warm glassmorphic design system, strict PostgreSQL Row-Level Security (RLS), and a resilient dual-mode architecture.

<p align="center">
  <img src="docs/chronos-preview.gif" alt="Chronos App Interactive Preview" width="100%" style="border-radius: 10px; max-width: 900px;" />
</p>

---

## ⚡ Live Deployments & Interactive Demos

| Environment | Purpose | Access | URL |
| :--- | :--- | :--- | :--- |
| **Instant Guest Sandbox** | Reviewer / Recruiter instant preview | **1-Click** (No signup or database required) | [chronos-demo-beige.vercel.app](https://chronos-demo-beige.vercel.app/#/my-time) |
| **Production Cloud Gateway** | Live multi-tenant deployment | Google OAuth or Email Login | [chronos-app-rosy.vercel.app](https://chronos-app-rosy.vercel.app) |

---

## 🏛️ System Architecture

Chronos is architected with a decoupled frontend, edge authentication gateway, and multi-tenant PostgreSQL persistence layer protected by strict database policies.

```mermaid
flowchart TD
    subgraph Client ["Client Layer (React 18 + Vite)"]
        GW["Auth Gateway (24 kB Chunk)<br/>• Login / Signup / Onboarding<br/>• Google OAuth Integration"]
        APP["Main Workspace (Code-Split Chunk)<br/>• Realtime Timer & Timesheet<br/>• Projects, Tasks & Invoicing<br/>• Team Performance Analytics"]
        CACHE[("Local Session Cache<br/>• Instant Offline Fallback")]
    end

    subgraph Supabase ["Backend Cloud (Supabase / PostgreSQL)"]
        AUTH["Supabase GoTrue Auth<br/>• Google OAuth 2.0 Provider<br/>• JWT Token Issuance"]
        RLS{"PostgreSQL Row-Level Security<br/>• Tenant Isolation by org_id<br/>• Role Verification (Admin / Employee)"}
        DB[("PostgreSQL Tables<br/>• organizations<br/>• profiles<br/>• projects<br/>• tasks<br/>• time_logs<br/>• invoices")]
    end

    subgraph Automation ["Continuous Operations"]
        GHA["GitHub Actions Cron<br/>• Supabase Keep-Alive (3-day cycle)"]
    end

    GW -->|1. Authenticate| AUTH
    AUTH -->|2. Issue JWT| GW
    GW -->|3. Lazy Load| APP
    APP <-->|4. Authenticated REST| RLS
    RLS <--> DB
    APP -.->|Resilient Fallback| CACHE
    GHA -->|Automated Ping| RLS
```

---

## 🛠️ Core Engineering Highlights

### 1. Dual-Bundle Code Splitting (Sub-Second Initial Load)
To minimize initial bundle weight and time-to-interactive (TTI), Chronos is split into discrete asynchronous chunks:
- **Auth Gateway Chunk (~24 kB gzipped):** Mounts instantly on `/login`, handling Google OAuth and credential validation without bundling heavy charting or data libraries.
- **Main Application Chunk (~320 kB gzipped):** Dynamically loaded only after authenticated session verification, containing Lucide iconography, interactive timesheets, project Gantt metrics, and PDF invoicing.

### 2. Multi-Tenant Row-Level Security (RLS)
Data security is enforced strictly at the database layer rather than relying on application code:
- Every query is scoped to `public.my_org_id()` derived securely from `auth.uid()`.
- **Organizations:** Members can only view their own organization; only administrators can alter workspace settings.
- **Profiles:** Users have direct read/update access to their profile (`id = auth.uid()`), with tenant-wide visibility for team members.
- **Time Logs & Tasks:** Time logs are appendable and editable exclusively by the record creator, while team aggregations remain visible across the workspace.

### 3. Dual-Mode Resilience Architecture
Chronos incorporates a self-healing client storage layer:
- In production cloud mode, all operations commit directly to Supabase via PostgREST.
- If network connectivity is interrupted or if deployed in a standalone sandbox environment without database keys, the app gracefully degrades to an in-memory / `localStorage` mock engine, ensuring hiring managers and reviewers can evaluate every workflow without backend dependencies.

### 4. Automated Cloud Keep-Alive
Supabase free-tier instances auto-pause after 7 days of API inactivity. This repository includes an automated GitHub Actions cron workflow (`.github/workflows/supabase-keepalive.yml`) that queries the REST endpoint every 72 hours, ensuring the database remains warm and responsive for portfolio visitors.

---

## 📊 Database Schema Overview

```
organizations (id, name, industry, timezone, created_at)
  └── profiles (id [auth.users FK], org_id [FK], full_name, role, hourly_rate, avatar_url)
        ├── projects (id, org_id [FK], name, client, budget, goal_hours, status)
        │     └── tasks (id, org_id [FK], project_id [FK], title, status, priority, time_logged)
        ├── time_logs (id, org_id [FK], user_id [FK], project_id [FK], task_id [FK], started_at, ended_at, duration_hours)
        └── invoices (id, org_id [FK], invoice_number, client_name, subtotal, tax, total, status, line_items)
```

The comprehensive migration script including extensions, triggers, RLS policies, and indexing is maintained at [`supabase/schema.sql`](supabase/schema.sql).

---

## 💻 Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/NiL4gh/chronos-app.git
cd chronos-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
```bash
cp .env.example .env
```
Populate `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```
*(Optional: If left blank, Chronos automatically boots in Demo Sandbox mode with sample data).*

### 4. Start Development Server
```bash
npm run dev
```

### 5. Production Build & Linting
```bash
npm run build    # Compiles production bundles in dist/
npm run lint     # Runs ESLint checks
```

---

## 📦 Tech Stack

- **Frontend Core:** [React 18](https://react.dev/), [Vite 5](https://vitejs.dev/), [React Router v6](https://reactrouter.com/)
- **Styling & UI:** [Tailwind CSS 3](https://tailwindcss.com/), Custom Glassmorphism CSS design tokens, [Lucide React](https://lucide.dev/)
- **Backend & Auth:** [Supabase](https://supabase.com/) (PostgreSQL 15, PostgREST, GoTrue Auth with Google OAuth)
- **CI/CD & Hosting:** [Vercel](https://vercel.com/), [GitHub Actions](https://github.com/features/actions)
- **Desktop (Optional):** [Electron](https://www.electronjs.org/) wrapper support

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
