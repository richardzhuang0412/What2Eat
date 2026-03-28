import { useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import yaml from 'js-yaml'

const STEPS = ['welcome', 'dietary', 'cooking', 'cuisines', 'done']

function Setup({ onComplete }) {
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)

  // Collected data
  const [name, setName] = useState('')
  const [restrictions, setRestrictions] = useState([])
  const [allergies, setAllergies] = useState([])
  const [dislikes, setDislikes] = useState('')
  const [favorites, setFavorites] = useState('')
  const [skillLevel, setSkillLevel] = useState('intermediate')
  const [equipment, setEquipment] = useState([])
  const [prepTime, setPrepTime] = useState(null)
  const [servings, setServings] = useState(1)
  const [favCuisines, setFavCuisines] = useState([])
  const [wantToTry, setWantToTry] = useState('')
  const [notes, setNotes] = useState('')

  const currentStep = STEPS[step]
  const isLast = step === STEPS.length - 1

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
  const back = () => setStep(s => Math.max(s - 1, 0))
  const skip = () => next()

  const toggleItem = (list, setList, item) => {
    setList(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item])
  }

  const handleFinish = async () => {
    setSaving(true)
    try {
      // Build preferences
      const profile = {
        dietary: {
          restrictions,
          allergies,
          dislikes: dislikes ? dislikes.split(',').map(s => s.trim()).filter(Boolean) : [],
          favorites: favorites ? favorites.split(',').map(s => s.trim()).filter(Boolean) : [],
        },
        cooking: {
          skill_level: skillLevel,
          equipment,
          max_prep_time: prepTime,
          default_servings: servings,
        },
        cuisines: {
          favorites: favCuisines,
          want_to_try: wantToTry ? wantToTry.split(',').map(s => s.trim()).filter(Boolean) : [],
          avoid: [],
        },
        notes: notes ? [notes] : [],
      }

      // Write preferences
      const profileYaml = yaml.dump(profile, { lineWidth: -1, noRefs: true })
      await invoke('write_data_file', { relativePath: 'preferences/profile.yaml', content: profileYaml })

      // Write CLAUDE.local.md
      if (name.trim()) {
        const localMd = `# What2Eat — Personal Overrides\n\nUser: ${name.trim()}\n\n## Custom Instructions\n(Add any personal instructions or overrides here.)\n`
        await invoke('write_data_file', { relativePath: 'CLAUDE.local.md', content: localMd })
      }

      onComplete()
    } catch (err) {
      console.error('Setup save failed:', err)
      // Still proceed — data can be added later
      onComplete()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="h-screen bg-[var(--color-cream)] flex items-center justify-center">
      <div className="max-w-lg w-full mx-4">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === step ? 'bg-[var(--color-sage)]' : i < step ? 'bg-[var(--color-sage)]/40' : 'bg-[var(--color-peach)]'
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-[var(--color-peach)]/20">
          {currentStep === 'welcome' && (
            <WelcomeStep name={name} setName={setName} />
          )}
          {currentStep === 'dietary' && (
            <DietaryStep
              restrictions={restrictions} toggleRestriction={(r) => toggleItem(restrictions, setRestrictions, r)}
              allergies={allergies} toggleAllergy={(a) => toggleItem(allergies, setAllergies, a)}
              dislikes={dislikes} setDislikes={setDislikes}
              favorites={favorites} setFavorites={setFavorites}
            />
          )}
          {currentStep === 'cooking' && (
            <CookingStep
              skillLevel={skillLevel} setSkillLevel={setSkillLevel}
              equipment={equipment} toggleEquipment={(e) => toggleItem(equipment, setEquipment, e)}
              prepTime={prepTime} setPrepTime={setPrepTime}
              servings={servings} setServings={setServings}
            />
          )}
          {currentStep === 'cuisines' && (
            <CuisinesStep
              favCuisines={favCuisines} toggleCuisine={(c) => toggleItem(favCuisines, setFavCuisines, c)}
              wantToTry={wantToTry} setWantToTry={setWantToTry}
              notes={notes} setNotes={setNotes}
            />
          )}
          {currentStep === 'done' && (
            <DoneStep name={name} />
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-4 border-t border-[var(--color-peach)]/20">
            <div>
              {step > 0 && !isLast && (
                <button onClick={back} className="text-sm text-[var(--color-text-light)] hover:text-[var(--color-text)] cursor-pointer">
                  ← Back
                </button>
              )}
            </div>
            <div className="flex gap-3">
              {!isLast && step > 0 && (
                <button onClick={skip} className="text-sm text-[var(--color-text-light)] hover:text-[var(--color-text)] cursor-pointer">
                  Skip
                </button>
              )}
              {isLast ? (
                <button
                  onClick={handleFinish}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-[var(--color-sage)] text-white text-sm font-medium
                             hover:bg-[var(--color-sage-dark)] disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {saving ? 'Setting up...' : "Let's go!"}
                </button>
              ) : (
                <button
                  onClick={next}
                  className="px-6 py-2.5 rounded-xl bg-[var(--color-sage)] text-white text-sm font-medium
                             hover:bg-[var(--color-sage-dark)] transition-colors cursor-pointer"
                >
                  {step === 0 ? 'Get started' : 'Next →'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function WelcomeStep({ name, setName }) {
  return (
    <div className="text-center">
      <span className="text-5xl">👨‍🍳</span>
      <h1 className="text-2xl font-semibold text-[var(--color-text)] mt-4">Welcome to What2Eat!</h1>
      <p className="text-sm text-[var(--color-text-light)] mt-2 mb-6">
        I'm your personal chef assistant. Let me learn a bit about you so I can help you figure out what to eat.
      </p>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="What's your name?"
        className="w-full max-w-xs mx-auto px-4 py-3 rounded-xl bg-[var(--color-cream)] border border-[var(--color-peach)]/50
                   text-sm text-center text-[var(--color-text)] placeholder:text-[var(--color-text-light)]/50
                   focus:outline-none focus:border-[var(--color-sage)] transition-colors"
      />
    </div>
  )
}

function DietaryStep({ restrictions, toggleRestriction, allergies, toggleAllergy, dislikes, setDislikes, favorites, setFavorites }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-[var(--color-text)]">Food preferences</h2>
      <p className="text-sm text-[var(--color-text-light)] mt-1 mb-5">Any dietary needs? All optional — you can always update later.</p>

      <div className="space-y-5">
        <div>
          <label className="text-xs font-medium text-[var(--color-text-light)] uppercase tracking-wide">Dietary restrictions</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {['Vegetarian', 'Vegan', 'Pescatarian', 'Halal', 'Kosher', 'Keto', 'Gluten-free'].map(r => (
              <Chip key={r} label={r} selected={restrictions.includes(r.toLowerCase())} onClick={() => toggleRestriction(r.toLowerCase())} />
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-[var(--color-text-light)] uppercase tracking-wide">Allergies</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {['Nuts', 'Shellfish', 'Dairy', 'Gluten', 'Eggs', 'Soy'].map(a => (
              <Chip key={a} label={a} selected={allergies.includes(a.toLowerCase())} onClick={() => toggleAllergy(a.toLowerCase())} />
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-[var(--color-text-light)] uppercase tracking-wide">Ingredients you dislike</label>
          <input
            type="text" value={dislikes} onChange={(e) => setDislikes(e.target.value)}
            placeholder="e.g. cilantro, olives, blue cheese"
            className="w-full mt-2 px-3 py-2 rounded-lg bg-[var(--color-cream)] border border-[var(--color-peach)]/40
                       text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-light)]/40
                       focus:outline-none focus:border-[var(--color-sage)] transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-[var(--color-text-light)] uppercase tracking-wide">Ingredients you love</label>
          <input
            type="text" value={favorites} onChange={(e) => setFavorites(e.target.value)}
            placeholder="e.g. garlic, spicy food, mushrooms"
            className="w-full mt-2 px-3 py-2 rounded-lg bg-[var(--color-cream)] border border-[var(--color-peach)]/40
                       text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-light)]/40
                       focus:outline-none focus:border-[var(--color-sage)] transition-colors"
          />
        </div>
      </div>
    </div>
  )
}

function CookingStep({ skillLevel, setSkillLevel, equipment, toggleEquipment, prepTime, setPrepTime, servings, setServings }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-[var(--color-text)]">Your kitchen</h2>
      <p className="text-sm text-[var(--color-text-light)] mt-1 mb-5">Helps me suggest recipes you can actually make.</p>

      <div className="space-y-5">
        <div>
          <label className="text-xs font-medium text-[var(--color-text-light)] uppercase tracking-wide">Cooking comfort level</label>
          <div className="flex gap-2 mt-2">
            {[
              { val: 'beginner', label: 'Just learning', desc: 'Keep it simple' },
              { val: 'intermediate', label: 'Comfortable', desc: 'Most recipes' },
              { val: 'advanced', label: 'Love cooking', desc: 'Bring it on' },
            ].map(s => (
              <button
                key={s.val}
                onClick={() => setSkillLevel(s.val)}
                className={`flex-1 p-3 rounded-xl text-left border transition-all cursor-pointer ${
                  skillLevel === s.val
                    ? 'border-[var(--color-sage)] bg-[var(--color-sage)]/10'
                    : 'border-[var(--color-peach)]/30 hover:border-[var(--color-sage)]/40'
                }`}
              >
                <div className="text-sm font-medium">{s.label}</div>
                <div className="text-xs text-[var(--color-text-light)]">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-[var(--color-text-light)] uppercase tracking-wide">Equipment</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {['Stove', 'Oven', 'Microwave', 'Air fryer', 'Rice cooker', 'Instant Pot', 'Wok', 'Grill'].map(e => (
              <Chip key={e} label={e} selected={equipment.includes(e.toLowerCase())} onClick={() => toggleEquipment(e.toLowerCase())} />
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-xs font-medium text-[var(--color-text-light)] uppercase tracking-wide">Weeknight cook time</label>
            <select
              value={prepTime || ''}
              onChange={(e) => setPrepTime(e.target.value || null)}
              className="w-full mt-2 px-3 py-2 rounded-lg bg-[var(--color-cream)] border border-[var(--color-peach)]/40
                         text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-sage)] cursor-pointer"
            >
              <option value="">No limit</option>
              <option value="15min">15 min</option>
              <option value="30min">30 min</option>
              <option value="45min">45 min</option>
              <option value="1hr">1 hour</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs font-medium text-[var(--color-text-light)] uppercase tracking-wide">Usually cooking for</label>
            <select
              value={servings}
              onChange={(e) => setServings(parseInt(e.target.value))}
              className="w-full mt-2 px-3 py-2 rounded-lg bg-[var(--color-cream)] border border-[var(--color-peach)]/40
                         text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-sage)] cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6].map(n => (
                <option key={n} value={n}>{n} {n === 1 ? 'person' : 'people'}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

function CuisinesStep({ favCuisines, toggleCuisine, wantToTry, setWantToTry, notes, setNotes }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-[var(--color-text)]">What you like to eat</h2>
      <p className="text-sm text-[var(--color-text-light)] mt-1 mb-5">Pick your favorites — I'll learn more as we go.</p>

      <div className="space-y-5">
        <div>
          <label className="text-xs font-medium text-[var(--color-text-light)] uppercase tracking-wide">Favorite cuisines</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {['Chinese', 'Japanese', 'Korean', 'Thai', 'Vietnamese', 'Indian', 'Italian', 'Mexican', 'Mediterranean', 'American', 'French'].map(c => (
              <Chip key={c} label={c} selected={favCuisines.includes(c.toLowerCase())} onClick={() => toggleCuisine(c.toLowerCase())} />
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-[var(--color-text-light)] uppercase tracking-wide">Want to explore</label>
          <input
            type="text" value={wantToTry} onChange={(e) => setWantToTry(e.target.value)}
            placeholder="e.g. Ethiopian, Peruvian"
            className="w-full mt-2 px-3 py-2 rounded-lg bg-[var(--color-cream)] border border-[var(--color-peach)]/40
                       text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-light)]/40
                       focus:outline-none focus:border-[var(--color-sage)] transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-[var(--color-text-light)] uppercase tracking-wide">Anything else?</label>
          <input
            type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. I meal prep on Sundays, love leftovers for lunch"
            className="w-full mt-2 px-3 py-2 rounded-lg bg-[var(--color-cream)] border border-[var(--color-peach)]/40
                       text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-light)]/40
                       focus:outline-none focus:border-[var(--color-sage)] transition-colors"
          />
        </div>
      </div>
    </div>
  )
}

function DoneStep({ name }) {
  return (
    <div className="text-center">
      <span className="text-5xl">🎉</span>
      <h2 className="text-xl font-semibold text-[var(--color-text)] mt-4">
        All set{name ? `, ${name}` : ''}!
      </h2>
      <p className="text-sm text-[var(--color-text-light)] mt-2 mb-4">
        Here's what you can do:
      </p>
      <div className="text-left bg-[var(--color-cream)] rounded-xl p-4 space-y-2">
        {[
          { icon: '🛒', text: '"I just went grocery shopping" — I\'ll track your inventory' },
          { icon: '🍽', text: '"What should I eat tonight?" — I\'ll suggest meals' },
          { icon: '⏰', text: '"Remind me to defrost chicken" — I\'ll remember for you' },
          { icon: '📖', text: 'Check Kitchen, Recipes, and Reminders tabs for your data' },
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-2 text-sm text-[var(--color-text)]">
            <span>{item.icon}</span>
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Chip({ label, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
        selected
          ? 'bg-[var(--color-sage)] text-white'
          : 'bg-[var(--color-cream)] text-[var(--color-text-light)] hover:bg-[var(--color-peach)]/40'
      }`}
    >
      {label}
    </button>
  )
}

export default Setup
