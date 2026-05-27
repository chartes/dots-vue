<template>
  <div
    class="document-metadata"
    :class="metaDataCssClass"
  >
    <div
      v-if="!isPopUp && hasHeader"
      class="document-metadata-header"
    >
      <div
        class="resource"
        @click="toggleContent"
      >
        <span class="metadata-header-title resource">
          {{ metadata['dts:title'] }}
        </span>
        <span class="metadata-header-label resource">Métadonnées</span>
      </div>
      <a
        href="#"
        class="toggle-btn"
        @click="toggleContent"
      />
    </div>
    <div
      v-else-if="hasHeader"
      class="document-metadata-header"
    >
      <div class="collection" @click="toggleContent">
        <span class="metadata-header-label collection">Métadonnées</span>
        <span class="metadata-header-title collection">{{ metadata['dts:title'] }}</span>
      </div>
      <a href="#" class="toggle-btn" @click="toggleContent" />
    </div>

    <aside class="menu">
      <div class="is-flex is-justify-content-center">
        <table class="table is-fullwidth">
          <tbody>
            <template v-for="(value, key) in metadata" :key="key">

              <!-- Case 1 : array -->
              <template v-if="Array.isArray(value) && value.length > 0">
                <tr
                  v-for="(item, i) in value"
                  :key="i"
                  class="row is-align-items-center"
                >
                  <!-- Label with rowspan on first line only -->
                  <td v-if="i === 0" :rowspan="value.length" class="metadata-key">
                    <span class="title"><b>{{ key }}</b></span>
                  </td>

                  <!-- Value Case -->
                  <td>
                    <span class="title">
                      <!-- enriched item { value, url?, source } -->
                      <template v-if="item && typeof item === 'object' && 'value' in item">
                        <a v-if="item.url" :href="item.url" target="_blank">{{ item.value }}</a>
                        <span v-else>{{ item.value }}</span>
                      </template>
                      <!-- item objet structuré { name, @id, ... } -->
                      <template v-else-if="item && typeof item === 'object'">
                        <a v-if="item.url" :href="item.url" target="_blank">
                          {{ item['schema:name'] ?? item.url }}
                        </a>
                        <span v-else>{{ item.name ?? JSON.stringify(item) }}</span>
                      </template>
                      <!-- scalar item -->
                      <template v-else>
                        <a v-if="typeof item === 'string' && item.startsWith('http')" :href="item" target="_blank">{{ item }}</a>
                        <span v-else>{{ item }}</span>
                      </template>
                    </span>
                  </td>

                  <!-- Logo cell -->
                  <!-- Array of logos cell -->
                  <td>
                    <div class="is-flex is-align-items-center is-justify-content-flex-end" style="gap: 4px">
                      <!-- Main source (@id) -->
                      <figure v-if="item?.source?.name" class="image level-left">
                        <a :href="item.url" target="_blank">
                          <img :src="ImgUrl(item.source.name)" />
                        </a>
                      </figure>
                      <!-- Secondary sources (sameAs) -->
                      <figure
                        v-for="(sa, si) in (item?.sameAsSources ?? [])"
                        :key="si"
                        class="image level-left"
                      >
                        <a :href="sa.value" target="_blank">
                          <img :src="ImgUrl(sa.source.name)" />
                        </a>
                      </figure>
                    </div>
                  </td>
                </tr>
              </template>

              <!-- Case 2 : enriched object { value, url?, source } -->
              <template v-else-if="value && typeof value === 'object' && 'value' in value">
                <tr class="row">
                  <td class="metadata-key"><span class="title"><b>{{ key }}</b></span></td>
                  <td>
                    <span class="title">
                      <a v-if="value.url" :href="value.url" target="_blank">{{ value.value }}</a>
                      <span v-else>{{ value.value }}</span>
                    </span>
                  </td>
                  <td>
                    <div class="is-flex is-align-items-center is-justify-content-flex-end" style="gap: 4px">
                      <figure v-if="value.source?.name" class="image level-left">
                        <a :href="value.url" target="_blank">
                          <img :src="ImgUrl(value.source.name)" />
                        </a>
                      </figure>
                    </div>
                  </td>
                </tr>
              </template>

              <!-- Case 3 : structured object { name, @id, ... } without source -->
              <!-- Case 3 : structured object { name, @id, ... } without source or with sameAs -->
              <template v-else-if="value && typeof value === 'object'">
                <tr class="row">
                  <td class="metadata-key"><span class="title"><b>{{ key }}</b></span></td>
                  <td>
                    <span class="title">
                      <a
                        v-if="value['@id'] || value.url"
                        :href="value['@id'] || value.url"
                        target="_blank"
                      >
                        {{ value['schema:name'] || value['@id'] || value.url }}
                      </a>
                      <span v-else>{{ value.name || JSON.stringify(value) }}</span>
                    </span>
                  </td>
                  <td>
                    <div class="is-flex is-align-items-center is-justify-content-flex-end" style="gap: 4px">
                      <!-- Main source (@id) -->
                      <figure v-if="value.source?.name" class="image level-left">
                        <a :href="value.url || value['@id']" target="_blank">
                          <img :src="ImgUrl(value.source.name)" />
                        </a>
                      </figure>
                      <!-- Secondary sources (sameAs) -->
                      <figure
                        v-for="(sa, si) in (value.sameAsSources ?? [])"
                        :key="si"
                        class="image level-left"
                      >
                        <a :href="sa.value" target="_blank">
                          <img :src="ImgUrl(sa.source.name)" />
                        </a>
                      </figure>
                    </div>
                  </td>
                </tr>
              </template>

              <!-- Case 4 : scalar (string, number, boolean) -->
              <template v-else-if="value != null">
                <tr class="row">
                  <td class="metadata-key"><span class="title"><b>{{ key }}</b></span></td>
                  <td>
                    <span class="title">
                      <a
                        v-if="typeof value === 'string' && value.startsWith('http')"
                        :href="value"
                        target="_blank"
                      >{{ value }}</a>
                      <span v-else>{{ value }}</span>
                    </span>
                  </td>
                  <td></td>
                </tr>
              </template>
            </template>
          </tbody>
        </table>
      </div>
    </aside>
  </div>
