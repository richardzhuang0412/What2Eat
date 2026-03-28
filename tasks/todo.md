# What2Eat — Development Progress

## Completed
- [x] Phase 1: Scaffold Tauri + React app (sidebar, routing, warm palette)
- [x] Phase 2: Data layer (YAML utils, polling hooks, real data in all panels)
- [x] Phase 3: Claude CLI integration (chat, system prompt, scoped shell commands)

## In Progress
- [ ] Phase 4: Dashboard polish (interactive features, better layouts, brainstorm)

## Upcoming
- [ ] Phase 5: Animated chef sprite (Canvas rendering, state transitions)
- [ ] Phase 6: First-run setup wizard (visual onboarding replacing CLI /setup)
- [ ] Phase 7: Final polish (app icon, menu bar, keyboard shortcuts, error handling)

## Key Files
- `src/utils/claude.js` — Claude CLI invocation + system prompt building
- `src/hooks/useClaudeChat.js` — Chat conversation state management
- `src/hooks/useYamlData.js` — Reactive YAML file reading with polling
- `src/hooks/useRecipes.js` — Recipe collection reading
- `src/components/Chat.jsx` — Chat interface
- `src/components/Inventory.jsx` — Kitchen inventory grouped by location
- `src/components/Recipes.jsx` — Recipe cards + meal history
- `src/components/Reminders.jsx` — Reminder list with urgency colors
- `src-tauri/capabilities/default.json` — Tauri permissions (fs, shell)
- `data/` — All YAML data files + SKILL.md context files
