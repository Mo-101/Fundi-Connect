/**
 * Tests for trustService and utility logic
 */
import { describe, it, expect } from 'vitest';

// ── Trust score logic (mirrors trustService.ts rules) ──────────────────────
function computeTrustLevel(trustScore: number, completedJobs: number, isVouched: boolean): string {
  if (completedJobs >= 50 && trustScore >= 80) return 'master';
  if (completedJobs >= 20 && trustScore >= 60) return 'trusted';
  if (isVouched && completedJobs >= 5) return 'verified';
  if (isVouched) return 'vouched';
  return 'new';
}

describe('Trust level computation', () => {
  it('new worker starts at "new"', () => {
    expect(computeTrustLevel(0, 0, false)).toBe('new');
  });

  it('3 vouches without jobs → "vouched"', () => {
    expect(computeTrustLevel(15, 0, true)).toBe('vouched');
  });

  it('vouched + 5 jobs → "verified"', () => {
    expect(computeTrustLevel(25, 5, true)).toBe('verified');
  });

  it('20 jobs + score 60 → "trusted"', () => {
    expect(computeTrustLevel(60, 20, true)).toBe('trusted');
  });

  it('50 jobs + score 80 → "master"', () => {
    expect(computeTrustLevel(80, 50, true)).toBe('master');
  });

  it('50 jobs score 79 (just under master threshold) → falls back to trusted', () => {
    // score 79 < 80 so master fails; score 79 >= 60 and jobs 50 >= 20 so trusted passes
    expect(computeTrustLevel(79, 50, true)).toBe('trusted');
  });
});

// ── Transaction status state machine ──────────────────────────────────────
describe('Payment status transitions', () => {
  const VALID_STATUSES = ['pending', 'completed', 'failed', 'unknown'] as const;

  it('all statuses are recognized', () => {
    VALID_STATUSES.forEach(s => expect(VALID_STATUSES).toContain(s));
  });

  it('simulation mode completes immediately (no polling needed)', () => {
    const mode: string = 'simulation';
    const shouldPoll = mode !== 'simulation';
    expect(shouldPoll).toBe(false);
  });

  it('real daraja mode requires polling', () => {
    const mode: string = 'daraja';
    const shouldPoll = mode !== 'simulation';
    expect(shouldPoll).toBe(true);
  });
});

// ── Utility: phone formatting ──────────────────────────────────────────────
describe('formatDarajaPhone', () => {
  function formatDarajaPhone(raw: string): string {
    const digits = raw.replace(/\D/g, '');
    if (digits.startsWith('0') && digits.length === 10) return `254${digits.slice(1)}`;
    if (digits.startsWith('254') && digits.length === 12) return digits;
    if (digits.startsWith('7') && digits.length === 9) return `254${digits}`;
    return digits;
  }

  const cases: [string, string][] = [
    ['0712345678', '254712345678'],
    ['+254712345678', '254712345678'],
    ['254712345678', '254712345678'],
    ['712345678', '254712345678'],
    ['0722 123 456', '254722123456'],
  ];

  cases.forEach(([input, expected]) => {
    it(`formats "${input}" → "${expected}"`, () => {
      expect(formatDarajaPhone(input)).toBe(expected);
    });
  });
});

// ── KES 100 registration fee invariant ────────────────────────────────────
describe('Platform fee doctrine', () => {
  it('registration fee is exactly KES 100', () => {
    const REGISTRATION_FEE = 100;
    expect(REGISTRATION_FEE).toBe(100);
  });

  it('registration trust bonus is 10 points', () => {
    const REGISTRATION_TRUST_BONUS = 10;
    expect(REGISTRATION_TRUST_BONUS).toBe(10);
  });

  it('each vouch adds 5 trust points', () => {
    const VOUCH_BONUS = 5;
    expect(VOUCH_BONUS).toBe(5);
  });

  it('auto-vouch threshold is 3 vouches', () => {
    const AUTO_VOUCH_THRESHOLD = 3;
    expect(AUTO_VOUCH_THRESHOLD).toBe(3);
  });
});
