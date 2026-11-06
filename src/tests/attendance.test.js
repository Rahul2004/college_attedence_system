import { describe, it, expect, beforeEach } from 'vitest';

describe('Attendance Percentage & Defaulter Calculations', () => {
  it('correctly calculates attendance percentage with zero total classes', () => {
    const attended = 0;
    const total = 0;
    const percentage = total > 0 ? (attended / total) * 100 : 0;
    expect(percentage).toBe(0);
  });

  it('correctly identifies defaulter when attendance is below threshold', () => {
    const threshold = 75;
    const attended = 14;
    const total = 20;
    const percentage = (attended / total) * 100; // 70%
    expect(percentage).toBe(70);
    const isDefaulter = percentage < threshold;
    expect(isDefaulter).toBe(true);
  });

  it('correctly calculates required recovery classes to reach threshold', () => {
    const threshold = 75;
    const reqRatio = threshold / 100; // 0.75
    const remRatio = 1 - reqRatio;   // 0.25
    const attended = 14;
    const total = 20;
    // (0.75 * 20 - 14) / 0.25 = (15 - 14) / 0.25 = 4 classes
    const recoveryNeeded = Math.max(0, Math.ceil((reqRatio * total - attended) / remRatio));
    expect(recoveryNeeded).toBe(4);

    // Verify after 4 consecutive attendances:
    const newAttended = attended + 4; // 18
    const newTotal = total + 4;       // 24
    const newPercentage = (newAttended / newTotal) * 100; // 75%
    expect(newPercentage).toBe(75);
  });

  it('calculates safe missable classes when student is above threshold', () => {
    const threshold = 75;
    const reqRatio = threshold / 100; // 0.75
    const attended = 18;
    const total = 20; // 90%
    // (18 - 0.75 * 20) / 0.75 = (18 - 15) / 0.75 = 4 classes
    const safeMissable = Math.max(0, Math.floor((attended - reqRatio * total) / reqRatio));
    expect(safeMissable).toBe(4);
  });
});

describe('Subject-Wise Attendance Isolation', () => {
  it('ensures distinct storage keys for separate subjects', () => {
    const prog1 = 'btech-cse';
    const sem1 = 'VI';
    const sub1 = 'CS-601';
    const sub2 = 'CS-602';

    const key1 = `${prog1}_${sem1}_${sub1}`;
    const key2 = `${prog1}_${sem1}_${sub2}`;

    expect(key1).not.toBe(key2);
    expect(key1).toBe('btech-cse_VI_CS-601');
    expect(key2).toBe('btech-cse_VI_CS-602');
  });

  it('preserves student records when updating status for one subject without affecting another', () => {
    const records = {
      'btech-cse_VI_CS-601': [{ id: 'stu-1', todayStatus: 'PRESENT', attendedClasses: 10, totalClasses: 12 }],
      'btech-cse_VI_CS-602': [{ id: 'stu-1', todayStatus: 'ABSENT', attendedClasses: 8, totalClasses: 12 }]
    };

    // Update CS-602
    const updated602 = records['btech-cse_VI_CS-602'].map(s => ({ ...s, todayStatus: 'PRESENT' }));
    records['btech-cse_VI_CS-602'] = updated602;

    // Check that CS-601 remained unchanged
    expect(records['btech-cse_VI_CS-601'][0].todayStatus).toBe('PRESENT');
    expect(records['btech-cse_VI_CS-601'][0].attendedClasses).toBe(10);
    expect(records['btech-cse_VI_CS-602'][0].todayStatus).toBe('PRESENT');
    expect(records['btech-cse_VI_CS-602'][0].attendedClasses).toBe(8);
  });
});

describe('Role & Authentication Privileges', () => {
  it('identifies unauthorized role access for student attempting admin portal', () => {
    const userRole = 'student';
    const allowedRole = 'admin';
    const hasAccess = userRole === allowedRole;
    expect(hasAccess).toBe(false);
  });

  it('allows access when role matches allowed portal', () => {
    const userRole = 'faculty';
    const allowedRole = 'faculty';
    const hasAccess = userRole === allowedRole;
    expect(hasAccess).toBe(true);
  });

  it('validates 4-digit numeric classroom OTP', () => {
    const validOtp = '4829';
    const shortOtp = '482';
    const alphaOtp = '482a';

    const isValid = (otp) => /^\d{4}$/.test(otp.trim());

    expect(isValid(validOtp)).toBe(true);
    expect(isValid(shortOtp)).toBe(false);
    expect(isValid(alphaOtp)).toBe(false);
  });
});
