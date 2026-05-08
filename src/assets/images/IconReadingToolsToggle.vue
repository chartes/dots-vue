<template>
  <div
    class="icon-wrapper"
    :class="{ 'is-active': isActive }"
    :style="cssVars"
  >
    <svg
      class="icon"
      viewBox="0 0 42 42"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <!-- Ellipsis vertical -->
      <g fill="currentColor">
        <circle cx="21" cy="13" r="2.3"/>
        <circle cx="21" cy="21" r="2.3"/>
        <circle cx="21" cy="29" r="2.3"/>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  size: { type: Number, default: 42 },
  fgColor: { type: String, default: 'var(--icon-fg)' },
  bgColor: { type: String, default: 'transparent' },
  isActive: { type: Boolean, default: false }
})

const cssVars = computed(() => ({
  '--size': `${props.size}px`,
  '--fg': props.fgColor,
  '--bg': props.bgColor
}))
</script>

<style scoped>
.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg);
  overflow: hidden;
  color: var(--fg);
  transition: background-color 0.2s, color 0.2s;
}

.icon-wrapper.is-active {
  background-color: var(--fg); /* fond foncé */
  color: #fff; /* points blancs */
}

.icon {
  width: 100%;
  height: 100%;
}
</style>