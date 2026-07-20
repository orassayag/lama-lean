import type { Application } from '../schemas/applicationInput.schema.js';

export type Operator = 'eq' | 'lt' | 'gt' | 'in';

export type ApplicationField = keyof Application;

export interface Rule {
  field: ApplicationField;
  operator: Operator;
  value: unknown;
}

export interface Lender {
  name: string;
  rules: Rule[];
}
