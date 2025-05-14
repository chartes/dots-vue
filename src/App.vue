<template>
  <div
    v-if="Object.keys(collConfig).length > 0"
    class="layout-grid-container"
  >
    <app-navbar
      class="layout-navbar"
      :is-doc-projectId-included="isDocProjectIdInc"
      :dts-root-collection-identifier="dtsRootCollectionId"
      :root-collection-identifier="rootCollectionIdentifier"
      :root-collection-short-title="projectShortTitle"
      :application-config="appConfig"
      :collection-config="collConfig"
      :collection-identifier="collectionId"
      :key="currCollection+route.fullPath"
    />
      <suspense>
        <router-view
          class="layout-main"
          :is-doc-projectId-included="isDocProjectIdInc"
          :dts-root-collection-identifier="dtsRootCollectionId"
          :root-collection-identifier="rootCollectionIdentifier"
          :application-config="appConfig"
          :collection-config="collConfig"
          :collection-identifier="collectionId"
          :current-collection="currCollection"
          :key="currCollection+route.name"
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
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import router from '@/router'
import _ from 'lodash'

import AppNavbar from '@/components/AppNavbar'
import AppFooter from '@/components/AppFooter.vue'
import BackToTopButton from '@/components/BackToTopButton.vue'
import fetchMetadata from '@/composables/get-metadata'
import { getMetadataFromApi } from '@/api/document'

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
    const collectionId = ref('')
    const collConfig = ref({})
    const currCollection = ref({})
    const appConfig = ref({})
    const collShortTitle = ref('')
    const dtsRootCollectionId = ref('')
    const rootCollectionIdentifier = ref('')
    const projectShortTitle = ref('')
    const isDocProjectIdInc = `${import.meta.env.VITE_APP_ROOT_DTS_COLLECTION_ID}`.length === 0 ? true : `${import.meta.env.VITE_APP_DOCUMENT_ROUTE_INCLUDE_PROJECT_ID}`.toLowerCase() === 'true'
    console.log('App.vue setup route / route.params.collId / collectionId.value : ', route, route.params.collId ? route.params.collId : 'no param collId', collectionId)
    // getting and formatting collection details

    const mergeSettings = () => {
      const appSettings = import.meta.glob('./settings/*.conf.json', { eager: true })
      console.log('App.vue setup appSettings', appSettings)
      const defaultMatch = appSettings['./settings/default.conf.json'].default
      Object.assign(appConfig.value, defaultMatch)
      console.log('App.vue setup defaultMatch', defaultMatch)
      console.log('App.vue setup appConfig.value', appConfig.value)
      //delete appSettings['./settings/default.conf.json']
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
      console.log('yes it has failed ', collectionId.value)
      console.log('App.vue metadataResponse', metadataResponse)
      if (appConfig.value.excludeCollectionIds.length > 0) {
        metadataResponse.member = metadataResponse.member.filter(m => !appConfig.value.excludeCollectionIds.includes(m['@id']))
      }
      let formatedResponse = getSimpleObject(metadataResponse)
      console.log('App.vue formatedResponse', formatedResponse)
      formatedResponse.member.forEach(m => { m.identifier = m['@id'] })
      formatedResponse.member.forEach(m => { m.parent = collectionId.value })
      console.log('App.vue formatedResponse', formatedResponse)
      formatedResponse = { ...formatedResponse, member: formatedResponse.member?.map(m => { return getSimpleObject(m) }) }
      currCollection.value = formatedResponse
    }

    watch(
      router.currentRoute, async (newRoute, oldRoute) => {
        console.log('App.vue watch change in route : ', oldRoute, newRoute)
        await getDtsRootResponse()
        await getCurrentCollection
        console.log('App.vue watch getDtsRootResponse : ', dtsRootCollectionId.value)
        if (isDocProjectIdInc) {
          if (newRoute && oldRoute && newRoute.params.collId === oldRoute.params.collId) {
            console.log('App.vue watch no change in route')
          } else {
            console.log('App.vue watch route.params : ', newRoute.params)
            if (`${import.meta.env.VITE_APP_ROOT_DTS_COLLECTION_ID}`.length === 0) {
              rootCollectionIdentifier.value = dtsRootCollectionId.value
              console.log('App.vue get rootCollectionIdentifier = dtsRootCollectionId', rootCollectionIdentifier.value, dtsRootCollectionId.value)
            } else {
              rootCollectionIdentifier.value = `${import.meta.env.VITE_APP_ROOT_DTS_COLLECTION_ID}`
              console.log('App.vue set rootCollectionIdentifier as .env', rootCollectionIdentifier.value)
            }
            if (newRoute.params.collId) {
              collectionId.value = newRoute.params.collId
              console.log('App.vue watch collectionId.value as route.params.collId : ', collectionId.value)
            } else {
              collectionId.value = rootCollectionIdentifier.value
              console.log('App.vue watch NO route.params.collId -> collectionId.value = rootCollectionIdentifier.value : ', collectionId.value, rootCollectionIdentifier.value)
            }
            console.log('App.vue watch collectionId.value : ', collectionId.value)
            await getCurrentCollection(newRoute)
            console.log('App.vue currCollection.value : ', currCollection.value)
          }
        } else {
          if (`${import.meta.env.VITE_APP_ROOT_DTS_COLLECTION_ID}`.length === 0) {
            rootCollectionIdentifier.value = dtsRootCollectionId.value
            console.log('App.vue get rootCollectionIdentifier = dtsRootCollectionId', rootCollectionIdentifier.value, dtsRootCollectionId.value)
          } else {
            rootCollectionIdentifier.value = `${import.meta.env.VITE_APP_ROOT_DTS_COLLECTION_ID}`
            console.log('App.vue set rootCollectionIdentifier as .env', rootCollectionIdentifier.value)
          }
          collectionId.value = rootCollectionIdentifier.value
          console.log('App.vue watch collectionId.value : ', collectionId.value)
          await getCurrentCollection(newRoute)
          console.log('App.vue watch currCollection.value : ', currCollection.value)
        }
        // Collection is loaded
        console.log('App.vue watch appConfig.collectionsConf & type : ', appConfig.value.collectionsConf, Array.isArray(appConfig.value.collectionsConf), collectionId.value)

        // first, try to find if the root Collection has a configuration based on id
        let rootCollectionOverrides = appConfig.value.collectionsConf.find(coll => coll.collectionId === rootCollectionIdentifier.value)
        // second, try to find if a rootCollection (without id) has been defined
        if (!rootCollectionOverrides) {
          rootCollectionOverrides = appConfig.value.collectionsConf.find(coll => coll.collectionId === 'rootCollection')
        }
        //const rootCollectionOverrides = rootCollectionIdentifier.value !== dtsRootCollectionId.value ? appConfig.value.collectionsConf.find(coll => coll.collectionId === rootCollectionIdentifier.value) : undefined
        console.log('App.vue watch appConfig.value.genericConf : ', appConfig.value.genericConf)
        const rootCollectionConfig = rootCollectionOverrides ? _.merge({}, appConfig.value.genericConf, rootCollectionOverrides) : appConfig.value.genericConf
        console.log('App.vue watch rootCollectionConfig, rootCollectionOverrides : ', rootCollectionConfig, rootCollectionOverrides)
        projectShortTitle.value = rootCollectionConfig ? rootCollectionConfig.homePageSettings.collectionShortTitle : appConfig.value.genericConf.homePageSettings.collectionShortTitle

        let collectionOverrides = appConfig.value.collectionsConf.find(coll => coll.collectionId === collectionId.value)
        console.log('App.vue watch collectionOverrides : ', collectionOverrides)
        if (!collectionOverrides && collectionId.value !== rootCollectionIdentifier.value) {
          collectionOverrides = {
            "collectionId": collectionId.value,
            "mediaTypeEndpoint": "html",
            "homePageSettings": {
              "collectionAltTitle": "",
              "collectionShortTitle": "",
              "collectionDescription": "",
              "logo": ""
            }
          }
        }
        collConfig.value = _.merge({}, rootCollectionConfig, collectionOverrides)
        console.log('App.vue watch final collConfig.value : ', collConfig.value)
      }, { deep: true, immediate: true }
    )

    return {
      route,
      dtsRootCollectionId,
      rootCollectionIdentifier,
      isDocProjectIdInc,
      projectShortTitle,
      collShortTitle,
      collectionId,
      currCollection,
      collConfig,
      appConfig,
      getCurrentCollection,
      mergeSettings
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
  padding-left: calc( 50% - 550px );
  padding-right: calc( 50% - 550px );
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
