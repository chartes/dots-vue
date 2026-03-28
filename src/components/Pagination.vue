<template>
  <div
    class="pagination has-text-centered is-flex is-flex-direction-row is-justify-content-center"
  >
    <div class="pagination-documents-count">
      {{ documentsCountText }}
    </div>

    <div class="pagination-controls">
      <!-- First -->
      <a
        :class="currentPage <= 1 || isTableLoading ? 'button first-page disabled' : 'button first-page'"
        @click="currentPage <= 1 ? null : currentPage = 1"
      />

      <!-- Previous -->
      <a
        :class="currentPage <= 1 || isTableLoading ? 'button previous-page disabled' : 'button previous-page'"
        @click="currentPage <= 1 ? null : --currentPage"
      />

      <!-- Input -->
      <input
        v-model.number="currentPage"
        name="page"
        type="number"
        min="1"
        :max="totalPages"
        placeholder="Page..."
        class="current-page"
        :disabled="currentPage >= totalPages || isTableLoading"
        @change.prevent="currentPage = Number($event.target.value)"
      />

      <span class="label-sur-page">/</span>

      <div class="page-box">
        <span
          v-if="isTableLoading"
          class="total-pages dot-flash"
        >
          ...
        </span>
        <span
          v-else
          class="total-pages"
        >
          {{ totalPages }}
        </span>
      </div>

      <!-- Next -->
      <a
        :class="currentPage < totalPages && !isTableLoading ? 'button next-page' : 'button next-page disabled'"
        @click="currentPage < totalPages ? ++currentPage : null"
      />

      <!-- Last -->
      <a
        :class="currentPage < totalPages && !isTableLoading ? 'button last-page' : 'button last-page disabled'"
        @click="currentPage < totalPages ? currentPage = totalPages : null"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  isTableLoading: { type: Boolean, default: false },
  documentsCountText: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue'])

const currentPage = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  currentPage.value = val
})

watch(currentPage, (val) => {
  emit('update:modelValue', val)
})
</script>
<style scoped>

.pagination-controls {
  display: flex;
  align-items: center;
  /*visibility: hidden;*/

  & > * {
    display: inline-block;
    margin-right: 4px;
  }
  & > a,
  & > input.current-page,
  & span.total-pages,
  & > span.label-sur-page {
    display: inline-block;
    width: 59px;
    height: 59px;
    line-height: 59px;
  }
  & span.total-pages,
  & > a {
    background-color: var(--default-bg-color);
    border-radius: 3.2px;
  }
  & > a.button {
    border: solid 1px transparent;
  }
  & > a.disabled {
    cursor: not-allowed !important;
  }
  & > a.first-page {
    background: var(--default-bg-color) url(../assets/images/page_debut.svg)  center / 17px auto no-repeat;
  }
  & > a.previous-page {
    background: var(--default-bg-color) url(../assets/images/page_avant.svg) center / 23px auto no-repeat;
  }
  & > a.next-page {
    background: var(--default-bg-color) url(../assets/images/page_suivant.svg) center / 24px auto no-repeat;
  }
  & > a.last-page {
    background: var(--default-bg-color) url(../assets/images/page_fin.svg) center / 17px auto no-repeat;
    margin-right: 0;
  }
  & > input.current-page {
    padding: 0 !important;
    border: 1px solid #dbdbdb;
    border-radius: 3.2px;

    font-family: inherit;
    font-size: 18px;
    /* color: #CB2158; */
    color: #6e6e6e;
    font-weight: 800;
    text-align: center;
    text-decoration: none;

    &:focus {
      outline: 1px solid #C00055;
    }
  }

  & > span.label-sur-page {
    width: auto;
    padding: 0 3px;
    font-family: inherit;
    font-size: 31px;
    color: #979797;
    font-weight: 400;
    text-align: center;
    text-transform: uppercase;
  }

  & span.total-pages {
    background-color: var(--default-bg-color);
    border-radius: 3.2px;
    font-family: inherit;
    color: #818181;
    text-align: center;
    font-weight: 600;
    text-transform: uppercase;
  }
}
.pagination {
  gap: 20px;
  width: 100%;
  margin: 0;
}
.pagination-documents-count {
  align-self: flex-end;
  margin-right: auto;
  font-family: var(--font-primary), sans-serif;
  font-weight: 700;
  font-size: 48px;
  color: #000000;
  border: none;
}

.toc-mode .pagination {
  display: none !important;
}

.list-mode .pagination {
  border-bottom: solid 4px var(--fill-color);
}

/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type=number] {
  -moz-appearance: textfield;
}


@media screen and (max-width: 768px) {
  .pagination-documents-count {
    margin-right: 0;
    font-size: 24px;
    align-self: center;
  }
}

@media screen and (max-width: 640px) {

  .pagination-documents-count {
    font-size: 24px;
  }

  .pagination-controls {
    & > * {
      width: 38px;
      height: 38px;
      margin-right: 4px;
    }
    & > a,
    & > input.current-page,
    & span.total-pages,
    & > span.label-sur-page {
      display: inline-block;
      width: 39px;
      height: 39px;
      line-height: 39px;
    }
  }
}

</style>