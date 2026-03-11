import { toRaw } from 'vue'
import store from '@/store/index.js'

const sources = [
  { name: 'wikidata', ext: 'wikidata', type: 'author_link' },
  { name: 'wikipedia', ext: 'wikipedia', type: 'author_link' },
  { name: 'dbpedia', ext: 'dbpedia.org', type: 'author_link' },
  { name: 'idref', ext: 'idref.fr', type: 'author_link' },
  { name: 'databnf', ext: 'data.bnf.fr', type: 'author_link' },
  { name: 'cataloguebnf', ext: 'catalogue.bnf.fr', type: 'author_link' },
  { name: 'gallica', ext: 'gallica.bnf.fr', type: 'document_link' },
  { name: 'thenca', ext: 'thenca', type: 'document_link' },
  { name: 'hal', ext: 'hal', type: 'document_link' },
  { name: 'benc', ext: 'koha', type: 'document_link' },
  { name: 'sudoc', ext: 'sudoc.fr', type: 'document_link' },
  { name: 'biblissima', ext: 'biblissima', type: 'document_link' },
  { name: 'creativecommons', ext: 'creativecommons.org', type: 'document_link' },
  { name: 'iiif', ext: 'manifest', type: 'other_link' },
  { name: 'tei', ext: 'api/dts', type: 'other_link' },
  { name: 'dots', ext: window.location.origin, type: 'other_link' }
]

function findSource(id) {
  if (!id) return null
  const source = sources.find(s => id.toLowerCase().includes(s.ext))
  return source ? { name: source.name, type: source.type } : null
}

function processValue(obj, isRoot = false) {
  const isUrl = v => typeof v === 'string' && v.startsWith('http')
  let manifestUrlFound = ''
  if (obj === null || obj === undefined) {
    return obj
  }

  if (typeof obj === 'string') {
    if (isUrl(obj)) {
      return findSource(obj) ? { url: obj, source: findSource(obj) } : obj
    } else {
      return obj
    }
  }

  if (Array.isArray(obj)) {
    const result = []
    for (let i = 0; i < obj.length; i++) {
      result.push(processValue(obj[i]))
    }
    return result
  }

  if (typeof obj === 'object') {
    if (!isRoot && Object.keys(obj).length === 1) {
      if ('@id' in obj) {
        const idVal = obj['@id']
        if (isUrl(idVal)) {
          if (findSource(idVal)) {
            if (findSource(idVal).name === 'iiif') {
              console.log('manifestUrlFound findSource(idVal)', idVal, findSource(idVal))
              manifestUrlFound = idVal
            }
            return { url: idVal, source: findSource(idVal) }
          } else {
            return idVal
          }
        } else {
          return idVal
        }
      } else if ('url' in obj) {
        const urlVal = obj.url
        if (isUrl(urlVal)) {
          return findSource(urlVal) ? { url: urlVal, source: findSource(urlVal) } : urlVal
        } else {
          return urlVal
        }
      }
    }

    const result = {}
    for (const k in obj) {
      const value = obj[k]

      if (k === 'member') {
        result[k] = value
      } else if ((k === 'dublincore' || k === 'extensions') && value !== null && typeof value === 'object') {
        const nested = processValue(value)
        for (const nk in nested) {
          result[nk] = nested[nk]
        }
      } else {
        result[k] = processValue(value)
      }
    }
    console.log('manifestUrlFound', manifestUrlFound)
    if (manifestUrlFound.length > 0) {
      result.iiifManifestUrl = manifestUrlFound
    }
    return result
  }

  return obj
}

function applyKeepConfig(listmetadata, keepConfig) {
  const result = {}
  const fields = keepConfig.fields

  function extractValue(obj, path) {
    return path.split('.').reduce((acc, key) => acc?.[key], obj)
  }

  for (const key in fields) {
    const field = fields[key]

    if (key === 'member') {
      result[key] = listmetadata[key]
      continue
    }

    if (typeof field === 'string' || field === null) {
      const value = extractValue(listmetadata, key)
      const target = field ?? key
      if (value !== null) {
        result[target] = processValue(value)
      }
    } else if (typeof field === 'object') {
      const source = listmetadata[key]
      if (!source) continue
      for (const subKey in field) {
        const value = source[subKey]
        const target = field[subKey] ?? subKey
        if (value !== null) {
          result[target] = processValue(value)
        }
      }
    }
  }

  return result
}

function orderMetadata(metadata, order) {
  const ordered = {}
  for (const key of order) {
    if (metadata[key] !== undefined) {
      ordered[key] = metadata[key]
    }
  }
  return ordered
}

export function useMetadataProcessor() {
  function processMetadata(listmetadata, collConfig, resourceId, route) {
    let metadata
    const hasKeepMetadata = Object.keys(collConfig?.keepCollectionMetadata?.fields ?? {}).length > 0
      console.log('hasKeepMetadata ', collConfig, resourceId, hasKeepMetadata)

    if (hasKeepMetadata) {
      const keepConfig = structuredClone(toRaw(collConfig.keepCollectionMetadata))
      keepConfig.fields['member'] = 'member'
      keepConfig.fields['children'] = 'children'
      keepConfig.fields['extensions']['dots:dotsProjectId'] = 'dots:dotsProjectId'
      keepConfig.fields['extensions']['dct:source'] = 'dct:source'
      keepConfig.fields['iiifManifestUrl'] = 'iiifManifestUrl'
      keepConfig.displayOrder.push('member')
      keepConfig.displayOrder.push('children')
      keepConfig.displayOrder.push('dots:dotsProjectId')
      keepConfig.displayOrder.push('dct:source')
      keepConfig.displayOrder.push('iiifManifestUrl')
      metadata = applyKeepConfig(listmetadata, keepConfig)

      if (keepConfig.displayOrder) {
        metadata = orderMetadata(metadata, keepConfig.displayOrder)
      }
    } else {
      metadata = processValue(listmetadata, true)
    }

    // citation
    if (metadata.identifier && metadata.type === 'Resource') {
      metadata.citation = {
        source: findSource(window.location.origin),
        url: window.location.origin +
             (import.meta.env.VITE_APP_APP_ROOT_URL.length > 1
               ? import.meta.env.VITE_APP_APP_ROOT_URL + '/'
               : import.meta.env.VITE_APP_APP_ROOT_URL) +
             route.path.slice(1)
      }
    }

    // parent depuis TOC
    if (store.state.TOC.length > 0) {
      const tocItem = store.state.TOC.find(i => i.identifier === resourceId)
      if (tocItem?.parent) {
        if (Array.isArray(tocItem.parent)) {
          metadata.parent = tocItem.parent.map(p => {
            const parent = store.state.TOC.find(i => i.identifier === p)
            return parent ? `${p} (${parent.citeType})` : p
          })
        } else {
          metadata.parent = tocItem.parent
        }
      } else {
        metadata.parent = []
      }
    }

    return metadata
  }

  return { processMetadata, findSource, processValue }
}