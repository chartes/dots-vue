import _ from 'lodash'

// Import all custom favicons from confs/default
const customFaviconModules = import.meta.glob('confs/default/*.ico', { eager: true, as: 'url' })

/**
 * Get the final favicon URL to use
 * @param {string} faviconName - name of the favicon file (e.g., 'enc.ico')
 * @returns {string|null} URL of the favicon or null if not found
 */
function getFaviconUrl(faviconName) {
  if (!faviconName) return null
  const urls = Object.values(customFaviconModules)
  return urls.find(url => url.endsWith(faviconName)) || null
}

/**
 * Update the favicon in the <head>
 * @param {string|null} faviconName - name of the favicon file
 */
export function updateFavicon(faviconName) {
  const faviconUrl = getFaviconUrl(faviconName)

  let link = document.querySelector('link[rel*="icon"]')
  if (!link) {
    link = document.createElement('link')
    link.type = 'image/x-icon'
    link.rel = 'shortcut icon'
    document.head.appendChild(link)
  }

  if (faviconUrl) {
    link.href = faviconUrl
    console.log('Favicon applied:', faviconUrl)
  } else {
    // Do nothing and let browser use /public/favicon.ico
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