<template>
  <ul class="tree" id="toc-tree">
    <template
      v-for="(item, index) in componentTOC"
      :key="index"
    >
      <li
        v-if="item.show"
        :style="`margin-left: ${ (item.level -1) * 15 }px;`"
        :class="{ 'is-current-parent': isCurrentItem(item), 'more': item.level < maxcitedepth && item.children && item.children.length > 0 }"
      >
        <div class="li container">
          <button
            v-if="item.level < maxcitedepth && item.children && item.children.length > 0"
            class="toc-toggle"
            :aria-expanded="item.expanded ? true : false"
            aria-label="Afficher les éléments enfants"
            @click="toggleExpanded(item.identifier)"
          >
            <TocArrows
              :key="item.expanded"
              :direction="item.expanded ? 'down' : 'right'"
              :size="30"
              :radius="3"
            />
          </button>
          <a
            class="toc-title"
            :title="item.url"
            :data-href="item.url"
            :class="{ 'is-current': isCurrentItem(item) }"
            @click.prevent="goTo(item)"
          >
            {{ item.dublinCore && item.dublinCore.title.length ? item.dublinCore.title : item.extensions ? item.extensions['tei:role'] ? item.extensions['tei:role'] : item.citeType && item.extensions['tei:num'] ? item.citeType + ' ' + item.extensions['tei:num'] : item.citeType : item.citeType }} {{ item.descendant > 0 ? `(${item.descendant})` : '' }}

          </a><!-- : 'pas de titre' : `Fragment n° ${index + 1}` :title="item.dublinCore && item.dublinCore.title.length ? item.dublinCore.title : item.extensions ? item.extensions['tei:role'] ? item.extensions['tei:role'] : item.citeType && item.extensions['tei:num'] ? item.citeType + ' ' + item.extensions['tei:num'] : item.citeType : item.citeType"-->
        </div>
      </li>
    </template>
  </ul>
  <nav id="toc-tree-navigation" class="is-hidden">
    <button
        id="toc-tree-navigation-previous"
        class="previous-btn"
        @click="scrollToPreviousColumn(event)"
    >
      Prev
    </button>
    <button
        id="toc-tree-navigation-next"
        class="next-btn"
        @click="scrollToNextColumn(event)"
    >Next
    </button>
  </nav>
</template>

<script>

import {computed, onMounted, onUnmounted, ref, watch} from 'vue'
import { useRoute } from 'vue-router'
import { router } from '@/router'
import store from '@/store'
import TocArrows from '@/assets/images/TocArrows.vue'

