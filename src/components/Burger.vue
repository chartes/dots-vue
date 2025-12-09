<template>
  <a
    role="button"
    class="navbar-burger"
    :class="menuCssClass"
    aria-label="menu"
    aria-expanded="false"
    @click="toggleBurger"
  >
    <span aria-hidden="true"></span>
    <span aria-hidden="true"></span>
    <span aria-hidden="true"></span>
  </a>
</template>

<script>
import { computed, ref, watch } from 'vue'

export default {
  name: 'BurgerButton',
  props: {
    opened: {
      required: false,
      default: false,
      type: Boolean
    }
  },
  emits: [
    'change'
  ],
  setup (props, context) {
    const isMenuOpened = ref(false)

    const toggleBurger = function ($event) {
      $event.preventDefault()
      $event.stopPropagation()
      isMenuOpened.value = !isMenuOpened.value
      context.emit('change', { isOpened: isMenuOpened.value })
    }

    const menuCssClass = computed(() => {
      return isMenuOpened.value ? 'is-active' : ''
    })

    watch(props, (newProps) => {
      isMenuOpened.value = newProps.opened
    })

    return {
      toggleBurger,
      menuCssClass,
      isMenuOpened
    }
  }

}
</script>

<style>
  a.navbar-burger {
    border: none;
  }
  .navbar-burger span {
    width: 33px;
    background-color: #FFFFFF;
    height: 3px;
  }
  .navbar-burger span:nth-child(1) {
    top: calc(50% - 12px);
  }
  .navbar-burger span:nth-child(3) {
    top: calc(50% + 10px);
  }

  .navbar-burger span {
    transition: background 0s 0.3s;
  }

  .navbar-burger span:nth-child(1),
  .navbar-burger span:nth-child(3) {
    transition-duration: 0.3s, 0.3s;
    transition-delay: 0.3s, 0s;
  }

  .navbar-burger span:nth-child(1) {
    transition-property: top, transform;
  }

  .navbar-burger span:nth-child(3) {
    transition-property: top, transform;
  }

  .navbar-burger.is-active span:nth-child(1) {
    top: 50%;
    transform: rotate(45deg);
  }

  .navbar-burger.is-active span:nth-child(2) {
    background: none;
  }

  .navbar-burger.is-active span:nth-child(3) {
    top: 50%;
    transform: rotate(-45deg);
  }

  .navbar-burger.is-active span:nth-child(1),
  .navbar-burger.is-active span:nth-child(3) {
    transition-delay: 0s, 0.3s;
  }

</style>
