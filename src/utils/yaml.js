import yaml from 'js-yaml'
import { readTextFile, writeTextFile, exists } from '@tauri-apps/plugin-fs'
import { getDataDir, dataPath } from './paths'

// Ensure data dir is resolved before first use
let initialized = false
async function ensureInit() {
  if (!initialized) {
    await getDataDir()
    initialized = true
  }
}

/**
 * Read and parse a YAML file from the data directory.
 * Returns null if the file doesn't exist.
 */
export async function readYaml(relativePath) {
  await ensureInit()
  const path = dataPath(relativePath)
  try {
    const fileExists = await exists(path)
    if (!fileExists) return null

    const content = await readTextFile(path)
    return yaml.load(content)
  } catch (err) {
    console.error(`Failed to read ${path}:`, err)
    return null
  }
}

/**
 * Write a JavaScript object as YAML to a file in the data directory.
 */
export async function writeYaml(relativePath, data) {
  await ensureInit()
  const path = dataPath(relativePath)
  try {
    const content = yaml.dump(data, {
      lineWidth: -1,
      noRefs: true,
      quotingType: '"',
    })
    await writeTextFile(path, content)
    return true
  } catch (err) {
    console.error(`Failed to write ${path}:`, err)
    return false
  }
}

/**
 * Read a markdown file from the data directory.
 */
export async function readMarkdown(relativePath) {
  await ensureInit()
  const path = dataPath(relativePath)
  try {
    const fileExists = await exists(path)
    if (!fileExists) return null

    return await readTextFile(path)
  } catch (err) {
    console.error(`Failed to read ${path}:`, err)
    return null
  }
}

/**
 * Parse YAML frontmatter from a markdown string.
 * Returns { frontmatter: {}, content: "" }
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
