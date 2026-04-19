<template>
  <!-- PAGINATION -->
  <Pagination
    v-model="currentPage"
    :total-pages="totalPages"
    :is-table-loading="isTableLoading"
    :documents-count-text="documentsCountText"
  />
  <div class="list-mode-wrapper">
    <ul
      class="tree list-mode"
      :style="{ '--grid-template-columns': gridTemplateColumns }"
    >
      <!-- HEADER -->
      <li class="list-header">
        <div class="li container header">
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
        </div>
      </li>

      <!-- LOADING -->
      <template v-if="isTableLoading">
        <li
          v-for="n in 5"
          :key="n"
        >
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
                {{ getValue(item, col.key) }}
              </a>
            </div>
          </div>
        </li>
      </template>
    </ul>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { router } from '@/router'
import store from '@/store'
import { useTable } from '@/composables/useTable.js'

import SortIcon from '@/assets/images/SortIcon.vue'
import Pagination from '@/components/Pagination.vue'


export default {
name: 'CollectionTOC',
  components: {
    SortIcon,
    Pagination
  },

  props: {
    data: { type: Array, required: true },
    columnsConfig: { type: Array, required: true },
    pageSize: { type: Number, default: 10 },
    isDocProjectIdIncluded: Boolean,
    rootCollectionIdentifier: String,
    counts: { type: Number },
    isTableLoading: Boolean
  },

  setup(props) {
    // STATE
    const currentPage = ref(1)
    const dataSource = computed(() => props.data || [])
    const isTableLoading = computed(() => props.isTableLoading)
    const pageSize = ref(props.pageSize)
    const resultsCounts = computed(() => props.counts)

    // TABLE
    const columns = ref([...(props.columnsConfig || []).filter(Boolean)])

    const table = useTable(dataSource, columns, pageSize, currentPage)

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
    const documentsCountText = computed(() => {
      if (isTableLoading.value) {
        return 'Collecte des ressources... ' + resultsCounts.value
      } else {
        const total = totalResults.value
        return `${total} ${total > 1 ? 'ressources' : 'ressource'}`
      }
    })

    const toggleSort = (col) => {
      if (sort.value.key !== col.key) {
        sort.value.key = col.key
        sort.value.direction = 'asc'
        return
      }

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

    // DYNAMIC COLUMNS CSS
    const gridTemplateColumns = computed(() => {
      const cols = columns.value || []

      if (!cols.length) return ''

      // Width defined in conf.json files → use it
      if (cols.some(col => col.width)) {
        return cols.map(col => col.width || '1fr').join(' ')
      }

      // else → equal columns width
      return `repeat(${cols.length}, 1fr)`
    })

    // NAVIGATION
    const setStateCollection = (collId) => {
      store.commit('setCollectionId', collId)
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
      columns,
      table,
      filters,
      sort,
      totalPages,
      totalResults,
      getValue,
      paginated,
      documentsCountText,
      toggleSort,
      setStateCollection,
      buildDocumentRoute,
      getTableHref,
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

.pagination :deep(.pagination-documents-count) {
  font-size: 24px;
  line-height: 1;
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
}

.list-mode .tree {
  padding-bottom: 36px;
  border-bottom: 2px solid var(--fill-color);
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

/* ROW */
.list-mode .row {
  width: 100%;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

/* HOVER */
.list-mode .row:hover {
  background: #fafafa;
}

/* CELLS */
.list-mode .cell {
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
    }
  }

  .list-mode .header-cell {
    flex-direction: row;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;

    & > span {
      flex: 130px 0 0;
      border-bottom: none;
      margin-bottom: 0;
    }

    & > .header-cell-fields {
      flex: calc(100% - 140px) 0 0;
    }
  }

  .list-mode .range-filter {
    width: 100%;
  }

  .list-mode .li.container {
    display: block !important;

    &.header {
      padding: 5px 0 10px 0;
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

  .pagination :deep(.pagination-documents-count) {
    font-size: 24px;
  }
}

</style>