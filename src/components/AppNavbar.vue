<template>
  <section>
    <nav
      class="level app-width-padding"
      :class="menuCssClass"
    >
      <div class="level-left">
        <a
          v-if="imgHref !== '/'"
          :href="imgHref"
          target="_blank"
        >
          <img
            class="logo-header"
            v-if="ImgUrl(collectionId)"
            :src="ImgUrl(collectionId)"
          />
        </a>
        <router-link
          v-else
          class="logo-header"
          active-class="active"
          :to="{ name: 'Home' }"
        >
          <img
            class="logo-header"
            v-if="ImgUrl(collectionId)"
            :src="ImgUrl(collectionId)"
          />
        </router-link>
        <span class="level-item">
          <router-link
            active-class="active"
            class="level-item-external"
            :to="{ name: 'Home' }"
            >{{ rootShortTitle ? rootShortTitle : rootCollectionId }}
          </router-link>
          <template v-for="(item, index) in breadCrumb.slice().reverse()">
            <router-link
              v-if="index === 0"
              class="level-item-external"
              active-class="active"
              :to="{ name: 'Home', params: {collId: Object.keys(item)[0]} }"
              >{{ Object.values(item)[0] }}
            </router-link>
            <a
              v-else
              class="level-item-external"
              @click.prevent="openCollectionModal(Object.keys(item)[0])"
              >{{ Object.values(item)[0] }}
            </a>
          </template>
          <!-- replaced by the above breadcrum to have sub-collections
          <router-link
            v-if="isDocProjectIdInc && collectionId && collectionId !== rootCollectionId"
            class="level-item-external"
            active-class="active"
            :to="{ name: 'Home', params: {collId: collectionId} }"
            >{{ collShortTitle ? collShortTitle : collectionId }}
          </router-link> -->
        </span>
      </div>
       <div class="level-right">
       <div class="level-item menu">
         <a
          v-if="apiImgUrl(collectionId)"
          target="_blank"
          :href="apiImgHref"
         >
          <img
            class="logo-api"
            :src="apiImgUrl(collectionId)"
            alt="Logo API"
          />
         </a>
         <a
           v-else
           target="_blank"
           href="https://chartes.github.io/dots_documentation/api/"
         >
           API <b>{ }</b>
         </a>
        </div>
      </div>
    </nav>
    <div class="mobile-button">
      <Burger @change="burgerChanged" :opened="isMenuOpened" />
    </div>
  </section>
</template>
<script>
import { ref, computed, onMounted, onBeforeUnmount, reactive, watch } from 'vue'
import Burger from './Burger.vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

