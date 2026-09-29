[STATE]

# PrimeRides Admin Design System & Homepage Luxury Architecture Specification

This document is the **single authoritative specification** for the visual identity, tokens, component primitives, spacing, borders, and layout geometry of the PrimeRides Admin Panel. It directly translates the **PrimeRides Public Homepage (`http://localhost:3000/`) Luxury Design Language** into a scalable, high-efficiency enterprise operations console.

All current and future admin pages, components, modals, tables, and controls must strictly follow this document.

---

## 1. Homepage Luxury Aesthetic DNA

The PrimeRides homepage establishes a world-class luxury mobility aesthetic characterized by:
1. **Curated Color Harmony:** Deep high-contrast slates (`#090e1a`, `#0f172a`, `#111827`) paired with radiant champagne golds (`#c59b27`, `#d8a834`, `#f7d58b`, `#b88d22`) and clean architectural white surfaces (`#ffffff`).
2. **Double-Layered Golden Hover Elevation:** Cards and interactive elements react to hover with a micro-lift (`translateY(-2px)`) and a signature double-layer glow (`box-shadow: 0 16px 36px rgba(15, 23, 42, 0.09), 0 0 0 1.5px rgba(197, 155, 39, 0.38)`).
3. **Capsule Pill Shapes:** All action buttons, filter bars, search inputs, and status badges use continuous, unbreakable capsule pill geometry (`borderRadius: 9999px`).
4. **Equal 4-Sided Internal Spacing:** Cards and operational containers strictly enforce equal padding on all four sides (`20px` to `24px`: `p-5 sm:p-6`), eliminating cramped, asymmetrical layouts.
5. **Modern Typography:** Bold, high-character headings (`Outfit`, font-weights 800–900 / `font-black`) paired with crystal-clear sans body text (`Plus Jakarta Sans`, font-weights 500–700).

---

## 2. Design Tokens & Palette (`src/app/globals.css`)

```css
:root {
  /* Brand Luxury Palette */
  --lux-gold-primary: #c59b27;
  --lux-gold-light: #f7d58b;
  --lux-gold-dark: #8d6910;
  --lux-gold-gradient: linear-gradient(135deg, #d8a834 0%, #c59b27 50%, #b88d22 100%);
  --lux-gold-gradient-hover: linear-gradient(135deg, #e5b94f 0%, #d8a834 50%, #c59b27 100%);
  
  /* High-Contrast Surfaces */
  --lux-dark-surface: #090e1a;
  --lux-dark-glass: rgba(17, 24, 39, 0.85);
  --lux-surface-white: #ffffff;
  --lux-surface-muted: #f8fafc;
  --lux-surface-slate: #f1f5f9;

  /* Card Geometry */
  --lux-card-radius: 20px;
  --lux-card-border: 1px solid rgba(226, 232, 240, 0.9);
  --lux-card-shadow: 0 4px 20px rgba(15, 23, 42, 0.04);
  --lux-card-hover-shadow: 0 16px 36px rgba(15, 23, 42, 0.09), 0 0 0 1.5px rgba(197, 155, 39, 0.38);

  /* Button Geometry */
  --lux-button-pill: 9999px;
  --lux-button-gold-shadow: 0 4px 14px rgba(197, 155, 39, 0.32);
  --lux-button-gold-hover-shadow: 0 8px 24px rgba(197, 155, 39, 0.45);

  /* Shell Layout Dimensions */
  --admin-sidebar-width: 248px;
  --admin-sidebar-collapsed-width: 72px;
  --admin-header-height: 60px;
  --admin-page-max-width: 1440px;
  --admin-page-padding: 32px;
  --admin-page-padding-mobile: 16px;
}
```

---

## 3. Authoritative UI Primitives & Implementation Rules

### 1. Cards (`AdminCard.tsx` / `.admin-card-lux` / `.modern-car-card`)
- **Corner Radius:** Strictly `style={{ borderRadius: "20px" }}`.
- **Equal 4-Sided Spacing:** Default `p-5 sm:p-6` (20px on mobile, 24px on desktop). Top, right, bottom, and left margins/paddings must be completely balanced.
- **Border:** `1px solid rgba(226, 232, 240, 0.9)` (soft slate).
- **Hover Motion:** `hover:-translate-y-0.5 transition-all duration-300`.
- **Hover Shadow:** `0 16px 36px rgba(15, 23, 42, 0.09), 0 0 0 1.5px rgba(197, 155, 39, 0.38)`.
- **Variants Supported:**
  - `default`: Crisp pure white (`#ffffff`)
  - `dark`: High-contrast luxury dark gradient (`#090e1a` to `#1e293b`) with gold border
  - `gold-glow`: Warm champagne gold border with subtle ambient backlight glow

