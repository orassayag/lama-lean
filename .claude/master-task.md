<!-- Sibling skill: orca. This is a deliberate duplicate, not shared code — mirror relevant changes by hand. -->
# Stage 2: API layer: controller, route, app wiring, integration tests, README (Persistence model + Postman/curl instructions)

## Your context
- Stage: 2 — API layer: controller, route, app wiring, integration tests, README (Persistence model + Postman/curl instructions)
- Project root: /Users/orassayag/Repos/lama-lean (you work HERE, directly on branch feature/plan — no worktree, no new branch)
- Your sentinel file: /Users/orassayag/Repos/lama-lean/.claude/status/stage-2.state
- Your report file: /Users/orassayag/Repos/lama-lean/.claude/status/stage-2-report.md

## What to build
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

## Ledger — what earlier stages built (onboarding notes)
# Master Run Ledger
Plan: docs/plans/plan.md

## Stage 1 — Constraint engine core (committed 2026-07-20)
**Files:** src/schemas/applicationInput.schema.ts, src/schemas/__tests__/applicationInput.schema.test.ts, src/types/lender.types.ts, src/services/operatorPredicates.ts, src/services/lenderRoster.ts, src/services/applicationMatcher.ts, src/services/__tests__/operatorPredicates.test.ts, src/services/__tests__/applicationMatcher.test.ts
**What was built:** Pure business-logic constraint engine, zero Express imports. `ApplicationInputSchema` (Zod, `.strict()`) validates/normalizes the loan application. `OPERATOR_PREDICATES` is the single `operator → predicate` lookup table (`eq`, `lt`, `gt`, `in`) — new constraint types are new table entries, never new conditional branches. `LENDER_ROSTER` encodes the fixed 5-lender config in spec order. `matchApplication()` filters eligible lenders, sorts by descending `rules.length` (stable sort preserves first-declared-wins tie-break), returns top two names as `string[]`.
**Key decisions:** `ApplicationField` is `keyof Application` inferred via `z.infer`, not hand-written, so it can't drift from the validated schema. `lt`/`gt`/`in` predicates use runtime `typeof`/`Array.isArray` guards instead of `as` casts on `unknown` operands. Relied on `Array.prototype.sort`'s ES2019+ stability guarantee for tie-break rather than a manual stable sort. Stage 2's controller calls `matchApplication(application: Application): string[]` directly — no other public surface needed from this layer.
**User overrides during review:** None — approved as reported.

## Rules
0. **FIRST ACTION, before any other work:** register yourself in the run roster so a dead
   pane can be resurrected (`/recover-session`). Append ONE JSON line to
   /Users/orassayag/Repos/lama-lean/.claude/status/roster.jsonl:
   `{"name":"stage-2","session_id":"<sid>","cwd":"<pwd>","worktree":null,"timestamp":"<UTC ISO-8601 from date -u>"}`
   Derive `<sid>` from the newest transcript for this directory:
   `ls -t "$HOME/.claude/projects/$(pwd | sed 's|[/.]|-|g')"/*.jsonl 2>/dev/null | head -1`
   (basename minus `.jsonl`). If no transcript dir exists yet, use `"unknown"` and move
   on — never burn time on this step.
1. Work directly in the project working tree on the current branch. Never create a
   branch or worktree, never switch branches, never rebase.
2. On start (after Rule 0): overwrite your sentinel file with `IN_PROGRESS` (single word,
   no spaces — use underscores).
3. **Never commit, stage, stash, or otherwise write to git** — no `git commit`, no
   `git add`, no `git stash`. Every change stays uncommitted in the working tree: the
   developer reviews your full diff and the orchestrator commits only after explicit
   approval. This is the core contract of this execution mode.
4. Touch ONLY the files this stage's tasks require. Other stages own the rest of the
   plan — anything you change outside your stage's scope will block the review.
5. On completion, and BEFORE setting your sentinel to DONE: write your report to
   /Users/orassayag/Repos/lama-lean/.claude/status/stage-2-report.md with exactly these sections:
   - `## Files` — every file you created or modified, one exact repo-relative path per
     line, nothing else. This becomes the explicit `git add` list — a missing path means
     unreviewed work silently left out of the commit.
   - `## Summary` — 2–4 plain-language sentences on what was built.
   - `## Commit message` — a conventional-commit message (subject + short why-body),
     usable verbatim if the developer approves.
   - `## Key decisions` — notable decisions, tradeoffs, and anything a later stage's
     agent must know. Mention notable decisions here — the orchestrator captures them
     in the ledger.
   - `## Open questions` — only if any exist; omit the section otherwise.
   Then overwrite your sentinel file with `DONE`.

   Your final assistant message in THIS terminal session must be exactly one short line —
   `Done.` (or `Blocked — see .claude/status/stage-2-blocker.md.` if
   applicable). Do not restate your report as chat output — the orchestrator reads and
   prints the report file in its own terminal; anything left only in your own pane is
   not seen by the user.
6. Run the project's type-checker, linter, and tests for the code you touched before
   reporting DONE; include the results in `## Summary`.
7. If you need a user decision: write it to
   /Users/orassayag/Repos/lama-lean/.claude/status/stage-2-blocker.md, overwrite your
   sentinel file with `BLOCKED`, then wait.
8. If feedback arrives in this session after you reported DONE: set your sentinel to
   `IN_PROGRESS`, apply the feedback, rewrite the report file in full (same sections —
   `## Files` must again list EVERY file changed since the stage began, not just the
   ones the feedback touched), then set your sentinel to `DONE` again.
9. Secret files (.env, *.pem, etc.) may be present in the project root — use them freely,
   never list them under `## Files`, never stage or commit them. If a needed secret is
   missing, log it to the blocker file and continue with work that doesn't depend on it.

## Definition of done
- All of this stage's tasks implemented; type-check/lint/tests run and reported
- NOTHING committed — all changes left uncommitted in the working tree
- Report written to /Users/orassayag/Repos/lama-lean/.claude/status/stage-2-report.md
- Sentinel file set to DONE
