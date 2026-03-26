<template>
  <div
    v-if="displayMode !== 'toc'"
    class="pagination has-text-centered is-flex is-flex-direction-row is-justify-content-center"
  >
    <Pagination
      v-if="displayMode !== 'toc'"
      v-model="currentPage"
      :total-pages="totalPages"
      :is-loading="false"
      :documents-count-text="documentsCountText"
    />
  </div>
  <!-- RESOURCE LIST AS CARDS (applicable conf (cascade): homePageSettings.listSection.displayMode = 'card') -->
  <!-- or RESOURCE LIST AS CARDS AND TABLE OF CONTENT (applicable conf (cascade): homePageSettings.listSection.displayMode = 'mixed') -->
  <div
    v-if="paginated.length && (displayOpt === 'card' || (displayOpt === 'mixed' && displayMode === 'mixed'))"
    class="resources-grid"
    :class="displayMode !== 'toc' ? `${displayMode}-mode` : 'toc-mode'"
  >
    <div
      v-for="(item, index) in paginated"
      :key="item.identifier"
      class="document-card"
    >
      <template v-if="item['@type'] === 'Collection' || item.citeType === 'Collection'">
        <div class="collection-wrapper">
          <div
            v-if="true"
            class="card-header"
          >
            <div
              class="card-link"
              :class="{ clickable: canNavigate(item), disabled: !canNavigate(item) }"
              @click="handleClick(item)"
            >
              <div class="card-image">
                <img
                  v-if="ImgUrl(item.identifier)"
                  :src="ImgUrl(item.identifier)"
                  alt=""
                />
                <img
                  v-else
                  src="@/assets/images/dots-logo-retro.drawio.svg"
                  alt=""
                />
              </div>
              <div class="collection-metadata">
                <div class="collection-metadata-author-date">
                  <span>
                    {{ Array.isArray(item.dublincore.creator)
                      ? item.dublincore.creator.join(', ')
                      : item.dublincore.creator }}
                  </span>
                  <span>{{ item.dublincore.date }}</span>
                </div>
                <div class="collection-metadata-title">
                  {{ item.title }}
                </div>
              </div>
            </div>
            <div
              class="collection-description"
            >
              <span
                :ref="el => textEls.push(el)"
                class="collection-description-text"
                :class=" descExpandedItems[item.identifier] ? 'expanded' : '' "
              >
                <span
                  v-if="item.description"
                  class="read-more"
                  @click="expandDescription(item.identifier)"
                >
                  {{ descExpandedItems[item.identifier] === true ? '[Lire moins]' : '[Lire la suite]' }}
                </span>
                {{ item.description }}
              </span>
            </div>
          </div>
          <div
            v-else-if="isDocProjectIdInc && item.parent !== rootCollectionId"
            class="card-header"
          >
            <div class="document-folder">
              <div class="card-header-first-line">
                <div class="collection-metadata is-flex-direction-column">
                  <span class="collection-metadata-title">
                    {{ item.title }}
                  </span>
                  <div class="is-flex is-flex-direction-column">
                    <span>
                      {{ Array.isArray(item.dublincore.creator)
                        ? item.dublincore.creator.join(', ')
                        : item.dublincore.creator }}
                    </span>
                    <span>
                      {{ item.dublincore.date }}
                    </span><!-- v-if="c.date" -->
                  </div>
                  <div class="collection-description">
                    <span>
                      {{ item.description }}
                    </span>
                  </div>
                </div>
                <div class="card-image is-flex is-justify-content-center">
                  <a
                    href=""
                    class="disabled"
                  >
                    <img
                      v-if="ImgUrl(item.identifier)"
                      :src="ImgUrl(item.identifier)"
                      alt=""
                    />
                    <img
                      v-else
                      src="@/assets/images/dots-logo-retro.drawio.svg"
                      alt=""
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          v-if="displayOpt === 'mixed'"
          class="collection-toc-area"
          :class="expandedById[item.identifier] || displayMode === 'mixed' ? 'expanded': ''"
          @click.prevent="toggleExpanded(item)"
        >
          <div
            class="collection-toc-area-header"
          >
            Contenu
          </div>
          <div
            v-if="(expandedById[item.identifier] || item.expanded || displayMode === 'mixed')
              && item.totalChildren > 0
              && item.children?.length > 0"
            class="menu app-width-margin expanded"
          >
            <CollectionTOC
              :is-doc-projectId-included="isDocProjectIdInc"
              :display-option="displayOpt"
              :current-collection="item"
              :dts-root-collection-identifier="dtsRootCollectionId"
              :root-collection-identifier="rootCollectionId"
              :application-config="appConfig"
              :collection-config="collConfig"
              :margin="$props.margin"
              :toc="item.children"
              :level="lvl+1"
            />
          </div>
        </div>
      </template>
      <!-- ELSE resource is a resource of type (@type / citeType) resource  -->
      <template v-else>
        <div class="card-header">
          <div class="document-folder">
            <router-link
              class="card-header-first-line"
              :to="!isDocProjectIdInc ? { name: 'Document', params: { id: item.identifier }} : { name: 'Document', params: { collId: item.projectIdentifier ? item.projectIdentifier : item.identifier, id: item.identifier } }"
            >
              <div class="collection-metadata is-flex-direction-column">
                <span class="collection-metadata-title">
                  {{ item.title }}
                </span>
                <div class="is-flex is-flex-direction-column">
                  <span>
                    {{ Array.isArray(item.dublincore.creator)
                      ? item.dublincore.creator.join(', ')
                      : item.dublincore.creator }}
                  </span>
                  <span>
                    {{ item.dublincore.date }}
                  </span><!-- v-if="c.date" -->
                </div>
                <div class="collection-description">
                  <span>
                    {{ item.description }}
                  </span><!-- v-if="c.date" -->
                </div>
              </div>
              <!-- no image planned at resource level for now -->
            </router-link>
          </div>
        </div>
      </template>
    </div>
  </div>

  <!-- RESOURCE LIST AS TOC (conf: homePageSettings.listSection.displayMode = 'toc' or unset) -->

  <div
    v-if="(displayMode === 'toc')"
    :class="`collection-toc-area app-width-margin ${expandedById[currCollection.identifier] ? 'expanded': ''} toc-mode`"
  >
    <div
      v-if="(displayMode === 'toc' && lvl < 2)"
      class="collection-toc-area-header"
      @click.prevent="toggleExpanded(currCollection)"
    ><!-- && rootCollectionId === currCollection.identifier -->
      <a
        v-if="componentTOC.length === 1 && (componentTOC[0].type === 'Resource' || componentTOC[0]['@type'] === 'Resource')"
        href="#"
        class="collBrowseButton"
      >
        Accéder au document
      </a>
      <a
        v-else
        href="#"
        class="collBrowseButton"
      >
        {{ browseBttnTxt }}
      </a>
      <a
        href="#"
        class="toggle-btn"
        :class="expandedById[currCollection.identifier] ? 'expanded' : ''"
      />
    </div>
    <div
      v-if="displayMode === 'toc'"
      class="menu app-with-margin"
      :class="expandedById[currCollection.identifier] ? 'expanded': ''"
    >
      <div v-if="expandedById[currCollection.identifier]">
        <ul
          class="tree"
        >
          <template
            v-for="(item, index) in componentTOC"
            :key="item.identifier"
          >
            <li
              :style="`margin-left: ${ $props.margin }px;`"
              :class="item.totalChildren > 0 ? 'more' : ''"
            >
              <div class="li container">
                <button
                  v-if="item.totalChildren > 0"
                  class="toc-toggle"
                  :aria-expanded="expandedById[item.identifier] || item.expanded ? true : false"
                  aria-label="Afficher les éléments enfants"
                  @click.stop="toggleExpanded(item)"
                >
                  <TocArrows
                    :key="expandedById[item.identifier] || item.expanded"
                    :direction="expandedById[item.identifier] || item.expanded ? 'down' : 'right'"
                    :size="30"
                    :radius="3"
                  />
                </button>
                <template
                  v-if="item['@type'] === 'Collection' || item.citeType === 'Collection'"
                >
                  <Collection-icon
                    class="collection-icon"
                    :size="30"
                    :radius="0"
                  />
                  <a
                    v-if="!isDocProjectIdInc"
                    :href="getHref(item)"
                    :class="expandedById[item.identifier] ? 'is-current' : ''"
                    @click="goToPage(item, $event)"
                  >
                    {{ item.title }}
                  </a>
                  <a
                    v-else-if="isDocProjectIdInc && item.parent === rootCollectionId && rootCollectionId !== dtsRootCollectionId"
                    :href="getHref(item)"
                    :class="route.params.id === item.identifier ? 'is-current' : ''"
                    @click="goToPage(item, $event)"
                  >
                    {{ item.title }}
                  </a>
                  <a
                    v-else-if="isDocProjectIdInc && item.parent === rootCollectionId && rootCollectionId === dtsRootCollectionId"
                    :href="getHref(item)"
                    :class="route.params.id === item.identifier ? 'is-current' : ''"
                    @click="goToPage(item, $event)"
                  >
                    {{ item.title }}
                  </a>
                  <a
                    v-else-if="isDocProjectIdInc && item.parent !== rootCollectionId"
                    :href="getHref(item)"
                    :class="expandedById[item.identifier] ? 'is-current' : ''"
                    @click="goToPage(item, $event)"
                  >
                    {{ item.title }}
                  </a>
                </template>
                <a
                  v-else-if="isDocProjectIdInc && selectedParent === rootCollectionId"
                  :href="getHref(item)"
                  :class="route.params.id === item.identifier ? 'is-current' : ''"
                  @click="goToPage(item, $event)"
                >
                  <ResourceIcon
                    class="resource-icon"
                    :size="30"
                    :radius="0"
                  />
                  {{ item.title }}
                </a>
                <a
                  v-else-if="isDocProjectIdInc && selectedParent !== rootCollectionId && item.projectIdentifier && !Array.isArray(item.parent)"
                  :href="getHref(item)"
                  :class="route.params.id === item.identifier ? 'is-current' : ''"
                  @click="goToPage(item, $event)"
                >
                  <ResourceIcon
                    class="resource-icon"
                    :size="30"
                    :radius="0"
                  />
                  {{ item.title }}
                </a>
                <a
                  v-else-if="isDocProjectIdInc && selectedParent !== rootCollectionId"
                  :href="getHref(item)"
                  :class="route.params.id === item.identifier ? 'is-current' : ''"
                  @click="goToPage(item, $event)"
                >
                  <ResourceIcon
                    class="resource-icon"
                    :size="30"
                    :radius="0"
                  />
                  {{ item.title }}
                </a>
                <a
                  :href="getHref(item)"
                  v-else-if="!isDocProjectIdInc"
                  :class="route.params.id === item.identifier ? 'is-current' : ''"
                  @click="goToPage(item, $event)"
                >
                  <ResourceIcon
                    class="resource-icon"
                    :size="30"
                    :radius="0"
                  />
                  {{ item.title }}
                </a>
                <a
                  v-else
                  :href="getHref(item)"
                  :class="route.params.id === item.identifier ? 'is-current' : ''"
                  @click="goToPage(item, $event)"
                >
                  <ResourceIcon
                    class="resource-icon"
                    :size="30"
                    :radius="0"
                  />
                  {{ item.title }}
                </a>
              </div>
              <div
                v-if="(expandedById[item.identifier] || item.expanded)
                  && item.totalChildren > 0
                  && item.children?.length > 0"
                class="is-tree-opened menu app-width-margin expanded"
              >
                <CollectionTOC
                  :is-doc-projectId-included="isDocProjectIdInc"
                  :display-option="displayOpt"
                  :current-collection="item"
                  :dts-root-collection-identifier="dtsRootCollectionId"
                  :root-collection-identifier="rootCollectionId"
                  :application-config="appConfig"
                  :collection-config="collConfig"
                  :margin="$props.margin + 23"
                  :toc="item.children"
                  :level="lvl+1"
                />
              </div>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted, nextTick, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getAncestors, getMetadataFromApi } from '@/api/document.js'
