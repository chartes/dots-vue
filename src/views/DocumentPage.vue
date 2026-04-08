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
          <div
            class="fade-left"
            :class="{ visible: colFadeLeftVisible }"
          >
            <IconCircleArrow
              class="icon-circle-arrow-left"
              :size="20"
              fg-color="var(--fill-color)"
              direction="left"
              @click.prevent="breadcrumbToLeft"
            />
          </div>
          <ul
            v-if="arianeCollection.length > 0"
            class="breadcrumb-top"
            ref="breadcrumbEl"
            @scroll="onColBreadcrumbScroll($event)"
          >
            <!--<li class="first">
              <router-link
                v-if="isDocProjectIdIncluded"
                :to="{ name: 'Home', params: { collId: arianeCollection[0][0].identifier } }"
              >
                <i class="fa fa-home"></i>
              </router-link>
            </li>-->
            <li
              v-for="(item, index) in (arianeCollection.length === 1 ? arianeCollection : isDocProjectIdInc ? arianeCollection.slice(1): arianeCollection)"
              :key="index"
              :class="{ active: index === activeBreadcrumb }"
            >
              <ArianeArrowSeparatorIcon v-if="index > 0" class="separator" />
              <template
                v-if="item.length > 1 && selectStoreCollection(item)?.identifier"
              >
                <a
                  :class="selectedCollectionId === selectStoreCollection(item).identifier ? 'active' : ''"
                  href="#"
                  @click.prevent="openObject(selectStoreCollection(item), index)"
                >
                  <CollectionIcon
                    v-if="selectStoreCollection(item).citeType === 'Collection'"
                    class="breadcrumb-top-icon"
                    :size="30"
                    :radius="0"
                  />
                  <ResourceIcon
                    v-else
                    class="breadcrumb-top-icon"
                    :size="30"
                    :radius="0"
                  />
                  <span class="breadcrumb-label">
                    {{ ancestorLabel(selectStoreCollection(item)) }}
                  </span>
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
                  <collection-icon
                    v-if="item[0].citeType === 'Collection'"
                    class="breadcrumb-top-icon"
                    :size="30"
                    :radius="0"
                  />
                  <ResourceIcon
                    v-else
                    class="breadcrumb-top-icon"
                    :size="30"
                    :radius="0"
                  />
                  <span class="breadcrumb-label">
                    {{ ancestorLabel(item[0]) }}
                  </span>
                </a>
              </template>
            </li>
          </ul>
          <div
            class="fade-right"
            :class="{ visible: colFadeRightVisible }"
          >
            <IconCircleArrow
              class="icon-circle-arrow-right"
              :size="20"
              fg-color="var(--fill-color)"
              direction="right"
              @click.prevent="breadcrumbToRight"
            />
          </div>
          <div
            v-if="activeObject"
            class="breadcrumb-panel is-opened"
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
              <CloseCross
                href="#"
                class="breadcrumb-top-toggle-bttn"
                fg="blue"
                size="40"
                @click.prevent="openObject(activeObject, activeBreadcrumb)"
              />
            </div>

            <div class="tab-content">
              <div
                v-if="activePanel === 'meta'"
              >
                <div v-if="selectedCollectionId.length > 0">
                  <document-metadata
                    :ispopup="false"
                    :collection-config="collConfig"
                    :metadataprop="selectedCollection"
                    :hasheader="false"
                    class="metadata-area"
                  />
                </div>
              </div>
              <div
                v-if="activePanel === 'summary'"
              >
                <div
                  v-if="selectedCollection.type === 'Collection' || selectedCollection.citeType === 'Collection'"
                  class="collection-toc-area app-width-margin"
                  :class="tocCssClass"
                >
                  <div class="menu app-width-margin">
                    <CollectionTOC
                      :is-doc-projectId-included="isDocProjectIdInc"
                      :display-option="'toc'"
                      :dts-root-collection-identifier="dtsRootCollectionId"
                      :root-collection-identifier="rootCollectionId"
                      :application-config="appConfig"
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
    <nav
      class="navigation-row app-width-margin"
      aria-label="Navigation du document"
    >
      <div class="navigation-document">
        <div class="ariane">
          <div
            class="ariane-wrapper"
          >
            <!-- LeftTOC button -->
            <button
              type="button"
              class="toc-menu-toggle"
              aria-label="Afficher le sommaire"
              :class="hasValidTOC ? TOCMenuBtnCssClass : 'disabled'"
              @click="toggleTOCMenu"
            >
              <TocIcon />
            </button>
            <!-- Document breadcrumb -->
            <div
              class="ariane-scroll-wrapper"
            >
              <div
                class="doc-fade-left"
                :class="{ visible: docFadeLeftVisible }"
              />
              <ul
                v-if="!leftTOCFragmentIsDocument"
                ref="arianeDocContainer"
                class="crumbs"
                @scroll="onDocBreadcrumbScroll($event)"
              >
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
                  <!--<span class="keep-previous-centered" />-->
                </li>
              </ul>
              <ul
                v-else
                ref="arianeDocContainer"
                class="crumbs"
                @scroll="onDocBreadcrumbScroll($event)"
              >
                <li
                  v-for="(ancestor, index) in arianeDocument.filter(item => item.editorialLevelIndicator !== 'hash').slice(1)"
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
              <div
                class="doc-fade-right"
                :class="{ visible: docFadeRightVisible }"
              />
            </div>
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
      :class="isControlsOpened ? 'is-opened' : ''"
      role="toolbar"
      aria-label="Options d’affichage du document"
    >
      <button
        class="controls-toggle"
        aria-label="Afficher les outils de lecture"
        :aria-expanded="isControlsOpened"
        @click="toggleControls"
      >
        <IconReadingToolsToggle
          :size="40"
          :radius="4"
          :is-active="isControlsOpened"
        />
      </button>
      <ul
        class="controls-list"
        :class="isControlsOpened ? 'is-opened' : ''"
      >
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
            <icon-notes />
          </button>
        </li>
        <li>
          <a
            v-if="refId && refId.length > 0"
            target="_blank"
            :href="`${dtsUrl}/document?resource=${resourceId}&ref=${refId}`"
            class="xml-btn"
            aria-label="Télécharger le XML"
          >
            <XMLIcon :size="40" />
          </a>

          <a
            v-else
            target="_blank"
            :href="`${dtsUrl}/document?resource=${resourceId}`"
            class="xml-btn"
            aria-label="Télécharger le XML"
          >
            <XMLIcon :size="40" />
          </a>
        </li>
      </ul>
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
                :toc="leftTOCFragmentIsDocument && refId ? flatTOC.filter(n => n.ancestor_editorialLevel === refId) : flatTOC.filter(n => n.level > 0)"
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
            :key="resourceId + currentLevelIndicator"
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
            :key="refId + editorialLevel"
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
  inject, nextTick, onBeforeUnmount
} from 'vue'

