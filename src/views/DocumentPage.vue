<template>
  <div class="is-flex is-flex-direction-column" :class="viewModeCssClass">
    <CollectionModal
      class="modal-area"
      v-if="isLoading && isModalOpened"
      :isOpen="isModalOpened ? isModalOpened : false"
      :is-doc-projectId-included="isDocProjectIdInc"
      :dts-root-collection-identifier="dtsRootCollectionId"
      :collectionIdentifier="selectedCollectionId"
      :currentItem="selectedCollection"
      :toc="flatTOC"
      @change="closeModal"
    >
    </CollectionModal>
    <div>
      <document-metadata
        :ispopup="false"
        :metadataprop="metadata"
        class="metadata-area app-width-margin"
      />
    </div>
    <div
      v-if="topTOCDisplayIndicator"
      class="toc-area app-width-margin"
      :class="tocCssClass"
    >
      <div class="toc-area-header">
        <a href="#" v-on:click="toggleTOCContent">Sommaire</a>
        <a href="#" class="toggle-btn" v-on:click="toggleTOCContent"></a>
      </div>
      <div class="toc-area-content toc-content">
        <aside id="aside">
          <nav>
            <nav>
              <TOC
               v-if="flatTOC.length > 0"
               :is-doc-projectId-included="isDocProjectIdInc"
               :margin="0"
               :toc="flatTOC.filter(n => n.level > 0)"
               :maxcitedepth="TOC_DEPTH"
               @update-ref-id="getNewRefId"
               :refid="refId"
               :key="arianeDocument"
              />
            </nav>
          </nav>
        </aside>
      </div>
    </div>
    <nav class="controls is-flex app-width-margin">
      <a
        href=""
        @click="toggleTOCMenu"
        class="toc-menu-toggle"
        :class="TOCMenuBtnCssClass"
        ><!-- :class="currentLevelIndicator !== 'toEdit' ? 'hideAsideToc' : TOCMenuBtnCssClass" -->Sommaire</a
      >
      <ul class="is-flex">
        <li>
          <a
            href=""
            class="text-btn"
            aria-label="texte seul"
            @click.prevent="changeViewMode('text-mode')"
          ></a>
        </li>
        <li>
          <a
            href=""
            class="text-images-btn"
            aria-label="texte et images"
            @click.prevent="changeViewMode('text-and-images-mode')"
          ></a>
        </li>
        <li>
          <a
            href=""
            class="images-btn"
            aria-label="images seules"
            @click.prevent="changeViewMode('images-mode')"
          ></a>
        </li>
      </ul>
      <ul class="is-flex">
        <li>
          <a
            v-if="metadata.downloadPDF"
            target="_blank"
            v-bind:href="metadata.downloadPDF"
            class="pdf-btn"
            aria-label="Télécharger le PDF"
          />
        </li>
        <li>
          <a
            v-if="refId && refId.length > 0"
            target="_blank"
            v-bind:href="`https://dev.chartes.psl.eu/dots/api/dts/document?resource=${resourceId}&ref=${refId}`"
            class="xml-btn"
            aria-label="Télécharger le XML"
          />
          <a
            v-else
            target="_blank"
            v-bind:href="`https://dev.chartes.psl.eu/dots/api/dts/document?resource=${resourceId}`"
            class="xml-btn"
            aria-label="Télécharger le XML"
          />
        </li>
        <li>
          <a
            v-if="metadata.thenca"
            target="_blank"
            v-bind:href="metadata.thenca"
            class="access_link"
          >Accès à la thèse
          </a>
        </li>
      </ul>
    </nav>
    <div class="navigation-row app-width-margin">
      <div class="ariane-collection">
        <ul class="is-flex is-flex-direction-column is-justify-content-center is-align-items-center crumbs">
          <li
            v-for="(item, index) in arianeCollection.value" :key="index"
            :class="item.length > 1 ? 'several-parent' : refId ? item[0].identifier === refId ? 'is-current' : '' : item[0].identifier === resourceId ? 'is-current' : ''"
          >
            <template v-for="(ancestor, index) in item" v-bind:key="index">
              <router-link
                v-if="isDocProjectIdIncluded && ancestor.identifier === rootCollectionId"
                :to="{ name: 'Home', params: {collId: ancestor.identifier} }"
                >
                {{ ancestor.title }}
              </router-link>
              <router-link
                v-else-if="!isDocProjectIdIncluded && ancestor.identifier === rootCollectionId"
                :to="{ name: 'Home' }"
                >
                {{ ancestor.title }}
              </router-link>
              <a
                v-else
                href="#"
                v-on:click="toggleCollection($event, ancestor.router)"
              >
                {{ ancestor.title }}
              </a>
            </template>
          </li>
        </ul>
      </div>

      <div class="navigation-document">
        <div class="ariane">
          <ul class="is-flex is-flex-direction-column is-justify-content-center is-align-items-center crumbs">
            <li
              v-for="(ancestor, index) in arianeDocument" :key="index"
              :class="refId ? ancestor.identifier === refId ? 'is-current' : '' : ancestor.identifier === resourceId ? 'is-current' : ''"
            >
                <router-link
                  :to="ancestor.router"
                  >
                    <span class="left" v-html="setText(ancestor.title ? ancestor.title : ancestor.dublincore?.title ? ancestor.dublincore?.title : 'fragment courant sans titre' ).left"></span>
                    <span class="right" v-html="setText( ancestor.title ? ancestor.title : ancestor.dublincore?.title ? ancestor.dublincore?.title : 'fragment courant sans titre' ).right"></span>
                </router-link>
            </li>
          </ul>
        </div>
      </div>
      <div class="navigation-document-top">
        <to-previous-button
          class="to-previous-button-page-top"
          :class="!refId || firstRef ? 'disabled' : ''"
          :refid="refId"
          :previousrefid="previousRefId"
          :previousreftitle="previousRefTitle"
          @click="getNewRefId"
          :key="resourceId + refId"
        />
        <to-next-button
          class="to-next-button-page-top"
          :class="!refId || lastRef ? 'disabled' : ''"
          :nextrefid="nextRefId"
          :nextreftitle="nextRefTitle"
        /><!--@click="getNewRefId" :key="resourceId + refId" :refid="refId"-->
      </div>

    </div>
    <div class="document-area is-flex app-width-margin" :class="tocMenuCssClass">
      <div class="toc-area-aside toc-content"><!-- id="toc-area-aside" -->
        <aside id="aside">
          <nav>
            <nav>
              <span v-if="arianeDocument.length && arianeDocument[0].descendant">{{ arianeDocument[0].descendant }}{{ countEditorialTypes.length > 0 ? ' item de type ' + countEditorialTypes[0] : '' }}</span>
              <TOC
               :is-doc-projectId-included="isDocProjectIdInc"
               :margin="0"
               :toc="flatTOC.filter(n => n.level > 0)"
               :maxcitedepth="TOC_DEPTH"
               @update-ref-id="getNewRefId"
               :refid="refId"
               :key="arianeDocument"
              />
            </nav>
          </nav>
        </aside>
      </div>
      <div class="document-views is-flex" v-if="isLoading">
        <div v-if="!refId || refId && refId.length === 0" class="text-view" id="text-view">
          <document
            :is-doc-projectId-included="isDocProjectIdInc"
            :media-type-endpoint="collConfig.mediaTypeEndpoint"
            :project-identifier="docProjectId"
            :iiif-manifest="manifest"
            :collection-css="customCss.default"
            :id="resourceId"
            :level="currentLevel"
            :editorialLevelIndicator="currentLevelIndicator"
            :editoriallevel="editorialLevel"
            :documenttype="documentType"
            :bottomtoc="bottomTOC"
            :maxcitedepth="TOC_DEPTH"
            :key="resourceId + currentLevelIndicator"
          />
        </div>
        <div v-else class="text-view" id="text-view">
          <document
            :is-doc-projectId-included="isDocProjectIdInc"
            :media-type-endpoint="collConfig.mediaTypeEndpoint"
            :project-identifier="docProjectId"
            :iiif-manifest="manifest"
            :collection-css="customCss.default"
            :id="resourceId + '&ref=' + refId"
            :level="currentLevel"
            :editorialLevelIndicator="currentLevelIndicator"
            :editoriallevel="editorialLevel"
            :documenttype="documentType"
            :bottomtoc="bottomTOC"
            :maxcitedepth="TOC_DEPTH"
            :key="refId + editorialLevel"
          />
        </div>
        <div v-if="isLoading" class="mirador-view" id="mirador-view" :style="miradorViewCssStyle">
          <div id="vue-mirador-container" ref="miradorContainer"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Document from '@/components/Document.vue'
import TOC from '@/components/TOC.vue'
import ToPreviousButton from '@/components/ToPreviousButton.vue'
import ToNextButton from '@/components/ToNextButton.vue'
import DocumentMetadata from '@/components/DocumentMetadata.vue'
import CollectionModal from '@/components/CollectionModal.vue'

import { useStore } from 'vuex'
import useMirador from '@/composables/use-mirador'
import { getMetadataFromApi, getParentFromApi, getTOCFromApi } from '@/api/document'

import {
  computed,
  onMounted,
  onUnmounted,
  watch,
  reactive,
  provide,
  ref,
  inject, nextTick, shallowRef, onBeforeUnmount
} from 'vue'

import { useRoute } from 'vue-router'
import router from '@/router/index.js'
import fetchMetadata from '@/composables/get-metadata.js'
import store from '@/store'

