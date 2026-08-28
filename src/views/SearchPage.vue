<template>
  <div class="collection-wrapper">
    <CollectionHeader
      :collection-config="collConfig"
      :application-config="appConfig"
      :current-collection="currCollection"
      :collection-identifier="collectionId"
      :root-collection-identifier="rootCollectionId"
      :show-about="false"
    />
  <!--<div class="collection-list" :class="{ 'root-collection-list' : collectionId === rootCollectionId }">
    <div class="tiles">
      <div class="tile page-header">
        <div class="is-flex is-flex-direction-row wrapper collection-header app-width-margin">
          <div class="tile article">
            <div class="title-tile">
              <p class="title">
                {{ collectionAltTitle ? collectionAltTitle : currCollection.title }}
              </p>
            </div>
          </div>
          <div class="collection-image"></div>
        </div>
      </div>
    </div>-->
    <div><!--class="tile"-->
      <!--<div class="tile page-header app-width-padding">
        <article class="tile is-child">
          <div class="is-flex is-flex-direction-row title-tile">
            <p class="title">
              Les positions de thèses<br />de l'École nationale des chartes
            </p>
            <p class="header-baseline">
              <span>Position</span> : à l’origine, les positions prises et à défendre par
              l’élève, face au jury. Depuis, un résumé de la thèse soutenue.
            </p>
          </div>
        </article>
      </div>-->
      <div class="tile is-vertical app-width-margin">
        <div
          class="tile is-parent search-form-and-carousel"
          :class="searchMinimizedCssClass"
        >
          <div class="tile is-child search-form">
            <div class="search-bar-row">
              <!-- Fulltext or Metadata search selector -->
              <div class="search-mode-wrapper">
                <!-- SELECT BUTTON -->
                <div class="search-mode-trigger" @click="toggleModeDropdown">
                  <span>{{ currentSearchLabel }}</span>
                  <i class="arrow"></i>
                </div>

                <!-- DROPDOWN -->
                <div v-if="isModeOpen" class="search-mode-dropdown">
                  <div
                    v-for="opt in searchTypeOptions"
                    :key="opt.value"
                    class="search-mode-option"
                    :class="{ active: searchType === opt.value }"
                    @click="selectSearchType(opt.value)"
                  >
                    {{ opt.text }}
                  </div>
                </div>
              </div>
              <!-- input -->
              <div class="search-input-wrapper">
                <input
                  class="input is-medium"
                  :class="isInvalidQuery ? 'input-error' : ''"
                  type="text"
                  placeholder="Recherche"
                  v-model="inputTerm"
                  @keyup.enter="executeSearches"
                  @click="$event.preventDefault()"
                /><!-- live debounced search : @keyup.enter="executeSearches" -->
                <button
                  v-if="inputTerm"
                  class="search-clear"
                  title="Clear search"
                  @click.prevent="deleteTerm"
                >
                  <span aria-hidden="true"></span>
                </button>
                <!-- MESSAGE ERROR -->
                <p v-if="isInvalidQuery" class="search-error-message">
                  Les recherches avec field: ne sont pas autorisées en mode plein texte
                </p>
              </div>

              <!-- button -->
              <button
                class="search-submit"
                :disabled="isInvalidQuery || search.loading.value"
                @click="executeSearches"
              />
            </div>
            <!-- FACET AUTOCOMPLETE -->
<!--            <div class="field">-->
<!--              <div class="control is-expanded search-control">-->
<!--                <input-->
<!--                  class="input is-small"-->
<!--                  type="text"-->
<!--                  placeholder="Filtrer les collections"-->
<!--                  v-model="inputFacet"-->
<!--                  @click="$event.preventDefault()"-->
<!--                />-->
<!--                <span class="icon is-right clear-input" @click="inputFacet = ''">-->
<!--                  <i class="fas fa-times"></i>-->
<!--                </span>-->
<!--              </div>-->


<!--              &lt;!&ndash; dropdown &ndash;&gt;-->
<!--              <div v-if="inputFacet.length && facetSuggestions.length" class="autocomplete-box">-->
<!--                <div-->
<!--                  v-for="facet in facetSuggestions"-->
<!--                  :key="facet.facet_key"-->
<!--                  class="autocomplete-item"-->
<!--                  @click="applyFacet(facet)"-->
<!--                >-->
<!--                  <span>{{ facet.label }} ({{ facet.count }})</span>-->
<!--                </div>-->
<!--              </div>-->
<!--            </div>-->
<!--            <div v-if="activeFacetTags.length > 0" class="active-filters">-->

<!--              <div class="active-filters-header">-->
<!--                <button-->
<!--                  class="clear-all-btn"-->
<!--                  @click="removeAllFacets"-->
<!--                  title="Supprimer tous les filtres"-->
<!--                >-->
<!--                  ✕-->
<!--                </button>-->

<!--                <span>filtres actifs</span>-->
<!--              </div>-->

<!--              <div class="active-filters-list">-->
<!--                <div-->
<!--                  v-for="tag in activeFacetTags"-->
<!--                  :key="tag.raw"-->
<!--                  class="filter-chip"-->
<!--                >-->
<!--                  <span class="filter-chip-type">-->
<!--                    {{ tag.facetType }}-->
<!--                  </span>-->

<!--                  <span class="filter-chip-label" :title="tag.label">-->
<!--                    {{ tag.label }}-->
<!--                  </span>-->

<!--                  <button-->
<!--                    class="filter-chip-remove"-->
<!--                    @click="removeFacet(tag)"-->
<!--                    title="retirer ce filtre"-->
<!--                  >-->
<!--                    ×-->
<!--                  </button>-->
<!--                </div>-->
<!--              </div>-->

<!--            </div>-->
            <!-- Input sliders -->
            <div class="is-flex sliders">
              <!--<div class="field slider-control is-inline-block" v-if="temporalConfig.promotion">
                <div class="control">
                  <label>{{ temporalConfig.promotion.label || 'Promotions' }}</label>
                  <span>Entre</span>
                  <input
                    type="number"
                    class="year"
                    v-model.number="inputPromotionYearRangeStart"
                  />
                  <span>et</span>
                  <input
                    type="number"
                    class="year"
                    v-model.number="inputPromotionYearRangeEnd"
                  />
                  <vue-slider
                    v-model="inputPromotionYearRange"
                    :min="minPromotionYear"
                    :max="currentYear"
                    :tooltip="'none'"
                    :disabled="search.loading.value"
                  ></vue-slider>
                </div>
              </div>
              <div class="field slider-control is-inline-block"  v-if="temporalConfig.coverage">
                <div class="control">
                  <label>Période du sujet</label>
                  <span>Entre</span>
                  <input
                    type="number"
                    class="year"
                    v-model="inputTopicRangeStart"
                    v-on:blur="onBlurCheckTopicRangeStart($event)"
                  />
                  <span>et</span>
                  <input
                    type="number"
                    class="year"
                    v-model="inputTopicRangeEnd"
                    v-on:blur="onBlurCheckTopicRangeEnd($event)"
                  />
                  <vue-slider
                    v-model="inputTopicRange"
                    :min="minTopicYear"
                    :max="currentYear"
                    :tooltip="'none'"
                    :disabled="search.loading.value"
                  ></vue-slider>
                </div>
              </div>-->

