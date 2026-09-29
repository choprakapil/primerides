import { hashPassword, verifyPassword } from '@/server/auth/passwords';

describe('Password Security (Argon2id)', () => {
  describe('Password Hashing', () => {
    it('should hash password with Argon2id', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash).toContain('$argon2id$');
      expect(hash.length).toBeGreaterThan(50);
    });

    it('should produce different hashes for same password', async () => {
      const password = 'TestPassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2); // Salt makes them different
    });

    it('should handle empty password', async () => {
      const password = '';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).toContain('$argon2id$');
    });

    it('should handle very long passwords', async () => {
      const password = 'A'.repeat(1000);
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).toContain('$argon2id$');
    });

    it('should handle special characters', async () => {
      const password = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).toContain('$argon2id$');
    });
  });

  describe('Password Verification', () => {
    it('should verify correct password', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword('WrongPassword', hash);

      expect(isValid).toBe(false);
    });

    it('should be case-sensitive', async () => {
      const password = 'TestPassword';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword('testpassword', hash);

      expect(isValid).toBe(false);
    });

    it('should reject empty password against real hash', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword('', hash);

      expect(isValid).toBe(false);
    });

    it('should handle malformed hash gracefully', async () => {
      const password = 'TestPassword123!';
      const malformedHash = 'not-a-valid-hash';
      
      await expect(verifyPassword(password, malformedHash)).rejects.toThrow();
    });
  });

  describe('Security Properties', () => {
    it('should use Argon2id variant', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);

      // Argon2id starts with $argon2id$
      expect(hash).toMatch(/^\$argon2id\$/);
    });

    it('should include salt in hash', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);

      // Argon2 format: $argon2id$v=19$m=65536,t=3,p=4$[salt]$[hash]
      const parts = hash.split('$');
      expect(parts.length).toBeGreaterThanOrEqual(5);
    });

    it('should be computationally expensive', async () => {
      const password = 'TestPassword123!';
      const start = Date.now();
      await hashPassword(password);
      const duration = Date.now() - start;

      // Should take at least 50ms (security parameter)
      expect(duration).toBeGreaterThan(10);
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle user registration flow', async () => {
      // User enters password during registration
      const userPassword = 'MySecurePassword123!';
      
      // Server hashes it
      const storedHash = await hashPassword(userPassword);
      
      // Later, user logs in with same password
      const loginPassword = 'MySecurePassword123!';
      const isAuthenticated = await verifyPassword(loginPassword, storedHash);
      
      expect(isAuthenticated).toBe(true);
    });

    it('should prevent brute force timing attacks', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);

      // Verify correct password
      const start1 = Date.now();
      await verifyPassword(password, hash);
      const duration1 = Date.now() - start1;

      // Verify wrong password (should take similar time)
      const start2 = Date.now();
      await verifyPassword('WrongPassword', hash);
      const duration2 = Date.now() - start2;

      // Timing difference should be minimal (< 20ms)
      expect(Math.abs(duration1 - duration2)).toBeLessThan(20);
    });
  });
});
