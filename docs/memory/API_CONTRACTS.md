[STATE]

# API Contracts Registry

**Last Updated:** 2026-09-11  
**Total Endpoints:** 49 REST APIs  
**Base URL:** `http://localhost:3000/api/v1` (local) | `https://primerides.com/api/v1` (production)

---

## Response Envelope Standard

All API responses follow this structure:

```typescript
{
  success: boolean;
  data?: any;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}
```

---

## 1. AUTHENTICATION ENDPOINTS

### POST /api/v1/auth/register
**Description:** Register new customer account  
**Authentication:** None (public)  
**Rate Limit:** 5 requests/minute per IP

**Request Body:**
```typescript
{
  full_name: string;      // min 2 chars
  phone: string;          // format: 10 digits
  email?: string;         // optional, valid email
  password: string;       // min 8 chars
}
```

**Response (201):**
```typescript
{
  success: true,
  data: {
    user: {
      id: number,
      full_name: string,
      phone: string,
      email: string | null,
      is_verified: boolean
    },
    token: string,        // JWT access token (15 min)
    refreshToken: string  // Refresh token (30 days)
  }
}
```

**Errors:**
- `400` - Validation error (phone exists, weak password)
- `500` - Server error

---

### POST /api/v1/auth/login
**Description:** Customer login with password  
**Authentication:** None (public)  
**Rate Limit:** 5 requests/minute per IP

**Request Body:**
```typescript
{
  phone: string;     // 10 digits
  password: string;
}
```

**Response (200):**
```typescript
{
  success: true,
  data: {
    user: {
      id: number,
      full_name: string,
      phone: string,
      email: string | null,
      is_verified: boolean
    },
    token: string,
    refreshToken: string
  }
}
```

**Errors:**
- `400` - Invalid credentials
- `429` - Too many attempts
- `500` - Server error

---

### POST /api/v1/auth/refresh
**Description:** Refresh expired access token  
**Authentication:** Refresh token in cookie or header  
**Rate Limit:** 20 requests/hour per user

**Request Body:**
```typescript
{
  refreshToken: string;
}
```

**Response (200):**
```typescript
{
  success: true,
  data: {
    token: string,          // New access token
    refreshToken: string    // Rotated refresh token
  }
}
```

**Errors:**
- `401` - Invalid or expired refresh token
- `500` - Server error

---

### POST /api/v1/auth/logout
**Description:** Revoke session and clear cookies  
**Authentication:** Bearer token required  
**Rate Limit:** None

**Request Body:** None

**Response (200):**
```typescript
{
  success: true,
  data: { message: "Logged out successfully" }
}
```

---

### GET /api/v1/auth/me
**Description:** Get current authenticated user profile  
**Authentication:** Bearer token required  
**Rate Limit:** 60 requests/minute

**Response (200):**
```typescript
{
  success: true,
  data: {
    id: number,
    full_name: string,
    phone: string,
    email: string | null,
    avatar_url: string | null,
    is_verified: boolean,
    created_at: string
  }
}
```

**Errors:**
- `401` - Unauthorized (no token or expired)

---

## 2. PUBLIC FLEET & BOOKING ENDPOINTS

### GET /api/v1/cars
**Description:** List available vehicles with filters  
**Authentication:** None (public)  
**Rate Limit:** 100 requests/minute per IP

**Query Parameters:**
```typescript
{
  location_id?: number;    // Filter by location
  category_id?: number;    // Filter by category
  available?: boolean;     // Only show available cars
  limit?: number;          // Default 20, max 100
  page?: number;           // Default 1
}
```

**Response (200):**
```typescript
{
  success: true,
  data: {
    cars: Array<{
      id: number,
      name: string,
      slug: string,
      brand: string,
      category: { id: number, name: string },
      location: { id: number, city: string, name: string } | null,
      price_per_day: string,
      security_deposit: string,
      transmission: string,
      seats: number,
      fuel_type: string,
      primary_image: string,
      badge: string | null,
      is_available: boolean,
      rental_plans: Array<{
        id: number,
        name: string,
        free_km: number,
        price: string,
        extra_km_rate: string
      }>
    }>
  },
  meta: {
    total: number,
    page: number,
    limit: number
  }
}
```

