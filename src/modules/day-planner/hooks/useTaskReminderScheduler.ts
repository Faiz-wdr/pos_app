import { useEffect } from 'react'
import { db } from '../database/db'
import { getTodayKey } from '../utils/dateUtils'
import { ReminderOption } from '../types'
import { useReminderAlertStore } from '../store/reminderAlertStore'
import { startTaskAlarm } from '../services/audioService'

const getReminderOffsetMs = (reminder: ReminderOption): number => {
  switch (reminder) {
    case 'At Time':
      return 0
    case '5 Minutes Before':
      return 5 * 60 * 1000
    case '10 Minutes Before':
      return 10 * 60 * 1000
    case '30 Minutes Before':
      return 30 * 60 * 1000
    case '1 Hour Before':
      return 60 * 60 * 1000
    case '1 Day Before':
      return 24 * 60 * 60 * 1000
    default:
      return 0
  }
}

export const useTaskReminderScheduler = () => {
  useEffect(() => {
    const checkUpcomingReminders = async () => {
      try {
        const todayKey = getTodayKey()
        const tasks = await db.tasks.where('date').equals(todayKey).toArray()
        if (!tasks || tasks.length === 0) return

        const now = Date.now()
        const notifiedKey = `notified_planner_tasks_${todayKey}`
        const notifiedRaw = localStorage.getItem(notifiedKey)
        const notifiedSet: Set<string> = new Set(notifiedRaw ? JSON.parse(notifiedRaw) : [])

        for (const task of tasks) {
          if (task.completed || notifiedSet.has(task.id)) continue

          const taskTime = new Date(`${task.date}T${task.startTime}:00`).getTime()
          if (isNaN(taskTime)) continue

          const offsetMs = getReminderOffsetMs(task.reminder)
          const triggerTime = taskTime - offsetMs

          if (now >= triggerTime && now < taskTime + 15 * 60 * 1000) {
            // 1. Trigger audio chime alarm
            startTaskAlarm()

            // 2. Open active task alert overlay modal
            useReminderAlertStore.getState().setActiveTask(task)

            // 3. Trigger native browser notification if permission granted
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification(`⏰ Day Planner: ${task.title}`, {
                  body: `Scheduled for ${task.startTime}${task.category ? ` • ${task.category}` : ''}${
                    task.notes ? `\n${task.notes}` : ''
                  }`,
                  icon: '/favicon.svg'
                })
              } catch (e) {
                console.warn('Error triggering browser notification:', e)
              }
            }

            // 4. Device vibration feedback
            if ('vibrate' in navigator) {
              navigator.vibrate([300, 150, 300])
            }

            notifiedSet.add(task.id)
          }
        }

        localStorage.setItem(notifiedKey, JSON.stringify(Array.from(notifiedSet)))
      } catch (err) {
        console.error('Error checking planner task reminders:', err)
      }
    }

    checkUpcomingReminders()
    const interval = setInterval(checkUpcomingReminders, 15000)

    return () => clearInterval(interval)
  }, [])
}
