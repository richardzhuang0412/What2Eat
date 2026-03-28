import { resolveResource, appDataDir } from '@tauri-apps/api/path'

// In development, data/ is relative to the project root.
// In production, it would be in the app's resource directory.
// For now, we use a simple approach: resolve relative to cwd.

let dataDir = null

export async function getDataDir() {
  if (dataDir) return dataDir

  // In Tauri, we can use the resource dir or a fixed path
  // For development, data/ is in the project root
  try {
    // Try resource dir first (production)
    dataDir = await resolveResource('data')
  } catch {
    // Fallback to relative path (development)
    dataDir = 'data'
  }
  return dataDir
}

export function dataPath(relativePath) {
  // Build a path relative to data/ directory
  return `data/${relativePath}`
}
