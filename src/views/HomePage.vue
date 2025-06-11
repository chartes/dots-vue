<template>
  <div
    v-if="rootCollectionId === dtsRootCollectionId && collectionId === rootCollectionId"
    class="collection-list"
  ><!-- && currCollection.member.every(m => m.citeType === 'Collection') -->
    <div class="tiles">
      <div class="tile page-header app-width-padding">
        <div class="is-flex is-flex-direction-column is-align-items-center is-justify-content-center wrapper">
          <div class="tile is-child article app-width-margin">
            <div class="title-tile">
              <p class="title">{{ collectionAltTitle ? collectionAltTitle : currCollection.title }}</p>
            </div>
            <div class="project-tile">
              <router-link
                v-if="collectionId !== rootCollectionId"
                :to="{ name: 'About', params: { collId: collectionId } }"
                active-class="active"
              >
                About
              </router-link>
              <router-link
                v-else
                :to="{ name: 'About'}"
                active-class="active"
              >
                About
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
    <section class="main app-width-margin">
      <!-- homePageSettings.customCollectionDescription, use it and pass DTS description and homePageSettings.collectionDescription settings if available -->
      <div
        v-if="customCollectionDescription"
        id="article"
        class="article app-width-margin"
      >
        <component
          :is="customDescription"
          :dts-collection-description="currCollection.description"
          :custom-collection-description="collectionDescription"
        />
        <!-- <p class="texte no-dts-description">This collection provides no DTS default description.</p> -->
      </div>
      <!-- no homePageSettings.customCollectionDescription : use DTS API collection description if available -->
      <div
        v-else-if="currCollection.description"
        id="article"
        class="article app-width-margin"
      >
        <h1>La collection</h1>
          {{ currCollection.description }}
      </div>
      <!-- no homePageSettings.customCollectionDescription & no DTS description : use user settings description (homePageSettings.collectionDescription) -->
      <div
        v-else-if="collectionDescription"
        id="article"
        class="article app-width-margin"
      >
        <h1>La collection</h1>
        {{ collectionDescription }}
        <!-- <p class="texte no-dts-description">This collection provides no DTS default description.</p> -->
      </div>
    </section>
    <div
      class="document-list app-width-margin"
    >
      <div class="is-flex">
          <div
            v-if="totalPages"
            class="pagination has-text-centered is-flex is-flex-direction-row is-justify-content-center"
          >
            <div class="pagination-documents-count">
              {{ componentTOC.length }} {{ componentTOC.length === 1 ? 'collection' : 'collections' }}
            </div>
            <div class="pagination-controls">
              <a
                :class="currentPage <= 1 ? 'button first-page disabled' : 'button first-page'"
                @click="currentPage <= 1 ? null : currentPage = 1"
              />
              <a
                :class="currentPage <= 1 ? 'button previous-page disabled' : 'button previous-page'"
                @click="currentPage <= 1 ? null : --currentPage"
              />
              <input
                v-model="currentPage"
                name="page"
                type="number"
                min="1"
                :max="totalPages"
                placeholder="Page..."
                class="current-page"
                @change.prevent="currentPage = parseInt(p)"
              >
              <span class="label-sur-page">sur</span>
              <span class="total-pages">{{ totalPages }}</span>
              <a
                :class="currentPage < totalPages ? 'button next-page' : 'button next-page disabled'"
                @click="currentPage < totalPages ? ++currentPage : null"
              />
              <a
                :class="currentPage < totalPages ? 'button last-page' : 'button last-page disabled'"
                @click="currentPage < totalPages ? currentPage = totalPages : null"
              />
            </div>
          </div>
        </div>
      <div
        v-for="(c, index) in currentPageData" :key="index"
        class="document-card"
      >
        <div class="card-header">
          <div class="document-folder">
            <div class="card-header-first-line">
              <!--<span class="collection-elec-id">
                ID
              </span>-->
              <div class="collection-metadata is-flex-direction-column">
                <div
                  class=""
                >
                  <router-link :to="{ name: 'Home', params: { collId: c.identifier }}">
                    {{ c.title }}
                  </router-link>
                </div><!-- card-header-first-line -->
                <div class="is-flex is-flex-direction-column">
                  <span>
                    {{ c.author }} {{ c.dublincore.creator }}
                  </span>
                  <span
                  >
                    {{ c.dublincore.date }}
                  </span><!-- v-if="c.date" -->
                </div>
                <div class="collection-description">
                  <span>
                    {{ c.description }}
                  </span><!-- v-if="c.date" -->
                </div>
              </div>
              <div class="card-image is-flex is-justify-content-center">
                <router-link :to="{ name: 'Home', params: { collId: c.identifier }}">
                  <img
                    v-if="ImgUrl(c.identifier)"
                    :src="ImgUrl(c.identifier)"
                  />
                  <img
                    v-else
                    src="@/assets/images/dots-logo-retro.drawio.svg"
                    alt=""
                  />
                </router-link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
  <div
    v-else
    class="home-mask"
    :class="homeCssClass"
  >
    <div class="tiles">
      <div class="tile page-header app-width-padding">
        <div class="is-flex is-flex-direction-column is-align-items-center is-justify-content-center wrapper">
          <div class="tile is-child app-width-margin">
            <div class="title-tile">
              <p class="title">{{ collectionAltTitle ? collectionAltTitle : currCollection.title }}</p>
            </div>
            <div class="project-tile">
              <router-link
                v-if="collectionId !== rootCollectionId"
                :to="{ name: 'About', params: {collId: collectionId}}"
                active-class="active"
              >
                About
              </router-link><!-- , params: {collId: collectionId}  -->
              <router-link
                v-else
                :to="{ name: 'About'}"
                active-class="active"
              >
                About
              </router-link>
            </div>
          </div>
          <div class="wrapper">
            <div class="toc-area app-width-margin">
              <div
                class="toc-area-header"
                :class="expandedById[collectionId] ? 'expanded': ''"
              >
                <a href="#">Browse</a>
                <a href="#" class="toggle-btn" v-on:click.prevent="toggleExpanded(collectionId)"></a>
              </div>
              <div v-if="componentTOC.length > 0"
                class="menu app-width-margin"
                :class="expandedById[collectionId] ? 'expanded': ''"
              >
                <div v-if="expandedById[collectionId] && componentTOC.length > 0">
                  <CollectionTOC
                    :is-doc-projectId-included="isDocProjectIdInc"
                    :dts-root-collection-identifier="dtsRootCollectionId"
                    :toc="componentTOC"
                    :margin="0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <section class="main app-width-margin">
      <!-- homePageSettings.customCollectionDescription, use it and pass DTS description and homePageSettings.collectionDescription settings if available -->
      <div
        v-if="customCollectionDescription"
        id="article"
        class="article app-width-margin"
      >
        <component
          :is="customDescription"
          :dts-collection-description="currCollection.description"
          :custom-collection-description="collectionDescription"
        />
        <!-- <p class="texte no-dts-description">This collection provides no DTS default description.</p> -->
      </div>
      <!-- no homePageSettings.customCollectionDescription : use DTS API collection description if available -->
      <div
        v-else-if="currCollection.description"
        id="article"
        class="article app-width-margin"
      >
        <h1>La collection</h1>
          {{ currCollection.description }}
      </div>
      <!-- no homePageSettings.customCollectionDescription & no DTS description : use user settings description (homePageSettings.collectionDescription) -->
      <div
        v-else-if="collectionDescription"
        id="article"
        class="article app-width-margin"
      >
        <h1>La collection</h1>
        {{ collectionDescription }}
        <!-- <p class="texte no-dts-description">This collection provides no DTS default description.</p> -->
      </div>
    </section>
  </div>
