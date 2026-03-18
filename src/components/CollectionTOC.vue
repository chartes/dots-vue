<template>
  <div
    v-if="(currentCollection.identifier === rootCollectionId && displayOpt !== 'list' && currentCollection.member.every(item => item.citeType === 'Collection')) || (displayOpt === 'card' && currentCollection.member.every(item => item.citeType === 'Collection'))"
    :class="displayOpt === 'card' && currentCollection.identifier !== rootCollectionId ? 'card-view' : 'project-view'"
  >
    <div
      v-for="(item, index) in componentTOC"
      :key="index"
      class="document-card"
    >
      <template v-if="item['@type'] === 'Collection' || item.citeType === 'Collection'">
        <div
          v-if="isDocProjectIdInc && item.parent === rootCollectionId"
          class="card-header"
        >
          <div class="document-folder">
            <router-link
              class="card-header-first-line"
              :to="{ name: 'Home', params: { collId: item.identifier }}"
            >
              <div class="collection-metadata is-flex-direction-column">
                <div class="collection-metadata-author-date-title">
                  <div class="collection-metadata-author-date is-flex is-flex-direction-column">
                  <span>
                    {{ item.author }} {{ item.dublincore.creator }}
                  </span>
                  <span>
                  {{ item.dublincore.date }}
                  </span><!-- v-if="c.date" -->
                  </div>
                  <div class="collection-metadata-title">
                    {{ item.title }}
                  </div>
                </div>
                <div class="collection-description">
                  <span>
                    {{ item.description }}
                  </span><!-- v-if="c.date" -->
                </div>
              </div>
              <div class="card-image is-flex is-justify-content-center">
                <router-link :to="{ name: 'Home', params: { collId: item.identifier }}">
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
                </router-link>
              </div>
            </router-link>
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
                    {{ item.author }} {{ item.dublincore.creator }}
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
                </a><!-- router-link :to="{ name: 'Home', params: { collId: item.extensions ? Array.isArray(item.extensions['dots:dotsProjectId']) ? item.extensions['dots:dotsProjectId'].filter(p => p === route.params.collId)[0] : item.extensions['dots:dotsProjectId'] : item.extensions['dots:dotsProjectId'] }}" -->
              </div>
            </div>
          </div>
        </div>
        <div
          v-if="isDocProjectIdInc && item.parent !== rootCollectionId && !componentTOC.map(i => i['@type']).every(t => t === 'Resource')"
          class="collection-toc-area"
          :class="expandedById[item.identifier] ? 'expanded': ''"
          @click.prevent="toggleExpanded(item.identifier)"
        >
          <div
            v-if="(expandedById[item.identifier] || item.expanded)
              && item.totalChildren > 0
              && item.children?.length > 0"
            class="menu app-width-margin expanded"
          >
            <CollectionTOC
              :is-doc-projectId-included="isDocProjectIdInc"
              :current-collection="item"
              :dts-root-collection-identifier="dtsRootCollectionId"
              :root-collection-identifier="rootCollectionId"
              :application-config="appConfig"
              :collection-config="collConfig"
              :margin="$props.margin"
              :toc="item.children"
            />
          </div>
        </div>
        <div
          v-else-if="!isDocProjectIdInc"
          class="wrapper"
        >
          TO DO : VITE_APP_DOCUMENT_ROUTE_INCLUDE_PROJECT_ID=false && VITE_APP_ROOT_DTS_COLLECTION_ID n'est pas DTS root
        </div><!-- && item.parent !== rootCollectionId && !componentTOC.map(i => i['@type']).every(t => t === 'Resource')-->
      </template>
      <!-- ELSE resource is a resource of type (@type / citeType) resource  -->
      <template v-else>
        <div class="card-header">
          <div class="document-folder">
            <router-link
              class="card-header-first-line"
              :to="!isDocProjectIdInc ? { name: 'Document', params: { id: item.identifier }} : { name: 'Document', params: { collId: item.extensions ? item.extensions['dots:dotsProjectId'] : item.identifier, id: item.identifier } }"
            >
              <div class="collection-metadata is-flex-direction-column">
                <span class="collection-metadata-title">
                  {{ item.title }} {{ !isDocProjectIdInc }}
                </span>
                <div class="is-flex is-flex-direction-column">
                  <span>
                    {{ item.author }} {{ item.dublincore.creator }}
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
  <ul
    v-else
    class="tree"
  >
    <template
      v-for="(item, index) in componentTOC"
      :key="index"
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
            @click="toggleExpanded(item.identifier)"
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
            <span
              v-if="!isDocProjectIdInc"
              :class="route.params.collId ? route.params.collId === item.identifier ? 'is-current' : '' : ''"
              @click="toggleExpanded(item.identifier)"
            >
              {{ item.title }}
            </span>
            <router-link
              v-else-if="isDocProjectIdInc && item.parent === rootCollectionId && rootCollectionId !== dtsRootCollectionId"
              :class="route.params.id === item.identifier ? 'is-current' : ''"
              :to="{ name: 'Home', params: {collId: item.identifier} }"
            >
              {{ item.title }}
            </router-link>
            <router-link
              v-else-if="isDocProjectIdInc && item.parent === rootCollectionId && rootCollectionId === dtsRootCollectionId"
              :class="route.params.id === item.identifier ? 'is-current' : ''"
              :to="{ name: 'Home', params: {collId: item['dots:dotsProjectId'] ? item['dots:dotsProjectId'] !== item.parent ? item['dots:dotsProjectId'] : item.identifier : item.identifier} }"
            >
              {{ item.title }}
            </router-link>
            <span
              v-else-if="isDocProjectIdInc && item.parent !== rootCollectionId"
              :class="route.params.collId ? route.params.collId === item.identifier ? 'is-current' : '' : ''"
              @click="toggleExpanded(item.identifier)"
            >
              {{ item.title }}
            </span>
          </template>
          <!--<span
            v-if="!isDocProjectIdInc && (item['@type'] === 'Collection' || item.citeType === 'Collection')"
            :class="route.params.collId ? route.params.collId === item.identifier ? 'is-current' : '' : ''"
            @click="toggleExpanded(item.identifier)"
          >
            {{ item.title }}
          </span>
          <router-link
            v-else-if="isDocProjectIdInc && item.parent === rootCollectionId && (item['@type'] === 'Collection' || item.citeType === 'Collection')"
            :class="route.params.id === item.identifier ? 'is-current' : ''"
            :to="{ name: 'Home', params: {collId: item.extensions ? Array.isArray(item.extensions['dots:dotsProjectId']) ? item.extensions['dots:dotsProjectId'].filter(p => p === route.params.collId)[0] : item.extensions['dots:dotsProjectId'] !== item.parent ? item.extensions['dots:dotsProjectId'] : item.identifier : item.identifier} }"
          >
            {{ item.title }}
          </router-link>
          <span
            v-else-if="isDocProjectIdInc && item.parent !== rootCollectionId && (item['@type'] === 'Collection' || item.citeType === 'Collection')"
            :class="route.params.collId ? route.params.collId === item.identifier ? 'is-current' : '' : ''"
            @click="toggleExpanded(item.identifier)"
          >
            {{ item.title }}
          </span>-->
          <!-- for items without normalized metadata (extensions['dots:dotsProjectId'] has not been moved to ['dots:dotsProjectId'] -->
          <router-link
            v-else-if="isDocProjectIdInc && selectedParent !== rootCollectionId && item.extensions && item.extensions['dots:dotsProjectId'] === route.params.collId"
            :class="route.params.id === item.identifier ? 'is-current' : ''"
            :to="{ name: 'Document', params: { collId: item.extensions ? item.extensions['dots:dotsProjectId'] : item.identifier, id: item.identifier } }"
            @click.prevent="setStateCollection(selectedParent)"
          >
            {{ item.title }}
          </router-link>
          <!-- for items with normalized metadata (extensions['dots:dotsProjectId'] moved to ['dots:dotsProjectId'] -->
          <router-link
            v-else-if="isDocProjectIdInc && selectedParent !== rootCollectionId && item['dots:dotsProjectId'] === route.params.collId"
            :class="route.params.id === item.identifier ? 'is-current' : ''"
            :to="{ name: 'Document', params: { collId: item['dots:dotsProjectId'] ? item['dots:dotsProjectId'] : item.identifier } }"
            @click.prevent="setStateCollection(selectedParent)"
          >
            {{ item.title }}
          </router-link>
          <router-link
            v-else-if="isDocProjectIdInc && selectedParent !== rootCollectionId"
            :class="route.params.id === item.identifier ? 'is-current' : ''"
            :to="{ name: 'Document', params: { collId: Array.isArray(item.parent) ? item.parent.find(p => p === route.params.collId) ? route.params.collId : item.parent[0] : item.parent, id: item.identifier } }"
            @click.prevent="setStateCollection(selectedParent)"
          >
            {{ item.title }}
          </router-link>
          <router-link
            v-else
            :class="route.params.id === item.identifier ? 'is-current' : ''"
            :to="{ name: 'Document', params: { id: item.identifier } }"
          >
            {{ item.title }}
          </router-link>
        </div>
        <div
          v-if="(expandedById[item.identifier] || item.expanded)
            && item.totalChildren > 0
            && item.children?.length > 0"
          class="is-tree-opened menu app-width-margin expanded"
        >
          <CollectionTOC
            :is-doc-projectId-included="isDocProjectIdInc"
            :current-collection="item"
            :dts-root-collection-identifier="dtsRootCollectionId"
            :root-collection-identifier="rootCollectionId"
            :application-config="appConfig"
            :collection-config="collConfig"
            :margin="$props.margin + 23"
            :toc="item.children"
          />
        </div>
      </li>
    </template>
  </ul>
</template>

<script>
import { ref, watch, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { getMetadataFromApi } from '@/api/document.js'
import store from '@/store'

import TocArrows from '@/assets/images/TocArrows.vue'

const collator = new Intl.Collator('fr', {
  numeric: true,
  sensitivity: 'base'
})

export default {
  name: 'CollectionTOC',

  components: { TocArrows },

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
    }
  },
  setup (props) {
    const route = useRoute()
    const isDocProjectIdInc = ref(props.isDocProjectIdIncluded)
    const displayOpt = ref(props.displayOption)
    const dtsRootCollectionId = ref(props.dtsRootCollectionIdentifier)
    const rootCollectionId = ref(props.rootCollectionIdentifier)
    const appConfig = ref(props.applicationConfig)
    const collConfig = ref(props.collectionConfig)
    const sourceConfig = ref({})
    const browseBttnTxt = ref(props.collectionConfig.homePageSettings.listSection.browseButtonText)

    const expandedById = ref({})

    const selectedParent = ref(props.currentCollection ? props.currentCollection.identifier : '')

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
    sourceConfig.value = collConfig.value

    const componentTOC = ref([])
    if (sourceConfig.value?.homePageSettings?.listSection?.displaySort?.length > 0) {
      // console.log('CollectionTOC setup displaySort', collConfig.value.homePageSettings.listSection.displaySort)
      componentTOC.value = customSort(props.toc, sourceConfig.value.homePageSettings.listSection.displaySort)
    } else {
      componentTOC.value = props.toc
      // componentTOC.value.sort((a, b) => a.title.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '') > b.title.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '') ? 1 : -1)
      componentTOC.value.sort((a, b) => collator.compare(a.title, b.title))
    }
    console.log('componentTOC.value props.toc : ', componentTOC.value)

    const toggleExpanded = async (collId) => {
      console.log('CollectionTOC toggleExpanded componentTOC collId source: ', componentTOC.value, collId)

      const idx = componentTOC.value.findIndex(item => item['@id'] === collId || item.identifier === collId)
      if (idx !== -1) {
        const item = componentTOC.value[idx]

        if (!item.children || item.children.length === 0) {
          const response = await getMetadataFromApi(collId, null, null)
          console.log('CollectionTOC response', response)

          response.member.forEach(m => { m.parent = collId })
          console.log('CollectionTOC response after identifier', response)

          // Reassigning to ensure Vue reactivity
          componentTOC.value[idx] = {
            ...item,
            member: response.member,
            children: response.member
          }
          console.log('CollectionTOC componentTOC', componentTOC.value)
        }
      }
      console.log('CollectionTOC expandedById.value', expandedById.value)

      selectedParent.value = collId
      console.log('CollectionTOC after selectedParent.value : ', collId)
      expandedById.value[collId] = !expandedById.value[collId]
      console.log('CollectionTOC after expandedById[collectionId] : ', collId, expandedById.value)
    }

    /* expandedById.value = componentTOC.value.filter(item => item.expanded === true).map(col => [col.identifier, true])
    console.log("componentTOC.value expandedById.value : ", expandedById.value) */
    /*if (collConfig.value.homePageSettings.listSection.openState) {
      if (componentTOC.value.filter(item => item.citeType === 'Collection').length > 0) {
        for (const comp of componentTOC.value.filter(item => item.citeType === 'Collection')) {
          console.log('CollectionTOC loop comp.identifier ', comp.identifier, appConfig.value.collectionsConf.find(item => item.collectionId === comp.parent) || appConfig.value.collectionsConf.find(item => item.collectionId === comp.identifier))
          const existingParentCollConfiguration = appConfig.value.collectionsConf.find(item => item.collectionId === comp.parent) || appConfig.value.collectionsConf.find(item => item.collectionId === comp.identifier)
          if (existingParentCollConfiguration?.homePageSettings?.listSection?.openState) {
            await toggleExpanded(comp.identifier)
            expandedById.value = Object.assign({}, ...componentTOC.value.filter(item => item.citeType === 'Collection').map((x) => ({ [x.identifier]: true })))
          }
          //expandedById.value = Object.assign({}, { comp.identifier: 'true'},  ...expandedById.value)
        }
      }
      //expandedById.value = Object.assign({}, ...componentTOC.value.filter(item => item.citeType === 'Collection').map((x) => ({ [x.identifier]: true })))
    } else {
      expandedById.value = Object.assign({}, ...componentTOC.value.filter(item => item.citeType === 'Collection').map((x) => ({ [x.identifier]: false })))
      for (const comp of componentTOC.value.filter(item => item.citeType === 'Collection')) {
          console.log('CollectionTOC loop comp.identifier ', comp.identifier, appConfig.value.collectionsConf.find(item => item.collectionId === comp.parent) || appConfig.value.collectionsConf.find(item => item.collectionId === comp.identifier))
          const existingCollConfiguration = appConfig.value.collectionsConf.find(item => item.collectionId === comp.identifier)
          if (existingCollConfiguration?.homePageSettings?.listSection?.openState) {
            console.log ('CollectionTOC XXX')
            await toggleExpanded(comp.identifier)
            //expandedById.value[comp.identifier] = !expandedById.value[comp.identifier]
          }
          //expandedById.value = Object.assign({}, { comp.identifier: 'true'},  ...expandedById.value)
        }
    }*/
    const openInitialCollections = async () => {
      const collections = componentTOC.value.filter(
        item => item.citeType === 'Collection'
      )

      for (const comp of collections) {
        const conf = appConfig.value.collectionsConf.find(c => c.collectionId === comp.identifier)

        if (conf?.homePageSettings?.listSection?.openState) {
          await toggleExpanded(comp.identifier)

          // wait next render
          await nextTick()
        }
      }
    }

    const setStateCollection = (collId) => {
      store.commit('setCollectionId', collId)
    }

    const ImgUrl = (source) => {
      // TODO: provide a logo object with url AND legend ?
      const imgSourceConfig = appConfig.value.collectionsConf.filter(coll => coll.collectionId === source)[0]
      if (imgSourceConfig?.homePageSettings?.listSection?.logo?.length > 0) {
        // console.log('HomePage ImgUrl found : ', imgSourceConfig.homePageSettings.listSection.logo)
        const images = Object.fromEntries(Object.entries(import.meta.glob('confs/*/assets/images/*.*', { eager: true })).map(([key, value]) => {
          const newKey = key.split('/').slice(-4).join('/')
          return [newKey, value]
        }))
        console.log('HomePage ImgUrl images: ', images)
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

    watch(props, async newProps => {
      isDocProjectIdInc.value = newProps.isDocProjectIdIncluded
      componentTOC.value = []
      collConfig.value = newProps.collectionConfig
      sourceConfig.value = collConfig.value
      if (sourceConfig.value?.homePageSettings?.listSection?.displaySort?.length > 0) {
        componentTOC.value = customSort(newProps.toc, sourceConfig.value.homePageSettings.listSection.displaySort)
      } else {
        componentTOC.value = newProps.toc
        // componentTOC.value.sort((a, b) => a.title.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '') > b.title.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '') ? 1 : -1)
        componentTOC.value.sort((a, b) => collator.compare(a.title, b.title))
      }
      await openInitialCollections()
      displayOpt.value = newProps.displayOption
      dtsRootCollectionId.value = newProps.dtsRootCollectionIdentifier
      rootCollectionId.value = newProps.rootCollectionIdentifier
      browseBttnTxt.value = newProps.collectionConfig.homePageSettings.listSection.browseButtonText
    }, { deep: true, immediate: true }
    )

    return {
      route,
      isDocProjectIdInc,
      displayOpt,
      dtsRootCollectionId,
      rootCollectionId,
      appConfig,
      collConfig,
      sourceConfig,
      customSort,
      browseBttnTxt,
      toggleExpanded,
      ImgUrl,
      expandedById,
      selectedParent,
      componentTOC,
      setStateCollection,
      openInitialCollections
    }
  }
}
</script>

<style scoped>
.collection-toc-area, .modal-wrapper {
  .tree {
    padding-top: 10px;
    padding-bottom: 10px;
  }

  .tree li {
    font-family: var(--font-secondary), sans-serif;
    font-size: 15px;
    font-weight: 500;
    line-height: 22px;
    padding: 0;
    margin-bottom: 4px;

    &::before {
      font-family: var(--font-secondary), sans-serif;
      margin-left: -8px;
      margin-right: 11px;
      content: '●';
      font-size: 10px;
      color: #999;
      float: left;
    }
    & .li.container {
        display: flex;
        margin: 0;
      & > a {
        border-bottom: none;
        color: #4a4a4a !important;
        &.is-current {
          font-weight: bold !important;
          color: var(--text-color) !important;
        }
      }
    }

    &.more {
      padding-left: 0 !important;

      &.li.container > a, span {
        margin-top: 4px;
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
.document-card {
  display: flex;
  flex-direction: row;
  align-content: center;
  gap: 10px;
  border: 1px solid transparent;

  width: 100%;
  &:hover {
    border: 1px solid var(--text-color);
  }
}
.document-card .card-header {
  width: 100%;
}
.document-card .card-header .document-folder {
  width: 100%;
  border-radius: 6px;

  font-size: 18px;
  font-weight: 400;
  line-height: 1.4;
  color: var(--default-text-color);

  & > a {
    border: none;
    color: var(--default-text-color);
  }
  & > .card-header-first-line {
    display: flex;
    flex-direction: row;
    gap: 20px;

    & > .collection-elec-id {
      margin: 10px;
      font-size: 20px;
      font-weight: bold;
      color: #b9192f;
    }
    & > .collection-metadata {
      width: 100%;
      font-family: var(--font-primary), sans-serif;

      & > .collection-metadata-author-date-title,
      & > .collection-description {
        padding: 20px 25px 30px;
      }
      & > .collection-metadata-author-date-title {
        width: 100%;
        background-color: #000;

        & > .collection-metadata-author-date {
          margin-bottom: 10px;
          font-size: 16px;
          color: #FFF;
        }
        & > .collection-metadata-title {
          font-weight:700;
          font-size:24px;
          line-height: 1.2;
          color: #FFF;
        }
      }
      & > .collection-description {
        width: 100%;
        padding-top: 20px;
        text-transform: none;
      }
    }
  }
}

.card-view .card-header {
  width: 432px;
  align-self: flex-start;
  border-radius: 42px 42px 0;
  padding: 20px 20px 35px;
  background: var(--fill-color) !important;
  box-shadow: none;
}

.card-view .card-header .collection-metadata .collection-metadata-title {
    background: transparent !important;
}

.project-view {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  margin-top: 30px;
}

.document-card .card-image {
  display: none !important;

  margin: auto;
  & > a {
    align-content: center;
    > img {
      height: auto;
      width: 75px;
    }
  }
  & > a.disabled {
    pointer-events: none;
    align-content: center;
    > img {
      height: auto;
      width: 75px;
    }
  }
}
.document-card .card-content {
  color: #000;
  padding: 1.5rem 0;
  border-bottom: 7px solid #e8e7e0;
}

.project-view > .document-card {
  flex: calc(33.333% - 20px) 0 0;
  width: calc(33.333% - 20px);
  margin: 0;
}

@media screen and (max-width: 1024px) {
  .project-view > .document-card {
    flex: calc(50% - 15px) 0 0;
    width: calc(50% - 15px);
  }
}

@media screen and (max-width: 768px) {
  .collection-toc-area, .modal-wrapper {
    .tree li {
      margin-left: 15px !important;
      margin-bottom: 8px;
    }
  }
}

@media screen and (max-width: 640px) {
  .project-view > .document-card {
    flex: 100% 0 0;
    width: 100%;
  }
}

</style>
