<template>
  <div
    class="icon-wrapper"
    :style="cssVars"
    aria-hidden="true"
  >
    <svg
      class="icon"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      focusable="false"
    >
      <path
        d="M15.1997 10.4919L13.2297 8.52188L10.0197 5.31188
           C9.33969 4.64188 8.17969 5.12188 8.17969 6.08188
           V12.3119V17.9219
           C8.17969 18.8819 9.33969 19.3619 10.0197 18.6819
           L15.1997 13.5019
           C16.0297 12.6819 16.0297 11.3219 15.1997 10.4919Z"
        fill="currentColor"
      />
    </svg>
  </div>
</template>

<script setup>
const props = defineProps({
  bgColor: { type: String, default: 'var(--icon-bg)' },
  fgColor: { type: String, default: 'var(--icon-fg)' },
  size: { type: Number, default: 30 },
  radius: { type: Number, default: 3 },

  direction: {
    type: String,
    default: 'right',
    validator: v => ['right', 'down'].includes(v)
  }
})

const rotationMap = {
  right: '0deg',
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
  background-color: var(--bg);
  color: var(--fg);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.icon {
  width: 60%;
  height: 60%;
  transform: rotate(var(--rotate));
  transition: transform 0.2s ease;
}
</style>