<!--              <div class="field slider-control is-inline-block">-->
<!--                <div class="control">-->
<!--                  <TemporalFacetSlider-->
<!--                    :temporal-facets="visibleTemporal"-->
<!--                    :ranges="ranges"-->
<!--                    @change="onTemporalChange"-->
<!--                  />-->
<!--                </div>-->
<!--              </div>-->
            </div>
            <ActiveSearchFilters
              :facets="activeFacetTags"
              :ranges="ranges"
              :temporal-facets="visibleTemporal"
              @remove-facet="removeActiveFacet"
              @remove-range="removeActiveRange"
              @clear-all="clearAllFilters"
            />
            <SearchFacets
              class="search-facets"
              :opened-facets="openedFacets"
              :facets="visibleFacets"
              :temporal-facets="visibleTemporal"
              :active-facets="activeFacetTags"
              :ranges="ranges"
              @facet-open="openFacet"
              @facet-close="closeFacet"
              @toggleFacet="onToggleFacet"
              @change-range="onTemporalChange"
              @apply-collections="executeSearches()"
              @reset-range="resetRange"
              @reset-facet="resetFacet"
            />
            <!-- Fulltext + results count -->
            <div class="field is-flex px-2 search-form-footer">
              <div v-if="search.result.value" class="results-count">
                <span v-if="search.loading.value" class="results-count dot-flash">...</span>
                <span v-else>
                  {{ displayedCount }}
                </span>
                <span>position(s)</span>
              </div>
            </div>
            <!-- Minimized version -->
            <div class="minimized-controls">
              <button
                class="button is-light is-medium search"
                @click="expandSearchForm"
              />
              <button
                class="button is-light is-medium expand-form-button"
                @click="expandSearchForm"
              />
            </div>
          </div>
          <!--<div class="tile is-child carousel-parent">
            <article class="tile is-child">
              <div class="content">
                <carousel
                  :items="['histogram']"
                  @click="minimizeSearchForm"
                  v-show="!search.totalCount || search.totalCount.value > 0"
                >
                  <template v-slot:histogram><histogram /></template>
                </carousel>
              </div>
            </article>
          </div>-->
        </div>
        <div class="tile is-parent is-vertical">
          <!-- Table toogle + pagination -->
          <div class="is-flex toggle-list-and-pagination" v-if="search.totalCount.value">
            <div v-if="isFulltextSearch === true" class="is-inline-block">
              <div class="field is-inline-block px-1">
                <div class="control">
                  <Toggle
                    id="ToggleTableau"
                    on-label="Tableau"
                    off-label="Déplié"
                    v-model="isResultTableMode"
                    :width="120"
                  />
                </div>
              </div>
              <div
                v-if="!isResultTableMode && isFulltextSearch"
                class="field is-inline-block px-1"
              >
                <div class="control mb-6 block is-inline-block sort-options">
                  <span> Tris </span>
                  <div class="is-inline-block">
                    <select name="tri" id="tri-select" v-model="inputSort">
                      <option value="">Pertinence</option>
                      <option
                        :value="
                          inputSort.includes('-')
                            ? '-metadata.author_name.keyword'
                            : 'metadata.author_name.keyword'
                        "
                      >
                        Auteur
                      </option>
                      <option
                        :value="
                          inputSort.includes('-')
                            ? '-metadata.promotion_year'
                            : 'metadata.promotion_year'
                        "
                      >
                        Promotion
                      </option>
                      <option
                        :value="
                          inputSort.includes('-')
                            ? '-metadata.topic_notBefore'
                            : 'metadata.topic_notBefore'
                        "
                      >
                        Période du sujet (borne inf.)
                      </option>
                      <option
                        :value="
                          inputSort.includes('-')
                            ? '-metadata.topic_notAfter'
                            : 'metadata.topic_notAfter'
                        "
                      >
                        Période du sujet (borne sup.)
                      </option>
                    </select>
                    <span
                      v-if="inputSort.includes('-')"
                      class="icon button"
                      @click="inputSort = inputSort.replace('-', '')"
                    >
                      <i class="fas fa-arrow-up" />
                    </span>
                    <span
                      v-else
                      v-show="inputSort.length > 0"
                      class="icon button"
                      @click="inputSort = `-${inputSort}`"
                    >
                      <i class="fas fa-arrow-down" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <!--<div v-if="search.pageCount" class="has-text-centered">
              <pagination />
            </div>-->
          </div>
          <!--<div class="block text-results" v-if="isFulltextSearch && !isResultTableMode">
            <div
              class="table is-hoverable is-narrow is-fulldwidth"
              v-if="search.result.value && search.result.value.length"
            >
              <template
                v-for="position in search.result.value"
                :key="position.id"
              >
                <router-link
                  :to="{
                    name: 'DocumentPage',
                    params: { docId: position.id },
                  }"
                  style="text-decoration: none; color: inherit"
                >
                  <div class="columns mb-6">
                    <div class="column is-2">
                      <img
                        class="pb-thumnbail"
                        onerror="this.onerror=null; this.src='https://iiif.chartes.psl.eu/images/enc/logo-enc.png/full/120,/0/default.png'"
                        :src="`${VITE_IIIF_IMAGES_URL}/${position.id}/${position.id}_01.TIF/full/120,/0/default.jpg`"
                      />
                    </div>
                    <div class="block column is-10">
                      <div
                        class="has-text-left is-size-5 position-title"
                        v-html="position.fields.metadata.title_rich"
                      ></div>
                      <div class="has-text-left has-text-weight-bold position-author">
                        {{ position.fields.metadata.author_name }}
                        {{ position.fields.metadata.author_firstname }}
                      </div>
                      <div class="has-text-right is-inline-block position-infos">
                        <span class="year"
                          >Promotion : {{ position.fields.metadata.promotion_year }}</span
                        >|<span class="period"
                          >Période du sujet :
                          {{ position.fields.metadata.topic_notBefore }} -
                          {{ position.fields.metadata.topic_notAfter }}</span
                        >
                      </div>
                      <div v-if="position.highlight" class="position-highlight">
                        <span v-for="phrase in position.highlight.content" :key="phrase">
                          <span v-html="phrase"></span>
                        </span>
                      </div>
                    </div>
                  </div>
                </router-link>
              </template>
            </div>
          </div>
          <div v-else class="table-container table-results">
            <table
              class="table is-hoverable is-narrow is-fulldwidth"
              v-if="search.result.value && search.result.value.length"
            >
              <thead>
                <tr>
                  <th
                    @click="inputSort = '-metadata.author_name.keyword'"
                    v-if="inputSort === 'metadata.author_name.keyword'"
                  >
                    <div class="sortable sort-alpha-down"><span>Nom</span></div>
                  </th>
                  <th
                    @click="inputSort = ''"
                    v-else-if="inputSort === '-metadata.author_name.keyword'"
                  >
                    <div class="sortable sort-alpha-up"><span>Nom</span></div>
                  </th>
                  <th @click="inputSort = 'metadata.author_name.keyword'" v-else>
                    <div class="sortable"><span>Nom</span></div>
                  </th>
                  <th>
                    <div><span>Prénom</span></div>
                  </th>
                  <th
                    class="largerTab"
                    @click="inputSort = '-metadata.promotion_year'"
                    v-if="inputSort === 'metadata.promotion_year'"
                  >
                    <div class="sortable sort-numeric-down">
                      <abbr title="Promotion" class="is-inline-block">Prom.</abbr>
                    </div>
                  </th>
                  <th
                    class="largerTab"
                    @click="inputSort = ''"
                    v-else-if="inputSort === '-metadata.promotion_year'"
                  >
                    <div class="sortable sort-numeric-up">
                      <abbr title="Promotion" class="is-inline-block">Prom.</abbr>
                    </div>
                  </th>
                  <th
                    class="largerTab"
                    @click="inputSort = 'metadata.promotion_year'"
                    v-else
                  >
                    <div class="sortable">
                      <abbr title="Promotion" class="is-inline-block">Prom.</abbr>
                    </div>
                  </th>
                  <th>
                    <div><span>Titre</span></div>
                  </th>
                  <th
                    class="largerTab"
                    @click="inputSort = '-metadata.topic_notBefore'"
                    v-if="inputSort === 'metadata.topic_notBefore'"
                  >
                    <div class="sortable sort-numeric-down">
                      <abbr title="Période du sujet">De </abbr>
                    </div>
                  </th>
                  <th
                    class="largerTab"
                    @click="inputSort = ''"
                    v-else-if="inputSort === '-metadata.topic_notBefore'"
                  >
                    <div class="sortable sort-numeric-up">
                      <abbr title="Période du sujet">De </abbr>
                    </div>
                  </th>
                  <th
                    class="largerTab"
                    @click="inputSort = 'metadata.topic_notBefore'"
                    v-else
                  >
                    <div class="sortable"><abbr title="Période du sujet">De </abbr></div>
                  </th>
                  <th
                    class="inline"
                    @click="inputSort = '-metadata.topic_notAfter'"
                    v-if="inputSort === 'metadata.topic_notAfter'"
                  >
                    <div class="sortable sort-numeric-down">
                      <abbr title="Période du sujet">A </abbr>
                    </div>
                  </th>
                  <th
                    class="inline"
                    @click="inputSort = ''"
                    v-else-if="inputSort === '-metadata.topic_notAfter'"
                  >
                    <div class="sortable sort-numeric-up">
                      <abbr title="Période du sujet">A </abbr>
                    </div>
                  </th>
                  <th
                    class="inline"
                    @click="inputSort = 'metadata.topic_notAfter'"
                    v-else
                  >
                    <div class="sortable"><abbr title="Période du sujet">A </abbr></div>
                  </th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <template
                  v-for="position in search.result.value"
                  :key="position.id"
                >
                  <tr
                    class="row-infos"
                    :class="positionCssClass(position)"
                  >
                    <td>
                      <router-link
                        :to="{ name: 'DocumentPage', params: { docId: position.id } }"
                      >
                        {{ position.fields.metadata.author_name }}
                      </router-link>
                    </td>
                    <td>{{ position.fields.metadata.author_firstname }}</td>
                    <td>{{ position.fields.metadata.promotion_year }}</td>
                    <td>
                      <router-link
                        :to="{ name: 'DocumentPage', params: { docId: position.id } }"
                      >
                        <span v-html="position.fields.metadata.title_rich"></span>
                      </router-link>
                    </td>
                    <td>{{ position.fields.metadata.topic_notBefore }}</td>
                    <td>{{ position.fields.metadata.topic_notAfter }}</td>
                    <td class="inline oeil">
                      <router-link
                        :to="{ name: 'DocumentPage', params: { docId: position.id } }"
                      />
                    </td>
                    <td
                      v-if="
                        isFulltextSearch &&
                        isResultTableMode &&
                        position.highlight !== null
                      "
                      class="inline"
                      :class="
                        !onrollActive.includes(position.id)
                          ? 'chevron-up'
                          : 'chevron-down'
                      "
                    >
                      <a href="#" @click="rollActive($event, position.id)"></a>
                    </td>
                    <td v-else-if="position.highlight === null"></td>
                  </tr>
                  <tr
                    v-if="
                      onrollActive.includes(position.id) &&
                      isFulltextSearch &&
                      isResultTableMode &&
                      position.highlight !== null
                    "
                    class="row-details"
                  >
                    <td colspan="8">
                      <ul>
                        <li v-for="phrase in position.highlight.content" :key="phrase">
                          <span v-html="phrase"></span>
                        </li>
                      </ul>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>-->
        </div>
      </div>
    </div>
    <div
      class="document-list app-width-margin list-mode"
    >
      <!-- <span>search {{ tableData }}</span> -->
      <ResourcesList

        :data="tableData"
        :columns-config="columns"
        :page-size="pageSize"
        :current-page="page"
        :is-doc-project-id-included="isDocProjectIdInc"
        :root-collection-identifier="rootCollectionId"
        :is-table-loading="search.loading.value"
        :counts="search.totalCount.value"
        :is-elastic-search="true"
        :total-buckets="search.bucketCount.value"
        :is-with-highlights="!!(isFulltextSearch && inputTerm.trim() && inputTerm.trim().length > 0)"
        :filters="filters"
        @filter-change="updateFilter"
        @sort-change="updateSort"
      /><!--v-if="tableData.length > 0"-->
    </div>
  </div>
