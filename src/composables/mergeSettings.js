import _ from 'lodash'

// Import all favicon files from confs/default as resolved URLs (handled by Vite asset pipeline)
// Using `query: '?url'` ensures proper URL transformation (with hashing in build)
// `import: 'default'` gives direct access to the URL string
const customFaviconModules = import.meta.glob(
  'confs/default/*.ico',
  { eager: true, query: '?url', import: 'default' }
)

/**
 * Build a stable map of favicon file names : resolved URLs
 * Example:
 * {
 *   "enc.ico": "/assets/enc.abc123.ico"
 * }
 */
const faviconMap = Object.fromEntries(
  Object.entries(customFaviconModules).map(([path, url]) => {
    const fileName = path.split('/').pop() // Extract file name (e.g. "enc.ico")
    return [fileName, url]
  })
)

/**
 * Get the resolved favicon URL from its file name
 *
 * @param {string} faviconName - Name of the favicon file (e.g. "enc.ico")
 * @returns {string|null} Resolved URL of the favicon, or null if not found
 */
function getFaviconUrl(faviconName) {
  if (!faviconName) return null

  const url = faviconMap[faviconName]

  if (!url) {
    console.warn(`Favicon "${faviconName}" not found in confs/default`)
  }

  return url || null
}

/**
 * Update (or create) the favicon in the document <head>
 *
 * - Reuses existing <link rel="icon"> if present
 * - Otherwise creates one dynamically
 * - Falls back to browser default (/public/favicon.ico) if no match is found
 *
 * @param {string|null} faviconName - Name of the favicon file (e.g. "enc.ico")
 */
export function updateFavicon(faviconName) {
  const faviconUrl = getFaviconUrl(faviconName)

  // Try to find an existing favicon link element
  let link = document.querySelector('link[rel*="icon"]')

  // If none exists, create it
  if (!link) {
    link = document.createElement('link')
    link.type = 'image/x-icon'
    link.rel = 'shortcut icon'
    document.head.appendChild(link)
  }

  if (faviconUrl) {
    // Apply resolved favicon URL
    link.href = faviconUrl
    console.log('Favicon applied:', faviconUrl)
  } else {
    // Do nothing : browser will fallback to default /public/favicon.ico
    console.log('No custom favicon found, using browser default')
  }
}

/**
 * Merge app settings (default + custom) and initialize reactive appConfig
 * @param {import("vue").Ref} appConfig - reactive ref to hold app configuration
 */
export async function mergeSettings(appConfig) {
  // Import all conf JSON files
  const appSettingsModules = import.meta.glob('confs/*.conf.json', { eager: true })
  const defaultSettingsModule = await import('@/settings/default.conf.json').catch(() => ({ default: {} }))
  const defaultSettings = defaultSettingsModule.default || {}

  const appSettings = { ...appSettingsModules }
  appSettings.default = defaultSettings

  // Merge custom.conf.json if environment variable is set
  if (`${import.meta.env.VITE_APP_CUSTOM_SETTINGS_PATH}`.length > 0) {
    const customModules = import.meta.glob('confs/custom.conf.json', { eager: true })
    const customSettings = Object.values(customModules)[0]?.default || {}
    appSettings.default = _.merge({}, appSettings.default, customSettings)
  }

  const defaultMatch = appSettings.default.default || appSettings.default
  Object.assign(appConfig.value, defaultMatch)

  // Initialize collectionsConf
  appConfig.value.collectionsConf = []
  if (defaultMatch.genericConf) appConfig.value.collectionsConf.push(defaultMatch.genericConf)

  Object.keys(appSettings).forEach(key => {
    if (key === 'default') return
    const collection = appSettings[key]
    if (!collection) return
    appConfig.value.collectionsConf.push(collection)
  })

  // Update favicon from current settings
  const faviconName = appConfig.value.genericConf?.homePageSettings?.favicon
  console.log('mergeSettings faviconName:', faviconName)
  updateFavicon(faviconName)

  console.log('mergeSettings appConfig final:', appConfig.value)
}