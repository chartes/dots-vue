import { ref, computed, watch } from 'vue'

export function useTable(dataSource, columns, options = {}) {
  const filters = ref({})
  const sort = ref({ key: null, direction: 'none' }) // none | asc | desc

  const {
    pageSize,
    currentPage,
    remote = ref(false),
    totalResults : remoteTotalResults = ref(0)
  } = options

  // Init dynamic filters
  watch(columns, (cols) => {
    if (!cols) return
    const f = {}
    cols.forEach(col => {
      if (col.type === 'range') {
        f[col.key] = { from: '', to: '' }
      } else {
        f[col.key] = ''
      }
    })
    filters.value = f
  }, { immediate: true })

  const getValue = (obj, path) => {
      const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.')

      const result = parts.reduce((acc, part) => {
        if (Array.isArray(acc)) {
          return acc.map(item => item?.[part])
        }
        return acc?.[part]
      }, obj)

      if (Array.isArray(result)) {
        return result.filter(v => v != null).join(', ')
      }
      return result
    }

  // Filtering
  const filtered = computed(() => {
    if (!columns?.value || columns.value.length === 0) return dataSource

    return dataSource.value.filter(row =>
      columns.value.every(col => {
        const value = getValue(row, col.key)

        if (col.type === 'range') {
          const { from, to } = filters.value[col.key] || {}
          if (from && value < Number(from)) return false
          if (to && value > Number(to)) return false
          return true
        }

        const search = filters.value[col.key]?.toLowerCase() || ''
        return String(value ?? '').toLowerCase().includes(search)
      })
    )
  })

  // Sorting
  const sorted = computed(() => {
    if (!sort.value.key || sort.value.direction === 'none') {
      return filtered.value
    }

    return [...filtered.value].sort((a, b) => {
      const aVal = getValue(a, sort.value.key)
      const bVal = getValue(b, sort.value.key)

      if (aVal == null) return 1
      if (bVal == null) return -1

      if (typeof aVal === 'number') {
        return sort.value.direction === 'asc'
          ? aVal - bVal
          : bVal - aVal
      }

      return sort.value.direction === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal))
    })
  })

  // Pagination
  // const totalPages = computed(() => {
  //   if (!pageSize.value) return 1
  //   return Math.ceil(sorted.value.length / pageSize.value)
  // })

  const totalPages = computed(() => {
    const total = remote.value
      ? remoteTotalResults.value
      : filtered.value.length

    return pageSize.value
      ? Math.ceil(total / pageSize.value)
      : 1
  })

  // const paginated = computed(() => {
  //   const start = (currentPage.value - 1) * pageSize.value
  //   return sorted.value.slice(start, start + pageSize.value)
  // })
  const paginated = computed(() => {
    if (remote.value) {
      return dataSource.value
    }

    const start = (currentPage.value - 1) * pageSize.value
    return sorted.value.slice(start, start + pageSize.value)
  })

  //const totalResults = computed(() => filtered.value.length)
  const totalResults = computed(() => {
    return remote.value
      ? remoteTotalResults.value
      : filtered.value.length
  })

  // Reset page when filters change
  watch(filters, () => {
    if (!remote.value) {
      currentPage.value = 1
    }
  }, { deep: true })

  return {
    filters,
    sort,
    currentPage,
    pageSize,
    totalPages,
    paginated,
    totalResults,
    getValue
  }
}