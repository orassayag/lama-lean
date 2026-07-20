## Files

- src/schemas/applicationInput.schema.ts
- src/schemas/__tests__/applicationInput.schema.test.ts
- src/types/lender.types.ts
- src/services/operatorPredicates.ts
- src/services/lenderRoster.ts
- src/services/applicationMatcher.ts
- src/services/__tests__/operatorPredicates.test.ts
- src/services/__tests__/applicationMatcher.test.ts

## Summary

Built the pure constraint-engine business logic layer with zero Express imports, per
CLAUDE.md's folder rationale. `ApplicationInputSchema` (Zod, `.strict()`) validates and
normalizes the incoming loan application: `requestedAmount`/`riskLevel` coerce to
`number` with a field-specific error on non-parsing input, string fields are trimmed and
lower-cased, `industry` is optional. `Operator`/`ApplicationField`/`Rule`/`Lender` types
live in `src/types/lender.types.ts`, with `ApplicationField` derived as `keyof Application`
so it can't drift from the schema. `OPERATOR_PREDICATES` is the single `operator →
predicate` lookup table (`eq`, `lt`, `gt`, `in`) — adding a constraint type is one new
entry there, never a new conditional branch. `LENDER_ROSTER` encodes the fixed 5-lender
config in spec order (load-bearing for tie-break). `matches()` and `matchApplication()` in
`applicationMatcher.ts` filter the roster, sort eligible lenders by descending
`rules.length` via `Array.prototype.sort` (stable since ES2019, so ties preserve
first-declared-wins order), and return the top two names as `string[]`.

`pnpm run check` (lint + type-check + test) passes clean: 29 tests across 4 files (21 new
in this stage), 0 lint errors, 0 type errors. New tests cover every operator predicate
(true/false cases via `it.each`), `matches()` against a fully-satisfied and a
single-rule-failing lender, the plan's exact worked example, a tie-break case (First Lama
Bank vs. Bank Otzar Halama, both 2 rules), single-match and no-match cases, and Zod schema
validation (case/whitespace normalization, optional `industry`, per-field numeric
rejection, `.strict()` unknown-key rejection).

## Commit message

feat(matching): add constraint engine core for loan application matching

Implements the extensible operator->predicate lookup table, the fixed
5-lender roster config, and the priority-sorted matchApplication()
function per docs/plans/plan.md. Zero Express imports — pure business
logic ahead of the Stage 2 controller/route wiring.

## Key decisions

- `ApplicationField` is `keyof Application` (inferred from `ApplicationInputSchema` via
  `z.infer`) rather than a hand-written union — guarantees the field list can never drift
  from the validated request shape.
- `OPERATOR_PREDICATES`'s `lt`/`gt`/`in` predicates use `typeof`/`Array.isArray` runtime
  guards instead of `as` casts on the `unknown` operands, per
  `.claude/rules/typescript-typing.md`'s strictness stance — a non-numeric field value on
  `lt`/`gt` returns `false` rather than throwing or silently coercing.
- Relied on `Array.prototype.sort`'s spec-guaranteed stability (ES2019+) for the
  first-declared-wins tie-break, with a comment noting the assumption rather than adding
  a manual stable-sort implementation — Node 22 (this project's target) satisfies it.
- Stage 2's controller will call `matchApplication(application: Application): string[]`
  directly; no other public surface is needed from this layer.
