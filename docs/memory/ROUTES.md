[STATE]

# Routes Registry

**Last Updated:** 2026-09-11  
**Total Routes:** 78 routes (49 API + 29 UI pages)

---

## PUBLIC WEB ROUTES

### Homepage & Marketing
| Route | File | Auth | Description |
|-------|------|------|-------------|
| `/` | `src/app/page.tsx` | None | Homepage with hero, fleet showcase, testimonials |
| `/about` | `src/app/about/page.tsx` | None | About PrimeRides |
| `/contact` | `src/app/contact/page.tsx` | None | Contact form and location info |
| `/cars` | `src/app/cars/page.tsx` | None | Vehicle fleet listing with filters |
| `/cars/[slug]` | `src/app/cars/[slug]/page.tsx` | None | Vehicle detail with booking form |
| `/blogs` | `src/app/blogs/page.tsx` | None | Blog articles listing |
| `/blogs/[slug]` | `src/app/blogs/[slug]/page.tsx` | None | Blog article detail |
| `/faq` | `src/app/faq/page.tsx` | None | Frequently asked questions |
| `/terms` | `src/app/terms/page.tsx` | None | Terms & conditions |
| `/privacy` | `src/app/privacy/page.tsx` | None | Privacy policy |

### SEO & Crawlers
| Route | File | Auth | Description |
|-------|------|------|-------------|
| `/sitemap.xml` | `src/app/sitemap.ts` | None | Dynamic XML sitemap |
| `/robots.txt` | `src/app/robots.ts` | None | Search engine directives |

---

## CUSTOMER AUTHENTICATION ROUTES

| Route | File | Auth | Description |
|-------|------|------|-------------|
| `/account/login` | `src/app/account/login/page.tsx` | None | Customer login (redirects if authenticated) |
| `/account/register` | `src/app/account/register/page.tsx` | None | Customer registration (redirects if authenticated) |

---

## CUSTOMER PORTAL ROUTES (Protected)

All customer portal routes require authentication. Unauthenticated users are redirected to `/account/login`.

| Route | File | Auth | Description |
|-------|------|------|-------------|
| `/account` | `src/app/account/page.tsx` | Customer | Account dashboard with booking overview |
| `/account/bookings` | Anchor in `/account` | Customer | Reservations list (hash navigation) |
| `/account/payments` | `src/app/account/payments/page.tsx` | Customer | Payment ledger and invoices |
| `/account/documents` | `src/app/account/documents/page.tsx` | Customer | KYC document upload and status |
| `/account/profile` | `src/app/account/profile/page.tsx` | Customer | Profile settings and password change |

**Authentication Method:** JWT token in HTTP-only cookie (`customer_token`)  
**Session Duration:** 15 minutes (access) + 30 days (refresh)  
**Middleware:** `src/middleware.ts` checks authentication on `/account/*` paths

---

## ADMIN AUTHENTICATION ROUTES

| Route | File | Auth | Description |
|-------|------|------|-------------|
| `/admin/login` | `src/app/admin/login/page.tsx` | None | Admin login (redirects if authenticated) |

---

## ADMIN DASHBOARD ROUTES (Protected)

All admin routes require authentication + RBAC permissions. Unauthenticated users are redirected to `/admin/login`.

### Core Operations
| Route | File | Permission | Description |
|-------|------|------------|-------------|
| `/admin` | `src/app/admin/page.tsx` | Any admin | Dashboard home with KPIs |
| `/admin/bookings` | `src/app/admin/bookings/page.tsx` | `bookings.view` | Reservations management |
| `/admin/cars` | `src/app/admin/cars/page.tsx` | `fleet.view` | Fleet management |
| `/admin/locations` | `src/app/admin/locations/page.tsx` | `fleet.view` | Rental hubs management |
| `/admin/customers` | `src/app/admin/customers/page.tsx` | `customers.view` | Customer database |
| `/admin/documents` | `src/app/admin/documents/page.tsx` | `documents.manage` | KYC verification queue |
| `/admin/accounts` | `src/app/admin/accounts/page.tsx` | `payments.view` | Financial reports & transactions |

