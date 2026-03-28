import { useState, useEffect, useCallback } from 'react'
import { readYaml } from '../utils/yaml'

/**
 * Hook to read and reactively update YAML data.
 * Polls the file at a configurable interval.
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

  useEffect(() => { refresh() }, [refresh])

  useEffect(() => {
    const interval = setInterval(refresh, pollInterval)
    return () => clearInterval(interval)
  }, [refresh, pollInterval])

  return { data, loading, error, refresh }
}
