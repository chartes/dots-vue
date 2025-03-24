import '@/assets/css/main.css'

import { createApp, defineAsyncComponent } from 'vue'
import App from '@/App.vue'
import router from '@/router'
import store from '@/store'

import useLayout from '@/composables/use-layout'
import VueHighlightJS from 'vue3-highlightjs'

window.global = window

const app = createApp(App).provide('variable-layout', useLayout())
  .component('PageBreak', defineAsyncComponent(() =>
    import('@/components/PageBreak.vue')
  ))
  .use(router)
  .use(store)
  .use(VueHighlightJS)
app.mount('#app')
/* router.isReady().then(() => {
  app.mount('#app')
}) */

/* const modules = import.meta.glob('@/views/about/*.vue', { eager: true })

export default function loadComponents (app) {
  for (const path in modules) {
    const componentName = path.split('/').at(-1).split('.')[0]
    app.component(`Gen${componentName}`, modules[path].default)
  }
} */

/* const app = createApp(App).provide("variable-layout", useLayout())

app.use(router)
app.use(store)

app.mount('#app') */
