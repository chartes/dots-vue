<template>
  <ul class="tree">
    <template v-for="(item, index) in componentTOC" :key="index">
      <li
        :style="`margin-left: ${ $props.margin }px;`"
        :class="item.totalChildren > 0 ? 'more' : ''"
      >
        <div class="li container">
          <button
            v-if="item.totalChildren > 0"
            class="expand-collection"
            :class="expandedById[item.identifier] || item.expanded === true ? 'expanded' : ''"
            @click="toggleExpanded(item.identifier)"
          />
          <span
            v-if="item['@type'] === 'Collection' || item.citeType === 'Collection'"
            :class="route.params.collId ? route.params.collId === item.identifier ? 'is-current' : '' : ''"
            @click="toggleExpanded(item.identifier)"
          >
            {{ item.citeType }}
            {{ item.title }}
          </span>
          <router-link
            v-else-if="isDocProjectIdInc"
            :class="route.params.id === item.identifier ? 'is-current' : ''"
            :to="{ name: 'Document', params: {collId: Array.isArray(item.extensions['dots:dotsProjectId']) ? item.extensions['dots:dotsProjectId'].filter(p => p === route.params.collId)[0] : item.extensions['dots:dotsProjectId'], id: item.identifier} }"
          >
            {{ item.citeType }}
            {{ item.title }}
          </router-link>
          <router-link
            v-else
            :class="route.params.id === item.identifier ? 'is-current' : ''"
            :to="{ name: 'Document', params: { id: item.identifier} }"
          >
            {{ item.citeType }}
            {{ item.title }}
          </router-link>

        </div>
        <div v-if="expandedById[item.identifier] && item.totalChildren > 0 && item.children?.length > 0
                  || item.expanded === true && item.totalChildren > 0 && item.children?.length > 0">

          <CollectionTOC
            :is-doc-projectId-included="isDocProjectIdInc"
            :margin="$props.margin + 23"
            :toc="item.children"
          />
        </div>
      </li>
    </template>
  </ul>
</template>

<script>

import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { getMetadataFromApi } from '@/api/document.js'

function getSimpleObject (obj) {
  // console.log("getSimpleObject / obj", obj)
  let simpleObject = {}
  simpleObject = {
    identifier: obj.identifier ? obj.identifier : obj['@id'],
    citeType: obj['@type'] ? obj['@type'] : obj.citeType,
    expanded: obj.expanded,
    title: obj.title,
    level: obj.level,
    editorialLevelIndicator: obj.editorialLevelIndicator,
    totalChildren: obj.totalChildren,
    member: !obj.member ? obj.children : obj.member,
    parent: obj.parent,
    dublincore: obj.dublincore,
    extensions: obj.extensions
  }
  // console.log("getSimpleObject / simpleObject", simpleObject)
  return simpleObject
}

export default {
  name: 'CollectionTOC',

  components: {},

  props: {
    isDocProjectIdIncluded: {
      type: Boolean,
      required: true
    },
    toc: {
      required: true,
      default: () => [],
      type: Array
    },
    margin: {
      required: true,
      default: 0,
      type: Number
    }
  },
  setup (props) {
    const route = useRoute()
    const isDocProjectIdInc = ref(props.isDocProjectIdIncluded)

    const expandedById = ref({})

    const selectedParent = ref('')

    const componentTOC = ref(props.toc)
    componentTOC.value.sort((a, b) => a.title.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '') > b.title.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '') ? 1 : -1)

    console.log('componentTOC.value props.toc : ', componentTOC.value)

    /* expandedById.value = componentTOC.value.filter(item => item.expanded === true).map(col => [col.identifier, true])
    console.log("componentTOC.value expandedById.value : ", expandedById.value) */
    expandedById.value = Object.assign({}, ...componentTOC.value.filter(item => item.citeType === 'Collection').map((x) => ({ [x.identifier]: false })))

    const toggleExpanded = async (collId) => {
      console.log('CollectionTOC toggleExpanded componentTOC collId: ', componentTOC.value, collId)
      if (!componentTOC.value.filter(item => item['@id'] === collId || item.identifier === collId)[0].children || componentTOC.value.filter(item => item['@id'] === collId || item.identifier === collId)[0].children.length === 0) {
        const response = getSimpleObject(await getMetadataFromApi(collId))
        console.log('response', response)
        // eslint-disable-next-line no-return-assign
        response.member.forEach(m => { m.identifier = m['@id'] })
        response.member.forEach(m => { m.parent = collId })
        console.log('response after identifier', response)
        componentTOC.value.filter(item => item.identifier === collId)[0].member = response.member
        componentTOC.value.filter(item => item.identifier === collId)[0].children = response.member
        componentTOC.value.sort((a, b) => a.title > b.title ? 1 : -1)
        console.log('CollectionTOC componentTOC', componentTOC.value)
      }
      console.log('CollectionTOC expandedById.value', expandedById.value)

      selectedParent.value = collId
      console.log('CollectionTOC after selectedParent.value : ', collId)
      expandedById.value[collId] = !expandedById.value[collId]
      console.log('CollectionTOC after expandedById[collectionId] : ', collId, expandedById.value)
    }

    return {
      route,
      isDocProjectIdInc,
      toggleExpanded,
      expandedById,
      selectedParent,
      componentTOC
    }
  }
}
</script>

<style scoped>
.tree {
  /* list-style: none;*/
  padding-top: 10px;
  padding-bottom: 10px;
}

.tree li {
  font-family: "Barlow Semi Condensed", sans-serif;
  font-size: 15px;
  font-weight: 500;
  line-height: 22px;
  &::before {
    margin-left: -8px;
    margin-right: 11px;
    content: '○';
    font-size: 10px;
    color: #999;
    float: left;
  }
  & .li.container {
      display: flex;
      margin: 0;
    & > a {
      border-bottom: none;
      color: #4a4a4a !important;
      &.is-current {
        font-weight: bold !important;
      }
    }
  }

  &.more {
    padding-left: 0px !important;

    &.li.container > a, span {
      margin-top: 4px;
    }

    &::before {
      content: none !important;
    }
  }
}

button {
  width:30px;
  height: 30px;
  border: none;
  cursor: pointer;

  background: url(@/assets/images/chevron_red_rounded.svg) center / 20px auto no-repeat;
  &.expanded {
    background: url(@/assets/images/chevron_red_rounded.svg) center / 20x auto no-repeat;
    transform: rotate(90deg);
  }
}
.is-current {
  color: #971716 !important;
}
</style>
