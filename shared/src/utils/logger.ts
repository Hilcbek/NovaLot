import winston from "winston";

const { combine, timestamp, errors, json, colorize, printf } = winston.format;

const isProd = process.env.NODE_ENV === "production";

function buildFormat() {
  if (isProd) {
    // structured JSON — what your hosting platform's log capture
    // (Vercel, Fly, Render) and any log drain actually want to ingest
    return combine(timestamp(), errors({ stack: true }), json());
  }

  // human-readable, colorized console output for local dev
  return combine(
    colorize(),
    timestamp({ format: "HH:mm:ss" }),
    errors({ stack: true }),
    printf(({ level, message, timestamp, stack, service, ...meta }) => {
      const metaStr = Object.keys(meta).length
        ? ` ${JSON.stringify(meta)}`
        : "";
      return `${timestamp} [${service}] ${level}: ${stack ?? message}${metaStr}`;
    }),
  );
}

export function createLogger(service: string) {
  return winston.createLogger({
    level: process.env.LOG_LEVEL ?? (isProd ? "info" : "debug"),
    format: buildFormat(),
    defaultMeta: { service },
    transports: [new winston.transports.Console()],
  });
}

export type Logger = ReturnType<typeof createLogger>;