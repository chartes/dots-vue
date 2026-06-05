import jsonld from 'jsonld'
import { toRaw } from 'vue'
import store from '@/store/index.js'

const _baseApiURL = `${import.meta.env.VITE_APP_DTS_ENDPOINT_URL}`.replace(/^https?:\/\//, '')
const _apiURL = new URL(`${import.meta.env.VITE_APP_DTS_ENDPOINT_URL}`)  // URL complète parsée
const _appURL = new URL(window.location.origin)  // URL de l'app frontend

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
  { name: 'enc_red_small', ext: 'www.chartes.psl.eu', type: 'other_link' },
  { name: 'iiif', ext: 'iiif', type: 'other_link' },
  { name: 'dots', ext: _baseApiURL, type: 'other_link' },
  { name: 'elec_txt', ext: window.location.pathname.split('/').slice(1, 3).join('/'), type: 'other_link' },
  { name: 'tei', ext: 'tei+xml', type: 'other_link' },
  { name: 'html', ext: 'text/html', type: 'other_link' },
  { name: 'pdf', ext: 'application/pdf', type: 'other_link' }
]
/*
 { name: 'tei', ext: 'api/dts/document', type: 'other_link' },
  { name: 'json', ext: 'api/dts/collection', type: 'other_link' },
  { name: 'json', ext: 'api/dts/navigation', type: 'other_link' },
   { name: 'tei', ext: 'application/tei+xml', type: 'other_link' },
  { name: 'pdf', ext: 'application/pdf', type: 'other_link' },
*/

const MEDIA_OBJECT_MIME_REGEX =
  /^(application|audio|font|image|model|text|video)\/[a-z0-9.+-]+$/i

function isMediaObjectMimeType(value) {
  return MEDIA_OBJECT_MIME_REGEX.test(value)
}

function findSource(id) {
  if (!id) return null

  let url
  try {
    url = new URL(id)
  } catch {
    const normalized = id.toLowerCase()

    // Case id not URL and has MIME but not strict MIME type (iiif)
    if (normalized.includes('iiif.io')) {
      return sources.find(s => s.name === 'iiif') ?? null
    }
    // Case id not a URL, nor IIIF → trying MIME type
    if (isMediaObjectMimeType(id)) {

      const source = sources.find(s =>
        normalized.includes(s.ext.toLowerCase())
      )

      return source
        ? { name: source.name, type: source.type }
        : null
    }
    return null
  }

  const normalized = id.toLowerCase()

  // Même hostname ET port que l'API DTS ?
  if (url.hostname === _apiURL.hostname && url.port === _apiURL.port) {
    if (normalized.includes(_baseApiURL.toLowerCase())) {
      return sources.find(s => s.name === 'dots') ?? null
    }
    // Même serveur mais hors API (page ENC/app)
    return sources.find(s => s.name === 'elec_txt') ?? null
  }

  // Même hostname ET port que le frontend ?
  if (url.hostname === _appURL.hostname && url.port === _appURL.port) {
    return sources.find(s => s.name === 'elec_txt') ?? null
  }

  const source = sources.find(s => normalized.includes(s.ext.toLowerCase()))
  return source ? { name: source.name, type: source.type } : null
}

// Version namespace
// ─────────────────────────────────────────────────────────────────────────────
// Contexte DTS inliné
// ─────────────────────────────────────────────────────────────────────────────
const DTS_CONTEXT_INLINE = {
  '@context': {
    'dts': 'https://dtsapi.org/v1.0#',
    'dct': 'http://purl.org/dc/terms/',
    'CitationTree':  'dts:CitationTree',
    'CiteStructure': 'dts:CiteStructure',
    'Collection':    'dts:Collection',
    'Resource':      'dts:Resource',
    'citationTrees': 'dts:citationTrees',
    'citeStructure': 'dts:citeStructure',
    'description':   'dts:description',
    'dublinCore': {
      '@id': '@nest',
      '@context': { '@vocab': null }
    },
    'extensions': {
      '@id': '@nest',
      '@context': { '@vocab': null }
    },
    'member':        'dts:member',
    'title':         'dts:title',
    'citeType':      'dts:citeType',
    'collection':    'dts:collection',
    'document':      'dts:document',
    'download':      'dts:download',
    'dtsVersion':    'dts:dtsVersion',
    'mediaTypes':    'dts:mediaTypes',
    'navigation':    'dts:navigation',
    'parent':        'dts:parent',
    'totalChildren': 'dts:totalChildren',
    'totalParents':  'dts:totalParents',
    'level':         'dts:level',
  }
}

