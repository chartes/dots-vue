<template>
  <!-- PAGINATION -->
  <Pagination
    v-model="currentPage"
    :total-pages="totalPages"
    :is-table-loading="isTableLoading"
    :documents-count-text="documentsCountText"
  />
  <div class="list-mode-wrapper">
    <ul class="tree list-mode">

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
              <input
                v-if="!col.type || col.type !== 'range'"
                v-model="filters[col.key]"
                class="filter"
                type="text"
                @click.stop
              />

              <div v-else class="range-filter" @click.stop>
                <input
                  v-model="filters[col.key].from"
                  type="number"
                  placeholder="de"
                />
                <input
                  v-model="filters[col.key].to"
                  type="number"
                  placeholder="à"
                />
              </div>
            </div>
          </div>
        </div>
      </li>

      <!-- LOADING -->
      <template v-if="isTableLoading">
        <li v-for="n in 5" :key="n">
          <div class="li container row">
            <div v-for="col in columns" :key="col.key" class="cell">
              <div class="skeleton"></div>
            </div>
          </div>
        </li>
      </template>

      <!-- ROWS -->
      <template v-else>
        <li v-for="item in paginated" :key="item.identifier">
          <div class="li container row" @click="goToPageTable(item, $event)">
            <div v-for="col in columns" :key="col.key" class="cell">
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
import { useTable } from '@/composables/useTable.js'

import SortIcon from '@/assets/images/SortIcon.vue'
import Pagination from '@/components/Pagination.vue'
import store from '@/store'

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
    const columns = ref([...props.columnsConfig])

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
      goToPageTable
    }
  }
}
</script>
<style scoped>
/* GLOBAL */
.list-mode {
  width: 100%;
  display: block;

  --col-count: 4;
  --gap: 15px;
  /* columns control */
  --grid-template-columns: 40% calc(20% - var(--gap)) calc(25% - var(--gap)) calc(15% - var(--gap)); /* columns widths */
}
.list-mode-wrapper {
  width: 100%;
}

.list-mode .tree {
  padding-bottom: 36px;
  border-bottom: 2px solid var(--fill-color);
}

.list-mode li::before {
  display: none !important;
}

/* HEADER + ROWS */
.list-mode .container {
  max-width: none !important;
}
.list-mode .li.container {
  display: grid !important;
  grid-template-columns: var(--grid-template-columns);
  align-items: center;
  width: 100% !important;
  gap: var(--gap);

  font-family: "Barlow", sans-serif !important;
  font-size: 1em !important;
  font-weight: 400 !important;
  line-height: 1.5 !important;
}

/* HEADER */
.list-mode .header {
  font-weight: 700;
  border-bottom: 1px solid #ddd;
  padding: 20px 8px;
}

/* HEADER CELL */
.list-mode .header-cell {
  display: flex;
  flex-direction: column;

  font-weight: bold !important;
}
.list-mode .header-cell-fields {
  display: flex;
  flex-direction: row;
  align-items: center;

  cursor: pointer;

  font-weight: bold !important;

}

/* ROW */
.list-mode .row {
  width: 100%;
  padding: 10px 8px;
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

/* FILTER */
.list-mode .filter {
  width: 100%;
  height: 32px;
  padding: 4px;
  font-size: 12px;
  border: 1px solid #ddd;
}

/* RANGE */
.list-mode .range-filter {
  display: flex;
  height: 32px;
  gap: 20px;
}

.list-mode .range-filter input {
  width: 50%;
  border: 1px solid #ddd;
}

/* ICON */
.list-mode .icons {
  display: flex;
  flex-direction: column;
  width: 32px;
  height: 32px;
  min-width: 32px;
  min-height: 32px;
  font-size: 10px;
  color: white;
  background-color: var(--fill-color);
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
</style>