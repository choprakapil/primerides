# PrimeRides Master Checklist

**This file is the single source of truth for project progress.** Update it
in place as work is verified against the real running app and database —
never mark something done from a plan or an intention.

**Authoritative spec source:** BMD's own "3-Month Project Development
Timeline" and "Website Development Requirements" documents define the real
scope. Where anything in this repo's prior work conflicts with those
documents, the BMD documents win, and the conflicting work needs rework
(flagged explicitly below).

## How Antigravity should use this file

1. Find the first unchecked item, top to bottom, within the current phase.
2. Execute it.
3. Verify against the real app/DB — an actual HTTP request, an actual query
   result, an actual UI interaction.
4. Check the box, add a one-line note with verification evidence.
5. Update `AGENTS.md`'s current-state section if affected.
6. Commit with a message referencing the checklist item.
7. Stop after one item and report back, unless told to continue through a
   phase. Do not chain into unrelated work or invent business specifics —
   see "Confirmed Decisions" and "Still Open" below; anything not in either
   list must be asked about, not assumed.

---

## Confirmed decisions (do not re-litigate these)

- **Auth: password-based (Argon2id) + JWT, NOT OTP.** BMD's own requirements
  doc calls for OTP login — this is a deliberate deviation the project owner
  chose. Do not switch to OTP unless explicitly told to reverse this.
- **Pricing: KM-based plans, NOT daily rate.** Exact tiers:
  - Maruti Suzuki Baleno (Delhi NCR): 300km/₹2,500, 450km/₹3,000, 600km/₹3,750, Monthly (5,000km)/₹40,000. Extra km: ₹7. Deposit: ₹5,000.
  - Toyota Glanza (Lucknow): 300km/₹3,000, 450km/₹3,600, 600km/₹4,500, Monthly (5,000km)/₹50,000. Extra km: ₹7. Deposit: ₹5,000.
- **Multi-location & Inventory Model:** Each vehicle is scoped to exactly ONE `Location` (`location_id`). Same car model across 2 cities = 2 distinct `Car` rows with independent inventory & availability.
  - Location 1: Delhi NCR (`slug: delhi-ncr`, `city: Delhi NCR`)
  - Location 2: Lucknow (`slug: lucknow`, `city: Lucknow`)
- **GST / Tax:** Plan prices treated as tax-inclusive for now (`tax_amount: 0` in PriceSnapshot). Formal GST calculation deferred to Phase 5 invoicing.
- **Deployment target: local only for now.** Build and verify everything against local dev environment (`http://localhost:3000`).
- **Brand owner:** BMD is building this themselves using Antigravity — BMD's requirements are the authoritative spec.
- **KYC Gate:** Vehicle handover-only (`confirmed` -> `active` status transition requires verified Driving License). Booking creation (`pending` status) is NOT blocked.

## Still open — ask before implementing, don't guess

- [ ] Extra-hour charge amount (BMD requirements doc asks for this; not in the pricing sheet)
- [ ] Minimum booking duration, if any
- [ ] Pickup/drop fee for the 21–24km gap between the sheet's defined tiers
- [ ] Smoking/narcotics charge rule — "₹2,000 & ₹3,000" with no stated trigger for each
- [ ] GST/tax rate applicable on rentals (deferred to Phase 5 invoicing)
- [ ] Brand details: logo, color codes, font, tagline
- [ ] Coupon/discount rules and whether they're location-specific

---

## Historical Verification Archive (Preserved Prior to Test Data Wipe)

