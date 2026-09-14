import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getPrismaClient(): PrismaClient {
  // If external DATABASE_URL is provided (e.g. Postgres / Supabase / Neon), use it directly
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && !dbUrl.startsWith("file:")) {
    return new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
  }

  // If running in a serverless environment like Vercel (read-only filesystem except /tmp)
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDbPath = path.join("/tmp", "dev.db");
    
    // Copy the pre-seeded SQLite database to writable /tmp if not already copied
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
            console.error("Failed to copy database to /tmp:", err);
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
  }

  // Local development fallback
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? getPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
