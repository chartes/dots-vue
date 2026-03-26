<template>
  <div
    v-if="Object.keys(collConfig).length > 0 && collConfigReady"
    class="layout-grid-container"
  >
    <app-navbar
      class="layout-navbar"
      :is-doc-projectId-included="isDocProjectIdInc"
      :dts-root-collection-identifier="dtsRootCollectionId"
      :root-collection-identifier="rootCollectionIdentifier"
      :application-config="appConfig"
      :root-collection-config="rootCollConfig"
      :project-collection-config="projectCollConfig"
      :collection-config="collConfig"
      :collection-breadcrumb="breadCrumb"
      :collection-identifier="collectionId"
      :key="currCollection"
    />
    <suspense>
      <router-view
        class="layout-main"
        :is-doc-projectId-included="isDocProjectIdInc"
        :dts-root-collection-identifier="dtsRootCollectionId"
        :root-collection-identifier="rootCollectionIdentifier"
        :application-config="appConfig"
        :root-collection-config="rootCollConfig"
        :collection-config="collConfig"
        :collection-identifier="collectionId"
        :current-collection="currCollection"
        :key="currCollection"
      />
    </suspense>
    <!--<back-to-top-button class="back-to-top-button" />-->
    <div class="scroll-top-wrapper app-width-margin">
      <div
        v-show="scrollTopIsVisible"
        class="scroll-top"
        :class="scrollTopIsVisible ? 'is-available' : ''"
        @click.prevent="scrollToTop"
      >
        <button type="button" aria-label="Retour en haut">
          <DirectionArrows :size="40" :radius="4" direction="up"/>
        </button>
      </div>
    </div>
    <app-footer
      class="layout-footer"
      :root-collection-identifier="rootCollectionIdentifier"
      :collection-identifier="collectionId"
      :footer-settings="collConfig.footerSettings"
      :current-collection="currCollection"
      :key="currCollection"
    /><!--  v-bind="collConfig.footerSettings" not working : props missing -->
  </div>
</template>

<script>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { router } from '@/router'
import _ from 'lodash'

import AppNavbar from '@/components/AppNavbar'
import AppFooter from '@/components/AppFooter.vue'
import DirectionArrows from '@/assets/images/DirectionArrows.vue'
import fetchMetadata from '@/composables/get-metadata'
import { getMetadataFromApi, getParentFromApi, getProjectFromApi, getAncestors } from '@/api/document'
import { getSimpleObject } from '@/composables/utils.js'
import { useCustomCss } from '@/composables/utils.js'

