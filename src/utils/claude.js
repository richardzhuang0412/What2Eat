import { Command } from '@tauri-apps/plugin-shell'
import { readTextFile, exists } from '@tauri-apps/plugin-fs'
import { dataPath } from './paths'

/**
 * Build the system prompt by reading CLAUDE.md and relevant SKILL.md files.
 */
async function buildSystemPrompt() {
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

  return parts.join('\n')
}

/**
 * Send a message to Claude CLI and get a response.
 * Uses --print mode with text output for simplicity.
 *
 * @param {string} userMessage - The user's message
 * @returns {Promise<string>} - Claude's response text
 */
export async function sendMessage(userMessage) {
  const systemPrompt = await buildSystemPrompt()

  const args = [
    '--print',
    '--output-format', 'text',
    '--system-prompt', systemPrompt,
    '--allowedTools', 'Read,Write,Edit',
    '--add-dir', 'data',
    '--model', 'sonnet',
    '--dangerously-skip-permissions',
    '--bare',
    '--no-session-persistence',
    '-p', userMessage,
  ]

  const command = Command.create('claude', args)

  try {
    const output = await command.execute()

    if (output.stdout && output.stdout.trim()) {
      return output.stdout.trim()
    }

    if (output.stderr && output.stderr.includes('Error')) {
      console.error('Claude error:', output.stderr)
      return "Sorry, I had trouble processing that. Could you try again?"
    }

    return "Hmm, I didn't get a response. Let me try again."
  } catch (err) {
    console.error('Claude CLI failed:', err)
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
    return output.code === 0
  } catch {
    return false
  }
}
