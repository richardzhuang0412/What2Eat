# What2Eat 🍳

A personal food assistant and kitchen housekeeper — powered by Claude, built with Tauri.

Talk naturally about food and your assistant manages everything: grocery tracking, recipe suggestions, meal planning, and reminders. No forms, no buttons for data entry — just chat.

<img width="800" alt="What2Eat Screenshot" src="https://github.com/user-attachments/assets/placeholder.png">

## Features

- **Chat with your assistant** — "I just went grocery shopping", "what should I eat tonight?", "remind me to defrost chicken"
- **Kitchen inventory** — tracks what's in your fridge, freezer, and pantry with expiry warnings
- **Recipe collection** — saves recipes with source citations, browse and cook from your collection
- **Smart reminders** — defrosting, grocery runs, meal prep with urgency indicators
- **Editable profile** — dietary restrictions, equipment, cuisine preferences — all editable
- **Name your assistant** — give it a personality (Mochi, Basil, Pepper, or your own name)
- **Export/import** — backup and restore your data as a tar.gz archive
- **Schema validation** — imported data auto-fixed by Claude if formats don't match

## Prerequisites

- **macOS** (Windows/Linux support planned)
- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) installed and logged in
- [Node.js](https://nodejs.org/) 18+
- [Rust](https://rustup.rs/) toolchain

## Quick Start

```bash
# Clone the repo
git clone https://github.com/richardzhuang0412/What2Eat.git
cd What2Eat

# Install dependencies
npm install

# Run the app
cargo tauri dev
```

The setup wizard will guide you through configuring your profile on first launch.

## How It Works

```
You type naturally → Tauri app → Claude CLI subprocess → reads/writes YAML data → UI updates
```

- **Claude CLI** runs as a subprocess with its working directory set to `data/`, so it only sees your food data — never your source code
- **SKILL.md** files teach Claude how to handle each feature (inventory, recipes, reminders, preferences)
- **YAML files** store all your data — human-readable, git-friendly, exportable
- **React frontend** polls data files and renders them as a dashboard

## Project Structure

```
What2Eat/
├── src/                  # React frontend
│   ├── components/       # Chat, Inventory, Recipes, Reminders, Preferences, Settings, Setup
│   ├── hooks/            # useClaudeChat, useYamlData, useRecipes
│   └── utils/            # claude.js, yaml.js, loadingMessages.js
├── src-tauri/            # Rust backend
│   └── src/lib.rs        # Tauri commands (Claude invocation, file I/O, export/import)
├── data/                 # User data + framework files
│   ├── CLAUDE.md         # System prompt for Claude subprocess
│   ├── inventory/        # SKILL.md + current.yaml
│   ├── recipes/          # SKILL.md + collection/ + history.yaml
│   ├── reminders/        # SKILL.md + active.yaml
│   └── preferences/      # SKILL.md + profile.yaml
├── CLAUDE.md             # Dev instructions (for Claude Code sessions)
└── ARCHITECTURE.md       # Design decisions + iteration guide
```

## Building for Production

```bash
cargo tauri build
```

This creates a `.dmg` installer in `src-tauri/target/release/bundle/`.

## Contributing

The fastest way to improve What2Eat is to edit the `data/*/SKILL.md` files — they control how Claude handles each feature. No code changes needed for behavior tweaks.

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full iteration guide.

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop | [Tauri 2](https://v2.tauri.app/) |
| Frontend | React 19 + Vite + Tailwind CSS 4 |
| AI | Claude CLI (subprocess) |
| Data | YAML + Markdown files |

## License

MIT
