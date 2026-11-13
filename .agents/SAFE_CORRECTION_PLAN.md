# 🛡️ PrimeRides Master Safe Correction Plan

**Step-by-Step Architectural Plan for CMS Design Fixes, Workflow Harmonization, Mobile Store Readiness & Infrastructure Hardening**  
*Document Version:* 1.0.0 | *Date:* September 30, 2026 | *Constraint:* Zero Regressions, Strict Homepage Lock, Zero Visual Drift

---

## 🧭 Plan Principles & Guardrails

1. **HOMEPAGE LOCK:** `src/app/page.tsx` and all 11 modular sections remain strictly locked visually. Any dynamic wiring must preserve exact pixel-perfect fidelity, typography, spacing, and CSS classes with resilient default fallbacks.
2. **THEME TOKEN INTEGRITY:** Luxury Gold (`#c59b27` / `#f7d58b`), deep slate/dark backgrounds (`#090e1a`), and crisp Bootstrap 5 containers. Zero rogue purple or lavender styles.
3. **ATOMIC IMPLEMENTATION:** Work on one task at a time. Each phase must be verified with `npm run check:all` (`tsc --noEmit` on web and mobile) with 0 errors.
4. **NO BREAKING CHANGES:** All APIs and data models retain complete backward compatibility.

---

## 📋 Phase Breakdown & Execution Roadmap

```
Phase 1: Admin CMS Theme Polish ──────► Phase 2: CMS Architecture Harmonization
         (Zero purple/lavender)                  (Sidebar & Hero sync)
                   │                                       │
                   ▼                                       ▼
Phase 3: Web Dynamic Wiring & Email ──► Phase 4: Mobile App Store Readiness
         (Reviews & Auto-Reply)                  (Camera Picker & Account Delete)
                   │                                       │
                   ▼                                       ▼
Phase 5: Hostinger DB Hardening ──────► Phase 6: Full Verification (0 Errors)
```

---

### 🎨 Phase 1: Admin CMS Theme Standardization & Design Polish

#### Problem Addressed:
Legacy purple badges (`bg-purple-100 text-purple-700`) and lavender pastel cards (`pastel-card-lavender`) remain in `header/page.tsx`, `homepage/page.tsx`, and `footer/page.tsx`. Synchronous browser `alert()` popups are used in `about/page.tsx` and `policies/page.tsx`.

#### Atomic Tasks:
- [ ] **`PLAN-CMS-01`: Standardize Header CMS Page (`src/app/admin/cms/header/page.tsx`)**
  - Line 265 & 268: Replace `pastel-card-lavender` and `bg-purple-100 text-purple-700` with `pastel-card-peach` and `bg-amber-100 text-amber-800`.
  - Line 512 & 547: Replace table card `pastel-card-lavender` with `pastel-card-peach`, and index badge `bg-purple-100 text-purple-700` with `bg-amber-100 text-amber-800`.
  - Line 1039 & 1042: Replace action button card `pastel-card-lavender` with `pastel-card-peach`, and icon `text-purple-700` with `text-amber-800`.
- [ ] **`PLAN-CMS-02`: Standardize Homepage CMS Page (`src/app/admin/cms/homepage/page.tsx`)**
  - Line 355 & 363: Replace `pastel-card-lavender` with `pastel-card-peach`, and "Live Section 1" badge `bg-purple-100 text-purple-700` with `bg-amber-100 text-amber-800`.
- [ ] **`PLAN-CMS-03`: Standardize Footer CMS Page (`src/app/admin/cms/footer/page.tsx`)**
  - Line 207 & 210: Replace `pastel-card-lavender` with `pastel-card-peach`, and KPI card icon avatar `bg-purple-100 text-purple-700` with `bg-amber-100 text-amber-800`.
  - Line 417: Replace About Bio card `pastel-card-lavender` with `pastel-card-peach`.
