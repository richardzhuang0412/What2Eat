# What2Eat — Framework Development

This is the **template repo** for What2Eat, a personal eating manager powered by Claude Code. You are in development mode — working on the framework itself, not managing anyone's food.

## Architecture Overview

### Two-Repo Model

| Repo | Purpose |
|---|---|
| **This repo** (template) | The framework — SKILL.md files, skills, CLAUDE.app.md, empty data defaults |
| **User's data repo** (created from template) | Personal data — inventory, recipes, preferences, meal history |

Users clone this template, run `/setup`, and get a personal instance. They run `/sync` to pull framework updates.

### File Naming Convention

| File | In template | After `/setup` in data repo |
|---|---|---|
| `CLAUDE.md` | Dev instructions (this file) | Overwritten by `CLAUDE.app.md` |
| `CLAUDE.app.md` | App instructions (generic, no personalization) | Renamed to `CLAUDE.md` |
| `CLAUDE.local.md` | Does not exist (gitignored) | Created by `/setup` — user personalizations, never synced |
| `*/SKILL.md` | Component skills | Copied as-is, updated by `/sync` |
| `.claude/skills/*/SKILL.md` | Slash command skills | Copied as-is, updated by `/sync` |
| `*.yaml` data files | Empty defaults | Populated with user's real data |
| `README.md`, `tasks/` | Dev docs and tracking | Removed by `/setup` |

### Sync Flow (`/sync`)

Framework updates flow **one-way** from template → data repo. No merge conflicts possible because:
1. Framework files (SKILL.md, skills, CLAUDE.app.md) are always overwritten from template
2. Data files (*.yaml, collection/, CLAUDE.local.md) are never touched
3. `CLAUDE.app.md` gets renamed to `CLAUDE.md` after extraction

The `/sync` skill uses `git show template/main:<path>` to extract files — no merge, no rebase, just file replacement.

## Repo Structure

```
What2Eat/
├── CLAUDE.md                          # Dev instructions (this file)
├── CLAUDE.app.md                      # App instructions (shipped to users)
├── README.md                          # User-facing docs
├── .gitignore                         # Includes CLAUDE.local.md
├── inventory/
│   ├── SKILL.md                       # Component skill
│   └── current.yaml                   # Empty default
├── recipes/
│   ├── SKILL.md                       # Component skill
│   ├── collection/.gitkeep            # Empty recipe collection
│   └── history.yaml                   # Empty default
├── reminders/
│   ├── SKILL.md                       # Component skill
│   └── active.yaml                    # Empty default
├── preferences/
│   ├── SKILL.md                       # Component skill
│   └── profile.yaml                   # Empty default
├── .claude/
│   └── skills/
│       ├── setup/SKILL.md             # /setup — onboarding
│       └── sync/SKILL.md              # /sync — pull updates
└── tasks/
    ├── todo.md                        # Dev tracking
    └── lessons.md                     # Dev lessons
```

## Dev Principles

1. **Framework files are generic** — no hardcoded names, paths, or personal data
2. **SKILL.md files are the product** — they define how Claude handles each feature; improve them carefully
3. **Data files stay empty** — `*.yaml` files should only contain empty defaults or examples
4. **Commit convention**: `dev: [description]` for all framework changes
5. **Backward compatible** — changes should not break existing user data repos
6. **Test by reasoning** — think through how changes affect `/setup`, `/sync`, and daily app usage
7. **Update /sync when adding files** — if you add a new framework file, add it to the sync list in `.claude/skills/sync/SKILL.md`

## How to Add a New Skill

Skills are Claude Code slash commands defined as markdown files. They ship with the repo and are auto-discovered when a user opens the project in Claude Code.

### Creating a project-level skill

1. Create the directory: `.claude/skills/<skill-name>/`
2. Create the skill file: `.claude/skills/<skill-name>/SKILL.md`
3. Add YAML frontmatter:

```yaml
---
name: <skill-name>
description: One-line description shown in the command palette
user-invocable: true
---
```

4. Write the skill body in markdown — this is the instruction set Claude follows when the skill is invoked
5. Add the skill to the sync list in `.claude/skills/sync/SKILL.md` so data repos pick it up

### Skill frontmatter options

| Field | Type | Purpose |
|---|---|---|
| `name` | string | The command name (invoked as `/<name>`) |
| `description` | string | Shown in command palette and skill listings |
| `user-invocable` | bool | `true` = user can invoke with `/<name>`. `false` = only Claude can invoke it |

### Skill body guidelines

- **Be specific** — tell Claude exactly what to read, what to write, and what to commit
- **Reference data files** — point to the exact YAML/markdown files the skill operates on
- **Define the workflow** — step-by-step procedure, not vague instructions
- **Handle edge cases** — what if the file is empty? what if data already exists?
- **Include commit convention** — how should changes from this skill be committed?
- **Use AskUserQuestion** — for interactive skills, describe what questions to ask and what options to offer

### Skill organization

Skills can include additional resources:

```
.claude/skills/<skill-name>/
├── SKILL.md              # Main skill definition (required)
├── references/           # Reference docs the skill can read
│   └── guide.md
└── scripts/              # Helper scripts the skill can execute
    └── check.sh
```

### Example: adding a `/weekly-plan` skill

```
.claude/skills/weekly-plan/SKILL.md
```

```yaml
---
name: weekly-plan
description: Generate a weekly meal plan based on inventory and preferences
user-invocable: true
---

# /weekly-plan — Weekly Meal Planning

1. Read inventory/current.yaml, preferences/profile.yaml, recipes/history.yaml
2. Generate a 7-day meal plan considering...
3. Write to recipes/weekly-plan.yaml
4. Commit: "recipes: generate weekly meal plan for [date range]"
```

Then add to sync list in `.claude/skills/sync/SKILL.md`:
```bash
git show template/main:.claude/skills/weekly-plan/SKILL.md > .claude/skills/weekly-plan/SKILL.md
```

## How to Add a New Component

A component is a feature area with its own SKILL.md and data file(s). Example: adding a `nutrition/` component.

1. Create the directory: `nutrition/`
2. Create the skill file: `nutrition/SKILL.md` — defines how Claude handles nutrition-related requests
3. Create empty data default: `nutrition/tracking.yaml` with an empty structure
4. Add to the routing table in both `CLAUDE.md` (dev) and `CLAUDE.app.md` (app)
5. Add to the sync list in `.claude/skills/sync/SKILL.md`
6. Update README.md components table

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
