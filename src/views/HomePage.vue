<template>
    <HomePageDefault
      v-if="Object.keys(currCollection).length > 0"
      :is-doc-projectId-included="isDocProjectIdInc"
      :collection-identifier="collectionId"
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
    const collectionId = ref(props.collectionIdentifier)
    const currCollection = ref(props.currentCollection)
    console.log('HomePage setup props collectionIdentifier : ', props.collectionIdentifier)
    console.log('HomePage setup props currentCollection : ', props.currentCollection)
    console.log('HomePage setup collectionId.value / currCollection.value : ', collectionId.value, currCollection.value)

    watch(props, (newProps) => {
      collectionId.value = newProps.collectionIdentifier
      currCollection.value = newProps.currentCollection
    }, { deep: true, immediate: true })

    return {
      isDocProjectIdInc,
      collectionId,
      currCollection
    }
  }
}
</script>
