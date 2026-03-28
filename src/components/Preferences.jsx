import { useState, useEffect, useCallback } from 'react'
import { invoke } from '@tauri-apps/api/core'
import yaml from 'js-yaml'
import { readYaml, writeYaml } from '../utils/yaml'

function Preferences({ onRedoSetup }) {
  const [profile, setProfile] = useState(null)
  const [localMd, setLocalMd] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Load data
  useEffect(() => {
    async function load() {
      const p = await readYaml('preferences/profile.yaml')
      setProfile(p || {
        dietary: { restrictions: [], allergies: [], dislikes: [], favorites: [] },
        cooking: { skill_level: 'intermediate', equipment: [], max_prep_time: null, default_servings: 1 },
        cuisines: { favorites: [], want_to_try: [], avoid: [] },
        notes: [],
      })
      try {
        const md = await invoke('read_data_file', { relativePath: 'CLAUDE.local.md' })
        setLocalMd(md)
      } catch { setLocalMd(null) }
      setLoading(false)
    }
    load()
  }, [])

  // Parse user/assistant name from CLAUDE.local.md
  const userName = localMd?.match(/User:\s*(.+)/)?.[1]?.trim() || ''
  const assistantName = localMd?.match(/Assistant name:\s*(.+)/)?.[1]?.trim() || ''

  // Save handler
  const save = useCallback(async () => {
    setSaving(true)
    setSaved(false)
    try {
      await writeYaml('preferences/profile.yaml', profile)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Failed to save preferences:', err)
    } finally {
      setSaving(false)
    }
  }, [profile])

  // Update helpers
  const updateField = (path, value) => {
    setProfile(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      const keys = path.split('.')
      let obj = next
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]]
      obj[keys[keys.length - 1]] = value
      return next
    })
  }

  const toggleInList = (path, item) => {
    setProfile(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      const keys = path.split('.')
      let obj = next
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]]
      const list = obj[keys[keys.length - 1]]
      const idx = list.indexOf(item)
      if (idx >= 0) list.splice(idx, 1)
      else list.push(item)
      return next
    })
  }

  const removeFromList = (path, index) => {
    setProfile(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      const keys = path.split('.')
      let obj = next
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]]
      obj[keys[keys.length - 1]].splice(index, 1)
      return next
    })
  }

  const addToList = (path, item) => {
    if (!item.trim()) return
    setProfile(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      const keys = path.split('.')
      let obj = next
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]]
      const list = obj[keys[keys.length - 1]]
      if (!list.includes(item.trim().toLowerCase())) {
        list.push(item.trim().toLowerCase())
      }
      return next
    })
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <span className="text-[var(--color-text-light)] animate-pulse">Loading preferences...</span>
      </div>
    )
  }

  const dietary = profile.dietary || {}
  const cooking = profile.cooking || {}
  const cuisines = profile.cuisines || {}
  const notes = profile.notes || []

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text)]">Your Profile</h1>
          {(userName || assistantName) && (
            <p className="text-xs text-[var(--color-text-light)] mt-0.5">
              {userName && <span>{userName}</span>}
              {userName && assistantName && <span> · </span>}
              {assistantName && <span>Assistant: {assistantName}</span>}
            </p>
          )}
        </div>
        <button
          onClick={save}
          disabled={saving}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            saved
              ? 'bg-green-100 text-green-800'
              : 'bg-[var(--color-sage)] text-white hover:bg-[var(--color-sage-dark)]'
          } disabled:opacity-50`}
        >
          {saved ? '✓ Saved' : saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Dietary */}
        <Section title="Dietary">
          <TagEditor
            label="Restrictions"
            items={dietary.restrictions || []}
            presets={['vegetarian', 'vegan', 'pescatarian', 'halal', 'kosher', 'keto', 'gluten-free']}
            onToggle={(item) => toggleInList('dietary.restrictions', item)}
            onAdd={(item) => addToList('dietary.restrictions', item)}
            onRemove={(idx) => removeFromList('dietary.restrictions', idx)}
          />
          <TagEditor
            label="Allergies"
            items={dietary.allergies || []}
            presets={['nuts', 'shellfish', 'dairy', 'gluten', 'eggs', 'soy']}
            onToggle={(item) => toggleInList('dietary.allergies', item)}
            onAdd={(item) => addToList('dietary.allergies', item)}
            onRemove={(idx) => removeFromList('dietary.allergies', idx)}
          />
          <TagEditor
            label="Dislikes"
            items={dietary.dislikes || []}
            presets={[]}
            onAdd={(item) => addToList('dietary.dislikes', item)}
            onRemove={(idx) => removeFromList('dietary.dislikes', idx)}
          />
          <TagEditor
            label="Favorites"
            items={dietary.favorites || []}
            presets={[]}
            onAdd={(item) => addToList('dietary.favorites', item)}
            onRemove={(idx) => removeFromList('dietary.favorites', idx)}
          />
        </Section>

        {/* Cooking */}
        <Section title="Cooking">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--color-text-light)] uppercase tracking-wide">Skill level</label>
              <select
                value={cooking.skill_level || 'intermediate'}
                onChange={(e) => updateField('cooking.skill_level', e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--color-cream)] border border-[var(--color-peach)]/40
                           text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-sage)] cursor-pointer"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--color-text-light)] uppercase tracking-wide">Max prep time</label>
              <select
                value={cooking.max_prep_time || ''}
                onChange={(e) => updateField('cooking.max_prep_time', e.target.value || null)}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--color-cream)] border border-[var(--color-peach)]/40
                           text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-sage)] cursor-pointer"
              >
                <option value="">No limit</option>
                <option value="15min">15 min</option>
                <option value="30min">30 min</option>
                <option value="45min">45 min</option>
                <option value="1hr">1 hour</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--color-text-light)] uppercase tracking-wide">Default servings</label>
              <select
                value={cooking.default_servings || 1}
                onChange={(e) => updateField('cooking.default_servings', parseInt(e.target.value))}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--color-cream)] border border-[var(--color-peach)]/40
                           text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-sage)] cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <option key={n} value={n}>{n} {n === 1 ? 'person' : 'people'}</option>
                ))}
              </select>
            </div>
          </div>
          <TagEditor
            label="Equipment"
            items={cooking.equipment || []}
            presets={['stove', 'oven', 'microwave', 'air fryer', 'rice cooker', 'instant pot', 'wok', 'grill']}
            onToggle={(item) => toggleInList('cooking.equipment', item)}
            onAdd={(item) => addToList('cooking.equipment', item)}
            onRemove={(idx) => removeFromList('cooking.equipment', idx)}
          />
        </Section>

        {/* Cuisines */}
        <Section title="Cuisines">
          <TagEditor
            label="Favorites"
            items={cuisines.favorites || []}
            presets={['chinese', 'japanese', 'korean', 'thai', 'vietnamese', 'indian', 'italian', 'mexican', 'mediterranean', 'american', 'french']}
            onToggle={(item) => toggleInList('cuisines.favorites', item)}
            onAdd={(item) => addToList('cuisines.favorites', item)}
            onRemove={(idx) => removeFromList('cuisines.favorites', idx)}
          />
          <TagEditor
            label="Want to try"
            items={cuisines.want_to_try || []}
            presets={[]}
            onAdd={(item) => addToList('cuisines.want_to_try', item)}
            onRemove={(idx) => removeFromList('cuisines.want_to_try', idx)}
          />
          <TagEditor
            label="Avoid"
            items={cuisines.avoid || []}
            presets={[]}
            onAdd={(item) => addToList('cuisines.avoid', item)}
            onRemove={(idx) => removeFromList('cuisines.avoid', idx)}
          />
        </Section>

        {/* Notes */}
        <Section title="Notes">
          <NotesEditor items={notes} onUpdate={(newNotes) => updateField('notes', newNotes)} />
        </Section>

        {/* Redo setup */}
        <div className="pt-2">
          <button
            onClick={onRedoSetup}
            className="text-sm text-[var(--color-text-light)] hover:text-[var(--color-sage-dark)] transition-colors cursor-pointer"
          >
            ↻ Redo initial setup
          </button>
          <p className="text-xs text-[var(--color-text-light)]/60 mt-1">
            Go through the setup wizard again. Your current data stays — setup will overwrite preferences.
          </p>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-[var(--color-peach)]/30 shadow-sm">
      <h2 className="text-sm font-semibold text-[var(--color-text)] mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function TagEditor({ label, items, presets = [], onToggle, onAdd, onRemove }) {
  const [inputValue, setInputValue] = useState('')
  const [showInput, setShowInput] = useState(false)

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue)
      setInputValue('')
      setShowInput(false)
    }
  }

  return (
    <div>
      <label className="text-xs font-medium text-[var(--color-text-light)] uppercase tracking-wide">{label}</label>
      <div className="flex flex-wrap gap-2 mt-2">
        {/* Preset chips */}
        {presets.map(p => {
          const isSelected = items.includes(p)
          return (
            <button
              key={p}
              onClick={() => onToggle ? onToggle(p) : (isSelected ? onRemove(items.indexOf(p)) : onAdd(p))}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer capitalize ${
                isSelected
                  ? 'bg-[var(--color-sage)] text-white'
                  : 'bg-[var(--color-cream)] text-[var(--color-text-light)] hover:bg-[var(--color-peach)]/40'
              }`}
            >
              {p}
            </button>
          )
        })}
        {/* Custom items (not in presets) */}
        {items.filter(i => !presets.includes(i)).map((item, idx) => {
          const realIdx = items.indexOf(item)
          return (
            <span
              key={item}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--color-sage)] text-white
                         inline-flex items-center gap-1 capitalize"
            >
              {item}
              <button
                onClick={() => onRemove(realIdx)}
                className="hover:opacity-70 cursor-pointer"
              >
                ×
              </button>
            </span>
          )
        })}
        {/* Add button */}
        {showInput ? (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd()
              if (e.key === 'Escape') { setShowInput(false); setInputValue('') }
            }}
            onBlur={() => { if (inputValue.trim()) handleAdd(); else setShowInput(false) }}
            autoFocus
            placeholder="Type and press Enter"
            className="px-2 py-1 rounded-full text-xs bg-[var(--color-cream)] border border-[var(--color-sage)]/50
                       text-[var(--color-text)] placeholder:text-[var(--color-text-light)]/40
                       focus:outline-none w-32"
          />
        ) : (
          <button
            onClick={() => setShowInput(true)}
            className="px-3 py-1.5 rounded-full text-xs font-medium border border-dashed border-[var(--color-peach)]
                       text-[var(--color-text-light)] hover:border-[var(--color-sage)] hover:text-[var(--color-sage-dark)]
                       transition-colors cursor-pointer"
          >
            + Add
          </button>
        )}
      </div>
      {items.length === 0 && presets.length === 0 && !showInput && (
        <p className="text-xs text-[var(--color-text-light)] mt-1 italic">None yet — click + Add</p>
      )}
    </div>
  )
}

