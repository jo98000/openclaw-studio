import { NextResponse, type NextRequest } from "next/server";

type RateLimitConfig = {
  windowMs: number;
  maxRequests: number;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

const cleanupExpired = () => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }
};

// Run cleanup every 60 seconds
let cleanupTimer: ReturnType<typeof setInterval> | null = null;
const ensureCleanup = () => {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(cleanupExpired, 60_000);
};

export const rateLimit = (config: RateLimitConfig) => {
  ensureCleanup();

  return (
    req: NextRequest,
  ): { allowed: boolean; headers: Record<string, string> } => {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const key = `${ip}:${req.nextUrl.pathname}`;
    const now = Date.now();

    let entry = store.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + config.windowMs };
      store.set(key, entry);
    }

    entry.count++;

    const remaining = Math.max(0, config.maxRequests - entry.count);
    const resetSeconds = Math.ceil((entry.resetAt - now) / 1000);

    const headers: Record<string, string> = {
      "X-RateLimit-Limit": String(config.maxRequests),
      "X-RateLimit-Remaining": String(remaining),
      "X-RateLimit-Reset": String(resetSeconds),
    };

    return {
      allowed: entry.count <= config.maxRequests,
      headers,
    };
  };
};

export const RATE_LIMITS = {
  credentials: rateLimit({ windowMs: 60_000, maxRequests: 30 }),
  studio: rateLimit({ windowMs: 60_000, maxRequests: 60 }),
  agentState: rateLimit({ windowMs: 60_000, maxRequests: 20 }),
  skillsRemove: rateLimit({ windowMs: 60_000, maxRequests: 10 }),
  pathSuggestions: rateLimit({ windowMs: 60_000, maxRequests: 60 }),
} as const;

export const applyRateLimit = (
  req: NextRequest,
  limiter: ReturnType<typeof rateLimit>,
): NextResponse | null => {
  const { allowed, headers } = limiter(req);
  if (allowed) return null;

  const res = NextResponse.json(
    { error: "Too Many Requests", retryAfter: headers["X-RateLimit-Reset"] },
    { status: 429 },
  );
  for (const [key, value] of Object.entries(headers)) {
    res.headers.set(key, value);
  }
  return res;
};
