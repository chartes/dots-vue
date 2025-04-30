<template>
  <footer class="footer is-flex-align-items-flex-end mt-auto">
    <div class="columns app-width-margin">
      <div class="column description">
        <div class="title-container">
          <span class="title">
            {{ footTitle ? footTitle : currCollection.title }}
          </span>
          <span
            v-for="(subtitle, index) in footSubtitles" :key="index"
            class="subtitle"
          >
            {{ subtitle }}
          </span>
        </div>
        <div class="column description">
          <div class="row description">
            {{ footDescription }}
          </div>
        </div>
      </div>
      <div class="column logos">
        <div class="logo-institutions">
          <a
              target="_blank"
              href="https://www.chartes.psl.eu/"
            >
              <img
              class="enc-logo"
              alt="Logo de l'École nationale des chartes"
              src="@/assets/images/footer_enc_logo.png"
            />
          </a>
          <a
              target="_blank"
              href="https://projet.biblissima.fr/fr"
            >
              <img
              class="biblissima-logo"
              alt="Logo de Biblissima+"
              src="@/assets/images/Logo_biblissima_footer_white.png"
            />
          </a>
        </div>
        <div class="logo">
          <span>
            Powered by
          </span>
          <a
              class="dots-logo"
              target="_blank"
              href="https://chartes.github.io/dots_documentation/"
            >
            <!--<img
              class="dots-logo"
              alt="Logo de DoTS"
              src="@/assets/images/Logo_dots.png"
            />-->
          </a>
        </div>
      </div>
    </div>
    <div class="row links">
      <ul class="footer-links">
        <li>
          <a target="_blank" href="https://www.chartes.psl.eu/contact">
            Contact
          </a>
        </li>
        <li>
          <router-link
            :to="{ name: 'Terms'}"
            active-class="active"
          >
            Terms of service
          </router-link>
        </li>
        <li>
          <a target="_blank" href="https://www.huma-num.fr/">
            Huma-Num
          </a>
        </li>
      </ul>
    </div>
  </footer>
</template>
<script>
import { ref, watch } from 'vue'

export default {
  name: 'AppFooter',
  props: {
    collectionIdentifier: {
      type: String,
      required: true
    },
    footerSettings: {
      type: Object,
      required: true
    },
    /*footerTitle: {
      type: String,
      required: true
    },
    footerSubtitles: {
      type: Array,
      required: true
    },
    footerDescription: {
      type: String,
      required: true
    },*/
    currentCollection: {
      type: Object,
      required: true
    }
  },

  setup (props) {
    const footTitle = ref(props.footerSettings.footerTitle)
    const footSubtitles = ref(props.footerSettings.footerSubtitles)
    const footDescription = ref(props.footerSettings.footerDescription)
    const collectionId = ref(props.collectionIdentifier)
    const currCollection = ref(props.currentCollection)
    console.log('Footer setup props.collectionIdentifier / collectionId.value : ', props.collectionIdentifier, collectionId.value)
    console.log('Footer setup props.currentCollection / currCollection.value : ', props.currentCollection, currCollection.value)
    console.log('Footer setup footSubtitles', footSubtitles)

    watch(props, (newProps) => {
      collectionId.value = newProps.collectionIdentifier
      footTitle.value = newProps.footerSettings.footerTitle
      footSubtitles.value = newProps.footerSettings.footerSubtitles
      footDescription.value = newProps.footerSettings.footerDescription
      currCollection.value = newProps.currentCollection
    })

    return {
      collectionId,
      currCollection,
      footTitle,
      footSubtitles,
      footDescription
    }
  }
}
</script>
<style>
.footer {
  background-color: #4C4949;
  border-top: #BA0F29 solid 4px;
  /* max-height: 400px; */
  width: 100%;
  text-align: center;
  padding: 50px;
  transform: rotateZ(0);
}
.footer .title-container {
  display: flex;
  flex-direction: column;
  justify-content: left;
  text-align: left;
  color: white;
  & >.title {
    text-align: left;
    font-style: normal;
    color: white;
  }
  & >.subtitle {
    margin-top: 12px;
    margin-bottom: 12px;
    text-align: left;
    color: white;
  }
}
.footer .column {
  padding: 0;
}
.footer .column .description {
  display: flex;
  justify-content: left;
  flex-direction: column;
  margin-top: 12px;
  margin-bottom: 12px;
  padding: 0;
  &.row.description {
    text-align: left;
    color: white;
  }
}
.footer-links {
  display: inline-block;
  margin-top: 20px;
  text-transform: uppercase;
  color: white;
}
.footer-links li {
  position: relative;
  display: inline;
}

.footer-links li,
.footer-links li a {
  font-size: 16px;
  line-height: 1;
}

.footer-links li:not(:last-child) {
  margin-right: 10px;
  padding-right: 10px;
}

.footer-links li:not(:last-child):after {
  content: "";
  position: relative;
  top: 0;
  right: -9px;
  display: inline;
  width: 1px;
  font-size: 80%;
  border-right: solid #ffffff 1px;
}

.footer-links li a {
  border-bottom: none;
  font-weight: 400;
  color: #FFFFFF;
  text-transform: uppercase;
}

.footer-links li a:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}
.footer .logos {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-grow: 1;
  & > .logo-institutions {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    justify-content: center;
    align-items: center;
    vertical-align: center;

    & > a {
      display: flex;
      justify-content: center;
      align-items: center;
      vertical-align: center;
      margin: 10px;
      border-bottom: none;
      color: #FFFFFF;
    }
  }
  & > .logo {
    display: flex;
    flex-direction: row;
    flex-grow: 1;
    justify-content: center;
    align-items: center;
    vertical-align: center;
    & > span {
      color: white;
    }
    & > a {
      display: flex;
      justify-content: center;
      align-items: center;
      vertical-align: center;
      margin: 10px;
      border-bottom: none;
      color: #FFFFFF;
    }
  }
}
.enc-logo {
  width: auto;
  height: 70px;
}
.biblissima-logo {
  width: auto;
  height: 70px;
}
.dots-logo {
  display: inline-block;
  width: 70px;
  height: 70px;
  background: url(../assets/images/Logo_dots.png) center / contain no-repeat;
  &:hover {
    background: url(../assets/images/dots-logo-retro.drawio.svg) center / contain no-repeat;
  }
}
@media screen and (max-width: 800px) {
  .footer {
    padding: 50px 10% 80px !important;
  }
  .footer .logos {
    gap: 50px;
  }
}
@media screen and (max-width: 640px) {
  .footer {
    padding: 30px 10% 50px !important;
  }
  .enc-logo {
    height: 40px;
  }
  .dots-logo {
    height: 40px;
  }
}

</style>
