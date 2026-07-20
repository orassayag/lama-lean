import { z } from 'zod';

/**
 * Validates and normalizes the POST /applicationMatch request body.
 * Numeric fields are coerced from string or numeric input and rejected with a
 * per-field error if they don't parse to a number. String fields are trimmed
 * and lower-cased so matching against the lender roster is case-insensitive.
 */
export const ApplicationInputSchema = z
  .object({
    borrowerType: z
      .string()
      .trim()
      .toLowerCase()
      .describe('The applicant type, e.g. "consumer" or "business". Normalized to lower-case.'),
    loanType: z
      .string()
      .trim()
      .toLowerCase()
      .describe('The kind of loan requested, e.g. "student loan". Normalized to lower-case.'),
    industry: z
      .string()
      .trim()
      .toLowerCase()
      .optional()
      .describe(
        'The applicant industry, e.g. "restaurant". Only meaningful for business borrowers; omit for others.',
      ),
    state: z
      .string()
      .trim()
      .toLowerCase()
      .describe('The two-letter US state code, e.g. "CA". Normalized to lower-case.'),
    riskLevel: z.coerce
      .number({ invalid_type_error: 'riskLevel must be a valid number' })
      .describe('The applicant risk score, coerced to a number from string or numeric input.'),
    requestedAmount: z.coerce
      .number({ invalid_type_error: 'requestedAmount must be a valid number' })
      .describe('The requested loan amount in USD, coerced to a number from string or numeric input.'),
  })
  .strict();

export type Application = z.infer<typeof ApplicationInputSchema>;
