<template>
  <!-- PAGINATION TOP -->
  <Pagination
    v-model="currentPage"
    :total-pages="totalPages"
    :is-table-loading="isTableLoading"
    :documents-count-text="resultsSummaryText"
  />
  <div
    class="list-mode-wrapper"
    :class="totalPages > 1 ? 'with-bottom-pagination' : 'without-bottom-pagination'"
  >
    <ul
      class="tree list-mode"
      :style="{ '--grid-template-columns': gridTemplateColumns }"
    >
      <!-- HEADER -->
      <li class="list-header">
        <div class="li container header">
          <!-- ============================= -->
          <!-- ELASTIC SEARCH / HIGHLIGHTS   -->
          <!-- ============================= -->
          <template v-if="isElasticSearch">
            <div
              v-for="col in columns"
              :key="col.key"
              class="cell header-cell search"
            >
              <div class="cell header-cell-fields">
                <SortIcon
                  class="icons"
                  :state="sort.key === col.key ? sort.direction : 'none'"
                  :type="col.type || 'string'"
                  fg-color="white"
                  :size="32"
                  @click="toggleSort(col)"
                />
                <span>{{ col.label }}</span>
              </div>
            </div>
            <!-- Chevron column -->
            <div
              v-if="isHighlights"
              class="cell header-cell chevron-header-cell"
            />
          </template>
          <!-- ============================= -->
          <!-- NORMAL                        -->
          <!-- ============================= -->
          <template v-else>
            <div
              v-for="col in columns"
              :key="col.key"
              class="cell header-cell"
            >
              <span>{{ col.label }}</span>

              <div class="cell header-cell-fields">
                <!-- SORT -->
                <SortIcon
                  class="icons"
                  :state="sort.key === col.key ? sort.direction : 'none'"
                  :type="col.type || 'string'"
                  fg-color="white"
                  :size="32"
                  @click="toggleSort(col)"
                />

                <!-- FILTER -->
                <div
                  v-if="!col.type || col.type !== 'range'"
                  class="input-wrapper"
                >
                  <input
                    v-model="filters[col.key]"
                    class="filter"
                    type="text"
                    @click.stop
                  >
                  <svg
                    v-if="filters[col.key]"
                    class="clear-icon"
                    viewBox="0 0 24 24"
                    @click.stop="filters[col.key] = ''"
                  >
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                </div>

                <!-- RANGE FILTER -->
                <div
                  v-else
                  class="range-filter"
                  @click.stop
                >
                  <div class="input-wrapper">
                    <input
                      v-model="filters[col.key].from"
                      type="number"
                      placeholder="de"
                    >
                    <svg
                      v-if="filters[col.key].from"
                      class="clear-icon"
                      viewBox="0 0 24 24"
                      @click.stop="filters[col.key].from = ''"
                    >
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                  </div>
                  <div class="input-wrapper">
                    <input
                      v-model="filters[col.key].to"
                      type="number"
                      placeholder="à"
                    >
                    <svg
                      v-if="filters[col.key].to"
                      class="clear-icon"
                      viewBox="0 0 24 24"
                      @click.stop="filters[col.key].to = ''"
                    >
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </li>

      <!-- LOADING -->
      <template v-if="isTableLoading">
        <li v-for="n in 5" :key="n">
          <div class="li container row">
            <div
              v-for="col in columns"
              :key="col.key"
              class="cell"
            >
              <div class="skeleton"/>
            </div>
          </div>
        </li>
      </template>

      <!-- ROWS -->
      <template v-else>

        <!-- 🔍 MODE SEARCH HIGHLIGHTS RESULTS -->
        <template v-if="isHighlights && bucketsCount > 0">

          <template v-for="item in paginated" :key="item.identifier">

            <!-- ROW principale -->
            <li>
              <div
                class="li container row"
                :class="{ 'is-selected': isOpen(item.identifier) }"
                @click="toggle(item.identifier)"
              >
                <!-- DONNÉES -->
                <div
                  v-for="col in columns"
                  :key="col.key"
                  class="cell"
                >
                  <a
                    href="#"
                    @click.prevent
                  >
                    {{ getRowValue(item, col.key) }}
                  </a>
                </div>
                <!-- CHEVRON -->
                <div class="cell" :class="isOpen(item.identifier) ? 'chevron-down' : 'chevron-up'">
                  <a
                    href="#"
                    :aria-expanded="isOpen(item.identifier)"
                    aria-label="Afficher les résultats"
                    @click.stop.prevent="toggle(item.identifier)"
                  >
                  </a>
                </div>
              </div>
            </li>

            <!-- ROW détails -->
            <li v-if="isOpen(item.identifier)">
              <div class="li container row-details">
                <div class="cell" :style="{ gridColumn: '1 / -1' }">
                  <ul class="hits-list">
                    <li
                      v-for="hit in item.hits"
                      :key="hit.passageId"
                    >
                      <router-link :to="hit.passageUrl">
                        {{ buildBreadcrumb(hit) }}
                      </router-link>
                      <ul v-if="hit.highlight?.content">
                        <li
                          v-for="phrase in hit.highlight.content"
                          :key="phrase"
                        >
                          <span v-html="phrase"></span>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </div>
              </div>
            </li>
          </template>
        </template>

        <!-- NON SEARCH MODE -->
        <template v-else>
          <li
            v-for="item in paginated"
            :key="item.identifier"
          >
            <div
              class="li container row"
              @click="goToPageTable(item, $event)"
            >
              <div
                v-for="col in columns"
                :key="col.key"
                class="cell"
              >
                <a :href="getTableHref(item)">
                  {{ getRowValue(item, col.key) }}
                </a>
              </div>
            </div>
          </li>
        </template>

      </template>
    </ul>
  </div>
  <!-- PAGINATION BOTTOM -->
  <Pagination
    v-if="totalPages > 1"
    v-model="currentPage"
    :total-pages="totalPages"
    :is-table-loading="isTableLoading"
    documents-count-text=""
    class="pagination-bottom"
  />
