<template>
  <div
    v-if="hasActiveFilters"
    class="active-filters"
  >

    <div class="active-filters-header">

      <button
        type="button"
        class="collapse-btn"
        @click="toggleCollapsed"
      >
        <span class="active-filters-title">Filtres actifs</span>
        <i class="collapse-arrow" :class="{ opened: !collapsed }" />
      </button>

      <!-- supprimer tous les filtres -->
      <svg
        class="clearall-icon"
        viewBox="0 0 24 24"
        @click.stop="clearAll"
      >
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>

    </div>

     <div v-show="!collapsed" class="filter-tags">

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
import { computed, ref } from 'vue'

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

// ajouts Charlie
const collapsed = ref(false)

function toggleCollapsed(){
  collapsed.value = !collapsed.value
}
//
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
      f.key,
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


.active-filters {
  position: sticky;
  width: 85.5%;
  top: 0;
  z-index: 20;
  padding: .75rem 1rem;
  border: 3px solid #f9f9f9;
}

.active-filters-header {
  display:inline-flex;
  align-items:center;
  gap:1rem;
}

.active-filters-title {
  font-weight:600;
}

.collapse-btn {
  display: inline-flex;
  align-items: center;
  gap: .35rem;
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
}

.collapse-arrow {
  display: inline-block;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid #666;
  transition: transform .15s ease;
}

.collapse-arrow.opened {
  transform: rotate(180deg);
}



.active-filters-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: .75rem;
}

.active-filters-title {
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: .02em;
  text-transform: uppercase;
  color: #1a1a1a;
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

.clearall-icon {
  width:18px;
  height:18px;

  cursor:pointer;

  fill:none;
  stroke:#666;
  stroke-width:2;
}

.clear-icon:hover {
  stroke:#b9192f;
}

.clearall-btn {
  display: inline-flex;
  align-items: center;
  gap: .35rem;
  background: #fdecee;
  color: #b9192f;
  border: 1px solid #f3c4cb;
  border-radius: 20px;
  padding: .35rem .85rem;
  font-size: .85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s ease, border-color .15s ease, color .15s ease;
}

.clearall-btn:hover {
  background: #b9192f;
  border-color: #b9192f;
  color: #fff;
}

</style>