import { describe, expect, it, vi } from 'vitest'

import type { ServerPathRow } from '@/types/server-path'

import { useConvertPathPage } from '../use-convert-path-page'

function createListResponse(items: ServerPathRow[]) {
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

describe('useConvertPathPage', () => {
  it('opens the edit dialog with parsed sources mapped into form state', async () => {
    const fetchPathDetail = vi.fn().mockResolvedValue({
      id: 6,
      code: 'codex',
      name: 'Codex Convert',
      url: '',
      target: '/srv/demo',
      sources: ['/Users/demo/project'],
      sort: 1,
    } satisfies ServerPathRow)

    const page = useConvertPathPage({
      fetchPaths: vi.fn().mockResolvedValue(createListResponse([])),
      fetchPathDetail,
      createPath: vi.fn(),
      updatePath: vi.fn(),
      deletePath: vi.fn(),
      convertPath: vi.fn(),
      confirmWarning: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    await page.openEdit({
      id: 6,
      code: 'codex',
      name: 'Codex Convert',
      url: '',
      target: '/srv/demo',
      sources: [],
      sort: 1,
    })

    expect(fetchPathDetail).toHaveBeenCalledWith(6)
    expect(page.dialog.visible.value).toBe(true)
    expect(page.dialog.value.value).toEqual({
      id: 6,
      code: 'codex',
      name: 'Codex Convert',
      url: '',
      target: '/srv/demo',
      sources: ['/Users/demo/project'],
      sort: 1,
    })
  })

  it('creates a server path and reloads the list after submit success', async () => {
    const fetchPaths = vi
      .fn()
      .mockResolvedValueOnce(createListResponse([]))
      .mockResolvedValueOnce(
        createListResponse([
          {
            id: 6,
            code: 'codex',
            name: 'Codex Convert',
            url: '',
            target: '/srv/demo',
            sources: ['/Users/demo/project'],
            sort: 1,
          },
        ]),
      )
    const createPath = vi.fn().mockResolvedValue({ id: 6 })

    const page = useConvertPathPage({
      fetchPaths,
      fetchPathDetail: vi.fn(),
      createPath,
      updatePath: vi.fn(),
      deletePath: vi.fn(),
      convertPath: vi.fn(),
      confirmWarning: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    await page.list.reload()
    page.openCreate()
    page.dialog.value.value.code = 'codex'
    page.dialog.value.value.name = 'Codex Convert'
    page.dialog.value.value.target = '/srv/demo'
    page.dialog.value.value.sources = ['/Users/demo/project']
    page.dialog.value.value.sort = 1

    await page.submitDialog()

    expect(createPath).toHaveBeenCalledWith({
      code: 'codex',
      name: 'Codex Convert',
      url: '',
      target: '/srv/demo',
      sources: ['/Users/demo/project'],
      sort: 1,
    })
    expect(page.dialog.visible.value).toBe(false)
    expect(page.list.items.value).toHaveLength(1)
  })

  it('deletes a server path after confirmation and reloads the list', async () => {
    const deletePath = vi.fn().mockResolvedValue(undefined)
    const fetchPaths = vi
      .fn()
      .mockResolvedValueOnce(
        createListResponse([
          {
            id: 6,
            code: 'codex',
            name: 'Codex Convert',
            url: '',
            target: '/srv/demo',
            sources: ['/Users/demo/project'],
            sort: 1,
          },
        ]),
      )
      .mockResolvedValueOnce(createListResponse([]))

    const page = useConvertPathPage({
      fetchPaths,
      fetchPathDetail: vi.fn(),
      createPath: vi.fn(),
      updatePath: vi.fn(),
      deletePath,
      convertPath: vi.fn(),
      confirmWarning: vi.fn().mockResolvedValue(undefined),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    await page.list.reload()
    await page.removePath({
      id: 6,
      code: 'codex',
      name: 'Codex Convert',
      url: '',
      target: '/srv/demo',
      sources: ['/Users/demo/project'],
      sort: 1,
    })

    expect(deletePath).toHaveBeenCalledWith(6)
    expect(page.list.items.value).toEqual([])
  })

  it('converts multiline paths and stores the result in dialog state', async () => {
    const convertPath = vi.fn().mockResolvedValue(['/srv/demo/src/main.ts', '/tmp/no-match.txt'])

    const page = useConvertPathPage({
      fetchPaths: vi.fn().mockResolvedValue(createListResponse([])),
      fetchPathDetail: vi.fn(),
      createPath: vi.fn(),
      updatePath: vi.fn(),
      deletePath: vi.fn(),
      convertPath,
      confirmWarning: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    page.openConvert({
      id: 6,
      code: 'codex',
      name: 'Codex Convert',
      url: '',
      target: '/srv/demo',
      sources: ['/Users/demo/project'],
      sort: 1,
    })
    page.convertDialog.value.value.path = '/Users/demo/project/src/main.ts\n/tmp/no-match.txt'

    await page.submitConvertDialog()

    expect(convertPath).toHaveBeenCalledWith(6, {
      path: '/Users/demo/project/src/main.ts\n/tmp/no-match.txt',
    })
    expect(page.convertDialog.result.value).toBe('/srv/demo/src/main.ts\n/tmp/no-match.txt')
  })
})
