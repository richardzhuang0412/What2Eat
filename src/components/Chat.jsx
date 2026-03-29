import { useState, useRef, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { open } from '@tauri-apps/plugin-dialog'
import { convertFileSrc } from '@tauri-apps/api/core'
import { useClaudeChat } from '../hooks/useClaudeChat'
import { getLoadingMessage } from '../utils/loadingMessages'

function Chat({ initialPrompt, onPromptConsumed, onConversationChange }) {
  const { messages, isThinking, error, send, stop, reload, clear, hasConversation } = useClaudeChat()
  const [input, setInput] = useState('')
  const [loadingMsg, setLoadingMsg] = useState('')
  const [assistantName, setAssistantName] = useState('Chef')
  const [pendingImage, setPendingImage] = useState(null) // { path, preview }
  const messagesEndRef = useRef(null)
  const sentPromptsRef = useRef(new Set())

  // Load assistant name from CLAUDE.local.md
  useEffect(() => {
    async function loadName() {
      try {
        const content = await invoke('read_data_file', { relativePath: 'CLAUDE.local.md' })
        const match = content.match(/Assistant name:\s*(.+)/)
        if (match) setAssistantName(match[1].trim())
      } catch { /* use default */ }
    }
    loadName()
  }, [])

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

  const handleSend = async () => {
    const text = input.trim()
    if ((!text && !pendingImage) || isThinking) return

    let claudeMessage = text
    let displayText = text
    let imageSource = null

    if (pendingImage) {
      try {
        const relativePath = await invoke('save_upload', { filePath: pendingImage.path })
        const imageContext = text || 'I took a photo. What do you see?'
        // What Claude sees (includes file path instruction)
        claudeMessage = `${imageContext}\n\n[Photo attached — read the image at "${relativePath}" to see what's in it]`
        // What the user sees (just their text, or a generic label)
        displayText = text || ''
        imageSource = pendingImage.path
      } catch (err) {
        console.error('Failed to save upload:', err)
        claudeMessage = text || 'I tried to upload a photo but it failed'
        displayText = claudeMessage
      }
      setPendingImage(null)
    }

    setLoadingMsg(getLoadingMessage(claudeMessage))
    // Send with display override and image
    send(claudeMessage, { displayText, image: imageSource })
    setInput('')
  }

  const handlePhotoUpload = async () => {
    try {
      const filePath = await open({
        title: 'Upload a photo',
        filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'heic', 'webp'] }],
        multiple: false,
      })
      if (filePath) {
        setPendingImage({ path: filePath, name: filePath.split('/').pop() })
      }
    } catch (err) {
      console.error('Photo picker failed:', err)
    }
  }

  // Also set loading message for cross-panel prompts
  useEffect(() => {
    if (isThinking && !loadingMsg) {
      const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')
      setLoadingMsg(getLoadingMessage(lastUserMsg?.text || ''))
    }
    if (!isThinking) setLoadingMsg('')
  }, [isThinking])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--color-peach)]/30">
        <div className="flex items-center gap-2">
          <span className="text-lg">👨‍🍳</span>
          <span className="font-medium text-sm text-[var(--color-text)]">{assistantName}</span>
          {isThinking && (
            <span className="text-xs text-[var(--color-text-light)] animate-pulse">{loadingMsg || 'Thinking...'}</span>
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
            New chat
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
                max-w-[75%] rounded-2xl text-sm leading-relaxed overflow-hidden
                ${msg.role === 'user'
                  ? 'bg-[var(--color-sage)] text-white rounded-br-md'
                  : msg.text === '(stopped)'
                    ? 'bg-white/50 text-[var(--color-text-light)] italic rounded-bl-md border border-[var(--color-peach)]/20'
                    : 'bg-white text-[var(--color-text)] rounded-bl-md shadow-sm border border-[var(--color-peach)]/30'
                }
              `}
            >
              {/* Image attachment */}
              {msg.image && (
                <div className="p-1">
                  <img
                    src={convertFileSrc(msg.image)}
                    alt="Uploaded photo"
                    className="rounded-xl max-h-48 w-full object-cover"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                </div>
              )}
              {/* Text content */}
              {(msg.text || (!msg.image && '...')) && (
                <div className="px-4 py-3 whitespace-pre-wrap">
                  {msg.text}
                </div>
              )}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex justify-start">
            <span className="text-lg mr-2 mt-1">👨‍🍳</span>
            <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-[var(--color-peach)]/30">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-[var(--color-peach)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-[var(--color-peach)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-[var(--color-peach)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs text-[var(--color-text-light)]">{loadingMsg || 'Thinking...'}</span>
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
            {/* Pending image preview */}
            {pendingImage && (
              <div className="flex items-center gap-2 mb-2 px-1">
                <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-[var(--color-peach)]/30">
                  <span className="text-sm">📷</span>
                  <span className="text-xs text-[var(--color-text)] truncate max-w-[200px]">{pendingImage.name}</span>
                  <button
                    onClick={() => setPendingImage(null)}
                    className="text-xs text-[var(--color-text-light)] hover:text-[var(--color-danger)] cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <span className="text-xs text-[var(--color-text-light)]">Add a message or just hit Send</span>
              </div>
            )}

            <div className="flex gap-2">
              {/* Photo upload button */}
              <button
                onClick={handlePhotoUpload}
                title="Upload a photo (groceries, expiry dates, recipes)"
                className="px-3 py-3 rounded-xl bg-white border border-[var(--color-peach)]/50
                           text-lg hover:bg-[var(--color-peach)]/20 transition-colors cursor-pointer"
              >
                📷
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder={pendingImage ? "Add a note about this photo..." : "What should I eat tonight?"}
                className="flex-1 px-4 py-3 rounded-xl bg-white border border-[var(--color-peach)]/50
                           text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-light)]/50
                           focus:outline-none focus:border-[var(--color-sage)] focus:ring-1 focus:ring-[var(--color-sage)]/30
                           transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() && !pendingImage}
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
