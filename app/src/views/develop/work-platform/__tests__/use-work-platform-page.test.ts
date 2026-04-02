import { describe, expect, it, vi } from 'vitest'

import type { WorkPlatformRow } from '@/types/work-platform'

import { useWorkPlatformPage } from '../use-work-platform-page'

function createListResponse(items: WorkPlatformRow[]) {
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

describe('useWorkPlatformPage', () => {
  it('opens the edit dialog with backend detail mapped into form state', async () => {
    const fetchPlatformDetail = vi.fn().mockResolvedValue({
      id: 3,
      name: 'Blog',
      status: 1,
      sort: 10,
    } satisfies WorkPlatformRow)

    const page = useWorkPlatformPage({
      fetchPlatforms: vi.fn().mockResolvedValue(createListResponse([])),
      fetchPlatformDetail,
      createPlatform: vi.fn(),
      updatePlatform: vi.fn(),
      deletePlatform: vi.fn(),
      reorderPlatforms: vi.fn(),
      confirmWarning: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    await page.openEdit({
      id: 3,
      name: 'Blog',
      status: 1,
      sort: 10,
    })

    expect(fetchPlatformDetail).toHaveBeenCalledWith(3)
    expect(page.dialog.visible.value).toBe(true)
    expect(page.dialog.value.value).toEqual({
      id: 3,
      name: 'Blog',
      status: 1,
      sort: 10,
    })
  })

  it('creates a work platform and reloads the list after submit success', async () => {
    const fetchPlatforms = vi
      .fn()
      .mockResolvedValueOnce(createListResponse([]))
      .mockResolvedValueOnce(
        createListResponse([
          {
            id: 3,
            name: 'Blog',
            status: 1,
            sort: 10,
          },
        ]),
      )
    const createPlatform = vi.fn().mockResolvedValue({ id: 3 })

    const page = useWorkPlatformPage({
      fetchPlatforms,
      fetchPlatformDetail: vi.fn(),
      createPlatform,
      updatePlatform: vi.fn(),
      deletePlatform: vi.fn(),
      reorderPlatforms: vi.fn(),
      confirmWarning: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    await page.list.reload()
    page.openCreate()
    page.dialog.value.value.name = 'Blog'
    page.dialog.value.value.status = 1
    page.dialog.value.value.sort = 10

    await page.submitDialog()

    expect(createPlatform).toHaveBeenCalledWith({
      name: 'Blog',
      status: 1,
      sort: 10,
    })
    expect(page.dialog.visible.value).toBe(false)
    expect(page.list.items.value).toHaveLength(1)
  })

  it('deletes a work platform after confirmation and reloads the list', async () => {
    const deletePlatform = vi.fn().mockResolvedValue(undefined)
    const fetchPlatforms = vi
      .fn()
      .mockResolvedValueOnce(
        createListResponse([
          {
            id: 3,
            name: 'Blog',
            status: 1,
            sort: 10,
          },
        ]),
      )
      .mockResolvedValueOnce(createListResponse([]))

    const page = useWorkPlatformPage({
      fetchPlatforms,
      fetchPlatformDetail: vi.fn(),
      createPlatform: vi.fn(),
      updatePlatform: vi.fn(),
      deletePlatform,
      reorderPlatforms: vi.fn(),
      confirmWarning: vi.fn().mockResolvedValue(undefined),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    await page.list.reload()
    await page.removePlatform({
      id: 3,
      name: 'Blog',
      status: 1,
      sort: 10,
    })

    expect(deletePlatform).toHaveBeenCalledWith(3)
    expect(page.list.items.value).toEqual([])
  })

  it('reorders local rows and submits the normalized order payload', async () => {
    const reorderPlatforms = vi.fn().mockResolvedValue(undefined)

    const page = useWorkPlatformPage({
      fetchPlatforms: vi.fn().mockResolvedValue(
        createListResponse([
          {
            id: 3,
            name: 'Blog',
            status: 1,
            sort: 10,
          },
          {
            id: 7,
            name: 'Docs',
            status: 1,
            sort: 20,
          },
        ]),
      ),
      fetchPlatformDetail: vi.fn(),
      createPlatform: vi.fn(),
      updatePlatform: vi.fn(),
      deletePlatform: vi.fn(),
      reorderPlatforms,
      confirmWarning: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    await page.list.reload()
    page.moveDown(0)
    await page.saveOrder()

    expect(page.orderedItems.value.map((item) => item.id)).toEqual([7, 3])
    expect(reorderPlatforms).toHaveBeenCalledWith([
      { id: 7, sort: 10 },
      { id: 3, sort: 20 },
    ])
  })
})