</template>

<script>
import { computed, defineAsyncComponent, inject, reactive, ref, shallowRef, watch } from 'vue'

import { getMetadataFromApi } from '@/api/document.js'
import CollectionTOC from '@/components/CollectionTOC.vue'

export default {
  name: 'HomePage',
  components: { CollectionTOC },
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
  async setup (props) {
    const state = reactive({
      isTreeOpened: false
    })
    const layout = inject('variable-layout')

    const isDocProjectIdInc = ref(props.isDocProjectIdIncluded)
    const dtsRootCollectionId = ref(props.dtsRootCollectionIdentifier)
    const rootCollectionId = ref(props.rootCollectionIdentifier)
    const appConfig = ref(props.applicationConfig)
    const collConfig = ref(props.collectionConfig)
    const collectionDescription = ref('')
    const customCollectionDescription = ref(props.collectionConfig.homePageSettings.customCollectionDescription ? props.collectionConfig.homePageSettings.customCollectionDescription : {})
    console.log('HomePage setup customCollectionDescription', customCollectionDescription.value)
    const customDescription = shallowRef('')
    const collectionAltTitle = ref(props.collectionConfig.homePageSettings.collectionAltTitle)
    console.log('HomePage setup collectionAltTitle', collectionAltTitle.value)
    const collectionId = ref(props.collectionIdentifier)
    console.log('HomePage setup collectionId', collectionId.value)

    const componentTOC = ref([])
    const currCollection = ref(props.currentCollection)

    componentTOC.value = [...currCollection.value.member].sort((a, b) => a.title.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '') > b.title.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '') ? 1 : -1)
    console.log('HomePageDefault currentCollection.value / componentTOC.value : ', currCollection.value, componentTOC.value)
    console.log('HomePageDefault componentTOC / collectionId : ', Object.fromEntries(componentTOC.value.map(col => [col.identifier, false])), componentTOC.value, collectionId, currCollection)

    const currentPage = ref(1)
    const pageSize = ref(0)
    const totalPages = ref(1)
    const currentPageData = ref([])

    const expandedById = ref([])

    const toggleExpanded = async (collId) => {
      console.log('HomePage Modal toggleExpanded', collId, componentTOC.value)
      if (componentTOC.value.length === 0) {
        const response = await getMetadataFromApi(collId)
        response.member.forEach(m => {
          m.identifier = m['@id']
        })
        response.member.forEach(m => {
          m.parent = collId
        })
        componentTOC.value = response.member
        // console.log('HomePageDefault toggleExpanded componentTOC', componentTOC.value)
      }
      expandedById.value[collId] = !expandedById.value[collId]
      state.isTreeOpened = !state.isTreeOpened
      // console.log('HomePageDefault toggleExpanded after expandedById[collectionId] : ', collId, expandedById.value)
    }

    const homeCssClass = computed(() => {
      return state.isTreeOpened ? 'is-tree-opened' : ''
    })

    const ImgUrl = (source) => {
      // TODO: provide a logo object with url AND legend ?
      const sourceConfig = appConfig.value.collectionsConf.filter(coll => coll.collectionId === source)[0]
      if (sourceConfig && Object.keys(sourceConfig.homePageSettings).includes('logo') && sourceConfig.homePageSettings.logo.length) {
        console.log('HomePage ImgUrl found : ', sourceConfig.homePageSettings.logo)
        const images = import.meta.glob('confs/*/assets/images/*.*', { eager: true })
        console.log('HomePage ImgUrl images: ', images)
        const match = images[`${import.meta.env.VITE_APP_CUSTOM_SETTINGS_PATH}/${sourceConfig.collectionId}/assets/images/${sourceConfig.homePageSettings.logo}`]
        console.log('HomePage ImgUrl match: ', match)
        if (sourceConfig.homePageSettings.logo.includes('https')) {
          return sourceConfig.homePageSettings.logo
        } else {
          return match.default // new URL(`/src/assets/images/${sourceConfig.homePageSettings.logo}`, import.meta.url).href
        }
      } else {
        return false
      }
    }

    const paginated = () => {
      const chunkArray = (array, chunkSize) => {
        const numberOfChunks = Math.ceil(array.length / chunkSize)
        return [...Array(numberOfChunks)]
          .map((value, index) => {
            return array.slice(index * chunkSize, (index + 1) * chunkSize)
          })
      }
      totalPages.value = chunkArray(componentTOC.value, pageSize.value).length
      console.log('paginated chunkArray', chunkArray)
      currentPageData.value = chunkArray(componentTOC.value, pageSize.value)[currentPage.value - 1]
    }

    const getCustomHomeDescription = async () => {
      let component
      console.log('HomePage getCustomHomeDescription collConfig.value.collectionId', collConfig.value.collectionId)
      console.log('HomePage getCustomHomeDescription collConfig.value.aboutPageSettings', collConfig.value.homePageSettings)
      const comps = import.meta.glob('confs/**/*.vue')

      const defaultSettings = import.meta.glob('../settings/default/HomePageContent.vue', { eager: true })
      comps['../settings/default/HomePageContent.vue'] = defaultSettings['../settings/default/HomePageContent.vue']

      const match = comps[`${import.meta.env.VITE_APP_CUSTOM_SETTINGS_PATH}/${collConfig.value.collectionId}/${customCollectionDescription.value.compName}.vue`]
      const matchRootCollection = comps[`${import.meta.env.VITE_APP_CUSTOM_SETTINGS_PATH}/${rootCollectionId.value}/${customCollectionDescription.value.compName}.vue`]
      console.log('match 1 : ', match)
      console.log('matchRootCollection : ', matchRootCollection)
      const defaultCollection = comps['../settings/default/HomePageContent.vue']

      if (match) {
        console.log('match 2 : ', match)
        component = defineAsyncComponent(() => import(`confs/${collConfig.value.collectionId}/${customCollectionDescription.value.compName}.vue`)
          .then((comp) => {
            return comp
          })
          .catch((error) => {
            console.log(`error loading 1 confs/${collConfig.value.collectionId}/${customCollectionDescription.value.compName}.vue : `, error)
          })
        )
      } else if (matchRootCollection) {
        component = defineAsyncComponent(() => import(`confs/${rootCollectionId.value}/${customCollectionDescription.value.compName}.vue`)
          .then((comp) => {
            return comp
          })
          .catch((error) => {
            console.log(`error loading 2 confs/${rootCollectionId.value}/${customCollectionDescription.value.compName}.vue : `, error)
          })
        )
      // matching About pages as default
      // TODO : replace tabName by the default tabNames if incorrectly set
      } else if (defaultCollection) {
        component = defineAsyncComponent(() => import('../settings/default/HomePageContent.vue')
          .then((comp) => {
            return comp
          })
          .catch((error) => {
            console.log('error loading \'../settings/default/HomePageContent.vue\' : ', error)
          })
        )
      } else {
        console.log('nothing')
        component = null
      }
      return component
    }

    watch(props, async (newProps) => {
      dtsRootCollectionId.value = newProps.dtsRootCollectionIdentifier
      rootCollectionId.value = newProps.rootCollectionIdentifier
      collectionId.value = newProps.collectionIdentifier
      appConfig.value = newProps.applicationConfig
      collConfig.value = newProps.collectionConfig
      pageSize.value = newProps.collectionConfig.homePageSettings.collectionsPerPage
      currCollection.value = newProps.currentCollection
      collectionAltTitle.value = newProps.collectionConfig.homePageSettings.collectionAltTitle
      collectionDescription.value = newProps.collectionConfig.homePageSettings.collectionDescription
      customCollectionDescription.value = newProps.collectionConfig.homePageSettings.customCollectionDescription
      componentTOC.value = [...currCollection.value.member].sort((a, b) => a.title.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '') > b.title.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '') ? 1 : -1)
      console.log('HomePageDefault watch collectionConfig collectionDescription : ', collConfig.value, collectionDescription.value)
      paginated()
      if (customCollectionDescription.value) {
        customDescription.value = await getCustomHomeDescription()
      } else {
        customDescription.value = {}
      }
    }, { deep: true, immediate: true })

    watch(currentPage, () => {
      paginated()
    })

    return {
      appConfig,
      collConfig,
      isDocProjectIdInc,
      dtsRootCollectionId,
      rootCollectionId,
      collectionAltTitle,
      collectionDescription,
      homeCssClass,
      tocCssClass: layout.tocCssClass,
      ImgUrl,
      collectionId,
      currCollection,
      componentTOC,
      toggleExpanded,
      expandedById,
      currentPage,
      pageSize,
      totalPages,
      paginated,
      currentPageData,
      customCollectionDescription,
      getCustomHomeDescription,
      customDescription
    }
  }
}
</script>

