import { db } from '../database/db'
import { generateUUID } from '../utils/uuid'
import { ShoppingList, ShoppingItem, TemplateItem } from '../types'

// --- LIST OPERATIONS ---

export const createShoppingList = async (name: string, description?: string): Promise<string> => {
  const id = generateUUID()
  const now = Date.now()
  await db.shoppingLists.add({
    id,
    name,
    description,
    createdAt: now,
    updatedAt: now,
    isCompleted: 0,
    synced: false
  })
  return id
}

export const updateShoppingList = async (id: string, updates: Partial<ShoppingList>): Promise<void> => {
  await db.shoppingLists.update(id, {
    ...updates,
    updatedAt: Date.now(),
    synced: false
  })
}

export const completeShoppingList = async (id: string): Promise<void> => {
  await db.shoppingLists.update(id, {
    isCompleted: 1,
    updatedAt: Date.now(),
    synced: false
  })
}

export const deleteShoppingList = async (id: string): Promise<void> => {
  await db.transaction('rw', db.shoppingLists, db.shoppingItems, async () => {
    // Delete all items under this list first
    await db.shoppingItems.where('listId').equals(id).delete()
    // Delete list itself
    await db.shoppingLists.delete(id)
  })
}

export const duplicateShoppingList = async (id: string, newName?: string): Promise<string> => {
  return await db.transaction('rw', db.shoppingLists, db.shoppingItems, async () => {
    const list = await db.shoppingLists.get(id)
    if (!list) throw new Error('List not found')

    const newListId = generateUUID()
    const now = Date.now()

    // Add new list card metadata
    await db.shoppingLists.add({
      id: newListId,
      name: newName || `${list.name} (Copy)`,
      description: list.description,
      createdAt: now,
      updatedAt: now,
      isCompleted: 0,
      synced: false
    })

    // Fetch and duplicate all original items
    const items = await db.shoppingItems.where('listId').equals(id).toArray()
    for (const item of items) {
      await db.shoppingItems.add({
        id: generateUUID(),
        listId: newListId,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        expectedPrice: item.expectedPrice,
        actualPrice: item.actualPrice,
        purchased: false, // Reset purchase status when duplicating
        notes: item.notes,
        createdAt: now,
        updatedAt: now,
        synced: false,
        sortOrder: item.sortOrder
      })
    }

    return newListId
  })
}

// --- ITEM OPERATIONS ---

export const addShoppingItem = async (
  item: Omit<ShoppingItem, 'id' | 'createdAt' | 'updatedAt' | 'synced' | 'sortOrder' | 'purchased'>
): Promise<string> => {
  const id = generateUUID()
  const now = Date.now()

  // Find max sort order in current list to place item at bottom
  const items = await db.shoppingItems.where('listId').equals(item.listId).toArray()
  const maxOrder = items.reduce((max, i) => Math.max(max, i.sortOrder), -1)

  await db.shoppingItems.add({
    ...item,
    id,
    createdAt: now,
    updatedAt: now,
    synced: false,
    purchased: false,
    sortOrder: maxOrder + 1
  })

  // Bump parent list update timestamp
  await updateShoppingList(item.listId, {})
  return id
}

export const updateShoppingItem = async (id: string, updates: Partial<ShoppingItem>): Promise<void> => {
  const item = await db.shoppingItems.get(id)
  if (!item) return

  await db.shoppingItems.update(id, {
    ...updates,
    updatedAt: Date.now(),
    synced: false
  })

  // Bump parent list update timestamp
  await updateShoppingList(item.listId, {})
}

export const deleteShoppingItem = async (id: string): Promise<void> => {
  const item = await db.shoppingItems.get(id)
  if (!item) return

  await db.shoppingItems.delete(id)
  await updateShoppingList(item.listId, {})
}

// --- TEMPLATE OPERATIONS ---

export const createTemplateFromList = async (listId: string, name: string): Promise<string> => {
  return await db.transaction('rw', db.shoppingTemplates, db.templateItems, db.shoppingItems, async () => {
    const templateId = generateUUID()
    const now = Date.now()

    await db.shoppingTemplates.add({
      id: templateId,
      name,
      createdAt: now,
      updatedAt: now,
      synced: false
    })

    const items = await db.shoppingItems.where('listId').equals(listId).toArray()
    for (const item of items) {
      await db.templateItems.add({
        id: generateUUID(),
        templateId,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        notes: item.notes
      })
    }

    return templateId
  })
}

export const createTemplateDirectly = async (name: string): Promise<string> => {
  const id = generateUUID()
  const now = Date.now()
  await db.shoppingTemplates.add({
    id,
    name,
    createdAt: now,
    updatedAt: now,
    synced: false
  })
  return id
}

export const addTemplateItem = async (
  item: Omit<TemplateItem, 'id'>
): Promise<string> => {
  const id = generateUUID()
  await db.templateItems.add({
    ...item,
    id
  })
  return id
}

export const deleteTemplate = async (id: string): Promise<void> => {
  await db.transaction('rw', db.shoppingTemplates, db.templateItems, async () => {
    await db.templateItems.where('templateId').equals(id).delete()
    await db.shoppingTemplates.delete(id)
  })
}

export const instantiateTemplate = async (
  templateId: string,
  listName: string,
  description?: string
): Promise<string> => {
  return await db.transaction('rw', db.shoppingLists, db.shoppingItems, db.templateItems, async () => {
    const listId = generateUUID()
    const now = Date.now()

    await db.shoppingLists.add({
      id: listId,
      name: listName,
      description,
      createdAt: now,
      updatedAt: now,
      isCompleted: 0,
      synced: false
    })

    const items = await db.templateItems.where('templateId').equals(templateId).toArray()
    let order = 0
    for (const item of items) {
      await db.shoppingItems.add({
        id: generateUUID(),
        listId,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        purchased: false,
        notes: item.notes,
        createdAt: now,
        updatedAt: now,
        synced: false,
        sortOrder: order++
      })
    }

    return listId
  })
}

// --- CUSTOM UNITS ---

export const addCustomUnit = async (name: string): Promise<void> => {
  const trimmed = name.trim()
  if (!trimmed) return
  const exists = await db.customUnits.get(trimmed)
  if (!exists) {
    await db.customUnits.add({ name: trimmed })
  }
}
