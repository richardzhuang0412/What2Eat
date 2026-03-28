import { useState, useCallback, Component } from 'react'
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

function App() {
  const [activeView, setActiveView] = useState('chat')
  const [chatPrompt, setChatPrompt] = useState(null)

  const goToChat = useCallback((prompt) => {
    setChatPrompt(prompt)
    setActiveView('chat')
  }, [])

  return (
    <div className="flex h-screen bg-[var(--color-cream)]">
      <Sidebar activeView={activeView} onNavigate={setActiveView} />
      <main className="flex-1 overflow-hidden relative">
        <div className={`h-full ${activeView === 'chat' ? '' : 'hidden'}`}>
          <Chat initialPrompt={chatPrompt} onPromptConsumed={() => setChatPrompt(null)} />
        </div>
        <ErrorBoundary key={activeView}>
          {activeView === 'inventory' && <Inventory onAskChef={goToChat} />}
          {activeView === 'recipes' && <Recipes onAskChef={goToChat} />}
          {activeView === 'reminders' && <Reminders onAskChef={goToChat} />}
        </ErrorBoundary>
      </main>
    </div>
  )
}

export default App
