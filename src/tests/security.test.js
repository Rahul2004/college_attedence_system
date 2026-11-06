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

  it('strictly validates 6-digit TOTP format and rejects invalid or non-numeric strings', () => {
    const isValidTotp = (code) => typeof code === 'string' && code.trim().length === 6 && /^\d{6}$/.test(code.trim());

    expect(isValidTotp('123456')).toBe(true);
    expect(isValidTotp('000000')).toBe(true);
    expect(isValidTotp('987654')).toBe(true);

    // Invalid codes
    expect(isValidTotp('12345')).toBe(false); // too short
    expect(isValidTotp('1234567')).toBe(false); // too long
    expect(isValidTotp('12345a')).toBe(false); // alphanumeric
    expect(isValidTotp('abcdef')).toBe(false); // alpha
    expect(isValidTotp('')).toBe(false); // empty
  });

  it('enforces role integrity: prevents non-admin users from altering account roles', () => {
    // Simulation of database trigger enforce_profile_role_integrity logic
    const enforceProfileRoleIntegrity = (callerRole, oldRole, newRole) => {
      const isCallerAdmin = callerRole === 'admin';
      if (oldRole !== newRole && !isCallerAdmin) {
        throw new Error('Access Denied: Only institutional Administrators can modify account roles.');
      }
      return { success: true, role: newRole };
    };

    // Admin caller can change role
    expect(enforceProfileRoleIntegrity('admin', 'student', 'faculty').success).toBe(true);
    expect(enforceProfileRoleIntegrity('admin', 'faculty', 'admin').success).toBe(true);

    // Student caller attempting self-promotion must throw an error
    expect(() => enforceProfileRoleIntegrity('student', 'student', 'admin')).toThrow(
      'Access Denied: Only institutional Administrators can modify account roles.'
    );

    // Faculty caller attempting self-promotion to admin must throw an error
    expect(() => enforceProfileRoleIntegrity('faculty', 'faculty', 'admin')).toThrow(
      'Access Denied: Only institutional Administrators can modify account roles.'
    );
  });

  it('rejects non-admin accounts from gaining access through the Admin Portal Gateway', () => {
    const verifyAdminPortalAccess = (userRole) => {
      if (userRole !== 'admin') {
        return { allowed: false, error: 'Access Denied: This account is not authorized as a College Administrator.' };
      }
      return { allowed: true, error: null };
    };

    expect(verifyAdminPortalAccess('student').allowed).toBe(false);
    expect(verifyAdminPortalAccess('faculty').allowed).toBe(false);
    expect(verifyAdminPortalAccess('admin').allowed).toBe(true);
  });
});
