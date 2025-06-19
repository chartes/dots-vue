<template>
  <aside class="media pb-component">
    <article class="pb">
      <div class="pb-label">
        <a :href="imageInfo"></a>
      </div>
      <div><img class="pb-thumnbail" @click.prevent="goToCanvas()" :src="thumbnail" /></div>
    </article>
  </aside>
</template>

<script>
import { inject } from 'vue'

export default {
  name: 'PageBreak',

  props: ['canvasId', 'canvasNum', 'image'],

  setup (props) {
    const mirador = inject('mirador')
    const layout = inject('variable-layout')

    const goToCanvas = function () {
      if (mirador) {
        console.log(props.canvasId)
        const currentCanvasId = Object.values(mirador.miradorStore.getState().windows)[0].canvasId
        console.log('currentCanvasId / props.canvasId', currentCanvasId, props.canvasId, currentCanvasId.substring(currentCanvasId.lastIndexOf('/f') + 1, currentCanvasId.length))
        if (currentCanvasId === props.canvasId && layout.getViewMode() !== 'text-mode') {
          layout.changeViewMode('text-mode')
          mirador.setCanvasId(props.canvasId.substring(0, props.canvasId.lastIndexOf('/f') + 1) + 'f1')
        } else {
          mirador.setCanvasId(props.canvasId)
          // if (layout.miradorVisible != true) {
          // layout.setMiradorVisible(true);
          layout.changeViewMode('text-and-images-mode')
          // }
        }
      }
    }

    const thumbnail = `${props.image.replace(
      '/full/full/0/default.jpg',
      '/full/60,/0/default.jpg'
    )}`
    const imageInfo = `${props.image.replace('/full/full/0/default.jpg', '')}`

    return {
      goToCanvas,
      thumbnail,
      imageInfo
    }
  }
}
</script>

<style>
.pb-component {
  position: relative;
  float: left;
}
.pb {
  position: absolute;
  left: -80px;
}
.pb-component:hover {
  cursor: pointer;
}
.pb-thumnbail {
  max-width: 60px;
}
.pb-label {
  font-size: large;
  text-align: center;
  margin-top: 16px;
  margin-bottom: 16px;
}
</style>
