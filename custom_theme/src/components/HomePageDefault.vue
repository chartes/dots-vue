<template>
  <div class="home-mask" :class="homeCssClass">
      <div class="tiles">
      <div class="tile page-header app-width-padding">
        <div class="is-flex is-flex-direction-column is-align-items-center is-justify-content-center wrapper">
          <div class="tile is-child">
            <div class="title-tile">
              <p class="title">{{ collectionAltTitle ? collectionAltTitle : currCollection.title }}</p>
            </div>
            <div class="project-tile">
              <router-link
                :to="{ name: 'About', params: {collId: collectionId} }"
                active-class="active"
              >
                En savoir plus
              </router-link>
            </div>
          </div>
          <div class="wrapper">
            <div class="toc-area app-width-margin" :class="tocCssClass">
              <div class="toc-area-header">
                <a href="#">Parcourir la collection </a>
                <a href="#" class="toggle-btn" v-on:click.prevent="toggleExpanded(collectionId)"></a>
              </div>
              <div v-if="componentTOC.length > 0"
                class="menu app-width-margin"
                :class="expandedById[collectionId] ? 'expanded': ''"
              >
                <div v-if="expandedById[collectionId] && componentTOC.length > 0">
                  <CollectionTOC
                    :toc="componentTOC"
                    :margin="0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div id="article" class="article app-width-margin">

      <h1>La collection</h1>

        <p class="texte">Dans le cadre des projets de numérisation soutenus par la sous-direction
            des bibliothèques et de la documentation à la direction de l'Enseignement supérieur du
            ministère de l'Education nationale, de l'enseignement supérieur et de la recherche et
            dans une logique de mise à disposition des ressources de la bibliothèque de l'École
            nationale des chartes à un large public de chercheurs excédant le cercle restreint des
            élèves de l'École et des archivistes paléographes, nous avons proposé un premier choix
            de documents numérisés qui visent à compléter l'offre de la bibliothèque.</p>
        <p class="texte">Ce projet de numérisation a pour objectif de&nbsp;:</p>
        <ul>
            <li>faire connaître certains documents emblématiques de la bibliothèque et de l'École
                des chartes à un public élargi&nbsp;;</li>
            <li>faciliter pour tous les chercheurs la consultation de ces documents qui sont peu
                présents dans les fonds des bibliothèques de recherche françaises, en offrant un
                support de substitution&nbsp;;</li>
            <li>permettre la mise en œuvre d'une nouvelle méthode de recherche fondée sur un
                environnement numérique de travail.</li>
        </ul>
        <p class="texte">La spécificité de la bibliothèque de l'École des chartes, que reflètent les
            enseignements de l'École depuis son origine, est d'être axée sur les <em>éditions de
                sources</em>, en particulier les sources concernant l'histoire de France.</p>
        <p class="texte">A cet égard, l'ensemble que forment les éditions de cartulaires est
            particulièrement remarquable&nbsp;; les collections de la bibliothèque tendent depuis
            toujours à l'exhaustivité dans ce domaine.</p>
        <p class="texte">Au reste, c'est sur cette série que portent un grand nombre des demandes de
            consultation sur place par les chercheurs français ou étrangers. Il nous a donc paru
            important et urgent de donner à ces cartulaires un accès facilité et une plus grande
            visibilité, d'autant plus que nous ne pouvons que rarement satisfaire les demandes de
            prêt pour des éditions souvent anciennes (datant du XIX<sup>e</sup> siècle pour la
            plupart) et fragilisées en raison de leur fréquente manipulation, ainsi que de leur date
            d'édition (à un moment où des papiers de mauvaise qualité sont massivement utilisés pour
            l'édition).
        </p>
    </div>
  </div>
</template>

<script>
import { computed, inject, reactive, ref, watch } from 'vue'

import { getMetadataFromApi } from '@/api/document.js'
import CollectionTOC from '@/components/CollectionTOC.vue'

