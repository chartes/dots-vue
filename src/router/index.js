import { createRouter, createWebHistory } from 'vue-router'
// import { getTOCFromApi } from '@/api/document'

/* const allowedIds = async (id, type) => {
  const response = await getTOCFromApi(id, type)
  console.log('router.beforeEach response', response)
  if (response.member && type === 'Collection') {
    return response.member.map(item => item['@id'])
  }
} */

const rootURL = `${import.meta.env.VITE_APP_APP_ROOT_URL}`
console.log('const rootURL :', rootURL)

const router = createRouter({
  history: createWebHistory(rootURL),
  routes: [
    {
      path: '/:collId?',
      name: 'Home',
      component: () => import('@/views/HomePage.vue'),
      props: true
    },
    {
      path: '/:collId?/about',
      name: 'About',
      component: () => import('@/views/AboutPage.vue')
    },
    {
      path: '/:collId?/documentation',
      name: 'Documentation',
      component: () => import('@/views/DocumentationPage.vue')
    },
    {
      path: '/:collId?/termsofservice',
      name: 'Terms',
      component: () => import('@/views/TermsOfService.vue')
    },
    {
      path: '/:collId?/document/:id',
      name: 'Document',
      component: () => import('@/views/DocumentPage.vue'),
      props: true
    }
  ]
})
/* router.beforeEach(async (to, from) => {
  if ((to && to.params.collId === '' && to.name === 'Home') || (to && !to.params.collId && to.name === 'Home')) {
    console.log('router.beforeEach (to && !to.params.collId) || (to && to.params.collId === \'\')', to)
    return true
  } else if (to && to.params.collId === '') {
    return { name: 'Home' }
  } else if (to) {
    console.log('router.beforeEach else if (to) ?', to)
    console.log('router.beforeEach else if (to) to.params.collId !== \'\' ?', to)
    const allowedResourceIds = to.params.collId !== '' ? await allowedIds(to.params.collId, 'Collection') : await allowedIds('ELEC', 'Collection')
    console.log('router.beforeEach ', allowedResourceIds, typeof (allowedResourceIds))
    if ((to.params.collId && !to.params.id) || (to.params.id && allowedResourceIds.some(substr => to.params.id.startsWith(substr)))) {
      return true
    } else {
      console.log('router.beforeEach else if (to) else', to)
      return { name: 'Home', params: { collId: to.params.collId } }
    }
  } else {
    const allowedResourceIds = await allowedIds(to.params.collId, 'Collection')
    console.log('router.beforeEach ', allowedResourceIds, typeof (allowedResourceIds))
    console.log('router.beforeEach from ?', from)
    if (from.params.id && allowedResourceIds.includes(from.params.id)) {
      return true
    } else {
      return { name: 'Home', params: { collId: from.params.collId } }
    }
  }
}) */
router.afterEach((to, from, next) => {
  console.log(`Navigating to: ${to.name}, with params.collId: ${to.params.collId}, with params.id: ${to.params.id}, with query: ${to.query.refId}, with hash: ${to.hash}`)
})
export default router