Before wiping the 17 initial test vehicles and test bookings for the Phase 4 pricing rework, the key security verification test records were archived below:
- **Spoofed-Price Security Test (Booking #3):** Verified that spoofing client-sent rates failed; server recalculated price authoritatively and wrote immutable `tbl_price_snapshots` row with calculated amounts.
- **409 Date Overlap Conflict Test (Booking #4):** Verified that re-booking the same car on overlapping dates returned HTTP `409 Conflict` (`isAvailableForDates` blocking double-booking).
- **RBAC 403 Mutation Test (Booking #3 / Staff User #3):** Verified that staff token with `bookings.view` only received HTTP `403 Forbidden` on `POST /api/v1/admin/bookings/3/status` when attempting unauthorized status transition.
- **Audit Log Writes (`tbl_audit_logs`):** Verified all admin booking transitions and cancellations recorded actor ID, entity, and diff in the database.

---

## Phase 0 — Foundation ✅ COMPLETE

- [x] Prisma + MySQL connected, migrated
- [x] Schema consolidated, legacy `admin/prisma/` removed
- [x] Argon2id password hashing — confirmed to stay, matches decision above
- [x] Token model: 15-min access + rotating refresh, replay-tested
- [x] Booking logic extracted to `src/server/booking/index.ts`
- [x] Admin mounted at `/admin`

## Phase 1 — Customer Accounts & Public Booking ✅ COMPLETE

- [x] `/api/v1/auth/*` register/login/logout/me/refresh — valid, keep as-is (password auth confirmed)
- [x] Customer cookie isolated from admin cookie, cross-access blocked — valid
- [x] Booking requires login, no guest checkout — valid
- [x] `customer_id` from session only, spoofed price/customerId discarded — valid pattern, keep
- [x] 409 on overlapping dates — verified HTTP 409 on overlapping car bookings
- [x] **REWORK: KM-plan model per `pricing-km-plans` skill** — `src/server/booking/index.ts` refactored to compute plan flat price + deposit; web `CarBookingCard` and mobile `car/[slug]` updated to plan cards.
- [ ] Rate limiting on auth endpoints — confirm actually wired (was reported as "designed for," never confirmed live with a real 429)

## Phase 2 — Admin RBAC & Operations ✅ COMPLETE

- [x] RBAC (7 permissions), staff creation, scoped 403s tested directly against the API — valid, keep
- [x] Vehicle CRUD with soft-delete — Car model updated with `location_id` and `rental_plans`
- [x] Booking status lifecycle + AuditLog + BookingStatusHistory, both tables confirmed written — valid, keep
- [x] Cancellation + date re-release, tested with a real re-booking — valid, keep
- [x] Driver/chauffeur assignment — valid, keep
- [ ] Vehicle image upload storage — still not confirmed to use real object storage; confirm before more vehicles are added
- [x] Location field added to `Car` and to booking availability queries (`tbl_locations` linked to `tbl_cars.location_id`)

## Phase 3 — Mobile App (Expo) ✅ COMPLETE

- [x] Expo SDK 57 scaffolded in `apps/mobile/`, secure token storage — valid, keep
- [x] Registration, login, fleet browse tested against real backend — valid, keep
- [x] Booking screen updated to KM-plan selector cards with live authoritative price breakdown
- [ ] Cold-start silent refresh — never confirmed (only mid-session 401 refresh was tested)
- [ ] Dual-platform test (iOS + Android) — only one platform confirmed tested so far

## Phase 4 — Pricing & Location Rework ✅ COMPLETE

- [x] Resolve all "Still Open" pricing questions above with the human (confirmed: 4 plans per car, inclusive GST for now, exclusive inventory model, KYC gate deferred to Phase 5)
- [x] Schema: added `Location` (`tbl_locations`), `RentalPlan` (`tbl_rental_plans`), `location_id` & `rental_plan_id` on `Booking`, and updated `PriceSnapshot` with `rental_plan_id`, `plan_name`, `plan_price`, `free_km`, `extra_km_rate`, `tax_amount` (Verified in MySQL schema).
- [x] Rework `src/server/booking/index.ts` pricing calculation to evaluate selected `RentalPlan` price flatly with chauffeur and deposit (Verified: Baleno 300km plan base=₹2,500, deposit=₹5,000, tax=₹0).
- [x] Rework public booking form (web): `src/components/CarBookingCard.tsx` and `src/app/cars/[slug]/page.tsx` updated with plan selector cards, location hub badges, free KM counter, and extra KM rate indicator.
- [x] Rework mobile booking screen: `apps/mobile/app/(tabs)/index.tsx` (location filter pills) & `apps/mobile/app/car/[slug].tsx` (plan cards & authoritative price estimate).
- [x] Test data wiped and re-seeded with 2 real cars:
  - Location 1 (Delhi NCR): Maruti Suzuki Baleno (`id: 19`) with 300km (₹2,500), 450km (₹3,000), 600km (₹3,750), Monthly (₹40,000). Extra km: ₹7. Deposit: ₹5,000.
  - Location 2 (Lucknow): Toyota Glanza (`id: 20`) with 300km (₹3,000), 450km (₹3,600), 600km (₹4,500), Monthly (₹50,000). Extra km: ₹7. Deposit: ₹5,000.
- [x] Added `GET /api/v1/locations` route and location filtering to `GET /api/v1/cars?location_id=` (Verified: `location_id=1` returns only Baleno; `location_id=2` returns only Glanza).
- [x] Scoped availability checks by location & vehicle: Booking Baleno in Delhi for 2026-09-15 to 2026-09-16 succeeded (HTTP 201), and simultaneously booking Glanza in Lucknow for the EXACT same dates also succeeded (HTTP 201), verifying independent fleet availability. Re-booking Baleno on overlapping dates returned HTTP 409 Conflict.
- [x] Verify end-to-end: Live HTTP booking test returned HTTP 201 (`booking_code: PR-2026-318992`) and immutable `tbl_price_snapshots` wrote `plan_price: 2500`, `free_km: 300`, `extra_km_rate: 7`, `security_deposit: 5000`, `tax_amount: 0`.

## Phase 5 — Remaining BMD-Specified Features (not yet started)

- [x] KYC: driving license (front/back) + Aadhaar upload, private storage with HMAC-signed token URLs, admin review with approve/reject (reason required), `documents.manage` RBAC permission, and handover-only gate enforcement. (Verified: upload validates real binary magic bytes (JPEG FF D8 FF, PNG 89 50 4E 47, WebP RIFF/WEBP) discarding spoofed client MIME types/extensions with HTTP 400 and lands in `tbl_identity_documents` with relative storage key; staff without `documents.manage` receives 403 on both approve and reject endpoints; admin rejects with reason and customer sees exact note; admin approves and status becomes verified; booking creation for unverified customer succeeds 201; transition to `active` on unverified customer blocked 400 with "Customer's driving license is not yet verified"; handover succeeds on verified customer; AuditLog entries written for reject and approve).
- [ ] Payment gateway (Razorpay) — advance/full payment, payment records, verified webhook, invoice generation
- [ ] GST invoice generation (rate TBD — see Still Open)
- [ ] Coupons/discounts, location-wise offers
- [ ] Lead management + follow-up tracking (distinct from existing `ContactLead` model — check if it needs extending)
- [ ] Reports: revenue, booking, utilization, location, customer, payment
- [ ] CMS: pages, FAQ, banners, promotional sections
- [ ] Notifications: email (SMTP), WhatsApp, dashboard notifications — distinct channels, not just push
- [ ] OTP integration — only if the auth decision above is later reversed; do not build speculatively
- [ ] Booking extension workflow (extend an active rental)
- [ ] Terms & Conditions / Privacy Policy pages (content, not just routing)

## Phase 6 — QA / Hardening / Launch Prep (not yet started)

- [ ] Cross-browser testing (Chrome, Safari, Edge)
- [ ] Cross-device testing (desktop, tablet, mobile) for web
- [ ] Full regression: auth, booking, availability, pricing, payment, refund, KYC, invoice
- [ ] Admin permission + multi-location testing
- [ ] Load test on booking endpoint
- [ ] Backups + restore test
- [ ] **Deployment: local only for now**
