# PrimeRides Admin Panel — Authoritative Homepage Luxury Design System

**Document Identifier:** `docs/ADMIN_UI_DESIGN_SYSTEM.md`  
**Last Updated:** September 9, 2026  
**Status:** Authoritative Foundation (Homepage Luxury Parity Enforced)  
**Reference Surface:** PrimeRides Public Homepage (`http://localhost:3000/`)

---

## 1. Core Visual Mandate: Homepage Luxury Parity

The PrimeRides Admin Panel adopts the authentic luxury mobility aesthetic of the public homepage:
- **Card Geometry:** Exact match to `.modern-car-card` and `.location-city-card` (`border-radius: 20px`, pure white or high-contrast dark surface, soft slate border `1px solid rgba(226, 232, 240, 0.9)`).
- **Equal 4-Sided Spacing:** Cards, stat tiles, and operational surfaces strictly enforce equal margins/padding on all 4 sides (top, right, bottom, left: `p-5` 20px or `p-6` 24px).
- **Double-Layer Golden Hover Elevation:** Interactive cards micro-lift (`translateY(-2px)`) and display the signature double-layer gold glow: `0 16px 36px rgba(15, 23, 42, 0.09), 0 0 0 1.5px rgba(197, 155, 39, 0.38)`.
- **Continuous Capsule Pills:** All buttons (`AdminButton`), status filter bars (`.admin-pill-bar`), search bars, and tags use continuous capsule pills (`borderRadius: 9999px`).
- **Curated Color Harmony:** Deep slates (`#090e1a`, `#0f172a`, `#111827`), radiant champagne golds (`#c59b27`, `#d8a834`, `#f7d58b`, `#b88d22`), and architectural white (`#ffffff`).

---

## 2. Design Tokens (`src/app/globals.css`)

### 2.1. Layout Dimensions
```css
--admin-sidebar-width: 248px;
--admin-sidebar-collapsed-width: 72px;
--admin-header-height: 60px;
--admin-page-max-width: 1440px;
--admin-page-padding: 32px;
--admin-page-padding-mobile: 16px;
```

### 2.2. Spacing Scale (Equal 4-Sided Rhythm)
```css
--admin-space-1: 4px;   /* Micro gaps, icon spacing */
--admin-space-2: 8px;   /* Inline gaps, element margins */
--admin-space-3: 12px;  /* Compact inner tile padding */
--admin-space-4: 16px;  /* Standard mobile container padding */
--admin-space-5: 20px;  /* Equal 4-sided card padding (mobile/tablet) */
--admin-space-6: 24px;  /* Equal 4-sided card padding (desktop) */
--admin-space-8: 32px;  /* Major page header & grid separations */
```

### 2.3. Radii Scale
```css
--admin-radius-card: 20px;     /* Authoritative card radius (AdminCard, AdminStat, TableContainer) */
--admin-radius-pill: 9999px;   /* Authoritative pill radius (AdminButton, AdminPillBar, Badges) */
--admin-radius-input: 12px;    /* Form inputs and interactive select containers */
--admin-radius-tile: 10px;     /* Icon presentation boxes */
```

### 2.4. Shadow Hierarchy & Hover Glow
```css
--admin-shadow-card: 0 4px 20px rgba(15, 23, 42, 0.04);
--admin-shadow-card-hover: 0 16px 36px rgba(15, 23, 42, 0.09), 0 0 0 1.5px rgba(197, 155, 39, 0.38);
--admin-shadow-gold-btn: 0 4px 14px rgba(197, 155, 39, 0.32);
--admin-shadow-gold-btn-hover: 0 8px 24px rgba(197, 155, 39, 0.45);
```

---

## 3. Canonical Primitives Guide (`@/components/admin/ui`)

### `AdminCard` (`src/components/admin/ui/AdminCard.tsx`)
- Standard luxury card container.
- Always renders with `style={{ borderRadius: "20px" }}` and `p-5 sm:p-6`.
- Supports `variant="default"` (pure white), `variant="dark"` (high-contrast slate gradient), `variant="gold-glow"`.

### `AdminButton` (`src/components/admin/ui/AdminButton.tsx`)
- Always renders with `style={{ borderRadius: "9999px" }}`.
- Variants:
  - `primary`: Champagne gold gradient (`#d8a834` → `#c59b27` → `#b88d22`)
  - `secondary`: Clean white outline with slate border, turns gold on hover
  - `vip`: Dark slate `#111827`, turns gold on hover
  - `success`: Emerald gradient
  - `danger`: Red border with red fill on hover
  - `ghost`: Transparent hover

### `AdminStat` (`src/components/admin/ui/AdminStat.tsx`)
- Equal 4-sided padding (`p-5`).
- 20px radius with double-layered gold hover elevation.
- Bold typography with `font-heading font-black text-[#090e1a]`.

### `AdminBadge` (`src/components/admin/ui/AdminBadge.tsx`)
- Strictly 22px height (`h-[22px]`) and 10.5px bold text (`text-[10.5px]`).
- Includes `glass` (dark glassmorphic) and `gold` (amber gold eyebrow) variants.

### `AdminTable` (`src/components/admin/ui/AdminTable.tsx`)
- `TableContainer` enclosed in a 20px radius card with internal horizontal scroll.
- Row density standardized at 54px with soft hover tint.

---

## 4. Continuity & Future Implementations

Every new admin route, component, or redesign must import canonical primitives from `@/components/admin/ui` and adhere to the tokens defined in this document and in `docs/memory/DESIGN_SYSTEM.md`.
