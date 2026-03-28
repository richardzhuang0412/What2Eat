# What2Eat — Architecture & Iteration Guide

## Current Architecture

```
┌─────────────────────────────────────────────────┐
│                   Tauri App                      │
│  ┌─────────────┐  ┌──────────────────────────┐  │
│  │  React UI   │  │  Rust Backend (lib.rs)    │  │
│  │  - Chat     │←→│  - invoke_claude (CWD=data/) │
│  │  - Inventory│  │  - read/write_data_file   │  │
│  │  - Recipes  │  │  - export/import/reset    │  │
│  │  - Reminders│  │  - validate_imported_data │  │
│  │  - Settings │  └──────────────────────────┘  │
│  └─────────────┘                                 │
│         ↕ polling (2s)                           │
│  ┌──────────────────────────────────────────────┐│
│  │  data/                                        ││
│  │  ├── CLAUDE.md       (framework - chef prompt)││
│  │  ├── CLAUDE.local.md (user overrides)         ││
│  │  ├── inventory/      (SKILL.md + current.yaml)││
│  │  ├── recipes/        (SKILL.md + collection/) ││
│  │  ├── reminders/      (SKILL.md + active.yaml) ││
│  │  └── preferences/    (SKILL.md + profile.yaml)││
│  └──────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘
```

## Key Design Decisions & Rationale

### 1. Claude CLI as subprocess (not API)
**Why**: Uses existing auth, no API key management, matches tinyroommate pattern.
**Trade-off**: No streaming responses, slower than direct API. Each message is a fresh invocation (no session continuity in Claude itself — we simulate it by passing recent messages in the prompt).
**Future**: Could switch to Claude API for streaming + lower latency. The `sendMessage` function is the only abstraction to change.

### 2. YAML files as database
**Why**: Human-readable, git-diffable, Claude can read/write natively via its tools.
**Trade-off**: No querying beyond what Claude or the UI code does. No concurrent write safety.
**Future**: If data grows large (hundreds of recipes, years of history), consider SQLite with a YAML export layer. The Rust backend already abstracts file access.

### 3. SKILL.md as product logic
**Why**: The SKILL.md files define how Claude handles each feature. Updating a SKILL.md changes behavior without any code changes. This is the most powerful iteration lever.
**Implication for feedback loops**: When users report "Claude did X wrong when I asked Y", the fix is usually in the SKILL.md, not the app code. Keep a log of these.

### 4. Context separation (dev vs app)
**Why**: Root CLAUDE.md is dev context; data/CLAUDE.md is chef context. Rust CWD isolation prevents cross-contamination.
**Implication**: Any new feature that adds files to the data/ directory needs to decide: framework file (ships with app, not exported) or user file (personal data, exportable).

## Iteration Playbook

### When a user reports "Claude said something wrong"

1. **Check data/CLAUDE.md** — is the instruction missing or ambiguous?
2. **Check the relevant SKILL.md** — does it cover this case?
3. **Add/fix the instruction** — be specific, give examples
4. **No code change needed** — SKILL.md updates take effect on next Claude invocation

### When a user wants a new feature

1. **Can it be done with just SKILL.md changes?** (e.g., "suggest meals based on weather") → Update SKILL.md, add to CLAUDE.md routing table
2. **Does it need new data files?** (e.g., nutrition tracking) → New directory in data/, new SKILL.md, new YAML file, add to export list
3. **Does it need UI?** (e.g., nutrition dashboard) → New React component, add to sidebar
4. **Does it need new Rust commands?** (rare — only for things the frontend can't do via existing commands)

### When updating data schemas

1. **Add new fields with defaults** — never require migration for additions
2. **If removing/renaming fields** — the validate_imported_data command will auto-fix old data via Claude
3. **Update the SKILL.md** — Claude learns the new format from there
4. **Consider export compatibility** — old backups should still import cleanly

### When collecting user feedback

Keep a `feedback.md` or use GitHub Issues with these categories:
- **Chef behavior** — Claude said/did something wrong → SKILL.md fix
- **UI/UX** — layout, interaction, visual issue → React component fix
- **Missing feature** — user wants something new → follow the playbook above
- **Performance** — slow responses, lag → usually Claude CLI latency, consider caching or API migration

## Future Enhancements (Prioritized)

### High value, low effort (SKILL.md only)
- Meal planning for the week
- Grocery list generation from planned meals
- Budget-aware suggestions ("cheap meals this week")
- Seasonal ingredient awareness

### Medium effort (new UI + SKILL.md)
- Nutrition tracking panel
- Grocery list view (auto-generated from recipes)
- Cooking timer integration
- Photo logging (take a photo of your meal)

### Higher effort (architecture changes)
- Claude API migration for streaming responses
- Animated chef sprite (Phase 5 — Canvas rendering)
- Multi-user support (family accounts)
- Mobile companion app (React Native or Tauri mobile)
- Push notifications for reminders (requires native integration)

## File Responsibility Map

| File | What changes it | How often |
|---|---|---|
| `data/CLAUDE.md` | Chef persona, general behavior | Monthly |
| `data/*/SKILL.md` | Feature-specific logic | Per feedback cycle |
| `data/CLAUDE.local.md` | User-specific overrides | Per user |
| `src/components/*.jsx` | UI layout and interaction | Per feature/bug |
| `src/hooks/*.js` | Data fetching and state | Rarely |
| `src/utils/claude.js` | Claude CLI invocation | Rarely |
| `src-tauri/src/lib.rs` | System-level commands | When adding new capabilities |
| `src/utils/loadingMessages.js` | Chat personality | When adding new interaction patterns |
