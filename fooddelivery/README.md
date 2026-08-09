# Zaiqa — Food Delivery Web Application

Full-stack food delivery platform: React (Vite + Tailwind) frontend, Node/Express
backend, PostgreSQL database. Two roles — **Regular User** (customer) and
**Restaurant Owner** — with everything important enforced server-side, not just
hidden in the UI.

```
fooddelivery/
├── backend/    Express API + PostgreSQL migrations
└── frontend/   React app (Vite)
```

## Quick start

### 1. Database

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE food_delivery_db;"
```

### 2. Backend

```powershell
cd backend
npm install
copy .env.example .env
# edit .env: set DATABASE_URL and a real JWT_SECRET
npm run migrate
npm run seed        # optional — populates demo restaurants/meals/accounts
npm run dev          # starts on http://localhost:5000
```

Demo accounts after `npm run seed` (password for all: `Password123`):
- `owner1@zaiqa.demo` — owns Karahi Corner & Slice House
- `owner2@zaiqa.demo` — owns Wok This Way
- `customer1@zaiqa.demo`, `customer2@zaiqa.demo` — customers

### 3. Frontend

```powershell
cd frontend
npm install
copy .env.example .env
# edit .env if your API isn't on localhost:5000
npm run dev           # starts on http://localhost:5173
```

Open `http://localhost:5173`.

## What's implemented

**Auth & roles**
- JWT auth, bcrypt-hashed passwords, register/login with role selection
- Every write endpoint checks role AND ownership server-side (a restaurant
  owner literally cannot edit another owner's restaurant/meals/orders, even
  by guessing IDs)

**Customer flow**
- Browse restaurants (search + category filter), view menus, add to cart
- Cart enforces one-restaurant-per-order — switching restaurants shows the
  "clear cart and start a new order?" confirmation before wiping it
- Checkout recalculates the total from live backend prices (frontend total
  is never trusted), places the order, shows a success screen
- Order list with status filters; order tracking page with a visual stepper
  and full timestamped history; cancel (while Placed) and mark-as-Received
  (after Delivered) actions
- Dashboard with order stats and popular restaurants

**Restaurant owner flow**
- Restaurant CRUD, meal CRUD (scoped to restaurants they own)
- Orders management with status-appropriate action buttons (Start
  Processing / Mark In Route / Mark Delivered)
- Block/unblock customers per restaurant; blocked users can't place new
  orders at that restaurant (but can still order elsewhere)
- Dashboard with revenue, order counts, recent orders

**Order status state machine** (the part that had to be bulletproof)
- Centralized in `backend/src/utils/orderStatusTransitions.js` — a single
  map of `{status: {nextStatus: requiredRole}}` that every status-change
  request is checked against
- Placed → Processing → In Route → Delivered → Received, plus
  Placed → Canceled. No backward moves, no skipped steps, no wrong-role
  changes — all rejected with a 400/403 by the backend regardless of what
  the frontend sends
- Every change is logged to `order_status_history` with who changed it and
  when, shown as a timeline on the tracking page

**Design**
- Custom Tailwind design system: Fraunces (display) + Inter (body) + IBM
  Plex Mono (prices/order IDs/timestamps — a receipt-like touch)
- Warm orange/green palette distinct from generic AI-template defaults
- The order tracker's perforated "receipt stub" styling is the one
  deliberately distinctive visual element; everything else stays quiet and
  disciplined around it

## Known simplifications

- "Forgot password" UI exists but isn't wired to real email delivery
- No image upload — restaurant/meal images are URLs
- No pagination on restaurant/meal/order lists yet (fine at demo scale;
  straightforward to add with `LIMIT`/`OFFSET` + a page param if you need it
  for a larger dataset)
- Ratings shown on restaurant cards are placeholder (spec asked for a rating
  UI but no rating/review data model was requested)

## Verified

- Every backend `.js` file passes `node --check`
- `npm install` succeeds for both backend and frontend
- `npm run build` succeeds for the frontend (Vite production build, no
  errors)
- Full local Postgres integration testing wasn't possible in this sandbox
  (no DB engine available), so run through the demo accounts once it's up
  on your machine and let me know if anything doesn't line up — happy to
  fix fast.
