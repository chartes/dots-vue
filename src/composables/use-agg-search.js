import { reactive, readonly, ref, watchEffect } from 'vue'
import { debounce } from 'lodash'
import useApi from '@/composables/use-api'

const _baseApiURL = `${import.meta.env.VITE_ELASTICSEARCH_URL}`

export default function useAggSearch () {
  const api = useApi()

  const term = ref('')
  const ranges = reactive({})
  const sorts = ref('')
  const groupbyField = ref(null)
  const afterKey = ref(null)
  const withIds = ref(false)

  const result = ref()
  const totalCount = ref(0)
  const bucketCount = ref(0)

  const noHighlight = ref(true)

  const setTerm = function (t) {
    term.value = t
  }
  const setRange = function (key, ops) {
    ranges[key] = ops
  }
  const setSorts = function (s) {
    sorts.value = s
  }
  const setAfterKey = function (num) {
    afterKey.value = num
  }
  const setGroupbyField = function (fieldName) {
    groupbyField.value = fieldName
  }
  const setWithIds = function (flag) {
    withIds.value = flag
  }

  function updateQuery () {
    let rangesArg = ''
    for (const rangeName in ranges) {
      rangesArg += `&range[${rangeName}]=${ranges[rangeName]}`
    }

    let sortArg = ''
    if (sorts.value) {
      sortArg = '&sort=' + sorts.value
    }

    const _withIds = withIds.value ? '&groupby[with-ids]' : ''

    const highlight = noHighlight.value ? '&no-highlight' : ''
    const termValue = term.value ? term.value : '***'

    api.setQuery(`${_baseApiURL}/search?query=${termValue}${sortArg}${rangesArg}&groupby[field]=${groupbyField.value}${_withIds}${highlight}`)
  }

  watchEffect(updateQuery, { flush: 'post' })

  const execute = debounce(async function () {
    if (api.query.value) {
      await api.runQuery()
      if (api.error.value) {
        console.log('api error', api.error.value)
      } else {
        const _res = api.result.value
        result.value = _res.buckets
        totalCount.value = _res['total-count']
        bucketCount.value = _res['bucket-count']
        afterKey.value = _res['after-key']
      }
    }
  }, 150)

  return {
    term: readonly(term),
    ranges: readonly(ranges),
    sorts: readonly(sorts),
    groupbyField: readonly(groupbyField),
    afterKey: readonly(afterKey),
    withIds: readonly(withIds),
    setTerm,
    setRange,
    setSorts,
    setAfterKey,
    setGroupbyField,
    setWithIds,
    execute,
    loading: readonly(api.loading),
    result: readonly(result),
    totalCount: readonly(totalCount),
    bucketCount: readonly(bucketCount),
    error: readonly(api.error)
  }
}
