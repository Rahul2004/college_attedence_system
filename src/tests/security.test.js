import { describe, it, expect, vi } from 'vitest';
import { sanitizeAuthInput, checkRateLimit, recordFailedAttempt, clearRateLimit } from '../lib/securityGuard';

describe('Application Security Guard & Rate Limiter', () => {
  it('sanitizes malicious script tags and HTML injection from auth inputs', () => {
    const maliciousInput = '<script>alert("xss")</script>admin@college.edu.in';
    const sanitized = sanitizeAuthInput(maliciousInput);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('</script>');
  });

  it('sanitizes SQL characters and quotes from input', () => {
    const sqlInjection = "admin' OR '1'='1";
    const sanitized = sanitizeAuthInput(sqlInjection);
    expect(sanitized).not.toContain("'");
  });

  it('tracks failed login attempts and activates rate limiting after threshold', () => {
    const testIdentifier = 'test_user_rate_limit_' + Date.now();
    clearRateLimit(testIdentifier);

    // Initial check should allow attempts
    const initialCheck = checkRateLimit(testIdentifier);
    expect(initialCheck.allowed).toBe(true);

    // Record 5 failed attempts
    for (let i = 0; i < 5; i++) {
      recordFailedAttempt(testIdentifier);
    }

    // Now user should be rate-limited
    const blockedCheck = checkRateLimit(testIdentifier);
    expect(blockedCheck.allowed).toBe(false);
    expect(blockedCheck.lockoutSecs).toBeGreaterThan(0);

    // Reset rate limit
    clearRateLimit(testIdentifier);
    const unblockedCheck = checkRateLimit(testIdentifier);
    expect(unblockedCheck.allowed).toBe(true);
  });
});
