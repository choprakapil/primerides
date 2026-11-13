# Prime Rides Layout Guidelines & Responsive Architecture

## 1. Container Widths & Margins

- **Maximum Container Width**: `max-w-7xl` (`1280px`).
- **Horizontal Container Padding**:
  - Mobile (`<640px`): `px-4` (16px)
  - Tablet (`640px - 1024px`): `px-6` (24px)
  - Desktop (`>1024px`): `px-8` (32px)
- **Navbar Clearance**:
  - `pt-28` (`112px`) on mobile/tablet.
  - `pt-32` (`128px`) on desktop.
  - Ensures the fixed navbar (height ~70-85px) never clips the breadcrumbs, vehicle badges, or title.

---

## 2. Desktop Two-Column Layout Ratio

The primary vehicle detail workspace uses a 12-column CSS grid:

```
[========================== 12 Columns ==========================]
[------- 7 Columns (58.3%) -------] [----- 5 Columns (41.7%) -----]
Left: Gallery, Specs, Overview,     Right: Sticky Booking Widget
      Inclusions, Policy Matrix            (top-28 sm:top-32)
```

- **Gap**: `gap-8` (32px) desktop, `gap-6` (24px) tablet.
- **Top Alignment**: Left column showcase card and Right column booking card share the identical top `y` coordinate. Neither card may protrude above the other.
- **Sticky Behavior**: Right column has `sticky top-28 sm:top-32 self-start` so it follows the user through specs and overview exploration.

---

## 3. Responsive Breakpoints

| Breakpoint | Width Range | Layout Rules |
|---|---|---|
| Mobile (`xs` / `sm`) | `< 640px` | Single-column stack. Full-width images with snap thumbnail track. Booking card follows below gallery & specs. Sticky is disabled. |
| Tablet (`md` / `lg`) | `640px - 1024px` | 2-column or stacked grid. 4-column spec grid collapses to 2x2. |
| Desktop (`xl`) | `1024px - 1440px` | 7:5 two-column grid. Sticky booking card enabled. Full 4-column spec grid. |
| Large Desktop (`2xl`)| `> 1440px` | Centered `max-w-7xl` container with balanced margins. |

