# Security, Performance & Other Cross-Cutting Concerns

### Security
- **Secrets management.** Never commit secrets, API keys, or credentials to
  the repository — including in `.env` files, fixtures, or test data. Use
  the project's secret-manager/environment-injection mechanism. Never log
  secrets, tokens, or passwords (see also the PHI rule under Logging).
- **Cryptographically secure randomness for security-sensitive values.**
  Session tokens, password-reset codes, API keys, and any other
  security-sensitive identifier must be generated with a cryptographically
  secure random source (`crypto.randomBytes`/`crypto.randomUUID` in
  Node, `secrets` module in Python, or the equivalent) — never
  `Math.random()` or another non-cryptographic RNG. A non-cryptographic
  RNG's output can be predicted or brute-forced, which defeats the
  purpose of the token entirely.
- **Injection prevention.** Never build SQL/NoSQL queries via string
  concatenation or interpolation of user input — use parameterized
  queries/prepared statements or the query builder/ORM's safe API.
- **Output encoding / XSS.** Never inject raw, unescaped user input into
  HTML, especially via `dangerouslySetInnerHTML` or equivalent. Rely on the
  framework's default escaping; treat any bypass of it as something that
  needs explicit justification and review.
- **Dependency vulnerability scanning.** Run vulnerability scanning
  (e.g. `npm audit`, Snyk, Dependabot) as a CI gate on every PR, not only
  when a dependency is being manually updated.
- **Authorization checks happen server-side, always.** Never trust a
  client-supplied role, permission, or "I'm an admin" flag — re-check
  authorization on the server for every request that touches protected
  data or actions, even if the UI already hides the option from
  unauthorized users. UI-level hiding is a UX nicety, not a security
  control.
- **Rate limiting.** Public-facing endpoints (especially auth, password
  reset, and anything that triggers an expensive operation or external
  API call) should be rate-limited. Use the project's existing rate-limit
  middleware/infrastructure if one exists rather than hand-rolling a new
  one per endpoint.

### API & contract versioning
- When changing a shared schema, interface, or service contract that other
  services, packages, or consumers depend on, treat it as a breaking-change
  question first: can existing consumers still call this safely after the
  change deploys?
- Prefer additive, backward-compatible changes (new optional fields, new
  methods) over modifying or removing existing fields/methods.
- If a breaking change is unavoidable, version the contract explicitly
  (e.g. a new schema name, a new API version) rather than mutating the
  existing one in place under consumers that haven't been migrated yet.
- API error responses use a consistent shape across endpoints (e.g.
  `{ errorCode, message, details? }`) — match the typed-error structure
  used internally (see `error-handling-logging.md`) rather than letting each
  endpoint invent its own error format. A consumer should be able to
  handle errors generically without per-endpoint special-casing.
- **Never include a stack trace, raw database error, internal file path,
  or other internal implementation detail in an error response sent to
  an external caller.** The `message` field is a sanitized, intentional
  string written for the consumer, not whatever the underlying exception
  happened to say. This applies to the response only — internal logs
  should still capture full detail (stack trace, original error via
  `cause`, etc.) per the existing typed-error/logging guidance; the
  boundary being protected here is specifically what crosses to the
  caller, not what gets logged internally.

### Database practices
- **Migrations:** every schema change goes through the project's migration
  tool (not a manual change against a live database). Prefer
  expand-contract for changes that need zero downtime: add the new
  column/table first (expand), migrate code and backfill data, then
  remove the old one in a later migration (contract) — don't rename or
  drop a column in the same deploy that stops writing to it.
- **Transactions:** wrap multi-statement writes that must succeed or fail
  together in a transaction. Don't assume a multi-step write is atomic
  just because the statements are adjacent in code — without an explicit
  transaction, a failure between them leaves the data in a partially
  written state.
- **Indexes:** add an index for any column used in a `WHERE`, `JOIN`, or
  `ORDER BY` on a table expected to grow — this pairs with the existing
  N+1/pagination guidance under Performance; pagination doesn't help if
  the underlying query is doing a full table scan.
- **Query optimization:** select only the columns actually needed rather
  than `SELECT *`, especially on wide tables or hot paths.
- **Soft-delete vs. hard-delete:** check which the project already uses
  for a given entity before adding delete logic — they have different
  query implications (a soft-deleted row still needs every existing
  `SELECT` to filter it out) and mixing both approaches in one table is
  a common source of bugs. Don't introduce a new soft-delete flag in a
  table that hard-deletes everything else without an explicit reason.
- **Consistency expectations:** know whether the data path you're
  touching is meant to be strongly or eventually consistent (see Time-
  Based & Stateful Logic) before assuming a read reflects the most recent
  write.

### Feature flags — lifecycle, not just cleanup
- When **creating** a new feature flag: give it a clear, descriptive name
  (avoid generic names like `newFlow` or `test1`), state its default state
  explicitly, and note who/what owns the decision to remove it once the
  feature is fully rolled out.
- See the Git/Workflow section for the corresponding cleanup rule once a
  flag is removed.

### Performance
- **Measure before optimizing.** Don't restructure code for performance
  without a measured bottleneck (a profiler result, a slow-query log, an
  actual production metric) — optimizing the wrong thing costs real
  clarity for no real gain. The guidance below is about avoiding clear,
  predictable scaling problems (N+1 queries, unbounded lists), which is
  different from micro-optimizing code that was never shown to be slow.
- Avoid N+1 query patterns: when fetching related data for a list of
  items, batch the related fetch (a single query with an `IN` clause, a
  DataLoader-style batcher, or a single combined API call) rather than
  issuing one query/request per item in a loop.
