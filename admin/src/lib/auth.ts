/**
 * @deprecated Legacy adapter. Use @/server/auth directly.
 */
export * from "@/server/auth";

import { createAccessToken, verifyAccessToken } from "@/server/auth";

// Backward compatibility alias
export const createToken = createAccessToken;
export const verifyToken = verifyAccessToken;
