# CityGo — QA Documentation

## Overview

This folder contains quality assurance documentation for CityGo,
a production tour booking platform for Istanbul city experiences.

## Structure

- `/test-plan.md` — overall testing strategy and scope
- `/test-cases/` — structured test cases for key user flows
- `/bug-reports/` — defect reports following standard bug report format
- `/checklists/` — smoke test and regression checklists

## Testing Approach

CityGo uses a multi-layer testing strategy:

- **Manual exploratory testing** — unscripted testing of key flows
- **Structured test cases** — documented step-by-step test scenarios
- **API testing** — endpoint validation using Postman and automated tests
- **E2E automation** — Playwright tests covering critical user journeys
- **CI/CD integration** — automated tests run on every push via GitHub Actions

## Tools

- Bug tracking: GitHub Issues
- API testing: Postman
- E2E automation: Playwright
- CI/CD: GitHub Actions

## Coverage Areas

- Booking flow (create, pay, confirm, cancel)
- Authentication (email/password, Google OAuth)
- Tour browsing and filtering
- Review submission
- Admin dashboard operations