export default {
  name: 'App',
  components: {
    DirectionArrows,
    AppNavbar,
    AppFooter
  },

  setup () {
    const route = useRoute()
    const store = useStore()
    const watcherState = ref(false)
    const watcherRoute = ref(true)
    const collConfigReady = ref(false)

    const currCollection = ref({})
    const appCssConfig = ref({})
    const whichTheme = ref(`${import.meta.env.VITE_APP_THEME}`.length === 0 ? 'red' : `${import.meta.env.VITE_APP_THEME}`)
    const theme = ref('')
    const customCss = ref({})
    const scrollTopIsVisible = ref(false)
    const onScroll = () => {
      scrollTopIsVisible.value = window.scrollY > 100
    }

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }

    const dtsRootCollectionId = ref('')
    const rootCollectionIdentifier = ref(`${import.meta.env.VITE_APP_ROOT_DTS_COLLECTION_ID}`)
    const projectCollId = ref('')
    const collectionId = ref('')

    const appConfig = ref({})
    const rootCollConfig = ref({})
    const projectCollConfig = ref({})
    const collConfig = ref({})
    const rootShortTitle = ref('')
    const breadCrumb = ref([])
    const isDocProjectIdInc = `${import.meta.env.VITE_APP_DOCUMENT_ROUTE_INCLUDE_PROJECT_ID}`.toLowerCase() === 'true'
    console.log('App.vue setup route / route.params.collId / collectionId.value : ', route, route.params.collId ? route.params.collId : 'no param collId', collectionId.value)
    // getting and formatting collection details

    document.documentElement.setAttribute('data-theme', whichTheme.value)
    // localStorage.setItem('theme', whichTheme.value)
    console.log('App.vue setup theme : ', whichTheme.value)

    useCustomCss(customCss)

    const mergeSettings = async () => {
      if (Object.keys(appConfig.value).length > 0) {
        return
      }

      const appSettings = import.meta.glob('confs/*.conf.json', { eager: true })
      console.log('App.vue setup appSettings', appSettings)

      const defaultSettings = await import('./settings/default.conf.json')
      appSettings.default = defaultSettings

      // Check if a default custom collection exists in Custom settings
      let defaultCustomSettings = {}
      if (`${import.meta.env.VITE_APP_CUSTOM_SETTINGS_PATH}`.length > 0) {
        defaultCustomSettings = Object.entries(import.meta.glob('confs/custom.conf.json', { eager: true })).map(([key, value]) => value)[0]
        console.log('App.vue setup defaultCustomSettings', defaultCustomSettings)
        appSettings.default = defaultCustomSettings ? _.merge({}, appSettings.default, defaultCustomSettings) : appSettings.default
        console.log('App.vue setup appSettings.default updated with custom default', appSettings.default)
      }
      const defaultMatch = appSettings.default.default
      //defaultMatch.collectionId = rootCollectionIdentifier.value
      Object.assign(appConfig.value, defaultMatch)
      console.log('App.vue setup defaultMatch', defaultMatch)
      console.log('App.vue setup appConfig.value', appConfig.value)
      console.log('App.vue setup appSettings after update 1', appSettings)
      appConfig.value.collectionsConf = []
      appConfig.value.collectionsConf.push(appSettings.default.default.genericConf)
      delete appSettings.default
      console.log('App.vue setup appSettings after update 2', appSettings)
      for (let i = 0; i < Object.keys(appSettings).length; i += 1) {
        console.log('App.vue setup appSettings collection iteration', appSettings[Object.keys(appSettings)[i]], appSettings[Object.keys(appSettings)[i]]?.collectionId)
        appConfig.value.collectionsConf.push(appSettings[Object.keys(appSettings)[i]])
      }
      console.log('App.vue setup appConfig.value after update 3', appConfig.value)
    }
    /*if (import.meta.hot) {
      import.meta.hot.accept(async () => {
        console.log('HMR confs reload')

        appConfig.value = {}

        await mergeSettings()

        // force refresh complet
        store.commit('setCollectionId', store.state.collectionId ? store.state.collectionId : rootCollectionIdentifier)
      })
    }*/

    const setDtsRootResponse = async (source) => {
      console.log('App.vue setDtsRootResponse source', source)
      const dtsRootResponse = await getMetadataFromApi(null, null, source)
      dtsRootCollectionId.value = dtsRootResponse.identifier
      console.log('App.vue get dtsRootCollectionId', dtsRootCollectionId.value)
    }

    const getBreadcrumb = async (collId) => {
      const ancestors = await getAncestors(currCollection.value)
      breadCrumb.value = ancestors.map((collections) => {
        const collection = collections[0]
        const collConfig = appConfig.value.collectionsConf.find((config) => { return config.collectionId === collection.identifier })
        const label = collConfig?.homePageSettings?.appNavBar?.collectionShortTitle || collection.identifier
        return { [collection.identifier]: label }
      })
    }

    const setCurrentCollectionContext = async (route) => {
      //console.log('App.vue setCurrentCollectionContext origin route', origin, route)
      console.log('this is where it fails')
      await mergeSettings()
console.log('this is where it fails 2')
      let metadataResponse = {}
      const matchedCollectionConf = appConfig.value.collectionsConf && appConfig.value.collectionsConf.filter(coll => coll.collectionId === collectionId.value).length > 0 ? appConfig.value.collectionsConf.find(coll => coll.collectionId === collectionId.value) : {}
      console.log('App.vue setCurrentCollectionContext setUpCollectionId matchedCollectionConf', collectionId.value, matchedCollectionConf)
      if (rootCollectionIdentifier.value === dtsRootCollectionId.value && rootCollectionIdentifier.value === collectionId.value) {
        metadataResponse = await fetchMetadata('app.vue setCurrentCollectionContext fetchMetadata (no id)', null, 'Collection', matchedCollectionConf, route)
      } else {
        metadataResponse = await fetchMetadata('app.vue setCurrentCollectionContext fetchMetadata (with id)', collectionId.value, 'Collection', matchedCollectionConf, route)
      }
      //collectionId.value = metadataResponse.identifier
      console.log('App.vue setCurrentCollectionContext collectionId.value ', collectionId.value)
      console.log('App.vue setCurrentCollectionContext metadataResponse', metadataResponse)


      if (matchedCollectionConf && matchedCollectionConf.excludeCollectionIds && matchedCollectionConf.excludeCollectionIds.length > 0) {
        metadataResponse.member = metadataResponse.member.filter(m => !matchedCollectionConf.excludeCollectionIds.includes(m.identifier))
      }

      if (matchedCollectionConf && matchedCollectionConf?.homePageSettings?.listSection?.displayMode) {
        metadataResponse.displayMode = matchedCollectionConf?.homePageSettings?.listSection?.displayMode
      }

      console.log('App.vue metadataResponse 1', metadataResponse)

      metadataResponse.member.forEach(m => { m.parent = collectionId.value })
      metadataResponse.children.forEach(m => { m.parent = collectionId.value })
      if (metadataResponse.projectIdentifier) {
        console.log('App.vue metadataResponse 1b', metadataResponse.projectIdentifier)
        metadataResponse.member.forEach(m => { m.projectIdentifier = metadataResponse.projectIdentifier })
        metadataResponse.children.forEach(m => { m.projectIdentifier = metadataResponse.projectIdentifier })
      }
      console.log('App.vue metadataResponse 2', metadataResponse)

      metadataResponse.member.forEach(m => {
        let childMatchedCollectionConf = appConfig.value.collectionsConf.find(c => c.collectionId === m.identifier)
        if (childMatchedCollectionConf && childMatchedCollectionConf?.homePageSettings?.listSection?.displayMode) {
          m.displayMode = childMatchedCollectionConf?.homePageSettings?.listSection?.displayMode
        }
      })
      metadataResponse.children.forEach(m => {
        let childMatchedCollectionConf = appConfig.value.collectionsConf.find(c => c.collectionId === m.identifier)
        if (childMatchedCollectionConf && childMatchedCollectionConf?.homePageSettings?.listSection?.displayMode) {
          m.displayMode = childMatchedCollectionConf?.homePageSettings?.listSection?.displayMode
        }
      })
      console.log('App.vue metadataResponse 3', metadataResponse)

      currCollection.value = metadataResponse

      // Get and set the collection project (only if current collection is not top collection)
      if (collectionId.value !== rootCollectionIdentifier.value) {
        console.log('App.vue setCurrentCollectionContext get project', collectionId.value, rootCollectionIdentifier.value)
        projectCollId.value = await getProjectFromApi(collectionId.value)
        await getBreadcrumb(collectionId.value)
      } else {
        projectCollId.value = ''
        breadCrumb.value = []
      }
      console.log('App.vue setCurrentCollectionContext projectCollId.value : ', projectCollId.value)
    }

    const getCustomCss = async () => {
      if (collConfig.value.collectionCustomCss) {
        const appCssConfs = Object.fromEntries(Object.entries(import.meta.glob('confs/**/*.customCss.css', { eager: false, query: '?raw' })).map(([key, value]) => {
          const newKey = key.split('/').at(-1).replace('.customCss.css', '')
          return [newKey, value]
        }))
        console.log('App.vue getCustomCss appCssConfs ', appCssConfs)
        console.log('App.vue getCustomCss collConfig.value.collectionCustomCss', collConfig.value.collectionCustomCss)
        console.log('App.vue getCustomCss get in if')
        console.log('App.vue getCustomCss path', `${import.meta.env.VITE_APP_CUSTOM_SETTINGS_PATH}/${collConfig.value.collectionId}/assets/css/${collConfig.value.collectionId}.customCss.css`)

        if (collConfig.value.collectionCustomCss && appCssConfs[collConfig.value.collectionCustomCss]) {
          console.log('App.vue getCustomCss from collection and customCss exists : ', collConfig.value.collectionCustomCss, appCssConfs[collConfig.value.collectionId])
          customCss.value = (await appCssConfs[collConfig.value.collectionCustomCss]()).default

          // check if a customCss style tag exists, if not create it
          let el = document.getElementById('customCss')
          if (!el) {
            el = document.createElement('style')
            el.id = 'customCss'
          }
          // Update the CSS content of the customCss style tag
          el.textContent = customCss.value
          // IMPORTANT : appendChild will move the customCss style tag to the end of <head> so it takes precedence
          document.head.appendChild(el)
        }
      } else removeCustomCss()
    }
    const removeCustomCss = () => {
      console.log('App.vue removeCustomCss store.state.collectionId', store.state.collectionId)
      const styleTags = [...document.querySelectorAll('style')]
      console.log('App.vue removeCustomCss styleTags ', styleTags)
      styleTags.forEach((tag) => {
        // console.log('App.vue watch store.state.collectionId getCustomCss tag.textContent ', tag.textContent)
        if (tag.id === 'customCss') {
          console.log('App.vue removeCustomCss tag.textContent ', tag.textContent)
          console.log('App.vue removeCustomCss tag.id ', tag.id)
          customCss.value = undefined
          tag.remove()
        }
      })
    }

    watch(
      () => store.state.collectionId, async function () {
        console.log('App.vue watch STATE store.state.collectionId : ', store.state.collectionId)
        collConfigReady.value = false
        if (!dtsRootCollectionId.value.length || !rootCollectionIdentifier.value.length) {
          await setDtsRootResponse()
          if (`${import.meta.env.VITE_APP_ROOT_DTS_COLLECTION_ID}`.length === 0) {
            rootCollectionIdentifier.value = dtsRootCollectionId.value
          } else {
            rootCollectionIdentifier.value = `${import.meta.env.VITE_APP_ROOT_DTS_COLLECTION_ID}`
          }
        }

        console.log('App.vue watch STATE dtsRootCollectionId.value, rootCollectionIdentifier.value', dtsRootCollectionId.value, rootCollectionIdentifier.value)
        if (dtsRootCollectionId.value && rootCollectionIdentifier.value) {
          watcherState.value = true
          collConfig.value = {}
          collectionId.value = store.state.collectionId?.length ? store.state.collectionId : rootCollectionIdentifier.value
          console.log('App.vue watch STATE collectionId.value', collectionId.value)
          await setCurrentCollectionContext(route)
          // Collection is loaded

          // first, try to find if the root Collection has a configuration based on id
          let rootCollectionOverrides = appConfig.value.collectionsConf.find(coll => coll.collectionId === rootCollectionIdentifier.value)
          // second, try to find if a rootCollection (without id) has been defined
          if (!rootCollectionOverrides) {
            rootCollectionOverrides = appConfig.value.collectionsConf.find(coll => coll.collectionId === 'rootCollection')
          }
          console.log('App.vue watch STATE config rootCollectionOverrides appConfig.value.genericConf ', rootCollectionOverrides, appConfig.value.genericConf)
          console.log('App.vue watch STATE config merge rootCollectionOverrides appConfig.value.genericConf ', _.merge({}, appConfig.value.genericConf, rootCollectionOverrides))


          rootCollConfig.value = rootCollectionOverrides ? _.merge({}, appConfig.value.genericConf, rootCollectionOverrides) : appConfig.value.genericConf
          rootShortTitle.value = rootCollConfig.value ? rootCollConfig.value.homePageSettings.appNavBar.collectionShortTitle : appConfig.value.genericConf.homePageSettings.appNavBar.collectionShortTitle
          console.log('App.vue watch STATE rootCollConfig.value ', rootCollConfig.value)
          // Set the project config
          let projectCollectionOverrides = appConfig.value.collectionsConf.find(coll => coll.collectionId === projectCollId.value)
          if (!projectCollectionOverrides && collectionId.value !== rootCollectionIdentifier.value) {
            projectCollectionOverrides = rootCollConfig.value
            projectCollectionOverrides.collectionId = collectionId.value
            projectCollectionOverrides.homePageSettings.collectionShortTitle = ''
            projectCollectionOverrides.homePageSettings.pageHeader.collectionAltTitle = ''
            projectCollectionOverrides.homePageSettings.pageHeader.aboutButtonText = 'about'
          }
          projectCollConfig.value = _.merge({}, rootCollConfig.value, projectCollectionOverrides)
          console.log('App.vue watch STATE projectCollConfig.value ', projectCollConfig.value)
          let collectionOverrides = appConfig.value.collectionsConf.find(coll => coll.collectionId === collectionId.value)
          if (!collectionOverrides && collectionId.value !== rootCollectionIdentifier.value && collectionId.value !== projectCollId.value) {
            collectionOverrides = projectCollConfig.value
            collectionOverrides.collectionId = collectionId.value
            collectionOverrides.homePageSettings.collectionShortTitle = ''
            collectionOverrides.homePageSettings.pageHeader.collectionAltTitle = ''
            collectionOverrides.homePageSettings.pageHeader.aboutButtonText = 'about'
          }
          collConfig.value = _.merge({}, projectCollConfig.value, collectionOverrides)
          console.log('App.vue watch STATE collConfig.value collectionId.value', collConfig.value, collectionId.value)
          if (collConfig.value.collectionCustomCss) {
            await getCustomCss()
          } else if (customCss.value) {
            removeCustomCss()
          }
          // updating html document title for collections (when on document, managed in DocumentPage)
          if (!route.params.id) {
            if (store.state.collectionId) {
              document.title = appConfig.value && appConfig.value.collectionsConf && appConfig.value.collectionsConf.find(coll => coll.collectionId === store.state.collectionId) ? appConfig.value.collectionsConf.find(coll => coll.collectionId === store.state.collectionId).homePageSettings.appNavBar.collectionShortTitle : currCollection.value.title
            } else {
              document.title = rootCollConfig.value && rootCollConfig.value.homePageSettings ? rootCollConfig.value.homePageSettings.appNavBar.collectionShortTitle : document.title
            }
          }

          watcherState.value = false
          collConfigReady.value = true
        }
      }, { immediate: true }
    )
    watch(
      router.currentRoute, async (newRoute, oldRoute) => {
        console.log('App.vue watch ROUTER oldRoute/newRoute : ', oldRoute, newRoute)
        // Do nothing if newRoute and oldRoute are not defined
        if (!newRoute) {
          return
        }

        // Same collection
        if (newRoute?.name === oldRoute?.name && newRoute?.params?.collId === oldRoute?.params?.collId && newRoute?.refId === oldRoute?.refId) {
          return
        }

        collConfigReady.value = false

        // check if the other watch (the one on collectionId) is not running
        if (watcherState.value === true) {
          return
        }

        // indicate to the other state this one is running
        watcherRoute.value = true

        // fill dtsRootCollectionId with ???
        await setDtsRootResponse(newRoute)

        // true/false, depends on VITE_APP_XXX variables
        if (isDocProjectIdInc) {
          // Do nothing if routes are the same, collId are the same, and collId is stored. Mark collConfigReady as ready (true)
          if ((newRoute.name === oldRoute?.name) && (newRoute.params?.collId === oldRoute?.params?.collId) && (store.state.collectionId === collectionId.value)) {
            collConfigReady.value = true
            return
          }

          // store root collection identifier (from serveur or VITE_APP config)
          if (`${import.meta.env.VITE_APP_ROOT_DTS_COLLECTION_ID}`.length === 0) {
            rootCollectionIdentifier.value = dtsRootCollectionId.value
          } else {
            rootCollectionIdentifier.value = `${import.meta.env.VITE_APP_ROOT_DTS_COLLECTION_ID}`
          }
          // Set the current collection
          // from the resource id
          if (newRoute.params.id) {
            const parentResponse = await getParentFromApi(newRoute.params.id)
            const currentCollection = parentResponse?.member.find((member) => {
              if (member['@id'] === store.state.collectionId) {
                return member
              }
            })?.['@id'] || parentResponse.member[0]['@id']

            collectionId.value = currentCollection
            store.commit('setResourceId', newRoute.params.id)
          //or directly if available
          } else if (newRoute.params.collId) {
            store.commit('setCurrentItem', {})
            collectionId.value = newRoute.params.collId
          } else {
            store.commit('setCurrentItem', {})
            collectionId.value = rootCollectionIdentifier.value
          }
          store.commit('setCollectionId', collectionId.value)
          // Collection is loaded

        } else {
          // Set the app rootCollection
          if (`${import.meta.env.VITE_APP_ROOT_DTS_COLLECTION_ID}`.length === 0) {
            // If there is no user-defined app rootCollection, the rootCollection of the app is the DTS root collection
            rootCollectionIdentifier.value = dtsRootCollectionId.value
          } else {
            // Otherwise use the user defined app rootCollection
            rootCollectionIdentifier.value = `${import.meta.env.VITE_APP_ROOT_DTS_COLLECTION_ID}`
          }
          // Set the current collection
          if (newRoute.params.id) {
            const parentResponse = await getParentFromApi(newRoute.params.id)
            const currentCollection = parentResponse?.member.find((member) => {
              if (member['@id'] === store.state.collectionId) {
                return member
              }
            })?.['@id'] || parentResponse.member[0]['@id']

            collectionId.value = currentCollection
            store.commit('setResourceId', newRoute.params.id)
          } else if (newRoute.params.collId) {
            store.commit('setCurrentItem', {})
            collectionId.value = newRoute.params.collId
          } else {
            store.commit('setCurrentItem', {})
            collectionId.value = rootCollectionIdentifier.value
          }
          store.commit('setCollectionId', collectionId.value)
          // Collection is loaded
        }

        watcherRoute.value = false
        collConfigReady.value = true
      }, { deep: true, immediate: true }
    )
    watch(() => scrollTopIsVisible.value,(visible) => {
        if (!visible) return
        const footer = document.querySelector('.layout-footer')
        const btn = document.querySelector('.scroll-top')

        if (!footer || !btn) return

        const BASE_BOTTOM = 120;
        const observer = new IntersectionObserver(([entry]) => {
            // footer height really visible in viewport
            const visibleFooter = entry.intersectionRect?.height || 0
            btn.style.bottom = `${BASE_BOTTOM + visibleFooter}px`
          },{
            // progressive thresholds → smooth animation
            threshold: Array.from({ length: 30 }, (_, i) => i / 30)
          }
        )
        observer.observe(footer)
      },{ immediate: true }
    )

    onMounted(() => {
      window.addEventListener('scroll', onScroll)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('scroll', onScroll)
    })

    return {
      whichTheme,
      theme,
      appCssConfig,
      route,
      watcherRoute,
      watcherState,
      collConfigReady,
      dtsRootCollectionId,
      rootCollectionIdentifier,
      projectCollId,
      isDocProjectIdInc,
      rootShortTitle,
      collectionId,
      currCollection,
      appConfig,
      rootCollConfig,
      projectCollConfig,
      collConfig,
      setCurrentCollectionContext,
      getBreadcrumb,
      breadCrumb,
      mergeSettings,
      getCustomCss,
      removeCustomCss,
      scrollTopIsVisible,
      scrollToTop
    }
  }
}
</script>