/* const sources = [
  { name: 'databnf', ext: 'data.bnf.fr', type: 'author_link' },
  { name: 'dbpedia', ext: 'dbpedia.org', type: 'author_link' },
  { name: 'idref', ext: 'idref.fr', type: 'author_link' },
  { name: 'cataloguebnf', ext: 'catalogue.bnf.fr', type: 'author_link' },
  { name: 'wikidata', ext: 'wikidata', type: 'author_link' },
  { name: 'wikipedia', ext: 'wikipedia', type: 'author_link' },
  { name: 'thenca', ext: 'thenca', type: 'document_link' },
  { name: 'hal', ext: 'hal', type: 'document_link' },
  { name: 'benc', ext: 'koha', type: 'document_link' },
  { name: 'sudoc', ext: 'sudoc.fr', type: 'document_link' },
  { name: 'biblissima', ext: 'biblissima.fr', type: 'document_link' },
  { name: 'creativecommons', ext: 'creativecommons.org', type: 'document_link' },
  { name: 'enc', ext: 'manifest', type: 'other_link' }
] */

/* function findSource (id) {
  let i = 0
  let source = null

  do {
    source = id.toLowerCase().includes(sources[i].ext) ? sources[i] : null
    i++
  } while (i < sources.length && source === null)

  if (source) {
    console.log('findSource source.name :', source.name)
    console.log('findSource source :', source)
    return { name: source.name, type: source.type }
  }

  return null
} */
function getSimpleObject (obj) {
  // console.log("getSimpleObject / obj", obj)
  let simpleObject = {}
  simpleObject = {
    identifier: obj.identifier ? obj.identifier : obj['@id'],
    citeType: obj['@type'] ? obj['@type'] : obj.citeType,
    expanded: obj.expanded,
    title: Array.isArray(obj.title) ? obj.title[0] : obj.title,
    level: obj.level,
    editorialLevelIndicator: obj.editorialLevelIndicator,
    totalChildren: obj.totalChildren,
    totalDescendants: obj.totalDescendants,
    children: obj.children,
    member: obj.member,
    parent: obj.parent,
    dublincore: { ...obj.dublincore, title: Array.isArray(obj.dublincore.title) ? obj.dublincore.title[0] : obj.dublincore.title },
    extensions: obj.extensions
  }
  // console.log("getSimpleObject / simpleObject", simpleObject)
  return simpleObject
}
function findById (array, id) {
  for (const item of array) {
    if (item.identifier === id) return item
    if (item.children?.length) {
      const innerResult = findById(item.children, id)
      if (innerResult) return innerResult
    }
  }
}
/* function findDeep (array, id) {
  return array.some(function (item) {
    if (item.id === id) return item
    else if (item.children?.length) return findDeep(item.children, id)
  })
} */

