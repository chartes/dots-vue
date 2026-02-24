<template>
  <div class="icon-wrapper" :style="cssVars">
    <svg
      class="icon"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M10 .25A9.75003 9.75003 0 0 0 .99218 6.26884a9.7499 9.7499 0 0 0-.55483 5.63326 9.75033 9.75033 0 0 0 2.66836 4.9922 9.74978 9.74978 0 0 0 10.62549 2.1135 9.7495 9.7495 0 0 0 4.3756-3.591A9.74952 9.74952 0 0 0 19.75 10c-.0027-2.58502-1.0308-5.06339-2.8587-6.89128C15.0634 1.28084 12.585.25273 10 .25Zm0 18a8.2502 8.2502 0 0 1-4.58345-1.3904A8.24982 8.24982 0 0 1 2.378 13.1571 8.24994 8.24994 0 0 1 8.39051 1.90852a8.2498 8.2498 0 0 1 4.76659.46947 8.2499 8.2499 0 0 1 3.7025 3.03856A8.25016 8.25016 0 0 1 18.25 10c-.0025 2.1873-.8725 4.2843-2.4191 5.8309C14.2843 17.3775 12.1873 18.2475 10 18.25Zm2.7806-8.78063a.74834.74834 0 0 1 .1628.24343.74891.74891 0 0 1 .0572.2872c0 .0986-.0194.1962-.0572.2872a.74705.74705 0 0 1-.1628.2434l-3.74997 3.75a.75005.75005 0 0 1-.53063.2198.75005.75005 0 0 1-.53062-.2198.75087.75087 0 0 1-.16267-.2434.75097.75097 0 0 1-.05712-.2872c0-.0985.01941-.1961.05712-.2872a.75087.75087 0 0 1 .16267-.2434L11.1897 10 7.96938 6.78063a.75045.75045 0 0 1 0-1.06126.75041.75041 0 0 1 1.06125 0l3.74997 3.75Z"
      />
    </svg>
  </div>
</template>

<script setup>
const props = defineProps({
  size: { type: Number, default: 40 },
  fgColor: { type: String, default: '#ffffff' },
  bgColor: { type: String, default: 'transparent' },
  radius: { type: Number, default: 999 },
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
  '--size': `${props.size}px`,
  '--fg': props.fgColor,
  '--bg': props.bgColor,
  '--radius': `${props.radius}px`,
  '--rotate': rotationMap[props.direction]
}
</script>

<style scoped>
.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;

  width: var(--size);
  height: var(--size);

  background-color: var(--bg);
  border-radius: var(--radius);

  color: var(--fg);
}

.icon {
  width: 100%;
  height: 100%;
  transform: rotate(var(--rotate, 0deg));
}
</style>