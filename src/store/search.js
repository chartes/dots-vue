function createEmptySearchState() {
  console.trace('searchPage createEmptySearchState')
  console.log('searchPage SEARCH MODULE INSTANCE ID', Math.random())

  return {
    loading: false,

    term: '',
    filters: {},
    ranges: {},
    sorts: '',
    pageNum: 1,
    pageSize: 1000,

    result: [],
    bucketCount: null,
    afterKey: null,
    afterKeys: [
      null // page 1
    ],
    highlightPatterns: [],

    // FACETS
    openedFacets: [],
    initialFacets: {
      available: {}
    },
    facets: {
      available: {},
      selected: {}
    },
    initialTemporal: [],
    temporal: [],

    noHighlight: false,

    isFulltextSearch: false,
    isResultTableMode: true,

    collectionId: null,

    lastUpdated: 0
  }
}

function ensureProject(state, projectId) {
  if (!projectId) return null

  if (!state.byProject[projectId]) {
    state.byProject = {
      ...state.byProject,
      [projectId]: createEmptySearchState()
    }
  }

  return state.byProject[projectId]
}

function getProject(state) {
  if (!state.activeProjectId) return null
  return ensureProject(state, state.activeProjectId)
}

function invalidatePagination(s) {
  if (!s) return

  s.pageNum = 1
  s.afterKey = null
  s.afterKeys = [
    null // page 1
  ]
}

