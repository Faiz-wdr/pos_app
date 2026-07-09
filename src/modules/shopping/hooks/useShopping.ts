import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../database/db'

export const useShoppingListsWithCounts = (isCompleted: boolean) => {
  return useLiveQuery(async () => {
    // Query list cards
    const lists = await db.shoppingLists
      .where('isCompleted')
      .equals(isCompleted ? 1 : 0)
      .toArray()

    // Sort descending by createdAt
    lists.sort((a, b) => b.createdAt - a.createdAt)

    const listsWithCounts = []
    for (const list of lists) {
      const items = await db.shoppingItems.where('listId').equals(list.id).toArray()
      
      const totalItems = items.length
      const purchasedCount = items.filter((i) => i.purchased).length
      const remainingCount = totalItems - purchasedCount
      
      // Calculate estimated total
      const estimatedTotal = items.reduce((sum, item) => {
        return sum + (item.quantity * (item.expectedPrice || 0))
      }, 0)

      // Calculate actual total
      const actualTotal = items.reduce((sum, item) => {
        const price = item.purchased 
          ? (item.actualPrice !== undefined ? item.actualPrice : (item.expectedPrice || 0))
          : (item.expectedPrice || 0)
        return sum + (item.quantity * price)
      }, 0)

      listsWithCounts.push({
        ...list,
        totalItems,
        purchasedCount,
        remainingCount,
        estimatedTotal,
        actualTotal
      })
    }
    return listsWithCounts
  }, [isCompleted])
}

export const useShoppingList = (id: string) => {
  return useLiveQuery(async () => {
    return await db.shoppingLists.get(id)
  }, [id])
}

export const useShoppingItems = (listId: string) => {
  return useLiveQuery(async () => {
    return await db.shoppingItems.where('listId').equals(listId).toArray()
  }, [listId])
}

export const useTemplates = () => {
  return useLiveQuery(async () => {
    const templates = await db.shoppingTemplates.toArray()
    templates.sort((a, b) => b.createdAt - a.createdAt)
    
    const templatesWithCounts = []
    for (const t of templates) {
      const itemsCount = await db.templateItems.where('templateId').equals(t.id).count()
      templatesWithCounts.push({
        ...t,
        itemsCount
      })
    }
    return templatesWithCounts
  })
}

export const useCustomUnits = () => {
  return useLiveQuery(async () => {
    const units = await db.customUnits.toArray()
    return units.map((u) => u.name)
  })
}
