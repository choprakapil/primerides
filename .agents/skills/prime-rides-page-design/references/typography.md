# Prime Rides Typography Specification

## 1. Typeface Architecture

- **Primary Heading Font**: `'Outfit'`, `'Instrument Sans'`, sans-serif. Used for car names, section titles, numbers, prices.
- **Primary Body Font**: `'Plus Jakarta Sans'`, sans-serif. Used for vehicle descriptions, feature labels, policies, and booking form inputs.

---

## 2. Scale & Hierarchy

| Element | Class / Token | Size / Line-Height | Weight | Color |
|---|---|---|---|---|
| **Page H1 (Car Title)** | `text-3xl sm:text-4xl` | `32px - 40px / 1.15` | `font-extrabold` (800) | `#090e1a` |
| **Section H2 (Overview)** | `text-base sm:text-lg` | `18px - 20px / 1.3` | `font-bold` (700) | `#090e1a` |
| **Section Subhead H3** | `text-xs uppercase` | `12px / 1.4` | `font-bold` (700) | `#334155` |
| **Hero Price Display** | `text-3xl font-black` | `30px - 36px / 1.1` | `font-black` (900) | `#090e1a` |
| **Price Package Sub-label**| `text-xs font-semibold` | `12px / 1.3` | `font-semibold` (600) | `#64748b` |
| **Spec Card Value** | `text-base font-extrabold` | `16px / 1.2` | `font-extrabold` (800)| `#090e1a` |
| **Spec Card Label** | `text-xs font-semibold` | `12px / 1.3` | `font-semibold` (600) | `#64748b` |
| **Body Paragraph** | `text-xs sm:text-sm` | `13px - 14px / 1.6` | `font-normal` (400) | `#475569` |
| **Micro Badges / Pills** | `text-[10px] sm:text-[11px]`| `10px - 11px / 1.2` | `font-bold` (700) | Contextual |
| **CTA Button Text** | `text-sm sm:text-base` | `14px - 15px / 1` | `font-bold` (700) | `#ffffff` |

---

## 3. Formatting Rules

1. **Eliminate Brand Concatenation Stutter**: If `car.name` already begins with `car.brand` (e.g. `Rolls Royce Cullinan`), do not format as `${car.brand} ${car.name}`.
2. **Indian Currency Representation**: Always format prices with commas: `₹${Number(amount).toLocaleString("en-IN")}`.
3. **No Mixed Cases in Micro-Labels**: Use strict uppercase tracking for category pills and metadata tags (`uppercase tracking-wider`).

