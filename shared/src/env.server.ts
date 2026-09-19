import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),

  DATABASE_URL: z.string().url(),

  PORT: z.coerce.number().default(4000),

  JWT_SECRET: z.string().min(32, "JWT_SECRET should be at least 32 characters"),

  CORS_ORIGIN: z.string().url(),

  LOG_LEVEL: z.enum(["error", "warn", "info", "http", "debug"]).optional(),

  JWT_ACCESS_EXPIRY: z.string().default("15m"),
  JWT_REFRESH_EXPIRY: z.string().default("7d"),

  IMAGEKIT_PUBLIC_KEY: z.string(),
  IMAGEKIT_PRIVATE_KEY: z.string(),
  IMAGEKIT_URL_ENDPOINT: z.url(),
  REDIS_URL: z.string(),
  REDIS_TLS: z.enum(["true", "false"]).default("false"),
  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
  APP_URL: z.url().default("http://localhost:3000"),
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