import { useRoute } from 'vue-router'
import { router } from '@/router'
import fetchMetadata from '@/composables/get-metadata.js'
import { getSimpleObject } from '@/composables/utils.js'
import { useMetadataProcessor } from '@/composables/useMetadataProcessor'
import CollectionIcon from '@/assets/images/CollectionIcon.vue'
import ResourceIcon from '@/assets/images/ResourceIcon.vue'
import IconCircleArrow from '@/assets/images/IconCircleArrow.vue'
import CloseCross from '@/assets/images/CloseCross.vue'
import IconReadingToolsToggle from '@/assets/images/IconReadingToolsToggle.vue'
import XMLIcon from '@/assets/images/XMLIcon.vue'
import IconNotes from '@/assets/images/IconNotes.vue'
import TocIcon from '@/assets/images/TocIcon.vue'
import ArianeArrowSeparatorIcon from "@/assets/images/ArianeArrowSeparatorIcon.vue";

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
    ArianeArrowSeparatorIcon,
    TocIcon,
    IconNotes,
    XMLIcon,
    IconReadingToolsToggle,
    IconCircleArrow,
    ResourceIcon,
    CollectionIcon,
    CollectionTOC,
    DocumentMetadata,
    DocumentSource,
    TOC,
    DirectionArrows,
    IconLetterT,
    IconImage,
    CloseCross
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
    const leftTOCFragmentIsDocument = ref(false)
    const isDocProjectIdInc = ref(props.isDocProjectIdIncluded)
    const dtsRootCollectionId = ref(props.dtsRootCollectionIdentifier)
    const rootCollectionId = ref(props.rootCollectionIdentifier)
    const docProjectId = ref('')
    console.log('topTOCDisplayIndicator test : ', topTOCDisplayIndicator)
    const appConfig = ref(props.applicationConfig)
    const collConfig = ref(props.collectionConfig)
    console.log('DocumentPage props.collectionConfig', props.collectionConfig)
    const manifestIsAvailable = ref(false)
    const manifest = ref(null)
    const miradorContainer = ref(null)
    const activeBreadcrumb = ref(null)
    const activeObject = ref(null)       // collection / resource
    const activePanel = ref(null)        // 'meta' | 'summary'

    const dtsUrl = computed(() => {
      const base = import.meta.env.VITE_APP_DTS_ENDPOINT_URL || ''
      return `${base.replace(/\/$/, '')}`
    })

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

    const metadata = ref({})
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

    // reading options bar
    let mediaQuery

    const handleBreakpoint = (e) => {

      if (e.matches) {
        // ≥ 640px (desktop)
        isControlsOpened.value = true
      } else {
        // < 640px (mobile)
        isControlsOpened.value = false
      }
    }

    const isControlsOpened = ref(false)
    const toggleControls = (e) => {
      e.stopPropagation();
      isControlsOpened.value = !isControlsOpened.value
    }

    const closeControls = () => {
      isControlsOpened.value = false
    }

    // Lifecycle hooks
    onMounted(() => {
      document.body.addEventListener('click', closeControls)
    })

    onBeforeUnmount(() => {
      document.body.removeEventListener('click', closeControls)
    })


    const isNotesOpened = ref(true)
    const hasNotes = ref(false)

    // collection breadcrumb scrolls reactive
    const colBreadcrumbScrollLeft = ref(0)
    const colBreadcrumbClientWidth = ref(0)
    const colBreadcrumbScrollWidth = ref(0)

    // computed fade for collection breadcrumb
    const colFadeLeftVisible = computed(() => {
      return (
        colBreadcrumbScrollWidth.value > colBreadcrumbClientWidth.value && colBreadcrumbScrollLeft.value > 1
      )
    })

    const colFadeRightVisible = computed(() => {
      return colBreadcrumbScrollWidth.value > colBreadcrumbClientWidth.value && colBreadcrumbScrollLeft.value + colBreadcrumbClientWidth.value < colBreadcrumbScrollWidth.value - 1
    })

    const breadcrumbEl = ref(null)
    const updateMeasurements = function () {
      console.log('DOM updateMeasurements', breadcrumbEl.value)
      if (!breadcrumbEl.value) return

      const el = breadcrumbEl.value
      colBreadcrumbScrollLeft.value = el.scrollLeft
      colBreadcrumbClientWidth.value = el.clientWidth
      colBreadcrumbScrollWidth.value = el.scrollWidth
    }

    const onColBreadcrumbScroll = (event) => {
      const target = event.target
      console.log('onColBreadcrumbScroll')
      updateMeasurements()
      colBreadcrumbScrollLeft.value = target.scrollLeft
      colBreadcrumbClientWidth.value = target.clientWidth
      colBreadcrumbScrollWidth.value = target.scrollWidth
    }

    const breadcrumbToLeft = function() {
      console.log('DOM breadcrumbToLeft', breadcrumbEl.value)
      if (!breadcrumbEl.value) return

      const el = breadcrumbEl.value

      el.scrollTo({
        left: 0,
        behavior: 'smooth'
      })
    }

    const breadcrumbToRight = function() {
      if (!breadcrumbEl.value) return

      const el = breadcrumbEl.value

      el.scrollTo({
        left: el.scrollWidth,
        behavior: 'smooth'
      })
    }

    // document breadcrumb scrolls reactive
    const arianeDocContainer = ref(null)

    const docBreadcrumbScrollLeft = ref(0)
    const docBreadcrumbClientWidth = ref(0)
    const docBreadcrumbScrollWidth = ref(0)

    // computed fade for document breadcrumb
    const docFadeLeftVisible = computed(() => {
      return (
        docBreadcrumbScrollWidth.value > docBreadcrumbClientWidth.value && docBreadcrumbScrollLeft.value > 1
      )
    })

    const docFadeRightVisible = computed(() => {
      console.log('DOM ariane docFadeRightVisible', docBreadcrumbScrollWidth.value > docBreadcrumbClientWidth.value && docBreadcrumbScrollLeft.value + docBreadcrumbClientWidth.value < docBreadcrumbScrollWidth.value - 1)
      return docBreadcrumbScrollWidth.value > docBreadcrumbClientWidth.value && docBreadcrumbScrollLeft.value + docBreadcrumbClientWidth.value < docBreadcrumbScrollWidth.value - 1
    })

    const onDocBreadcrumbScroll = (event) => {
      const target = event.target
      console.log('onDocBreadcrumbScroll')
      updateMeasurementsAriane()
      docBreadcrumbScrollLeft.value = target.scrollLeft
      docBreadcrumbClientWidth.value = target.clientWidth
      docBreadcrumbScrollWidth.value = target.scrollWidth
    }

    const updateMeasurementsAriane = function () {
      console.log('DOM ariane updateMeasurements', arianeDocContainer.value)
      if (!arianeDocContainer.value) return

      const el = arianeDocContainer.value
      docBreadcrumbScrollLeft.value = el.scrollLeft
      docBreadcrumbClientWidth.value = el.clientWidth
      docBreadcrumbScrollWidth.value = el.scrollWidth

    }

    const arianeDocToRight = function() {
      console.log('DOM arianeDocToRight', arianeDocContainer.value)
      if (!arianeDocContainer.value) return
      const el = arianeDocContainer.value

      el.scrollTo({
        left: el.scrollWidth,
        behavior: 'smooth'
      })
    }


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

        const response = await getMetadataFromApi(resourceId.value, null, null)
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
        leftTOCFragmentIsDocument.value = collConfig.value.tableOfContentsSettings.leftTocFragmentIsDocument !== false

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
      const metadataResponse = await fetchMetadata('DocumentPage', resourceId.value, 'Resource', collConfig.value, route)
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
              const appendParentInTOC = await getMetadataFromApi(node.parent[i], null, null)
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

              appendParentInTOC.children = appendParentInTOC.member.filter(item => item.identifier !== node.identifier).map((obj) => {
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
                  parent: obj.parent,
                  dublincore: obj.dublincore,
                  extensions: obj.extensions
                }
                return updatedMember
              })

              if (appendParentInTOC.member.filter(item => item.identifier === node.identifier).length > 0) {
                const updatedCurrentNode = appendParentInTOC.member.filter(item => item.identifier === node.identifier)[0]
                updatedCurrentNode.parent = node.parent
                updatedCurrentNode.level = node.level
                updatedCurrentNode.member = node.member ? node.member : []
                appendParentInTOC.children.push(getSimpleObject(updatedCurrentNode))
              }

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
            const appendParentInTOC = await getMetadataFromApi(node.parent, null, null)
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

            appendParentInTOC.children = appendParentInTOC.member.filter(item => item.identifier !== node.identifier).map((obj) => {
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
                parent: obj.parent,
                dublincore: obj.dublincore,
                extensions: obj.extensions
              }
              return updatedMember
            })

            if (appendParentInTOC.member.filter(item => item.identifier === node.identifier).length > 0) {
              const updatedCurrentNode = appendParentInTOC.member.filter(item => item.identifier === node.identifier)[0]
              updatedCurrentNode.parent = node.parent
              updatedCurrentNode.level = node.level
              updatedCurrentNode.member = node.member ? node.member : []
              appendParentInTOC.children.push(getSimpleObject(updatedCurrentNode))
            }

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

      // Initialise the children of the flatTOC fragments (descendant of the resource)
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
            //console.log('addFlag on node.level editorialTypes.includes(item.citeType) : < 0', node)
          } else if (node.level === 0) {
            node.url = `${window.location.origin}${import.meta.env.VITE_APP_APP_ROOT_URL.length > 1 ? import.meta.env.VITE_APP_APP_ROOT_URL + '/' : import.meta.env.VITE_APP_APP_ROOT_URL}${route.path.slice(1, route.path.length)}`
            node.router = node.identifier
            //console.log('addFlag on node.level editorialTypes.includes(item.citeType) : = 0', node)
          } else {
            node.url = `${window.location.origin}${import.meta.env.VITE_APP_APP_ROOT_URL.length > 1 ? import.meta.env.VITE_APP_APP_ROOT_URL + '/' : import.meta.env.VITE_APP_APP_ROOT_URL}${route.path.slice(1, route.path.length)}?refId=${node.identifier}`
            node.router = `${route.params.id}?refId=${node.identifier}`
            node.router_params = route.params.id
            node.router_refid = node.identifier
            //console.log('addFlag on node.level editorialTypes.includes(item.citeType) : > 0 ', node)
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
          //console.log('addFlag on node.level <0 : ', node)
        } else if (node.level === 0) {
          node.url = `${window.location.origin}${import.meta.env.VITE_APP_APP_ROOT_URL.length > 1 ? import.meta.env.VITE_APP_APP_ROOT_URL + '/' : import.meta.env.VITE_APP_APP_ROOT_URL}${route.path.slice(1, route.path.length)}`
          node.router = node.identifier
          node.router_params = node.identifier
          //console.log('addFlag on node.level === 0 : ', node)
        } else {
          node.url = `${window.location.origin}${import.meta.env.VITE_APP_APP_ROOT_URL.length > 1 ? import.meta.env.VITE_APP_APP_ROOT_URL + '/' : import.meta.env.VITE_APP_APP_ROOT_URL}${route.path.slice(1, route.path.length)}?refId=${node.identifier}`
          node.router = `${route.params.id}?refId=${node.identifier}`
          node.router_params = route.params.id
          node.router_refid = node.identifier
          if (node.identifier === 'a1') {
            //console.log('addFlag on node.level > 0 node.url ', node.url, '\n', window.location.origin, '\n', import.meta.env.VITE_APP_APP_ROOT_URL, '\n', route.path)
          }
          //console.log('addFlag on node.level > 0 : ', node)
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
          // Multiple parents
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
      if ( ancestor.citeType === 'Resource' && ancestor?.dublincore?.creator) {
        if (Array.isArray(ancestor.dublincore.creator)) {
          return `${ancestor.dublincore.creator
            .map(c => typeof c === 'string' ? c : Object.values(c)[0])
            .join(', ')}, ${ancestor.title}`
        } else {
          return `${ancestor.dublincore.creator}, ${ancestor.title}`
        }
      }
      return ancestor.title
    }

    function selectStoreCollection(levelListItems) {
      console.log('selectStoreCollection levelListItems', levelListItems)
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

      // Case 1 : same breadcrumb then toggle off
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

      // Case 2 : new objet
      activeBreadcrumb.value = index
      activeObject.value = breadcrumbItem
      console.log('openObject ', activeObject.value)
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
        // Collection pure
        console.log('tocItem collConfig.value ', tocItem, collConfig.value)
        const { processMetadata } = useMetadataProcessor()
        selectedCollection.value = processMetadata(tocItem, collConfig.value, selectedCollectionId.value, route)
        //selectedCollection.value = tocItem
      } else {
        // Resource = merge metadata + toc
        selectedCollection.value = _.merge(
          {},
          metadata.value
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
      fetch(getIiifManifestUrl(), {
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

    const hasValidTOC = computed(() => {
      const hasChildren = refId.value || currentItem.value.identifier

      return (
        leftTOCFragmentIsDocument.value ? leftTOCDisplayIndicator.value &&
        flatTOC.value.some(item => item.parent === hasChildren) : true
      )
    })
    const getIiifManifestUrl = () => {
      const dctSource = metadata.value['dct:source']

      if (!dctSource) {
        return null
      }

      // cas tableau
      if (Array.isArray(dctSource)) {
        const iiifItem = dctSource.find(s => s?.source?.name === 'iiif')
        if (iiifItem) {
          return iiifItem.url
        }
      }

      // cas objet simple
      if (dctSource?.source?.name === 'iiif') {
        return source.url
      }

      return null
    }

    watch(
      () => metadata.value['dct:source'],
      () => {
        if (metadata.value['dct:source']) {
          //getIiifManifestUrl()
          console.log('metadata.iiifManifestUrl is now available !!! : ', getIiifManifestUrl(), manifestIsAvailable.value)
          layout.imageIsAvailable.value = true
          setMirador()
        } else {
          layout.imageIsAvailable.value = false
        }
      }, { immediate: true }
    )

    watch(props, async (newProps) => {
      appConfig.value = newProps.applicationConfig
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

    watch(hasValidTOC, (val) => {
      console.log('hasValidTOC changed:', val)
      if (!val && layout.isTOCMenuOpened.value) {
        layout.isTOCMenuOpened.value = false
      }
    })

    watch(breadcrumbEl, (val) => {
      console.log('DOM breadcrumbEl changed:', val)
      updateMeasurements()
    })

    watch(arianeDocContainer, (val) => {
      console.log('DOM arianeDocContainer changed:', val)
      updateMeasurementsAriane()
    })
    watch(arianeDocument, (val) => {
      console.log('DOM arianeDocContainer updated:', val)
      nextTick().then(arianeDocToRight)
    })

    watch(breadcrumbEl, (val) => {
      console.log('DOM breadcrumbEl updated:', val)
      nextTick().then(breadcrumbToRight)
    })

    function scrollTo () {
      // If the selected item is an anchor, capture and scroll to that anchor
      console.log('DocumentPage.vue scrollTo on resolve hash : ', hash.value)
      if (hash.value.length > 0) {
        // Bump the hash to ensure change detection
        const bumpPath = `${import.meta.env.VITE_APP_APP_ROOT_URL}`.length <= 1 ? `${router.currentRoute.value.fullPath.split('#')[0]}#${hash.value}` : `${import.meta.env.VITE_APP_APP_ROOT_URL}${router.currentRoute.value.fullPath.split('#')[0]}#${hash.value}`
        history.replaceState(history.state, '', bumpPath)

        // Target element and scroll
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

      window.addEventListener('resize', updateMeasurements)
      window.addEventListener('resize', updateMeasurementsAriane)

      mediaQuery = window.matchMedia('(min-width: 640px)')
      handleBreakpoint(mediaQuery)
      mediaQuery.addEventListener('change', handleBreakpoint)
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

      window.removeEventListener('resize', updateMeasurements)
      window.removeEventListener('resize', updateMeasurementsAriane)

      mediaQuery.removeEventListener('change', handleBreakpoint)
    })

    return {
      dtsUrl,
      topTOCDisplayIndicator,
      leftTOCDisplayIndicator,
      leftTOCFragmentIsDocument,
      tocCssClass: layout.tocCssClass,
      toggleTOCContent: layout.toggleTOCContent,
      tocMenuCssClass: layout.tocMenuCssClass,
      toggleTOCMenu: layout.toggleTOCMenu,
      hasValidTOC,
      TOCMenuBtnCssClass: layout.TOCMenuBtnCssClass,
      changeViewMode: layout.changeViewMode,
      viewModeCssClass: layout.viewModeCssClass,
      miradorViewCssStyle,
      miradorContainer,
      breadcrumbEl,
      onColBreadcrumbScroll,
      onDocBreadcrumbScroll,
      breadcrumbToLeft,
      breadcrumbToRight,
      colFadeLeftVisible,
      colFadeRightVisible,
      docFadeLeftVisible,
      docFadeRightVisible,
      arianeDocContainer,
      arianeDocToRight,
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
      appConfig,
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
      isControlsOpened,
      toggleControls,
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
  /*margin-top: 15px !important;
  margin-bottom: 15px !important;*/
}
.metadata-area .columns {
  margin: 0;
}
.toc-area {
  width: 100%;
  padding: 0;
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
  font-family: var(--font-secondary), sans-serif;
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
  text-decoration: var(--text-decoration-hover) !important;
}
.toc-area-aside a,
.toc-area-content a {
  font-family: var(--font-primary), sans-serif !important;
  font-weight: 400;
  color: var(--document-text-color);
  text-align: left;
  letter-spacing: 0;
  border: none;
  box-shadow: none;
}
.toc-area-content a {
  font-size: 17px;
  line-height: 20px;
}
.toc-area-aside a {
  font-size: 16px;
  line-height: 19px;
}

.controls {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: right;
  width: 100%;
  padding-top: 10px;
  padding-bottom: 10px;

  z-index: 100;
  pointer-events: none;
}
.controls button {
  display: flex;
  height: 40px;
  width: 40px;
  pointer-events: auto;
}
.controls-list {
  display: flex;
  flex-direction: column;

  margin: 0;
  padding: 0;
  list-style: none;

  pointer-events: auto;

  &.is-opened {
    display: flex;
  }
}

.controls button {
  /* remove default button behavior */
  appearance: none;
  -webkit-appearance: none;

  background: white;
  border: none;

  /*width: 100%;*/
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

.controls-toggle .icon-wrapper {
  color: var(--fill-color);
  height: 40px;
  width: 40px;
}
.controls-toggle[aria-expanded="true"] .icon-wrapper {
  color: #ffffff;
  background-color: var(--fill-color);
  border-radius: 4px;
  overflow: hidden;
  /* même couleur que stroke pour que le contour disparaisse visuellement */
  border: 1px solid var(--fill-color);
}
.controls .controls-toggle {
  display: none;
}

.controls .notes-btn {
  color: #C3C3C3;
  border: 1px solid #C3C3C3;
  border-radius: 4px;
  font-size: 20px;

  &.is-opened {
    color: var(--fill-color);
  }
}
.controls button:focus-visible {
  outline: 2px solid #B9192F;
  outline-offset: 2px;
}

/* former pdf & xml button to adapt : where ?
.controls a.pdf-btn {
  background: url(../assets/images/b_PDF.svg) center / cover no-repeat;
}*/
.controls .xml-btn {
  height: 40px;
  width: 40px;
  color: var(--fill-color);
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
  position: relative;
  margin: 0;
  padding: 0;
}
.toc-aside-is-opened .toc-area-aside {
  position: relative;
  display: flex;
  width: 230px;
  background-color: #FFF;

    & > aside > nav {
      position: sticky;
      top: 80px;
      height: calc(100vh - 250px);
      padding-bottom: 20px;
      & > nav {
        height: 100%;
        overflow-y: auto;
      }
  }
}
.toc-aside-is-opened .document-views {
  width: calc(100% - 240px);
}
.mirador-view {
  position: relative;
  min-height: 80vh;
  max-height: 100vh;
  max-width: calc(100vw - 20px);
}
.document-views .text-view > * body { /* cf tei.css */
  margin-left: 10px;
  margin-right: 10px;
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
  padding: 20px 10% 120px;
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

#article {
  .titlepage,
  h1, h2, h3, h4, h5, h6 {
    padding: 0;
    margin-bottom: 30px;
    font-family: var(--font-primary), sans-serif;
    color: var(--document-text-color);
    text-transform: none;
    text-align: left;
  }
}

#article h1 {
  font-size: 32px;
  font-weight: 800;
  line-height: 1.2;
}

#article h2 {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.357;
}

#article h3 {
  font-size: 22px;
  font-weight: 700;
  line-height: 1.727;
}

#article h4 {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.9;
}

#article h5 {
  font-size: 18px;
  font-weight: 700;
  line-height: 2.111;
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

#article .byline {
  margin: 25px 0 90px;
}

#article .fileDesc > * {
  margin-bottom: 10px;
}

#article .fileDesc > .titleStmt,
#article .fileDesc p,
#article .byline {
  text-align: left;
}

