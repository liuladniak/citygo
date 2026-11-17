# CityGo public site design guide

The single source of truth for how the visitor-facing site looks and reads. It
describes the look the site already has (Poppins, teal and maroon, warm yellow
call-to-action, generous round corners) and fixes the places where pages drift.
The staff dashboard has its own guide (`dashboard/DESIGN.md`) and is allowed to
look different: this site is a marketing and booking experience, the dashboard is
a work tool.

Tokens live in `src/styles/partials/_variables.scss`. Sizes are in `rem` on a
**10px root** (`1.6rem` = 16px).

Principles, in order:

1. **One system per site.** Reuse a token before writing a value.
2. **Warm and easy to read.** Body text is never below 12px; contrast is AA.
3. **Phone first.** Most visitors arrive on a phone. Every page works at 365px.
4. **Photography leads.** Tour imagery and the hero video carry the page; the
   interface stays quiet around them.

---

## 1. Typography

Font: **Poppins** (self-hosted via `@fontsource/poppins`, weights 400–700).
Stack: `$font-main`. Never write a font stack by hand.

### Scale (target)

Ten steps. Every `font-size` in SCSS must be one of these (the four hero-only
display sizes below are the only exception).

| Token | Size | Use for |
|---|---|---|
| `$fs-xs` | 1.2rem (12px) | Captions, badges, fine print. **The floor.** |
| `$fs-sm` | 1.4rem (14px) | Buttons, form labels, card meta, dense UI text. |
| `$fs-md` | 1.6rem (16px) | **Body text**, inputs, card titles. |
| `$fs-lg` | 1.8rem (18px) | Lead paragraphs, small headings. |
| `$fs-xl` | 2rem (20px) | Card and panel headings (h4). |
| `$fs-2xl` | 2.4rem (24px) | Section sub-headings (h3). |
| `$fs-3xl` | 2.8rem (28px) | Large sub-headings on desktop. |
| `$fs-4xl` | 3.2rem (32px) | Section headings (h2). |
| `$fs-5xl` | 4rem (40px) | Page titles (h1) on tour and content pages. |
| `$fs-6xl` | 4.8rem (48px) | Hero headline on small desktops. |

### Display sizes (hero only)

Four extra tokens exist for the Home hero and nothing else. Do not use them for
ordinary headings.

| Token | Size | Use for |
|---|---|---|
| `$fs-display-sm` | 5.4rem (54px) | Hero headline |
| `$fs-display-md` | 6.4rem (64px) | Hero stat number, phones |
| `$fs-display-lg` | 7.2rem (72px) | Hero stat number, tablet |
| `$fs-display-xl` | 9.6rem (96px) | Hero stat number, desktop |

### Weights

400 body, 500 labels, 600 names and sub-headings, 700 headings and buttons that
carry the action. Avoid 800.

### Snap table (how today's 29 sizes map to the scale)

| Today | Becomes |
|---|---|
| 1.0, 1.1rem | `$fs-xs` (1.2rem) |
| 1.25, 1.3rem | `$fs-sm` (1.4rem) |
| 1.5rem | `$fs-md` (1.6rem), or `$fs-sm` in dense cards |
| 1.7rem | `$fs-lg` |
| 2.1, 2.2rem | `$fs-xl` or `$fs-2xl` (pick by role) |
| 2.6rem | `$fs-2xl` or `$fs-3xl` |
| 3.0, 3.4, 3.6rem | `$fs-4xl` |
| 4.4rem and up | `$fs-5xl`, `$fs-6xl` or the hero clamp |

### Roles

