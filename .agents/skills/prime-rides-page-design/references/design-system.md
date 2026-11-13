# Prime Rides Luxury Design System Specification

## 1. Color Palette Tokens

| Token | Hex Value | Semantic Usage |
|---|---|---|
| `--color-primary` | `#c59b27` | Signature Prime Gold, active borders, primary button gradient start, star rating icons |
| `--color-primary-light` | `#dfb743` | Gold gradient end, interactive button hover state |
| `--color-primary-soft` | `#f7d58b` | Soft champagne gold for badges, dark-glass highlights |
| `--color-primary-tint` | `#fdfaf2` | Soft warm gold card background for active package selections |
| `--color-primary-border` | `rgba(197, 155, 39, 0.35)` | Subtle gold border for badges and highlight containers |
| `--color-secondary` | `#090e1a` | Deep obsidian midnight black for brand badges, hero text, and VIP containers |
| `--color-text-heading` | `#090e1a` | High-contrast dark obsidian for vehicle names, section titles, and prices |
| `--color-text-body` | `#334155` | Slate 700 for body copy, vehicle overview dossiers |
| `--color-text-muted` | `#64748b` | Slate 500 for secondary labels, included features, metadata |
| `--color-text-subtle` | `#94a3b8` | Slate 400 for sub-captions, timestamps, breadcrumbs |
| `--color-bg-canvas` | `#f8fafc` | Slate 50 soft luxury canvas |
| `--color-bg-surface` | `#ffffff` | Pure white for cards, galleries, and booking modules |
| `--color-border-subtle` | `#e2e8f0` | Slate 200 standard card border |
| `--color-success` | `#059669` | Emerald 600 for verified ticks, available inventory indicator |
| `--color-success-bg` | `#ecfdf5` | Emerald 50 for availability badges and confirmed status |

---

## 2. Spatial Rhythm (8px Base Scale)

All margins, paddings, and component heights align to an 8px grid:

| Rhythm | Rem / Px Value | Usage |
|---|---|---|
| `space-1` | `0.25rem` / `4px` | Micro-gap between icons and adjacent text |
| `space-2` | `0.5rem` / `8px` | Badge internal vertical padding, tight item spacing |
| `space-3` | `0.75rem` / `12px` | Input internal padding, card micro-padding |
| `space-4` | `1rem` / `16px` | Grid gap between spec cards, small component spacing |
| `space-6` | `1.5rem` / `24px` | Standard card internal padding, two-column column gap |
| `space-8` | `2rem` / `32px` | Section gap, header-to-content separation, card padding desktop |
| `space-12` | `3rem` / `48px` | Inter-section vertical rhythm |
| `space-16` | `4rem` / `64px` | Major section top/bottom padding |

---

## 3. Border Radius & Elevation Scale

- **Badges & Pills**: `rounded-full` (`9999px`)
- **Buttons**: `rounded-2xl` (`16px`) or `rounded-full` (`30px`) for `.modern-card-btn`
- **Spec & Policy Units**: `rounded-2xl` (`16px`)
- **Main Showcase & Booking Panels**: `rounded-3xl` (`24px`)
- **Shadow Standards**:
  - `shadow-xs`: `0 1px 2px rgba(0, 0, 0, 0.05)`
  - `shadow-md`: `0 4px 14px rgba(197, 155, 39, 0.15)`
  - `shadow-card`: `0 12px 40px rgba(0, 0, 0, 0.05)` (diffuse luxury ambient glow)
  - `shadow-btn`: `0 4px 14px rgba(197, 155, 39, 0.35)`

