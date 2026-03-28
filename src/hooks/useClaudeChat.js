import { useState, useCallback } from 'react'
import { sendMessage, isClaudeAvailable } from '../utils/claude'

/**
 * Hook for managing chat with Claude CLI.
 */
export function useClaudeChat() {
  const [messages, setMessages] = useState([
    {
      role: 'chef',
      text: "Hi! I'm your personal chef. Ask me what to cook, tell me what you bought, or just chat about food! 🍳",
    },
  ])
  const [isThinking, setIsThinking] = useState(false)
  const [error, setError] = useState(null)

  const send = useCallback(async (userText) => {
    if (!userText.trim() || isThinking) return

    setError(null)

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', text: userText }])
    setIsThinking(true)

    try {
      // Check Claude is available
      const available = await isClaudeAvailable()
      if (!available) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'chef',
            text: "I can't reach Claude right now. Make sure the Claude CLI is installed and you're logged in.",
          },
        ])
        setIsThinking(false)
        return
      }

      // Build context from recent messages
      const recentContext = messages
        .slice(-6)
        .map((m) => `${m.role === 'user' ? 'User' : 'Chef'}: ${m.text}`)
        .join('\n')

      const fullPrompt = recentContext
        ? `Previous conversation:\n${recentContext}\n\nUser: ${userText}`
        : userText

      const response = await sendMessage(fullPrompt)

      setMessages((prev) => [
        ...prev,
        { role: 'chef', text: response },
      ])
    } catch (err) {
      console.error('Chat error:', err)
      setMessages((prev) => [
        ...prev,
        {
          role: 'chef',
          text: "Sorry, something went wrong. Let me try again in a moment.",
        },
      ])
      setError(err.message)
    } finally {
      setIsThinking(false)
    }
  }, [isThinking, messages])

  const clear = useCallback(() => {
    setMessages([
      {
        role: 'chef',
        text: "Fresh start! What can I help you with? 🍳",
      },
    ])
    setError(null)
  }, [])

  return { messages, isThinking, error, send, clear }
}
