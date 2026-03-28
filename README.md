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

## Quick Start

### Step 1: Install prerequisites

<details>
<summary><strong>Already have Node, Rust, and Claude CLI?</strong> Skip to Step 2.</summary>

#### Install Xcode Command Line Tools (macOS)

Open Terminal and run:
```bash
xcode-select --install
```
Click "Install" when the popup appears. This provides the compilers needed to build the app.

#### Install Node.js

Download and install from [nodejs.org](https://nodejs.org/) (pick the LTS version). Or with Homebrew:
```bash
brew install node
```

#### Install Rust

Open Terminal and run:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```
Follow the prompts (press Enter for defaults). Then restart your terminal or run:
```bash
source $HOME/.cargo/env
```

#### Install Claude Code CLI

```bash
npm install -g @anthropic-ai/claude-code
```
Then log in:
```bash
claude /login
```
Follow the browser prompts to authenticate.

#### Install Tauri CLI

```bash
cargo install tauri-cli --version "^2"
```
This takes a few minutes on first install.

</details>

### Step 2: Get the app

```bash
git clone https://github.com/richardzhuang0412/What2Eat.git
cd What2Eat
npm install
```

### Step 3: Run it

```bash
cargo tauri dev
```

The setup wizard will guide you through configuring your profile on first launch.

> **Note:** The first build takes a few minutes to compile Rust dependencies. Subsequent launches are fast.

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