export default {
  name: 'AppNavbar',
  components: { Burger },
  props: {
    isDocProjectIdIncluded: {
      type: Boolean,
      required: true
    },
    dtsRootCollectionIdentifier: {
      type: String,
      required: true
    },
    rootCollectionIdentifier: {
      type: String,
      required: true
    },
    collectionBreadcrumb: {
      type: Object,
      required: true
    },
    applicationConfig: {
      type: Object,
      required: true
    },
    rootCollectionConfig: {
      type: Object,
      required: true
    },
    projectCollectionConfig: {
      type: Object,
      required: false
    },
    collectionConfig: {
      type: Object,
      required: true
    },
    collectionIdentifier: {
      type: String,
      required: true
    }
  },

  setup (props) {
    const store = useStore()
    // State
    const state = reactive({
      isMenuOpened: false
    })
    const route = useRoute()
    const isMenuOpened = ref(false)
    const rootURL = ref(import.meta.env.VITE_APP_APP_ROOT_URL.length > 0 ? `${import.meta.env.VITE_APP_APP_ROOT_URL.slice(1, import.meta.env.VITE_APP_APP_ROOT_URL.length)}` : '')
    const isDocProjectIdInc = ref(props.isDocProjectIdIncluded)
    const dtsRootCollectionId = ref(props.dtsRootCollectionIdentifier)
    const rootCollectionId = ref(props.rootCollectionIdentifier)
    const appConfig = ref(props.applicationConfig)
    const rootCollConfig = ref(props.rootCollectionConfig)
    const projectCollConfig = ref(props.projectCollectionConfig)
    const collConfig = ref(props.collectionConfig)
    const imgHref = ref('')
    const apiImgHref = ref('')
    const rootShortTitle = ref(props.rootCollectionConfig.homePageSettings.appNavBar.collectionShortTitle)
    console.log('AppNavbar setup props.collectionConfig', props.collectionConfig)
    // const collShortTitle = ref(props.collectionConfig.homePageSettings.appNavBar.collectionShortTitle)
    const breadCrumb = ref(props.collectionBreadcrumb)
    const collectionId = ref(props.collectionIdentifier)
    console.log('AppNavbar setup props.rootCollectionIdentifier', props.rootCollectionIdentifier)
    console.log('AppNavbar setup rootCollectionId', rootCollectionId.value)
    console.log('AppNavbar props.collectionIdentifier', props.collectionIdentifier)
    // Replaced by breadcrumb :
    // console.log('AppNavbar collShortTitle', collShortTitle.value)

    // Computed property
    const menuCssClass = computed(() => {
      return state.isMenuOpened ? 'is-opened' : ''
    })

    // Methods
    const burgerChanged = (event) => {
      isMenuOpened.value = event.isOpened
    }

    const closeMenu = () => {
      isMenuOpened.value = false
    }

    const openCollectionModal = (collId) => {
      store.commit('setCollectionModalId', collId)
      console.log('AppNavBar click below ProjectId open collection modal ', collId)
    }

    const ImgUrl = (source) => {
      // TODO: provide a logo object with url AND legend ?

      const sourceConfig = collConfig.value
      if (sourceConfig && sourceConfig.homePageSettings && Object.keys(sourceConfig.homePageSettings).includes('appNavBar')
          && sourceConfig.homePageSettings.appNavBar && Object.keys(sourceConfig.homePageSettings.appNavBar).includes('appNavBarLogo')
          && sourceConfig.homePageSettings.appNavBar.appNavBarLogo.imgName.length
        ) {
        console.log('AppNavbar ImgUrl found : ', sourceConfig.homePageSettings.appNavBar.appNavBarLogo.imgName)
        // Get all images from the settings repo
        const images = import.meta.glob('confs/*/assets/images/*.*', { eager: true })
        console.log('AppNavbar ImgUrl images: ', images)

        // If the AppNavBar image is not defined on the collection, need to identify the root collection image path where it may be defined
        let rootCollImg = null
        // Identify the root collection config to find its AppNavBar image settings
        //const rootCollConfig = appConfig.value.collectionsConf.filter(coll => coll.collectionId === rootCollectionId.value)[0]
        console.log('AppNavbar ImgUrl appConfig.value.collectionsConf : ', appConfig.value.collectionsConf, rootCollectionId.value)
        console.log('AppNavbar ImgUrl rootCollConfig.value : ', rootCollConfig.value)
        // If an AppNavBar image is set on the root collection, set it as rootCollImg to be used
        if (rootCollConfig.value) {
          console.log('AppNavbar ImgUrl rootCollConfig : ', rootCollConfig)
          rootCollImg = images[`${import.meta.env.VITE_APP_CUSTOM_SETTINGS_PATH}/${rootCollectionId.value}/assets/images/${rootCollConfig.value.homePageSettings.appNavBar.appNavBarLogo.imgName}`]
          console.log('AppNavbar ImgUrl rootCollImg : ', rootCollImg)
        }
        // Setting the default AppNavBar image (dots) if none is defined at root or collection level
        const defaultSettings = import.meta.glob('@/assets/images/Logo_dots_circle.svg', { eager: true })
        console.log('AppNavbar ImgUrl defaultSettings: ', defaultSettings)
        images['/src/assets/images/Logo_dots_circle.svg'] = defaultSettings['/src/assets/images/Logo_dots_circle.svg']

        // Match the collection AppNavBar image if any
        const match = images[`${import.meta.env.VITE_APP_CUSTOM_SETTINGS_PATH}/${sourceConfig.collectionId}/assets/images/${sourceConfig.homePageSettings.appNavBar.appNavBarLogo.imgName}`]
        console.log('AppNavbar ImgUrl match: ', match)
        const defaultImg = images['/src/assets/images/Logo_dots_circle.svg']
        // Use the collection AppNavBar image if any
        if (match) {
          if (sourceConfig.homePageSettings.appNavBar.appNavBarLogo.imgName.includes('https')) {
            imgHref.value = sourceConfig.homePageSettings.appNavBar.appNavBarLogo.href
            return sourceConfig.homePageSettings.appNavBar.appNavBarLogo.imgName
          } else {
            imgHref.value = sourceConfig.homePageSettings.appNavBar.appNavBarLogo.href
            console.log('AppNavbar ImgUrl imgHref.value : ', imgHref.value)
            console.log('AppNavbar ImgUrl match : ', match)
            return match.default
          }
        // Otherwise use the root collection AppNavBar image if any
        } else if (rootCollImg) {
          if (rootCollConfig.value.homePageSettings.appNavBar.appNavBarLogo.imgName.includes('https')) {
            imgHref.value = rootCollConfig.value.homePageSettings.appNavBar.appNavBarLogo.href
            return rootCollConfig.value.homePageSettings.appNavBar.appNavBarLogo.imgName
          } else {
            imgHref.value = rootCollConfig.value.homePageSettings.appNavBar.appNavBarLogo.href
            console.log('AppNavbar ImgUrl appNavBarLogo.imgName : ', `${rootCollConfig.value.homePageSettings.appNavBar.appNavBarLogo.imgName}`)
            console.log('AppNavbar ImgUrl imgHref.value : ', imgHref.value)
            console.log('AppNavbar ImgUrl rootCollImg : ', rootCollImg)
            return rootCollImg.default
          }
        // Otherwise use the default (dots) AppNavBar image
        } else if (defaultImg) {
          if (sourceConfig.homePageSettings.appNavBar.appNavBarLogo.imgName.includes('https')) {
            imgHref.value = sourceConfig.homePageSettings.appNavBar.appNavBarLogo.href
            return sourceConfig.homePageSettings.appNavBar.appNavBarLogo.imgName
          } else {
            imgHref.value = sourceConfig.homePageSettings.appNavBar.appNavBarLogo.href
            console.log('AppNavbar ImgUrl default appNavBarLogo.imgName : ', `${sourceConfig.homePageSettings.appNavBar.appNavBarLogo.imgName}`)
            console.log('AppNavbar ImgUrl default imgHref.value : ', imgHref.value)
            console.log('AppNavbar ImgUrl default defaultImg : ', defaultImg)
            return defaultImg.default
          }
        }
      } else {
        return false
      }
    }
    const apiImgUrl = (source) => {
      // TODO: provide a logo object with url AND legend ?
      const sourceConfig = collConfig.value
      if (sourceConfig && sourceConfig.homePageSettings && Object.keys(sourceConfig.homePageSettings).includes('appNavBar')
          && sourceConfig.homePageSettings.appNavBar && Object.keys(sourceConfig.homePageSettings.appNavBar).includes('appNavBarApiLogo')
          && sourceConfig.homePageSettings.appNavBar.appNavBarApiLogo.imgName.length
      ) {
        console.log('AppNavbar apiImgUrl found : ', sourceConfig.homePageSettings.appNavBar.appNavBarApiLogo.imgName)
        // Get all images from the settings repo
        const images = import.meta.glob('confs/*/assets/images/*.*', { eager: true })
        console.log('AppNavbar apiImgUrl images: ', images)

        // If the AppNavBar image is not defined on the collection, need to identify the root collection image path where it may be defined
        let rootCollImg = null
        // Identify the root collection config to find its AppNavBar image settings
        //const rootCollConfig = appConfig.value.collectionsConf.filter(coll => coll.collectionId === rootCollectionId.value)[0]
        console.log('AppNavbar apiImgUrl appConfig.value.collectionsConf : ', appConfig.value.collectionsConf, rootCollectionId.value)
        console.log('AppNavbar apiImgUrl rootCollConfig : ', rootCollConfig)
        // If an AppNavBar image is set on the root collection, set it as rootCollImg to be used
        if (rootCollConfig.value) {
          console.log('AppNavbar apiImgUrl rootCollConfig.value : ', rootCollConfig.value)
          rootCollImg = images[`${import.meta.env.VITE_APP_CUSTOM_SETTINGS_PATH}/${rootCollectionId.value}/assets/images/${rootCollConfig.value.homePageSettings.appNavBar.appNavBarApiLogo.imgName}`]
          console.log('AppNavbar apiImgUrl rootCollImg : ', rootCollImg)
        }
        // Setting the default AppNavBar image (dots) if none is defined at root or collection level
        const defaultSettings = import.meta.glob('@/assets/images/Logo_dots_circle.svg')
        console.log('AppNavbar apiImgUrl defaultSettings: ', defaultSettings)
        images['/src/assets/images/Logo_dots_circle.svg'] = defaultSettings['/src/assets/images/Logo_dots_circle.svg']

        // Match the collection AppNavBar image if any
        const match = images[`${import.meta.env.VITE_APP_CUSTOM_SETTINGS_PATH}/${sourceConfig.collectionId}/assets/images/${sourceConfig.homePageSettings.appNavBar.appNavBarApiLogo.imgName}`]
        console.log('AppNavbar apiImgUrl match: ', match)
        const defaultImg = images['/src/assets/images/Logo_dots_circle.svg']
        // Use the collection AppNavBar image if any
        if (match) {
          if (sourceConfig.homePageSettings.appNavBar.appNavBarApiLogo.imgName.includes('https')) {
            apiImgHref.value = sourceConfig.homePageSettings.appNavBar.appNavBarApiLogo.href
            return sourceConfig.homePageSettings.appNavBar.appNavBarApiLogo.imgName
          } else {
            apiImgHref.value = sourceConfig.homePageSettings.appNavBar.appNavBarApiLogo.href
            console.log('AppNavbar apiImgUrl apiImgHref.value : ', apiImgHref.value)
            console.log('AppNavbar apiImgUrl match : ', match)
            return match.default
          }
        // Otherwise use the root collection AppNavBar image if any
        } else if (rootCollImg) {
          if (rootCollConfig.value.homePageSettings.appNavBar.appNavBarApiLogo.imgName.includes('https')) {
            apiImgHref.value = rootCollConfig.value.homePageSettings.appNavBar.appNavBarApiLogo.href
            return rootCollConfig.value.homePageSettings.appNavBar.appNavBarApiLogo.imgName
          } else {
            apiImgHref.value = rootCollConfig.value.homePageSettings.appNavBar.appNavBarApiLogo.href
            console.log('AppNavbar apiImgUrl appNavBarLogo.imgName : ', `${rootCollConfig.value.homePageSettings.appNavBar.appNavBarApiLogo.imgName}`)
            console.log('AppNavbar apiImgUrl apiImgHref.value : ', apiImgHref.value)
            console.log('AppNavbar apiImgUrl rootCollImg : ', rootCollImg)
            return rootCollImg.default
          }
        // Otherwise use the default (dots) AppNavBar image
        } else if (defaultImg) {
          if (sourceConfig.homePageSettings.appNavBar.appNavBarApiLogo.imgName.includes('https')) {
            apiImgHref.value = sourceConfig.homePageSettings.appNavBar.appNavBarApiLogo.href
            return sourceConfig.homePageSettings.appNavBar.appNavBarApiLogo.imgName
          } else {
            apiImgHref.value = sourceConfig.homePageSettings.appNavBar.appNavBarApiLogo.href
            console.log('AppNavbar apiImgUrl default appNavBarLogo.imgName : ', `${sourceConfig.homePageSettings.appNavBar.appNavBarApiLogo.imgName}`)
            console.log('AppNavbar apiImgUrl default apiImgHref.value : ', apiImgHref.value)
            console.log('AppNavbar apiImgUrl default defaultImg : ', defaultImg)
            return defaultImg.default
          }
        }
      } else {
        return false
      }
    }

    // Lifecycle hooks
    onMounted(() => {
      document.body.addEventListener('click', closeMenu)
    })

    onBeforeUnmount(() => {
      document.body.removeEventListener('click', closeMenu)
    })
    watch(props, (newProps) => {
      console.log('AppNavbar watch props : ', newProps)
      dtsRootCollectionId.value = newProps.dtsRootCollectionIdentifier
      rootCollectionId.value = newProps.rootCollectionIdentifier
      appConfig.value = newProps.applicationConfig
      rootCollConfig.value = newProps.rootCollectionConfig
      collConfig.value = newProps.collectionConfig
      rootShortTitle.value = newProps.rootCollectionConfig.homePageSettings.appNavBar.collectionShortTitle
      // Replaced by breadcrumb :
      // collShortTitle.value = newProps.collectionConfig.homePageSettings.appNavBar.collectionShortTitle
      breadCrumb.value = newProps.collectionBreadcrumb
      collectionId.value = newProps.collectionIdentifier
    }, { deep: true, immediate: true })

    // Expose properties and methods to the template
    return {
      route,
      isMenuOpened,
      menuCssClass,
      rootURL,
      isDocProjectIdInc,
      dtsRootCollectionId,
      rootCollectionId,
      appConfig,
      rootCollConfig,
      projectCollConfig,
      collConfig,
      rootShortTitle,
      breadCrumb,
      collectionId,
      openCollectionModal,
      burgerChanged,
      closeMenu,
      ImgUrl,
      imgHref,
      apiImgUrl,
      apiImgHref
    }
  }
}
</script>

