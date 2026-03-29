import { useState } from 'react'

function Scratchpad({ items, onAdd, onRemove, onClear, onUseInChat }) {
  const [addInput, setAddInput] = useState('')
  const [expanded, setExpanded] = useState(true)

  const handleAdd = () => {
    if (addInput.trim()) {
      onAdd(addInput.trim())
      setAddInput('')
    }
  }

  const handleUse = () => {
    if (items.length === 0) return
    const list = items.join(', ')
    onUseInChat(`I have ${list}. What can I make with these?`)
  }

  // Collapsed state when empty
  if (items.length === 0) {
    return (
      <div className="px-4 py-2 border-t border-[var(--color-peach)]/20">
        <div className="flex items-center gap-2">
          <span className="text-sm">🧺</span>
          <span className="text-xs text-[var(--color-text-light)]">Scratchpad — add ingredients to plan a meal</span>
          <div className="flex-1" />
          <AddInlineInput value={addInput} onChange={setAddInput} onAdd={handleAdd} placeholder="+ Add ingredient" />
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-2 border-t border-[var(--color-sage)]/20 bg-[var(--color-sage)]/5">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-sage-dark)] cursor-pointer"
        >
          <span>🧺</span>
          Scratchpad
          <span className="bg-[var(--color-sage)] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {items.length}
          </span>
          <span className={`transition-transform ${expanded ? 'rotate-180' : ''}`}>▾</span>
        </button>
        <button
          onClick={onClear}
          className="text-xs text-[var(--color-text-light)] hover:text-[var(--color-danger)] transition-colors cursor-pointer"
        >
          Clear
        </button>
      </div>

      {expanded && (
        <>
          {/* Ingredient chips */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {items.map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
                           bg-[var(--color-sage)]/20 text-[var(--color-sage-dark)] capitalize"
              >
                {item}
                <button
                  onClick={() => onRemove(i)}
                  className="hover:text-[var(--color-danger)] cursor-pointer"
                >
                  ×
                </button>
              </span>
            ))}
            <AddInlineInput value={addInput} onChange={setAddInput} onAdd={handleAdd} placeholder="+ Add" />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleUse}
              className="text-xs px-3 py-1.5 rounded-lg bg-[var(--color-sage)] text-white
                         hover:bg-[var(--color-sage-dark)] transition-colors cursor-pointer"
            >
              🍳 What can I make?
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function AddInlineInput({ value, onChange, onAdd, placeholder }) {
  const [showInput, setShowInput] = useState(false)

  if (showInput) {
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { onAdd(); }
          if (e.key === 'Escape') { setShowInput(false); onChange('') }
        }}
        onBlur={() => { if (value.trim()) onAdd(); else setShowInput(false) }}
        autoFocus
        placeholder="Type ingredient..."
        className="px-2 py-1 rounded-full text-xs bg-white border border-[var(--color-sage)]/40
                   text-[var(--color-text)] placeholder:text-[var(--color-text-light)]/40
                   focus:outline-none w-28"
      />
    )
  }

  return (
    <button
      onClick={() => setShowInput(true)}
      className="px-2.5 py-1 rounded-full text-xs border border-dashed border-[var(--color-sage)]/40
                 text-[var(--color-text-light)] hover:border-[var(--color-sage)] hover:text-[var(--color-sage-dark)]
                 transition-colors cursor-pointer"
    >
      {placeholder}
    </button>
  )
}

export default Scratchpad
