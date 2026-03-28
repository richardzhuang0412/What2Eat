import { useState, useEffect, useCallback } from 'react'
import { readDir, readTextFile, exists } from '@tauri-apps/plugin-fs'
import { getDataDir, dataPath } from '../utils/paths'
import { parseFrontmatter } from '../utils/yaml'

/**
 * Hook to read all saved recipes from data/recipes/collection/.
 * Parses frontmatter from each .md file.
 */
export function useRecipes(pollInterval = 5000) {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      await getDataDir() // ensure path cache is populated
      const collectionPath = dataPath('recipes/collection')
      const dirExists = await exists(collectionPath)
      if (!dirExists) {
        setRecipes([])
        setLoading(false)
        return
      }

      const entries = await readDir(collectionPath)
      const mdFiles = entries.filter(e => e.name?.endsWith('.md') && e.name !== '.gitkeep')

      const loaded = await Promise.all(
        mdFiles.map(async (entry) => {
          try {
            const content = await readTextFile(`${collectionPath}/${entry.name}`)
            const { frontmatter, content: body } = parseFrontmatter(content)
            return {
              slug: entry.name.replace('.md', ''),
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
      console.error('Failed to load recipes:', err)
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
