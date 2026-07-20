# Lama's Loan Exchange — `/applicationMatch` API — Plan

## Summary

A Node.js + TypeScript web API implementing a single endpoint, `POST /applicationMatch`,
that matches an incoming loan application against a fixed roster of five lenders and
returns up to two eligible lender names ordered by priority. Each lender's eligibility
rules ("appetite") are expressed as a config-driven list of composable predicate rules
rather than hard-coded conditionals, so adding a new lender or a new kind of constraint
is a data/registry change, not a code change — this directly satisfies the spec's
explicit extensibility requirement. Priority among eligible lenders is the count of
rules the lender's config defines, with ties broken by declaration order in the config.

## Scope

**In scope:**
- `POST /applicationMatch` endpoint, Node.js + TypeScript.
- Request validation/coercion via a schema (Zod) — numeric fields (`requestedAmount`,
  `riskLevel`) are parsed to `number` and rejected with a clear validation error if they
  don't parse; string fields are normalized (lower-cased, trimmed) before matching.
- A config-driven, extensible constraint engine: lender appetite as
  `{ name, rules: Rule[] }`, `Rule = { field, operator, value }`, matched via an
  `operator → predicate` lookup table.
- The 5-lender roster from the spec, encoded as this config.
- Priority ordering: eligible lenders sorted by descending rule count, ties broken by
  first-declared-wins order in the config array; top two names returned.
- README sections: how to test via Postman/curl, and a "Persistence model" write-up
  explaining the DB conversion path.
- In-memory data only — no database.

**Out of scope:**
- Authentication, rate limiting, or any concern not named in the spec.
- An actual database or ORM — only the explanatory write-up is required.
- Multi-tenant lender configs, admin UI, or persistence beyond the process lifetime.

## Issue Resolutions

| ID | Title | Flagged by | Resolution | Notes |
|----|-------|------------|------------|-------|
| I1 | No actual implementation plan exists yet | Claude | Fixed | Stack decided: Node.js + TypeScript API server, built directly in this project folder. |
| I7 | Config-driven extensibility isn't concretized | Claude | Fixed | Lender config is `{ name, rules: Rule[] }`; `Rule = { field, operator, value }`; `operator → predicate fn` lookup table. New lender = new array entry; new operator = new lookup-table entry. |
| I2 | Tie-break rule is undefined | Claude | Fixed | Ties broken by stable, first-declared-wins order in the lender config array. |
| I4 | Bank Otzar Halama's implicit borrower-type constraint is unstated | Claude | Fixed | Otzar's appetite is exactly `loanType == 'line of credit' AND industry == 'restaurant'` (2 rules, no separate borrowerType rule). A consumer application has `industry: undefined`, which already fails the industry predicate on its own — no need for an explicit borrowerType check. |
| I3 | "One constraint" is never defined | Claude | Fixed | Priority = count of individual `{field, operator, value}` rules in a lender's config that the application satisfies. Documented explicitly below (see Design → Priority ordering). |
| I5 | Inconsistent field/enum naming risks brittle string matching | Claude | Fixed | All incoming string fields (`loanType`, `industry`, `state`, `borrowerType`) are lower-cased and trimmed at the API boundary before matching; one canonical enum list is shared by the request parser and the lender config. |
| I6 | requestedAmount/riskLevel typing isn't pinned down | Claude | Fixed | Request body validated with a Zod schema that coerces/parses `requestedAmount` and `riskLevel` to `number`, rejecting non-parsing input with a clear per-field validation error. |
| I8 | "How to migrate to a DB" deliverable isn't planned | Claude | Fixed | README gets a "Persistence model" section mapping the in-memory `Lender[]` config to a `lenders` + `lender_rules` table design (see Design → Persistence model). |
| I9 | Postman testing instructions aren't drafted | Claude | Fixed | README gets the exact `POST /applicationMatch` call (URL, headers, example body/response), doubling as Postman instructions. |

## Design

### Stack

Node.js + TypeScript, built directly in this repo (no separate boilerplate scaffold
needed for a project this size). A minimal HTTP framework (e.g. Express) is sufficient
for the single endpoint.

### Data model

```ts
type Operator = 'eq' | 'lt' | 'gt' | 'in';

type ApplicationField =
  | 'borrowerType'
  | 'loanType'
  | 'industry'
  | 'state'
  | 'riskLevel'
  | 'requestedAmount';

interface Rule {
  field: ApplicationField;
  operator: Operator;
  value: unknown;
}

interface Lender {
  name: string;
  rules: Rule[];
}
```

The `operator → predicate` lookup table (e.g. `Record<Operator, (fieldValue: unknown, ruleValue: unknown) => boolean>`)
is the single place new comparison kinds get added. Adding a new constraint *type*
(the spec's stated future need) means adding one entry to this table — never a new
`if`/`else` branch in the matching logic.

### Lender roster (encoded as config)

| Lender | Rules | Rule count |
|---|---|---|
| First Lama Bank | `borrowerType eq 'consumer'`, `riskLevel lt 80` | 2 |
| Bank HaPoalama | `loanType eq 'student loan'`, `state eq 'ca'`, `riskLevel lt 60` | 3 |
| Salt and Pepper | `borrowerType eq 'business'`, `requestedAmount gt 500000`, `riskLevel lt 80` | 3 |
| Bank Otzar Halama | `loanType eq 'line of credit'`, `industry eq 'restaurant'` | 2 |
| Lama International Bank | `requestedAmount lt 200000` | 1 |

Declaration order in the array above is also the tie-break order (see below).

### Request handling pipeline

1. Parse the request body with a Zod schema:
   - `requestedAmount`, `riskLevel` → coerced to `number`; a non-parsing value produces
     a validation error naming the field, what was expected, and what was received.
   - `borrowerType`, `loanType`, `industry`, `state` → trimmed and lower-cased.
   - `industry` is optional (only meaningful for `borrowerType: 'business'`).
2. Run `matches(application, lender)` for every lender in the roster —
   `rules.every(rule => predicate(rule.operator)(application[rule.field], rule.value))`.
3. Collect lenders where `matches` is `true`.
4. Sort by descending `rules.length`; stable sort preserves declaration order for ties.
5. Return the first two lender names as `string[]` (empty array if none match).

### Priority ordering

Priority = number of individual `{field, operator, value}` rules in a lender's config
that the application satisfies (equivalently, since a lender only appears in the
eligible set when it satisfies *all* its own rules, this is just `rules.length` for any
matching lender). Ties — e.g. First Lama Bank (2) vs. Bank Otzar Halama (2), or Bank
HaPoalama (3) vs. Salt and Pepper (3) — are broken by first-declared-wins order in the
roster config above.

### Persistence model (README section)

Explains the in-memory `Lender[]` config's equivalent relational shape:

- `lenders` table: `id`, `name`.
- `lender_rules` table: `id`, `lender_id` (FK), `field`, `operator`, `value`.

`matches()` becomes a query joining `lender_rules` per lender and evaluating each row's
`field`/`operator`/`value` against the application, or — for simple `eq`/`lt`/`gt`
operators — a generated `WHERE` clause per lender built from its rule rows. Adding a
lender or a rule is an `INSERT`, not a deploy.

### Testing instructions (README section)

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
