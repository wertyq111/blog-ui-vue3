import { describe, expect, it } from 'vitest'

import { useDialogForm } from '../use-dialog-form'

describe('useDialogForm', () => {
  it('opens create and edit flows with isolated form state', () => {
    const dialog = useDialogForm({
      createInitialValue: () => ({
        name: '',
        sort: 0,
      }),
      mapSourceToValue: (source: { id: number; name: string; sort: number }) => ({
        name: source.name,
        sort: source.sort,
      }),
    })

    dialog.openCreate()

    expect(dialog.visible.value).toBe(true)
    expect(dialog.isEditing.value).toBe(false)
    expect(dialog.value.value).toEqual({
      name: '',
      sort: 0,
    })

    const source = {
      id: 1,
      name: '风景',
      sort: 9,
    }

    dialog.openEdit(source)
    dialog.value.value.name = '新的名字'

    expect(dialog.isEditing.value).toBe(true)
    expect(dialog.value.value).toEqual({
      name: '新的名字',
      sort: 9,
    })
    expect(source.name).toBe('风景')
  })

  it('closes on successful submit and keeps the dialog open on failure', async () => {
    const dialog = useDialogForm({
      createInitialValue: () => ({
        name: '',
      }),
    })

    dialog.openCreate({
      name: '新增分类',
    })

    await dialog.submit(async (value) => {
      expect(value).toEqual({
        name: '新增分类',
      })
    })

    expect(dialog.visible.value).toBe(false)
    expect(dialog.submitting.value).toBe(false)
    expect(dialog.value.value).toEqual({
      name: '',
    })

    dialog.openCreate({
      name: '再次尝试',
    })

    await expect(
      dialog.submit(async () => {
        throw new Error('save failed')
      }),
    ).rejects.toThrow('save failed')

    expect(dialog.visible.value).toBe(true)
    expect(dialog.submitting.value).toBe(false)
    expect(dialog.value.value).toEqual({
      name: '再次尝试',
    })
  })
})
