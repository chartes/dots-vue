const _baseApiURL = `${import.meta.env.VITE_APP_DTS_ENDPOINT_URL}`

async function getCoverDataFromApi (id, options = {}) {
  const response_coverData = await fetch(`${_baseApiURL}/cover?id=${id}`, { mode: 'cors', ...options })
  const coverData = await response_coverData.text()
  console.log('document.js getCoverDataFromApi response_coverData ', response_coverData)
  return coverData
}

async function getMetadataFromApi (id, options = {}) {
  let response_metadata = {}
  if (id === 'elec') {
    response_metadata = await fetch(`${_baseApiURL}/collection`, { mode: 'cors', ...options })
  } else if (!id) {
    response_metadata = await fetch(`${_baseApiURL}/collection`, { mode: 'cors', ...options })
  } else {
    response_metadata = await fetch(`${_baseApiURL}/collection?id=${id}`, { mode: 'cors', ...options })
  }
  const metadata = await response_metadata.json()
  return metadata
}

async function getDocumentFromApi (id, excludeFragments = false, options = {}) {
  console.log('Document.vue', `${_baseApiURL}/document?resource=${id}&mediaType=html&excludeFragments=${excludeFragments}`)
  const response = await fetch(`${_baseApiURL}/document?resource=${id}&mediaType=html&excludeFragments=${excludeFragments}`, { mode: 'cors', ...options })
  // const response = await fetch(`${_baseApiURL}/document?resource=${id}&mediaType=html`, {mode: 'cors', ...options})
  const document = await response.text()
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
  getPositionAnneeFromApi,
  getMetadataENCPOSFromApi
}
