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
    width: 38px;
    height: 38px;
    margin-right: 4px;
  }
  & > a {
    display: inline-block;
    width: 38px;
    height: 38px;
    background-color: #C3C3C3;
    border-radius: 3.2px;
  }
  & > a.disabled {
    cursor: not-allowed !important;
  }
  & > a.first-page {
    background: #C3C3C3 url(../assets/images/page_debut.svg)  center / 28px auto no-repeat;
  }
  & > a.previous-page {
    background: #C3C3C3 url(../assets/images/page_avant.svg) center / 28px auto no-repeat;
  }
  & > a.next-page {
    background: #C3C3C3 url(../assets/images/page_suivant.svg) center / 28px auto no-repeat;
  }
  & > a.last-page {
    background: #C3C3C3 url(../assets/images/page_fin.svg) center / 28px auto no-repeat;
  }
  & > input.current-page {
    height: 38px !important;
    padding: 0 !important;
    /* border: 1px solid #C00055; */
    border: 1px solid var(--text-color);
    border-radius: 3.2px;

    font-family: inherit;
    font-size: 18px;
    /* color: #CB2158; */
    color: var(--text-color);
    font-weight: 800;
    text-align: center;
    text-decoration: none;

    &:focus {
      outline: 1px solid #C00055;
    }
    &:disabled {
      cursor: not-allowed !important;
    }
  }

  & > span.label-sur-page {
    font-family: inherit;
    font-size: 11px;
    line-height: 38px;
    color: #979797;
    font-weight: 500;
    text-align: center;
    text-transform: uppercase;
  }

  & > .page-box {

    display: flex !important;
    align-items: center;
    justify-content: center;

    & > span.total-pages {
      display: inline-block;
      width: 100%;
      background-color: #DFDFDF;
      border-radius: 3.2px;
      padding-right: 0;

      font-family: inherit;
      font-size: 18px;
      line-height: 38px;
      color: #818181;
      text-align: center;
      font-weight: 600;
      text-transform: uppercase;

      &.dot-flash {
        width: 38px;
        height: 38px;

        background: linear-gradient(
          90deg,
          #eee 25%,
          #ddd 50%,
          #eee 75%
        );
        background-size: 200% 100%; /* width doubled for pour animation */
        animation: shimmer 1.4s ease infinite;
      }
    }
  }
}

.pagination {
  gap: 20px;
  width: 100%;
  margin: 0;
  padding-bottom: 5px;
  /* border-bottom: solid 1px #b9192f; */

  font-size: 18px;
  font-weight: 700;
}
.toc-mode .pagination {
  display: none !important;
}

.pagination-documents-count {
  margin-right: auto;
  /* color: #b9192f; */
  color: var(--text-color);
  border: none;
}

.list-mode .pagination {
  border-bottom: solid 2px var(--fill-color);
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
</style>