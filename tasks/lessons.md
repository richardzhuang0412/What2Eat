# What2Eat — Lessons Learned

## Tauri 2
- Shell plugin scoped commands go in `capabilities/default.json`, NOT in `plugins` config in `tauri.conf.json`
- `Command.create(scopeName, args)` — first arg must match the `name` field in the capability scope
- Always kill port 5173 before `cargo tauri dev` — previous Vite processes linger
- Tailwind v4 uses `@tailwindcss/vite` plugin, not PostCSS config
- Tauri fs plugin scope rejects absolute paths even with `**` glob — use Rust invoke commands instead
- Tauri's Rust binary CWD is `src-tauri/`, not project root — use `.parent()` for project root

## Claude CLI Integration
- `--output-format text` is simpler and more reliable than `stream-json` for initial integration
- `--bare` flag blocks OAuth/keychain auth — don't use it, use CWD isolation instead
- `--no-session-persistence` prevents session file creation
- `--dangerously-skip-permissions` needed for non-interactive subprocess usage
- `--disable-slash-commands` prevents loading skills from the working directory
- System prompt should explicitly say "no markdown formatting" since Claude defaults to it
- Root CLAUDE.md gets auto-discovered by subprocess — isolate via Rust CWD to data/

## React / Frontend
- js-yaml auto-converts YAML date strings to Date objects — use `{ schema: yaml.JSON_SCHEMA }`
- React StrictMode double-fires effects causing duplicate messages — removed for Tauri app
- Chat component must stay mounted (use CSS hidden) to preserve state across tab switches
- Vite watches all files by default — exclude `data/**` to prevent reloads when Claude writes
- useRef guards prevent double-fire of effects even without StrictMode