import { usePagination } from '@/composables/usePagination.js'
import { getSimpleObject } from '@/composables/utils.js'
import { router } from '@/router'
import store from '@/store'

import TocArrows from '@/assets/images/TocArrows.vue'
import CollectionIcon from '@/assets/images/CollectionIcon.vue'
import ResourceIcon from '@/assets/images/ResourceIcon.vue'
import Pagination from '@/components/Pagination.vue'

const collator = new Intl.Collator('fr', {
  numeric: true,
  sensitivity: 'base'
})

export default {
  name: 'CollectionTOC',

  components: { ResourceIcon, CollectionIcon, TocArrows, Pagination },

  props: {
    isDocProjectIdIncluded: {
      type: Boolean,
      required: true
    },
    displayOption: {
      type: String,
      required: false
    },
    dtsRootCollectionIdentifier: {
      type: String,
      required: true
    },
    rootCollectionIdentifier: {
      type: String,
      required: true
    },
    applicationConfig: {
      type: Object
    },
    collectionConfig: {
      type: Object
    },
    currentCollection: {
      type: Object
    },
    toc: {
      required: true,
      default: () => [],
      type: Array
    },
    margin: {
      required: true,
      default: 0,
      type: Number
    },
    level: {
      required: false,
      type: Number
    }
  },
  setup (props) {
    // HELPERS
    const customSort = (A, B) => {
      const bIndex = new Map(B.map((val, index) => [val, index]))

      return A.slice().sort((a, b) => {
        const aId = a.identifier
        const bId = b.identifier

        const aInB = bIndex.has(aId)
        const bInB = bIndex.has(bId)

        if (aInB && bInB) {
          return bIndex.get(aId) - bIndex.get(bId)
        } else if (aInB) {
          return -1
        } else if (bInB) {
          return 1
        }

        // DEFAULT SORTING: natural + French + without diacritics
        return collator.compare(a.title, b.title)
      })
    }

    // CONSTANT PROPS
    const route = useRoute()

    const isDocProjectIdInc = computed(() =>
      props.isDocProjectIdIncluded
    )

    const dtsRootCollectionId = computed(() =>
      props.dtsRootCollectionIdentifier
    )

    const rootCollectionId = computed(() =>
      props.rootCollectionIdentifier
    )

    const collectionBreadcrumb = ref([])

    const appConfig = computed(() =>
      props.applicationConfig
    )

    const collConfig = computed(() =>
      props.collectionConfig
    )

    const currCollection = ref({...props.currentCollection})

    const browseBttnTxt = computed(() =>
      props.collectionConfig?.homePageSettings?.listSection?.browseButtonText
    )

    const displayOpt = computed(() =>
        props.applicationConfig?.homePageSettings?.listSection?.displayMode?.length > 0
        ? props.applicationConfig.homePageSettings.listSection.displayMode
        : props.displayOption
    )


    // TABLE OF CONTENT

    // TOC DATA
    const componentTOC = ref([...props.toc])

    // IMAGES
    const ImgUrl = (source) => {
      // TODO: provide a logo object with url AND legend ?
      const imgSourceConfig = appConfig.value.collectionsConf.filter(coll => coll.collectionId === source)[0]
      if (imgSourceConfig?.homePageSettings?.listSection?.logo?.length > 0) {
        // console.log('HomePage ImgUrl found : ', imgSourceConfig.homePageSettings.listSection.logo)
        const images = Object.fromEntries(Object.entries(import.meta.glob('confs/*/assets/images/*.*', {eager: true})).map(([key, value]) => {
          const newKey = key.split('/').slice(-4).join('/')
          return [newKey, value]
        }))
        //console.log('HomePage ImgUrl images: ', images)
        const match = images[`${imgSourceConfig.collectionId}/assets/images/${imgSourceConfig.homePageSettings.listSection.logo}`]
        // console.log('HomePage ImgUrl match: ', match)
        if (imgSourceConfig.homePageSettings.listSection.logo.includes('https')) {
          return imgSourceConfig.homePageSettings.listSection.logo
        } else {
          return match.default // new URL(`/src/assets/images/${imgSourceConfig.homePageSettings.logo}`, import.meta.url).href
        }
      } else {
        return false
      }
    }

    // REACTIVE TOC
    const lvl = ref(props.level)

    const expandedById = ref(
      displayOpt.value === 'toc'
        ? (
            lvl.value === 1
              ? (collConfig.value?.homePageSettings?.listSection?.openState
                  ? { [currCollection.value.identifier]: true }
                  : {})
              : { [currCollection.value.identifier]: true }
          )
        : { [currCollection.value.identifier]: true }
    )

    console.log('CollectionTOC setup vars: ', displayOpt.value, collConfig.value?.collectionId, collConfig.value?.homePageSettings?.listSection?.openState, lvl.value)

    const selectedParent = ref(props.currentCollection ? props.currentCollection.identifier : '')

    const toggleExpanded = async (coll) => {
      console.log('CollectionTOC toggleExpanded componentTOC collId source: ', componentTOC.value, coll)
      const collId = coll.identifier || coll['@id']
      const projectId = coll.projectIdentifier

      const idx = componentTOC.value.findIndex(item => item['@id'] === collId || item.identifier === collId)
      console.log('CollectionTOC toggleExpanded idx', idx)
      if (idx !== -1) {
        const item = componentTOC.value[idx]

        if (!item.children || item.children.length === 0) {
          let response = await getMetadataFromApi(collId, null, null)
          console.log('CollectionTOC toggleExpanded response', response)

          response?.member?.forEach(m => getSimpleObject(m, collId, projectId))
          console.log('CollectionTOC toggleExpanded response after identifier', componentTOC.value, response)

          if ((!coll?.parent?.length && displayOpt.value === 'mixed' && displayMode.value !== 'toc') || displayOpt.value === 'mixed' && displayMode.value === 'toc') {
            console.log('CollectionTOC toggleExpanded mark deeper levels mixed child members as toc', displayOpt.value, displayMode.value)
            response.member.forEach(c => c.forcedDisplayOpt = 'toc')
            console.log('CollectionTOC toggleExpanded mark deeper levels mixed child members as toc updated : ', response.member)
          }

          // Reassigning to ensure Vue reactivity
          /*componentTOC.value[idx] = {
            ...item,
            member: response.member,
            children: response.member
          }*/
          componentTOC.value[idx].member = response.member
          componentTOC.value[idx].children = response.member

          console.log('CollectionTOC toggleExpanded componentTOC', componentTOC.value)
        }
      }
      selectedParent.value = collId
      //console.log('CollectionTOC after selectedParent.value : ',  selectedParent.value)
      expandedById.value[collId] = !expandedById.value[collId]
      console.log('CollectionTOC toggleExpanded after expandedById[collectionId] : ', collId, expandedById.value, componentTOC.value)
    }


    const openInitialCollections = async () => {
      console.log('CollectionTOC openInitialCollections componentTOC.value', componentTOC.value)
      const collections = componentTOC.value.filter(
          item => item.citeType === 'Collection' || item['@type'] === 'Collection'
      )

      for (const comp of collections) {
        const conf = appConfig.value.collectionsConf.find(c => c.collectionId === comp.identifier)
        console.log('CollectionTOC openInitialCollections conf', conf)

        if (displayOpt.value === 'toc') {
          // Lower levels of Cards are unavailable by design and Lists are not hierarchy objects
          if (conf?.homePageSettings?.listSection?.openState) {
            await toggleExpanded(comp)
            // wait next render
            await nextTick()
          }
        } else if (displayOpt.value === 'mixed' && displayMode.value === 'mixed') {
          // Lower levels of Mixed mode are opened by default
          console.log('CollectionTOC openInitialCollections opening mixed first lower level (after first level displayMode is "toc"', comp)
          await toggleExpanded(comp)
          // wait next render
          await nextTick()
        }
      }
    }



    console.log('CollectionTOC setup componentTOC', currCollection.value.identifier, componentTOC.value, currCollection.value, expandedById, lvl)

    // DISPLAY OPTIONS

    const displayMode = computed(() => {
      const allowed = ['card', 'list', 'mixed', 'toc']

      const normalize = val =>
        typeof val === 'string' ? val.toLowerCase() : null

      const forced = normalize(currCollection.value?.forcedDisplayOpt)
      if (allowed.includes(forced)) return forced

      const mode = normalize(displayOpt.value)
      if (allowed.includes(mode)) return mode
      return 'toc'
    })

    // CARDS EXPANDABLE DESCRIPTION
    const textEls = ref([])
    let resizeObserver = null
    const isTextTruncated = (el) => {
      if (!el) return
      const truncated = el.scrollHeight > el.clientHeight
      el.classList.toggle('truncated', truncated)
    }

    const descExpandedItems = ref({}) // clé = item.identifier

    const expandDescription = (id) => {
      descExpandedItems.value[id] = !descExpandedItems.value[id]
      console.log('expanded', descExpandedItems.value)
    }


    // PAGINATION
    const pageSize = computed(() =>
      props.collectionConfig?.homePageSettings?.listSection?.cardCollectionPerPage
    )
    const currentPage = ref(1)

    const pagination = usePagination(componentTOC, pageSize, currentPage)

    const totalResults = computed(() => componentTOC.value.length)

    const totalPages = computed(() =>{
      if (displayOpt.value === 'toc') {
        return null
      } else return pagination.totalPages.value
    })
    const paginated = computed(() => {
      return pagination.paginated.value
    })

    const documentsCountText = computed(() => {
      const ds = componentTOC.value || []
      const curr = currCollection.value
      const rootId = rootCollectionId.value
      const display = displayOpt.value

      if (!ds.length) return '0 ressources'

      const allCollections = ds.every(
        item => item.type === 'Collection' || item['@type'] === 'Collection'
      )

      if (display === 'card' || display === 'mixed') {
        if (curr?.identifier === rootId) {
          const label = ds.length <= 1 ? 'projet' : 'projets'
          return `${ds.length} ${label}`
        } else if (allCollections) {
          const label = ds.length <= 1 ? 'collection' : 'collections'
          return `${ds.length} ${label}`
        }
      }

      if (!allCollections) {
        const label = ds.length <= 1 ? 'ressource' : 'ressources'
        return `${ds.length} ${label}`
      }

      return '' // fallback
    })

    // TOC ACTIONS AND NAVIGATION
    const setStateCollection = (collId) => {
      store.commit('setCollectionId', collId)
    }

    // CARDS (incl. CARDS OF MIXED DISPLAY MODE) LINK MANAGEMENT
    const canNavigate = (item) => {
      //console.log('canNavigate isDocProjectIdInc.value item.parent rootCollectionId.value item.identifier item.projectIdentifier ', isDocProjectIdInc.value, item.parent, rootCollectionId.value, item.identifier, item.projectIdentifier)
      return isDocProjectIdInc.value && (item.parent === rootCollectionId.value || item.identifier === item.projectIdentifier)
    }

    const handleClick = (item) => {
      if (!canNavigate(item)) return

      router.push({
        name: 'Home',
        params: { collId: item.identifier }
      })
    }

    // TOC MODE NAV
    const goToPage = async (item, event) => {
      // Browser events handling
      if (
        event?.metaKey ||
        event?.ctrlKey ||
        event?.shiftKey ||
        event?.button === 1
      ) {
        return
      }

      const to = getRoute(item)

      // Collections with routing → toggle
      if (!to) {
        await toggleExpanded(item)
        return
      }
      event.preventDefault()

      await router.push(to)
      setStateCollection(selectedParent.value)
    }

    const getRoute = (item) => {
      const isCollection =
        item['@type'] === 'Collection' || item.citeType === 'Collection'

      if (isCollection) {
        if (!isDocProjectIdInc.value) return null

        if (
          item.parent === rootCollectionId.value &&
          rootCollectionId.value !== dtsRootCollectionId.value
        ) {
          return {
            name: 'Home',
            params: { collId: item.identifier }
          }
        }

        if (
          item.parent === rootCollectionId.value &&
          rootCollectionId.value === dtsRootCollectionId.value
        ) {
          return {
            name: 'Home',
            params: {
              collId: item.projectIdentifier
                ? (item.projectIdentifier !== item.parent
                    ? item.projectIdentifier
                    : item.identifier)
                : item.identifier
            }
          }
        }

        return null
      }

      // documents (@type Resource)
      if (isDocProjectIdInc.value) {
        if (selectedParent.value === rootCollectionId.value) {
          return {
            name: 'Document',
            params: {
              collId: rootCollectionId.value,
              id: item.identifier
            }
          }
        }

        if (
          selectedParent.value !== rootCollectionId.value &&
          item.projectIdentifier &&
          !Array.isArray(item.parent)
        ) {
          return {
            name: 'Document',
            params: {
              collId: item.projectIdentifier,
              id: item.identifier
            }
          }
        }

        if (selectedParent.value !== rootCollectionId.value) {
          return {
            name: 'Document',
            params: {
              collId: Array.isArray(item.parent)
                ? (item.parent.find(p => p === route.params.collId)
                    ? route.params.collId
                    : item.parent[0])
                : item.parent,
              id: item.identifier
            }
          }
        }
      }

      return {
        name: 'Document',
        params: {
          id: item.identifier
        }
      }
    }

    // TOC MODE GET ROW LINK TO DISPLAY
    const getHref = (item) => {
      const to = getRoute(item)
      return to ? router.resolve(to).href : null
    }

    onMounted(async () => {
      //await nextTick()
      const observer = new ResizeObserver(entries => {
        entries.forEach(entry => {
          isTextTruncated(entry.target)
        })
      })

      textEls.value.forEach(el => {
        observer.observe(el)
        isTextTruncated(el)
      })
    })

    onUnmounted(() => {
      if (resizeObserver && textEls.value) {
        resizeObserver.unobserve(textEls.value)
      }
    })

    watch(
  () => store.state.currentItem,

        async (newVal) => {
        if (route.name !== 'Document') return
        console.log('CollectionTOC watch collectionBreadcrumb.value newVal', newVal)

        const ancestors = await getAncestors(newVal)
        console.log('CollectionTOC watch collectionBreadcrumb.value ancestors', ancestors)
        collectionBreadcrumb.value = (ancestors || [])
          .flat()
          .filter(anc => anc['@type'] === 'Collection')
          .map(col => col['@id'])
        console.log('CollectionTOC watch collectionBreadcrumb.value', collectionBreadcrumb.value)
        const items = componentTOC.value
            .filter(it =>
              it['@type'] === 'Collection' &&
              collectionBreadcrumb.value.includes(it.identifier)
            )

        for (const c of items) {
          if (!expandedById.value?.[c['@id']]) {
            await toggleExpanded(c)
          }
        }
        await nextTick()
      },
      { immediate: true }
    )

    watch(
  () => [currCollection.value],
  async () => {
        if (displayOpt.value === 'toc' && lvl.value === 1 && props.collectionConfig?.homePageSettings?.listSection?.openState) {
          console.log('CollectionTOC watch opening first level based on openState : ', props.collectionConfig?.homePageSettings?.listSection?.openState)
          await openInitialCollections()
        } else if ((displayOpt.value === 'mixed') && lvl.value < 2) {
          console.log('CollectionTOC watch opening up to 2nd level')
          await openInitialCollections()
        }

        if ((!currCollection.value?.parent?.length && displayOpt.value === 'mixed' && displayMode.value !== 'toc')) {
          console.log('CollectionTOC watch mark deeper levels mixed child members as toc')
          componentTOC.value.forEach(c => c.forcedDisplayOpt = 'toc')
          console.log('CollectionTOC watch mark deeper levels mixed child members as toc, updated : ', componentTOC.value)
        }
        console.log('CollectionTOC watch rootCollectionId.value === currCollection.value.parent', rootCollectionId.value, currCollection.value.parent)
      },{ immediate: true }
    )

    watch(
      () => props.toc,
      async (newVal) => {
        if (!newVal) return
        let result

        if (collConfig.value?.homePageSettings?.listSection?.displaySort?.length > 0) {
          result = customSort(newVal, collConfig.value.homePageSettings.listSection.displaySort)
        } else {
          result = [...newVal].sort((a, b) =>
            collator.compare(a.title, b.title)
          )
        }

        componentTOC.value.splice(0, componentTOC.value.length, ...result)
        if ((!currCollection.value?.parent?.length && displayOpt.value === 'mixed' && displayMode.value !== 'toc') || displayOpt.value === 'mixed' && displayMode.value === 'toc') {
          console.log('CollectionTOC watch mark deeper levels mixed child members as toc')
          componentTOC.value.forEach(c => c.forcedDisplayOpt = 'toc')
          console.log('CollectionTOC watch mark deeper levels mixed child members as toc updated : ', componentTOC.value)
        }
      },
      { immediate: true }
    )

    return {
      route,
      isDocProjectIdInc,
      collectionBreadcrumb,
      lvl,
      displayOpt,
      dtsRootCollectionId,
      rootCollectionId,
      appConfig,
      collConfig,
      customSort,
      browseBttnTxt,
      toggleExpanded,
      ImgUrl,
      expandedById,
      selectedParent,
      componentTOC,
      setStateCollection,
      openInitialCollections,
      textEls,
      resizeObserver,
      descExpandedItems,
      expandDescription,
      canNavigate,
      handleClick,
      displayMode,
      currCollection,
      currentPage,
      pageSize,
      totalPages,
      paginated,
      totalResults,
      documentsCountText,
      getHref,
      getRoute,
      goToPage
    }
  }
}
</script>

