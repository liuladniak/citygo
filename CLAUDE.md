# CityGo

Production tour-booking platform for Istanbul city tours. It is also the owner's main portfolio project, so code quality and a clear commit history matter.

## Apps
- `client/` – public site. React + Vite, SCSS, Redux Toolkit, Stripe.
- `dashboard/` – staff dashboard. React + TypeScript + Vite, shadcn/ui.
- `server/` – Express API (ES modules). Moving from JS to TS and from Knex to Drizzle, one file at a time. Postgres on Supabase, auth via Supabase.
- `ai-service/` – FastAPI service behind the Milo chat widget (Gemini).
- `notifications/` – BullMQ worker (TypeScript) that sends emails via Brevo SMTP.
- `scripts/seeder/` – Python seeder for dashboard demo data.

## Branches and deploys
- Work on a feature branch off `develop`, then open a PR into `develop`.
- Push to `develop` deploys **staging** (`/var/www/citygo-staging`, `docker-compose.staging.yml`).
- Merging `develop` into `main` deploys **production** (`/var/www/citygo`).
- Deploys run through GitHub Actions on a self-hosted runner on the VPS.
- Never push directly to `main`.

## Working rules
- **Push only when the owner says so.** Show the diff first.
- Staging first. Production only after the owner has checked staging.
- One step at a time. Do not bundle unrelated changes in one commit.
- The owner commits with single quotes: `git commit -m 'fix(cart): ...'`.
- Never put secrets in the repo. Env var names are fine, values are not.
- When a change makes a statement in this file untrue, propose the edit to this file in the same PR.

## Testing
Keep tests few and high-value. Do not aim for coverage numbers.
- Always test: money and price calculation, payment-intent rules, date handling, role and permission checks, and anything that can lose or corrupt data.
- Test pure logic that is easy to get wrong (for example keyword matching, rate limits, status flows).
- Skip: styling, thin wrappers around libraries, and one-off scripts.
- Add the tests in the same PR as the feature and run them before opening the PR.
- Tools: `vitest` in `client/` (`npm run test:run`), `vitest` in `server/` (`npm test`). The dashboard has no test runner yet.

## Run locally
- client: `cd client && npm run dev`
- dashboard: `cd dashboard && npm run dev`
- server: `cd server && npm run dev` (tsx watch; port comes from the `PORT` env var, default 8080)
- Env files: `.env` per app, and `.env.staging` on the VPS.

## Gotchas
- Staging client intentionally uses the production API, so production `ALLOWED_ORIGINS` must include the staging URL.
- `prometheus.yml` is a mounted file. A deploy does not always update it, so edit it on the VPS.
- The shared Docker network is `citygo-shared-network`. Recreating it can drop Nginx Proxy Manager's port bindings.
- The API trusts exactly one proxy hop (`trust proxy` = 1, Nginx Proxy Manager). If another proxy or CDN (for example Cloudflare) is ever put in front, update that number or rate limits and `req.ip` will be wrong.
- Nginx Proxy Manager needs Websockets Support turned on for any socket host.
- Milo conversations (what visitors type or tap, and Milo's replies) are saved, redacted, with 90-day retention, in `milo_messages` (one row per message; order by `id`, `role` is visitor, milo or agent). The table SQL is `server/db/sql/001_*`, `002_*` and `003_milo_conversations.sql`, applied in order by hand in the Supabase SQL editor. Drizzle's baseline snapshot is malformed, so `drizzle-kit generate` does not work yet. Replies come from the browser, so treat the data as untrusted when displaying it.
- Milo's AI fallback (`POST /api/ai/chat` to `ai-service` to Gemini) is OFF unless `AI_ENABLED=true` in the VPS `.env` (one `.env` serves `main-api` and `ai-service`). Daily caps: `AI_DAILY_LIMIT_PER_IP` (default 5) and `AI_DAILY_LIMIT_GLOBAL` (default 150), counted in Redis. Model comes from `GEMINI_MODEL`. Optional `AI_OWNER_KEY` (long random secret in the VPS `.env`) lets the owner skip the per-IP cap by setting `localStorage.milo_owner` in their own browser; the site-wide cap still applies. Keep billing OFF on the Google project (free tier cannot charge), and send nothing personal: free-tier content may be used by Google. Apply the `002` SQL before AI answers are logged.
- Milo human handoff: visitors ask for a person via `POST /api/milo/handoff` (3 per IP per hour, 30 per day) and chat over Socket.IO on the API host (`/socket.io`, so the API proxy host needs Websockets Support in Nginx Proxy Manager). Only a Supabase user whose `user_roles.role` is `admin` can connect as the agent. Requests nobody answers within 5 minutes become `missed`. Telegram only notifies (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, optional `MILO_AGENT_NAME`, `MILO_CONSOLE_URL`) and does nothing when unset. Tables: apply `server/db/sql/004_milo_handoff.sql` (visitor name and email are optional, kept 90 days).
- Milo console: the dashboard page `/milo` (sidebar item "Milo", admin only). The owner flips "Available" on to connect over Socket.IO with their Supabase token; visitors then see "Liu is online". It defaults to away, and the choice is remembered per browser. Sound is on by default (toggle on the page). Point `MILO_CONSOLE_URL` at `https://<dashboard-domain>/milo`. Visitor text is untrusted, so render it as plain text only.
- FAQ content lives in `client/src/data/faq.js`. It feeds both the Help & Contact page and Milo's typed-question matching (`miloMatch.js`). Edit answers and keywords there only.
- Roles come from the `user_roles` table (`requireRole` in `server/middleware/auth.js`). Never decide roles in the client.
- Dates are `YYYY-MM-DD` strings. Compare them as strings, not with `setHours`, because the VPS runs in UTC.

## Never
- No destructive seeder runs against real data. The seeder only touches rows with the seed email domain.
- No unauthenticated endpoints that issue sessions.
- No real customer data in logs, tests or screenshots.

## Roadmap
- Milo chat: guided FAQ chips first, then a rate-limited AI fallback, then a human handoff (Socket.IO + Telegram) with recorded transcripts.
- Finish the TS and Drizzle migration of server routes.
