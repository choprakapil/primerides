# PrimeRides Design Tokens (Redesigned Architecture)

**Authoritative Design Tokens for PrimeRides & Redesigned Surfaces.**

This project uses a dual-domain design system:
1. **Public Website Frontend (`/`, `/cars`, `/about`, `/contact`, `/blogs`, etc.)**: Preserves the signature luxury gold and dark obsidian aesthetic (`#c59b27`, `#090e1a`, `.modern-car-card`, `Plus Jakarta Sans` / `Outfit`).
2. **Dashboard & Operations Surfaces (Admin Panel `/admin/*` and Customer Portal `/account/*`)**: Uses the **Nexlink CRM Dashboard Theme** (`#5955D1` primary indigo, `#29294B` dark navy, `#F4F6FA` body canvas, structured 16px card border radius, clean 10px button radius, soft pastel badge pills, `'Instrument Sans'` font, and structured element padding).

---

## 1. Dashboard & Operations Design Tokens (Nexlink Theme)

### Color Palette
```
--theme-primary:           #5955D1   /* Nexlink Brand Indigo */
--theme-primary-hover:     #4743BA   /* Deepened Indigo */
--theme-primary-subtle:    #EEEDFC   /* Soft Indigo Tint for Active States / Pills */
--theme-primary-border:    #D2D0F7   /* Border for active elements */
--theme-secondary:         #29294B   /* Deep Dark Navy */

--theme-bg-body:           #F4F6FA   /* Main canvas background */
--theme-bg-surface:        #FFFFFF   /* Card & container surface */
--theme-bg-subtle:         #F8FAFC   /* Input & subtle strip background */

--theme-border:            #E8EDF2   /* Standard card & container border */
--theme-border-subtle:     #F1F3F7   /* Divider and row border */

--theme-text-heading:      #1C274C   /* Primary dark text for headings & numbers */
--theme-text-body:         #495057   /* Readable body copy */
--theme-text-muted:        #7E8B9B   /* Secondary & metadata text */

--theme-success:           #009966   /* Emerald green */
--theme-success-subtle:    #E6F5F0   /* Soft emerald badge background */
--theme-warning:           #F5A70D   /* Amber warning */
--theme-warning-subtle:    #FEF6E7   /* Soft amber badge background */
--theme-danger:            #F83636   /* Crimson danger */
--theme-danger-subtle:     #FEEBEB   /* Soft crimson badge background */
--theme-info:              #7008E7   /* Purple info */
--theme-info-subtle:       #F1E6FD   /* Soft purple badge background */
```

### Structured Geometry & Spacing (Nexlink Scale)
```
Card Border Radius:        16px (1rem)
Button Border Radius:      10px (0.625rem)
Badge Border Radius:       9999px (Full pill)
Input Border Radius:       10px (0.625rem)
Internal Card Padding:     20px mobile / 24px desktop
Table Header Padding:      12px 16px
Table Cell Padding:        14px 16px
Shadow Subtle:             0 4px 12px rgba(2, 2, 76, 0.03)
Shadow Elevated:           0 8px 24px rgba(2, 2, 76, 0.06)
Typography Font:           'Instrument Sans', 'Plus Jakarta Sans', sans-serif
```

---

## 2. Public Website Design Tokens (Intact Luxury Theme)

```
primary:           #c59b27   /* Prime Gold 500 */
primary-hover:     #b88d22   /* Prime Gold 600 */
secondary:         #090e1a   /* Deep Midnight Obsidian */
surface-light:     #f8fafc   /* Light Canvas */
card-surface:      #ffffff   /* Pure White */
card-radius:       20px      /* Luxury 20px radius */
font-heading:      'Outfit', sans-serif
font-body:         'Plus Jakarta Sans', sans-serif
```