</template>

<script>
import { ref, computed, watch } from 'vue'
import { router } from '@/router'
import store from '@/store'
import { useTable } from '@/composables/useTable.js'

import SortIcon from '@/assets/images/SortIcon.vue'
import Pagination from '@/components/Pagination.vue'
import useSimpleSearch from '@/composables/use-simple-search'


export default {
name: 'CollectionTOC',
  methods: { router },
  components: {
    SortIcon,
    Pagination
  },

  props: {
    data: { type: Array, required: true },
    columnsConfig: { type: Array, required: true },
    currentPage: { type: Number, default: 1 },
    pageSize: { type: Number, default: 10 },
    isDocProjectIdIncluded: Boolean,
    rootCollectionIdentifier: String,
    counts: { type: Number },
    isElasticSearch: Boolean,
    totalBuckets: { type: Number },
    isTableLoading: Boolean,
    isWithHighlights: Boolean
  },
  emits: [
    'sort-change'
  ],

  setup(props, { emit }) {
    const isDocProjectIdInc = computed(() => props.isDocProjectIdIncluded)
    // STATE
    const currentPage = ref(props.currentPage)
    const dataSource = computed(() => props.data || [])
    const isTableLoading = computed(() => props.isTableLoading)
    const pageSize = ref(props.pageSize)
    const resultsCounts = computed(() => props.counts)
    const isElasticSearch = computed(() => props.isElasticSearch || false)
    const bucketsCount = computed(() => props.totalBuckets)

    // TABLE
    const isHighlights = computed(() => props.isWithHighlights)

    const openRows = ref([])

    const toggle = (id) => {
      if (openRows.value.includes(id)) {
        openRows.value = openRows.value.filter(i => i !== id)
      } else {
        openRows.value.push(id)
      }
    }

    const isOpen = (id) => openRows.value.includes(id)

    const columns = computed(() => {
      const baseCols = (props.columnsConfig || []).filter(Boolean)

      if (isHighlights.value && bucketsCount?.value > 0) {
        return [
          ...baseCols,
        ]
      }
      return baseCols

    })

    //const table = useTable(dataSource, columns, pageSize, currentPage)
    const remoteTotalResults = computed(() =>
      isHighlights.value && bucketsCount.value > 0
        ? bucketsCount.value
        : resultsCounts.value
    )

    const table = useTable(dataSource, columns, {
      pageSize,
      currentPage,
      remote: isElasticSearch,
      totalResults: remoteTotalResults
    })

    // FILTERS INIT
    const filters = computed({
      get: () => table.filters.value,
      set: (val) => (table.filters.value = val)
    })

    // SORT
    const sort = computed(() => table.sort.value)

    // DATA
    const totalPages = computed(() => table.totalPages.value)
    const totalResults = computed(() => table.totalResults.value)
    const getValue = computed(() => table.getValue)
    const paginated = computed(() => table.paginated.value)

    const getRowValue = (row, key) => {

      const value = table.getValue(row, key)

      const col = columns.value.find(col => col.key === key)

      if (isElasticSearch.value) {
        // En mode search les colonnes de type date sont
        // soumises à la validation temporelle.
        if (col?.type !== 'date') {
          return value
        }

        const match = key.match(/^dublinCore\.(.+)$/i)

        if (!match) {
          return value
        }

        const field = match[1]

        const start = table.getValue(
          row,
          `temporal.dublincore.${field}_start`
        )

        const end = table.getValue(
          row,
          `temporal.dublincore.${field}_end`
        )

        // La normalisation n'a pas produit les deux bornes :
        // on n'affiche pas la date.
        if (start == null || end == null) {
          return ''
        }
      }

      return value
    }

    const search = useSimpleSearch()

    watch(currentPage, async (page) => {
      if (isElasticSearch.value) {
        store.commit('search/setSearchPage', page < 1 ? 1 : page)

        await search.execute()
      }
    })

    watch(
      () => props.currentPage,
      page => {
        currentPage.value = page
      }
    )

    watch(() => columns.value, (cols) => {
      if (!cols?.length) return

      const initialFilters = {}
      cols.forEach(col => {
        initialFilters[col.key] = col.type === 'range'
          ? { from: '', to: '' }
          : ''
      })

      table.filters.value = initialFilters
    }, { immediate: true })

    // TEXT
    const documentCount = computed(() => {
      //console.log('ResoucesList resultsCounts.value', resultsCounts.value)
      return isHighlights.value && bucketsCount?.value > 0
        ? (bucketsCount?.value ?? 0)
        : resultsCounts.value
    })

    const passageCount = computed(() => {
      return isHighlights.value && bucketsCount?.value > 0
        ? resultsCounts.value
        : null
    })

    const resultsSummaryText = computed(() => {
      const docs = documentCount.value
      const passages = passageCount.value

      const docLabel = docs > 1 ? 'ressources' : 'ressource'

      // Cas simple : pas de highlights OU aucun passage
      if (!isHighlights.value || passages === null) {
        return `${docs} ${docLabel}`
      }

      const passageLabel = passages > 1 ? 'passages' : 'passage'

      return `${docs} ${docLabel} (${passages} ${passageLabel})`
    })

    const toggleSort = (col) => {
      if (sort.value.key !== col.key) {
        sort.value.key = col.key
        sort.value.direction = 'asc'
      } else {
        switch (sort.value.direction) {
          case 'none':
            sort.value.direction = 'asc'
            break
          case 'asc':
            sort.value.direction = 'desc'
            break
          case 'desc':
            sort.value.direction = 'none'
            sort.value.key = null
            break
        }
      }

      emit('sort-change', {
        key: sort.value.key,
        direction: sort.value.direction,
        column: col
      })
    }

    // DYNAMIC COLUMNS CSS
    const gridTemplateColumns = computed(() => {
      const cols = columns.value || []
      const chevronWidth = '40px'

      if (!cols.length) {
        return chevronWidth
      }

      const widths = cols.some(col => col.width)
        ? cols.map(col => col.width || '1fr')
        : Array(cols.length).fill('1fr')

      if (isHighlights.value) {
        return [...widths, chevronWidth].join(' ')
      } else {
        return [...widths].join(' ')
      }
    })

    // DOCUMENT BREADCRUMB
    const formatCiteType = (str) => str?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

    const getLabel = (item) => {
      if (!item) return null
      return item.title || formatCiteType(item.citeType)
    }

    const buildBreadcrumb = (hit) => {
      const parts = [
        ...(hit.ancestors || []).map(getLabel),
        getLabel(hit)
      ].filter(Boolean)

      if (!parts || parts.length === 0) {
        return 'Document entier'
      }
      //console.log('ResourcesList buildbreadcrumb hit.ancestors parts : ', hit.ancestors, parts, hit)
      return parts.filter(Boolean).join(' > ')
    }


    // NAVIGATION
    const setStateCollection = (collId) => {
      store.commit('setCollectionId', collId)
    }

    const buildSearchDocumentRoute = (resId, passId) => {
      if (isDocProjectIdInc.value) {
        return {
          name: 'Document',
          params: {
            collId: store.state.collectionId,
            id: resId
          },
          query: {
            refId: passId
          }
        }
      }
      return {
        name: 'Document',
        params: { id: resId }
      }
    }

    const getSearchTableHref = (resId, passId) => {
      const to = buildSearchDocumentRoute(resId, passId)
      console.log('getSearchTableHref', to)
      console.log('getSearchTableHref resId, passId', resId, passId)
      return router.resolve(to).href
    }

    const buildDocumentRoute = (item) => {
      if (props.isDocProjectIdIncluded) {
        return {
          name: 'Document',
          params: {
            collId: item.projectIdentifier,
            id: item.identifier
          }
        }
      }
      return {
        name: 'Document',
        params: { id: item.identifier }
      }
    }

    const getTableHref = (item) => {
      const to = buildDocumentRoute(item)
      return router.resolve(to).href
    }

    const goToPageTable = async (item, event) => {
      if (
        event?.metaKey ||
        event?.ctrlKey ||
        event?.shiftKey ||
        event?.button === 1
      ) return

      event.preventDefault()
      setStateCollection(item.parent)
      await router.push(buildDocumentRoute(item))
    }

    return {
      currentPage,
      dataSource,
      resultsCounts,
      bucketsCount,
      isHighlights,
      openRows,
      toggle,
      isOpen,
      columns,
      table,
      filters,
      sort,
      totalPages,
      totalResults,
      getValue,
      getRowValue,
      paginated,
      resultsSummaryText,
      toggleSort,
      setStateCollection,
      buildDocumentRoute,
      buildBreadcrumb,
      getTableHref,
      getSearchTableHref,
      goToPageTable,
      gridTemplateColumns
    }
  }
}
</script>
<style scoped>