</template>

<script>
import { computed, inject, isRef, onMounted, ref, watch } from 'vue'

import useSimpleSearch from '@/composables/use-simple-search'
import { router } from '@/router'

import CollectionHeader from '@/components/CollectionHeader.vue'
import ResourcesList from '@/components/ResourcesList.vue'
import SearchResultsList from '@/components/SearchResultsList.vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import TemporalFacetSlider from '@/components/TemporalFacetSlider.vue'
import ActiveSearchFilters from '@/components/ActiveSearchFilters.vue'
import SearchFacets from '@/components/SearchFacets.vue'
import store from "@/store";


export default {
  name: 'SearchPage',
  components: {
    SearchFacets,
    TemporalFacetSlider,
    ActiveSearchFilters,
    CollectionHeader,
    SearchResultsList,
    ResourcesList
  },
  props: {
    isDocProjectIdIncluded: {
      type: Boolean,
      required: true
    },
    dtsRootCollectionIdentifier: {
      type: String,
      required: true
    },
    rootCollectionIdentifier: {
      type: String,
      required: true
    },
    collectionIdentifier: {
      type: String,
      required: true
    },
    applicationConfig: {
      type: Object,
      required: true
    },
    collectionConfig: {
      type: Object,
      required: true
    },
    currentCollection: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const store = useStore()
    const router = useRouter()

    const isDocProjectIdInc = computed(() => props.isDocProjectIdIncluded)
    const dtsRootCollectionId = computed(() => props.dtsRootCollectionIdentifier)
    const rootCollectionId = computed(() => props.rootCollectionIdentifier)
    const collectionId = computed(() => props.collectionIdentifier)
    const appConfig = computed(() => props.applicationConfig)
    const collConfig = computed(() => props.collectionConfig)
    const currCollection = computed(() => props.currentCollection)

    const pageSize = computed(() =>
        `${import.meta.env.VITE_SEARCH_RESULT_PER_PAGE}`
    )

    // ⚠️ compat API existante (on garde "search.xxx")
    const search = useSimpleSearch()

    const { initialTemporal, temporal, ranges, setRange, execute } = useSimpleSearch()

    const page = search.pageNum
    watch(page, value => {
      console.log('searchPage page = ', value)
    })

    const openedFacets = search.openedFacets

    function onTemporalChange({field, range}){
      setRange(
        field,
        range
      )
      executeSearches()
    }

    const visibleTemporal = computed(() => {

      const config =
        collConfig.value?.searchConfig?.temporalFacets || []


      const configMap = new Map(
        config.map(c => [c.id, c])
      )


      return initialTemporal.value

        .map((facet, index) => {

          const c = configMap.get(facet.id)

          return {
            ...facet,

            // configuration éventuelle
            label: c?.label || facet.label,

            // ordre explicite sinon ordre backend
            order: c?.order ?? null,

            backendOrder: index
          }

        })

        // exclusion explicite uniquement
        .filter(facet => {

          const c = configMap.get(facet.id)

          return c?.enabled !== false

        })

        .sort((a, b) => {

          // les deux ont un ordre configuré
          if (a.order != null && b.order != null) {
            return a.order - b.order
          }

          // a configuré, b non
          if (a.order != null) {
            return a.order - b.backendOrder
          }

          // b configuré, a non
          if (b.order != null) {
            return a.backendOrder - b.order
          }

          // aucun ordre configuré :
          // on respecte le backend
          return a.backendOrder - b.backendOrder
        })

    })

    const visibleFacets = computed(() => {

      const result = []

      const available =
        search.facets.value?.available || {}

      const initialAvailable =
        search.initialFacets.value?.available || {}


      const configFacets =
        collConfig.value?.searchConfig?.facets || []

      const collectionsConfig =
        configFacets.find(
          f => f.id === 'collections'
        )

      //
      if (available.collections  && collectionsConfig?.enabled !== false) {

        const currentCollections = Object.fromEntries(
          available.collections.map(f => [
            f.facet_key,
            f.count
          ])
        )

        const collections = (
          initialAvailable.collections || available.collections
        ).map(f => ({
          ...f,
          count: currentCollections[f.facet_key] ?? 0
        })).filter(f => f.id !== collectionId.value)

        result.push({
          id: 'collections',
          label: collectionsConfig?.label || 'Collections',
          values: collections,
          order: 0
        })
      }


      Object.entries(available)
        .filter(([id]) => id !== 'collections')
        .forEach(([id,values]) => {

          const config =
            configFacets.find(
              f => f.id === id
            )


          if(config?.enabled === false)
            return


          result.push({

            id,

            label:
              config?.label ||
              id,

            values,

            order:
              config?.order ?? 999

          })

        })


      return result.sort(
        (a,b)=>a.order-b.order
      )

    })

    const buildPassageUrl = (resId, hit, tocSettings, collId, resCollId, isDocProjectIdIncluded) => {
      if (!hit) return null

      const passageTocSettings = appConfig.value?.collectionsConf?.find(c => c.collectionId === resCollId)?.tableOfContentsSettings ?? tocSettings

      const { ancestors = [], passageId } = hit
      //console.log('searchPage debug ancestors, passageId, tocSettings?.editByCiteType', resId, hit, passageId, ancestors, passageTocSettings, resCollId)

      let refId = null

      // --- priorité : editByCiteType ---

      if (passageTocSettings?.editByCiteType?.length) {
        // Passage is itself a match
        if (
          hit.citeType &&
          passageTocSettings.editByCiteType.includes(hit.citeType.toLowerCase())
        ) {
          refId = passageId
        } else {
          // else check ancestors
          const match = ancestors.find(a =>
            a.citeType &&
            passageTocSettings.editByCiteType.includes(a.citeType.toLowerCase())
          )

          if (match) {
            //console.log('searchPage debug matching refId by editByCiteType', passageTocSettings, match.id)
            refId = match.id
          }
        }
      }

      // --- fallback : editByLevel ---
      if (!refId && passageTocSettings?.editByLevel) {
        const match = ancestors.find(a => a.level === passageTocSettings.editByLevel)
        if (match) {
          //console.log('searchPage debug matching refId by editByLevel', passageTocSettings, match.id)
          refId = match.id
        } else if (ancestors.length === 0 && passageTocSettings?.editByLevel === 1) {
          //console.log('searchPage debug matching refId by editByLevel default 1 ', passageTocSettings, passageId)
          refId = passageId
        }
      }

      // --- fallback ultime ---
      /*if (!refId && ancestors.length) {
        console.log('searchPage debug matching fallback ancestors ', ancestors, ancestors[ancestors.length - 1].id)
        refId = ancestors[ancestors.length - 1].id
      }*/

      // construction params AVEC collId si nécessaire
      const params = isDocProjectIdIncluded
        ? { collId, id: resId }
        : { id: resId }

      /*console.log('searchPage buildPassageUrl :', {
        name: 'Document',
        params,
        query: refId ? { refId } : {},
        hash:
            passageId && refId && passageId !== refId
                ? `#${passageId}`
                : passageId && !refId
                    ? `#${passageId}`
                    : ''
      })*/
      if (passageId === '__DOCUMENT__') {
        return {
          name: 'Document',
          params,
          query: {},
          hash: ''
        }
      }

      return {
        name: 'Document',
        params,
        query: refId ? { refId } : {},
        hash:
            passageId && refId && passageId !== refId
                ? `#${passageId}`
                : passageId && !refId
                    ? `#${passageId}`
                    : ''
      }
    }

    const tocSettings = collConfig.value?.tableOfContentsSettings


    const tableData = computed(() => {
      const result = search.result.value

      if (!result) return []

      // Cas groupé (buckets)
      if (Array.isArray(result.buckets)) {
        console.log('searchPage buckets', result.buckets)
        return result.buckets.map(bucket => ({
          ...bucket,
          identifier: bucket.resource_id || bucket.identifier || '—',

          hits: (bucket.hits || []).map(hit => {
            const normalizedHit = {
              passageId: hit.passage_id,
              title: hit.title || null,
              citeType: hit.citeType || null,
              level: hit.level,
              ancestors: hit.ancestors || [],
              highlight: hit.highlight || {}
            }

            const route = buildPassageUrl(
              bucket.resource_id,
              normalizedHit,
              tocSettings,
              collectionId.value,
              bucket.collection_ids?.[0],
              props.isDocProjectIdIncluded
            )

            return {
              ...normalizedHit,
              passageUrl: route ? router.resolve(route) : {}
            }
          })
        }))
      }

      // Cas tableau direct
      if (Array.isArray(result)) {
        return result.map(item => ({
          ...item,
          ...item.fields,
          identifier: item.resource_id || item.identifier || '—',
          details: []
        }))
      }

      return []
    })
    console.log('SearchPage debug table data', tableData, search.result.value)

    const columns = computed(() => {
      const configCols =
        props.collectionConfig?.homePageSettings?.listSection?.columns

      if (configCols?.length > 0) {
        return configCols
          .filter(col => col && (col.key || col.field)) // security null + lodash + fallback
          .map(col => ({
            key: col.key || col.field,
            label: col.label || (col.key || col.field),
            type: col.type || 'string',
            width: col.width
          }))
      }

      // fallback minimal (ancien comportement)
      return [
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'creator', label: 'Creator', type: 'text' },
        { key: 'date', label: 'Date', type: 'text' },
        { key: 'coverage', label: 'Coverage', type: 'text' }
      ]
    })

    const layout = inject('variable-layout')

    const isSearchMinimized = ref(false)

    const inputFacet = ref('')
    const facetType = 'collections'


    const availableFacets = computed(() =>
      search.facets.value?.available?.[facetType] || []
    )

    const showFacetSuggestions = computed(() =>
      facetSuggestions.value.length > 0
    )

    const facetSuggestions = computed(() => {
      const term = inputFacet.value.toLowerCase().trim()

      const facets = availableFacets.value

      if (!term) return facets.slice(0, 8)

      return facets
        .filter(f => f.label.toLowerCase().includes(term))
        .slice(0, 8)
    })

    const applyFacet = (facet) => {
      inputFacet.value = ''
      search.setFacet({
        facetType,
        value: facet.facet_key
      })

      executeSearches()
    }

    const activeFacetTags = computed(() => {
      const selected = search.facets.value?.selected || {}

      return Object.entries(selected).flatMap(([facetType, values]) => {
        return values.map(v => {
          const [id, label] = v.split('###')

          return {
            facetType,
            id,
            label: label || id,
            raw: v
          }
        })
      })
    })

    const removeFacet = (tag) => {
      store.commit('search/removeFacet', {
        facetType: tag.facetType,
        facetKey: tag.raw
      })
      executeSearches()
    }

    const removeAllFacets = () => {
      store.commit('search/clearFacets')
      executeSearches()
    }

    function removeActiveFacet(tag) {
      store.commit('search/removeFacet', {
        facetType: tag.facetType,
        facetKey: tag.raw
      })
      executeSearches()
    }


    function removeActiveRange(field){
      setRange(field, null)
      executeSearches()
    }


    function clearAllFilters(){

      store.commit('search/clearFacets')

      Object.keys(ranges.value)
        .forEach(field => {
          setRange(field, null)
        })

      executeSearches()

    }
    function onToggleFacet({ facetType, facetKey }) {

      const selected =
        search.facets.value.selected?.[facetType] || []

      if (selected.includes(facetKey)) {

        store.commit('search/removeFacet', {
          facetType,
          facetKey
        })

      } else {

        store.commit('search/setFacet', {
          facetType,
          value: facetKey
        })

      }
      executeSearches()
    }

    function openFacet(id){

      store.commit('search/setFacetOpened', id)
    }


    function closeFacet(id){

      store.commit('search/setFacetClosed', id)
    }

    function resetRange(rangeKey) {

      store.commit('search/removeSearchRange', rangeKey)
      executeSearches()
    }

    function resetFacet(facetType) {

      store.commit('search/removeFacetType', facetType)
      executeSearches()
    }

    // FILTERS
    const filters = computed(() => search.filters.value)

    const updateFilter = ({ key, value }) => {
      search.setSearchFilter({ key, value })
      search.setPageNum(1)
    }

    // SORT
    const toElasticSortField = key => {
      if (!key) return null

      const parts = key.split('.')

      const field = [
        'resource_metadata',
        ...parts
      ]
        .map((part, index) => {
          // Seuls les champs issus de dublinCore sont normalisés en lowercase
          if (parts[0] === 'dublinCore') {
            return part.toLowerCase()
          }

          return part
        })
        .join('.')

      return `${field}.keyword`
    }

    const updateSort = ({ key, direction }) => {
      if (!key || direction === 'none') {
        inputSort.value = null
        return
      }

      const elasticField = toElasticSortField(key)

      inputSort.value = direction === 'desc'
        ? `-${elasticField}`
        : elasticField
    }


    async function executeSearches() {
      layout.rawSearchedTerm.value = inputTerm.value

      const t = inputTerm.value?.trim()

      console.log('SearchPage executeSearches:', {
        isFulltextSearch: isFulltextSearch.value,
        term: t,
        collectionId: collectionId.value,
        activeCollectionId: activeCollectionId.value
      })

      if (t && t.length > 0) {
        // --- FULLTEXT ---
        search.setTerm(t)
        search.setCollectionId(collectionId.value)
      } else {
        // --- RESOURCE ---
        search.setTerm('')
        search.setCollectionId(collectionId.value)
      }
      store.commit('search/setSearchPage', 1)

      await search.execute()
    }

    const minimizeSearchForm = () => {
      isSearchMinimized.value = true
    }

    const expandSearchForm = () => {
      isSearchMinimized.value = false
    }

    const searchMinimizedCssClass = computed(() =>
        isSearchMinimized.value ? 'search-minimized' : ''
    )

    // const minPromotionYear = 1849
    // const minTopicYear = -500
    // const currentYear = new Date().getFullYear()


    // function getInitialState() {
    //   // initial values
    //   const initialTerm = ''
    //   // const initialTopicRange = [minTopicYear, currentYear]
    //   // const initialPromotionYearRange = [minPromotionYear, currentYear]
    //
    //   const temporal = search.temporal.value
    //   const initialPromotionYearRange = [
    //       temporal.promotion.min,
    //       temporal.promotion.max
    //   ]
    //   const initialTopicRange = [
    //       temporal.coverage.min,
    //       temporal.coverage.max
    //   ]
    //
    //   //
    //   // let topicRange = [minTopicYear, currentYear]
    //   //
    //   // if (search.allDocs && search.allDocs.length > 0) {
    //   //   const allTopics = search.allDocs
    //   //     .map(doc => doc.resource_metadata?.extensions?.['dct:coverage'])
    //   //     .filter(Boolean)
    //   //     .map(cov => cov.split('/').map(Number)) // "1200/1499" -> [1200,1499]
    //   //
    //   //   if (allTopics.length > 0) {
    //   //     const starts = allTopics.map(c => c[0])
    //   //     const ends = allTopics.map(c => c[1])
    //   //     topicRange = [Math.min(...starts), Math.max(...ends)]
    //   //   }
    //   // }
    //   const promotionRange =
    //     search.ranges.value['resource_metadata.dublincore.date']
    //
    //   const promotionYearRange = promotionRange
    //     ? [promotionRange.gte, promotionRange.lte]
    //     : initialPromotionYearRange
    //
    //   // Coverage
    //   const coverageRange =
    //     search.ranges.value['resource_metadata.extensions.dct:coverage']
    //
    //   const topicRange = coverageRange
    //     ? [coverageRange.gte, coverageRange.lte]
    //     : initialTopicRange
    //
    //   // --- Promotion Year Range ---
    //   const promotionYearValue = search.ranges['resource_metadata.dublincore.created']
    //
    //   // let promotionYearRange
    //   // if (promotionYearValue) {
    //   //   if (Array.isArray(promotionYearValue)) {
    //   //     // cas d’un tableau [min, max]
    //   //     promotionYearRange = promotionYearValue.map(Number)
    //   //   } else {
    //   //     // cas d’un nombre ou string simple
    //   //     const num = Number(promotionYearValue)
    //   //     promotionYearRange = [num, num]
    //   //   }
    //   // } else {
    //   //   promotionYearRange = initialPromotionYearRange
    //   // }
    //
    //
    //   // try to restore else get the initial values
    //   return {
    //     term: layout.rawSearchedTerm.value || initialTerm,
    //     isFulltextSearch: search.isFulltextSearch.value,
    //     isResultTableMode: search.isResultTableMode.value,
    //     topicRange,
    //     sort: search.sorts?.value,
    //     promotionYearRange,
    //     activeCollectionId: search.activeCollectionId
    //   }
    // }

    // const initialState = getInitialState()




    const initialState = {
      term: layout.rawSearchedTerm.value || '',
      isFulltextSearch: search.isFulltextSearch.value,
      isResultTableMode: search.isResultTableMode.value,
      temporalRanges: search.ranges.value,
      sort: search.sorts?.value,
      activeCollectionId: search.activeCollectionId
    }
    console.log('searchPage initialState', initialState)


    const inputTerm = ref(initialState.term)
    const inputSort = ref(initialState.sort)
    const onrollActive = ref([])

    const isFulltextSearch = computed({
      get: () => search.isFulltextSearch.value,
      set: (v) => search.setIsFulltextSearch(v)
    })

    const isModeOpen = ref(false)

    const searchTypeOptions = [
      { value: 'notice', text: 'notices' },
      { value: 'fulltext', text: 'plein texte' }
    ]

    const searchType = computed({
      get: () => (isFulltextSearch.value ? 'fulltext' : 'notice'),
      set: (val) => {
        search.setIsFulltextSearch(val === 'fulltext')
      }
    })

    const isInvalidQuery = computed(() => {
      if (!isFulltextSearch.value) return false
      return /[a-zA-Z0-9_.-]+:/.test(inputTerm.value || '')
    })

    const currentSearchLabel = computed(() => {
      return searchTypeOptions.find(o => o.value === searchType.value)?.text
    })

    function toggleModeDropdown() {
      isModeOpen.value = !isModeOpen.value
    }

    function selectSearchType(val) {
      searchType.value = val
      isModeOpen.value = false

      executeSearches()
    }

    const displayedCount = computed(() => {
      if (!isFulltextSearch.value || !inputTerm.value?.length) {
        return search.totalCount.value
      }

      return search.bucketCount.value ?? search.totalCount.value
    })


    const isResultTableMode = computed({
      get: () => search.isResultTableMode.value,
      set: (v) => {
        const pid = store.state.search.activeProjectId
        if (pid) store.state.search.byProject[pid].isResultTableMode = v
      }
    })

    // Promotion Range : input v-model and validation

    //const inputPromotionYearRange = ref(initialState.promotionYearRange)




    const deleteTerm = () => {
      inputTerm.value = ''
      executeSearches()
    }

    console.log('searchPage inputTerm.value', inputTerm.value)

    search.setNoHighlight(
      !isFulltextSearch.value ||
      !inputTerm.value ||
      inputTerm.value.length === 0
    )

    const noHighlight = computed(() => {
      const projectId = store.state.search.activeProjectId

      return store.state.search.byProject?.[projectId]?.noHighlight
    })

    const activeCollectionId = computed(() => {
      const projectId = store.state.search.activeProjectId

      return store.state.search.byProject?.[projectId]?.activeCollectionId
    })
    console.log('searchPage activeCollectionId', activeCollectionId.value)

    console.log('searchPage noHighlight', noHighlight.value)
    search.setTerm(inputTerm.value)

    // search.setRange(
    //     'resource_metadata.dublincore.created',
    //     `gte:${inputPromotionYearRange.value[0]},lte:${inputPromotionYearRange.value[1]}`
    // )
    // if (
    //   inputPromotionYearRange.value[0] != null &&
    //   inputPromotionYearRange.value[1] != null
    // ) {
    //   search.setRange(
    //     'temporal.dublincore.created',
    //     {
    //       gte: inputPromotionYearRange.value[0],
    //       lte: inputPromotionYearRange.value[1]
    //     }
    //   )
    // }

    // if (inputTopicRange.value[0] !== initialState.topicRange[0]) {
    //   search.setRange(
    //       'resource_metadata.extensions.dct:coverage',
    //       'gte:' + inputTopicRange.value[0]
    //   )
    // }
    //
    // if (inputTopicRange.value[1] !== initialState.topicRange[1]) {
    //   search.setRange(
    //       'resource_metadata.extensions.dct:coverage',
    //       'lte:' + inputTopicRange.value[1]
    //   )
    // }
    // if (
    //   inputTopicRange.value[0] != null ||
    //   inputTopicRange.value[1] != null
    // ) {
    //   search.setRange(
    //     'temporal.extensions.dct:coverage',
    //     {
    //       gte: inputTopicRange.value[0],
    //       lte: inputTopicRange.value[1]
    //     }
    //   )
    // }

    search.setSorts(inputSort.value)
    search.setIsFulltextSearch(isFulltextSearch.value)

    watch(inputTerm, () => {
      search.setTerm(inputTerm.value)
      search.setNoHighlight(
        !isFulltextSearch.value ||
        !inputTerm.value ||
        inputTerm.value.length === 0
      )
      /* recherche immédiate au typing (debounced)
      executeSearches()
       */
    })

    watch(isFulltextSearch, (v) => {
      search.setNoHighlight(
        !v ||
        !inputTerm.value ||
        inputTerm.value.length === 0
      )
      /* recherche immédiate à la selection (debounced)
      executeSearches()
       */
    })


    // watcher pour Promotion Year basé sur dublincore.created
    // watch(inputPromotionYearRange, ([gte, lte]) => {
    //
    //   const field = promotionField.value
    //
    //   if (!field) return
    //
    //   search.setRange(
    //     field,
    //     { gte, lte }
    //   )
    //
    //   search.setPageNum(1)
    //   executeSearches()
    // })
    //
    // // watcher pour Topic Range basé sur extensions.dct:coverage
    // watch(inputTopicRange, ([gte, lte]) => {
    //
    //   const minField =
    //     coverageMinField
    //
    //   const maxField =
    //     coverageMaxField
    //
    //   if (!minField || !maxField) return
    //
    //   if (gte == null && lte == null) return
    //
    //   search.setRange(
    //     minField,
    //     {
    //       lte
    //     }
    //   )
    //
    //   search.setRange(
    //     maxField,
    //     {
    //       gte
    //     }
    //   )
    //
    //   search.setPageNum(1)
    //   executeSearches()
    //
    // }, { deep: true })

    watch(inputSort, () => {
      search.setSorts(inputSort.value)
      search.setPageNum(1)
      executeSearches()
    })

    watch(
      collectionId,
      (newVal) => {
        if (newVal) {
          search.setSearchCollectionId(newVal)
          search.setCollectionId(newVal)
        }
      },
      { immediate: true }
    )

    const _pid = store.state.search.activeProjectId
    const _existingState = _pid ? store.state.search.byProject[_pid] : null
    const _hasResults = (_existingState?.totalCount ?? 0) > 0

    if (!_hasResults) {
      executeSearches()
    }

    onMounted(() => {
      console.log('isRef(search.loading)', search.loading)
      console.log('isRef(search.loading)', isRef(search.loading))
    })

    return {
      isDocProjectIdInc,
      collConfig,
      appConfig,
      dtsRootCollectionId,
      rootCollectionId,
      collectionId,
      currCollection,
      columns,
      page,
      pageSize,
      layout,
      search,
      tableData,
      executeSearches,
      minimizeSearchForm,
      expandSearchForm,
      facetSuggestions,
      inputFacet,
      applyFacet,
      activeFacetTags,
      removeFacet,
      removeAllFacets,
      removeActiveFacet,
      removeActiveRange,
      clearAllFilters,
      searchMinimizedCssClass,
      isFulltextSearch,
      toggleModeDropdown,
      currentSearchLabel,
      isModeOpen,
      searchTypeOptions,
      selectSearchType,
      displayedCount,
      isResultTableMode,
      inputTerm,
      isInvalidQuery,
      deleteTerm,
      filters,
      updateFilter,
      inputSort,
      updateSort,
      onrollActive,
      openedFacets,
      onTemporalChange,
      initialTemporal,
      visibleTemporal,
      visibleFacets,
      temporal,
      ranges,
      setRange,
      onToggleFacet,
      openFacet,
      closeFacet,
      resetRange,
      resetFacet
    }
  },
  methods: {
    rollActive: function (event, id) {
      event.preventDefault()
      if (this.onrollActive.includes(id) === false) {
        this.onrollActive.push(id)
      } else {
        const index = this.onrollActive.indexOf(id)
        if (index > -1) {
          this.onrollActive.splice(index, 1)
        }
      }
    },
    positionCssClass: function (position) {
      return this.onrollActive.includes(position.id) &&
        this.isFulltextSearch &&
        this.isResultTableMode &&
        position.highlight !== null
        ? 'is-selected'
        : ''
    }
  }
}
</script>
<style scoped>
a {
  border-bottom: none;
}
.collection-wrapper {
  width: 100%;
}

