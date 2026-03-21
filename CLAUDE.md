# What2Eat — Framework Development

This is the **template repo** for What2Eat, a personal eating manager powered by Claude Code. You are in development mode — working on the framework itself, not managing anyone's food.

## Repo Structure

- `CLAUDE.md` — this file (dev instructions)
- `CLAUDE.app.md` — app-mode instructions (shipped to users, renamed to `CLAUDE.md` during `/setup`)
- `*/SKILL.md` — component skill definitions (inventory, recipes, reminders, preferences)
- `.claude/skills/` — slash command skills (`/setup`, `/sync`)
- `*.yaml` data files — empty defaults (templates for user instances)
- `README.md` — user-facing documentation

## How It Works

Users create their own repo from this template, run `/setup` (which renames `CLAUDE.app.md` → `CLAUDE.md`, creates `CLAUDE.local.md`, removes dev files), and start talking to Claude about food. They run `/sync` to pull framework updates.

## Dev Principles

1. **Framework files are generic** — no hardcoded names, paths, or personal data
2. **SKILL.md files are the product** — they define how Claude handles each feature; improve them carefully
3. **Data files stay empty** — `*.yaml` files should only contain empty defaults or examples
4. **Commit convention**: `dev: [description]` for all framework changes
5. **Backward compatible** — changes should not break existing user data repos
6. **Test by reasoning** — think through how changes affect `/setup`, `/sync`, and daily app usage

## Request Routing (for reference)

| Request type | Read first | Data files |
|---|---|---|
| Initial setup (`/setup`) | `.claude/skills/setup/SKILL.md` | `preferences/profile.yaml`, `inventory/current.yaml` |
| Sync framework (`/sync`) | `.claude/skills/sync/SKILL.md` | — |
| Shopping/grocery update | `inventory/SKILL.md` | `inventory/current.yaml` |
| "What should I eat?" | `recipes/SKILL.md` | `inventory/current.yaml`, `preferences/profile.yaml`, `recipes/history.yaml` |
| Recipe search/save | `recipes/SKILL.md` | `recipes/collection/`, `recipes/history.yaml` |
| Reminders | `reminders/SKILL.md` | `reminders/active.yaml` |
| Preference updates | `preferences/SKILL.md` | `preferences/profile.yaml` |

## Available Skills

| Skill | Purpose |
|---|---|
| `/setup` | Guided onboarding — initializes a user's data repo |
| `/sync` | Pull latest framework updates from template |
