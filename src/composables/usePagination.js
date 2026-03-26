// composables/usePagination.js
import { computed } from 'vue'

export function usePagination(items, initialPageSize, currentPage) {

  const totalPages = computed(() =>
    Math.ceil(items.value.length / initialPageSize.value)
  )

  const paginated = computed(() => {
    const start = (currentPage.value - 1) * initialPageSize.value
    return items.value.slice(start, start + initialPageSize.value)
  })

  return { totalPages, paginated }
}