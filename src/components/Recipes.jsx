import { useState } from 'react'
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
        <button
          onClick={() => onAskChef?.("What should I cook tonight?")}
          className="text-sm px-3 py-1.5 rounded-lg bg-[var(--color-sage)] text-white
                     hover:bg-[var(--color-sage-dark)] transition-colors cursor-pointer"
        >
          Suggest something
        </button>
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
              <div
                key={i}
                className="bg-white rounded-xl px-4 py-3 border border-[var(--color-peach)]/20 shadow-sm
                           flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onAskChef?.(`I want to make ${meal.dish} again. What's the recipe?`)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm">
                    {meal.meal === 'breakfast' ? '🌅' : meal.meal === 'lunch' ? '☀️' : meal.meal === 'dinner' ? '🌙' : '🍿'}
                  </span>
                  <div>
                    <span className="text-sm font-medium">{meal.dish}</span>
                    {meal.notes && (
                      <p className="text-xs text-[var(--color-text-light)]">{meal.notes}</p>
                    )}
                  </div>
                </div>
                <span className="text-xs text-[var(--color-text-light)] whitespace-nowrap ml-3">
                  {meal.date}
                </span>
              </div>
            ))}
          </div>
        </div>
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

          {/* Body (markdown content rendered as plain text) */}
          {recipe.body && (
            <div className="text-sm text-[var(--color-text)] leading-relaxed whitespace-pre-wrap">
              {recipe.body}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-[var(--color-peach)]/30">
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

export default Recipes