- Any code path returning a list from a database or external API should
  support pagination (or explicitly document why the result set is
  bounded and safe to return in full) rather than assuming the list will
  always stay small.
- Be deliberate about algorithmic complexity in code that operates on
  collections that can grow large in production — a nested loop that's
  fine at 10 items can become a real problem at 10,000.
- For data that's read often and changes rarely, consider a cache (with
  an explicit invalidation strategy — a cache without one just becomes a
  source of stale-data bugs) rather than re-fetching/re-computing on
  every request.

### Accessibility (a11y)
- Use semantic HTML elements (`<button>`, `<nav>`, `<label>`, etc.) over
  generic `<div>`/`<span>` with click handlers.
- Interactive elements must be keyboard-navigable and have visible focus
  states — don't suppress the default focus outline without providing a
  replacement.
- Images need meaningful `alt` text (or an explicit empty `alt=""` for
  purely decorative images).
- Form inputs need an associated, programmatically-linked `<label>`.
- New colors added to the design-token files (see
  `constants-configuration.md`) should be checked against WCAG contrast
  requirements before being adopted.

### PR / diff size
- Keep a single PR scoped to one logical change and reviewable in one
  sitting. If a change naturally splits into independent pieces (e.g. a
  refactor plus a new feature built on top of it), submit them as separate
  PRs rather than one large diff.
- The same scoping principle applies one level down, at the commit level,
  not just the PR level: keep each commit to one logical change rather
  than bundling unrelated fixes into a single commit, even when they all
  end up in the same PR. A PR that's correctly scoped can still have an
  unreadable history if it's one giant commit — `git bisect` and `git
  blame` are only useful if commits are atomic.
- If a PR is growing large because it's touching unrelated code, that's
  also a trigger for the "asking before touching unrelated code" rule in
  the Git/Workflow section — scope creep in a diff and scope creep in
  intent are usually the same problem.

### Environment & configuration validation
- Validate required environment variables/config at application startup
  and fail fast with a clear error naming the missing variable — don't let
  a missing config value surface later as a confusing runtime error deep
  in a request handler.
- Don't read `process.env` (or equivalent) scattered throughout business
  logic; centralize config loading/validation in one place and inject the
  validated config object from there.

### Internationalization (i18n) — for user-facing products
- User-facing strings go through the project's i18n/translation mechanism
  rather than being hardcoded, where the project has one.
- Format dates, times, numbers, and currency using locale-aware
  formatting (e.g. `Intl.DateTimeFormat`/`Intl.NumberFormat` or the
  project's equivalent) rather than manual string formatting.
- Consider RTL layout impact when hardcoding directional CSS
  (`margin-left`, `text-align: left`) in components that need to support
  RTL locales — prefer logical properties (`margin-inline-start`, etc.)
  where the project supports them.

### Documentation lifecycle
- **When to write an ADR (Architecture Decision Record):** for a decision
  that's expensive to reverse, affects multiple teams/services, or
  chooses between two genuinely reasonable approaches where future
  readers will wonder "why this one?" — not for routine implementation
  choices that follow existing convention. Store ADRs wherever the
  project already keeps them (commonly `docs/adr/` or similar); check
  before inventing a new location.
- **API documentation** (OpenAPI/Swagger spec, README usage examples, or
  equivalent) is part of the change, not a follow-up — update it in the
  same PR as the API change it describes, not in a separate "update docs"
  task that may or may not happen later.
- **Keeping docs synchronized with implementation:** when a change makes
  an existing doc/comment/README section inaccurate, fix it as part of
  the same change rather than leaving it stale — this is the same
  instinct as the existing "never delete existing comments unless clearly
  wrong or obsolete" rule, applied to docs at the file/feature level
  rather than the line level.
- **Ownership:** a non-obvious architectural doc or ADR should name who
  made the decision (or which team owns the area) so a future reader
  knows who to ask — don't leave authorship ambiguous on a decision
  record.

### Ruleset maintenance
- **Adding, updating, or deleting a convention:** use the project's
  `/conventions` skill (writes to `.claude/rules/*.md` or
  `~/.claude/rules/*.md` depending on scope) rather than ad hoc edits —
  it handles scope classification, finding the right existing file
  (these per-topic files are the canonical source, not a merge target),
  and contradiction detection against existing rules.
- **Precedence Order is its own file** (`00-precedence-order.md`), not
  folded into any topic file — it's document-wide meta-guidance that
  applies across all of these files, not a per-topic rule. Don't move
  rules into it; it only changes when the precedence policy itself
  changes.
- **Deprecating a rule:** when a rule is found to be outdated, actively
  wrong, or superseded by a newer convention, remove it rather than
  leaving it in place marked "deprecated" — a stale rule left in the file
  for reference will eventually get followed by accident. If the
  reasoning for removing it is non-obvious, leave one line in the commit
  message explaining why, the same as the existing git-commit convention.
- **Resolving contradictions:** if two rules across these files actually
  conflict (not just overlap), fix it directly in the file(s) containing
  the conflicting rules — don't add a third rule elsewhere that tries to
  adjudicate between the first two. If the conflict is the kind covered
  by `00-precedence-order.md`, reference that instead of restating
  precedence logic locally.
- **Review cadence:** periodically re-check the TypeScript/ecosystem-
  specific guidance in `typescript-typing.md` and similar files (modern
  language features, recommended tooling, testing libraries) against
  current best practice — these date faster than the structural/process
  rules in files like this one. There's no fixed schedule mandated here;
  treat a rule that references a specific tool or version as worth a
  second look whenever that tool's ecosystem has moved meaningfully
  since the rule was written.
