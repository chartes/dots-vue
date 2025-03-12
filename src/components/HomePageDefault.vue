<template>
  <div class="home-mask" :class="homeCssClass">
    <div class="tiles">
      <div class="tile page-header app-width-padding">
        <div class="is-flex is-flex-direction-column is-align-items-center is-justify-content-center wrapper">
          <div class="tile is-child">
            <div class="title-tile">
              <p class="title">{{ collectionAltTitle ? collectionAltTitle : currCollection.title }}</p>
            </div>
            <div class="project-tile">
              <router-link
                :to="{ name: 'About'}"
                active-class="active"
              >
                About
              </router-link><!-- , params: {collId: collectionId}  -->
            </div>
          </div>
          <div class="wrapper">
            <div class="toc-area app-width-margin" :class="tocCssClass">
              <div class="toc-area-header">
                <a href="#">Browse</a>
                <a href="#" class="toggle-btn" v-on:click.prevent="toggleExpanded(collectionId)"></a>
              </div>
              <div v-if="componentTOC.length > 0"
                class="menu app-width-margin"
                :class="expandedById[collectionId] ? 'expanded': ''"
              >
                <div v-if="expandedById[collectionId] && componentTOC.length > 0">
                  <CollectionTOC
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
      <div
        v-if="currCollection.description"
        id="article"
        class="article app-width-margin"
      >
        <h1>La collection</h1>
          {{ currCollection.description ? currCollection.description : collectionDescription }}
      </div>
      <div
        v-else
        id="article"
        class="article app-width-margin"
      >
        <p class="texte">This collection provides no DTS default description.</p>
      </div>
    </section>
  </div>
</template>

<script>
import { computed, inject, reactive, ref, watch } from 'vue'

import { getMetadataFromApi } from '@/api/document.js'
import CollectionTOC from '@/components/CollectionTOC.vue'

export default {
  components: { CollectionTOC },
  props: {
    collectionIdentifier: {
      type: String,
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
    const collectionAltTitle = `${import.meta.env.VITE_APP_APP_ROOT_COLLECTION_ALT_TITLE}`
    const collectionDescription = `${import.meta.env.VITE_APP_APP_ROOT_COLLECTION_DESC}`
    const collectionId = ref(props.collectionIdentifier)
    console.log('HomePageDefault setup collectionId', collectionId.value)

    const componentTOC = ref([])
    const currCollection = ref(props.currentCollection)

    componentTOC.value = [...currCollection.value.member]
    console.log('HomePageDefault currentCollection.value / componentTOC.value : ', currCollection.value, componentTOC.value)

    console.log('HomePageDefault componentTOC / collectionId : ', Object.fromEntries(componentTOC.value.map(col => [col.identifier, false])), componentTOC.value, collectionId, currCollection)

    const expandedById = ref([])

    const toggleExpanded = async (collId) => {
      // console.log('HomePageDefault Modal toggleExpanded', componentTOC.value)
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

    watch(props, (newProps) => {
      collectionId.value = newProps.collectionIdentifier
      currCollection.value = newProps.currentCollection
    }, { deep: true, immediate: true })

    return {
      collectionAltTitle,
      collectionDescription,
      homeCssClass,
      tocCssClass: layout.tocCssClass,
      collectionId,
      currCollection,
      componentTOC,
      toggleExpanded,
      expandedById
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
.tile.is-child {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.title-tile {
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-top: 30px;
  margin-bottom: 30px;
}
.project-tile {
  display: flex;
  width: fit-content;
  margin-bottom: 30px;
  padding: 6px 10px;
  border: #b9192f 1px solid;
  border-radius: 6px;
  & > a {
    font-family: "Barlow Semi Condensed", sans-serif;
    font-weight: 500;
    text-transform: uppercase;
    text-decoration: none;
    color: #b9192f;
  }
}
</style>
