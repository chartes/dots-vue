<template>
  <article class="about">
    <div class="about-content">
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
    }
  },
  setup (props) {
    const dtsCollDescription = ref(props.dtsCollectionDescription)
    const customCollDescription = ref(props.customCollectionDescription)

    watch(props, async (newProps) => {
      dtsCollDescription.value = newProps.dtsCollectionDescription
      customCollDescription.value = newProps.customCollectionDescription
    }, { deep: true, immediate: true })

    return {
      dtsCollDescription,
      customCollDescription
    }
  }
}
</script>
<style scoped>
.about {
  font-family: "Barlow", sans-serif;
}
.about h1 {
  padding-top: 20px;
  padding-bottom: 20px;
  font-family: "Barlow", sans-serif;
  text-align: left;
  font-size: 25px;
  font-weight: 500;
  line-height: 33px;
  text-transform: none;
  color: var(--text-color);
}
.about h2 {
  padding-top: 20px;
  padding-bottom: 20px;
  font-family: "Barlow", sans-serif;
  text-align: left;
  font-weight: 500;
  line-height: 33px;
  text-transform: none;
}
.about p {
  text-align: left;
  text-indent: 0;
  word-break: break-word;
}
.about a {
  color: #B9192F;
  word-break: break-word;
  &:hover {
    text-decoration: underline !important;
  }
}
.about table,
.about pre,
.about blockquote {
  margin: 20px 0;
}
</style>
