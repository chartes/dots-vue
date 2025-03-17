<template>
  <div v-if="isModalOpened" class="modal-mask" :class="modalCssClass">
    <div class="modal-wrapper">
      <div class="modal-container" ref="target">
        <div class="modal-header">
          <span class="modal-header-section">Collection :</span>
          <span class="modal-header-title">
            {{ currentCollection.title }}
          </span>
          <a href="#" class="close-btn" v-on:click="toggleContent"></a>
        </div>
        <div>
          <document-metadata
            :ispopup="true"
            :metadataprop="currentCollection"
            class="metadata-area app-width-margin"
          />
        </div>
        <div class="modal-body">
          <div class="modal-body-header">
            <span class="modal-body-header-section">Sommaire </span>
            <span class="modal-body-header-title">Parcourir la collection </span>
            <a href="#" class="toggle-btn" v-on:click.prevent="toggleExpanded(collectionId)"></a>
          </div>
        </div>
        <div v-if="currentCollection.member.length > 0"
          class="menu"
          :class="expandedById[collectionId] ? 'expanded': ''"
        >
          <div v-if="expandedById[collectionId] && collectionTOC.filter(item => item.identifier === collectionId)[0].children.length > 0">
            <CollectionTOC
              :is-doc-projectId-included="isDocProjectIdInc"
              :margin="0"
              :toc="collectionTOC.filter(item => item.identifier === collectionId)[0].children"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { computed, reactive, ref, watch } from 'vue'
import DocumentMetadata from '@/components/DocumentMetadata.vue'
import { getMetadataFromApi } from '@/api/document.js'
import CollectionTOC from '@/components/CollectionTOC.vue'

