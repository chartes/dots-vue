import { onUnmounted } from 'vue'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import Mirador from 'mirador'
import MiradorApp from 'mirador/dist/es/src/components/App'
import createPluggableStore from 'mirador/dist/es/src/state/createPluggableStore'
import { miradorImageToolsPlugin } from 'mirador-image-tools'

export default function useMirador(container) {
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
    loadCollectionManifest,
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
        React.createElement(MiradorApp, { plugins: [...miradorImageToolsPlugin] })
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
    const homeButton = container.value?.querySelector(
      'button[aria-label="Reset zoom"]'
    )
    console.log('use-mirador resetView button', container.value, homeButton)
    if (homeButton) {
      homeButton.click()
    } else {
      console.warn('use-mirador resetView: Reset zoom button not found')
    }
  }

  function loadCollectionManifest(collectionObject) {
    console.log(
      'use-mirador loadCollectionManifest',
      collectionObject?.id
    )

    if (!instance.miradorStore) {
      console.warn(
        'use-mirador loadCollectionManifest: store not initialized'
      )
      return
    }

    if (!collectionObject?.id) {
      console.warn(
        'use-mirador invalid collection id',
        collectionObject
      )
      return
    }

    const stateBefore = instance.miradorStore.getState()

    console.log(
      'mirador state before windows',
      stateBefore.windows
    )
    console.log(
      'mirador state before manifests',
      stateBefore.manifests
    )

    if (stateBefore.windows[_windowId]) {
      dispatchAction(Mirador.actions.removeWindow(_windowId))
    }
    // TODO needs IIIF Collection corrections to work (works with https://endp-87e252.gitpages.huma-num.fr/collection/endp_collection.json)
    dispatchAction(
      Mirador.actions.addWindow({
        imageToolsEnabled: true,
        imageToolsOpen: false,
        id: _windowId,
        manifestId: collectionObject.id,
        collectionPath: collectionObject.id
      })
    )

    const stateAfter = instance.miradorStore.getState()

    console.log(
      'use-mirador state after manifests detail',
      JSON.stringify(stateAfter.manifests?.[collectionObject.id])
    )

    console.log(
      'use-mirador state after windows detail',
      JSON.stringify(stateAfter.windows?.[_windowId])
    )
    resetView()
  }

  function loadManifest(manifestObject, canvasId) {
    console.log('use-mirador loadManifest', manifestObject?.id, canvasId)

    if (!instance.miradorStore) {
      console.warn('use-mirador loadManifest: store not initialized')
      return
    }

    if (!manifestObject?.id) {
      console.warn('use-mirador invalid manifest id', manifestObject)
      return
    }

    const stateBefore = instance.miradorStore.getState()

    console.log(
      'mirador state before windows',
      stateBefore.windows
    )
    console.log(
      'mirador state before manifests',
      stateBefore.manifests
    )

    if (stateBefore.windows[_windowId]) {
      dispatchAction(Mirador.actions.removeWindow(_windowId))
    }

    dispatchAction(
      Mirador.actions.addWindow({
        imageToolsEnabled: true,
        imageToolsOpen: false,
        id: _windowId,
        manifestId: manifestObject.id,
        canvasId: canvasId
      })
    )

    const stateAfter = instance.miradorStore.getState()

    console.log(
      'use-mirador state after manifests detail',
      JSON.stringify(stateAfter.manifests?.[manifestObject.id])
    )

    console.log(
      'use-mirador state after windows detail',
      JSON.stringify(stateAfter.windows?.[_windowId])
    )
    resetView()
  }

  function dispatchAction(action) {
    if (instance.miradorStore) {
      instance.miradorStore.dispatch(action)
      console.log('use-mirador mirador dispatchAction action', action)
    }
  }

  function setCanvasId(canvasId) {
    console.log('use-mirador setCanvasId', canvasId)
    dispatchAction(Mirador.actions.setCanvas(_windowId, canvasId))
    resetView()
  }

  onUnmounted(() => {
    if (instance.reactRoot) {
      console.log('use-mirador unmount in onUnmounted')
      instance.reactRoot.unmount()
      instance.reactRoot = null
    }
    instance.miradorStore = null
  })

  return instance
}