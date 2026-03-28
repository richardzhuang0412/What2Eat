import { Command } from '@tauri-apps/plugin-shell'
import { readTextFile, writeTextFile, exists } from '@tauri-apps/plugin-fs'
import { dataPath } from './paths'

/**
 * Build the system prompt by reading CLAUDE.md and relevant SKILL.md files.
 * Writes to a temp file and returns the path, to avoid shell arg length issues.
 */
async function buildAndWriteSystemPrompt() {
  const parts = []

  // Read main CLAUDE.md
  try {
    const claudeMd = await readTextFile(dataPath('CLAUDE.md'))
    parts.push(claudeMd)
  } catch {
    parts.push('You are a personal eating manager and chef assistant.')
  }

  // Read all SKILL.md files for full context
  const skillFiles = [
    'inventory/SKILL.md',
    'recipes/SKILL.md',
    'reminders/SKILL.md',
    'preferences/SKILL.md',
  ]

  for (const file of skillFiles) {
    try {
      const path = dataPath(file)
      if (await exists(path)) {
        const content = await readTextFile(path)
        parts.push(`\n---\n## ${file}\n${content}`)
      }
    } catch {
      // Skip missing files
    }
  }

  // Add app-specific instructions
  parts.push(`
---
## Response Guidelines

You are responding through a desktop app chat interface, not a CLI.
All data files are relative to the current working directory under data/.

- Keep responses conversational and concise (2-4 sentences for simple questions)
- Use plain text only — no markdown headers, bold, or code blocks
- When you update data files, just confirm what you did naturally
- Never mention git, commits, YAML, file paths, or technical details to the user
- If suggesting recipes, present them as a short numbered list with brief descriptions
- Be warm and casual — you're a friendly chef assistant
- Today's date is ${new Date().toISOString().split('T')[0]}
`)

  const prompt = parts.join('\n')

  // Write to a temp file to avoid shell arg length issues
  const promptPath = dataPath('.system-prompt.tmp')
  await writeTextFile(promptPath, prompt)
  return promptPath
}

/**
 * Send a message to Claude CLI and get a response.
 */
export async function sendMessage(userMessage) {
  const promptFilePath = await buildAndWriteSystemPrompt()

  const args = [
    '--print',
    '--output-format', 'text',
    '--system-prompt-file', promptFilePath,
    '--allowedTools', 'Read,Write,Edit',
    '--add-dir', 'data',
    '--model', 'sonnet',
    '--dangerously-skip-permissions',
    '--no-session-persistence',
    '-p', userMessage,
  ]

  console.log('[Claude] Sending message:', userMessage.substring(0, 100))

  const command = Command.create('claude', args)

  try {
    const output = await command.execute()

    console.log('[Claude] Exit code:', output.code)
    console.log('[Claude] Stdout length:', output.stdout?.length || 0)
    if (output.stderr) {
      console.log('[Claude] Stderr:', output.stderr.substring(0, 500))
    }

    if (output.code !== 0) {
      console.error('[Claude] Non-zero exit:', output.code, output.stderr)
      return `Sorry, something went wrong (exit ${output.code}). ${output.stderr || ''}`
    }

    if (output.stdout && output.stdout.trim()) {
      return output.stdout.trim()
    }

    return "Hmm, I didn't get a response. Could you try again?"
  } catch (err) {
    console.error('[Claude] Execute failed:', err)
    throw new Error(`Failed to reach Claude: ${err.message || err}`)
  }
}

/**
 * Check if the Claude CLI is available.
 */
export async function isClaudeAvailable() {
  try {
    const command = Command.create('claude-version')
    const output = await command.execute()
    console.log('[Claude] Version check:', output.code, output.stdout?.trim())
    return output.code === 0
  } catch (err) {
    console.error('[Claude] Version check failed:', err)
    return false
  }
}