export default {
  components: { CollectionTOC },
  props: {
    collectionIdentifier: {
      type: String,
      required: true
    },
    currentCollection: {
      type: Object,
      required: true
    }
  },
  async setup (props) {
    const state = reactive({
      isTreeOpened: false
    })

    const layout = inject('variable-layout')
    const collectionAltTitle = `${import.meta.env.VITE_APP_APP_ROOT_COLLECTION_ALT_TITLE}`
    const collectionId = ref(props.collectionIdentifier)
    console.log('HomePageDefault setup collectionId', collectionId.value)

    const componentTOC = ref([])
    const currCollection = ref(props.currentCollection)

    componentTOC.value = [...currCollection.value.member]
    console.log('HomePageDefault currentCollection.value / componentTOC.value : ', currCollection.value, componentTOC.value)

    console.log('HomePageDefault componentTOC / collectionId : ', Object.fromEntries(componentTOC.value.map(col => [col.identifier, false])), componentTOC.value, collectionId, currCollection)

    const expandedById = ref([])

    const toggleExpanded = async (collId) => {
      // console.log('HomePageDefault Modal toggleExpanded', componentTOC.value)
      if (componentTOC.value.length === 0) {
        const response = await getMetadataFromApi(collId)
        response.member.forEach(m => {
          m.identifier = m['@id']
        })
        response.member.forEach(m => {
          m.parent = collId
        })
        componentTOC.value = response.member
        // console.log('HomePageDefault toggleExpanded componentTOC', componentTOC.value)
      }
      expandedById.value[collId] = !expandedById.value[collId]
      state.isTreeOpened = !state.isTreeOpened
      // console.log('HomePageDefault toggleExpanded after expandedById[collectionId] : ', collId, expandedById.value)
    }

    const homeCssClass = computed(() => {
      return state.isTreeOpened ? 'is-tree-opened' : ''
    })

    watch(props, (newProps) => {
      collectionId.value = newProps.collectionIdentifier
      currCollection.value = newProps.currentCollection
    }, { deep: true, immediate: true })

    return {
      collectionAltTitle,
      homeCssClass,
      tocCssClass: layout.tocCssClass,
      collectionId,
      currCollection,
      componentTOC,
      toggleExpanded,
      expandedById
    }
  }
}
</script>

<style scoped>
a {
  border-bottom: none;
}
#article {
  padding: 40px 10% 120px;
  border-bottom: 1px dotted #ffffff;
  min-height: 100%;
}
#article article {
  margin: 0;
}
#article h1,
#article {
  font-family: "Barlow", sans-serif !important;
}
#article h1 {
  padding-top: 20px;
  padding-bottom: 20px;
  font-size: 25px;
  font-weight: 500;
  line-height: 33px;
  text-transform: none;
  color: #971716;
}
.toc-area {
  width: 100%;
  font-family: "Barlow", sans-serif !important;
  margin-bottom: 30px !important;
}
.toc-area-header {
  display: flex;
  width: 100%;
  padding: 20px;
  background-color: #f1f1f1;
  border-radius: 6px;
  position: relative;
}
.toc-area-header > a {
  text-transform: uppercase;
  font-family: "Barlow Semi Condensed", sans-serif;
  font-weight: 500;
  color: #4a4a4a !important;
  text-decoration: none;
  border: none;
  &:first-child {
    text-transform: none;
    margin-left: auto;
    margin-right: 47px;
  }
}
.is-tree-opened .menu {
  display: flex;
  flex-direction: column;
  padding: 0px 20px 0px;
  /* border-top: solid 2px #fcfcfc; */
  background-color: #e4e4e4;
  border-radius: 0 0 6px 6px;
}

/* toggle */
.toggle-btn {
  position: absolute;
  right: 20px;
  width: 27px;
  height: 27px;
  background: url(../assets/images/chevron_rouge.svg) center top -7px / cover no-repeat;
  border: none;
  text-decoration: none;
}
.is-tree-opened .toggle-btn {
  background: url(../assets/images/croix.svg) center / cover no-repeat;
}
#article {
  margin-bottom: 30px !important;
  padding: 10px 0 10px !important;
}
.wrapper {
  width: 100%;
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
.project-tile {
  display: flex;
  width: fit-content;
  margin-bottom: 30px;
  padding: 6px 10px;
  border: #b9192f 1px solid;
  border-radius: 6px;
  & > a {
    font-family: "Barlow Semi Condensed", sans-serif;
    font-weight: 500;
    text-transform: uppercase;
    text-decoration: none;
    color: #b9192f;
  }
}
</style>