.pagination {
  padding-bottom: 20px;
  margin-bottom: 18px;
}

.pagination-bottom {
  padding-top: 20px;
}

.list-mode .pagination-bottom {
  border-bottom: none;
}

/* GLOBAL */
.list-mode {
  width: 100%;
  display: block;
  --row-gap: 0px;
  --column-gap: 60px;
}
.list-mode-wrapper {
  width: 100%;
  border-bottom: 4px solid var(--fill-color);
}

.list-mode-wrapper.without-bottom-pagination {
  margin-bottom: 98px;
}

.list-mode .tree {
  padding-bottom: 36px;
}

.list-header {
  margin-bottom: 15px;
}


.list-mode li::before {
  display: none !important;
}

/* HEADER + ROWS */
.list-mode .container {
  max-width: none !important;
}

.list-mode .li.container {
  display: grid;
  grid-template-columns: var(--grid-template-columns);
  align-items: center;
  width: 100%;
  gap: var(--row-gap) var(--column-gap);

  font-family: var(--font-primary), sans-serif;
  font-size: var(--font-default-size);
  font-weight: 500;
  line-height: 1.5;
  color: #000000;
}

/* HEADER */
.list-mode .header {
  font-weight: 500;
  padding: 20px 0;
}

/* HEADER CELL */
.list-mode .header-cell {
  display: flex;
  flex-direction: column;
  font-weight: 500 !important;
}
.list-mode .header-cell > span {
  display: block;
  border-bottom: 3px solid #DCDCDC;
  margin-bottom: 15px;
}

