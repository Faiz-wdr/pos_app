import Dexie, { type Table } from 'dexie'
import { ShoppingList, ShoppingItem, ShoppingTemplate, TemplateItem } from '../types'

class ShoppingDatabase extends Dexie {
  shoppingLists!: Table<ShoppingList, string>
  shoppingItems!: Table<ShoppingItem, string>
  shoppingTemplates!: Table<ShoppingTemplate, string>
  templateItems!: Table<TemplateItem, string>
  customUnits!: Table<{ name: string }, string>

  constructor() {
    super('ShoppingDatabase')
    this.version(3).stores({
      shoppingLists: 'id, name, createdAt, isCompleted, synced',
      shoppingItems: 'id, listId, name, purchased, synced, sortOrder',
      shoppingTemplates: 'id, name, createdAt, synced',
      templateItems: 'id, templateId, name',
      customUnits: 'name'
    })
  }
}

export const db = new ShoppingDatabase()
export default db
