import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../database/db'
import { seedDefaultTemplatesIfEmpty } from '../services/plannerService'
import { useEffect } from 'react'

export const useTasksForDate = (dateKey: string) => {
  return useLiveQuery(async () => {
    const tasks = await db.tasks.where('date').equals(dateKey).toArray()
    
    // Sort chronologically by startTime (e.g. "08:00" < "09:30" < "14:00")
    tasks.sort((a, b) => {
      if (a.startTime === b.startTime) {
        return a.endTime.localeCompare(b.endTime)
      }
      return a.startTime.localeCompare(b.startTime)
    })

    return tasks
  }, [dateKey])
}

export const useDayProgress = (dateKey: string) => {
  return useLiveQuery(async () => {
    const tasks = await db.tasks.where('date').equals(dateKey).toArray()
    const total = tasks.length
    if (total === 0) return { total: 0, completed: 0, percentage: 0 }
    
    const completed = tasks.filter((t) => t.completed).length
    const percentage = Math.round((completed / total) * 100)
    return { total, completed, percentage }
  }, [dateKey])
}

export const useAllTemplates = () => {
  useEffect(() => {
    seedDefaultTemplatesIfEmpty().catch(console.error)
  }, [])

  return useLiveQuery(async () => {
    const templates = await db.templates.toArray()
    templates.sort((a, b) => b.createdAt - a.createdAt)
    return templates
  })
}

export const usePlannedDatesMap = () => {
  return useLiveQuery(async () => {
    const tasks = await db.tasks.toArray()
    const counts: Record<string, { total: number; completed: number }> = {}
    
    for (const t of tasks) {
      if (!counts[t.date]) {
        counts[t.date] = { total: 0, completed: 0 }
      }
      counts[t.date].total += 1
      if (t.completed) counts[t.date].completed += 1
    }
    
    return counts
  })
}