### Marketing & Content
| Route | File | Permission | Description |
|-------|------|------------|-------------|
| `/admin/testimonials` | `src/app/admin/testimonials/page.tsx` | `content.view` | Customer reviews management |
| `/admin/coupons` | `src/app/admin/coupons/page.tsx` | `coupons.view` | Promotional codes |
| `/admin/leads` | `src/app/admin/leads/page.tsx` | `leads.view` | Contact inquiries CRM |

### CMS & Website Management
| Route | File | Permission | Description |
|-------|------|------------|-------------|
| `/admin/cms` | `src/app/admin/cms/page.tsx` | `content.view` | CMS hub |
| `/admin/cms/header` | `src/app/admin/cms/header/page.tsx` | `content.manage` | Header navigation config |
| `/admin/cms/homepage` | `src/app/admin/cms/homepage/page.tsx` | `content.manage` | Homepage content |
| `/admin/cms/about` | `src/app/admin/cms/about/page.tsx` | `content.manage` | About page content |
| `/admin/cms/fleet` | `src/app/admin/cms/fleet/page.tsx` | `content.manage` | Fleet page content |
| `/admin/cms/blogs` | `src/app/admin/cms/blogs/page.tsx` | `content.manage` | Blog articles management |
| `/admin/cms/faqs` | `src/app/admin/cms/faqs/page.tsx` | `content.manage` | FAQ management |
| `/admin/cms/contact` | `src/app/admin/cms/contact/page.tsx` | `content.manage` | Contact page content |
| `/admin/cms/policies` | `src/app/admin/cms/policies/page.tsx` | `content.manage` | Legal pages content |
| `/admin/cms/website` | `src/app/admin/cms/website/page.tsx` | `content.manage` | Website banners & promo bar |

### System Settings
| Route | File | Permission | Description |
|-------|------|------------|-------------|
| `/admin/settings` | `src/app/admin/settings/page.tsx` | `settings.manage` | Global site settings |
| `/admin/notifications` | `src/app/admin/notifications/page.tsx` | `settings.manage` | Notification templates |
| `/admin/staff` | `src/app/admin/staff/page.tsx` | `staff.manage` | Staff accounts & RBAC |

**Authentication Method:** JWT token in HTTP-only cookie (`admin_token`)  
**Session Duration:** 15 minutes (access) + 7 days (refresh)  
**Middleware:** `src/middleware.ts` checks authentication on `/admin/*` paths (excluding `/admin/login`)

---

## API ROUTES (REST)

All API routes are prefixed with `/api/v1`. See `docs/memory/API_CONTRACTS.md` for detailed request/response schemas.

### Authentication APIs
| Method | Route | Auth | Rate Limit | Description |
|--------|-------|------|------------|-------------|
| POST | `/api/v1/auth/register` | None | 5/min/IP | Customer registration |
| POST | `/api/v1/auth/login` | None | 5/min/IP | Customer login |
| POST | `/api/v1/auth/refresh` | Refresh token | 20/hr/user | Token rotation |
| POST | `/api/v1/auth/logout` | Bearer | None | Session revocation |
| GET | `/api/v1/auth/me` | Bearer | 60/min | Current user profile |

### Public Fleet APIs
| Method | Route | Auth | Rate Limit | Description |
|--------|-------|------|------------|-------------|
| GET | `/api/v1/cars` | None | 100/min/IP | List vehicles with filters |
| GET | `/api/v1/cars/[slug]` | None | 100/min/IP | Vehicle details |
| GET | `/api/v1/locations` | None | 100/min/IP | Rental locations |

### Booking APIs
| Method | Route | Auth | Rate Limit | Description |
|--------|-------|------|------------|-------------|
| POST | `/api/v1/bookings` | Customer | 10/hr/user | Create booking |
| GET | `/api/v1/bookings` | Customer | 60/min | Customer booking history |
| DELETE | `/api/v1/bookings/[id]` | Customer | 60/min | Cancel booking |

