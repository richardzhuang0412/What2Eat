---
name: sync
description: Pull latest framework updates from the What2Eat template repo without touching your personal data
user-invocable: true
---

# /sync — Sync Framework from Template

Pull the latest SKILL.md files, skills, and app instructions from the upstream What2Eat template repo. Your personal data (inventory, recipes, preferences, reminders, CLAUDE.local.md) is never touched.

## What Gets Synced

**Always updated from template:**
- `inventory/SKILL.md`
- `recipes/SKILL.md`
- `reminders/SKILL.md`
- `preferences/SKILL.md`
- `.claude/skills/setup/SKILL.md`
- `.claude/skills/sync/SKILL.md`
- `.claude/skills/test/SKILL.md`
- `.claude/skills/help/SKILL.md`
- `CLAUDE.app.md` → renamed to `CLAUDE.md` (overwrites app instructions)

**Never touched:**
- `inventory/current.yaml`
- `recipes/history.yaml`
- `recipes/collection/*`
- `reminders/active.yaml`
- `preferences/profile.yaml`
- `CLAUDE.local.md`

## Sync Procedure

### Step 1 — Ensure template remote exists

Check if a git remote named `template` exists:

```bash
git remote get-url template
```

If it doesn't exist, ask the user: "What's the URL of your What2Eat template repo?"
- Default suggestion: `https://github.com/richardzhuang0412/What2Eat.git`
- Add it: `git remote add template <url>`

### Step 2 — Fetch latest

```bash
git fetch template
```

### Step 3 — Extract framework files

For each framework file, extract the latest version from the template:

```bash
git show template/main:inventory/SKILL.md > inventory/SKILL.md
git show template/main:recipes/SKILL.md > recipes/SKILL.md
git show template/main:reminders/SKILL.md > reminders/SKILL.md
git show template/main:preferences/SKILL.md > preferences/SKILL.md
git show template/main:.claude/skills/setup/SKILL.md > .claude/skills/setup/SKILL.md
git show template/main:.claude/skills/sync/SKILL.md > .claude/skills/sync/SKILL.md
git show template/main:.claude/skills/test/SKILL.md > .claude/skills/test/SKILL.md
git show template/main:.claude/skills/help/SKILL.md > .claude/skills/help/SKILL.md
git show template/main:CLAUDE.app.md > CLAUDE.md
```

Note the last line: `CLAUDE.app.md` from the template becomes `CLAUDE.md` in the data repo.

### Step 4 — Check for new skills

List all skills in the template that might not exist locally yet:

```bash
git ls-tree template/main .claude/skills/ --name-only
```

If there are new skill directories not present locally, extract them too.

### Step 5 — Show changes

Run `git diff` to show what changed. Summarize the updates for the user:
- Which files were updated
- Brief description of what changed (read the diff)

### Step 6 — Commit

If there are changes:

```bash
git add -A
git commit -m "sync: update framework from template"
```

If no changes: "You're already up to date with the latest template."

## Edge Cases

- **First sync after manual setup**: If the user set up their repo manually (without `/setup`), the `template` remote won't exist. Guide them through adding it.
- **User modified a SKILL.md locally**: The sync will overwrite it. Warn the user before committing: "Note: your local changes to [file] will be overwritten. If you want to keep customizations, put them in CLAUDE.local.md or open a PR to the template."
- **New component added to template**: If the template adds a new directory (e.g., `nutrition/`), the sync should create it along with its SKILL.md and empty data file.
