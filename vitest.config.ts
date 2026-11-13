import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./test-setup.ts"],
    env: {
      JWT_SECRET: "test_secret_key_minimum_32_characters_long_for_security",
      DATABASE_URL: "mysql://primerides:primerides_password@localhost:3306/primerides_db",
      RAZORPAY_KEY_SECRET: "test_razorpay_secret_key_12345",
    },
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "server-only": path.resolve(__dirname, "./scratch/empty.js"),
    },
  },
});