export default {
  name: 'TOC',

  components: {
    TocArrows
  },

  props: {
    isDocProjectIdIncluded: {
      type: Boolean,
      required: true
    },
    margin: { required: true, default: 0, type: Number },
    toc: { required: true, default: () => [], type: Array },
    maxcitedepth: { required: false, default: 0, type: Number },
    refid: { required: false, default: '' }
  },
  emits: ['updateRefId'],
  setup (props) {
    const isDocProjectIdInc = ref(props.isDocProjectIdIncluded)
    const currentRefId = ref(props.refid)
    const route = useRoute()
    const expandedById = ref({})
    const maxCiteDepth = ref(props.maxcitedepth)
    console.log('TOC setup maxCiteDepth.value ', maxCiteDepth.value)
    const componentTOC = ref(props.toc.filter(i => i.level <= maxCiteDepth.value))
    console.log('TOC setup componentTOC.value & length', componentTOC.value, componentTOC.value.length)
    // console.log('TOC setup props.toc :', props.toc)
    // console.log("TOC props.maxcitedepth :", props.maxcitedepth)
    // console.log("TOC props.refid :", props.refid)

    componentTOC.value.filter(i => i.parent === route.params.id).forEach((item) => {
      if (item.parent === route.params.id) {
        item.show = true
        item.expanded = false
      }
    })
    componentTOC.value.filter(i => i.ancestor_editorialLevel === route.params.id).forEach((item) => {
      if (item.ancestor_editorialLevel === route.params.id) {
        item.expanded = false
      }
    })
    if (store.state.arianeDocument && store.state.arianeDocument.length > 0) {
      console.log('TOC setup store.state.arianeDocument', store.state.arianeDocument)
      store.state.arianeDocument.forEach(item => {
        componentTOC.value.filter(i => i.identifier === item).forEach((n) => {
          n.show = true
          n.expanded = true
        })
        componentTOC.value.filter(i => i.parent === item).forEach((n) => {
          n.show = true
        })
        expandedById.value[item] = expandedById.value[item] ? !expandedById.value[item] : true

        if (item.children && item.children.length > 0 && item.level < maxCiteDepth.value) {
          for (let i = 0; i < item.children.length; i += 1) {
            item.children[i].show = true
            expandedById.value[item.children[i]] = !expandedById.value[item.children[i]]
          }
        }
      })
    }
    console.log('TOC componentTOC.value', store.state.arianeDocument, componentTOC.value)
    console.log('TOC setup expandedById.value :', expandedById.value)

    // remove when proved unneeded
    const toggleBurger = function ($event, ref) {
      $event.preventDefault()
      // $event.stopPropagation();
      currentRefId.value = ref
      // console.log("TOC ref : ", $event, currentRefId.value)
      router.push({ path: route.path, query: { refId: ref } })
    }

    const toggleExpanded = (id) => {
      console.log('TOC toggleExpanded id, expandedById.value, expandedById.value[id] : ', id, expandedById.value, expandedById.value[id])
      function hideDescendants (ident) {
        const node = componentTOC.value.find(item => item.identifier === ident)
        node.show = false
        if (Object.keys(node).includes('expanded')) {
          node.expanded = false
        } else {
          node['expanded'] = false
        }
        console.log('TOC toggleExpanded id hideDescendants node ident ', node, ident)
        if (node.children && node.children.length > 0 && node.level < maxCiteDepth.value) {
          for (let i = 0; i < node.children.length; i += 1) {
            if (expandedById.value[node.identifier]) {
              hideDescendants(node.children[i].identifier)
            }
          }
        }
        if (Object.keys(expandedById.value).includes(node.identifier)) {
          expandedById.value[node.identifier] = node.expanded
        }
      }
      expandedById.value[id] = !expandedById.value[id]
      console.log('TOC toggleExpanded id updated : ', id, expandedById.value)
      componentTOC.value.find(n => n.identifier === id).expanded = expandedById.value[id]
      componentTOC.value.filter(n => n.parent === id).forEach((item) => {
        if (expandedById.value[id]) {
          item.show = true
        } else {
          item.show = false
          item.expanded = false
          hideDescendants(item.identifier)
        }
      })
      console.log('TOC after expandedById[id] : ', id, expandedById.value)
    }

    const goTo = function (item) {
      // currentRefId.value = ref
      // console.log("TOC ref : ", $event, currentRefId.value)
      function hideDescendants (ident) {
        const node = componentTOC.value.find(item => item.identifier === ident)
        node.show = false
        if (Object.keys(node).includes('expanded')) {
          node.expanded = false
        } else {
          node['expanded'] = false
        }
        console.log('TOC goTo id hideDescendants node ident ', node, ident)
        if (node.children && node.children.length > 0 && node.level < maxCiteDepth.value) {
          for (let i = 0; i < node.children.length; i += 1) {
            if (expandedById.value[node.identifier]) {
              hideDescendants(node.children[i].identifier)
            }
          }
        }
      }
      if (item.ancestor_editorialLevel) {
        console.log('TOC goTo / item / item.ancestor_editorialLevel ', item, expandedById.value)
        componentTOC.value.filter(node => node.ancestor_editorialLevel && (node.ancestor_editorialLevel !== item.ancestor_editorialLevel)).forEach((n) => {
          if (expandedById.value[n.identifier]) {
            expandedById.value[n.identifier] = false
          }
          componentTOC.value.find(node => node.identifier === n.identifier).expanded = false
          componentTOC.value.find(node => node.identifier === n.identifier).show = false
          if (n.children && n.children.length > 0 && n.level < maxCiteDepth.value) {
            for (let i = 0; i < n.children.length; i += 1) {
              if (expandedById.value[n.identifier]) {
                hideDescendants(n.children[i].identifier)
              }
            }
          }
        })
        componentTOC.value.filter(node => !node.ancestor_editorialLevel && (node.identifier !== item.ancestor_editorialLevel)).forEach((n) => {
          if (expandedById.value[n.identifier]) {
            expandedById.value[n.identifier] = false
          }
          componentTOC.value.find(node => node.identifier === n.identifier).expanded = false
          if (n.children && n.children.length > 0 && n.level < maxCiteDepth.value) {
            for (let i = 0; i < n.children.length; i += 1) {
              if (expandedById.value[n.identifier]) {
                hideDescendants(n.children[i].identifier)
              }
            }
          }
        })
      } else {
        componentTOC.value.filter(node => node.ancestor_editorialLevel !== item.identifier).forEach((n) => {
          if (expandedById.value[n.identifier]) {
            expandedById.value[n.identifier] = false
            componentTOC.value.find(node => node.identifier === n.identifier).expanded = false
            if (n.children && n.children.length > 0 && n.level < maxCiteDepth.value) {
              for (let i = 0; i < n.children.length; i += 1) {
                if (expandedById.value[n.identifier]) {
                  hideDescendants(n.children[i].identifier)
                }
              }
            }
          }
        })
      }

      if (isDocProjectIdInc.value) {
        if (item.router_hash) {
          if (item.router_refid) {
            router.push({ name: 'Document', params: { collId: route.params.collId, id: item.router_params }, query: { refId: item.router_refid }, hash: item.router_hash })
          } else {
            router.push({ name: 'Document', params: { collId: route.params.collId, id: item.router_params }, hash: item.router_hash })
          }
        } else if (item.router_refid) {
          console.log('TOC goto item.router_refid: ', item.router_refid)
          router.push({ name: 'Document', params: { collId: route.params.collId, id: item.router_params }, query: { refId: item.router_refid } })
        } else {
          router.push({ name: 'Document', params: { collId: route.params.collId, id: item.router_params } })
        }
      } else {
        if (item.router_hash) {
          if (item.router_refid) {
            router.push({ name: 'Document', params: { id: item.router_params }, query: { refId: item.router_refid }, hash: item.router_hash })
          } else {
            router.push({ name: 'Document', params: { id: item.router_params }, hash: item.router_hash })
          }
        } else if (item.router_refid) {
          console.log('TOC goto item.router_refid: ', item.router_refid)
          router.push({ name: 'Document', params: { id: item.router_params }, query: { refId: item.router_refid } })
        } else {
          router.push({ name: 'Document', params: { id: item.router_params } })
        }
      }
    }

    const isCurrentItem =(item) => route.hash === item.hash ? 'is-current' : !route.hash && item.identifier === currentRefId.value;

    /**/

    const getColumnsDetails = function() {
      const tocTree = document.getElementById('toc-tree');
      const tocTreeScrollableColumns = Math.floor(tocTree.scrollWidth / tocTree.clientWidth)
      const tocTreeScrollableColumnWidth = tocTree.scrollWidth / tocTreeScrollableColumns
      const currentColumnFloat = tocTree.scrollLeft / tocTreeScrollableColumnWidth
      const currentColumn = Math.round(currentColumnFloat);
      return { columnsCount: tocTreeScrollableColumns, columnWidth: tocTreeScrollableColumnWidth, currentColumnFloat, currentColumn }
    }

    const scrollToPreviousColumn = function(event) {
      const tocDetails = getColumnsDetails();
      if (tocDetails.currentColumnFloat > 0) {
        const tocTree = document.getElementById('toc-tree');
        tocTree.scrollTo({ left: tocDetails.columnWidth * (tocDetails.currentColumn - 1), behavior: 'smooth'})
      }
    }

    const scrollToNextColumn = function(event) {
      const tocDetails = getColumnsDetails();
      if (tocDetails.currentColumnFloat < tocDetails.columnsCount - 1) {
        const tocTree = document.getElementById('toc-tree');
        tocTree.scrollTo({ left: tocDetails.columnWidth * (tocDetails.currentColumn + 1), behavior: 'smooth'})
      }
    }

    const updateColumnNavigation = function(){
      const tocTree = document.getElementById('toc-tree');
      const tocTreeNavigation = document.getElementById('toc-tree-navigation');
      if (tocTree.clientWidth) {
        const tocTreeScrollableColumns = Math.floor(tocTree.scrollWidth / tocTree.clientWidth)
        if (tocTreeScrollableColumns > 1) {
          tocTreeNavigation.classList.remove('is-hidden')
        } else {
          tocTreeNavigation.classList.add('is-hidden')
        }
        const tocTreeScrollableColumnWidth = (tocTree.scrollWidth - 15 * tocTreeScrollableColumns) / tocTreeScrollableColumns
        // console.log('tocTree nbColomns', tocTreeScrollableColumns, tocTree.scrollWidth, tocTree.clientWidth, tocTree.scrollLeft, tocTreeScrollableColumnWidth);
      }
      updateColumnNavigationButtons();
    }

    const updateColumnNavigationButtons = function(){
      const tocTreeNavigationPrevious = document.getElementById('toc-tree-navigation-previous');
      const tocTreeNavigationNext = document.getElementById('toc-tree-navigation-next');
      const tocDetails = getColumnsDetails();
      if (Math.abs(tocDetails.currentColumnFloat) < 0.1) {
        tocTreeNavigationPrevious.classList.add('is-disabled')
      } else {
        tocTreeNavigationPrevious.classList.remove('is-disabled')
      }
      if (Math.abs(tocDetails.currentColumnFloat - (tocDetails.columnsCount - 1)) < 0.1) {
        tocTreeNavigationNext.classList.add('is-disabled')
      } else {
        tocTreeNavigationNext.classList.remove('is-disabled')
      }
    }

    onMounted(() => {
      window.addEventListener('resize', updateColumnNavigation)
      const tocTree = document.getElementById('toc-tree');
      if (tocTree) {
        tocTree.addEventListener('click', updateColumnNavigation)
        tocTree.addEventListener('scroll', updateColumnNavigationButtons)
      }
      updateColumnNavigation();
    })

    onUnmounted(() => {
      window.removeEventListener('resize', updateColumnNavigation)
      const tocTree = document.getElementById('toc-tree');
      if (tocTree) {
        tocTree.removeEventListener('click', updateColumnNavigation)
        tocTree.removeEventListener('scroll', updateColumnNavigationButtons)
      }
    })

    watch(expandedById, () => {
      console.log('TOC watch expandedById', expandedById.value)
      function hideDescendants (id) {
        const node = componentTOC.value.filter(item => item.identifier === id)
        node.show = false
        node.expanded = false
        console.log('TOC watch hideDescendants (id) node', node)
        if (node.children && node.children.length > 0) {
          for (let i = 0; i < node.children.length; i += 1) {
            if (expandedById.value[node.identifier]) {
              hideDescendants(node.children[i].identifier)
            }
          }
        }
      }
      Object.keys(expandedById.value).forEach((item) => {
        componentTOC.value.filter(n => n.parent === item).forEach((child) => {
          console.log('TOC watch item', item, expandedById.value, expandedById.value[item])
          if (expandedById.value[item]) {
            child.show = true
          } else {
            hideDescendants(item)
          }
        })
      })
    })

    return {
      route,
      isDocProjectIdInc,
      maxCiteDepth,
      toggleBurger,
      currentRefId,
      goTo,
      isCurrentItem,
      expandedById,
      toggleExpanded,
      componentTOC,
      scrollToPreviousColumn,
      scrollToNextColumn
    }
  },

  methods: {
    getNewRefId () {
      if (Object.keys(this.route.query).length > 0 && Object.keys(this.route.query).includes('refId')) {
        // console.log("TOC getNewRefId /this.route.query.refId : ", this.route.query.refId ? this.route.query.refId : false)
        this.currentRefId.value = this.route.query.refId
      }
      // console.log("TOC getNewRefId / this.currentRefId", this.currentRefId)
    }
  }
}
</script>

