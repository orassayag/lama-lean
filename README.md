# lama-lean

A web API for Lama's Loan Exchange that matches a loan application against a set of
lenders, each with its own "appetite" (acceptance constraints), and returns the top two
eligible lenders ordered by priority.

Full spec, lender roster, and worked examples: [`docs/plans/plan.md`](docs/plans/plan.md).

## Stack

Node.js 22 LTS, TypeScript 5.x (strict), Express 4.x, Zod, Pino, Vitest + Supertest.

## Getting started

```bash
pnpm install
pnpm run dev          # start dev server with hot reload
```

## Key commands

```bash
pnpm run dev          # start dev server (tsx watch)
pnpm run build        # compile TypeScript to dist/
pnpm run start        # run compiled production build
pnpm run test         # run all tests once
pnpm run test:watch   # run tests in watch mode
pnpm run coverage     # generate coverage report
pnpm run lint         # lint all files
pnpm run type-check   # TypeScript type check (no emit)
pnpm run check        # lint + type-check + test (run before committing)
```

## API

### `POST /applicationMatch`

Matches a loan application against the lender roster and returns the names of up to two
eligible lenders, ordered by priority (lenders with more constraints rank higher when
multiple qualify).

**Request body:**

| Field | Type | Required | Notes |
|---|---|---|---|
| `borrowerType` | string | yes | e.g. `"consumer"` or `"business"` |
| `loanType` | string | yes | e.g. `"Student Loan"` |
| `industry` | string | no | only meaningful for business borrowers |
| `state` | string | yes | two-letter US state code |
| `riskLevel` | number | yes | applicant risk score |
| `requestedAmount` | number | yes | requested loan amount in USD |

**Success response:** a bare array of lender names, e.g. `["First Lama Bank", "Lama
International Bank"]` — not wrapped in a `{ success, data }` envelope.

**Error response:** the standard error envelope, e.g. `{ "success": false, "error": {
"message": "..." } }`, on validation failure (400) or unexpected errors (500).

## Testing instructions (curl / Postman)

```
POST http://localhost:3000/applicationMatch
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

Equivalent curl command (replace the port if `PORT` is set differently in `.env`):

```bash
curl -X POST http://localhost:3000/applicationMatch \
  -H "Content-Type: application/json" \
  -d '{"borrowerType":"consumer","loanType":"Student Loan","state":"CA","riskLevel":75,"requestedAmount":30000}'
```

For Postman: create a `POST` request to the URL above, set the `Content-Type:
application/json` header, and paste the example body above into the raw JSON body.

### Postman collection

A ready-to-import collection with 12 pre-built, scripted test cases (priority ordering,
tie-breaking by declaration order, no-match, case-insensitivity, the optional `industry`
field, validation errors, and a health check) lives in `postman/`:

- `postman/lama-lean.postman_collection.json`
- `postman/lama-lean.postman_environment.json` (sets `{{baseUrl}}`, default
  `http://localhost:3000`)

In Postman: **File → Import** both files, select the "lama-lean local" environment, start
the dev server (`pnpm run dev`), then run any request individually or the whole folder via
**Run collection** — each request has a `Tests` script that asserts the expected response.

## Persistence model

The API currently holds the lender roster in-memory (`LENDER_ROSTER` in
`src/services/lenderRoster.ts`) — no database is required for this exercise. If this were
to move to a persisted store, the roster's shape maps directly onto two relational
tables:

- **`lenders`** — `id`, `name`.
- **`lender_rules`** — `id`, `lender_id` (FK to `lenders.id`), `field`, `operator`,
  `value`.

`matches()` becomes a query joining `lender_rules` per lender and evaluating each row's
`field` / `operator` / `value` against the application, or — for simple `eq` / `lt` /
`gt` operators — a generated `WHERE` clause per lender built from its rule rows. Adding a
new lender or a new rule becomes an `INSERT`, not a code change or a deploy.

## Design notes

The constraint engine is deliberately extensible: each lender's appetite is a composable
list of `Rule` objects (`{ field, operator, value }`) evaluated through a single
`operator → predicate` lookup table (`OPERATOR_PREDICATES` in
`src/services/operatorPredicates.ts`). Adding a new lender, or a new constraint operator,
is a data/registry addition — not a new `if`/`else` branch — per the spec's note that
more constraint types are expected in the future.
