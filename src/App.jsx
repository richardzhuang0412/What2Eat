import { useState, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import Chat from './components/Chat'
import Inventory from './components/Inventory'
import Recipes from './components/Recipes'
import Reminders from './components/Reminders'

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
        {/* Chat is always mounted, hidden via CSS so state persists */}
        <div className={`h-full ${activeView === 'chat' ? '' : 'hidden'}`}>
          <Chat initialPrompt={chatPrompt} onPromptConsumed={() => setChatPrompt(null)} />
        </div>
        {activeView === 'inventory' && <Inventory onAskChef={goToChat} />}
        {activeView === 'recipes' && <Recipes onAskChef={goToChat} />}
        {activeView === 'reminders' && <Reminders onAskChef={goToChat} />}
      </main>
    </div>
  )
}

export default App
