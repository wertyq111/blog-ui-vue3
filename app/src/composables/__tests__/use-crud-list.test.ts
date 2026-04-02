import { describe, expect, it, vi } from 'vitest'

import { useCrudList } from '../use-crud-list'

describe('useCrudList', () => {
  it('loads rows, resets page on search, and restores the initial query on reset', async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce({
        data: {
          code: 0,
          data: [{ id: 1 }],
          count: 21,
        },
      })
      .mockResolvedValueOnce({
        data: {
          code: 0,
          data: [{ id: 2 }],
          count: 21,
        },
      })
      .mockResolvedValueOnce({
        data: {
          code: 0,
          data: [{ id: 3 }],
          count: 21,
        },
      })

    const list = useCrudList({
      createInitialQuery: () => ({
        include: ['roles'],
        username: '',
      }),
      initialPageSize: 10,
      fetchPage,
    })

    await list.reload()

    expect(fetchPage).toHaveBeenNthCalledWith(1, {
      page: 1,
      perPage: 10,
      query: {
        include: ['roles'],
        username: '',
      },
    })
    expect(list.items.value).toEqual([{ id: 1 }])
    expect(list.meta.value.total).toBe(21)
    expect(list.meta.value.lastPage).toBe(3)

    list.meta.value.currentPage = 3
    list.query.value.username = 'alice'

    await list.search()

    expect(fetchPage).toHaveBeenNthCalledWith(2, {
      page: 1,
      perPage: 10,
      query: {
        include: ['roles'],
        username: 'alice',
      },
    })
    expect(list.meta.value.currentPage).toBe(1)
    expect(list.items.value).toEqual([{ id: 2 }])

    list.query.value.username = 'bob'

    await list.reset()

    expect(fetchPage).toHaveBeenNthCalledWith(3, {
      page: 1,
      perPage: 10,
      query: {
        include: ['roles'],
        username: '',
      },
    })
    expect(list.query.value).toEqual({
      include: ['roles'],
      username: '',
    })
    expect(list.items.value).toEqual([{ id: 3 }])
  })
})
