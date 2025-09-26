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
    <back-to-top-button class="back-to-top-button"/>
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
import { ref, shallowRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import router from '@/router'
import _ from 'lodash'

import AppNavbar from '@/components/AppNavbar'
import AppFooter from '@/components/AppFooter.vue'
import BackToTopButton from '@/components/BackToTopButton.vue'
import fetchMetadata from '@/composables/get-metadata'
import { getMetadataFromApi, getParentFromApi, getProjectFromApi } from '@/api/document'

function getSimpleObject (obj) {
  // console.log("getSimpleObject / obj", obj)
  let simpleObject = {}
  simpleObject = {
    identifier: obj.identifier ? obj.identifier : obj['@id'],
    citeType: obj['@type'] ? obj['@type'] : obj.citeType,
    title: obj.title,
    description: obj.description,
    level: obj.level,
    editorialLevelIndicator: obj.editorialLevelIndicator,
    totalChildren: obj.totalChildren,
    member: !obj.member ? obj.children : obj.member,
    parent: obj.parent,
    dublincore: obj.dublincore,
    extensions: obj.extensions
  }
  // console.log('getSimpleObject / simpleObject', simpleObject)
  return simpleObject
}

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
    const customCss = shallowRef({})
    const cssPath = ref('')

    const dtsRootCollectionId = ref('')
    const rootCollectionIdentifier = ref('')
    const projectCollId = ref('')
    const collectionId = ref('')

    const appConfig = ref({})
    const rootCollConfig = ref({})
    const projectCollConfig = ref({})
    const collConfig = ref({})
    const rootShortTitle = ref('')
    // Replaced by breadcrumb :
    // const collShortTitle = ref('')
    // const projectShortTitle = ref('')
    const breadCrumb = ref([])
    const isDocProjectIdInc = `${import.meta.env.VITE_APP_ROOT_DTS_COLLECTION_ID}`.length === 0 ? true : `${import.meta.env.VITE_APP_DOCUMENT_ROUTE_INCLUDE_PROJECT_ID}`.toLowerCase() === 'true'
    console.log('App.vue setup route / route.params.collId / collectionId.value : ', route, route.params.collId ? route.params.collId : 'no param collId', collectionId.value)
    // getting and formatting collection details

    document.documentElement.setAttribute('data-theme', whichTheme.value)
    // localStorage.setItem('theme', whichTheme.value)
    console.log('App.vue setup theme : ', whichTheme.value)

    const mergeSettings = () => {
      const appSettings = import.meta.glob('confs/*.conf.json', { eager: true })
      console.log('App.vue setup appSettings', appSettings)
      const appCssSettings = import.meta.glob('confs/*.conf.css', { eager: true })
      console.log('App.vue setup appCssSettings', appCssSettings)

      const defaultSettings = import.meta.glob('./settings/default.conf.json', { eager: true })
      appSettings['./settings/default.conf.json'] = defaultSettings['./settings/default.conf.json']

      // Check if a default custom collection exists in Custom settings
      let defaultCustomSettings = {}
      if (`${import.meta.env.VITE_APP_CUSTOM_SETTINGS_PATH}`.length > 0) {
        defaultCustomSettings = import.meta.glob('confs/custom.conf.json', { eager: true })
        console.log('App.vue setup defaultCustomSettings', defaultCustomSettings)
        appSettings['./settings/default.conf.json'] = defaultCustomSettings ? _.merge({}, appSettings['./settings/default.conf.json'], defaultCustomSettings[`${import.meta.env.VITE_APP_CUSTOM_SETTINGS_PATH}/custom.conf.json`]) : appSettings['./settings/default.conf.json']
        console.log('App.vue setup appSettings[\'./settings/default.conf.json\'] updated with custom default', appSettings['./settings/default.conf.json'])
      }
      const defaultMatch = appSettings['./settings/default.conf.json'].default
      defaultMatch.collectionId = rootCollectionIdentifier.value
      Object.assign(appConfig.value, defaultMatch)
      console.log('App.vue setup defaultMatch', defaultMatch)
      console.log('App.vue setup appConfig.value', appConfig.value)
      // delete appSettings['./settings/default.conf.json']
      console.log('App.vue setup appSettings after update', appSettings)
      appConfig.value.collectionsConf = []
      appConfig.value.collectionsConf.push(appSettings['./settings/default.conf.json'].default.genericConf)
      delete appSettings['./settings/default.conf.json']
      console.log('App.vue setup appSettings after update', appSettings)
      for (let i = 0; i < Object.keys(appSettings).length; i += 1) {
        console.log('App.vue setup appSettings collection iteration', appSettings[Object.keys(appSettings)[i]])
        appConfig.value.collectionsConf.push(appSettings[Object.keys(appSettings)[i]])
      }
      console.log('App.vue setup appConfig.value after update', appConfig.value)
    }

    const getDtsRootResponse = async () => {
      const dtsRootResponse = await getMetadataFromApi()
      dtsRootCollectionId.value = dtsRootResponse['@id']
      console.log('App.vue get dtsRootCollectionId', dtsRootCollectionId.value)
    }
    getDtsRootResponse()

    const getBreadcrumb = async (collId) => {
      let loopCollId = collId
      const initialBreadCrumb = {}
      initialBreadCrumb[collId] = currCollection.value.title
      console.log('App.vue breadcrumb initial initialBreadCrumb loopCollId rootCollectionIdentifier.value', initialBreadCrumb, loopCollId, breadCrumb.value)
      breadCrumb.value = loopCollId !== rootCollectionIdentifier.value ? [initialBreadCrumb] : []
      console.log('App.vue breadcrumb initial', breadCrumb.value)
      let parentCollId = ''
      while (loopCollId && loopCollId !== projectCollId.value && loopCollId !== rootCollectionIdentifier.value) {
        console.log('App.vue breadcrumb loopCollId', loopCollId)
        const parentsResponse = await getParentFromApi(loopCollId)
        const parentCollIds = parentsResponse.member ? parentsResponse.member.map(p => ({ [p['@id']]: p.title })) : []
        console.log('App.vue breadcrumb parentsResponse.member', parentsResponse.member ? parentsResponse.member + '/n' + parentsResponse.member.map(p => ({ [p['@id']]: p.title })) : 'no parent')
        console.log('App.vue breadcrumb parentCollIds', parentCollIds)
        if (Array.isArray(parentCollIds) && parentCollIds.length > 1) {
          parentCollId = store.state.collectionId && Object.keys(parentCollIds).includes(store.state.collectionId) && store.state.collectionId !== loopCollId ? store.state.collectionId : parentCollIds[0]
          console.log('App.vue breadcrumb parentCollId cas 1', parentCollId)
        } else {
          parentCollId = parentCollIds.map(p => Object.keys(p)[0])[0]
          console.log('App.vue breadcrumb parentCollId cas 2', parentCollId)
        }
        if (parentCollId && parentCollId !== rootCollectionIdentifier.value && !breadCrumb.value.map(m => Object.keys(m)[0]).includes(parentCollId)) {
          const parentBreadcrumb = {}
          parentBreadcrumb[parentCollId] = parentsResponse.member.find(p => p['@id'] === parentCollId).title
          breadCrumb.value.push(parentBreadcrumb)
        }
        loopCollId = parentCollId
      }
      console.log('App.vue breadcrumb ', breadCrumb.value)
      for (const id of breadCrumb.value.map(p => Object.keys(p)[0])) {
        const loopCollSettings = appConfig.value.collectionsConf.find(coll => coll.collectionId === id)
        console.log('App.vue shortTitlesBreadcrumb id ', id, appConfig.value.collectionsConf.find(coll => coll.collectionId === id))
        if ((((loopCollSettings || {}).homePageSettings || {}).appNavBar || {}).collectionShortTitle) {
          breadCrumb.value.find(p => Object.keys(p)[0] === id)[id] = loopCollSettings.homePageSettings.appNavBar.collectionShortTitle
        }
      }
      console.log('App.vue breadcrumb after update', breadCrumb.value)
    }

    const getCurrentCollection = async (route) => {
      console.log('App.vue getCurrentCollection origin route', origin, route)
      console.log('this is where it fails')
      mergeSettings()
      let metadataResponse = {}
      if (rootCollectionIdentifier.value === dtsRootCollectionId.value && rootCollectionIdentifier.value === collectionId.value) {
        metadataResponse = await fetchMetadata('app.vue', '', 'Collection', route)
      } else {
        metadataResponse = await fetchMetadata('app.vue', collectionId.value, 'Collection', route)
      }
      // const metadataResponse = await fetchMetadata('app.vue', collectionId.value, 'Collection', route)
      console.log('App.vue getCurrentCollection collectionId.value ', collectionId.value)
      console.log('App.vue getCurrentCollection metadataResponse', metadataResponse)
      console.log('App.vue getCurrentCollection excludeCollectionIds', collectionId.value, appConfig.value.collectionsConf.filter(coll => coll.collectionId === collectionId.value))
      const matchedCollectionConf = appConfig.value.collectionsConf && appConfig.value.collectionsConf.filter(coll => coll.collectionId === collectionId.value).length > 0 ? appConfig.value.collectionsConf.find(coll => coll.collectionId === collectionId.value) : {}
      if (matchedCollectionConf && matchedCollectionConf.excludeCollectionIds && matchedCollectionConf.excludeCollectionIds.length > 0) {
        metadataResponse.member = metadataResponse.member.filter(m => !matchedCollectionConf.excludeCollectionIds.includes(m['@id']))
      }
      let formatedResponse = getSimpleObject(metadataResponse)
      console.log('App.vue formatedResponse', formatedResponse)
      formatedResponse.member.forEach(m => { m.identifier = m['@id'] })
      formatedResponse.member.forEach(m => { m.parent = collectionId.value })
      console.log('App.vue formatedResponse', formatedResponse)
      formatedResponse = { ...formatedResponse, member: formatedResponse.member?.map(m => { return getSimpleObject(m) }) }
      currCollection.value = formatedResponse

      // Get and set the collection project
      const projectId = await getProjectFromApi(collectionId.value)
      projectCollId.value = projectId !== rootCollectionIdentifier.value ? projectId : ''
      console.log('App.vue getCurrentCollection projectCollId.value : ', projectCollId.value)
      await getBreadcrumb(collectionId.value)
    }

    const getCustomCss = async () => {
      if (collConfig.value.collectionCustomCss) {
        const appCssConfs = import.meta.glob('confs/**/*.customCss.css', { eager: false })
        console.log('App.vue getCustomCss appCssConfs', appCssConfs)
        console.log('App.vue getCustomCss collConfig.value.collectionCustomCss', collConfig.value.collectionCustomCss)
        console.log('App.vue getCustomCss get in if')
        cssPath.value = `confs/${collConfig.value.collectionId}/assets/css/${collConfig.value.collectionId}.customCss.css`
        console.log('App.vue getCustomCss path', `${import.meta.env.VITE_APP_CUSTOM_SETTINGS_PATH}/${collConfig.value.collectionId}/assets/css/${collConfig.value.collectionId}.customCss.css`)

        if (collConfig.value.collectionCustomCss && appCssConfs[`${import.meta.env.VITE_APP_CUSTOM_SETTINGS_PATH}/${collConfig.value.collectionCustomCss}/assets/css/${collConfig.value.collectionCustomCss}.customCss.css`]) {
          console.log('App.vue getCustomCss from collection and customCss exists : ', collConfig.value.collectionCustomCss, appCssConfs[`${import.meta.env.VITE_APP_CUSTOM_SETTINGS_PATH}/${collConfig.value.collectionCustomCss}/assets/css/${collConfig.value.collectionCustomCss}.customCss.css`])
          customCss.value = await import(`confs/${collConfig.value.collectionCustomCss}/assets/css/${collConfig.value.collectionCustomCss}.customCss.css?raw`)
          const style = document.createElement('style')
          style.textContent = customCss.value.default
          style.id = 'customCss'
          // check if existing custom.css
          const styleTags = [...document.querySelectorAll('style')]
          if (styleTags.some((tag) => tag.id === 'customCss')) {
            console.log('App.vue a customCss tag exist ', styleTags.filter((tag) => tag.id === 'customCss'))
            document.getElementById('customCss').textContent = style.textContent
            console.log('App.vue a customCss tag exist updated ', styleTags.filter((tag) => tag.id === 'customCss'))
          } else document.head.append(style)
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
          tag.remove()
        }
      })
    }

    watch(
      () => store.state.collectionId, async function () {
        collConfigReady.value = false
        if (watcherRoute.value === false && dtsRootCollectionId.value && rootCollectionIdentifier.value) {
          watcherState.value = true
          collConfig.value = {}
          if (store.state.collectionId && store.state.collectionId !== collectionId.value) {
            collectionId.value = store.state.collectionId
            console.log('App.vue watch store.state.collectionId', store.state.collectionId)
            await getCurrentCollection(route)
            // Collection is loaded
            console.log('App.vue watch appConfig.collectionsConf & type : ', appConfig.value.collectionsConf, Array.isArray(appConfig.value.collectionsConf), collectionId.value)

            // first, try to find if the root Collection has a configuration based on id
            let rootCollectionOverrides = appConfig.value.collectionsConf.find(coll => coll.collectionId === rootCollectionIdentifier.value)
            // second, try to find if a rootCollection (without id) has been defined
            if (!rootCollectionOverrides) {
              rootCollectionOverrides = appConfig.value.collectionsConf.find(coll => coll.collectionId === 'rootCollection')
            }
            // const rootCollectionOverrides = rootCollectionIdentifier.value !== dtsRootCollectionId.value ? appConfig.value.collectionsConf.find(coll => coll.collectionId === rootCollectionIdentifier.value) : undefined
            console.log('App.vue watch appConfig.value.genericConf : ', appConfig.value.genericConf)
            rootCollConfig.value = rootCollectionOverrides ? _.merge({}, appConfig.value.genericConf, rootCollectionOverrides) : appConfig.value.genericConf
            console.log('App.vue watch rootCollConfig.value, rootCollectionOverrides : ', rootCollConfig.value, rootCollectionOverrides)
            rootShortTitle.value = rootCollConfig.value ? rootCollConfig.value.homePageSettings.appNavBar.collectionShortTitle : appConfig.value.genericConf.homePageSettings.appNavBar.collectionShortTitle

            // Set the project config
            const projectCollectionOverrides = appConfig.value.collectionsConf.find(coll => coll.collectionId === projectCollId.value)
            projectCollConfig.value = projectCollectionOverrides ? _.merge({}, rootCollConfig.value, projectCollectionOverrides) : rootCollConfig.value
            console.log('App.vue watch projectCollConfig.value, projectCollectionOverrides : ', projectCollConfig.value, projectCollectionOverrides)
            // Replaced by breadcrumb :
            // projectShortTitle.value = projectCollConfig.value ? projectCollConfig.value.homePageSettings.appNavBar.collectionShortTitle : ''

            let collectionOverrides = appConfig.value.collectionsConf.find(coll => coll.collectionId === collectionId.value)
            console.log('App.vue watch collectionId.value / collectionOverrides : ', collectionId.value, collectionOverrides)
            if (!collectionOverrides && collectionId.value !== rootCollectionIdentifier.value && collectionId.value !== projectCollId.value) {
              collectionOverrides = projectCollConfig.value
              collectionOverrides.collectionId = collectionId.value
            }
            collConfig.value = _.merge({}, projectCollConfig.value, collectionOverrides)
            console.log('App.vue watch final collConfig.value : ', collConfig.value)
            if (collConfig.value.collectionCustomCss) {
              console.log('App.vue watch collConfig.value.collectionCustomCss IF: ', collConfig.value.collectionCustomCss)
              await getCustomCss()
            } else if (customCss.value) {
              console.log('App.vue watch collConfig.value.collectionCustomCss ELSE: ', customCss.value)
              removeCustomCss()
            }
            // updating html document title for collections (when on document, managed in DocumentPage)
            if (!route.params.id) {
              if (store.state.collectionId) {
                console.log('App.vue watch Title state collection : ', store.state.currentItem, store.state.collectionId, route.params, breadCrumb.value, collConfig.value.homePageSettings.appNavBar.collectionShortTitle ? collConfig.value.homePageSettings.appNavBar.collectionShortTitle : currCollection.value.title)
                document.title = appConfig.value && appConfig.value.collectionsConf && appConfig.value.collectionsConf.find(coll => coll.collectionId === store.state.collectionId) ? appConfig.value.collectionsConf.find(coll => coll.collectionId === store.state.collectionId).homePageSettings.appNavBar.collectionShortTitle : currCollection.value.title
              } else {
                console.log('App.vue watch Title state root : ', store.state.currentItem, store.state.collectionId, route.params, breadCrumb.value)
                document.title = rootCollConfig.value && rootCollConfig.value.homePageSettings ? rootCollConfig.value.homePageSettings.appNavBar.collectionShortTitle : document.title
              }
            }
          }
          watcherState.value = false
          collConfigReady.value = true
        }
      }, { immediate: true }
    )
    watch(
      router.currentRoute, async (newRoute, oldRoute) => {
        if ((newRoute && oldRoute) && (newRoute.name === oldRoute.name) && newRoute.name === 'About') {
          console.log('App.vue watch change in route : navigating within the existing About page')
        } else if ((newRoute && oldRoute) && (newRoute.name === oldRoute.name) && (newRoute.params.collId === oldRoute.params.collId) && (newRoute.refId === oldRoute.refId)) {
          console.log('App.vue watch change in route : navigating within an existing refId page')
        } else {
          collConfigReady.value = false
          if (watcherState.value === false) {
            watcherRoute.value = true
            // collConfig.value = {}
            console.log('App.vue watch change in route : ', oldRoute, newRoute)
            await getDtsRootResponse()
            console.log('App.vue watch getDtsRootResponse : ', dtsRootCollectionId.value)
            if (isDocProjectIdInc) {
              console.log('App.vue watch store.state.collectionId / newRoute.params.collId: ', store.state.collectionId, newRoute.params.collId)
              if ((newRoute && oldRoute) && (newRoute.name === oldRoute.name) && (newRoute.params.collId === oldRoute.params.collId) && (store.state.collectionId === collectionId.value)) {
                console.log('App.vue watch no change in route', collConfig.value)
                collConfigReady.value = true
              } else {
                console.log('App.vue watch route.params : ', newRoute, oldRoute)
                if (`${import.meta.env.VITE_APP_ROOT_DTS_COLLECTION_ID}`.length === 0) {
                  rootCollectionIdentifier.value = dtsRootCollectionId.value
                  console.log('App.vue get rootCollectionIdentifier = dtsRootCollectionId', rootCollectionIdentifier.value, dtsRootCollectionId.value)
                } else {
                  rootCollectionIdentifier.value = `${import.meta.env.VITE_APP_ROOT_DTS_COLLECTION_ID}`
                  console.log('App.vue set rootCollectionIdentifier as .env', rootCollectionIdentifier.value)
                }
                // Set the current collection
                if (newRoute.params.id) {
                  console.log('App.vue watch newRoute.params.id', newRoute.params.id)

                  const parentResponse = await getParentFromApi(newRoute.params.id)
                  const currentCollection = parentResponse.member.length > 0 ? store.state.collectionId ? parentResponse.member.map(m => m['@id']).includes(store.state.collectionId) ? store.state.collectionId : parentResponse.member[0]['@id'] : parentResponse.member[0]['@id'] : undefined
                  console.log('App.vue watch currentCollection', currentCollection)
                  collectionId.value = currentCollection
                  store.commit('setResourceId', newRoute.params.id)
                  store.commit('setCollectionId', collectionId.value)
                } else if (newRoute.params.collId) {
                  store.commit('setCurrentItem', {})
                  collectionId.value = newRoute.params.collId
                  store.commit('setCollectionId', collectionId.value)
                  console.log('App.vue watch newRoute.params.collId getProjectFromApi', await getProjectFromApi(collectionId.value))
                  console.log('App.vue watch collectionId.value as route.params.collId : ', collectionId.value)
                } else {
                  store.commit('setCurrentItem', {})
                  collectionId.value = rootCollectionIdentifier.value
                  store.commit('setCollectionId', collectionId.value)
                  console.log('App.vue watch NO route.params.collId -> collectionId.value = rootCollectionIdentifier.value : ', collectionId.value, rootCollectionIdentifier.value)
                }
                console.log('App.vue watch collectionId.value : ', collectionId.value)
                await getCurrentCollection(newRoute)
                console.log('App.vue currCollection.value : ', currCollection.value)
                // Collection is loaded
                console.log('App.vue watch appConfig.collectionsConf & type : ', appConfig.value.collectionsConf, Array.isArray(appConfig.value.collectionsConf), collectionId.value)

                // first, try to find if the root Collection has a configuration based on id
                let rootCollectionOverrides = appConfig.value.collectionsConf.find(coll => coll.collectionId === rootCollectionIdentifier.value)
                // second, try to find if a rootCollection (without id) has been defined
                if (!rootCollectionOverrides) {
                  rootCollectionOverrides = appConfig.value.collectionsConf.find(coll => coll.collectionId === 'rootCollection')
                }
                // const rootCollectionOverrides = rootCollectionIdentifier.value !== dtsRootCollectionId.value ? appConfig.value.collectionsConf.find(coll => coll.collectionId === rootCollectionIdentifier.value) : undefined
                console.log('App.vue watch appConfig.value.genericConf : ', appConfig.value.genericConf)
                rootCollConfig.value = rootCollectionOverrides ? _.merge({}, appConfig.value.genericConf, rootCollectionOverrides) : appConfig.value.genericConf
                console.log('App.vue watch rootCollConfig.value, rootCollectionOverrides : ', rootCollConfig.value, rootCollectionOverrides)
                rootShortTitle.value = rootCollConfig.value ? rootCollConfig.value.homePageSettings.appNavBar.collectionShortTitle : appConfig.value.genericConf.homePageSettings.appNavBar.collectionShortTitle

                // Set the project config
                const projectCollectionOverrides = appConfig.value.collectionsConf.find(coll => coll.collectionId === projectCollId.value)
                projectCollConfig.value = projectCollectionOverrides ? _.merge({}, rootCollConfig.value, projectCollectionOverrides) : rootCollConfig.value
                console.log('App.vue watch projectCollConfig.value, projectCollectionOverrides : ', projectCollConfig.value, projectCollectionOverrides)
                // Replaced by breadcrumb :
                // projectShortTitle.value = projectCollConfig.value ? projectCollConfig.value.homePageSettings.appNavBar.collectionShortTitle : ''

                let collectionOverrides = appConfig.value.collectionsConf.find(coll => coll.collectionId === collectionId.value)
                console.log('App.vue watch collectionId.value / collectionOverrides : ', collectionId.value, collectionOverrides)
                if (!collectionOverrides && collectionId.value !== rootCollectionIdentifier.value && collectionId.value !== projectCollId.value) {
                  collectionOverrides = projectCollConfig.value
                  collectionOverrides.collectionId = collectionId.value
                }
                collConfig.value = _.merge({}, projectCollConfig.value, collectionOverrides)
                console.log('App.vue watch final collConfig.value : ', collConfig.value)
                if (collConfig.value.collectionCustomCss) {
                  console.log('App.vue watch collConfig.value.collectionCustomCss IF: ', collConfig.value.collectionCustomCss)
                  await getCustomCss()
                } else if (customCss.value) {
                  console.log('App.vue watch collConfig.value.collectionCustomCss ELSE: ', customCss.value)
                  removeCustomCss()
                }
                // updating html document title for collections (when on document, managed in DocumentPage)
                if (!newRoute.params.id) {
                  if (store.state.collectionId && newRoute.params.collId) {
                    console.log('App.vue watch Title collection : ', store.state.currentItem, store.state.collectionId, newRoute.params, breadCrumb.value, collConfig.value.homePageSettings.appNavBar.collectionShortTitle ? collConfig.value.homePageSettings.appNavBar.collectionShortTitle : currCollection.value.title)
                    document.title = appConfig.value && appConfig.value.collectionsConf && appConfig.value.collectionsConf.find(coll => coll.collectionId === store.state.collectionId) ? appConfig.value.collectionsConf.find(coll => coll.collectionId === store.state.collectionId).homePageSettings.appNavBar.collectionShortTitle : currCollection.value.title
                  } else {
                    console.log('App.vue watch Title root : ', store.state.currentItem, store.state.collectionId, newRoute.params, breadCrumb.value)
                    document.title = rootCollConfig.value && rootCollConfig.value.homePageSettings ? rootCollConfig.value.homePageSettings.appNavBar.collectionShortTitle : document.title
                  }
                }
              } collConfigReady.value = true
            } else {
              // Set the app rootCollection
              if (`${import.meta.env.VITE_APP_ROOT_DTS_COLLECTION_ID}`.length === 0) {
                // If there no are no user defined app rootCollection, the rootCollection of the app is the DTS root collection
                rootCollectionIdentifier.value = dtsRootCollectionId.value
                console.log('App.vue get rootCollectionIdentifier = dtsRootCollectionId', rootCollectionIdentifier.value, dtsRootCollectionId.value)
              } else {
                // Otherwise use the user defined app rootCollection
                rootCollectionIdentifier.value = `${import.meta.env.VITE_APP_ROOT_DTS_COLLECTION_ID}`
                console.log('App.vue set rootCollectionIdentifier as .env', rootCollectionIdentifier.value)
              }
              // Set the current collection
              if (newRoute.params.id) {
                console.log('App.vue watch newRoute.params.id', newRoute.params.id)
                const currResource = await fetchMetadata('app.vue', newRoute.params.id, 'Resource', newRoute)
                console.log('App.vue watch currResource', currResource)
              } else {
                store.commit('setCurrentItem', {})
              }
              collectionId.value = rootCollectionIdentifier.value
              console.log('App.vue watch collectionId.value : ', collectionId.value)
              await getCurrentCollection(newRoute)
              console.log('App.vue watch currCollection.value : ', currCollection.value)

              // Collection is loaded
              console.log('App.vue watch appConfig.collectionsConf & type : ', appConfig.value.collectionsConf, Array.isArray(appConfig.value.collectionsConf), collectionId.value)

              // first, try to find if the root Collection has a configuration based on id
              let rootCollectionOverrides = appConfig.value.collectionsConf.find(coll => coll.collectionId === rootCollectionIdentifier.value)
              // second, try to find if a rootCollection (without id) has been defined
              if (!rootCollectionOverrides) {
                rootCollectionOverrides = appConfig.value.collectionsConf.find(coll => coll.collectionId === 'rootCollection')
              }
              // const rootCollectionOverrides = rootCollectionIdentifier.value !== dtsRootCollectionId.value ? appConfig.value.collectionsConf.find(coll => coll.collectionId === rootCollectionIdentifier.value) : undefined
              console.log('App.vue watch appConfig.value.genericConf : ', appConfig.value.genericConf)
              rootCollConfig.value = rootCollectionOverrides ? _.merge({}, appConfig.value.genericConf, rootCollectionOverrides) : appConfig.value.genericConf
              console.log('App.vue watch rootCollConfig.value, rootCollectionOverrides : ', rootCollConfig.value, rootCollectionOverrides)
              rootShortTitle.value = rootCollConfig.value ? rootCollConfig.value.homePageSettings.appNavBar.collectionShortTitle : appConfig.value.genericConf.homePageSettings.appNavBar.collectionShortTitle

              // Set the project config
              const projectCollectionOverrides = appConfig.value.collectionsConf.find(coll => coll.collectionId === projectCollId.value)
              projectCollConfig.value = projectCollectionOverrides ? _.merge({}, rootCollConfig.value, projectCollectionOverrides) : rootCollConfig.value
              console.log('App.vue watch projectCollConfig.value, projectCollectionOverrides : ', projectCollConfig.value, projectCollectionOverrides)
              // Replaced by breadcrumb :
              // projectShortTitle.value = projectCollConfig.value ? projectCollConfig.value.homePageSettings.appNavBar.collectionShortTitle : ''

              let collectionOverrides = appConfig.value.collectionsConf.find(coll => coll.collectionId === collectionId.value)
              console.log('App.vue watch collectionId.value / collectionOverrides : ', collectionId.value, collectionOverrides)
              if (!collectionOverrides && collectionId.value !== rootCollectionIdentifier.value && collectionId.value !== projectCollId.value) {
                collectionOverrides = projectCollConfig.value
                collectionOverrides.collectionId = collectionId.value
              }
              collConfig.value = _.merge({}, projectCollConfig.value, collectionOverrides)
              console.log('App.vue watch final collConfig.value : ', collConfig.value)
              if (collConfig.value.collectionCustomCss) {
                console.log('App.vue watch collConfig.value.collectionCustomCss IF: ', collConfig.value.collectionCustomCss)
                await getCustomCss()
              } else if (customCss.value) {
                console.log('App.vue watch collConfig.value.collectionCustomCss ELSE: ', customCss.value)
                removeCustomCss()
              }
              // updating html document title for collections (when on document, managed in DocumentPage)
              if (!newRoute.params.id) {
                if (store.state.collectionId && newRoute.params.collId) {
                  console.log('App.vue watch Title collection : ', store.state.currentItem, store.state.collectionId, newRoute.params, breadCrumb.value, collConfig.value.homePageSettings.appNavBar.collectionShortTitle ? collConfig.value.homePageSettings.appNavBar.collectionShortTitle : currCollection.value.title)
                  document.title = appConfig.value && appConfig.value.collectionsConf && appConfig.value.collectionsConf.find(coll => coll.collectionId === store.state.collectionId) ? appConfig.value.collectionsConf.find(coll => coll.collectionId === store.state.collectionId).homePageSettings.appNavBar.collectionShortTitle : currCollection.value.title
                } else {
                  console.log('App.vue watch Title root : ', store.state.currentItem, store.state.collectionId, newRoute.params, breadCrumb.value)
                  document.title = rootCollConfig.value && rootCollConfig.value.homePageSettings ? rootCollConfig.value.homePageSettings.appNavBar.collectionShortTitle : document.title
                }
              }
            }

            watcherRoute.value = false
            collConfigReady.value = true
          }
        }
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
      getCurrentCollection,
      getBreadcrumb,
      breadCrumb,
      mergeSettings,
      cssPath,
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
  margin: 0 auto !important;
  max-width: 1100px !important;
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
