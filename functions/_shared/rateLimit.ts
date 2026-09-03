// ponytail: KV counter fallback; prefer CF Rate Limiting rule in production (see wrangler.toml comment below)
// CF dashboard: Security → Rate Limiting → 5 req/min per IP on /api/report
// Note: KV get/put races — parallel floods may all read 0 then put 1 (eventually consistent, not atomic).
// Acceptable best-effort fallback; mitigate via CF Rate Limiting rule above. Upgrade to Durable Object / KV atomic if abuse observed.
export async function isRateLimited(env: any, ip: string, limit = 5, windowSec = 60): Promise<boolean> {
  const kv = env?.RATE_LIMIT;
  if (!kv?.get || !kv?.put) return false;
  if (!ip) return false;
  try {
    const key = `rl:${ip}`;
    const raw = await kv.get(key);
    const count = raw ? parseInt(String(raw), 10) : 0;
    if (count >= limit) return true;
    await kv.put(key, String(count + 1), { expirationTtl: windowSec } as any);
    return false;
  } catch {
    return false;
  }
}
