import type { Operator } from '../types/lender.types.js';

/**
 * The single place new comparison kinds are added. A new constraint type is
 * one entry here, never a new conditional branch in the matching logic.
 */
export const OPERATOR_PREDICATES: Record<Operator, (fieldValue: unknown, ruleValue: unknown) => boolean> = {
  eq: (fieldValue, ruleValue) => fieldValue === ruleValue,
  lt: (fieldValue, ruleValue) =>
    typeof fieldValue === 'number' && typeof ruleValue === 'number' && fieldValue < ruleValue,
  gt: (fieldValue, ruleValue) =>
    typeof fieldValue === 'number' && typeof ruleValue === 'number' && fieldValue > ruleValue,
  in: (fieldValue, ruleValue) => Array.isArray(ruleValue) && ruleValue.includes(fieldValue),
};
