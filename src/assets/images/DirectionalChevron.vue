<template>
  <div
    class="icon-wrapper"
    :style="cssVars"
  >
    <svg
      class="icon"
      viewBox="0 0 26 15"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-miterlimit="10"
        transform="translate(0.353516 0.353516)"
        d="M25 0.54609823L12.773677 12.772422L0 0"
        fill-rule="evenodd"
      />
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: { type: Number, default: 25 },
  direction: {
    type: String,
    default: 'down',
    validator: v => ['left', 'right', 'up', 'down'].includes(v)
  }
})

const rotationMap = {
  right: '-90deg',
  down: '0deg',
  left: '90deg',
  up: '180deg'
}

const cssVars = computed(() => ({
  '--size': `${props.size}px`,
  '--rotate': rotationMap[props.direction]
}))
</script>

<style scoped>
.icon-wrapper {
  width: var(--size);
  height: var(--size);

  display: flex;
  align-items: center;
  justify-content: center;

  /* 👇 hérite de la couleur du parent */
  color: inherit;
}

.icon {
  width: 100%;
  height: 100%;
  transform: rotate(var(--rotate, 0deg));
  transition: transform 0.2s ease;
}
</style>