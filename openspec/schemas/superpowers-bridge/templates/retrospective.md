# Retrospective: <change-name>

> Written: <YYYY-MM-DD> (after verify passed)
> Commit range: `<base-sha>..<head-sha>`
> Worktree: <path or "merged to main">

---

## 0. Evidence

> Quantitative baseline. The Wins / Misses bullets below cite it directly, so no line needs its own [evidence: ...].
> If the retro is written cold (some time after the cycle ends), this section should still be
> rebuildable from `git log` + `tasks.md` + commit messages alone.

- **Commit range**: `<base-sha>..<head-sha>` (<n> commits)
- **Diff size**: <+X / -Y lines across N files>
- **Tasks done**: <x>/<y> (`grep -cE '^\s*- \[x\]' tasks.md` → x; the regex allows indented sub-tasks)
- **Active hours**: <estimate>
- **Subagent dispatches**: <count or "n/a">
- **New external dependencies**: <list, with license + version, or "none">
- **Bugs encountered post-merge**: <count, one-line each, or "none">
- **OpenSpec validate state at archive**: <pass / fail / not-run>
- **Test coverage signal**: <e.g. jacoco %, pytest count, vitest count, or "n/a">

Commit chain (chronological):

```
<base-sha> <one-line summary>
...
<head-sha> <archive commit one-line>
```

---

## 1. Wins

- [evidence: <commit/file/test>] <description>

## 2. Misses

- 🔴 [blocking | evidence: ...] <description>
- 🟡 [painful  | evidence: ...] <description>
- 📌 [nit      | evidence: ...] <description>

## 3. Plan deviations

| Plan task | What changed | Why |
|-----------|--------------|-----|
| 1.2       | ...          | ... |

## 4. Skill / workflow compliance

| Skill                                            | Used |
|--------------------------------------------------|------|
| superpowers:brainstorming                        |      |
| superpowers:writing-plans                        |      |
| superpowers:using-git-worktrees                  |      |
| superpowers:subagent-driven-development          |      |
| (transitive) superpowers:test-driven-development |      |
| (transitive) superpowers:requesting-code-review  |      |
| superpowers:finishing-a-development-branch       |      |

> **Default expectation**: all ✓. Every skill is part of the schema design,
> so skipping one is the exception. Every ✗ must be explained, with a prevention plan,
> in the `### Deliberately Skipped Skills` subsection below.

### Deliberately Skipped Skills

> Skipping a skill is the design's escape hatch, not the normal path. Every ✗ must answer the three questions below.
> An empty section (all green) is the expected state.

- **`<skill name>`**
  - **What was skipped**: <whether the whole skill or only a specific sub-step was skipped>
  - **Why this cycle**: <the concrete condition in this cycle. Vague reasons like "not needed" / "too small" / "no time" / "blocked by an external dep" / "skill output looked wrong" are not accepted; give the actual trigger (a specific commit / log line / observed behavior)>
  - **How to prevent recurrence**: how will the next cycle avoid skipping under the same conditions? Pick one:
    - `schema graph fix`: name the exact part of schema.yaml to change
    - `skill description tightening`: name the exact skill frontmatter / instruction to change
    - `CLAUDE.md trigger`: name the exact rule to add to the adopter's CLAUDE.md.fragment
    - `scope-judgment rule`: state exactly how this cycle's scope should be judged
    - `one-off — schema boundary case, no prevention possible`: state explicitly why it is a boundary case (vague reservations not accepted)

> **Relation to §6 Promote candidates**: if several cycles give the same `How to prevent`
> answer for the same skill, promote that pattern to §6 and open a schema / skill PR directly. Don't let it become "normal".

## 5. Surprises

- <assumption that turned out wrong>

## 6. Promote candidates → long-term learning

Write each candidate as a `- [ ]` checklist item:

- Title: severity emoji (🔴/🟡/📌) + one-sentence learning
- `→ **Promote to** <destination>` (memory / CLAUDE.md / schema / skill / one-off)
- Two-line body (matches the superpowers feedback memory body schema):
  - `> **Why**: <reason; often a past incident or strong preference>`
  - `> **How to apply**: <when/where this guidance kicks in>`

An unchecked `- [ ]` means the candidate has not been promoted yet. Carry it to the next cycle's retro to re-evaluate,
or keep it as a cross-cycle observation point.

> **Carry-forward mechanism**: when writing the next cycle's retro, run
> `grep -A 5 '^- \[ \]' openspec/changes/archive/*/retrospective.md` to pull
> earlier unchecked candidates. For each one, decide whether to carry it forward into this cycle's §6,
> promote it on the spot, or mark it stale and stop tracking it.

Example:

- [ ] 🔴 **<short rule>** → **Promote to memory** (type: feedback)
  > **Why**: <past incident or strong preference that motivated this rule>
  > **How to apply**: <which file / cycle phase / decision moment this kicks in>

- [ ] 🟡 **<another candidate>** → **Promote to project CLAUDE.md** (`<path/to/CLAUDE.md>` section)
  > **Why**: ...
  > **How to apply**: ...

- [ ] 📌 **<third candidate>** → **One-off** (record it, don't promote)
  > **Why**: <why it doesn't generalize>
