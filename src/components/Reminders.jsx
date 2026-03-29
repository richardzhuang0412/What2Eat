import { useYamlData } from '../hooks/useYamlData'
import { writeYaml } from '../utils/yaml'

function Reminders({ onAskChef, onPasteToChat }) {
  const { data, loading, refresh } = useYamlData('reminders/active.yaml')

  const reminders = data?.reminders || []
  const pending = reminders.filter(r => r.status === 'pending')
  const done = reminders.filter(r => r.status === 'done')
  const overdue = pending.filter(r => isOverdue(r.due))

  async function toggleDone(id) {
    if (!data) return
    const updated = {
      ...data,
      reminders: data.reminders.map(r =>
        r.id === id
          ? { ...r, status: r.status === 'done' ? 'pending' : 'done' }
          : r
      ),
    }
    await writeYaml('reminders/active.yaml', updated)
    refresh()
  }

  async function removeReminder(id) {
    if (!data) return
    const updated = {
      ...data,
      reminders: data.reminders.filter(r => r.id !== id),
    }
    await writeYaml('reminders/active.yaml', updated)
    refresh()
  }

  async function clearCompleted() {
    if (!data) return
    const updated = {
      ...data,
      reminders: data.reminders.filter(r => r.status !== 'done'),
    }
    await writeYaml('reminders/active.yaml', updated)
    refresh()
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <span className="text-[var(--color-text-light)] animate-pulse">Loading reminders...</span>
      </div>
    )
  }

  if (reminders.length === 0) {
    return (
      <div className="h-full overflow-y-auto p-6">
        <h1 className="text-xl font-semibold text-[var(--color-text)] mb-6">Reminders</h1>
        <div className="flex flex-col items-center justify-center h-[60%] text-center">
          <span className="text-5xl mb-4">⏰</span>
          <h2 className="text-lg font-medium text-[var(--color-text)] mb-2">No reminders yet</h2>
          <p className="text-sm text-[var(--color-text-light)] max-w-sm mb-4">
            Tell your chef things like "remind me to defrost chicken tomorrow"
          </p>
          <button
            onClick={() => onPasteToChat?.("Remind me to ")}
            className="text-sm px-4 py-2 rounded-xl bg-[var(--color-sage)] text-white
                       hover:bg-[var(--color-sage-dark)] transition-colors cursor-pointer"
          >
            Create a reminder
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-[var(--color-text)]">Reminders</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--color-text-light)]">{pending.length} pending</span>
          <button
            onClick={() => onPasteToChat?.("Remind me to ")}
            className="text-sm px-3 py-1.5 rounded-lg bg-[var(--color-sage)] text-white
                       hover:bg-[var(--color-sage-dark)] transition-colors cursor-pointer"
          >
            + New reminder
          </button>
        </div>
      </div>

      {/* Overdue banner */}
      {overdue.length > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200/50">
          <div className="flex items-center gap-2">
            <span className="text-sm">🔴</span>
            <span className="text-sm text-red-800">
              <strong>{overdue.length}</strong> overdue reminder{overdue.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <div className="space-y-3 mb-6">
          {pending.map(reminder => (
            <ReminderItem
              key={reminder.id}
              reminder={reminder}
              onToggle={() => toggleDone(reminder.id)}
            />
          ))}
        </div>
      )}

      {/* Done */}
      {done.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-[var(--color-text-light)] uppercase tracking-wide">
              Completed ({done.length})
            </h2>
            <button
              onClick={clearCompleted}
              className="text-xs text-[var(--color-text-light)] hover:text-[var(--color-danger)] transition-colors cursor-pointer"
            >
              Clear all
            </button>
          </div>
          <div className="space-y-2">
            {done.map(reminder => (
              <ReminderItem
                key={reminder.id}
                reminder={reminder}
                onToggle={() => toggleDone(reminder.id)}
                onRemove={() => removeReminder(reminder.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick add */}
      <div className="mt-6 pt-4 border-t border-[var(--color-peach)]/20">
        <button
          onClick={() => onPasteToChat?.("Remind me to ")}
          className="text-sm text-[var(--color-sage-dark)] hover:text-[var(--color-sage)] transition-colors cursor-pointer"
        >
          + Add a reminder via chat
        </button>
      </div>
    </div>
  )
}

function ReminderItem({ reminder, onToggle, onRemove }) {
  const isDone = reminder.status === 'done'
  const overdue = !isDone && isOverdue(reminder.due)
  const dueToday = !isDone && isDueToday(reminder.due)

  return (
    <div className={`
      rounded-xl p-4 shadow-sm flex items-start gap-3 transition-all
      ${isDone
        ? 'bg-white/50 border border-[var(--color-peach)]/20'
        : overdue
          ? 'bg-red-50/50 border-l-4 border-l-[var(--color-danger)] border border-red-100'
          : dueToday
            ? 'bg-amber-50/50 border-l-4 border-l-[var(--color-warning)] border border-amber-100'
            : 'bg-white border-l-4 border-l-[var(--color-sage)] border border-[var(--color-peach)]/20'
      }
    `}>
      {/* Checkbox */}
      <button
        onClick={onToggle}
        className={`
          w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5
          transition-colors cursor-pointer
          ${isDone
            ? 'bg-[var(--color-sage)] border-[var(--color-sage)] text-white'
            : 'border-[var(--color-peach)] hover:border-[var(--color-sage)]'
          }
        `}
      >
        {isDone && <span className="text-xs">✓</span>}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${isDone ? 'text-[var(--color-text-light)] line-through' : 'text-[var(--color-text)]'}`}>
          {reminder.text}
        </p>
        {reminder.context && !isDone && (
          <p className="text-xs text-[var(--color-text-light)] mt-1">{reminder.context}</p>
        )}
      </div>

      {!isDone && (
        <span className={`text-xs font-medium whitespace-nowrap ${
          overdue ? 'text-[var(--color-danger)]' :
          dueToday ? 'text-[var(--color-warning)]' :
          'text-[var(--color-text-light)]'
        }`}>
          {formatDue(reminder.due)}
        </span>
      )}
      {isDone && onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          className="text-xs text-[var(--color-text-light)] hover:text-[var(--color-danger)] transition-colors cursor-pointer flex-shrink-0"
          title="Remove"
        >
          ✕
        </button>
      )}
    </div>
  )
}

// Date helpers
function isOverdue(dueStr) {
  if (!dueStr) return false
  return new Date(dueStr) < new Date()
}

function isDueToday(dueStr) {
  if (!dueStr) return false
  return new Date(dueStr).toDateString() === new Date().toDateString()
}

function formatDue(dueStr) {
  if (!dueStr) return ''
  const due = new Date(dueStr)
  const now = new Date()

  if (isOverdue(dueStr)) return 'Overdue'
  if (isDueToday(dueStr)) {
    if (dueStr.includes('T')) {
      return `Today ${due.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
    }
    return 'Today'
  }

  const days = Math.ceil((due - now) / (1000 * 60 * 60 * 24))
  if (days === 1) return 'Tomorrow'
  if (days <= 7) return `In ${days} days`
  return due.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default Reminders
