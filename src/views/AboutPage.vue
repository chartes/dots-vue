<template>
  <article class="about">
    <div class="tiles">
      <div class="tile page-header app-width-padding">
        <div class="tile is-child">
          <div class="is-flex is-flex-direction-row title-tile">
            <p class="title">
              {{ collectionAltTitle ? collectionAltTitle : currentCollection.title }}
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="about-page app-width-padding"><!--:class="isMenuOpened ?'opened' : ''"-->
      <div class="tab-menu">
        <div
          type="is-toggle"
        ><!-- @click="scrollToTop" -->
          <aside class="menu">
            <p
              class="menu-label"
              :class="currentTab === tab[1] ? 'is-active' : ''"
              v-for="(tab, index) in tabs"
              :key="index"
              @click="currentTab = tab[1]" v-text="tab[0]"
            />
          </aside>
        </div>
      </div>
      <div class="content-menu">
        <keep-alive>
          <component
            class="content"
            :is="currentTab"
            :application-base-url="appBaseUrl"
          >
          </component>
        </keep-alive>
      </div>
    </div>
  </article>
</template>
<script>
import { shallowRef, defineAsyncComponent, ref, watch } from 'vue'
// import myComponents from '@/views/about/index'

export default {
  name: 'AboutPage',
  props: {
    rootCollectionIdentifier: {
      type: String,
      required: true
    },
    collectionConfig: {
      type: Object,
      required: true
    },
    collectionIdentifier: {
      type: String,
      required: true
    },
    currentCollection: {
      type: Object,
      required: true
    }
  },

  setup (props) {
    const appBaseUrl = ref(`${import.meta.env.VITE_APP_APP_ROOT_URL}`)
    console.log('AboutPage setup appBaseUrl : ', appBaseUrl)
    const rootCollectionId = ref(props.rootCollectionIdentifier)
    const collConfig = ref(props.collectionConfig)
    const aboutSettings = ref([])
    const collectionAltTitle = ref(props.collectionConfig.homePageSettings.pageHeader.collectionAltTitle)
    const collectionId = ref(props.collectionIdentifier)
    const currCollection = ref(props.currentCollection)
    // const tabs = ref([])
    // const currentTab = shallowRef('')
    // console.log('AboutPage setup props.currentCollection / currCollection', props.currentCollection, currCollection.value)
    // console.log('AboutPage setup myComponents', myComponents)
    let tabs = []
    let currentTab = shallowRef('')
    const getTabs = async () => {
      // const tabs = []
      for (let i = 0; i < aboutSettings.value.length; i += 1) {
        console.log('AboutPage setup comp : ', aboutSettings.value[i], '\n comp.tabName : ', aboutSettings.value[i].tabName, '\n comp.compName : ', aboutSettings.value[i].compName)
        let component
        console.log('AboutPage collConfig.value.collectionId', collConfig.value.collectionId)
        console.log('AboutPage collConfig.value.aboutPageSettings', collConfig.value.aboutPageSettings)
        const comps = import.meta.glob('confs/**/*.vue')
        console.log('comps test : ', comps)
        const match = comps[`${import.meta.env.VITE_APP_CUSTOM_SETTINGS_PATH}/${collConfig.value.collectionId}/${aboutSettings.value[i].compName}.vue`]
        const matchRootCollection = comps[`${import.meta.env.VITE_APP_CUSTOM_SETTINGS_PATH}/${rootCollectionId.value}/${aboutSettings.value[i].compName}.vue`]
        // matching About pages for exact collection if defined
        console.log('match test : ', match)
        if (match) {
          component = defineAsyncComponent(() => import(`confs/${collConfig.value.collectionId}/${aboutSettings.value[i].compName}.vue`)
            .then((comp) => {
              return comp
            })
            .catch((error) => {
              console.log(`error loading confs/${collConfig.value.collectionId}/${aboutSettings.value[i].compName}.vue : `, error)
            })
          )
        // matching About pages for root collection if defined
        } else if (matchRootCollection) {
          component = defineAsyncComponent(() => import(`confs/${rootCollectionId.value}/${aboutSettings.value[i].compName}.vue`)
            .then((comp) => {
              return comp
            })
            .catch((error) => {
              console.log(`error loading ..confs/${rootCollectionId.value}/${aboutSettings.value[i].compName}.vue : `, error)
            })
          )
        // matching About pages as default
        // TODO : replace tabName by the default tabNames if incorrectly set
        } else {
          component = defineAsyncComponent(() => import(`./about/${aboutSettings.value[i].compName}.vue`)
            .then((comp) => {
              return comp
            })
            .catch((error) => {
              console.log(`error loading ${aboutSettings.value[i].compName}.vue : `, error)
            })
          )
        }
        tabs.push([aboutSettings.value[i].tabName, component])
        console.log('AboutPage setup tabs', tabs)
        console.log('AboutPage setup tabs[0]', tabs[0])
        currentTab = shallowRef(tabs[0][1])
      }
    }
    watch(props, async (newProps) => {
      tabs = []
      rootCollectionId.value = newProps.rootCollectionIdentifier
      collectionId.value = newProps.collectionIdentifier
      currCollection.value = newProps.currentCollection
      console.log('AboutPage watch newProps.collectionConfig', newProps.collectionConfig)
      collConfig.value = newProps.collectionConfig
      collectionAltTitle.value = collConfig.value.homePageSettings.pageHeader.collectionAltTitle
      console.log('AboutPage watch collConfig', collConfig.value)
      if (collConfig.value && collConfig.value.aboutPageSettings && collConfig.value.aboutPageSettings.length > 0) {
        aboutSettings.value = collConfig.value.aboutPageSettings
      } else {
        aboutSettings.value = []
      }
      console.log('AboutPage watch collConfig aboutSettings : ', collConfig.value, aboutSettings.value)
      await getTabs()
    }, { deep: true, immediate: true })

    return {
      appBaseUrl,
      collConfig,
      currCollection,
      collectionAltTitle,
      getTabs,
      tabs,
      currentTab
    }
  }
}

