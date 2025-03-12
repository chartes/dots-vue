<template>
  <footer class="footer is-flex-align-items-flex-end mt-auto">
    <div class="columns">
      <div class="column description">
        <div class="title-container">
          <span class="title">
            {{ footerTitle ? footerTitle : currCollection.title }}
          </span>
          <span
            v-for="(subtitle, index) in footerSubtitles" :key="index"
            class="subtitle"
          >
            {{ subtitle }}
          </span>
        </div>
        <div class="column description">
          <div class="row description">
            {{ footerDescription }}
          </div>
        </div>
      </div>
      <div class="column logos">
        <div class="logo">
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
        </div>
        <div class="logo">
          <a
              target="_blank"
              href="https://chartes.github.io/dots_documentation/"
            >Powered by ...
            <img
              class="dots-logo"
              alt="Logo de DoTS"
              src="@/assets/images/Logo_dots.png"
            />
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
            :to="{ name: 'About'}"
            active-class="active"
          >
            À propos
          </router-link><!-- , params: {collId: collectionId}  -->
        </li>
        <li>
          <a href="/termsofservice" class="">
            Mentions légales
          </a>
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
    currentCollection: {
      type: Object,
      required: true
    }
  },

  setup (props) {
    const footerTitle = `${import.meta.env.VITE_APP_APP_FOOTER_TITLE}`
    const footerSubtitles = `${import.meta.env.VITE_APP_APP_FOOTER_SUBTITLES}` === 'undefined' ? undefined : `${import.meta.env.VITE_APP_APP_FOOTER_SUBTITLES}`.split(',')
    const footerDescription = `${import.meta.env.VITE_APP_APP_FOOTER_DESC}`
    const collectionId = ref(props.collectionIdentifier)
    const currCollection = ref(props.currentCollection)
    console.log('Footer setup footerDescription : ', `${import.meta.env.VITE_APP_APP_FOOTER_DESC}` === 'undefined')
    console.log('Footer setup props.collectionIdentifier / collectionId.value : ', props.collectionIdentifier, collectionId.value)
    console.log('Footer setup props.currentCollection / currCollection.value : ', props.currentCollection, currCollection.value)
    console.log('Footer setup footerSubtitles', footerSubtitles)
    console.log('Footer setup footerSubtitles', footerSubtitles)

    watch(props, (newProps) => {
      collectionId.value = newProps.collectionIdentifier
      currCollection.value = newProps.currentCollection
    })

    return {
      collectionId,
      currCollection,
      footerTitle,
      footerSubtitles,
      footerDescription
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
  & > .logo {
    display: flex;
    flex-grow: 1;
    justify-content: center;
    align-items: center;
    vertical-align: center;
    & > a {
      display: flex;
      justify-content: center;
      align-items: center;
      vertical-align: center;
      border-bottom: none;
      color: #FFFFFF;
    }
  }
}
.enc-logo {
  width: auto;
  height: 70px;
}
.dots-logo {
  width: auto;
  height: 70px;
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
