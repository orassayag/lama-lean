import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { Express } from 'express';
import { createTestApp } from '../../__tests__/helpers/testApp.js';

describe('POST /applicationMatch', () => {
  let app: Express;

  beforeAll(() => {
    app = createTestApp();
  });

  it('returns the top two eligible lenders ordered by priority', async () => {
    const response = await request(app)
      .post('/applicationMatch')
      .send({
        borrowerType: 'consumer',
        loanType: 'Student Loan',
        state: 'CA',
        riskLevel: 75,
        requestedAmount: 30000,
      })
      .expect(200);

    expect(response.body).toEqual(['First Lama Bank', 'Lama International Bank']);
  });

  it('returns 400 when requestedAmount is not a valid number', async () => {
    const response = await request(app)
      .post('/applicationMatch')
      .send({
        borrowerType: 'consumer',
        loanType: 'student loan',
        state: 'CA',
        riskLevel: 75,
        requestedAmount: 'not-a-number',
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.message).toContain('requestedAmount');
  });

  it('returns 400 when a required field is missing', async () => {
    const response = await request(app)
      .post('/applicationMatch')
      .send({
        loanType: 'student loan',
        state: 'CA',
        riskLevel: 75,
        requestedAmount: 30000,
      })
      .expect(400);

    expect(response.body.success).toBe(false);
  });

  it('returns an empty array when no lender matches', async () => {
    const response = await request(app)
      .post('/applicationMatch')
      .send({
        borrowerType: 'consumer',
        loanType: 'personal loan',
        state: 'NY',
        riskLevel: 95,
        requestedAmount: 900000,
      })
      .expect(200);

    expect(response.body).toEqual([]);
  });
});
