<template>
  <div class="collection-wrapper">
    <CollectionHeader
      :collection-config="collConfig"
      :application-config="appConfig"
      :current-collection="currCollection"
      :collection-identifier="collectionId"
      :root-collection-identifier="rootCollectionId"
      :show-about="true"
    />
    <div
      class="document-list app-width-margin"
      :class="displayOpt + '-mode'"
    ><!--:class="isAboutOpened ? `is-about-opened ${displayOpt}-mode` : `${displayOpt}-mode`"-->

      <CollectionTOC
        v-if="displayOpt !== 'list' && displayOpt !== 'mixed'"
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
      <CollectionCardWithToc
        v-if="displayOpt === 'mixed'"
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
import CollectionCardWithToc from '@/components/CollectionCardWithToc.vue'
import DirectionalChevron from '@/assets/images/DirectionalChevron.vue'
import CollectionHeader from '@/components/CollectionHeader.vue'

const collator = new Intl.Collator('fr', {
  numeric: true,
  sensitivity: 'base'
})

export default {
  name: 'HomePage',
  components: { CollectionHeader, CollectionCardWithToc, ResourcesList, CollectionTOC },
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
    const normalisedBaseUrl = (baseURL) => {
      return baseURL.replace(/\/+$/, '') + '/'
    }
    const isDocProjectIdInc = computed(() => props.isDocProjectIdIncluded)
    const dtsRootCollectionId = computed(() => props.dtsRootCollectionIdentifier)
    const rootCollectionId = computed(() => props.rootCollectionIdentifier)
    const appConfig = computed(() => props.applicationConfig)
    const collConfig = computed(() => props.collectionConfig)
    const collectionDescription = computed(() => props.collectionConfig?.homePageSettings?.descriptionSection?.collectionDescription || '')

    const customCollectionDescription = computed(() =>
      props.collectionConfig?.homePageSettings?.descriptionSection?.customCollectionDescription)
    console.log('HomePage setup customCollectionDescription', customCollectionDescription.value)
    const customDescription = shallowRef('')
    const collectionAltTitle = computed(() => props.collectionConfig.homePageSettings?.pageHeader?.collectionAltTitle)
    console.log('HomePage setup collectionAltTitle', collectionAltTitle.value)
    const aboutBttnTxt = computed(() => props.collectionConfig.homePageSettings.pageHeader.aboutButtonText)
    const isAboutOpened = ref(false)

    const hasNonEmptyObject = arr => arr.some(obj => obj && Object.keys(obj).length > 0)
    const hasAbout = computed(() => hasNonEmptyObject(props.collectionConfig.aboutPageSettings))
    const browseBttnTxt = computed(() => props.collectionConfig.homePageSettings.listSection.browseButtonText)
    const collectionId = computed(() => props.collectionIdentifier)
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

    const displayOpt = ref(props.collectionConfig?.homePageSettings?.listSection?.displayMode)
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


    // IMAGES

    /* COLLECTION BANNER */
    const banner = computed(() => getBanner())
    const bannerUrl = computed(() => banner.value.url)
    const hasBanner = computed(() => !!banner.value.url)
    const bannerType = computed(() => banner.value.type)

    const collectionBanner = computed(() => {
      if (!bannerUrl.value) return {}

      return {
        backgroundImage: `url(${bannerUrl.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    })

    const getBanner = () => {
      // Load image candidates
      const images = Object.fromEntries(
        Object.entries(
          import.meta.glob([
            'confs/*/assets/images/*.*',
            '/src/assets/images/*.*'
          ], { eager: true })
        ).map(([key, value]) => {
          const newKey = key.split('/').slice(-4).join('/')
          return [newKey, value]
        })
      )
      // Current collection banner name ?
      const collectionBanner = collConfig.value.homePageSettings?.pageHeader?.collectionBannerImg
      // Default banner name ?
      const defaultBannerName = appConfig.value?.genericConf?.homePageSettings?.pageHeader?.collectionBannerImg

      // If collection banner name is default name
      if (collectionBanner === defaultBannerName) {

        // Default images (Dots-vue app or custom folder)
        const defaultCustMatch = images[`default/assets/images/${defaultBannerName}`]
        const defaultAppMatch = images[`src/assets/images/${defaultBannerName}`]

        // Generic banner (custom settings default folder)
        if (defaultCustMatch) {
          return {
            url: defaultCustMatch.default,
            type: 'default'
          }
        }

        // Fallback src/assets
        if (defaultAppMatch) {
          return {
            url: defaultAppMatch.default,
            type: 'default'
          }
        }
      }
      // Not a default banner : find a matching banner
      else if (collectionBanner && collectionBanner.length > 0) {
        // External URL
        if (collectionBanner.startsWith('http')) {
          return {
            url: collectionBanner,
            type: 'collection'
          }
        }
        // Local collection image
        const match = images[`${collConfig.value.collectionId}/assets/images/${collectionBanner}`]
        console.log('HomePage getBanner match: ', match)
        if (match) {
          return {
            url: match.default,
            type: 'collection'
          }
        }
      }
      // No banner found
      return {
        url: null,
        type: 'none'
      }
    }

    /* COLLECTION IMAGE */
    const image = computed(() => getImg())
    const imgUrl = computed(() => image.value.url)
    const hasImage = computed(() => !!image.value.url)
    const imageType = computed(() => image.value.type)
    const imageComponent = computed(() => image.value.component)

    const isVueComponent = (val) => typeof val === 'object' && (val.render || val.setup)

    const resolveModule = (mod, type) => {
      if (!mod) return null

      const value = mod.default

      // Vue component
      if (isVueComponent(value)) {
        return {
          component: value,
          type: 'component'
        }
      }

      // Regular image
      return {
        url: value,
        type
      }
    }

    const getImg = () => {
      // TODO: provide a logo object with url AND legend ?
      // Load image candidates
      const images = Object.fromEntries(
        Object.entries(
          import.meta.glob([
            'confs/*/assets/images/*.*',
            '/src/assets/images/*.*'
          ], { eager: true })
        ).map(([key, value]) => {
          const newKey = key.split('/').slice(-4).join('/')
          return [newKey, value]
        })
      )
      // Current collection image name ?
      const collectionImg = collConfig.value.homePageSettings?.listSection?.logo
      // Default image name ?
      const defaultImgName = appConfig.value?.genericConf?.homePageSettings?.listSection?.logo

      // If collection image name is default name
      if (collectionImg === defaultImgName) {

        // Default images (Dots-vue app or custom folder)
        const defaultCustMatch = images[`default/assets/images/${defaultImgName}`]
        const defaultAppMatch = images[`src/assets/images/${defaultImgName}`]

        // Generic image (custom settings default folder)
        const resolved =
          resolveModule(defaultCustMatch, 'default') ||
          resolveModule(defaultAppMatch, 'default')

        if (resolved) return resolved
      }
      // Not a default image : find a matching image
      else if (collectionImg && collectionImg.length > 0) {
        console.log('HomePage getImg found : ', collectionImg)
        console.log('HomePage getImg images: ', images)
        // External URL
        if (collectionImg.startsWith('http')) {
          return {
            url: collectionImg,
            type: 'collection'
          }
        }
        // Local collection image
        const match = images[`${collConfig.value.collectionId}/assets/images/${collectionImg}`]
        console.log('HomePage getImg match: ', match)

        const resolved = resolveModule(match, 'collection')
        if (resolved) return resolved
      }
      // No image found
      return {
        url: null,
        type: 'none'
      }
    }

    // const getCustomHomeDescription = async () => {
    //   let component
    //   console.log('HomePage getCustomHomeDescription collConfig.value.collectionId', collConfig.value.collectionId)
    //   console.log('HomePage getCustomHomeDescription collConfig.value.aboutPageSettings', collConfig.value.homePageSettings)
    //   const comps = Object.fromEntries(Object.entries(import.meta.glob('confs/**/*.vue')).map(([key, value]) => {
    //     // remove first / if exists
    //     const newKey = key.replace(import.meta.env.VITE_APP_CUSTOM_SETTINGS_PATH, '').replace(/^\//, '')
    //     return [newKey, value]
    //   }))
    //
    //   const defaultSettings = import.meta.glob('../settings/default/HomePageContent.vue', { eager: true })
    //   comps['../settings/default/HomePageContent.vue'] = defaultSettings['../settings/default/HomePageContent.vue']
    //
    //   const match = comps[`${collConfig.value.collectionId}/${customCollectionDescription.value.compName}.vue`]
    //   const matchRootCollection = comps[`${rootCollectionId.value}/${customCollectionDescription.value.compName}.vue`]
    //   console.log('match 1 : ', match)
    //   console.log('matchRootCollection : ', matchRootCollection)
    //   const defaultCollection = comps['../settings/default/HomePageContent.vue']
    //
    //   if (match) {
    //     console.log('match 2 : ', match)
    //     component = defineAsyncComponent(() => import(`confs/${collConfig.value.collectionId}/${customCollectionDescription.value.compName}.vue`)
    //       .then((comp) => {
    //         return comp
    //       })
    //       .catch((error) => {
    //         console.log(`error loading 1 confs/${collConfig.value.collectionId}/${customCollectionDescription.value.compName}.vue : `, error)
    //       })
    //     )
    //   } else if (matchRootCollection) {
    //     component = defineAsyncComponent(() => import(`confs/${rootCollectionId.value}/${customCollectionDescription.value.compName}.vue`)
    //       .then((comp) => {
    //         return comp
    //       })
    //       .catch((error) => {
    //         console.log(`error loading 2 confs/${rootCollectionId.value}/${customCollectionDescription.value.compName}.vue : `, error)
    //       })
    //     )
    //   // matching About pages as default
    //   // TODO : replace tabName by the default tabNames if incorrectly set
    //   } else if (defaultCollection) {
    //     component = defineAsyncComponent(() => import('../settings/default/HomePageContent.vue')
    //       .then((comp) => {
    //         return comp
    //       })
    //       .catch((error) => {
    //         console.log('error loading \'../settings/default/HomePageContent.vue\' : ', error)
    //       })
    //     )
    //   } else {
    //     console.log('nothing')
    //     component = null
    //   }
    //   return component
    // }

    const toggleAbout = () => {
      isAboutOpened.value = !isAboutOpened.value
    }

    watch(
      () => collConfig.value?.homePageSettings?.listSection?.openState,
      async (openState) => {
        if (openState && !state.isTreeOpened) {
          console.log('HomePage collConfig reopening ???')
          await toggleExpanded(currCollection.value.identifier)
        }
      },
      { immediate: true }
    )

//     watch(
//   () => customCollectionDescription.value,
//   async (newVal) => {
//     if (!newVal) {
//       customDescription.value = null
//       return
//     }
//
//     try {
//       customDescription.value = await getCustomHomeDescription()
//     } catch (e) {
//       console.error('Erreur chargement description:', e)
//       customDescription.value = null
//     }
//   },
//   { immediate: true }
// )
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
        resultCount.value = 0


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
      normalisedBaseUrl,
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
      hasBanner,
      bannerType,
      getBanner,
      collectionBanner,
      hasImage,
      image,
      imageType,
      imageComponent,
      imgUrl,
      getImg,
      collectionId,
      currCollection,
      componentTOC,
      toggleExpanded,
      expandedById,
      displayOpt,
      browseBttnTxt,
      customCollectionDescription,
      //getCustomHomeDescription,
      customDescription,
      toggleAbout,
      isAboutOpened,
      hasAbout,
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
.collection-wrapper {
  width: 100%;
}
.collection-list {
  --first-column-width: 70%;
  /*margin-bottom: 60px;*/
}
/*.collection-list.is-about-opened {
  --first-column-width: 70%;
  margin-bottom: 0;
}*/

.home-article-wrapper {
  padding: 40px 10% 120px;
  border-bottom: 1px dotted #ffffff;
}
.home-article-wrapper {
  width: calc(var(--first-column-width) );
  margin: 0 0 30px !important;
  padding: 45px !important;
  background-color: var(--default-bg-color);
}
#home-article.article {
  margin-bottom: 20px;
}

#home-article.article + a {
  color: var(--fill-color);
}

#home-article.article + a:hover {
  text-decoration: underline;
}

#home-article article {
  margin: 0;
}

#home-article h1 {
  margin: 0;
  padding-top: 20px;
  padding-bottom: 20px;

  font-family: var(--font-primary), sans-serif;
  font-size: 48px;
  font-weight: 700;
  line-height: 1.2;
  text-align: left;
  text-transform: none;
  color: #000;
}

.wrapper {
  width: 100%;
}
.collection-list.has-image:not(.has-banner) .page-header .wrapper {
  background: #FFFFFF;
  gap: 4px;
}

.page-header .wrapper > .tile {
  padding: 25px 45px;
}

.collection-list.has-banner .page-header .wrapper > .tile {
  background: #0f0f0f85;
}

.collection-list:not(.has-banner) .page-header .wrapper > .tile {
  background: #0f0f0f;
}
.collection-image {
  width: calc(100% - var(--first-column-width));
  height: 300px;
}

.collection-image-wrapper {
  width: 100%;
  height: 100%;
}
.banner-default.has-image .collection-component,
.banner-default.has-image .collection-image {
  border-bottom-right-radius: 52px;
  background-color: #FBF8F4;
}
.collection-list.root-collection-list .collection-image,
.collection-list:not(.root-collection-list) .tile.page-header {
  background: transparent;
}
.collection-list.banner-none.has-image .collection-image,
.collection-list.banner-default.has-image .collection-image {
  display: flex;
  align-items: center;
  justify-content: center;

  & > .collection-image-wrapper > img,
  .collection-component {
    display: block;
    width: 100% !important;
    height: 100% !important;
    object-fit: cover;
    object-position: center;
    border-bottom-right-radius: 52px;
    color: var(--fill-color);
    background-color: var(--fill-color);
  }
}

.collection-list.banner-none.image-component .collection-image,
.collection-list.banner-default.image-component .collection-image {
  display: flex;
  align-items: center;
  justify-content: center;

  & > .collection-image-wrapper > img,
  .collection-component {
    display: block;
    width: 100% !important;
    height: 100% !important;
    object-fit: cover;
    object-position: center;
    border-bottom-right-radius: 52px;
    color: var(--fill-color);
    background-color: var(--fill-color);
  }
}
.tile.article,
.tile.app-width-margin {
  position: relative;
  width: 100%;
}
.title-tile {
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 100%;
  border-radius: 6px;

  & > p {
    color: white !important;
  }
}
.project-tile {
  position: absolute;
  bottom: 0;
  left: 45px;
  z-index: 2;
  display: flex;
  width: fit-content;
  background-color: var(--fill-color);
  transform: translateY(50%);
}

.about-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  background: transparent;
  border: none;
  border-radius: 0;
  cursor: pointer;

  padding: 6px 10px;
  font-family: var(--font-secondary), sans-serif;
  font-weight: 400;
  font-size: 16px;
  text-transform: uppercase;
  color: white;

  &:hover {
    background-color: #000000;
  }
}
.document-list {
  display: flex;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  margin-top: 60px;
  padding-top: 25px;
  padding-bottom: 25px;

  &.is-about-opened {
    margin-top: 0;
  }
}
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  /* transform: translateY(-10px); */
}

.collection-about {
  min-height: 30px;
}

@media screen and (max-width: 768px) {
  .collection-about {
    background-color: var(--default-bg-color);
  }

  .collection-list {
    --first-column-width: 100% !important;
  }

  .collection-list:not(.root-collection-list) .page-header .wrapper {
    gap: 0 !important;
  }

  .collection-header.app-width-margin {
    padding: 0;
  }

  .collection-header.app-width-margin :deep(.home-content.app-width-padding) {
    padding: 0;
  }

  .pagination {
    flex-direction: column !important;
    justify-content: center;
  }

  .home-article-wrapper {
    padding: 34px !important;
  }

}

@media screen and (max-width: 640px) {
  .page-header .wrapper > .tile {
    padding: 25px var(--mobile-margin);
  }

  .project-tile {
    left: calc( 2 * var(--mobile-margin));
  }

  #home-article.article {
    padding: 12px var(--mobile-margin) 10px !important;
    margin-bottom: 0;
  }

  .home-article-wrapper {
    padding: 15px 0 !important;
  }

  #home-article h1 {
    padding: 15px 0 10px;
    font-size: 30px;
  }

  #home-article.article + a {
    padding: 0 var(--mobile-margin);
  }

}
</style>

<!--<style scoped>-->
<!--a {-->
<!--  border-bottom: none;-->
<!--}-->
<!--.collection-list {-->
<!--  &#45;&#45;first-column-width: 70%;-->
<!--}-->
<!--.home-article-wrapper {-->
<!--  padding: 40px 10% 120px;-->
<!--  border-bottom: 1px dotted #ffffff;-->
<!--}-->
<!--.home-article-wrapper {-->
<!--  width: calc(var(&#45;&#45;first-column-width) );-->
<!--  margin: 0 0 30px !important;-->
<!--  padding: 45px !important;-->
<!--  background-color: var(&#45;&#45;default-bg-color);-->
<!--}-->
<!--#home-article.article {-->
<!--  margin-bottom: 20px;-->
<!--}-->

<!--#home-article article {-->
<!--  margin: 0;-->
<!--}-->
<!--#home-article h1 {-->
<!--  margin: 0;-->
<!--  padding-top: 20px;-->
<!--  padding-bottom: 20px;-->

<!--  font-family: var(&#45;&#45;font-primary), sans-serif;-->
<!--  font-size: 48px;-->
<!--  font-weight: 700;-->
<!--  line-height: 1.2;-->
<!--  text-transform: none;-->
<!--  color: #000;-->
<!--}-->

<!--.wrapper {-->
<!--  width: 100%;-->
<!--}-->

<!--.collection-list.has-image:not(.has-banner) .page-header .wrapper {-->
<!--  background: #FFFFFF;-->
<!--  gap: 4px;-->
<!--}-->

<!--.page-header .wrapper > .tile {-->
<!--  padding: 25px 45px;-->
<!--}-->

<!--.collection-list.has-banner .page-header .wrapper > .tile {-->
<!--  background: #0f0f0f85;-->
<!--}-->

<!--.collection-list:not(.has-banner) .page-header .wrapper > .tile {-->
<!--  background: #0f0f0f;-->
<!--}-->

<!--.collection-image {-->
<!--  width: calc(100% - var(&#45;&#45;first-column-width));-->
<!--  height: 330px;-->
<!--}-->

<!--.collection-image-wrapper {-->
<!--  width: 100%;-->
<!--  height: 100%;-->
<!--}-->
<!--.banner-default.has-image .collection-component,-->
<!--.banner-default.has-image .collection-image {-->
<!--  border-bottom-right-radius: 52px;-->
<!--  background-color: #FBF8F4;-->
<!--}-->
<!--/* still needed ? */-->
<!--.collection-list.root-collection-list .collection-image,-->
<!--.collection-list:not(.root-collection-list) .tile.page-header {-->
<!--  background: transparent;-->
<!--}-->

<!--.collection-list.banner-none.has-image .collection-image,-->
<!--.collection-list.banner-default.has-image .collection-image {-->
<!--  display: flex;-->
<!--  align-items: center;-->
<!--  justify-content: center;-->
<!--  & > .collection-image-wrapper > img, .collection-component {-->
<!--    display: block;-->
<!--    width: 100% !important;-->
<!--    height: 100% !important;-->
<!--    object-fit: cover;-->
<!--    object-position: center;-->
<!--    border-bottom-right-radius: 52px;-->
<!--    color: var(&#45;&#45;fill-color);-->
<!--    background-color: var(&#45;&#45;fill-color);-->
<!--  }-->
<!--}-->

<!--.collection-list.banner-none.image-component .collection-image,-->
<!--.collection-list.banner-default.image-component .collection-image {-->
<!--  display: flex;-->
<!--  align-items: center;-->
<!--  justify-content: center;-->
<!--  & > .collection-image-wrapper > img, .collection-component {-->
<!--    display: block;-->
<!--    width: 100% !important;-->
<!--    height: 100% !important;-->
<!--    object-fit: cover;-->
<!--    object-position: center;-->
<!--    border-bottom-right-radius: 52px;-->
<!--    color: var(&#45;&#45;fill-color);-->
<!--    background-color: var(&#45;&#45;fill-color);-->
<!--  }-->
<!--}-->

<!--.tile.article,-->
<!--.tile.app-width-margin {-->
<!--  position: relative;-->
<!--  width: 100%;-->
<!--}-->

<!--.title-tile {-->
<!--  display: flex;-->
<!--  flex-direction: row;-->
<!--  justify-content: center;-->
<!--  width: 100%;-->
<!--  border-radius: 6px;-->

<!--  & > p {-->
<!--      color: white !important;-->
<!--  }-->
<!--}-->

<!--.project-tile {-->
<!--  position: absolute;-->
<!--  bottom: 0;-->
<!--  left: 45px;-->

<!--  display: flex;-->
<!--  width: fit-content;-->
<!--  background-color: var(&#45;&#45;fill-color);-->
<!--  transform: translateY(50%);-->
<!--}-->

<!--.about-button {-->
<!--  display: flex;-->
<!--  align-items: center;-->
<!--  justify-content: space-between;-->
<!--  gap: 8px;-->

<!--  padding: 6px 10px;-->
<!--  font-family: var(&#45;&#45;font-secondary), sans-serif;-->
<!--  font-weight: 400;-->
<!--  font-size: 16px;-->
<!--  text-transform: uppercase;-->
<!--  color: white;-->

<!--  &:hover {-->
<!--    background-color: #000000;-->
<!--  }-->
<!--}-->

<!--.document-list {-->
<!--  display: flex;-->
<!--  justify-content: center;-->
<!--  flex-direction: column;-->
<!--  width: 100%;-->
<!--  margin-top: 60px;-->
<!--  padding-top: 25px;-->
<!--  padding-bottom: 25px;-->
<!--  &.is-about-opened {-->
<!--    margin-top: 0;-->
<!--  }-->
<!--}-->

<!--.no-dts-description {-->
<!--  margin: 25px auto 25px;-->
<!--}-->

<!--/* Chrome, Safari, Edge, Opera */-->
<!--input::-webkit-outer-spin-button,-->
<!--input::-webkit-inner-spin-button {-->
<!--  -webkit-appearance: none;-->
<!--  margin: 0;-->
<!--}-->

<!--.collection-header {-->
<!--  min-height: 30px;-->
<!--}-->

<!--.collection-header :deep(.home-content) {-->
<!--  font-family: var(&#45;&#45;font-primary), sans-serif;-->
<!--  font-weight: normal;-->
<!--  line-height: 1.4;-->
<!--  color: var(&#45;&#45;default-text-color);-->

<!--  a {-->
<!--    color: var(&#45;&#45;default-text-color);-->
<!--    text-decoration: underline;-->

<!--    &:hover {-->
<!--      color: var(&#45;&#45;text-color);-->
<!--    }-->
<!--  }-->
<!--  p, ul {-->
<!--    margin-bottom: 10px;-->
<!--  }-->
<!--  li {-->
<!--    line-height: 1.4;-->
<!--  }-->
<!--}-->

<!--.fade-slide-enter-active,-->
<!--.fade-slide-leave-active {-->
<!--  transition: all 0.4s ease;-->
<!--}-->

<!--.fade-slide-enter-from,-->
<!--.fade-slide-leave-to {-->
<!--  opacity: 0;-->
<!--  transform: translateY(-10px);-->
<!--}-->

<!--.collection-about {-->
<!--  min-height: 30px;-->
<!--}-->

<!--/* Firefox */-->
<!--input[type=number] {-->
<!--  -moz-appearance: textfield;-->
<!--}-->

<!--@media screen and (max-width: 768px) {-->
<!--  .collection-list {-->
<!--    &#45;&#45;first-column-width: 100%;-->
<!--  }-->

<!--  .collection-list:not(.root-collection-list) .page-header .wrapper {-->
<!--    gap: 0;-->
<!--  }-->

<!--  .collection-header.app-width-margin {-->
<!--    padding: 0;-->
<!--  }-->

<!--  .collection-header.app-width-margin :deep(.home-content.app-width-padding)  {-->
<!--    padding: 0;-->
<!--  }-->

<!--  .pagination {-->
<!--    flex-direction: column !important;-->
<!--    justify-content: center;-->
<!--  }-->
<!--}-->


<!--@media screen and (max-width: 640px) {-->

<!--  .page-header .wrapper > .tile {-->
<!--    padding: 25px var(&#45;&#45;mobile-margin);-->
<!--  }-->

<!--  .project-tile {-->
<!--    left: var(&#45;&#45;mobile-margin);-->
<!--  }-->

<!--  #home-article {-->
<!--    padding: 40px var(&#45;&#45;mobile-margin) !important;-->
<!--  }-->

<!--  #home-article h1 {-->
<!--    padding: 0;-->
<!--    font-size: 36px;-->
<!--  }-->
<!--}-->

<!--</style>-->
