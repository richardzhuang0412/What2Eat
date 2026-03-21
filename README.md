# What2Eat

A personal eating manager powered by Claude Code. No frontend — you talk to Claude, and it manages your food inventory, recommends recipes, and handles meal-related reminders.

## How It Works

Claude Code is the interface. This repo is the database. You tell Claude what you bought, ask what to cook, and it handles the rest — tracking inventory, searching recipes, logging meals, and managing reminders.

All data is stored as human-readable YAML and Markdown files, version-controlled with git.

## Getting Started

### Quick install (recommended)

Have someone tech-savvy run this for you:

```bash
bash <(curl -sL https://raw.githubusercontent.com/richardzhuang0412/What2Eat/main/install.sh)
```

Or if you have the repo locally:

```bash
bash What2Eat/install.sh
```

This handles all the setup automatically. Then open the created folder in Claude Code and type `/setup`.

### Manual install

1. Use this repo as a GitHub template (or `cp -r What2Eat ~/What2Eat-data && cd ~/What2Eat-data && git init`)
2. Open in Claude Code
3. Run `/setup`

### After setup

Just talk naturally:

- "I bought 2 lbs of chicken breast, a bag of rice, and some broccoli"
- "What should I eat tonight? Something quick."
- "Remind me to defrost the salmon tomorrow morning"
- "I don't like cilantro"

Type `/help` anytime to see what you can do.

## Components

| Component | SKILL.md | Data |
|---|---|---|
| **Inventory** | `inventory/SKILL.md` | `inventory/current.yaml` |
| **Recipes** | `recipes/SKILL.md` | `recipes/collection/*.md`, `recipes/history.yaml` |
| **Reminders** | `reminders/SKILL.md` | `reminders/active.yaml` |
| **Preferences** | `preferences/SKILL.md` | `preferences/profile.yaml` |

Each component has a `SKILL.md` that defines how Claude handles requests for that feature — data formats, workflows, and rules.

## Skills

| Command | Purpose |
|---|---|
| `/setup` | Guided onboarding — configure profile and inventory |
| `/help` | Friendly guide of what you can do |
| `/sync` | Pull latest framework updates from the template repo |

## Philosophy

- **Claude Code is the UI** — no app to build or maintain
- **Git is the database** — full history, human-readable, portable
- **Skills are the logic** — SKILL.md files teach Claude how to handle each feature
- **Evolving preferences** — Claude learns what you like over time through explicit preferences and its memory system
