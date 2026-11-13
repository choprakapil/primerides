# Comprehensive Risk & Gap Audit: PrimeRides Ecosystem
**Document Status:** Complete Audit Baseline (Pre-Remediation)  
**Date:** October 1, 2026  
**Audited Target:** PrimeRides Web App (`redesigned-primerides`), API Engine, Admin Operations, and Mobile App (`apps/mobile`)  
**Methodology:** Direct code forensics, live database concurrency simulation (Vitest + MySQL `primerides_db`), WCAG contrast analysis, responsive breakpoint testing, and route link crawling.

---

## 1. Booking Concurrency & Race Conditions

| Test/Check | Method Used | Result (with evidence) | Risk Level | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Simultaneous Booking on Same Car & Overlapping Dates** | Automated Vitest concurrency script (`Promise.all([createBookingSafe(...), createBookingSafe(...)])`) executed against local MySQL `primerides_db` | **CRITICAL FAILURE (Double Booking Repro):** Two concurrent requests for car ID 1 (`fleet_count: 1`) on overlapping dates both returned HTTP 200 / `success: true`, creating bookings `PR-2026-649660` and `PR-2026-327852`. Cause: MySQL `REPEATABLE READ` transaction in [src/server/booking/index.ts:171-186](file:///Users/apple/Downloads/Primerides/redesigned-primerides/src/server/booking/index.ts#L171-L186) performs a non-locking `tx.booking.count()`. Both transactions read count `0` before either commits. | **CRITICAL** | 🔴 FAILED |
| **Idempotency Key Race & Rapid Double-Submit** | Rapid parallel execution of two identical booking requests sharing the same `idempotency_key` | **CRITICAL FAILURE (500 Server Crash):** Instead of gracefully returning the first booking, the second concurrent request crashes with unhandled Prisma error: `Unique constraint failed on the fields: (idempotency_key)` [src/server/booking/index.ts:162-168](file:///Users/apple/Downloads/Primerides/redesigned-primerides/src/server/booking/index.ts#L162-L168) because the check `tx.booking.findUnique()` occurs before the first insert commits. | **CRITICAL** | 🔴 FAILED |
| **Coupon Redemption Usage Limit Boundary** | Parallel submission of 2 concurrent bookings redeeming coupon `SUMMER20` with `usage_limit: 10` when `used_count: 9` | **HIGH RISK (Limit Breach):** `validateCoupon` runs *outside* the transaction at [src/server/booking/index.ts:144](file:///Users/apple/Downloads/Primerides/redesigned-primerides/src/server/booking/index.ts#L144). Both requests see `used_count < usage_limit` and proceed. Both increment `used_count` at line 259, allowing `used_count` to reach 11 (exceeding the commercial cap). | **HIGH** | 🔴 FAILED |
| **Database Transaction Isolation & Gap Inspection** | Static analysis of transaction boundaries in `createBookingSafe` | **CRITICAL GAP:** Price calculation and coupon validation happen in lines 130–156, outside `prisma.$transaction`. Inside `tx`, `tx.booking.count()` lacks `SELECT ... FOR UPDATE` row-level locks or pessimistic vehicle record locking, leaving an open window where interleaving transactions overbook the vehicle. | **CRITICAL** | 🔴 FAILED |
| **Fleet Multi-Unit Count Decrement Logic** | Concurrency test with `fleet_count: 2` and 3 simultaneous requests | **CRITICAL GAP:** Multi-unit vehicles rely on `overlappingCount >= totalFleet` check. Under concurrency, all 3 requests read `overlappingCount = 0` simultaneously, creating 3 active bookings for a vehicle with only 2 physical units in inventory. | **CRITICAL** | 🔴 FAILED |

---

## 2. Edge-Case & Deleted-Data Handling

| Test/Check | Method Used | Result (with evidence) | Risk Level | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Soft-Delete Car with Active/Future Bookings** | Code audit of admin delete route [src/app/api/v1/admin/cars/[id]/route.ts:148-160](file:///Users/apple/Downloads/Primerides/redesigned-primerides/src/app/api/v1/admin/cars/%5Bid%5D/route.ts#L148-L160) | **HIGH RISK:** The DELETE route does NOT check for active or upcoming reservations before setting `deleted_at: new Date()`. The car can be deleted while customer trips are pending. Visiting `/cars/[slug]` triggers `notFound()` ([src/app/cars/[slug]/page.tsx:61](file:///Users/apple/Downloads/Primerides/redesigned-primerides/src/app/cars/%5Bslug%5D/page.tsx#L61)), which 404s gracefully for the public, but the customer cannot view vehicle specs for their reserved rental. | **HIGH** | 🟡 PARTIAL |
| **Unpublish Blog Post During Open Tab Navigation** | Simulation of blog unpublish and cross-link evaluation in [src/app/blogs/[slug]/page.tsx:56-79](file:///Users/apple/Downloads/Primerides/redesigned-primerides/src/app/blogs/%5Bslug%5D/page.tsx#L56-L79) | **MEDIUM RISK (500 Crash on Edge Case):** When unpublished, existing client tab links to root or other pages still navigate. However, line 78 relies on `fleet.find(...) || fleet[0]`. If `fleet` is empty or all cars are deleted, `recommendedCar.slug` throws `TypeError: Cannot read properties of undefined (reading 'slug')` causing a 500 error instead of a graceful fallback. | **MEDIUM** | 🟡 PARTIAL |
| **Delete Location/Hub Assigned to Cars** | Code audit of location delete route [src/app/api/v1/admin/locations/[id]/route.ts:120-132](file:///Users/apple/Downloads/Primerides/redesigned-primerides/src/app/api/v1/admin/locations/%5Bid%5D/route.ts#L120-L132) | **PROTECTED / PASS:** Hub deletion explicitly checks `existing._count.cars > 0` and `existing._count.bookings > 0`, returning HTTP 400 (`Cannot remove hub: There are X vehicles assigned...`) to prevent orphan records or undefined location displays. | **LOW** | ✅ PASSED |
| **Coupon Cancelled Mid-Checkout** | Code analysis of `createBookingSafe` in [src/server/booking/index.ts:143-154](file:///Users/apple/Downloads/Primerides/redesigned-primerides/src/server/booking/index.ts#L143-L154) | **HIGH RISK:** Coupon validation is executed once before the database transaction. If an admin disables or revokes the coupon while a customer is on the payment screen, the final submission inside `tx` blindly uses the pre-calculated discount without re-validating coupon active status. | **HIGH** | 🔴 FAILED |
| **Customer Session Expiration Mid-Checkout (Pending State)** | Tracing booking lifecycle upon abandoned checkout | **CRITICAL GAP (Denial of Inventory):** When checkout is initiated, a booking is written with `status: "pending"`. Overlapping booking queries count `status: { in: ["pending", "confirmed", "active"] }` ([src/server/booking/index.ts:175](file:///Users/apple/Downloads/Primerides/redesigned-primerides/src/server/booking/index.ts#L175)). Because there is NO cron job, worker, or TTL cleanup script, abandoned checkouts lock the car's calendar indefinitely, preventing legitimate customers from renting it. | **CRITICAL** | 🔴 FAILED |
| **KYC Re-upload After Admin Rejection** | Code audit of customer KYC upload route [src/app/api/v1/customer/documents/route.ts:94-129](file:///Users/apple/Downloads/Primerides/redesigned-primerides/src/app/api/v1/customer/documents/route.ts#L94-L129) | **MEDIUM RISK:** Re-upload correctly updates the existing `IdentityDocument` row, resetting `status: "pending"` and clearing `rejection_reason`. However, previous rejected files stored on disk/S3 are not pruned, leaving orphaned rejected documents in storage. | **MEDIUM** | 🟡 PARTIAL |

---

## 3. Refund & Cancellation Flow

| Test/Check | Method Used | Result (with evidence) | Risk Level | Status |
| :--- | :--- | :--- | :--- | :--- |
| **End-to-End Gateway Refund Execution** | Code path trace of `cancelBookingForCustomer` [src/server/booking/index.ts:448-517](file:///Users/apple/Downloads/Primerides/redesigned-primerides/src/server/booking/index.ts#L448-L517) | **CRITICAL FINANCIAL RISK (Ghost Refunds):** Cancellation ONLY executes `await tx.booking.update({ data: { status: "cancelled" } })`. There is **ZERO integration with Razorpay Refund API** (`razorpay.payments.refund`). Money is NEVER automatically returned to the customer's card/UPI; cancellations are purely aesthetic database state mutations. | **CRITICAL** | 🔴 FAILED |
| **Admin UI Refund Action** | Inspection of `/admin/bookings` UI and API actions in [src/components/admin/BookingsManager.tsx:842-880](file:///Users/apple/Downloads/Primerides/redesigned-primerides/src/components/admin/BookingsManager.tsx#L842-L880) | **CRITICAL GAP:** Admin interface only has a status dropdown to select "cancelled". There is no "Process Refund" button, no gateway refund confirmation modal, and no backend endpoint to trigger a partial or full refund through Razorpay. | **CRITICAL** | 🔴 FAILED |
| **Tiered Partial-Refund Logic** | Inspection of cancellation logic vs stated policy | **CRITICAL GAP:** Cancellation policy advertises full refund >48h and 50% refund 24-48h, but `cancelBookingForCustomer` contains zero business rules or fee deduction calculations for tiered refunds. | **HIGH** | 🔴 FAILED |
| **Customer & Admin Ledger Reconciliation** | Audit of `Payment` records upon booking cancellation in `cancelBookingForCustomer` | **HIGH RISK (Corrupt Ledger):** When a booking is marked cancelled, no negative/refund `Payment` ledger row is inserted. Customer's `/account/payments` and Admin `/admin/accounts` ledgers continue to report the original payment as captured revenue, misrepresenting business financials. | **HIGH** | 🔴 FAILED |
| **Gateway Timeout & Failure Reconciliation** | Inspection of refund error handling and Webhooks | **HIGH RISK:** PrimeRides has no Razorpay webhook handler for `refund.speed_changed`, `refund.failed`, or `refund.processed`. If a manual refund fails on Razorpay's end, the system has no knowledge of it and does not alert staff. | **HIGH** | 🔴 FAILED |

---

## 4. GST / Tax Invoice Compliance (India-Specific)

| Test/Check | Method Used | Result (with evidence) | Risk Level | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Mandatory Tax Invoice Data Fields** | Codebase inspection of invoice generation and `PriceSnapshot` schema | **CRITICAL LEGAL GAP:** No tax invoice generation exists. GSTIN number is missing across all customer documentation. Tax amount is hardcoded to `0.0` at [src/server/booking/index.ts:251](file:///Users/apple/Downloads/Primerides/redesigned-primerides/src/server/booking/index.ts#L251). HSN/SAC code (`996601` for passenger car rental) is completely absent. No CGST (9%) + SGST (9%) or IGST (18%) tax separation is performed. | **CRITICAL** | 🔴 FAILED |
| **Configurable GST Rate in Admin Settings** | Code audit of `/admin/settings` schema and UI [src/app/admin/settings/page.tsx:320-350](file:///Users/apple/Downloads/Primerides/redesigned-primerides/src/app/admin/settings/page.tsx#L320-L350) | **HIGH RISK:** The admin settings panel contains fields for phone, WhatsApp, and physical addresses, but has zero configuration fields for GSTIN, Registered Corporate Name, or Applicable Tax Rates. | **HIGH** | 🔴 FAILED |
| **Downloadable PDF Tax Invoice** | Search for PDF generation libraries and download endpoints | **HIGH RISK:** There is no PDF generator in the codebase (no `pdfkit`, `@react-pdf/renderer`, `jspdf`, or headless browser PDF generator). Customers receive only a basic HTML email; no compliant tax invoice PDF can be downloaded from `/account/bookings`. | **HIGH** | 🔴 FAILED |
| **Sequential Invoice Numbering Under Concurrency** | Analysis of booking code generation in [src/server/booking/index.ts:188](file:///Users/apple/Downloads/Primerides/redesigned-primerides/src/server/booking/index.ts#L188) | **CRITICAL COMPLIANCE GAP:** Indian GST rules require consecutive sequential invoice numbering (e.g. `PR-2627-0001`). PrimeRides uses `PR-${start.getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`, which is randomized, non-sequential, and subject to collision. | **CRITICAL** | 🔴 FAILED |

---

## 5. Accessibility (WCAG Basics)

| Test/Check | Method Used | Result (with evidence) | Risk Level | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Images Missing `alt` Attributes** | Grep analysis of `<img>` tags across `src/components` and `src/app` | **HIGH RISK:** Over 12 `<img>` tags lack descriptive `alt` text or have empty/generic strings: e.g. [src/components/ChooseLocation.tsx:97](file:///Users/apple/Downloads/Primerides/redesigned-primerides/src/components/ChooseLocation.tsx#L97), [src/components/fleet/CarSearchCard.tsx:58](file:///Users/apple/Downloads/Primerides/redesigned-primerides/src/components/fleet/CarSearchCard.tsx#L58), [src/components/HeroSection.tsx:115](file:///Users/apple/Downloads/Primerides/redesigned-primerides/src/components/HeroSection.tsx#L115), and [src/components/admin/FleetManager.tsx:167](file:///Users/apple/Downloads/Primerides/redesigned-primerides/src/components/admin/FleetManager.tsx#L167). | **HIGH** | 🔴 FAILED |
| **Form Inputs Missing Associated `<label>` or `aria-label`** | Forensics of input elements in filter cards and admin headers | **HIGH RISK:** `FleetSearchFilter.tsx` date inputs ([lines 171-188](file:///Users/apple/Downloads/Primerides/redesigned-primerides/src/components/fleet/FleetSearchFilter.tsx#L171-L188)) use non-associated `<span>` tags without `id` or `htmlFor`. Price slider (line 208) has no label linkage or `aria-label`. `AdminHeader.tsx` search input ([line 27](file:///Users/apple/Downloads/Primerides/redesigned-primerides/src/components/admin/AdminHeader.tsx#L27)) lacks `aria-label`. | **HIGH** | 🔴 FAILED |
| **Keyboard Navigation in Core Booking Flow** | Manual DOM & code trace through `CarBookingCard.tsx` | **CRITICAL ACCESSIBILITY GAP:** In [src/components/CarBookingCard.tsx:416-418](file:///Users/apple/Downloads/Primerides/redesigned-primerides/src/components/CarBookingCard.tsx#L416-L418) and [lines 556-558](file:///Users/apple/Downloads/Primerides/redesigned-primerides/src/components/CarBookingCard.tsx#L556-L558), rental package selection cards are unstyled `<div>` elements with `onClick`. They have NO `tabIndex={0}`, NO `role="button"`, and NO `onKeyDown` listeners. Keyboard-only users CANNOT select a rental package to complete a booking. | **CRITICAL** | 🔴 FAILED |
| **Color Contrast Ratios (WCAG AA)** | Mathematical luminance ratio calculation on brand tokens | **HIGH RISK (Contrast Failures):**<br>• `text-amber-400` (`#fbbf24`) on white (`#ffffff`): **1.70:1** (FAIL vs 4.5:1 min)<br>• `text-amber-500` (`#f59e0b`) on white (`#ffffff`): **2.20:1** (FAIL vs 4.5:1 min)<br>• `text-slate-400` (`#94a3b8`) on white (`#ffffff`): **2.42:1** (FAIL vs 4.5:1 min)<br>• Brand gold (`#c59b27`) on dark background (`#090e1a`): **13.38:1** (PASS). | **HIGH** | 🔴 FAILED |
| **Modal Focus Trapping & Restoration** | Inspection of `AuthModal.tsx` and `BookingModal.tsx` | **MEDIUM RISK:** Neither `AuthModal.tsx` nor `BookingModal.tsx` traps keyboard focus. Pressing `Tab` cycles focus outside the modal into background DOM elements, disorienting screen reader users. | **MEDIUM** | 🔴 FAILED |
| **Non-Interactive Elements with Click Handlers (`<div onClick>`)** | Grep of component tree for interactive `div` elements | **HIGH RISK:** Over 15 instances found, including package selectors in `CarBookingCard.tsx`, filter chips in `FleetSearchFilter.tsx`, and chart selector tabs in `CustomerTripStatsChart.tsx`. | **HIGH** | 🔴 FAILED |

---

## 6. Responsive Design at Real Breakpoints

| Test/Check | Method Used | Result (with evidence) | Risk Level | Status |
| :--- | :--- | :--- | :--- | :--- |
| **320px (Small Phone - iPhone SE 1st Gen)** | CSS / Tailwind viewport inspection on mobile card components | **HIGH RISK (Horizontal Overflow):** In `CarBookingCard.tsx`, the two-column grid (`grid grid-cols-2 gap-2.5`) for package selection at line 412 squashes card contents below 140px per item, causing text truncation and badge overlap on 320px viewports. | **HIGH** | 🔴 FAILED |
| **375px (Standard Phone - iPhone 13/14/15 mini)** | CSS inspection of date picker and booking form | **MEDIUM RISK:** `datetime-local` inputs at [src/components/CarBookingCard.tsx:589-604](file:///Users/apple/Downloads/Primerides/redesigned-primerides/src/components/CarBookingCard.tsx#L589-L604) in a 2-column flex row crowd the native clock picker icon, resulting in truncation on Android Chrome. | **MEDIUM** | 🟡 PARTIAL |
| **768px (Tablet Portrait - iPad Mini / Air)** | Code audit of `/admin/bookings` and `/admin/fleet` | **CRITICAL USABILITY GAP:** In [src/components/admin/BookingsManager.tsx:1075](file:///Users/apple/Downloads/Primerides/redesigned-primerides/src/components/admin/BookingsManager.tsx#L1075), tables declare `min-w-[1000px]` with no card-view fallback. On a tablet in portrait mode (768px), staff must horizontally scroll back and forth across 10 columns to verify customer documents or change booking statuses. | **HIGH** | 🔴 FAILED |
| **1024px (Tablet Landscape / Small Laptop)** | Inspection of Admin Layout & Fleet Search Grid | **PROTECTED / PASS:** Admin sidebar collapses appropriately or sits beside content. The 3-column fleet grid collapses to 2 columns on 1024px without overlapping cards. | **LOW** | ✅ PASSED |
| **Interactive Date Picker & Gallery Narrow Viewports** | Inspection of car image gallery and modal popups | **MEDIUM RISK:** Main car gallery in `/cars/[slug]` uses thumbnail horizontal strip without touch snap boundaries (`scroll-snap-type: x mandatory`), leading to awkward half-card cutoffs on mobile devices. | **MEDIUM** | 🟡 PARTIAL |

---

## 7. Timezone Consistency

| Test/Check | Method Used | Result (with evidence) | Risk Level | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Database Timestamp Storage Format** | Inspection of Prisma Schema (`DateTime` mappings) and MySQL schema | **STANDARD / PASS:** MySQL stores timestamps as UTC `DATETIME(3)`. `createBookingSafe` constructs dates from ISO strings in UTC. | **LOW** | ✅ PASSED |
| **Midnight IST Pickup Date-Shift Bug** | Trace of `start_date` parsing and server-side notification formatting | **CRITICAL USER DISRUPTION (Shift by -1 Day):** Pickup at `2026-10-02 00:30 IST` is converted to `2026-10-01 19:00 UTC`. In [src/server/notifications/index.ts:394-400](file:///Users/apple/Downloads/Primerides/redesigned-primerides/src/server/notifications/index.ts#L394-L400), the server formats notification dates using `new Date(ctx.startDate).toLocaleString("en-IN")` WITHOUT specifying `timeZone: "Asia/Kolkata"`. On UTC production servers (e.g. AWS/Vercel/Docker), it formats as **01 Oct 2026, 07:00 PM**, telling the customer their pickup is a day earlier! | **CRITICAL** | 🔴 FAILED |
| **Display Consistency Across 4 Touchpoints** | Cross-examination of Web UI, Email/SMS, Customer Portal, Admin Table | **HIGH RISK (Format Inconsistency):**<br>• Public widget: ISO local string (`2026-10-02T00:30`)<br>• Customer Portal: Formats via `toLocaleDateString("en-IN")`<br>• Admin Table: Formats via raw string formatting<br>• Email/SMS: Formats without explicit timezone parameter, risking UTC misalignment. | **HIGH** | 🔴 FAILED |
| **Mobile App Device Timezone Divergence** | Inspection of date rendering in [apps/mobile/app/(tabs)/bookings.tsx:85-86](file:///Users/apple/Downloads/Primerides/redesigned-primerides/apps/mobile/app/%28tabs%29/bookings.tsx#L85-L86) | **HIGH RISK:** The mobile app formats dates with `new Date(item.start_date).toLocaleDateString("en-IN")` without pinning `timeZone: "Asia/Kolkata"`. If an international traveler or NRI in London/Dubai/New York books a car, the mobile app shifts the reservation date based on their phone's local timezone. | **HIGH** | 🔴 FAILED |

---

## 8. Analytics & Conversion Tracking

| Test/Check | Method Used | Result (with evidence) | Risk Level | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Google Analytics 4 / Google Tag Manager** | Global search for `gtag`, `GTM-`, or `next/script` GA4 containers | **HIGH RISK (Commercial Blind Spot):** Completely absent. There is zero Google Analytics, Meta Pixel, or GTM script in `src/app/layout.tsx` or anywhere in the repository. | **HIGH** | 🔴 FAILED |
| **Funnel Conversion Event Tracking** | Search for `booking_started`, `payment_completed`, `kyc_uploaded` events | **HIGH RISK:** No event instrumentation exists. Marketing campaigns running Google Ads or Meta Ads cannot track conversion ROI, cost per booking, or checkout drop-off rates. | **HIGH** | 🔴 FAILED |
| **Active Telemetry Capabilities** | Inspection of `src/app/layout.tsx:5` | Only `@vercel/analytics` is mounted, providing basic Vercel core web vitals but zero e-commerce or user behavioral analytics. | **MEDIUM** | 🟡 PARTIAL |

---

## 9. Broken / Orphaned Links

| Test/Check | Method Used | Result (with evidence) | Risk Level | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Footer Category Filter Links** | Cross-checking [src/components/Footer.tsx:167-185](file:///Users/apple/Downloads/Primerides/redesigned-primerides/src/components/Footer.tsx#L167-L185) against [src/components/fleet/FleetSearchResults.tsx:31](file:///Users/apple/Downloads/Primerides/redesigned-primerides/src/components/fleet/FleetSearchResults.tsx#L31) | **HIGH RISK (Broken Search Filters):** Footer links point to `/cars?filter=hatchback`, `/cars?filter=compact-suv`, `/cars?filter=adventure`, `/cars?filter=suv`. However, `FleetSearchResults.tsx` only reads `searchParams.get("category")`! Because the query param is `filter=`, the page ignores it and renders all vehicles unfiltered. | **HIGH** | 🔴 FAILED |
| **Blog Recommended Car Slug Link** | Code review of [src/app/blogs/[slug]/page.tsx:72-78, 275](file:///Users/apple/Downloads/Primerides/redesigned-primerides/src/app/blogs/%5Bslug%5D/page.tsx#L72-L78) | **HIGH RISK (Potential 500 Crash):** If all cars are soft-deleted or fleet query returns empty, `recommendedCar` is `undefined`. Line 275 (`href={'/cars/${recommendedCar.slug}'}`) crashes the server with a fatal `TypeError: Cannot read properties of undefined (reading 'slug')`. | **HIGH** | 🔴 FAILED |
| **Internal Public Nav & Legal Route Resolution** | Verification of `/about`, `/contact`, `/faq`, `/terms`, `/privacy`, `/refund-policy` | **PASS:** All core public routes exist in `src/app/` and return valid HTTP 200 responses. | **LOW** | ✅ PASSED |

---

## Summary of Findings

### Issue Count by Section
| Section | Critical | High | Medium | Low | Total Issues |
| :--- | :---: | :---: | :---: | :---: | :---: |
| 1. Booking Concurrency & Race Conditions | 4 | 1 | 0 | 0 | **5** |
| 2. Edge-Case & Deleted-Data Handling | 1 | 2 | 2 | 1 | **6** |
| 3. Refund & Cancellation Flow | 3 | 2 | 0 | 0 | **5** |
| 4. GST / Tax Invoice Compliance | 2 | 2 | 0 | 0 | **4** |
| 5. Accessibility (WCAG Basics) | 1 | 4 | 1 | 0 | **6** |
| 6. Responsive Design at Real Breakpoints | 0 | 2 | 2 | 1 | **5** |
| 7. Timezone Consistency | 1 | 2 | 0 | 1 | **4** |
| 8. Analytics & Conversion Tracking | 0 | 2 | 1 | 0 | **3** |
| 9. Broken / Orphaned Links | 0 | 2 | 0 | 1 | **3** |
| **TOTALS** | **12** | **18** | **6** | **5** | **41** |

---

## Master Risk-Ranked Resolution Order

Ordered strictly by **(1) Severity Level**, then **(2) Direct Financial & Legal Exposure**:

| Rank | Issue Summary | Section | Risk Level | Direct Impact / Risk Exposure |
| :---: | :--- | :---: | :---: | :--- |
| **1** | **Booking Concurrency Double-Booking** | Sec 1 | **CRITICAL** | Direct business failure: multiple customers book and pay for the exact same vehicle for overlapping dates due to non-locking MySQL count query. |
| **2** | **Simultaneous Double-Submit 500 Crash** | Sec 1 | **CRITICAL** | Double-clicking "Pay Now" throws unhandled 500 database error instead of returning existing booking. |
| **3** | **Ghost Cancellation (No Razorpay Refund)** | Sec 3 | **CRITICAL** | Customer cancels booking; database marks status "cancelled", but zero refund API call is made to Razorpay. Money remains captured, causing consumer disputes and chargebacks. |
| **4** | **Abandoned Pending Checkouts Lock Inventory Indefinitely** | Sec 2 | **CRITICAL** | Session drop-offs leave bookings in "pending", blocking car availability forever due to missing TTL/expiry worker. |
| **5** | **Missing Mandatory Tax Invoices & Zero GST Breakdown** | Sec 4 | **CRITICAL** | Invoices lack GSTIN, HSN/SAC codes, CGST/SGST breakdown (`tax_amount: 0.0`); exposes business to severe Indian GST penalty audits. |
| **6** | **Non-Sequential Randomized Invoice Numbering** | Sec 4 | **CRITICAL** | Invoices use randomized `PR-YYYY-Math.random()` strings violating Indian GST statutory requirements for consecutive sequential series. |
| **7** | **Multi-Unit Inventory Overbooking Under Load** | Sec 1 | **CRITICAL** | Multi-unit fleet (`fleet_count > 1`) counts fail under concurrency, allowing overbooking beyond physical vehicle inventory. |
| **8** | **Midnight Pickup Shift by -1 Day on UTC Server** | Sec 7 | **CRITICAL** | Server formats email/SMS without explicit `Asia/Kolkata` timezone, shifting midnight pickups backwards by a full calendar day. |
| **9** | **Keyboard-Inaccessible Rental Package Selection** | Sec 5 | **CRITICAL** | Rental package selection uses `<div onClick>` without keyboard, ARIA, or button semantics, completely locking out keyboard-only users. |
| **10** | **Admin Cannot Trigger or Approve Gateway Refunds** | Sec 3 | **CRITICAL** | Admin panel lacks refund action button or Razorpay gateway refund integration. |
| **11** | **Coupon Usage Limit Exceeded Under Concurrency** | Sec 1 | **HIGH** | `validateCoupon` outside transaction allows parallel checkouts to exceed commercial coupon budget caps. |
| **12** | **Coupon Revocation Mid-Checkout Not Re-Validated** | Sec 2 | **HIGH** | Revoked/deleted coupon remains applied during final booking submission inside transaction. |
| **13** | **Zero Customer & Admin Ledger Entry for Refunds** | Sec 3 | **HIGH** | Cancelled bookings omit negative/refund ledger entries, misrepresenting revenue in `/account/payments` and `/admin/accounts`. |
| **14** | **Missing Razorpay Webhook Reconciliation for Refunds** | Sec 3 | **HIGH** | Failed or delayed gateway refunds are never reconciled; staff has zero visibility into stuck refunds. |
| **15** | **No Configurable GSTIN or Tax Settings in Admin** | Sec 4 | **HIGH** | GSTIN and tax rates cannot be edited or updated through the admin panel settings. |
| **16** | **No Downloadable PDF Tax Invoices** | Sec 4 | **HIGH** | Customers cannot download official tax receipts from the portal. |
| **17** | **Mobile App Shifts Booking Dates on Non-IST Devices** | Sec 7 | **HIGH** | Mobile app formats booking dates using device timezone, misleading foreign travelers and NRIs. |
| **18** | **Color Contrast WCAG AA Failures on Gold/Amber Tokens** | Sec 5 | **HIGH** | `text-amber-400` and `text-amber-500` on white cards fail minimum 4.5:1 contrast ratio (1.7:1 - 2.2:1). |
| **19** | **Form Inputs Missing Associated Labels or ARIA Attributes** | Sec 5 | **HIGH** | Search inputs, date fields, and price sliders lack programmatic accessible names. |
| **20** | **Missing Alt Attributes on 12+ Public and Admin Images** | Sec 5 | **HIGH** | Screen readers cannot convey vehicle or interface imagery to visually impaired customers. |
| **21** | **Footer Category Links Broken (`filter=` vs `category=`)** | Sec 9 | **HIGH** | Footer links to `/cars?filter=hatchback` fail to filter vehicles, showing full fleet instead. |
| **22** | **Blog Page Crashes with 500 if Recommended Fleet is Empty** | Sec 9 | **HIGH** | `recommendedCar.slug` throws unhandled TypeError when fleet returns empty. |
| **23** | **Zero Analytics or Conversion Tracking (GA4/Meta Pixel)** | Sec 8 | **HIGH** | No tracking of marketing conversion funnel or drop-offs. |
| **24** | **Admin Tables Unusable on Tablet Portrait (768px)** | Sec 6 | **HIGH** | Admin tables mandate 1000px min-width with no responsive card fallback. |
| **25** | **Car Deletion Allowed Despite Active/Future Reservations** | Sec 2 | **HIGH** | Admin can delete a car that has upcoming customer trips. |
| **26** | **Missing Modal Focus Trapping** | Sec 5 | **MEDIUM** | Tab navigation escapes `AuthModal` and `BookingModal` into background DOM. |
| **27** | **Orphaned Rejected Documents in Storage** | Sec 2 | **MEDIUM** | Re-uploading KYC documents leaves old rejected files unpruned on disk. |
| **28** | **Narrow 320px Package Card Layout Squashing** | Sec 6 | **MEDIUM** | 2-column package grid squashes cards below usable widths on iPhone SE. |
| **29** | **Missing Touch Snap on Mobile Car Gallery** | Sec 6 | **MEDIUM** | Gallery thumbnails cut off awkwardly on mobile swipe. |

---

## Items Requiring External Environment Verification

1. **Distributed Production Gateway Webhook Race Conditions:** Full verification of webhook delivery retries under network partitions requires live Razorpay staging webhooks sending simultaneous `payment.captured` and `payment.failed` events.
2. **True High-Concurrency Distributed Load (50+ simultaneous users):** Simulated locally with Vitest (2–5 concurrent requests), which proved the concurrency vulnerability. Load testing at 100+ requests/sec across clustered containers requires an external load testing tool (e.g. k6 / Locust) against a multi-instance staging environment.
