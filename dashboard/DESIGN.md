# CityGo dashboard design guide

The single source of truth for how the staff dashboard looks and reads. If a page
disagrees with this file, the page is wrong (or this file needs a deliberate edit
in the same PR). Tokens live in `src/App.css`; shared pieces are named below.

Principles, in order:

1. **Consistent beats clever.** Reuse a token or component before inventing a value.
2. **Readable first.** Body text is never smaller than 12px, contrast is AA, and
   colour never carries meaning alone.
3. **Phone first.** Every page works at 360px with no horizontal page scroll.
4. **Light and dark from one source.** Only theme tokens, so both modes work.

---

## 1. Typography

Font: **Inter** (variable, self-hosted). Numbers in tables use tabular figures.

### Scale

Small sizes are fixed so they stay aligned; larger sizes grow smoothly between
360px and 1440px viewports (`clamp()` in `App.css`).

| Token | Size | Line height | Use for |
|---|---|---|---|
| `text-xs` | 12px | 18px | Badges, captions, table meta, timestamps. **The floor.** |
| `text-sm` | 14px | 22px | **Default UI text**: table cells, form labels, buttons, descriptions. |
| `text-base` | 15–16px | 24px | Panel titles, long-form text, emphasised values. |
| `text-lg` | 17–18px | 26px | Section headings (use `section-title`). |
| `text-xl` | 18–20px | 28px | Rare: dialog or empty-state headline. |
| `text-2xl` | 22–28px | 1.2 | Page titles (use `page-title`) and KPI numbers. |
| `text-3xl` | 26–34px | 1.15 | Hero numbers only (a tour price, one big stat). |

### Roles (use the utility, not the raw size)

| Role | Class | Notes |
|---|---|---|
| Page title | `page-title` | One `<h1>` per page. 2xl, weight 650, tight tracking. |
| Page subtitle | `page-description` | One line under the title, muted `text-sm`. |
| Section heading | `section-title` | A heading for a block of the page that is not inside a `Panel`. |
| Panel title | built into `Panel` | `text-base font-semibold`. Do not restyle it. |
| Body | `text-sm` | Default. Do not add the class when the parent already sets it. |
| Caption / meta | `text-xs text-muted-foreground` | Reference numbers, dates under names. |
| Label | `text-sm text-muted-foreground` | Inside `DetailRow`; form labels use the `Label` component. |
| Money and counts | `tabular` (or inside a table) | Format money with `formatMoney()` from `lib/utils`. |

### Weights

`font-normal` 400 for text, `font-medium` 500 for labels, names and buttons,
`font-semibold` 600 for headings and key values. Avoid `font-bold` (the page title
already has its own weight).

### Rules

- Never `text-[10px]`, `text-[11px]` or other arbitrary sizes. If 12px feels too
  big for a design, the design is too dense.
- Never hand-pick `text-xl font-bold` for a heading. Use the role utilities.
- Sentence case everywhere ("Add booking", not "Add Booking").
- Lines of prose stay under about 75 characters (`max-w-prose`).

---

## 2. Colour

Only theme tokens. No raw palette classes (`text-emerald-700`, `bg-gray-100`) and
no hex values in `.tsx` files.

### Surfaces and text

| Token | Use |
|---|---|
| `background` / `foreground` | Page and default text. |
| `card` | Panels, cards, popovers. |
| `muted` / `muted-foreground` | Quiet fills, secondary text, placeholders. |
| `accent` | Hover and selected rows. |
| `border` / `input` | Hairlines and field borders. |
| `primary` | Main buttons (near-black in light, near-white in dark). |
| `destructive` | Destructive buttons only (Cancel booking, Delete). |
| `brand-primary` / `brand-secondary` | Logo and brand moments. Not for status. |
| `ring` | Focus outline. Never remove it. |

### Status tones

Each tone has a **solid** colour (dots, accent borders, calendar events, tinted
backgrounds like `bg-success/10`) and a **-foreground** colour for text on that
tint, tuned for AA contrast in both modes.

