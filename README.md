# What2Eat

A personal eating manager powered by Claude Code. No frontend — you talk to Claude, and it manages your food inventory, recommends recipes, and handles meal-related reminders.

## How It Works

Claude Code is the interface. This repo is the database. You tell Claude what you bought, ask what to cook, and it handles the rest — tracking inventory, searching recipes, logging meals, and managing reminders.

All data is stored as human-readable YAML and Markdown files, version-controlled with git.

## Setup

### 1. Create your instance

Use this repo as a GitHub template, or copy it:

```bash
cp -r What2Eat ~/What2Eat-data
cd ~/What2Eat-data
git init
```

### 2. Install the skills

Copy the skill files to your Claude Code skills directory:

**`~/.claude/skills/what2eat-app/SKILL.md`** — Eating manager mode

Update the `DATA_REPO` path in the skill file to point to your instance.

**`~/.claude/skills/what2eat-dev/SKILL.md`** — Framework development mode (optional)

### 3. Start using it

In Claude Code, type `/app` to activate eating manager mode. Then just talk naturally:

- "I bought 2 lbs of chicken breast, a bag of rice, and some broccoli"
- "What should I eat tonight? Something quick."
- "Remind me to defrost the salmon tomorrow morning"
- "I don't like cilantro"

## Components

| Component | SKILL.md | Data |
|---|---|---|
| **Inventory** | `inventory/SKILL.md` | `inventory/current.yaml` |
| **Recipes** | `recipes/SKILL.md` | `recipes/collection/*.md`, `recipes/history.yaml` |
| **Reminders** | `reminders/SKILL.md` | `reminders/active.yaml` |
| **Preferences** | `preferences/SKILL.md` | `preferences/profile.yaml` |

Each component has a `SKILL.md` that defines how Claude handles requests for that feature — data formats, workflows, and rules.

## Mode Switching

| Command | Purpose |
|---|---|
| `/app` | Use What2Eat as your eating manager (reads/writes your data repo) |
| `/dev` | Work on the What2Eat framework itself (improve skills, add features) |

## Philosophy

- **Claude Code is the UI** — no app to build or maintain
- **Git is the database** — full history, human-readable, portable
- **Skills are the logic** — SKILL.md files teach Claude how to handle each feature
- **Evolving preferences** — Claude learns what you like over time through explicit preferences and its memory system
