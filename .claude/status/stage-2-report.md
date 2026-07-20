## Files
src/controllers/applicationMatch.controller.ts
src/routes/applicationMatch.routes.ts
src/routes/index.ts
src/routes/__tests__/applicationMatch.test.ts
README.md

## Summary
Built the thin API layer on top of Stage 1's constraint engine: a controller that reads
the already-validated `req.body`, calls `matchApplication()`, and returns the bare
`string[]` result (no `{ success, data }` envelope, per the plan's mandated response
shape); a router mapping `POST /applicationMatch` through the existing `validate`
middleware (`ApplicationInputSchema`) to that controller; and wiring into the app's root
router alongside `/health`. Added four Supertest integration tests (happy path matching
the plan's worked example, a non-numeric `requestedAmount` validation error, a missing
required field, and a no-match case returning `[]`). Created `README.md` from scratch
(none existed) with Getting Started, API docs, curl/Postman testing instructions using
the plan's exact worked example, the Persistence model write-up (`lenders` +
`lender_rules` tables), and a short design-notes section on the extensible constraint
engine. `pnpm run check` (lint + type-check + test) passes clean: 5 test files, 33 tests
total (29 from Stage 1 + 4 new).

## Commit message
feat(api): add POST /applicationMatch endpoint and README

Wire the Stage 1 constraint engine into a thin Express controller/router pair,
returning the plan-mandated bare string[] response instead of the boilerplate's
default {success, data} envelope. Reuses the existing `validate` middleware for
Zod error handling rather than inventing a new error shape. Adds integration
tests and the README's Persistence model + Postman/curl testing sections.

## Key decisions
- Validation happens via the existing `validate(ApplicationInputSchema)` middleware at
  the route level, not via a direct `schema.parse()` call inside the controller. Calling
  `.parse()` directly would throw a raw `ZodError` (no `statusCode` field), which
  `errorHandler.ts` would map to a generic 500 instead of a 400 — using the middleware
  reuses the boilerplate's existing 400 error-shaping exactly as the stage brief required
  ("don't invent a new [error] shape").
- The controller reads `req.body as Application` with a one-line comment noting it's
  already validated/normalized by the route-level `validate` middleware immediately
  before this handler runs. This is a narrow, justified cast at a framework boundary
  (Express types `req.body` as `any` with no per-route narrowing mechanism) rather than a
  cast on unvalidated external data — the same category as the DOM/library-interop
  exceptions in `typescript-typing.md`.
- `README.md` did not exist in the repo at all (boilerplate scaffold had none) — created
  it from scratch rather than editing a nonexistent file, covering both this stage's
  required sections (Persistence model, testing instructions) and general project
  orientation (stack, commands, API contract table) so the deliverable is a complete
  README rather than two isolated sections.
- Added a fourth integration test (no-match → empty array) beyond the brief's minimum of
  happy-path + one validation error, since it's a meaningfully different code path
  (empty `eligibleLenders` after filtering) worth covering at the API layer, not just at
  the Stage 1 unit-test layer.
