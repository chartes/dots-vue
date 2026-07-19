<script setup>
</script>
<template>
  <div v-if="availableTabs.length" class="temporal-slider">

    <div class="temporal-tabs">
      <button
        v-for="facet in availableTabs"
        :key="facet.field"
        :class="{ active: facet.field === currentFacet.field }"
        @click="selectFacet(facet)"
      >
        {{ facet.label }}
      </button>
    </div>


    <div v-if="currentFacet" class="slider-content">

      <div class="slider-label">
        <label>
          {{ currentFacet.label }}
        </label>

      </div>


      <div class="temporal-inputs">

        <span>Entre</span>

        <input
          type="number"
          class="year"
          v-model.number="inputMin"
          @blur="checkMin"
        />

        <span>et</span>

        <input
          type="number"
          class="year"
          v-model.number="inputMax"
          @blur="checkMax"
        />

      </div>

      <VueSlider
        v-model="sliderValue"
        :min="currentFacet.min"
        :max="currentFacet.max"
        :tooltip="'none'"
        range
      /><!--:disabled="loading"-->

    </div>

  </div>
</template>


<script setup>

import {
  computed,
  ref,
  watch
} from 'vue'

import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/antd.css'


const props = defineProps({

  temporalFacets: {
    type: [Array,Object],
    default: () => []
  },

  ranges: {
    type: Object,
    default: () => ({})
  }

})


const emit = defineEmits([
  'change'
])


// --------------------------
// Normalisation backend
// --------------------------

const availableTabs = computed(() => {

  if (Array.isArray(props.temporalFacets)) {
    return props.temporalFacets
  }


  if (props.temporalFacets?.fields) {
    return props.temporalFacets.fields
  }


  if (typeof props.temporalFacets === 'object') {

    return Object.entries(props.temporalFacets)
      .map(([field,value]) => ({
        field,
        ...value
      }))

  }


  return []

})



// --------------------------

const currentFacet = ref(null)


watch(
  availableTabs,
  tabs => {

    if (!tabs.length)
      return

    if (
      !currentFacet.value ||
      !tabs.find(t => t.field === currentFacet.value.field)
    ) {
      currentFacet.value = tabs[0]
    }

  },
  {
    immediate:true
  }
)



function selectFacet(facet) {

  currentFacet.value = facet

}



// --------------------------
// Valeurs affichées
// --------------------------

const inputMin = ref(null)
const inputMax = ref(null)


const sliderValue = ref([null,null])



const currentRange = computed(() => {

  if (!currentFacet.value)
    return {
      min:null,
      max:null
    }


  const r =
    props.ranges[currentFacet.value.field]


  return {

    min:
      r?.gte ??
      currentFacet.value.min,


    max:
      r?.lte ??
      currentFacet.value.max

  }

})



// synchronisation range -> inputs + slider
const updatingFromProps = ref(false)
watch(
  [
    currentFacet,
    () => props.ranges
  ],
  () => {

    if (!currentFacet.value)
      return

    const r =
      props.ranges[currentFacet.value.field]


    updatingFromProps.value = true


    inputMin.value =
      r?.gte ?? currentFacet.value.min

    inputMax.value =
      r?.lte ?? currentFacet.value.max


    sliderValue.value = [
      inputMin.value,
      inputMax.value
    ]


    queueMicrotask(() => {
      updatingFromProps.value = false
    })

  },
  {
    immediate:true,
    deep:true
  }
)



// slider -> store

watch(
  sliderValue,
  value => {

    if (
      updatingFromProps.value ||
      !currentFacet.value ||
      !value
    )
      return


    inputMin.value = value[0]
    inputMax.value = value[1]


    emit('change', {
      field: currentFacet.value.field,
      range:{
        startField: currentFacet.value.start_field,
        endField: currentFacet.value.end_field,
        gte:value[0],
        lte:value[1]
      }
    })

  },
  {
    deep:true
  }
)

watch(
  () => props.ranges,
  value => {
    console.log(
      'TEMPORAL SLIDER ranges changed',
      JSON.stringify(value)
    )
  },
  {
    immediate:true,
    deep:true
  }
)



// --------------------------
// Inputs -> slider
// --------------------------

function checkMin(){

  if (inputMin.value < currentFacet.value.min)
    inputMin.value = currentFacet.value.min


  if (inputMin.value > inputMax.value)
    inputMin.value = inputMax.value


  sliderValue.value = [
    inputMin.value,
    inputMax.value
  ]

}



function checkMax(){

  if (inputMax.value > currentFacet.value.max)
    inputMax.value = currentFacet.value.max


  if (inputMax.value < inputMin.value)
    inputMax.value = inputMin.value


  sliderValue.value = [
    inputMin.value,
    inputMax.value
  ]

}


</script>


<style scoped>

.temporal-slider {
  flex: 50% 0 0;
  padding: 24px;
  font-weight: 500;
  text-transform: uppercase;
}


/* onglets */
.temporal-tabs {
  display:flex;
  /* gap:.5rem;
  margin-bottom:1rem;*/
}


.temporal-tabs button {
  cursor: pointer;

  background-color: #f0f0f0;
  border: none;
  /*border-left: 3px solid #f0f0f0 !important;*/

  padding: 8px 16px;
  margin: 0;

  color: #979797;
  font-size: 14px;
  font-weight: inherit;



  position: relative;
  top: 1px;
}
.temporal-tabs button:hover {
  color: var(--fill-color);
}


.temporal-tabs button.active {

  color: white;

  background: var(--fill-color);

  border-color: var(--fill-color);

  border-radius: 4px 4px 0 0;

  font-weight: inherit;
}
.slider-content {
  /*background: white;*/
  /*border: 1px solid #ddd;*/
  background: var(--meta-area-fill-color);
  padding: 16px;
}


/* reprendre le style des labels */
.temporal-slider label,
.slider-label {
  font-size: 16px;
  color: #4a4a4a;
  margin-bottom: 10px;
}


/* valeurs */
.slider-label span,
.temporal-inputs span {
  font-size:14px;
  color:#979797;
}


/* inputs années */
.temporal-inputs input[type="number"].year {

  inset: unset;
  border: none;
  text-shadow: none;

  -moz-appearance: textfield;
  background-color:#fff;

  max-width:70px;
  padding:2px 0;
  margin:0 15px;

  font-family:"Barlow", sans-serif;
  font-weight:500;
  font-size:14px;
  color:#979797;

  text-transform:uppercase;
  text-align:center;
}


.temporal-inputs input[type="number"].year:focus {
  outline:solid 2px #b9192f;
}


/* suppression flèches input number */
.temporal-inputs input[type="number"]::-webkit-outer-spin-button,
.temporal-inputs input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance:none;
  margin:0;
}


/* layout */
.temporal-inputs {
  display:flex;
  align-items:center;
  gap:.5rem;
  margin-bottom:1rem;
}


/* Vue slider */
:deep(.vue-slider.vue-slider-ltr) {
  margin-top:15px !important;
  padding:0 10px !important;
  height:3px !important;
}


:deep(.vue-slider-dot) {
  width:18px !important;
  height:18px !important;
}


:deep(.vue-slider-rail) {
  background-color:#ffffff !important;
}


:deep(.vue-slider-process) {
  background-color:#b9192f !important;
}


:deep(.vue-slider-dot-handle) {
  border-color:#b9192f !important;
}


:deep(.vue-slider-dot-handle-focus) {
  box-shadow:0 0 0 5px rgba(185,25,47,.2);
}


</style>