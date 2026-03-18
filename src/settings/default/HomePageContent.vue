<template>
  <article class="home">
    <div class="home-content">
      <h1>A custom default title</h1>
      <h2>In the default custom component, you can use either: </h2>
      <p>
        <b>a DTS API collection description if available:</b>
      </p>
      <p>
        {{ dtsCollDescription ? dtsCollDescription : 'No DTS API collection description available' }}
      </p>
      <p>
        <b>a custom collection description (homePageSettings.descriptionSection.collectionDescription) if available:</b>
      </p>
      <p>
        {{ customCollDescription ? customCollDescription : 'No homePageSettings.descriptionSection.collectionDescription available' }}
      </p>
      <p>
        <b>...or use a complete custom default description:</b>
      </p>
    </div>
  </article>
</template>
<script>
import { ref, watch } from 'vue'

export default {
  name: 'HomePageContent',
  props: {
    dtsCollectionDescription: {
      type: String,
      required: false
    },
    customCollectionDescription: {
      type: String,
      required: false
    },
    applicationRootUrl: {
      type: String,
      required: true
    }
  },
  setup (props) {
    /* Use appRootUrl to create links within the application with the relevant base url for the current deployment */
    const appRootUrl = ref(props.applicationRootUrl)
    /* Use dtsCollDescription to display the DTS API 'description' data */
    const dtsCollDescription = ref(props.dtsCollectionDescription)
    /* Use customCollDescription to display the homePageSettings.descriptionSection.collectionDescription data of the collection conf.json */
    const customCollDescription = ref(props.customCollectionDescription)

    watch(props, async (newProps) => {
      appRootUrl.value = newProps.applicationRootUrl
      dtsCollDescription.value = newProps.dtsCollectionDescription
      customCollDescription.value = newProps.customCollectionDescription
    }, { deep: true, immediate: true })

    return {
      appRootUrl,
      dtsCollDescription,
      customCollDescription
    }
  }
}
</script>
<style scoped>
.home-content {
  padding-top: 10px /* adjust depending if you also have a title - see below */
}
.home > * {
  font-family: var(--font-primary), sans-serif;
  color: #333333;
}
.home h1 {
  padding-top: 20px;
  padding-bottom: 20px;
  text-align: left;
  font-size: 25px;
  font-weight: 500;
  line-height: 33px;
  text-transform: none;
  color: var(--text-color);
}
.home h2 {
  margin: 0 !important;
  padding-top: 20px;
  padding-bottom: 20px;
  text-align: left;
  font-size:20px;
  font-weight: 500;
  line-height: 28px;
  text-transform: none;
  color: #4a4a4a !important;
}
.home p {
  text-align: left;
  text-indent: 0;
  word-break: break-word;
}
.home a {
  color: #B9192F;
  word-break: break-word;
  text-decoration: underline;
  &:hover {
  }
}
.home table,
.home pre,
.home blockquote {
  margin: 20px 0;
}
</style>