<style scoped>
div.toc-area-content.toc-content {
  .tree {
    font-size: var(--font-toc-metadata-size);
    font-weight: 500;
    line-height: 22px;
    columns: 3;
    gap: 20px;
    min-height: 100px;
    width: 100%;

    li {
      break-inside: avoid;

      &::before {
        content: '';
      }
    }
  }

  @media screen and (max-width: 1024px) {
    .tree {
      columns: 2;
    }
  }

  @media screen and (max-width: 640px) {
    .tree {
      columns: 1;
      gap: 15px;
      overflow-x: auto;
      overflow-y: hidden;
      scrollbar-width: thin;
      max-height: calc(100vh - 320px); /* Horizontal scroll */
      padding: 20px 0;

      position: relative;
      z-index: 1;
    }
  }

  .tree li {
    font-size: 15px;
    font-weight: 400;
    line-height: 20px;

    &:not(.more)::before {
      margin-left: -7px;
      margin-right: 11px;
    }

    & .li.container {
      display: flex;
      margin: 0;

      & > a {
        display:inline-block;
        color: #4a4a4a;
      }
    }

    &.more {
      display: block;
      padding-left: 0;
      break-inside: avoid;

      & .li.container > a, span {
        margin-top: 4px;
      }

      &::before {
        content: none !important;
      }
    }
  }
}
div.toc-area-aside.toc-content {
  .tree {
    font-size: 15px;
    font-weight: 500;
    line-height: 22px;
    width: 100%;
  }
  .tree li {
    padding: 1px 0 1px 18px ;
    font-size: 15px;
    font-weight: 400;
    line-height: 20px;

    &:not(.more) {
      padding-top: 4px;
      padding-bottom: 4px;
    }

    &.is-current-parent {
      padding-left: 10px;
      padding-top: 0;
      padding-bottom: 0;
    }

    &::before {
      content: '';
    }

    &:not(.more)::before {
      margin-left: -7px;
      margin-right: 11px;
    }

    & .li.container {
      display: flex;
      margin: 0;

      & > a {
        color: #4a4a4a;

        &.is-current {
          margin-top: 3px;
          margin-bottom: 3px;
        }
      }
    }

    &.more {
      padding-left: 0;
      & .li.container > a, span {
      margin-top: 4px;
    }

      &::before {
        content: none !important;
      }
    }
  }
}
div.bottom-toc {
  .tree {
    margin-left: -9px;
  }
  .tree li {
    margin-bottom: 5px;
    padding: 0 0 0 14px;

    &:not(.more)::before {
      margin-left: -7px;
      margin-right: 11px;
    }

    & .li.container {
      display: flex;
      margin: 0;

      & > a {
        color: var(--document-text-color);

        &:hover {
          text-decoration: var(--text-decoration-hover);
        }
      }
    }

    &.more {
      padding-left: 0;

      & .li.container > a {
        margin-top: 4px;
      }
      &::before {
        content: none !important;
      }
    }
  }
}

