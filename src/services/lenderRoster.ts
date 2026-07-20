import type { Lender } from '../types/lender.types.js';

/**
 * The fixed 5-lender roster from the spec. Declaration order is load-bearing:
 * it is the tie-break order when two lenders match with an equal rule count
 * (see applicationMatcher.ts).
 */
export const LENDER_ROSTER: Lender[] = [
  {
    name: 'First Lama Bank',
    rules: [
      { field: 'borrowerType', operator: 'eq', value: 'consumer' },
      { field: 'riskLevel', operator: 'lt', value: 80 },
    ],
  },
  {
    name: 'Bank HaPoalama',
    rules: [
      { field: 'loanType', operator: 'eq', value: 'student loan' },
      { field: 'state', operator: 'eq', value: 'ca' },
      { field: 'riskLevel', operator: 'lt', value: 60 },
    ],
  },
  {
    name: 'Salt and Pepper',
    rules: [
      { field: 'borrowerType', operator: 'eq', value: 'business' },
      { field: 'requestedAmount', operator: 'gt', value: 500000 },
      { field: 'riskLevel', operator: 'lt', value: 80 },
    ],
  },
  {
    name: 'Bank Otzar Halama',
    rules: [
      { field: 'loanType', operator: 'eq', value: 'line of credit' },
      { field: 'industry', operator: 'eq', value: 'restaurant' },
    ],
  },
  {
    name: 'Lama International Bank',
    rules: [{ field: 'requestedAmount', operator: 'lt', value: 200000 }],
  },
];
