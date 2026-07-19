<template>
  <div
    v-if="hasActiveFilters"
    class="active-filters"
  >

    <div class="active-filters-header">

      <div class="active-filters-title">
        Filtres actifs
      </div>


      <!-- supprimer tous les filtres -->
      <svg
        class="clear-icon"
        viewBox="0 0 24 24"
        @click.stop="clearAll"
      >
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>

    </div>

    <div class="filter-tags">

      <!-- Facettes -->
      <span
        v-for="facet in facets"
        :key="`${facet.facetType}-${facet.id}`"
        class="filter-tag"
      >

        {{ facet.label }}

        <svg
          class="clear-icon"
          viewBox="0 0 24 24"
          @click.stop="removeFacet(facet)"
        >
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      </span>

      <!-- Ranges -->
      <span
        v-for="(range, field) in ranges"
        :key="`range-${field}`"
        class="filter-tag"
      >
        {{ getRangeLabel(field) }} :
        {{ range ? formatRange(range) : '' }}

        <svg
          class="clear-icon"
          viewBox="0 0 24 24"
          @click.stop="removeRange(field)"
        >
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      </span>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'

const props = defineProps({

  facets:{
    type:Array,
    default:()=>[]
  },
  ranges:{
    type:Object,
    default:()=>({})
  },
  temporalFacets:{
    type:Array,
    default:()=>[]
  }
})

const emit = defineEmits([
  'remove-facet',
  'remove-range',
  'clear-all'
])

const hasActiveFilters = computed(() => {

  return (
    props.facets.length > 0 ||
    Object.keys(props.ranges).length > 0
  )
})

// labels issus de la config
const temporalLabels = computed(() => {

  return Object.fromEntries(
    props.temporalFacets.map(f => [
      f.field,
      f.label
    ])
  )

})

function getRangeLabel(field){
  return temporalLabels.value[field] || field
}

function formatRange(range){
  if (!range) return ''

  return `${range.gte ?? '∞'} - ${range.lte ?? '∞'}`
}

function removeFacet(facet){
  emit(
    'remove-facet',
    facet
  )
}

function removeRange(field){
  emit(
    'remove-range',
    field
  )
}

function clearAll(){
  emit('clear-all')
}

</script>
<style scoped>

.active-filters-header {
  display:flex;
  align-items:center;
  gap:.5rem;
}

.active-filters-title {
  font-weight:600;
}

.filter-tags {
  display:flex;
  flex-wrap:wrap;
  gap:.5rem;
}

.filter-tag {
  display:flex;
  align-items:center;
  gap:.35rem;

  background:#fff;
  border:1px solid #ddd;
  border-radius:15px;

  padding:.25rem .75rem;
}

.clear-icon {
  width:14px;
  height:14px;

  cursor:pointer;

  fill:none;
  stroke:#666;
  stroke-width:2;
}

.clear-icon:hover {
  stroke:#b9192f;
}

</style>