| Tone | Meaning | Booking status | Tokens |
|---|---|---|---|
| `success` | Done, healthy, paid | Confirmed; "Paid in full" | `success`, `success-foreground` |
| `warning` | Needs attention soon | Pending; balance due soon | `warning`, `warning-foreground` |
| `info` | Neutral progress | Completed | `info`, `info-foreground` |
| `danger` | Failed, cancelled, owed | Cancelled; amount due | `danger`, `danger-foreground` |
| neutral | No state yet | Draft | `muted`, `muted-foreground` |

`destructive` and `danger` are both red on purpose: `destructive` is for the
*action* you are about to take, `danger` is for the *state* something is in.

Booking statuses are defined once in `src/lib/status.ts` (`BOOKING_STATUS`,
`bookingStatus()`, and the `TONE_*` class maps). Never write another status map.
Show a status with `<StatusBadge status={...} />`.

### Rules

- A badge always has text and a dot. Colour alone is not enough.
- Positive money text: `text-success-foreground`. Money owed: `text-danger-foreground`.
- Charts use the `chart-1` … `chart-5` tokens.
- Check every change in light **and** dark.

---

## 3. Layout

### Page width and padding

Every page is a centred column. Use the same padding everywhere:
`mx-auto max-w-* px-4 py-6 sm:px-6 sm:py-8`.

| Page type | Width | Examples |
|---|---|---|
| Lists, calendars, overviews | `max-w-7xl` | Bookings, Schedule, Analytics |
| Detail pages | `max-w-6xl` | Booking details |
| Forms | `max-w-4xl` | Add or edit a tour, add booking |
| Settings and narrow pages | `max-w-3xl` | Settings |

Vertical rhythm between blocks on a page is `space-y-6`. Header to first block is
the same `space-y-6`.

### Spacing scale

Use Tailwind's 4px steps. Common values: `gap-2` (8) between icon and label,
`gap-3` (12) inside rows, `gap-4` (16) between fields, `gap-6` (24) between blocks.
Panel padding is `px-4 sm:px-5`. Avoid one-off values like `p-[7px]`.

### Breakpoints

Design at 360px, then add `sm` (640), `md` (768), `lg` (1024). The sidebar becomes
a drawer below `md`. Wide tables scroll **inside their own box**, never the page.
Tab bars scroll horizontally on phones.

### Shape and depth

| Element | Radius |
|---|---|
| Buttons, inputs, selects | `rounded-md` |
| List items, small cards | `rounded-lg` |
| Panels, cards, dialogs | `rounded-xl` |
| Badges, avatars | `rounded-full` |

Depth comes from a 1px `border`, not shadows. `shadow-xs` on fields and
`shadow-sm` on a card you can click are fine. `shadow-lg` is for floating layers
(menus, dialogs) and comes from the component. Do not add other shadow levels.

---

## 4. Components

Build from these before writing markup.

| Need | Use | Where |
|---|---|---|
| Titled section on a page | `Panel` | `components/DetailPanel.tsx` |
| Label and value rows | `DetailList` + `DetailRow` | same |
| Booking status | `StatusBadge` | `components/StatusBadge.tsx` |
| Buttons | `Button` with a `variant` and `size` | `components/ui/button.tsx` |
| Back link | `BackButton` | `components/ui/BackButton.tsx` |
| Toasts | `toast` from `sonner` | |
| Loading | `Skeleton` shaped like the content | `components/ui/skeleton.tsx` |

Standards:

- **Buttons:** one primary action per page header. Everything else is `outline`
  or in a "More" menu. Set height with `size`, never with `h-*`.
- **Destructive actions** (cancel, delete) always open a confirmation dialog, and
  the button text says what happens ("Cancel booking").
- **Every action gives feedback:** a toast on success or failure, or a visible
  state change.
