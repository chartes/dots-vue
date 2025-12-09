import { getSimpleObject } from '@/views/DocumentPage'

const _baseApiURL = `${import.meta.env.VITE_APP_DTS_ENDPOINT_URL}`

// --- Cache for getMetadataFromApi ---
const metadataCache = new Map()
const metadataPromiseCache = new Map()
const ROOT_KEY = Symbol('root')

// --- Cache for getParentFromApi ---
const parentsCache = new Map()
const parentsPromiseCache = new Map()

// -------------------------------------------------------------------------

async function getCoverDataFromApi (id, options = {}) {
  const responseCoverData = await fetch(`${_baseApiURL}/cover?id=${id}`, { mode: 'cors', ...options })
  const coverData = await responseCoverData.text()
  console.log('document.js getCoverDataFromApi responseCoverData ', responseCoverData)
  return coverData
}

async function getMetadataFromApi (id, options = {}) {
  const key = id ?? ROOT_KEY
  // console.log('getMetadataFromApi metadataCache : ', metadataCache)
  // console.log('getMetadataFromApi ROOT_KEY : ', ROOT_KEY)
  // 1. Is a promise already live for this key ? If so return cached promise
  if (metadataPromiseCache.has(key)) {
    console.log('getMetadataFromApi: returning existing promise for key:', key)
    return metadataPromiseCache.get(key)
  }

  // 2. Is metadata for this key already available in cache ? If so return cached metadata
  if (metadataCache.has(key)) {
    console.log('getMetadataFromApi: returning cached metadata for key:', key)
    return metadataCache.get(key)
  }

  // 3. No cache promise or metadata was found, build the request URL to fetch metadata
  let fetchUrl = ''

  if (!id) {
    console.log('document.js getMetadataFromApi without id')
    fetchUrl = `${_baseApiURL}/collection`
  } else {
    console.log('document.js getMetadataFromApi with id / id:', id)
    fetchUrl = `${_baseApiURL}/collection?id=${id}`
  }

  const fetchPromise = fetch(fetchUrl, { mode: 'cors', ...options })
    .then(res => res.json())
    .then(metadata => {
      // Get the id from the DTS response
      const realId = metadata?.['@id']

      console.log('getMetadataFromApi: API returned @id =', realId)

      // Cache metadata under the requested key (id or ROOT_KEY)
      metadataCache.set(key, metadata)
      metadataPromiseCache.delete(key)

      // Cache duplication for root collection (can be referred to with or without its id) :
      // for the root collection (fetched on collection DTS root without id), when we get the response, also cache it under its id (realId)
      // checking also that realId exists (erroneous API response)
      if (!id && realId) {
        metadataCache.set(realId, metadata)
        console.log(
          'getMetadataFromApi: root call, duplicating cache under real ID:',
          realId
        )
      }
      return metadata
    })
    .catch(error => {
      metadataPromiseCache.delete(key)
      throw error
    })

  metadataPromiseCache.set(key, fetchPromise)
  return fetchPromise
}

async function getDocumentFromApi (id, excludeFragments = false, mediaType, options = {}) {
  // TODO : default is document route without mediatype and if mediatype is provided include it
  console.log('document.js', `${_baseApiURL}/document?resource=${id}&mediaType=${mediaType}&excludeFragments=${excludeFragments}`)
  const response = await fetch(`${_baseApiURL}/document?resource=${id}&mediaType=${mediaType}&excludeFragments=${excludeFragments}`, { mode: 'cors', ...options })
  const document = response.text()
  // console.log("document.js getDocumentFromApi document", document)
  return document
}

async function getTOCFromApi (id, type = 'Resource', options = {}) {
  if (type === 'Resource') {
    const response = await fetch(`${_baseApiURL}/navigation?resource=${id}&down=-1`, { mode: 'cors', ...options })
    const document = await response.json()
    return document
  } else {
    console.log('document.js getTOCFromApi id? type? : ', id, type)
    const document = await getMetadataFromApi(id, options)
    return document
  }
}

