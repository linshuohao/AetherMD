#!/usr/bin/env bash
# project-git-flow.sh — standardized Git branch workflow (no ad-hoc git commands)
set -euo pipefail

# ── state ──────────────────────────────────────────────────────────────────────
STEP=""
BRANCH=""
COMMIT_HASH=""
PUSHED="no"
MERGED="no"
PR_STATUS="skipped"
PR_URL=""
CHECKS="skipped"
WARNINGS=()

# ── defaults (overridden by detect_config) ─────────────────────────────────────
REMOTE="${GIT_FLOW_REMOTE:-origin}"
MAIN_BRANCH="${GIT_FLOW_MAIN:-}"
PM=""
CHECK_CMD=""
SYNC_STRATEGY="${GIT_FLOW_SYNC:-rebase}"   # rebase | merge
ALLOW_DIRECT_MERGE="${ALLOW_DIRECT_MERGE:-false}"

# ── flags ──────────────────────────────────────────────────────────────────────
DO_STAGE=true
DO_COMMIT=true
DO_SYNC=true
DO_CHECKS=true
DO_PUSH=true
DO_PR=true
COMMIT_MESSAGE="${COMMIT_MESSAGE:-}"
PR_TITLE="${GIT_FLOW_PR_TITLE:-}"
PR_BODY="${GIT_FLOW_PR_BODY:-}"

# ── helpers ───────────────────────────────────────────────────────────────────
fail() {
  local reason="$1"
  local next="${2:-Review git status and retry.}"
  printf 'Failed at: %s\nReason: %s\nNext: %s\n' "$STEP" "$reason" "$next" >&2
  exit 1
}

guard_no_force_push() {
  if [[ "${1:-}" == *"--force"* ]] || [[ "${1:-}" == *"-f "* ]]; then
    fail "force push is forbidden" "Remove --force and retry."
  fi
}

guard_not_on_main_for_work() {
  local branch="$1"
  if [[ "$branch" == "main" || "$branch" == "master" ]]; then
    fail "business changes on protected branch '$branch'" \
      "git checkout -b <type>/<topic> && re-run script"
  fi
}

guard_direct_merge() {
  if [[ "$ALLOW_DIRECT_MERGE" != "true" ]]; then
    return 1
  fi
  return 0
}

warn() {
  WARNINGS+=("$1")
}

