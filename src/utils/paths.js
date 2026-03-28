import { invoke } from '@tauri-apps/api/core'

let cachedDataDir = null

/**
 * Get the absolute path to the data directory.
 * Uses a Tauri command to resolve from the Rust side.
 */
export async function getDataDir() {
  if (cachedDataDir) return cachedDataDir
  try {
    cachedDataDir = await invoke('get_data_dir')
  } catch {
    cachedDataDir = 'data'
  }
  return cachedDataDir
}

/**
 * Build an absolute path to a file in the data directory.
 */
export async function dataPathAsync(relativePath) {
  const dir = await getDataDir()
  return `${dir}/${relativePath}`
}

/**
 * Synchronous data path — uses cached value. Call getDataDir() first.
 */
export function dataPath(relativePath) {
  if (cachedDataDir) return `${cachedDataDir}/${relativePath}`
  // Fallback — shouldn't happen after init
  return `data/${relativePath}`
}
