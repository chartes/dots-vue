<template>
  <a
    href="#"
    :title="previousRefTitle"
    :class="cssClass"
    @click="goToPreviousFragment($event, previousrefid, previousreftitle)"
  >
    <span class="b_previous" />
    <span>{{ previousRefTitle }}</span>
  </a>
</template>

<script>
import { ref, watch } from 'vue'
import router from '@/router'
import { useRoute } from 'vue-router'

export default {
  name: 'ToPreviousButton',
  props: ['docid', 'previousdocid', 'previousrefid', 'previousreftitle'],

  setup (props) {
    const previousRefId = ref(props.previousrefid)
    const previousRefTitle = ref(props.previousreftitle)
    const route = useRoute()
    // console.log('ToPreviousButton currentDocId : ', props.docid)
    // console.log('ToPreviousButton previousdocid : ', props.previousdocid)
    console.log('ToPreviousButton previousrefid : ', props.previousrefid)
    console.log('ToPreviousButton previousreftitle : ', props.previousreftitle)

    const cssClass = ref('to-previous')

    // On click :
    const goToPreviousDocument = function (event) {
      event.preventDefault()
      if (props.previousdocid && props.previousdocid.length > 0) {
        console.log('PreviousButton previousdocid : ', event, props.previousdocid.value)
        router.push({ path: `/document/${props.previousdocid}` })
      }
    }

    const goToPreviousFragment = function ($event, prevId, prevTitle) {
      $event.preventDefault()
      $event.stopPropagation()
      console.log('goToPreviousFragment event/prevId/prevTitle', $event, prevId, prevTitle)
      if (previousRefId.value && previousRefId.value.length > 0) {
        console.log('PreviousButton previousRefId : ', $event, props.previousrefid)
        console.log('PreviousButton previousRefTitle : ', $event, props.previousreftitle)
        console.log('PreviousButton let route', route, route.path)
        // Replace current querystring with the new one.
        router.push({ path: route.path, query: { refId: previousRefId.value } })
      }
    }
    watch(props, (newProps) => {
      console.log('ToPreviousButton watch props : ', newProps)
      previousRefId.value = newProps.previousrefid
      previousRefTitle.value = newProps.previousreftitle
      cssClass.value = 'to-previous'
    }, { deep: true, immediate: true })

    return {
      goToPreviousDocument,
      goToPreviousFragment,
      previousRefId,
      previousRefTitle,
      cssClass
    }
  }
}
</script>

<style>
.to-previous.to-previous-button-page {
  display: flex;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-bottom: none !important;
  background: url(../assets/images/back_to_top.svg) center / cover no-repeat;
  transform: rotate(-90deg);
  &.disabled {
    pointer-events: none;
    background: url(../assets/images/page_avant.svg) center / cover no-repeat;
    transform: none;
  }
  margin-left: 0;
  margin-right: auto;
  margin-bottom: auto;
  margin-top: 5px;
}
.to-previous.to-previous-button-page-top, .to-previous.to-previous-button-page-bottom {
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
    &:not(.b_previous) {
      margin-right: auto;
    }
    &:hover {
      text-decoration: underline;
    }
  }
  & > span.b_previous {
    flex: 10px 0 0;
    vertical-align: middle;
    width: 10px;
    height: 10px;
    margin: 5px 5px 5px 5px;
    background: url(../assets/images/b_previous.svg) center / cover no-repeat;
  }

  &.disabled > span {
    display: none;
    pointer-events: none;
    /*background: url(../assets/images/b_previous.svg) center / cover no-repeat;*/
    transform: none;
  }
}

@media screen and (max-width: 640px) {
  .to-previous {
    width: 30px;
    height: 30px;
  }
}
</style>
