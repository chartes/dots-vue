<template>
  <div class="collection-list">
    <div class="tiles">
      <div class="tile page-header app-width-padding">
        <div class="is-flex is-flex-direction-column is-align-items-center is-justify-content-center wrapper">
          <div class="tile is-child article app-width-margin">
            <div class="title-tile">
              <p class="title">
                {{ collectionAltTitle ? collectionAltTitle : currCollection.title }}
              </p>
            </div>
            <div
              v-if="aboutBttnTxt"
              class="project-tile"
            >
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
        v-if="customDescription"
        id="home-article"
        class="article app-width-margin"
      >
        <component
          :is="customDescription"
          :dts-collection-description="currCollection.description"
          :custom-collection-description="collectionDescription"
          :application-root-url="appRootUrl"
        />
        <!-- <p class="texte no-dts-description">This collection provides no DTS default description.</p> -->
      </div>
      <!-- no homePageSettings.descriptionSection.customCollectionDescription : use DTS API collection description if available -->
      <div
        v-else-if="currCollection.description"
        id="home-article"
        class="article app-width-margin"
      >
        <h1>La collection</h1>
        {{ currCollection.description }}
      </div>
      <!-- no homePageSettings.descriptionSection.customCollectionDescription & no DTS description : use user settings description (homePageSettings.collectionDescription) -->
      <div
        v-else-if="collectionDescription"
        id="home-article"
        class="article app-width-margin"
      >
        <h1>La collection</h1>
        {{ collectionDescription }}
        <!-- <p class="texte no-dts-description">This collection provides no DTS default description.</p> -->
      </div>
    </section>
    <div
      class="document-list app-width-margin"
      :class="displayOpt !== 'toc' ? `${displayOpt}-mode` : 'toc-mode'"
    >
      <CollectionTOC
        v-if="displayOpt !== 'list'"
        :is-doc-projectId-included="isDocProjectIdInc"
        :display-option="displayOpt"
        :current-collection="currCollection"
        :dts-root-collection-identifier="dtsRootCollectionId"
        :root-collection-identifier="rootCollectionId"
        :application-config="appConfig"
        :collection-config="collConfig"
        :toc="componentTOC"
        :level="1"
        :margin="0"
      />

      <!-- RESOURCE LIST AS LIST OR TOC (conf: homePageSettings.listSection.displayMode = 'list' or 'toc' or unset) -->
      <ResourcesList
        v-else-if="displayOpt === 'list'"
        :data="dataSource"
        :columns-config="columns"
        :page-size="pageSize"
        :is-doc-project-id-included="isDocProjectIdInc"
        :root-collection-identifier="rootCollectionId"
        :is-table-loading="isTableLoading"
        :counts="resultCount"
      />
    </div>
  </div>
</template>

<script>
import { computed, defineAsyncComponent, inject, onBeforeUnmount, reactive, ref, shallowRef, watch } from 'vue'

import { getMetadataFromApi } from '@/api/document.js'
import ResourcesList from '@/components/ResourcesList.vue'
import CollectionTOC from '@/components/CollectionTOC.vue'
import { getSimpleObject } from '@/composables/utils.js'

const collator = new Intl.Collator('fr', {
  numeric: true,
  sensitivity: 'base'
})

