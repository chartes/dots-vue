<template>
  <div class="">
    <div class="tiles">
      <div class="tile page-header app-width-padding">
        <div class="tile is-child">
          <div class="is-flex is-flex-direction-row title-tile">
            <p class="title">{{ collectionAltTitle ? collectionAltTitle : currCollection.title }} - Terms of service</p>
          </div>
        </div>
      </div>
    </div>
    <section class="main app-width-margin">
      <div id="article" class="article">
        <h1>Publisher</h1>
        <p>
          École nationale des chartes, Public establishment<br>
          65, rue de Richelieu<br>
          12, rue des Petits-Champs<br>
          75002 Paris<br>
          Tél. + 33 (0)1 55 42 75 00<br>
          Siret : 19753478700043
        </p>
        <hr>
        <h1>Publishing director</h1>
        <p>
          Michelle Bubenicek, Director of the École nationale des chartes<br>
          secretariat@chartes.psl.eu
        </p>
        <hr>
        <h1>Web hosting</h1>
        <p>
          IR* Huma-Num<br>
          Bâtiment de recherche Nord<br>
          14, cours des humanités<br>
          93322 Aubervilliers cedex
        </p>
        <hr>
        <h1>Personal data</h1>
        <p>Refer to the page <a target="_blank" href="https://www.chartes.psl.eu/politique-de-confidentialite">« Politique de confidentialité »</a> of the École nationale des chartes - PSL.</p>

        <hr>
        <h1>Intellectual property</h1>

        <h2>Website development and content</h2>
        <p>Unless otherwise stated, the structure, design and content of this website ({{ websiteURL }}) and data available via its APIs
           are shared under the Creative Commons license <a target="_blank" href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a>.
        </p>

        <h2>Image rights</h2>
        <!--
        <p>Les sources des bannières des pages du site eNDP (endp.chartes.psl.eu) sont les
          suivantes :</p>
        <ul>
          <li>
            page d'accueil&nbsp;: «&nbsp;Olivier Truschet, Germain Hoyau&nbsp;; Plan de Paris vers 1550&nbsp;», Domaine public, <a href="https://commons.wikimedia.org/wiki/File:Plan_de_Paris_vers_1550_color.jpg">Wikimedia Commons</a>&nbsp;;
          </li>
          <li>
            page personnes&nbsp;: «&nbsp;Unité de décor - f. 108r, Liturgie&nbsp;: service funèbre&nbsp;», <a href="https://mandragore.bnf.fr/ark:/12148/cgfbt209696b" target="_blank">BnF-Mandragore</a>, <a href="https://gallica.bnf.fr/edit/und/conditions-dutilisation-des-contenus-de-gallica" target="_blank">conditions de réutilisation</a>&nbsp;;
          </li>
          <li>
            page registres&nbsp;: «&nbsp;Détail du <a href="https://nakala.fr/10.34847/nkl.8bdfe89g" target="_blank">registre capitulaire LL105</a>&nbsp;», <a href="https://creativecommons.org/licenses/by/4.0/legalcode.fr" target="_blank">CC-BY 4.0</a>&nbsp;;</li>
          <li>
            page ressources, mentions légales  et contacts&nbsp;: «&nbsp;Détail de la rosace ouest de la Cathédrale Notre-Dame de Paris&nbsp;», Cyril Preiss, <a href="https://www.culture.gouv.fr/Mentions-legales" target="_blank">conditions de réutilisation</a>.
          </li>
        </ul>

        <p>L'icône <a href="https://icon-icons.com/pack/Business-Solid---The-Capitalism-icon-set/2534" target="_blank">«&nbsp;Processing&nbsp;»</a> présente dans le schéma de la page ressources du site est partagé sous licence <a href="https://creativecommons.org/licenses/by/4.0/legalcode.fr" target="_blank">CC-BY 4.0</a>.</p>

        <p>Les crédits photographiques et autres mentions relatives aux droits d'auteur, tels que spécifiés sur ce site, doivent être respectés.</p>
        -->
        <hr>
        <h1>Liability clause</h1>
        <p>The information on the site is provided as a public service.<br>
          The publisher uses all reasonable efforts to ensure the information available on the website ({{ websiteURL }})
           is as available, accurate, and up to date as possible, and reserves the right to amend and correct its content
          at any time without prior notice.<br>
          However, the publisher cannot guarantee the availability, accuracy or completeness of the information presented.
          Use of the information available or provided on this website is the sole responsibility of the user.<br>
          Websites or third-party information referenced on the site have been selected and provided to users only for convenience and information purposes.
          The publisher will not be held liable for any damage of any kind resulting from the interpretation or use of information available on the site or on third-party sites.
        </p>
        <p>This notice is subject to be modified and updated at any time without prior notice.<br>
          <br>
          This page was last updated on {{ lastModified }}.
        </p>
       </div>
    </section>
  </div>

</template>
<script>
import { ref, watch } from 'vue'

export default {
  name: 'TermsOfServiceView',
  props: {
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
    const collectionAltTitle = ref(props.collectionConfig.homePageSettings.collectionAltTitle)
    const currCollection = ref(props.currentCollection)
    const websiteURL = window.location.origin
    const lastModified = new Intl.DateTimeFormat('fr-FR', { year: 'numeric', month: 'numeric', day: 'numeric' }).format(new Date(document.lastModified)).replace(/\./g, '-')

    watch(props, (newProps) => {
      collectionAltTitle.value = newProps.collectionConfig.homePageSettings.collectionAltTitle
      currCollection.value = newProps.currentCollection
    }, { deep: true, immediate: true })

    return {
      collectionAltTitle,
      currCollection,
      websiteURL,
      lastModified
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
  & > p {
    text-indent: 0;
  }
  /* min-height: 100%; */
}
#article article {
  margin: 0;
}
#article h1, #article h2,
#article {
  text-align: left;
  font-family: "Barlow", sans-serif !important;
}
#article h1 {
  padding-top: 20px;
  padding-bottom: 20px;
  font-size: 25px;
  font-weight: 500;
  line-height: 33px;
  text-transform: none;
  /* color: #971716; */
  color: var(--text-color);
}
#article h2 {
  padding-top: 15px;
  padding-bottom: 15px;
  font-size: 20px;
  font-weight: 500;
  line-height: 25px;
  text-transform: none;
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