<style scoped>
a {
  border-bottom: none;
}
#article {
  padding: 40px 10% 120px;
  border-bottom: 1px dotted #ffffff;
  /* min-height: 100%; */
}
#article article {
  margin: 0;
}
#article h1,
#article {
  font-family: "Barlow", sans-serif !important;
}
#article h1 {
  padding-top: 20px;
  padding-bottom: 20px;
  font-size: 25px;
  font-weight: 500;
  line-height: 33px;
  text-transform: none;
  color: #971716;
}
.toc-area {
  width: 100%;
  font-family: "Barlow", sans-serif !important;
  margin-bottom: 30px !important;
}
.toc-area-header {
  display: flex;
  width: 100%;
  padding: 20px;
  background-color: #f1f1f1;
  border-radius: 6px;
  position: relative;
  &.expanded {
    border-radius: 6px 6px 0 0;
  }
}
.toc-area-header > a {
  text-transform: uppercase;
  font-family: "Barlow Semi Condensed", sans-serif;
  font-weight: 500;
  color: #4a4a4a !important;
  text-decoration: none;
  border: none;
  &:first-child {
    text-transform: none;
    margin-left: auto;
    margin-right: 47px;
  }
}
.is-tree-opened .menu {
  display: flex;
  flex-direction: column;
  padding: 0px 20px 0px;
  /* border-top: solid 2px #fcfcfc; */
  background-color: #e4e4e4;
  border-radius: 0 0 6px 6px;
}

