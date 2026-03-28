import { useState, useEffect, useCallback } from 'react'
import { readYaml } from '../utils/yaml'

/**
 * Hook to read and reactively update YAML data.
 * Polls the file at a configurable interval since Tauri file watching
 * requires more setup. Polling is simple and reliable for our use case.
 *
 * @param {string} relativePath - Path relative to data/ directory
 * @param {number} pollInterval - Polling interval in ms (default 2000)
 * @returns {{ data, loading, error, refresh }}
 */
export function useYamlData(relativePath, pollInterval = 2000) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    try {
      const result = await readYaml(relativePath)
      setData(result)
      setError(null)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [relativePath])

  // Initial load
  useEffect(() => {
    refresh()
  }, [refresh])

  // Poll for changes
  useEffect(() => {
    const interval = setInterval(refresh, pollInterval)
    return () => clearInterval(interval)
  }, [refresh, pollInterval])

  return { data, loading, error, refresh }
}
