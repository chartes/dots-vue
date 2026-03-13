import * as z from 'zod'

export const ViteAppConfig = z
  .strictObject({
    VITE_APP_DTS_ENDPOINT_URL: z.url({ error: (issue) => issue.input === undefined ? 'Missing key' : 'Invalid URL, must be a valid URL' }),
    VITE_APP_ROOT_DTS_COLLECTION_ID: z.string({ error: (issue) => issue.input === undefined ? 'Missing key': 'Invalid id, must be a string or empty string' }),
    VITE_APP_APP_ROOT_URL: z.stringFormat('urlPath', /^\/.*$/, { error: (issue) => issue.input === undefined ? 'Missing key': 'Invalid path, must start with /' }),
    VITE_APP_DOCUMENT_ROUTE_INCLUDE_PROJECT_ID: z.stringFormat(
      'strBool',
      (val) => {
        return ['true', 'false'].includes(val)
      },
      { error: (issue) => issue.input === undefined ? 'Missing key': 'Invalid, must be "true" or "false"' }
    ),
    VITE_APP_CUSTOM_SETTINGS_PATH: z.string().optional(),
    VITE_APP_THEME: z.string().optional()
  })
