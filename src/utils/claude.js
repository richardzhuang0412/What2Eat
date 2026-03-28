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
  } catch (e) {
    console.warn('[Claude] Could not read CLAUDE.md:', e)
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
 */
export async function sendMessage(userMessage) {
  let systemPrompt
  try {
    systemPrompt = await buildSystemPrompt()
    console.log('[Claude] System prompt built, length:', systemPrompt.length)
  } catch (e) {
    console.error('[Claude] Failed to build system prompt:', e)
    systemPrompt = 'You are a personal eating manager and chef assistant. Today is ' + new Date().toISOString().split('T')[0]
  }

  const args = [
    '--print',
    '--output-format', 'text',
    '--system-prompt', systemPrompt,
    '--allowedTools', 'Read,Write,Edit',
    '--add-dir', 'data',
    '--model', 'sonnet',
    '--dangerously-skip-permissions',
    '--no-session-persistence',
    '--disable-slash-commands',
    '-p', userMessage,
  ]

  console.log('[Claude] Sending message:', userMessage.substring(0, 100))
  console.log('[Claude] Args count:', args.length)

  let command
  try {
    command = Command.create('claude', args)
  } catch (e) {
    console.error('[Claude] Failed to create command:', e)
    throw e
  }

  try {
    console.log('[Claude] Executing...')
    const output = await command.execute()

    console.log('[Claude] Exit code:', output.code)
    console.log('[Claude] Stdout:', output.stdout?.substring(0, 200))
    console.log('[Claude] Stderr:', output.stderr?.substring(0, 500))

    if (output.code !== 0) {
      console.error('[Claude] Non-zero exit:', output.code)
      return `Sorry, something went wrong. ${output.stderr?.substring(0, 200) || ''}`
    }

    if (output.stdout && output.stdout.trim()) {
      return output.stdout.trim()
    }

    return "Hmm, I didn't get a response. Could you try again?"
  } catch (err) {
    console.error('[Claude] Execute error:', err)
    console.error('[Claude] Error type:', typeof err)
    console.error('[Claude] Error message:', err?.message)
    throw new Error(`Claude CLI error: ${err?.message || JSON.stringify(err)}`)
  }
}

/**
 * Check if the Claude CLI is available.
 */
export async function isClaudeAvailable() {
  try {
    const command = Command.create('claude-version')
    const output = await command.execute()
    console.log('[Claude] Version check - code:', output.code, 'stdout:', output.stdout?.trim())
    return output.code === 0
  } catch (err) {
    console.error('[Claude] Version check failed:', err)
    return false
  }
}