export default {
  name: 'DocumentPage',
  computed: {
    store () {
      return store
    }
  },
  components: {
    DocumentMetadata,
    Document,
    TOC,
    ToPreviousButton,
    ToNextButton,
    CollectionModal
  },
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
    collectionConfig: {
      type: Object,
      required: true
    }
  },
  async setup (props) {
    const topTOCDisplayIndicator = ref(false)
    const isDocProjectIdInc = ref(props.isDocProjectIdIncluded)
    const dtsRootCollectionId = ref(props.dtsRootCollectionIdentifier)
    const rootCollectionId = ref(props.rootCollectionIdentifier)
    const docProjectId = ref('')
    console.log('topTOCDisplayIndicator test : ', topTOCDisplayIndicator)
    const collConfig = ref(props.collectionConfig)
    console.log('DocumentPage props.collectionConfig', props.collectionConfig)
    const manifestIsAvailable = ref(false)
    const manifest = ref(null)
    const miradorContainer = ref(null)

    // Mirador view sticky behavior
    const miradorViewBoundingTop = ref(0)
    const miradorViewCssStyle = computed(() => {
      return { marginTop: miradorViewBoundingTop.value + 'px' }
    })

    const updateMiradorTopPosition = function () {
      const textView = document.getElementById('text-view')
      if (textView) {
        const top = textView.getBoundingClientRect().top
        miradorViewBoundingTop.value = top < 0 ? -Math.floor(top) : 0
      }
    }

    const setText = (text) => {
      // We're going to split the string towards the end. This is just a judgment call.
      // Since we can't dynamically change the split as the container changes size (at
      // least, not with a lot more work), we have to pick a location that scales the
      // ellipsis well.
      const splitIndex = Math.round(text.length * 0.5)

      return {
        left: text.slice(0, splitIndex),
        right: text.slice(splitIndex)
      }
    }

    const initial_metadata = {
      id: null,
      title: null,
      author: null,
      rights: null,
      sudoc: null,
      benc: null,
      thenca: null,
      data_bnf: null,
      dbpedia: null,
      idref: null,
      catalogue_bnf: null,
      hal: null,
      wikidata: null,
      wikipedia: null,
      iiifManifestUrl: null,
      downloadPDF: null,
      downloadXML: null
    }/* document_links: [],
      author_links: [],
      other_links: [], */

    const metadata = reactive(initial_metadata)
    const route = useRoute()
    const store = useStore()

    const resourceId = ref()
    const refId = ref(false)
    const hash = ref(false)
    const currentItem = ref({})
    const documentType = ref()
    const collection = ref()

    const isLoading = ref(false)
    const TOC_DEPTH = ref(props.collectionConfig.tableOfContentsSettings.tableOfContentDepth)
    console.log('DocumentPage setup TOC_DEPTH : ', TOC_DEPTH.value)
    const editorialTypesIsValid = ref(false)
    const countEditorialTypes = ref([])
    const currentLevelIndicator = ref(false)
    const currentLevel = ref(1)
    const editorialLevel = ref(props.collectionConfig.tableOfContentsSettings.editByLevel)
    const flatTOC = ref([])
    const topTOC = ref([])
    const bottomTOC = ref([])

    const arianeCollection = reactive([])
    const arianeDocument = ref([])
    const previousRefId = ref('')
    const previousRefTitle = ref('')
    const nextRefId = ref('')
    const nextRefTitle = ref('')
    const firstRef = ref(false)
    const lastRef = ref(false)

    const selectedCollectionId = ref('')
    const selectedCollection = reactive({})
    const isModalOpened = ref(false)

    let customCss = shallowRef({})
    const cssPath = ref('')

    const miradorInstance = useMirador(miradorContainer, manifest)
    // provide an uninitialized instance of Mirador
    provide('mirador', miradorInstance)

    const layout = inject('variable-layout')

    const getCurrentItem = async (origin, route) => {
      console.log('getCurrentItem origin route', origin, route)
      if (route.params.id) {
        resourceId.value = route.params.id
        // let currentIdResponse = getMetadata(resourceId.value)
        console.log('Setting resourceId : ', resourceId.value)
        // Check if route id param is a DoTS resourceId or a fragmentId in order to store current resourceId
        // get DotS route to identify type of Id (collection / resource / fragment)
        // if route param id is collection -> ?
        // if route param id is resource -> store the resourceId in Store
        // await getMetadataFromApi(route.params.id)
        store.commit('setResourceId', route.params.id)

        const response = await getMetadataFromApi(resourceId.value)
        const parentResponse = await getParentFromApi(response['@id'])
        // console.log("parentResponse", parentResponse["member"][0])

        if (response['@type'] === 'Resource') {
          documentType.value = 'Resource'
          currentItem.value = getSimpleObject(response)
          currentItem.value.parent = parentResponse.member.length > 1 ? parentResponse.member.map(p => p['@id']) : parentResponse.member[0]['@id']
          currentItem.value.level = 0

          // Fetch editorial level document parts if any (based on citeType)
          let editorialTypes = []
          if (collConfig.value.length > 0 && collConfig.value[0].tableOfContentsSettings.editByCiteType.length > 0) {
            editorialTypes = collConfig.value[0].tableOfContentsSettings.editByCiteType
          }
          currentItem.value.editorialLevelIndicator = editorialTypes.includes(currentItem.value.citeType) ? 'toEdit' : 'renderToc'
          store.commit('setCurrentItem', currentItem.value)
          console.log('init type : ', documentType.value)
          console.log('set currentItem.value : ', currentItem.value)
          isModalOpened.value = false
        } else {
          documentType.value = 'Collection'

          currentItem.value = getSimpleObject(response)
          currentItem.value.parent = parentResponse.member ? parentResponse.member[0]['@id'] : null
          currentItem.value.level = -1
          currentItem.value.editorialLevelIndicator = 'renderToc'
          store.commit('setCurrentItem', currentItem.value)
          console.log('init type : ', documentType.value)
          isModalOpened.value = true
        }
        docProjectId.value = isDocProjectIdInc.value ? route.params.collId + '/' : ''
        console.log('docProjectId.value ', docProjectId.value)

        console.log('Objectassign collConfig.value : ', collConfig.value)
        topTOCDisplayIndicator.value = collConfig.value.tableOfContentsSettings.displayTopToc !== false

        currentLevelIndicator.value = currentItem.value.editorialLevelIndicator
        refId.value = Object.keys(route.query).length > 0 && Object.keys(route.query).includes('refId')
          ? refId.value = route.query.refId
          : false

        hash.value = route.hash && route.hash.length > 0
          ? hash.value = route.hash.replace('#', '')
          : false
      }
    }

    const getMetadata = async () => {
      const metadataResponse = await fetchMetadata('DocumentPage', resourceId.value, 'Resource', route)
      console.log('DocumentPage getMetadata metadataResponse', metadataResponse)
      Object.assign(metadata, metadataResponse)
    }

    // Setting up the Tables Of Content Top and Left
    const getTOC = async (reason) => {
      console.log('DocumentPage getTOC reason', reason)
      console.log('DocumentPage getTOC resourceId.value', resourceId.value)
      console.log('DocumentPage getTOC refId.value', refId.value)

      const response = await getTOCFromApi(resourceId.value, documentType.value)
      console.log('DocumentPage getTOC initial TOC response', response)
      if (response.member && documentType.value === 'Collection') {
        response.member.forEach(m => { m.parent = response['@id'] })
        response.member.forEach(m => { m.level = store.state.currentItem.level + 1 })
        response.member.forEach(m => { m.identifier = m['@id'] })
      }

      response.member.filter(item => !item.title).forEach(m => {
        m.title = m.dublincore && m.dublincore.title && m.dublincore.title.length ? m.dublincore.title : ''
        m.title = m.title.length ? m.title : m.extensions && m.extensions['tei:role'] ? m.extensions['tei:num'] ? m.extensions['tei:role'] + ' ' + m.extensions['tei:num'] : m.extensions['tei:role'] + ' ' + m.identifier : ''
        m.title = m.title.length ? m.title : m.extensions && m.citeType && m.extensions['tei:num'] ? m.citeType + ' ' + m.extensions['tei:num'] : ''
        m.title = m.title.length ? m.title : m.citeType + ' ' + m.identifier
      })

      let processFlatTOC = []
      processFlatTOC = [store.state.currentItem, ...response.member]
      processFlatTOC.filter(item => item.level === 1).forEach(i => { i.parent = resourceId.value })

      // Fetch editorial level document parts if any (based on citeType)
      let editorialTypes = []
      console.log('TOC collConfig.value for editorialTypes : ', collConfig.value)
      editorialTypes = collConfig.value.tableOfContentsSettings.editByCiteType

      // Validate that there are actually in the data
      editorialTypesIsValid.value = processFlatTOC.some(item => editorialTypes.some(l => l === item.citeType))
      console.log('editorialTypes editorialTypesIsValid.value', editorialTypes, editorialTypesIsValid.value)

      // Validate the max depth of editorialTypes items and update the depth of the TOC accordingly
      const minTocDepth = Math.max(Math.max(...processFlatTOC.filter(item => editorialTypes.includes(item.citeType)).map(i => i.level)), TOC_DEPTH.value)
      TOC_DEPTH.value = minTocDepth
      console.log('document DoTS minTocDepth : ', minTocDepth)

      console.log('initial3 processFlatTOC', processFlatTOC)

      async function parentLoop (node) {
        if (node.parent && node.parent.length > 0) {
          if (Array.isArray(node.parent)) {
            // multiple parents
            for (let i = 0; i < node.parent.length; i += 1) {
              console.log('appendParentInTOC / node.parent / p', node.parent, node.parent[i])
              const appendParentInTOC = await getMetadataFromApi(node.parent[i])
              console.log('appendParentInTOC', appendParentInTOC)
              const parentResponse = await getParentFromApi(appendParentInTOC['@id'])
              // Compute parent level from current node
              parentResponse.level = node.level - 1
              // Append this level to the parent instance to be added in the TOC
              appendParentInTOC.level = parentResponse.level
              appendParentInTOC.editorialLevelIndicator = 'renderToc'
              // Complete the list of children of the parent
              appendParentInTOC.member = appendParentInTOC.member.map(obj => {
                const updatedMember = {
                  identifier: obj.identifier ? obj.identifier : obj['@id'],
                  ...obj
                }
                return updatedMember
              })
              appendParentInTOC.children = []

              appendParentInTOC.children = await Promise.all(appendParentInTOC.member.filter(item => item.identifier !== node.identifier).map(async (obj) => {
                const updatedMemberParentResp = await getParentFromApi(obj.identifier)
                const updatedMemberParent = updatedMemberParentResp.member ? updatedMemberParentResp.member.map(p => p['@id']) : undefined
                const updatedMember = {
                  identifier: obj.identifier ? obj.identifier : obj['@id'],
                  citeType: obj['@type'] ? obj['@type'] : obj.citeType,
                  expanded: obj.identifier === node.id ? node.expanded : undefined,
                  title: obj.title,
                  level: node.level,
                  editorialLevelIndicator: node.editorialLevelIndicator,
                  totalChildren: obj.totalChildren,
                  totalDescendants: obj.totalDescendants,
                  children: obj.children ? obj.children : [],
                  member: obj.member ? obj.member : [],
                  parent: updatedMemberParent,
                  dublincore: obj.dublincore,
                  extensions: obj.extensions
                }
                return updatedMember
              }))
              if (appendParentInTOC.member.filter(item => item.identifier === node.identifier).length > 0) {
                const updatedCurrentNode = appendParentInTOC.member.filter(item => item.identifier === node.identifier)[0]
                updatedCurrentNode.parent = node.parent
                updatedCurrentNode.level = node.level
                updatedCurrentNode.member = node.member ? node.member : []
                appendParentInTOC.children.push(getSimpleObject(updatedCurrentNode))
              }
              // appendParentInTOC.member = appendParentInTOC.member.map(m => { return getSimpleObject(m)})
              // appendParentInTOC.children = appendParentInTOC.member
              appendParentInTOC.expanded = true
              // Check if the parent has itself a parent
              if (parentResponse.member) {
                // Then add the parent id to the parent instance to be added in the TOC
                appendParentInTOC.parent = parentResponse.member[0]['@id']
              } else {
                // Otherwise add a null parent id to the parent instance to be added in the TOC
                appendParentInTOC.parent = null
              }
              // Add this parent object to the TOC
              processFlatTOC = [getSimpleObject(appendParentInTOC), ...processFlatTOC]
              // If the parent has itself a parent : loop
              if (appendParentInTOC.parent && !processFlatTOC.some(item => item.identifier === appendParentInTOC.parent)) {
                await parentLoop(appendParentInTOC)
              }
            }
          } else {
            const appendParentInTOC = await getMetadataFromApi(node.parent)
            console.log('appendParentInTOC else', appendParentInTOC)

            const parentResponse = await getParentFromApi(appendParentInTOC['@id'])
            // Compute parent level from current node
            parentResponse.level = node.level - 1
            // Append this level to the parent instance to be added in the TOC
            appendParentInTOC.level = parentResponse.level
            appendParentInTOC.editorialLevelIndicator = 'renderToc'
            // Complete the list of children of the parent
            appendParentInTOC.member = appendParentInTOC.member.map(obj => {
              const updatedMember = {
                identifier: obj.identifier ? obj.identifier : obj['@id'],
                ...obj
              }
              return updatedMember
            })
            appendParentInTOC.children = []

            appendParentInTOC.children = await Promise.all(appendParentInTOC.member.filter(item => item.identifier !== node.identifier).map(async (obj) => {
              const updatedMemberParentResp = await getParentFromApi(obj.identifier)
              const updatedMemberParent = updatedMemberParentResp.member ? updatedMemberParentResp.member.map(p => p['@id']) : undefined
              const updatedMember = {
                identifier: obj.identifier ? obj.identifier : obj['@id'],
                citeType: obj['@type'] ? obj['@type'] : obj.citeType,
                expanded: obj.identifier === node.id ? node.expanded : undefined,
                title: obj.title,
                level: node.level,
                editorialLevelIndicator: node.editorialLevelIndicator,
                totalChildren: obj.totalChildren,
                totalDescendants: obj.totalDescendants,
                children: obj.children ? obj.children : [],
                member: obj.member ? obj.member : [],
                parent: updatedMemberParent,
                dublincore: obj.dublincore,
                extensions: obj.extensions
              }
              return updatedMember
            }))
            if (appendParentInTOC.member.filter(item => item.identifier === node.identifier).length > 0) {
              const updatedCurrentNode = appendParentInTOC.member.filter(item => item.identifier === node.identifier)[0]
              updatedCurrentNode.parent = node.parent
              updatedCurrentNode.level = node.level
              updatedCurrentNode.member = node.member ? node.member : []
              appendParentInTOC.children.push(getSimpleObject(updatedCurrentNode))
            }

            // appendParentInTOC.member = appendParentInTOC.member.map(m => { return getSimpleObject(m)})
            // appendParentInTOC.children = appendParentInTOC.member
            appendParentInTOC.expanded = true

            // Check if the parent has itself a parent
            if (parentResponse.member) {
              // Then add the parent id to the parent instance to be added in the TOC
              appendParentInTOC.parent = parentResponse.member[0]['@id']
            } else {
              // Otherwise add a null parent id to the parent instance to be added in the TOC
              appendParentInTOC.parent = null
            }
            // Add this parent object to the TOC
            processFlatTOC = [getSimpleObject(appendParentInTOC), ...processFlatTOC]
            // If the parent has itself a parent : loop
            if (appendParentInTOC.parent && !processFlatTOC.some(item => item.identifier === appendParentInTOC.parent)) {
              await parentLoop(getSimpleObject(appendParentInTOC))
            }
          }
        }
      }

      await parentLoop(store.state.currentItem)

      console.log('setup afterParents processFlatTOC : ', processFlatTOC)

      // Move ultimate ancestor to first position

      const ultimateAncestor = processFlatTOC.filter(item => item.parent === null)[0]
      console.log('setup afterParents find ultimate ancestor = rootCollection : ', ultimateAncestor)
      const ultimateAncestorIndex = processFlatTOC.findIndex(item => item.parent === null)
      console.log('setup afterParents find ultimate ancestor : ', processFlatTOC, ultimateAncestor, ultimateAncestorIndex)

      processFlatTOC.splice(ultimateAncestorIndex, 1)
      processFlatTOC.unshift(ultimateAncestor)
      console.log('setup afterParents find ultimate ancestor after: ', processFlatTOC, ultimateAncestor, ultimateAncestorIndex)
      // identify the last fragment level for which metadata are available to create a TOC element title
      const titleMissing = (node) => {
        if (node.title) {
          return true
        } else if (node.dublincore && node.dublincore.title && node.dublincore.title.length > 0) {
          return true
        } else if (node.extensions && node.extensions['tei:role']) {
          return true
        } else if (node.citeType && node.extensions && node.extensions['tei:num']) {
          return true
        } else {
          return false
        }
      }
      console.log('document DoTS titleMissing debug ...processFlatTOC.filter(i => !titleMissing(i)) : ', processFlatTOC.filter(i => !titleMissing(i)))
      console.log('document DoTS titleMissing debug ...processFlatTOC.filter(i => !titleMissing(i)).length : ', processFlatTOC.filter(i => !titleMissing(i)).length)
      const maxTocDepth = processFlatTOC.filter(i => !titleMissing(i)).length === 0
        ? Math.max(...processFlatTOC.map(i => i.level))
        : Math.max(...processFlatTOC.filter(i => !titleMissing(i)).map(item => item.level)) - 1
      console.log('document DoTS maxTocDepth : ', maxTocDepth)

      // check if there is an editorial level set up by the user in the collection configuration
      editorialLevel.value = collConfig.value.tableOfContentsSettings.editByLevel
      /* if (collConfig.value.length > 0 && collConfig.value[0].tableOfContentsSettings.editByLevel !== '' && collConfig.value[0].tableOfContentsSettings.editByLevel >= 0) {
        editorialLevel.value = collConfig.value[0].tableOfContentsSettings.editByLevel
      } */

      console.log('USER editorialLevel.value / typeof : ', editorialLevel.value, typeof (editorialLevel.value))
      editorialLevel.value = editorialLevel.value > maxTocDepth ? maxTocDepth : editorialLevel.value
      console.log('VALIDATED editorialLevel.value / typeof : ', editorialLevel.value, typeof (editorialLevel.value))

      console.log('currentLevel / typeof : ', currentLevel, typeof (currentLevel.value))
      // in any case, max the TOC depth (available or user driven) by the availability of fragment title metadata
      console.log('TOC_DEPTH.value / typeof : ', TOC_DEPTH.value, typeof (TOC_DEPTH.value))
      // TOC_DEPTH.value = TOC_DEPTH.value > maxTocDepth ? maxTocDepth : TOC_DEPTH.value

      if (refId.value) {
        console.log('there is a refId , update currentLevel', processFlatTOC.filter(item => item.identifier === refId.value)[0].level)
        currentLevel.value = processFlatTOC.filter(item => item.identifier === refId.value)[0].level
        console.log('there is a refId , updated currentLevel', currentLevel.value)
      } else {
        console.log('there is NO refId , update currentLevel to 0', 0)
        currentLevel.value = 0
        console.log('there is NO refId , updated currentLevel', currentLevel.value)
      }

      const startTimeBuildTOC = new Date()

      // initialise the children of the flatTOC fragments (descendant of the resource)
      processFlatTOC.filter(item => item.level >= 0).forEach((node) => { node.children = [] })

      function countDescendants (node, count = 0) {
        count = node.totalDescendants
        if (node.children && node.children.length > 0) {
          for (let i = 0; i < node.children.length; i += 1) {
            count += countDescendants(node.children[i])
          }
        }
        node.descendant = count
        return count
      }
      countEditorialTypes.value = collConfig.value.tableOfContentsSettings.countByCiteType

      for (let i = 0; i < processFlatTOC.length; i += 1) {
        if (processFlatTOC[i].level >= 0) {
          processFlatTOC[i].children = processFlatTOC.filter(node => node.parent === processFlatTOC[i].identifier)
          processFlatTOC[i].totalDescendants = processFlatTOC.filter(node => node.parent === processFlatTOC[i].identifier && countEditorialTypes.value.includes(node.citeType)).length
        }
      }

      processFlatTOC.filter(item => item.level >= 0).forEach(node => countDescendants(node))
      console.log('processFlatTOC', processFlatTOC)
      if (editorialTypesIsValid.value) {
        processFlatTOC.filter(item => editorialTypes.includes(item.citeType)).forEach((node) => {
          node.editorialLevelIndicator = 'toEdit'
          if (node.level <= 0) {
            node.url = `${window.location.origin}${import.meta.env.VITE_APP_APP_ROOT_URL}${route.path.slice(1, route.path.length)}/${node.identifier}`
            node.router = node.identifier
          } else {
            node.url = `${window.location.origin}${import.meta.env.VITE_APP_APP_ROOT_URL}${route.path.slice(1, route.path.length)}?refId=${node.identifier}`
            node.router = `${route.params.id}?refId=${node.identifier}`
            node.router_params = route.params.id
            node.router_refid = node.identifier
          }
        })
      } else {
        processFlatTOC.filter(item => item.level === editorialLevel.value).forEach((node) => {
          node.editorialLevelIndicator = 'toEdit'
          if (node.level <= 0) {
            node.url = `${window.location.origin}${import.meta.env.VITE_APP_APP_ROOT_URL}${route.path.slice(1, route.path.length)}/${node.identifier}`
            node.router = node.identifier
          } else {
            node.url = `${window.location.origin}${import.meta.env.VITE_APP_APP_ROOT_URL}${route.path.slice(1, route.path.length)}?refId=${node.identifier}`
            node.router = `${route.params.id}?refId=${node.identifier}`
            node.router_params = route.params.id
            node.router_refid = node.identifier
          }
        })
      }
      // update all descendants of the editorial level(s) to a hash type
      function flagDescendants (node, ancestor) {
        node.editorialLevelIndicator = 'hash'
        node.ancestor_editorialLevel = ancestor
        if (node.ancestor_editorialLevel !== route.params.id) {
          node.url = `${window.location.origin}${import.meta.env.VITE_APP_APP_ROOT_URL}${route.path.slice(1, route.path.length)}?refId=${node.ancestor_editorialLevel}#${node.identifier}`
          node.router = `${route.params.id}?refId=${node.ancestor_editorialLevel}#${node.identifier}`
          node.hash = `#${node.identifier}`
          node.router_params = route.params.id
          node.router_refid = node.ancestor_editorialLevel
          node.router_hash = `#${node.identifier}`
        } else {
          node.url = `${window.location.origin}${import.meta.env.VITE_APP_APP_ROOT_URL}${route.path.slice(1, route.path.length)}#${node.identifier}`
          node.router = `${route.params.id}#${node.identifier}`
          node.hash = `#${node.identifier}`
          node.router_params = route.params.id
          node.router_hash = `#${node.identifier}`
        }
        if (node.children && node.children.length > 0) {
          for (let i = 0; i < node.children.length; i += 1) {
            flagDescendants(node.children[i], ancestor)
          }
        }
      }
      console.log('processFlatTOCtoEdit', processFlatTOC.filter(item => item.editorialLevelIndicator === 'toEdit'))
      const toEditIds = processFlatTOC.filter(item => item.editorialLevelIndicator === 'toEdit').map(node => node.identifier)
      console.log('processFlatTOCHash', processFlatTOC.filter(item => toEditIds.includes(item.parent)))
      processFlatTOC.filter(item => toEditIds.includes(item.parent)).forEach(node => {
        flagDescendants(node, node.parent)
      })
      console.log('processFlatTOCRest', processFlatTOC.filter(item => !item.url))
      processFlatTOC.filter(item => !item.url).forEach(node => {
        node.editorialLevelIndicator = 'renderToc'
        if (node.level <= 0) {
          node.url = `${window.location.origin}${import.meta.env.VITE_APP_APP_ROOT_URL}${node.identifier}`
          node.router = node.identifier
          node.router_params = node.identifier
          // console.log("addFlag on node.level <=0 :", node)
        } else {
          node.url = `${window.location.origin}${import.meta.env.VITE_APP_APP_ROOT_URL}${route.path.slice(1, route.path.length)}?refId=${node.identifier}`
          node.router = `${route.params.id}?refId=${node.identifier}`
          node.router_params = route.params.id
          node.router_refid = node.identifier
          if (node.identifier === 'a1') {
            console.log('node.url ', node.url, '\n', window.location.origin, '\n', import.meta.env.VITE_APP_APP_ROOT_URL, '\n', route.path)
          }
        }
      })

      if (editorialTypesIsValid.value) {
        topTOC.value = processFlatTOC
        // console.log("flatTOC.value updated after editorialType : ", flatTOC.value)
        console.log('processFlatTOC updated after editorialType : ', processFlatTOC)
        console.log('topTOC.value based on editorialType : ', topTOC.value)
      }
      flatTOC.value = processFlatTOC

      if (refId.value) {
        console.log('there is a refId , update currentLevelIndicator.value', currentLevelIndicator.value)
        currentLevelIndicator.value = flatTOC.value.find(i => i.identifier === refId.value).editorialLevelIndicator
        console.log('there is a refId , updated currentLevelIndicator.value', currentLevelIndicator.value)
      } else {
        console.log('there is NO refId , update currentLevelIndicator.value', currentLevelIndicator.value)
        currentLevelIndicator.value = flatTOC.value.find(i => i.identifier === resourceId.value).editorialLevelIndicator
        console.log('there is NO refId , updated currentLevelIndicator.value', currentLevelIndicator.value)
      }

      const endTimeBuildTOC = new Date()
      console.log('TimeBuildTOC : ', endTimeBuildTOC - startTimeBuildTOC)

      if (!editorialTypesIsValid.value) {
        // topTOC.value = list_to_tree(flatTOC.value, editorialLevel.value)
        topTOC.value = processFlatTOC.filter(item => item.level >= 0)
        console.log('topTOC.value based on levels : ', topTOC.value)
      } else {
        topTOC.value = processFlatTOC.filter(item => item.level >= 0)
        console.log('topTOC.value based on editorialLevel : ', topTOC.value)
      }
      if (refId.value) {
        console.log('there is a refId , update currentLevelIndicator.value', currentLevelIndicator.value)
        currentLevelIndicator.value = flatTOC.value.find(i => i.identifier === refId.value).editorialLevelIndicator
        console.log('there is a refId , updated currentLevelIndicator.value', currentLevelIndicator.value)

        console.log('search RefId item in TOC and return children : ', findById(topTOC.value, refId.value).children)
        // select flatTOC elements between the current matching refId and the last element belonging to the same parent
        const followingElementInTreeLimb = flatTOC.value.findIndex(i => i.identifier === refId.value) + 1
        const allFollowingElementsInTOC = flatTOC.value.slice(followingElementInTreeLimb, flatTOC.value.length)
        const lastElementInTreeLimb = allFollowingElementsInTOC.findIndex(i => i.parent === flatTOC.value.find(i => i.identifier === refId.value).parent) + 1
        const currentMatchingElementIndex = flatTOC.value.findIndex(i => i.identifier === refId.value)
        // assign portion of topTOC to the bottomTOC and unlink the variables
        bottomTOC.value = JSON.parse(JSON.stringify(flatTOC.value.slice(followingElementInTreeLimb, lastElementInTreeLimb + currentMatchingElementIndex)))
      } else {
        console.log('there is NO refId , update currentLevelIndicator.value', currentLevelIndicator.value)
        currentLevelIndicator.value = flatTOC.value.find(i => i.identifier === resourceId.value).editorialLevelIndicator
        console.log('there is NO refId , updated currentLevelIndicator.value', currentLevelIndicator.value)
        // assign portion of topTOC to the bottomTOC and unlink the variables
        bottomTOC.value = JSON.parse(JSON.stringify(topTOC.value.filter(i => i.level > 0)))
        console.log('bottomTOC cas 3 :', bottomTOC.value, topTOC.value)
      }
      await getAncestors()
      console.log('getTOC result topTOC : ', topTOC.value)
      console.log('getTOC result bottomTOC : ', bottomTOC.value)
      store.commit('setTOC', flatTOC.value)
      isLoading.value = true
    }

    const getAncestors = async () => {
      console.log('getAncestors start')
      const currentItemId = refId.value ? refId.value : resourceId.value
      console.log('ancestors currentItemId : ', flatTOC.value, hash.value, refId.value, resourceId.value, currentItemId)

      function findAncestors (item, directory) {
        if (item.parent === null) return [item]
        const parent = []
        if (Array.isArray(item.parent)) {
          // multiple parents
          for (let i = 0; i < item.parent.length; i += 1) {
            const parentId = item.parent[i]
            // console.log("findAncestors item.parent", item.parent, i, item.parent[i])
            parent.push(directory.find(i => i.identifier === parentId))
            // console.log("findAncestors parent list", directory.find(i => i.identifier === parentId))
          }/*
        parent.push(directory.find(i => i.identifier === item.parent[0])) */
        } else {
          parent.push(directory.find(i => i.identifier === item.parent))
        }
        // console.log("findAncestors item, parent", item, parent)

        return [
          item,
          parent,
          ...findAncestors(parent[0], directory)
        ].flat()
      }

      console.log('ancestors flatTOC.value', flatTOC.value)

      const startTimeBuildAncestors = new Date()

      if (editorialTypesIsValid.value) {
        console.log('ancestors editorialTypesIsValid.value', editorialTypesIsValid.value, currentItemId)
        console.log('flatTOC.value debug', flatTOC.value.filter(item => item.identifier === currentItemId))
        // Filter the TOC down to the item we care about based on currentItemId
      } else {
        console.log('ancestors based on levels ')
      }

      // Build the collections breadcrumb
      arianeCollection.value = flatTOC.value
      // Filter the TOC down to the item we care about based on currentItemId
        .filter(item => item.identifier === currentItemId)
      // Map each item to an array of its ancestors
        .map(item => findAncestors(item, flatTOC.value))
      // Flatten the array of arrays into an array of items
        .flat()
      // De-duplicate the result
        .reduce((output, item) => {
          return !output.includes(item)
            ? [...output, item]
            : output
        }, [])
      // From these ancestors, we only need Collection items
        .filter(item => item.citeType === 'Collection')
      // Sorting by increasing level
        .sort((a, b) => a.level - b.level)

      console.log('getAncestor arianeCollection.value', arianeCollection.value)

      // Group the ancestors (type collection) by level (when there are several parent collections at any level)
      const arianeColGroupedByLevel = new Map()

      for (let i = 0; i < arianeCollection.value.length; i += 1) {
        console.log('arianeCollection test order increasing', arianeCollection.value[i])
        const level = arianeCollection.value[i].level
        console.log('arianeCollection arianeColGroupedByLevel i / item / level : ', i, arianeCollection.value[i], level)
        console.log('arianeCollection arianeColGroupedByLevel / i ', i, arianeColGroupedByLevel)
        if (!arianeColGroupedByLevel.has(level)) {
          arianeColGroupedByLevel.set(level, [arianeCollection.value[i]])
        } else {
          arianeColGroupedByLevel.get(level).push(arianeCollection.value[i])
        }
      }
      arianeCollection.value = Array.from(arianeColGroupedByLevel.values())

      // Build the breadcrumb within the resource
      arianeDocument.value = flatTOC.value
      // Filter the TOC down to the item we care about based on currentItemId
        .filter(item => item.identifier === currentItemId)
      // Map each item to an array of its ancestors
        .map(item => findAncestors(item, flatTOC.value))
      // Flatten the array of arrays into an array of items
        .flat()
      // De-duplicate the result
        .reduce((output, item) => {
          return !output.includes(item)
            ? [...output, item]
            : output
        }, [])
      // From these ancestors, we only need non-collection items
        .filter(item => item.citeType !== 'Collection')
      // From these ancestors, we don't display the current ressource
      // .filter(item => item.identifier !== currentItemId)
      // Sorting by increasing level
        .sort((a, b) => a.level - b.level)

      console.log('getAncestor arianeDocument.value', arianeDocument.value)

      const endTimeBuildAncestors = new Date()
      console.log('getAncestor TimeBuildAncestor : ', endTimeBuildAncestors - startTimeBuildAncestors)

      if (store.state.arianeDocument && store.state.arianeDocument.length > 0) {
        store.state.arianeDocument.forEach((id) => {
          // console.log('getAncestor ariane cancel loop ', iter)
          if (flatTOC.value.find(node => node.identifier === id)) {
            // console.log('getAncestor ariane found in topTOC', findById(topTOC.value, iter.identifier))
            flatTOC.value.find(node => node.identifier === id).expanded = false
            if (flatTOC.value.filter(node => node.parent === id || node.ancestor_editorialLevel === id).length > 0) {
              flatTOC.value.filter(node => node.parent === id || node.ancestor_editorialLevel === id).forEach(n => { n.show = false })
            }
            // console.log('getAncestor ariane updated expanded topTOC', findById(topTOC.value, iter.identifier))
          }
        })
      }

      arianeDocument.value.forEach((item) => {
        // console.log('getAncestor ariane add loop : ', iter)
        if (flatTOC.value.find(node => node.identifier === item.identifier)) {
          // console.log('getAncestor ariane add found in topTOC', findById(topTOC.value, iter.identifier))
          flatTOC.value.find(node => node.identifier === item.identifier).expanded = true
          // console.log('getAncestor ariane add updated expanded topTOC', findById(topTOC.value, iter.identifier))
        }
      })
      store.commit('setArianeDocument', arianeDocument.value.map(item => item.identifier))
    }
    const closeModal = () => {
      isModalOpened.value = false
      selectedCollectionId.value = ''
      Object.assign(selectedCollection, {})
      console.log(' Collection modal was closed : ', selectedCollectionId.value, selectedCollection)
    }

    const toggleCollection = (event, collectionId) => {
      console.log('toggleCollection collectionId : ', collectionId)
      event.preventDefault()
      isModalOpened.value = true
      selectedCollectionId.value = collectionId
      Object.assign(selectedCollection, flatTOC.value.filter(item => item.identifier === selectedCollectionId.value)[0])
      console.log('toggleCollection selectedCollectionId / selectedCollection : ', selectedCollectionId.value, flatTOC.value.filter(item => item.identifier === selectedCollectionId.value)[0])
    }
    const getNewRefId = function () {
      console.log('getNewRefId check if refId / refId.value', refId, refId.value)
      firstRef.value = false
      lastRef.value = false
      if (refId.value) {
        firstRef.value = false
        lastRef.value = false
        console.log('getNewRefId flatTOC.value / editorialTypesIsValid.value', flatTOC.value, editorialTypesIsValid.value)
        // filter TOC to get only editorial level items

        const refIdTOC = flatTOC.value.filter(item => { return ((item.editorialLevelIndicator === 'renderToc' && item.level > 0) || item.editorialLevelIndicator === 'toEdit') })
        console.log('function getNewRefId editorialFlatTOC test', refIdTOC)
        const currentItem = refIdTOC.find(item => item.identifier === refId.value)
        console.log('function getNewRefId currentItem', currentItem)
        const currentItemIndex = currentItem && (typeof currentItem !== 'undefined') ? refIdTOC.findIndex(item => item.identifier === refId.value) : -1
        console.log('function getNewRefId currentItemIndex', currentItemIndex)
        if (currentItemIndex === 0) {
          // this is the first item in editorial levels
          // console.log("function getNewRefId this is the first item")
          previousRefId.value = ''
          previousRefTitle.value = 'Table des matières'
          firstRef.value = true
        } else if (currentItemIndex > 0) {
          // this is not the first item in editorial levels : find previous
          // console.log('function getNewRefId this is NOT the first item : ', editorialFlatTOC[currentItemIndex - 1])
          previousRefId.value = refIdTOC[currentItemIndex - 1].identifier
          previousRefTitle.value = refIdTOC[currentItemIndex - 1].title
            ? refIdTOC[currentItemIndex - 1].title
            : refIdTOC[currentItemIndex - 1].citeType + ' ' + refIdTOC[currentItemIndex - 1].identifier
            // console.log('function getNewRefId previousRefId.value : ', previousRefId.value)
        }
        if (currentItemIndex === refIdTOC.length - 1) {
          // this is the last item in editorial levels
          // console.log('function getNewRefId this is the last item')
          nextRefId.value = ''
          nextRefTitle.value = ''
          lastRef.value = true
        } else {
          // this is not the last item in editorial levels : find next
          // console.log('function getNewRefId this is NOT the last item : ', editorialFlatTOC[currentItemIndex + 1])
          nextRefId.value = refIdTOC[currentItemIndex + 1].identifier
          nextRefTitle.value = refIdTOC[currentItemIndex + 1].title
            ? refIdTOC[currentItemIndex + 1].title
            : refIdTOC[currentItemIndex + 1].citeType + ' ' + refIdTOC[currentItemIndex + 1].identifier
          // console.log('function getNewRefId nextRefId.value : ', nextRefId.value)
        }
      } else {
        previousRefId.value = ''
        previousRefTitle.value = ''
        nextRefId.value = ''
        nextRefTitle.value = ''
      }
    }

    const setMirador = function () {
      fetch(metadata.iiifManifestUrl, {
        method: 'GET'
      })
        .then((r) => {
          manifestIsAvailable.value = r.ok
          return r.json()
        })
        .then((loadedManifest) => {
          manifest.value = loadedManifest
          console.log('setMirador loadedManifest : ', loadedManifest, manifest.value)
        })
        .catch((error) => {
          console.log('setMirador error : ', error)
          manifestIsAvailable.value = false
        })
    }
    const getCustomCss = async () => {

      if (collConfig.value.collectionCustomCss) {
        // const appCssConfs = import.meta.glob('confs/**/*.customCss.css', { eager: true })
        const appCssConfs = import.meta.glob('confs/**/*.customCss.css', { eager: false })
        console.log('Document page getCustomCss appCssConfs', appCssConfs)
        console.log('Document page getCustomCss collConfig.value.collectionCustomCss', collConfig.value.collectionCustomCss)
        console.log('Document page getCustomCss get in if')
        /* const match = appCssConfs[`${import.meta.env.VITE_APP_CUSTOM_SETTINGS_PATH}/${collConfig.value.collectionId}/assets/css/${collConfig.value.collectionId}.customCss.css`]
        console.log('Document page getCustomCss match path', `${import.meta.env.VITE_APP_CUSTOM_SETTINGS_PATH}/${collConfig.value.collectionId}/assets/css/${collConfig.value.collectionId}.customCss.css`)
        console.log('Document page getCustomCss match', match) */
        cssPath.value = `confs/${collConfig.value.collectionId}/assets/css/${collConfig.value.collectionId}.customCss.css`
        console.log('Document page getCustomCss path', `${import.meta.env.VITE_APP_CUSTOM_SETTINGS_PATH}/${collConfig.value.collectionId}/assets/css/${collConfig.value.collectionId}.customCss.css`)

        /* customCss.value = await import(`confs/${collConfig.value.collectionId}/assets/css/${collConfig.value.collectionId}.customCss.css?raw`) */

        if (collConfig.value.collectionCustomCss && appCssConfs[`${import.meta.env.VITE_APP_CUSTOM_SETTINGS_PATH}/${collConfig.value.collectionCustomCss}/assets/css/${collConfig.value.collectionCustomCss}.customCss.css`]) {
          console.log('Document page getCustomCss from collection and customCss exists : ', collConfig.value.collectionCustomCss, appCssConfs[`${import.meta.env.VITE_APP_CUSTOM_SETTINGS_PATH}/${collConfig.value.collectionCustomCss}/assets/css/${collConfig.value.collectionCustomCss}.customCss.css`])
          customCss.value = await import(`confs/${collConfig.value.collectionCustomCss}/assets/css/${collConfig.value.collectionCustomCss}.customCss.css?raw`)
          const style = document.createElement('style')
          style.textContent = customCss.value.default
          style.id = 'customCss'
          document.head.append(style)
          console.log('Document page customCss.value / cssComp : ', customCss.value)
        }
      }
    }

    const removeCustomCss = () => {
      console.log('Document page watch store.state.collectionId', store.state.collectionId)
      const styleTags = [...document.querySelectorAll('style')]
      console.log('Document page watch store.state.collectionId getCustomCss styleTags ', styleTags)
      styleTags.forEach((tag) => {
        //console.log('Document page watch store.state.collectionId getCustomCss tag.textContent ', tag.textContent)
        if (tag.id === 'customCss') {
          console.log('Document page watch store.state.collectionId getCustomCss tag.textContent ', tag.textContent)
          console.log('Document page watch store.state.collectionId getCustomCss tag.id ', tag.id)
          tag.remove()
        }
      })
    }

    watch(
      () => metadata.iiifManifestUrl,
      async () => {
        if (metadata.iiifManifestUrl) {
          console.log('metadata.iiifManifestUrl is now available !!! : ', metadata.iiifManifestUrl, manifestIsAvailable.value)
          layout.imageIsAvailable.value = true
          setMirador()
        } else {
          layout.imageIsAvailable.value = false
        }
      }
    )

    watch(props, async (newProps) => {
      collConfig.value = newProps.collectionConfig
      TOC_DEPTH.value = newProps.collectionConfig.tableOfContentsSettings.tableOfContentDepth
      editorialLevel.value = newProps.collectionConfig.tableOfContentsSettings.editByLevel
      console.log('Document page watch newProps.collectionConfig / collConfig.value : ', collConfig.value)
      if (collConfig.value.collectionCustomCss) {
        await getCustomCss()
      } else {
        removeCustomCss()
      }
    }, { deep: true, immediate: true })

    watch(
      router.currentRoute, async (newRoute, oldRoute) => {
        isLoading.value = false
        console.log('Document page watch route.params : ', route.params)
        console.log('Document page watch route.query : ', route.query)
        console.log('Document page watch route.hash : ', route.hash)
        console.log('Document page watch router oldRoute, newRoute : ', oldRoute, newRoute)

        if (newRoute && oldRoute && newRoute.params.id !== oldRoute.params.id) {
          await getCurrentItem('watch getCurrentItem : route : ', newRoute)
          console.log('Document page watch route change, resource DID change :', refId.value)
          await getTOC('watch query')
          await getMetadata()
          getNewRefId()
          isLoading.value = true
        } else if (newRoute && oldRoute && newRoute.params.id === oldRoute.params.id) {
          console.log('Document page watch route change but resource DID NOT change ', oldRoute, newRoute)
          // await getCurrentItem("watch getCurrentItem : route : ", newRoute)
          // await getTOC("watch query")
          if (newRoute.query.refId === oldRoute.query.refId) {
            console.log('Document page watch route change but resource/refId DID NOT change ', oldRoute, newRoute)
            hash.value = newRoute.hash && newRoute.hash.length > 0 ? newRoute.hash.replace('#', '') : false
            isLoading.value = true
            if (newRoute.hash && newRoute.hash.length > 0) {
              console.log('watch scrollTo hash : ', hash.value)
              scrollTo()
            }
          } else {
            hash.value = newRoute.hash && newRoute.hash.length > 0 ? newRoute.hash.replace('#', '') : false
            console.log('Document page watch route change refId changed oldRoute, newRoute, hash.value ', oldRoute, newRoute, hash.value)
            refId.value = newRoute.query.refId
            // await getCurrentItem('watch getCurrentItem : route : ', newRoute)
            // await getTOC("watch query")
            currentLevel.value = refId.value
              ? flatTOC.value.find(i => i.identifier === refId.value).level
              : flatTOC.value.find(i => i.identifier === resourceId.value).level
            await getAncestors()
            currentLevelIndicator.value = refId.value
              ? flatTOC.value.find(i => i.identifier === refId.value).editorialLevelIndicator
              : flatTOC.value.find(i => i.identifier === resourceId.value).editorialLevelIndicator

            console.log('watch query : currentLevelIndicator.value debug', currentLevelIndicator.value)
            console.log('watch query : refId', refId.value)
            if (refId.value) {
              // select flatTOC elements between the current matching refId and the last element belonging to the same parent
              const followingElementInTreeLimb = flatTOC.value.findIndex(i => i.identifier === refId.value) + 1
              // console.log('watch query : bottomTOC debug followingElementInTreeLimb', followingElementInTreeLimb)
              const allFollowingElementsInTOC = flatTOC.value.slice(followingElementInTreeLimb, flatTOC.value.length)
              // console.log('watch query : bottomTOC debug allFollowingElementsInTOC', allFollowingElementsInTOC)
              const lastElementInTreeLimb = allFollowingElementsInTOC.findIndex(i => i.parent === flatTOC.value.find(i => i.identifier === refId.value).parent) !== -1 ? allFollowingElementsInTOC.findIndex(i => i.parent === flatTOC.value.find(i => i.identifier === refId.value).parent) + 1 : allFollowingElementsInTOC.length
              // console.log('watch query : bottomTOC debug lastElementInTreeLimb', lastElementInTreeLimb)
              const currentMatchingElementIndex = flatTOC.value.findIndex(i => i.identifier === refId.value)
              // console.log('watch query : bottomTOC debug currentMatchingElementIndex', currentMatchingElementIndex)
              // assign portion of topTOC to the bottomTOC and unlink the variables
              bottomTOC.value = JSON.parse(JSON.stringify(flatTOC.value.slice(followingElementInTreeLimb, lastElementInTreeLimb + currentMatchingElementIndex)))
            } else {
              // assign portion of topTOC to the bottomTOC and unlink the variables
              bottomTOC.value = JSON.parse(JSON.stringify(topTOC.value.filter(i => i.level > 0)))
            }
            console.log('watch query : bottomTOC debug flatTOC', flatTOC.value)
            console.log('watch query : bottomTOC debug', bottomTOC.value)
            console.log('watch query : bottomTOC debug flatTOC.value.findIndex(i => i.identifier === refId.value) + 1', refId.value ? flatTOC.value.findIndex(i => i.identifier === refId.value) + 1 : 'no refId')
            console.log('watch query : bottomTOC debug flatTOC.value.findIndex next parent in ', refId.value ? flatTOC.value.slice(flatTOC.value.findIndex(i => i.identifier === refId.value) + 1, flatTOC.value.length).findIndex(i => i.parent === flatTOC.value.find(i => i.identifier === refId.value).parent) + 1 + flatTOC.value.findIndex(i => i.identifier === refId.value) + 1 : 'no refId')
            getNewRefId()
            isLoading.value = true
          }
        } else if (typeof oldRoute === 'undefined') {
          await getCurrentItem('watch getCurrentItem : route : ', route)
          console.log('Document page watch NO newRoute : oldRoute, newRoute = route ', oldRoute, route)
          await getTOC('watch query')
          await getMetadata()
          getNewRefId()
          isLoading.value = true
        } else {
          console.log('Document page watch TEST : oldRoute, newRoute ', oldRoute, newRoute)
        }
      }, { deep: true, immediate: true }
    )
    /*watch(
      () => store.state.collectionId, async function () {
        console.log('Document page watch store.state.collectionId', store.state.collectionId)
        const styleTags = [...document.querySelectorAll('style')]
        console.log('Document page watch store.state.collectionId getCustomCss styleTags ', styleTags)
        styleTags.forEach((tag) => {
          console.log('Document page watch store.state.collectionId getCustomCss tag.textContent ', tag.textContent)
          if (tag.id === 'customCss') {
            console.log('Document page watch store.state.collectionId getCustomCss tag.id ', tag.id)
            tag.remove()
          }
        })
      }, { immediate: true }
    )*/
    /*watch(
      () => store.state.collectionId, function () {
        console.log('Document page watch store.state.collectionId', store.state.collectionId)
        removeCustomCss()
      }, { immediate: true }
    )*/

    function scrollTo () {
      nextTick(() => {
        // If the selected item is an anchor, capture and scroll to that anchor
        // console.log('DocumentPage.vue scrollTo on resolve hash : ', hash.value)
        if (hash.value.length) {
          location.hash = hash.value
        }
      })
    }
    onMounted(() => {
      const appView = document.getElementById('app')
      appView.addEventListener('scroll', updateMiradorTopPosition)
      window.addEventListener('scroll', updateMiradorTopPosition)
      layout.isTOCMenuOpened.value = false
    })
    /* onBeforeUnmount(() => {
      const styleTags = [...document.querySelectorAll('style')]
      console.log('Document page getCustomCss styleTags ', styleTags)
      styleTags.forEach((tag) => {
        console.log('Document page getCustomCss tag.textContent ', tag.textContent)
        if (tag.id === 'customCss') {
          console.log('Document page getCustomCss tag.id ', tag.id)
          tag.remove()
        }
      })
    })*/

    onUnmounted(() => {
      const appView = document.getElementById('app')
      layout.changeViewMode('text-mode')
      console.log('layout on leave', layout, layout.isTOCMenuOpened.value)
      if (layout.isTOCMenuOpened.value === true) {
        console.log('closing TOC on leave')
        layout.isTOCMenuOpened.value = false
      }
      appView.removeEventListener('scroll', updateMiradorTopPosition)
      window.removeEventListener('scroll', updateMiradorTopPosition)
    })

    return {
      topTOCDisplayIndicator,
      tocCssClass: layout.tocCssClass,
      toggleTOCContent: layout.toggleTOCContent,
      tocMenuCssClass: layout.tocMenuCssClass,
      toggleTOCMenu: layout.toggleTOCMenu,
      TOCMenuBtnCssClass: layout.TOCMenuBtnCssClass,
      changeViewMode: layout.changeViewMode,
      viewModeCssClass: layout.viewModeCssClass,
      miradorViewCssStyle,
      miradorContainer,
      metadata,
      manifestIsAvailable,
      manifest,
      layout,
      resourceId,
      collection,
      isDocProjectIdInc,
      dtsRootCollectionId,
      rootCollectionId,
      collConfig,
      docProjectId,
      isLoading,
      TOC_DEPTH,
      currentLevelIndicator,
      editorialLevel,
      countEditorialTypes,
      currentLevel,
      documentType,
      flatTOC,
      topTOC,
      bottomTOC,
      arianeCollection,
      arianeDocument,
      refId,
      hash,
      getNewRefId,
      previousRefId,
      previousRefTitle,
      nextRefId,
      nextRefTitle,
      firstRef,
      lastRef,
      scrollTo,
      isModalOpened,
      closeModal,
      toggleCollection,
      selectedCollectionId,
      selectedCollection,
      currentItem,
      setText,
      getCustomCss,
      removeCustomCss,
      customCss,
      cssPath
    }
  }
}
</script>
<style>
.modal-area {
  width: 100%;
}
.metadata-area {
  margin-top: 15px !important;
  margin-bottom: 15px !important;
}
.metadata-area .columns {
  margin: 0;
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
.toc-area-content {
  background-color: #e4e4e4;
  border-radius: 0 0 6px 6px;
  display: none;
}
.toc-area.is-opened .toc-area-header {
  background-color: #f1f1f1;
  border-radius: 6px 6px 0 0;
}
.toc-area.is-opened .toc-area-content {
  display: block;
}
.toc-area .toc-area-content aside {
  width: 100% !important;
  padding: 20px 50px !important;
}
.toc-area .toc-area-content nav > ol.tree {
  /*display: flex;
  justify-content: space-between;
  align-content: space-around;*/
  columns: 4;
  gap: 40px;
}
.toc-content > aside > nav > nav > ol.tree > li {
  /*width: 25%;*/
  text-transform: none;
  /* margin-bottom: 20px; */
  padding: 0;
}
.toc-content > aside > nav > nav > ol.tree > li.more > a {
  /*display: inline-block;*/
  margin-bottom: 8px;
}
.toc-content > aside > nav > nav > ol.tree > li li {
  padding: 0;
  margin: 0 0 6px;
  text-transform: none;
}
.toc-content > aside > nav > nav > ol.tree > li ol {
  margin: 0;
}
.toc-content nav > ol.tree > li {
  break-inside: avoid;
}
.toc-content nav > ol.tree li::before {
  display: none;
}
.toc-content nav > .tree ol,
.tree ul {
  border: none !important;
}
.toc-content a:hover {
  background-color: transparent !important;
  border-radius: unset !important;
  color: #000;
  text-decoration: underline dotted !important;
}
.toc-area-aside a,
.toc-area-content a {
  font-family: "Barlow Semi Condensed", sans-serif !important;
  font-weight: 400;
  text-align: left;
  line-height: 20px;
  letter-spacing: 0;
  border: none;
  box-shadow: none;
}
.toc-area-content a {
  font-size: 17px;
  color: #252525;
}
.toc-area-aside a {
  font-size: 16px;
  color: #000;
}

/* toogle */
.toggle-btn {
  position: absolute;
  right: 20px;
  width: 27px;
  height: 27px;
  background: url(../assets/images/chevron_rouge.svg) center top -7px / cover no-repeat;
  border: none;
  text-decoration: none;
}
.toc-area.is-opened .toggle-btn {
  background: url(../assets/images/croix.svg) center / cover no-repeat;
}

.controls {
  justify-content: space-between;
  align-items: center;
  width: 100%;
  /* border-top: #b9192f 1px dashed; */
  border-top: 1px dashed var(--text-color);
  border-bottom: #b8b8b8 1px solid;
  padding: 12px 0 9px;
}
.controls a {
  display: inline;
  font-family: "Barlow", sans-serif;
  font-size: 15px;
  font-weight: 500;
  text-transform: uppercase;
  color: #4a4a4a;
  margin: 0;
}
.controls > a.toc-menu-toggle {
  font-size: 14px;
  color: #aeaeae;
  padding: 6px 10px;
  border: #aeaeae 1px solid;
  border-radius: 4px;
}
.controls > a.toc-menu-toggle.is-opened {
  color: #b9192f;
  border-color: #b9192f;
}
.controls ul {
  align-items: center;
}
.controls ul > li {
  margin: 0;
}
.controls ul > li > a {
  display: inline-block;
  width: 42px;
  height: 42px;
  margin-right: 10px;
}
.controls ul > li > a.access_link {
  vertical-align: center;
  display: inline;
  margin-left: 15px;
}
.controls a.text-btn {
  background: url(../assets/images/b_text_off.svg) center / cover no-repeat;
}
.text-mode .controls a.text-btn {
  background-image: url(../assets/images/b_text_on.svg);
}
.controls a.text-images-btn {
  width: 80px;
  background: url(../assets/images/b_text-image_off.svg) center / cover no-repeat;
  margin: 0 25px 0 15px;
}
.text-and-images-mode .controls a.text-images-btn {
  background-image: url(../assets/images/b_text-image_on.svg);
}
.controls a.images-btn {
  background: url(../assets/images/b_image_off.svg) center / cover no-repeat;
}
.images-mode .controls a.images-btn {
  background-image: url(../assets/images/b_image_on.svg);
}
.text-mode-only .controls a.text-btn {
  pointer-events: none;
}
.text-mode-only .controls a.text-images-btn,
.text-mode-only .controls a.images-btn {
  pointer-events: none;
  opacity: 0.2;
}
.controls a.pdf-btn {
  background: url(../assets/images/b_PDF.svg) center / cover no-repeat;
}
.controls a.xml-btn {
  background: url(../assets/images/b_XML.svg) center / cover no-repeat;
}
.document-area {
  width: 100%;
}
.document-area #aside,
.toc-area #aside {
  position: unset;
  float: none;
  margin: 0;
  background: none;
  border: none;
}
.document-area #aside header,
.toc-area #aside header {
  display: none;
}
.document-views {
  width: 100%;
}
.toc-area-aside {
  display: none;
}
.toc-aside-is-opened .toc-area-aside {
  display: flex;
  width: 220px;
}
.toc-aside-is-opened .document-views {
  flex: calc(100% - 220px);
}
.mirador-view {
  position: relative;
  min-height: 80vh;
  max-height: 100vh;
}
.text-mode .text-view,
.images-mode .mirador-view {
  flex: 100% 0 0;
  width: 100%;
}
.images-mode .text-view,
.text-mode .mirador-view {
  position: absolute;
  width: 500px;
  height: 700px;
  visibility: hidden;
}
.text-mode .mirador-view {
  flex: 100% 0 0;
}
.text-and-images-mode .text-view,
.text-and-images-mode .mirador-view {
  flex: 50% 0 0;
}

