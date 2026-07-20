# Master Stage Plan
Plan: docs/plans/plan.md
Branch: feature/plan
Review budget: 120 minutes
Generated: 2026-07-20T00:00:00Z

## Scope estimate
~650-750 LOC estimated across ~12 files (schemas, types, constraint engine, lender
roster config, service, controller, route, app wiring, 3 test files, README updates)
→ 2 stages, ~350 LOC/stage average. Well under the 10-files/300-lines-per-file
ceilings, so the whole exercise fits in two reviewable, cohesive chunks: pure business
logic first, then the thin API layer + docs built on top of it.

## Stages
- Stage 1: COMMITTED — Constraint engine core: types/schemas, lender roster config, operator→predicate matching + priority sort, unit tests
- Stage 2: PLANNED — API layer: controller, route, app wiring, integration tests, README (Persistence model + Postman/curl instructions)