export default {
  name: 'HomePage',
  components: { ResourcesList, CollectionTOC },
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
  setup (props) {
    const state = reactive({
      isTreeOpened: false
    })
    const layout = inject('variable-layout')

    const appRootUrl = ref(`${import.meta.env.VITE_APP_APP_ROOT_URL}`)
    console.log('HomePage setup appRootUrl', appRootUrl.value)
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

    const componentTOC = ref([])
    const currCollection = computed(() => props.currentCollection)

    const dataSource = ref([])
    const pageSize = computed(() =>
      props.collectionConfig?.homePageSettings?.listSection?.cardCollectionPerPage
    )

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

    console.log('HomePage set currentCollection.value / componentTOC.value (not yet set) : ', currCollection.value, componentTOC.value)

    const displayOpt = ref(props.collectionConfig.homePageSettings.listSection.displayMode)
    console.log('HomePage set displayOpt :', displayOpt.value)

    const expandedById = ref([])

    const toggleExpanded = async (collId) => {
      console.log('HomePage toggleExpanded currCollection.value, collId, componentTOC.value expandedById.value', currCollection.value, collId, componentTOC.value, expandedById.value)
      if (componentTOC.value.length === 0) {
        console.log('HomePage toggleExpanded triggered')
        const response = await getMetadataFromApi(collId, null, null)
        response.member.forEach(m => getSimpleObject(m, collId, currCollection.value?.projectIdentifier))

        // optional rest all resources to toc ?
        // if (response.member.every(el => el.citeType === 'Resource')) {
        //   displayOpt.value = 'toc'
        //   console.log('HomePage toggleExpanded need to update displayOpt !!!!!!!!!!!')
        // }
        componentTOC.value = response.member

        console.log('HomePage toggleExpanded updated componentTOC.value', componentTOC.value, response)
      }
      expandedById.value[collId] = !expandedById.value[collId]
      //state.isTreeOpened = !state.isTreeOpened
      console.log('HomePage toggleExpanded after expandedById[collectionId] : ', collId, expandedById.value)

    }


    const homeCssClass = computed(() => {
      return state.isTreeOpened ? 'is-tree-opened' : ''
    })

    const ImgUrl = (source) => {
      // TODO: provide a logo object with url AND legend ?
      const sourceConfig = appConfig.value.collectionsConf.filter(coll => coll.collectionId === source)[0]
      if (sourceConfig?.homePageSettings?.listSection?.logo?.length > 0) {
        console.log('HomePage ImgUrl found : ', sourceConfig.homePageSettings.listSection.logo)
        const images = Object.fromEntries(Object.entries(import.meta.glob('confs/*/assets/images/*.*', { eager: true })).map(([key, value]) => {
          const newKey = key.split('/').slice(-4).join('/')
          return [newKey, value]
        }))
        console.log('HomePage ImgUrl images: ', images)
        const match = images[`${sourceConfig.collectionId}/assets/images/${sourceConfig.homePageSettings.listSection.logo}`]
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

    const getCustomHomeDescription = async () => {
      let component
      console.log('HomePage getCustomHomeDescription collConfig.value.collectionId', collConfig.value.collectionId)
      console.log('HomePage getCustomHomeDescription collConfig.value.aboutPageSettings', collConfig.value.homePageSettings)
      const comps = Object.fromEntries(Object.entries(import.meta.glob('confs/**/*.vue')).map(([key, value]) => {
        // remove first / if exists
        const newKey = key.replace(import.meta.env.VITE_APP_CUSTOM_SETTINGS_PATH, "").replace(/^\//, "")
        return [newKey, value]
      }))

      const defaultSettings = import.meta.glob('../settings/default/HomePageContent.vue', { eager: true })
      comps['../settings/default/HomePageContent.vue'] = defaultSettings['../settings/default/HomePageContent.vue']

      const match = comps[`${collConfig.value.collectionId}/${customCollectionDescription.value.compName}.vue`]
      const matchRootCollection = comps[`${rootCollectionId.value}/${customCollectionDescription.value.compName}.vue`]
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
      dtsRootCollectionId.value = newProps.dtsRootCollectionIdentifier
      rootCollectionId.value = newProps.rootCollectionIdentifier
      collectionId.value = newProps.collectionIdentifier
      appConfig.value = newProps.applicationConfig
      collConfig.value = newProps.collectionConfig
      console.log('HomePage watch collConfig.value : ', newProps.collectionConfig)
      displayOpt.value = newProps.collectionConfig.homePageSettings.listSection.displayMode
      console.log('HomePage watch displayOpt.value : ', newProps.collectionConfig.homePageSettings.listSection.displayMode)
      browseBttnTxt.value = newProps.collectionConfig.homePageSettings.listSection.browseButtonText
      collectionAltTitle.value = newProps.collectionConfig.homePageSettings.pageHeader.collectionAltTitle
      aboutBttnTxt.value = newProps.collectionConfig.homePageSettings.pageHeader.aboutButtonText
      collectionDescription.value = newProps.collectionConfig.homePageSettings.descriptionSection.collectionDescription
      customCollectionDescription.value = newProps.collectionConfig.homePageSettings.descriptionSection.customCollectionDescription
      console.log('HomePage watch collectionConfig collectionDescription : ', collConfig.value, collectionDescription.value)

      if (newProps.collectionConfig.homePageSettings.listSection.openState && !state.isTreeOpened) {
        console.log('HomePage reopening ???')
        await toggleExpanded(currCollection.value.identifier)
      }

    }, { deep: true, immediate: true })

    watch(
  () => customCollectionDescription.value,
  async (newVal) => {
    if (!newVal) {
      customDescription.value = null
      return
    }

    try {
      customDescription.value = await getCustomHomeDescription()
    } catch (e) {
      console.error('Erreur chargement description:', e)
      customDescription.value = null
    }
  },
  { immediate: true }
)
    watch(
  () => props.currentCollection,
  (newVal) => {
    if (!newVal) return
    let result
    //componentTOC.value = []

    if (collConfig.value?.homePageSettings?.listSection?.displaySort?.length > 0) {
      result = customSort(newVal.member, collConfig.value.homePageSettings.listSection.displaySort)
    } else {
      result = [...newVal.member].sort((a, b) =>
        collator.compare(a.title, b.title)
      )
    }

    componentTOC.value.splice(0, componentTOC.value.length, ...result)
    // optional rest all resources to toc ?
    // if (componentTOC.value.every(el => el.citeType === 'Resource')) {
    //   displayOpt.value = 'toc'
    //   console.log('HomePage toggleExpanded need to update displayOpt !!!!!!!!!!!')
    // }
    console.log('HomePage watch props.currentCollection, rebuild componentTOC.value', componentTOC.value)
  },
  { deep: true, immediate: true }
)


    // LIST DATA (FETCH ALL RESOURCES)
    let currentRunId = 0
    const isTableLoading = ref(true)
    const resultCount = ref(0)
    const listOfResources = async (items, runId) => {
      //console.log('HomePage listOfResources items', items)
      if (!Array.isArray(items)) return []
      const result = []

      for (const item of items) {
        if (runId !== currentRunId) return result

        const type = item.type || item.citeType || item['@type']

        // if RESOURCE → push to results
        if (type === 'Resource') {
          console.log('HomePage listOfResources pushing resource items', item)

          result.push(item)
          resultCount.value += 1
          continue
        }

        // if COLLECTION → get descendants
        if (type === 'Collection') {
          const collId = item.identifier || item['@id']
          const projectId = item.projectIdentifier
          console.log('HomePage listOfResources getting childs of collId', item)

          try {
            const response = await getMetadataFromApi(collId, null, null)

            const members = response.member.map(m => ({
              ...m,
              identifier: m.identifier ?? m['@id'],
              parent: m.parent ?? collId,
              projectIdentifier: m.projectIdentifier ?? projectId
            }))

            console.log('HomePage listOfResources members', members)

            // recursive descendants loop
            const children = await listOfResources(members, runId)

            if (runId !== currentRunId) return result

            result.push(...children)
          } catch (e) {
            console.error('HomePage listOfResources erreur API collection', collId, e)
          }
        }
      }
      //console.log('HomePage listOfResources result', result)
      return result
    }

    const columns = computed(() => {
      if (
        displayOpt.value === 'list' &&
        props.collectionConfig?.homePageSettings?.listSection?.columns?.length > 0
      ) {
        return props.collectionConfig.homePageSettings.listSection.columns
      }
      return []
    })

    watch(
    () => [componentTOC.value, displayOpt.value],
    async () => {
        currentRunId++
        const runId = currentRunId


        let base = componentTOC.value || []

        if (displayOpt.value === 'list') {
          base = await listOfResources(base, runId)
        } else {
          base = [...base]
        }

        if (collConfig.value?.homePageSettings?.listSection?.displaySort?.length > 0) {
          base = customSort(base, collConfig.value.homePageSettings.listSection.displaySort)
        } else {
          base = [...base].sort((a, b) => collator.compare(a.title, b.title))
        }
        if (runId !== currentRunId) return


        dataSource.value = base
        isTableLoading.value = false
      },{ immediate: true }
    )

    onBeforeUnmount(() => {
      currentRunId++
    })

    return {
      appRootUrl,
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
      displayOpt,
      browseBttnTxt,
      customCollectionDescription,
      getCustomHomeDescription,
      customDescription,
      columns,
      pageSize,
      dataSource,
      resultCount,
      isTableLoading
    }
  }
}
</script>

<style scoped>
a {
  border-bottom: none;
}
#home-article {
  padding: 40px 10% 120px;
  border-bottom: 1px dotted #ffffff;
  /* min-height: 100%; */
}
#home-article article {
  margin: 0;
}
#home-article h1,
#home-article {
  font-family: "Barlow", sans-serif !important;
}
#home-article h1 {
  margin: 1em 0 1em 0;
  padding-top: 20px;
  padding-bottom: 20px;
  font-size: 25px;
  font-weight: 500;
  line-height: 33px;
  text-transform: none;
  color: var(--text-color)
}

#home-article {
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
