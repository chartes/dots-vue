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
      <rect
        :x="strokeWidth / 2"
        :y="strokeWidth / 2"
        :width="42 - strokeWidth"
        :height="42 - strokeWidth"
        :rx="radius"
        :ry="radius"
        fill="none"
        stroke="currentColor"
        :stroke-width="strokeWidth"
      />
      <text
        x="50%"
        y="50%"
        text-anchor="middle"
        dominant-baseline="central"
        font-family="Cinzel, serif"
        font-size="30"
        font-weight="600"
        fill="currentColor"
      >
        T
      </text>
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
  --size: 42px;
  --radius: 4px;
  --fg: #ffffff;

  width: var(--size, 42px);
  height: var(--size, 42px);
  border-radius: var(--radius, 4px);
  color: #C3C3C3;
  background-color: var(--bg);

  /*display: inline-flex;*/
  align-items: center;
  justify-content: center;
}

.icon {
  width: 100%;
  height: 100%;
}
.text-and-images-mode .controls button.text-btn .icon-wrapper, .text-mode .controls button.text-btn .icon-wrapper {
  color: var(--fg, var(--text-color));
  background-color: var(--bg);
}

</style>
