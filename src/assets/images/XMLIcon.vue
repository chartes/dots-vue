<template>
  <div
    class="icon-wrapper"
    :style="cssVars"
  >
    <svg
      class="icon"
      viewBox="0 0 42 42"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <!-- Rectangle bordure -->
      <rect
        x="0.5"
        y="0.5"
        width="41"
        height="41"
        rx="4"
        ry="4"
        fill="none"
        stroke="currentColor"
        stroke-width="1"
      />

      <!-- Group des chemins -->
      <g fill="currentColor" stroke="currentColor" stroke-width="0">
        <!-- Premier chemin -->
        <path d="M3.3,27.9c0-0.1,0-0.1,0-0.2L7,21.4c0,0,0-0.1,0-0.1L3.4,15l0-0.1c0-0.1,0.1-0.2,0.2-0.2h2.4
          c0.1,0,0.2,0.1,0.3,0.2l2.5,4.4c0,0.1,0.1,0.1,0.1,0l2.5-4.4c0.1-0.1,0.2-0.2,0.3-0.2H14c0.1,0,0.2,0,0.2,0.1s0,0.1,0,0.2l-3.7,6.3
          c0,0,0,0.1,0,0.1l3.7,6.3l0,0.1c0,0.1-0.1,0.2-0.2,0.2h-2.4c-0.1,0-0.2-0.1-0.3-0.2l-2.5-4.3c0-0.1-0.1-0.1-0.1,0l-2.5,4.3
          C6.1,27.9,6,28,5.9,28H3.5C3.4,28,3.4,28,3.3,27.9z"/>
        <!-- Deuxième chemin -->
        <path d="M24.7,14.7h2.2c0.1,0,0.1,0,0.2,0.1c0,0,0.1,0.1,0.1,0.2v12.8c0,0.1,0,0.1-0.1,0.2c0,0-0.1,0.1-0.2,0.1h-2.2
          c-0.1,0-0.1,0-0.2-0.1c0,0-0.1-0.1-0.1-0.2v-8.4c0,0,0-0.1,0-0.1s-0.1,0-0.1,0.1l-2,3.2c-0.1,0.1-0.2,0.2-0.3,0.2H21
          c-0.1,0-0.2,0-0.3-0.2l-2-3.2c0,0-0.1-0.1-0.1,0c0,0,0,0,0,0.1v8.4c0,0.1,0,0.1-0.1,0.2c0,0-0.1,0.1-0.2,0.1h-2.2
          c-0.1,0-0.1,0-0.2-0.1c0,0-0.1-0.1-0.1-0.2V14.9c0-0.1,0-0.1,0.1-0.2c0,0,0.1-0.1,0.2-0.1h2.2c0.1,0,0.2,0.1,0.3,0.2l2.9,4.4
          c0,0.1,0.1,0.1,0.1,0l2.9-4.4C24.5,14.8,24.6,14.7,24.7,14.7z"/>
        <!-- Troisième chemin -->
        <path d="M29.5,27.9c0,0-0.1-0.1-0.1-0.2V14.9c0-0.1,0-0.1,0.1-0.2s0.1-0.1,0.2-0.1h2.2c0.1,0,0.1,0,0.2,0.1
          c0,0,0.1,0.1,0.1,0.2v10.7c0,0.1,0,0.1,0.1,0.1h6.2c0.1,0,0.1,0,0.2,0.1c0,0,0.1,0.1,0.1,0.2v1.8c0,0.1,0,0.1-0.1,0.2
          c0,0-0.1,0.1-0.2,0.1h-8.8C29.6,28,29.6,28,29.5,27.9z"/>
      </g>
    </svg>
  </div>
</template>

<script setup>
const props = defineProps({
  bgColor: { type: String, default: 'transparent' },
  fgColor: { type: String, default: 'var(--icon-fg)' },
  size: { type: Number, default: 42 },
  radius: { type: Number, default: 4 },
  strokeWidth: { type: Number, default: 1 }
})

const cssVars = {
  '--bg': props.bgColor,
  '--fg': props.fgColor,
  '--size': `${props.size}px`,
  '--radius': `${props.radius}px`
}
</script>

<style scoped>
.icon-wrapper {
  width: var(--size, 42px);
  height: var(--size, 42px);
  border-radius: var(--radius, 4px);
  color: var(--fg);
  background-color: var(--bg);

  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  width: 100%;
  height: 100%;
}
</style>