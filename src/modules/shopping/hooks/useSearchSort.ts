import { useMemo } from 'react'
import { ShoppingItem, ShoppingSortType } from '../types'

interface SearchSortOptions {
  items: ShoppingItem[] | undefined
  searchQuery: string
  sortBy: ShoppingSortType
  filterBy: 'all' | 'remaining' | 'purchased'
}

export const useSearchSort = ({ items, searchQuery, sortBy, filterBy }: SearchSortOptions) => {
  return useMemo(() => {
    if (!items) return []

    // 1. Search filter
    let result = items
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.notes?.toLowerCase().includes(q) ||
          item.unit.toLowerCase().includes(q)
      )
    }

    // 2. Tab filter
    if (filterBy === 'remaining') {
      result = result.filter((item) => !item.purchased)
    } else if (filterBy === 'purchased') {
      result = result.filter((item) => item.purchased)
    }

    // 3. Sorting logic
    result = [...result]
    result.sort((a, b) => {
      // General rule: Purchased items move to the bottom, keeping them sorted within their sub-groups
      if (a.purchased !== b.purchased) {
        return a.purchased ? 1 : -1
      }

      if (sortBy === 'alpha') {
        return a.name.localeCompare(b.name)
      }
      if (sortBy === 'recent') {
        return b.createdAt - a.createdAt
      }
      // 'manual' or 'purchased-last' falls back to sortOrder
      return a.sortOrder - b.sortOrder
    })

    return result
  }, [items, searchQuery, sortBy, filterBy])
}
export default useSearchSort
