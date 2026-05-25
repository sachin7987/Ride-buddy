# RideBuddy

A full-stack carpooling platform for India — share rides, split costs, save fuel.
Inspired by BlaBlaCar, built end-to-end with Next.js 14, TypeScript, Prisma and Postgres.

## What's included

- **Role-aware sign-up** — Choose Passenger, Driver, or Both. UI adapts: passengers don't see "Publish ride", drivers don't see consumer search bars, etc.
- **Auth** — Email + password (NextAuth, JWT sessions).
- **KYC verification** — Upload Driving License, Aadhaar and a selfie. Admin approval workflow flips users to "verified" so they can publish/book rides.
- **Vehicles** — Add cars, bikes, SUVs, autos with plate, seats, year, photos. Vehicle verification flow with RC + insurance docs.
- **Publish a ride** — Pick origin/destination, departure time, seats, price/seat, ride preferences. Real road routes from OSRM.
- **Search** — Filter by route, date and seats. Live OpenStreetMap previews.
- **Booking + payments** — Razorpay integration with a built-in mock fallback for local dev.
- **Live tracking** — Drivers broadcast GPS pings; passengers see them on a real-time map.
- **In-app chat** — Polling-based chat between driver and passenger of a confirmed booking.
- **Reviews & ratings** — Five-star review after each completed ride; aggregated on user profiles.
- **Ride lifecycle** — Drivers can Start / Complete / Cancel their rides. Reviews unlock automatically on completion.
- **Admin panel** — Approve/reject KYC and vehicle verification requests.

## Tech stack

| Layer       | Choice                                                |
| ----------- | ----------------------------------------------------- |
| Framework   | Next.js 14 (App Router) + TypeScript                  |
| Styling     | Tailwind CSS, shadcn/ui-style primitives, Ant Design  |
| Auth        | NextAuth (Credentials provider, JWT)                  |
| Database    | PostgreSQL via Prisma 6                               |
| Maps        | Leaflet + OpenStreetMap, OSRM for driving routes      |
| Payments    | Razorpay (with mock mode for local dev)               |
| File upload | Vercel Blob in production, local FS in dev           |
| Hosting     | Vercel (recommended) — multi-region edge for India   |

---

## Local development

### Prerequisites

- Node.js ≥ 18
- A Postgres database (Neon's free tier is perfect — see deploy section below)
- _Optional_: Razorpay test account if you want real payments instead of the mock flow

### Setup

```bash
git clone <your-repo-url>
cd ridebuddy
npm install --legacy-peer-deps
cp .env.example .env
```

Edit `.env` and set `DATABASE_URL` and `DIRECT_URL` to your Postgres URL (see [Neon setup](#1-set-up-neon-postgres) below — you can use the same database for dev and prod or create a separate dev branch).

```bash
# Sync the schema to your database
npm run db:push

# (Optional) seed demo users + rides
npm run db:seed

# Start the dev server
npm run dev
```

Visit `http://localhost:3000`. Demo accounts (after seeding):

- **Admin** — `admin@ridebuddy.test` / `admin123`
- **Driver** — `driver@ridebuddy.test` / `driver123`
- **Passenger** — `passenger@ridebuddy.test` / `passenger123`

---

## Deploy to Vercel

### 1. Set up Neon Postgres

1. Go to [neon.tech](https://neon.tech) → sign up (free, no credit card).
2. Create a new project. Choose region **Mumbai (`aws-ap-south-1`)** for best latency from India.
3. From the dashboard's **Connection Details**, copy two URLs:
   - **Pooled connection** → this is your `DATABASE_URL`
   - **Direct connection** → this is your `DIRECT_URL`
4. Both should end with `?sslmode=require`.

### 2. Push the project to GitHub

```bash
# From inside the project folder:
git add .
git commit -m "Production-ready: Postgres + Vercel Blob + role-aware UX"

# Create the repo on GitHub (one of the following):
#   a) Via gh CLI:
gh repo create ridebuddy --public --source=. --remote=origin --push

#   b) Or manually: create an empty repo on github.com, then:
git remote add origin https://github.com/<your-username>/ridebuddy.git
git branch -M main
git push -u origin main
```

### 3. Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new) → **Import** your GitHub repo.
2. **Framework preset** is auto-detected as Next.js — leave it.
3. Open **Environment Variables** and add:

   | Key                        | Value                                                                |
   | -------------------------- | -------------------------------------------------------------------- |
   | `DATABASE_URL`             | Neon pooled connection string                                        |
   | `DIRECT_URL`               | Neon direct connection string                                        |
   | `NEXTAUTH_URL`             | `https://<your-project>.vercel.app`                                  |
   | `NEXTAUTH_SECRET`          | Run `openssl rand -base64 32` and paste the output                   |
   | `NEXT_PUBLIC_APP_NAME`     | `RideBuddy`                                                          |
   | `APP_URL`                  | `https://<your-project>.vercel.app`                                  |
   | `RAZORPAY_KEY_ID`          | _(optional — leave blank for mock payments)_                         |
   | `RAZORPAY_KEY_SECRET`      | _(optional)_                                                         |
   | `NEXT_PUBLIC_RAZORPAY_KEY_ID` | _(optional, same as `RAZORPAY_KEY_ID`)_                           |

4. Click **Deploy**. The build runs `prisma generate && prisma db push` to sync the schema, then `next build`.

### 4. Add Vercel Blob (for KYC + vehicle uploads)

1. After the first deploy, open your project on Vercel → **Storage** tab → **Create Database** → **Blob**.
2. Click **Connect**. Vercel automatically injects `BLOB_READ_WRITE_TOKEN` into your env.
3. Trigger a redeploy (push any commit, or use the **Redeploy** button) so the new env var is picked up.

Until Blob is connected, file uploads will return an error in production. Local dev keeps using `./public/uploads/`.

### 5. Make yourself an admin

After signing up on the live site, flip your account to admin so you can review KYC + vehicles. From your local machine:

```bash
# In .env, point DATABASE_URL at your production Neon URL
npx prisma studio
# In Studio: User table → find your row → set isAdmin = true → save
```

Then open `https://<your-project>.vercel.app/admin`.

---

## Useful scripts

| Command              | What it does                                         |
| -------------------- | ---------------------------------------------------- |
| `npm run dev`        | Local dev server                                     |
| `npm run build`      | Production build (runs `prisma generate` first)      |
| `npm run db:push`    | Sync schema to DB (no migration files — fast)        |
| `npm run db:migrate` | Create + apply a versioned migration                 |
| `npm run db:deploy`  | Apply existing migrations (used in CI/CD)            |
| `npm run db:seed`    | Seed demo users + rides                              |
| `npm run db:studio`  | Open Prisma Studio in your browser                   |

---

## Production hardening checklist

- [ ] Strong `NEXTAUTH_SECRET` (32+ random chars).
- [ ] Real Razorpay live keys — replace test keys, switch off mock mode.
- [ ] Replace OSRM public demo with your own self-hosted instance or a paid routing provider (Mapbox, Google) — the demo has rate limits.
- [ ] Move from `prisma db push` to versioned migrations (`prisma migrate dev` locally, `prisma migrate deploy` in CI).
- [ ] Add real SMS provider for phone OTP (Twilio / MSG91).
- [ ] Add monitoring (Sentry / LogRocket / Vercel Analytics).
- [ ] Tighten image `remotePatterns` in `next.config.mjs` to only the hostnames you actually serve.
- [ ] Set up a cron (Vercel Cron) to mark stale rides as `COMPLETED` if the driver forgets.

---

## License

MIT
