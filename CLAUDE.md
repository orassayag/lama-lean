## ⚠️ Package Version Check — Do This First

Before writing any code or installing dependencies, verify all package versions listed
in `package.json`. Prefer the most stable, least-buggy known versions. Check the
npm registry or your knowledge of known issues and pin to a specific stable version.
Do not blindly use `latest`.

# lama-lean

## Project overview

A take-home exercise: build a web API for Lama's Loan Exchange that matches a loan
application against a set of lenders, each with its own "appetite" (acceptance
constraints), and returns the top two eligible lenders ordered by priority.

- Endpoint: `POST /applicationMatch`
- Input: a loan application (`requestedAmount`, `borrowerType`, `loanType`, `industry`,
  `state`, `riskLevel`)
- Output: an array of up to two lender names, eligible lenders ordered by priority —
  more constraints on a lender means higher priority when multiple lenders qualify
- No database required; in-memory data structures are sufficient
- Full spec, lender roster, and worked examples: `plan.md`

## Status

Scaffolded from the `api-express` boilerplate (Node.js + TypeScript + Express + Zod +
Pino + Vitest/Supertest). `pnpm install`, `type-check`, `lint`, and `test` all pass on
the scaffold as copied. The `/applicationMatch` endpoint itself has not been implemented
yet — that's the next stage (`/orca` or `/master` against `docs/plans/plan.md`).

## Design constraint (from the spec)

The exercise explicitly calls out that lender constraint types will grow in the
future ("we may have more types of constraints"), so the constraint/appetite model
should be extensible — e.g. each lender's appetite as a composable list of predicate
rules — not a hard-coded set of if/else checks per lender.

---
## Boilerplate Guidelines — api-express

### Project Identity

TypeScript + Express 4 REST API boilerplate. Minimal, scalable, interview-ready.

- **Node.js 22 LTS** | **TypeScript 5.x strict** | **Express 4.x**
- Validation: Zod | Logging: Pino | Testing: Vitest + Supertest
- Layered architecture: Router → Controller → Service → Repository

### Key Commands

```bash
pnpm run dev          # Start dev server with hot reload (tsx watch)
pnpm run build        # Compile TypeScript to dist/
pnpm run start        # Run compiled production build
pnpm run test         # Run all tests once
pnpm run test:watch   # Run tests in watch mode
pnpm run coverage     # Generate coverage report
pnpm run lint         # Lint all files
pnpm run lint:fix     # Auto-fix lint issues
pnpm run format       # Format all files with Prettier
pnpm run type-check   # TypeScript type check (no emit)
pnpm run check        # lint + type-check + test (run before committing)
```

### Folder rationale

| Folder | What belongs here |
|---|---|
| `src/config/` | Env parsing (`env.ts`) and logger singleton (`logger.ts`). Nothing else. |
| `src/routes/` | Express routers. HTTP method + path mapping only. No logic. |
| `src/controllers/` | Parse `req`, call service, send `res`. No business rules. |
| `src/services/` | All business logic. Zero Express imports. |
| `src/middleware/` | Cross-cutting: error handler, async wrapper, validation factory, request ID. |
| `src/types/` | Express namespace augmentations only (e.g., `req.user`). |
| `src/utils/` | Pure helper functions. No Express, no side effects. |
| `src/**/__tests__/` | Tests co-located next to the code they exercise. No root-level `tests/` folder. |
| `src/__tests__/helpers/` | Shared test utilities and app factory (`testApp.ts`). |

For this project, the extensible constraint engine (`Rule`, `Lender`, the
`operator → predicate` lookup table, and the lender roster config) is business logic
with zero Express imports — it belongs in `src/services/`, not in the controller.

### Import style

- Use `.js` extension in all TypeScript imports (required by NodeNext module resolution).
- Use named exports. Avoid default exports.
- Import `config` from `src/config/env.js`. Never read `process.env` directly elsewhere.
- Import the pino logger from `src/config/logger.js`. Never use `console.log`.

### Key conventions

