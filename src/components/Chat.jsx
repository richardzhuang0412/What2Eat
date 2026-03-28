import { useState, useRef, useEffect } from 'react'
import { useClaudeChat } from '../hooks/useClaudeChat'

function Chat({ initialPrompt, onPromptConsumed, onConversationChange }) {
  const { messages, isThinking, error, send, stop, reload, clear, hasConversation } = useClaudeChat()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)
  const sentPromptsRef = useRef(new Set())

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  // Report conversation state to parent
  useEffect(() => {
    onConversationChange?.(hasConversation)
  }, [hasConversation, onConversationChange])

  // Handle prompts from other panels
  useEffect(() => {
    if (initialPrompt && !isThinking && !sentPromptsRef.current.has(initialPrompt)) {
      sentPromptsRef.current.add(initialPrompt)
      send(initialPrompt)
      onPromptConsumed?.()
    }
  }, [initialPrompt])

  const handleSend = () => {
    if (!input.trim() || isThinking) return
    send(input.trim())
    setInput('')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--color-peach)]/30">
        <div className="flex items-center gap-2">
          <span className="text-lg">👨‍🍳</span>
          <span className="font-medium text-sm text-[var(--color-text)]">Chef</span>
          {isThinking && (
            <span className="text-xs text-[var(--color-text-light)] animate-pulse">cooking up a reply...</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Reload last response */}
          {!isThinking && messages.length > 2 && (
            <button
              onClick={reload}
              title="Regenerate last response"
              className="text-xs text-[var(--color-text-light)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
            >
              ↻ Retry
            </button>
          )}
          <button
            onClick={clear}
            className="text-xs text-[var(--color-text-light)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
          >
            Clear chat
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={msg.id || i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'chef' && (
              <span className="text-lg mr-2 mt-1 flex-shrink-0">👨‍🍳</span>
            )}
            <div
              className={`
                max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
                ${msg.role === 'user'
                  ? 'bg-[var(--color-sage)] text-white rounded-br-md'
                  : msg.text === '(stopped)'
                    ? 'bg-white/50 text-[var(--color-text-light)] italic rounded-bl-md border border-[var(--color-peach)]/20'
                    : 'bg-white text-[var(--color-text)] rounded-bl-md shadow-sm border border-[var(--color-peach)]/30'
                }
              `}
            >
              {msg.text || '...'}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex justify-start">
            <span className="text-lg mr-2 mt-1">👨‍🍳</span>
            <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-[var(--color-peach)]/30">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-[var(--color-peach)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-[var(--color-peach)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-[var(--color-peach)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center">
            <span className="text-xs text-[var(--color-danger)]">{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input / Stop area */}
      <div className="px-4 py-4 border-t border-[var(--color-peach)]/30">
        {isThinking ? (
          <div className="flex justify-center">
            <button
              onClick={stop}
              className="px-5 py-2.5 rounded-xl bg-white border border-[var(--color-peach)]/50 text-sm
                         text-[var(--color-text)] hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer"
            >
              ■ Stop generating
            </button>
          </div>
        ) : (
          <>
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="What should I eat tonight?"
                className="flex-1 px-4 py-3 rounded-xl bg-white border border-[var(--color-peach)]/50
                           text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-light)]/50
                           focus:outline-none focus:border-[var(--color-sage)] focus:ring-1 focus:ring-[var(--color-sage)]/30
                           transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="px-5 py-3 bg-[var(--color-sage)] text-white rounded-xl text-sm font-medium
                           hover:bg-[var(--color-sage-dark)] disabled:opacity-40 disabled:cursor-not-allowed
                           transition-colors cursor-pointer"
              >
                Send
              </button>
            </div>

            {/* Quick suggestions — only when fresh */}
            {messages.length <= 1 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {[
                  "What should I eat tonight?",
                  "What's expiring soon?",
                  "Something quick with chicken",
                  "I went grocery shopping",
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="text-xs px-3 py-1.5 rounded-full bg-[var(--color-peach)]/30
                               text-[var(--color-text-light)] hover:bg-[var(--color-peach)]/60
                               transition-colors cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Chat
