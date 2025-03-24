<template>
  <div class="wrapper">
    <div class="row" :class="currentLevelIndicator === 'renderToc' ? 'remove-bottom-padding' : ''">
      <Suspense @resolve="scrollTo()">
        <component :is="customDocument"/>
      </Suspense>
    </div>
    <!-- Display a TOC of the current item children in 2 scenarios : -->
    <!-- When the selected item is hierarchically above editorial level -->
    <div
      v-if="currentLevelIndicator === 'renderToc'"
      id="article"
      class="row bottom-toc"
    >
      <TOC
       :is-doc-projectId-included="isDocProjectIdInc"
       :margin="0"
       :toc="asideTOC"
       :maxcitedepth="maxcitedepth"
       :refid="parentId.includes('&ref=') ? parentId.split('&ref=')[1] : parentId"
       :key="parentId"
      />
    </div>
    <div
      v-else-if="!currentLevelIndicator && currentLevel < editorialLevel"
      id="article"
      class="row bottom-toc"
    >
      <TOC
       :is-doc-projectId-included="isDocProjectIdInc"
       :margin="0"
       :toc="asideTOC"
       :maxcitedepth="maxcitedepth"
       :refid="parentId.includes('&ref=') ? parentId.split('&ref=')[1] : parentId"
       :key="parentId"
      />
    </div>
    <!-- Or the specific case of Collections when editorial level & current level are 0 -->
    <!-- For example : to be able to have a TOC on Collection ENCPOS, edited at the full position level (0) -->
    <div
      v-else-if="!currentLevelIndicator && currentLevel === editorialLevel && editorialLevel === 0 && documentType === 'Collection'"
      id="article"
      class="row bottom-toc"
    >
      <TOC
        :is-doc-projectId-included="isDocProjectIdInc"
        :margin="0"
        :toc="asideTOC"
        :maxcitedepth="maxcitedepth"
        :refid="parentId.includes('&ref=') ? parentId.split('&ref=')[1] : parentId"
        :key="parentId"
      />
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent, ref } from 'vue'
import { getCoverDataFromApi, getDocumentFromApi } from '@/api/document'
import { useRoute } from 'vue-router'
import TOC from '@/components/TOC.vue'
import router from "@/router";

const VITE_APP_IIIF_URL = `${import.meta.env.VITE_APP_IIIF_URL}`