#center {
  width: 100%;
  margin: 0 !important;
}

#article {
  padding: 40px 10% 120px;
  border-bottom: 1px dotted #ffffff;
  min-height: 100%;
}
div.remove-bottom-padding {
  display: flex;
}
div.remove-bottom-padding #article {
  padding: 40px 10% 10px !important;
}

#article article {
  margin: 0;
}

#article > span.error > b {
  display: none;
}

#article h1,
#article .titlepage {
  font-family: "Barlow", sans-serif !important;
}

#article h1 {
  padding: 0;
  font-size: 25px;
  font-weight: 500;
  line-height: 33px;
  text-transform: none;
  /* color: #971716; */
  color: var(--text-color);
}

#article .titlepage {
  font-size: 18px;
  line-height: 25px;
}

#article .titlepage hr {
  width: 100%;
  margin: 60px 0 45px;
  border: dashed #b9192f 1px;
}

#article .titlepage,
#article .titlepage .forename {
  font-variant: small-caps;
  text-transform: none;
}

#article .titlepage .surname {
  text-transform: uppercase;
}

#article .titlepage .forename,
#article .titlepage .surname {
  font-size: 20px;
  font-weight: 500;
}
#article .titlepage .name {
  margin-bottom: 30px;
}
#article .titlepage .roleName {
  font-size: 16px;
  line-height: 22px;
  text-transform: uppercase;
  font-style: italic;
  color: #777;
}