<style>
html,
body,
#app {
  height: 100%;
}
body {
  background-color: #ffffff;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
#nav {
  padding: 30px;
}

.layout-navbar {
  grid-area: header;
}
.layout-main {
  grid-area: main;
}
.layout-footer {
  grid-area: footer;
}
.layout-grid-container {
  display: grid;
  height: 100%;
  /* height: calc(100% - 50px); */
  grid-template-columns: 100%;
  grid-template-rows: 70px 1fr auto;
  grid-template-areas:
    "header"
    "main"
    "footer";
}
.back-to-top-button {
  z-index: 2;
}

/* page header */

.tile.page-header {
  min-height: 164px;
  background-color: #FBF8F4;
  margin: 0;
  align-items: center;
}
.tile.page-header p.title {
  font-family: "Noto Serif", serif;
  font-size: 30px;
  font-style: normal;
  line-height: 47px;
  font-weight: 400;
  color: #B9192F;
  margin-bottom: 0;
  text-align: left;
  text-indent: 0;
}

.tile.page-header .title-tile {
  justify-content: space-between;
  align-items: center;
  gap:50px;
}

p.header-baseline {
  width: 345px;
  font-family: "Noto Serif", serif;
  font-size: 14px;
  color: #5C5241;
  font-style: italic;
  text-align: left;
  text-indent: 0;
}
p.header-baseline span {
  font-weight: 700;
  font-style: normal;
}
.scroll-top-wrapper {
  position: relative;

  display: flex;
  justify-content: flex-end;

  width: 100%;
}

