# Inventory Management

Tracks everything Richard has in his fridge, freezer, and pantry.

## Data File

`inventory/current.yaml` — single flat list of all items.

### Item Format

```yaml
- name: chicken breast          # lowercase, descriptive
  quantity: 2                   # numeric
  unit: lbs                    # lbs, oz, kg, g, bunch, bag, bottle, can, piece, etc.
  tags: [protein, frozen]      # flexible tags for filtering (see below)
  purchased: 2026-03-20        # date acquired
  expires: 2026-04-20          # estimated expiry (use shelf life rules)
  notes: ""                    # any extra info
```

### Common Tags

- **By type**: protein, vegetable, fruit, grain, dairy, condiment, spice, snack, beverage, oil, sauce
- **By storage**: fridge, freezer, pantry, counter
- **By state**: frozen, fresh, canned, dried, opened

Use multiple tags per item. Be consistent with naming.

## Workflows

### Adding Items (grocery update)

1. Parse natural language: "bought 2 lbs chicken, a bag of rice, and some garlic"
2. For each item, determine: name, quantity, unit, appropriate tags
3. Estimate expiry using shelf life rules below
4. Read `current.yaml`, append new items, update `last_updated`
5. If an item already exists (same name + tags), increase the quantity instead of duplicating
6. Commit: `inventory: add [items] from grocery run`

### Removing Items

- **Cooked**: When logging a meal, deduct ingredients used. Reduce quantity or remove if depleted.
- **Expired**: If checking and something is past expiry, ask before removing.
- **Manual**: Richard says "throw out the lettuce" → remove it.
- Commit: `inventory: remove [items] — [reason]`

### Querying

Common queries to support:
- "What protein do I have?" → filter by tag
- "What's expiring soon?" → check dates within 3 days
- "Do I have garlic?" → search by name
- "What can I cook with what I have?" → redirect to recipes/SKILL.md

## Shelf Life Estimates

Use these as defaults for `expires` when the user doesn't specify:

| Category | Fresh/Fridge | Freezer | Pantry |
|---|---|---|---|
| Raw meat (chicken, pork, beef) | 2-3 days | 3-6 months | — |
| Ground meat | 1-2 days | 3-4 months | — |
| Fish/seafood | 1-2 days | 3-6 months | — |
| Leafy greens | 5-7 days | — | — |
| Root vegetables | 2-4 weeks | — | — |
| Fruits (berries) | 3-5 days | 6 months | — |
| Fruits (apples, citrus) | 2-4 weeks | — | — |
| Dairy (milk) | 7-10 days | — | — |
| Dairy (cheese, hard) | 3-4 weeks | — | — |
| Eggs | 3-5 weeks | — | — |
| Rice, pasta, dried grains | — | — | 1-2 years |
| Canned goods | — | — | 1-2 years |
| Condiments (opened) | 1-6 months | — | — |
| Bread | 5-7 days | 3 months | — |

Adjust based on tags (e.g., if tagged `frozen`, use freezer shelf life).