.toc-area-content.toc-content li:not(.more) > .li.container > a.toc-title:hover,
.toc-area-aside li:not(.more) > .li.container > a.toc-title:hover,
.toc-area-content.toc-content li:not(.more) > .li.container > .is-current,
.toc-area-aside li:not(.more) > .li.container > is-current {
  background-color: #F9F9F9;
}

.toc-area-content.toc-content li:not(.more) > .li.container > a.toc-title,
.toc-area-aside li:not(.more) > .li.container > a.toc-title {
  padding: 6px 20px;
}

.toc-area-content.toc-content li.more.is-current-parent > .li.container > a.toc-title.is-current,
.toc-area-aside li.more.is-current-parent > .li.container > a.toc-title.is-current {
  font-weight: 500;
  color: var(--fill-color) !important;

  &:hover {
    text-decoration: underline;
  }
}

.toc-area-content.toc-content li:not(.more) > .li.container > a.toc-title:not(.is-current):hover,
.toc-area-content.toc-content li.more > .li.container > a.toc-title:hover,
.toc-area-content.toc-content li.more:not(.is-current-parent) > .li.container > a.toc-title:hover,
.toc-area-aside li.more:not(.is-current-parent) > .li.container > a.toc-title:hover {
  color: var(--fill-color) !important;
}

