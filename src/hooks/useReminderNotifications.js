import { useEffect, useRef } from 'react'
import { invoke } from '@tauri-apps/api/core'
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from '@tauri-apps/plugin-notification'
import yaml from 'js-yaml'

/**
 * Polls reminders and sends macOS notifications.
 * Two-stage notifications:
 *   1. "Coming up" — 5 minutes before due
 *   2. "Now" — when actually due or overdue
 * Tracks notification state per reminder to avoid duplicates.
 */
export function useReminderNotifications(pollInterval = 15000) {
  // Track notification state: 'warned' (5-min early) or 'fired' (at due time)
  const stateRef = useRef({}) // { [id]: 'warned' | 'fired' }

  useEffect(() => {
    let active = true

    async function checkReminders() {
      if (!active) return

      try {
        let granted = await isPermissionGranted()
        if (!granted) {
          const permission = await requestPermission()
          granted = permission === 'granted'
        }
        if (!granted) return

        const content = await invoke('read_data_file', { relativePath: 'reminders/active.yaml' })
        const data = yaml.load(content, { schema: yaml.JSON_SCHEMA })
        const reminders = data?.reminders || []

        const now = new Date()
        const fiveMinutes = 5 * 60 * 1000

        for (const reminder of reminders) {
          if (!reminder.due) continue

          // If marked done, clear tracking so it can re-notify if unchecked
          if (reminder.status === 'done') {
            delete stateRef.current[reminder.id]
            continue
          }

          if (reminder.status !== 'pending') continue

          const dueDate = new Date(reminder.due)
          const diffMs = dueDate - now
          const state = stateRef.current[reminder.id]

          console.log(`[Notifications] Reminder ${reminder.id}: "${reminder.text}" due=${reminder.due} diffMs=${diffMs} state=${state}`)

          // Stage 2: Due now or overdue → fire main notification
          if (diffMs <= 0 && state !== 'fired') {
            console.log(`[Notifications] FIRING: ${reminder.text}`)
            sendNotification({
              title: '⏰ Reminder — now!',
              body: reminder.text,
            })
            stateRef.current[reminder.id] = 'fired'
          }
          // Stage 1: Within 5 minutes → early warning
          else if (diffMs > 0 && diffMs <= fiveMinutes && !state) {
            const minutesLeft = Math.ceil(diffMs / 60000)
            console.log(`[Notifications] WARNING (${minutesLeft}min): ${reminder.text}`)
            sendNotification({
              title: `⏰ Coming up in ${minutesLeft} min`,
              body: reminder.text,
            })
            stateRef.current[reminder.id] = 'warned'
          }
        }
      } catch (err) {
        console.log('[Notifications] Check failed:', err)
      }
    }

    // Initial check after short delay
    const initialTimeout = setTimeout(checkReminders, 2000)

    // Poll every 15 seconds
    const interval = setInterval(checkReminders, pollInterval)

    return () => {
      active = false
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [pollInterval])
}
