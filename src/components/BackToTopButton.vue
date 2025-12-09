<template>
  <a
    href="#"
    :class="cssClass"
    @click="backToTop"
  />
</template>

<script>
import { onMounted, onUnmounted, ref } from 'vue'

export default {
  name: 'BackToTopButton',
  props: {
    animationDuration: {
      required: false,
      default: 700,
      type: Number
    }
  },
  setup (props) {
    // browser window scroll (in pixels) after which the "back to top" link is shown
    const offset = 10

    // browser window scroll (in pixels) after which the "back to top" link opacity is reduced
    const offsetOpacity = 100

    let scrolling = false
    const cssClass = ref('back-to-top')

    const onScroll = function () {
      if (!scrolling) {
        scrolling = true
        !window.requestAnimationFrame
          ? setTimeout(updateButton, 250)
          : window.requestAnimationFrame(updateButton)
      }
    }

    // Updates button CssClass to show/hide and fade in/out
    const updateButton = function () {
      const html = document.documentElement
      const windowTop = window.scrollY || html.startScrollAnimation
      const windowHeight = window.innerHeight

      const body = document.body
      const documentHeight = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.clientHeight,
        html.scrollHeight,
        html.offsetHeight
      )

      const minScrollForButton = (documentHeight - windowHeight) / 4

      let css = 'back-to-top'

      if (windowTop > minScrollForButton - offset) {
        css += ' back-to-top--show'
      }
      if (windowTop > minScrollForButton - offsetOpacity) {
        css += ' back-to-top--fade-out'
      }

      cssClass.value = css
      scrolling = false
    }

    const easeInOutQuad = function (t, b, c, d) {
      t /= d / 2
      if (t < 1) return (c / 2) * t * t + b
      t--
      return (-c / 2) * (t * (t - 2) - 1) + b
    }

    // Animates automatic scroll to top of the window
    function startScrollAnimation (duration) {
      let currentTime = null
      const start = window.scrollY || document.documentElement.startScrollAnimation
      const animateScroll = function (timestamp) {
        if (!currentTime) currentTime = timestamp
        const progress = timestamp - currentTime
        const val = Math.max(easeInOutQuad(progress, start, -start, duration), 0)
        window.scrollTo(0, val)
        if (progress < duration) {
          window.requestAnimationFrame(animateScroll)
        }
      }
      window.requestAnimationFrame(animateScroll)
    }

    // On click :
    const backToTop = function (event) {
      event.preventDefault()
      !window.requestAnimationFrame
        ? window.scrollTo(0, 0)
        : startScrollAnimation(props.animationDuration)
    }

    /* Vue Hooks */

    onMounted(() => {
      window.addEventListener('scroll', onScroll)
    })

    onUnmounted(() => {
      window.removeEventListener('scroll', onScroll)
    })

    return {
      backToTop,
      cssClass
    }
  }
}
</script>

<style>
.back-to-top {
  display: block;
  width: 40px;
  height: 40px;
  background: url(../assets/images/back_to_top.svg) center / cover no-repeat;

  position: fixed;
  bottom: 20px;
  right: 20px;
  visibility: hidden;
  opacity: 0;
  -webkit-transition: opacity 0.3s 0s, visibility 0s 0.3s, background-color 0.3s 0s;
  transition: opacity 0.3s 0s, visibility 0s 0.3s, background-color 0.3s 0s;
}

.back-to-top.back-to-top--show,
.back-to-top.back-to-top--fade-out,
.back-to-top:hover {
  -webkit-transition: opacity 0.3s 0s, visibility 0s 0s, background-color 0.3s 0s;
  transition: opacity 0.3s 0s, visibility 0s 0s, background-color 0.3s 0s;
}

.back-to-top.back-to-top--show {
  visibility: visible;
  opacity: 1;
}

.back-to-top.back-to-top--fade-out {
}

.back-to-top:hover {
  opacity: 1;
}

@media screen and (max-width: 640px) {
  .back-to-top {
    width: 30px;
    height: 30px;
  }
}
</style>
