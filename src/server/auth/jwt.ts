const JWT_SECRET = process.env.JWT_SECRET || "primerides_super_secure_jwt_secret_2026_fallback";

export interface TokenPayload {
  id: number;
  username?: string;
  email?: string;
  name?: string;
  role?: string;
  phone?: string;
  type: "admin" | "customer";
  sessionId?: string;
  exp?: number;
  iat?: number;
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  let s = str.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) {
    s += "=";
  }
  return Buffer.from(s, "base64").toString("utf8");
}

async function sign(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return Buffer.from(signature)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

/**
 * Creates a signed HS256 JWT using Web Crypto API.
 */
export async function createAccessToken(
  payload: Omit<TokenPayload, "exp" | "iat">,
  expiresInSeconds: number = 900 // 15 mins
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const fullPayload: TokenPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = await sign(data, JWT_SECRET);

  return `${data}.${signature}`;
}

/**
 * Verifies an HS256 JWT using Web Crypto API (Edge & Node compatible).
 */
export async function verifyAccessToken(token: string): Promise<TokenPayload | null> {
  try {
    const parts = token.split(".");
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
