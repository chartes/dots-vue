<template>
    <HomePageDefault
      v-if="Object.keys(currCollection).length > 0"
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
      collectionId,
      currCollection
    }
  }
}
</script>
