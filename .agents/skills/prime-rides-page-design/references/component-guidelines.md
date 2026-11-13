# Prime Rides Component Guidelines

## 1. Showcase Gallery (`CarGallery.tsx`)

- **Stage Dimensions**: Height `280px` (`h-70`) on mobile, `420px` (`h-[420px]`) on desktop.
- **Glassmorphic Micro-Badges**:
  - `Prime Certified Clean` top-left with gold sparkle icon.
  - Photo Counter (`1 / N`) top-right in semi-transparent dark obsidian.
  - `100% Commercial Insurance` bottom-right in soft white glass.
- **Navigation Controls**: Left/Right circular buttons (`w-10 h-10`), white background, shadow-lg, hidden on mobile touch unless hovered, always accessible via keyboard arrows.
- **Thumbnails**: 4-column snap track. Active thumbnail has `border-2 border-[#c59b27] ring-2 ring-[#c59b27]/30`.

---

## 2. Specification Cards Matrix

- **4 Balanced Units**: Seating, Transmission/Drive, Fuel Type, Engine Horsepower.
- **Structure**:
  - Top: Icon inside soft rounded box (`w-6 h-6 bg-amber-50 text-amber-700`) + Uppercase Label.
  - Middle: Primary Value in large bold text (`text-base font-extrabold text-[#090e1a]`).
  - Bottom: Concise luxury descriptor (e.g. `VIP Chauffeur Ready`, `Effortless AT`, `Full Tank Handover`, `563 HP V12 Twin-Turbo`).
- **Equal Heights**: Grid cards have identical height and padding (`p-4`).

---

## 3. Booking Engine Panel (`CarBookingCard.tsx`)

- **Surface**: Pure white card with `p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-[0_15px_45px_rgba(0,0,0,0.06)]`.
- **Package Selection Cards**:
  - Unselected: `bg-slate-50/80 border border-slate-200/90 hover:border-amber-300 hover:bg-white`.
  - Selected: `bg-[#fdfaf2] border-2 border-[#c59b27] shadow-sm shadow-amber-500/10`.
  - Content: Package Name + Price + Free KMs included.
- **Extra KM Badge**: Distinct pill badge `Extra KM: ₹X/km` in gold tint with its own border, preventing text collision with package headers.
- **CTA Button**: `.modern-card-btn` with gold gradient (`linear-gradient(135deg, #c59b27 0%, #dfb743 100%)`), minimum height `50px`, bold white text, hover translateY(-2px), and right arrow icon.

