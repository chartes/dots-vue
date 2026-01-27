import { ref, computed } from 'vue'

export default function useLayout () {
  const imageIsAvailable = ref(false)
  const isTOCOpened = ref(false)
  const isTOCMenuOpened = ref(false)
  const viewMode = ref('text-mode')

  const rawSearchedTerm = ref('')

  const tocCssClass = computed(() => {
    return isTOCOpened.value ? 'is-opened' : ''
  })

  const tocMenuCssClass = computed(() => {
    return isTOCMenuOpened.value ? 'toc-aside-is-opened' : ''
  })

  const toggleTOCContent = function (event) {
    event.preventDefault()
    isTOCOpened.value = !isTOCOpened.value
  }

  const toggleTOCMenu = function (event) {
    event.preventDefault()
    isTOCMenuOpened.value = !isTOCMenuOpened.value
  }

  const TOCMenuBtnCssClass = computed(() => {
    return isTOCMenuOpened.value ? 'is-opened' : ''
  })

  const viewModeCssClass = computed(() => {
    if (!imageIsAvailable.value) {
      return 'text-mode text-mode-only'
    } else {
      return viewMode.value
    }
  })

  const changeViewMode = function (v) {
    //viewMode.value = v
    console.log('changeViewMode before : ', viewMode.value, v)
    if (v === 'init') {
      viewMode.value = 'text-mode'
    } else if (viewMode.value === 'init' && v === 'text-mode') {
      viewMode.value = 'text-mode'
    } else if (viewMode.value === 'text-mode' && v === 'text-mode') {
      viewMode.value = 'images-mode'
    } else if (viewMode.value === 'text-mode' && v === 'images-mode') {
      viewMode.value = 'text-and-images-mode'
    } else if (viewMode.value === 'images-mode' && v === 'images-mode') {
      viewMode.value = 'text-mode'
    } else if (viewMode.value === 'images-mode' && v === 'text-mode') {
      viewMode.value = 'text-and-images-mode'
    } else if (viewMode.value === 'text-and-images-mode' && v === 'text-mode') {
      viewMode.value = 'images-mode'
    } else if (viewMode.value === 'text-and-images-mode' && v === 'images-mode') {
      viewMode.value = 'text-mode'
    }
    console.log('changeViewMode after : ', viewMode.value)
  }

  const getViewMode = function () {
    return viewMode.value
  }

  return {
    rawSearchedTerm,
    isTOCMenuOpened,
    imageIsAvailable,
    tocCssClass,
    tocMenuCssClass,
    toggleTOCContent,
    toggleTOCMenu,
    TOCMenuBtnCssClass,
    viewModeCssClass,
    changeViewMode,
    getViewMode
  }
}