| Role | Size | Weight |
|---|---|---|
| Page title (h1) | `$fs-2xl` on phones, `$fs-4xl` from tablet, `$fs-5xl` from desktop (as on Tours, About and Cart) | 700 |
| Detail-page title (h1 that is a long name, such as a tour) | `$fs-xl` on phones, `$fs-3xl` from tablet, `$fs-4xl` from desktop (as on Tour details) | 700 |
| Section heading (h2) | `heading-2` mixin: `$fs-2xl`, `$fs-3xl` from tablet, `$fs-4xl` from desktop | 700 |
| Sub-heading (h3) | `$fs-2xl` (mobile `$fs-xl`) | 600 |
| Card and panel title | `$fs-md` or `$fs-xl` | 600–700 |
| Body | `$fs-md` | 400 |
| Buttons | `$fs-sm` (call-to-action `$fs-md`) | 600–700 |
| Caption | `$fs-xs` | 400–500 |

### Rules

- Set the size once per element; do not restyle the same heading on each page.
- **Section headings (h2) use `@include heading-2`** (`styles/partials/_mixins.scss`):
  24px on phones, 28px from tablet, 32px from desktop, weight 700. Do not write
  those sizes by hand; add margins and colour next to the include.
- Prose lines stay under about 70 characters.
- Sentence case for headings and buttons.

---

## 2. Colour

Only the tokens below. No new hex values in component SCSS.

### Brand and surfaces

| Token | Value | Use |
|---|---|---|
| `$main-teal` | #1e556d | Brand colour, page backdrop, headings on light, links. |
| `$main-maroon` | #9c110d | Brand accent: prices, emphasis, logo. Use sparingly. |
| `$accent-4` / `$accent-4--hover` | #f5c518 / #e0a10b | **The call-to-action colour.** Reserved for "Book" and "Explore". |
| `$charcoal` | #2c2c2c | Default text. |
| `$main-white`, `$off-white`, `$warm-gray` | #fff, #f9f9f9, #f4f2ef | Surfaces and alternating section backgrounds. |
| `$supportive-1`, `$supportive-2`, `$supportive-4` | soft cream, soft teal, soft blue | Tinted panels and highlights. |
| `$success` | #378712 | Success text and confirmation. |

Category tints `$guided`, `$culinary`, `$experiences` are for tour-category chips
only, with `$guided-text`, `$culinary-text` and `$experiences-text` for the text
on them.

### Notice banners

Messages inside a page (a warning, an error, a confirmation) use these tokens and
no other tints. Each notice has a text, so colour is never the only signal.

| Notice | Background | Border | Text |
|---|---|---|---|
| Warning (disclaimers, "try again" prompts) | `$warning-bg` | `$warning-border` | `$warning-text` |
| Error (payment or pricing failed) | `$danger-bg` | `$danger-border` | `$danger-text` |
| Success (payment confirmed) | `$success-bg` | none | `$success` |

Booking status badges (`BookingStatus`) use the same tones: pending is warning,
confirmed is success (`$success-bg`, `$success-border`, `$success-text`), denied and
cancelled are danger, and anything else (completed) is neutral grey.

Short messages under a field or form (newsletter, login, contact) are text only:
`$success-text` for confirmations and `$error-text` for errors, both AA on white.

### Neutrals (to add)

Greys are currently hard-coded about 230 times. Add this ramp and replace the
raw values:

| Token | Value | Replaces | Use |
|---|---|---|---|
| `$gray-100` | #f3f4f6 | #f3f4f6, #f0f0f0, #f9fafb | Subtle fills |
| `$gray-200` | #e5e7eb | #e5e7eb, #e0e0e0, #e2e8f0 | Borders, dividers |
| `$gray-300` | #d1d5db | #d1d5db, #ccc | Empty rating stars, borders of small round controls |
| `$gray-400` | #9ca3af | #9ca3af, #94a3b8 | Placeholders, disabled |
| `$gray-500` | #6b7280 | #6b7280 | Secondary text (AA on white) |
| `$gray-600` | #4b5563 | #4b5563 | Strong secondary text |

### Rules

- One call-to-action colour per screen area. Do not use yellow for anything else.
- Error red is `#ef4444` (used in Login and Help & Contact today); add it as `$danger` and use it for form errors and danger text.
- Text on teal is white; text on yellow is charcoal.
- Pure black (`#000`) is allowed as the backdrop behind photos (image gallery and
  full-screen viewer) and nowhere else. The modal overlay (`rgba(0,0,0,.75)`) and
  the text shadow on `.btn--category` (white text on the hero video) are the same
  kind of exception: they exist to separate content from a photo or page behind it.
