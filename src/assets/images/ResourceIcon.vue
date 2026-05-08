<template>
  <div
    class="icon-wrapper"
    :style="cssVars"
  >
    <svg
      class="icon"
      viewBox="0 0 25 25"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g :transform-origin="iconScaleOrigin" :transform="iconTransform">
        <path
            fill="currentColor"
            fill-rule="evenodd"
            d="M2.777 2.778V22.222H22.215V2.778H2.777ZM2.777 25C2.013 25 1.359 24.728 0.815 24.185C0.272 23.64 0 22.986 0 22.222V2.778C0 2.014 0.272 1.36 0.815 0.815C1.359 0.272 2.013 0 2.777 0H22.215C22.979 0 23.633 0.272 24.177 0.815C24.72 1.36 24.992 2.014 24.992 2.778V22.222C24.992 22.986 24.72 23.64 24.177 24.185C23.633 24.728 22.979 25 22.215 25H2.777ZM5.554 8.333H19.438V5.556H5.554V8.333ZM5.554 13.889H19.438V11.111H5.554V13.889ZM5.554 19.444H15.273V16.667H5.554V19.444Z"
        />
      </g>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  bgColor: { type: String, default: 'var(--icon-bg)' },
  fgColor: { type: String, default: 'var(--icon-fg)' },
  size: { type: Number, default: 40 },
  iconScale: { type: Number, default: 0.8 },
  iconScaleOrigin: { type: String, default: 'center' },
  radius: { type: Number, default: 6 }
})

const cssVars = computed(() => ({
  '--bg': props.bgColor,
  '--fg': props.fgColor,
  '--size': `${props.size}px`,
  '--radius': `${props.radius}px`
}))

const iconTransform = computed(() => 'scale('+ props.iconScale + ')' );

</script>

<style scoped>
.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;

  color: var(--fg, #ffffff);
  background-color: var(--bg);

  transition: background-color 0.2s ease;

  flex-shrink: 0;
}

.disabled .icon-wrapper {
  background-color: #C3C3C3;
}

.icon {
  width: auto;
  height: 100%;
}
</style>