#article .fileDesc p.author,
#article .byline .docAuthor {
  font-family: var(--font-serif), serif;
  font-size: var(--font-default-size);
  font-variant: unset;
  line-height: 1.6;
  color: var(--fill-color);
  text-transform: none;
}

#article section.div {
  border: none;
  padding-bottom: 0;
  padding-top: 40px;
  text-align: left;
}

#article section.div:first-child {
  padding-top: 0;
}

#article p b.label {
  text-indent: 0;
}


/*

#article section.div h2.head {
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

*/

#article {
  .availability, .editionStmt, figcaption, .footnotes, li.bibl, .marginalia, .note, #noterefover, .publicationStmt, .sourceDesc, .speaker, .stage {
    font-family: var(--font-primary), sans-serif;
    font-size: var(--font-small-size);
  }

  .sourceDesc {
    & head,
    & trailer,
    & label {
      font-family: var(--font-primary), sans-serif;
      font-weight: 500;
      font-size: var(--font-default-size);
      font-variant: none;
      line-height: 1.4;
      color: var(--document-text-color);
      text-shadow: none;
      text-transform: none;
    }
  }

  .argument {
    font-family: var(--font-primary), sans-serif;
    font-weight: 400;
    font-size: var(--font-default-size);
    font-variant: none;
    line-height: 1.4;
    color: var(--document-text-color);
  }

  .noteref sup:empty::before {
    content: "#";
    font-size: 12px;
    vertical-align: top;
  }

  .footnotes {
    margin: 90px 0 0;
    position: relative;
  }

  .footnotes::before {
    content: "Notes";
    display: block;
    font-size: 18px;
    font-weight: 700;
    color: var(--fill-color);
  }

  .footnotes::after {
    content: "";
    position: absolute;
    top: 32px;
    left: 0;
    display: block;
    width: 100%;
    border-top: #E4E4E4 4px solid !important;
  }

  .footnotes > *:first-child {
    display: block;
    margin-top: 45px !important;
  }

  .footnotes .note-page {
    margin: 10px 0 22px;
  }

  .footnotes .note-page a {
    font-weight: 700;
    font-size: 18px;
    border: none;
    text-decoration: none;
  }

  .footnotes aside.note a.noteback:hover,
  .footnotes .note-page a:hover {
    text-decoration: underline;
  }

  .footnotes aside.note {
    position: relative;
    padding: 0 0 0 25px;
    margin: 0 0 40px;
    border: none;
  }

  .footnotes aside.note:target::before {
    display: none;
  }

  .footnotes aside.note > i {
    font-style: inherit;
  }

  .footnotes aside.note a.noteback {
    position: absolute;
    left: 0;
    top: 0;
    display: inline;
    width: auto;
    margin: 0;
    font-weight: 700;
    font-size: 18px;
    color: var(--fill-color);
    text-decoration: none;
    text-align: left;
  }
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
  max-width: var(--default-content-width);
  margin-top: 10px;
  margin-bottom: 10px;

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
  max-width: var(--default-content-width) !important;

  font-family: var(--font-primary), sans-serif;
  font-weight: 400;
  font-size: 18px;
  color: #636363;

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
    justify-items: left;
    width: 100%;
    max-width: calc(100% - 90px - 20px);
    margin-right: 20px;

    & > button.toc-menu-toggle {
      /* remove default button behavior */
      appearance: none;
      -webkit-appearance: none;
      background-color: white;
      border: none;
      padding: 0;
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
      border-radius: 4px;

      &.is-opened {
        color: white;
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
.ariane-scroll-wrapper {
  display: flex;
  justify-content: left;
  align-items: center;
  height: 40px;
  max-width: calc(100% - 60px);
  margin-right: 20px;

  position: relative;
}

.crumbs {
  display: flex;
  width: 100%;
  height: 40px;
  flex-direction: row;
  margin-left: 0;

  overflow-x: auto;   /* scroll horizontal si nécessaire */
  overflow-y: hidden; /* pas de scroll vertical */
  scroll-behavior: smooth;
  scrollbar-width: thin;

}
.crumbs li + li:before {
  width: 100% !important;
  padding: 20px !important;
}

.crumbs li a:hover {
  text-decoration: var(--text-decoration-hover);
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
  text-wrap: nowrap;

  &:last-child:after {
    display: none;
  }

  &:not(:last-child):after {
    display: inline-block;
    content: ' > ';
    font-weight: bold;
    color: var(--fill-color);
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
      color: var(--fill-color);
      font-weight: bold;
      border: none;
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
        color: var(--fill-color) !important;
      }
    }
  }
}

