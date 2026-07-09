export interface ShoppingList {
  id: string
  name: string
  description?: string
  createdAt: number
  updatedAt: number
  isCompleted: number // 0 = active, 1 = completed
  synced: boolean
}

export interface ShoppingItem {
  id: string
  listId: string
  name: string
  quantity: number
  unit: string
  expectedPrice?: number
  actualPrice?: number
  purchased: boolean
  notes?: string
  createdAt: number
  updatedAt: number
  synced: boolean
  sortOrder: number // For manual drag sorting
}

export interface ShoppingTemplate {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  synced: boolean
}

export interface TemplateItem {
  id: string
  templateId: string
  name: string
  quantity: number
  unit: string
  notes?: string
}

export type ShoppingSortType = 'manual' | 'alpha' | 'purchased-last' | 'recent'

export interface ShoppingSettings {
  defaultSort: ShoppingSortType
  defaultUnit: string
  currency: string
  showEstimatedPrice: boolean
  showActualPrice: boolean
  confirmDelete: boolean
}
