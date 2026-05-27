import { createRouter, createWebHistory } from 'vue-router'
import { getProjectFromApi } from '@/api/document'

// import { getTOCFromApi } from '@/api/document'

/* const allowedIds = async (id, type) => {
  const response = await getTOCFromApi(id, type)
  console.log('router.beforeEach response', response)
  if (response.member && type === 'Collection') {
    return response.member.map(item => item['@id'])
  }
} */

const rootURL = `${import.meta.env.VITE_APP_APP_ROOT_URL}`
console.log('router const rootURL :', rootURL)

const isDocProjectIdIncluded = `${import.meta.env.VITE_APP_DOCUMENT_ROUTE_INCLUDE_PROJECT_ID}`.toLowerCase() === 'true'
console.log('router const isDocProjectIdIncluded :', isDocProjectIdIncluded)
// const appBasePath = isDocProjectIdIncluded ? '' : ':collId'

// NB : scrollBehavior cf https://router.vuejs.org/guide/advanced/scroll-behavior

let previousRoute = null
let router = () => {}
if (isDocProjectIdIncluded) {
  router = createRouter({
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
        path: '/documentation',
        name: 'Documentation',
        component: () => import('@/views/DocumentationPage.vue')
      },
      {
        path: '/termsofservice',
        name: 'Terms',
        component: () => import('@/views/TermsOfService.vue')
      },
      {
        path: '/:collId?/document/:id',
        name: 'Document',
        component: () => import('@/views/DocumentPage.vue'),
        props: true
      }
    ],
    scrollBehavior (to, from, savedPosition) {

      // console.log('scrollBehavior to', to);
      // console.log('scrollBehavior from', from);

      const defaultTop = window.innerWidth < 1024 ? 45 : 82;

      if (to.path === from.path && to.hash.length) {
        // Local anchors
        return {
          el: to.hash,
          behavior: 'smooth',
          top: defaultTop
        }
      }

      const documentArea = document.querySelector('.navigation-document');
      const documentAreaTop = documentArea.getBoundingClientRect().top + window.scrollY;

      if (window.scrollY >= documentAreaTop) {
        // If window scroll is beyond sticky navigation bar
        const documentAreaElement = document.querySelector('.document-area')
        if (documentAreaElement) {
          return {
            el: documentAreaElement,
            top: defaultTop,
          }
        } else {
          return { top: 0 }
        }
      }

      // else scroll is unchanged...
    }
  })
} else {
  router = createRouter({
    history: createWebHistory(rootURL),
    routes: [
      {
        path: '/',
        name: 'Home',
        component: () => import('@/views/HomePage.vue'),
        props: true
      },
      {
        path: '/about',
        name: 'About',
        component: () => import('@/views/AboutPage.vue')
      },
      {
        path: '/documentation',
        name: 'Documentation',
        component: () => import('@/views/DocumentationPage.vue')
      },
      {
        path: '/termsofservice',
        name: 'Terms',
        component: () => import('@/views/TermsOfService.vue')
      },
      {
        path: '/document/:id',
        name: 'Document',
        component: () => import('@/views/DocumentPage.vue'),
        props: true
      }
    ],
    scrollBehavior (to, from, savedPosition) {
      return { top: 0 }
    }
  })
}


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
if (isDocProjectIdIncluded) {
  /*router.beforeEach(async (to, from) => {
    console.log(`Navigating to: ${to.name}, with params.collId: ${to.params.collId}, with params.id: ${to.params.id}, with query: ${to.query.refId}, with hash: ${to.hash}`)
    if (to.params.collId) {
      const projectId = await getProjectFromApi(to.params.collId)
      console.log('router.beforeEach projectId', projectId)
      if (to.params.collId !== projectId) {
        return { name: to.name, params: { collId: projectId, id: to.params.id } }
      }
    }
  })*/
  router.afterEach((to, from, next) => {
    console.log(`Navigated to: ${to.name}, with params.collId: ${to.params.collId}, with params.id: ${to.params.id}, with query: ${to.query.refId}, with hash: ${to.hash}`)
  })
  router.beforeEach((to, from, next) => {
    previousRoute = from
    next()
  })
} else {
  router.afterEach((to, from, next) => {
    console.log(`Navigated to: ${to.name}, NO params.collId, with params.id: ${to.params.id}, with query: ${to.query.refId}, with hash: ${to.hash}`)
  })
  router.beforeEach((to, from, next) => {
    previousRoute = from
    next()
  })
}

export { router, previousRoute }