#article section.div {
  border: none;
  padding-bottom: 0;
  padding-top: 40px;
  font-family: "Libre Baskerville", serif !important;
  font-size: 16px;
  text-align: left;
  font-weight: 400;
  line-height: 28px;
  color: #5f5f5f;
}

#article section.div h2.head {
  line-height: 115%;
  /* color: #971716; */
  color: var(--text-color);
  border-bottom: none;
  padding: 1em 0 0 0;
  margin: 35px 0 43px 0px;
  text-align: center;
  font-variant: small-caps;
}

#article section.div h3.head {
  color: #222222;
  margin: 35px 0 28px 0;
  border-bottom: 0px dotted;
  text-align: center;
  padding: 1em 0 0 1ex;
  font-weight: bold;
  text-transform: none;
}

#article section.div h4.head {
  text-align: center;
  color: #999;
  font-size: 15px;
  font-weight: bold;
  padding: 1em 0 1ex 2ex;
}

.toc-area-header a {
  color: inherit;
}

@media screen and (max-width: 1150px) {
  .toc-area .toc-area-content nav > ol.tree {
    columns: 2;
  }
  .controls > a.toc-menu-toggle {
    margin-left: 20px;
  }
  .controls ul > li > a.access_link {
    margin-right: 20px;
  }
}
@media screen and (max-width: 800px) {
  #article {
    padding: 40px 4% 120px;
  }
  .toc-area .toc-area-content aside {
    padding: 20px 20px !important;
  }
}
@media screen and (max-width: 640px) {
  .pb,
  .controls > a.toc-menu-toggle,
  .toc-area-aside {
    display: none !important;
  }
  .toc-area .toc-area-content nav > ol.tree {
    columns: 1;
  }
  .toggle-btn {
    width: 20px;
    right: 15px;
  }
  .controls {
    flex-wrap: wrap;
  }
  .controls ul:first-of-type {
    order: 3;
    flex: 100% 0 0;
    width: 100%;
    justify-content: center;
    padding: 20px 0 10px;
  }
  .controls ul:last-of-type {
    flex: 100% 0 0;
    justify-content: center;
  }
  .controls ul:last-of-type > li > a {
    width: 30px;
    height: 30px;
  }
  .controls > ul:first-of-type > li:nth-child(2) {
    display: none;
  }
  #article section.div {
    font-size: 14px;
    line-height: 24px;
  }
  #article h1 {
    font-size: 20px;
    line-height: 25px;
  }
  #article section.div h2.head,
  #article section.div h3.head {
    font-size: 14px;
    line-height: 24px;
  }
  #article section.div {
    padding-top: 10px;
  }
  #article p.p {
    text-align: left;
  }

  .text-and-images-mode .document-views {
    display: block !important;
  }
  .text-and-images-mode .text-view,
  .text-and-images-mode .mirador-view {
  }
}
* [class*="mirador-window-top-bar"] {
  border-top: none !important;
}
.ariane-collection {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 1100px;
  margin-top: 10px;
  margin-bottom: 10px;

  font-family: "Barlow", sans-serif;
  font-size: 16px;
  & .crumbs {
    padding-bottom: 5px;
  }
}
.ariane {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 80% !important;
  max-width: 1100px !important;

  font-family: "Barlow", sans-serif !important;
  font-size: 16px;

  & > ul {
    display: flex;
    justify-content: center;
    align-items: center;

    & > li:first-child {
      font-variant: small-caps;
      font-weight: bold;
    }
  }
}
.crumbs {
  width: 100%;
}
.crumbs li + li:before {
  width: 100% !important;
  padding: 20px !important;
}

