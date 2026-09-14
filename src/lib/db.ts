import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getPrismaClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL;

  // If Postgres / Supabase / Neon or explicit connection is provided
  if (dbUrl && !dbUrl.startsWith("file:")) {
    return new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
  }

  // If running in Vercel serverless environment
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    try {
      // Dynamic require to prevent client bundle contamination
      const fs = require("fs");
      const path = require("path");
      const tmpDbPath = path.join("/tmp", "dev.db");

      if (!fs.existsSync(tmpDbPath)) {
        const searchPaths = [
          path.join(process.cwd(), "prisma", "dev.db"),
          path.join(process.cwd(), "dev.db"),
          path.join(__dirname, "..", "..", "prisma", "dev.db"),
          path.join(__dirname, "..", "prisma", "dev.db"),
        ];

        for (const src of searchPaths) {
          if (fs.existsSync(src)) {
            try {
              fs.copyFileSync(src, tmpDbPath);
              break;
            } catch (err) {
              console.error("Error copying SQLite db to /tmp:", err);
            }
          }
        }
      }

      return new PrismaClient({
        datasources: {
          db: {
            url: `file:${tmpDbPath}`,
          },
        },
        log: ["error"],
      });
    } catch {
      return new PrismaClient({ log: ["error"] });
    }
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? getPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
