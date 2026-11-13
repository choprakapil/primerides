---
name: prime-orchestrator
description: Master execution guide and state tracker for PrimeRides website optimization, CMS persistence, SEO engine, and mobile app stabilization without regressions.
---

# PrimeRides Orchestrator Skill

This skill defines the rules, architecture, and step-by-step execution protocol for completing and stabilizing the `redesigned-primerides` web application and `apps/mobile` Expo project.

## Non-Negotiable Directives
1. **HOMEPAGE LOCK**: The homepage (`src/app/page.tsx` and all child components: Hero, TrustBar, ChooseLocation, CarsCategory, OffersSection, AboutSection, CtaSection, Testimonials, BlogSection, FaqSection, and SeoContentSection) is **strictly locked**. No visual modifications, HTML restructuring, CSS alterations, or copy changes may occur on the homepage. Any backend data wiring must retain 100% pixel-perfect visual fidelity and exact default fallbacks.
2. **ATOMIC EXECUTION**: Always work on one task at a time. After modifying code, run `./node_modules/.bin/tsc -p tsconfig.json --noEmit` to verify 0 errors before marking any task as complete.
3. **STATUS TRACKING**: Whenever a task status changes, immediately update `.agents/PROJECT_STATUS.json` and `.agents/STATUS.md`.
4. **LUXURY GOLD AESTHETIC**: All new and modified admin interfaces, subpages, and mobile screens must use the luxury gold primary token (`#c59b27`) and Bootstrap 5 container system.

## Task Inventory & Status Ledger
Read `.agents/PROJECT_STATUS.json` to get the current machine-readable status of all tasks.
Read `.agents/STATUS.md` for human-readable notes, verification outputs, and task logs.

## Live Production Deployment Playbook
When deploying to live production (Web, Android, iOS, Database, Razorpay):
Read `.agents/LIVE_DEPLOYMENT_PLAYBOOK.md` or invoke the `@skill:live-deployment` skill for step-by-step commands and verification criteria.