abbr {
  text-decoration: none !important;
}
thead tr {
  display: table-row;
}
th {
  white-space: nowrap;
}
th > div {
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: flex-end;
  border: none !important;
  text-decoration: none !important;
}
th > div > span {
  display: inline-block;
}
th > div.sortable {
  cursor: pointer;
}
th > div::before {
  content: "";
  display: inline-block;
  width: 32px;
  height: 32px;
  margin-bottom: 5px;
}
th > div.sortable::before {
  background: url(../assets/images/b_tri.svg) center / cover no-repeat;
}
th > div.sort-alpha-down::before {
  background-image: url(../assets/images/b_tri_AZ.svg);
}
th > div.sort-alpha-up::before {
  background-image: url(../assets/images/b_tri_ZA.svg);
}
th > div.sort-numeric-down::before {
  background-image: url(../assets/images/b_tri_19.svg);
}
th > div.sort-numeric-up::before {
  background-image: url(../assets/images/b_tri_91.svg);
}
tr td.oeil a,
tr td.chevron-down a,
tr td.chevron-up a {
  display: block;
  width: 35px;
  text-decoration: none !important;
  border-bottom: none !important;
}
tr td.oeil a:hover,
tr td.chevron-down a:hover,
tr td.chevron-up a:hover {
  background-color: transparent !important;
  text-decoration: none !important;
}
tr td.oeil a {
  width: 27px;
  height: 20px;
  background: url(../assets/images/b_oeil.svg) center / contain no-repeat;
}
.table tr.row-infos.is-selected td.oeil a {
  background-image: url(../assets/images/b_oeil_blc.svg);
}
tr td.chevron-up a::before,
tr td.chevron-down a::before {
  content: "";
  display: inline-block;
  width: 27px;
  height: 20px;
  transform-origin: 50%;
}
tr td.chevron-down a::before {
  background: url(../assets/images/croix_blc.svg) center / contain no-repeat;
}
tr td.chevron-up a::before {
  background: url(../assets/images/chevron_rouge.svg) center / contain no-repeat;
}

