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
            >{{ projectShortTitle ? projectShortTitle : rootCollectionId }}
          </router-link><!-- {{ projectShortTitle ? projectShortTitle : rootCollectionId }} -->
          <!--TODO: troubleshoot subcollection not showing when on document-->
          <router-link
            v-if="isDocProjectIdInc && collectionId && collectionId !== rootCollectionId"
            class="level-item-external"
            active-class="active"
            :to="{ name: 'Home', params: {collId: collectionId} }"
            >{{ collShortTitle ? collShortTitle : collectionId }}
          </router-link>
          <!--<router-link
            v-else-if="route.path.includes(rootCollectionId)"
            class="level-item-external"
            active-class="active"
            :to="{ name: 'Home' }"
            >{{ rootCollectionId }}
          </router-link>
          {{route.path}}-->
        </span>
      </div>
       <div class="level-right">
       <div class="level-item menu">
         <a
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
    rootCollectionShortTitle: {
      type: String,
      required: true
    },
    applicationConfig: {
      type: Object,
      required: true
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
    const collConfig = ref(props.collectionConfig)
    const imgHref = ref('')
    const projectShortTitle = ref(props.rootCollectionShortTitle)
    console.log('AppNavbar setup props.collectionConfig', props.collectionConfig)
    const collShortTitle = ref(props.collectionConfig.homePageSettings.collectionShortTitle)
    const collectionId = ref(props.collectionIdentifier)
    console.log('AppNavbar setup props.rootCollectionIdentifier', props.rootCollectionIdentifier)
    console.log('AppNavbar setup rootCollectionId', rootCollectionId.value)
    console.log('AppNavbar props.collectionIdentifier', props.collectionIdentifier)
    console.log('AppNavbar collShortTitle', collShortTitle.value)
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

    const ImgUrl = (source) => {
      // TODO: provide a logo object with url AND legend ?

      const sourceConfig = collConfig.value
      if (sourceConfig && Object.keys(sourceConfig.homePageSettings).includes('appNavBarLogo') && sourceConfig.homePageSettings.appNavBarLogo.imgName.length) {
        console.log('AppNavbar ImgUrl found : ', sourceConfig.homePageSettings.appNavBarLogo.imgName)

        const images = import.meta.glob('confs/images/*.*', { eager: true })
        console.log('AppNavbar ImgUrl images: ', images)
        const defaultSettings = import.meta.glob('/src/assets/images/Logo_dots_circle.svg')
        console.log('AppNavbar ImgUrl defaultSettings: ', defaultSettings)
        images['/src/assets/images/Logo_dots_circle.svg'] = defaultSettings['/src/assets/images/Logo_dots_circle.svg']

        const match = images[`${import.meta.env.VITE_APP_CUSTOM_SETTINGS_PATH}/images/${sourceConfig.homePageSettings.appNavBarLogo.imgName}`]
        console.log('AppNavbar ImgUrl match: ', match)
        const defaultImg = images['/src/assets/images/Logo_dots_circle.svg']

        if (match) {
          if (sourceConfig.homePageSettings.appNavBarLogo.imgName.includes('https')) {
            imgHref.value = sourceConfig.homePageSettings.appNavBarLogo.href
            return sourceConfig.homePageSettings.appNavBarLogo.imgName
          } else {
            imgHref.value = sourceConfig.homePageSettings.appNavBarLogo.href
            console.log('AppNavbar ImgUrl imgHref.value : ', imgHref.value)
            console.log('AppNavbar ImgUrl match : ', match)
            return match.default
          }
        } else if (defaultImg) {
          if (sourceConfig.homePageSettings.appNavBarLogo.imgName.includes('https')) {
            imgHref.value = sourceConfig.homePageSettings.appNavBarLogo.href
            return sourceConfig.homePageSettings.appNavBarLogo.imgName
          } else {
            imgHref.value = sourceConfig.homePageSettings.appNavBarLogo.href
            console.log('AppNavbar ImgUrl new URL ref : ', `confs/images/${sourceConfig.homePageSettings.appNavBarLogo.imgName}`)
            console.log('AppNavbar ImgUrl imgHref.value : ', imgHref.value)
            console.log('AppNavbar ImgUrl defaultImg : ', defaultImg)
            return defaultImg.name
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
      collConfig.value = newProps.collectionConfig
      projectShortTitle.value = newProps.rootCollectionShortTitle
      collShortTitle.value = newProps.collectionConfig.homePageSettings.collectionShortTitle
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
      collConfig,
      projectShortTitle,
      collShortTitle,
      collectionId,
      burgerChanged,
      closeMenu,
      ImgUrl,
      imgHref
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
  background-color: #B9192F;
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
  //background: url(../assets/images/logo-enc-white.png) center / contain no-repeat;
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
.home-button {
  display: inline-block;
  width: 31px;
  height: 34px;
  background: url(../assets/images/home-mobile.png) center / contain no-repeat;
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