.navigation-row {
  position: sticky;
  top: 0;
  z-index: 22;

  display: flex;
  flex-direction: column;
  background: #fff;
  justify-content: center;
  align-items: center;
  width: 100%;
  vertical-align: center;
  /*margin-bottom: 10px;*/
  pointer-events: auto;
}

.controls {
  position: sticky;
  top: 85px;
  z-index: 11;
  pointer-events: none;
}

.controls button {
  pointer-events: auto;
}

.document-area {
  position: relative;
  z-index: 10;
  top: -70px;

  width: 100%;
}

.document-area.toc-aside-is-opened {
  z-index: 11;
}


.navigation-document {
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  width: 100%;
  padding-top: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--fill-color) !important;
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


.ariane-collection-top {
  justify-content: left;
  position: relative;
}

.navigation-row-top-container {
  width: 100%;
  padding-top: 20px;
  background-color: var(--meta-banner-fill-color);
}

.navigation-row-top {
  width: 100% !important;
}
ul.breadcrumb-top {
  --crumb-radius: 30px;     /* demi-lune (40px hauteur / 2)*/
  --crumb-gap: 0;        /* trait visible entre les items*/

  display: flex;

  margin-bottom: 20px;
  padding: 0;
  font-family: var(--font-primary), sans-serif;
  font-size: var(--font-default-size);
  font-weight: 500;
  flex-flow: row nowrap;
  overflow-x: auto;   /* scroll horizontal si nécessaire */
  overflow-y: hidden; /* pas de scroll vertical */
  scroll-behavior: smooth;
  scrollbar-width: thin;

  > li {
    display: flex;
    align-items: center;
    width: fit-content;
    margin-top: 0;
    margin-bottom: 0;
  }

  > li .separator {
    color: var(--fill-color);
    margin: 0 14px;
  }

  > li > a {
    position: relative;
    display: flex;
    flex-flow: row nowrap;
    gap: 5px;
    overflow: hidden;
    align-items: center;
    padding: 7px 20px;
    background: #E5E5E5;
    color: black;
    text-decoration: none;

    border: 2px solid var(--meta-banner-fill-color);
    border-radius: var(--crumb-radius);

    /* espace pour emboitement */
    margin-right: var(--crumb-gap);

    & .breadcrumb-top-icon {
      color: var(--fill-color);
    }

    & > span {
      text-wrap: nowrap;
    }

    &.active {
      /* font-weight: bold !important; */
      color: white;
      background-color: var(--fill-color);
      /*border-bottom: none;*/

      & .breadcrumb-top-icon {
        color: white;
      }
    }
  }

  /* creux gauche pour tous sauf premier */
  > li:not(:first-child) > a {
    margin-left: var(--crumb-gap);
    border-radius: var(--crumb-radius);
  }

  /* premier élément */
  > li:first-child > a {
    padding-left: 15px;
  }

  /* dernier élément */
  > li:last-child > a {
    border-top-right-radius: var(--crumb-radius);
    border-bottom-right-radius: var(--crumb-radius);
  }
}
ul.breadcrumb-top > li:nth-child(1) { z-index: 10; }
ul.breadcrumb-top > li:nth-child(2) { z-index: 9; }
ul.breadcrumb-top > li:nth-child(3) { z-index: 8; }
ul.breadcrumb-top > li:nth-child(4) { z-index: 7; }
ul.breadcrumb-top > li:nth-child(5) { z-index: 6; }
ul.breadcrumb-top > li:nth-child(6) { z-index: 5; }
ul.breadcrumb-top > li:nth-child(7) { z-index: 4; }
ul.breadcrumb-top > li:nth-child(8) { z-index: 3; }
ul.breadcrumb-top > li:nth-child(9) { z-index: 2; }
ul.breadcrumb-top > li:nth-child(10) { z-index: 1; }