- Every async controller MUST be wrapped with `asyncHandler()` from `src/middleware/asyncHandler.js`.
- All env vars must be declared in `.env.example` AND validated in `src/config/env.ts`.
- `app.ts` exports `createApp()` — do not call `listen()` there.
- `index.ts` is the only file that calls `listen()` and registers `SIGTERM`/`SIGINT` handlers.

### Do

- Wrap every async controller with `asyncHandler()`.
- Keep controllers thin: validate → call service → respond.
- Use Zod for all incoming request validation.
- Use the Pino logger, never `console.log`.
- Add `.js` extension to all TS import paths.
- Write an integration test for every new route (happy path + one error case minimum).
- Run `pnpm run check` before committing.

### Don't

- Don't put business logic in controllers or routes.
- Don't read `process.env` outside `src/config/env.ts`.
- Don't use `any` — use Zod-inferred types instead.
- Don't import `src/index.ts` in tests (it starts the server).
- Don't commit `.env`.
- Don't disable ESLint rules without a comment explaining why.

### Out-of-Scope for this project (matches plan.md's Out-of-scope section)

- Authentication, rate limiting beyond the boilerplate default, or any concern not
  named in the spec.
- An actual database — the boilerplate ships no ORM/driver by default anyway; the
  README's "Persistence model" write-up is the only DB-related deliverable.
- Multi-tenant lender configs, admin UI.

---
## Local Rules & Skills (auto-populated by /boiler)

See `.claude/rules/` and `.claude/skills/` in this project for bank conventions that were
loaded and applied during scaffolding. Read them before making changes here.

---
## Known gotchas

- Plan-mandated response shape vs. boilerplate convention: `plan.md` specifies the
  success response is a bare `string[]` (e.g. `["First Lama Bank", "Lama International
  Bank"]`), not any `{ success, data }` wrapper. Return the bare array on success; keep
  the boilerplate's existing error envelope for error cases only. (bank lesson L001)
- If CORS ever becomes a real requirement here, check the default isn't left as a
  wildcard (`*`) when an allow-list is actually needed — the boilerplate's CORS
  middleware defaults open if the origin env var is unset. Not applicable to this
  project as scoped (no browser frontend), but worth knowing if that changes. (bank
  lesson L002)

---
## Preferences

- Always - After improving session check if there are related files need to be updated (like README.md, or relevant skills, etc..)
- Never ask me this on the future: Branch choice ("You're on the default branch. How should /master proceed?") — auto-create the feature branch without asking.
- once stage done if it's not the last step don't suggest "/master approve" — just tell which command to continue to the next stage or feedback for changes. When the last stage comes only then suggest to run "/master approve".

<!-- model-policy:start -->
## Model Policy
Mode: **default**
- plan-review: claude-opus-4-8
- orca (orchestrator / top-tier agent chunks): claude-opus-4-8 / claude-opus-4-8
- plan-finalize / boiler / boiler-update / lesson: claude-sonnet-5
- orca mid / cheap agent chunks: claude-sonnet-5 / claude-haiku-4-5-20251001
Switch with `/mode default` or `/mode god-mode`.
<!-- model-policy:end -->

<!-- boiler:project-context:start -->
---
## Project Context (auto-generated by /boiler)

**Plan source:** docs/plans/plan.md
**Boilerplate used:** api-express
**Scaffolded:** 2026-07-20

### Project-Specific Notes

Single-endpoint `POST /applicationMatch` API. The core deliverable is a config-driven
constraint engine: `Lender = { name, rules: Rule[] }`, `Rule = { field, operator, value }`,
matched through an `operator → predicate` lookup table — new lenders or constraint types
are data/registry additions, never new conditional branches. The 5-lender roster and its
rule counts are fixed in `docs/plans/plan.md`; priority among eligible lenders is
descending `rules.length`, ties broken by first-declared-wins order in that roster. No
persistence beyond the process; the README needs a "Persistence model" section (in-memory
`Lender[]` → `lenders`/`lender_rules` tables) and Postman/curl testing instructions with
the plan's worked example. See the "Known gotchas" section above for the one boilerplate
convention this project deliberately diverges from (bare-array success response).
<!-- boiler:project-context:end -->