---

### GET /api/v1/cars/[slug]
**Description:** Get vehicle details by slug  
**Authentication:** None (public)

**Response (200):**
```typescript
{
  success: true,
  data: {
    id: number,
    name: string,
    slug: string,
    brand: string,
    description: string,
    features: string[],
    location: { id: number, city: string, name: string },
    rental_plans: Array<{
      id: number,
      name: string,
      free_km: number,
      price: string,
      security_deposit: string,
      extra_km_rate: string,
      duration_days: number
    }>,
    primary_image: string,
    gallery_images: string[]
  }
}
```

**Errors:**
- `404` - Vehicle not found

---

### GET /api/v1/locations
**Description:** List all active rental locations  
**Authentication:** None (public)

**Response (200):**
```typescript
{
  success: true,
  data: Array<{
    id: number,
    city: string,
    name: string,
    slug: string,
    address: string | null,
    is_active: boolean
  }>
}
```

---

### POST /api/v1/bookings
**Description:** Create new booking reservation  
**Authentication:** Bearer token required (customer)  
**Rate Limit:** 10 bookings/hour per user

**Request Body:**
```typescript
{
  car_id: number,
  rental_plan_id: number,
  start_date: string,        // ISO 8601 format
  end_date: string,          // ISO 8601 format
  pickup_location?: string,
  drop_location?: string,
  with_chauffeur: boolean,
  coupon_code?: string,
  notes?: string
}
```

**Response (201):**
```typescript
{
  success: true,
  data: {
    id: number,
    booking_code: string,
    customer_id: number,
    car: { id: number, name: string },
    rental_plan: { id: number, name: string, free_km: number },
    start_date: string,
    end_date: string,
    total_amount: string,
    security_deposit: string,
    discount_amount: string,
    status: "pending",
    created_at: string
  }
}
```

**Errors:**
- `400` - Invalid dates, past dates, vehicle unavailable
- `401` - Not authenticated
- `409` - Vehicle already booked for selected dates
- `500` - Server error

---

### GET /api/v1/bookings
**Description:** Get customer's booking history  
**Authentication:** Bearer token required (customer)

**Query Parameters:**
```typescript
{
  status?: string;  // pending, confirmed, active, completed, cancelled
  limit?: number;
  page?: number;
}
```

**Response (200):**
```typescript
{
  success: true,
  data: Array<{
    id: number,
    booking_code: string,
    car_name: string,
    location: { city: string },
    start_date: string,
    end_date: string,
    total_amount: string,
    status: string,
    created_at: string
  }>,
  meta: { total, page, limit }
}
```

---

### DELETE /api/v1/bookings/[id]
**Description:** Cancel booking (customer self-cancellation)  
**Authentication:** Bearer token required (customer)  
**Allowed Statuses:** pending, confirmed only

**Request Body:**
```typescript
{
  reason: string;  // Cancellation reason
}
```

**Response (200):**
```typescript
{
  success: true,
  data: { message: "Booking cancelled successfully" }
}
```

**Errors:**
- `400` - Cannot cancel (active/completed status)
- `401` - Not authenticated
- `403` - Not your booking
- `404` - Booking not found

---

## 3. PAYMENT ENDPOINTS

### POST /api/v1/payments/create-order
**Description:** Create Razorpay payment order  
**Authentication:** Bearer token required (customer)  
**Rate Limit:** 20 requests/hour per user

**Request Body:**
```typescript
{
  booking_id: number;
}
```

**Response (201):**
```typescript
{
  success: true,
  data: {
    order_id: string,          // Razorpay order ID
    amount: number,            // Amount in paise
    currency: string,          // "INR"
    booking_code: string,
    customer: {
      name: string,
      phone: string,
      email: string
    }
  }
}
```

**Errors:**
- `400` - Booking already paid, invalid booking
- `401` - Not authenticated
- `404` - Booking not found
- `500` - Razorpay error

---

### POST /api/v1/payments/verify
**Description:** Verify Razorpay payment signature  
**Authentication:** Bearer token required (customer)

**Request Body:**
```typescript
{
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
}
```

