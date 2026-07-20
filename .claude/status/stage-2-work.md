# Stage 2 Work Brief — API layer

Build the thin Express API layer on top of Stage 1's constraint engine
(`matchApplication(application: Application): string[]` in
`src/services/applicationMatcher.ts`), plus the README deliverables. No changes to
Stage 1's business logic.

## Scope for this stage

- `src/controllers/` — a controller that parses `req.body`, validates it through
  `ApplicationInputSchema` (already built in Stage 1, `src/schemas/applicationInput.schema.ts`),
  calls `matchApplication()`, and sends the result. Wrap the async controller with
  `asyncHandler()` per `src/middleware/asyncHandler.js` (boilerplate convention).
- `src/routes/` — an Express router mapping `POST /applicationMatch` to the controller.
  No business logic in the router.
- Wire the new router into the app (`src/app.ts` or wherever the boilerplate's existing
  router mounting happens — follow the existing pattern used for any other routes already
  wired there).
- Integration tests (Supertest) for the new route: happy path (the plan's worked example
  below) + at least one validation-error case (e.g. non-numeric `requestedAmount`).
  Co-locate in `src/routes/__tests__/` per `.claude/rules/testing-conventions.md`.
- README updates:
  - **Persistence model** section (see below) — verbatim content already decided in the
    plan, write it up as prose in the README.
  - **Testing instructions** section — the exact `POST /applicationMatch` call (method,
    URL, header, example body/response below), doubling as Postman instructions.

## Critical response-shape rule (do not use the boilerplate's default envelope)

Per `CLAUDE.md`'s "Known gotchas" (bank lesson L001): the plan mandates the success
response is a **bare `string[]`** (e.g. `["First Lama Bank", "Lama International Bank"]`),
NOT the boilerplate's default `{ success, data }` wrapper. Return the bare array directly
on success. Keep the boilerplate's existing error envelope for error cases only (e.g. Zod
validation failures — reuse whatever error-handling middleware/shape the boilerplate
already has for validation errors, don't invent a new one).

## Relevant plan sections (from docs/plans/plan.md)

### Request handling pipeline

1. Parse the request body with the Stage 1 Zod schema (already built — just import and
   use it; do not redefine it).
2. Call `matchApplication(application)` from `src/services/applicationMatcher.ts`.
3. Return the result array directly as the response body (bare `string[]`, see rule above).

### Persistence model (README section — write this up as-is)

Explains the in-memory `Lender[]` config's equivalent relational shape:

- `lenders` table: `id`, `name`.
- `lender_rules` table: `id`, `lender_id` (FK), `field`, `operator`, `value`.

`matches()` becomes a query joining `lender_rules` per lender and evaluating each row's
`field`/`operator`/`value` against the application, or — for simple `eq`/`lt`/`gt`
operators — a generated `WHERE` clause per lender built from its rule rows. Adding a
lender or a rule is an `INSERT`, not a deploy.

### Testing instructions (README section — use this exact worked example)

```
POST http://localhost:<port>/applicationMatch
Content-Type: application/json

{
  "borrowerType": "consumer",
  "loanType": "Student Loan",
  "state": "CA",
  "riskLevel": 75,
  "requestedAmount": 30000
}
```

Expected response:

```json
["First Lama Bank", "Lama International Bank"]
```

This doubles as the Postman instructions: method `POST`, URL as above, header
`Content-Type: application/json`, body as the example JSON.

## Verification before reporting done

Run `pnpm run check` (lint + type-check + test) and confirm it passes clean. Report the
test count and file list in the stage report, same format Stage 1 used.
