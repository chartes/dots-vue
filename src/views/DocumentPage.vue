<template>
  <div
    class="is-flex is-flex-direction-column"
    :class="viewModeCssClass"
  >
    <!--<CollectionModal
      v-if="isLoading && isModalOpened"
      class="modal-area"
      :is-open="isModalOpened ? isModalOpened : false"
      :is-doc-project-id-included="isDocProjectIdInc"
      :dts-root-collection-identifier="dtsRootCollectionId"
      :root-collection-identifier="rootCollectionId"
      :collection-identifier="selectedCollectionId"
      :collection-config="collConfig"
      :current-item="selectedCollection"
      :toc="flatTOC"
      @change="closeModal"
    />-->
    <div class="navigation-row-top-container">
      <div class="navigation-row-top app-width-margin">
        <div class="ariane-collection-top">
          <ul
            v-if="arianeCollection.length > 0"
            class="breadcrumb-top"
          >
            <li class="first">
              <router-link
                v-if="isDocProjectIdIncluded"
                :to="{ name: 'Home', params: { collId: arianeCollection[0][0].identifier } }"
              >
                <i class="fa fa-home"></i>
              </router-link>
            </li>

            <li
              v-for="(item, index) in arianeCollection.slice(1)"
              :key="index"
              :class="{ active: index === activeBreadcrumb }"
            >
              <template
                v-if="item.length > 1"
              >
                <a
                  :class="selectedCollectionId === selectStoreCollection(item) ? 'active' : ''"
                  href="#"
                  @click.prevent="openObject(selectStoreCollection(item), index)"
                >
                  <i
                    :class="selectStoreCollection(item) === 'Collection'
                      ? 'fa fa-archive'
                      : 'fa fa-file-text'"
                  />
                  <span class="breadcrumb-label">
                    {{ ancestorLabel(selectStoreCollection(item)) }}
                  </span>
                  <!-- bouton toggle réutilisé -->
                  <span
                    class="toggle-btn"
                    @click.stop.prevent="openObject(selectStoreCollection(item), index)"
                  />
                </a>
              </template>
              <template
                v-else
              >
                <a
                  :class="selectedCollectionId === item[0].identifier ? 'active' : ''"
                  href="#"
                  @click.prevent="openObject(item[0], index)"
                >
                  <i
                    :class="item[0].citeType === 'Collection'
                      ? 'fa fa-archive'
                      : 'fa fa-file-text'"
                  />
                  <span class="breadcrumb-label">
                    {{ ancestorLabel(item[0]) }}
                  </span>
                  <!-- bouton toggle réutilisé -->
                  <span
                    class="toggle-btn"
                    @click.stop.prevent="openObject(item[0], index)"
                  />
                </a>
              </template>
            </li>
          </ul>
          <div
            v-if="activeObject"
            class="breadcrumb-panel"
          >
            <div class="tab-header">
              <button
                :class="{ active: activePanel === 'meta' }"
                @click="activePanel = 'meta'"
              >
                Notice
              </button>

              <button
                :class="{ active: activePanel === 'summary' }"
                @click="activePanel = 'summary'"
              >
                Sommaire
              </button>
            </div>

            <div class="tab-content">
              <div
                v-if="activePanel === 'meta'"
              >
                <div v-if="selectedCollectionId.length > 0">
                  <document-metadata
                    :ispopup="false"
                    :metadataprop="selectedCollection"
                    :hasheader="false"
                    class="metadata-area app-width-margin"
                  />
                </div>
              </div>
              <div
                v-if="activePanel === 'summary'"
              >
                <div
                  v-if="selectedCollection.citeType === 'Collection'"
                  class="collection-toc-area app-width-margin"
                  :class="tocCssClass"
                >
                  <div class="menu app-width-margin">
                    <CollectionTOC
                      :is-doc-projectId-included="isDocProjectIdInc"
                      :dts-root-collection-identifier="dtsRootCollectionId"
                      :root-collection-identifier="rootCollectionId"
                      :collection-config="collConfig"
                      :current-collection="selectedCollection"
                      :margin="0"
                      :toc="selectedCollection.children"
                    />
                  </div>
                </div>
                <div
                  v-else
                  class="toc-area app-width-margin is-opened"
                >
                  <div class="toc-area-content toc-content">
                    <aside>
                      <nav>
                        <nav>
                          <TOC
                            v-if="flatTOC.length > 0"
                            :key="arianeDocument"
                            :is-doc-project-id-included="isDocProjectIdInc"
                            :margin="0"
                            :toc="flatTOC.filter(n => n.level > 0)"
                            :maxcitedepth="TOC_DEPTH"
                            :refid="refId"
                            @update-ref-id="getNewRefId"
                          />
                        </nav>
                      </nav>
                    </aside>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="nav-controls-wrapper">
      <nav
        class="navigation-row app-width-margin"
        aria-label="Navigation du document"
      >
        <div class="navigation-document">
          <div class="ariane">
            <div class="ariane-wrapper">
              <!-- LeftTOC button -->
              <button
                type="button"
                class="toc-menu-toggle"
                aria-label="Afficher le sommaire"
                :class="leftTOCDisplayIndicator && flatTOC.filter(item => item.level > 0).length > 0 ? TOCMenuBtnCssClass : 'disabled'"
                @click="toggleTOCMenu"
              >
                <i
                  class="fa fa-list-ul"
                  aria-hidden="true"
                />
              </button>
              <!-- Document breadcrumb -->
              <ul class="crumbs">
                <li
                  v-for="(ancestor, index) in arianeDocument.filter(item => item.editorialLevelIndicator !== 'hash')"
                  :key="index"
                  :class="refId
                    ? ancestor.identifier === refId ? 'is-current' : ''
                    : ancestor.identifier === resourceId ? 'is-current' : ''"
                >

                  <router-link :to="ancestor.router">
                    {{ ancestor.title || ancestor.dublincore?.title || 'fragment courant sans titre' }}
                  </router-link>
                  <span class="keep-previous-centered" />
                </li>
              </ul>
            </div>
            <!-- Previous / Next navigation buttons -->
            <div
              class="navigation-document-top"
              aria-label="Navigation dans le document"
            >
              <router-link
                class="to-previous-fragment"
                :class="previousRefId === '' ? 'disabled' : ''"
                :to="{ name: 'Document', params: { collId: collConfig.identifier, id: resourceId }, query: { refId: previousRefId } }"
                aria-label="Fragment précédent"
              >
                <DirectionArrows
                  :size="40"
                  :radius="4"
                  direction="left"
                />
              </router-link>
              <router-link
                class="to-next-fragment has-tooltip"
                :class="{ disabled: !nextRefId }"
                :to="{ name: 'Document', params: { collId: collConfig.identifier, id: resourceId }, query: { refId: nextRefId } }"
                :aria-disabled="!nextRefId"
                :aria-label="'Vers ' + nextRefTitle"
                :tabindex="nextRefId ? 0 : -1"
              >
                <DirectionArrows
                  :size="40"
                  :radius="4"
                  direction="right"
                  aria-hidden="true"
                />
                <span class="tooltip">Vers {{ nextRefTitle }}</span>
              </router-link>
            </div>
          </div>
        </div>
      </nav>
      <div
        class="controls app-width-margin"
        role="toolbar"
        aria-label="Options d’affichage du document"
      >
        <ul class="controls-list">
          <li v-if="manifestIsAvailable">
            <button
              type="button"
              class="text-btn"
              aria-label="Texte seul"
              @click="changeViewMode('text-mode')"
            >
              <IconLetterT
                :size="40"
                :radius="4"
              />
            </button>
          </li>

          <li v-if="manifestIsAvailable">
            <button
              type="button"
              class="images-btn"
              aria-label="Images seules"
              @click="changeViewMode('images-mode')"
            >
              <IconImage
                :size="40"
                :radius="4"
              />
            </button>
          </li>

          <li v-if="hasNotes">
            <button
              type="button"
              class="notes-btn"
              :class="{ 'is-opened': isNotesOpened }"
              aria-pressed="isNotesOpened"
              aria-label="Afficher les notes"
              @click="toggleNotes"
            >
              <i
                class="fa-regular fa-comment-dots"
                aria-hidden="true"
              />
            </button>
          </li>
        </ul>
      </div>
    </div>

    <div
      class="document-area is-flex app-width-margin"
      :class="tocMenuCssClass"
    >
      <div class="toc-area-aside toc-content">
        <aside id="aside">
          <nav>
            <nav>
              <span v-if="arianeDocument.length && arianeDocument[0].descendant">{{ arianeDocument[0].descendant }}{{ countEditorialTypes.length > 0 ? ' item de type ' + countEditorialTypes[0] : '' }}</span>
              <TOC
                :key="arianeDocument"
                :is-doc-project-id-included="isDocProjectIdInc"
                :margin="0"
                :toc="flatTOC.filter(n => n.level > 0)"
                :maxcitedepth="TOC_DEPTH"
                :refid="refId"
                @update-ref-id="getNewRefId"
              />
            </nav>
          </nav>
        </aside>
      </div>
      <div
        v-if="isLoading"
        class="document-views is-flex"
      >
        <div
          v-if="!refId || refId && refId.length === 0"
          id="text-view"
          class="text-view"
          :class="isNotesOpened ? 'notes-opened' : ''"
        >
          <document-source
            :id="resourceId"
            :key="resourceId + currentLevelIndicator + manifest"
            :is-doc-project-id-included="isDocProjectIdInc"
            :media-type-endpoint="collConfig.mediaTypeEndpoint"
            :project-identifier="docProjectId"
            :iiif-manifest="manifest"
            :level="currentLevel"
            :editorial-level-indicator="currentLevelIndicator"
            :editoriallevel="editorialLevel"
            :documenttype="documentType"
            :bottomtoc="bottomTOC"
            :maxcitedepth="TOC_DEPTH"
            @has-notes="hasNotes = $event"
          />
        </div>
        <div
          v-else
          id="text-view"
          class="text-view"
          :class="isNotesOpened ? 'notes-opened' : ''"
        >
          <document-source
            :id="resourceId + '&ref=' + refId"
            :key="refId + editorialLevel + manifest"
            :is-doc-project-id-included="isDocProjectIdInc"
            :media-type-endpoint="collConfig.mediaTypeEndpoint"
            :project-identifier="docProjectId"
            :iiif-manifest="manifest"
            :level="currentLevel"
            :editorial-level-indicator="currentLevelIndicator"
            :editoriallevel="editorialLevel"
            :documenttype="documentType"
            :bottomtoc="bottomTOC"
            :maxcitedepth="TOC_DEPTH"
            @has-notes="hasNotes = $event"
          />
        </div>
        <div
          v-if="isLoading"
          id="mirador-view"
          class="mirador-view"
          :style="miradorViewCssStyle"
        >
          <div
            id="vue-mirador-container"
            ref="miradorContainer"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DocumentSource from '@/components/Document.vue'
