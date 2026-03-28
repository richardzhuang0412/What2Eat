# What2Eat — Lessons Learned

## Tauri 2
- Shell plugin scoped commands go in `capabilities/default.json`, NOT in `plugins` config in `tauri.conf.json`
- `Command.create(scopeName, args)` — first arg must match the `name` field in the capability scope
- Always kill port 5173 before `cargo tauri dev` — previous Vite processes linger
- Tailwind v4 uses `@tailwindcss/vite` plugin, not PostCSS config

## Claude CLI Integration
- `--output-format text` is simpler and more reliable than `stream-json` for initial integration
- `--add-dir data` gives Claude tool access to the data directory
- `--bare` suppresses the interactive UI elements
- `--no-session-persistence` prevents session file creation
- `--dangerously-skip-permissions` needed for non-interactive subprocess usage
- System prompt should explicitly say "no markdown formatting" since Claude defaults to it