async function getParentFromApi (id, options = {}) {
  console.log('document.js getParentFromApi called with id:', id)
  console.log('parentsCache.has(id):', parentsCache.has(id), 'parentsCache.get(id):', parentsCache.get(id))

  if (!id) {
    console.warn('getParentFromApi called without id')
    return null
  }

  // --- If a promise is already ongoing for this id ---
  if (parentsPromiseCache.has(id)) {
    console.log('getParentFromApi: returning existing promise for id:', id)
    return parentsPromiseCache.get(id)
  }

  // --- If metadata is already in cache for this id ---
  if (parentsCache.has(id)) {
    console.log('getParentFromApi: returning cached response for id:', id)
    return parentsCache.get(id)
  }

  // --- otherwise, fetch ---
  const url = `${_baseApiURL}/collection?id=${id}&nav=parents`
  console.log('getParentFromApi fetching:', url)

  const fetchPromise = fetch(url, { mode: 'cors', ...options })
    .then(res => res.json())
    .then(document => {
      console.log('document.js getParentFromApi response', document)

      // --- Storing the API response in cache ---
      parentsCache.set(id, document)

      // --- Removing the promise for this id from cache ---
      parentsPromiseCache.delete(id)

      return document
    })
    .catch(err => {
      parentsPromiseCache.delete(id)
      throw err
    })

  // --- Storing the promise for this id to avoid duplicates ---
  parentsPromiseCache.set(id, fetchPromise)

  return fetchPromise
}

async function getProjectFromApi (id, options = {}) {
  // --- 1. Get rootCollectionId (via cache if possible) ---
  let rootCollectionId = import.meta.env.VITE_APP_ROOT_DTS_COLLECTION_ID

  if (rootCollectionId) {
    console.log('document.js getProjectFromApi: rootCollectionId set from .env:', rootCollectionId)
  } else {
    console.log('document.js getProjectFromApi: retrieving rootCollection from API/cache')
    const rootCollection = await getMetadataFromApi(null, options)
    rootCollectionId = rootCollection['@id']
    console.log('document.js getProjectFromApi rootCollection', rootCollection)
  }
  console.log('document.js getProjectFromApi rootCollectionId', rootCollectionId)

  // --- 2. Navigate up the collection tree via /collection?id=X&nav=parents ---
  let loopId = id
  console.log('document.js getProjectFromApi loopId start:', loopId)

  while (loopId && loopId !== rootCollectionId) {
    const url = `${_baseApiURL}/collection?id=${loopId}&nav=parents`
    console.log('document.js getProjectFromApi fetching parents:', url)

    const document = await getParentFromApi(loopId, options = {})

    console.log('document.js getProjectFromApi document', document)

    if (document.member?.length) {
      loopId = document.member[0]['@id']
      console.log('document.js getProjectFromApi next parent loopId:', loopId)
    } else {
      // No declared parent → set id from the last available parent response and break
      loopId = document['@id']
      console.log('document.js getProjectFromApi: no parent, using document["@id"]:', loopId)
      break
    }
  }
  console.log('document.js getProjectFromApi projectId =', loopId)
  return loopId
}

async function getAncestors (currentCollection, excludedCollections = []) {

  const ancestors = [[getSimpleObject(currentCollection),], ]

  let loop = true
  let cur = currentCollection
  while (loop) {
    let parent = await getParentFromApi(cur?.identifier)
    // stop when no parent or parent == VITE_APP_ROOT_DTS_COLLECTION_ID
    if (parent?.member &&  parent?.member?.[0]?.['@id'].toLowerCase() !== import.meta.env.VITE_APP_ROOT_DTS_COLLECTION_ID.toLowerCase()) {
      cur = getSimpleObject(parent?.member[0])
      ancestors.push(parent?.member.map((elem) => getSimpleObject(elem)).filter((elem) => !excludedCollections.includes(elem.identifier)))
    } else {
      loop = false
    }
  }

  return ancestors
}

export {
  getCoverDataFromApi,
  getDocumentFromApi,
  getMetadataFromApi,
  getTOCFromApi,
  getParentFromApi,
  getProjectFromApi,
  getAncestors,
}
