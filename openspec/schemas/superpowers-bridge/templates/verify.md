# Verification Report

> The `openspec-verify-change` skill generates this file after apply finishes, to confirm the implementation
> matches the specs / design / tasks. For any failed check, go back to the matching artifact, fix it,
> then run verify again.

**Change**: `<change-name>`
**Verified at**: `YYYY-MM-DD HH:mm`
**Verifier**: `<who / which agent>`

---

## 1. Structural Validation (`openspec validate --all --json`)

- [ ] Every item is `"valid": true`

**Result**:

```text
<paste a summary of the openspec validate --all output>
```

If any items fail, list their id + issues:

| Item | Type | Issues |
|---|---|---|
| — | — | — |

---

## 2. Task Completion (`tasks.md`)

- [ ] Every `- [ ]` has become `- [x]`

**Incomplete tasks** (if any):

| Task | Why incomplete | Blocks archive? |
|---|---|---|
| — | — | — |

---

## 3. Delta Spec Sync State

For each capability directory under `openspec/changes/<name>/specs/`, compare it against
`openspec/specs/<capability>/spec.md`:

| Capability | Sync state | Notes |
|---|---|---|
| — | ✓ synced / ✗ pending sync / N/A | — |

---

## 4. Design / Specs Coherence Spot Check

Spot-check whether the decisions in `design.md` show up in the Requirements and
Scenarios in `specs/*.md`:

| Sample | What design says | Matching spec | Gap |
|---|---|---|---|
| — | — | — | — |

**Drift warnings** (non-blocking):

- <list any; otherwise write "none">

---

## 5. Implementation Signal

- [ ] No unstaged files in the worktree
- [ ] All related commits have been pushed

**Commit range** (if known): `<from-sha>..<to-sha>`

---

## 6. Front-Door Routing Leak Detector (warning, non-blocking)

Design output should not land in `docs/superpowers/specs/`. The brainstorm artifact's
output redirection sends it to `openspec/changes/<name>/brainstorm.md` instead.

Detection:

```bash
ls docs/superpowers/specs/*.md 2>/dev/null
```

- [ ] No files, or the files present are legitimate leftovers from before the schema was installed

**Leak list** (if any):

| File | Content already captured in the change? | Suggested action |
|---|---|---|
| — | — | — |

> This does not block archive. Any leak from a new schema-installed cycle should be moved into
> `openspec/changes/<name>/brainstorm.md` or `design.md`, and the original file deleted.

---

## 7. Deferred Manual Dogfood vs Automated Test Equivalence

For each manual dogfood / smoke task marked `[~]` (deferred) in plan.md, list the equivalent
automated test coverage. If there is no equivalent automated test, treat the item as a **real gap**,
not a reasonable deferral, and record it under Misses in the retrospective.

| Deferred dogfood (plan §) | Equivalent automated test | Coverage assessment | Real gap? |
|---|---|---|---|
| e.g.: §11.3 `compose up + curl /actuator/health` | `LinebcIntegrationApplicationTests` (Testcontainers, 24s) | Spring context boot + Flyway completes + main beans injected | ❌ already covered by an equivalent test |
| — | — | — | — |

> **How to judge**:
> - "Equivalent" = the automated test's assertions are a superset of the assertions the manual dogfood expects
> - "Coverage assessment" = list the layers actually exercised (context / DB schema / wiring / HTTP path / etc.)
> - A row with "real gap = ✅" can still get an Overall Decision of PASS, but it needs a follow-up entry in the retrospective

> **When this section can be left empty**: if plan.md has no rows marked `[~]`, this section needs no content (empty = PASS).
> If plan.md has any `[~]`, this section must list each one; otherwise the Overall Decision should drop to FAIL.

---

## Overall Decision

- [ ] ✅ PASS — can proceed to finishing-a-development-branch and archive
- [ ] ⚠️ PASS WITH WARNINGS — can proceed to the next steps, but note: `<explanation>`
- [ ] ❌ FAIL — go back to the failed artifact, fix it, and run verify again

**Next step**:

<describe the next action>