<style scoped>
nav {
  font-family: 'Barlow', sans-serif;
  font-size: 18px;
  line-height: 1;
  color: #FFFFFF;
  /* background-color: #8f0e21; */
  background-color: var(--fill-color);
  padding-top: 10px;
  padding-bottom: 10px;
}
a {
  color: inherit;
  font-family: inherit;
  background-color: transparent !important;
}
a:hover {
  text-decoration: underline dotted;
  color: #FFFFFF;
}
.active {
  color: #FFFFFF;
  text-decoration: none;
}
.level {
  margin-bottom: 0 !important;
}
nav span.level-item:not(:last-child)::after {
  content: '|';
  display: inline-block;
  color: #000;
  padding-left: .75rem;
}
.logo-header {
  display: inline-block;
  width: 45px;
  height: 50px;
  margin:0 40px 0 2px;
}
.logo-api {
  display: inline-block;
  width: 45px;
  height: 50px;
  margin:0 40px 0 2px;
}
.level-left {
  display: flex;
  & > span > a {
    text-transform: capitalize;
    &.level-item-external:not(:last-child)::after {
      content: " > ";
      white-space: pre;
    }
  }
}
.mobile-button {
  display: none;
}

@media screen and (max-width: 800px) {
  .logo-header {
    transform-origin: left center;
    transform: scale(0.8);
    margin-right: 10px !important;
  }
  nav {
    display: flex;
    margin-top: 0;
    font-size: 16px;
    z-index: 10; /* cf documentation menu */

    position: fixed;
    top:0;
    width: 100vw;
    padding-right: 20px;
  }
  .logo-header {
    margin-right: 20px;
  }
  .level-left .level-item:not(:last-child),
  .level-right .level-item:not(:last-child) {
    margin-right: .5rem;
  }
  nav span.level-item:not(:last-child)::after {
    padding-left: .5rem;
  }
  .level-item:not(:last-child) {
    margin-bottom: 0;
  }
  .level-right {
    margin-top: 0;
  }
}
@media screen and (max-width: 500px) {

  nav::before {
    content: '';
    display: block;
    position: absolute;
    top:0;
    left:0;
    width: 100vw;
    height: 71px;
    background-color: #B9192F;
  }
  nav {
    background-color: rgba(185,25,47, 0.9);
    padding: 0;
  }
  .logo-header {
    position: absolute;
    left:10px;
    top:10px;
    transform: scale(1);
    z-index: 1;
  }
  .level {
    display: block;
    position: absolute;
    z-index: 1;
    top: 0;
    left: 0;
  }
  .level .level-item {
    display: none !important;
  }
  .level.is-opened .level-item  {
    display: flex !important;
  }
  .mobile-button {
    display: flex;
    align-items: center;
    position: absolute;
    right:15px;
    top:10px;
    z-index: 2;
  }
  .level-left {
    display: block;
    margin-top: 71px;
    border-top:#fcaca9 1px solid;
  }
  .level-right {
    display: block;
  }
  .level-item {
    padding: 5px 0;
    font-size: 25px;
    font-weight: 400;
    line-height: 52px;
  }
  .level-left .level-item:first-of-type {
    padding-top: 10px;
  }
  .level-right .level-item:last-of-type {
    padding-bottom: 10px;
  }
  nav span.level-item[data-v-1fd76d11]:not(:last-child)::after {
    display: none;
  }
}
ul.submenu a:hover {
  text-decoration: underline;
}
.level-item.menu {
  display: flex;
  flex-direction: column;

  & > ul.submenu {
    position: relative;
    top: 5px;
    margin: 0;
    padding: 0;
    border: none;

    display: none;
    opacity: 0;
    transition: opacity ease-in-out 0.25s;
  }

  &:hover {
    & > ul.submenu {
      display: inline-block;
      opacity: 1;
    }
  }
}

</style>
