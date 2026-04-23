# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Mi Golosinería** is a full-stack e-commerce platform for an Argentine confectionery/candy store. It has a public storefront for customers and an admin panel for order/inventory management.

## Development Commands

### Frontend (in `frontend/`)
```bash
npm run dev       # Dev server at http://localhost:5173
npm run build     # Production build to dist/
npm run preview   # Preview production build
npm run lint      # ESLint check
```

### Backend (in `backend/`)
```bash
npm run dev       # Nodemon with hot reload
npm start         # node src/app.js (production)
npm test          # Jest unit tests (backend/__tests__ + src/__tests__)
```

## Environment Setup

**Backend** — copy `backend/.env.example` to `backend/.env`:
- `PORT=3001`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME=mi_golosineria`
- `JWT_SECRET`, `JWT_EXPIRES_IN=8h`
- `ALLOWED_ORIGINS=http://localhost:5173`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

**Frontend** — copy `frontend/.env.example` to `frontend/.env`:
- `VITE_API_URL=http://localhost:3001/api`

## Architecture

### Frontend
- **React 19 + Vite** with path alias `@` → `src/`
- **Routing:** React Router v7 — public routes (`/tienda`, `/confirmacion`) and protected admin routes (`/admin/*`) via `PrivateRoute`
- **Styling:** Tailwind CSS v4 + shadcn/ui components in `src/components/ui/`. Large inline style objects (e.g., the `T` object in `Tienda.jsx`) are intentional for the shop page.
- **Animations:** Framer Motion throughout the storefront

**State management is split by concern:**
| State | Tool | Why |
|---|---|---|
| Auth (login/token) | React Context (`AuthContext`) | Simple, scoped |
| Cart | Zustand (`useCartStore`) | Persisted to localStorage |
| UI state (sidebar) | Zustand (`useSidebarStore`) | Persisted |
| Server/async data | TanStack Query (admin dashboard) | Caching, staleTime 5min |
| Simple fetches | Axios via `src/api/*.js` | Direct calls in shop pages |

**API layer** lives in `src/api/` — one file per domain (`productosApi.js`, `pedidosApi.js`, `adminApi.js`, `authApi.js`, `clientesApi.js`). These use a shared Axios instance (`src/lib/axiosInstance.js`) that injects the JWT `Authorization` header from localStorage.

### Backend
- **Express 4** on port 3001
- **Middleware stack (order matters):** `helmet → requestLogger → cors → express.json → rate-limit → routes → error handler`
- **Security:** JWT via `src/middleware/auth.js`, admin role check via `src/middleware/isAdmin.js`, per-route rate limits (5 login attempts/min, 20 upload/10min, 1000 general/15min)
- **Database:** MySQL 8 with `mysql2/promise` connection pool — no ORM. Pool auto-reconnects on `PROTOCOL_CONNECTION_LOST`/`ECONNREFUSED` with exponential backoff (max 3 retries).
- **Images:** Multer (memory buffer, 5MB limit, JPEG/PNG/WebP only) → `imageService.js` → Cloudinary SDK
- **Logging:** Winston with `DailyRotateFile` — structured JSON in production, colored in dev. Files rotate daily and expire after 14 days (`logs/` directory, gitignored).
- **Startup validation:** `validateEnv()` in `config/validateEnv.js` checks all required env vars at boot and calls `process.exit(1)` if any are missing.

**New utility modules:**
- `src/utils/response.js` — `success(res, data)`, `created(res, data)`, `error(res, msg, status)` helpers for consistent HTTP responses
- `src/utils/sanitizeDbError.js` — maps MySQL error codes to user-friendly Spanish messages; passes SQLSTATE `45000` errors as-is (business errors from SPs)
- `src/services/imageService.js` — `upload(buffer)` and `delete(publicId)` — decouples Cloudinary logic from route handlers
- `src/middleware/requestLogger.js` — logs method, URL, status code, and response time via Winston on every request

### Database Conventions

> Full schema reference (all tables, views, stored procedures, triggers, and FK relations) is in [DATABASE_REFERENCE.md](./DATABASE_REFERENCE.md). Consult it for any database-related work.

- **Stored Procedures** (`sp_*`) for write operations with business logic (e.g., `sp_tienda_registrar_pedido` handles stock validation + order creation atomically)
- **Views** (`v_*`) for read queries (e.g., `v_tienda_productos_disponibles`, `v_admin_pedidos`)
- When a SP raises `SQLSTATE '45000'`, the backend catches it and returns HTTP 400 with the SP's error message

### API Response Conventions
- Success responses: `{ mensaje: string, data?: any }` or just the data directly
- Error responses: `{ error: string }` (messages are in Spanish)
- Status codes: 201 for POST creation, 400 for validation, 401 for auth, 403 for forbidden, 500 for server errors

## Key Patterns

**Form validation:** React Hook Form + Zod resolvers. Define schema with `z.object(...)`, pass to `useForm({ resolver: zodResolver(schema) })`.

**Protected routes:** Wrap admin routes with `<PrivateRoute>` in `App.jsx`; it reads from `AuthContext` and redirects to `/admin/login` if unauthenticated.

**Admin analytics (Dashboard):** Uses `useQuery` from TanStack Query to batch ~8 API calls in parallel. Data is visualized with Recharts.

**File upload flow:** Frontend sends `multipart/form-data` to `/api/upload` → Multer validates (5MB, JPEG/PNG/WebP) → `imageService.upload(buffer)` → Cloudinary SDK → returns `{ url }` → URL saved in products table.

**DB error handling:** All repositories catch MySQL errors and pass them through `sanitizeDbError()`. SQLSTATE `45000` (SP business errors) become HTTP 400 with the SP's message. Other MySQL errors are mapped to generic Spanish messages.

**Carrito component structure:** The shopping cart UI lives in `src/components/tienda/carrito/` and is split into `CartHeader`, `CartItems`, `CartItem`, `CartTotal`, `CartCheckout`, and `carritoStyles.js`. The parent `Carrito.jsx` composes them.

**Unit testing (backend):** Tests live in `backend/src/__tests__/`. Use Jest with `jest.mock()` to isolate the service layer from the database. Follow the AAA pattern (Arrange / Act / Assert). Run with `npm test` from `backend/`.
