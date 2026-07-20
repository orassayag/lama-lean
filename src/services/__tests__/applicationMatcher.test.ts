import { describe, it, expect } from 'vitest';
import { matches, matchApplication } from '../applicationMatcher.js';
import { LENDER_ROSTER } from '../lenderRoster.js';
import type { Application } from '../../schemas/applicationInput.schema.js';
import type { Lender } from '../../types/lender.types.js';

function buildApplication(overrides: Partial<Application> = {}): Application {
  return {
    borrowerType: 'consumer',
    loanType: 'personal loan',
    state: 'ny',
    riskLevel: 50,
    requestedAmount: 100000,
    ...overrides,
  };
}

function findLenderByName(name: string): Lender {
  const lender = LENDER_ROSTER.find((candidate) => candidate.name === name);
  if (!lender) throw new Error(`fixture missing lender: ${name}`);
  return lender;
}

describe('matches', () => {
  it('should return true when every rule in the lender config is satisfied', () => {
    const firstLamaBank = findLenderByName('First Lama Bank');
    const application = buildApplication({ borrowerType: 'consumer', riskLevel: 50 });

    expect(matches(application, firstLamaBank)).toBe(true);
  });

  it('should return false when a single rule fails', () => {
    const firstLamaBank = findLenderByName('First Lama Bank');
    const application = buildApplication({ borrowerType: 'consumer', riskLevel: 95 });

    expect(matches(application, firstLamaBank)).toBe(false);
  });
});

describe('matchApplication', () => {
  it('should return the plan worked example result', () => {
    const application = buildApplication({
      borrowerType: 'consumer',
      loanType: 'student loan',
      state: 'ca',
      riskLevel: 75,
      requestedAmount: 30000,
    });

    expect(matchApplication(application)).toEqual(['First Lama Bank', 'Lama International Bank']);
  });

  it('should break ties between equal rule-count lenders by roster declaration order', () => {
    const application = buildApplication({
      borrowerType: 'consumer',
      loanType: 'line of credit',
      industry: 'restaurant',
      riskLevel: 50,
      requestedAmount: 999999999,
    });

    expect(matchApplication(application)).toEqual(['First Lama Bank', 'Bank Otzar Halama']);
  });

  it('should return only the matching lender name when a single lender matches', () => {
    const application = buildApplication({
      borrowerType: 'nonprofit',
      loanType: 'mortgage',
      state: 'wy',
      riskLevel: 999,
      requestedAmount: 100000,
    });

    expect(matchApplication(application)).toEqual(['Lama International Bank']);
  });

  it('should return an empty array when no lenders match', () => {
    const application = buildApplication({
      borrowerType: 'nonprofit',
      loanType: 'mortgage',
      state: 'wy',
      riskLevel: 999,
      requestedAmount: 999999999,
    });

    expect(matchApplication(application)).toEqual([]);
  });
});