.list-mode .header-cell-fields {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;

  cursor: pointer;

  font-weight: 500 !important;
}

.list-mode .header-cell.search {
  border-bottom: 3px solid #DCDCDC;
  padding-bottom: 3px;
  margin-bottom: 15px;
}

/* ROW */
.list-mode .row {
  width: 100%;
  padding: 15px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

/* HOVER */
.list-mode .row:hover {
  background: #fafafa;
}

/* HIGHLIGHTS OPENED */
.list-mode .row.is-selected {
  background-color: #e3e3e3;
}

/* CELLS */
.list-mode .cell {
  /*
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0; /* important for ellipsis */
}

.list-mode .cell a {
  font-size: var(--font-default-size);
  font-weight: 400;
  color: #000000;

  &:hover {
    text-decoration: var(--text-decoration-hover);
  }
}

.list-mode .cell a:empty {
  display: none;
}

.list-mode .cell:nth-child(2n) a {
  color: #989898;
}

.list-mode .cell:nth-child(2n + 1) a {
  color: #000000;
}

.list-mode .cell .hits-list {
  padding-left: 1rem;
  list-style-type: none;
  margin: 0;
  background-color: #f1f1f1;
}

.list-mode .cell .hits-list > li {
  margin-bottom: 1rem;
}
.list-mode .cell .hits-list > li:first-child {
  padding-top: 1rem;
}
.list-mode .cell .hits-list > li:last-child {
  margin-bottom: 0; /* pas de margin sur le dernier */
}

.list-mode .cell .hits-list > li > a {
  font-weight: 600;
  color: #004085;
  text-decoration: underline;
  cursor: pointer;
  word-break: break-word;
}

.list-mode .cell .hits-list > li > a:hover {
  color: #002752;
  text-decoration: none;
}

.list-mode .cell .hits-list > li > ul {
  margin-top: 0.25rem;
  padding-left: 1rem;
  list-style-type: disc;
}

.list-mode .cell .hits-list > li > ul > li {
  margin-bottom: 0.3rem;
  color: #333;
  line-height: 1.4;
}

.list-mode .cell .hits-list > li > ul > li > span {
  display: block;
  width: 100%;
  word-break: break-word;
  &:deep(mark) {
    border-left: none;
    background-color: #ffe066;
  }
}

.list-mode .cell .hits-list > li > ul > li:last-child {
  margin-bottom: 0; /* pas de margin sur le dernier */
}

.list-mode .cell .hits-list em {
  background-color: #ffe066 !important;
  font-weight: bold;
}

.list-mode .cell.chevron-down a,
.list-mode .cell.chevron-up a {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  text-decoration: none !important;
  border-bottom: none !important;
}

.list-mode .cell.chevron-down a:hover,
.list-mode .cell.chevron-up a:hover {
  background-color: transparent !important;
  text-decoration: none !important;
}

.list-mode .cell.chevron-up a::before,
.list-mode .cell.chevron-down a::before {
  content: "";
  display: inline-block;
  width: 27px;
  height: 20px;
  transform-origin: 50%;
}

.list-mode .cell.chevron-up a::before {
  background: url(../assets/images/chevron_rouge.svg) center / contain no-repeat;
}

.list-mode .row.is-selected .cell.chevron-down a::before {
  background: url(../assets/images/croix.svg) center / contain no-repeat;
}

/* FILTER */
.list-mode .filter {
  width: 100%;
}

.list-mode .input-wrapper {
  position: relative;
  display: block;
  width: 100%;
}

.list-mode .filter,
.list-mode .range-filter input {
  height: auto;
  padding: 7px 28px 7px 6px; /* space for icon */
  font-family: var(--font-primary), sans-serif;
  font-weight: 400;
  font-size: 18px;
  line-height: 1;
  border: 1px solid #cecece;
  border-radius: 4px;
  outline: none;
  width: 100%;

  &:focus {
    border-color: var(--fill-color);
  }
}

.list-mode .clear-icon {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  cursor: pointer;
  stroke: white;
  stroke-width: 2;
  fill: var(--fill-color);
}

/* RANGE */
.list-mode .range-filter {
  display: flex;
  gap: 10px;
}

.list-mode .range-filter .input-wrapper {
  width: 50%;
}

/* ICON */
.list-mode .icons {
  display: flex;
  flex-direction: column;
  width: 38px;
  height: 38px;
  min-width: 38px;
  min-height: 38px;
  font-size: 10px;
  color: white;
}

/* CLEAN TREE STUFF */
.list-mode .toc-toggle {
  display: none;
}

.list-mode .is-tree-opened {
  display: none;
}

.list-mode li {
  margin-left: 0 !important;
  list-style: none;
  padding: 1px 0 !important;
}

.list-mode li .container .cell:first-child {
  /* padding-left: 5px; */
}

.list-mode .menu {
  padding: 0 !important;
  background-color: transparent;
}

.list-mode .collection-toc-area,
.list-mode .collection-toc-area-header {
  display: none;
}

.skeleton {
  height: 14px;
  width: 100%;
  border-radius: 4px;
  background: linear-gradient(
    90deg,
    #eee 25%,
    #ddd 37%,
    #eee 63%
  );
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
}

@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}

