import { db } from '../database/db'
import { PlannerTask, PlannerTemplate, TemplateItem, RepeatOption } from '../types'
import { auth } from '@/core/firebase/auth'
import { db as firestoreDb } from '@/core/firebase/firestore'
import { doc, setDoc, deleteDoc } from 'firebase/firestore'
import { sanitizeForFirestore } from '../utils/firestoreUtils'

const getUserId = () => auth.currentUser?.uid

const syncTaskToFirestore = async (task: PlannerTask) => {
  const userId = getUserId()
  if (!userId) return
  try {
    await setDoc(doc(firestoreDb, 'users', userId, 'tasks', task.id), sanitizeForFirestore(task))
  } catch (e) {
    console.error('Error syncing task to firestore:', e)
  }
}

const deleteTaskFromFirestore = async (taskId: string) => {
  const userId = getUserId()
  if (!userId) return
  try {
    await deleteDoc(doc(firestoreDb, 'users', userId, 'tasks', taskId))
  } catch (e) {
    console.error('Error deleting task from firestore:', e)
  }
}

const syncTemplateToFirestore = async (template: PlannerTemplate) => {
  const userId = getUserId()
  if (!userId) return
  try {
    await setDoc(doc(firestoreDb, 'users', userId, 'templates', template.id), sanitizeForFirestore(template))
  } catch (e) {
    console.error('Error syncing template to firestore:', e)
  }
}

const deleteTemplateFromFirestore = async (templateId: string) => {
  const userId = getUserId()
  if (!userId) return
  try {
    await deleteDoc(doc(firestoreDb, 'users', userId, 'templates', templateId))
  } catch (e) {
    console.error('Error deleting template from firestore:', e)
  }
}


export const STUDENT_ROUTINE_ITEMS: TemplateItem[] = [
  { title: 'Wake Up & Morning Refreshment', startTime: '05:30', endTime: '06:15', category: 'Health', repeat: 'Daily', reminder: 'At Time', notes: 'Drink water & light exercise' },
  { title: 'Morning Revision & Study', startTime: '06:15', endTime: '07:00', category: 'Study', repeat: 'Daily', reminder: '5 Minutes Before' },
  { title: 'Breakfast & College Prep', startTime: '07:00', endTime: '08:00', category: 'Personal', repeat: 'Daily', reminder: 'At Time' },
  { title: 'School / College Classes', startTime: '08:00', endTime: '13:00', category: 'Study', repeat: 'Weekdays', reminder: '10 Minutes Before' },
  { title: 'Lunch & Rest Break', startTime: '13:00', endTime: '14:00', category: 'Personal', repeat: 'Daily', reminder: 'At Time' },
  { title: 'Assignments & Project Work', startTime: '14:00', endTime: '16:00', category: 'Study', repeat: 'Daily', reminder: '5 Minutes Before' },
  { title: 'Sports & Physical Activity', startTime: '16:00', endTime: '17:30', category: 'Health', repeat: 'Daily', reminder: '10 Minutes Before' },
  { title: 'Evening Self-Study Block', startTime: '17:30', endTime: '19:30', category: 'Study', repeat: 'Daily', reminder: '5 Minutes Before' },
  { title: 'Dinner & Family Time', startTime: '19:30', endTime: '20:30', category: 'Family', repeat: 'Daily', reminder: 'At Time' },
  { title: 'Reading & Prep for Tomorrow', startTime: '20:30', endTime: '22:00', category: 'Study', repeat: 'Daily', reminder: '10 Minutes Before' },
  { title: 'Night Routine & Sleep', startTime: '22:00', endTime: '23:00', category: 'Health', repeat: 'Daily', reminder: '30 Minutes Before' }
]