.toc-area-content.toc-content li:not(.more) > .li.container > a.toc-title.is-current,
.toc-area-aside li:not(.more) > .li.container > a.toc-title.is-current {
  display: inline-block;
  border-left: 2px solid var(--fill-color);
  margin: 0 0 0 -16px;
  background-color: #F9F9F9 !important;
}

.toc-area-content.toc-content li:not(.more) > .li.container > a.toc-title.is-current,
.toc-area-content.toc-content li:not(.more) > .li.container > a.toc-title:not(.is-current),
.toc-area-aside li:not(.more) > .li.container > a.toc-title:not(.is-current) {
  margin-left: -22px;
}

#toc-tree-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding-bottom: 10px;

  &.is-hidden {
    display: none;
  }

  button {
    width: 30px;
    height: 25px;
    border: none;
    background-color: transparent;
    background-position: center;
    background-size: 25px auto;
    background-repeat: no-repeat;
    text-indent: -9999px;
    cursor: pointer;

    &.previous-btn {
      background-image: url(@/assets/images/page_suivant.svg);
      transform: scaleX(-1);
    }

    &.next-btn {
      background-image: url(@/assets/images/page_suivant.svg);
    }
  }

  button.is-disabled {
    pointer-events: none;
    opacity: 0.5;
  }
}



@media screen and (max-width: 768px) {
  .toc-area-content.toc-content li:not(.more) > .li.container > a.toc-title,
  .toc-area-aside li:not(.more) > .li.container > a.toc-title {
    padding: 2px 20px;
  }

}

button.toc-toggle {
  --icon-bg: transparent;

  /* remove default button behavior */
  appearance: none;
  -webkit-appearance: none;

  background: transparent;
  border: none;

  flex-shrink: 0;

  display: inline-flex;
  align-items: center;
  width: 30px;
  height: 28px;
  padding: 0;
  margin: 0;

  cursor: pointer;
}

@media screen and (max-width: 768px) {
  button.toc-toggle {
    width: 25px;
    height: 22px;
  }
}

:deep(button.toc-toggle svg) {
  color: var(--fill-color);
}

</style>
