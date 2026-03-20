# Preferences

Tracks Richard's explicit food preferences, dietary constraints, and cooking setup. This file complements Claude's memory system — preferences here are explicit and user-editable, while implicit patterns (e.g., "tends to prefer quick meals on weekdays") live in Claude's memory.

## Data File

`preferences/profile.yaml`

### Profile Structure

```yaml
dietary:
  restrictions: []       # vegetarian, halal, keto, etc.
  allergies: []          # nuts, shellfish, gluten, etc.
  dislikes: []           # specific ingredients to avoid
  favorites: []          # ingredients they love

cooking:
  skill_level: intermediate   # beginner, intermediate, advanced
  equipment: []               # stove, oven, air_fryer, rice_cooker, wok, etc.
  max_prep_time: null         # null = no limit, or "30min", "1hr"
  default_servings: 1

cuisines:
  favorites: []          # Chinese, Italian, Mexican, etc.
  want_to_try: []        # cuisines to explore
  avoid: []              # cuisines to skip

notes: []                # free-form preference notes
```

## Workflows

### Updating Preferences

When Richard states a preference:
- "I don't like cilantro" → add to `dietary.dislikes`
- "I got an air fryer" → add to `cooking.equipment`
- "I want to try more Korean food" → add to `cuisines.want_to_try`
- "I'm doing keto this month" → add to `dietary.restrictions`

**Before overwriting**: If a preference contradicts an existing one, confirm with Richard first. Preferences can change — that's fine, just verify.

### How Preferences Feed Into Recommendations

When suggesting meals (see `recipes/SKILL.md`):
1. **Hard constraints**: Never suggest dishes with allergens or restriction violations
2. **Soft constraints**: Prefer dishes that use favorites, avoid dislikes
3. **Equipment**: Only suggest dishes Richard can actually cook
4. **Skill level**: Match recipe complexity to skill level
5. **Cuisines**: Weight toward favorites and want_to_try, away from avoid
6. **Servings**: Default recipe scaling

### Notes Field

Use `notes` for preferences that don't fit the structure:
- "Prefers leftovers that reheat well for lunch"
- "Likes to meal prep on Sundays"
- "Prefers one-pot meals on weeknights"