/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type=number] {
  -moz-appearance: textfield;
}


@media screen and (max-width: 1320px) {
  .list-mode {
    --column-gap : 20px;
  }
}

@media screen and (max-width: 1024px) {

  .list-mode.tree,
  .list-mode .pagination {
    width: auto;
    margin-left: -10px;
    margin-right: -10px;
  }

  .list-mode.tree > .list-header,
  .list-mode.tree > li > .li.container.row,
  .list-mode .pagination {
    padding-left: 20px;
    padding-right: 20px;
  }

  .list-mode .pagination {
    margin-bottom: 20px;
    padding-top: 12px;
    padding-bottom: 12px;
  }

  /* Table header */

  .list-header {
    margin-bottom: 0;
    border-bottom: 2px solid var(--fill-color);

    & > .header {
      border-bottom: none;

      /* If on search field in header */
      & > .header-cell:only-child {
        & > span {
          flex: auto 0 0;
          max-width: unset;
        }
        & > .header-cell-fields {
          flex: 1;
        }
      }
    }
  }

  .list-mode .header-cell {
    flex-direction: row;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;

    & > span {
      flex: 60px 0 0;
      border-bottom: none;
      margin-bottom: 0;

      max-width: 60px;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    & > .header-cell-fields {
      flex: calc(100% - 70px) 0 0;
    }
  }

  .list-mode .range-filter {
    width: 100%;
  }

  .list-mode .li.container {
    display: block !important;

    &.header {
      padding: 5px 12px 10px;
    }
  }

  /* Table rows */

  .list-mode > li > .li.container > .cell:first-child a {
    color: #000000;
  }

  .list-mode .cell:not(:nth-child(1)) a,
  .list-mode .cell:nth-child(2n) a {
    font-size: 16px;
    color: #333333;
  }

  .list-mode > li:nth-child(2) .li.container {
    padding-top: 20px;
  }
}


@media screen and (max-width: 640px) {

  .list-mode.tree,
  .list-mode .pagination {
    margin-left: calc(-1 * var(--mobile-margin));
    margin-right: calc(-1 * var(--mobile-margin));
  }

  .list-mode.tree > li {
    padding: 0;
  }

  .list-mode.tree > .list-header,
  .list-mode.tree > li > .li.container.row,
  .list-mode .pagination {
    padding-left: var(--mobile-margin);
    padding-right: var(--mobile-margin);
  }
}

</style>