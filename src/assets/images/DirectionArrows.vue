<template>
  <div
    class="icon-wrapper"
    :style="cssVars"
  >
    <svg
      class="icon"
      viewBox="0 0 47 47"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <polygon
        fill="currentColor"
        points="24.2474286 15 22.4345714 16.8128571 28.3231429 22.7142857 13 22.7142857 13 25.2857143 28.3231429 25.2857143 22.4217143 31.1871429 24.2474286 33 33.2474286 24"
        transform="translate(23.123714 24) translate(-23.123714 -24)"
      />
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
  color: var(--fg, var(--icon-text-color));
  background-color: var(--fill-color);
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.disabled .icon-wrapper {
  background-color: #C3C3C3;
}

.icon {
  width: 100%;
  height: 100%;
  transition: transform 0.2s ease;
  transform: rotate(var(--rotate, 0deg));
}

</style>