import DocumentMetadata from '@/components/DocumentMetadata.vue'
import TOC from '@/components/TOC.vue'
/* import CollectionModal from '@/components/CollectionModal.vue' */
import CollectionTOC from '@/components/CollectionTOC.vue'
import DirectionArrows from '@/assets/images/DirectionArrows.vue'
import IconLetterT from '@/assets/images/IconLetterT.vue'
import IconImage from '@/assets/images/IconImage.vue'
import _ from 'lodash'

import { useStore } from 'vuex'
import useMirador from '@/composables/use-mirador'
import { getMetadataFromApi, getParentFromApi, getTOCFromApi, getAncestors } from '@/api/document'

import {
  computed,
  onMounted,
  onUnmounted,
  watch,
  provide,
  ref,
  inject, nextTick
} from 'vue'

import { useRoute } from 'vue-router'
import { router } from '@/router'
import fetchMetadata from '@/composables/get-metadata.js'
import { getSimpleObject } from '@/composables/utils.js'


function findById (array, id) {
  for (const item of array) {
    if (item.identifier === id) return item
    if (item.children?.length) {
      const innerResult = findById(item.children, id)
      if (innerResult) return innerResult
    }
  }
}

export default {
  name: 'DocumentPage',
  components: {
    CollectionTOC,
    DocumentMetadata,
    DocumentSource,
    TOC,
    DirectionArrows,
    IconLetterT,
    IconImage
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
    applicationConfig: {
      type: Object,
      required: false
    },
    collectionConfig: {
      type: Object,
      required: true
    }
  },
  async setup (props) {
    const topTOCDisplayIndicator = ref(false)
    const leftTOCDisplayIndicator = ref(false)
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
    const activeBreadcrumb = ref(null)
    const activeObject = ref(null)       // collection / resource
    const activePanel = ref(null)        // 'meta' | 'summary'

    // Mirador view sticky behavior
    const miradorViewBoundingTop = ref(0)
    const miradorViewCssStyle = computed(() => {
      return { marginTop: miradorViewBoundingTop.value + 'px' }
    })

    const updateMiradorTopPosition = function () {
      const textView = document.getElementById('text-view')
      console.log('Document.vue no anchor update mirador position')
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

    const metadata = ref(initial_metadata)
    const route = useRoute()
    const store = useStore()

    const resourceId = ref()
    const refId = ref(false)
    const hash = ref(false)
    const currentItem = ref({})
    const documentType = ref()
    const collection = ref()

    const isLoading = ref(false)
    const TOC_DEPTH = ref(props.collectionConfig?.tableOfContentsSettings?.tableOfContentDepth)
    console.log('DocumentPage setup TOC_DEPTH : ', TOC_DEPTH.value)
    const editorialTypesIsValid = ref(false)
    const countEditorialTypes = ref([])
    const currentLevelIndicator = ref(false)
    const currentLevel = ref(1)
    const editorialLevel = ref(props.collectionConfig?.tableOfContentsSettings?.editByLevel)
    const flatTOC = ref([])
    const topTOC = ref([])
    const bottomTOC = ref([])

    const arianeCollection = ref([])
    const arianeDocument = ref([])
    const previousRefId = ref('')
    const previousRefTitle = ref('')
    const nextRefId = ref('')
    const nextRefTitle = ref('')
    const firstRef = ref(false)
    const lastRef = ref(false)

    const selectedCollectionId = ref('')
    const selectedCollection = ref({})
    const isModalOpened = ref(false)

    const isNotesOpened = ref(true)
    const hasNotes = ref(false)

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
        const parentResponse = await getParentFromApi(response.identifier)
        // console.log("parentResponse", parentResponse["member"][0])

        documentType.value = 'Resource'
        currentItem.value = response
        currentItem.value.parent = parentResponse.member.length > 1 ? parentResponse.member.map(p => p['@id']) : parentResponse.member[0]['@id']
        currentItem.value.level = 0

        // Fetch editorial level document parts if any (based on citeType)
        let editorialTypes = []
        if (collConfig.value.length > 0 && collConfig.value[0].tableOfContentsSettings.editByCiteType.length > 0) {
          editorialTypes = collConfig.value[0].tableOfContentsSettings.editByCiteType
        }
        currentItem.value.editorialLevelIndicator = editorialTypes.includes(currentItem.value.citeType) ? 'toEdit' : 'renderToc'
        store.commit('setCurrentItem', currentItem.value)
        document.title = currentItem.value.title
        console.log('init type : ', documentType.value)
        console.log('set currentItem.value : ', currentItem.value)
        isModalOpened.value = false

        docProjectId.value = isDocProjectIdInc.value ? route.params.collId + '/' : ''
        console.log('docProjectId.value ', docProjectId.value)

        console.log('Objectassign collConfig.value : ', collConfig.value)
        topTOCDisplayIndicator.value = collConfig.value.tableOfContentsSettings.displayTopToc !== false
        leftTOCDisplayIndicator.value = collConfig.value.tableOfContentsSettings.displayLeftToc !== false

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
      Object.assign(metadata.value, metadataResponse)
    }

    // Setting up the Tables Of Content Top and Left
    const getTOC = async (reason) => {
      console.log('DocumentPage getTOC reason', reason)
      console.log('DocumentPage getTOC resourceId.value', resourceId.value)
      console.log('DocumentPage getTOC refId.value', refId.value)

      const response = await getTOCFromApi(resourceId.value, 'Resource')
      console.log('DocumentPage getTOC initial TOC response', response)
      if (!response.member) {
        response.member = []
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
        if (node.parent && node.parent.length > 0 && collConfig.value.excludeCollectionIds && collConfig.value.excludeCollectionIds.length > 0) {
          if (Array.isArray(node.parent)) {
            node.parent = node.parent.filter(p => !collConfig.value.excludeCollectionIds.includes(p))
            if (node.parent.length === 1) {
              node.parent = node.parent[0]
            }
          } else {
            if (collConfig.value.excludeCollectionIds.includes(node.parent)) {
              node.parent = ''
            }
          }
        }
        if (node.parent && node.parent.length > 0) {
          if (Array.isArray(node.parent)) {
            // multiple parents
            for (let i = 0; i < node.parent.length; i += 1) {
              console.log('appendParentInTOC / node.parent / p', node.parent, node.parent[i])
              const appendParentInTOC = await getMetadataFromApi(node.parent[i])
              console.log('appendParentInTOC', appendParentInTOC)
              const parentResponse = await getParentFromApi(appendParentInTOC.identifier)
              // Compute parent level from current node
              parentResponse.level = node.level - 1
              // Append this level to the parent instance to be added in the TOC
              appendParentInTOC.level = parentResponse.level
              appendParentInTOC.editorialLevelIndicator = 'renderToc'
              // Complete the list of children of the parent
              if (collConfig.value.excludeCollectionIds && collConfig.value.excludeCollectionIds.length > 0) {
                appendParentInTOC.member = appendParentInTOC.member.filter(m => !collConfig.value.excludeCollectionIds.includes(m['@id'] || m.identifier))
                appendParentInTOC.totalChildren = appendParentInTOC.member.filter(m => !collConfig.value.excludeCollectionIds.includes(m['@id'] || m.identifier)).length
              }

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

            const parentResponse = await getParentFromApi(appendParentInTOC.identifier)
            // Compute parent level from current node
            parentResponse.level = node.level - 1
            // Append this level to the parent instance to be added in the TOC
            appendParentInTOC.level = parentResponse.level
            appendParentInTOC.editorialLevelIndicator = 'renderToc'
            // Complete the list of children of the parent
            if (collConfig.value.excludeCollectionIds && collConfig.value.excludeCollectionIds.length > 0) {
              appendParentInTOC.member = appendParentInTOC.member.filter(m => !collConfig.value.excludeCollectionIds.includes(m['@id'] || m.identifier))
              appendParentInTOC.totalChildren = appendParentInTOC.member.filter(m => !collConfig.value.excludeCollectionIds.includes(m['@id'] || m.identifier)).length
            }
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
          if (node.level < 0) {
            node.url = `${window.location.origin}${import.meta.env.VITE_APP_APP_ROOT_URL.length > 1 ? import.meta.env.VITE_APP_APP_ROOT_URL + '/' : import.meta.env.VITE_APP_APP_ROOT_URL}${route.path.slice(1, route.path.length)}/${node.identifier}`
            node.router = node.identifier
            console.log('addFlag on node.level editorialTypes.includes(item.citeType) : < 0', node)
          } else if (node.level === 0) {
            node.url = `${window.location.origin}${import.meta.env.VITE_APP_APP_ROOT_URL.length > 1 ? import.meta.env.VITE_APP_APP_ROOT_URL + '/' : import.meta.env.VITE_APP_APP_ROOT_URL}${route.path.slice(1, route.path.length)}`
            node.router = node.identifier
            console.log('addFlag on node.level editorialTypes.includes(item.citeType) : = 0', node)
          } else {
            node.url = `${window.location.origin}${import.meta.env.VITE_APP_APP_ROOT_URL.length > 1 ? import.meta.env.VITE_APP_APP_ROOT_URL + '/' : import.meta.env.VITE_APP_APP_ROOT_URL}${route.path.slice(1, route.path.length)}?refId=${node.identifier}`
            node.router = `${route.params.id}?refId=${node.identifier}`
            node.router_params = route.params.id
            node.router_refid = node.identifier
            console.log('addFlag on node.level editorialTypes.includes(item.citeType) : > 0 ', node)
          }
        })
      } else {
        processFlatTOC.filter(item => item.level === editorialLevel.value).forEach((node) => {
          node.editorialLevelIndicator = 'toEdit'
          if (node.level < 0) {
            node.url = `${window.location.origin}${import.meta.env.VITE_APP_APP_ROOT_URL.length > 1 ? import.meta.env.VITE_APP_APP_ROOT_URL + '/' : import.meta.env.VITE_APP_APP_ROOT_URL}${route.path.slice(1, route.path.length)}/${node.identifier}`
            node.router = node.identifier
          } else if (node.level === 0) {
            node.url = `${window.location.origin}${import.meta.env.VITE_APP_APP_ROOT_URL.length > 1 ? import.meta.env.VITE_APP_APP_ROOT_URL + '/' : import.meta.env.VITE_APP_APP_ROOT_URL}${route.path.slice(1, route.path.length)}`
            node.router = node.identifier
          } else {
            node.url = `${window.location.origin}${import.meta.env.VITE_APP_APP_ROOT_URL.length > 1 ? import.meta.env.VITE_APP_APP_ROOT_URL + '/' : import.meta.env.VITE_APP_APP_ROOT_URL}${route.path.slice(1, route.path.length)}?refId=${node.identifier}`
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
          node.url = `${window.location.origin}${import.meta.env.VITE_APP_APP_ROOT_URL.length > 1 ? import.meta.env.VITE_APP_APP_ROOT_URL + '/' : import.meta.env.VITE_APP_APP_ROOT_URL}${route.path.slice(1, route.path.length)}?refId=${node.ancestor_editorialLevel}#${node.identifier}`
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
      processFlatTOC.filter(item => !item?.url).forEach(node => {
        node.editorialLevelIndicator = 'renderToc'
        if (node.level < 0) {
          const routePathTest = `/${node.identifier.toLowerCase()}/`
          if (isDocProjectIdInc.value && !route.path.toLowerCase().includes(routePathTest)) {
           node.url = 'Subcollection URL is undefined ( VITE_APP_DOCUMENT_ROUTE_INCLUDE_PROJECT_ID is true )'
          } else {
           node.url = `${window.location.origin}${import.meta.env.VITE_APP_APP_ROOT_URL.length > 1 ? import.meta.env.VITE_APP_APP_ROOT_URL + '/' : import.meta.env.VITE_APP_APP_ROOT_URL}${node.identifier}`
          }
          node.router = node.identifier
          node.router_params = node.identifier
          console.log('addFlag on node.level <0 : ', node)
        } else if (node.level === 0) {
          node.url = `${window.location.origin}${import.meta.env.VITE_APP_APP_ROOT_URL.length > 1 ? import.meta.env.VITE_APP_APP_ROOT_URL + '/' : import.meta.env.VITE_APP_APP_ROOT_URL}${route.path.slice(1, route.path.length)}`
          node.router = node.identifier
          node.router_params = node.identifier
          console.log('addFlag on node.level === 0 : ', node)
        } else {
          node.url = `${window.location.origin}${import.meta.env.VITE_APP_APP_ROOT_URL.length > 1 ? import.meta.env.VITE_APP_APP_ROOT_URL + '/' : import.meta.env.VITE_APP_APP_ROOT_URL}${route.path.slice(1, route.path.length)}?refId=${node.identifier}`
          node.router = `${route.params.id}?refId=${node.identifier}`
          node.router_params = route.params.id
          node.router_refid = node.identifier
          if (node.identifier === 'a1') {
            console.log('addFlag on node.level > 0 node.url ', node.url, '\n', window.location.origin, '\n', import.meta.env.VITE_APP_APP_ROOT_URL, '\n', route.path)
          }
          console.log('addFlag on node.level > 0 : ', node)
        }
      })

      if (editorialTypesIsValid.value) {
        topTOC.value = processFlatTOC
        // console.log('flatTOC.value updated after editorialType : ', flatTOC.value)
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

        console.log('bottomTOC cas 2 search RefId item in TOC and return children : ', findById(topTOC.value, refId.value).children)
        // select flatTOC elements between the current matching refId and the last element belonging to the same parent
        const followingElementInTreeLimb = flatTOC.value.findIndex(i => i.identifier === refId.value) + 1
        const allFollowingElementsInTOC = flatTOC.value.slice(followingElementInTreeLimb, flatTOC.value.length)
        const lastElementInTreeLimb = allFollowingElementsInTOC.findIndex(i => i.parent === flatTOC.value.find(i => i.identifier === refId.value).parent) === -1
          ? flatTOC.value.length
          : allFollowingElementsInTOC.findIndex(i => i.parent === flatTOC.value.find(i => i.identifier === refId.value).parent) + 1
        const currentMatchingElementIndex = flatTOC.value.findIndex(i => i.identifier === refId.value)
        // assign portion of topTOC to the bottomTOC and unlink the variables
        bottomTOC.value = JSON.parse(JSON.stringify(flatTOC.value.slice(followingElementInTreeLimb, lastElementInTreeLimb + currentMatchingElementIndex)))
        console.log('bottomTOC cas 2 :', bottomTOC.value, topTOC.value)
      } else {
        console.log('there is NO refId , update currentLevelIndicator.value', currentLevelIndicator.value)
        currentLevelIndicator.value = flatTOC.value.find(i => i.identifier === resourceId.value).editorialLevelIndicator
        console.log('there is NO refId , updated currentLevelIndicator.value', currentLevelIndicator.value)
        // assign portion of topTOC to the bottomTOC and unlink the variables
        bottomTOC.value = JSON.parse(JSON.stringify(topTOC.value.filter(i => i.level > 0)))
        console.log('bottomTOC cas 3 :', bottomTOC.value, topTOC.value)
      }
      await setBreadcrumbs()
      console.log('getTOC result topTOC : ', topTOC.value)
      console.log('getTOC result bottomTOC : ', bottomTOC.value)
      store.commit('setTOC', flatTOC.value)
      isLoading.value = true
    }

    const setBreadcrumbs = async () => {
      const ancestors = await getAncestors(currentItem.value, collConfig.value.excludeCollectionIds || [])

      console.log('setBreadcrumbs start')
      const currentItemId = hash.value ? hash.value : refId.value ? refId.value : resourceId.value
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
      arianeCollection.value = ancestors.reverse().map((elem) => {
        return elem.filter((e) => e.citeType === 'Collection' || e.citeType === 'Resource')
      }).filter((e) => e.length > 0)
      /*if (arianeCollection.value.length <= 2) {q
        activeBreadcrumb.value = 0
        console.log('arianeCollection test : ', arianeCollection.value.slice(-1), activeBreadcrumb.value)
        openObject(arianeCollection.value.slice(-1)[0][0], 0)
      }*/

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
      getNewRefId
    }
    const closeModal = () => {
      isModalOpened.value = false
      selectedCollectionId.value = ''
      Object.assign(selectedCollection.value, {})
      store.commit('setCollectionModalId', false)
      console.log(' Collection modal was closed : ', selectedCollectionId.value, selectedCollection.value)
    }

    const itemSorted = (item) => {
      return [...item].sort(
        (a, b) =>
          store.state.collectionId.indexOf(b.identifier) -
          store.state.collectionId.indexOf(a.identifier)
      )
    }

    const ancestorLabel = (ancestor) => {
      if (
        ancestor.citeType === 'Resource' &&
        ancestor?.dublincore?.creator
      ) {
        return `${ancestor.dublincore.creator}, ${ancestor.title}`
      }
      return ancestor.title
    }

    function selectStoreCollection(levelListItems) {
      if (store.state.collectionId && levelListItems.every(coll => coll.citeType === 'Collection')) {
        console.log('selectStoreCollection multiple items returning context coll', levelListItems.find(coll => coll.identifier === store.state.collectionId))
        return levelListItems.find(coll => coll.identifier === store.state.collectionId)
      } else {
        console.log('selectStoreCollection returning unique item', levelListItems)
        return levelListItems
      }
    }

    function openObject(breadcrumbItem, index) {
      isModalOpened.value = true

      // Cas 1 : même breadcrumb → toggle off
      // console.log('arianeCollection test openObject ', activeBreadcrumb.value, index, breadcrumbItem.identifier)
      if (
        activeBreadcrumb.value === index &&
        selectedCollectionId.value === breadcrumbItem.identifier
      ) {
        activeBreadcrumb.value = null
        activeObject.value = null
        activePanel.value = null

        selectedCollectionId.value = ''
        selectedCollection.value = {}
        return
      }

      // Cas 2 : nouvel objet
      activeBreadcrumb.value = index
      activeObject.value = breadcrumbItem
      activePanel.value = 'meta'

      selectedCollectionId.value = breadcrumbItem.identifier

      const tocItem = flatTOC.value.find(
        item => item.identifier === selectedCollectionId.value
      )

      if (!tocItem) {
        selectedCollection.value = {}
        return
      }

      if (tocItem.citeType === 'Collection') {
        // 🔹 Collection pure
        selectedCollection.value = tocItem
      } else {
        // 🔹 Resource = merge metadata + toc
        selectedCollection.value = _.merge(
          {},
          metadata.value,
          tocItem
        )
      }
    }

    const getNewRefId = function () {
      console.log('getNewRefId check if refId / refId.value', refId, refId.value)
      firstRef.value = false
      lastRef.value = false
      layout.changeViewMode('init')
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
      } else if ( flatTOC.value.filter(item => { return ((item.editorialLevelIndicator === 'renderToc' && item.level >= 0) || item.editorialLevelIndicator === 'toEdit')}).length > 1 ) {
        previousRefId.value = ''
        previousRefTitle.value = ''
        nextRefId.value = flatTOC.value.filter(item => { return ((item.editorialLevelIndicator === 'renderToc' && item.level >= 0) || item.editorialLevelIndicator === 'toEdit')})[1].identifier
        nextRefTitle.value = flatTOC.value.filter(item => { return ((item.editorialLevelIndicator === 'renderToc' && item.level >= 0) || item.editorialLevelIndicator === 'toEdit')})[1].title
      } else {
        previousRefId.value = ''
        previousRefTitle.value = ''
        nextRefId.value = ''
        nextRefTitle.value = ''
      }
      scrollCurrentTocItemIntoView()
    }

    const setMirador = function () {
      fetch(metadata.value.iiifManifestUrl.url, {
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
    const toggleNotes = () => {
      isNotesOpened.value = !isNotesOpened.value
    }

    watch(
      () => metadata.value.iiifManifestUrl,
      () => {
        if (metadata.value.iiifManifestUrl) {
          console.log('metadata.iiifManifestUrl is now available !!! : ', metadata.value.iiifManifestUrl, manifestIsAvailable.value)
          layout.imageIsAvailable.value = true
          setMirador()
        } else {
          layout.imageIsAvailable.value = false
        }
      }, { immediate: true }
    )

    watch(props, async (newProps) => {
      collConfig.value = newProps.collectionConfig
      TOC_DEPTH.value = newProps.collectionConfig.tableOfContentsSettings.tableOfContentDepth
      editorialLevel.value = newProps.collectionConfig.tableOfContentsSettings.editByLevel
      console.log('DocumentPage watch newProps.collectionConfig / collConfig.value : ', collConfig.value)
    }, { deep: true, immediate: true })

    watch(
      router.currentRoute, async (newRoute, oldRoute) => {
        isLoading.value = false
        console.log('DocumentPage watch route.params : ', route.params)
        console.log('DocumentPage watch route.query : ', route.query)
        console.log('DocumentPage watch route.hash : ', route.hash)
        console.log('DocumentPage watch router oldRoute, newRoute : ', oldRoute, newRoute)

        if (newRoute && oldRoute && newRoute.params.id !== oldRoute.params.id) {
          await getCurrentItem('watch getCurrentItem : route : ', newRoute)
          console.log('DocumentPage watch route change, resource DID change :', refId.value)
          await getTOC('watch query')
          await getMetadata()
          getNewRefId()
          isLoading.value = true
          if (newRoute.hash && newRoute.hash.length > 0) {
            hash.value = newRoute.hash
            console.log('DocumentPage watch scrollTo hash : ', hash.value)
            scrollTo()
          }
        } else if (newRoute && oldRoute && newRoute.params.id === oldRoute.params.id) {
          console.log('DocumentPage watch route change but resource DID NOT change ', oldRoute, newRoute)
          // await getCurrentItem("watch getCurrentItem : route : ", newRoute)
          // await getTOC("watch query")
          if (newRoute.query.refId === oldRoute.query.refId) {
            console.log('DocumentPage watch route change but resource/refId DID NOT change ', oldRoute, newRoute)
            hash.value = newRoute.hash && newRoute.hash.length > 0 ? newRoute.hash.replace('#', '') : false

            if (newRoute.hash && newRoute.hash.length > 0) {
              console.log('DocumentPage watch scrollTo hash : ', hash.value)
              scrollTo()
            } else {
              // Scroll to top if no anchor
              console.log('DocumentPage watch no anchor scrollTo Page TOP')
              window.scrollTo({ top: 0, behavior: 'instant' })
            }
            isLoading.value = true
          } else {
            hash.value = newRoute.hash && newRoute.hash.length > 0 ? newRoute.hash.replace('#', '') : false
            console.log('DocumentPage watch route change refId changed oldRoute, newRoute, hash.value ', oldRoute, newRoute, hash.value)
            refId.value = newRoute.query.refId
            // await getCurrentItem('watch getCurrentItem : route : ', newRoute)
            // await getTOC("watch query")
            currentLevel.value = refId.value
              ? flatTOC.value.find(i => i.identifier === refId.value).level
              : flatTOC.value.find(i => i.identifier === resourceId.value).level
            await setBreadcrumbs()
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
          console.log('DocumentPage watch NO newRoute : oldRoute, newRoute = route ', oldRoute, route)
          await getTOC('watch query')
          await getMetadata()
          getNewRefId()
          isLoading.value = true
        } else {
          console.log('DocumentPage watch TEST : oldRoute, newRoute ', oldRoute, newRoute)
        }
      }, { deep: true, immediate: true }
    )
    watch(
      () => store.state.collectionModalCollectionId, (newVal, oldVal) => {
        if (newVal) {
          openObject(newVal)
        }
        console.log('CollectionModal watch state isModalOpen.value : ')
      }, { immediate: true }
    )

    function scrollTo () {
      // If the selected item is an anchor, capture and scroll to that anchor
      console.log('DocumentPage.vue scrollTo on resolve hash : ', hash.value)
      if (hash.value.length > 0) {
        // bump the hash to ensure change detection
        const bumpPath = `${import.meta.env.VITE_APP_APP_ROOT_URL}`.length <= 1 ? `${router.currentRoute.value.fullPath.split('#')[0]}#${hash.value}` : `${import.meta.env.VITE_APP_APP_ROOT_URL}${router.currentRoute.value.fullPath.split('#')[0]}#${hash.value}`
        history.replaceState(history.state, '', bumpPath)

        // target element and scroll
        const el = document.getElementById(hash.value)
        console.log('DocumentPage.vue scrollTo el : ', el)
        if (el) {
          const yOffset = -70
          const y = el.getBoundingClientRect().top + window.scrollY + yOffset
          console.log('DocumentPage.vue scrollTo y : ', y)
          window.scrollTo({ top: y, behavior: 'smooth' })
          // el.scrollIntoView({ behavior: 'smooth' })
        }
      } else {
        // Scroll to top if no anchor
        window.scrollTo({ top: 0, behavior: 'instant' })
      }
    }

    const scrollCurrentTocItemIntoView = () => {
      nextTick(() => {
        if (!layout.isTOCMenuOpened.value) return

        const htmlTOC = document.querySelector('.toc-aside-is-opened > div.toc-area-aside.toc-content > aside > nav > nav')
        const currentLink = htmlTOC.querySelector('a.is-current')
        if (currentLink && htmlTOC) {
          const containerRect = htmlTOC.getBoundingClientRect()
          const linkRect = currentLink.getBoundingClientRect()
          htmlTOC.scrollTo({
            top:
              htmlTOC.scrollTop +
              (linkRect.top - containerRect.top) -
              htmlTOC.clientHeight / 2,
            behavior: 'smooth'
          })
        }
      })
    }

    onMounted(() => {
      const appView = document.getElementById('app')
      appView.addEventListener('scroll', updateMiradorTopPosition)
      window.addEventListener('scroll', updateMiradorTopPosition)
      layout.isTOCMenuOpened.value = false
      layout.changeViewMode('init')
    })

    onUnmounted(() => {
      const appView = document.getElementById('app')
      layout.changeViewMode('init')
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
      leftTOCDisplayIndicator,
      tocCssClass: layout.tocCssClass,
      toggleTOCContent: layout.toggleTOCContent,
      tocMenuCssClass: layout.tocMenuCssClass,
      toggleTOCMenu: layout.toggleTOCMenu,
      TOCMenuBtnCssClass: layout.TOCMenuBtnCssClass,
      changeViewMode: layout.changeViewMode,
      viewModeCssClass: layout.viewModeCssClass,
      miradorViewCssStyle,
      miradorContainer,
      activeBreadcrumb,
      activeObject,
      activePanel,
      itemSorted,
      ancestorLabel,
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
      scrollCurrentTocItemIntoView,
      isModalOpened,
      closeModal,
      isNotesOpened,
      toggleNotes,
      hasNotes,
      selectStoreCollection,
      openObject,
      selectedCollectionId,
      selectedCollection,
      currentItem,
      setText
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
  columns: 4;
  gap: 40px;
}
.toc-content > aside > nav > nav > ol.tree > li {
  text-transform: none;
  padding: 0;
}
.toc-content > aside > nav > nav > ol.tree > li.more > a {
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

.controls {
  display: flex;
  justify-content: right;
  width: 100%;

  z-index: 100;
  pointer-events: none;
}
.controls-list {
  display: flex;
  flex-direction: column;

  margin: 0;
  padding: 0;
  list-style: none;

  pointer-events: auto;
}
.controls button {
  /* remove default button behavior */
  appearance: none;
  -webkit-appearance: none;

  background: white;
  border: none;

  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;

  cursor: pointer;
}
.controls-list button {
  width: 40px;
  height: 40px;

  display: flex;
  align-items: center;
  justify-content: center;
}
.controls .notes-btn {
  color: #C3C3C3;
  border: 1px solid #C3C3C3;
  border-radius: 4px;
  font-size: 20px;

  &.is-opened {
    color: var(--text-color);
    border-color: var(--text-color);
  }
}
.controls button:focus-visible {
  outline: 2px solid #B9192F;
  outline-offset: 2px;
}

/* former pdf & xml button to adapt : where ?
.controls a.pdf-btn {
  background: url(../assets/images/b_PDF.svg) center / cover no-repeat;
}
.controls a.xml-btn {
  background: url(../assets/images/b_XML.svg) center / cover no-repeat;
}*/
.document-area {
  width: 100%;
}
.document-area #aside,
.toc-area #aside {
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
  min-height: 70vh;
}
.toc-area-aside {
  display: none;
}
.toc-aside-is-opened #aside {
  width: 300px;
  position: relative;
  margin: 0;
  padding: 0;
}
.toc-aside-is-opened .toc-area-aside {
  display: flex;
  width: 230px;
  position: relative;
    & > aside > nav {
      position: sticky;
      top: 80px;
      height: calc(100vh - 250px);
      & > nav {
        height: 100%;
        overflow-y: auto;
      }
  }
}
.toc-aside-is-opened .document-views {
  width: calc(100% - 220px);
}
.mirador-view {
  position: relative;
  min-height: 80vh;
  max-height: 100vh;
  max-width: calc(100vw - 20px);
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
  max-width: calc(100vw - 20px);
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
  margin: 35px 0 43px 0;
  text-align: center;
  font-variant: small-caps;
}

#article section.div h3.head {
  color: #222222;
  margin: 35px 0 28px 0;
  border-bottom: 0 dotted;
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
  justify-content: space-between;
  align-items: center;
  width: 100% !important;
  max-width: 1100px !important;

  font-family: "Barlow", sans-serif !important;
  font-size: 16px;

  & > ul {
    display: flex;
    justify-content: left;
    align-items: center;

    & > li:first-child {
      font-weight: bold;
    }
  }
  & > .ariane-wrapper {
    display: flex;
    flex-direction: row;
    width: 100%;

    & > button.toc-menu-toggle {
      /* remove default button behavior */
      appearance: none;
      -webkit-appearance: none;
      background-color: white;
      cursor: pointer;

      &:hover,
      &:active {
        background-color: white;
      }

      &:focus-visible {
        outline: 2px solid #B9192F;
        outline-offset: 2px;
      }
      /* custom style */
      width: 40px;
      min-width: 40px;
      height: 40px;
      margin-right: 20px;
      text-align: center;
      align-content: center;
      color: var(--text-color);
      border: var(--text-color) 1px solid;
      border-radius: 4px;

      &.is-opened {
        color: white;
        background-color: var(--text-color);
        border-color: var(--text-color);
      }
      &.disabled {
        pointer-events: none;
        opacity: 0.2;
        color: #aeaeae;
        border-color: #aeaeae;
      }
    }
  }
}

.crumbs {
  display: flex;
  flex-direction: row;
  margin-left: 0;
}
.crumbs li + li:before {
  width: 100% !important;
  padding: 20px !important;
}

.crumbs li {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-top: 0;
  margin-bottom: 0;
  margin-right: 0;
  padding-right: 20px;

  &:last-child:after {
    display: none;
  }

  &:not(:last-child):after {
    content: ' > ';
    display: inline-block;
    color: var(--text-color);
    padding-left: .75rem;
  }
  &:not(:last-child) {
    & a {
      text-align: left;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 200px;
    }
  }

  &.hide-resource {
    display: none;
  }

  &.is-current {
    display: flex;
    justify-content: center;
    align-items: center;

    & a {
      width: 100%;
      color: var(--text-color);
      font-weight: bold;
      border: none;
      &:hover {
        color: #B9192F;
      }
    }
  }
  &:not(.is-current) {
    & a {
      width: 100% !important;

      color: #4a4a4a;
      border: none;

      &:before {
        margin-left: 10px !important;
        margin-right: 10px !important;
      }

      &:hover {
        color: #B9192F !important;
      }
    }
  }
}
.nav-controls-wrapper {
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  z-index: 10;
  pointer-events: none;
}

.navigation-row {
  display: flex;
  flex-direction: column;
  z-index: 10;
  background: #fff;
  justify-content: center;
  align-items: center;
  width: 100%;
  vertical-align: center;
  margin-bottom: 10px;
  pointer-events: auto;
}
.navigation-document {
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  width: 100%;
  padding-top: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #5f004d !important;
}
.navigation-document-top {
  display: flex;
  flex-direction: row;
  justify-content: right;
  height: 100%;
}
.navigation-document-top a span {
  line-height: 1.25;
}

.navigation-document-bottom {
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  width: 100%;
}

.several-parent {
  display: flex;
  flex-direction: row;
  justify-content: center;
  & > a:first-child {
    max-width: fit-content;
    /*justify-content: right !important;*/
  }
  & > a:not(:first-child) {
    max-width: fit-content;
    /*justify-content: left !important;*/
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

.hideLeftToc {
  visibility: hidden;
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

  .l-n {
    margin-left: -2.2rem;
  }
  .ariane {
    flex-direction: column !important;
    gap: .5rem;
  }
  .ariane-wrapper {
    justify-content: space-between;
  }
  .crumbs {
    flex-direction: column !important;
    width: 100%;
    margin-left: 0;
    & > li {
      justify-content: space-between;
      width: 100%;
      text-align: center;
      margin-bottom: 10px;
      padding: 0;

      &:after {
        display: none !important;
      }

      & > a {
        max-width: none !important;
        text-align: center !important;
        text-wrap: wrap !important;
      }

      &:first-child {
        flex-direction: row;
        padding-right: 0;
        & > button.toc-menu-toggle {
          flex: 1;
          margin-right: auto;
        }
        & > a {
          max-width: none;
          margin-right: 0;
          text-align: center;
          white-space: normal;
        }
        & > .keep-previous-centered {
          flex: 1;
        }
      }
    }
  }
}
@media screen and (max-width: 640px) {

  #article {
    padding: 40px 6% 120px;
  }
  .several-parent {
    flex-direction: column;
    align-items: center;
  }
  .toc-aside-is-opened .document-views {
    width: 100%;
  }
  .document-views {
    max-width: 100%;
    position: relative;
  }

  .l-n {
    margin-left: -1.5rem;
  }

  small {
    font-size: 9px;
  }

  .pb,
  .controls > a.toc-menu-toggle,
  .toc-area-aside {
    display: none !important;
  }
  .toc-area .toc-area-content nav > ol.tree {
    columns: 1;
  }
  .ariane-wrapper {
    justify-content: space-between;
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
  .toc-area-header {
    & > a:first-child {
      margin-left: 0;
      margin-right: 25px;
    }
  }
  .ariane {
    flex-direction: column !important;
    gap: .5rem;
  }
  button.toc-menu-toggle {
    flex: 1;
    margin-right: auto !important;
  }
  .crumbs {
    flex-direction: column !important;
    width: 100%;
    margin-left: 0;
    margin-right: 40px;
    & > li {
      justify-content: space-between;
      width: 100%;
      text-align: center;
      margin-bottom: 10px;
      padding: 0;
      &:last-child {
        margin-bottom: 0;
      }

      & > a {
        max-width: none !important;
        text-align: center !important;
        text-wrap: wrap !important;
      }

      &:first-child {
        flex-direction: row;
        padding-right: 0;
        & > button.toc-menu-toggle {
          flex: 1;
          margin-right: auto;
        }
        & > a {
          max-width: none;
          margin-right: 0;
          text-align: center;
          white-space: normal;
        }
        & > .keep-previous-centered {
          flex: 1;
        }
      }
    }
  }
  .navigation-document-top {
    width: 100%;
    justify-content: space-between;
  }
  .tooltip {
    display: none;
  }
}

.ariane-collection-top {
  justify-content: left;
}

.navigation-row-top-container {
  width: 100%;
  padding-top: 10px;
  padding-bottom: 15px;
  background-color: var(--meta-banner-fill-color);
}

.navigation-row-top {
  width: 100% !important;
}
ul.breadcrumb-top {
  display: flex;
  max-width: 100%;
	padding: 0;
	font-size: 0;
	line-height: 0;
	height: 40px;

	& > li {
    display: flex;
    justify-content: left;
		position: relative;
		margin: 0 0;
		padding: 0;
		list-style: none;
		list-style-image: none;
		border-left: 1px solid #ccc;

		&:hover {
      flex-shrink: 0 !important;
      width: auto !important;
			&:before {
				border-left: 10px solid var(--text-color);
			}
			a {
				color: #000;
				background: var(--text-color);
			}
		}

		&:before {
			content:"";
			position: absolute;
			right: -9px;
			top: -1px;
			z-index: 9;
			border-left: 10px solid #fff;
			border-top: 22px solid transparent;
			border-bottom: 22px solid transparent;
		}

		&:not(:last-child):after {
			content:"";
			position: absolute;
			right: -10px;
			top: -1px;
			z-index: 8;
			border-left: 10px solid #ccc;
			border-top: 22px solid transparent;
			border-bottom: 22px solid transparent;
		}


		&.active {
      flex-shrink: 0 !important;
      width: fit-content !important;
      &:has(
        > a:last-child.active
      ):before {
        border-left: 10px solid var(--meta-area-fill-color);
      }
			a {
        font-weight: bold;
				color: #000;
        &.active {
          background-color: var(--meta-area-fill-color);
        }
			}
		}

		&.first {
      width: auto;
      flex-shrink: 0; /* home fixed */
			border-left: none;

			a {
				padding-left: 20px;
				border-radius: 5px 0 0 5px;
			}
		}
    &.last {
			&:before {
				display: none;
			}
			&:after {
				display: none;
			}
			a {
				padding-right: 20px;
				border-radius: 0 40px 40px 0;
			}
		}
    &:not(:first-child):not(:last-child) {
      flex-shrink: 1; /* middle li can shrink */
      max-width: fit-content;
      min-width: 100px;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      > a {
        font-size: 12px;
        line-height: 40px;
        & > i {
          font-size: 14px;
        }
      }
    }

		&:last-child {
      flex-shrink: 1;
      width: fit-content;
      white-space: nowrap !important;
			overflow: hidden !important;
      text-overflow: ellipsis !important;
      border: 1px solid #ddd !important;
      &:before {
        z-index: -1 !important;
      }
      border-radius: 0 20px 20px 0 !important;
      a {
        min-width: 0;
        border: 1px #ddd !important;
        border-radius: 0 20px 20px 0 !important;
      }
		}

		a {
			display: inline-block;
			font-size: 12px;
			line-height: 40px;
			padding: 0 15px 0 25px;
			text-decoration: none;
			background: #fff;
			border: 1px solid #ddd;
			white-space: nowrap !important;
			overflow: hidden !important;
      text-overflow: ellipsis !important;
		}
	}
  &:has(
    > li:not(:last-child):hover,
    > li:not(:last-child).active
  ) > li:last-child {
    flex-shrink: 1 !important;
    width: auto !important;
    min-width: 0;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }
}
ul.breadcrumb-top li a {
  display: flex;
  align-items: center;
  position: relative;
  padding-right: 45px; /* allow space for toggle */
}
ul.breadcrumb-top li.first a {
  padding-right: 15px;
}
ul.breadcrumb-top li a i {
  font-size: 14px;
  line-height: 1;
  margin-right: 5px;
}
.to-next-fragment {
  border-bottom: none !important;
  &.disabled {
    pointer-events: none;
  }
  margin-left: 5px;
  margin-right: 0;
  margin-bottom: 0;
  margin-top: 0;
}
.has-tooltip {
  position: relative;
  display: inline-flex;
}

.has-tooltip .tooltip {
  position: absolute;
  right: 0;
  bottom: 100%;
  transform: translateY(-8px);
  background: #1b2c39;
  color: #fff;
  font-size: 12px;
  line-height: 1.2;
  padding: 6px 10px;
  border-radius: 4px;
  white-space: nowrap;

  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease, transform 0.15s ease;
  z-index: 1000;
}

.has-tooltip .tooltip::after {
  content: "";
  position: absolute;
  top: 100%;
  right: 10px;
  border-width: 6px;
  border-style: solid;
  border-color: #1b2c39 transparent transparent transparent;
}

.has-tooltip:hover .tooltip,
.has-tooltip:focus-visible .tooltip {
  opacity: 1;
  transform: translateY(-12px);
}
.to-previous-fragment {
  border-bottom: none !important;
  &.disabled {
    pointer-events: none;
  }
  margin-left: 0;
  margin-right: 5px;
  margin-bottom: 0;
  margin-top: 0;
}

.tab-header {
  display: flex;
  gap: 12px;
  margin-bottom: 10px;
}

.tab-header button {
  background: none;
  border: none;
  font-weight: 600;
  cursor: pointer;
  padding: 6px 10px;
}

.tab-header button.active {
  border-bottom: 2px solid #000;
}
.breadcrumb-panel {
  background: var(--meta-area-fill-color);
  margin-top: -1px;
  padding: 16px 20px;
  border-radius: 0 0 12px 12px;
}

.tab-header {
  display: flex;
  gap: 12px;
  margin-bottom: 10px;
}

.tab-header button {
  background: none;
  border: none;
  font-weight: 600;
  cursor: pointer;
  padding: 6px 10px;
}

.tab-header button.active {
  border-bottom: 2px solid #000;
}


</style>