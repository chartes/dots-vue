<template>
  <ul class="tree">
    <template v-for="(item, index) in componentTOC" :key="index">
      <li
        v-if="item.show"
        :style="`margin-left: ${ (item.level -1) * 15 }px;`"
        :class="item.level < maxcitedepth && item.children && item.children.length > 0 ? 'more' : ''"
      >
        <div class="li container">
          <button
            v-if="item.level < maxcitedepth && item.children && item.children.length > 0"
            class="expand-collection"
            :class="item.expanded === true ? 'expanded' : ''"
            @click="toggleExpanded(item.identifier)"
          /><!--expandedById[item.identifier] || -->
          <a
            class="toc-title"
            :title="item.url"
            :data-href="item.url"
            :class="route.hash === item.hash ? 'is-current' : !route.hash && item.identifier === currentRefId ? 'is-current' : ''"
            v-on:click.prevent="goTo(item)"
          >
            {{ item.dublincore && item.dublincore.title.length ? item.dublincore.title : item.extensions ? item.extensions['tei:role'] ? item.extensions['tei:role'] : item.citeType && item.extensions['tei:num'] ? item.citeType + ' ' + item.extensions['tei:num'] : item.citeType : item.citeType }} {{ item.descendant > 0 ? `(${item.descendant})` : ''}}

          </a><!-- : 'pas de titre' : `Fragment n° ${index + 1}` :title="item.dublincore && item.dublincore.title.length ? item.dublincore.title : item.extensions ? item.extensions['tei:role'] ? item.extensions['tei:role'] : item.citeType && item.extensions['tei:num'] ? item.citeType + ' ' + item.extensions['tei:num'] : item.citeType : item.citeType"-->
        </div>
        <!-- <div
          v-if="expandedById[item.identifier]"
        >
          <TOC
            v-if="item.level < maxcitedepth && item.children && item.children.length > 0"
            :margin="$props.margin + 23"
            :toc="item.children"
            :maxcitedepth="maxcitedepth"
            :refid="currentRefId"
            @update-ref-id="getNewRefId"
          />
        </div>-->
      </li>
    </template>
  </ul>
</template>

<script>

import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import router from '@/router'
import store from '@/store'

export default {
  name: 'TOC',

  components: {
  }, // CarouselPlugin, Slide, Pagination, Navigation

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
      }
    })
    if (store.state.arianeDocument && store.state.arianeDocument.length > 0) {
      store.state.arianeDocument.forEach(item => {
        componentTOC.value.filter(i => i.identifier === item || i.parent === item).forEach((n) => {
          n.show = true
        })
        expandedById.value[item] = !expandedById.value[item]
      })
    }
    console.log('TOC componentTOC.value', componentTOC.value)
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
          hideDescendants(item.identifier)
        }
      })
      console.log('TOC after expandedById[id] : ', id, expandedById.value)
    }

    const goTo = function (item) {
      // currentRefId.value = ref
      // console.log("TOC ref : ", $event, currentRefId.value)
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
    watch(expandedById, () => {
      console.log('TOC watch expandedById', expandedById.value)
      function hideDescendants (id) {
        const node = componentTOC.value.filter(item => item.identifier === id)
        node.show = false
        console.log('TOC watch hideDescendants (id) node', node)
        if (node.children && node.children.length > 0) {
          for (let i = 0; i < node.children.length; i += 1) {
            if (expandedById.value[node.identifier]) {
              hideDescendants(node.children[i].identifier)
            }
          }
        }
      }
      expandedById.value.forEach((item) => {
        componentTOC.value.filter(n => n.parent === item).forEach((child) => {
          if (expandedById.value[child.identifier]) {
            child.show = true
          } else {
            hideDescendants(child.identifier)
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
      expandedById,
      toggleExpanded,
      componentTOC
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
    font-family: "Barlow Semi Condensed", sans-serif;
    font-size: 15px;
    font-weight: 500;
    line-height: 22px;
    columns: 4;
    gap: 40px;
    min-height: 100px;
    max-height: 300px;
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    ;
  }
  .tree li {
    /*margin-left: 10px;*/
    font-family: "Barlow Semi Condensed", sans-serif;
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
        width: 218px;
      }
    }

    &.more {
      /*margin-left: 0px;*/
      display:inline-block;
      padding-left: 0px;
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
    font-family: "Barlow Semi Condensed", sans-serif;
    font-size: 15px;
    font-weight: 500;
    line-height: 22px;
    width: 100%;
  }
  .tree li {
    /*margin-left: 10px;*/
    font-family: "Barlow Semi Condensed", sans-serif;
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
        color: #4a4a4a;
        width: 218px;
      }
    }

    &.more {
      /*margin-left: 0px;*/
      padding-left: 0px;
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
  .tree li {
    /*margin-left: 10px;*/
    font-family: "Barlow Semi Condensed", sans-serif;
    font-size: 15px;
    font-weight: 500;
    line-height: 22px;

    &:not(.more)::before {
      margin-left: -7px;
      margin-right: 11px;
    }

    & .li.container {
      display: flex;
      margin: 0;

      & > a {
        color: #4a4a4a;
      }
    }

    &.more {
      /*margin-left: 0px;*/
      padding-left: 0px;
      & .li.container > a {
        margin-top: 4px;
      }
      &::before {
        content: none !important;
      }
    }
  }
}

.is-current {
  /* color: #971716 !important; */
  color: var(--text-color) !important;
}
button {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border: none;
  cursor: pointer;
  padding: 0 !important;

  background: url(@/assets/images/chevron_red_rounded.svg) center / 20px auto no-repeat;

  &.expanded {
    background: url(@/assets/images/chevron_red_rounded.svg) center / 20px auto no-repeat;
    transform: rotate(90deg);
  }
}
</style>