export default {
  components: { CollectionTOC, DocumentMetadata },
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    isDocProjectIdIncluded: {
      type: Boolean,
      required: true
    },
    collectionIdentifier: {
      type: String,
      required: true
    },
    toc: {
      type: Object,
      required: true
    },
    currentItem: {
      type: Object,
      required: true
    }
  },
  emits: [
    'change'
  ],
  setup (props, context) {
    const state = reactive({
      isTreeOpened: props.toc.filter(item => item.identifier === props.collectionIdentifier)[0].expanded
    })

    const isModalOpened = ref(props.isOpen)
    const isDocProjectIdInc = ref(props.isDocProjectIdIncluded)
    const collectionTOC = ref(props.toc)
    console.log('CollectionModal props.toc : ', props.toc)

    const collectionId = ref(props.collectionIdentifier)
    console.log('CollectionModal props.collectionIdentifier : ', props.collectionIdentifier)

    const currentCollection = ref(props.currentItem)
    console.log('CollectionModal props.currentItem : ', props.currentItem)

    /* collectionTOC.value.filter(item => item.identifier === collectionId.value)[0].member = collectionTOC.value.filter(item => item.identifier === collectionId.value)[0].member.forEach((m) => m.parent = currentCollection.value.identifier)
    console.log("CollectionModal append parent to collectionTOC : ", collectionTOC.value) */

    const appendMissingChildren = async () => {
      if (collectionTOC.value.filter(item => item.identifier === collectionId.value)[0].children.length !== collectionTOC.value.filter(item => item.identifier === collectionId.value)[0].totalChildren) {
        console.log('CollectionModal collectionTOC has missing children')
        const response = await getMetadataFromApi(collectionId.value)
        console.log('CollectionModal response / response.member :', response, response.member)
        response.member = response.member.map(obj => {
          const updatedMember = {
            identifier: obj.identifier ? obj.identifier : obj['@id'],
            citeType: obj['@type'] ? obj['@type'] : obj.citeType,
            expanded: currentCollection.value.expanded,
            title: obj.title,
            level: currentCollection.value.level,
            editorialLevelIndicator: currentCollection.value.editorialLevelIndicator,
            totalChildren: obj.totalChildren,
            children: obj.children ? obj.children : obj.member ? obj.member : [],
            member: obj.member ? obj.member : [],
            parent: currentCollection.value.identifier,
            dublincore: obj.dublincore,
            extensions: obj.extensions
          }
          return updatedMember
        })
        console.log('CollectionModal updated response.member :', response.member)
        response.member.forEach(m => {
          const index = collectionTOC.value.filter(item => item.identifier === collectionId.value)[0].children.findIndex(o => o.identifier === m.identifier)
          console.log('CollectionModal missing children ? m / index /  collectionTOC.value :', m, index, collectionTOC.value.filter(item => item.identifier === collectionId.value)[0].children)
          if (index === -1) {
            // collectionTOC.value.filter(item => item.identifier === collectionId.value)[0].member.push(m)
            collectionTOC.value.filter(item => item.identifier === collectionId.value)[0].children.push(m)
          } else {
            collectionTOC.value.filter(item => item.identifier === collectionId.value)[0].children[index] = m
          }
          /* if (!collectionTOC.value.filter(item => item.identifier === collectionId.value)[0].member.some(mInToc => mInToc.identifier === m.identifier)) {
            //collectionTOC.value.filter(item => item.identifier === collectionId.value)[0].member.push(m)
            collectionTOC.value.filter(item => item.identifier === collectionId.value)[0].children.push(m)
          } */
        })
      }
    }
    appendMissingChildren()

    console.log('CollectionModal collectionTOC / collectionId : ', Object.fromEntries(collectionTOC.value.filter(item => item.identifier === collectionId.value).map(col => [col.identifier, false])), collectionTOC.value, collectionId, currentCollection)
    const target = ref(null)

    const expandedById = ref(false)

    const toggleExpanded = async (collId) => {
      console.log('Modal toggleExpanded', collectionTOC.value.filter(item => item.identifier === collId)[0].children)
      // Add all members to the expanded collection
      const response = await getMetadataFromApi(collId)
      console.log('Modal toggleExpanded response', response, response.member.forEach((i) => { i.identifier = i['@id'] }))
      response.member.forEach(m => {
        const index = collectionTOC.value.filter(item => item.identifier === collId)[0].children.findIndex(o => o.identifier === m.identifier)
        if (index === -1) {
          // collectionTOC.value.filter(item => item.identifier === collId)[0].member.push(m)
          collectionTOC.value.filter(item => item.identifier === collId)[0].children.push(m)
        }

        /* if (!collectionTOC.value.filter(item => item.identifier === collId)[0].member.some(mInToc => mInToc.identifier === m.identifier)) {
          collectionTOC.value.filter(item => item.identifier === collId)[0].member.push(m)
          collectionTOC.value.filter(item => item.identifier === collId)[0].children.push(m)
        } */
      })
      // collectionTOC.value.filter(item => item.identifier === collId)[0].member = response.member
      // collectionTOC.value.filter(item => item.identifier === collId)[0].children = response.member
      console.log('collectionTOC.value', collectionTOC.value)

      // Add the collection to the expanded list
      expandedById.value[collId] = !expandedById.value[collId]
      // Expand the Tree
      state.isTreeOpened = !state.isTreeOpened
      console.log('toggleExpanded after expandedById[collectionId] : ', collId, expandedById.value)
    }

    expandedById.value = collectionTOC.value.filter(item => item.identifier === collectionId.value)[0].expanded === true && collectionTOC.value.filter(item => item.identifier === collectionId.value)[0].children.length === 0
    ? Object.fromEntries(collectionTOC.value.filter(item => item.identifier === collectionId.value).map(col => [col.identifier, true]))
    : Object.fromEntries(collectionTOC.value.filter(item => item.identifier === collectionId.value).map(col => [col.identifier, false]))

    if (collectionTOC.value.filter(item => item.identifier === collectionId.value)[0].expanded === true && collectionTOC.value.filter(item => item.identifier === collectionId.value)[0].children.length === 0) {
      console.log('CollectionModal test : ', collectionTOC.value.filter(item => item.identifier === collectionId.value)[0].expanded, collectionTOC.value.filter(item => item.identifier === collectionId.value)[0].children.length === 0, collectionTOC.value.filter(item => item.identifier === collectionId.value)[0].identifier, expandedById.value)
      // toggleExpanded(collectionTOC.value.filter(item => item.identifier === collectionId.value)[0].identifier)
    } else if (collectionTOC.value.filter(item => item.identifier === collectionId.value)[0].expanded === true) {
      expandedById.value = Object.fromEntries(collectionTOC.value.filter(item => item.identifier === collectionId.value).map(col => [col.identifier, true]))
    } else if (collectionTOC.value.filter(item => item.identifier === collectionId.value)[0].expanded === false) {
      expandedById.value = Object.fromEntries(collectionTOC.value.filter(item => item.identifier === collectionId.value).map(col => [col.identifier, false]))
    }

    /* expandedById.value = collectionTOC.value.find(item => item.identifier === collectionId.value).expanded === true
      ? Object.fromEntries(collectionTOC.value.filter(item => item.identifier === collectionId.value).map(col => [col.identifier, true]))
      : Object.fromEntries(collectionTOC.value.filter(item => item.identifier === collectionId.value).map(col => [col.identifier, false])) */

    console.log('CollectionModal expandedById.value : ', expandedById.value)


    const toggleContent = function (event) {
      event.preventDefault()
      event.stopPropagation()
      isModalOpened.value = !isModalOpened.value
      context.emit('change', { isModalOpened: isModalOpened.value })
      console.log('CollectionModal emit event : ', event)
    }

    const modalCssClass = computed(() => {
      return state.isTreeOpened ? 'is-tree-opened' : ''
    })

    watch(props, (newProps) => {
      isModalOpened.value = newProps.isOpen
      console.log('CollectionModal watch isOpen props isModalOpened.value : ', isModalOpened.value)
    })

    return {
      modalCssClass,
      isModalOpened,
      isDocProjectIdInc,
      appendMissingChildren,
      toggleContent,
      target,
      collectionId,
      currentCollection,
      collectionTOC,
      toggleExpanded,
      expandedById
    }
  }
}
</script>

