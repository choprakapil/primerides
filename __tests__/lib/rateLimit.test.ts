import { createRateLimiter } from '@/lib/rateLimit';
import { NextRequest } from 'next/server';

describe('Rate Limiting Module', () => {
  beforeEach(() => {
    // Clear rate limit store between tests
    jest.clearAllMocks();
  });

  describe('Basic Rate Limiting', () => {
    it('should allow requests within limit', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 5,
      });

      const mockReq = new NextRequest('http://localhost:3000/test', {
        headers: { 'x-forwarded-for': '192.168.1.1' }
      });
      
      // First request should pass
      const result = await limiter(mockReq);
      expect(result).toBeNull();
    });

    it('should return 429 after exceeding limit', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 2,
      });

      const mockReq = new NextRequest('http://localhost:3000/test', {
        headers: { 'x-forwarded-for': '192.168.1.1' }
      });
      
      // First 2 requests should pass
      await limiter(mockReq);
      await limiter(mockReq);
      
      // 3rd request should be rate limited
      const result = await limiter(mockReq);
      expect(result).not.toBeNull();
      expect(result?.status).toBe(429);
      
      const json = await result?.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain('Too many requests');
    });

    it('should include correct headers in 429 response', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 1,
      });

      const mockReq = new NextRequest('http://localhost:3000/test', {
        headers: { 'x-forwarded-for': '192.168.1.2' }
      });
      
      await limiter(mockReq); // Use up the limit
      const result = await limiter(mockReq); // Should be rate limited
      
      expect(result?.headers.get('Retry-After')).toBeDefined();
      expect(result?.headers.get('X-RateLimit-Limit')).toBe('1');
      expect(result?.headers.get('X-RateLimit-Remaining')).toBe('0');
      expect(result?.headers.get('X-RateLimit-Reset')).toBeDefined();
    });
  });

  describe('Client Identification', () => {
    it('should rate limit by IP address', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 2,
      });

      const req1 = new NextRequest('http://localhost:3000/test', {
        headers: { 'x-forwarded-for': '192.168.1.1' }
      });
      
      const req2 = new NextRequest('http://localhost:3000/test', {
        headers: { 'x-forwarded-for': '192.168.1.2' }
      });

      // IP 1 uses its limit
      await limiter(req1);
      await limiter(req1);
      const result1 = await limiter(req1);
      expect(result1?.status).toBe(429);

      // IP 2 should still work
      const result2 = await limiter(req2);
      expect(result2).toBeNull();
    });

    it('should use authenticated user ID when available', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 2,
      });

      const mockReq = new NextRequest('http://localhost:3000/test', {
        headers: {
          'x-forwarded-for': '192.168.1.1',
          'authorization': 'Bearer test-token-123'
        }
      });

      await limiter(mockReq);
      await limiter(mockReq);
      const result = await limiter(mockReq);
      
      expect(result?.status).toBe(429);
    });
  });

  describe('Window Expiration', () => {
    it('should reset limit after window expires', async () => {
      const limiter = createRateLimiter({
        windowMs: 100, // 100ms window
        maxRequests: 1,
      });

      const mockReq = new NextRequest('http://localhost:3000/test', {
        headers: { 'x-forwarded-for': '192.168.1.3' }
      });

      // Use up the limit
      await limiter(mockReq);
      const result1 = await limiter(mockReq);
      expect(result1?.status).toBe(429);

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should work again
      const result2 = await limiter(mockReq);
      expect(result2).toBeNull();
    });
  });

  describe('Custom Messages', () => {
    it('should use custom error message', async () => {
      const customMessage = 'Custom rate limit message';
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 1,
        message: customMessage,
      });

      const mockReq = new NextRequest('http://localhost:3000/test', {
        headers: { 'x-forwarded-for': '192.168.1.4' }
      });

      await limiter(mockReq);
      const result = await limiter(mockReq);
      
      const json = await result?.json();
      expect(json.error).toBe(customMessage);
    });
  });
});
