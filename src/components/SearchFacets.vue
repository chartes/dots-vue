<template>
  <div class="search-facets">
    <div
      class="title filters-header"
      @click="toggleAllFacets"
    >
      <span>Filtres</span>
      <i
        class="arrow"
        :class="{ opened: allOpened }"
      />
    </div>

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
          <!-- Parcours alphabétique (ex. Auteurs) : recherche + A-Z + cases à cocher -->
          <template v-if="isAlphabetFacet(facet.id)">
            <AlphabetFacetPicker
              :items="mergeSelected(facet.id, facet.values)"
              :selected-keys="selectedKeysFor(facet.id)"
              :label="facet.label"
              :placeholder="`Rechercher ${facet.label}`"
              @toggle="(item) => toggleFacet(facet.id, item)"
            />
          </template>

          <!-- Rendu par défaut : autocomplétion + candidats cliquables -->
          <template v-else>
            <div class="facet-search">
              <input
                class="facet-input"
                type="text"
                :value="facetFilters[facet.id] || ''"
                @input="setFacetFilter(
                  facet.id,
                  $event.target.value
                )"
                @focus="openFacetDropdown(facet.id)"
                @blur="closeFacetDropdown(facet.id)"
                @keydown.escape="closeFacetDropdown(facet.id)"
                :placeholder="`Filtrer ${facet.label}`"
              >


              <div
                v-if="isFacetDropdownOpen(facet.id) && candidateFacetValues(facet.id, facet.values).length"
                class="facet-dropdown"
              >
                <div
                  v-for="item in candidateFacetValues(facet.id, facet.values)"
                  :key="item.facet_key || item.value"
                  class="facet-item facet-candidate"
                  role="option"
                  @mousedown.prevent
                  @click="selectFacetCandidate(facet.id, item)"
                >
                  {{ item.label || item.value }}
                  ({{ item.count }})
                </div>
              </div>
            </div>

            <!-- Valeurs déjà sélectionnées pour cette facette : toujours visibles -->
            <div
              v-for="item in selectedFacetValues(facet.id, facet.values)"
              :key="item.facet_key || item.value"
              class="facet-item is-selected"
              role="checkbox"
              aria-checked="true"
              tabindex="0"
              @click="toggleFacet(facet.id, item)"
              @keydown.enter.prevent="toggleFacet(facet.id, item)"
              @keydown.space.prevent="toggleFacet(facet.id, item)"
            >
              {{ item.label || item.value }}
              ({{ item.count }})
            </div>
          </template>
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
import AlphabetFacetPicker from './AlphabetFacetPicker.vue'

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
    },

    // Ids de facettes "terms" à afficher avec le parcours alphabétique
    // (recherche + index A-Z + cases à cocher) plutôt que le rendu par défaut.
    alphabetFacetIds:{
        type: Array,
        default: () => ['dct:contributor']
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
const facetDropdownOpen = ref({})

function isFacetDropdownOpen(facetId) {
    return !!facetDropdownOpen.value[facetId]
}

function openFacetDropdown(facetId) {
    facetDropdownOpen.value[facetId] = true
}

function closeFacetDropdown(facetId) {
    facetDropdownOpen.value[facetId] = false
}

// Sélection d'un candidat depuis le menu déroulant : on l'ajoute aux
// filtres actifs, on vide le champ de recherche et on referme le menu.
function selectFacetCandidate(facetId, item) {
    toggleFacet(facetId, item)
    setFacetFilter(facetId, '')
    closeFacetDropdown(facetId)
}

function isOpen(facetId){
    return props.openedFacets.includes(facetId)
}

function isAlphabetFacet(facetId){
    return props.alphabetFacetIds.includes(facetId)
}

const allOpened = computed(() => {
  const ids = orderedFacets.value.map(f => f.id)
  return ids.length > 0 &&
    ids.every(id => props.openedFacets.includes(id))
})

function toggleAllFacets() {

  const ids = orderedFacets.value.map(f => f.id)

  if (allOpened.value) {
    ids.forEach(id => emit('facet-close', id))
  } else {
    ids.forEach(id => emit('facet-open', id))
  }
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
        facetShowAll.value[facetId] = false
    }

    return facetShowAll.value[facetId]
}

