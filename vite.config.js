/* import { fileURLToPath, URL } from 'node:url' */

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { prettifyError } from 'zod'

import path from 'path'

import { ViteAppConfig } from './src/schema'
import { redText } from './src/composables/utils'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  // check configuration
  const parsedEnv = ViteAppConfig.safeParse(env)
  if (!parsedEnv.success) {
    const prettyError = prettifyError(parsedEnv.error);
    console.error(`\nErrors are found in .env.${mode} file:\n\n`, redText(prettyError), '\n')
    process.exit(1)
  }

  return {
    base: env.VITE_APP_APP_ROOT_URL,
    plugins: [vue()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        confs: path.resolve(__dirname, env.VITE_APP_CUSTOM_SETTINGS_PATH),
        vue: 'vue/dist/vue.esm-bundler.js'
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },
    optimizeDeps: {
      include: ['vue']
    }
  }
})
