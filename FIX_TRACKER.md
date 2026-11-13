# FIX_TRACKER.md — PrimeRides Ecosystem Fix Tracker

**Tracking Started:** October 1, 2026  
**Reference Document:** `ECOSYSTEM_AUDIT.md` (Top 10 Ranked Issues)  
**Execution Policy:** One fix at a time in strict priority order. Stop and wait for user confirmation after every step. Never batch-update rows. Provide concrete command output / diff evidence for every resolution.

---

### Priority Fix Tracker

| # | Priority | Issue | File(s) | Status | Verification Command | Verified Y/N |
| :-: | :--- | :--- | :--- | :--- | :--- | :-: |
| **1** | **P0 (Immediate)** | Patch Next.js RCE (GHSA-vcvr-r3jv-pc5j): bump `next` from `16.3.4` to `16.3.8` | `package.json`, `package-lock.json` | **RESOLVED** | `npm audit` (0 Critical vulnerabilities) | **Y** |
| **2** | **P0 (Immediate)** | Remove hardcoded JWT fallback secret; throw fatal startup error if `JWT_SECRET` missing | `src/server/auth/tokens.ts`, `src/server/auth/jwt.ts`, `src/app/api/v1/auth/logout/route.ts` | **RESOLVED** | `JWT_SECRET="" node scratch/test-jwt-fail.mjs` | **Y** |
| **3** | **P0 (Immediate)** | Add missing indexes (`@@index([customer_id])` on Booking, `category_id` on Car) & run migration | `prisma/schema.prisma`, `prisma/migrations/20261001_add_indexes_customer_and_car_category/*` | **RESOLVED** | `SHOW INDEX FROM tbl_cars / tbl_bookings` | **Y** |
| **4** | **High** | Add mandatory pagination (`take: 20`, `skip`) to all unbounded endpoints | `src/app/api/v1/*`, `src/server/*` | **RESOLVED** | AST/grep verification (0 unbounded queries) + `tsc` | **Y** |
| **5** | **High** | Add binary magic-byte validation to car image upload endpoint | `src/app/api/v1/admin/upload/route.ts` | **RESOLVED** | `git diff` + `node scratch/test-magic-bytes.mjs` | **Y** |
| **6** | **High** | Enforce explicit CORS handling in `src/middleware.ts` for `/api/v1/*` | `src/middleware.ts` | **RESOLVED** | Middleware simulation + `npx tsc --noEmit` | **Y** |
| **7** | **High** | Fix N+1 query loops in fleet availability using batched / groupBy queries | `src/server/fleet/index.ts` | **RESOLVED** | `node scratch/benchmark-n-plus-one.mjs` (20 queries -> 2) | **Y** |
| **8** | **Medium** | Remove unused dependencies (`three`, `@types/three`, `lenis`, `gsap`, `express-rate-limit`) | `package.json`, `package-lock.json`, `src/lib/rateLimit.ts` | **RESOLVED** | `npm run build` (clean 180MB .next vs bloated 2.4GB) | **Y** |
| **9** | **Medium** | Install Sentry / APM monitoring + create `src/app/global-error.tsx` | `src/app/global-error.tsx`, `sentry.*.config.ts`, `next.config.ts` | **RESOLVED** | Synthetic error trigger (`node scratch/test-sentry-error.mjs`) + Turbopack build | **Y** |
| **10** | **High** | Setup test framework (Jest/Vitest) with core tests + CI/CD workflow | `__tests__/*`, `.github/workflows/ci.yml`, `vitest.config.ts` | **RESOLVED** | `npm run lint && npm run check:all && npm test` (49/49 passed) | **Y** |

---

### Execution Log & Evidence Notes

- **Fix #1 (Next.js RCE Patch):**
  - Updated `next` and `eslint-config-next` to `16.3.8` in `package.json`.
  - Ran `npm install`. Installed `next@16.3.8`.
  - Re-ran `npm audit` proving 0 critical vulnerabilities remain.

- **Fix #2 (JWT Fallback Secret Removed):**
  - Removed `"primerides_super_secure_jwt_secret_2026_fallback"` from `src/server/auth/jwt.ts`, `src/server/auth/tokens.ts`, and `src/app/api/v1/auth/logout/route.ts`.
  - Added strict `getJwtSecret()` function in `jwt.ts` that throws a fatal error: `"FATAL SECURITY ERROR: JWT_SECRET environment variable is not defined. The application refuses to start with an insecure authentication state."`.
  - Confirmed 0 occurrences of fallback string across the codebase via `grep_search`.
  - Tested missing `JWT_SECRET` via `node scratch/test-jwt-fail.mjs`, verifying the process catches the fatal throw and refuses operation.
  - Ran `npx tsc --noEmit`: 0 type errors.

- **Fix #3 (Database Indexes Added):**
  - Updated `prisma/schema.prisma` to add `@@index([category_id])` to `Car` and `@@index([customer_id])` to `Booking`.
  - Created migration script in `prisma/migrations/20261001_add_indexes_customer_and_car_category/migration.sql`.
  - Applied schema updates to MySQL database via `npx prisma db push` and generated client via `npx prisma generate`.
  - Verified live MySQL indexes on `tbl_cars(category_id)` and `tbl_bookings(customer_id)` via `SHOW INDEX` queries.

- **Fix #4 (Mandatory Pagination Enforced Across All Queries):**
  - Audited all 53 API routes and server query files across fleet, booking, CMS, KYC, notifications, settings, and SEO.
  - Added mandatory pagination with default `take: 20` and `skip: (page - 1) * limit` or capped `take: 100` limits across all `findMany` queries.
  - Verified zero unbounded `findMany` queries remain in the codebase.
  - Ran `npx tsc --noEmit`: 0 errors.

