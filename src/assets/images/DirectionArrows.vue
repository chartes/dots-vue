<template>
  <div
    class="icon-wrapper"
    :style="cssVars"
  >
    <svg
      class="icon"
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g transform="translate(8.5,10.5)">
        <path fill="none" stroke="currentColor" stroke-width="2.1029158" stroke-linecap="square" stroke-miterlimit="10" transform="matrix(-1 0 0 1 20.6669 8.77905)" d="M19.615385 0.5L0.38461539 0.5" fill-rule="evenodd"/>
        <path fill="none" stroke="currentColor" stroke-width="2.1029158" stroke-linecap="round" stroke-miterlimit="10" transform="matrix(-1 0 0 1 21.6669 0.779053)" d="M0.375 8.625L8.625 0.375" fill-rule="evenodd"/>
        <path fill="none" stroke="currentColor" stroke-width="2.1029158" stroke-linecap="round" stroke-miterlimit="10" transform="matrix(-1 0 0 -1 21.6669 17.7791)" d="M0.375 8.625L8.625 0.375" fill-rule="evenodd"/>
      </g>
    </svg>
  </div>
</template>

<script setup>
const props = defineProps({
  bgColor: { type: String, default: 'var(--icon-bg)' },
  fgColor: { type: String, default: 'var(--icon-fg)' },
  size: { type: Number, default: 40 },
  radius: { type: Number, default: 6 },
  direction: {
    type: String,
    default: 'right',
    validator: v => ['left', 'right', 'up', 'down'].includes(v)
  }
})

const rotationMap = {
  left: '180deg',
  right: '0deg',
  up: '-90deg',
  down: '90deg'
}

const cssVars = {
  '--bg': props.bgColor,
  '--fg': props.fgColor,
  '--size': `${props.size}px`,
  '--radius': `${props.radius}px`,
  '--rotate': rotationMap[props.direction]
}
</script>

<style scoped>
.icon-wrapper {
  --size: 40px;
  --radius: 4px;
  --fg: #ffffff;

  width: var(--size, 40px);
  height: var(--size, 40px);
  border-radius: var(--radius, 4px);
  background-color: var(--bg);
  color: var(--fill-color, var(--icon-text-color));
  border: var(--fill-color) solid 2px;

  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.disabled .icon-wrapper {
  color: #e5e5e5;
  border-color: #e5e5e5;
}

.icon-wrapper:hover {
  color: #FFF;
  background-color: var(--fill-color);
}

/* Prevents Hover state, replaced by active state */
@media (hover: none) {
  .icon-wrapper:hover {
    color: inherit;
    background-color: inherit;
  }
  .icon-wrapper:active {
    color: #FFF;
    background-color: var(--fill-color);
  }
}

.icon {
  width: 100%;
  height: 100%;
  transition: transform 0.2s ease;
  transform: rotate(var(--rotate, 0deg));
}

</style>