<style scoped>
.document-list {
  display: flex;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  padding-top: 25px;
  padding-bottom: 25px;
}

.collection-toc-area, .modal-wrapper {
  .tree {
    padding-top: 10px;
    padding-bottom: 10px;
  }

  .tree li {
    font-family: "Barlow Semi Condensed", sans-serif;
    font-size: 15px;
    font-weight: 500;
    line-height: 22px;
    padding: 0;
    margin-bottom: 4px;

    &::before {
      display: none;
    }

    & > .li.container {
        display: flex;
        margin: 0;
      & > a {
        display: inline-flex !important;
        align-items: center;
        gap: 0.1rem;
        border-bottom: none;
        color: #4a4a4a !important;
        &.is-current {
          font-weight: bolder !important;
          color: var(--text-color) !important;
        }
      }
    }

    &.more {
      padding-left: 0 !important;

      & > .li.container > a, span {
        margin-top: 4px;
        &.is-current {
          font-weight: bold !important;
          color: var(--text-color) !important;
        }
      }

      &::before {
        content: none !important;
      }
    }
  }
}

button.toc-toggle {
  /* remove default button behavior */
  appearance: none;
  -webkit-appearance: none;

  background: transparent;
  border: none;

  flex-shrink: 0;
  width: 30px;
  height: 30px;
  padding: 0;
  margin: 0;

  color: var(--fill-color);

  cursor: pointer;
}
.is-current {
  color: var(--text-color) !important;
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}
.toc-mode .document-card {
  display: flex;
  flex-direction: column;
  min-height: 580px;
  height: auto;

  border-bottom-right-radius: 18px;
}
.toc-mode .card-header {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.toc-mode .document-card.expanded {
  display: flex;
  flex-direction: column;
  height: fit-content;

  border-bottom-right-radius: 18px;
  margin: 15px;
}
.toc-mode .card-link {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
  border-bottom-right-radius: inherit;
}
.toc-mode .card-image {
  height: 180px;
  flex-shrink: 0;
  overflow: hidden;
  background: var(--fill-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.toc-mode .card-image img {
  max-height: 100%;
  max-width: 100%;
}
.toc-mode .collection-metadata {
  display: flex;
  flex-direction: column;
  color: white;
  background: black;
}
.toc-mode .collection-metadata-author-date {
  display: flex;
  flex-direction: column;
  padding-left: 18px;
  padding-right: 18px;
  padding-top: 5px;
  padding-bottom: 5px;
  line-height: 1.3;
  word-break: break-word;
}
.toc-mode .collection-metadata-title {
  display: block;
  padding-left: 18px;
  padding-right: 18px;
  padding-top: 5px;
  padding-bottom: 5px;
  font-family: Roboto-Bold, SansSerif;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.3;
  word-break: break-word;
}
.toc-mode .collection-description {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 18px;
  color: #333333;
  background: var(--meta-area-fill-color);
  overflow: hidden;
}
.toc-mode .collection-description-text {
  --line-clamp: 11;

  display: -webkit-box;
  -webkit-line-clamp: var(--line-clamp);
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.toc-mode .collection-description-text.expanded {
  display: block;
  height: 100%;
  overflow: unset;
  margin-bottom: 18px;
}
.toc-mode .collection-description-text::before {
  content: '';
  float: right;
  height: calc(min((var(--line-clamp) - 1) * 1lh, 100%));
}
.toc-mode .collection-description-text.expanded::before {
  height: 100%;
}
.toc-mode .collection-description-text > .read-more {
  clear: both;
  float: right;
  font-weight: 600;
  margin-left: 0.5em;
  cursor: pointer;
}
/*.collection-description-text:not(.truncated) > .read-more {
  display: none;
}*/

/* Mode activation */
.card-mode.resources-grid {
  display: grid !important;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}

/* Cards */
.card-mode .document-card {
  display: flex;
  flex-direction: column;
  min-height: 580px;
  height: auto;
  border-bottom-right-radius: 18px;
}

.card-mode .document-card.expanded {
  display: flex;
  flex-direction: column;
  height: fit-content;
  border-bottom-right-radius: 18px;
  margin: 15px;
}

/* Header */
.card-mode .card-header {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-bottom-right-radius: 18px;
  box-shadow: unset;
}

/* Link */
.card-mode .card-link {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
  border-bottom-right-radius: inherit;
}

.card-mode .card-link.clickable {
  cursor: pointer;
}

.card-mode .card-link.disabled {
  cursor: default;
  opacity: 0.7;
}

/* Image */
.card-mode .card-image {
  height: 180px;
  flex-shrink: 0;
  overflow: hidden;
  background: var(--fill-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-mode .card-image img {
  max-height: 100%;
  max-width: 100%;
}

/* Metadata */
.card-mode .collection-metadata {
  display: flex;
  flex-direction: column;
  color: white;
  background: black;
}

.card-mode .collection-metadata-author-date {
  display: flex;
  flex-direction: column;
  padding: 5px 18px;
  line-height: 1.3;
  word-break: break-word;
}

.card-mode .collection-metadata-title {
  display: block;
  padding: 5px 18px;
  font-family: Roboto-Bold, SansSerif;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.3;
  word-break: break-word;
}

/* Description */
.card-mode .collection-description {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 18px;
  border-bottom-right-radius: 18px;
  color: #333333;
  background: var(--meta-area-fill-color);
  overflow: hidden;
}

.card-mode .collection-description-text {
  --line-clamp: 11;
  display: -webkit-box;
  -webkit-line-clamp: var(--line-clamp);
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-mode .collection-description-text.expanded {
  display: block;
  height: 100%;
  overflow: unset;
  margin-bottom: 18px;
}

.card-mode .collection-description-text::before {
  content: '';
  float: right;
  height: calc(min((var(--line-clamp) - 1) * 1lh, 100%));
}

.card-mode .collection-description-text.expanded::before {
  height: 100%;
}

.card-mode .collection-description-text > .read-more {
  clear: both;
  float: right;
  font-weight: 600;
  margin-left: 0.5em;
  cursor: pointer;
}

.mixed-mode.resources-grid {
  display: flex;
  flex-direction: column;
}
.collection-icon {
  color: var(--text-color);
}
.resource-icon {
  color: var(--text-color);
}

/* Card */
.mixed-mode .document-card {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  margin: 20px 0;
}

.mixed-mode .document-card.expanded {
  display: flex;
  flex-direction: column;
  height: fit-content;
  border-bottom-right-radius: 18px;
  margin: 15px;
}

/* Wrapper gauche */
.mixed-mode .collection-wrapper {
  display: flex;
  flex-direction: column;
  width: 30%;
  margin-right: 20px;

  border-radius: 25px 25px 0 25px;

  color: white;
  background-color: var(--fill-color) !important;
}

/* Header */
.mixed-mode .card-header {
  display: flex;
  flex-direction: column;
  height: 100%;
  text-align: left;
  background-color: transparent !important;
}

/* Metadata */
.mixed-mode .collection-metadata {
  display: flex;
  flex-direction: column;
}

.mixed-mode .collection-metadata-title {
  display: block;
  padding: 18px;
  font-family: Roboto-Bold, SansSerif;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.3;
  word-break: break-word;
}

/* Description */
.mixed-mode .collection-description {
  display: flex;
  height: 100%;
  padding: 18px;
}

/* TOC */
.mixed-mode .toc-wrapper {
  width: 100%;
  padding: 18px;
  border-top-left-radius: 25px;
  background-color: #e4e4e4;
}
.mixed-mode .card-link.clickable {
  cursor: pointer;
}

.mixed-mode .card-link.disabled {
  cursor: default;
  opacity: 0.7;
}

.mixed-mode .toc-header {
  padding-left: 9px;
  font-family: Roboto-Bold, SansSerif;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-color);
}

.mixed-mode .collection-toc-area-header {
  padding-left: 18px;
  padding-top: 18px;
  border-top-left-radius: 25px;
  font-family: Roboto-Bold, SansSerif;
  font-size: 20px;
  font-weight: 700;

  color: var(--text-color);
}
.mixed-mode .expanded.menu {
  border-radius: 0;
}

/* useless items in mixed mode */
.mixed-mode .card-image,
.mixed-mode .collection-metadata-author-date,
.mixed-mode .read-more {
  display: none !important;
}

.mixed-mode .toc-mode .card-link { display: block !important; }

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
