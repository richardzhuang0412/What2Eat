import { useEffect, useRef } from 'react'
import { invoke } from '@tauri-apps/api/core'
import yaml from 'js-yaml'

/**
 * Polls reminders and sends macOS notifications.
 * Two-stage: warning at 5min, fire at due time.
 *
 * Tracks state by a composite key of id + due time, so if a reminder
 * is deleted and recreated with the same id but different due time,
 * it gets a fresh notification.
 */
export function useReminderNotifications(pollInterval = 15000) {
  // Track by "id:due" key → 'warned' | 'fired'
  const stateRef = useRef({})

  useEffect(() => {
    let active = true

    async function notify(title, body) {
      try {
        await invoke('send_notification', { title, body })
        console.log(`[Notifications] Sent: ${title} — ${body}`)
        return true
      } catch (e) {
        console.error('[Notifications] Failed to send:', e)
        return false
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

        // Track which keys are still active this cycle
        const activeKeys = new Set()

        for (const reminder of reminders) {
          if (!reminder.due) continue

          // Unique key = id + due time (handles ID reuse)
          const key = `${reminder.id}:${reminder.due}`

          if (reminder.status === 'done') {
            delete stateRef.current[key]
            continue
          }

          if (reminder.status !== 'pending') continue

          activeKeys.add(key)

          const dueDate = new Date(reminder.due)
          const diffMs = dueDate - now
          const state = stateRef.current[key]

          console.log(`[Notifications] #${reminder.id}: diffMs=${Math.round(diffMs / 1000)}s state=${state || 'none'} key=${key}`)

          if (diffMs <= 0 && state !== 'fired') {
            const sent = await notify('Reminder - now!', reminder.text)
            if (sent) stateRef.current[key] = 'fired'
          } else if (diffMs > 0 && diffMs <= fiveMinutes && !state) {
            const minutesLeft = Math.ceil(diffMs / 60000)
            const sent = await notify(`Coming up in ${minutesLeft} min`, reminder.text)
            if (sent) stateRef.current[key] = 'warned'
          }
        }

        // Clean up stale keys (reminders that were deleted)
        for (const key of Object.keys(stateRef.current)) {
          if (!activeKeys.has(key)) {
            delete stateRef.current[key]
          }
        }
      } catch (err) {
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