### Payment APIs
| Method | Route | Auth | Rate Limit | Description |
|--------|-------|------|------------|-------------|
| POST | `/api/v1/payments/create-order` | Customer | 20/hr/user | Razorpay order creation |
| POST | `/api/v1/payments/verify` | Customer | 20/hr/user | Payment signature verification |
| POST | `/api/v1/payments/webhook` | Razorpay signature | None | Razorpay webhook handler |

### Coupon APIs
| Method | Route | Auth | Rate Limit | Description |
|--------|-------|------|------------|-------------|
| POST | `/api/v1/coupons/validate` | Customer | 60/min | Validate coupon code |

### CMS Public APIs
| Method | Route | Auth | Rate Limit | Description |
|--------|-------|------|------------|-------------|
| GET | `/api/v1/cms/testimonials` | None | 100/min/IP | Featured reviews |
| GET | `/api/v1/cms/settings` | None | 100/min/IP | Contact info |
| GET | `/api/v1/cms/header` | None | 100/min/IP | Navigation config |
| GET | `/api/v1/cms/faqs` | None | 100/min/IP | FAQ list |
| GET | `/api/v1/cms/blogs` | None | 100/min/IP | Blog articles |

### Contact API
| Method | Route | Auth | Rate Limit | Description |
|--------|-------|------|------------|-------------|
| POST | `/api/v1/contact` | None | 5/hr/IP | Submit contact inquiry |

### Customer Portal APIs
| Method | Route | Auth | Rate Limit | Description |
|--------|-------|------|------------|-------------|
| GET | `/api/v1/customer/documents` | Customer | 60/min | KYC documents list |
| POST | `/api/v1/customer/documents` | Customer | 10/hr/user | Upload KYC document |
| GET | `/api/v1/customer/payments` | Customer | 60/min | Payment transactions |
| GET | `/api/v1/documents/[id]/file` | Customer/Admin | 60/min | Download document (signed URL) |

### Admin Booking APIs
| Method | Route | Auth | Permission | Description |
|--------|-------|------|------------|-------------|
| GET | `/api/v1/admin/bookings` | Admin | `bookings.view` | List/search bookings |
| POST | `/api/v1/admin/bookings/[id]/status` | Admin | `bookings.manage` | Update booking status |

### Admin Fleet APIs
| Method | Route | Auth | Permission | Description |
|--------|-------|------|------------|-------------|
| GET | `/api/v1/admin/cars` | Admin | `fleet.view` | List vehicles |
| POST | `/api/v1/admin/cars` | Admin | `fleet.manage` | Create vehicle |
| PATCH | `/api/v1/admin/cars/[id]` | Admin | `fleet.manage` | Update vehicle |
| DELETE | `/api/v1/admin/cars/[id]` | Admin | `fleet.manage` | Soft delete vehicle |

### Admin Location APIs
| Method | Route | Auth | Permission | Description |
|--------|-------|------|------------|-------------|
| GET | `/api/v1/admin/locations` | Admin | `fleet.view` | List locations |
| POST | `/api/v1/admin/locations` | Admin | `fleet.manage` | Create location |
| PATCH | `/api/v1/admin/locations/[id]` | Admin | `fleet.manage` | Update location |
| DELETE | `/api/v1/admin/locations/[id]` | Admin | `fleet.manage` | Delete location (if no cars) |

### Admin KYC APIs
| Method | Route | Auth | Permission | Description |
|--------|-------|------|------------|-------------|
| GET | `/api/v1/admin/documents` | Admin | `documents.manage` | List KYC documents |
| POST | `/api/v1/admin/documents/[id]/approve` | Admin | `documents.manage` | Approve document |
| POST | `/api/v1/admin/documents/[id]/reject` | Admin | `documents.manage` | Reject document |

