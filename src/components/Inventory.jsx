import { useYamlData } from '../hooks/useYamlData'

function Inventory() {
  const { data, loading } = useYamlData('inventory/current.yaml')

  const items = data?.items || []

  const getExpiryDays = (expiresStr) => {
    if (!expiresStr) return 999
    const now = new Date()
    const expires = new Date(expiresStr)
    return Math.ceil((expires - now) / (1000 * 60 * 60 * 24))
  }

  const getExpiryColor = (days) => {
    if (days <= 0) return 'text-[var(--color-danger)] bg-red-50'
    if (days <= 2) return 'text-[var(--color-danger)] bg-red-50'
    if (days <= 5) return 'text-[var(--color-warning)] bg-amber-50'
    return 'text-[var(--color-fresh)] bg-green-50'
  }

  const getExpiryLabel = (days) => {
    if (days <= 0) return 'Expired!'
    if (days === 1) return 'Tomorrow'
    if (days <= 7) return `${days} days`
    if (days <= 30) return `${Math.ceil(days / 7)}w`
    return 'Fresh'
  }

  const getLocationIcon = (tags = []) => {
    if (tags.includes('freezer')) return '❄️'
    if (tags.includes('fridge')) return '🧊'
    if (tags.includes('pantry')) return '🏠'
    return '📦'
  }

  // Group by storage location
  const grouped = { fridge: [], freezer: [], pantry: [], other: [] }
  items.forEach(item => {
    const tags = item.tags || []
    if (tags.includes('freezer')) grouped.freezer.push(item)
    else if (tags.includes('fridge')) grouped.fridge.push(item)
    else if (tags.includes('pantry')) grouped.pantry.push(item)
    else grouped.other.push(item)
  })

  const sections = [
    { key: 'fridge', label: 'Fridge', icon: '🧊', items: grouped.fridge },
    { key: 'freezer', label: 'Freezer', icon: '❄️', items: grouped.freezer },
    { key: 'pantry', label: 'Pantry', icon: '🏠', items: grouped.pantry },
    { key: 'other', label: 'Other', icon: '📦', items: grouped.other },
  ].filter(s => s.items.length > 0)

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <span className="text-[var(--color-text-light)] animate-pulse">Loading inventory...</span>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="h-full overflow-y-auto p-6">
        <h1 className="text-xl font-semibold text-[var(--color-text)] mb-6">Kitchen Inventory</h1>
        <div className="flex flex-col items-center justify-center h-[60%] text-center">
          <span className="text-5xl mb-4">🧊</span>
          <h2 className="text-lg font-medium text-[var(--color-text)] mb-2">Nothing here yet</h2>
          <p className="text-sm text-[var(--color-text-light)] max-w-sm">
            Tell your chef what you bought and it'll show up here!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[var(--color-text)]">Kitchen Inventory</h1>
        <span className="text-sm text-[var(--color-text-light)]">{items.length} items</span>
      </div>

      {sections.map(section => (
        <div key={section.key} className="mb-6">
          <h2 className="text-sm font-medium text-[var(--color-text-light)] uppercase tracking-wide mb-3 flex items-center gap-2">
            <span>{section.icon}</span> {section.label}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {section.items.map((item, i) => {
              const days = getExpiryDays(item.expires)
              return (
                <div
                  key={`${section.key}-${i}`}
                  className="bg-white rounded-xl p-4 border border-[var(--color-peach)]/30 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-sm capitalize">{item.name}</h3>
                      <p className="text-xs text-[var(--color-text-light)] mt-0.5">
                        {item.quantity} {item.unit}
                      </p>
                      {item.notes && (
                        <p className="text-xs text-[var(--color-text-light)] mt-1 italic">{item.notes}</p>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${getExpiryColor(days)}`}>
                      {getExpiryLabel(days)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export default Inventory
