<!--
Delta spec template for a change.

This template shows the 4 kinds of delta section; use only the ones you need:
- ADDED / MODIFIED / REMOVED / RENAMED
File name and location: openspec/changes/<change-name>/specs/<capability>/spec.md
(`<capability>` matches the directory name under openspec/specs/<capability>/)

Hard format rules (validated by OpenSpec):
- Requirement sentences MUST contain `SHALL` or `MUST`
- Every Requirement MUST have at least one `#### Scenario:`
- Scenarios MUST use level-4 (`####`); level-3 or a bullet fails silently
-->

## ADDED Requirements

<!-- New behavior. List the new Requirements this change adds to the capability. -->

### Requirement: <!-- requirement name -->
<!-- requirement text — must contain SHALL or MUST -->

#### Scenario: <!-- scenario name -->
- **WHEN** <!-- condition -->
- **THEN** <!-- expected outcome -->

---

## MODIFIED Requirements

<!--
Modify an existing Requirement. **MUST use exactly the same normalized header as
openspec/specs/<capability>/spec.md** (case-sensitive match after trimming). Otherwise
the delta apply fails at archive time because it can't find the matching requirement.

**MUST paste the full modified content** (not just a diff), because OpenSpec archive
applies MODIFIED by replacing the whole text.
-->

### Requirement: <!-- same header as in the existing spec -->
<!-- full modified requirement text — contains SHALL or MUST -->

#### Scenario: <!-- scenario name (can be added or modified) -->
- **WHEN** <!-- condition -->
- **THEN** <!-- expected outcome -->

---

## REMOVED Requirements

<!--
Remove an existing Requirement. MUST include a Reason and a Migration note so reviewers
understand why it was removed and how existing references should migrate.
-->

### Requirement: <!-- header to remove, exactly as in the existing spec -->

**Reason**: <!-- why it is removed -->

**Migration**: <!-- how existing callers/dependents should adjust -->

---

## RENAMED Requirements

<!--
Rename a Requirement header. The format is fixed: FROM / TO with code-formatted headers.
If both the name and the content change, list the name change in RENAMED **and** write the
full content again in MODIFIED under the **new** header.

Apply order at archive time: RENAMED → REMOVED → MODIFIED → ADDED
-->

- FROM: `### Requirement: <Old Name>`
- TO: `### Requirement: <New Name>`