<style scoped>
  .modal-mask {
    position: fixed;
    z-index: 9998;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
  }
  .modal-container {
    max-width: 1100px !important;
    margin: 150px auto;
    padding: 20px 30px;
    background-color: #fbf8f4;
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
    max-height: 60vh;
    overflow-y: auto;
    color: #4a4a4a;
  }
  .modal-header {
    display: flex;
    width: 100%;
    padding: 20px;
    background-color: #b8b5ad;
    border-radius: 6px;

    font-family: "Barlow Semi Condensed", sans-serif !important;
    font-size: 15px;
    font-weight: 500;
    line-height: 25px;
    letter-spacing: 0;
    text-transform: uppercase;
  }
  .modal-header span.modal-header-section {
    color: #4a4a4a;
  }
  .modal-header span.modal-header-title {
    margin-left: 40px;
    color: #161616;
    font-size: 18px;
    font-weight: 600;
    line-height: 25px;
    text-transform: none;
  }

  .modal-body {
    display: flex;
    width: 100%;
    padding: 20px;
    background-color: #e4e4e4;
    border-radius: 6px;
    position: relative;

    font-family: "Barlow Semi Condensed", sans-serif !important;
    font-size: 15px;
    font-weight: 500;
    line-height: 22px;
  }
  .is-tree-opened .modal-body {
    border-radius: 6px 6px 0 0;
  }

  .modal-body-header span.modal-body-header-section {
    margin-right: 40px;
  }
  .modal-body-header span.modal-body-header-title {
    color: #929292;
  }
  .is-tree-opened .menu {
    display: flex;
    flex-direction: column;
    padding: 0px 20px 0px;
    border-top: solid 2px #fcfcfc;
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
  /* close-btn */
  .close-btn {
    right: 20px;
    width: 27px;
    height: 27px;
    margin-left: auto;
    background: url(../assets/images/croix_blc.svg) center / cover no-repeat;
    border: none;
    text-decoration: none;
  }

</style>