function NotesEditor({ items, onUpdate }) {
  const [newNote, setNewNote] = useState('')

  const addNote = () => {
    if (newNote.trim()) {
      onUpdate([...items, newNote.trim()])
      setNewNote('')
    }
  }

  const removeNote = (idx) => {
    onUpdate(items.filter((_, i) => i !== idx))
  }

  return (
    <div>
      <div className="space-y-2">
        {items.map((note, i) => (
          <div key={i} className="flex items-start gap-2 bg-[var(--color-cream)] rounded-lg px-3 py-2">
            <span className="text-sm text-[var(--color-text)] flex-1">{note}</span>
            <button
              onClick={() => removeNote(i)}
              className="text-xs text-[var(--color-text-light)] hover:text-[var(--color-danger)] cursor-pointer flex-shrink-0 mt-0.5"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addNote()}
          placeholder="e.g. I meal prep on Sundays"
          className="flex-1 px-3 py-2 rounded-lg bg-[var(--color-cream)] border border-[var(--color-peach)]/40
                     text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-light)]/40
                     focus:outline-none focus:border-[var(--color-sage)] transition-colors"
        />
        <button
          onClick={addNote}
          disabled={!newNote.trim()}
          className="px-3 py-2 rounded-lg bg-[var(--color-sage)] text-white text-xs font-medium
                     hover:bg-[var(--color-sage-dark)] disabled:opacity-40 transition-colors cursor-pointer"
        >
          Add
        </button>
      </div>
    </div>
  )
}

export default Preferences
