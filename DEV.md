# What2Eat — Desktop App

A Tauri + React desktop app for personal eating management. Features an animated chef character, chat interface (powered by Claude CLI subprocess), and dashboard panels for inventory, recipes, and reminders.

## Tech Stack

- **Desktop**: Tauri 2 (Rust backend)
- **Frontend**: React 19 + Vite + Tailwind CSS 4
- **AI**: Claude CLI invoked as subprocess via `@tauri-apps/plugin-shell`
- **Data**: YAML files in `data/` directory, read/written by Claude

## Dev Commands

- `npm run dev` — Vite dev server only (frontend)
- `cargo tauri dev` — Full app (Tauri + frontend)
- `cargo tauri build` — Production build (.dmg)

## Data Layer

All user data lives in `data/` as YAML/markdown files. Claude reads SKILL.md files for context and writes data files directly.

- `data/CLAUDE.md` — System prompt for Claude subprocess
- `data/inventory/` — Kitchen inventory
- `data/recipes/` — Recipe collection + meal history
- `data/reminders/` — Active reminders
- `data/preferences/` — User preferences
