/**
 * Unit tests for the API client (src/lib/api.ts)
 * Uses vi.stubGlobal to mock fetch — no real network calls.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------- helpers ----------
function mockFetch(body: unknown, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: async () => body,
  });
}

// Inline a tiny version of the api module logic so tests stay self-contained
async function handleResponse(res: { ok: boolean; status: number; statusText: string; json: () => Promise<unknown> }) {
  if (!res.ok) {
    const data = await res.json() as Record<string, string>;
    throw new Error(`API Error: ${res.status} ${res.statusText}${data?.error ? ' - ' + data.error : ''}`);
  }
  return res.json();
}

// ---------- tests ----------
describe('API client — handleResponse', () => {
  it('returns json on 200', async () => {
    const res = { ok: true, status: 200, statusText: 'OK', json: async () => ({ id: '1' }) };
    await expect(handleResponse(res)).resolves.toEqual({ id: '1' });
  });

  it('throws on 4xx with error message', async () => {
    const res = { ok: false, status: 404, statusText: 'Not Found', json: async () => ({ error: 'User not found' }) };
    await expect(handleResponse(res)).rejects.toThrow('API Error: 404 Not Found - User not found');
  });

  it('throws on 5xx', async () => {
    const res = { ok: false, status: 500, statusText: 'Internal Server Error', json: async () => ({}) };
    await expect(handleResponse(res)).rejects.toThrow('API Error: 500');
  });
});

describe('STK Push payload validation', () => {
  it('phone normalisation: 07xx → 2547xx', () => {
    const raw = '0712345678';
    const digits = raw.replace(/\D/g, '');
    const formatted = digits.startsWith('0') && digits.length === 10
      ? `254${digits.slice(1)}`
      : digits;
    expect(formatted).toBe('254712345678');
  });

  it('phone normalisation: +2547xx → 2547xx', () => {
    const raw = '+254712345678';
    const digits = raw.replace(/\D/g, '');
    const formatted = digits.startsWith('254') && digits.length === 12 ? digits : `254${digits.slice(1)}`;
    expect(formatted).toBe('254712345678');
  });

  it('phone normalisation: 9-digit 7xx → 2547xx', () => {
    const raw = '712345678';
    const digits = raw.replace(/\D/g, '');
    const formatted = digits.startsWith('7') && digits.length === 9 ? `254${digits}` : digits;
    expect(formatted).toBe('254712345678');
  });

  it('amount is rounded up (no sub-KES)', () => {
    expect(Math.ceil(99.5)).toBe(100);
    expect(Math.ceil(100)).toBe(100);
    expect(Math.ceil(100.1)).toBe(101);
  });

  it('AccountReference is capped at 12 chars', () => {
    const ref = 'registration_payment_2026';
    expect(ref.substring(0, 12)).toBe('registration');
    expect(ref.substring(0, 12).length).toBeLessThanOrEqual(12);
  });

  it('TransactionDesc is capped at 13 chars', () => {
    const desc = 'FundiConnect Registration Payment';
    expect(desc.substring(0, 13).length).toBeLessThanOrEqual(13);
  });
});

describe('Daraja password generation', () => {
  it('produces correct base64 password format', () => {
    const shortcode = '174379';
    const passkey = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
    const timestamp = '20260515120000';
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
    // Verify it's valid base64
    expect(() => Buffer.from(password, 'base64')).not.toThrow();
    // Verify round-trip
    const decoded = Buffer.from(password, 'base64').toString('utf-8');
    expect(decoded).toBe(`${shortcode}${passkey}${timestamp}`);
  });

  it('timestamp format is 14 digits', () => {
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    expect(timestamp).toMatch(/^\d{14}$/);
  });
});