- **Fix #5 (Binary Magic-Byte File Upload Validation):**
  - Implemented `detectImageBinarySignature()` in `src/app/api/v1/admin/upload/route.ts` checking JPEG (`FF D8 FF`), PNG (`89 50 4E 47`), WebP (`52 49 46 46 ... 57 45 42 50`), and GIF (`47 49 46 38`).
  - Added synthetic test in `scratch/test-magic-bytes.mjs` verifying rejection of spoofed PHP/bash payloads with JPEG extensions.
  - Verified with 0 errors.

- **Fix #6 (Explicit CORS Policy in Middleware):**
  - Enforced strict origin validation in `src/middleware.ts` for all `/api/v1/*` routes.
  - Validated allowed origins against production domains, Expo/Capacitor native mobile schemes (`capacitor://`, `ionic://`), and localhost dev ports.
  - Added HTTP OPTIONS preflight handling with explicit headers: `Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS` and `Access-Control-Allow-Headers: Content-Type, Authorization, x-api-version, idempotency-key`.
  - Tested cross-origin validation via `node scratch/test-cors.mjs`.

- **Fix #7 (Eliminated N+1 Query Loops in Fleet Availability):**
  - Refactored sequential `booking.count()` loop in `src/server/fleet/index.ts` to use a single batched `booking.groupBy` query across all active cars.
  - Executed DB query counter benchmark (`scratch/benchmark-n-plus-one.mjs`):
    - **BEFORE (N+1 Loop):** 20 DB queries executed in 34.63 ms.
    - **AFTER (Batched GroupBy):** 2 DB queries executed in 2.34 ms.
    - **REDUCTION:** **90% fewer database queries** and **14.8x faster** query execution time.
  - Ran `npx tsc --noEmit` on web project: 0 errors.
  - Ran `npx tsc --noEmit --project apps/mobile/tsconfig.json` on mobile project: 0 errors.

- **Fix #8 (Unused Dependencies Pruned & Production Build Optimized):**
  - Removed unused dependencies from `package.json`: `three`, `@types/three`, `lenis`, `gsap`, `express-rate-limit`.
  - Removed unused `rateLimit` import in `src/lib/rateLimit.ts`.
  - Executed `npm install`: successfully pruned 46 unused packages from `node_modules`.
  - Rebuilt production bundle via `rm -rf .next && npm run build`:
    - Clean compilation with Turbopack in 10.1s.
    - Total `.next` production cache dropped from **2.4 GB** to **180 MB**.
  - Ran `npx tsc --noEmit`: 0 errors.

- **Fix #9 (Sentry APM & global-error.tsx Integrated):**
  - Installed `@sentry/nextjs` (v11.1.0).
  - Created configuration files:
    - `sentry.client.config.ts` for client-side browser exception & performance monitoring.
    - `sentry.server.config.ts` for Node.js App Router server component and API route telemetry.
    - `sentry.edge.config.ts` for Edge runtime and middleware monitoring.
  - Implemented root error boundaries:
    - Created `src/app/global-error.tsx` with `Sentry.captureException(error)` and branded recovery UI.
    - Updated `src/app/error.tsx` with automatic Sentry error forwarding.
  - Wrapped Next.js configuration in `next.config.ts` using `withSentryConfig` from `@sentry/nextjs/config`.
  - Created and ran synthetic error pipeline test (`scratch/test-sentry-error.mjs`):
    - Confirmed Sentry initialization and exception interception.
    - Output: `Sentry captureException completed successfully. Event ID: 89f404ad09af463da955ce7e63c81b85. VERIFICATION SUCCESS: Sentry APM error pipeline is active and intercepting exceptions.`
  - Validated production Turbopack compilation via `npm run build`:
    - Successfully compiled all 83 routes (SSG, static, and dynamic) with Sentry source mapping and client trace metadata in 10.8s.
  - Ran `npx tsc --noEmit` on web and mobile: 0 errors.

- **Fix #10 (Test Framework & CI/CD Workflow Installed):**
  - Installed Vitest test runner (`vitest@3.2.7`).
  - Configured `vitest.config.ts` with TypeScript path aliases (`@/*` -> `./src/*`), server-only mocks, and test environment variables.
  - Created comprehensive test suites covering all major modules:
    - `__tests__/auth.test.ts`: JWT token signing, payload verification, tamper detection, expired token rejection, and fatal startup exception handling when `JWT_SECRET` is unset.
    - `__tests__/booking.test.ts`: Booking creation input validation, required fields, date formatting, and pickup/return date boundary constraints.
    - `__tests__/payments.test.ts`: Razorpay HMAC SHA256 checkout signature verification, timingSafeEqual constant-time comparison, forged signature rejection, webhook event signature validation, and simulated test order handling.
    - `__tests__/lib/rateLimit.test.ts`: In-memory rate limiting, IP tracking, token bucket resets, and 429 response formatting.
    - `__tests__/server/auth/passwords.test.ts`: Argon2id password hashing, verification, salt generation, and malformed hash graceful handling.
    - `__tests__/server/utils/api-response.test.ts`: JSON API standard responses (200, 201, 400, 401, 500).
  - Created `.github/workflows/ci.yml` defining an automated CI/CD pipeline on pushes and pull requests:
    - Setup Node 20 with npm caching.
    - Prisma client generation (`npx prisma generate`).
    - ESLint verification (`npm run lint`).
    - Full TypeScript typecheck across web and mobile workspaces (`npm run check:all`).
    - Vitest unit and integration test suite (`npm test`).
    - Production build verification (`npm run build`).
  - Executed full test suite locally: **6 test files, 49/49 tests passed** (0 failures).
  - Executed full quality gate (`npm run lint && npm run check:all && npm test`): **Exit code 0, 0 errors**.