.scroll-top {
  position: fixed;
  right: calc((100vw - 1100px) / 2);
  bottom: 120px;

  width: 40px;
  height: 40px;
  pointer-events: none;
  z-index: 9;
  > button {
    /* remove default button behavior */
    appearance: none;
    -webkit-appearance: none;

    background: transparent;
    border: none;

    padding: 0;
    margin: 0;

    cursor: pointer;
  }
}

.scroll-top button {
  position: absolute;
  right: 0;
  opacity: 0;
  pointer-events: none;
  transition: all ease-out 0.25s;
}

.scroll-top.is-available button {
  opacity: 1;
  pointer-events: auto;
}

@media screen and (max-width: 1150px) {
  .tile.page-header {
    min-height: auto;
  }
  .tile.page-header:first-child {
    padding-top:35px;
    padding-bottom:35px;
  }
}

@media screen and (max-width: 900px) {
  .tile.page-header .title-tile {
    flex-direction: column !important;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 20px;
  }
}
@media screen and (max-width: 800px) {
  .tile.page-header p.title {
    font-size: 30px;
    line-height: 36px;
  }
}

@media screen and (max-width: 640px) {
  .tile.page-header p.title {
    width: 90%;
    margin: auto;
    padding-bottom: 5px;
    font-size: 25px;
    line-height: 32px;
    text-align: center;
  }

  p.header-baseline {
    margin: auto;
    width: 60%;
    text-align: center;
  }
  .toggle-btn {
    width: 20px;
    right: 15px;
  }
}

