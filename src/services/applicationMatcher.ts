import type { Application } from '../schemas/applicationInput.schema.js';
import type { Lender } from '../types/lender.types.js';
import { LENDER_ROSTER } from './lenderRoster.js';
import { OPERATOR_PREDICATES } from './operatorPredicates.js';

const MAX_MATCHED_LENDERS = 2;

export function matches(application: Application, lender: Lender): boolean {
  return lender.rules.every((rule) =>
    OPERATOR_PREDICATES[rule.operator](application[rule.field], rule.value),
  );
}

export function matchApplication(application: Application): string[] {
  const eligibleLenders = LENDER_ROSTER.filter((lender) => matches(application, lender));

  // Array.prototype.sort is stable per spec since ES2019, so equal-priority
  // ties preserve LENDER_ROSTER's declaration order (first-declared-wins).
  const sortedByPriority = [...eligibleLenders].sort((a, b) => b.rules.length - a.rules.length);

  return sortedByPriority.slice(0, MAX_MATCHED_LENDERS).map((lender) => lender.name);
}