### Admin Content APIs
| Method | Route | Auth | Permission | Description |
|--------|-------|------|------------|-------------|
| GET | `/api/v1/admin/testimonials` | Admin | `content.view` | List testimonials |
| POST | `/api/v1/admin/testimonials` | Admin | `content.manage` | Create testimonial |
| PATCH | `/api/v1/admin/testimonials/[id]` | Admin | `content.manage` | Update testimonial |
| DELETE | `/api/v1/admin/testimonials/[id]` | Admin | `content.manage` | Delete testimonial |
| GET | `/api/v1/admin/faqs` | Admin | `content.view` | List FAQs |
| POST | `/api/v1/admin/faqs` | Admin | `content.manage` | Create FAQ |
| GET | `/api/v1/admin/blogs` | Admin | `content.view` | List blogs |
| POST | `/api/v1/admin/blogs` | Admin | `content.manage` | Create blog |

### Admin Coupon APIs
| Method | Route | Auth | Permission | Description |
|--------|-------|------|------------|-------------|
| GET | `/api/v1/admin/coupons` | Admin | `coupons.view` | List coupons |
| POST | `/api/v1/admin/coupons` | Admin | `coupons.manage` | Create coupon |

### Admin Customer APIs
| Method | Route | Auth | Permission | Description |
|--------|-------|------|------------|-------------|
| GET | `/api/v1/admin/customers` | Admin | `customers.view` | List customers |

### Admin Lead APIs
| Method | Route | Auth | Permission | Description |
|--------|-------|------|------------|-------------|
| GET | `/api/v1/admin/leads` | Admin | `leads.view` | List contact inquiries |

### Admin CMS APIs
| Method | Route | Auth | Permission | Description |
|--------|-------|------|------------|-------------|
| GET | `/api/v1/admin/cms/website` | Admin | `content.view` | Get website config |
| PUT | `/api/v1/admin/cms/website` | Admin | `content.manage` | Update website config |
| GET | `/api/v1/admin/cms/homepage` | Admin | `content.view` | Get homepage config |
| PUT | `/api/v1/admin/cms/homepage` | Admin | `content.manage` | Update homepage |
| GET | `/api/v1/admin/cms/about` | Admin | `content.view` | Get about config |
| PUT | `/api/v1/admin/cms/about` | Admin | `content.manage` | Update about |
| GET | `/api/v1/admin/cms/policies` | Admin | `content.view` | Get legal policies |
| PUT | `/api/v1/admin/cms/policies` | Admin | `content.manage` | Update policies |

### Admin Settings APIs
| Method | Route | Auth | Permission | Description |
|--------|-------|------|------------|-------------|
| GET | `/api/v1/admin/settings` | Admin | `settings.view` | Get site settings |
| PUT | `/api/v1/admin/settings` | Admin | `settings.manage` | Update settings |
| GET | `/api/v1/admin/notifications` | Admin | `settings.view` | Get notification templates |
| PUT | `/api/v1/admin/notifications` | Admin | `settings.manage` | Update templates |
| GET | `/api/v1/admin/header` | Admin | `content.view` | Get header config |
| PUT | `/api/v1/admin/header` | Admin | `content.manage` | Update header |

### Admin Staff APIs
| Method | Route | Auth | Permission | Description |
|--------|-------|------|------------|-------------|
| GET | `/api/v1/admin/staff` | Admin | `staff.view` | List staff |
| POST | `/api/v1/admin/staff` | Admin | `staff.manage` | Create staff |

### Admin Upload API
| Method | Route | Auth | Permission | Description |
|--------|-------|------|------------|-------------|
| POST | `/api/v1/admin/upload` | Admin | Any | Upload file (multipart) |

---

## RBAC PERMISSION MATRIX

