[STATE]

# Next Task: Phase 5 — Razorpay Payment Gateway Integration

## Primary Objective
Implement end-to-end Razorpay Payment Gateway processing for car rental bookings:
1. **Order Creation Endpoint**: `/api/v1/payments/create-order` (creates Razorpay order with server-side recalculated amount from immutable price snapshot).
2. **Webhook Verification & Idempotency**: `/api/v1/payments/webhook` with HMAC SHA256 signature verification, idempotency key ledger in `tbl_payments`, and transition from `pending` to `confirmed`.
3. **Refund / Cancellation Ledger**: Support deposit and booking refunds on cancellation.
4. **Customer Checkout Modal & Mobile SDK**: Razorpay Standard Checkout on web and custom SDK on Expo app.
