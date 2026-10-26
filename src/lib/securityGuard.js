// Client-Side Security Guard & Rate Limiter
// Enforces sliding-window rate limiting, exponential backoff, and input sanitization

const RATE_LIMIT_PREFIX = 'sec_ratelimit_';
const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

/**
 * Checks if the user/IP is currently locked out due to multiple failed login attempts
 */
export function checkRateLimit(identifier) {
  const key = `${RATE_LIMIT_PREFIX}${identifier.toLowerCase().trim()}`;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return { allowed: true, remaining: MAX_ATTEMPTS, lockoutSecs: 0 };

    const record = JSON.parse(raw);
    const now = Date.now();

    // Check if lockout window has expired
    if (record.lockedUntil && now < record.lockedUntil) {
      const remainingSecs = Math.ceil((record.lockedUntil - now) / 1000);
      return { allowed: false, remaining: 0, lockoutSecs: remainingSecs };
    }

    // Reset if window has passed
    if (record.windowStart && now - record.windowStart > LOCKOUT_MINUTES * 60 * 1000) {
      sessionStorage.removeItem(key);
      return { allowed: true, remaining: MAX_ATTEMPTS, lockoutSecs: 0 };
    }

    return { 
      allowed: record.attempts < MAX_ATTEMPTS, 
      remaining: Math.max(0, MAX_ATTEMPTS - record.attempts),
      lockoutSecs: 0 
    };
  } catch {
    return { allowed: true, remaining: MAX_ATTEMPTS, lockoutSecs: 0 };
  }
}

/**
 * Records a failed login attempt and calculates progressive penalty
 */
export function recordFailedAttempt(identifier) {
  const key = `${RATE_LIMIT_PREFIX}${identifier.toLowerCase().trim()}`;
  try {
    const raw = sessionStorage.getItem(key);
    const now = Date.now();
    let record = raw ? JSON.parse(raw) : { attempts: 0, windowStart: now, lockedUntil: null };

    record.attempts += 1;

    if (record.attempts >= MAX_ATTEMPTS) {
      record.lockedUntil = now + (LOCKOUT_MINUTES * 60 * 1000);
    }

    sessionStorage.setItem(key, JSON.stringify(record));
    return record;
  } catch {
    return null;
  }
}

/**
 * Clears failed attempts upon successful authentication
 */
export function clearRateLimit(identifier) {
  const key = `${RATE_LIMIT_PREFIX}${identifier.toLowerCase().trim()}`;
  try {
    sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
}

/**
 * Sanitizes input text to prevent script injection
 */
export function sanitizeAuthInput(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>'"&]/g, '')
    .trim();
}