export default {
  namespaced: true,

  state: {
    activeProjectId: null,
    activeCollectionId: null,
    byProject: {},
    snapshots: {},
    snapshotIndex: {}
  },


  mutations: {
    setSearchProject(state, projectId) {
      state.activeProjectId = projectId
      ensureProject(state, projectId)
    },

    setSearchActiveCollection(state, id) {
      const s = getProject(state)

      if (s) {
        s.activeCollectionId = id
        invalidatePagination(s)
      }
    },

    setSearchCollectionId(state, v) {
      const s = getProject(state)

      if (!s || s.collectionId === v) return

      s.collectionId = v
      invalidatePagination(s)
    },

    setSearchLoading(state, v) {
      const s = getProject(state)
      if (s) s.loading = v
    },

    setNoHighlight(state, v) {
      const s = getProject(state)

      if (!s || s.noHighlight === v) return

      s.noHighlight = v
      invalidatePagination(s)
    },

    setSearchTerm(state, v) {
      const s = getProject(state)

      if (!s || s.term === v) return

      s.term = v
      invalidatePagination(s)
    },

    setFacetOpened(state, facetId) {
      const s = getProject(state)
      if (!s) return

      if (!s.openedFacets.includes(facetId)) {
        s.openedFacets.push(facetId)
      }
    },

    setFacetClosed(state, facetId) {
      const s = getProject(state)
      if (!s) return

      s.openedFacets =
        s.openedFacets.filter(id => id !== facetId)
    },

    setFacet(state, { facetType, value }) {
      const s = getProject(state)
      if (!s) return

      if (!s.facets.selected[facetType]) {
        s.facets.selected[facetType] = []
      }

      if (!s.facets.selected[facetType].includes(value)) {
        s.facets.selected[facetType].push(value)
        invalidatePagination(s)
      }
    },

    removeFacet(state, { facetType, facetKey }) {
      const s = getProject(state)
      if (!s || !s.facets.selected[facetType]) return

      const oldLength = s.facets.selected[facetType].length

      s.facets.selected[facetType] =
        s.facets.selected[facetType].filter(v => v !== facetKey)

      if (s.facets.selected[facetType].length === 0) {
        delete s.facets.selected[facetType]
      }

      if (s.facets.selected[facetType]?.length !== oldLength) {
        invalidatePagination(s)
      }
    },

    removeFacetType(state, facetType) {
      const s = getProject(state)
      if (!s || !s.facets.selected[facetType]) return

      delete s.facets.selected[facetType]

      invalidatePagination(s)
    },

    clearFacets(state) {
      const s = getProject(state)
      if (!s) return

      s.facets.selected = {}
      invalidatePagination(s)
    },

    setCollectionFacet(state, v) {
      const s = getProject(state)
      console.log('searchPage setCollectionFacet before', s.facets )

      if (!s) return

      s.facets = v
      invalidatePagination(s)
      console.log('searchPage setCollectionFacet after', s.facets )
    },

    setSearchFilter(state, { key, value }) {
      const s = getProject(state)
      if (!s) return

      if (!s.filters) s.filters = {}

      if (!value || value === '') {
        delete s.filters[key]
      } else {
        s.filters[key] = value
      }
      invalidatePagination(s)
    },

    setSearchRange(state, { key, value }) {
      const s = getProject(state)

      if (!s)
        return

      if (
        value == null ||
        (typeof value === 'object' && Object.keys(value).length === 0)
      ) {
        delete s.ranges[key]
        invalidatePagination(s)
        return
      }

      s.ranges[key] = value
      invalidatePagination(s)
    },

    removeSearchRange(state, key) {
      const s = getProject(state)
      if (!s) return

      delete s.ranges[key]

      invalidatePagination(s)
    },

    setSearchSorts(state, v) {
      const s = getProject(state)

      if (!s || s.sorts === v) return

      s.sorts = v
      invalidatePagination(s)
    },

    setSearchPage(state, v) {
      const s = getProject(state)
      if (!s) return
      s.pageNum = Math.max(1, Number(v) || 1)
    },

    setSearchIsFulltextSearch(state, v) {
      const s = getProject(state)

      if (!s || s.isFulltextSearch === v) return

      s.isFulltextSearch = v
      invalidatePagination(s)
    },

    setSearchResult(state, payload) {
      const s = getProject(state)
      if (!s) return

      s.result = payload.data || []
      s.totalCount = payload.total_count || 0
      s.bucketCount = payload.bucket_count || null
      s.afterKey = payload.after_key || null

      if (payload.after_key) {
        s.afterKeys[s.pageNum] = payload.after_key
      }

      s.highlightPatterns = payload.highlight_patterns || []
      s.temporal = payload.temporal || []

      // On ne mémorise les bornes initiales qu'une seule fois
      if (
        s.initialTemporal.length === 0 &&
        Array.isArray(payload.temporal)
      ) {
        s.initialTemporal = JSON.parse(
          JSON.stringify(payload.temporal)
        )
      }

      const available = payload.facets || {}

      // On mémorise les facettes initiales une seule fois
      if (
        Object.keys(s.initialFacets.available).length === 0 &&
        Object.keys(available).length > 0
      ) {
        s.initialFacets.available = JSON.parse(
          JSON.stringify(available)
        )
      }

      // Initialiser les sélections des nouvelles facettes
      Object.keys(available).forEach(facetType => {
        if (!s.facets.selected[facetType]) {
          s.facets.selected[facetType] = []
        }
      })

      s.facets.available = available

      s.lastUpdated = Date.now()
    },

    resetSearch(state, projectId) {
      state.byProject[projectId] = createEmptySearchState()
    },

    saveSearchSnapshot(state) {
      const pid = state.activeProjectId
      if (!pid) return

      const current = state.byProject[pid]

      if (!state.snapshots[pid]) {
        state.snapshots[pid] = []
        state.snapshotIndex[pid] = -1
      }

      state.snapshots[pid] =
        state.snapshots[pid].slice(0, state.snapshotIndex[pid] + 1)

      state.snapshots[pid].push(JSON.parse(JSON.stringify(current)))
      state.snapshotIndex[pid]++
    },

    restoreSearchSnapshot(state, dir) {
      const pid = state.activeProjectId
      if (!pid) return

      const history = state.snapshots[pid]
      if (!history) return

      let idx = state.snapshotIndex[pid]

      if (dir === 'back') idx--
      if (dir === 'forward') idx++

      if (idx < 0 || idx >= history.length) return

      state.snapshotIndex[pid] = idx
      state.byProject[pid] = JSON.parse(JSON.stringify(history[idx]))
    }
  }
}