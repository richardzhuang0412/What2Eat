import yaml from 'js-yaml'
import { invoke } from '@tauri-apps/api/core'

/**
 * Read and parse a YAML file from the data directory.
 * Uses Rust command to bypass Tauri fs plugin scope restrictions.
 */
export async function readYaml(relativePath) {
  try {
    const content = await invoke('read_data_file', { relativePath })
    return yaml.load(content)
  } catch (err) {
    // "File not found" is expected for empty/new installs
    if (typeof err === 'string' && err.includes('not found')) return null
    console.error(`[YAML] Failed to read ${relativePath}:`, err)
    return null
  }
}

/**
 * Write a JavaScript object as YAML to a file in the data directory.
 */
export async function writeYaml(relativePath, data) {
  try {
    const content = yaml.dump(data, {
      lineWidth: -1,
      noRefs: true,
      quotingType: '"',
    })
    await invoke('write_data_file', { relativePath, content })
    return true
  } catch (err) {
    console.error(`[YAML] Failed to write ${relativePath}:`, err)
    return false
  }
}

/**
 * Read a markdown file from the data directory.
 */
export async function readMarkdown(relativePath) {
  try {
    return await invoke('read_data_file', { relativePath })
  } catch (err) {
    if (typeof err === 'string' && err.includes('not found')) return null
    console.error(`[YAML] Failed to read ${relativePath}:`, err)
    return null
  }
}

/**
 * Parse YAML frontmatter from a markdown string.
 */
export function parseFrontmatter(markdown) {
  if (!markdown) return { frontmatter: {}, content: '' }

  const match = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) return { frontmatter: {}, content: markdown }

  try {
    const frontmatter = yaml.load(match[1])
    return { frontmatter, content: match[2].trim() }
  } catch {
    return { frontmatter: {}, content: markdown }
  }
}
