# PrimeRides Admin & Mobile API — Integration Playbook

This playbook provides step-by-step instructions on how to activate and link the isolated `admin/` foundation into the main `Primerides` Next.js application whenever you are ready.

---

## 🚀 Activation Options

### Option 1: Symlink / Direct App Router Mapping (Instant)

When you decide to expose the admin panel on `/admin` and the mobile APIs on `/api/v1/*`:

1. **Install Prisma & Dependencies**:
   ```bash
   npm install prisma @prisma/client
   ```

2. **Initialize Database**:
   Set `DATABASE_URL` in your `.env` (MySQL or PostgreSQL):
   ```env
   DATABASE_URL="mysql://root@localhost:3306/primerides_db"
   JWT_SECRET="primerides-prod-secret-2026"
   ```
   Generate the Prisma client:
   ```bash
   npx prisma generate --schema=admin/prisma/schema.prisma
   npx prisma db push --schema=admin/prisma/schema.prisma
   ```

3. **Link Admin Pages to App Router**:
   Copy or import the components into `src/app/admin/`:
   ```bash
   mkdir -p src/app/admin
   # The admin components and server actions can be imported directly from '@/admin/src/...'
   ```

4. **Link Mobile REST APIs to App Router**:
   Create symlink or copy `admin/src/api/v1` into `src/app/api/v1`:
   ```bash
   cp -r admin/src/api/v1 src/app/api/
   ```

---

## 🛡️ Admin Security & Middleware

Create a Next.js middleware file `src/middleware.ts` to protect all `/admin` routes:

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "../admin/src/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /admin routes (except /admin/login and static assets)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = req.cookies.get("primerides_admin_token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    const payload = await verifyToken(token);
    if (!payload || payload.type !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

---

## 📱 Mobile App (Android / iOS) Integration

All mobile app requests authenticate using the header:
```http
Authorization: Bearer <CUSTOMER_JWT_TOKEN>
```
No browser cookies are required for mobile apps, ensuring seamless compatibility with Retrofit (Android) and URLSession / Alamofire (iOS).
