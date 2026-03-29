# What2Eat — Development Progress

## v0.1.0 (Current)
- [x] Phase 1: Scaffold Tauri + React app
- [x] Phase 2: Data layer (Rust file I/O, YAML hooks, polling)
- [x] Phase 3: Claude CLI integration (subprocess, system prompt, chat)
- [x] Phase 4: Dashboard polish (search/filter, interactive features, cross-panel actions)
- [x] Bug fixes (double messages, auth, fs scope, YAML dates, Vite watcher, context isolation)
- [x] Setup wizard (welcome, dietary, cooking, pantry/seasonings, cuisines)
- [x] Preferences/Profile tab (editable, synced to YAML)
- [x] Settings (export/import tar.gz with schema validation, reset)
- [x] Chat controls (stop, retry, new chat, conversation confirmation)
- [x] Recipe source citations
- [x] Context-aware loading messages
- [x] Custom assistant naming
- [x] Error boundary
- [x] Photo upload support (image in chat, Claude reads via vision)
- [x] Persistent action buttons on all panels (log groceries, new reminder, suggest recipe)
- [x] Inline image display in chat bubbles
- [x] Ingredient scratchpad (collect items from inventory, ask for recipes)
- [x] Inventory click → expandable detail (replaces old jump-to-chat)
- [x] Structured recipe display (ingredients/instructions/notes parsed from markdown)
- [x] Gitignore user data for clean git pull updates (*.default.yaml pattern)
- [x] /save skill (user-level, saves progress + memory)

## Upcoming
- [ ] Phase 5: Animated chef/assistant sprite
- [ ] Phase 6: Visual polish (app icon, animations, transitions)
- [ ] Streaming Claude responses (switch to stream-json)
- [ ] Meal planning (weekly plan view)
- [ ] Grocery list generation from planned meals
- [ ] Nutrition tracking panel
- [ ] Push notifications for reminders
- [ ] Mobile companion app
