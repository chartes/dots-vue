<template>
    <p v-if="$props.targetDiv === 1">Test</p>
    <p v-else>Test 2</p>
</template>
<script>
export default {
  name: 'HomePageDefaultContent',

  components: {
  },

  props: {
    targetDiv: { required: true, default: 0, type: Number }
  }
}
</script>
<style scoped>
</style>
