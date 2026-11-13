---
name: live-deployment
description: Master execution playbook and step-by-step instructions for deploying PrimeRides live on Hostinger Hosting (VPS / Cloud + Hostinger MySQL) and Apple Developer Account (iOS TestFlight & App Store via EAS), plus Android Google Play Store and live Razorpay.
---

# PrimeRides Live Deployment Skill (Hostinger & Apple Developer Account)

This skill provides step-by-step instructions and technical references for deploying PrimeRides to production using Hostinger and an active Apple Developer Account.

## Master Reference Playbook
Read the full detailed guide at:
[`.agents/LIVE_DEPLOYMENT_PLAYBOOK.md`](file:///Users/apple/Downloads/Primerides/redesigned-primerides/.agents/LIVE_DEPLOYMENT_PLAYBOOK.md)

## Hostinger Quick Commands (Web & MySQL)
1. **Database:** Create MySQL in Hostinger hPanel > MySQL Databases (`u123456789_primerides`).
2. **Schema Push:** `npx prisma db push`
3. **Data Migration:** `npx tsx scripts/migrate-json-to-db.ts`
4. **Build & Start with PM2:**
   ```bash
   npm run build
   pm2 start npm --name "primerides-web" -- start -- -p 3000
   pm2 save
   ```
5. **Nginx Reverse Proxy:** Point `primerides.in` to `http://127.0.0.1:3000` + Let's Encrypt SSL via Certbot.

## Apple Developer Account Quick Commands (iOS)
Navigate to `apps/mobile`:
```bash
cd apps/mobile
npm install -g eas-cli
eas login

# Build Production iOS IPA (EAS handles Apple Developer certificates automatically):
eas build --platform ios --profile production

# Submit directly to Apple TestFlight / App Store:
eas submit --platform ios
```

## Android Commands (Google Play / APK)
```bash
cd apps/mobile
# Testing APK for instant phone installation:
eas build --platform android --profile preview
# Production Google Play Store AAB:
eas build --platform android --profile production
```

## Pre-Flight Check
Always run before deploying:
```bash
npm run check:all
npm run build
```
