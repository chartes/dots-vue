<template>
  <div
    class="pagination has-text-centered is-flex is-flex-direction-row is-justify-content-center"
  >
    <div class="pagination-documents-count">
      {{ documentsCountText }}
    </div>

    <div
      class="pagination-controls"
      tabindex="0"
      role="navigation"
      aria-label="Pagination"
      @keydown="onContainerKeydown"
    >
      <!-- First -->
      <button
        :class="isDisabledPrev ? 'button first-page disabled' : 'button first-page'"
        :aria-disabled="isDisabledPrev"
        :tabindex="isDisabledPrev ? -1 : 0"
        @click="!isDisabledPrev && goToPage(1)"
      />

      <!-- Previous -->
      <button
        :class="isDisabledPrev ? 'button previous-page disabled' : 'button previous-page'"
        :aria-disabled="isDisabledPrev"
        :tabindex="isDisabledPrev ? -1 : 0"
        @click="!isDisabledPrev && goToPage(currentPage - 1)"
      />

      <!-- Input -->
      <input
        ref="inputRef"
        v-model="pageInput"
        name="page"
        type="number"
        min="1"
        :max="totalPages"
        placeholder="Page..."
        class="current-page"
        :disabled="totalPages <= 1 || isTableLoading"
        inputmode="numeric"
        pattern="[0-9]*"
        role="spinbutton"
        :aria-valuemin="1"
        :aria-valuemax="totalPages"
        :aria-valuenow="currentPage"
        aria-label="Page number"
        @input="onPageInput"
        @keydown="onInputKeydown"
        @blur="onBlur"
      />

      <span class="label-sur-page">/</span>

      <div class="page-box">
        <span v-if="isTableLoading" class="total-pages dot-flash">...</span>
        <span v-else class="total-pages">{{ totalPages }}</span>
      </div>

      <!-- Next -->
      <button
        :class="isDisabledNext ? 'button next-page disabled' : 'button next-page'"
        :aria-disabled="isDisabledNext"
        :tabindex="isDisabledNext ? -1 : 0"
        @click="!isDisabledNext && goToPage(currentPage + 1)"
      />

      <!-- Last -->
      <button
        :class="isDisabledNext ? 'button last-page disabled' : 'button last-page'"
        :aria-disabled="isDisabledNext"
        :tabindex="isDisabledNext ? -1 : 0"
        @click="!isDisabledNext && goToPage(totalPages)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  modelValue: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  isTableLoading: { type: Boolean, default: false },
  documentsCountText: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue'])

const currentPage = ref(props.modelValue)
const pageInput = ref(String(currentPage.value))
const inputRef = ref(null)

let debounceTimer = null

// Computed disabled states
const isDisabledPrev = computed(() =>
  currentPage.value <= 1 || props.isTableLoading
)

const isDisabledNext = computed(() =>
  currentPage.value >= props.totalPages || props.isTableLoading
)

// Sync from parent
watch(() => props.modelValue, val => {
  currentPage.value = val
  pageInput.value = String(val)
})

// Debounced emit
function emitPage(val) {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    emit('update:modelValue', val)
  }, 300)
}

// Navigation
function goToPage(page) {
  if (props.isTableLoading) return

  let target = page
  if (target < 1) target = 1
  if (target > props.totalPages) target = props.totalPages

  currentPage.value = target
  pageInput.value = String(target)

  emitPage(target)

  inputRef.value?.focus()
}

// Input logic
function onPageInput(e) {
  let value = e.target.value

  if (value === '') {
    pageInput.value = ''
    return
  }

  let num = Number(value)
  if (isNaN(num)) return

  if (num < 1) num = 1
  if (num > props.totalPages) num = props.totalPages

  currentPage.value = num
  pageInput.value = String(num)

  emitPage(num)
}

// Keyboard input
function onInputKeydown(e) {
  if (props.isTableLoading) return

  if (e.key === 'ArrowUp') {
    e.preventDefault()
    goToPage(currentPage.value + 1)
  }

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    goToPage(currentPage.value - 1)
  }

  if (e.key === 'Enter') {
    e.preventDefault()
    onBlur()
  }
}

// Keyboard navigation
function onContainerKeydown(e) {
  if (props.isTableLoading) return

  if (e.key === 'ArrowRight') {
    e.preventDefault()
    goToPage(currentPage.value + 1)
  }

  if (e.key === 'ArrowLeft') {
    e.preventDefault()
    goToPage(currentPage.value - 1)
  }
}

// Blur
function onBlur() {
  if (pageInput.value === '') {
    pageInput.value = String(currentPage.value)
  }
}
</script>
<style scoped>

.pagination-controls {
  --border-radius: 4.8px;

  display: flex;
  align-items: center;

  & > * {
    display: inline-block;
    margin-right: 4px;
  }

  & > button,
  & > input.current-page,
  & span.total-pages,
  & > span.label-sur-page {
    display: inline-block;
    width: 59px;
    height: 59px;
    line-height: 59px;
  }
  & span.total-pages,
  & > button {
    background-color: var(--default-bg-color);
    border-radius: var(--border-radius);
  }
  & > button {
    border: solid 1px transparent;

    &.disabled {
      cursor: not-allowed !important;
      opacity: 0.6;
    }

    &.first-page {
      background: var(--default-bg-color) url(../assets/images/page_debut.svg) center / 17px auto no-repeat;
    }

    &.previous-page {
      background: var(--default-bg-color) url(../assets/images/page_avant.svg) center / 23px auto no-repeat;
    }

    &.next-page {
      background: var(--default-bg-color) url(../assets/images/page_suivant.svg) center / 24px auto no-repeat;
    }

    &.last-page {
      background: var(--default-bg-color) url(../assets/images/page_fin.svg) center / 17px auto no-repeat;
      margin-right: 0;
    }

    /* Accessibility focus (important for WCAG) */

    &:focus-visible {
      outline: 2px solid #C00055;
      outline-offset: 2px;
    }
  }

  & > input.current-page {
    padding: 0 !important;
    border: 1px solid #dbdbdb;
    border-radius: var(--border-radius);

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

    &:disabled {
      cursor: not-allowed !important;
      opacity: 0.6;
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

  & > .page-box {
    display: flex !important;
    align-items: center;
    justify-content: center;

    & > span.total-pages {
      background-color: var(--default-bg-color);
      border-radius: var(--border-radius);
      font-family: inherit;
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
        background-size: 200% 100%; /* width doubled for animation */
        animation: shimmer 1.4s ease infinite;
      }
    }
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

/* Remove native number input */
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
    & > button,
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