- [ ] **`PLAN-CMS-04`: Eliminate Native Browser `alert()` in About & Policies Pages**
  - [`src/app/admin/cms/about/page.tsx`](file:///Users/apple/Downloads/Primerides/redesigned-primerides/src/app/admin/cms/about/page.tsx): Replace `alert(...)` on line 60 with an inline `<div className="alert alert-danger">` message banner.
  - [`src/app/admin/cms/policies/page.tsx`](file:///Users/apple/Downloads/Primerides/redesigned-primerides/src/app/admin/cms/policies/page.tsx): Replace `alert(...)` on line 62 with an inline `<div className="alert alert-danger">` message banner.

*Verification Gate:* Run `npm run check:all` -> 0 errors. Inspect CMS pages to confirm zero purple pixels.

---

### 🗂️ Phase 2: CMS Architecture Harmonization & Navigation Cleanup

#### Problem Addressed:
1. Both `/admin/cms/website` and `/admin/cms/homepage` allow editing hero copy, but `/admin/cms/website` accidentally empties `titleLine2`.
2. In `Sidebar.tsx`, the CMS menu contains links for `/admin/cms/locations` and `/admin/cms/testimonials` that immediately trigger 307 redirects to `/admin/locations` and `/admin/testimonials`.

#### Atomic Tasks:
- [ ] **`PLAN-CMS-05`: Harmonize Hero Title Synchronization**
  - In [`src/app/api/v1/admin/cms/website/route.ts`](file:///Users/apple/Downloads/Primerides/redesigned-primerides/src/app/api/v1/admin/cms/website/route.ts) (line 77), preserve existing `titleLine2` instead of setting it to empty string `""` when updating through the website sections manager.
- [ ] **`PLAN-CMS-06`: Optimize CMS Sidebar Navigation Links**
  - In [`src/components/admin/Sidebar.tsx`](file:///Users/apple/Downloads/Primerides/redesigned-primerides/src/components/admin/Sidebar.tsx), update the CMS submenu links for "Locations" and "Reviews" to point cleanly to `/admin/locations` and `/admin/testimonials` without triggering redirection hops.

*Verification Gate:* Run `npm run check:all` -> 0 errors. Verify sidebar clicks smoothly navigate without redirect lag.

---

### 🌐 Phase 3: Web Client Live Wiring & Auto-Responder

#### Problem Addressed:
1. `Testimonials.tsx` on the homepage is the last remaining section using static data instead of live database records.
2. When a guest submits a contact form or clicks WhatsApp lead capture, no automated branded acknowledgement email is sent.

#### Atomic Tasks:
- [ ] **`PLAN-WEB-01`: Connect Live Approved Testimonials to Homepage**
  - Update `src/app/page.tsx` server component to query `prisma.testimonial.findMany({ where: { is_active: true }, orderBy: { sort_order: "asc" } })`.
  - Pass dynamic testimonials into `src/components/Testimonials.tsx` as a prop while strictly preserving 100% of the existing JSX, CSS gradients, star ratings, and card layout.
  - Maintain instant fallback to `TESTIMONIALS_DATA` if the query returns 0 rows.
- [ ] **`PLAN-WEB-02`: Dispatch Automated Guest Email Acknowledgement on Lead Capture**
  - In [`src/app/api/v1/contact/route.ts`](file:///Users/apple/Downloads/Primerides/redesigned-primerides/src/app/api/v1/contact/route.ts), if the customer provided an email address, trigger `sendEmail` with a luxury gold acknowledgement:
    - Subject: *"Thank you for contacting PrimeRides Luxury Mobility"*
    - Body: Confirms receipt of inquiry with concierge hotline contact info.

*Verification Gate:* Run `npm run check:all` -> 0 errors. Verify homepage visual layout is 100% unchanged.

---

### 📱 Phase 4: Mobile App Store Readiness & Native Features

#### Problem Addressed:
1. Tapping "Upload Document" on mobile shows a web portal alert instead of opening the smartphone camera.
2. Apple App Store Guideline 5.1.1(v) requires an in-app account deletion option for apps supporting account creation.

#### Atomic Tasks:
- [ ] **`PLAN-MOB-01`: Install & Wire `expo-image-picker` for Native KYC Capture**
  - In `apps/mobile`, install `expo-image-picker`.
  - Update [`apps/mobile/app/account/documents.tsx`](file:///Users/apple/Downloads/Primerides/redesigned-primerides/apps/mobile/app/account/documents.tsx): Replace the placeholder `Alert.alert` with an action sheet allowing the customer to either:
    1. *"Take Photo with Camera"*
    2. *"Choose from Photo Library"*
  - Convert selected image to base64 and dispatch to `api.documents.uploadDocument({ type, fileBase64, mimeType })`.
- [ ] **`PLAN-MOB-02`: In-App Account Deletion for Apple App Store Compliance**
  - Add backend route `POST /api/v1/auth/delete-account` (soft-deletes `CustomerUser` by setting `deleted_at: new Date()`).
  - Add "Delete Account" button under `apps/mobile/app/(tabs)/profile.tsx` with a two-step confirmation alert.

*Verification Gate:* Run `npm run check:all` -> 0 errors in both root and `apps/mobile/tsconfig.json`.

---

### 🗄️ Phase 5: Hostinger Production Infrastructure Hardening

#### Problem Addressed:
High-concurrency traffic on Hostinger VPS or Cloud instances can exhaust MySQL connection limits if connection pooling is not defined.

#### Atomic Tasks:
- [ ] **`PLAN-HOST-01`: Hostinger Connection Pool Hardening**
  - In `.env.example`, document the recommended connection pooling parameter for Hostinger MySQL:
    `DATABASE_URL="mysql://<user>:<pass>@<host>:3306/<db>?connection_limit=10&pool_timeout=20"`

---

### 🏁 Phase 6: Final Verification & Status Ledger Synchronization

#### Atomic Tasks:
- [ ] **`PLAN-VERIF-01`: Run Monorepo TypeScript Verification**
  - Execute `npm run check:all` (`tsc --noEmit` on Web + Mobile). Must exit with code 0.
- [ ] **`PLAN-VERIF-02`: Run Next.js Production Build**
  - Execute `npm run build`. Must compile all 87 routes with zero static or SSR errors.
- [ ] **`PLAN-VERIF-03`: Update Project Status Ledgers**
  - Update `.agents/PROJECT_STATUS.json` and `.agents/STATUS.md` with new task records and verification timestamps.

---

## 🔒 Safety Verification Protocol

Before marking any task as complete:
1. Execute `npm run check:all` to ensure zero compilation or typing regressions.
2. Confirm homepage visual appearance has **zero visual drift** from the baseline design.
3. Confirm all dynamic queries fall back smoothly if database latency occurs.