.crumbs li {
  width: 100% !important;
  margin-top: 0;
  margin-bottom: 0;
  margin-left: 20px;
  margin-right: 20px;

  &.is-current {
    display: flex;
    justify-content: center;
    align-items: center;
    & a {
      display: flex;
      justify-content: center;
      width: 100%;
      color: #336;
      border: none;
      &:hover {
        color: #B9192F;
      }
    }
  }
  &:not(.is-current) {
    & a {
      display: flex;
      justify-content: center;
      width: 100% !important;

      color: #4a4a4a;
      border: none;

      &:hover {
        color: #B9192F !important;
      }
    }
  }
}

.navigation-row {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  vertical-align: center;
  margin-bottom: 20px;
}
.navigation-document {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-bottom: 20px;
}
.navigation-document-top {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 100%;
}
.navigation-document-bottom {
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  width: 100%;
}
/* .is-current {
  font-weight: bold;
} */
.several-parent {
  display: flex;
  flex-direction: row;
  justify-content: center;
  & > a:first-child {
    justify-content: right !important;
  }
  & > a:not(:first-child) {
    justify-content: left !important;
    color: #929292 !important;

    &:before {
      content: ' (autres collections : ';
      white-space: pre;
    }

    &:after {
      content: ') ';
      white-space: pre;
    }
  }
}
.left { /* The left side CANNOT GROW, it can ONLY SHRINK (and add an ellipsis at the end). */
  text-align: right;
  width: 50%;
  flex: 0 1 auto;
  overflow: hidden;
  text-overflow: ' [...] ';
  white-space: pre;
}

.right {
/* The right side can grow, but NOT SHRINK. */
  text-align: left;
  width: 50%;
  flex: 1 0 auto;
  overflow-x: hidden;
  white-space: pre;
}
/* .hideAsideToc {
  visibility: hidden;
} */
</style>