- Never convey meaning by colour alone (errors also get text and an icon).

---

## 3. Layout

### Width and spacing

- Content max width: `$max-width` (123.4rem). Page gutters: `$space-x-small` on
  phones, `$space-small` from tablet up.
- Vertical rhythm between page sections: `$space-large` (5rem) on desktop,
  `$space-medium` on phones.
- Between blocks inside a section: `$space-medium` or `$space-small`.
- Inside components use multiples of 0.4rem. Avoid one-off values like `1.7rem`.

### Breakpoints

Mobile first, with the mixins only (`@include tablet { … }`). No hand-written
`@media (max-width: …)`.

| Mixin | Min width |
|---|---|
| (base) | 0 to 364px |
| `mobile-s` | 365px |
| `mobile-m` | 480px |
| `tablet` | 768px |
| `desktop-s` | 1025px |
| `desktop` | 1281px |
| `desktop-xl` | 1441px |

### Shape and depth

| Element | Radius |
|---|---|
| Small controls, tags | 0.8rem |
| Cards, buttons, inputs, modals | `$border-radius` (1.6rem) |
| Hero and large feature containers | `$border-radius-main` (3rem) |
| Pills, avatars | full (`10rem` or `50%`) |

Three shadows, plus one for fixed bottom bars:

| Token | Value | Use |
|---|---|---|
| `$shadow-card` | `0 2px 10px rgba(0,0,0,.1)` | Resting cards |
| `$shadow-raised` | `0 8px 24px rgba(0,0,0,.12)` | Hover, dropdowns, modals |
| `$focus-ring` | `0 0 0 3px rgba(30,85,109,.25)` | Keyboard focus |
| `$shadow-bar` | `0 -4px 12px rgba(0,0,0,.08)` | Bars fixed to the bottom of the screen (`MobileBookingBar`, cookie banner) |

A bar fixed to the bottom of the screen casts its shadow upward, which the card and
raised shadows cannot express, so it has its own token. A thin divider under in-flow
bars (the tour tab bar) is a `$gray-200` border, not a shadow. A form field that
removes its outline (the newsletter pill) shows `$focus-ring` on the wrapper with
`:focus-within` instead. A toggle knob keeps its small `0 1px 3px` shadow so it reads
on a grey track.

---

## 4. Components

Build from these before writing new markup.

| Need | Use |
|---|---|
| Buttons | `Button` (`components/Button`): `.btn`, `--cta` (yellow), plus the existing variants. Height 4rem (40px) for every variant, including `--cancel`. Resting shadow is `$shadow-card`; outline buttons use a `$gray-200` or `$gray-300` border. Add a variant only when no existing one fits, and use tokens in it. |
| Tour card | `TourCard` |
| Modal | `Modal`: dimmed overlay, a 40px round close button (a real `button` with `aria-label`), closes on Escape and on a click outside. Content brings its own background. |
| Inputs and selects | `Input`, `CustomSelect` |
| Loading | `LoadingSceleton`, `Loader`, `PageLoader` |
| Icons | `UI/Icon` |
| Images and video | `VideoComponent` (poster and lazy), `loading="lazy"` on images |

Standards:

- **One call-to-action per view**, in `$accent-4`. Secondary actions are outline
  or text buttons.
- **Touch targets** at least 40px high (the standard button already is).
- **Loading:** skeletons shaped like the content for lists and cards; a spinner
  only for a button in flight.
- **Empty and error states:** say what happened and what to do next.
- **Images:** always sized to avoid layout shift; hero uses the poster image.
- **Forms:** label above field, errors under the field in `$danger`, never only a
  red border.

### Page templates

- **Tour listing:** page title → filters → grid of `TourCard`s.
- **Tour detail:** gallery → title and price → booking form (sticky on desktop,
  bottom bar on phones) → itinerary, reviews.
