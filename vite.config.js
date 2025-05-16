/* import { fileURLToPath, URL } from 'node:url' */

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
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
