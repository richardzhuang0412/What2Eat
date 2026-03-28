import { useState, useCallback, useRef, Component } from 'react'
import Sidebar from './components/Sidebar'
import Chat from './components/Chat'
import Inventory from './components/Inventory'
import Recipes from './components/Recipes'
import Reminders from './components/Reminders'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-6 text-center">
          <span className="text-3xl mb-3">😵</span>
          <h2 className="text-lg font-medium text-[var(--color-text)] mb-2">Something went wrong</h2>
          <p className="text-sm text-[var(--color-text-light)] mb-4 max-w-sm">
            {this.state.error?.message || 'Unknown error'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="text-sm px-4 py-2 rounded-xl bg-[var(--color-sage)] text-white hover:bg-[var(--color-sage-dark)] transition-colors cursor-pointer"
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={onCancel}>
      <div className="bg-[var(--color-cream)] rounded-2xl shadow-xl p-6 max-w-sm mx-4" onClick={e => e.stopPropagation()}>
        <p className="text-sm text-[var(--color-text)] mb-4">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-white border border-[var(--color-peach)]/50 text-sm
                       text-[var(--color-text-light)] hover:bg-[var(--color-peach)]/20 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-[var(--color-sage)] text-white text-sm font-medium
                       hover:bg-[var(--color-sage-dark)] transition-colors cursor-pointer"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [activeView, setActiveView] = useState('chat')
  const [chatPrompt, setChatPrompt] = useState(null)
  const [pendingPrompt, setPendingPrompt] = useState(null)
  const chatHasConversationRef = useRef(false)

  // Called by Chat to report whether it has an active conversation
  const handleChatStateChange = useCallback((hasConversation) => {
    chatHasConversationRef.current = hasConversation
  }, [])

  const goToChat = useCallback((prompt) => {
    // If there's an active conversation, ask for confirmation
    if (chatHasConversationRef.current) {
      setPendingPrompt(prompt)
    } else {
      setChatPrompt(prompt)
      setActiveView('chat')
    }
  }, [])

  const confirmChatSwitch = useCallback(() => {
    setChatPrompt(pendingPrompt)
    setActiveView('chat')
    setPendingPrompt(null)
  }, [pendingPrompt])

  return (
    <div className="flex h-screen bg-[var(--color-cream)]">
      <Sidebar activeView={activeView} onNavigate={setActiveView} />
      <main className="flex-1 overflow-hidden relative">
        <div className={`h-full ${activeView === 'chat' ? '' : 'hidden'}`}>
          <Chat
            initialPrompt={chatPrompt}
            onPromptConsumed={() => setChatPrompt(null)}
            onConversationChange={handleChatStateChange}
          />
        </div>
        <ErrorBoundary key={activeView}>
          {activeView === 'inventory' && <Inventory onAskChef={goToChat} />}
          {activeView === 'recipes' && <Recipes onAskChef={goToChat} />}
          {activeView === 'reminders' && <Reminders onAskChef={goToChat} />}
        </ErrorBoundary>
      </main>

      {/* Confirmation dialog */}
      {pendingPrompt && (
        <ConfirmDialog
          message="You have an active conversation. Starting a new request will add to it. Continue?"
          onConfirm={confirmChatSwitch}
          onCancel={() => setPendingPrompt(null)}
        />
      )}
    </div>
  )
}

export default App