- **Account and booking pages:** narrow centred column (about 80rem), `Tabs`.
- **Content pages** (Privacy, Cookies, Help): one centred column, h1 then sections.

---

## 5. Copy

- Warm, plain, second person ("Pick your date", not "Select date").
- Buttons start with a verb; "Book now" is the only call-to-action wording.
- Prices as `€120`; dates written out ("Mon 16 Nov 2026"). Dates in code are
  `YYYY-MM-DD` strings.

---

## 6. Accessibility checklist

- Contrast AA (4.5:1 body, 3:1 large). `$gray-500` is the lightest allowed text
  grey on white.
- Visible keyboard focus on every control (`$focus-ring`). Never `outline: none`
  without a replacement (11 places remove it today; check each has one).
- Interactive images and icon buttons have `aria-label` or alt text.
- Respect `prefers-reduced-motion` for the hero video and animations.
- Body text never below 12px; the root size must scale with the browser setting
  (see section 8).

---

## 7. Review checklist (before opening a client UI PR)

- [ ] Every `font-size` is a `$fs-*` token
- [ ] No new hex values; greys from the `$gray-*` ramp
- [ ] Breakpoints via mixins only
- [ ] One call-to-action per view, in `$accent-4`
- [ ] Radius and shadow from the lists above
- [ ] Checked at 365px, 768px and 1281px
- [ ] Skeleton, empty and error states exist
- [ ] Copy is warm, plain and verb-first

---

## 8. Where the code does not match yet

Measured when this guide was written. Each item is its own PR; fix them when you
touch a file.

| Gap | Count |
|---|---|
| Font sizes not yet on a `$fs-*` token (target: 0) | 42 declarations, 11 raw values |
| Text below 12px (`1rem`, `1.1rem`) | 9 uses |
| Hex colours in component SCSS (target: tokens only) | 30 distinct, 64 uses |
| Box-shadow declarations not on a shadow token (target 0) | 22 uses, 17 distinct variants |
| Grey text lighter than `$gray-500` (fails AA on white) | up to 25 uses of `$gray-400` (placeholders and icons are allowed) |
| Hand-written `@media (max-width: …)` instead of mixins | 15 (`MiloChat`, `Signup`, `HelpContact`) |
| Root size fixed at `10px`, which ignores the visitor's browser font setting | `html { font-size: 10px }`; use `62.5%` (same default, scales with settings) |
| Roboto `@font-face` rules that no longer resolve (the build warns) and unused font files | `_typography.scss`, `assets/fonts/static/Roboto` |

Counts are of live SCSS (comment lines excluded, `_variables.scss` excluded), last
measured after the Booking migration. The tokens exist and the exact matches are
swapped in. What remains needs a visual decision per page: snapping odd sizes
(`1.3rem`, `1.5rem`, …) onto the scale, and the leftover greys and shadows.

Order of work: tokens are done, and **Home, Tours, Tour details, Booking, Destinations,
Wishlist, Profile, Manage bookings, About, Careers, Experience, Custom itinerary,
Cookie policy, Article and Travel guide are migrated, and so are the shared `Button` and
`Modal`, the header, the footer, the newsletter block and the cookie banner** (Tours
includes `TourCard`, the filters, `CustomSelect` and the tour skeleton card; Tour
details includes the booking form, mobile booking bar, gallery, reviews, star rating
and Why Us; Booking is the cart, checkout form, order summary and cart item card;
Destinations includes the testimonials block; Profile includes the tabs and field
styles; Manage bookings includes the booking status badge). Next: Help & Contact, Login,
the Milo chat widget and the smaller components (review form, date picker, stats), then
the Roboto and root-size cleanups. Each page is its own PR with before and after screenshots
at 365px, 768px and 1281px.

## 9. Decisions

- **Different from the dashboard on purpose.** The site uses Poppins, rounder
  corners and a warm palette; the dashboard uses Inter and compact work-tool
  styling. Each follows its own guide. Only the brand teal and maroon are shared.
- **No dark mode** for the public site for now.
