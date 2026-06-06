# VendorBridge ERP

A full-stack Procurement & Vendor Management ERP, organised as a single project
with two independent applications:

```
vendorbridge-erp/
├── frontend/        React 18 + Vite SPA (component-based, RBAC, localStorage)
└── backend/         Express REST API (MVC architecture, JWT auth, RBAC)
```

The two apps run independently. The frontend works standalone on seeded mock
data (localStorage); the backend exposes the same data over a REST API and is
ready for the frontend to connect to.

---

## Backend — Express (MVC)

`backend/` follows a clean Model–View–Controller layout:

```
backend/src/
├── server.js              entry point (bootstraps bcrypt hashing, starts HTTP)
├── app.js                 Express assembly (CORS, JSON, logging, routes, errors)
├── config/                environment configuration
├── data/                  in-memory seed dataset (ported from the frontend)
├── models/                MODEL — Collection data layer + per-resource instances
├── views/                 VIEW  — JSON response envelopes + serializers
├── controllers/           CONTROLLER — request handlers (auth, vendors, rfqs, …)
├── routes/                Express routers (one per resource) mounted under /api
├── middlewares/           JWT authentication + RBAC permission guard, errors
└── utils/                 jwt, permission matrix, bcrypt security, helpers
```

### Run

```bash
cd backend
cp .env.example .env        # adjust JWT_SECRET / PORT if you like
npm install
npm run dev                 # or: npm start  →  http://localhost:4000/api
```

### Key endpoints

| Method | Path                              | Notes                          |
|--------|-----------------------------------|--------------------------------|
| POST   | `/api/auth/login`                 | returns `{ token, user, home }`|
| POST   | `/api/auth/signup`                | self-registration (viewer)     |
| GET    | `/api/auth/me`                    | current user (auth)            |
| GET    | `/api/dashboard/stats`            | KPIs + charts data             |
| GET    | `/api/dashboard/reports`          | analytics + top vendors        |
| GET/POST/PUT/DELETE | `/api/vendors`       | full CRUD (RBAC-gated)         |
| GET    | `/api/rfqs` · `/api/quotations`   | list + by id (+ create/edit)   |
| GET    | `/api/purchase-orders` · `/api/invoices` | list + by id            |
| GET    | `/api/approvals`                  | approval queue                 |
| PATCH  | `/api/approvals/:id/decision`     | approve / reject (approver)    |
| GET    | `/api/activity-logs`              | audit trail                    |
| GET    | `/api/users`                      | team directory (admin)         |

All `/api/*` routes except auth require a `Authorization: Bearer <token>` header,
and every action is checked against the role-based permission matrix in
`utils/permissions.js`. Passwords are bcrypt-hashed at startup and never returned
to clients.

---

## Frontend — React + Vite

`frontend/` is the SPA (see `frontend/README.md` for full details): protected and
role-based routes, dark collapsible sidebar, dashboard with Recharts, and
data-driven module screens for vendors, RFQs, quotations, approvals, purchase
orders, invoices, reports, activity logs and user management.

### Run

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

---

## Demo accounts (shared by both apps)

| Role                | Email                     | Password      |
|---------------------|---------------------------|---------------|
| Administrator       | admin@vendorbridge.in     | `Admin@123`   |
| Procurement Manager | manager@vendorbridge.in   | `Manager@123` |
| Approving Authority | approver@vendorbridge.in  | `Approve@123` |
| Viewer              | viewer@vendorbridge.in    | `Viewer@123`  |

## Connecting frontend → backend (optional next step)

The frontend currently authenticates and reads from its local seed data. To wire
it to the live API, point a small API client at `http://localhost:4000/api`,
store the JWT from `/api/auth/login`, and send it as a Bearer header. The backend
CORS origin defaults to the Vite dev server (`http://localhost:5173`) and can be
changed via `CLIENT_ORIGIN` in `backend/.env`.