function toggleFacetShowAll(facetId) {
    facetShowAll.value[facetId] = !getFacetShowAll(facetId)
    if (facetShowAll.value[facetId]) {
        openFacetDropdown(facetId)
    }
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
            id: f.key ?? f.id,
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

// Clé d'identification d'une valeur de facette (constante quel que soit le
// nom de champ utilisé selon la provenance de la donnée).
function facetValueKey(item){
    return item.facet_key ?? item.value ?? item.id
}

// Clés actuellement sélectionnées pour une facette donnée, à partir de
// activeFacets (source de vérité côté recherche).
function selectedKeysFor(facetId){
    return props.activeFacets
        .filter(f => f.facetType === facetId)
        .map(f => f.raw ?? f.facet_key ?? f.value ?? f.id)
}

// Fusionne les valeurs venant d'Elasticsearch avec les valeurs sélectionnées
// que l'agrégation ne renvoie plus (ex. une fois le filtre appliqué, ES peut
// ne plus inclure ce terme dans ses buckets) : on les reconstruit à minima
// pour que la case reste cochée et visible.
function mergeSelected(facetId, values){

    const list = values || []
    const selectedKeys = selectedKeysFor(facetId)

    const selectedFromActive = selectedKeys.map(key => {
        const existing = list.find(v => facetValueKey(v) === key)
        if (existing) return existing
        return {
            facet_key: key,
            value: key,
            label: key,
            count: 0,
            selected: true
        }
    })

    const rest = list.filter(v => !selectedKeys.includes(facetValueKey(v)))

    return [...selectedFromActive, ...rest]
}

const sortAlpha = (a,b) =>
    (a.label || a.value || '')
        .localeCompare((b.label || b.value || ''), 'fr', { sensitivity:'base' })

// Valeurs déjà actives pour une facette : affichées en permanence, hors
// menu déroulant, pour que l'utilisateur voie et puisse retirer ses
// sélections sans avoir à retaper quoi que ce soit.
function selectedFacetValues(facetId, values) {
    const selectedKeys = selectedKeysFor(facetId)

    const selectedFromActive = selectedKeys.map(key => {
        const existing = values.find(v =>
            facetValueKey(v) === key
        )
        if (existing) return existing
        return {
            facet_key: key,
            value: key,
            label: key,
            count: 0,
            selected: true
        }
    })

    return selectedFromActive.sort(sortAlpha)
}

// Candidats (non sélectionnés) proposés dans le menu déroulant
// d'autocomplétion, sous le champ de saisie.
function candidateFacetValues(facetId, values) {
    const term =
        (facetFilters.value[facetId] || '')
            .trim()
            .toLowerCase()

    const showAll = getFacetShowAll(facetId)

    const selectedKeys = selectedKeysFor(facetId)

    let available = values.filter(v => {
      const key = facetValueKey(v)
      const matchesTerm =
          !term ||
          (v.label || v.value || '').toLowerCase().includes(term)
      const hasCount = (v.count ?? 0) > 0
      return (
          !selectedKeys.includes(key) &&
          (
              hasCount ||
              showAll ||
              (term && matchesTerm)
          )
      )
    })

    if (term) {
        available = available.filter(v =>
            (v.label || v.value || '').toLowerCase().includes(term)
        )
    }

    return available.sort(sortAlpha)
}

function isSelected(facetId, item){

    const value = facetValueKey(item)

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
        facetKey: facetValueKey(item),
        isCollection: facetId === 'collections'

    })

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
  font-family: "Barlow", sans-serif;
}

.filters-header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  cursor:pointer;
  user-select:none;
  margin:0;
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

.facet-search{
  position: relative;
  display: flex;
  align-items: center;
  gap: .5rem;
  margin-bottom: .5rem;
}

/* Champ de filtre harmonisé avec .search-form .input (barre de recherche principale) */
.facet-input{
  flex: 1;
  min-width: 0;
  height: 36px;
  padding: 6px 10px;
  font-family: "Barlow", sans-serif;
  font-size: .85rem;
  color: inherit;
  background: #fff;
  border: 1px solid #979797;
  border-radius: 6px;
  box-shadow: none;
}

.facet-input:focus{
  outline: none !important;
  box-shadow: none !important;
  border-color: #979797;
}

/* Bouton "Show all/Hide" harmonisé avec les boutons de la barre de recherche */
.facet-eye-btn{
  flex: 0 0 auto;
  height: 36px;
  padding: 0 12px;
  font-family: "Barlow", sans-serif;
  font-size: .78rem;
  font-weight: 600;
  color: var(--fill-color);
  background: #fff;
  border: 1px solid #979797;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color .15s ease, color .15s ease;
}

.facet-eye-btn:hover{
  background: var(--fill-color);
  border-color: var(--fill-color);
  color: #fff;
}

.facet-dropdown{
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 20;
  margin-top: 2px;
  background: #fff;
  border: 1px solid #979797;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0,0,0,.15);
  max-height: 240px;
  overflow-y: auto;
  font-family: "Barlow", sans-serif;
}

.facet-item{
  display:block;
  margin-bottom:.4rem;
  padding:.3rem .5rem;
  border-radius:6px;
  cursor:pointer;
  user-select:none;
}

.facet-dropdown .facet-item{
  margin-bottom: 0;
  border-radius: 0;
}

.facet-item:hover{
  background: var(--meta-area-fill-color, #f0f0f0);
}

.facet-item:focus-visible{
  outline: 2px solid var(--fill-color, #333);
  outline-offset: 1px;
}

.facet-item.is-selected{
  font-weight:600;
  color: var(--fill-color);
  background: var(--meta-area-fill-color, #eee);
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
