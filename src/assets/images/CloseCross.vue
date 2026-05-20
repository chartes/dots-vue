<template>
  <div
    class="icon-wrapper"
    :style="cssVars"
  >
    <svg
      class="icon"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g
        fill="none"
        stroke="currentColor"
        stroke-width="1"
        stroke-linecap="round"
      >
        <!-- Diagonale 1 -->
        <line x1="6" y1="6" x2="18" y2="18" />
        <!-- Diagonale 2 -->
        <line x1="18" y1="6" x2="6" y2="18" />
      </g>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  bgColor: { type: String, default: 'transparent' },
  fgColor: { type: String, default: 'currentColor' },
  size: { type: Number, default: 24 }
})

const cssVars = computed(() => ({
  '--bg': props.bgColor,
  '--fg': props.fgColor,
  '--size': `${props.size}px`
}))
</script>

<style scoped>
.icon-wrapper {
  color: var(--fg);
  background-color: var(--bg);

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
}

.icon {
  width: 100%;
  height: 100%;
}
</style>