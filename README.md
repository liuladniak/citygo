# CityGo — Travel Booking Platform

A production-ready full-stack travel booking platform for city tours. CityGo consists of three interconnected systems: a customer-facing booking app, an internal admin dashboard, and a shared Node.js/PostgreSQL backend — all deployed via Docker on a VPS with GitHub Actions CI/CD.

---

## 🌐 Live

| App | URL |
|-----|-----|
| Client App | [citygo.liuladniak.com](https://citygo.liuladniak.com) |
| Admin Dashboard | [citygo-dashboard.liuladniak.com](https://citygo-dashboard.liuladniak.com) |

---

## 🏗️ Architecture

```text
citygo/
├── client/       # React customer-facing app
├── dashboard/    # React + TypeScript admin panel
├── server/       # Node.js + Express shared backend
└── ai-service/   # Python/FastAPI + Gemini
```
Four separate deployments on a single VPS, managed with Dokploy and Docker. Each service has its own GitHub Actions workflow triggered on push to `main`.

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

### Infrastructure
`Docker` `Dokploy` `GitHub Actions` `Hostinger VPS` `Supabase Storage`

---

## 🤖 In Progress

**Milo** — an AI-powered chat assistant built with FastAPI and Python, integrated into the client app to help users find tours and navigate the booking process.

---

## Project Setup 
Instructions are comming soon