export default {
  name: 'Document',
  components: {
    TOC
  },

  props: ['id', 'level', 'editoriallevel', 'bottomtoc', 'maxcitedepth', 'documenttype', 'editorialLevelIndicator', 'isDocProjectIdIncluded'],

  async setup (props) {
    // Declare route to capture route hash (used in scrollTo()) to display selected Table Of Content items below the editorial level
    const route = useRoute()
    const isDocProjectIdInc = ref(props.isDocProjectIdIncluded)
    // The parentId will the id used for the DoTS API, it is either the resourceId or the resourceId + '&ref=' + refId
    // TODO: rename to a more appropriate name : it is the id used for Dots API : dotsID ?
    const parentId = ref(props.id)
    console.log('Document.vue const props.id / parentId', props.id, parentId)
    // Content fetched here will depend on the selected TOC item vs editorial level
    const currentLevelIndicator = ref(props.editorialLevelIndicator)
    console.log('Document.vue const currentLevelIndicator', currentLevelIndicator)

    const currentLevel = ref(props.level)
    console.log('Document.vue const currentLevel', currentLevel)

    const editorialLevel = ref(props.editoriallevel)
    console.log('Document.vue const editorialLevel', editorialLevel)

    // Content fetched here will depend whether the selected item is a resource or a collection
    const documentType = ref(props.documenttype)
    console.log('Document.vue const documenttype', documentType)

    // For items hierarchically above the editorial level, display the item TOC
    const asideTOC = ref(props.bottomtoc)
    console.log('Document.vue const asideTOC', props.bottomtoc)
    // Required for the TOC component
    console.log('Document.vue props.maxcitedepth', props.maxcitedepth)

    // Declare the async component (displayed content)
    // let customDocument = loadDoc()

    // Build the async component
    const customDocument = defineAsyncComponent(async () => {
      // fetch the initial template, depending on the selected level compared to the editorial level
      console.log('Document.vue check currentLevel vs editorialLevel', currentLevel.value, editorialLevel.value)
      let data = ''
      console.log('Document.vue loadDoc currentLevelIndicator', currentLevelIndicator.value)
      if (currentLevelIndicator.value) {
        console.log('Document.vue loadDoc currentLevelIndicator / currentLevelIndicator.value / documentType.value', currentLevelIndicator.value, documentType.value)
        if (currentLevelIndicator.value === 'renderToc' && documentType.value === 'Resource') {
          console.log("Document.vue loadDoc currentLevelIndicator.value === \"renderToc\" && documentType.value === 'Resource'", currentLevelIndicator.value === 'renderToc' && documentType.value === 'Resource')
          if (currentLevel.value === 0) {
            console.log('loadDoc currentLevel.value === 0 : get cover', currentLevel.value)
            data = await getCoverDataFromApi(parentId.value)
            console.log('Document.vue loadDoc cover getCoverDataFromApi(parentId.value)', data)
          } else {
            console.log('Document.vue loadDoc currentLevel.value !== 0 : do not get cover but exclude fragments', currentLevel.value)
            data = await getDocumentFromApi(parentId.value, true)
          }
        } else if (currentLevelIndicator.value === 'toEdit' && documentType.value === 'Resource') {
          console.log("Document.vue currentLevelIndicator.value === \"toEdit\" && documentType.value === 'Resource'", currentLevelIndicator.value === 'toEdit' && documentType.value === 'Resource')
          data = await getDocumentFromApi(parentId.value, false)
          //  console.log('Document.vue data', data)
        } else {
          console.log('Document.vue else')
          return
        }
      } else if (currentLevel.value < editorialLevel.value && documentType.value === 'Resource') {
        // Selected level is a resource but hierarchically an ancestor of the editorial level : use the excludeFragment DoTS API response
        console.log('Document.vue get excludeFragments=(true) currentLevel.value < editorialLevel.value', currentLevel.value < editorialLevel.value && documentType.value === 'Resource')
        data = await getDocumentFromApi(parentId.value, true)
        // Selected level is a resource at the editorial level : use the full DoTS API response (and not excludeFragment)
      } else if (editorialLevel.value === currentLevel.value && documentType.value === 'Resource') {
        console.log("Document.vue get excludeFragments=(false) editorialLevel.value === currentLevel.value && documentType === 'Resource'", editorialLevel.value === currentLevel.value && documentType.value === 'Resource')
        data = await getDocumentFromApi(parentId.value, false)
        // Otherwise the selected level is a collection (no DoTS API /document response) : do not fetch
      } else {
        console.log('Document.vue else')
        return
      }

      console.log('Document.vue getDocumentFromApi(parentId.value)', parentId.value)
      // Build a temporary dom just to ease the navigation inside the document
      const tmpDom = document.createElement('div')
      tmpDom.innerHTML = data

      // Customize the template with some vue components and code

      // Generate PageBreak components for each iiif canvas link encoded in the DoTS response
      let frameNum = 1
      tmpDom.querySelectorAll('a.pb.facs').forEach((a) => {
        const container = document.createElement('div')
        // TODO: gérer ce lowercase un peu gênant
        const canvadId = `${VITE_APP_IIIF_URL}/${props.id.toLowerCase()}/canvas/f${frameNum}`
        container.innerHTML = `<page-break canvas-id="${canvadId}" canvas-num="${frameNum}" image="${a.href}"/>`
        frameNum += 1
        // Replace the link with a PageBreak component
        a.parentNode.replaceChild(container.firstChild, a)
      })

      // Remove the xslt generated left-hand side TOC (used in other ENC's apps but not here)
      if (tmpDom.querySelector('#aside') !== null) {
        tmpDom.querySelector('#aside').remove()
      }

      // Return what will make the async component
      return new Promise((resolve) => {
        const doc = new DOMParser().parseFromString(tmpDom.innerHTML, 'text/html')
        // console.log('custom document', doc, doc.getElementById('center').innerHTML)
        resolve({
          template: doc.getElementById('center').innerHTML
        })
      })
    })

    function scrollTo () {
      // console.log('custom document', customDocument, typeof (customDocument))
      // If the selected item is an anchor, capture and scroll to that anchor
      const hash = route.hash ? route.hash.replace('#', '') : ''
      console.log('Document.vue scrollTo on resolve hash : ', hash)
      console.log('Document.vue scrollTo on resolve route : ', route)
      console.log('Document.vue scrollTo on resolve router : ', router)
      if (hash.length) {
        location.hash = hash
      }
    }

    return {
      isDocProjectIdInc,
      parentId,
      currentLevelIndicator,
      currentLevel,
      editorialLevel,
      documentType,
      asideTOC,
      customDocument,
      scrollTo
    }
  }
}
</script>

<style src="@/assets/css/html.css" id="document-html-css">
.wrapper {
  display: flex;
  flex-direction: row;
}

header {
  clear: both;
  padding: 1ex;
  border: dashed #ccc 1px;
  -webkit-border-radius: 1ex;
  -moz-border-radius: 1ex;
  border-radius: 1ex;
}
.bottom-toc {
  padding: 0 10% 10% 120px;
  border-bottom: 1px dotted #ffffff;
  min-height: 100%;
}
</style>
<style src="@/assets/css/postprod.css"/>
