import { PrismaClient } from "@prisma/client";

declare global {
  var prismaClientInstance: PrismaClient | undefined;
}

export const prisma =
  globalThis.prismaClientInstance ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaClientInstance = prisma;
}

export default prisma;