/* responsive layout */
.app-width-margin {
  margin: 0 auto;
  max-width: 1100px;
}
.app-width-padding {
  margin: 0;
  padding-left: calc( 50% - 600px );
  padding-right: calc( 50% - 600px );
}

@media screen and (max-width: 1150px) {
  .app-width-padding {
    padding-left: 20px;
    padding-right: 20px;
  }
  .app-width-margin {
    margin: 0;
    max-width: 100%;
    padding: 0 20px;
  }
}

@media screen and (max-width: 800px) {
  .app-width-padding {
    padding-left: 2.5%;
    padding-right: 2.5%;
  }
  .app-width-margin {
    margin: 0;
    max-width: 100%;
    padding: 0 2.5%;
  }
  .aside-noteref-parent {
    left: 10px !important;
    right: 10px !important;
  }
}

@media screen and (max-width: 500px) {
  .layout-navbar {
    /*position: fixed;
    left:0;
    top:0;*/
    width: 100vw;
    z-index: 10;
  }
}
/* Notes */

a.noteref {
  scroll-margin-top: 100px;
}

a.noteref sup {
  position: static;
  transform: translateY(-3px);
  display: inline-block;
  height: auto;
  padding: 2px 4px 1px;
  background: #CCF;

  font-weight: bold;
  font-size: 0.8em;
  color: black;
  line-height: 1;
  text-indent: 0;
  text-align: center;
}

