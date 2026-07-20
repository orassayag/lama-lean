import { describe, it, expect } from 'vitest';
import { OPERATOR_PREDICATES } from '../operatorPredicates.js';

describe('OPERATOR_PREDICATES', () => {
  describe('eq', () => {
    it.each([
      ['equal strings', 'consumer', 'consumer', true],
      ['different strings', 'consumer', 'business', false],
      ['equal numbers', 5, 5, true],
    ])('%s', (_label, fieldValue, ruleValue, expected) => {
      expect(OPERATOR_PREDICATES.eq(fieldValue, ruleValue)).toBe(expected);
    });
  });

  describe('lt', () => {
    it.each([
      ['field less than rule', 50, 80, true],
      ['field equal to rule', 80, 80, false],
      ['field greater than rule', 90, 80, false],
      ['non-numeric field value', 'x', 80, false],
    ])('%s', (_label, fieldValue, ruleValue, expected) => {
      expect(OPERATOR_PREDICATES.lt(fieldValue, ruleValue)).toBe(expected);
    });
  });

  describe('gt', () => {
    it.each([
      ['field greater than rule', 600000, 500000, true],
      ['field equal to rule', 500000, 500000, false],
      ['field less than rule', 400000, 500000, false],
      ['non-numeric field value', 'x', 500000, false],
    ])('%s', (_label, fieldValue, ruleValue, expected) => {
      expect(OPERATOR_PREDICATES.gt(fieldValue, ruleValue)).toBe(expected);
    });
  });

  describe('in', () => {
    it.each([
      ['value present in list', 'ca', ['ca', 'ny'], true],
      ['value absent from list', 'tx', ['ca', 'ny'], false],
      ['rule value not an array', 'ca', 'ca', false],
    ])('%s', (_label, fieldValue, ruleValue, expected) => {
      expect(OPERATOR_PREDICATES.in(fieldValue, ruleValue)).toBe(expected);
    });
  });

  describe('co', () => {
    it.each([
      ['field contains rule substring', 'fine dining restaurant', 'restaurant', true],
      ['exact string match', 'restaurant', 'restaurant', true],
      ['substring absent', 'retail store', 'restaurant', false],
      ['non-string field value', 500, 'restaurant', false],
      ['non-string rule value', 'restaurant', 5, false],
    ])('%s', (_label, fieldValue, ruleValue, expected) => {
      expect(OPERATOR_PREDICATES.co(fieldValue, ruleValue)).toBe(expected);
    });
  });
});
