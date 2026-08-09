# Food Delivery — Backend (Phase 1)

Phase 1 delivers: database schema, migration runner, JWT auth (register/login/me),
role-based authorization middleware, and Restaurant + Meal CRUD with ownership
enforcement.

## Setup

```powershell
cd backend
npm install
copy .env.example .env
```

Edit `.env`:
- `DATABASE_URL` — point at your local Postgres (e.g. the `healthcare_db`-style
  setup you already use, but with a new `food_delivery_db` database)
- `JWT_SECRET` — set a long random string

Create the database (PowerShell, adjust path to your psql):

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE food_delivery_db;"
```

Run migrations:

```powershell
npm run migrate
```

Start the API:

```powershell
npm run dev
```

Health check: `GET http://localhost:5000/api/health` → `{"status":"ok"}`

## Endpoints implemented so far

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me                (auth required)

GET    /api/restaurants            (public, ?search=&foodType=)
GET    /api/restaurants/mine       (owner only)
GET    /api/restaurants/:id        (public)
GET    /api/restaurants/:id/meals  (public; owner sees hidden/unavailable meals too)
POST   /api/restaurants            (owner only)
PUT    /api/restaurants/:id        (owner only, must own it)
DELETE /api/restaurants/:id        (owner only, must own it)

GET    /api/meals/:id              (public)
POST   /api/meals                  (owner only, must own parent restaurant)
PUT    /api/meals/:id              (owner only, must own parent restaurant)
DELETE /api/meals/:id              (owner only, must own parent restaurant)
```

## What's enforced at this layer

- Passwords hashed with bcrypt (12 rounds), never returned in responses
- JWT auth re-checks the user against the DB on every request (catches
  deactivated accounts immediately, not just at login)
- Ownership checks: a restaurant owner can only update/delete their own
  restaurants, and can only add/edit/delete meals belonging to restaurants
  they own — enforced in `restaurantService`/`mealService`, not just hidden
  in the frontend
- Centralized error handler returns consistent `{ error: { message } }`
  JSON, maps Postgres unique/FK violations to proper 409/400s
- All SQL uses parameterized queries (no string-interpolated SQL anywhere)

## Not yet implemented (coming in later phases)

- Cart, checkout, order placement
- Order status state machine + order history
- User blocking
- Dashboard/stats endpoints
- Frontend (React)