summary() {
  printf 'Done.\nbranch: %s\ncommit: %s\npushed: %s\nmerged: %s\npr: %s\nchecks: %s\n' \
    "$BRANCH" "${COMMIT_HASH:-none}" "$PUSHED" "$MERGED" "$PR_STATUS" "$CHECKS"
  if [[ -n "$PR_URL" ]]; then
    printf 'pr_url: %s\n' "$PR_URL"
  fi
  if ((${#WARNINGS[@]} > 0)); then
    for w in "${WARNINGS[@]}"; do printf 'warning: %s\n' "$w"; done
  fi
}

has_script() {
  local script="$1"
  node -e "
    const p=require('./package.json');
    process.exit(p.scripts && p.scripts['$script'] ? 0 : 1);
  " 2>/dev/null
}

validate_pr_title() {
  local title="$1"
  if [[ -f .commitlintrc.cjs ]] && command -v pnpm >/dev/null 2>&1; then
    printf '%s\n' "$title" | pnpm exec commitlint --config .commitlintrc.cjs >/dev/null 2>&1 \
      || fail "PR title failed commitlint" "Use --pr-title with a Conventional Commits title"
  fi
}

generate_pr_body() {
  local commit_list
  commit_list="$(git log "${REMOTE}/${MAIN_BRANCH}"..HEAD --pretty=format:'- %s' 2>/dev/null \
    || git log "$MAIN_BRANCH"..HEAD --pretty=format:'- %s' 2>/dev/null \
    || true)"
  if [[ -z "$commit_list" ]]; then
    commit_list="- $(git log -1 --pretty=%s)"
  fi

  local validation_line="- [ ] checks: $CHECKS"
  if [[ "$CHECKS" == "passed" ]]; then
    validation_line="- [x] \`${CHECK_CMD:-project checks}\` passed"
  fi

  cat <<EOF
## Summary

$commit_list

## Traceability

- OpenSpec:
- Superpowers tasks:
- Docs / ADR:

## Validation

$validation_line

## Anticorruption Review

- [ ] Architecture boundaries preserved
- [ ] Public contracts explicitly documented
- [ ] Tests or docs validation recorded
- [ ] No unrelated files changed
- [ ] Deviations recorded
EOF
}

create_or_report_pr() {
  if ! $DO_PR; then
    PR_STATUS="skipped"
    return
  fi

  if ! command -v gh >/dev/null 2>&1; then
    warn "gh CLI not found; install GitHub CLI to auto-create PRs"
    PR_STATUS="skipped"
    return
  fi

  if ! gh auth status >/dev/null 2>&1; then
    warn "gh CLI not authenticated; run 'gh auth login' to auto-create PRs"
    PR_STATUS="skipped"
    return
  fi

  STEP="create pull request"
  local existing_url
  existing_url="$(gh pr view --json url -q .url 2>/dev/null || true)"
  if [[ -n "$existing_url" ]]; then
    PR_URL="$existing_url"
    PR_STATUS="existing"
    return
  fi

  local title="${PR_TITLE:-$(git log -1 --pretty=%s)}"
  validate_pr_title "$title"

  local body="${PR_BODY:-$(generate_pr_body)}"
  local pr_file
  pr_file="$(mktemp)"
  printf '%s' "$body" >"$pr_file"

  if ! PR_URL="$(gh pr create --base "$MAIN_BRANCH" --head "$BRANCH" --title "$title" --body-file "$pr_file")"; then
    rm -f "$pr_file"
    fail "gh pr create failed" "gh pr create --base $MAIN_BRANCH --head $BRANCH --title \"$title\""
  fi
  rm -f "$pr_file"
  PR_STATUS="created"
}

# ── parse args ─────────────────────────────────────────────────────────────────
usage() {
  cat <<'EOF'
Usage: project-git-flow.sh [options]

Options:
  -m, --message MSG       Commit message (required when committing)
  --no-stage              Do not auto-stage changes
  --no-commit             Skip commit
  --no-sync               Skip sync with main
  --no-checks             Skip project checks
  --no-push               Skip push
  --no-pr                 Skip pull request creation
  --pr-title TITLE        PR title override (default: latest commit subject)
  --pr-body BODY          PR body override (default: project template)
  --allow-direct-merge    Allow local merge into main (default: false)
  --rebase                Sync feature branch via rebase (default)
  --merge                 Sync feature branch via merge
  -h, --help              Show help

Environment:
  ALLOW_DIRECT_MERGE=true   Enable direct merge to main
  COMMIT_MESSAGE=...        Commit message
  GIT_FLOW_REMOTE=origin    Remote name
  GIT_FLOW_MAIN=main        Main branch override
  GIT_FLOW_CHECK_CMD=...    Override check command
  GIT_FLOW_SYNC=rebase|merge
  GIT_FLOW_PR_TITLE=...     PR title override
  GIT_FLOW_PR_BODY=...      PR body override
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -m|--message) COMMIT_MESSAGE="${2:-}"; shift 2 ;;
    --no-stage) DO_STAGE=false; shift ;;
    --no-commit) DO_COMMIT=false; shift ;;
    --no-sync) DO_SYNC=false; shift ;;
    --no-checks) DO_CHECKS=false; shift ;;
    --no-push) DO_PUSH=false; shift ;;
    --no-pr) DO_PR=false; shift ;;
    --pr-title) PR_TITLE="${2:-}"; shift 2 ;;
    --pr-body) PR_BODY="${2:-}"; shift 2 ;;
    --allow-direct-merge) ALLOW_DIRECT_MERGE=true; shift ;;
    --rebase) SYNC_STRATEGY=rebase; shift ;;
    --merge) SYNC_STRATEGY=merge; shift ;;
    -h|--help) usage; exit 0 ;;
    *) fail "unknown argument: $1" "$(basename "$0") --help" ;;
  esac
done

# ── 1. preflight ──────────────────────────────────────────────────────────────
STEP="preflight"
if ! git rev-parse --git-dir >/dev/null 2>&1; then
  fail "not a git repository" "cd into the project root"
fi

BRANCH="$(git branch --show-current)"
if [[ -z "$BRANCH" ]]; then
  fail "detached HEAD" "git checkout <branch>"
fi

# ── 2. detect project config ──────────────────────────────────────────────────
STEP="detect project config"

# main branch
if [[ -z "$MAIN_BRANCH" ]]; then
  if [[ -f .changeset/config.json ]]; then
    MAIN_BRANCH="$(node -e "console.log(require('./.changeset/config.json').baseBranch||'')" 2>/dev/null || true)"
  fi
  if [[ -z "$MAIN_BRANCH" ]]; then
    MAIN_BRANCH="$(git symbolic-ref refs/remotes/${REMOTE}/HEAD 2>/dev/null | sed "s@refs/remotes/${REMOTE}/@@" || true)"
  fi
  MAIN_BRANCH="${MAIN_BRANCH:-main}"
fi

# package manager
if [[ -f pnpm-lock.yaml ]] || grep -q '"packageManager".*pnpm' package.json 2>/dev/null; then
  PM="pnpm"
elif [[ -f yarn.lock ]]; then
  PM="yarn"
elif [[ -f bun.lockb ]] || [[ -f bun.lock ]]; then
  PM="bun"
elif [[ -f package-lock.json ]]; then
  PM="npm"
fi

# check command — project docs > env override > package.json scripts
if [[ -n "${GIT_FLOW_CHECK_CMD:-}" ]]; then
  CHECK_CMD="$GIT_FLOW_CHECK_CMD"
elif [[ -f docs/community/git-workflow.md ]] && grep -q 'pnpm check' docs/community/git-workflow.md 2>/dev/null; then
  CHECK_CMD="${PM:-pnpm} check"
elif [[ -f package.json ]]; then
  for script in check lint test build; do
    if has_script "$script"; then
      if [[ -n "$PM" ]]; then
        CHECK_CMD="$PM run $script"
      else
        CHECK_CMD="npm run $script"
      fi
      break
    fi
  done
