---
name: setup
description: Guided onboarding — set up your food profile, cooking setup, and current inventory
user-invocable: true
---

# /setup — What2Eat Initial Setup

Welcome the user and walk them through setting up their personal eating manager. This is the "registration" step — populate their preferences and initial inventory so the system can start making useful recommendations.

## Before Starting

1. Read `preferences/profile.yaml` — check if already populated (non-empty lists = already set up)
2. Read `inventory/current.yaml` — check if items exist
3. If data already exists, mention it: "Looks like you've already done some setup. Want to start fresh or just update specific sections?"

## Setup Flow

Guide the user through 6 stages using `AskUserQuestion`. Keep it conversational and friendly. The user can skip any stage — just note what was skipped at the end.

### Stage 0 — Initialize Repo

This stage transforms the cloned template into a personal data repo. Only runs if `CLAUDE.app.md` exists (i.e., first-time setup from template).

1. **Rename app instructions**: `CLAUDE.app.md` → `CLAUDE.md` (overwrite the dev version)
2. **Create `CLAUDE.local.md`**: Ask the user their name, then create the file:
   ```markdown
   # What2Eat — Personal Overrides

   User: [name]

   ## Custom Instructions
   (Add any personal instructions or overrides here. This file is never overwritten by /sync.)
   ```
3. **Remove dev-only files**: Delete `README.md` and `tasks/` directory (if they exist)
4. **Add template remote**: `git remote add template https://github.com/richardzhuang0412/What2Eat.git`
   - If the user forked from a different repo, ask for the URL
5. **Commit**: `setup: initialize data repo from template`

If `CLAUDE.app.md` does NOT exist (repo already initialized), skip this stage silently and proceed to Stage 1.

### Stage 1 — Dietary Profile

Ask these as a batch (use multiSelect where appropriate):

1. **Dietary restrictions**: "Do you follow any dietary restrictions?"
   - Options: None, Vegetarian, Vegan, Pescatarian, Halal, Kosher, Keto/Low-carb, Gluten-free
   - multiSelect: true

2. **Allergies**: "Any food allergies I should know about?"
   - Options: None, Nuts/tree nuts, Shellfish, Dairy/lactose, Gluten/wheat, Eggs, Soy
   - multiSelect: true

3. **Dislikes & favorites**: Ask as a free-text follow-up: "Any ingredients you really dislike? And any you especially love?"
   - Parse the response into `dietary.dislikes` and `dietary.favorites`

### Stage 2 — Cooking Setup

1. **Skill level**: "How would you describe your cooking skill?"
   - Options: Beginner (simple recipes, basic techniques), Intermediate (comfortable with most recipes), Advanced (enjoy complex techniques and cuisines)

2. **Equipment**: "What cooking equipment do you have?"
   - Options: Stove/cooktop, Oven, Microwave, Air fryer, Rice cooker, Instant Pot/pressure cooker, Wok, Grill/BBQ
   - multiSelect: true
   - After selection, ask if there's anything else not listed

3. **Time & servings**: "On a typical weeknight, how much time do you have to cook? And how many people are you usually cooking for?"
   - Options for time: 15 minutes or less, About 30 minutes, About 45 minutes, An hour or more, No limit
   - Parse servings from the follow-up or default to 1

### Stage 3 — Cuisine Preferences

1. **Favorite cuisines**: "What are your go-to cuisines?"
   - Options: Chinese, Japanese, Korean, Thai/Vietnamese, Indian, Italian, Mexican, Mediterranean, American, French
   - multiSelect: true
   - Ask if any unlisted favorites

2. **Want to explore**: "Any cuisines you've been wanting to try more of?"
   - Free-text or skip

3. **Avoid**: "Any cuisines you'd rather avoid?"
   - Free-text or skip

4. **Eating habits**: "Any general notes about how you like to eat? For example: meal prep on weekends, prefer one-pot meals, always want leftovers for lunch, etc."
   - Free-text, store in `notes`

### Stage 4 — Current Inventory

This is the most conversational stage. Walk through storage areas one at a time:

1. "Let's do a quick inventory. What's currently in your **fridge**?"
   - User lists items in natural language
   - Parse into structured entries following `inventory/SKILL.md` format
   - Assign tags: [fridge, fresh] + type tags

2. "What about your **freezer**?"
   - Parse, tag with [freezer, frozen] + type tags

3. "Any **pantry / dry goods**? (rice, pasta, canned goods, etc.)"
   - Parse, tag with [pantry] + type tags

4. "How about **spices and condiments**?"
   - Parse, tag with [spice] or [condiment] + [pantry]

For each batch:
- Estimate expiry dates using the shelf life table in `inventory/SKILL.md`
- Use today's date as `purchased` (approximate is fine for existing items)
- Keep quantities approximate — "some", "a few" → reasonable defaults

The user can say "skip" or "that's it" at any point.

### Stage 5 — Confirmation & Save

1. Show a summary of everything collected:
   ```
   Profile:
   - Restrictions: vegetarian
   - Allergies: none
   - Cooking: intermediate, stove + oven + rice cooker
   - Cuisines: Chinese, Italian, Japanese

   Inventory: 15 items logged (3 fridge, 4 freezer, 5 pantry, 3 spices)
   ```

2. Ask: "Does this look right? Anything to change?"

3. Write the data files:
   - Update `preferences/profile.yaml` with collected preferences
   - Update `inventory/current.yaml` with inventory items and `last_updated` set to today

4. Commit: `setup: initial profile and inventory for [user]`

5. Close with: "You're all set! You can now ask me things like 'what should I eat tonight?' or tell me when you go shopping. If you need to update anything later, just tell me naturally — no need to run setup again."

## Important Notes

- **Don't overwhelm**: If the user gives short answers, don't push for more detail. Work with what you get.
- **Be flexible**: If the user wants to do inventory first or skip preferences, that's fine. Adapt the order.
- **Defaults are fine**: Not everything needs to be filled. Empty lists are valid — they'll get populated organically over time.
- **Parse generously**: "I have chicken and some veggies" → chicken breast (1 piece, protein, fridge) + mixed vegetables (1 bag, vegetable, fridge). Ask for clarification only when genuinely ambiguous.