**Response (200):**
```typescript
{
  success: true,
  data: {
    verified: true,
    booking_id: number,
    booking_code: string,
    status: "confirmed",
    payment_id: string
  }
}
```

**Errors:**
- `400` - Invalid signature (HMAC mismatch)
- `401` - Not authenticated
- `500` - Server error

---

### POST /api/v1/payments/webhook
**Description:** Razorpay webhook handler (async events)  
**Authentication:** Razorpay webhook signature  
**Rate Limit:** None

**Request Headers:**
```
X-Razorpay-Signature: <HMAC SHA256 signature>
```

**Request Body:**
```typescript
{
  event: string,  // order.paid, payment.captured, payment.failed
  payload: {
    payment: { entity: {...} },
    order: { entity: {...} }
  }
}
```

**Response (200):**
```typescript
{
  success: true,
  data: { received: true }
}
```

**Errors:**
- `400` - Invalid signature
- `500` - Processing error (returns 200 to prevent retries)

---

## 4. COUPON ENDPOINTS

### POST /api/v1/coupons/validate
**Description:** Validate coupon code and calculate discount  
**Authentication:** Bearer token required (customer)

**Request Body:**
```typescript
{
  code: string,
  booking_amount: number
}
```

**Response (200):**
```typescript
{
  success: true,
  data: {
    valid: boolean,
    code: string,
    discount_type: "percentage" | "fixed",
    discount_value: number,
    discount_amount: number,
    final_amount: number,
    message?: string
  }
}
```

**Errors:**
- `400` - Invalid or expired coupon
- `401` - Not authenticated

---

## 5. CMS PUBLIC ENDPOINTS

### GET /api/v1/cms/testimonials
**Description:** Get featured customer testimonials  
**Authentication:** None (public)

**Response (200):**
```typescript
{
  success: true,
  data: Array<{
    id: number,
    client_name: string,
    role_title: string,
    rating: number,
    comment: string,
    avatar_url: string | null,
    is_featured: boolean
  }>
}
```

---

### GET /api/v1/cms/settings
**Description:** Get public site settings (phone, email, address)  
**Authentication:** None (public)

**Response (200):**
```typescript
{
  success: true,
  data: {
    contact: {
      phone: string,
      phone_display: string,
      whatsapp: string,
      email: string
    },
    locations: Array<{
      name: string,
      address: string
    }>
  }
}
```

---

### GET /api/v1/cms/header
**Description:** Get header navigation configuration  
**Authentication:** None (public)

**Response (200):**
```typescript
{
  success: true,
  data: {
    logo: { url: string, width: number, height: number },
    nav_links: Array<{ label: string, href: string }>,
    cta_buttons: {
      auth: { label: string, href: string },
      phone: { label: string, number: string },
      whatsapp: { label: string, number: string }
    }
  }
}
```

---

### GET /api/v1/cms/faqs
**Description:** Get frequently asked questions  
**Authentication:** None (public)

**Query Parameters:**
```typescript
{
  category?: string;  // General, Booking, Payment, etc.
}
```

**Response (200):**
```typescript
{
  success: true,
  data: Array<{
    id: number,
    category: string,
    question: string,
    answer: string,
    sort_order: number
  }>
}
```

---

### GET /api/v1/cms/blogs
**Description:** Get published blog articles  
**Authentication:** None (public)

**Query Parameters:**
```typescript
{
  category_id?: number,
  limit?: number,
  page?: number
}
```

**Response (200):**
```typescript
{
  success: true,
  data: Array<{
    id: number,
    title: string,
    slug: string,
    category: { name: string },
    summary: string,
    featured_image: string,
    author_name: string,
    read_time: string,
    published_at: string
  }>,
  meta: { total, page, limit }
}
```

---

### POST /api/v1/contact
**Description:** Submit contact form inquiry  
**Authentication:** None (public)  
**Rate Limit:** 5 requests/hour per IP

**Request Body:**
```typescript
{
  name: string,
  phone: string,
  email?: string,
  subject?: string,
  message: string
}
```

**Response (201):**
```typescript
{
  success: true,
  data: { message: "Inquiry submitted successfully" }
}
```

