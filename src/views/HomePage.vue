<template>
    <HomePageDefault
      v-if="Object.keys(currCollection).length > 0"
      :is-doc-projectId-included="isDocProjectIdInc"
      :dts-root-collection-identifier="dtsRootCollectionId"
      :root-collection-identifier="rootCollectionId"
      :collection-identifier="collectionId"
      :collections-settings="appConfig"
      :collection-alternative-title="collectionAltTitle"
      :currentCollection="currCollection"
      :key="currCollection"
    />
</template>

<script>
import { ref, watch } from 'vue'

import HomePageDefault from '@/components/HomePageDefault.vue'

export default {
  name: 'HomePage',
  components: { HomePageDefault },
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
    collectionsSettings: {
      type: Object,
      required: true
    },
    collectionAlternativeTitle: {
      type: String,
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
    const isDocProjectIdInc = ref(props.isDocProjectIdIncluded)
    const dtsRootCollectionId = ref(props.dtsRootCollectionIdentifier)
    const rootCollectionId = ref(props.rootCollectionIdentifier)
    const collectionId = ref(props.collectionIdentifier)
    const appConfig = ref(props.collectionsSettings)
    const collectionAltTitle = ref(props.collectionAlternativeTitle)
    const currCollection = ref(props.currentCollection)
    console.log('HomePage setup props.dtsRootCollectionIdentifier', props.dtsRootCollectionIdentifier)
    console.log('HomePage setup props.rootCollectionIdentifier', props.rootCollectionIdentifier)
    console.log('HomePage setup props collectionIdentifier : ', props.collectionIdentifier)
    console.log('HomePage setup props currentCollection : ', props.currentCollection)
    console.log('HomePage setup collectionId.value / currCollection.value : ', collectionId.value, currCollection.value)

    watch(props, (newProps) => {
      dtsRootCollectionId.value = newProps.dtsRootCollectionIdentifier
      rootCollectionId.value = newProps.rootCollectionIdentifier
      collectionId.value = newProps.collectionIdentifier
      appConfig.value = newProps.collectionsSettings
      collectionAltTitle.value = newProps.collectionAlternativeTitle
      currCollection.value = newProps.currentCollection
    }, { deep: true, immediate: true })

    return {
      isDocProjectIdInc,
      dtsRootCollectionId,
      rootCollectionId,
      collectionId,
      appConfig,
      collectionAltTitle,
      currCollection
    }
  }
}
</script>
