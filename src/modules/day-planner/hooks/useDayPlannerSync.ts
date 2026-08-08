import { useEffect } from 'react'
import { useAuth } from '@/core/firebase/hooks/useAuth'
import { db as firestoreDb } from '@/core/firebase/firestore'
import { collection, onSnapshot, doc, getDocs, setDoc } from 'firebase/firestore'
import { db as dexieDb } from '../database/db'
import { PlannerTask, PlannerTemplate } from '../types'
import { sanitizeForFirestore } from '../utils/firestoreUtils'

export const useDayPlannerSync = () => {
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    let unsubscribeTasks: (() => void) | null = null
    let unsubscribeTemplates: (() => void) | null = null
    let active = true

    const syncDayPlanner = async () => {
      try {
        const userId = user.uid

        // 1. Initial Sync for Tasks
        const localTasks = await dexieDb.tasks.toArray()
        const localTasksMap = new Map(localTasks.map(t => [t.id, t]))

        const tasksColRef = collection(firestoreDb, 'users', userId, 'tasks')
        const firestoreTasksSnapshot = await getDocs(tasksColRef)
        const firestoreTasksMap = new Map()

        for (const docSnap of firestoreTasksSnapshot.docs) {
          firestoreTasksMap.set(docSnap.id, docSnap.data() as PlannerTask)
        }

        // Bidirectional merge for tasks
        for (const [id, localTask] of localTasksMap) {
          const remoteTask = firestoreTasksMap.get(id)
          if (!remoteTask) {
            // Local exists but remote doesn't -> upload to firestore
            await setDoc(doc(firestoreDb, 'users', userId, 'tasks', id), sanitizeForFirestore(localTask))
          } else if (localTask.updatedAt > (remoteTask.updatedAt || 0)) {
            // Local is newer -> upload to firestore
            await setDoc(doc(firestoreDb, 'users', userId, 'tasks', id), sanitizeForFirestore(localTask))
          } else if ((remoteTask.updatedAt || 0) > localTask.updatedAt) {
            // Remote is newer -> update local Dexie
            await dexieDb.tasks.put(remoteTask)
          }
        }

        for (const [id, remoteTask] of firestoreTasksMap) {
          if (!localTasksMap.has(id)) {
            // Remote exists but local doesn't -> save to Dexie
            await dexieDb.tasks.put(remoteTask)
          }
        }

        // 2. Initial Sync for Templates
        const localTemplates = await dexieDb.templates.toArray()
        const localTemplatesMap = new Map(localTemplates.map(t => [t.id, t]))

        const templatesColRef = collection(firestoreDb, 'users', userId, 'templates')
        const firestoreTemplatesSnapshot = await getDocs(templatesColRef)
        const firestoreTemplatesMap = new Map()

        for (const docSnap of firestoreTemplatesSnapshot.docs) {
          firestoreTemplatesMap.set(docSnap.id, docSnap.data() as PlannerTemplate)
        }

        // Bidirectional merge for templates
        for (const [id, localTemplate] of localTemplatesMap) {
          const remoteTemplate = firestoreTemplatesMap.get(id)
          if (!remoteTemplate) {
            // Local exists but remote doesn't -> upload to firestore
            await setDoc(doc(firestoreDb, 'users', userId, 'templates', id), sanitizeForFirestore(localTemplate))
          } else if (localTemplate.updatedAt > (remoteTemplate.updatedAt || 0)) {
            // Local is newer -> upload to firestore
            await setDoc(doc(firestoreDb, 'users', userId, 'templates', id), sanitizeForFirestore(localTemplate))
          } else if ((remoteTemplate.updatedAt || 0) > localTemplate.updatedAt) {
            // Remote is newer -> update local Dexie
            await dexieDb.templates.put(remoteTemplate)
          }
        }

        for (const [id, remoteTemplate] of firestoreTemplatesMap) {
          if (!localTemplatesMap.has(id)) {
            // Remote exists but local doesn't -> save to Dexie
            await dexieDb.templates.put(remoteTemplate)
          }
        }

        if (!active) return

        // 3. Set up real-time listener for tasks
        unsubscribeTasks = onSnapshot(tasksColRef, (snapshot) => {
          snapshot.docChanges().forEach(async (change) => {
            const taskData = change.doc.data() as PlannerTask
            const taskId = change.doc.id
            if (change.type === 'added' || change.type === 'modified') {
              const localTask = await dexieDb.tasks.get(taskId)
              if (!localTask || taskData.updatedAt > localTask.updatedAt) {
                await dexieDb.tasks.put(taskData)
              }
            } else if (change.type === 'removed') {
              const localTask = await dexieDb.tasks.get(taskId)
              if (localTask) {
                await dexieDb.tasks.delete(taskId)
              }
            }
          })
        }, (error) => {
          console.error('Day Planner Firestore tasks onSnapshot error:', error)
        })

        // 4. Set up real-time listener for templates
        unsubscribeTemplates = onSnapshot(templatesColRef, (snapshot) => {
          snapshot.docChanges().forEach(async (change) => {
            const templateData = change.doc.data() as PlannerTemplate
            const templateId = change.doc.id
            if (change.type === 'added' || change.type === 'modified') {
              const localTemplate = await dexieDb.templates.get(templateId)
              if (!localTemplate || templateData.updatedAt > localTemplate.updatedAt) {
                await dexieDb.templates.put(templateData)
              }
            } else if (change.type === 'removed') {
              const localTemplate = await dexieDb.templates.get(templateId)
              if (localTemplate) {
                await dexieDb.templates.delete(templateId)
              }
            }
          })
        }, (error) => {
          console.error('Day Planner Firestore templates onSnapshot error:', error)
        })

      } catch (e) {
        console.error('Error during initial Day Planner Firestore sync:', e)
      }
    }

    syncDayPlanner()

    return () => {
      active = false
      if (unsubscribeTasks) unsubscribeTasks()
      if (unsubscribeTemplates) unsubscribeTemplates()
    }
  }, [user])
}