</template>

<script>
import { computed, ref, toRaw, watch } from 'vue'
import md5 from 'md5'
import * as $rdf from 'rdflib'

import { buildDisplayModel } from '@/composables/useMetadataProcessor'

export default {
  name: 'DocumentMetadata',

  components: {},

  props: {
    ispopup: { required: true, default: false, type: Boolean },
    collectionConfig: {
      type: Object,
      required: false
    },
    metadataprop: { required: true, default: () => {}, type: Object },
    hasheader: { required: false, default: true, type: Boolean }
  },

  setup (props) {
    const hasHeader = ref(props.hasheader)
    const state = ref({
      isOpened: !hasHeader.value
    })
    const isPopUp = ref(props.ispopup)
    const isNew = ref(true)
    const metadata = ref({})
    const authorThumbnailUrl = ref(null)


    const getValue = (data) => {
      function getLink (string) {
        if (string.includes('http')) {
          return `<a target="_blank" href="${string}">${string}</a>`
        } else {
          return string
        }
      }
      console.log('data', data)
      if (Array.isArray(data)) {
        return getLink(data[0])
      } else if (typeof (data) === 'object') {
        return getLink(Object.values(data)[0])
      } else {
        return getLink(data)
      }
    }
    const ImgUrl = (source) => {
      console.log('ImgUrl / source', source)
      const imgUrls = import.meta.glob('../assets/images/logo_*.svg', {
        import: 'default',
        eager: true
      })
      if (imgUrls[`../assets/images/logo_${source}.svg`]) {
        console.log('ImgUrl / found an svg for : ', source)
        return imgUrls[`../assets/images/logo_${source}.svg`]
      } else {
        return new URL(`/src/assets/images/logo_${source}.png`, import.meta.url).href
      }
    }

    console.log('DocumentMetadata metadata.value : ', metadata.value)

    const fetchAuthorThumbnailUrl = async (options = {}) => {
      if (metadata.value.wikidata) {
        let wikidataId = metadata.value.wikidata.split('/')
        wikidataId = wikidataId[wikidataId.length - 1]

        console.log('fetchAuthorThumbnailUrl')

        const response = await fetch(
          `https://www.wikidata.org/w/api.php?action=wbgetclaims&property=P18&entity=${wikidataId}&format=json&origin=*`,
          { method: 'GET', ...options }
        )
        const document = await response.json()
        console.log('check AuthorThumbnailUrl response', document)

        if (document.claims.P18) {
          let wikidataLink = document.claims.P18[0].mainsnak.datavalue.value.replaceAll(' ', '_')

          const _sum = md5(wikidataLink)
          wikidataLink = `https://upload.wikimedia.org/wikipedia/commons/${_sum[0]}/${_sum[0]}${_sum[1]}/${encodeURI(wikidataLink)}`
          authorThumbnailUrl.value = wikidataLink

          console.log('author url', authorThumbnailUrl.value)
        } else {
          authorThumbnailUrl.value = null
        }
      } else {
        authorThumbnailUrl.value = null
      }
    }

    const fetchBiblioData = async () => {
      if (metadata.value.data_bnf) {
        const httpsUrl = metadata.value.data_bnf.replace('http:', 'https:')
        // console.log("extra metadata:", httpsUrl);
        console.log(decodeURIComponent(`${httpsUrl}`))
        const redirectUrl = await fetch(`${httpsUrl}`, {
          method: 'GET',
          redirect: 'follow',
          mode: 'cors'
        })
        console.log('redirectUrl.url after redirect : ', redirectUrl.url)
        const httpsUrlJson = redirectUrl.url.replace('/fr', '') + '.json' // .slice(0, -1)
        console.log('biblio json URL', httpsUrlJson)
        const biblioResponse = await fetch(`${httpsUrlJson}`, {
          method: 'GET',
          mode: 'cors'
        }).then((response) => {
          return response.json()
        }).catch(() => {
          console.error('Error while loading databnf data')
        })
        console.log('fetch biblio data', biblioResponse)
      }
    }

    const metaDataCssClass = computed(() => {
      return state.value.isOpened ? 'is-opened' : ''
    })

    const toggleContent = function (event) {
      event.preventDefault()
      state.value.isOpened = !state.value.isOpened
    }

    const toggleNew = function (event) {
      event.preventDefault()
      isNew.value = !isNew.value
    }

    // const $rdf = require('rdflib')
    const fetchRDF = async () => {
      console.log('metadata.value.idref : ', metadata.value.idref)
      if (metadata.value.idref) {
        console.log('metadata.value.idref : ', metadata.value.idref)
        const store = $rdf.graph()
        const me = store.sym(metadata.value.idref)
        console.log('me : ', me)
      }
    }

    watch(
      () => [props.metadataprop, props.collectionConfig],
      async ([source, config]) => {
        if (!source) { metadata.value = {}; return }
        console.log('watch metadata source', source)

        if (!source) { metadata.value = {}; return }
        const rawSource = JSON.parse(JSON.stringify(toRaw(source)))
        const rawConfig = config ? JSON.parse(JSON.stringify(toRaw(config))) : {}
        metadata.value = await buildDisplayModel(rawSource, rawConfig)

        await fetchAuthorThumbnailUrl()
        await fetchBiblioData()
        await fetchRDF()
      },
      { immediate: true, deep: true }
    )

    return {
      metaDataCssClass,
      isPopUp,
      isNew,
      hasHeader,
      toggleContent,
      toggleNew,
      authorThumbnailUrl,
      metadata,
      getValue,
      ImgUrl
    }
  }
}
</script>

