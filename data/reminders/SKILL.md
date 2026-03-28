# Reminders

Tracks time-sensitive tasks related to food preparation and management.

## Data File

`reminders/active.yaml` — all current reminders.

### Reminder Format

```yaml
- id: 1
  created: 2026-03-20
  due: 2026-03-20T18:00    # date or datetime
  text: "Defrost chicken breast for tomorrow's dinner"
  status: pending           # pending, done, dismissed
  context: "Planning kung pao chicken for Saturday dinner"
```

## Workflows

### Creating Reminders

**Explicit**: Richard says "remind me to defrost chicken tonight"
- Parse the what and when
- Add to `active.yaml` with next available id
- Commit: `reminders: add — defrost chicken tonight`

**Proactive**: When planning a meal that requires prep
- Defrosting frozen items (move to fridge ~12-24 hours before cooking)
- Marinating (varies: 30 min to overnight)
- Soaking (beans, grains — often overnight)
- Suggest the reminder to Richard, create it if he agrees

### Checking Reminders

At the start of food-related conversations, glance at `active.yaml` for:
- **Overdue** (due date passed, still pending) — mention immediately
- **Due today** — mention as a heads-up
- **Due tomorrow** — mention if relevant to the conversation

### Completing Reminders

When Richard confirms a task is done, or when it's naturally completed (e.g., meal was cooked):
- Set `status: done`
- Commit: `reminders: done — [text]`

### Dismissing Reminders

If plans change and a reminder is no longer needed:
- Set `status: dismissed`
- Commit: `reminders: dismiss — [text]`

### Archiving

When `active.yaml` gets cluttered with done/dismissed items, move them to the bottom or archive them. Keep the file clean — pending items at the top.

## ID Assignment

Use the next integer after the highest existing id. Start at 1 for an empty file.