| Permission | View Routes | Manage Routes |
|------------|-------------|---------------|
| `fleet.view` | Cars, Locations list | - |
| `fleet.manage` | - | Create/Edit/Delete Cars, Locations |
| `bookings.view` | Bookings list | - |
| `bookings.manage` | - | Update booking status, assign driver |
| `documents.manage` | KYC documents | Approve/Reject documents |
| `customers.view` | Customer list | - |
| `content.view` | Testimonials, Blogs, FAQs, CMS | - |
| `content.manage` | - | Create/Edit CMS content |
| `coupons.view` | Coupons list | - |
| `coupons.manage` | - | Create/Edit coupons |
| `leads.view` | Leads list | - |
| `payments.view` | Accounts, transactions | - |
| `payments.manage` | - | Record cash/POS payments |
| `settings.view` | Site settings | - |
| `settings.manage` | - | Update site settings |
| `staff.view` | Staff list | - |
| `staff.manage` | - | Create/Edit staff RBAC |

---

## MOBILE APP ROUTES (React Native / Expo)

**App Location:** `apps/mobile/app/`

### Public Routes
| Route | File | Auth | Description |
|-------|------|------|-------------|
| `/(tabs)/index` | `app/(tabs)/index.tsx` | None | Fleet browse with location filters |
| `/(tabs)/explore` | `app/(tabs)/explore.tsx` | None | Explore tab |
| `/car/[slug]` | `app/car/[slug].tsx` | None | Vehicle detail with booking |
| `/login` | `app/login.tsx` | None | Customer login |
| `/register` | `app/register.tsx` | None | Customer registration |

### Protected Routes
| Route | File | Auth | Description |
|-------|------|------|-------------|
| `/(tabs)/account` | `app/(tabs)/account.tsx` | Customer | Account dashboard |
| `/bookings` | (TBD) | Customer | My bookings |
| `/documents` | (TBD) | Customer | KYC documents |

**Navigation:** Expo Router (file-based routing)  
**Authentication:** JWT tokens in secure device storage  
**API Base:** Same REST API as web (`/api/v1/*`)

---

## AUTHENTICATION FLOW DIAGRAMS

### Customer Auth Flow
```
1. User visits /account/* → Middleware checks cookie
2. No token → Redirect to /account/login
3. POST /api/v1/auth/login → Returns JWT + refresh token
4. Set HTTP-only cookies (customer_token, customer_refresh)
5. Redirect to /account
6. Token expires (15 min) → Auto refresh via /api/v1/auth/refresh
7. Logout → POST /api/v1/auth/logout → Clear cookies → Redirect to /
```

### Admin Auth Flow
```
1. User visits /admin/* → Middleware checks cookie
2. No token → Redirect to /admin/login
3. POST /api/v1/admin/auth/login → Returns JWT
4. Set HTTP-only cookie (admin_token)
5. Redirect to /admin
6. Every admin API checks RBAC permissions
7. Insufficient permission → 403 Forbidden
8. Logout → Clear cookie → Redirect to /admin/login
```

---

## ROUTE PROTECTION RULES

### Middleware (`src/middleware.ts`)
- Runs on every request matching patterns
- Patterns: `/account/:path*`, `/admin/:path*`, `/api/v1/:path*`
- Checks JWT token validity
- Redirects unauthenticated users
- Does NOT check RBAC (handled in API routes)

### API Route Protection
- Each admin API route independently checks:
  1. Valid JWT token
  2. User type (admin vs customer)
  3. RBAC permission for the operation
  4. Resource ownership (for customer routes)

---

## DEPRECATED ROUTES (Removed)

None currently. All routes are active.

---

## PLANNED ROUTES (Phase 5/6)

| Route | Type | Status | Description |
|-------|------|--------|-------------|
| `/admin/reports` | UI | Planned | Analytics dashboard |
| `/api/v1/reports/*` | API | Planned | Report data APIs |
| `/api/v1/bookings/[id]/extend` | API | Planned | Booking extension |
| `/api/v1/invoices/[id]` | API | Planned | GST invoice download |
| `/admin/analytics` | UI | Planned | Advanced analytics |

---

**Maintenance Notes:**
- Update this file when adding/removing routes
- Sync with `API_CONTRACTS.md` for API changes
- Test all protected routes after auth changes
- Verify RBAC permissions after role updates
