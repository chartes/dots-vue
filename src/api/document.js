const _baseApiURL = `${import.meta.env.VITE_APP_DTS_ENDPOINT_URL}`

async function getCoverDataFromApi (id, options = {}) {
  const response_coverData = await fetch(`${_baseApiURL}/cover?id=${id}`, { mode: 'cors', ...options })
  const coverData = await response_coverData.text()
  console.log('document.js getCoverDataFromApi response_coverData ', response_coverData)
  return coverData
}

async function getMetadataFromApi (id, options = {}) {
  let response_metadata = {}
  /*if (id === 'elec' || id === 'dots_demo_root') {
    response_metadata = await fetch(`${_baseApiURL}/collection`, { mode: 'cors', ...options })
  } else */if (!id) {
    response_metadata = await fetch(`${_baseApiURL}/collection`, { mode: 'cors', ...options })
  } else {
    response_metadata = await fetch(`${_baseApiURL}/collection?id=${id}`, { mode: 'cors', ...options })
  }
  const metadata = await response_metadata.json()
  return metadata
}

async function getDocumentFromApi (id, excludeFragments = false, mediaType, options = {}) {
  // TODO : default is document route without mediatype and if mediatype is provided include it
  console.log('Document.vue', `${_baseApiURL}/document?resource=${id}&mediaType=${mediaType}&excludeFragments=${excludeFragments}`)
  const response = await fetch(`${_baseApiURL}/document?resource=${id}&mediaType=${mediaType}&excludeFragments=${excludeFragments}`, { mode: 'cors', ...options })
  // const response = await fetch(`${_baseApiURL}/document?resource=${id}&mediaType=html`, {mode: 'cors', ...options})
  const document = response.text()
  // console.log("Document.vue document", document)
  return document
}

async function getTOCFromApi (id, type = 'Resource', options = {}) {
  if (type === 'Resource') {
    const response = await fetch(`${_baseApiURL}/navigation?resource=${id}&down=-1`, { mode: 'cors', ...options })
    const document = await response.json()
    return document
  } else {
    const response = await fetch(`${_baseApiURL}/collection?id=${id}`, { mode: 'cors', ...options })
    const document = await response.json()
    return document
  }
}

async function getParentFromApi (id, options = {}) {
  const response = await fetch(`${_baseApiURL}/collection?id=${id}&nav=parents`, { mode: 'cors', ...options })
  const document = await response.json()
  console.log('document.js getParentFromApi response', document)
  return document
}

async function getProjectFromApi (id, options = {}) {
  let rootCollection = {}
  let rootCollectionId = ''
  let projectId = ''
  if (`${import.meta.env.VITE_APP_ROOT_DTS_COLLECTION_ID}`) {
    rootCollectionId = `${import.meta.env.VITE_APP_ROOT_DTS_COLLECTION_ID}`
    rootCollection = await getMetadataFromApi()
  } else {
    rootCollectionId = await getMetadataFromApi().then((response) => { return response['@id'] })
    rootCollection = await getMetadataFromApi()
  }
  console.log('document.js get getProjectFromApi rootCollection', rootCollection)
  console.log('document.js get getProjectFromApi rootCollectionId', rootCollectionId)
  let loopId = id
  while (rootCollectionId !== loopId) {
    const response = await fetch(`${_baseApiURL}/collection?id=${loopId}&nav=parents`, { mode: 'cors', ...options })
    const document = await response.json()
    console.log('document.js get getProjectFromApi document', document)
    if (document.member) {
      loopId = document.member[0]['@id']
    } else {
      loopId = document['@id']
      console.log('document.js get getProjectFromApi loopId = document[\'@id\']', document['@id'])
      break
    }
  }
  projectId = loopId
  console.log('document.js get getProjectFromApi projectId', projectId)
  /*const response = await fetch(`${_baseApiURL}/collection?id=${id}&nav=parents`, { mode: 'cors', ...options })
  const document = await response.json()
  console.log('document.js getParentFromApi response', document)*/
  return projectId
}

// remove ENCPOS for theatre `${_baseApiURL}/collection?id=ENCPOS_${id}
async function getPositionAnneeFromApi (id, options = {}) {
  const response = await fetch(`${_baseApiURL}/collection?id=ENCPOS_${id}`, { mode: 'cors', ...options })
  const document = await response.json()
  return document
}
// replace ENCPOS by theatre for theatre
async function getMetadataENCPOSFromApi (project, options = {}) {
  console.log('getMetadataENCPOSFromApi', project)
  const response = await fetch(`${_baseApiURL}/collection?id=${project}`, { mode: 'cors', ...options })
  const document = await response.json()
  return document
}

export {
  getCoverDataFromApi,
  getDocumentFromApi,
  getMetadataFromApi,
  getTOCFromApi,
  getParentFromApi,
  getProjectFromApi,
  getPositionAnneeFromApi,
  getMetadataENCPOSFromApi
}