.fade-right {
  display: flex;
  justify-content: right;
  align-items: center;

  position: absolute;
  top: 2px;
  right: 0;
  width: 10%; /* largeur du gradient */
  height: 43px;
  background: linear-gradient(
    to left,
    #e5e5e5 50%,      /* opaque côté droit */
    transparent 100%  /* transparent côté gauche */
  );

  z-index: 0;
  opacity: 0;
  transition: opacity 0.2s ease;

  & > .icon-circle-arrow-right {
    margin-right: 5px;
    cursor: pointer;
  }
}
.fade-right.visible {
  opacity: 1;
  z-index: 15;
}

.fade-left {
  display: flex;
  justify-content: left;
  align-items: center;

  position: absolute;
  top: 2px;
  left: 0;
  width: 10%;
  height: 43px;

  background: linear-gradient(
    to right,
    #e5e5e5 50%,
    rgba(204, 204, 204, 0) 100%
  );

  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 0;

  & > .icon-circle-arrow-left {
    margin-left: 5px;
    cursor: pointer;
  }
}

.fade-left.visible {
  opacity: 1;
  z-index: 15;
}

.doc-fade-right {
  display: flex;
  justify-content: right;
  align-items: center;

  position: absolute;
  top: 2px;
  right: 0;
  width: 10%; /* largeur du gradient */
  height: 43px;
  background: linear-gradient(
    to left,
    white 50%,      /* opaque côté droit */
    transparent 100%  /* transparent côté gauche */
  );

  z-index: 0;
  opacity: 0;
  transition: opacity 0.2s ease;

  & > .icon-circle-arrow-right {
    margin-right: 5px;
  }
}
.doc-fade-right.visible {
  opacity: 1;
  z-index: 15;
  pointer-events: none;
}
.doc-fade-left {
  display: flex;
  justify-content: left;
  align-items: center;

  position: absolute;
  top: 2px;
  left: 0;
  width: 10%;
  height: 43px;

  background: linear-gradient(
    to right,
    white 50%,
    rgba(204, 204, 204, 0) 100%
  );

  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 0;

  & > .icon-circle-arrow-left {
    margin-left: 5px;
  }
}

