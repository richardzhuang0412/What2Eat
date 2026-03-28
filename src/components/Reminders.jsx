import { useYamlData } from '../hooks/useYamlData'

function Reminders() {
  const { data, loading } = useYamlData('reminders/active.yaml')

  const reminders = data?.reminders || []
  const pending = reminders.filter(r => r.status === 'pending')
  const done = reminders.filter(r => r.status === 'done')

  const isOverdue = (dueStr) => {
    if (!dueStr) return false
    return new Date(dueStr) < new Date()
  }

  const isDueToday = (dueStr) => {
    if (!dueStr) return false
    const due = new Date(dueStr)
    const now = new Date()
    return due.toDateString() === now.toDateString()
  }

  const formatDue = (dueStr) => {
    if (!dueStr) return ''
    const due = new Date(dueStr)
    const now = new Date()

    if (isOverdue(dueStr)) return 'Overdue'
    if (isDueToday(dueStr)) {
      // Show time if available
      if (dueStr.includes('T')) {
        return `Today at ${due.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
      }
      return 'Today'
    }

    const days = Math.ceil((due - now) / (1000 * 60 * 60 * 24))
    if (days === 1) return 'Tomorrow'
    if (days <= 7) return `In ${days} days`
    return due.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  const getUrgencyStyle = (dueStr) => {
    if (isOverdue(dueStr)) return 'border-l-[var(--color-danger)] bg-red-50/50'
    if (isDueToday(dueStr)) return 'border-l-[var(--color-warning)] bg-amber-50/50'
    return 'border-l-[var(--color-sage)] bg-white'
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
          <p className="text-sm text-[var(--color-text-light)] max-w-sm">
            Tell your chef things like "remind me to defrost chicken tomorrow" and they'll show up here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[var(--color-text)]">Reminders</h1>
        <span className="text-sm text-[var(--color-text-light)]">{pending.length} pending</span>
      </div>

      {pending.length > 0 && (
        <div className="space-y-3 mb-6">
          {pending.map(reminder => (
            <div
              key={reminder.id}
              className={`rounded-xl p-4 border-l-4 shadow-sm ${getUrgencyStyle(reminder.due)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--color-text)]">{reminder.text}</p>
                  {reminder.context && (
                    <p className="text-xs text-[var(--color-text-light)] mt-1">{reminder.context}</p>
                  )}
                </div>
                <span className={`text-xs font-medium ml-3 whitespace-nowrap ${
                  isOverdue(reminder.due) ? 'text-[var(--color-danger)]' :
                  isDueToday(reminder.due) ? 'text-[var(--color-warning)]' :
                  'text-[var(--color-text-light)]'
                }`}>
                  {formatDue(reminder.due)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {done.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-[var(--color-text-light)] uppercase tracking-wide mb-3">
            Completed
          </h2>
          <div className="space-y-2">
            {done.map(reminder => (
              <div key={reminder.id} className="rounded-xl p-3 bg-white/50 border border-[var(--color-peach)]/20">
                <p className="text-sm text-[var(--color-text-light)] line-through">{reminder.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Reminders
