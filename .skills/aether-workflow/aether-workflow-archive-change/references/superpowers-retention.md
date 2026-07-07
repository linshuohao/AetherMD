# Superpowers Retention and Compression

Use this reference during **Step 11** of `aether-workflow-archive-change`, after OpenSpec archive succeeds.

## Goal

Keep `.superpowers/` lean. Completed changes MUST leave only a small archive summary; active directories MUST contain only in-progress changes.

## Default Policy

**Compress and delete** redundant execution artifacts. Do **not** retain long-lived `tasks/`, `plans/`, `reviews/`, or nested `runs/` trees under `.superpowers/archive/`.

Relocation to archive subfolders is a short-lived staging step only when `final-report.md` is not yet written. Once `final-report.md` exists, delete the redundant files.

## Preserve (archive root only)

Each archived change directory `.superpowers/archive/<YYYY-MM-DD>-<change>/` SHALL contain at most:

| File | Required |
| --- | --- |
| `final-report.md` | Yes — MUST include **Tasks Completed** table sufficient to replace per-task files |
| `validation.md` | Yes when validation was recorded |
| `deviations.md` | Optional |

## Delete

After copying preserved files to the archive root, delete:

| Path | When |
| --- | --- |
| `.superpowers/tasks/<change>/` | Always for archived changes |
| `.superpowers/plans/<change>.md` | Always for archived changes |
| `.superpowers/reviews/<change>.md` | Always for archived changes |
| `.superpowers/runs/<change>/` | After `final-report.md`, `validation.md`, and `deviations.md` are copied to archive root |
| `.superpowers/archive/<date>-<change>/tasks/` | After compression |
| `.superpowers/archive/<date>-<change>/plans/` | After compression |
| `.superpowers/archive/<date>-<change>/reviews/` | After compression |
| `.superpowers/archive/<date>-<change>/runs/` | After flattening preserved files to archive root |
| `.superpowers/archive/<date>-<change>/review.md` | Loose review copies when `final-report.md` exists |

## Target Archive Layout

```text
.superpowers/archive/<YYYY-MM-DD>-<change>/
  final-report.md
  validation.md
  deviations.md    # optional
```

## Compression Procedure

1. Confirm OpenSpec archive completed for `<change>`.
2. Confirm `.superpowers/runs/<change>/final-report.md` exists and **Tasks Completed** is populated.
3. Create `.superpowers/archive/<YYYY-MM-DD>-<change>/` if missing.
4. Copy to archive root (flatten nested `runs/<change>/` paths if present):
   - `final-report.md`
   - `validation.md` (if exists)
   - `deviations.md` (if exists)
5. Delete active execution paths for `<change>`:
   - `.superpowers/tasks/<change>/`
   - `.superpowers/plans/<change>.md`
   - `.superpowers/reviews/<change>.md`
   - `.superpowers/runs/<change>/`
6. Delete redundant subtrees under the archive directory (`tasks/`, `plans/`, `reviews/`, `runs/`, loose `review.md`).
7. Verify active `.superpowers/tasks/`, `plans/`, `reviews/`, and `runs/` contain **only** in-progress change names.

## Active Directory Invariants

While a change is in progress, full Superpowers artifacts remain in active paths:

- `.superpowers/plans/<change>.md` (Full Change only)
- `.superpowers/tasks/<change>/`
- `.superpowers/reviews/<change>.md`
- `.superpowers/runs/<change>/validation.md`

Retention MUST NOT run until archive completes.

## Bulk Maintenance (Optional)

When historical archive directories still contain `tasks/`, `plans/`, `reviews/`, or `runs/` subtrees:

1. For each `.superpowers/archive/<date>-<change>/` that already has `final-report.md`
2. Flatten preserved files to the archive root if needed
3. Delete redundant subtrees per **Delete** table above

Use bulk maintenance during docs/workflow hygiene; it is not a substitute for per-change compression at archive time.

## Do Not Compress When

- OpenSpec archive has not completed
- `final-report.md` is missing
- **Tasks Completed** in `final-report.md` is empty or insufficient to replace task files
- validation was required but `validation.md` was not copied to archive root
- the change is still in progress

## Authority

- OpenSpec archived change: `openspec/changes/archive/<YYYY-MM-DD>-<change>/`
- Superpowers summary: `.superpowers/archive/<YYYY-MM-DD>-<change>/final-report.md`

Per-task detail after compression lives in OpenSpec archive artifacts and git history, not in `.superpowers/tasks/`.
