# Prime Rides Visual QA & Functional Regression Checklist

## 1. Viewport Coverage Matrix

| Viewport Category | Resolution | Verification Target |
|---|---|---|
| **Large Desktop** | `1920 × 1080` | Layout centering, max container width (1280px), ambient gradient, whitespace rhythm |
| **Standard Desktop** | `1440 × 900` | 7:5 two-column proportion, sticky booking card alignment, gallery controls |
| **Tablet Landscape** | `1024 × 768` | Sticky panel transition, spec grid 4-column vs 2x2 wrapping, breadcrumb wrapping |
| **Tablet Portrait** | `768 × 1024` | Single-column stack, booking card positioning below specs, no horizontal overflow |
| **Mobile Pro** | `390 × 844` | Header clearance, gallery swipe track, package card tap targets (min 44px), sticky CTA |
| **Mobile Standard** | `375 × 812` | Font readability, touch targets, modal dialogues, input readability |

---

## 2. Visual QA Criteria

- [ ] **Navbar Clearance**: Header does not clip or overlap the breadcrumb or car title.
- [ ] **Baseline Alignment**: Showcase gallery top edge and booking panel top edge are horizontally flush on desktop.
- [ ] **Card Symmetry**: Spec cards maintain equal heights and internal padding across all columns.
- [ ] **Label Collisions**: Package selector header and extra KM rate badge never collide or truncate.
- [ ] **Typography Contrast**: All text satisfies WCAG AA contrast (minimum 4.5:1 for body, 3:1 for headings).
- [ ] **Zero Redundant Names**: Vehicle titles do not repeat brand name (e.g. no `Rolls Royce Rolls Royce Cullinan`).
- [ ] **Restrained Polish**: No unstyled alert boxes, awkward border clashes, or raw unrounded elements.

---

## 3. Functional Regression Criteria

- [ ] **Gallery Navigation**: Clicking prev/next or thumbnails updates active image without jump or layout shift.
- [ ] **Package Selection**: Toggling between 300 km, 450 km, 600 km, and Monthly updates prices instantly.
- [ ] **Booking Redirection**: Clicking "Sign In to Select Package & Book" opens auth flow with proper return URL.
- [ ] **Date Validations**: Pickup and return date pickers reject past dates or invalid schedules.
- [ ] **Coupon Verification**: Promo coupon input applies discounts dynamically if applicable.