.doc-fade-left.visible {
  opacity: 1;
  z-index: 15;
  pointer-events: none;
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

.breadcrumb-panel {
  margin-top: -2px;
  padding: 5px 5px 45px 5px;
  background-color: var(--meta-area-fill-color);
  border-radius: 6px;

  position: relative;
  z-index: 11;
}

.tab-header {
  display: flex;
  align-items: center;
  height: 80px;
  gap: 12px;
  padding: 20px 56px;
  background-color: var(--meta-area-fill-color);
}

.tab-header button {
  height: 40px;
  background: #FFF;
  border-radius: 4px;
  font-family: var(--font-primary), sans-serif;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  padding: 6px 30px;
  color: var(--fill-color);
  border: 1px solid var(--fill-color);
}

.tab-header button.active {
  color: white;
  background-color: var(--fill-color);
}

.tab-content {
  padding: 10px 56px;

  table {
    border: none;
    background: none;
  }

  .table td {
    padding: 13px 10px
  }

  .table td,
  .table tr {
    border-bottom: 1px solid #C2C2C2;
  }
}

.tab-content ul.tree, .tab-content .collection-toc-area, .tab-content .table.is-fullwidth  {
  margin: 0;
  border-radius: 0 0 6px 6px;
}


@media screen and (max-width: 1320px) {
  .toc-area .toc-area-content nav > ol.tree {
    columns: 2;
  }
  .controls > a.toc-menu-toggle {
    margin-left: 20px;
  }
  .controls ul > li > a.access_link {
    margin-right: 20px;
  }

  /* Document page numbers */
  .pb {
    float: right;
    margin-right: 0;
    padding: 0 0 20px 5px;

    position: absolute;
    left: unset;
  }

  .cb, .ed {
    margin-right: 0;
    padding: 20px 5px;
  }
}

@media screen and (max-width: 1024px) {
  .toc-aside-is-opened .toc-area-aside {
    box-shadow: 8px 8px 5px 0 rgba(0, 0, 0, 0.2);
  }
}

@media screen and (max-width: 768px) {
  .document-area.app-width-margin {
    padding-left: 0;
    padding-right: 0;
  }
  #article {
    padding: 40px var(--mobile-margin) 120px;
  }
  .toc-area .toc-area-content aside {
    padding: 20px 20px !important;
  }

  .l-n {
    margin-left: -2.2rem;
  }
  .ariane {
    & > .ariane-wrapper {
      max-width: calc(100% - 90px - 10px);
      margin-right: 10px;

      & > button.toc-menu-toggle {
        margin-right: 10px;
      }
    }
  }
  .ariane-scroll-wrapper {
    max-width: calc(100% - 50px);
    margin-right: 10px;
  }
  .crumbs {
    display: flex;
  }
  .crumbs li {
    &.is-current {
      & a {
        text-wrap: nowrap;
      }
    }
    &:not(.is-current) {
      &::after {
        padding-left: 0.25rem;
      }
    }
  }
}

@media screen and (max-width: 640px) {
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

  .controls-list {
    position: absolute;
  }

  .toc-area-aside {
    display: none;
  }

  .toc-aside-is-opened #aside {
    width: 100%;
  }

  .toc-aside-is-opened .toc-area-aside {
    position: absolute;
    z-index: 12;
    width: 90vw;
  }

  .toc-area .toc-area-content nav > ol.tree {
    columns: 1;
  }

  div.remove-bottom-padding #article {
    padding: 40px var(--mobile-margin) 10px !important;
  }

  #article .byline {
    margin: 15px 0 50px;
  }

  #article h1 {
    font-size: 30px;
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
  .tooltip {
    display: none;
  }

  .controls {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    background-color: transparent;
  }

  .controls-list {
    display: none;
    flex-direction: column;
  }

  .controls-list.is-opened {
    position: absolute;
    top: 64px;

    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .controls button.controls-toggle {
    display: flex;
    margin-left: 0; /* annule margin-left: auto */
    order: 2;       /* met le bouton à droite */
    max-height: 40px;
    margin-top: 0.5ex;
    margin-bottom: 0.5ex;
  }

  .controls-list {
    flex-direction: row;
    margin-left: 40px;
    order: 1; /* liste avant le bouton */
  }
}

</style>