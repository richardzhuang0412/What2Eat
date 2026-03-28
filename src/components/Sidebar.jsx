const navItems = [
  { id: 'chat', label: 'Chat', icon: '💬' },
  { id: 'inventory', label: 'Kitchen', icon: '🧊' },
  { id: 'recipes', label: 'Recipes', icon: '📖' },
  { id: 'reminders', label: 'Reminders', icon: '⏰' },
  { id: 'preferences', label: 'Profile', icon: '👤' },
]

function Sidebar({ activeView, onNavigate }) {
  return (
    <nav className="w-20 bg-[var(--color-warm-white)] border-r border-[var(--color-peach)] flex flex-col items-center py-6 gap-2">
      <div className="text-2xl mb-4">🍳</div>
      {navItems.map(item => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className={`
            w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-0.5
            text-xs transition-all cursor-pointer
            ${activeView === item.id
              ? 'bg-[var(--color-peach)] text-[var(--color-text)] shadow-sm'
              : 'text-[var(--color-text-light)] hover:bg-[var(--color-peach)]/40'
            }
          `}
        >
          <span className="text-lg">{item.icon}</span>
          <span className="font-medium">{item.label}</span>
        </button>
      ))}

      {/* Settings at bottom */}
      <div className="flex-1" />
      <button
        onClick={() => onNavigate('settings')}
        className={`
          w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-0.5
          text-xs transition-all cursor-pointer
          ${activeView === 'settings'
            ? 'bg-[var(--color-peach)] text-[var(--color-text)] shadow-sm'
            : 'text-[var(--color-text-light)] hover:bg-[var(--color-peach)]/40'
          }
        `}
      >
        <span className="text-lg">⚙️</span>
        <span className="font-medium">Settings</span>
      </button>
    </nav>
  )
}

export default Sidebar
