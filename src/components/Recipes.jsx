import { useState, useMemo } from 'react'
import { useRecipes } from '../hooks/useRecipes'
import { useYamlData } from '../hooks/useYamlData'

function Recipes({ onAskChef }) {
  const { recipes, loading: recipesLoading } = useRecipes()
  const { data: historyData, loading: historyLoading } = useYamlData('recipes/history.yaml')
  const [selectedRecipe, setSelectedRecipe] = useState(null)

  const meals = historyData?.meals || []
  const loading = recipesLoading || historyLoading

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <span className="text-[var(--color-text-light)] animate-pulse">Loading recipes...</span>
      </div>
    )
  }

  const hasContent = recipes.length > 0 || meals.length > 0

  if (!hasContent) {
    return (
      <div className="h-full overflow-y-auto p-6">
        <h1 className="text-xl font-semibold text-[var(--color-text)] mb-6">Recipes</h1>
        <div className="flex flex-col items-center justify-center h-[60%] text-center">
          <span className="text-5xl mb-4">📖</span>
          <h2 className="text-lg font-medium text-[var(--color-text)] mb-2">No recipes saved yet</h2>
          <p className="text-sm text-[var(--color-text-light)] max-w-sm mb-4">
            Ask your chef to suggest something — when you find a recipe you love, it'll show up here!
          </p>
          <button
            onClick={() => onAskChef?.("Suggest a recipe for tonight's dinner")}
            className="text-sm px-4 py-2 rounded-xl bg-[var(--color-sage)] text-white
                       hover:bg-[var(--color-sage-dark)] transition-colors cursor-pointer"
          >
            Get a suggestion
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-[var(--color-text)]">Recipes</h1>
        <div className="flex gap-2">
          <button
            onClick={() => onAskChef?.("Search for a new recipe")}
            className="text-sm px-3 py-1.5 rounded-lg bg-white border border-[var(--color-peach)]/50
                       text-[var(--color-text)] hover:bg-[var(--color-peach)]/20 transition-colors cursor-pointer"
          >
            + Find recipe
          </button>
          <button
            onClick={() => onAskChef?.("What should I cook tonight?")}
            className="text-sm px-3 py-1.5 rounded-lg bg-[var(--color-sage)] text-white
                       hover:bg-[var(--color-sage-dark)] transition-colors cursor-pointer"
          >
            Suggest something
          </button>
        </div>
      </div>

      {/* Recipe detail modal */}
      {selectedRecipe && (
        <RecipeDetail
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onCook={() => {
            onAskChef?.(`I'm going to cook ${selectedRecipe.name}. Log this meal and update my inventory.`)
            setSelectedRecipe(null)
          }}
        />
      )}

      {/* Saved recipes */}
      {recipes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-medium text-[var(--color-text-light)] uppercase tracking-wide mb-3">
            Saved Recipes ({recipes.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recipes.map(recipe => (
              <div
                key={recipe.slug}
                onClick={() => setSelectedRecipe(recipe)}
                className="bg-white rounded-xl p-4 border border-[var(--color-peach)]/30 shadow-sm
                           hover:shadow-md hover:border-[var(--color-sage)]/40 transition-all cursor-pointer"
              >
                <h3 className="font-medium text-sm">{recipe.name || recipe.slug}</h3>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {recipe.cuisine && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-peach)]/40">
                      {recipe.cuisine}
                    </span>
                  )}
                  {recipe.cook_time && (
                    <span className="text-xs text-[var(--color-text-light)]">⏱ {recipe.cook_time}</span>
                  )}
                  {recipe.times_cooked > 0 && (
                    <span className="text-xs text-[var(--color-text-light)]">
                      🍽 {recipe.times_cooked}x
                    </span>
                  )}
                  {recipe.rating && (
                    <span className="text-xs text-[var(--color-warning)]">
                      {'★'.repeat(recipe.rating)}{'☆'.repeat(5 - recipe.rating)}
                    </span>
                  )}
                </div>
                {recipe.tags && recipe.tags.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {recipe.tags.slice(0, 4).map(tag => (
                      <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-[var(--color-sage)]/15 text-[var(--color-sage-dark)]">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {recipe.source && recipe.source !== 'original' && (
                  <SourceBadge source={recipe.source} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent meals */}
      {meals.length > 0 && (
        <RecentMeals meals={meals} recipes={recipes} onAskChef={onAskChef} />
      )}
    </div>
  )
}

function RecipeDetail({ recipe, onClose, onCook }) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-6" onClick={onClose}>
      <div
        className="bg-[var(--color-cream)] rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)]">{recipe.name}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {recipe.cuisine && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-peach)]/40">{recipe.cuisine}</span>
                )}
                {recipe.prep_time && <span className="text-xs text-[var(--color-text-light)]">Prep: {recipe.prep_time}</span>}
                {recipe.cook_time && <span className="text-xs text-[var(--color-text-light)]">Cook: {recipe.cook_time}</span>}
                {recipe.servings && <span className="text-xs text-[var(--color-text-light)]">Serves {recipe.servings}</span>}
              </div>
            </div>
            <button onClick={onClose} className="text-[var(--color-text-light)] hover:text-[var(--color-text)] cursor-pointer text-lg">
              ✕
            </button>
          </div>

          {/* Body — parsed into sections */}
          {recipe.body && <RecipeBody body={recipe.body} />}

          {/* Source */}
          {recipe.source && recipe.source !== 'original' && (
            <div className="mt-4 pt-3 border-t border-[var(--color-peach)]/20">
              <SourceBadge source={recipe.source} expanded />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-4 pt-4 border-t border-[var(--color-peach)]/30">
            <button
              onClick={onCook}
              className="flex-1 py-2.5 rounded-xl bg-[var(--color-sage)] text-white text-sm font-medium
                         hover:bg-[var(--color-sage-dark)] transition-colors cursor-pointer"
            >
              🍳 Cook this
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white border border-[var(--color-peach)]/50 text-sm
                         text-[var(--color-text-light)] hover:bg-[var(--color-peach)]/20 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Parse recipe body markdown into sections and render with nice formatting.
 * Handles: ## Ingredients (bullet list), ## Instructions (numbered list), ## Notes (bullet list)
 * Falls back to raw text if structure doesn't match.
 */
function RecipeBody({ body }) {
  const sections = parseRecipeSections(body)

  // If no sections were parsed, fall back to raw text
  if (sections.length === 0) {
    return (
      <div className="text-sm text-[var(--color-text)] leading-relaxed whitespace-pre-wrap">
        {body}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sections.map((section, i) => (
        <div key={i}>
          {section.title && (
            <h3 className="text-xs font-semibold text-[var(--color-text-light)] uppercase tracking-wide mb-2">
              {section.title}
            </h3>
          )}
          {section.type === 'ingredients' && (
            <ul className="space-y-1.5">
              {section.items.map((item, j) => (
                <li key={j} className="flex items-start gap-2 text-sm text-[var(--color-text)]">
                  <span className="text-[var(--color-sage)] mt-0.5 flex-shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
          {section.type === 'instructions' && (
            <ol className="space-y-3">
              {section.items.map((item, j) => (
                <li key={j} className="flex items-start gap-3 text-sm text-[var(--color-text)]">
                  <span className="w-5 h-5 rounded-full bg-[var(--color-sage)]/15 text-[var(--color-sage-dark)]
                                   flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                    {j + 1}
                  </span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ol>
          )}
          {section.type === 'notes' && (
            <div className="bg-[var(--color-cream)] rounded-lg p-3 space-y-1.5">
              {section.items.map((item, j) => (
                <p key={j} className="flex items-start gap-2 text-xs text-[var(--color-text-light)]">
                  <span className="mt-0.5 flex-shrink-0">💡</span>
                  <span>{item}</span>
                </p>
              ))}
            </div>
          )}
          {section.type === 'text' && (
            <p className="text-sm text-[var(--color-text)] leading-relaxed whitespace-pre-wrap">
              {section.content}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

function parseRecipeSections(body) {
  if (!body) return []

  const lines = body.split('\n')
  const sections = []
  let currentSection = null

  for (const line of lines) {
    // Check for section headers (## Ingredients, ## Instructions, ## Notes, etc.)
    const headerMatch = line.match(/^##\s+(.+)/)
    if (headerMatch) {
      if (currentSection) sections.push(currentSection)
      const title = headerMatch[1].trim()
      const titleLower = title.toLowerCase()

      let type = 'text'
      if (titleLower.includes('ingredient')) type = 'ingredients'
      else if (titleLower.includes('instruction') || titleLower.includes('step') || titleLower.includes('direction') || titleLower.includes('method')) type = 'instructions'
      else if (titleLower.includes('note') || titleLower.includes('tip')) type = 'notes'

      currentSection = { title, type, items: [], content: '' }
      continue
    }

    if (!currentSection) {
      // Text before any section header
      if (line.trim()) {
        if (sections.length === 0 || sections[sections.length - 1].type !== 'text') {
          sections.push({ type: 'text', content: line })
        } else {
          sections[sections.length - 1].content += '\n' + line
        }
      }
      continue
    }

    // Parse list items (- item or 1. item)
    const bulletMatch = line.match(/^[-*]\s+(.+)/)
    const numberedMatch = line.match(/^\d+\.\s+(.+)/)

    if (bulletMatch) {
      currentSection.items.push(bulletMatch[1].trim())
    } else if (numberedMatch) {
      currentSection.items.push(numberedMatch[1].trim())
    } else if (line.trim()) {
      // Non-list text within a section — append to items as a line
      currentSection.items.push(line.trim())
    }
  }

  if (currentSection) sections.push(currentSection)

  // If we only got text sections (no structured headers found), return empty to trigger fallback
  if (sections.every(s => s.type === 'text')) return []

  return sections
}

function SourceBadge({ source, expanded = false }) {
  if (!source || source === 'original') return null

  const isUrl = source.startsWith('http')
  let displayName = source

  if (isUrl) {
    try {
      const url = new URL(source)
      displayName = url.hostname.replace('www.', '')
    } catch {
      displayName = source
    }
  }

  if (expanded && isUrl) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-light)]">
        <span>📎</span>
        <span>Source:</span>
        <a
          href={source}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--color-sage-dark)] hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {displayName}
        </a>
      </div>
    )
  }

  return (
    <div className="mt-2 flex items-center gap-1 text-xs text-[var(--color-text-light)]">
      <span>📎</span>
      <span className="truncate max-w-[200px]">{displayName}</span>
    </div>
  )
}

function RecentMeals({ meals, recipes, onAskChef }) {
  const [expandedIndex, setExpandedIndex] = useState(null)

  // Match meals to saved recipes by slug
  const recipeMap = useMemo(() => {
    const map = {}
    recipes.forEach(r => { map[r.slug] = r })
    return map
  }, [recipes])

  const recentMeals = meals.slice(-10).reverse()

  return (
    <div>
      <h2 className="text-sm font-medium text-[var(--color-text-light)] uppercase tracking-wide mb-3">
        Recent Meals
      </h2>
      <div className="space-y-2">
        {recentMeals.map((meal, i) => {
          const isExpanded = expandedIndex === i
          const mealIcon = meal.meal === 'breakfast' ? '🌅' : meal.meal === 'lunch' ? '☀️' : meal.meal === 'dinner' ? '🌙' : '🍿'
          // Try to find linked recipe
          const recipeSlug = meal.recipe?.replace('collection/', '').replace('.md', '')
          const linkedRecipe = recipeSlug ? recipeMap[recipeSlug] : null

          return (
            <div key={i}>
              <div
                onClick={() => setExpandedIndex(isExpanded ? null : i)}
                className={`bg-white rounded-xl px-4 py-3 border shadow-sm
                           flex items-center justify-between hover:shadow-md transition-all cursor-pointer
                           ${isExpanded ? 'border-[var(--color-sage)]/40' : 'border-[var(--color-peach)]/20'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm">{mealIcon}</span>
                  <div>
                    <span className="text-sm font-medium">{meal.dish}</span>
                    {meal.notes && (
                      <p className="text-xs text-[var(--color-text-light)]">{meal.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--color-text-light)] whitespace-nowrap">
                    {meal.date}
                  </span>
                  <span className={`text-xs text-[var(--color-text-light)] transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    ▾
                  </span>
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="mt-1 ml-8 p-3 bg-white/70 rounded-lg border border-[var(--color-peach)]/20 text-sm space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-[var(--color-text-light)]">Meal:</span> {meal.meal}</div>
                    <div><span className="text-[var(--color-text-light)]">Date:</span> {meal.date}</div>
                    {linkedRecipe?.cuisine && (
                      <div><span className="text-[var(--color-text-light)]">Cuisine:</span> {linkedRecipe.cuisine}</div>
                    )}
                    {linkedRecipe?.cook_time && (
                      <div><span className="text-[var(--color-text-light)]">Cook time:</span> {linkedRecipe.cook_time}</div>
                    )}
                  </div>
                  {meal.notes && (
                    <p className="text-xs text-[var(--color-text-light)] italic">{meal.notes}</p>
                  )}
                  <div className="flex gap-2 pt-1">
                    {linkedRecipe && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onAskChef?.(`Show me the recipe for ${meal.dish}`) }}
                        className="text-xs px-3 py-1 rounded-full bg-[var(--color-peach)]/30
                                   text-[var(--color-text)] hover:bg-[var(--color-peach)]/60 transition-colors cursor-pointer"
                      >
                        View recipe
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); onAskChef?.(`I want to make ${meal.dish} again`) }}
                      className="text-xs px-3 py-1 rounded-full bg-[var(--color-sage)]/20
                                 text-[var(--color-sage-dark)] hover:bg-[var(--color-sage)]/40 transition-colors cursor-pointer"
                    >
                      Cook again
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Recipes