<style scoped>
.document-metadata {
  width: 100%;
}
.document-metadata-header {
  display: flex;
  width: 100%;
  padding: 20px;
  background-color: #e4e4e4;
  border-radius: 6px;
  position: relative;

  font-family: var(--font-primary), sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 22px;
  text-decoration: none;
  border: none;

  & > div.resource {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    /* align-items: baseline; */
    width: 100%;
  }
}
.is-opened .document-metadata-header {
  border-radius: 6px 6px 0 0;
}
.document-metadata-header span.metadata-header-label.collection{
  margin-right: 40px;
  font-family: var(--font-secondary), sans-serif !important;
  font-weight: 500;
  color: #4a4a4a;
}
.document-metadata-header span.metadata-header-label.resource {
  margin-right: 47px;
  margin-left: auto;
  text-align: left;
  font-family: var(--font-secondary), sans-serif !important;
  font-weight: 500;
  color: #4a4a4a;
}
.document-metadata-header span.metadata-header-title.collection {
  margin-right: 40px;
  color: #4a4a4a;
}
.document-metadata-header span.metadata-header-title.resource {
  margin-right: 40px;
  font-size: 20px;
  font-weight: 500;
  color: var(--text-color);
}
.document-metadata-header span.metadata-header-author {
  color: #929292;
}
/* toogle */
.toggle-btn {
  position: absolute;
  right: 20px;
  width: 20px;
  height: 27px;
  background: url(../assets/images/chevron_rouge.svg) center top -8px / cover no-repeat;
  border: none;
  text-decoration: none;
}
.is-opened .toggle-btn {
  background: url(../assets/images/croix.svg) center / cover no-repeat;
}