.description {
  text-align: center;
}
.tiles {
}
.tiles-section {
  background-color: #ffffff;
  padding-bottom: 100px;
}
.tile.is-parent {
  padding: 0;
}
.toggle-list-and-pagination {
  justify-content: space-between;
  align-items: center;
}
.toggle-list-and-pagination > div:first-child .is-inline-block {
  margin-bottom: 0 !important;
}
.toggle-list-and-pagination .sort-options select,
.toggle-list-and-pagination .sort-options > span {
  font-family: "Barlow", sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: #adadad;
}
.toggle-list-and-pagination .sort-options > span {
  text-transform: uppercase;
  margin: 0 10px 0 30px;
}
.toggle-list-and-pagination .sort-options select {
  background: transparent;
  inset: unset;
  border: #d9d8d3 solid 1px;
  padding: 3px 5px 5px 10px;
  margin-right: 10px;
}

.carousel-parent h2 {
  font-family: "Noto Serif", serif;
  font-size: 24px;
  text-align: center;
  font-weight: 700;
  font-style: italic;
  color: #5b5b5b;
}
.carousel-parent article .title,
.carousel-parent article .subtitle {
  font-family: "Noto Serif", serif;
}
.carousel-parent article .title {
  font-size: 35px;
  font-style: normal;
  line-height: 47px;
  font-weight: 400;
  color: #b9192f;
  margin-bottom: 0;
  text-align: left;
  text-indent: 0;
}
.carousel-parent article .subtitle {
  font-size: 25px;
  line-height: 32px;
}
.enc-logo {
  height: 64px;
  border-radius: 3px;
}

