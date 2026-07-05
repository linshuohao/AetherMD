# Validation: add-workflow-path-classification

## Commands

| Command | Result |
| --- | --- |
| `pnpm skills:sync` | pass — synced 13 skills |
| `pnpm skills:check` | pass |
| `pnpm workflow:pr-check` | pass — skip (no PR body in CI default) |
| `pnpm check` | see final run |

## Discover Routing Samples

| Sample request | Expected path | open_spec_required |
| --- | --- | --- |
| Fix README typo | Maintenance | no |
| Clarify one docs paragraph | Quick Change | no |
| Single engineering-workflow requirement (1 task) | Spec Change | yes |
| Add workflow skill + routing (this change) | Full Change | yes |

## Escalation Sample

- Quick Change touching `.skills/aether-workflow/**` → escalate to Full Change (protected boundary).

## Deviations

- none
