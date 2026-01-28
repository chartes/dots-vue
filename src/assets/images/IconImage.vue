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

      <g transform="translate(10 11)" fill="currentColor">
        <path d="M11,6 C13.4848743,6 15.5,8.01555508 15.5,10.5009589 C15.5,12.9863627 13.4848743,15 11,15 C8.51512569,15 6.5,12.9863627 6.5,10.5009589 C6.5,8.01555508 8.51512569,6 11,6" />
        <path d="M11,15.8333333 C7.96386199,15.8333333 5.49924997,13.4684091 5.49924997,10.5550758 C5.49924997,7.64318182 7.96386199,5.27825758 11,5.27825758 C14.036138,5.27825758 16.50075,7.64318182 16.50075,10.5550758 C16.50075,13.4684091 14.036138,15.8333333 11,15.8333333 Z M7.69984999,0 L5.68675849,2.11159091 L2.19909996,2.11159091 C0.990045002,2.11159091 0,3.06159091 0,4.22318182 L0,16.8884091 C0,18.05 0.990045002,19 2.19909996,19 L19.8009,19 C21.009955,19 22,18.05 22,16.8884091 L22,4.22318182 C22,3.06159091 21.009955,2.11159091 19.8009,2.11159091 L16.3132415,2.11159091 L14.30015,0 L7.69984999,0 Z" />
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
  --size: 42px;
  --radius: 4px;
  --bg: #ffffff;

  width: var(--size, 42px);
  height: var(--size, 42px);
  /* border-radius: var(--radius, 4px); */
  color: #C3C3C3;
  background-color: var(--bg);

  align-items: center;
  justify-content: center;
}

.icon {
  width: 100%;
  height: 100%;
}

.text-and-images-mode .controls a.images-btn .icon-wrapper, .images-mode .controls a.images-btn .icon-wrapper {
  color: var(--fg, var(--text-color));
  background-color: var(--bg);
}
</style>
