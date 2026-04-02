import { computed, ref, toRaw } from 'vue'

export interface UseDialogFormOptions<TValue, TSource = TValue> {
  createInitialValue: () => TValue
  mapSourceToValue?: (source: TSource) => TValue
}

function cloneValue<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(toRaw(value))
  }

  return JSON.parse(JSON.stringify(toRaw(value))) as T
}

function mergeSeed<TValue>(base: TValue, seed?: Partial<TValue>): TValue {
  if (!seed) {
    return base
  }

  if (base && typeof base === 'object' && !Array.isArray(base)) {
    return Object.assign(base as object, seed) as TValue
  }

  return seed as TValue
}

export function useDialogForm<TValue, TSource = TValue>(options: UseDialogFormOptions<TValue, TSource>) {
  const visible = ref(false)
  const submitting = ref(false)
  const source = ref<TSource | null>(null)
  const value = ref<TValue>(cloneValue(options.createInitialValue()))

  const isEditing = computed(() => source.value !== null)

  function resetValue(seed?: Partial<TValue>) {
    value.value = mergeSeed(cloneValue(options.createInitialValue()), seed)
  }

  function openCreate(seed?: Partial<TValue>) {
    source.value = null
    resetValue(seed)
    submitting.value = false
    visible.value = true
  }

  function openEdit(nextSource: TSource) {
    source.value = nextSource
    value.value = cloneValue(
      options.mapSourceToValue ? options.mapSourceToValue(nextSource) : (nextSource as unknown as TValue),
    )
    submitting.value = false
    visible.value = true
  }

  function close() {
    visible.value = false
    submitting.value = false
    source.value = null
    resetValue()
  }

  async function submit<TResult>(handler: (value: TValue, source: TSource | null) => Promise<TResult> | TResult) {
    submitting.value = true

    try {
      const result = await handler(cloneValue(value.value), source.value)
      close()
      return result
    } catch (error) {
      submitting.value = false
      throw error
    }
  }

  return {
    visible,
    submitting,
    source,
    value,
    isEditing,
    openCreate,
    openEdit,
    close,
    submit,
  }
}
