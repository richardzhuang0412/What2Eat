import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Chat from './components/Chat'
import Inventory from './components/Inventory'
import Recipes from './components/Recipes'
import Reminders from './components/Reminders'

function App() {
  const [activeView, setActiveView] = useState('chat')

  const renderView = () => {
    switch (activeView) {
      case 'chat': return <Chat />
      case 'inventory': return <Inventory />
      case 'recipes': return <Recipes />
      case 'reminders': return <Reminders />
      default: return <Chat />
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