.notes-opened .aside-noteref-parent{
  visibility: visible;
}

.aside-noteref-parent {
  visibility: hidden;
  position: fixed;
  left: calc((100vw - 1100px) / 2);
  right: calc((100vw - 1100px) / 2);
  bottom: 0;
  z-index: 8;

  max-width: 1100px;
  padding-bottom: 10px;
  /*padding-right: 20px;*/
  background-color: rgba(255, 255, 255, 0.95);
  border-top: #CCCCCC 1px solid;

  max-height: 30vh;
  overflow-y: auto;

  font-size: inherit;
  line-height: inherit;
}

.aside-noteref-parent:empty {
  border: none;
  padding-bottom: 0;
}

.aside-noteref {
  /*position: relative;*/
  display: block;
  width: 100%;
  padding: 20px 50px 0;
  margin-bottom: 20px;
}

.aside-noteref:not(:first-child) {
  border-top: #CCCCCC 1px solid;
}

.aside-noteref-wrapper {
  position: relative;
  min-width: 100%;
}

.aside-noteref-content p,
.footnotes p {
  text-indent: 0;
}

.aside-noteref:first-child {
  box-shadow: 0px -4px 4px 0px rgba(0,0,0,0.10);
}

.aside-noteref .aside-noteref-content {
  font-size: 0.92em;
}

