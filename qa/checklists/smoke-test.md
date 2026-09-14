# CityGo — Smoke Test Checklist

**Purpose:** Quick verification that core functionality is alive after every deployment.  
**Duration:** ~10 minutes  
**When to run:** After every production or staging deployment  
**Environment:** Run on both desktop and mobile

---

## How to use this checklist

Mark each item as:

- ✅ Pass
- ❌ Fail — create a bug report in `/bug-reports/`
- ⚠️ Partial — works but with issues, note below

---

## 1. Application Load

| #   | Check                       | Expected                    | Result | Notes |
| --- | --------------------------- | --------------------------- | ------ | ----- |
| 1.1 | Homepage loads              | Page renders without errors |        |       |
| 1.2 | No console errors on load   | Browser console is clean    |        |       |
| 1.3 | Logo and navigation visible | Header renders correctly    |        |       |
| 1.4 | Page loads within 3 seconds | No long white screen        |        |       |

---

## 2. Navigation

| #   | Check              | Expected               | Result | Notes |
| --- | ------------------ | ---------------------- | ------ | ----- |
| 2.1 | Tours page loads   | Tour cards are visible |        |       |
| 2.2 | About page loads   | Page renders correctly |        |       |
| 2.3 | Contact page loads | Form is visible        |        |       |
| 2.4 | Careers page loads | Positions are listed   |        |       |
| 2.5 | Travel Guide loads | Articles are visible   |        |       |

---

## 3. Authentication

| #   | Check                          | Expected                       | Result | Notes |
| --- | ------------------------------ | ------------------------------ | ------ | ----- |
| 3.1 | Login page loads               | Form is visible                |        |       |
| 3.2 | Login with valid credentials   | Redirects to account page      |        |       |
| 3.3 | Login with invalid credentials | Error message shown            |        |       |
| 3.4 | Google OAuth button visible    | Button renders on login page   |        |       |
| 3.5 | Logout works                   | User is logged out, redirected |        |       |
| 3.6 | Register page loads            | Registration form visible      |        |       |

---

## 4. Tours

| #   | Check                              | Expected                              | Result | Notes |
| --- | ---------------------------------- | ------------------------------------- | ------ | ----- |
| 4.1 | Tours list loads                   | At least one tour card visible        |        |       |
| 4.2 | Tour cards show name, price, image | All card elements render              |        |       |
| 4.3 | Category filter works              | Filtered results update               |        |       |
| 4.4 | Search works                       | Results match search term             |        |       |
| 4.5 | Tour detail page loads             | Full tour info visible                |        |       |
| 4.6 | Tour images load                   | Gallery renders without broken images |        |       |
| 4.7 | Tour map renders                   | Map section visible on detail page    |        |       |

---

## 5. Booking Flow

| #   | Check                             | Expected                          | Result | Notes |
| --- | --------------------------------- | --------------------------------- | ------ | ----- |
| 5.1 | Booking form visible on tour page | Form renders for logged in user   |        |       |
| 5.2 | Date picker opens                 | Calendar is interactive           |        |       |
| 5.3 | Guest count can be changed        | Adults/children inputs work       |        |       |
| 5.4 | Price updates with guest count    | Total price recalculates          |        |       |
| 5.5 | Form validation works             | Empty required fields show errors |        |       |
| 5.6 | Stripe payment form loads         | Card input fields visible         |        |       |

---

## 6. API Health

| #   | Check                             | Expected                                | Result | Notes |
| --- | --------------------------------- | --------------------------------------- | ------ | ----- |
| 6.1 | GET /api/tours returns data       | 200 response with tours array           |        |       |
| 6.2 | GET /api/tours/:slug returns tour | 200 response with tour data             |        |       |
| 6.3 | GET /api/articles returns data    | 200 response with articles              |        |       |
| 6.4 | Auth endpoint responds            | /auth/profile returns 401 without token |        |       |

---

## 7. Mobile (run on real device or DevTools mobile emulation)

| #   | Check                         | Expected                            | Result | Notes |
| --- | ----------------------------- | ----------------------------------- | ------ | ----- |
| 7.1 | Homepage renders on mobile    | No horizontal scroll, layout intact |        |       |
| 7.2 | Navigation hamburger works    | Mobile menu opens and closes        |        |       |
| 7.3 | Tours page renders on mobile  | Cards stack correctly               |        |       |
| 7.4 | Tour detail page readable     | Text legible, images load           |        |       |
| 7.5 | Booking form usable on mobile | Inputs accessible, no overflow      |        |       |

---

## 8. Infrastructure

| #   | Check                          | Expected                              | Result | Notes |
| --- | ------------------------------ | ------------------------------------- | ------ | ----- |
| 8.1 | SSL certificate valid          | HTTPS padlock shown in browser        |        |       |
| 8.2 | Staging environment accessible | staging.citygo.liuladniak.com loads   |        |       |
| 8.3 | No mixed content warnings      | Console shows no HTTP on HTTPS errors |        |       |

---

## Run Log

| Date | Environment | Tester | Result | Notes |
| ---- | ----------- | ------ | ------ | ----- |
|      | Production  |        |        |       |
|      | Staging     |        |        |       |

---

## Failed Items

List any failed checks here with bug report reference:

| Check ID | Description | Bug Report |
| -------- | ----------- | ---------- |
|          |             |            |