---

## 6. CUSTOMER PORTAL ENDPOINTS

### GET /api/v1/customer/documents
**Description:** Get customer's uploaded KYC documents  
**Authentication:** Bearer token required (customer)

**Response (200):**
```typescript
{
  success: true,
  data: Array<{
    id: number,
    type: string,  // driving_license_front, driving_license_back, aadhaar
    file_name: string,
    status: string,  // pending, verified, rejected
    rejection_reason: string | null,
    verified_at: string | null,
    created_at: string
  }>
}
```

---

### POST /api/v1/customer/documents
**Description:** Upload KYC document  
**Authentication:** Bearer token required (customer)  
**Content-Type:** multipart/form-data

**Request Body:**
```typescript
{
  type: "driving_license_front" | "driving_license_back" | "aadhaar",
  file: File  // Max 8MB, JPEG/PNG/WebP only
}
```

**Response (201):**
```typescript
{
  success: true,
  data: {
    id: number,
    type: string,
    file_name: string,
    status: "pending"
  }
}
```

**Errors:**
- `400` - Invalid file type, file too large
- `401` - Not authenticated

---

### GET /api/v1/customer/payments
**Description:** Get customer's payment transactions  
**Authentication:** Bearer token required (customer)

**Response (200):**
```typescript
{
  success: true,
  data: Array<{
    id: number,
    booking_code: string,
    amount: string,
    currency: string,
    status: string,
    payment_method: string,
    created_at: string
  }>
}
```

---

### GET /api/v1/documents/[id]/file
**Description:** Download KYC document with signed URL  
**Authentication:** Bearer token required (customer or admin)

**Response (200):** File stream or redirect to signed URL

**Errors:**
- `401` - Not authenticated
- `403` - Not authorized (not your document)
- `404` - Document not found

---

## 7. ADMIN ENDPOINTS

All admin endpoints require:
- **Authentication:** Bearer token (admin user)
- **RBAC:** Specific permissions checked per endpoint
- **Rate Limit:** 60 requests/minute per admin

### GET /api/v1/admin/bookings
**Description:** List all bookings with search/filter  
**Permission:** `bookings.view`

**Query Parameters:**
```typescript
{
  status?: string,
  search?: string,      // Booking code, customer name, phone, email
  dateFrom?: string,
  dateTo?: string,
  location_id?: number,
  limit?: number,
  page?: number
}
```

**Response (200):**
```typescript
{
  success: true,
  data: Array<{
    id: number,
    booking_code: string,
    customer: { full_name: string, phone: string },
    car_name: string,
    location: { city: string },
    start_date: string,
    end_date: string,
    total_amount: string,
    status: string,
    coupon_code: string | null,
    created_at: string
  }>,
  meta: { total, page, limit }
}
```

---

### POST /api/v1/admin/bookings/[id]/status
**Description:** Update booking status  
**Permission:** `bookings.manage`

**Request Body:**
```typescript
{
  status: "pending" | "confirmed" | "active" | "completed" | "cancelled",
  notes?: string,
  reason?: string  // Required for cancellation
}
```

**Response (200):**
```typescript
{
  success: true,
  data: {
    id: number,
    booking_code: string,
    status: string,
    updated_at: string
  }
}
```

**Errors:**
- `400` - Invalid status transition, missing verification for active
- `403` - Permission denied

---

### GET /api/v1/admin/cars
**Description:** List all vehicles (including deleted)  
**Permission:** `fleet.view`

**Response (200):**
```typescript
{
  success: true,
  data: Array<{
    id: number,
    name: string,
    location: { city: string },
    is_available: boolean,
    deleted_at: string | null
  }>
}
```

---

### POST /api/v1/admin/cars
**Description:** Create new vehicle  
**Permission:** `fleet.manage`

**Request Body:**
```typescript
{
  name: string,
  slug: string,
  brand: string,
  category_id: number,
  location_id: number,
  price_per_day: number,
  security_deposit: number,
  transmission: string,
  seats: number,
  fuel_type: string,
  primary_image: string,
  description?: string,
  features?: string[]
}
```

---

### GET /api/v1/admin/documents
**Description:** List KYC documents for review  
**Permission:** `documents.manage`

