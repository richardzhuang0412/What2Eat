import { useRecipes } from '../hooks/useRecipes'
import { useYamlData } from '../hooks/useYamlData'

function Recipes() {
  const { recipes, loading: recipesLoading } = useRecipes()
  const { data: historyData, loading: historyLoading } = useYamlData('recipes/history.yaml')

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
          <p className="text-sm text-[var(--color-text-light)] max-w-sm">
            Ask your chef to suggest something — when you find a recipe you love, save it here!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[var(--color-text)]">Recipes</h1>
        <span className="text-sm text-[var(--color-text-light)]">{recipes.length} saved</span>
      </div>

      {/* Saved recipes */}
      {recipes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-medium text-[var(--color-text-light)] uppercase tracking-wide mb-3">
            Saved Recipes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recipes.map(recipe => (
              <div
                key={recipe.slug}
                className="bg-white rounded-xl p-4 border border-[var(--color-peach)]/30 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <h3 className="font-medium text-sm">{recipe.name || recipe.slug}</h3>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {recipe.cuisine && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-peach)]/40 text-[var(--color-text)]">
                      {recipe.cuisine}
                    </span>
                  )}
                  {recipe.cook_time && (
                    <span className="text-xs text-[var(--color-text-light)]">
                      ⏱ {recipe.cook_time}
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
                    {recipe.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-[var(--color-sage)]/15 text-[var(--color-sage-dark)]">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent meals */}
      {meals.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-[var(--color-text-light)] uppercase tracking-wide mb-3">
            Recent Meals
          </h2>
          <div className="space-y-2">
            {meals.slice(-10).reverse().map((meal, i) => (
              <div key={i} className="bg-white rounded-xl px-4 py-3 border border-[var(--color-peach)]/20 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">{meal.dish}</span>
                  {meal.notes && (
                    <span className="text-xs text-[var(--color-text-light)] ml-2">— {meal.notes}</span>
                  )}
                </div>
                <div className="text-xs text-[var(--color-text-light)] whitespace-nowrap ml-3">
                  {meal.date} · {meal.meal}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Recipes
