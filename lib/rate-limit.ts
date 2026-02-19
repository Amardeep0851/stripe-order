const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;

const memoryStore = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(key: string) {
  const now = Date.now();
  const current = memoryStore.get(key);

  if (!current || now > current.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  if (current.count >= MAX_REQUESTS) {
    return true;
  }

  current.count += 1;
  memoryStore.set(key, current);
  return false;
}
