import { useState } from 'react'

function Chat() {
  const [messages, setMessages] = useState([
    { role: 'chef', text: "Hi! I'm your personal chef. What are we cooking today? 🍳" }
  ])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)

  const handleSend = async () => {
    if (!input.trim() || isThinking) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMessage }])
    setIsThinking(true)

    // TODO: Wire up Claude CLI integration (Phase 3)
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'chef',
        text: "I'm not connected to Claude yet, but I will be soon! 🔧"
      }])
      setIsThinking(false)
    }, 1000)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`
              max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed
              ${msg.role === 'user'
                ? 'bg-[var(--color-sage)] text-white rounded-br-md'
                : 'bg-white text-[var(--color-text)] rounded-bl-md shadow-sm border border-[var(--color-peach)]/30'
              }
            `}>
              {msg.text}
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-[var(--color-peach)]/30">
              <span className="animate-pulse text-[var(--color-text-light)] text-sm">thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-[var(--color-peach)]/30">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="What should I eat tonight?"
            className="flex-1 px-4 py-3 rounded-xl bg-white border border-[var(--color-peach)]/50
                       text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-light)]/50
                       focus:outline-none focus:border-[var(--color-sage)] focus:ring-1 focus:ring-[var(--color-sage)]/30
                       transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={isThinking || !input.trim()}
            className="px-5 py-3 bg-[var(--color-sage)] text-white rounded-xl text-sm font-medium
                       hover:bg-[var(--color-sage-dark)] disabled:opacity-40 disabled:cursor-not-allowed
                       transition-colors cursor-pointer"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default Chat
