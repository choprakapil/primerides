import { rateLimit } from 'express-rate-limit';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Rate Limiting Middleware for PrimeRides API
 * 
 * Protects against:
 * - API abuse
 * - Credential stuffing attacks
 * - DDoS attempts
 * - Automated scraping
 */

// In-memory store for development
// TODO: Use Redis in production for distributed rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
  message?: string;      // Custom error message
  keyGenerator?: (req: NextRequest) => string;  // Custom key generator
}

/**
 * Create a rate limiter with specified configuration
 */
export function createRateLimiter(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests, please try again later.',
    keyGenerator = (req) => getClientIdentifier(req)
  } = config;

  return async (req: NextRequest): Promise<NextResponse | null> => {
    const key = keyGenerator(req);
    const now = Date.now();
    
    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);
    
    // Reset if window expired
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + windowMs
      };
      rateLimitStore.set(key, entry);
    }
    
    // Increment request count
    entry.count++;
    
    // Check if limit exceeded
    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      
      return NextResponse.json(
        {
          success: false,
          error: message,
          retryAfter: retryAfter
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': entry.resetTime.toString()
          }
        }
      );
    }
    
    // Allow request - return null to continue
    return null;
  };
}

/**
 * Get client identifier for rate limiting
 * Uses IP address or authenticated user ID
 */
function getClientIdentifier(req: NextRequest): string {
  // Try to get IP from various headers (for proxy/CDN scenarios)
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  
  // For authenticated requests, use user ID from token if available
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    try {
      // Extract user info from JWT (simplified - actual implementation in auth routes)
      const token = authHeader.replace('Bearer ', '');
      // In production, decode JWT and get user ID
      // For now, use combination of IP + token hash
      const tokenHash = Buffer.from(token).toString('base64').substring(0, 10);
      return `auth:${ip}:${tokenHash}`;
    } catch {
      // If token parsing fails, fall back to IP
    }
  }
  
  return `ip:${ip}`;
}

/**
 * Predefined rate limiters for common scenarios
 */

// Auth endpoints - Very strict (5 requests per minute per IP)
export const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5,
  message: 'Too many authentication attempts. Please try again in 1 minute.'
});

// Public API endpoints - Moderate (100 requests per minute per IP)
export const publicApiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
  message: 'Too many requests. Please slow down.'
});

// Booking creation - Per user (10 bookings per hour)
export const bookingRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10,
  message: 'Too many booking attempts. Please try again later.'
});

// Payment endpoints - Per user (20 requests per hour)
export const paymentRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 20,
  message: 'Too many payment requests. Please try again later.'
});

// Contact form - Very strict (5 submissions per hour per IP)
export const contactRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5,
  message: 'Too many contact form submissions. Please try again later.'
});

// Admin API - Moderate (60 requests per minute per admin)
export const adminRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60,
  message: 'Too many admin requests. Please slow down.'
});

// Customer document upload - Limited (10 uploads per hour)
export const uploadRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10,
  message: 'Too many upload attempts. Please try again later.'
});

/**
 * Cleanup old entries periodically to prevent memory leaks
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000); // Clean up every minute

/**
 * Get current rate limit stats for monitoring
 */
export function getRateLimitStats() {
  return {
    totalKeys: rateLimitStore.size,
    entries: Array.from(rateLimitStore.entries()).map(([key, entry]) => ({
      key,
      count: entry.count,
      resetIn: Math.max(0, Math.ceil((entry.resetTime - Date.now()) / 1000))
    }))
  };
}
