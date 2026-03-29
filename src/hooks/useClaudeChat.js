import { useState, useCallback, useRef } from 'react'
import { sendMessage, isClaudeAvailable } from '../utils/claude'

export function useClaudeChat() {
  const [messages, setMessages] = useState([
    {
      role: 'chef',
      text: "Hi! Ask me what to cook, tell me what you bought, or just chat about food! 🍳",
    },
  ])
  const [isThinking, setIsThinking] = useState(false)
  const [error, setError] = useState(null)
  const abortedRef = useRef(false)
  const lastUserMessageRef = useRef(null)

  const send = useCallback(async (userText, options = {}) => {
    if (!userText.trim() || isThinking) return

    const { displayText, image } = options

    setError(null)
    abortedRef.current = false
    lastUserMessageRef.current = userText

    // Show the display version (not the Claude prompt) in the chat
    setMessages((prev) => [...prev, {
      role: 'user',
      text: displayText !== undefined ? displayText : userText,
      image,
    }])
    setIsThinking(true)

    try {
      const available = await isClaudeAvailable()
      if (!available) {
        setMessages((prev) => [
          ...prev,
          { role: 'chef', text: "I can't reach Claude right now. Make sure the Claude CLI is installed and you're logged in." },
        ])
        setIsThinking(false)
        return
      }

      const recentContext = messages
        .slice(-6)
        .map((m) => `${m.role === 'user' ? 'User' : 'Chef'}: ${m.text}`)
        .join('\n')

      const fullPrompt = recentContext
        ? `Previous conversation:\n${recentContext}\n\nUser: ${userText}`
        : userText

      const response = await sendMessage(fullPrompt)

      if (abortedRef.current) return // user stopped generation

      setMessages((prev) => [
        ...prev,
        { role: 'chef', text: response },
      ])
    } catch (err) {
      if (abortedRef.current) return
      console.error('[Chat] Error:', err)
      setMessages((prev) => [
        ...prev,
        { role: 'chef', text: `Sorry, something went wrong: ${err?.message || 'unknown error'}` },
      ])
      setError(err.message)
    } finally {
      setIsThinking(false)
    }
  }, [isThinking, messages])

  const stop = useCallback(() => {
    abortedRef.current = true
    setIsThinking(false)
    setMessages((prev) => [
      ...prev,
      { role: 'chef', text: "(stopped)" },
    ])
  }, [])

  const reload = useCallback(() => {
    if (isThinking || !lastUserMessageRef.current) return
    // Remove the last chef response and resend
    setMessages((prev) => {
      const trimmed = [...prev]
      // Remove last chef message
      if (trimmed.length > 0 && trimmed[trimmed.length - 1].role === 'chef') {
        trimmed.pop()
      }
      // Remove last user message (send() will re-add it)
      if (trimmed.length > 0 && trimmed[trimmed.length - 1].role === 'user') {
        trimmed.pop()
      }
      return trimmed
    })
    // Small delay to let state update
    setTimeout(() => send(lastUserMessageRef.current), 50)
  }, [isThinking, send])

  const clear = useCallback(() => {
    setMessages([
      { role: 'chef', text: "Fresh start! What can I help you with? 🍳" },
    ])
    setError(null)
    lastUserMessageRef.current = null
  }, [])

  const hasConversation = messages.length > 1

  return { messages, isThinking, error, send, stop, reload, clear, hasConversation }
}
