<template>
  <div
    class="icon-wrapper"
    :style="cssVars"
  >
    <svg
      class="icon"
      viewBox="0 0 22.5 25"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g :transform-origin="iconScaleOrigin" :transform="iconTransform">
        <path
          fill="currentColor"
          fill-rule="evenodd"
          d="M2.5 22.5H20V12.5H2.5V22.5ZM2.5 9.775H20V5H2.5V9.775ZM10.575 2.453C10.751 2.276 10.975 2.188 11.246 2.188C11.518 2.188 11.741 2.276 11.917 2.453C12.095 2.63 12.184 2.854 12.184 3.125C12.184 3.396 12.095 3.62 11.917 3.796C11.741 3.974 11.518 4.063 11.246 4.063C10.975 4.063 10.751 3.974 10.575 3.796C10.398 3.62 10.309 3.396 10.309 3.125C10.309 2.854 10.398 2.63 10.575 2.453ZM21.758 3.234C21.269 2.745 20.681 2.5 19.993 2.5H14.745C14.474 1.75 14.022 1.146 13.387 0.688C12.751 0.229 12.037 0 11.246 0C10.455 0 9.742 0.229 9.106 0.688C8.471 1.146 8.019 1.75 7.747 2.5H2.5C1.812 2.5 1.223 2.745 0.735 3.234C0.245 3.724 0 4.313 0 5V22.5C0 23.188 0.245 23.776 0.735 24.265C1.223 24.755 1.812 25 2.5 25H20C20.681 25 21.269 24.755 21.758 24.265C22.248 23.776 22.493 23.188 22.493 22.5V5C22.493 4.313 22.248 3.724 21.758 3.234Z"
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
  iconScale: { type: Number, default: 0.9 },
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

  width: var(--size, 40px);
  height: var(--size, 40px);
  border-radius: var(--radius, 6px);

  color: var(--fg, #ffffff);
  background-color: var(--bg);

  transition: background-color 0.2s ease;

  flex-shrink: 0;
}

.disabled .icon-wrapper {
  background-color: #C3C3C3;
}

</style>