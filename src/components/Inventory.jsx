import { useState, useMemo } from 'react'
import { useYamlData } from '../hooks/useYamlData'

const FILTERS = [
  { key: 'all', label: 'All', icon: '📋' },
  { key: 'fridge', label: 'Fridge', icon: '🧊' },
  { key: 'freezer', label: 'Freezer', icon: '❄️' },
  { key: 'pantry', label: 'Pantry', icon: '🏠' },
]

function Inventory({ onAskChef }) {
  const { data, loading } = useYamlData('inventory/current.yaml')
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

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

  // Filter and search
  const filtered = useMemo(() => {
    let result = items
    if (filter !== 'all') {
      result = result.filter(item => (item.tags || []).includes(filter))
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(item => item.name.toLowerCase().includes(q))
    }
    return result
  }, [items, filter, search])

  // Items expiring within 3 days
  const expiringItems = useMemo(() =>
    items.filter(item => getExpiryDays(item.expires) <= 3 && getExpiryDays(item.expires) >= 0),
    [items]
  )

  // Group filtered items by location
  const grouped = useMemo(() => {
    const groups = { fridge: [], freezer: [], pantry: [], other: [] }
    filtered.forEach(item => {
      const tags = item.tags || []
      if (tags.includes('freezer')) groups.freezer.push(item)
      else if (tags.includes('fridge')) groups.fridge.push(item)
      else if (tags.includes('pantry')) groups.pantry.push(item)
      else groups.other.push(item)
    })
    return [
      { key: 'fridge', label: 'Fridge', icon: '🧊', items: groups.fridge },
      { key: 'freezer', label: 'Freezer', icon: '❄️', items: groups.freezer },
      { key: 'pantry', label: 'Pantry', icon: '🏠', items: groups.pantry },
      { key: 'other', label: 'Other', icon: '📦', items: groups.other },
    ].filter(s => s.items.length > 0)
  }, [filtered])

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
          <p className="text-sm text-[var(--color-text-light)] max-w-sm mb-4">
            Tell your chef what you bought and it'll show up here!
          </p>
          <button
            onClick={() => onAskChef?.("I just went grocery shopping")}
            className="text-sm px-4 py-2 rounded-xl bg-[var(--color-sage)] text-white
                       hover:bg-[var(--color-sage-dark)] transition-colors cursor-pointer"
          >
            Log a grocery trip
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-[var(--color-text)]">Kitchen Inventory</h1>
        <span className="text-sm text-[var(--color-text-light)]">{items.length} items</span>
      </div>

      {/* Expiring soon banner */}
      {expiringItems.length > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">⚠️</span>
            <span className="text-sm text-amber-800">
              <strong>{expiringItems.length}</strong> item{expiringItems.length > 1 ? 's' : ''} expiring soon:{' '}
              {expiringItems.map(i => i.name).join(', ')}
            </span>
          </div>
          <button
            onClick={() => onAskChef?.(`I have ${expiringItems.map(i => i.name).join(' and ')} expiring soon. What should I cook to use them up?`)}
            className="text-xs px-3 py-1 rounded-full bg-amber-200/60 text-amber-900
                       hover:bg-amber-200 transition-colors cursor-pointer whitespace-nowrap ml-2"
          >
            Use them up
          </button>
        </div>
      )}

      {/* Search + filter */}
      <div className="flex gap-3 mb-5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search items..."
          className="flex-1 px-3 py-2 rounded-lg bg-white border border-[var(--color-peach)]/40
                     text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-light)]/40
                     focus:outline-none focus:border-[var(--color-sage)] transition-colors"
        />
        <div className="flex gap-1">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer
                ${filter === f.key
                  ? 'bg-[var(--color-peach)] text-[var(--color-text)]'
                  : 'bg-white text-[var(--color-text-light)] hover:bg-[var(--color-peach)]/30'
                }`}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Items by section */}
      {filter === 'all' ? (
        grouped.map(section => (
          <div key={section.key} className="mb-6">
            <h2 className="text-sm font-medium text-[var(--color-text-light)] uppercase tracking-wide mb-3 flex items-center gap-2">
              <span>{section.icon}</span> {section.label}
              <span className="text-xs font-normal">({section.items.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {section.items.map((item, i) => (
                <InventoryCard key={`${section.key}-${i}`} item={item} getExpiryDays={getExpiryDays} getExpiryColor={getExpiryColor} getExpiryLabel={getExpiryLabel} onAskChef={onAskChef} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((item, i) => (
            <InventoryCard key={i} item={item} getExpiryDays={getExpiryDays} getExpiryColor={getExpiryColor} getExpiryLabel={getExpiryLabel} onAskChef={onAskChef} />
          ))}
        </div>
      )}

      {filtered.length === 0 && items.length > 0 && (
        <div className="text-center py-8">
          <span className="text-sm text-[var(--color-text-light)]">No items match your search</span>
        </div>
      )}
    </div>
  )
}

function InventoryCard({ item, getExpiryDays, getExpiryColor, getExpiryLabel, onAskChef }) {
  const days = getExpiryDays(item.expires)

  return (
    <div
      onClick={() => onAskChef?.(`What can I make with ${item.name}?`)}
      className="bg-white rounded-xl p-4 border border-[var(--color-peach)]/30 shadow-sm
                 hover:shadow-md hover:border-[var(--color-sage)]/40 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-sm capitalize group-hover:text-[var(--color-sage-dark)] transition-colors">
            {item.name}
          </h3>
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
}

export default Inventory
