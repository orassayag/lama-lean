import { describe, it, expect } from 'vitest';
import { ApplicationInputSchema } from '../applicationInput.schema.js';

describe('ApplicationInputSchema', () => {
  it('should parse valid input and normalize string casing/whitespace', () => {
    const result = ApplicationInputSchema.safeParse({
      borrowerType: 'Consumer',
      loanType: '  Student Loan ',
      state: 'CA',
      riskLevel: '75',
      requestedAmount: 30000,
    });

    expect(result.success).toBe(true);
    if (!result.success) throw new Error('expected parse to succeed');
    expect(result.data).toEqual({
      borrowerType: 'consumer',
      loanType: 'student loan',
      state: 'ca',
      riskLevel: 75,
      requestedAmount: 30000,
    });
  });

  it('should accept input without industry, since it is optional', () => {
    const result = ApplicationInputSchema.safeParse({
      borrowerType: 'consumer',
      loanType: 'personal loan',
      state: 'ny',
      riskLevel: 10,
      requestedAmount: 5000,
    });

    expect(result.success).toBe(true);
    if (!result.success) throw new Error('expected parse to succeed');
    expect(result.data.industry).toBeUndefined();
  });

  it('should trim and lower-case industry when provided', () => {
    const result = ApplicationInputSchema.safeParse({
      borrowerType: 'business',
      loanType: 'line of credit',
      industry: '  Restaurant ',
      state: 'ca',
      riskLevel: 10,
      requestedAmount: 5000,
    });

    expect(result.success).toBe(true);
    if (!result.success) throw new Error('expected parse to succeed');
    expect(result.data.industry).toBe('restaurant');
  });

  it.each([['requestedAmount'], ['riskLevel']])(
    'should reject a non-numeric %s with a field-specific error',
    (field) => {
      const result = ApplicationInputSchema.safeParse({
        borrowerType: 'consumer',
        loanType: 'personal loan',
        state: 'ny',
        riskLevel: 10,
        requestedAmount: 5000,
        [field]: 'not-a-number',
      });

      expect(result.success).toBe(false);
      if (result.success) throw new Error('expected parse to fail');
      expect(result.error.issues.some((issue) => issue.path.join('.') === field)).toBe(true);
    },
  );

  it('should reject unknown keys', () => {
    const result = ApplicationInputSchema.safeParse({
      borrowerType: 'consumer',
      loanType: 'personal loan',
      state: 'ny',
      riskLevel: 10,
      requestedAmount: 5000,
      unknownField: 'nope',
    });

    expect(result.success).toBe(false);
  });
});
