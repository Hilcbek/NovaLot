import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),

  // Database
  DATABASE_URL: z.string().url(),

  PORT: z.coerce.number().default(4000),

  // Auth — must match the Next.js side exactly
  JWT_SECRET: z.string().min(32, "JWT_SECRET should be at least 32 characters"),

  // CORS — the deployed Next.js app's URL
  CORS_ORIGIN: z.string().url(),

  // Logging
  LOG_LEVEL: z.enum(["error", "warn", "info", "http", "debug"]).optional(),

  // Auth
  JWT_ACCESS_EXPIRY: z.string().default("15m"),
  JWT_REFRESH_EXPIRY: z.string().default("7d"),

  // Stripe
  // STRIPE_SECRET_KEY: z.string().startsWith("sk_").nullable(),
  // STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_").nullable(),

  REDIS_URL: z.string(),
  REDIS_TLS: z.enum(["true", "false"]).default("false"),
  ARGON2_SECRET: z.string().min(32),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  RESEND_API_KEY: z.string().nonempty().startsWith("re"),
  EMAIL_FROM: z.string().default("NovaLot <noreply@auth.bfanta.com>"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables — check the log above.");
}

const env = parsed.data;
export { env };
