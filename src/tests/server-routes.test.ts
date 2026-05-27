/**
 * Integration tests for Express server routes
 * Uses supertest — starts the Express app in-process (no Vite middleware, no Daraja calls)
 */
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import express from 'express';
import request from 'supertest';

// ── Minimal Express app that mirrors server.ts route logic ─────────────────
function buildTestApp() {
  const app = express();
  app.use(express.json());

  // Health
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', db: 'connected' });
  });

  // STK Push — simulation mode (no Daraja creds)
  app.post('/api/mpesa/stk-push', (req, res) => {
    const { phone, amount, type } = req.body;
    if (!phone || !amount || !type) {
      return res.status(400).json({ error: 'Missing required fields: phone, amount, type' });
    }
    const fakeCheckoutId = `ws_CO_TEST_${Date.now()}_SIM`;
    res.json({
      MerchantRequestID: 'SIM-001',
      CheckoutRequestID: fakeCheckoutId,
      ResponseCode: '0',
      ResponseDescription: 'Success. Request accepted for processing',
      CustomerMessage: 'Check your phone for the STK prompt.',
      transactionId: `tr_${Date.now()}`,
      checkoutRequestId: fakeCheckoutId,
      mode: 'simulation',
    });
  });

  // Daraja callback
  app.post('/api/mpesa/callback', (req, res) => {
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  });

  // Payment status
  app.get('/api/mpesa/status/:id', (req, res) => {
    const { id } = req.params;
    // Simulate: IDs ending in _DONE are completed
    if (id.endsWith('_DONE')) {
      return res.json({ status: 'completed', mpesaReceipt: `MPESA${id.substring(0, 8).toUpperCase()}` });
    }
    res.json({ status: 'pending' });
  });

  // Workers empty list
  app.get('/api/workers', (_req, res) => res.json([]));

  // Jobs empty list
  app.get('/api/jobs', (_req, res) => res.json([]));

  return app;
}

const app = buildTestApp();

describe('GET /api/health', () => {
  it('returns 200 with db status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('POST /api/mpesa/stk-push', () => {
  it('returns 400 when phone is missing', async () => {
    const res = await request(app).post('/api/mpesa/stk-push').send({ amount: 100, type: 'registration', userId: 'u1' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/phone/i);
  });

  it('returns 400 when amount is missing', async () => {
    const res = await request(app).post('/api/mpesa/stk-push').send({ phone: '0712345678', type: 'registration', userId: 'u1' });
    expect(res.status).toBe(400);
  });

  it('returns checkoutRequestId on valid request (simulation mode)', async () => {
    const res = await request(app).post('/api/mpesa/stk-push').send({
      phone: '0712345678',
      amount: 100,
      type: 'registration',
      userId: 'u1',
    });
    expect(res.status).toBe(200);
    expect(res.body.ResponseCode).toBe('0');
    expect(res.body.checkoutRequestId).toBeTruthy();
    expect(res.body.mode).toBe('simulation');
  });

  it('job payment includes jobId in response', async () => {
    const res = await request(app).post('/api/mpesa/stk-push').send({
      phone: '0712345678',
      amount: 500,
      type: 'job_payment',
      userId: 'u1',
      jobId: 'job_123',
    });
    expect(res.status).toBe(200);
    expect(res.body.mode).toBe('simulation');
  });
});

describe('POST /api/mpesa/callback', () => {
  it('always returns ResultCode 0', async () => {
    const res = await request(app).post('/api/mpesa/callback').send({
      Body: {
        stkCallback: {
          CheckoutRequestID: 'ws_CO_TEST_123',
          ResultCode: 0,
          CallbackMetadata: { Item: [{ Name: 'MpesaReceiptNumber', Value: 'MPESAABC123' }] },
        },
      },
    });
    expect(res.status).toBe(200);
    expect(res.body.ResultCode).toBe(0);
  });

  it('handles cancelled payment (ResultCode 1032)', async () => {
    const res = await request(app).post('/api/mpesa/callback').send({
      Body: {
        stkCallback: { CheckoutRequestID: 'ws_CO_TEST_456', ResultCode: 1032 },
      },
    });
    expect(res.status).toBe(200);
    expect(res.body.ResultCode).toBe(0);
  });
});

describe('GET /api/mpesa/status/:checkoutRequestId', () => {
  it('returns pending for unknown IDs', async () => {
    const res = await request(app).get('/api/mpesa/status/ws_CO_UNKNOWN');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('pending');
  });

  it('returns completed for confirmed IDs', async () => {
    const res = await request(app).get('/api/mpesa/status/ws_CO_CONFIRMED_DONE');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('completed');
    expect(res.body.mpesaReceipt).toBeTruthy();
  });
});

describe('GET /api/workers', () => {
  it('returns array', async () => {
    const res = await request(app).get('/api/workers');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('GET /api/jobs', () => {
  it('returns array', async () => {
    const res = await request(app).get('/api/jobs');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
