---
name: test
description: Create a disposable test environment from the current template using a git worktree
user-invocable: true
---

# /test — Test Environment

Create, use, or tear down a disposable test environment for testing framework changes. Uses a git worktree so you get a full copy of the repo on a separate branch without cloning.

## Commands

The user may invoke `/test` with an argument:

- `/test` or `/test create` — create a new test environment
- `/test teardown` — remove the test environment
- `/test status` — check if a test environment exists

Default (no argument) is `create`.

## Create

### Step 1 — Check for existing test environment

```bash
git worktree list
```

If a worktree at `../What2Eat-test` already exists, ask: "A test environment already exists. Want to tear it down and start fresh, or switch to it?"

### Step 2 — Create worktree

Create a new branch and worktree from the current HEAD:

```bash
git worktree add ../What2Eat-test -b test-env
```

This creates `~/Desktop/What2Eat-test/` with a full copy of the template on branch `test-env`.

### Step 3 — Simulate /setup (initialize as app)

In the worktree directory, perform Stage 0 of `/setup`:

1. Rename `CLAUDE.app.md` → `CLAUDE.md`
2. Create a test `CLAUDE.local.md`:
   ```markdown
   # What2Eat — Test Environment

   User: Test User

   This is a disposable test instance. Created from template at [timestamp].

   ## Custom Instructions
   (Test any personalizations here)
   ```
3. Remove dev files: `README.md`, `tasks/`

### Step 4 — Report

Tell the user:
```
Test environment ready at ~/Desktop/What2Eat-test/
Branch: test-env

To test your changes:
1. Open that directory in Claude Code (or use absolute paths)
2. Run /setup to test the full onboarding flow
3. Or interact directly — "I bought chicken", "what should I eat?"

When done: /test teardown
```

## Teardown

### Step 1 — Remove worktree and branch

```bash
cd ~/Desktop/What2Eat
git worktree remove ../What2Eat-test --force
git branch -D test-env
```

### Step 2 — Confirm

Tell the user: "Test environment removed. You're back on the template repo."

## Status

List worktrees and report whether a test environment exists:

```bash
git worktree list
```

## Notes

- The worktree shares git history with the template repo but has its own working tree and branch
- Changes in the worktree do NOT affect the template's `main` branch
- If the user makes commits in the test environment, those are on `test-env` branch — they'll be lost on teardown (warn before deleting if there are commits)
- The test environment picks up the latest state of `main` when created — so create a fresh one after making template changes
