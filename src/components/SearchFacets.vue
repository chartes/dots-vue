<template>
  <div class="search-facets">
    <h2 class="title">
      Filtres
    </h2>

    <div
      v-for="facet in orderedFacets"
      :key="facet.id"
      class="facet-box"
    >
      <div
        class="facet-header"
        @click="toggleOpen(facet.id)"
      >
        <span>
          {{ facet.label }} {{ facet.values?.length ? `(${facet.values.length})` : '' }}
        </span>
        <i
          class="arrow"
          :class="{ opened: isOpen(facet.id) }"
        />
      </div>
      <div
        v-show="isOpen(facet.id)"
        class="facet-body"
      >
        <!-- ===================== -->
        <!-- Facette temporelle -->
        <!-- ===================== -->
        <template v-if="facet.type === 'temporal'">
          <TemporalFacetSlider
            :temporal-facets="[facet.temporal]"
            :ranges="ranges"
            @change="$emit('change-range',$event)"
          />
        </template>

        <!-- ===================== -->
        <!-- Facette terms -->
        <!-- ===================== -->

        <template v-else>
          <div
            v-if="facet.values?.length > 10"
            class="facet-search"
          >
            <input
              class="facet-input"
              type="text"
              :value="facetFilters[facet.id] || ''"
              @input="setFacetFilter(
                facet.id,
                $event.target.value
              )"
              :placeholder="`Filtrer ${facet.label}`"
            >
            <button
              type="button"
              class="facet-eye-btn"
              @click="toggleFacetShowAll(facet.id)"
            >
              {{ getFacetShowAll(facet.id) ? 'Hide' : 'Show all' }}
            </button>
          </div>
          <label
            v-for="item in filteredFacetValues(facet.id, facet.values)"
            :key="item.facet_key || item.value"
            class="checkbox facet-item"
          >
            <input
              type="checkbox"
              :checked="isSelected(facet.id,item)"
              @change="toggleFacet(facet.id,item)"
            >

            {{ item.label || item.value }}
            ({{ item.count }})

          </label>
        </template>
        <button
          type="button"
          class="facet-reset-btn"
          @click.stop="resetFacet(facet)"
          title="Réinitialiser cette facette"
        >
          ↺
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>

import { computed, ref, watch } from 'vue'
import TemporalFacetSlider from './TemporalFacetSlider.vue'

const props = defineProps({

  openedFacets:{
      type: Array,
      default: () => []
  },
  facets:{
        type: Array,
        default: () => []
    },

    temporalFacets:{
        type: Array,
        default: () => []
    },

    activeFacets:{
        type: Array,
        default: () => []
    },

    ranges:{
        type: Object,
        default: () => ( {} )
    },

    config:{
        type: Object,
        default: () => ( {} )
    }

})
watch(
  () => props.ranges,
  ranges => {

    Object.keys(ranges).forEach(key => {

      if (!props.openedFacets.includes(key)) {

        emit(
          'facet-open',
          key
        )

      }

    })

  },
  {
    immediate:true,
    deep:true
  }
)

const emit = defineEmits([
    'toggle-facet',
    'facet-open',
    'facet-close',
    'change-range',
    'reset-range',
    'reset-facet'
])//'apply-collections'

const facetFilters = ref({})
const facetShowAll = ref({})

function isOpen(facetId){
    return props.openedFacets.includes(facetId)
}

function toggleOpen(facetId){
    if (isOpen(facetId)) {
        emit('facet-close', facetId)
    }
    else {
        emit('facet-open', facetId)
    }
}

function setFacetFilter(facetId, value) {
    facetFilters.value[facetId] = value
}

function getFacetShowAll(facetId) {

    if (facetShowAll.value[facetId] === undefined) {
        facetShowAll.value[facetId] = true
    }

    return facetShowAll.value[facetId]
}

function toggleFacetShowAll(facetId) {
    facetShowAll.value[facetId] = !getFacetShowAll(facetId)
}

const orderedFacets = computed(()=>{

    const result = []

    // =====================
    // Facettes temporelles
    // =====================

    props.temporalFacets.forEach(f=>{

        result.push({
            id: f.field,
            label: f.label,
            type: 'temporal',
            temporal: f,
            order: f.order ?? 999
        })

    })

    // =====================
    // Facettes terms
    // =====================

    props.facets.forEach(f=>{

        result.push({
            id: f.id,
            label: f.label,
            values: f.values,
            type: 'terms',
            facet: f,
            order: f.order ?? 100
        })

    })
    return result.sort(
        (a,b)=>a.order-b.order
    )
})

function filteredFacetValues(facetId, values) {

    const term =
        (facetFilters.value[facetId] || '')
            .trim()
            .toLowerCase()

    const selected = values.filter(v =>
        isSelected(facetId, v)
    )

    let matching = values

    if (!getFacetShowAll(facetId)) {
        matching = term
            ? values.filter(v =>
                (v.label || v.value || '')
                    .toLowerCase()
                    .includes(term)
            )
            : []

    }

    else if (term) {
        matching = values.filter(v =>
            (v.label || v.value || '')
                .toLowerCase()
                .includes(term)
        )
    }

    const result = [
        ...selected,
        ...matching.filter(
            v => !selected.includes(v)
        )
    ]

    return result.sort((a,b)=>
        (a.label || a.value || '')
        .localeCompare(
            (b.label || b.value || ''),
            'fr',
            { sensitivity:'base' }
        )
    )
}

function isSelected(facetId, item){

    const value =
        item.facet_key ??
        item.value ??
        item.id

    return props.activeFacets.some(f =>
        f.facetType === facetId &&
        (
            f.raw === value ||
            f.id === value ||
            f.value === value ||
            f.facet_key === value
        )
    )
}

function toggleFacet(facetId, item) {

    emit('toggle-facet', {
        facetType: facetId,
        facetKey:
            item.facet_key ??
            item.value ??
            item.id,
        isCollection: facetId === 'collections'

    })
  // Réinitialiser le filtre de cette facette
    facetFilters.value[facetId] = ''

    // Facultatif : remettre aussi "Show all"
    facetShowAll.value[facetId] = true

}

function resetFacet(facet) {

    if (facet.type === 'temporal') {
        emit('reset-range', facet.temporal.field)
        return
    }
    emit('reset-facet', facet.id)
}

watch(
  () => props.activeFacets,
  facets => {

    facets.forEach(f => {
      if (!props.openedFacets.includes(f.facetType)) {
        emit('facet-open', f.facetType)
      }
    })
  },
  {
    immediate:true,
    deep:true
  }
)
</script>
<style scoped>
.search-facets{
  display:flex;
  flex-direction:column;
  gap:1rem;
}

.facet-box{
  border:1px solid #ddd;
}

.facet-header{
  background: var(--meta-area-fill-color);
  padding:.75rem;
  display:flex;
  justify-content:space-between;
  align-items: center;
  cursor:pointer;
  font-weight:600;
}

.facet-body{
  position: relative;
  padding:1rem;
}

.facet-item{
  display:block;
  margin-bottom:.4rem;
}
.facet-reset-btn {
  position: absolute;
  top: 4px;
  right: 4px;

  border: none;
  background: transparent;
  cursor: pointer;

  font-size: 18px;
  line-height: 1;
  padding: 2px 5px;
  color: #666;
}

.facet-reset-btn:hover {
  color: #000;
}

.arrow {
  display: inline-block;
  width: 0;
  height: 0;

  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid var(--fill-color);

  transition: transform .15s ease;
}

.arrow.opened {
  transform: rotate(180deg);
}

</style>