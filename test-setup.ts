import { vi } from "vitest";

// Expose vi as jest for legacy test compatibility
// @ts-expect-error polyfill jest global with vi
globalThis.jest = vi;
