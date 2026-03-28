# Recipe Search & Recommendations

Helps Richard decide what to eat and provides full recipes. Evolves with his preferences over time.

## Data Files

- `recipes/collection/*.md` — saved recipes (one file per recipe)
- `recipes/history.yaml` — meal log of what was cooked/eaten

## The Two-Step Recommendation Flow

### Step 1: Suggest Dishes

When Richard asks "what should I eat?" or similar:

1. Read `inventory/current.yaml` — what ingredients are available
2. Read `preferences/profile.yaml` — dietary constraints, favorites, cooking skill/equipment
3. Read `recipes/history.yaml` — avoid dishes cooked in the last 3-4 days
4. Consider any stated constraints ("something quick", "I'm craving spicy food", "use up the chicken")
5. Suggest **2-3 dish ideas** with:
   - Dish name
   - Why it's a good fit (uses available ingredients, matches preferences)
   - Rough time estimate
   - What ingredients are needed vs already available

### Step 2: Provide Full Recipe

Once Richard picks a dish (or names one directly):

1. Check `recipes/collection/` for an existing saved recipe
2. If not found, search the web for a good recipe
3. Present the full recipe clearly: ingredients, instructions, timing
4. Ask if he wants to save it to the collection

## Saving Recipes

Save to `recipes/collection/{slug}.md` using this format:

```markdown
---
name: Dish Name
cuisine: Chinese
tags: [spicy, quick, stir-fry]
prep_time: 15min
cook_time: 10min
servings: 2
source: https://example.com/recipe  # or "original" or "adapted from ..."
date_saved: 2026-03-20
times_cooked: 0
last_cooked: null
rating: null
---

## Ingredients
- 1 lb chicken breast, diced
- 2 tbsp soy sauce

## Instructions
1. Step one...
2. Step two...

## Notes
- Personal tweaks, substitutions, observations
```

Slug format: lowercase, hyphens, no special chars. e.g., `kung-pao-chicken.md`

## Logging Meals

After cooking, add an entry to `recipes/history.yaml`:

```yaml
- date: 2026-03-20
  meal: dinner          # breakfast, lunch, dinner, snack
  dish: Kung Pao Chicken
  recipe: collection/kung-pao-chicken.md  # null if not from collection
  notes: "turned out great, added extra peanuts"
```

Also update the recipe file if it exists: increment `times_cooked`, update `last_cooked`.

## Post-Cooking Inventory Update

After logging a meal, deduct used ingredients from `inventory/current.yaml`. Estimate amounts if the user doesn't specify exact usage. If an ingredient is fully used up, remove it.

## Recommendation Strategy

Priority order for suggestions:
1. **Use expiring ingredients** — reduce waste
2. **Match stated constraints** — if user said "quick" or "spicy", respect that
3. **Align with preferences** — favorite cuisines, cooking style
4. **Variety** — don't repeat recent meals
5. **Inventory fit** — prefer dishes where most ingredients are already available

## Web Search Tips

When searching for recipes:
- Include key ingredient + cuisine style + any constraints
- Prefer recipes with clear ingredient lists and step-by-step instructions
- Note the source URL when saving
