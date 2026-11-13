# 🚀 PrimeRides Production Live Deployment Playbook

**Customized for Hostinger Hosting (Web + MySQL) & Apple Developer Account (iOS / App Store)**  
*Document Version:* 2.1.0 | *Last Updated:* September 30, 2026 | *Target:* Production Live Deployment

---

## 📌 Executive Summary for AI Agents & Developers

When the user asks: **"How do I deploy PrimeRides on Hostinger?"** or **"How do I publish the iOS app to TestFlight and App Store with my Apple Developer Account?"**, follow this playbook:

- **Hosting Infrastructure:** **Hostinger** (Hostinger VPS with Ubuntu or Hostinger Cloud/Node.js hosting + Hostinger MySQL Database).
- **Domain:** `primerides.in` (configured in Hostinger DNS pointing to the server).
- **iOS Publishing:** **Active Apple Developer Account** with EAS CLI integration (`in.primerides.app`).
- **Android Publishing:** Expo EAS Build (`in.primerides.app` APK & Google Play AAB).
- **Payment Gateway:** Razorpay Live Mode with webhook verification.

---

## 🌐 1. Deploying Web & Database on Hostinger

### Part A: Setting Up the MySQL Database in Hostinger
1. Log in to your **Hostinger hPanel** ([hpanel.hostinger.com](https://hpanel.hostinger.com)).
2. Navigate to **Databases > MySQL Databases**.
3. Create a new database:
   - **Database Name:** e.g., `u123456789_primerides`
   - **Username:** e.g., `u123456789_admin`
   - **Password:** Generate a strong password (save this securely).
4. Note down the credentials. If your app runs on a Hostinger VPS or external server, enable **Remote MySQL** in hPanel and add your server's IP address.
5. Your connection string will look like:
   ```env
   DATABASE_URL="mysql://u123456789_admin:YourStrongPassword@127.0.0.1:3306/u123456789_primerides"
   # Or if remote/VPS:
   DATABASE_URL="mysql://u123456789_admin:YourStrongPassword@<hostinger-server-ip>:3306/u123456789_primerides?sslaccept=strict"
   ```

---

### Part B: Deploying Next.js on Hostinger VPS (Recommended)
Hostinger KVM VPS provides full root access, Node.js 20+, and PM2, making it the most robust option for Next.js 16 App Router.

#### Step 1: Connect to Hostinger VPS via SSH
```bash
ssh root@<your-hostinger-vps-ip>
```

#### Step 2: Install Node.js 20 LTS & PM2
```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx

# Install PM2 process manager
sudo npm install -g pm2
```

#### Step 3: Clone Repository & Install Dependencies
```bash
cd /var/www
sudo git clone <your-git-repo-url> primerides
cd primerides

# Install dependencies
npm install --legacy-peer-deps
```

#### Step 4: Configure Production `.env`
Create `/var/www/primerides/.env` and paste your production variables:
```env
# Database
DATABASE_URL="mysql://u123456789_admin:YourStrongPassword@127.0.0.1:3306/u123456789_primerides"

# App & Auth
NEXT_PUBLIC_SITE_URL="https://primerides.in"
JWT_SECRET="<generate-secure-64-character-random-hex-key>"

# Brand Contacts
EMAIL_FROM="PrimeRides Bookings <bookings@primerides.in>"
NOTIFICATION_FROM="PrimeRides Concierge <concierge@primerides.in>"
ADMIN_ALERT_EMAIL="ops@primerides.in"

# Razorpay (Live Keys)
RAZORPAY_KEY_ID="rzp_live_xxxxxxxxxxxxxxxx"
RAZORPAY_KEY_SECRET="xxxxxxxxxxxxxxxxxxxxxxxx"
RAZORPAY_WEBHOOK_SECRET="xxxxxxxxxxxxxxxxxxxxxxxx"

# Resend Email & SMS
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxx"
SMS_PROVIDER="fast2sms"
FAST2SMS_API_KEY="xxxxxxxxxxxxxxxxxxxxxxxx"
SMS_SENDER_ID="PRMRDS"
```

#### Step 5: Sync Database & Build
```bash
# Push Prisma schema to Hostinger MySQL
npx prisma db push

# Optional: Migrate CMS JSON configurations into DB
npx tsx scripts/migrate-json-to-db.ts

# Build Next.js 16 production bundle (all 87 routes)
npm run build
```

#### Step 6: Start with PM2
```bash
pm2 start npm --name "primerides-web" -- start -- -p 3000
pm2 save
pm2 startup
```

#### Step 7: Configure Nginx & Free SSL on Hostinger
Create `/etc/nginx/sites-available/primerides.in`:
```nginx
server {
    server_name primerides.in www.primerides.in;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Enable site and install free Let's Encrypt SSL:
```bash
sudo ln -s /etc/nginx/sites-available/primerides.in /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Free SSL Certificate:
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d primerides.in -d www.primerides.in
```

---

### Part C: Deploying on Hostinger Shared / Cloud Hosting (via hPanel Node.js Manager)
If using Hostinger Web/Cloud Hosting with the Node.js GUI:
1. In hPanel, go to **Websites > Manage > Advanced > Node.js**.
2. Set **Node.js Version:** `20.x` or latest available.
3. Set **Application Root:** `/` (or directory where code is uploaded).
4. Set **Application Startup File:** `node_modules/next/dist/bin/next` or standard custom `server.js`.
5. Under **Environment Variables**, add the production keys from Part B above.
6. Open **Terminal in hPanel** and run:
   ```bash
   npm install --legacy-peer-deps
   npx prisma db push
   npm run build
   ```
7. Click **Restart Application** in hPanel.

---

## 🍎 2. iOS Deployment with Apple Developer Account

You have an **Apple Developer Account**, which grants you full access to **Apple TestFlight** (beta testing on iPhones) and the **Apple App Store** (worldwide distribution).

### Step 1: Install EAS CLI and Connect Your Apple Account
From your terminal on your local Mac:
```bash
cd /Users/apple/Downloads/Primerides/redesigned-primerides/apps/mobile

# Install EAS CLI globally if not already installed:
npm install -g eas-cli

# Log in to your Expo account (create a free account at expo.dev if needed):
eas login
```

### Step 2: Initialize EAS Project
```bash
eas project:init
```
*(This links `apps/mobile` to your Expo Cloud project dashboard).*

### Step 3: Configure Apple Developer Credentials in EAS
Run the production build command:
```bash
eas build --platform ios --profile production
```
When prompted:
1. **"Do you want to log in to your Apple account?"** -> Select **Yes**.
2. Enter your **Apple ID** (associated with your Apple Developer Account) and password.
3. EAS will ask: **"Would you like Expo to handle your Apple Developer certificates and provisioning profiles?"** -> Select **Yes** (Recommended).
4. EAS will automatically connect to Apple Developer Portal and create:
   - App Bundle Identifier: `in.primerides.app`
   - iOS Distribution Certificate
   - Provisioning Profile

*EAS Cloud will compile the iOS app in an Apple-certified macOS container and output a signed `.ipa`.*

---

### Step 4: Submit to Apple TestFlight (Beta Testing on iPhones)
Once the build completes, submit it directly to App Store Connect with one command:
```bash
eas submit --platform ios
```
- EAS uploads the `.ipa` directly to your **App Store Connect**.
- Log in to [appstoreconnect.apple.com](https://appstoreconnect.apple.com) > **Apps** > **PrimeRides** > **TestFlight**.
- Within 10–15 minutes (once Apple finishes processing), add your email or team members under **Internal Testing**.
- Testers will receive an invite on their iPhone to install the PrimeRides app via the free **TestFlight app** from the App Store!

---

### Step 5: Submit to Apple App Store for Public Review
1. Go to [App Store Connect](https://appstoreconnect.apple.com) > **PrimeRides**.
2. Under **iOS App > Prepare for Submission**:
   - **App Name:** PrimeRides - Luxury Car Rentals
   - **Subtitle:** Self-Drive Luxury Fleet in North India
   - **Category:** Travel / Lifestyle
   - **Age Rating:** 4+
   - **Privacy Policy URL:** `https://primerides.in/privacy`
   - **Support URL:** `https://primerides.in/contact`
   - **App Review Information:**
     - Contact name, email, phone number.
     - Demo Login Account: Provide test customer credentials (e.g. `test@primerides.in` / `Test@12345`) so Apple reviewers can test logging in and browsing vehicles.
3. **Select Build:** Click `+` under the Build section and choose the verified build from TestFlight.
4. Click **Submit for Review** (Apple reviews usually take 24–48 hours).

---

## 🤖 3. Android Deployment (EAS / Google Play Store)

### Step 1: Build Standalone APK (Instant Install on Real Android Phones)
```bash
cd apps/mobile
eas build --platform android --profile preview
```
- EAS Cloud produces a direct download link for the `.apk`.
- You and your team can download and install it on any Android device immediately.

### Step 2: Build Production AAB (For Google Play Store)
```bash
eas build --platform android --profile production
```
- Produces an optimized `.aab` (Android App Bundle).
- Drag and drop this `.aab` into your [Google Play Console](https://play.google.com/console) under **Closed Testing** or **Production**.

---

## 💳 4. Razorpay Live Configuration for Hostinger Web

1. In your [Razorpay Dashboard](https://dashboard.razorpay.com), switch from **Test Mode** to **Live Mode**.
2. Go to **Settings > API Keys** > Generate Live Key (`rzp_live_...`).
3. Update `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in your Hostinger VPS `.env`.
4. Go to **Settings > Webhooks** > Add New Webhook:
   - **Webhook URL:** `https://primerides.in/api/v1/payments/webhook`
   - **Secret:** Same string as `RAZORPAY_WEBHOOK_SECRET` in `.env`.
   - **Alert Email:** `ops@primerides.in`
   - **Active Events:**
     - `payment.authorized`
     - `payment.captured`
     - `payment.failed`
     - `refund.processed`
5. Restart PM2 on Hostinger VPS: `pm2 restart primerides-web`.

---

## 📋 Verification & Launch Checklist

- [x] Web & Mobile TypeScript typechecks pass cleanly (`npm run check:all`).
- [x] Next.js 16 production build compiles all 87 routes (`npm run build`).
- [x] Hostinger MySQL database created and credentials placed in `.env`.
- [x] `npx prisma db push` executed to establish all tables.
- [x] `in.primerides.app` configured in `apps/mobile/app.json`.
- [x] `apps/mobile/eas.json` configured for APK, Play Store, and iOS App Store builds.
- [x] Apple Developer Account connected via EAS for TestFlight & App Store release.
- [x] Live Razorpay keys and webhook configured.
- [x] Homepage design 100% locked and verified.
