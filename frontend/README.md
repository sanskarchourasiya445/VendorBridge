# VendorBridge — Procurement & Vendor Management ERP

A production-grade React 18 + Vite ERP for managing vendors, RFQs, quotations,
approvals, purchase orders, invoices and procurement analytics. Built with
role-based access control and localStorage persistence (no backend required).

## Tech Stack

- **React 18 + Vite** — app shell & build tooling
- **React Router v6** — client-side routing with protected & role-based routes
- **Tailwind CSS v3** — design system with custom tokens
- **Zustand (+ persist)** — global auth state, persisted to localStorage
- **Recharts** — dashboard & report analytics
- **React Hook Form + Zod** — validated forms
- **Lucide React** — icons · **date-fns** — dates · **React Hot Toast** — notifications

## Getting Started

```bash
npm install
npm run dev      # start dev server (http://localhost:5173)
npm run build    # production build
npm run preview  # preview the production build
```

## Demo Accounts

One account per role — use the quick-login chips on the sign-in screen, or sign in manually:

| Role                 | Email                     | Password      |
|----------------------|---------------------------|---------------|
| Administrator        | admin@vendorbridge.in     | `Admin@123`   |
| Procurement Manager  | manager@vendorbridge.in   | `Manager@123` |
| Approving Authority  | approver@vendorbridge.in  | `Approve@123` |
| Viewer               | viewer@vendorbridge.in    | `Viewer@123`  |

Each role sees a different navigation set and action availability, driven by the
permission matrix in `src/utils/constants.js`. Approvers land on the Approvals
queue; everyone else lands on the Dashboard.

## Design System

- Primary `#1a56db` · Success `#057a55` · Warning `#c27803` · Danger `#e02424`
- Dark sidebar `#0f172a`, white cards, 8px radius, "Plus Jakarta Sans"

## Project Structure

```
src/
  components/{layout, shared}/   layout shell + reusable UI building blocks
  pages/                         one folder per module (Auth, Dashboard, Vendors, …)
  store/authStore.js             Zustand auth store (persisted)
  data/mockData.js               Indian business seed data (INR, GST, PAN)
  utils/                         constants (roles/permissions/statuses) + formatters
  hooks/                         useAuth, usePermissions
```

## Phase Scope

This is **Phase 1 — Project Setup + Architecture**. It delivers a fully runnable,
navigable, role-aware application shell with real data-driven module screens.

Planned for later phases: full CRUD forms & modals, PDF generation
(`utils/pdfGenerator.js`), per-module Zustand stores, the `components/ui/` primitive
library, and detail/drawer views.