/*
  search form
*/
.search {
  border: 1px solid #e4e5df;
  border-radius: 3px;
}
.search-form-and-carousel {
  width: 100%;
  flex-basis: unset;
  /*gap: 20px;*/
  padding-bottom: 50px !important;
  border-bottom: solid 1px #b8b8b8;
  margin-bottom: 24px !important;
}
.search-form {
  background-color: #f0f0f0 !important;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
}
.search-form > *:first-child {
  display: flex;
  align-items: center;
  /*background-color: #868686;*/
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  padding: 32px 24px 34px 28px;
  margin-bottom: 0;
}
.search-form > *:not(:first-child) {
  background-color: #e4e4e4;
  margin-bottom: 0;
}
.search-form > *.search-form-footer {
  padding: 24px !important;
}
.search-form > div.minimized-controls {
  display: none;
}
.search-minimized .search-form > div.minimized-controls {
  display: flex;
  flex-direction: column;
  gap: 5px;
  height: 100%;
  background: none;
}
.search-minimized .search-form {
  flex: 44px 0 0;
  background: none;
}

.search-control {
  margin-right: 0px !important;
}

.search-minimized .search-form > div:not(.minimized-controls) {
  display: none !important;
}
.search-minimized .search-form > div.minimized-controls .search.button {
  flex: 44px 0 0;
}
.search-minimized .search-form > div.minimized-controls .expand-form-button.button {
  flex: calc(100% - 49px) 0 0;
}
.search-minimized .search-form > div.minimized-controls button.search.button.is-light {
  margin-left: 0;
}
.search-bar-row {
  display: flex;
  align-items: stretch;
  width: 100%;
  gap: 0;
}