/* toggle */
.toggle-btn {
  position: absolute;
  right: 20px;
  width: 27px;
  height: 27px;
  background: url(../assets/images/chevron_rouge.svg) center top -7px / cover no-repeat;
  border: none;
  text-decoration: none;
}
.is-tree-opened .toggle-btn {
  background: url(../assets/images/croix.svg) center / cover no-repeat;
}
#article {
  margin-bottom: 30px !important;
  padding: 10px 0 10px !important;
}
.wrapper {
  width: 100%;
}
.tile {
  background-color: #FBF8F4;
}
.page-header {
  background-color: #FBF8F4;
  background: url(../assets/images/Designer.png) center 80% / cover no-repeat;
  /* filter: invert(1); */
}
.tile.is-child {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  width: 100%;
}
.title-tile {
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 100%;
  margin-top: 30px;
  margin-bottom: 20px;
  padding-left: 20px;
  padding-right: 20px;
  background-color: #000000cc;
  border-radius: 6px;
  font-family: "Inter", sans-serif;
  & > p {
      color: white !important;
  }
}
.project-tile {
  display: flex;
  width: fit-content;
  margin-bottom: 20px;
  padding: 6px 10px;
  background-color: #000000cc;
  /* border: #b9192f 1px solid; */
  border-radius: 6px;
  & > a {
    font-family: "Barlow Semi Condensed", sans-serif;
    font-weight: 500;
    text-transform: uppercase;
    text-decoration: none;
    color: white;
    /* color: #b9192f; */
  }
}
.collection-list {
  /* background-color: #FBF8F4; */
}
.document-list {
  display: flex;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  padding-top: 25px;
  padding-bottom: 25px;
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
    border: 1px solid #b9192f;
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
      & > .collection-description {
        width: 100%;
        text-align: justify;
        text-transform: none;
      }
    }
  }
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
}
.document-card .card-content {
  color: #000;
  padding: 1.5rem 0;
  border-bottom: 7px solid #e8e7e0;
}
.pagination-controls {
  display: flex;
  align-items: center;
  /*visibility: hidden;*/

  & > * {
    display: inline-block;
    width: 38px;
    height: 38px;
    margin-right: 4px;
  }
  & > a {
    display: inline-block;
    width: 38px;
    height: 38px;
    background-color: #C3C3C3;
    border-radius: 3.2px;
  }
  & > a.disabled {
    cursor: not-allowed !important;
  }
  & > a.first-page {
    background: #C3C3C3 url(../assets/images/page_debut.svg)  center / 28px auto no-repeat;
  }
  & > a.previous-page {
    background: #C3C3C3 url(../assets/images/page_avant.svg) center / 28px auto no-repeat;
  }
  & > a.next-page {
    background: #C3C3C3 url(../assets/images/page_suivant.svg) center / 28px auto no-repeat;
  }
  & > a.last-page {
    background: #C3C3C3 url(../assets/images/page_fin.svg) center / 28px auto no-repeat;
  }
  & > input.current-page {
    height: 38px !important;
    padding: 0 !important;
    border: 1px solid #C00055;
    border-radius: 3.2px;

    font-family: inherit;
    font-size: 18px;
    color: #CB2158;
    font-weight: 800;
    text-align: center;
    text-decoration: none;

    &:focus {
      outline: 1px solid #C00055;
    }
  }

  & > span.label-sur-page {
    font-family: inherit;
    font-size: 11px;
    line-height: 38px;
    color: #979797;
    font-weight: 500;
    text-align: center;
    text-transform: uppercase;
  }

  & > span.total-pages {
    background-color: #DFDFDF;
    border-radius: 3.2px;

    font-family: inherit;
    font-size: 18px;
    line-height: 38px;
    color: #818181;
    text-align: center;
    font-weight: 600;
    text-transform: uppercase;
  }
}
.pagination {
  width: 100%;
  margin: 0;
  padding-bottom: 5px;
  border-bottom: solid 1px #b9192f;
}
.pagination-documents-count {
  margin-right: auto;
  color: #b9192f;
  border: none;
}
.no-dts-description {
  margin: 25px auto 25px;
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
