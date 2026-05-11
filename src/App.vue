<template>
  <div
    v-if="Object.keys(collConfig).length > 0 && collConfigReady"
    class="layout-grid-container"
  >
    <app-navbar
      class="layout-navbar"
      :class="routeNameCssClass"
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
    <div class="scroll-top-wrapper app-width-margin">
      <div
        v-show="scrollTopIsVisible"
        class="scroll-top"
        :class="scrollTopIsVisible ? 'is-available' : ''"
        @click.prevent="scrollToTop"
      >
        <button type="button" class="dots-button" aria-label="Retour en haut">
          <DirectionArrows
            :size="40"
            :radius="4"
            direction="up"
          />
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
import { onBeforeUnmount, onMounted, ref, computed, watch } from 'vue'
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
import { mergeSettings } from '@/composables/mergeSettings'

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
    const isInitializing = ref(true)
    const pendingCollectionId = ref(null)
    const collConfigReady = ref(false)

    const currCollection = ref({})
    const appCssConfig = ref({})
    const whichTheme = ref(`${import.meta.env.VITE_APP_THEME}`.length === 0 ? 'red' : `${import.meta.env.VITE_APP_THEME}`)
    const theme = ref('')
    const customCss = ref({})
    const scrollTopIsVisible = ref(false)
    const scrollTopOpacity = ref(0)

    const onScroll = () => {
      const scrollTopVisibleWhenScroll = window.screen.height * 0.75;
      scrollTopIsVisible.value = window.scrollY > scrollTopVisibleWhenScroll;

      if (window.scrollY < scrollTopVisibleWhenScroll) {
        scrollTopOpacity.value = 0.0;
      }
      else if (window.scrollY > scrollTopVisibleWhenScroll && window.scrollY < scrollTopVisibleWhenScroll + 100) {
        scrollTopOpacity.value = Math.abs (window.scrollY - scrollTopVisibleWhenScroll) / 100;
      } else {
        scrollTopOpacity.value = 1.0;
      }
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

    const routeNameCssClass = computed( () => {
      return route.name.toLowerCase();
    })

    const appConfig = ref({})
    const rootCollConfig = ref({})
    const projectCollConfig = ref({})
    const collConfig = ref({})
    const rootShortTitle = ref('')
    const breadCrumb = ref([])
    const isDocProjectIdInc = `${import.meta.env.VITE_APP_DOCUMENT_ROUTE_INCLUDE_PROJECT_ID}`.toLowerCase() === 'true'
    // getting and formatting collection details

    document.documentElement.setAttribute('data-theme', whichTheme.value)
    // localStorage.setItem('theme', whichTheme.value)
    console.log('App.vue setup theme : ', whichTheme.value)

    useCustomCss(customCss)

    const setDtsRootResponse = async (route) => {
      console.log('App.vue setDtsRootResponse source', route)
      const dtsRootResponse = await getMetadataFromApi(null, null, route)
      dtsRootCollectionId.value = dtsRootResponse.identifier
      console.log('App.vue get dtsRootCollectionId', dtsRootCollectionId.value)
    }

    const getBreadcrumb = async (collId) => {
      const ancestors = await getAncestors(currCollection.value)
      console.log('ancestors', ancestors)
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
      await mergeSettings(appConfig)
      console.log('this is where it fails 2')
      let metadataResponse = {}
      let defaultConf = appConfig.value.genericConf
      const matchedCollectionConf = appConfig.value.collectionsConf && appConfig.value.collectionsConf.filter(coll => coll.collectionId === collectionId.value).length > 0 ? appConfig.value.collectionsConf.find(coll => coll.collectionId === collectionId.value) : defaultConf
      console.log('App.vue setCurrentCollectionContext setUpCollectionId matchedCollectionConf', collectionId.value, matchedCollectionConf)
      if (rootCollectionIdentifier.value === dtsRootCollectionId.value && rootCollectionIdentifier.value === collectionId.value) {
        metadataResponse = await fetchMetadata('app.vue setCurrentCollectionContext fetchMetadata (no id)', null, 'Collection', matchedCollectionConf, route)
      } else {
        metadataResponse = await fetchMetadata('app.vue setCurrentCollectionContext fetchMetadata (with id)', collectionId.value, 'Collection', matchedCollectionConf, route)
      }

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
        console.log('App.vue getCustomCss path', `${import.meta.env.VITE_APP_CUSTOM_SETTINGS_PATH}/${collConfig.value.collectionCustomCss}/assets/css/${collConfig.value.collectionCustomCss}.customCss.css`)

        if (collConfig.value.collectionCustomCss && appCssConfs[collConfig.value.collectionCustomCss]) {
          console.log('App.vue getCustomCss from collection and customCss exists : ', collConfig.value.collectionCustomCss, appCssConfs[collConfig.value.collectionCustomCss])
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
      () => store.state.collectionId,
      async (collectionIdFromStore) => {
        console.log('watch store.state.collectionId 1 :', collectionIdFromStore, isInitializing.value, !collectionIdFromStore, !dtsRootCollectionId.value || !rootCollectionIdentifier.value)

        // Safeguards
        if (!collectionIdFromStore) return
        if (!dtsRootCollectionId.value || !rootCollectionIdentifier.value) return

        if (isInitializing.value) {
          pendingCollectionId.value = collectionIdFromStore
          return
        }

        console.log('watch store.state.collectionId 2 :', collectionIdFromStore)

        collConfigReady.value = false

        try {
          collConfig.value = {}

          collectionId.value = collectionIdFromStore?.length
            ? collectionIdFromStore
            : undefined

          await setCurrentCollectionContext(route)

          // Setting root, project and collection configs

          await applyCollectionConfig(collectionIdFromStore)

        } finally {
          collConfigReady.value = true
        }
      },
      { immediate: true }
    )
    async function applyCollectionConfig(collectionIdFromStore) {
      collConfigReady.value = false

      try {
        collConfig.value = {}

        collectionId.value = collectionIdFromStore?.length
          ? collectionIdFromStore
          : undefined

        await setCurrentCollectionContext(route)

        // Setting root, project and collection configs

          let rootCollectionOverrides =
            appConfig.value.collectionsConf.find(
              coll => coll.collectionId === rootCollectionIdentifier.value
            )

          if (!rootCollectionOverrides) {
            rootCollectionOverrides =
              appConfig.value.collectionsConf.find(
                coll => coll.collectionId === 'rootCollection'
              )
          }

          rootCollConfig.value = rootCollectionOverrides
            ? _.merge({}, appConfig.value.genericConf, rootCollectionOverrides)
            : appConfig.value.genericConf

          rootShortTitle.value = rootCollConfig.value
            ? rootCollConfig.value.homePageSettings.appNavBar.collectionShortTitle
            : appConfig.value.genericConf.homePageSettings.appNavBar.collectionShortTitle

          let projectCollectionOverrides =
            appConfig.value.collectionsConf.find(
              coll => coll.collectionId === projectCollId.value
            )

          if (!projectCollectionOverrides &&
              collectionId.value !== rootCollectionIdentifier.value) {

            projectCollectionOverrides = rootCollConfig.value
            projectCollectionOverrides.collectionId = collectionId.value
            projectCollectionOverrides.homePageSettings.collectionShortTitle = ''
            projectCollectionOverrides.homePageSettings.pageHeader.collectionAltTitle = ''
            projectCollectionOverrides.homePageSettings.pageHeader.aboutButtonText = 'about'
          }

          projectCollConfig.value = _.merge({}, rootCollConfig.value, projectCollectionOverrides)

          let collectionOverrides =
            appConfig.value.collectionsConf.find(
              coll => coll.collectionId === collectionId.value
            )

          if (!collectionOverrides &&
              collectionId.value !== rootCollectionIdentifier.value &&
              collectionId.value !== projectCollId.value) {

            collectionOverrides = projectCollConfig.value
          }

          collConfig.value = _.merge({}, projectCollConfig.value, collectionOverrides)

          if (collConfig.value.collectionCustomCss) {
            await getCustomCss()
          } else if (customCss.value) {
            removeCustomCss()
          }

          if (!route.params.id) {
            document.title =
              appConfig.value.collectionsConf.find(
                coll => coll.collectionId === collectionIdFromStore
              )?.homePageSettings.appNavBar.collectionShortTitle
              || rootCollConfig.value?.homePageSettings?.appNavBar.collectionShortTitle
          }

      } finally {
        collConfigReady.value = true
      }
    }

    watch(
      () => [route.name, route.params, route.query],
      async (newVal, oldVal) => {
        const [newName, newParams, newQuery] = newVal
        const [oldName, oldParams, oldQuery] = oldVal || []
        console.log('App.vue watch ROUTER oldRoute/newRoute : ', { name: oldName, params: oldParams, query: oldQuery }, { name: newName, params: newParams, query: newQuery })

        isInitializing.value = true
        try {
          // Do nothing if newRoute and oldRoute are not defined
          if (!newName) {
            return
          }
          if (!oldVal) {
            console.log('First run / HMR: skip compare logic, reset store collectionId (force config setup)')
            store.commit('setCollectionId', null)
          }
          // Same collection
          if (
            newName === oldName &&
            newParams?.collId === oldParams?.collId &&
            newParams?.id === oldParams?.id
          ) {
            console.log('App.vue watch ROUTER same collection or same document do nothing')
            return
          }

          collConfigReady.value = false

          // fill dtsRootCollectionId with ???
          await setDtsRootResponse(route)

          // Portal mode (multi-projects)
          if (isDocProjectIdInc) {
            // Do nothing if routes are the same, collId are the same, and collId is stored. Mark collConfigReady as ready (true)
            if (
              (newName === oldName) &&
              (newParams?.collId === oldParams?.collId) &&
              (store.state.collectionId === collectionId.value)
            ) {
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
            if (newParams.id) {
              const parentResponse = await getParentFromApi(newParams.id)
              const currentCollection = parentResponse?.member.find((member) => {
                if (member['@id'] === store.state.collectionId) {
                  return member
                }
              })?.['@id'] || parentResponse.member[0]['@id']

              collectionId.value = currentCollection
              store.commit('setResourceId', newParams.id)
            //or directly if available
            } else if (newParams.collId) {
              store.commit('setCollectionId', null)
              store.commit('setCurrentItem', {})
              collectionId.value = newParams.collId
            } else {
              store.commit('setCurrentItem', {})
              collectionId.value = rootCollectionIdentifier.value
            }
            store.commit('setCollectionId', collectionId.value)
            // Collection is loaded

          // Single project mode
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
            if (newParams.id) {
              const parentResponse = await getParentFromApi(newParams.id)
              const currentCollection = parentResponse?.member.find((member) => {
                if (member['@id'] === store.state.collectionId) {
                  return member
                }
              })?.['@id'] || parentResponse.member[0]['@id']

              collectionId.value = currentCollection
              store.commit('setResourceId', newParams.id)
            } else if (newParams.collId) {
              store.commit('setCurrentItem', {})
              collectionId.value = newParams.collId
            } else {
              store.commit('setCurrentItem', {})
              collectionId.value = rootCollectionIdentifier.value
            }
            /*if (store.state.collectionId === collectionId.value) {
              console.log('same collectionId on startup: force refresh')

              // Force a logic reset
              store.commit('setCollectionId', null)
            }*/
            store.commit('setCollectionId', collectionId.value)
            // Collection is loaded
          }

          collConfigReady.value = true
        } finally {
          isInitializing.value = false
        }
        if (pendingCollectionId.value) {
          const pendingCollIdValue = pendingCollectionId.value
          pendingCollectionId.value = null

          await applyCollectionConfig(pendingCollIdValue)
        }

      },
      { immediate: true }
    )

    watch(() => scrollTopOpacity.value,(opacity) => {
        if (! scrollTopIsVisible.value) return;

        const footer = document.querySelector('.layout-footer')
        const btn = document.querySelector('.scroll-top')
        if (!footer || !btn) return

        const BASE_BOTTOM = 20;
        const observer = new IntersectionObserver(([entry]) => {
            // footer height really visible in viewport
            const visibleFooter = entry.intersectionRect?.height || 0
            btn.style.bottom = `${ BASE_BOTTOM * opacity }px`
            btn.style.opacity = opacity;
          },{
            // progressive thresholds for smooth animation
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
      isInitializing,
      whichTheme,
      theme,
      appCssConfig,
      route,
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
      routeNameCssClass,
      setCurrentCollectionContext,
      getBreadcrumb,
      breadCrumb,
      getCustomCss,
      removeCustomCss,
      scrollTopIsVisible,
      scrollTopOpacity,
      scrollToTop
    }
  }
}
</script>
