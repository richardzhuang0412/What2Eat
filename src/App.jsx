import { useState, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import Chat from './components/Chat'
import Inventory from './components/Inventory'
import Recipes from './components/Recipes'
import Reminders from './components/Reminders'

function App() {
  const [activeView, setActiveView] = useState('chat')
  const [chatPrompt, setChatPrompt] = useState(null)

  // Navigate to chat with a pre-filled prompt (from other panels)
  const goToChat = useCallback((prompt) => {
    setChatPrompt(prompt)
    setActiveView('chat')
  }, [])

  const renderView = () => {
    switch (activeView) {
      case 'chat':
        return <Chat initialPrompt={chatPrompt} onPromptConsumed={() => setChatPrompt(null)} />
      case 'inventory':
        return <Inventory onAskChef={goToChat} />
      case 'recipes':
        return <Recipes onAskChef={goToChat} />
      case 'reminders':
        return <Reminders onAskChef={goToChat} />
      default:
        return <Chat />
    }
  }

  return (
    <div className="flex h-screen bg-[var(--color-cream)]">
      <Sidebar activeView={activeView} onNavigate={setActiveView} />
      <main className="flex-1 overflow-hidden">
        {renderView()}
      </main>
    </div>
  )
}

export default App
