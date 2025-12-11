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
    <back-to-top-button class="back-to-top-button" />
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
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import router from '@/router'
import _ from 'lodash'

import AppNavbar from '@/components/AppNavbar'
import AppFooter from '@/components/AppFooter.vue'
import BackToTopButton from '@/components/BackToTopButton.vue'
import fetchMetadata from '@/composables/get-metadata'
import { getMetadataFromApi, getParentFromApi, getProjectFromApi, getAncestors } from '@/api/document'
import { getSimpleObject } from '@/composables/utils.js'
import { useCustomCss } from '@/composables/utils.js'

export default {
  name: 'App',
  components: {
    BackToTopButton,
    AppNavbar,
    AppFooter
  },

  setup () {
    const route = useRoute()
    const store = useStore()
    const watcherState = ref(false)
    const watcherRoute = ref(false)
    const collConfigReady = ref(false)

    const currCollection = ref({})
    const appCssConfig = ref({})
    const whichTheme = ref(`${import.meta.env.VITE_APP_THEME}`.length === 0 ? 'red' : `${import.meta.env.VITE_APP_THEME}`)
    const theme = ref('')
    const customCss = ref({})

    const dtsRootCollectionId = ref('')
    const rootCollectionIdentifier = ref('')
    const projectCollId = ref('')
    const collectionId = ref('')

    const appConfig = ref({})
    const rootCollConfig = ref({})
    const projectCollConfig = ref({})
    const collConfig = ref({})
    const rootShortTitle = ref('')
    const breadCrumb = ref([])
    const isDocProjectIdInc = `${import.meta.env.VITE_APP_ROOT_DTS_COLLECTION_ID}`.length === 0 ? true : `${import.meta.env.VITE_APP_DOCUMENT_ROUTE_INCLUDE_PROJECT_ID}`.toLowerCase() === 'true'
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
      defaultMatch.collectionId = rootCollectionIdentifier.value
      Object.assign(appConfig.value, defaultMatch)
      console.log('App.vue setup defaultMatch', defaultMatch)
      console.log('App.vue setup appConfig.value', appConfig.value)
      console.log('App.vue setup appSettings after update 1', appSettings)
      appConfig.value.collectionsConf = []
      appConfig.value.collectionsConf.push(appSettings.default.default.genericConf)
      delete appSettings.default
      console.log('App.vue setup appSettings after update 2', appSettings)
      for (let i = 0; i < Object.keys(appSettings).length; i += 1) {
        console.log('App.vue setup appSettings collection iteration', appSettings[Object.keys(appSettings)[i]])
        appConfig.value.collectionsConf.push(appSettings[Object.keys(appSettings)[i]])
      }
      console.log('App.vue setup appConfig.value after update 3', appConfig.value)
    }

    const setDtsRootResponse = async (source) => {
      console.log('App.vue setDtsRootResponse source', source)
      const dtsRootResponse = await getMetadataFromApi()
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
      console.log('App.vue setCurrentCollectionContext origin route', origin, route)
      console.log('this is where it fails')
      await mergeSettings()
      let metadataResponse = {}
      if (rootCollectionIdentifier.value === dtsRootCollectionId.value && rootCollectionIdentifier.value === collectionId.value) {
        metadataResponse = await fetchMetadata('app.vue setCurrentCollectionContext fetchMetadata (no id)', null, 'Collection', route)
      } else {
        metadataResponse = await fetchMetadata('app.vue setCurrentCollectionContext fetchMetadata (with id)', collectionId.value, 'Collection', route)
      }
      console.log('App.vue setCurrentCollectionContext collectionId.value ', collectionId.value)
      console.log('App.vue setCurrentCollectionContext metadataResponse', metadataResponse)
      console.log('App.vue setCurrentCollectionContext excludeCollectionIds', collectionId.value, appConfig.value.collectionsConf.filter(coll => coll.collectionId === collectionId.value))
      const matchedCollectionConf = appConfig.value.collectionsConf && appConfig.value.collectionsConf.filter(coll => coll.collectionId === collectionId.value).length > 0 ? appConfig.value.collectionsConf.find(coll => coll.collectionId === collectionId.value) : {}
      if (matchedCollectionConf && matchedCollectionConf.excludeCollectionIds && matchedCollectionConf.excludeCollectionIds.length > 0) {
        metadataResponse.member = metadataResponse.member.filter(m => !matchedCollectionConf.excludeCollectionIds.includes(m.identifier))
      }

      console.log('App.vue metadataResponse 1', metadataResponse)
      metadataResponse.member.forEach(m => { m.parent = collectionId.value })
      console.log('App.vue metadataResponse 2', metadataResponse)
      currCollection.value = metadataResponse

      // Get and set the collection project (only if current collection is not top collection)
      if (collectionId.value !== rootCollectionIdentifier.value) {
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
        if (dtsRootCollectionId.value && rootCollectionIdentifier.value) {
          watcherState.value = true
          collConfig.value = {}
          collectionId.value = store.state.collectionId
          await setCurrentCollectionContext(route)
          // Collection is loaded

          // first, try to find if the root Collection has a configuration based on id
          let rootCollectionOverrides = appConfig.value.collectionsConf.find(coll => coll.collectionId === rootCollectionIdentifier.value)
          // second, try to find if a rootCollection (without id) has been defined
          if (!rootCollectionOverrides) {
            rootCollectionOverrides = appConfig.value.collectionsConf.find(coll => coll.collectionId === 'rootCollection')
          }
          // const rootCollectionOverrides = rootCollectionIdentifier.value !== dtsRootCollectionId.value ? appConfig.value.collectionsConf.find(coll => coll.collectionId === rootCollectionIdentifier.value) : undefined
          rootCollConfig.value = rootCollectionOverrides ? _.merge({}, appConfig.value.genericConf, rootCollectionOverrides) : appConfig.value.genericConf
          rootShortTitle.value = rootCollConfig.value ? rootCollConfig.value.homePageSettings.appNavBar.collectionShortTitle : appConfig.value.genericConf.homePageSettings.appNavBar.collectionShortTitle

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

          let collectionOverrides = appConfig.value.collectionsConf.find(coll => coll.collectionId === collectionId.value)
          if (!collectionOverrides && collectionId.value !== rootCollectionIdentifier.value && collectionId.value !== projectCollId.value) {
            collectionOverrides = projectCollConfig.value
            collectionOverrides.collectionId = collectionId.value
            collectionOverrides.homePageSettings.collectionShortTitle = ''
            collectionOverrides.homePageSettings.pageHeader.collectionAltTitle = ''
            collectionOverrides.homePageSettings.pageHeader.aboutButtonText = 'about'
          }
          collConfig.value = _.merge({}, projectCollConfig.value, collectionOverrides)
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
        if (!(newRoute && oldRoute)) {
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
        await setDtsRootResponse('watch router.currentRoute')

        // true/false, depends on VITE_APP_XXX variables
        if (isDocProjectIdInc) {
          // Do nothing if routes are the same, collId are the same, and collId is stored. Mark collConfigReady as ready (true)
          if ((newRoute.name === oldRoute.name) && (newRoute.params.collId === oldRoute.params.collId) && (store.state.collectionId === collectionId.value)) {
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
            const currResource = await fetchMetadata('app.vue', newRoute.params.id, 'Resource', newRoute)
          } else {
            store.commit('setCurrentItem', {})
          }
          collectionId.value = rootCollectionIdentifier.value
          // TODO: check if this line is necessary
          // store.commit('setCollectionId', collectionId.value)
          await setCurrentCollectionContext(newRoute)
          // Collection is loaded
        }

        watcherRoute.value = false
        collConfigReady.value = true
      }, { deep: true, immediate: true }
    )

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
      removeCustomCss
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
}

@media screen and (max-width: 500px) {
  .layout-navbar {
    position: fixed;
    left:0;
    top:0;
    width: 100vw;
    z-index: 10;
  }
}
</style>
