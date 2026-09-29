---
name: primerides-admin-ecosystem
description: Comprehensive architecture, schema, server actions, UI components, and mobile API specification for PrimeRides Luxury Car Rentals.
---

# PrimeRides Admin & Mobile API Ecosystem

This skill documents the modular Admin and Mobile Backend architecture designed for PrimeRides. It serves as the primary technical reference for managing the luxury car rental fleet, booking leads, blogs, FAQs, SEO, and native mobile clients (Android & iOS).

## Architecture Highlights

1. **Isolation**: Kept clean and modular inside `/admin/` to prevent interference with active public marketing and booking pages.
2. **Domain Model**: Luxury car rentals with support for hourly/daily rental rates, security deposits, chauffeur options, vehicle specifications, and booking lead pipelines.
3. **Dual Authentication**:
   - Web Admin: HTTP-only cookie `primerides_admin_token`.
   - Android & iOS: Bearer token `Authorization: Bearer <JWT_TOKEN>`.
4. **Zero Heavy Native Dependencies**: Lightweight JWT signing and password verification implemented via Web Crypto APIs.
5. **Mobile API First**: Standardized JSON envelopes with pagination and error handling across `/api/v1/*`.

## Folder Organization

```
Primerides/admin/
├── prisma/
│   └── schema.prisma         # Full database schema for Fleet, Bookings, Blogs, FAQs, SEO, Users
├── src/
│   ├── types/                # DTOs and contracts for Web and Mobile
│   ├── lib/                  # JWT auth, standard api-response wrappers, utilities, Prisma singleton
│   ├── components/           # Sidebar, AdminHeader, SlideToast, ConfirmDialog, StatsCard, DataTable
│   ├── actions/              # Server Actions for CRUD operations
│   └── api/v1/               # Mobile REST API endpoints (auth, cars, bookings, blogs, faqs)
├── docs/
│   ├── INTEGRATION_PLAYBOOK.md # Step-by-step instructions to link with Next.js App Router
│   └── MOBILE_APP_SPEC.md    # Android & iOS RESTful payload specifications
└── SKILL.md                  # This skill document
```

## Quick Reference Commands

- **Review Database Schema**: `admin/prisma/schema.prisma`
- **Inspect Mobile API Contracts**: `admin/docs/MOBILE_APP_SPEC.md`
- **Link Admin into Live App Router**: See `admin/docs/INTEGRATION_PLAYBOOK.md`