export const FREELANCER_ROUTINE_ITEMS: TemplateItem[] = [
  { title: 'Wake Up & Hydration Walk', startTime: '05:30', endTime: '06:15', category: 'Health', repeat: 'Daily', reminder: 'At Time', notes: 'Hydration & outdoor morning walk' },
  { title: 'Coffee & Daily Goal Planning', startTime: '06:15', endTime: '07:00', category: 'Personal', repeat: 'Daily', reminder: '5 Minutes Before' },
  { title: 'Breakfast & Client Inbox Sync', startTime: '07:00', endTime: '08:00', category: 'Work', repeat: 'Weekdays', reminder: 'At Time' },
  { title: 'Deep Work Block 1 (Deliverables)', startTime: '08:00', endTime: '11:00', category: 'Work', repeat: 'Weekdays', reminder: '10 Minutes Before', notes: 'No distraction client focus' },
  { title: 'Short Break & Stretch', startTime: '11:00', endTime: '11:30', category: 'Health', repeat: 'Weekdays', reminder: 'At Time' },
  { title: 'Deep Work Block 2 (Execution)', startTime: '11:30', endTime: '13:00', category: 'Work', repeat: 'Weekdays', reminder: '5 Minutes Before' },
  { title: 'Lunch & Power Nap', startTime: '13:00', endTime: '14:00', category: 'Personal', repeat: 'Daily', reminder: 'At Time' },
  { title: 'Client Calls, Admin & Proposals', startTime: '14:00', endTime: '16:00', category: 'Work', repeat: 'Weekdays', reminder: '10 Minutes Before' },
  { title: 'Gym / Workout Session', startTime: '16:00', endTime: '17:30', category: 'Health', repeat: 'Daily', reminder: '10 Minutes Before' },
  { title: 'Upskilling & Personal Projects', startTime: '17:30', endTime: '19:30', category: 'Study', repeat: 'Weekdays', reminder: '5 Minutes Before' },
  { title: 'Dinner & Family Time', startTime: '19:30', endTime: '20:30', category: 'Family', repeat: 'Daily', reminder: 'At Time' },
  { title: 'Screen Detox, Reading & Journaling', startTime: '20:30', endTime: '22:00', category: 'Personal', repeat: 'Daily', reminder: '10 Minutes Before' },
  { title: 'Night Routine & Sleep', startTime: '22:00', endTime: '23:00', category: 'Health', repeat: 'Daily', reminder: '30 Minutes Before' }
]

// Starter templates seeded on first launch
const DEFAULT_TEMPLATES: Omit<PlannerTemplate, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Student Routine (5:30 AM - 11 PM)',
    description: 'Complete 1-day routine for classes, study, revision & sleep',
    category: 'Study',
    items: STUDENT_ROUTINE_ITEMS
  },
  {
    name: 'Freelancer Routine (5:30 AM - 11 PM)',
    description: 'Complete 1-day routine for deep work blocks, clients & wellness',
    category: 'Work',
    items: FREELANCER_ROUTINE_ITEMS
  }
]