/* SELECT */
.search-mode-wrapper {
  flex: 0 0 auto;
}

/* INPUT */
.search-input-wrapper {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
}

.search-form .input {
  width: 100%;
  border-radius: 0;
  height: 44px;
  box-shadow: none;
  padding-bottom: 6px;
  padding-top: 6px;
  border-color: #979797;
}
.search-form .input:focus {
  outline: none !important;
  box-shadow: none !important;
  border-color: #979797;
}
.search-form .input.input-error,
.search-form .input.input-error:focus {
  color: red !important;
  border: 1px solid red !important;
  box-shadow: 0 0 0 1px red !important;
}
.search-error-message {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  font-size: 12px;
  color: #d33;
  white-space: nowrap;
}

/* CLEAR SEARCH ICON */
.search-clear {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);

  width: 22px;
  height: 22px;
  padding: 0;

  border: none;
  background: transparent;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;
}

/* CIRCLE */
.search-clear span {
  position: relative;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1.5px solid #b8b8b8;
}

/* CROSS */
.search-clear span::before,
.search-clear span::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 1.5px;
  background-color: #b8b8b8;
  transform-origin: center;
}

.search-clear span::before {
  transform: translate(-50%, -50%) rotate(45deg);
}

.search-clear span::after {
  transform: translate(-50%, -50%) rotate(-45deg);
}

/* hover */
.search-clear:hover span {
  border-color: #666;
}

.search-clear:hover span::before,
.search-clear:hover span::after {
  background-color: #666;
}

/* CLEAR INPUTS */
.clear-input {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: var(--fill-color);
}

/* SEARCH BUTTON */
.search-submit {
  width: 44px;
  height: 44px !important;
  padding: 0;
  border: none;
  border-radius: 0 6px 6px 0;
  color: var(--fill-color);
  background: var(--fill-color) url(../assets/images/bouton_loupe.svg) center no-repeat;
  background-size: cover;
  cursor: pointer;
}
.search-submit:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  filter: grayscale(1);
}

/* optionnel: fusion visuelle */
.search-mode-trigger {
  height: 44px;
  border-radius: 6px 0 0 6px;
}

.search-form button.expand-form-button.button {
  background: #868686 url(../assets/images/chevron_blanc_recherche.svg) left 15px top 20px /
    15px auto no-repeat;
  border-radius: 4px !important;
}

.search-form-footer {
  font-family: "Barlow", sans-serif;
  background-color: #f0f0f0 !important;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
  justify-content: space-between;
  align-items: center;
}
.search-form-footer .control label {
  margin-right: 10px;
  font-size: 14px;
  line-height: 35px;
  font-weight: 500;
  color: #979797;
  text-transform: uppercase;
}
.search-form-footer .results-count {
  display: flex;
  flex-direction: column;
}
.search-form-footer .results-count > span {
  text-align: center;
}
.search-form-footer .results-count > span:first-child {
  font-size: 50px;
  line-height: 50px;
  font-weight: 700;
  color: #7e7e7e;
}
.search-form-footer .results-count.dot-flash > span:first-child {
  background: linear-gradient(
      90deg,
      #eee 25%,
      #ddd 50%,
      #eee 75%
  );
  background-size: 200% 100%; /* width doubled for animation */
  animation: shimmer 1.4s ease infinite;
}
.search-form-footer .results-count > span:last-child {
  font-size: 12px;
  font-weight: 500;
  color: #4a4a4a;
  text-transform: uppercase;
}
/* toggle */
.search-mode-wrapper {
  position: relative;
  display: inline-block;
}

.search-mode-trigger {
  display: flex;
  align-items: center;
  gap: 6px;

  background: #fff;
  border: 1px solid var(--fill-color);
  color: var(--fill-color);

  padding: 10px 14px;
  border-radius: 6px 0 0 6px;

  cursor: pointer;
  font-size: 14px;
  text-transform: lowercase;
}

.search-mode-trigger .arrow {
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid var(--fill-color);
}

.search-mode-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;

  background: white;
  border: 1px solid #ddd;
  z-index: 20;
}

.search-mode-option {
  padding: 10px 12px;
  cursor: pointer;
  font-size: 14px;
  text-transform: lowercase;
}

.search-mode-option:hover {
  background: #f2f2f2;
}

.search-mode-option.active {
  background: #c00055;
  color: white;
}

/* sliders */
.sliders {
  font-family: "Barlow", sans-serif;
  font-weight: 500;
  text-transform: uppercase;
}
.sliders label {
  font-size: 16px;
  color: #4a4a4a;
  margin-bottom: 10px;
}
.sliders span {
  font-size: 14px;
  color: #979797;
}
.sliders input[type="number"].year {
  inset: unset;
  border: none;
  text-shadow: none;
  -moz-appearance: textfield;
  background-color: #fff;

  max-width: 70px;
  padding: 2px 0;
  margin: 0 15px;

  font-family: "Barlow", sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #979797;
  text-transform: uppercase;
  text-align: center;
}
.sliders input[type="number"].year:focus {
  outline: solid 2px #b9192f;
}
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.sliders span.year {
  background-color: #fff;
  padding: 2px 20px;
  margin: 0 15px;
}
.slider-control {
  flex: 50% 0 0;
  padding: 24px;
}
.slider-control label {
  display: block;
}
.vue-slider.vue-slider-ltr {
  margin-top: 15px !important;
  padding: 0 10px !important;
  height: 3px !important;
}
.vue-slider :deep(.vue-slider-dot) {
  width: 18px !important;
  height: 18px !important;
}
.vue-slider:hover :deep(.vue-slider-rail),
.vue-slider :deep(.vue-slider-rail) {
  background-color: #ffffff;
}
.vue-slider :deep(.vue-slider:hover .vue-slider-process),
.vue-slider :deep(.vue-slider-process) {
  background-color: #b9192f !important;
}
.vue-slider :deep(.vue-slider-dot-handle:hover),
.vue-slider :deep(.vue-slider-dot-handle-focus),
.vue-slider :deep(.vue-slider-dot-handle) {
  border-color: #b9192f !important;
}
.vue-slider :deep(.vue-slider-dot-handle-focus) {
  box-shadow: 0 0 0 5px rgba(185, 25, 47, 0.2);
}

