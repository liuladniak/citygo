# CityGo — Travel Booking Platform

A production-ready full-stack travel booking platform for city tours. CityGo consists of three interconnected systems: a customer-facing booking app, an internal admin dashboard, and a shared Node.js/PostgreSQL backend — all deployed via Docker on a VPS with GitHub Actions CI/CD.

---

## 🌐 Live

| App             | URL                                                                        |
| --------------- | -------------------------------------------------------------------------- |
| Client App      | [citygo.liuladniak.com](https://citygo.liuladniak.com)                     |
| Admin Dashboard | [citygo-dashboard.liuladniak.com](https://citygo-dashboard.liuladniak.com) |
| Staging         | [staging.citygo.liuladniak.com](https://staging.citygo.liuladniak.com)     |

---

## 🏗️ Architecture

```text
citygo/
├── client/          # React customer-facing app
├── dashboard/       # React + TypeScript admin panel
├── server/          # Node.js + Express shared backend
├── ai-service/      # Python/FastAPI + Gemini
├── notifications/   # TypeScript notifications microservice
└── qa/              # Test documentation and QA assets
```

Four separate deployments on a single VPS, managed with Docker Compose. GitHub Actions CI/CD runs on a self-hosted runner — pushes to `develop` deploy to staging, pushes to `main` deploy to production.

---

## ✨ Client App Features

- **Supabase Authentication** — login, signup, password reset, booking history per account
- **Tour Browsing** — server-side filtering by category, activity level, keyword search with pagination
- **Availability System** — rolling booking window, tour-level and agency-level blocked dates and recurring days
- **Stripe Payments** — Payment Intents, webhook-driven booking creation, multi-currency support
- **Shopping Cart** — multi-tour cart with Redux persistence, contact details collection, two-step checkout
- **Interactive Map** — Leaflet map with tour itinerary waypoints and Istanbul landmarks
- **Travel Guide** — editorial article system with categories, author profiles, related articles
- **Multi-Currency** — live exchange rates with real-time price conversion
- **Manage Bookings** — authenticated users view current and past bookings matched by user ID and email
- **Responsive Design** — mobile-first SCSS with a consistent design token system

---

## 📈 Admin Dashboard Features

- **Role-Based Access Control** — admin / manager / associate tiers via Supabase Auth, route guards and field-level permissions
- **Booking Management** — full lifecycle (draft → pending → confirmed → completed → cancelled), payment recording, guest manifest
- **Multi-Step Booking Creation** — 5-step guided form: type, tour & date, guests, payment, guide assignment
- **Availability Management** — interactive availability calendar with visual blocked dates and agent override capability
- **Guide Assignment** — assign staff with roles (lead, assistant, driver), availability by date, booking counts
- **Payment Tracking** — record payments, track balance due, full payment history per booking
- **Email Notifications** — Brevo transactional emails: confirmation, 24h reminders (cron), cancellation, guide assignment
- **Tour Management** — full CRUD: details, images via Supabase Storage, time slots, itinerary, availability
- **Analytics** — booking volume, revenue, occupancy trends (manager+ only)
- **Activity Log** — per-tour and per-booking timeline of all changes
- **Auto Task Generation** — cron-based operational tasks from upcoming bookings

---

## 🛠️ Tech Stack

### Client

`React` `Redux Toolkit` `React Router v6` `SCSS` `Stripe.js` `Leaflet` `Axios`

### Dashboard

`React` `TypeScript` `TanStack Query` `shadcn/ui` `Tailwind CSS`

### Server

`Node.js` `Express` `Knex.js` `PostgreSQL` `Supabase` `Stripe` `Brevo` `node-cron` `JWT`

### AI Service

`Python` `FastAPI` `Gemini-2.5-flash`

### Notifications Service

`TypeScript` `BullMQ` `Redis` `Nodemailer`

### Infrastructure

`Docker` `Docker Compose` `GitHub Actions` `Hostinger VPS` `Supabase Storage`

### Observability

`Prometheus` `Grafana` `Loki` `Promtail`

### Testing

`Playwright` `Postman`

---

## 🧪 Quality & Testing

CityGo follows a structured QA approach documented in the [`/qa`](./qa) folder.

**Test documentation:**

- [Test Plan](./qa/test-plan.md) — testing strategy, scope, and environment overview
- [Smoke Test Checklist](./qa/checklists/smoke-test.md) — run after every deployment
- [Test Cases](./qa/test-cases/) — structured step-by-step scenarios for critical flows
- [Bug Reports](./qa/bug-reports/) — defect reports following standard severity/lifecycle format

**Testing approach:**

- Manual exploratory testing on staging before every production release
- Smoke test checklist executed after each deployment
- API endpoint validation via Postman collection
- E2E automation with Playwright covering critical user journeys (booking flow, auth, tour browsing)
- Automated tests run in GitHub Actions CI/CD pipeline on every push

**Defects are tracked via [GitHub Issues](https://github.com/liuladniak/citygo/issues)** following the standard defect lifecycle: New → Assigned → Open → Fixed → Retesting → Closed.

---

## 🚀 CI/CD & Deployment

- `develop` branch → auto-deploys to **staging**
- `main` branch → auto-deploys to **production**
- Self-hosted GitHub Actions runner on VPS — no SSH timeout issues from rotating IPs
- Docker Compose manages all services including Prometheus, Grafana, Loki observability stack
- Smoke test checklist run manually after each production deployment

---

## 🤖 In Progress

- **Milo** — AI-powered chat assistant built with FastAPI and Python, integrated into the client app to help users find tours and navigate the booking process
- **Drizzle ORM migration** — migrating from Knex.js to Drizzle for full TypeScript type safety on database queries
- **TypeScript migration** — incrementally migrating server from JavaScript to TypeScript
- **Playwright E2E tests** — automated test suite in progress

---

## Project Setup

Instructions coming soon