export const seedDefaultTemplatesIfEmpty = async () => {
  // Clean up old default templates if they exist
  const oldDefaults = ['Morning Routine', 'Weekend Routine']
  for (const name of oldDefaults) {
    const existing = await db.templates.where('name').equals(name).toArray()
    for (const t of existing) {
      await db.templates.delete(t.id)
      await deleteTemplateFromFirestore(t.id)
    }
  }

  const count = await db.templates.count()
  if (count === 0) {
    const now = Date.now()
    for (const t of DEFAULT_TEMPLATES) {
      const id = `tpl-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
      const tpl: PlannerTemplate = {
        ...t,
        id,
        createdAt: now,
        updatedAt: now
      }
      await db.templates.add(tpl)
      await syncTemplateToFirestore(tpl)
    }
  }
}

export const createTask = async (task: Omit<PlannerTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const id = `task-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
  const now = Date.now()
  const newTask: PlannerTask = {
    ...task,
    id,
    createdAt: now,
    updatedAt: now
  }
  await db.tasks.add(newTask)
  await syncTaskToFirestore(newTask)
  return id
}

export const updateTask = async (id: string, updates: Partial<PlannerTask>): Promise<void> => {
  const now = Date.now()
  await db.tasks.update(id, {
    ...updates,
    updatedAt: now
  })
  const updatedTask = await db.tasks.get(id)
  if (updatedTask) {
    await syncTaskToFirestore(updatedTask)
  }
}

export const deleteTask = async (id: string): Promise<void> => {
  await db.tasks.delete(id)
  await deleteTaskFromFirestore(id)
}

export const toggleTaskCompleted = async (id: string): Promise<boolean> => {
  const task = await db.tasks.get(id)
  if (!task) return false
  const newCompleted = !task.completed
  const now = Date.now()
  await db.tasks.update(id, {
    completed: newCompleted,
    updatedAt: now
  })
  const updatedTask = await db.tasks.get(id)
  if (updatedTask) {
    await syncTaskToFirestore(updatedTask)
  }
  return newCompleted
}

export const createTemplate = async (template: Omit<PlannerTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const id = `tpl-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
  const now = Date.now()
  const newTemplate: PlannerTemplate = {
    ...template,
    id,
    createdAt: now,
    updatedAt: now
  }
  await db.templates.add(newTemplate)
  await syncTemplateToFirestore(newTemplate)
  return id
}

export const updateTemplate = async (id: string, updates: Partial<PlannerTemplate>): Promise<void> => {
  const now = Date.now()
  await db.templates.update(id, {
    ...updates,
    updatedAt: now
  })
  const updatedTemplate = await db.templates.get(id)
  if (updatedTemplate) {
    await syncTemplateToFirestore(updatedTemplate)
  }
}

export const deleteTemplate = async (id: string): Promise<void> => {
  await db.templates.delete(id)
  await deleteTemplateFromFirestore(id)
}

export const duplicateTemplate = async (id: string): Promise<string> => {
  const original = await db.templates.get(id)
  if (!original) throw new Error('Template not found')

  const now = Date.now()
  const newId = `tpl-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
  const copy: PlannerTemplate = {
    ...original,
    id: newId,
    name: `${original.name} (Copy)`,
    createdAt: now,
    updatedAt: now
  }
  await db.templates.add(copy)
  await syncTemplateToFirestore(copy)
  return newId
}

export const applyTemplateToDate = async (templateId: string, targetDateKey: string): Promise<number> => {
  const template = await db.templates.get(templateId)
  if (!template || !template.items || template.items.length === 0) return 0

  const now = Date.now()
  let addedCount = 0

  for (const item of template.items) {
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
    const newTask: PlannerTask = {
      id: taskId,
      title: item.title,
      date: targetDateKey,
      startTime: item.startTime,
      endTime: item.endTime,
      category: item.category,
      repeat: item.repeat || 'Never',
      reminder: item.reminder || '10 Minutes Before',
      notes: item.notes || '',
      completed: false,
      createdAt: now,
      updatedAt: now
    }
    await db.tasks.add(newTask)
    await syncTaskToFirestore(newTask)
    addedCount++
  }

  return addedCount
}

export const applyPresetRoutineToDate = async (
  presetType: 'Student' | 'Freelancer',
  targetDateKey: string
): Promise<number> => {
  const items = presetType === 'Student' ? STUDENT_ROUTINE_ITEMS : FREELANCER_ROUTINE_ITEMS
  const now = Date.now()
  let addedCount = 0

  for (const item of items) {
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
    const newTask: PlannerTask = {
      id: taskId,
      title: item.title,
      date: targetDateKey,
      startTime: item.startTime,
      endTime: item.endTime,
      category: item.category,
      repeat: item.repeat || 'Never',
      reminder: item.reminder || '10 Minutes Before',
      notes: item.notes || '',
      completed: false,
      createdAt: now,
      updatedAt: now
    }
    await db.tasks.add(newTask)
    await syncTaskToFirestore(newTask)
    addedCount++
  }

  return addedCount
}

export const clearTasksForDate = async (dateKey: string): Promise<number> => {
  const tasks = await db.tasks.where('date').equals(dateKey).toArray()
  if (tasks.length === 0) return 0
  const ids = tasks.map((t) => t.id)
  await db.tasks.bulkDelete(ids)
  for (const id of ids) {
    await deleteTaskFromFirestore(id)
  }
  return ids.length
}

export const copyScheduleToDate = async (fromDateKey: string, toDateKey: string): Promise<number> => {
  const tasks = await db.tasks.where('date').equals(fromDateKey).toArray()
  if (tasks.length === 0) return 0

  const now = Date.now()
  let addedCount = 0

  for (const t of tasks) {
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
    const newTask: PlannerTask = {
      ...t,
      id: taskId,
      date: toDateKey,
      completed: false,
      createdAt: now,
      updatedAt: now
    }
    await db.tasks.add(newTask)
    await syncTaskToFirestore(newTask)
    addedCount++
  }

  return addedCount
}

export const bulkSetScheduleRepeat = async (dateKey: string, repeatOption: RepeatOption): Promise<number> => {
  const tasks = await db.tasks.where('date').equals(dateKey).toArray()
  if (tasks.length === 0) return 0

  const now = Date.now()
  for (const t of tasks) {
    const updated = {
      repeat: repeatOption,
      updatedAt: now
    }
    await db.tasks.update(t.id, updated)
    const updatedTask = await db.tasks.get(t.id)
    if (updatedTask) {
      await syncTaskToFirestore(updatedTask)
    }
  }

  return tasks.length
}

export const saveDateAsTemplate = async (dateKey: string, templateName: string): Promise<string> => {
  const tasks = await db.tasks.where('date').equals(dateKey).toArray()
  if (tasks.length === 0) throw new Error('No tasks found on this date to save as template.')

  // Sort tasks chronologically
  tasks.sort((a, b) => a.startTime.localeCompare(b.startTime))

  const items = tasks.map((t) => ({
    title: t.title,
    startTime: t.startTime,
    endTime: t.endTime,
    category: t.category,
    repeat: t.repeat,
    reminder: t.reminder,
    notes: t.notes
  }))

  const id = await createTemplate({
    name: templateName,
    description: `Saved schedule from ${dateKey}`,
    category: tasks[0]?.category || 'Personal',
    items
  })

  return id
}
