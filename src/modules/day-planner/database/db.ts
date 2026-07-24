import Dexie, { type Table } from 'dexie'
import { PlannerTask, PlannerTemplate } from '../types'

export class DayPlannerDatabase extends Dexie {
  tasks!: Table<PlannerTask, string>
  templates!: Table<PlannerTemplate, string>

  constructor() {
    super('DayPlannerDatabase')
    this.version(1).stores({
      tasks: 'id, date, completed, category, createdAt',
      templates: 'id, name, createdAt'
    })
  }
}

export const db = new DayPlannerDatabase()
export default db
