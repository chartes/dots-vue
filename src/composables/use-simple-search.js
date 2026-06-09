import { reactive, readonly, ref, watchEffect, computed } from 'vue'
import { debounce } from 'lodash'
import useApi from '@/composables/use-api'

const _baseApiURL = `${import.meta.env.VITE_ELASTICSEARCH_URL}`

export default function useSimpleSearch () {
  const api = useApi()

  // --- STATE ---
  const term = ref('')
  const ranges = reactive({})
  const sorts = ref('')
  const pageNum = ref(1)
  const pageSize = ref(25)
  const result = ref([])
  const totalCount = ref(0)
  const bucketCount = ref(0)
  const afterKey = ref(null)
  const noHighlight = ref(false)
  const isFulltextSearch = ref(true)
  const collectionId = ref(null)
  const isResourceSearch = computed(() => {
    // si on a un terme, ce n’est pas une recherche resources
    if (term.value && term.value.trim() !== '') return false
    // si on a un collectionId et pas de term → resource search
    return !!collectionId.value
  })
  const groupbyField = computed(() => {
    return !isResourceSearch.value && term.value ? 'resource_id' : ''
  })

  const withIds = computed(() => {
    // Si on fait une recherche fulltext (terme présent) et qu’on veut récupérer tous les hits, on peut mettre 10000
    return term.value && term.value.trim() !== '' ? 10000 : 0
  })



  // --- COMPUTED ---
  const pageCount = computed(() => Math.ceil(totalCount.value / pageSize.value))

  // --- SETTERS ---
  const setIsFulltextSearch = (val) => { isFulltextSearch.value = val }
  const setTerm = (t) => { term.value = t }
  const setRange = (key, ops) => { ranges[key] = ops }
  const setSorts = (s) => { sorts.value = s }
  const setPageNum = (num) => { pageNum.value = num }
  const setNoHighlight = (b) => { noHighlight.value = b }
  const setGroupbyField = (field) => { groupbyField.value = field }
  const setWithIds = (flag) => { withIds.value = flag }
  const setCollectionId = (id) => {
    collectionId.value = id
    isResourceSearch.value = !!id
  }

  // --- BUILD QUERY ---
  function updateQuery () {

    // let filtersArg = ''
    // if (collectionId.value) {
    //   filtersArg += `&filters[path_ids]=${collectionId.value}`
    // }

    let rangesArg = ''
    for (const rangeName in ranges) {
      rangesArg += `&range[${rangeName}]=${ranges[rangeName]}`
    }

    let sortArg = sorts.value ? `&sort=${sorts.value}` : ''
    const highlightArg = noHighlight.value ? '&no-highlight' : ''
    const termValue = !isResourceSearch.value ? (term.value || '***') : ''

    let groupbyArg = ''
    if (groupbyField.value) {
      groupbyArg = `&groupby[field]=${groupbyField.value}`
      if (withIds.value) groupbyArg += `&groupby[with-ids]=${withIds.value}`
      if (afterKey.value) groupbyArg += `&groupby[after-page]=${afterKey.value}`
    }

    let collectionsArg = ''
    if (collectionId.value) {
      collectionsArg = `&collectionId=${collectionId.value}`
    }

    console.log('useSimpleSearch isResourceSearch.value collectionId.value', isResourceSearch.value, collectionId.value, groupbyArg)

    if (isResourceSearch.value && collectionId.value) {
      // --- mode Resource-only par collection ---
      // ✅ On passe collectionId au backend et backend injectera type.keyword=Resource + path_ids.keyword
      api.setQuery(
        `${_baseApiURL}/search?query=&page[number]=${pageNum.value}&page[size]=${pageSize.value}${sortArg}${rangesArg}${highlightArg}${collectionsArg}`
      )
    } else {
      // --- mode fulltext classique ---
      api.setQuery(
        `${_baseApiURL}/search?query=${encodeURIComponent(termValue)}${sortArg}&page[number]=${pageNum.value}&page[size]=${pageSize.value}${highlightArg}${groupbyArg}${collectionsArg}`
      )
    }
  }

  watchEffect(() => updateQuery(), { flush: 'post' })

  // --- EXECUTE QUERY ---
  const execute = debounce(async () => {
    if (!api.query.value) return

    await api.runQuery()

    if (api.error.value) {
      console.error('API error:', api.error.value)
      return
    }

    const _res = api.result.value
    console.log('API result:', api.result.value)

    if (groupbyField.value) {
      // --- GROUPED RESULTS ---
      result.value = _res.buckets || []
      totalCount.value = _res['total-count'] || 0
      bucketCount.value = _res['bucket-count'] || 0
      afterKey.value = _res['after-key'] || null
    } else {
      // --- PAGINATED RESULTS ---
      result.value = _res.data || []
      totalCount.value = _res['total-count'] || 0
      bucketCount.value = 0
      afterKey.value = null
    }
  }, 150)

  return {
    // state
    term: readonly(term),
    ranges: readonly(ranges),
    sorts: readonly(sorts),
    pageNum: readonly(pageNum),
    pageSize: readonly(pageSize),
    pageCount,
    result: readonly(result),
    totalCount: readonly(totalCount),
    bucketCount: readonly(bucketCount),
    afterKey: readonly(afterKey),
    noHighlight: readonly(noHighlight),
    isFulltextSearch: readonly(isFulltextSearch),

    // setters
    setTerm,
    setRange,
    setSorts,
    setPageNum,
    setNoHighlight,
    setGroupbyField,
    setWithIds,
    setIsFulltextSearch,
    setCollectionId,

    // actions
    execute,
    loading: readonly(api.loading),
    error: readonly(api.error)
  }
}