import { useEffect, useRef } from 'react'
import { invoke } from '@tauri-apps/api/core'
import yaml from 'js-yaml'

/**
 * Polls reminders and sends macOS notifications via osascript.
 * Two-stage: warning at 5min, fire at due time.
 */
export function useReminderNotifications(pollInterval = 15000) {
  const stateRef = useRef({}) // { [id]: 'warned' | 'fired' }

  useEffect(() => {
    let active = true

    async function notify(title, body) {
      try {
        await invoke('send_notification', { title, body })
        console.log(`[Notifications] Sent: ${title} — ${body}`)
      } catch (e) {
        console.error('[Notifications] Failed to send:', e)
      }
    }

    async function checkReminders() {
      if (!active) return

      try {
        const content = await invoke('read_data_file', { relativePath: 'reminders/active.yaml' })
        const data = yaml.load(content, { schema: yaml.JSON_SCHEMA })
        const reminders = data?.reminders || []

        const now = new Date()
        const fiveMinutes = 5 * 60 * 1000

        for (const reminder of reminders) {
          if (!reminder.due) continue

          if (reminder.status === 'done') {
            delete stateRef.current[reminder.id]
            continue
          }

          if (reminder.status !== 'pending') continue

          const dueDate = new Date(reminder.due)
          const diffMs = dueDate - now
          const state = stateRef.current[reminder.id]

          console.log(`[Notifications] #${reminder.id}: diffMs=${Math.round(diffMs / 1000)}s state=${state || 'none'}`)

          if (diffMs <= 0 && state !== 'fired') {
            await notify('⏰ Reminder — now!', reminder.text)
            stateRef.current[reminder.id] = 'fired'
          } else if (diffMs > 0 && diffMs <= fiveMinutes && !state) {
            const minutesLeft = Math.ceil(diffMs / 60000)
            await notify(`⏰ Coming up in ${minutesLeft} min`, reminder.text)
            stateRef.current[reminder.id] = 'warned'
          }
        }
      } catch (err) {
        // File not found is normal for fresh installs
        if (!(typeof err === 'string' && err.includes('not found'))) {
          console.log('[Notifications] Check failed:', err)
        }
      }
    }

    const initialTimeout = setTimeout(checkReminders, 2000)
    const interval = setInterval(checkReminders, pollInterval)

    return () => {
      active = false
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [pollInterval])
}
