export interface SortOrderCase {
  description: string
  value: 'asc' | 'desc'
  label: string
}

export const sortOrderCases: SortOrderCase[] = [
  { description: 'Newest First', value: 'desc', label: 'Newest first' },
  { description: 'Oldest First', value: 'asc', label: 'Oldest first' },
]

export interface PageSizeCase {
  description: string
  value: number
}

export const pageSizeCases: PageSizeCase[] = [
  { description: '10 Items', value: 10 },
  { description: '30 Items', value: 30 },
  { description: '50 Items', value: 50 },
]

export const listControlsData = {
  defaultSortOrder: sortOrderCases[0].value,
  defaultPageSize: pageSizeCases[0].value,
}
