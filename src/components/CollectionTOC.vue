<template>
  <div
    v-if="(currentCollection.identifier === rootCollectionId && displayOpt !== 'list' && currentCollection.member.every(item => item.citeType === 'Collection')) || (displayOpt === 'card' && currentCollection.member.every(item => item.citeType === 'Collection'))"
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
                <div class="collection-metadata-title">
                  {{ item.title }}
                </div>
                <div class="collection-metadata-author-date is-flex is-flex-direction-column">
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
          class="wrapper"
        >
          <div
            class="collection-toc-area"
            @click.prevent="toggleExpanded(item.identifier)"
          >
            <div
              class="collection-toc-area-header"
              :class="expandedById[item.identifier] ? 'expanded': ''"
            >
              <a href="#">{{ browseBttnTxt }}</a>
              <a
                href="#"
                class="toggle-btn"
                :class="expandedById[item.identifier] ? 'expanded': ''"
              />
            </div>
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
            class="expand-collection"
            :class="expandedById[item.identifier] || item.expanded === true ? 'expanded' : ''"
            @click="toggleExpanded(item.identifier)"
          />
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
              :to="{ name: 'Home', params: {collId: item.extensions ? Array.isArray(item.extensions['dots:dotsProjectId']) ? item.extensions['dots:dotsProjectId'].filter(p => p === route.params.collId)[0] : item.extensions['dots:dotsProjectId'] !== item.parent ? item.extensions['dots:dotsProjectId'] : item.identifier : item.identifier} }"
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
          <router-link
            v-else-if="isDocProjectIdInc && selectedParent !== rootCollectionId && item.extensions['dots:dotsProjectId'] === route.params.collId"
            :class="route.params.id === item.identifier ? 'is-current' : ''"
            :to="{ name: 'Document', params: { collId: item.extensions ? item.extensions['dots:dotsProjectId'] : item.identifier, id: item.identifier } }"
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
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getMetadataFromApi } from '@/api/document.js'
import store from '@/store'

import { getSimpleObject } from '@/composables/utils'

const collator = new Intl.Collator('fr', {
  numeric: true,
  sensitivity: 'base'
})

export default {
  name: 'CollectionTOC',

  components: {},

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
  async setup (props) {
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
          const response = getSimpleObject(await getMetadataFromApi(collId))
          console.log('response', response)

          response.member.forEach(m => { m.identifier = m['@id'] })
          response.member.forEach(m => { m.parent = collId })
          console.log('response after identifier', response)

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
    if (collConfig.value.homePageSettings.listSection.openState) {
      if (componentTOC.value.filter(item => item.citeType === 'Collection').length > 0) {
        for (const comp of componentTOC.value.filter(item => item.citeType === 'Collection')) {
          await toggleExpanded(comp.identifier)
        }
      }
      expandedById.value = Object.assign({}, ...componentTOC.value.filter(item => item.citeType === 'Collection').map((x) => ({ [x.identifier]: true })))
    } else {
      expandedById.value = Object.assign({}, ...componentTOC.value.filter(item => item.citeType === 'Collection').map((x) => ({ [x.identifier]: false })))
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

    const stopHandle = watch(props, newProps => {
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
      displayOpt.value = newProps.displayOption
      dtsRootCollectionId.value = newProps.dtsRootCollectionIdentifier
      rootCollectionId.value = newProps.rootCollectionIdentifier
      browseBttnTxt.value = newProps.collectionConfig.homePageSettings.listSection.browseButtonText
    }, { deep: true, immediate: true }
    )
    stopHandle()

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
      setStateCollection
    }
  }
}
</script>

<style scoped>
.wrapper, .modal-wrapper {
  .tree {
    /* list-style: none;*/
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
      font-family: "Barlow Semi Condensed", sans-serif;
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

button {
  width:30px;
  height: 30px;
  border: none;
  cursor: pointer;

  background: url(@/assets/images/chevron_red_rounded.svg) center / 20px auto no-repeat;
  &.expanded {
    transform: rotate(90deg);
  }
}
.is-current {
  /* color: #971716 !important; */
  color: var(--text-color) !important;
}
.document-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-content: center;
  width: 100%;
  margin-top: 25px;
  margin-bottom: 25px;
  border-radius: 6px;
  border: 1px solid transparent;
  &:hover {
    /* border: 1px solid #b9192f; */
    border: 1px solid var(--text-color);
  }
  & > .wrapper {
    width: 100%;
    & > .collection-toc-area {
      margin-bottom: 0 !important;
      & > .collection-toc-area-header {
        display: flex;
        width: 100%;
        padding-top: 3px;
        padding-bottom: 3px;
        padding-left: 10px;
        padding-right: 10px;
        background-color: #f1f1f1;
        border: 1px solid transparent;
        border-bottom-left-radius: 6px;
        border-bottom-right-radius: 6px;
        position: relative;
        &.expanded {
          border-radius: 0;
        }

        & > a {
          text-transform: uppercase;
          font-family: "Barlow Semi Condensed", sans-serif;
          font-weight: 500;
          color: #4a4a4a !important;
          text-decoration: none;
          border: none;

          &:first-child {
            text-transform: none;
            /* margin-left: auto;
            margin-right: 47px; */
          }
          /* toggle */
          &.toggle-btn {
            position: absolute;
            right: 20px;
            width: 20px;
            height: 20px;
            background: url(../assets/images/chevron_rouge.svg) center / cover no-repeat;
            border: none;
            text-decoration: none;
            &.expanded {
              margin-top: 3px;
              background: url(../assets/images/croix.svg) center / cover no-repeat;
            }
          }
        }
      }
    }
  }
}
.document-card .card-header .document-folder {
  width: 100%;
  /*border-top: 6px solid #e4e4e4;*/
  border-radius: 6px;

  font-family: "Barlow", sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;

  padding-top: 10px;
  padding-left: 10px;
  padding-right: 10px;
  padding-bottom: 10px;
  text-transform: uppercase;
  & a {
    border: none;
    color: #333333; /* #485fc7; */
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
      width: 80%;
      & > .collection-metadata-title {
        font-weight: 500;
        color: #000; /* #485fc7; */
        margin-bottom: 10px;
      }
      & > .collection-metadata-author-date {
        color: #4a4a4a;
      }
      & > .collection-description {
        width: 100%;
        text-align: justify;
        text-transform: none;
        color: #4a4a4a;
      }
    }
  }
}
.card-header {
  box-shadow: none;
}
.document-card .card-image {
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

.collection-toc-area-header > a {
  text-transform: uppercase;
  font-family: "Barlow Semi Condensed", sans-serif;
  font-weight: 500;
  color: #4a4a4a !important;
  text-decoration: none;
  border: none;
  &:first-child {
    text-transform: none;
    /* margin-left: auto;
    margin-right: 47px; */
  }
}
.expanded.menu {
  display: flex;
  flex-direction: column;
  padding: 0 20px 0;
  /* border-top: solid 2px #fcfcfc; */
  background-color: #e4e4e4;
  border: 1px solid #e4e4e4;
  border-radius: 0 0 6px 6px;
}

@media screen and (max-width: 800px) {
  .wrapper, .modal-wrapper {
    .tree li {
      margin-left: 15px !important;
      margin-bottom: 8px;
    }
  }
}

</style>
