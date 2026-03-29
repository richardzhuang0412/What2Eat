import { useEffect, useRef } from 'react'
import { invoke } from '@tauri-apps/api/core'
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from '@tauri-apps/plugin-notification'
import yaml from 'js-yaml'

/**
 * Polls reminders and sends macOS notifications for due/overdue items.
 * Tracks which reminders have already been notified to avoid duplicates.
 */
export function useReminderNotifications(pollInterval = 60000) {
  const notifiedRef = useRef(new Set()) // reminder IDs already notified

  useEffect(() => {
    let active = true

    async function checkReminders() {
      if (!active) return

      try {
        // Check notification permission
        let granted = await isPermissionGranted()
        if (!granted) {
          const permission = await requestPermission()
          granted = permission === 'granted'
        }
        if (!granted) return

        // Read reminders
        const content = await invoke('read_data_file', { relativePath: 'reminders/active.yaml' })
        const data = yaml.load(content, { schema: yaml.JSON_SCHEMA })
        const reminders = data?.reminders || []

        const now = new Date()

        for (const reminder of reminders) {
          if (!reminder.due) continue

          // If marked done, remove from notified set so it re-notifies if unchecked
          if (reminder.status === 'done') {
            notifiedRef.current.delete(reminder.id)
            continue
          }

          if (reminder.status !== 'pending') continue
          if (notifiedRef.current.has(reminder.id)) continue

          const dueDate = new Date(reminder.due)

          // Notify if due within the next 5 minutes or already overdue
          const diffMs = dueDate - now
          const fiveMinutes = 5 * 60 * 1000

          if (diffMs <= fiveMinutes) {
            const isOverdue = diffMs < 0
            const title = isOverdue ? '⏰ Overdue reminder' : '⏰ Reminder'
            const body = reminder.text

            sendNotification({ title, body })
            notifiedRef.current.add(reminder.id)
          }
        }
      } catch (err) {
        // Silently fail — notifications are best-effort
        console.log('[Notifications] Check failed:', err)
      }
    }

    // Initial check after short delay (let app settle)
    const initialTimeout = setTimeout(checkReminders, 3000)

    // Poll periodically
    const interval = setInterval(checkReminders, pollInterval)

    return () => {
      active = false
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [pollInterval])
}
