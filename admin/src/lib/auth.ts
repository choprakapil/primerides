/**
 * PrimeRides Universal Authentication Engine
 * Supports:
 *  1. Web Admin Panel (HTTP-Only Cookie: "primerides_admin_token")
 *  2. Mobile Applications for Android & iOS (Header: "Authorization: Bearer <token>")
 */

const JWT_SECRET = process.env.JWT_SECRET || "primerides-super-secure-jwt-secret-key-2026";

export interface TokenPayload {
  id: number;
  username?: string;
  email?: string;
  name?: string;
  role?: string;
  phone?: string;
  type: 'admin' | 'customer';
  exp?: number;
}

// Simple base64url encode/decode
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return Buffer.from(str, 'base64').toString('utf8');
}

// HMAC-SHA256 signature using Web Crypto API
async function sign(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return Buffer.from(signature)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export async function createToken(payload: Omit<TokenPayload, 'exp'>, expiresInSeconds: number = 86400 * 7): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const fullPayload: TokenPayload = { ...payload, exp };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = await sign(data, JWT_SECRET);

  return `${data}.${signature}`;
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;
    const data = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = await sign(data, JWT_SECRET);

    if (signature !== expectedSignature) return null;

    const payload: TokenPayload = JSON.parse(base64UrlDecode(encodedPayload));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}

// Password hashing helper (SHA-256 with salt)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + JWT_SECRET);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Buffer.from(hash).toString('hex');
}

export async function verifyPassword(password: string, hashed: string): Promise<boolean> {
  const computed = await hashPassword(password);
  return computed === hashed;
}
