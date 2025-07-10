<template>
  <div
    v-if="(rootCollectionId === dtsRootCollectionId && collectionId === rootCollectionId && displayOpt !== 'list' && currentCollection.member.every(item => item.citeType === 'Collection')) || (displayOpt === 'card' && currentCollection.member.every(item => item.citeType === 'Collection'))"
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
                {{ aboutBttnTxt }}
              </router-link>
              <router-link
                v-else
                :to="{ name: 'About'}"
                active-class="active"
              >
                {{ aboutBttnTxt }}
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
    <section class="main app-width-margin">
      <!-- homePageSettings.descriptionSection.customCollectionDescription, use it and pass DTS description and homePageSettings.descriptionSection.collectionDescription settings if available -->
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
      <!-- no homePageSettings.descriptionSection.customCollectionDescription : use DTS API collection description if available -->
      <div
        v-else-if="currCollection.description"
        id="article"
        class="article app-width-margin"
      >
        <h1>La collection</h1>
          {{ currCollection.description }}
      </div>
      <!-- no homePageSettings.descriptionSection.customCollectionDescription & no DTS description : use user settings description (homePageSettings.collectionDescription) -->
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
              <span class="label-sur-page">/</span>
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
      <div>
        <CollectionTOC
          :is-doc-projectId-included="isDocProjectIdInc"
          :display-option="displayOpt"
          :current-collection="currCollection"
          :dts-root-collection-identifier="dtsRootCollectionId"
          :root-collection-identifier="rootCollectionId"
          :application-config="appConfig"
          :collection-config="collConfig"
          :toc="currentPageData"
          :margin="0"
        />
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
                {{ aboutBttnTxt }}
              </router-link><!-- , params: {collId: collectionId}  -->
              <router-link
                v-else
                :to="{ name: 'About'}"
                active-class="active"
              >
                {{ aboutBttnTxt }}
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
    <section class="main app-width-margin">
      <!-- homePageSettings.descriptionSection.customCollectionDescription, use it and pass DTS description and homePageSettings.descriptionSection.collectionDescription settings if available -->
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
      <!-- no homePageSettings.descriptionSection.customCollectionDescription : use DTS API collection description if available -->
      <div
        v-else-if="currCollection.description"
        id="article"
        class="article app-width-margin"
      >
        <h1>La collection</h1>
          {{ currCollection.description }}
      </div>
      <!-- no homePageSettings.descriptionSection.customCollectionDescription & no DTS description : use user settings description (homePageSettings.descriptionSection.collectionDescription) -->
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
    <div class="wrapper">
      <div class="collection-toc-area app-width-margin">
        <div
          class="collection-toc-area-header"
          :class="expandedById[collectionId] ? 'expanded': ''"
          @click.prevent="toggleExpanded(collectionId)"
        >
          <a
            href="#"
            class="collBrowseButton"
          >
            {{ browseBttnTxt }}
          </a>
          <a
            href="#"
            class="toggle-btn"
            :class="expandedById[collectionId] ? 'expanded': ''"
          />
        </div>
        <div v-if="componentTOC.length > 0"
          class="menu app-width-margin"
          :class="expandedById[collectionId] ? 'expanded': ''"
        >
          <div v-if="(expandedById[collectionId] && componentTOC.length > 0)">
            <CollectionTOC
              :is-doc-projectId-included="isDocProjectIdInc"
              :display-option="displayOpt"
              :current-collection="currCollection"
              :dts-root-collection-identifier="dtsRootCollectionId"
              :root-collection-identifier="rootCollectionId"
              :application-config="appConfig"
              :collection-config="collConfig"
              :toc="componentTOC"
              :margin="0"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, defineAsyncComponent, inject, reactive, ref, shallowRef, watch } from 'vue'