fi

# merge policy from docs
if [[ -f docs/community/git-workflow.md ]] && grep -qi 'squash merge' docs/community/git-workflow.md 2>/dev/null; then
  : # project uses PR + squash merge; direct merge stays disabled unless ALLOW_DIRECT_MERGE
fi

# ── 3. validate current branch ────────────────────────────────────────────────
STEP="validate current branch"
guard_not_on_main_for_work "$BRANCH"

# ── 4. check working tree ─────────────────────────────────────────────────────
STEP="check working tree"
DIRTY="$(git status --porcelain)"
HAS_CHANGES=false
if [[ -n "$DIRTY" ]]; then
  HAS_CHANGES=true
fi

# ── 5. stage changes ─────────────────────────────────────────────────────────
if $HAS_CHANGES && $DO_STAGE && $DO_COMMIT; then
  STEP="stage changes"
  git add -A
fi

# ── 6. commit ─────────────────────────────────────────────────────────────────
if $HAS_CHANGES && $DO_COMMIT; then
  STEP="commit"
  if [[ -z "$COMMIT_MESSAGE" ]]; then
    fail "commit message required" "$(basename "$0") -m \"<type>(<scope>): <summary>\""
  fi
  # commitlint if available
  if [[ -f .commitlintrc.cjs ]] && command -v pnpm >/dev/null 2>&1; then
  printf '%s\n' "$COMMIT_MESSAGE" | pnpm exec commitlint --config .commitlintrc.cjs >/dev/null 2>&1 \
    || fail "commit message failed commitlint" "Fix message per docs/community/git-workflow.md"
  fi
  git commit -m "$COMMIT_MESSAGE"
  COMMIT_HASH="$(git rev-parse --short HEAD)"
elif [[ -n "$(git rev-parse HEAD 2>/dev/null)" ]]; then
  COMMIT_HASH="$(git rev-parse --short HEAD)"
fi

# ── 7. fetch origin ───────────────────────────────────────────────────────────
STEP="fetch origin"
git fetch "$REMOTE" --prune --quiet

# ── 8–10. sync with main ──────────────────────────────────────────────────────
if $DO_SYNC; then
  STEP="checkout main"
  git checkout "$MAIN_BRANCH"

  STEP="pull latest main"
  git pull "$REMOTE" "$MAIN_BRANCH" --ff-only || \
    fail "fast-forward pull failed on $MAIN_BRANCH" "git pull --ff-only $REMOTE $MAIN_BRANCH"

  STEP="checkout feature branch"
  git checkout "$BRANCH"

  STEP="sync main into feature branch"
  if [[ "$SYNC_STRATEGY" == "rebase" ]]; then
    if ! git rebase "$REMOTE/$MAIN_BRANCH"; then
      fail "rebase conflict" "git rebase --abort  # fix conflicts manually, then re-run"
    fi
  else
    if ! git merge "$REMOTE/$MAIN_BRANCH" --no-edit; then
      fail "merge conflict" "git merge --abort  # fix conflicts manually, then re-run"
    fi
  fi
fi

# ── 11. run checks ────────────────────────────────────────────────────────────
if $DO_CHECKS; then
  if [[ -n "$CHECK_CMD" ]]; then
    STEP="run checks"
    if ! eval "$CHECK_CMD"; then
      fail "checks failed: $CHECK_CMD" "$CHECK_CMD"
    fi
    CHECKS="passed"
  else
    warn "no check command detected; skipping checks"
    CHECKS="skipped"
  fi
else
  CHECKS="skipped"
fi

# ── 12. push feature branch ───────────────────────────────────────────────────
if $DO_PUSH; then
  STEP="push feature branch"
  guard_no_force_push "push"
  if git push -u "$REMOTE" "$BRANCH" 2>/dev/null || git push "$REMOTE" "$BRANCH"; then
    PUSHED="yes"
  else
    fail "push rejected" "git push -u $REMOTE $BRANCH"
  fi
fi

# ── 13. optional direct merge to main ─────────────────────────────────────────
if guard_direct_merge; then
  if [[ "$CHECKS" != "passed" ]]; then
    fail "cannot merge without passing checks" "Re-run without --no-checks"
  fi
  STEP="merge feature into main"
  git checkout "$MAIN_BRANCH"
  git pull "$REMOTE" "$MAIN_BRANCH" --ff-only
  if ! git merge "$BRANCH" --no-ff -m "merge($BRANCH): integrate feature branch"; then
    fail "merge to main conflict" "git merge --abort && git checkout $BRANCH"
  fi
  STEP="push main"
  guard_no_force_push "push main"
  git push "$REMOTE" "$MAIN_BRANCH" || fail "push main rejected" "git push $REMOTE $MAIN_BRANCH"
  git checkout "$BRANCH"
  MERGED="yes"
else
  MERGED="no"
  if $DO_PUSH; then
    create_or_report_pr
  fi
fi

# ── 14. final summary ─────────────────────────────────────────────────────────
STEP="final summary"
summary