- **Loading:** a skeleton with the same layout as the page. Not "Loading…" text.
- **Empty:** an icon, one line saying what is missing, and the action that fixes it.
- **Error:** say what went wrong and what to do. No apologies, no vague "Something
  went wrong".
- **Customer text** (names, notes, emails) is untrusted: render as plain text; HTML
  built by hand must be escaped with `escapeDeep` from `lib/utils`.

### Page templates

**List page:** header (title, subtitle, one primary action) → filters row →
table or cards → pagination. Table scrolls inside its box on phones.

**Detail page** (start from `pages/BookingDetails.tsx`): breadcrumb → header with
title, `StatusBadge`, one primary action and a "More" menu → summary strip →
`Panel`s in a two-column grid on `lg`, one column below.

**Form page:** header → grouped fields in `Panel`s → sticky or bottom action row
with `Save changes` and a secondary `Cancel`.

---

## 5. Copy

- Buttons start with a verb: "Save changes", "Confirm booking", "Send reminder".
- The same action keeps the same name everywhere: the button "Send reminder" gives
  the toast "Reminder sent".
- Name things the way staff say them, not how the system is built.
- Numbers: euros via `formatMoney()`. Dates are `YYYY-MM-DD` strings; display them
  with `formatDate()`; never compare with `setHours`.

---

## 6. Accessibility checklist

- Text contrast AA (4.5:1 body, 3:1 large). Use `-foreground` tone tokens for text.
- Visible focus on every control (keep `ring`).
- Touch targets: at least 40px on phones for primary actions.
- Icon-only buttons have `aria-label`.
- Colour is never the only signal (badges carry text and a dot).
- Motion only to show what changed, and respects `prefers-reduced-motion`.

---

## 7. Review checklist (use before opening a UI PR)

- [ ] No `text-[...]` sizes, no hand-picked heading sizes
- [ ] No raw palette colours or hex values; status colours from `lib/status.ts`
- [ ] Page width and padding match section 3
- [ ] Built from `Panel`, `StatusBadge`, `Button` sizes, not custom markup
- [ ] Skeleton, empty and error states exist
- [ ] 360px: no horizontal page scroll; tables scroll in their own box
- [ ] Looks right in light and dark
- [ ] Copy is sentence case and verb-first

---

## 8. Where the code does not match yet

Measured when this guide was written. Each page is migrated in its own PR; fix the
items below when you touch a file.

| Gap | Count / where |
|---|---|
| Arbitrary text sizes (`text-[10px]`, `[11px]`, `[0.8rem]`) | 34 uses |
| Raw palette colours in `.tsx` | about 280 classes, 30 hex values (payment text, "Today" label, Tours status, Team, MiloReview, Analytics) |
| Hand-picked heading sizes | AddBooking (7), Guests (4), others |
| Pages without the standard width and padding | Dashboard, Guests, Team, Tasks, Tours, AddBooking |
| Titled sections built with `Card` instead of `Panel` | 7 files (migrate per page, see section 9) |
| "Loading…" text instead of skeletons | 5 places |
| Shadow levels beyond the rule above | 6 levels in use |

Planned, not built yet:

- A `PageShell` component (title, subtitle, actions, standard width) so the
  page header and padding come from one place.
- A `/styleguide` page that renders every size, tone, button and panel.
- A lint rule that flags arbitrary text sizes, raw palette colours and hex values.

## 9. Decisions

- **Touch targets:** controls are 40px high on touch screens and keep the compact
  36px on mouse screens. This is done with the `pointer-coarse:` variant in
  `components/ui/button.tsx`, not with screen width, so a tablet gets the larger
  targets too. Never set a button height by hand. (Decided; the `Button` change
  ships in its own PR.)
- **`Card` vs `Panel`:** `Panel` is the standard for any titled section. `Card`
  stays only as a low-level shadcn primitive for stat tiles and clickable cards.
  There is no mass migration: switch a page when you touch it, and the page
  migrations in section 8 include it.
