import { invoke } from '@tauri-apps/api/core'

/**
 * Build the system prompt by reading CLAUDE.md and SKILL.md files via Rust.
 */
async function buildSystemPrompt() {
  const parts = []

  // Read main CLAUDE.md (chef instructions)
  try {
    const claudeMd = await invoke('read_data_file', { relativePath: 'CLAUDE.md' })
    parts.push(claudeMd)
  } catch (e) {
    console.warn('[Claude] Could not read CLAUDE.md:', e)
    parts.push('You are a personal eating manager and chef assistant.')
  }

  // Read all SKILL.md files
  const skillFiles = [
    'inventory/SKILL.md',
    'recipes/SKILL.md',
    'reminders/SKILL.md',
    'preferences/SKILL.md',
  ]

  for (const file of skillFiles) {
    try {
      const content = await invoke('read_data_file', { relativePath: file })
      parts.push(`\n---\n## ${file}\n${content}`)
    } catch {
      // Skip missing files
    }
  }

  // Add app-specific instructions
  parts.push(`
---
## Response Guidelines

You are responding through a desktop app chat interface, not a CLI.
All data files are in the current working directory.
When reading or writing files, use paths like inventory/current.yaml, recipes/history.yaml, etc.

- Keep responses conversational and concise (2-4 sentences for simple questions)
- Use plain text only — no markdown headers, bold, or code blocks
- When you update data files, just confirm what you did naturally
- Never mention git, commits, YAML, file paths, or technical details to the user
- If suggesting recipes, present them as a short numbered list with brief descriptions
- Be warm and casual — you're a friendly chef assistant
- Current date and time: ${new Date().toISOString()} (use this for computing exact reminder times)
`)

  return parts.join('\n')
}

/**
 * Send a message to Claude CLI via Tauri Rust command.
 * Claude runs with CWD set to data/ — isolated from dev context.
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
    '--model', 'sonnet',
    '--dangerously-skip-permissions',
    '--no-session-persistence',
    '--disable-slash-commands',
    '-p', userMessage,
  ]

  console.log('[Claude] Sending message:', userMessage.substring(0, 100))

  try {
    const result = await invoke('invoke_claude', { args })
    console.log('[Claude] Response length:', result?.length)
    console.log('[Claude] Response preview:', result?.substring(0, 200))

    if (result && result.trim()) {
      return result.trim()
    }
    return "Hmm, I didn't get a response. Could you try again?"
  } catch (err) {
    console.error('[Claude] Invoke error:', err)
    throw new Error(typeof err === 'string' ? err : err?.message || JSON.stringify(err))
  }
}

/**
 * Check if the Claude CLI is available.
 */
export async function isClaudeAvailable() {
  try {
    const version = await invoke('check_claude')
    console.log('[Claude] Version:', version)
    return true
  } catch (err) {
    console.error('[Claude] Not available:', err)
    return false
  }
}