const defaultLoader = jsonld.documentLoaders.xhr?.()
  ?? jsonld.documentLoaders.node?.()

jsonld.documentLoader = async (url) => {
  if (url === 'https://dtsapi.org/context/v1.0.json') {
    return { contextUrl: null, document: DTS_CONTEXT_INLINE, documentUrl: url }
  }
  if (defaultLoader) return defaultLoader(url)
  throw new Error(`Cannot load context: ${url}`)
}

// ─────────────────────────────────────────────────────────────────────────────
// Résolution préfixe → URI (non utilisée ?)
// ─────────────────────────────────────────────────────────────────────────────
function resolvePrefix(term, namespaces) {
  if (!term || !namespaces) return term
  const colon = term.indexOf(':')
  if (colon === -1) return term
  const prefix = term.slice(0, colon)
  const local  = term.slice(colon + 1)
  const base   = namespaces[prefix]
  return base ? base + local : term
}

// ─────────────────────────────────────────────────────────────────────────────
// Aplatissement du résultat jsonld.expand
// ─────────────────────────────────────────────────────────────────────────────
function flattenExpanded(expanded, namespaces = {}) {

  console.log('nested expanded start', expanded, namespaces)
  const node = Array.isArray(expanded) ? expanded[0] : expanded
  console.log('nested expanded 0', expanded, node)
  if (!node) return {}

  // Compresse une URI absolue en préfixe:local si possible
  function compressUri(uri) {
    for (const [prefix, base] of Object.entries(namespaces)) {
      if (uri.startsWith(base)) return `${prefix}:${uri.slice(base.length)}`
    }
    return uri
  }

  const result = {}

  for (const uri in node) {
    if (uri === '@context') continue

    const key = uri.startsWith('@') ? uri : compressUri(uri)
    const values = node[uri]
    console.log('nested uri', uri, node, node[uri])

    if (uri === '@type') {
      const types = values.map(t => compressUri(t))
      result[key] = types.length === 1 ? types[0] : types
      continue
    }

    if (uri === '@id') {
      result[key] = values
      continue
    }

    if (!Array.isArray(values)) continue

    const flattened = values.map(v => {
      if ('@value' in v) return v['@value']
      if ('@id' in v && Object.keys(v).length === 1) return v['@id']
      if (typeof v === 'object' && Object.keys(v).length > 0) {
        console.log('nested 0 v', uri, v)
        // Si c'est un objet JSON-LD structuré, récursion
        if ('@value' in v || '@id' in v || '@type' in v) {
          console.log('nested 1 v', uri, v)
          return flattenExpanded([v], namespaces)
        }
        // Sinon objet littéral (ex: dts:download { "application/tei+xml": "url" })
        console.log('nested 2 v', v)
        return v
      }console.log('nested 3 v', uri, v)
      return v
    })

    result[key] = flattened.length === 1 ? flattened[0] : flattened
  }

  return result
}

// ─────────────────────────────────────────────────────────────────────────────
// Expansion JSON-LD
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Pré-traitement : résout les @nest que jsonld.js ne gère pas.
 * - dublinCore → ses propriétés sont inlinées avec @vocab dct:
 * - extensions → ses propriétés sont inlinées avec leur @context local
 */

function resolveNested(apiResponse) {
  const result = { ...apiResponse }
  console.log('resolved result', result)
  const dctVocab = 'http://purl.org/dc/terms/'
  const existingContext = Array.isArray(result['@context'])
    ? result['@context'] : [result['@context']].filter(Boolean)

  if (result.dublinCore && typeof result.dublinCore === 'object') {
    // Injecter directement avec URIs absolues, sans passer par @context
    for (const [k, v] of Object.entries(result.dublinCore)) {
      if (k === '@context') continue
      result[`${dctVocab}${k}`] = v  // clé = URI absolue → sera compressée par flattenExpanded
    }
    delete result.dublinCore
  }

  if (result.extensions && typeof result.extensions === 'object') {
    console.log('resolved result.extensions', result.extensions)
    const extContext = result.extensions['@context']
    if (extContext) {
      result['@context'] = [...existingContext, extContext]
    }
    for (const [k, v] of Object.entries(result.extensions)) {
      console.log('resolved nested key, value', k, v)
      if (k === '@context') continue
      // Ne pas écraser une clé existante (dts:title > schema:name)
      if (!(k in result)) {
        result[k] = v
      }
    }
    delete result.extensions
  }

  return result
}