</script>
<style>
article.about {
  margin-top: 0;
}
.tile.is-child {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.title-tile {
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-top: 30px;
  margin-bottom: 30px;
}
.about-page {
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  align-content: center;
  & .tab-menu {
    margin: 20px 10px auto auto;
    height: 100%;
    width: 20%;
    & > div > aside > p.menu-label {
      padding-top: 5px;
      padding-bottom: 5px;
      padding-left: 20%;
      color: #B9192F;
      font-size: 16px;
      text-transform: uppercase;
      text-align: right;
      &:hover {
        background-color: rgba(185, 25, 47, 15%);
      }
      &.is-active {
        padding-left: calc(20% - 2px);
        border-left: solid 2px #B9192F;
      }
    }
  }
  & .content-menu {
    margin: 20px 10px auto;
    height: 100%;
    width: 80%;
  }
}
.about .content {
  max-width: 100%;
  font-family: "Libre Baskerville", serif !important;
  font-size: 16px;
  text-align: left;
  font-weight: 400;
  line-height: 28px;
  color: #5F5F5F;
  text-indent: 0;
  padding: 0 8% 100px;
}
.about .content p,
.about .content ul {
  font-family: "Barlow", sans-serif;
  font-size: 20px;
  font-weight: 400;
  line-height: 32px;
  color: #5F5F5F;
}
.about .content p {
  text-align: left;
  text-indent: 0;
}
.about .content ul {
  padding-bottom: 10px;
  margin-left: 0;
  list-style-position: inside;
}
.about .content ul > li {
  margin-bottom: 0;
  list-style-position: outside;
  margin-left: 20px;
}
.about .content h1,
.about .content h2 {
  padding-top: 0;
  text-align: left;
}
.about .content h1 {
  margin: 30px 0 !important;
  font-family: "Noto Serif", serif;
  font-weight: 400;
  font-style: normal;
  font-size: 30px;
  line-height: 42px;
}
.about .content h2 {
  margin: 70px 0 30px !important;
  font-family: "Barlow", sans-serif;
  font-weight: 400;
  font-size: 28px;
  line-height: 34px;
  color: #B9192F;
}
.about .content a {
  color: #B9192F;
  word-break: break-word;
  &:hover {
    text-decoration: underline !important;
  }
}
.about .content table,
.about .content pre,
.about .content blockquote {
  margin: 20px 0;
}

@media screen and (max-width: 1150px) {
  .about-page {
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-content: center;
    align-items: center;
    width: 100%;
    & .tab-menu {
      margin: 10px;
      height: 100%;
      width: 100%;
      padding-left: 2.5%;
      padding-right: 2.5%;
      & > div > aside {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-content: center;
        & > p.menu-label {
          margin: 0;
          padding: 5px 5px 5px 5px;
          color: #B9192F;
          font-size: 10px;
          text-transform: uppercase;
          text-align: center;

          &:hover {
            background-color: rgba(185, 25, 47, 15%);
          }

          &.is-active {
            padding: 5px 5px 5px 5px;
            border-left: none;
            border-bottom: solid 2px #B9192F;
          }
        }
      }
    }
    & .content-menu {
      display: flex;
      justify-content: center;
      align-content: center;
      height: 100%;
      width: 100%;
      margin: 20px 0 50px;
      & >.about.content {
        width: 100%;
        padding: 0;
        & > .title {
          text-align: center;
          font-size: 20px;
          line-height: 1.45;
        }
        & > .about-content > p {
          text-align: justify;
        }
      }
    }
  }
}

@media screen and (max-width: 800px) {
  .about .content {
    padding: 0 20px 50px;
  }
  .about .content p,
  .about .content ul {
    font-size: 16px;
    line-height: 24px;
    text-align: left !important;
  }
  .about .content p {
    margin: 0 0 !important;
  }
  .about .content ul {
    list-style-position: inside;
    margin: 20px 0 !important;
    & > li > ul {
      margin: 10px 0 !important;
    }
  }
  .about .content h1 {
    width: 80%;
    margin: 35px 0 !important;
    font-size: 30px;
    line-height: 36px;
  }
  .about .content h1,
  .about .content h2 {
    text-align: left;
    width: 80%;
  }
}
</style>