import { getMetadataFromApi } from '@/api/document.js'
import CollectionTOC from '@/components/CollectionTOC.vue'
import store from '@/store'

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
    const customCollectionDescription = ref(props.collectionConfig.homePageSettings.descriptionSection.customCollectionDescription ? props.collectionConfig.homePageSettings.descriptionSection.customCollectionDescription : {})
    console.log('HomePage setup customCollectionDescription', customCollectionDescription.value)
    const customDescription = shallowRef('')
    const collectionAltTitle = ref(props.collectionConfig.homePageSettings.pageHeader.collectionAltTitle)
    console.log('HomePage setup collectionAltTitle', collectionAltTitle.value)
    const aboutBttnTxt = ref(props.collectionConfig.homePageSettings.pageHeader.aboutButtonText)
    const browseBttnTxt = ref(props.collectionConfig.homePageSettings.listSection.browseButtonText)
    const collectionId = ref(props.collectionIdentifier)
    console.log('HomePage setup collectionId', collectionId.value)

    let customCss = shallowRef({})
    const cssPath = ref('')

    const componentTOC = ref([])
    const currCollection = ref(props.currentCollection)

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

    if (collConfig.value.homePageSettings && collConfig.value.homePageSettings.listSection && collConfig.value.homePageSettings.listSection.displaySort && collConfig.value.homePageSettings.listSection.displaySort.length > 0) {
      // console.log('HomePage setup displaySort', collConfig.value.homePageSettings.listSection.displaySort)
      componentTOC.value = customSort([...currCollection.value.member], collConfig.value.homePageSettings.listSection.displaySort)
    } else {
      componentTOC.value = [...currCollection.value.member].sort((a, b) => a.title.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '') > b.title.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '') ? 1 : -1)
    }
    console.log('HomePage currentCollection.value / componentTOC.value : ', currCollection.value, componentTOC.value)
    console.log('HomePage componentTOC / collectionId : ', Object.fromEntries(componentTOC.value.map(col => [col.identifier, false])), componentTOC.value, collectionId, currCollection)

    const displayOpt = ref(props.collectionConfig.homePageSettings.listSection.displayMode)
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
        // console.log('HomePage toggleExpanded componentTOC', componentTOC.value)
      }
      expandedById.value[collId] = !expandedById.value[collId]
      state.isTreeOpened = !state.isTreeOpened
      // console.log('HomePage toggleExpanded after expandedById[collectionId] : ', collId, expandedById.value)
    }

    const homeCssClass = computed(() => {
      return state.isTreeOpened ? 'is-tree-opened' : ''
    })

    const getCustomCss = async () => {
      removeCustomCss()
      if (collConfig.value.collectionCustomCss) {
        // const appCssConfs = import.meta.glob('confs/**/*.customCss.css', { eager: true })
        const appCssConfs = import.meta.glob('confs/**/*.customCss.css', { eager: false })
        console.log('HomePage getCustomCss appCssConfs', appCssConfs)
        console.log('HomePage getCustomCss collConfig.value.collectionCustomCss', collConfig.value.collectionCustomCss)
        console.log('HomePage getCustomCss get in if')
        /* const match = appCssConfs[`${import.meta.env.VITE_APP_CUSTOM_SETTINGS_PATH}/${collConfig.value.collectionId}/assets/css/${collConfig.value.collectionId}.customCss.css`]
        console.log('HomePage getCustomCss match path', `${import.meta.env.VITE_APP_CUSTOM_SETTINGS_PATH}/${collConfig.value.collectionId}/assets/css/${collConfig.value.collectionId}.customCss.css`)
        console.log('HomePage getCustomCss match', match) */
        cssPath.value = `confs/${collConfig.value.collectionId}/assets/css/${collConfig.value.collectionId}.customCss.css`
        console.log('HomePage getCustomCss path', `${import.meta.env.VITE_APP_CUSTOM_SETTINGS_PATH}/${collConfig.value.collectionId}/assets/css/${collConfig.value.collectionId}.customCss.css`)

        /* customCss.value = await import(`confs/${collConfig.value.collectionId}/assets/css/${collConfig.value.collectionId}.customCss.css?raw`) */

        if (collConfig.value.collectionCustomCss && appCssConfs[`${import.meta.env.VITE_APP_CUSTOM_SETTINGS_PATH}/${collConfig.value.collectionCustomCss}/assets/css/${collConfig.value.collectionCustomCss}.customCss.css`]) {
          console.log('HomePage getCustomCss from collection and customCss exists : ', collConfig.value.collectionCustomCss, appCssConfs[`${import.meta.env.VITE_APP_CUSTOM_SETTINGS_PATH}/${collConfig.value.collectionCustomCss}/assets/css/${collConfig.value.collectionCustomCss}.customCss.css`])
          customCss.value = await import(`confs/${collConfig.value.collectionCustomCss}/assets/css/${collConfig.value.collectionCustomCss}.customCss.css?raw`)
          const style = document.createElement('style')
          style.textContent = customCss.value.default
          style.id = 'customCss'
          document.head.append(style)
          console.log('HomePage getCustomCss customCss.value : ', customCss.value)
        }
      }
    }
    const removeCustomCss = () => {
      console.log('HomePage removeCustomCss store.state.collectionId', store.state.collectionId)
      const styleTags = [...document.querySelectorAll('style')]
      console.log('HomePage removeCustomCss styleTags ', styleTags)
      styleTags.forEach((tag) => {
        // console.log('HomePage watch store.state.collectionId getCustomCss tag.textContent ', tag.textContent)
        if (tag.id === 'customCss') {
          console.log('HomePage removeCustomCss tag.textContent ', tag.textContent)
          console.log('HomePage removeCustomCss tag.id ', tag.id)
          tag.remove()
        }
      })
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
      isDocProjectIdInc.value = newProps.isDocProjectIdIncluded
      componentTOC.value = []
      dtsRootCollectionId.value = newProps.dtsRootCollectionIdentifier
      rootCollectionId.value = newProps.rootCollectionIdentifier
      collectionId.value = newProps.collectionIdentifier
      appConfig.value = newProps.applicationConfig
      collConfig.value = newProps.collectionConfig
      displayOpt.value = newProps.collectionConfig.homePageSettings.listSection.displayMode
      pageSize.value = newProps.collectionConfig.homePageSettings.listSection.cardCollectionPerPage
      browseBttnTxt.value = newProps.collectionConfig.homePageSettings.listSection.browseButtonText
      currCollection.value = newProps.currentCollection
      collectionAltTitle.value = newProps.collectionConfig.homePageSettings.pageHeader.collectionAltTitle
      aboutBttnTxt.value = newProps.collectionConfig.homePageSettings.pageHeader.aboutButtonText
      collectionDescription.value = newProps.collectionConfig.homePageSettings.descriptionSection.collectionDescription
      customCollectionDescription.value = newProps.collectionConfig.homePageSettings.descriptionSection.customCollectionDescription
      if (collConfig.value.homePageSettings && collConfig.value.homePageSettings.listSection && collConfig.value.homePageSettings.listSection.displaySort && collConfig.value.homePageSettings.listSection.displaySort.length > 0) {
        // console.log('HomePage watch displaySort', collConfig.value.homePageSettings.listSection.displaySort)
        componentTOC.value = customSort([...currCollection.value.member], collConfig.value.homePageSettings.listSection.displaySort)
      } else {
        componentTOC.value = [...currCollection.value.member].sort((a, b) => a.title.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '') > b.title.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '') ? 1 : -1)
      }
      console.log('HomePage watch collectionConfig collectionDescription : ', collConfig.value, collectionDescription.value)
      paginated()
      if (customCollectionDescription.value) {
        customDescription.value = await getCustomHomeDescription()
      } else {
        customDescription.value = {}
      }
      console.log('HomePage watch collConfig.value.collectionCustomCss : ', collConfig.value, collConfig.value.collectionCustomCss)
      if (collConfig.value.collectionCustomCss) {
        console.log('HomePage watch collConfig.value.collectionCustomCss IF: ', collConfig.value.collectionCustomCss)
        await getCustomCss()
      } else if (customCss.value) {
        console.log('HomePage watch collConfig.value.collectionCustomCss ELSE: ', customCss.value)
        removeCustomCss()
      }
    }, { deep: true, immediate: true })

    watch(currentPage, () => {
      paginated()
    })
    watch(
      () => store.state.collectionId, function () {
        console.log('HomePage watch store.state.collectionId', store.state.collectionId)
        if (store.state.collectionId && store.state.collectionId !== collectionId.value && customCss.value) {
          removeCustomCss()
        }
      }, { immediate: true }
    )

    return {
      appConfig,
      collConfig,
      customSort,
      isDocProjectIdInc,
      dtsRootCollectionId,
      rootCollectionId,
      collectionAltTitle,
      aboutBttnTxt,
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
      displayOpt,
      pageSize,
      browseBttnTxt,
      totalPages,
      paginated,
      currentPageData,
      customCollectionDescription,
      getCustomHomeDescription,
      customDescription,
      getCustomCss,
      removeCustomCss,
      customCss,
      cssPath
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
  margin: 1em 0 1em 0;
  padding-top: 20px;
  padding-bottom: 20px;
  font-size: 25px;
  font-weight: 500;
  line-height: 33px;
  text-transform: none;
  /* color: #971716; */
  color: var(--text-color);
}
.home-mask > .wrapper > .collection-toc-area {
  width: 100%;
  font-family: "Barlow", sans-serif !important;
  margin-bottom: 30px !important;
}
.collection-toc-area-header {
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
.collection-toc-area-header > a {
  text-transform: uppercase;
  font-family: "Barlow Semi Condensed", sans-serif;
  font-weight: 500;
  color: #4a4a4a !important;
  text-decoration: none;
  border: none;
  &.collBrowseButton {
    margin-left: 0;
  }
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
  &.expanded {
    background: url(../assets/images/croix.svg) center / cover no-repeat;
  }
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
    /* text-transform: uppercase; */
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
    /* border: 1px solid #C00055; */
    border: 1px solid var(--text-color);
    border-radius: 3.2px;

    font-family: inherit;
    font-size: 18px;
    /* color: #CB2158; */
    color: var(--text-color);
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
  gap: 20px;
  width: 100%;
  margin: 0;
  padding-bottom: 5px;
  /* border-bottom: solid 1px #b9192f; */
  border-bottom: solid 1px var(--text-color)
}
.pagination-documents-count {
  margin-right: auto;
  /* color: #b9192f; */
  color: var(--text-color);
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