.document-metadata-header > a {
  text-decoration: none;
  border: none;
  max-width: calc(100% - 40px);
}
.document-metadata .menu {
  display: none;
}
.document-metadata.is-opened .menu {
  display: block;
}
ol,
ul {
  list-style: none;
}
aside.menu > .columns {
  padding: 25px 20px 40px;
  border-top: solid 2px #fcfcfc;
  background-color: #e4e4e4;
  border-radius: 0 0 6px 6px;
}
aside.menu > .columns > .column {
  padding: 0;
}
aside.menu > .columns > .column:nth-child(1) {
  padding-right: 50px;
}
aside.menu > .columns > .column:nth-child(2) {
  padding-right: 80px;
}
aside.menu > .columns > .column:nth-child(3) {
  max-width: 50%;
}
.column .title, span.title,
.column {
  font-family: var(--font-primary), sans-serif;
  font-size: var(--font-toc-metadata-size);
  font-weight: normal;
  font-style: normal;

  & > a {
    font-weight: normal;
    font-style: normal;
    color: #4a4a4a;
  }
}
.title {
  text-indent: 0;
  margin-bottom: 0;
  color: #4a4a4a;
  & :deep i {
    font-style: italic !important;
  }
}
td > span.title > b {
  white-space: nowrap;
}
h2.title {
  text-align: left;
  margin: 0 0 20px 0;
  padding: 0;
  text-transform: uppercase;
  font-weight: 700;
  color: #929292;
}
figure img,
figure {
  margin: 0 !important;
  padding: 0 !important;
  border: none;
  background-color: var(--meta-area-fill-color);
}

figure.image img{
  height: 32px;
  width: auto;
  vertical-align: middle;
}

@media screen and (max-width: 1320px) {
  .menu-list,
  aside.menu > .columns {
    flex-direction: column;
  }
  aside.menu > .columns > .column:nth-child(1) {
    width: 25% !important;
    padding-right: 0;
    margin-bottom: 50px;
  }
  aside.menu > .columns > .column:nth-child(2),
  aside.menu > .columns > .column:nth-child(3) {
    width: 100% !important;
    padding-right: 0;
    margin-bottom: 50px;
  }
  aside.menu > .columns > .column:nth-child(3) {
    max-width: 75% !important;
  }
}
@media screen and (max-width: 768px) {
  aside.menu > .columns > .column:nth-child(1) {
    width: 50% !important;
  }
  .document-metadata-header > a {
    max-width: calc(100% - 30px);
  }
  .document-metadata-header span.metadata-header-title,
  .document-metadata-header span.metadata-header-author {
    display: block;
  }

  .tab-content {
    & .table td {
      padding: 5px 5px;
    }
  }

  .menu {
    line-height: 1;
  }

  .column .title, span.title,
  .column {
    & {
    }
  }
}
@media screen and (max-width: 640px) {
  .toggle-btn {
    position: absolute;
    bottom: 10px;
    right: 15px;
    width: 20px;
  }
  .document-metadata-header > .resource {
    padding-bottom: 40px;
  }
  .document-metadata-header span.metadata-header-label.resource {
    position: absolute;
    left: 20px;
    bottom: 15px;
    margin-right: 0;
  }
  .document-metadata-header {
    position: relative;
    & > div.resource {
      justify-content: space-between;
    }
    &::after {
      content: "";
      display: block;
      width: 100%;
      position: absolute;
      bottom:45px;
      left: 0;
      border-top: 1px solid #CECECE;
    }
  }
  .document-metadata-header span.metadata-header-author {
    color: #929292;
    text-align: right;
  }

  figure.image img{
    height: 24px;
    width: auto;
  }

  table tr.row {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    padding: 8px 0;
    gap: 0 !important;

    & > td {
      flex: 70% 0 0;
      width: 70%;
      border: none;
      padding: 2px !important;
    }

    & > td.metadata-key {
      flex: 100% 0 0;
      width: 100%;
      border: none;
    }

    & > td:last-child {
      flex: 30% 0 0;
      width: 30%;
    }
  }

}
table {
  background-color: #f1f1f1;
  border-radius: 0 0 6px 6px;
  border: none;
}
td {
  vertical-align: middle !important;
}
</style>