.aside-noteref.clamped .aside-noteref-content {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* number of lines to show */
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.aside-noteref-content p {
  margin-bottom: 5px;
}

.aside-noteref-content a.notebottom,
.aside-noteref-content > a:first-child {
  display: inline-block;
  margin-right: 5px;
  height: auto;
  padding: 2px 4px 1px;
  background: #CCF;

  font-weight: bold;
  font-size: 0.8em;

  float: left;
}

.aside-noteref-content a.notebottom:hover,
.aside-noteref-content > a:first-child:hover {
  text-decoration: underline;
}

.aside-noteref a.see-all-link {
  position: absolute;
  top: 50%;
  right: -50px;
  display: inline-block;
  width: 20px;
  height: 20px;
  transform-origin: 50% 50%;
  transform: rotate(-90deg) translateY(-50%);
}

.aside-noteref.clamped a.see-all-link {
  right: -15px;
  transform: rotate(90deg) translateY(-50%);
}
.wrapper {
  width: 100%;
}

.collection-toc-area {
  width: 100%;
  font-family: "Barlow", sans-serif;
  margin-bottom: 30px;
  border-radius: 6px;
}
.ariane-collection-top .collection-toc-area {
  padding-left: 15px;
}
.document-card .collection-toc-area {
  margin-bottom: 0;
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
.expanded .collection-toc-area-header {
  border-radius: 6px 6px 0 0;
}
.document-card .collection-toc-area-header {
  padding-top: 3px;
  padding-bottom: 3px;
  padding-left: 10px;
  padding-right: 10px;
  border-radius: 0 0 6px 6px;
}
.document-card .expanded .collection-toc-area-header {
  border-radius: 0;
}
.collection-toc-area-header > a {
  font-family: "Barlow Semi Condensed", sans-serif;
  font-weight: 500;
  color: #4a4a4a !important;
  text-decoration: none;
  border: none;
}
.ariane-collection-top .collection-toc-area {
  margin-bottom: 0;
}
.ariane-collection-top .collection-toc-area-header .collBrowseButton {
  margin-left: auto;
  margin-right: 47px;
}
.collection-toc-area.is-opened .menu, .expanded.menu {
  display: flex;
  flex-direction: column;
  padding: 0 20px 0;
  /* border-top: solid 2px #fcfcfc; */
  background-color: #e4e4e4;
  border-radius: 0 0 6px 6px;
}

/* toogle */
.toggle-btn {
  position: absolute;
  right: 20px;
  width: 20px;
  height: 27px;
  background: url(./assets/images/chevron_rouge.svg) center top -8px / cover no-repeat;
  border: none;
  text-decoration: none;
}
.toc-area.is-opened .toggle-btn, .collection-toc-area.is-opened .toggle-btn, .collection-toc-area.expanded .toggle-btn, .toggle-btn.expanded {
  background: url(./assets/images/croix.svg) center / cover no-repeat;
}
.breadcrumb-panel.is-opened .breadcrumb-top-toggle-bttn {
  color: var(--fill-color);

  position: absolute;
  right: 20px;
  width: 40px;
}

</style>
