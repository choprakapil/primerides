# PrimeRides Mobile API Specification (Android & iOS)

This document outlines the RESTful API contracts designed for native **Android (Kotlin)** and **iOS (Swift)** applications.

---

## Base URL
```
https://your-domain.com/api/v1
```

---

## 1. Authentication (`/api/v1/auth`)

### Register New Customer
* **Method**: `POST`
* **Endpoint**: `/api/v1/auth`
* **Body**:
```json
{
  "action": "register",
  "phone": "+971501234567",
  "fullName": "Alexander Vance",
  "email": "alex@example.com",
  "password": "SecurePassword123",
  "deviceType": "ios",
  "fcmToken": "fcm_device_token_here"
}
```
* **Response `(201 Created)`**:
```json
{
  "success": true,
  "message": "Customer registered successfully.",
  "data": {
    "token": "eyJhbGciOi...",
    "customer": {
      "id": 1,
      "fullName": "Alexander Vance",
      "phone": "+971501234567",
      "email": "alex@example.com"
    }
  }
}
```

---

### Customer Login
* **Method**: `POST`
* **Endpoint**: `/api/v1/auth`
* **Body**:
```json
{
  "action": "login",
  "phone": "+971501234567",
  "password": "SecurePassword123",
  "fcmToken": "fcm_token_optional"
}
```
* **Response `(200 OK)`**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOi...",
    "customer": {
      "id": 1,
      "fullName": "Alexander Vance",
      "phone": "+971501234567",
      "email": "alex@example.com",
      "avatarUrl": null
    }
  }
}
```

---

## 2. Fleet & Cars Catalog (`/api/v1/cars`)

* **Method**: `GET`
* **Endpoint**: `/api/v1/cars`
* **Query Parameters**:
  * `category` (string, optional) — e.g. `luxury-sedan`, `supercar`, `suv`
  * `brand` (string, optional) — e.g. `Rolls Royce`, `Mercedes`
  * `featured` (boolean, optional) — `true` / `false`
  * `page` (number, optional) — default `1`
  * `limit` (number, optional) — default `20`

* **Response `(200 OK)`**:
```json
{
  "success": true,
  "message": "Fleet retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Rolls Royce Ghost Series II",
      "slug": "rolls-royce-ghost-series-ii",
      "brand": "Rolls Royce",
      "price_per_day": "3500.00",
      "transmission": "Automatic",
      "seats": 4,
      "primary_image": "/cars/ghost.jpg",
      "badge": "Chauffeur Choice",
      "is_available": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 12,
    "totalPages": 1
  }
}
```

---

## 3. Booking & Rides (`/api/v1/bookings`)

### Create Booking Request
* **Method**: `POST`
* **Endpoint**: `/api/v1/bookings`
* **Headers**: `Authorization: Bearer <TOKEN>` (optional for guests, required for saved history)
* **Body**:
```json
{
  "fullName": "Alexander Vance",
  "phone": "+971501234567",
  "email": "alex@example.com",
  "carId": 1,
  "carName": "Rolls Royce Ghost Series II",
  "startDate": "2026-09-10T10:00:00.000Z",
  "endDate": "2026-09-12T10:00:00.000Z",
  "pickupLocation": "Dubai International Airport (DXB)",
  "dropLocation": "Burj Al Arab",
  "withChauffeur": true,
  "totalAmount": 7000.00,
  "source": "android",
  "notes": "VIP airport reception requested"
}
```

---

### Get My Bookings (Customer History)
* **Method**: `GET`
* **Endpoint**: `/api/v1/bookings`
* **Headers**: `Authorization: Bearer <TOKEN>` *(Required)*
