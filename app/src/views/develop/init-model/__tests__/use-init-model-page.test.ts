import { describe, expect, it, vi } from 'vitest'

import type { InitModelRow } from '@/types/init-model'

import { useInitModelPage } from '../use-init-model-page'

function createListResponse(items: InitModelRow[]) {
  return {
    items,
    meta: {
      currentPage: 1,
      perPage: 10,
      total: items.length,
      lastPage: 1,
    },
  }
}

describe('useInitModelPage', () => {
  it('opens the edit dialog with backend detail mapped into form state', async () => {
    const fetchModelDetail = vi.fn().mockResolvedValue({
      id: 9,
      code: 'oa',
      name: 'OA',
      tip: 'name|type|length|comment|nullable',
      template: '/** %name% */',
    } satisfies InitModelRow)

    const page = useInitModelPage({
      fetchModels: vi.fn().mockResolvedValue(createListResponse([])),
      fetchModelDetail,
      createModel: vi.fn(),
      updateModel: vi.fn(),
      deleteModel: vi.fn(),
      convertModel: vi.fn(),
      confirmWarning: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    await page.openEdit({
      id: 9,
      code: 'oa',
      name: 'OA',
      tip: '',
      template: '',
    })

    expect(fetchModelDetail).toHaveBeenCalledWith(9)
    expect(page.dialog.visible.value).toBe(true)
    expect(page.dialog.value.value).toEqual({
      id: 9,
      code: 'oa',
      name: 'OA',
      tip: 'name|type|length|comment|nullable',
      template: '/** %name% */',
    })
  })

  it('creates an init model and reloads the list after submit success', async () => {
    const fetchModels = vi
      .fn()
      .mockResolvedValueOnce(createListResponse([]))
      .mockResolvedValueOnce(
        createListResponse([
          {
            id: 9,
            code: 'oa',
            name: 'OA',
            tip: 'name|type|length|comment|nullable',
            template: '/** %name% */',
          },
        ]),
      )
    const createModel = vi.fn().mockResolvedValue({ id: 9 })

    const page = useInitModelPage({
      fetchModels,
      fetchModelDetail: vi.fn(),
      createModel,
      updateModel: vi.fn(),
      deleteModel: vi.fn(),
      convertModel: vi.fn(),
      confirmWarning: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    await page.list.reload()
    page.openCreate()
    page.dialog.value.value.code = 'oa'
    page.dialog.value.value.name = 'OA'
    page.dialog.value.value.tip = 'name|type|length|comment|nullable'
    page.dialog.value.value.template = '/** %name% */'

    await page.submitDialog()

    expect(createModel).toHaveBeenCalledWith({
      code: 'oa',
      name: 'OA',
      tip: 'name|type|length|comment|nullable',
      template: '/** %name% */',
    })
    expect(page.dialog.visible.value).toBe(false)
    expect(page.list.items.value).toHaveLength(1)
  })

  it('deletes an init model after confirmation and reloads the list', async () => {
    const deleteModel = vi.fn().mockResolvedValue(undefined)
    const fetchModels = vi
      .fn()
      .mockResolvedValueOnce(
        createListResponse([
          {
            id: 9,
            code: 'oa',
            name: 'OA',
            tip: 'name|type|length|comment|nullable',
            template: '/** %name% */',
          },
        ]),
      )
      .mockResolvedValueOnce(createListResponse([]))

    const page = useInitModelPage({
      fetchModels,
      fetchModelDetail: vi.fn(),
      createModel: vi.fn(),
      updateModel: vi.fn(),
      deleteModel,
      convertModel: vi.fn(),
      confirmWarning: vi.fn().mockResolvedValue(undefined),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    await page.list.reload()
    await page.removeModel({
      id: 9,
      code: 'oa',
      name: 'OA',
      tip: 'name|type|length|comment|nullable',
      template: '/** %name% */',
    })

    expect(deleteModel).toHaveBeenCalledWith(9)
    expect(page.list.items.value).toEqual([])
  })

  it('converts multiline columns and stores the generated template result', async () => {
    const convertModel = vi.fn().mockResolvedValue("/** user_name */\n/** age */\n")

    const page = useInitModelPage({
      fetchModels: vi.fn().mockResolvedValue(createListResponse([])),
      fetchModelDetail: vi.fn(),
      createModel: vi.fn(),
      updateModel: vi.fn(),
      deleteModel: vi.fn(),
      convertModel,
      confirmWarning: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    page.openConvert({
      id: 9,
      code: 'oa',
      name: 'OA',
      tip: 'name|type|length|comment|nullable',
      template: '/** %name% */',
    })
    page.convertDialog.value.value.column = 'user_name|string|用户名\nage|integer|年龄'

    await page.submitConvertDialog()

    expect(convertModel).toHaveBeenCalledWith(9, {
      column: 'user_name|string|用户名\nage|integer|年龄',
    })
    expect(page.convertDialog.result.value).toBe("/** user_name */\n/** age */\n")
  })
})
