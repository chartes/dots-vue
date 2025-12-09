<template>
  <a
    href="#"
    :title="nextRefTitle"
    :class="cssClass"
    @click="goToNextFragment($event, nextrefid, nextreftitle)"
  >
    <span>{{ nextRefTitle }}</span>
    <span class="b_next" />
  </a>
</template>

<script>
import { ref, watch } from 'vue'
import router from '@/router'
import { useRoute } from 'vue-router'

export default {
  name: 'ToNextButton',
  props: ['docid', 'nextdocid', 'nextrefid', 'nextreftitle'],

  setup (props) {
    const nextRefId = ref(props.nextrefid)
    const nextRefTitle = ref(props.nextreftitle)
    const route = useRoute()
    // console.log('ToNextButton currentDocId : ', props.docid)
    // console.log('ToNextButton nextdocid : ', props.nextdocid)
    console.log('ToNextButton setup nextrefid : ', props.nextrefid)
    console.log('ToNextButton setup nextreftitle : ', props.nextreftitle)

    const cssClass = ref('to-next')

    // On click :
    const goToNextDocument = function (event) {
      event.preventDefault()
      if (props.nextdocid && props.nextdocid.length > 0) {
        console.log('NextButton nextdocid : ', event, props.nextdocid)
        router.push({ path: `/document/${props.nextdocid}` })
      }
    }

    const goToNextFragment = function ($event, nextId, nextTitle) {
      $event.preventDefault()
      $event.stopPropagation()
      console.log('goToNextFragment event/nextId/nextTitle', $event, nextId, nextTitle)
      if (nextRefId.value && nextRefId.value.length > 0) {
        console.log('NextButton nextRefId : ', $event, props.nextrefid)
        console.log('NextButton nextRefId : ', $event, props.nextreftitle)
        console.log('NextButton let route', route, route.path)
        // Replace current querystring with the new one.
        router.push({ path: route.path, query: { refId: nextRefId.value } })
      }
    }
    watch(props, (newProps) => {
      console.log('ToNextButton watch props : ', newProps)
      nextRefId.value = newProps.nextrefid
      nextRefTitle.value = newProps.nextreftitle
      cssClass.value = 'to-next'
    }, { deep: true, immediate: true })

    return {
      goToNextDocument,
      goToNextFragment,
      nextRefId,
      nextRefTitle,
      cssClass
    }
  }
}
</script>

<style>
.to-next.to-next-button-page {
  display: flex;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-bottom: none !important;
  background: url(../assets/images/back_to_top.svg) center / cover no-repeat;
  transform: rotate(90deg);
  &.disabled {
    pointer-events: none;
    background: url(../assets/images/page_suivant.svg) center / cover no-repeat;
    transform: none;
  }
  margin-left: auto;
  margin-right: 0;
  margin-bottom: auto;
  margin-top: 5px;
}
.to-next.to-next-button-page-top, .to-next.to-next-button-page-bottom {
  display: flex;
  justify-content: center;
  /* text-align: right; */
  vertical-align: top;
  width: 100%;
  height: 100%;
  margin-bottom: 10px;
  border-bottom: none !important;

  & > span {
    font-family: "Barlow", sans-serif;
    font-size: 14px;
    text-align: right;
    &:not(.b_next) {
      margin-left: auto;
    }
    &:hover {
      text-decoration: underline;
    }
  }
  & > span.b_next {
    flex: 10px 0 0;
    vertical-align: middle;
    width: 10px;
    height: 10px;
    margin: 5px 5px 5px 5px;
    background: url(../assets/images/b_next.svg) center / cover no-repeat;
  }

  &.disabled > span {
    display: none;
    pointer-events: none;
    /*background: url(../assets/images/b_next.svg) center / cover no-repeat;*/
    transform: none;
  }
}

@media screen and (max-width: 640px) {
  .to-next {
    width: 30px;
    height: 30px;
  }
}
</style>
