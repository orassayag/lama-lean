import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { Express } from 'express';
import { createTestApp } from '../../__tests__/helpers/testApp.js';

describe('GET /health', () => {
  let app: Express;

  beforeAll(() => {
    app = createTestApp();
  });

  it('returns 200 with health status', async () => {
    const response = await request(app).get('/health').expect(200);

    expect(response.body).toMatchObject({
      success: true,
      data: { status: 'ok' },
    });
    expect(typeof response.body.data.uptime).toBe('number');
    expect(typeof response.body.data.timestamp).toBe('string');
  });

  it('returns 404 for unknown routes', async () => {
    const response = await request(app).get('/unknown').expect(404);
    expect(response.body.success).toBe(false);
  });

  it('returns 404 for unsupported methods', async () => {
    const response = await request(app).post('/health').expect(404);
    expect(response.body.success).toBe(false);
  });
});
