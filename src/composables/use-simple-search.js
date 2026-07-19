import {computed, watch, watchEffect} from 'vue'
import { debounce } from 'lodash'
import { useStore } from 'vuex'
import useApi from '@/composables/use-api'

const _baseApiURL = import.meta.env.VITE_ELASTICSEARCH_URL

export default function useSimpleSearch() {
  const store = useStore()
  const api = useApi()

  const searchState = computed(() => {
    const pid = store.state.search.activeProjectId
    if (!pid) return null
    return store.state.search.byProject[pid]
  })

  // ----------------------
  // DERIVED (safe)
  // ----------------------
  const isResourceSearch = computed(() => {
    const s = searchState.value
    if (!s) return false
    return !s.term || s.term.trim() === '' ? !!s.collectionId : false
  })

  const groupbyField = computed(() => {
    const s = searchState.value
    if (!s) return ''
    return !isResourceSearch.value && s.term ? 'resource_id' : ''
  })

  const withIds = computed(() => {
    const s = searchState.value
    if (!s) return 0
    return s.term?.trim() ? 10000 : 0
  })

  const pageCount = computed(() => {
    const s = searchState.value
    if (!s) return 0
    return Math.ceil((s.totalCount || 0) / (s.pageSize || 1))
  })

  // ----------------------
  // MUTATIONS
  // ----------------------
  const setSearchCollectionId = v => store.commit('search/setSearchCollectionId', v)
  const setNoHighlight = v => store.commit('search/setNoHighlight', v)
  const setTerm = v => store.commit('search/setSearchTerm', v)
  const setSearchFilter = ({ key, value }) => store.commit('search/setSearchFilter', { key, value })
  const setRange = (k, v) => store.commit('search/setSearchRange', { key: k, value: v })
  const setSorts = v => store.commit('search/setSearchSorts', v)
  const setPageNum = v => store.commit('search/setSearchPage', v)
  const setCollectionId = v => store.commit('search/setSearchActiveCollection', v)
  const setProject = v => store.commit('search/setSearchProject', v)
  const setIsFulltextSearch = v => store.commit('search/setSearchIsFulltextSearch', v)
  const setFacet = ({ facetType, value }) =>
    store.commit('search/setFacet', {
      facetType,
      value
  })

  const saveSnapshot = () => store.commit('search/saveSearchSnapshot')
  const restoreSnapshot = dir => store.commit('search/restoreSearchSnapshot', dir)

  // ----------------------
  // QUERY
  // ----------------------
  function updateQuery() {
    const s = searchState.value
    if (!s) return

    // let rangesArg = ''
    // for (const k in s.ranges) {
    //   rangesArg += `&range[${k}]=${s.ranges[k]}`
    // }
    let rangesArg = ''

    // Object.entries(s.ranges || {}).forEach(([field, range]) => {
    //   const params = []
    //
    //   if (range.gte != null) {
    //     params.push(`gte:${range.gte}`)
    //   }
    //
    //   if (range.lte != null) {
    //     params.push(`lte:${range.lte}`)
    //   }
    //
    //   if (params.length) {
    //     rangesArg += `&range[${field}]=${params.join(',')}`
    //   }
    // })
    Object.entries(s.ranges || {}).forEach(([field, range]) => {


  // ---------- intervalle historique ----------
  if (range.startField && range.endField) {

    if (range.lte != null) {
      rangesArg +=
        `&range[${range.startField}]=lte:${range.lte}`
    }

    if (range.gte != null) {
      rangesArg +=
        `&range[${range.endField}]=gte:${range.gte}`
    }

    return
  }


  // ---------- intervalle simple ----------
  if (range.gte != null || range.lte != null) {

    const params = []

    if (range.gte != null)
      params.push(`gte:${range.gte}`)

    if (range.lte != null)
      params.push(`lte:${range.lte}`)

    if (params.length) {
      rangesArg +=
        `&range[${field}]=${params.join(',')}`
    }

  }

})

    const sortArg = s.sorts ? `&sort=${s.sorts}` : ''
    const highlightArg = s.noHighlight ? '&no-highlight' : ''
    const termValue = !isResourceSearch.value ? (s.term || '***') : ''

    let groupbyArg = ''
    if (groupbyField.value) {
      groupbyArg = `&groupby[field]=${groupbyField.value}`
      if (withIds.value) groupbyArg += `&groupby[with-ids]=${withIds.value}`
      //if (s.afterKey) groupbyArg += `&groupby[after-page]=${s.afterKey}`
    }

    let afterArg = ''
    if (s.noHighlight === false && s.pageNum > 1) {
      afterArg = `&after=${s.afterKeys[s.pageNum - 1]}`
    }

    const collectionArg =
      s.collectionId || s.activeCollectionId
        ? `&collectionId=${s.collectionId || s.activeCollectionId}`
        : ''
    console.log('searchPage before api.setQuery',{
      term: s.term,
      's.activeCollectionId': s.activeCollectionId,
      's.collectionId': s.collectionId,
      isResourceSearch: isResourceSearch.value,
      termValue
    })

    // SEARCH FILTERS
    let filterArgs = ''

    const filters = Object.entries(s.filters || {})
      .filter(([, value]) => value)

    if (filters.length) {
      filterArgs =
        'filters=' +
        filters
          .map(([field, value]) =>
            `resource_metadata.dublincore.${field}:${encodeURIComponent(value)}`
          )
          .join(',')
    }

    // SEARCH FACETS
    let facetArgs = ''
    //10juillet2026 Object.entries(s.facets.selected).forEach(([facetType, values]) => {
    //   values.forEach(value => {
    //     facetArgs += `&${facetType}=[${encodeURIComponent(value)}]`
    //   })
    // })
    const selectedFacets = Object.fromEntries(
      Object.entries(s.facets.selected)
        .filter(([, values]) => values.length > 0)
    )

    if (Object.keys(selectedFacets).length) {

      facetArgs =
        `&facets=${encodeURIComponent(
          JSON.stringify(selectedFacets)
        )}`

    }

    api.setQuery(
      `${_baseApiURL}/search?query=${encodeURIComponent(termValue)}&${filterArgs}&page[number]=${s.pageNum}&page[size]=${s.pageSize}${sortArg}${highlightArg}${groupbyArg}${collectionArg}${facetArgs}${rangesArg}${afterArg}`
    )
    console.log('searchPage api.setQuery',{
      term: s.term,
      activeCollectionId: s.activeCollectionId,
      isResourceSearch: isResourceSearch.value,
      termValue
    })
    console.log('searchPage final query', `${_baseApiURL}/search?query=${encodeURIComponent(termValue)}&${filterArgs}&page[number]=${s.pageNum}&page[size]=${s.pageSize}${sortArg}${highlightArg}${groupbyArg}${collectionArg}${facetArgs}${rangesArg}${afterArg}`)
  }

  watch(
    () => [
      searchState.value?.term,
      searchState.value?.pageNum,
      searchState.value?.pageSize,
      searchState.value?.filters,
      searchState.value?.ranges,
      searchState.value?.sorts,
      searchState.value?.collectionId,
      searchState.value?.noHighlight,
      searchState.value?.afterKey,
      JSON.stringify(searchState.value?.facets?.selected),
    ],
    updateQuery,
    { immediate: true, deep: true }  // garde le comportement initial de watchEffect
  )

  // ----------------------
  // EXECUTE QUERY ---
  // ----------------------
  const execute = debounce(async () => {
    const pid = store.state.search.activeProjectId
    if (!pid) return

    store.commit('search/setSearchLoading', true)

    try {
      if (!api.query.value) return

      await api.runQuery()

      const _res = api.result.value
      console.log('searchPage API result:', _res)

      if (!_res) return

      // -----------------------------
      // NORMALISATION FORMAT BACKEND
      // -----------------------------

      const hasBuckets = Array.isArray(_res.buckets)
      console.log('searchPage hasBuckets ', hasBuckets)

      let res = {}

      if (hasBuckets) {
        res = {
          data: _res,
          buckets: _res.buckets || null,
          total_count: _res.total_count ?? _res['total-count'] ?? 0,
          bucket_count: _res.bucket_count ?? _res['bucket-count'] ?? null,
          after_key: _res.after_key ?? _res['after-key'] ?? null,
          facets: _res.facets ?? _res['facets'] ?? {},
          highlight_patterns: _res.highlight_patterns ?? [],
          temporal: _res.temporal ?? {}
        }
      } else {
        res = {
          data: _res.data,
          buckets: _res.buckets || null,
          total_count: _res.total_count ?? _res['total-count'] ?? 0,
          bucket_count: _res.bucket_count ?? _res['bucket-count'] ?? null,
          after_key: _res.after_key ?? _res['after-key'] ?? null,
          facets: _res.facets ?? _res['facets'] ?? {},
          highlight_patterns: _res.highlight_patterns ?? [],
          temporal: _res.temporal ?? {}
        }
      }

      console.log('searchPage result res: ', res)

      store.commit('search/setSearchResult', res)

    } catch (e) {
      console.error('search execute error', e)
    } finally {
      store.commit('search/setSearchLoading', false)
    }
  }, 150)

  // ----------------------
  // API EXPOSED
  // ----------------------
  return {
    term: computed(() => searchState.value?.term || ''),
    filters: computed(() => searchState.value?.filters || {}),
    ranges: computed(() => searchState.value?.ranges || {}),
    sorts: computed(() => searchState.value?.sorts || ''),
    pageNum: computed(() => searchState.value?.pageNum || 1),
    pageSize: computed(() => searchState.value?.pageSize || 25),

    result: computed(() => searchState.value?.result || []),
    openedFacets: computed(() => searchState.value?.openedFacets || []),
    facets: computed(() => searchState.value?.facets || {}),
    initialFacets: computed(() => searchState.value?.initialFacets || { available: {} }),
    temporal: computed(() => searchState.value?.temporal ?? []),
    initialTemporal: computed(() => searchState.value?.initialTemporal ?? {}),
    totalCount: computed(() => searchState.value?.totalCount || 0),
    bucketCount: computed(() => searchState.value?.bucketCount || null),
    loading: computed(() => searchState.value?.loading || false),

    isFulltextSearch: computed(() => searchState.value?.isFulltextSearch ?? true),
    isResultTableMode: computed(() => searchState.value?.isResultTableMode ?? true),

    pageCount,
    setNoHighlight,
    setTerm,
    setSearchFilter,
    setRange,
    setSorts,
    setPageNum,
    setSearchCollectionId,
    setCollectionId,
    setProject,
    setIsFulltextSearch,
    setFacet,

    saveSnapshot,
    restoreSnapshot,

    execute,

    error: computed(() => api.error.value)
  }
}