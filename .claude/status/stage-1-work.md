# Stage 1 Work Brief — Constraint engine core

Source plan: `docs/plans/plan.md`. This stage builds the pure business-logic layer only
(no Express controller/route/app wiring — that's Stage 2). Zero Express imports in
anything built this stage, per CLAUDE.md's folder rationale ("`src/services/` — All
business logic. Zero Express imports.").

## Scope for this stage

1. **Schemas** (`src/schemas/`): a Zod schema for the incoming loan application request
   body — `ApplicationInputSchema` (or similar `*InputSchema` naming per project
   convention). Per the plan's "Request handling pipeline":
   - `requestedAmount`, `riskLevel` → coerced/parsed to `number`; non-parsing input
     must reject with a clear per-field validation error (name the field, what was
     expected, what was received — see `.claude/rules/error-handling-logging.md`).
   - `borrowerType`, `loanType`, `industry`, `state` → trimmed and lower-cased strings.
   - `industry` is optional.
   - Use `.strict()` — this is an input schema for our own API (see
     `.claude/rules/typescript-typing.md`, "Zod schema conventions").
   - Add `.describe()` on non-obvious fields.

2. **Types** (`src/types/`, or co-located with the schema per project convention —
   check `.claude/rules/naming-conventions.md`'s `types/` vs `schemas/` split): the
   `Operator`, `ApplicationField`, `Rule`, `Lender` shapes from the plan's Data model
   section. Prefer inferring the application type from the Zod schema
   (`z.infer<typeof ApplicationInputSchema>`) rather than hand-writing a duplicate type.

3. **Constraint engine** (`src/services/`): the `operator → predicate` lookup table
   (`eq`, `lt`, `gt`, `in`) and the `matches(application, lender)` function — exactly as
   described in the plan's "Request handling pipeline" (`rules.every(...)`). This is the
   part of the design the spec explicitly calls out as needing to be extensible: adding
   a new operator must mean adding one lookup-table entry, never a new conditional
   branch.

4. **Lender roster config** (`src/services/` or a dedicated config location under
   `src/services/`): the exact 5-lender roster from the plan's table, in this
   declaration order (order is load-bearing — it's the tie-break rule):
   1. First Lama Bank — `borrowerType eq 'consumer'`, `riskLevel lt 80`
   2. Bank HaPoalama — `loanType eq 'student loan'`, `state eq 'ca'`, `riskLevel lt 60`
   3. Salt and Pepper — `borrowerType eq 'business'`, `requestedAmount gt 500000`, `riskLevel lt 80`
   4. Bank Otzar Halama — `loanType eq 'line of credit'`, `industry eq 'restaurant'`
   5. Lama International Bank — `requestedAmount lt 200000`

5. **Matching + priority function** (`src/services/`): given a validated application,
   return up to two lender names — filter to lenders where `matches` is true, sort by
   descending `rules.length` with a **stable** sort (ties keep first-declared-wins
   roster order — `Array.prototype.sort` is stable in modern V8/Node, but confirm this
   assumption holds or make it explicit), take the first two, return `string[]` (empty
   array if none match). This function is what Stage 2's controller will call — design
   its signature accordingly (e.g. `matchApplication(application: Application): string[]`),
   but do NOT build the controller/route/HTTP layer this stage.

6. **Unit tests** (co-located `__tests__/` folders per file, per
   `.claude/rules/testing-conventions.md`): cover the constraint engine and matching
   function directly (it's exactly the kind of complex internal helper the testing
   rules call out as worth testing on its own). At minimum:
   - Each operator predicate (`eq`, `lt`, `gt`, `in`) — true and false cases.
   - `matches()` against at least one lender with all rules satisfied, and one with a
     single rule failing.
   - The full worked example from the plan's "Testing instructions" section:
     `{ borrowerType: 'consumer', loanType: 'Student Loan', state: 'CA', riskLevel: 75,
     requestedAmount: 30000 }` → `["First Lama Bank", "Lama International Bank"]`
     (note the plan's example input has mixed case — this is also implicitly a test
     that lower-casing/trimming works).
   - Tie-break ordering (a case where two lenders have equal matching rule counts and
     the earlier-declared one must win).
   - No lenders match → empty array.
   - Zod schema tests: valid input parses correctly (including case/whitespace
     normalization), invalid `requestedAmount`/`riskLevel` produce a clear validation
     error naming the field.
   - Use `it.each`/`test.each` for the operator-predicate table per
     `.claude/rules/testing-conventions.md`'s parameterized-test guidance.

## Explicitly out of scope for this stage

- Express controller, route, `app.ts` wiring — Stage 2.
- README updates (Persistence model, Postman/curl instructions) — Stage 2.
- Do not run `git add` or `git commit` — the orchestrator commits after human review.

## Before finishing

Run `pnpm run check` (lint + type-check + test) and ensure it passes clean. Write your
stage report to `.claude/status/stage-1-report.md` per the task template's instructions,
and set the `.claude/status/stage-1.state` sentinel to `DONE` when finished.
