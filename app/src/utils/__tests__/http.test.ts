import { describe, expect, it } from 'vitest'

import { extractCollectionPayload, extractErrorMessage, extractPayload } from '../http'

describe('http response helpers', () => {
  it('unwraps mixed backend payload shapes', () => {
    expect(extractPayload({ data: { code: 0, data: { id: 1 } } })).toEqual({ id: 1 })
    expect(extractPayload({ data: { access_token: 'token' } })).toEqual({ access_token: 'token' })
  })

  it('extracts paginated collection data from laravel resources', () => {
    const payload = extractCollectionPayload<{ id: number }>({
      data: {
        data: [{ id: 1 }, { id: 2 }],
        meta: {
          current_page: 2,
          per_page: 15,
          total: 25,
          last_page: 2,
        },
      },
    })

    expect(payload.items).toEqual([{ id: 1 }, { id: 2 }])
    expect(payload.meta).toEqual({
      currentPage: 2,
      perPage: 15,
      total: 25,
      lastPage: 2,
    })
  })

  it('extracts collection data from legacy array-plus-count envelopes', () => {
    const payload = extractCollectionPayload<{ id: number }>(
      {
        data: {
          code: 0,
          data: [{ id: 1 }, { id: 2 }],
          count: 21,
        },
      },
      {
        currentPage: 3,
        perPage: 10,
      },
    )

    expect(payload.items).toEqual([{ id: 1 }, { id: 2 }])
    expect(payload.meta).toEqual({
      currentPage: 3,
      perPage: 10,
      total: 21,
      lastPage: 3,
    })
  })

  it('extracts nested backend error messages', () => {
    expect(
      extractErrorMessage({
        response: {
          data: {
            data: {
              message: '验证码错误',
            },
          },
        },
      }),
    ).toBe('验证码错误')
  })
})