/* carousel */
.carousel-parent {
  flex: 355px 0 0;
  background-color: #f6f2ed;
  border-radius: 6px;
  padding: 10px;
}
.carousel-parent h2 {
  padding-top: 0;
}
.search-minimized .carousel-parent {
  flex: calc(100% - 64px) 0 0;
  padding-left: 10px;
}
.search-minimized .carousel-parent article {
}
.search-minimized .carousel-parent .content {
  padding-left: 30%;
}
.search-minimized .carousel-parent h2 {
  text-align: left;
  margin: 0;
  padding-left: 0;
}
.carousel-parent article {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.carousel-parent article .title {
  font-size: 24px;
  text-align: center;
  vertical-align: top;
  font-weight: 700 !important;
  font-style: italic;
  text-transform: none;
  color: #5b5b5b;
  margin: 0;
}
.carousel-parent article .subtitle {
  font-size: 20px;
  line-height: 32px;
  text-align: center;
  margin: 0;
}
.carousel-parent article .content {
  flex: auto 3 1;
}
.carousel-parent article .content > div {
  height: 100%;
}
.carousel-parent article :deep(canvas) {
  max-width: 100%;
}
.carousel-parent article :deep(.carousel) {
  height: 100%;
}

/* search table */
.table-container {
  font-family: "Barlow Semi Condensed", sans-serif;
  margin-top: 24px;
  overflow-y: auto;
  min-height: 600px;
}
.table {
  min-width: 100%;
}
.table thead {
  background-color: #f0f0f0;
}
.table thead th {
  padding: 15px 0 12px 20px;
  background: none;
  text-transform: uppercase;
}
.table tr.row-infos.is-selected {
  background-color: #a3a3a3 !important;
}
tr.row-infos > td {
  padding: 14px 0 14px 20px;
  font-size: 16px;
  font-weight: 500;
  line-height: 22px;
  color: #666666;
  border: none;
  border-top: #b9192f 1px dashed;
}
tr.row-infos > td a {
  color: #666666;
}
tr.row-infos.is-selected > td > a,
tr.row-infos.is-selected > td {
  color: #ffffff !important;
}
tr.row-infos:last-child > td {
  border-bottom: #b9192f 3px solid;
}
tr.row-infos > td:nth-child(1) {
  text-transform: uppercase;
}
tr.row-infos > td:nth-child(2) {
  /* font-weight: 600; */
}
tr.row-infos > td:nth-child(3) {
  color: #000000;
}
tr.row-infos > td:nth-child(4) > a {
  font-size: 18px;
  font-weight: 400 !important;
  line-height: 24px;
  color: #4a4a4a;
  text-decoration: none;
  border: none;
}
tr.row-infos:hover {
  cursor: pointer;
}
tr.row-details {
  background-color: #f6f6f6;
}
.position-highlight span,
tr.row-details li {
  display: inline;
}
.position-highlight span:not(:last-child)::after,
tr.row-details li:not(:last-child)::after {
  content: " ••• ";
}
tr.row-details :deep(td) {
  border: inherit;
}
tr.row-details :deep(ul) {
  padding: 25px 25px 40px;
}
tr.row-details :deep(li) {
  font-family: "Libre Baskerville", serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 28px;
  color: #5f5f5f;
}
/* search text results */
.text-results .table {
  margin-top: 24px;
}
.text-results .table > a {
  display: block;
  padding-top: 15px;
  border-top: #b9192f 1px dashed;
  font-family: "Barlow Semi Condensed", sans-serif;
}
.text-results .table > a:last-child {
  border-bottom: #b9192f 3px solid;
}
.text-results .table > a .columns.mb-6 {
  margin-bottom: 10px !important;
}
.text-results .table > a .position-title {
  width: 65%;
  font-size: 22px;
  font-weight: 600;
  line-height: 26px;
  color: #000000;
  margin-bottom: 10px;
}
.text-results .table > a .position-author {
  font-size: 16px;
  font-weight: 600;
  line-height: 22px;
  text-transform: uppercase;
  color: #666666;
}
.text-results .table > a .position-infos {
  font-size: 16px;
  font-weight: 600;
  color: #828282;
}
.text-results .table > a .position-infos span.year {
  margin-right: 8px;
}
.text-results .table > a .position-infos span.period {
  margin-left: 8px;
}
.text-results .table > a .position-highlight {
  font-family: "Libre Baskerville", serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 28px;
  color: #5f5f5f;
  margin-top: 15px;
}
tr.row-details :deep(em),
.text-results .table > a :deep(em) {
  background-color: #ffec00;
  border-radius: 3px;
  font-style: normal;
  padding: 4px 5px;
}

@media screen and (max-width: 1040px) {
  .sliders {
    flex-direction: column;
    padding-bottom: 10px;
  }
  .slider-control {
    padding: 18px 24px;
    margin-bottom: 0;
  }
  .toggle-list-and-pagination {
    flex-direction: column;
    justify-content: flex-start;
  }
  .toggle-list-and-pagination > div:first-child {
    width: 100%;
    align-self: flex-start;
    display: flex !important;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  .toggle-list-and-pagination > div:last-child {
    align-self: center;
  }
  .text-results .table > a {
    padding-top: 0;
  }
  .text-results .table > a .columns.mb-6 {
    margin: 10px 0;
  }
  .text-results .table > a > .columns > .column:first-child {
    display: none;
  }
  .text-results .table > a > .columns > .column:last-child,
  .text-results .table > a .position-title {
    width: 100%;
  }
}

@media screen and (max-width: 900px) {
  .title-tile {
    flex-direction: column !important;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 20px;
  }
  .search-form-footer .control {
    flex-direction: column;
  }
  .search-form-footer .control label {
    margin-bottom: 5px;
  }
  .text-results .table > a .columns.mb-6 {
    flex-direction: column;
  }
}
@media screen and (max-width: 800px) {
  .tiles-section {
    padding-bottom: 40px;
  }
  .toggle-list-and-pagination > div {
    flex-direction: column;
    align-items: flex-start;
    gap: 30px;
  }
  .toggle-list-and-pagination > div:first-child > .is-inline-block {
    align-self: center;
    margin-bottom: 20px !important;
  }
  .toggle-list-and-pagination .sort-options > span {
    margin-left: 0;
  }
  .table,
  .table tr {
    width: 100%;
  }
  .table-container thead tr,
  .table-container tr.row-infos {
    display: flex;
    flex-wrap: wrap;
  }
  .table-container thead tr {
    justify-content: flex-start;
  }
  .table-container thead tr > th {
    flex: 25% 0 0;
  }
  .table-container thead tr > th:nth-child(2),
  .table-container thead tr > th:nth-child(4),
  .table-container thead tr > th:nth-child(7),
  .table-container thead tr > th:nth-child(8) {
    display: none;
  }
  .table-container thead tr > th:nth-child(5),
  .table-container thead tr > th:nth-child(6) {
    padding: 15px 20px 12px 0;
  }
  .table-container thead tr > th:nth-child(5) div.sortable,
  .table-container thead tr > th:nth-child(6) div.sortable {
    align-items: flex-end;
    justify-content: flex-start;
  }
  .table-container thead tr > th:nth-child(5) div.sortable abbr {
    padding-right: 12px;
  }
  .table-container tr.row-infos {
    border-top: #b9192f 1px dashed;
    padding: 10px 20px;
    position: relative;
  }
  .table-container tr.row-infos:last-child {
    padding-bottom: 20px;
    border-bottom: #ba0f29 solid 3px;
  }
  .table-container tr.row-details td {
    padding: 0;
  }
  .table-container tr.row-details ul {
    padding: 15px;
  }
  .text-results .table > a .position-highlight,
  tr.row-details li {
    font-size: 14px;
    line-height: 24px;
  }
  tr.row-infos > td {
    border: none !important;
    padding: 0;
  }
  tr.row-infos.is-selected > td::before {
    color: #fff !important;
  }
  tr.row-infos > td:nth-child(1) {
    /* Nom */
    order: 1;
    font-size: 18px;
    margin-right: 10px;
  }
  tr.row-infos > td:nth-child(2) {
    order: 2;
    font-size: 16px;
  }
  tr.row-infos > td:nth-child(3) {
    /* Promotion */
    order: 4;
    flex: 100% 0 0;
    padding-top: 10px;
    font-weight: 500;
    color: #000000;
  }
  tr.row-infos > td:nth-child(3)::before {
    content: "Promotion : ";
    color: #666666;
  }
  tr.row-infos > td:nth-child(4) {
    /* Titre */
    order: 3;
    flex: 100% 0 0;
    padding: 4px 50px 0 0;
  }
  tr.row-infos > td:nth-child(4) > a {
    font-weight: 600 !important;
    line-height: 22px;
  }
  tr.row-infos > td:nth-child(5) {
    order: 5;
    color: #000000;
  }
  tr.row-infos > td:nth-child(5)::before {
    content: "Période du sujet : de";
    margin: 0 5px 0 0;
    color: #666666;
  }
  tr.row-infos > td:nth-child(6) {
    order: 6;
    color: #000000;
  }
  tr.row-infos > td:nth-child(6)::before {
    content: "à";
    margin: 0 5px;
    color: #666666;
  }
  tr.row-infos > td:nth-child(7) {
    order: 7;
    position: absolute;
    top: 15px;
    right: 20px;
  }
  tr.row-infos > td:nth-child(8) {
    order: 8;
    position: absolute;
    bottom: 10px;
    right: 12px;
  }
}
@media screen and (max-width: 768px) {
  .carousel-parent {
    margin-top: 20px !important;
  }
  .search-minimized .carousel-parent .content {
    padding-left: 0 !important;
  }
  .search-minimized .carousel-parent h2 {
    text-align: center !important;
  }

  .search-minimized .search-form > div.minimized-controls {
    display: none !important;
  }
  .search-minimized .search-form > div.minimized-controls {
    display: none;
  }
  .search-minimized .search-form > div:not(.minimized-controls) {
    display: flex !important;
  }
  .search-minimized .search-form {
    flex: unset;
  }
}
@media screen and (max-width: 640px) {
  .table thead th {
    padding-left: 10px;
  }
  .table-container thead tr > th:nth-child(6) {
    padding-right: 10px;
  }
  .table-container tr.row-infos {
    padding: 10px 40px 10px 10px;
  }
  tr.row-infos > td:nth-child(7) {
    right: 10px;
  }
  tr.row-infos > td:nth-child(8) {
    right: 0;
  }
}
.search-facets {
  padding: 40px;
}

</style>