**Query Parameters:**
```typescript
{
  status?: "pending" | "verified" | "rejected",
  customer_id?: number
}
```

**Response (200):**
```typescript
{
  success: true,
  data: Array<{
    id: number,
    customer: { full_name: string, phone: string },
    type: string,
    file_name: string,
    status: string,
    created_at: string
  }>
}
```

---

### POST /api/v1/admin/documents/[id]/approve
**Description:** Approve KYC document  
**Permission:** `documents.manage`

**Response (200):**
```typescript
{
  success: true,
  data: { message: "Document approved", status: "verified" }
}
```

---

### POST /api/v1/admin/documents/[id]/reject
**Description:** Reject KYC document with reason  
**Permission:** `documents.manage`

**Request Body:**
```typescript
{
  reason: string  // Required
}
```

---

### GET /api/v1/admin/customers
**Description:** List all registered customers  
**Permission:** `customers.view`

---

### GET /api/v1/admin/locations
**Description:** List all rental locations  
**Permission:** `fleet.view`

---

### POST /api/v1/admin/locations
**Description:** Create new rental location  
**Permission:** `fleet.manage`

**Request Body:**
```typescript
{
  city: string,
  name: string,
  slug: string,
  address?: string,
  is_active: boolean
}
```

---

### GET /api/v1/admin/testimonials
**Description:** List all testimonials  
**Permission:** `content.view`

---

### POST /api/v1/admin/testimonials
**Description:** Create testimonial  
**Permission:** `content.manage`

**Request Body:**
```typescript
{
  client_name: string,
  role_title?: string,
  rating: number,  // 1-5
  comment: string,
  avatar_url?: string,
  is_featured: boolean
}
```

---

### GET /api/v1/admin/coupons
**Description:** List all promotional coupons  
**Permission:** `coupons.view`

---

### POST /api/v1/admin/coupons
**Description:** Create coupon code  
**Permission:** `coupons.manage`

**Request Body:**
```typescript
{
  code: string,  // Unique
  discount_type: "percentage" | "fixed",
  discount_value: number,
  min_booking_amount?: number,
  max_discount_amount?: number,
  valid_from?: string,
  valid_until?: string,
  usage_limit?: number,
  is_active: boolean
}
```

---

### GET /api/v1/admin/leads
**Description:** List contact inquiries  
**Permission:** `leads.view`

---

### POST /api/v1/admin/upload
**Description:** Upload image/file to storage  
**Permission:** Any admin
**Content-Type:** multipart/form-data

**Request Body:**
```typescript
{
  file: File,        // Max 8MB
  folder: string     // "vehicles", "blogs", "testimonials"
}
```

**Response (201):**
```typescript
{
  success: true,
  data: {
    url: string,     // Public URL
    filename: string,
    size: number
  }
}
```

---

### GET /api/v1/admin/settings
**Description:** Get site-wide settings  
**Permission:** `settings.view`

---

### PUT /api/v1/admin/settings
**Description:** Update site-wide settings  
**Permission:** `settings.manage`

---

### GET /api/v1/admin/notifications
**Description:** Get notification templates  
**Permission:** `settings.view`

---

### GET /api/v1/admin/cms/website
**Description:** Get website CMS config  
**Permission:** `content.view`

---

### PUT /api/v1/admin/cms/website
**Description:** Update website CMS config  
**Permission:** `content.manage`

---

## ERROR CODE REFERENCE

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (no token or expired) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate, booking overlap) |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |

---

## RATE LIMITING SUMMARY

| Endpoint Group | Limit | Window |
|----------------|-------|--------|
| Auth (login/register) | 5 requests | per minute per IP |
| Public APIs | 100 requests | per minute per IP |
| Authenticated User | 60 requests | per minute |
| Booking Creation | 10 bookings | per hour per user |
| Payment APIs | 20 requests | per hour per user |
| Admin APIs | 60 requests | per minute per admin |
| Contact Form | 5 submissions | per hour per IP |

---

**Note:** All timestamps are in ISO 8601 format. All monetary amounts are in INR (Indian Rupees) and returned as strings to preserve precision.
