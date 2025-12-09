<template>
  <div class="wrapper">
    <div
      class="row"
      :class="currentLevelIndicator === 'renderToc' ? 'remove-bottom-padding' : ''"
    >
      <Suspense @resolve="scrollTo()">
        <component :is="customDocument" />
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
import { defineAsyncComponent, ref, watch } from 'vue'
import { getCoverDataFromApi, getDocumentFromApi } from '@/api/document'
import { useRoute } from 'vue-router'
import TOC from '@/components/TOC.vue'
import router from '@/router'

export default {
  name: 'DocumentSource',
  components: {
    TOC
  },

  props: ['id', 'level', 'editoriallevel', 'bottomtoc', 'maxcitedepth', 'documenttype', 'editorialLevelIndicator', 'isDocProjectIdIncluded', 'mediaTypeEndpoint', 'collectionCss', 'projectIdentifier', 'iiifManifest'],

  async setup (props) {
    // Declare route to capture route hash (used in scrollTo()) to display selected Table Of Content items below the editorial level
    const route = useRoute()
    const isDocProjectIdInc = ref(props.isDocProjectIdIncluded)
    const mediaType = ref(props.mediaTypeEndpoint)
    const docProjectId = ref(props.projectIdentifier)
    const manifest = ref(props.iiifManifest)
    const collCss = ref(props.collectionCss)
    console.log('Document.vue mediaType', mediaType.value)
    console.log('Document.vue collCss', collCss.value)
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

    // Content fetched here will vary whether the selected item is a resource or a collection
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
            data = await getDocumentFromApi(parentId.value, true, mediaType.value)
          }
        } else if (currentLevelIndicator.value === 'toEdit' && documentType.value === 'Resource') {
          console.log("Document.vue currentLevelIndicator.value === \"toEdit\" && documentType.value === 'Resource'", currentLevelIndicator.value === 'toEdit' && documentType.value === 'Resource')
          data = await getDocumentFromApi(parentId.value, false, mediaType.value)
          //  console.log('Document.vue data', data)
        } else {
          console.log('Document.vue else')
          return
        }
      } else if (currentLevel.value < editorialLevel.value && documentType.value === 'Resource') {
        // Selected level is a resource but hierarchically an ancestor of the editorial level : use the excludeFragment DoTS API response
        console.log('Document.vue get excludeFragments=(true) currentLevel.value < editorialLevel.value', currentLevel.value < editorialLevel.value && documentType.value === 'Resource')
        data = await getDocumentFromApi(parentId.value, true, mediaType.value)
        // Selected level is a resource at the editorial level : use the full DoTS API response (and not excludeFragment)
      } else if (editorialLevel.value === currentLevel.value && documentType.value === 'Resource') {
        console.log("Document.vue get excludeFragments=(false) editorialLevel.value === currentLevel.value && documentType === 'Resource'", editorialLevel.value === currentLevel.value && documentType.value === 'Resource')
        data = await getDocumentFromApi(parentId.value, false, mediaType.value)
        // Otherwise the selected level is a collection (no DoTS API /document response) : do not fetch
      } else {
        console.log('Document.vue else')
        return
      }

      console.log('Document.vue getDocumentFromApi(parentId.value)', parentId.value)
      // Build a temporary dom just to ease the navigation inside the document
      const tmpDom = document.createElement('div')
      let datatei = ''
      tmpDom.innerHTML = data
      // Customize the template with some vue components and code

      // Generate PageBreak components for each iiif canvas link encoded in the DoTS response
      console.log('Document.vue finding pb facs with iiif', tmpDom.querySelectorAll('a.pb[href*="iiif"]'))

      if (mediaType.value === 'html' && manifest.value) {
        const allPageBeginning = Array.from(tmpDom.querySelectorAll('a.pb[href*="iiif"]'))
        console.log('allPageBeginningHTML', allPageBeginning)
        for (let i = 0; i < allPageBeginning.length; i++) {
          const previous = allPageBeginning[i - 1]
          const current = allPageBeginning[i]
          console.log('allPageBeginningHTML previous current', previous, current, current.previousElementSibling ? current.previousElementSibling.tagName : 'no previousElementSibling')
          // We only add one thumbnail (page-break component) for each line group (lg), and we select the first one. To achieve this:
          // 1. check if there is a previous pb (if not, this is the first one) -> creating page-break component
          // 2. check if there is a previous sibling (if not, this is the first pb of the current lb) -> creating page-break component
          // 3. if there is a previous sibling, check that it is not a page-break (if not, this is the first pb of the current lb) -> creating page-break component
          if (!previous || !current.previousElementSibling || (current.previousElementSibling && current.previousElementSibling.tagName !== 'PAGE-BREAK')) {
            const container = document.createElement('div')
            // console.log('Document.vue html manifest : ', manifest.value.items.filter(cvs => cvs.items[0].items[0].body.id === current.href)[0].id)
            const canvasId = manifest.value.items.filter(cvs => cvs.items[0].items[0].body.id === current.href)[0].id
            const frameNum = manifest.value.items.findIndex(cvs => cvs.items[0].items[0].body.id === current.href)
            container.innerHTML = `<page-break canvas-id="${canvasId}" canvas-num="${frameNum}" image="${current.href}"/>`
            // Replace the link with a PageBreak component
            current.parentNode.replaceChild(container.firstChild, current)
          } else if (current.previousElementSibling && current.previousElementSibling.tagName === 'PAGE-BREAK') {
            // console.log('allPageBeginningHTML removing current ', current)
            current.parentNode.removeChild(current)
          }
        }
        const allFigures = Array.from(tmpDom.querySelectorAll('.lg figure'))
        console.log('allFiguresHTML', allFigures)
        for (let i = 0; i < allFigures.length; i++) {
          const previous = allFigures[i - 1]
          const current = allFigures[i]
          console.log('allFiguresHTML previous current', previous, current, current.previousElementSibling ? current.previousElementSibling.tagName : 'no previousElementSibling')
          // We only add one thumbnail (page-break component) for each line group (lg), and we select the first one. To achieve this:
          // 1. check if there is a previous figure (if not, this is the first one) -> selecting the first img only and creating page-break component
          // 2. check if there is a previous sibling (if not, this is the first figure of the current lb) -> selecting the first img only and creating page-break component
          // 3. if there is a previous sibling, check that it is not a page-break (if not, this is the first figure of the current lb) -> selecting the first img only and creating page-break component
          if (!previous || !current.previousElementSibling || (current.previousElementSibling && current.previousElementSibling.tagName !== 'PAGE-BREAK')) {
            const container = document.createElement('div')
            // console.log('allFiguresHTML current.querySelectorAll(\'a img[src*="iiif"]:first-of-type\')', current.querySelectorAll('a img')[0])
            // console.log('Document.vue html manifest : ', manifest.value.items.filter(cvs => cvs.items[0].items[0].body.id === current.querySelectorAll('a img')[0].src)[0].id)
            const canvasId = manifest.value.items.filter(cvs => cvs.items[0].items[0].body.id === current.querySelectorAll('a img')[0].src)[0].id
            const frameNum = manifest.value.items.findIndex(cvs => cvs.items[0].items[0].body.id === current.querySelectorAll('a img')[0].src)
            container.innerHTML = `<page-break canvas-id="${canvasId}" canvas-num="${frameNum}" image="${current.querySelectorAll('a img')[0].src}"/>`
            // Replace the link with a PageBreak component
            current.parentNode.replaceChild(container.firstChild, current)
          } else if (current.previousElementSibling && current.previousElementSibling.tagName === 'PAGE-BREAK') {
            current.parentNode.removeChild(current)
          }
        }
      }

      // Treat api tei as tei and transform it as xml:
      if (mediaType.value === 'tei' && currentLevelIndicator.value === 'toEdit') {
        // Parse the TEI XML string as XML, not HTML
        const xmlDoc = new DOMParser().parseFromString(data, 'application/xml')

        // Ensure no XML parsing errors
        const parserError = xmlDoc.getElementsByTagName('parsererror')
        if (parserError.length > 0) {
          console.error('Error parsing XML:', parserError[0].textContent)
          return
        }

        // Get all <pb> elements (page breaks)
        console.log('finding pbs tei', xmlDoc.getElementsByTagName('pb'))
        console.log('finding pbs tei with IIIF facs', Array.from(xmlDoc.querySelectorAll('pb[facs]')).filter(el => el.getAttribute('facs').includes('iiif')))
        const pbElements = Array.from(xmlDoc.querySelectorAll('pb[facs]')).filter(el => el.getAttribute('facs').includes('iiif'))
        console.log('pbElements :', pbElements)
        const firstPb = pbElements.length ? pbElements[0].getAttribute('n') : null
        const lastPb = pbElements.length ? pbElements.slice(-1)[0].getAttribute('n') : null
        console.log('finding pbs tei with IIIF facs first and last pb', firstPb, lastPb)

        console.log('allPageBeginningTEI', pbElements)
        for (let i = 0; i < pbElements.length; i++) {
          const previous = pbElements[i - 1]
          const current = pbElements[i]
          // console.log('allPageBeginningTEI previous current', previous, current, current.previousElementSibling ? current.previousElementSibling + '\n' + current.previousElementSibling.tagName : 'no previousElementSibling')
          // We only add one thumbnail (page-break component) for each line group (lg), and we select the first one. To achieve this:
          // 1. check if there is a previous pb (if not, this is the first one) -> creating page-break component
          // 2. check if there is a previous sibling (if not, this is the first pb of the current lb) -> creating page-break component
          // 3. if there is a previous sibling, check that it is not a page-break (if not, this is the first pb of the current lb) -> creating page-break component
          if (!previous || !current.previousElementSibling || (current.previousElementSibling && current.previousElementSibling.tagName !== 'page-break')) {
            const container = xmlDoc.createElement('div')
            const facs = current.getAttribute('facs')
            // console.log('Document.vue allPageBeginningTEI tei iiif test manifest.value / facs: ', manifest.value, facs)
            const canvasId = manifest.value ? manifest.value.items.filter(cvs => cvs.items[0].items[0].body.id === facs)[0].id : ''
            // console.log('Document.vue allPageBeginningTEI tei iiif canvasId : ', canvasId)
            const frameNum = manifest.value ? manifest.value.items.findIndex(cvs => cvs.items[0].items[0].body.id === facs) : 1
            container.innerHTML = `<page-break canvas-id="${canvasId}" canvas-num="${frameNum}" image="${facs}"/>`
            current.parentNode.replaceChild(container.firstChild, current)
          } else if (current.previousElementSibling && current.previousElementSibling.tagName === 'page-break') {
            // console.log('allPageBeginningTEI removing current ', current)
            current.parentNode.removeChild(current)
          }
        }

        const allFigures = Array.from(xmlDoc.querySelectorAll('lg figure'))
        console.log('allFiguresTEI', allFigures)
        for (let i = 0; i < allFigures.length; i++) {
          const previous = allFigures[i - 1]
          const current = allFigures[i]
          console.log('allFiguresTEI previous current', previous, current, current.previousElementSibling ? current.previousElementSibling.tagName : 'no previousElementSibling')
          // We only add one thumbnail (page-break component) for each line group (lg), and we select the first one. To achieve this:
          // 1. check if there is a previous figure (if not, this is the first one) -> selecting the first graphic only and creating page-break component
          // 2. check if there is a previous sibling (if not, this is the first figure of the current lb) -> selecting the first graphic only and creating page-break component
          // 3. if there is a previous sibling, check that it is not a page-break (if not, this is the first figure of the current lb) -> selecting the first graphic only and creating page-break component
          if (!previous || !current.previousElementSibling || (current.previousElementSibling && current.previousElementSibling.tagName !== 'page-break')) {
            const container = xmlDoc.createElement('div')
            // console.log('allFiguresTEI current.querySelectorAll(\'graphic\')[0].getAttribute(\'url\')', current.querySelectorAll('graphic')[0].getAttribute('url'))
            // console.log('Document.vue html manifest : ', manifest.value.items.filter(cvs => cvs.items[0].items[0].body.id === current.querySelectorAll('graphic')[0].getAttribute('url')).id)
            const canvasId = manifest.value ? manifest.value.items.filter(cvs => cvs.items[0].items[0].body.id === current.querySelectorAll('graphic')[0].getAttribute('url')).id : ''
            const frameNum = manifest.value ? manifest.value.items.findIndex(cvs => cvs.items[0].items[0].body.id === current.querySelectorAll('graphic')[0].getAttribute('url')) : 1
            container.innerHTML = `<page-break canvas-id="${canvasId}" canvas-num="${frameNum}" image="${current.querySelectorAll('graphic')[0].getAttribute('url')}"/>`
            // Replace the link with a PageBreak component
            current.parentNode.replaceChild(container.firstChild, current)
          } else if (current.previousElementSibling && current.previousElementSibling.tagName === 'page-break') {
            // console.log('allFiguresTEI removing current ', current)
            current.parentNode.removeChild(current)
          }
        }

        const titleElements = Array.from(xmlDoc.getElementsByTagName('title'))
        titleElements.forEach((hd, index) => {
          const titleTEI = xmlDoc.createElement('tei:title')
          titleTEI.setAttribute('xmlns:tei', 'http://www.tei-c.org/ns/1.0')
          while (hd.firstChild) {
            titleTEI.appendChild(hd.firstChild)
          }

          hd.parentNode.replaceChild(titleTEI, hd)
        })
        // Select all <dts:wrapper> elements (with or without namespace)
        const wrapperElements = Array.from(xmlDoc.getElementsByTagName('dts:wrapper'))
        wrapperElements.forEach(wrapper => {
          const parent = wrapper.parentNode
          // Move all children of <dts:wrapper> into its parent before the wrapper
          while (wrapper.firstChild) {
            parent.insertBefore(wrapper.firstChild, wrapper)
          }
          // Remove the now-empty <dts:wrapper> tag
          parent.removeChild(wrapper)
        })

        // 2. Create a namespace resolver
        const nsResolver = function (prefix) {
          const ns = {
            xml: 'http://www.w3.org/XML/1998/namespace'
          }
          return ns[prefix] || null
        }

        // 3. Use XPath to select all elements with an xml:id attribute
        const xpathResult = xmlDoc.evaluate('//*[@xml:id]', xmlDoc, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)

        // 4. Loop through matching nodes and copy xml:id to id
        for (let i = 0; i < xpathResult.snapshotLength; i++) {
          const node = xpathResult.snapshotItem(i)
          const xmlId = node.getAttributeNS('http://www.w3.org/XML/1998/namespace', 'id')
          if (xmlId) {
            node.setAttribute('id', xmlId) // for anchor navigation
          }
        }
        datatei = xmlDoc
      }
      // Remove the xslt generated left-hand side TOC (used in other ENC's apps but not here)
      if (tmpDom.querySelector('#aside') !== null) {
        tmpDom.querySelector('#aside').remove()
      }
      console.log('custom document datatei', datatei)
      // Return what will make the async component
      return new Promise((resolve) => {
        const doc = new DOMParser().parseFromString(tmpDom.innerHTML, 'text/html')
        console.log('custom document html', doc, mediaType.value === 'html' || (currentLevel.value === 0 && currentLevelIndicator.value === 'renderToc') ? doc.getElementById('center').innerHTML : 'not html')
        console.log('custom document tei', datatei, mediaType.value === 'tei' && currentLevelIndicator.value === 'toEdit' ? datatei.getElementsByTagName('tei')[0] : 'not tei')
        if (mediaType.value === 'html' || (currentLevel.value === 0 && currentLevelIndicator.value === 'renderToc')) {
          console.log('custom document cas 0', doc.getElementById('center').innerHTML)
          resolve({
            template: doc.getElementById('center').innerHTML
          })
        } else if (currentLevel.value === 0 && mediaType.value === 'tei' && currentLevelIndicator.value === 'toEdit' && documentType.value === 'Resource') {
          const serializer = new XMLSerializer()
          const updatedXMLString = serializer.serializeToString(datatei)
          console.log('custom document cas 1', updatedXMLString)
          const TEI_NS = 'http://www.tei-c.org/ns/1.0'
          resolve({
            template: datatei.getElementsByTagNameNS(TEI_NS, 'TEI')[0].outerHTML
          })
        } else if (currentLevel.value > 0 && mediaType.value === 'tei' && currentLevelIndicator.value === 'toEdit' && documentType.value === 'Resource') {
          console.log('custom document cas 2 test')
          const fragment = datatei.getElementsByTagName('TEI')[0].outerHTML
          console.log('custom document cas 2', fragment)
          resolve({
            template: fragment
          })
        }
      })
    })

    function scrollTo () {
      // console.log('custom document', customDocument, typeof (customDocument))
      // If the selected item is an anchor, capture and scroll to that anchor
      const hash = route.hash ? route.hash.replace('#', '') : ''
      console.log('Document.vue scrollTo on resolve hash : ', hash)
      console.log('Document.vue scrollTo on resolve route : ', route)
      console.log('Document.vue scrollTo on resolve router : ', router)
      if (hash.length > 0) {
        // bump the hash to ensure change detection
        // const bumpPath = `${import.meta.env.VITE_APP_APP_ROOT_URL}`.length <= 1 ? `${router.currentRoute.value.fullPath.split('#')[0]}#${hash}` : `${import.meta.env.VITE_APP_APP_ROOT_URL}${router.currentRoute.value.fullPath.split('#')[0]}#${hash}`
        // history.replaceState(null, '', bumpPath)

        // target element and scroll
        const el = document.getElementById(hash)
        if (el) {
          const yOffset = -70
          const y = el.getBoundingClientRect().top + window.scrollY + yOffset
          console.log('Document.vue scrollTo y : ', y)
          window.scrollTo({ top: y, behavior: 'instant' })
        }
      } else {
        // Scroll to top if no anchor
        console.log('Document.vue no anchor scrollTo Page TOP')
        window.scrollTo({ top: 0, behavior: 'instant' })
      }
    }
    watch(props, (newProps) => {
      docProjectId.value = newProps.projectIdentifier
      manifest.value = newProps.iiifManifest
      mediaType.value = newProps.mediaTypeEndpoint
      console.log('Document.vue watch newProps.projectIdentifier / docProjectId.value : ', docProjectId.value)
      console.log('Document.vue watch newProps.mediaTypeEndpoint / mediaType.value : ', mediaType.value)
    }, { immediate: true })

    return {
      isDocProjectIdInc,
      docProjectId,
      manifest,
      mediaType,
      collCss,
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
<style>
  @import '@/assets/css/tei.css';
</style>
<style src="@/assets/css/postprod.css" />