async function expandMetadata(apiResponse, namespaces = {}) {
  try {
    console.log('expandMetadata apiResponse', apiResponse, namespaces)
    const preprocessed = resolveNested(apiResponse)
    console.log('expandMetadata preprocessed', preprocessed)
    /* Add download (using DTS specification results in an invalid json-ld) custom namespace ?
    preprocessed['@context'][1].download = {
      '@id': 'https://dtsapi.org/v1.0#download',
      '@type': '@json'
    }*/
    const expanded = await jsonld.expand(preprocessed)
    console.log('expandMetadata expanded', expanded)
    const flat = flattenExpanded(expanded, namespaces)

    // Déduplication
    for (const key in flat) {
      if (Array.isArray(flat[key])) {
        const unique = [...new Set(flat[key].map(v =>
          typeof v === 'object' ? JSON.stringify(v) : v
        ))].map(v => {
          try { return JSON.parse(v) } catch { return v }
        })
        flat[key] = unique.length === 1 ? unique[0] : unique
      }
    }

    return flat
  } catch (e) {
    console.warn('⚠️ jsonld expand error', e)
    return apiResponse
  }
}
// URI de sameAs après expand (schema.org)
// Après compression, sameAs est accessible via le préfixe
const SCHEMA_SAMEAS_COMPRESSED = 'schema:sameAs'
const SCHEMA_SAMEAS_URI        = 'https://schema.org/sameAs'
// ─────────────────────────────────────────────────────────────────────────────
// enrichValue — inchangé
// ─────────────────────────────────────────────────────────────────────────────
function enrichValue(value, path) {
  try {
    if (
      path === 'dots:resourceIIIFManifest' &&
      typeof value === 'string'
    ) {
      return {
        value,
        url: value,
        source: {
          name: 'iiif',
          type: 'other_link'
        }
      }
    }

    if (typeof value === 'string') {
      const cleanUrl = value.replace(/\{[^}]*\}/g, '').replace(/\?$/, '')
      const src = findSource(cleanUrl)
      console.log('imgURL enrichValue value, path', value, path, cleanUrl, src, `/${window.location.pathname.split('/').slice(2, 4).join('/')}`)
      if (!src) return value
      const isHttp = cleanUrl.startsWith('http')
      return {
        value: cleanUrl,
        ...(isHttp ? { url: cleanUrl } : {}),
        source: src
      }
    }

    if (Array.isArray(value)) {
      return value.map(v => enrichValue(v, path))
    }

    if (value && typeof value === 'object') {
      // Ajouter contentUrl comme source d'URL possible
      const url = value.url ?? value['@id'] ?? value.id ?? value['schema:contentUrl']
      console.log('testing value', value, url, value['schema:encodingFormat'])
      // Pour les MediaObject, chercher la source sur encodingFormat plutôt que l'URL
      const formatSrc = value['schema:encodingFormat'] ? findSource(value['schema:encodingFormat']) : null
      console.log('testing formatSrc', url, formatSrc)
      const urlSrc = url ? findSource(url) : null
      const src = formatSrc ?? urlSrc
      console.log('testing src', src)

      // sameAs...
      const sameAsSources = []
      const sameAsValue = value[SCHEMA_SAMEAS_COMPRESSED] ?? value[SCHEMA_SAMEAS_URI]
      if (sameAsValue) {
        const arr = Array.isArray(sameAsValue) ? sameAsValue : [sameAsValue]
        for (const sa of arr) {
          const saUrl = typeof sa === 'string' ? sa : sa['@id']
          const saSrc = findSource(saUrl)
          if (saSrc) sameAsSources.push({ value: saUrl, source: saSrc })
        }
      }

      if (!src && sameAsSources.length === 0) return value

      return {
        ...value,
        ...(url ? { url } : {}),
        ...(src ? { source: src } : {}),
        ...(sameAsSources.length > 0 ? { sameAsSources } : {})
      }
    }

    return value

  } catch (e) {
    console.warn('⚠️ enrichValue error', { path, value, e })
    return value
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// buildDisplayModel
// ─────────────────────────────────────────────────────────────────────────────
export async function buildDisplayModel(rawMetadata, config) {
  const namespaces         = config?.namespaces         ?? {}
  const displayOrder       = config?.metadataDisplayOrder ?? []
  const renameMap          = config?.metadataRename       ?? {}
  const excludeConfig      = config?.excludeMetadata      ?? {}
  const excludeFields = [
    ...(excludeConfig.fields ?? []),
    ...APP_KEYS,
    ...APP_DISPLAY_EXCLUDES
  ]
  const onlyDeclared       = excludeConfig.onlyDeclared   ?? false

  const { metadata: rawJsonLd, appData } = splitMetadata(rawMetadata)
  console.log('buildDisplayModel rawJsonLd', rawJsonLd)

  const metadata = await expandMetadata(rawJsonLd, namespaces)

  function buildRenameGraph(metadataRename) {
    const graph = new Map()

    for (const [from, to] of Object.entries(metadataRename)) {
      graph.set(from, to)
    }

    return graph
  }

  function resolveRename(key, graph) {
    let current = key
    const visited = new Set()

    while (graph.has(current)) {
      if (visited.has(current)) break // protection boucle
      visited.add(current)
      current = graph.get(current)
    }

    return current
  }
  function buildDisplayKeyMap(namespaces, metadataRename) {
    const DTS = Object.keys(namespaces).find(
      k => namespaces[k].includes('dtsapi.org/v1.0#')
    )

    const graph = buildRenameGraph(metadataRename)

    const idKey = resolveRename('@id', graph)
    const typeKey = resolveRename('@type', graph)

    return {
      [idKey]: ['@id', 'identifier'],
      [typeKey]: ['@type', 'type'],
      [`${DTS}title`]: ['@value', 'title'],
    }
  }

  const DISPLAY_KEY_MAP = buildDisplayKeyMap(namespaces, renameMap)

  // Construire un Set des champs exclus (support wildcard "dots:*")
  function isExcluded(key) {
    const explicitAllowedKeys = new Set([
      ...displayOrder.filter(k => !isWildcard(k)),
      ...Object.values(renameMap)
    ])
    /* CHECK : do we need :
    displayOrder.filter(k => !isWildcard(k) && !k.includes('.')) ?
    and
    ...Object.values(renameMap)
    */
    if (explicitAllowedKeys.has(key)) return false

    return excludeFields.some(pattern => {
      if (pattern.endsWith(':*')) {
        const prefix = pattern.slice(0, -1) // "dots:"
        return key.startsWith(prefix)
      }
      return key === pattern
    })
  }

  const result = {}
  const handledKeys = new Set()

  function isWildcard(pattern) {
    return pattern.endsWith(':*')
  }

  function wildcardPrefix(pattern) {
    return pattern.slice(0, -1)
  }

  // Phase 1 : ordered pass
  for (const term of displayOrder) {
    console.log('buildDisplayModel Phase 1', term)

    if (isWildcard(term)) {
      const prefix = wildcardPrefix(term)

      const matchingKeys = Object.keys(metadata)
        .filter(key =>
          key.startsWith(prefix) &&
          !handledKeys.has(key) &&
          !isExcluded(key)
        )
        .sort()

      for (const key of matchingKeys) {
        const val = metadata[key]

        if (
          val === undefined ||
          val === null ||
          val === '' ||
          (typeof val === 'object' &&
            !Array.isArray(val) &&
            Object.keys(val).length === 0)
        ) {
          continue
        }

        result[key] = enrichValue(val, key)
        handledKeys.add(key)
      }

      continue
    }

    if (isExcluded(term)) continue

    // Gestion dts:download.application/tei+xml → sous-clé de dts:download
    if (term.includes('.')) {
      const [parent, subkey] = term.split(/\.(.+)/) // split sur le premier point
      if (metadata[parent] && typeof metadata[parent] === 'object') {
        const val = metadata[parent][subkey]
        if (val !== undefined && val !== null && val !== '') {
          const label = renameMap[term] ?? term
          result[label] = enrichValue(val, term)
          handledKeys.add(parent) // on marque le parent comme traité
        }
      }
      continue
    }

    // Résoudre la clé réelle dans metadata
    const candidateKeys = DISPLAY_KEY_MAP[term] ?? [term]
    const metaKey = candidateKeys.find(k => k in metadata && metadata[k] != null)

    if (!metaKey) continue

    if (!(metaKey in metadata)) {
      console.log('buildDisplayModel not found', metaKey)
      continue
    }
    const val = metadata[metaKey]
    if (val === undefined || val === null || val === '' ||
        (typeof val === 'object' && !Array.isArray(val) && Object.keys(val).length === 0)) {
      console.log('buildDisplayModel deemed invalid', metaKey, metadata[metaKey])
      continue
    }


    result[term] = enrichValue(val, term)

    // Marquer TOUTES les clés candidates comme traitées
    for (const k of candidateKeys) handledKeys.add(k)

  }
  console.log('buildDisplayModel result 0', result)

  // Phase 2 : remaining (si onlyDeclared === false)
  if (!onlyDeclared) {
    for (const key of Object.keys(metadata)) {
      console.log('buildDisplayModel Phase 2', key)
      if (handledKeys.has(key)) {
        console.log('buildDisplayModel Phase 2 already processed', key)
        continue
      }
      if (isExcluded(key)) {
        console.log('buildDisplayModel Phase 2 excluded', key)
        continue
      }
      const val = metadata[key]
      if (val === undefined || val === null || val === '' ||
          (typeof val === 'object' && !Array.isArray(val) && Object.keys(val).length === 0)) {
        console.log('buildDisplayModel deemed invalid 2', key, val)
        continue
      }
      result[key] = enrichValue(val, key)
      console.log('buildDisplayModel Phase 2 enriched', key, result[key])
    }
    console.log('buildDisplayModel Phase 2 end', metadata, result)
  }
  console.log('buildDisplayModel result 1', result)
  return result
}

// ─────────────────────────────────────────────────────────────────────────────
// useMetadataProcessor
// processMetadata est maintenant async
// Sa seule responsabilité propre : enrichir avec les données TOC
// Le reste est délégué à buildDisplayModel
// ─────────────────────────────────────────────────────────────────────────────
const APP_FIELDS = {
  editorialLevelIndicator: true,
  totalDescendants: true,
  descendant: true,
  router: true,
  router_params: true,
  router_refid: true,
  router_hash: true,
  url: true,
  hash: true,
  show: true,
  expanded: true,
  ancestor_editorialLevel: true,
  member: true,
  children: true,
  parent: true,
  projectIdentifier: true,
  totalParents: true,
  totalChildren: true,
  totalItems: true,
  citeType: true,
  level: true,

  // nested key example
  'extensions.dots:shortTitle': true,
}
const APP_KEYS = new Set(Object.keys(APP_FIELDS))

const APP_DISPLAY_EXCLUDES = Object.entries(APP_FIELDS)
  .filter(([path]) => path.includes('.'))
  .map(([path]) =>
    path.split('.').pop()
  )

function splitMetadata(raw = {}) {
  // helpers
  function get(obj, path) {
    return path.split('.').reduce(
      (acc, key) => acc?.[key],
      obj
    )
  }

  function defaultFieldName(path) {
    return path
      .split('.')
      .pop()
      .replace(/^.*:/, '')
  }

  const metadata = { ...raw }
  const appData = {}

  for (const [path, alias] of Object.entries(APP_FIELDS)) {
    const value = get(raw, path)

    if (value === undefined) continue

    const targetKey =
      alias === true || alias === ''
        ? defaultFieldName(path)
        : alias

    appData[targetKey] = value

    // non nested keys :
    if (!path.includes('.')) {
      delete metadata[path]
    }
  }

  return { metadata, appData }
}

export function useMetadataProcessor() {

  async function processMetadata(rawMetadata, collConfig, resourceId) {

    const config = collConfig ? toRaw(collConfig) : {}
    const raw = JSON.parse(JSON.stringify(toRaw(rawMetadata)))

    // Juste les alias système
    const result = { ...raw }
    if ('@id' in result)   { result.identifier = result['@id'];   /*delete result['@id']*/ }
    if ('@type' in result) { result.type = result['@type'];       /*delete result['@type']*/ }

    // TOC
    if (store.state.TOC.length > 0) {
      const tocItem = store.state.TOC.find(i => i.identifier === resourceId)
      result.parent = tocItem?.parent
        ? Array.isArray(tocItem.parent)
          ? tocItem.parent.map(p => {
              const parent = store.state.TOC.find(i => i.identifier === p)
              return parent ? `${p} (${parent.citeType})` : p
            })
          : tocItem.parent
        : []
    }

    return result  // cache : données brutes + alias + TOC
  }

  return { processMetadata }
}