### 2. Buttons (`AdminButton.tsx` / `.admin-btn`)
All buttons strictly use `style={{ borderRadius: "9999px" }}` to prevent WebKit/Chromium float overflow bugs:
- **`primary` (Champagne Gold):**
  - Background: `linear-gradient(135deg, #d8a834 0%, #c59b27 50%, #b88d22 100%)`
  - Hover: `linear-gradient(135deg, #e5b94f 0%, #d8a834 50%, #c59b27 100%)`
  - Shadow: `0 4px 14px rgba(197, 155, 39, 0.32)` (hover `0 8px 22px rgba(197, 155, 39, 0.45)`)
  - Text: White bold, uppercase or tracking-normal
- **`secondary` (White Outline):**
  - Background: `#ffffff`, Border: `1.5px solid #cbd5e1`, Text: `#090e1a`
  - Hover: `border-color: #c59b27; color: #c59b27; background: #fdfaf2; shadow: 0 4px 14px rgba(197, 155, 39, 0.18)`
- **`vip` (Dark High-Contrast):**
  - Background: `#111827`, Text: `#ffffff`
  - Hover: `background: linear-gradient(135deg, #d8a834 0%, #c59b27 50%, #b88d22 100%); shadow: 0 8px 22px rgba(197, 155, 39, 0.45)`
- **`success` (Emerald Teal):**
  - Background: `linear-gradient(135deg, #10b981 0%, #059669 100%)`
  - Shadow: `0 4px 14px rgba(16, 185, 129, 0.28)`
- **`danger` (Red Accent):**
  - Background: White with `border-red-200 text-red-600`, hover to solid red with red glow.

### 3. Filter Bars & Pill Navigation (`.admin-pill-bar`)
- Container: Capsule pill (`borderRadius: "9999px"`), background `#f1f5f9`, border `1px solid #e2e8f0`, height `38px`–`42px`.
- Pills (`.admin-pill-btn`): Capsule pill with smooth transitions.
- **Active State (`.active`):** Champagne gold gradient (`from-[#d8a834] via-[#c59b27] to-[#b88d22]`), white text, soft gold glow `0 2px 10px rgba(197, 155, 39, 0.35)`.
- **Active White State (`.active-white`):** Crisp pure white `#ffffff`, shadow `0 2px 8px rgba(0, 0, 0, 0.08)`.

### 4. Stat Metric Tiles (`AdminStat.tsx`)
- Equal 4-sided internal spacing: `p-5` (20px top, right, bottom, left).
- Border radius: Strictly `borderRadius: "20px"`.
- Typography: Label `10.5px bold uppercase text-slate-500`, Value `font-heading text-2xl font-black text-[#090e1a]`.
- Icon Box: `w-8.5 h-8.5 rounded-xl` with gold or domain-specific border & background.
- Hover: `hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(15,23,42,0.08),0_0_0_1.5px_rgba(197,155,39,0.35)]`.

### 5. Badges (`AdminBadge.tsx`)
- Height: Strictly `h-[22px]`.
- Typography: Strictly `text-[10.5px] font-bold uppercase tracking-wider`.
- Variants:
  - `glass`: Dark glassmorphic capsule (`bg-[#0f172a]/85 text-[#f7d58b] border-white/10 backdrop-blur-md`)
  - `gold`: Amber gold pill (`bg-amber-500/10 text-[#a87e14] border-[#c59b27]/35`)
  - `brand`, `success`, `warning`, `danger`, `info`, `neutral`

### 6. Operational Tables (`AdminTable.tsx` / `TableContainer`)
- Enclosing Card: `borderRadius: "20px"`, `border: 1px solid rgba(226, 232, 240, 0.9)`, `shadow: 0 4px 20px rgba(15, 23, 42, 0.04)`.
- Header: `#f8fafc`, text uppercase bold `11px` tracking-wider.
- Row Density: Predictable `h-[54px]` comfortable height.
- Row Hover: Soft warm highlight (`hover:bg-[#fdfaf2]/70`) with smooth transition.

---

## 4. Verification Checklist for Future Pages

When creating or modifying any admin page, verify:
- [ ] **Radius:** Are all cards using `borderRadius: "20px"`?
- [ ] **Pills:** Do all buttons, filter bars, and badges have `borderRadius: "9999px"`?
- [ ] **Spacing:** Is padding equal on all 4 sides (`p-5` or `p-6`)? No asymmetrical cramping.
- [ ] **Hover:** Do cards have the signature double-layer gold hover elevation (`0 16px 36px rgba(15, 23, 42, 0.09), 0 0 0 1.5px rgba(197, 155, 39, 0.38)`)?
- [ ] **Gradients:** Are primary buttons using the exact champagne gold gradient (`#d8a834` → `#c59b27` → `#b88d22`)?
- [ ] **Typography:** Do metrics and titles use `font-heading font-black text-[#090e1a]`?
