import { useState, useEffect, useCallback } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { parseFrontmatter } from '../utils/yaml'

/**
 * Hook to read all saved recipes from data/recipes/collection/.
 */
export function useRecipes(pollInterval = 5000) {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const files = await invoke('list_data_dir', { relativePath: 'recipes/collection' })
      const mdFiles = files.filter(f => f.endsWith('.md') && f !== '.gitkeep')

      const loaded = await Promise.all(
        mdFiles.map(async (filename) => {
          try {
            const content = await invoke('read_data_file', {
              relativePath: `recipes/collection/${filename}`
            })
            const { frontmatter, content: body } = parseFrontmatter(content)
            return {
              slug: filename.replace('.md', ''),
              ...frontmatter,
              body,
            }
          } catch {
            return null
          }
        })
      )

      setRecipes(loaded.filter(Boolean))
    } catch (err) {
      // Directory not found is expected when empty
      if (!(typeof err === 'string' && err.includes('not found'))) {
        console.error('Failed to load recipes:', err)
      }
      setRecipes([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])
  useEffect(() => {
    const interval = setInterval(refresh, pollInterval)
    return () => clearInterval(interval)
  }, [refresh, pollInterval])

  return { recipes, loading, refresh }
}
