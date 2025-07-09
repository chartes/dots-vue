<template>
  <div
    v-if="(currentCollection.identifier === rootCollectionId && displayOpt !== 'list' && currentCollection.member.every(item => item.citeType === 'Collection')) || (displayOpt === 'card' && currentCollection.member.every(item => item.citeType === 'Collection'))"
  >
    <div
      v-for="(item, index) in componentTOC" :key="index"
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
                  <span
                  >
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
                  <span
                  >
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
            <div v-if="expandedById[item.identifier] && item.totalChildren > 0 && item.children?.length > 0
                || item.expanded === true && item.totalChildren > 0 && item.children?.length > 0"
            >
              <div v-if="expandedById[item.identifier] && item.totalChildren > 0 && item.children?.length > 0
                || item.expanded === true && item.totalChildren > 0 && item.children?.length > 0"
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
                  <span
                  >
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
    <template v-for="(item, index) in componentTOC" :key="index">
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
        <div v-if="expandedById[item.identifier] && item.totalChildren > 0 && item.children?.length > 0
                  || item.expanded === true && item.totalChildren > 0 && item.children?.length > 0"
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

function getSimpleObject (obj) {
  // console.log("getSimpleObject / obj", obj)
  let simpleObject = {}
  simpleObject = {
    identifier: obj.identifier ? obj.identifier : obj['@id'],
    citeType: obj['@type'] ? obj['@type'] : obj.citeType,
    expanded: obj.expanded,
    title: obj.title,
    level: obj.level,
    editorialLevelIndicator: obj.editorialLevelIndicator,
    totalChildren: obj.totalChildren,
    member: !obj.member ? obj.children : obj.member,
    parent: obj.parent,
    dublincore: obj.dublincore,
    extensions: obj.extensions
  }
  // console.log("getSimpleObject / simpleObject", simpleObject)
  return simpleObject
}

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
    const browseBttnTxt = ref(props.collectionConfig.homePageSettings.listSection.browseButtonText)

    /* if (`${import.meta.env.VITE_APP_ROOT_DTS_COLLECTION_ID}`.length === 0) {
      const rootResponse = await getMetadataFromApi()
      rootCollectionId.value = rootResponse['@id']
      console.log('App.vue get rootCollectionId', rootCollectionId.value)
    } else {
      rootCollectionId.value = `${import.meta.env.VITE_APP_ROOT_DTS_COLLECTION_ID}`
      console.log('App.vue set rootCollectionId as .env', rootCollectionId.value)
    } */

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
        } else {
          return a.title.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '') > b.title.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '') ? 1 : -1 // alphabetical sort
        }
      })
    }

    const componentTOC = ref([])
    if (collConfig.value.homePageSettings && collConfig.value.homePageSettings.listSection && collConfig.value.homePageSettings.listSection.displaySort && collConfig.value.homePageSettings.listSection.displaySort.length > 0) {
      // console.log('CollectionTOC setup displaySort', collConfig.value.homePageSettings.listSection.displaySort)
      componentTOC.value = customSort(props.toc, collConfig.value.homePageSettings.listSection.displaySort)
    } else {
      componentTOC.value = props.toc
      componentTOC.value.sort((a, b) => a.title.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '') > b.title.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '') ? 1 : -1)
    }
    console.log('componentTOC.value props.toc : ', componentTOC.value)

    /* expandedById.value = componentTOC.value.filter(item => item.expanded === true).map(col => [col.identifier, true])
    console.log("componentTOC.value expandedById.value : ", expandedById.value) */
    expandedById.value = Object.assign({}, ...componentTOC.value.filter(item => item.citeType === 'Collection').map((x) => ({ [x.identifier]: false })))

    const toggleExpanded = async (collId) => {
      console.log('CollectionTOC toggleExpanded componentTOC collId: ', componentTOC.value, collId)
      if (!componentTOC.value.filter(item => item['@id'] === collId || item.identifier === collId)[0].children || componentTOC.value.filter(item => item['@id'] === collId || item.identifier === collId)[0].children.length === 0) {
        const response = getSimpleObject(await getMetadataFromApi(collId))
        console.log('response', response)
        // eslint-disable-next-line no-return-assign
        response.member.forEach(m => { m.identifier = m['@id'] })
        response.member.forEach(m => { m.parent = collId })
        console.log('response after identifier', response)
        componentTOC.value.filter(item => item.identifier === collId)[0].member = response.member
        componentTOC.value.filter(item => item.identifier === collId)[0].children = response.member
        componentTOC.value.sort((a, b) => a.title > b.title ? 1 : -1)
        console.log('CollectionTOC componentTOC', componentTOC.value)
      }
      console.log('CollectionTOC expandedById.value', expandedById.value)

      selectedParent.value = collId
      console.log('CollectionTOC after selectedParent.value : ', collId)
      expandedById.value[collId] = !expandedById.value[collId]
      console.log('CollectionTOC after expandedById[collectionId] : ', collId, expandedById.value)
    }
    const setStateCollection = (collId) => {
      store.commit('setCollectionId', collId)
    }

    const ImgUrl = (source) => {
      // TODO: provide a logo object with url AND legend ?
      const sourceConfig = appConfig.value.collectionsConf.filter(coll => coll.collectionId === source)[0]
      if (sourceConfig && sourceConfig.homePageSettings && Object.keys(sourceConfig.homePageSettings).includes('listSection')
          && sourceConfig.homePageSettings.listSection && Object.keys(sourceConfig.homePageSettings.listSection).includes('logo')
          && sourceConfig.homePageSettings.listSection.logo.length) {
        console.log('HomePage ImgUrl found : ', sourceConfig.homePageSettings.listSection.logo)
        const images = import.meta.glob('confs/*/assets/images/*.*', { eager: true })
        console.log('HomePage ImgUrl images: ', images)
        const match = images[`${import.meta.env.VITE_APP_CUSTOM_SETTINGS_PATH}/${sourceConfig.collectionId}/assets/images/${sourceConfig.homePageSettings.listSection.logo}`]
        console.log('HomePage ImgUrl match: ', match)
        if (sourceConfig.homePageSettings.listSection.logo.includes('https')) {
          return sourceConfig.homePageSettings.listSection.logo
        } else {
          return match.default // new URL(`/src/assets/images/${sourceConfig.homePageSettings.logo}`, import.meta.url).href
        }
      } else {
        return false
      }
    }

    watch(props, async (newProps) => {
      isDocProjectIdInc.value = newProps.isDocProjectIdIncluded
      componentTOC.value = []
      if (collConfig.value.homePageSettings && collConfig.value.homePageSettings.listSection && collConfig.value.homePageSettings.listSection.displaySort && collConfig.value.homePageSettings.listSection.displaySort.length > 0) {
        // console.log('CollectionTOC watch displaySort', collConfig.value.homePageSettings.listSection.displaySort)
        componentTOC.value = customSort(newProps.toc, collConfig.value.homePageSettings.listSection.displaySort)
      } else {
        componentTOC.value = newProps.toc
        componentTOC.value.sort((a, b) => a.title.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '') > b.title.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '') ? 1 : -1)
      }
      displayOpt.value = newProps.displayOption
      dtsRootCollectionId.value = newProps.dtsRootCollectionIdentifier
      rootCollectionId.value = newProps.rootCollectionIdentifier
      appConfig.value = newProps.applicationConfig
      collConfig.value = newProps.collectionConfig
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
      padding-left: 0px !important;

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
    background: url(@/assets/images/chevron_red_rounded.svg) center / 20x auto no-repeat;
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
  font-size: 14px;
  padding-top: 10px;
  padding-left: 10px;
  padding-right: 10px;
  padding-bottom: 10px;
  text-transform: uppercase;
  & a {
    border: none;
    color: #485fc7;
  }
  & > .card-header-first-line {
    display: flex;
    flex-direction: row;
    & > .collection-elec-id {
      margin: 10px;
      font-size: 20px;
      font-weight: bold;
      color: #b9192f;
    }
    & > .collection-metadata {
      width: 80%;
      & > .collection-metadata-title {
        color: #485fc7;
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
  padding: 0px 20px 0px;
  /* border-top: solid 2px #fcfcfc; */
  background-color: #e4e4e4;
  border: 1px solid #e4e4e4;
  border-radius: 0 0 6px 6px;
}

</style>
