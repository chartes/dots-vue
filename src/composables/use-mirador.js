import { onUnmounted } from 'vue'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import Mirador from 'mirador'
import MiradorApp from 'mirador/dist/es/src/components/App'
import createPluggableStore from 'mirador/dist/es/src/state/createPluggableStore'

export default function useMirador(container, manifest) {
  const _windowId = 'document'

  const baseConfig = {
    windows: [],
    window: {
      allowClose: false,
      allowMaximize: false,
      defaultSideBarPanel: 'info',
      sideBarOpenByDefault: false,
      hideWindowTitle: true,
      maximizedByDefault: true
    },
    selectedTheme: 'light',
    themes: {
      light: {
        palette: {
          type: 'light',
          primary: { main: '#971716' },
          secondary: { main: '#B9192F' }
        }
      }
    },
    workspace: {
      showZoomControls: true,
      type: 'mosaic'
    },
    workspaceControlPanel: {
      enabled: false
    }
  }

  const instance = {
    initialize,
    loadManifest,
    setCanvasId,
    resetView,
    dispatchAction,
    reactRoot: null,
    miradorStore: null
  }

  function initialize() {
    console.log('mirador initialize', performance.now())

    if (!container.value) {
      console.warn('mirador initialize: no container')
      return
    }

    if (instance.reactRoot) {
      instance.reactRoot.unmount()
      instance.reactRoot = null
      instance.miradorStore = null
    }

    const config = { ...baseConfig, id: container.value.id }
    instance.miradorStore = createPluggableStore(config)
    instance.reactRoot = ReactDOM.createRoot(container.value)
    instance.reactRoot.render(
      React.createElement(
        Provider,
        { store: instance.miradorStore },
        React.createElement(MiradorApp, { plugins: [] })
      )
    )
    const fillColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--fill-color')
      .trim()

    if (fillColor) {
      updateThemeColor(fillColor)
    }

    // Résoudre la promise après que React ait rendu une première fois
    return new Promise(resolve => setTimeout(resolve, 0))
  }

  function updateThemeColor(color) {
    dispatchAction(Mirador.actions.updateConfig({
      themes: {
        light: {
          palette: {
            type: 'light',
            primary: {
              main: color
            },
            secondary: {
              main: color
            }
          }
        }
      }
    }))
  }

  function resetView() {
    const homeButton = container.value?.querySelector('button[aria-label="Reset zoom"]')
    if (homeButton) {
      homeButton.click()
    } else {
      console.warn('resetView: Reset zoom button not found')
    }
  }

  function loadManifest(manifestObject, canvasId) {
    console.log('mirador loadManifest', manifestObject?.id, canvasId)

    if (!instance.miradorStore) {
      console.warn('mirador loadManifest: store not initialized')
      return
    }

    const state = instance.miradorStore.getState()
    console.log('state before', JSON.stringify({
      windows: Object.keys(state.windows || {}),
      manifests: Object.keys(state.manifests || {}),
    }))

    if (state.windows[_windowId]) {
      dispatchAction(Mirador.actions.removeWindow(_windowId))
    }

    dispatchAction({
      type: 'mirador/RECEIVE_MANIFEST',
      manifestId: manifestObject.id,
      manifestJson: manifestObject,
    })

    dispatchAction(Mirador.actions.addWindow({
      id: _windowId,
      manifestId: manifestObject.id,
      loadedManifest: manifestObject.id,
      canvasId: canvasId,
    }))

    // const stateAfter = instance.miradorStore.getState()
    // console.log('state after manifests detail', JSON.stringify(
    //   stateAfter.manifests?.[manifestObject.id]
    // ))
    // console.log('state after windows detail', JSON.stringify(
    //   stateAfter.windows?.[_windowId]
    // ))
    setTimeout(() => resetView(), 100)
  }

  function dispatchAction(action) {
    if (instance.miradorStore) {
      instance.miradorStore.dispatch(action)
    }
  }

  function setCanvasId(canvasId) {
    console.log('setCanvasId', canvasId)
    dispatchAction(Mirador.actions.setCanvas(_windowId, canvasId))
    setTimeout(() => resetView(), 100)
  }

  onUnmounted(() => {
    if (instance.reactRoot) {
      console.log('mirador unmount in onUnmounted')
      instance.reactRoot.unmount()
      instance.reactRoot = null
    }
    instance.miradorStore = null
  })

  return instance
}