<template>
  <div class="layout-grid-container">
    <app-navbar
      class="layout-navbar"
      :root-collection-identifier="rootCollectionIdentifier"
    />
      <suspense>
        <router-view
          class="layout-main"
          :collection-identifier="collectionId"
          :current-collection="currCollection"
          :key="currCollection"
        />
      </suspense>
    <back-to-top-button class="back-to-top-button"/>
    <app-footer
      class="layout-footer"
      :collection-identifier="collectionId === 'elec' ? '' : collectionId"
      :current-collection="currCollection"
      :key="currCollection"
    />
  </div>
</template>

<script>
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import router from '@/router'

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
  // console.log("getSimpleObject / simpleObject", simpleObject)
  return simpleObject
}

export default {
  components: {
    BackToTopButton,
    AppNavbar,
    AppFooter
  },

  setup () {
    const route = useRoute()
    const collectionId = ref('')
    const currCollection = ref({})
    const collectionAltTitle = `${import.meta.env.VITE_APP_APP_ROOT_COLLECTION_ALT_TITLE}`
    const rootCollectionIdentifier = ref('')

    console.log('App.vue setup route / route.params.collId / collectionId.value : ', route, route.params.collId, collectionId)
    // getting and formatting collection details
    const getCurrentCollection = async (route) => {
      console.log('App.vue getCurrentCollection origin route', origin, route)
      const metadataResponse = await fetchMetadata('app.vue', collectionId.value, 'Collection', route)
      console.log('App.vue metadataResponse', metadataResponse)
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
        if (newRoute && oldRoute && newRoute.params.collId === oldRoute.params.collId) {
          console.log('App.vue watch no change in route')
        } else {
          console.log('App.vue watch route.params : ', newRoute.params)
          if (newRoute.params.collId) {
            collectionId.value = newRoute.params.collId
          } else {
            if (`${import.meta.env.VITE_APP_APP_ROOT_COLLECTION_ID}`.length === 0) {
              const rootResponse = await getMetadataFromApi()
              rootCollectionIdentifier.value = rootResponse['@id']
              console.log('App.vue get rootCollectionIdentifier', rootCollectionIdentifier.value)
            } else {
              rootCollectionIdentifier.value = `${import.meta.env.VITE_APP_APP_ROOT_COLLECTION_ID}`
            }
            collectionId.value = rootCollectionIdentifier.value
          }
          console.log('App.vue watch collectionId.value : ', collectionId.value)
          await getCurrentCollection(newRoute)
          console.log('App.vue currCollection.value : ', currCollection.value)
        }
      }, { deep: true, immediate: true }
    )

    return {
      rootCollectionIdentifier,
      collectionId,
      currCollection,
      collectionAltTitle,
      getCurrentCollection
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
