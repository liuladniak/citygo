# CityGo — Test Plan

## 1. Introduction

This test plan describes the testing strategy, scope, and approach for CityGo —
a production tour booking platform for Istanbul city experiences built with
React, Node.js/Express, PostgreSQL, and deployed on a Linux VPS.

## 2. Objectives

- Verify that all core user flows work correctly end to end
- Identify defects before they reach end users
- Ensure the application is stable across different browsers and devices
- Validate API endpoints return correct data and handle errors gracefully
- Confirm payment processing works reliably

## 3. Scope

### In scope

- User authentication (email/password, Google OAuth)
- Tour browsing, filtering, and search
- Tour detail page
- Booking flow (guest details, date/time selection, payment)
- Review submission
- User account management
- Contact form
- Admin dashboard — booking management, tour management
- REST API endpoints
- Mobile responsiveness

### Out of scope

- Performance/load testing
- Security penetration testing
- Third-party services (Stripe internals, Supabase internals, Google OAuth internals)
- Browser versions older than 2 years

## 4. Test Levels

| Level              | Description                      | Tools              |
| ------------------ | -------------------------------- | ------------------ |
| Manual exploratory | Unscripted testing of user flows | Browser DevTools   |
| Structured manual  | Step-by-step test cases          | This documentation |
| API testing        | Endpoint validation              | Postman            |
| E2E automation     | Critical path automation         | Playwright         |
| CI/CD              | Automated on every push          | GitHub Actions     |

## 5. Test Types

| Type        | When                   | Focus                          |
| ----------- | ---------------------- | ------------------------------ |
| Smoke       | After every deployment | Core flows alive               |
| Functional  | New features           | Feature works as expected      |
| Regression  | After bug fixes        | Fix didn't break anything else |
| Exploratory | Ongoing                | Find unexpected issues         |

## 6. Features to Test

### Critical (P1) — must work at all times

- User can register and log in
- User can browse and view tours
- User can complete a booking and payment
- Admin can view and manage bookings

### High (P2) — important but not blocking

- Tour filtering and search works correctly
- Review submission works for eligible users
- Email confirmations are sent after booking
- User can cancel a booking

### Medium (P3) — standard functionality

- Contact form submits successfully
- Wishlist add/remove works
- Currency conversion displays correctly
- Mobile layout renders correctly

### Low (P4) — nice to have

- Cookie consent banner works
- AI chat (Milo) responds to queries
- Social sharing links work

## 7. Test Environment

| Environment | URL                                   | Purpose             |
| ----------- | ------------------------------------- | ------------------- |
| Production  | https://citygo.liuladniak.com         | Live user traffic   |
| Staging     | https://staging.citygo.liuladniak.com | Pre-release testing |
| Local       | http://localhost:5173                 | Development testing |

## 8. Entry and Exit Criteria

### Entry criteria (when to start testing)

- Feature is deployed to staging
- No critical bugs blocking testing
- Test environment is accessible

### Exit criteria (when testing is complete)

- All P1 and P2 test cases passed
- No open Critical or High severity bugs
- Smoke test passes on production after deployment

## 9. Bug Severity Definition

| Severity | Definition                                  | Example                                        |
| -------- | ------------------------------------------- | ---------------------------------------------- |
| Critical | App crash, data loss, payment broken        | Stripe payment fails for all users             |
| High     | Major feature broken, no workaround         | Booking form cannot be submitted               |
| Medium   | Feature partially broken, workaround exists | Filter shows wrong count but tours are correct |
| Low      | Cosmetic issue, minor inconvenience         | Button slightly misaligned on iPad             |

## 10. Test Deliverables

- Test plan (this document)
- Test cases — `/test-cases/`
- Bug reports — `/bug-reports/`
- Smoke test checklist — `/checklists/smoke-test.md`
- Playwright automated test suite — `/client/e2e/`
- API test collection — Postman collection exported to `/qa/postman/`
