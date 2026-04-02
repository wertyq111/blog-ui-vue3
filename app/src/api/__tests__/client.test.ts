import { describe, expect, it, vi } from 'vitest'

import { createApiClient } from '../client'

describe('api client', () => {
  it('attaches the current token and persists refreshed tokens from response headers', async () => {
    const setToken = vi.fn()

    const client = createApiClient({
      baseURL: 'http://example.test/api',
      getToken: () => 'Bearer existing-token',
      setToken,
      onUnauthorized: vi.fn(),
    })

    const response = await client.get('/menus', {
      adapter: async (config) => {
        expect(config.headers?.Authorization).toBe('Bearer existing-token')

        return {
          data: {
            code: 0,
            data: [],
          },
          status: 200,
          statusText: 'OK',
          headers: {
            Authorization: 'Bearer refreshed-token',
          },
          config,
        }
      },
    })

    expect(response.data.data).toEqual([])
    expect(setToken).toHaveBeenCalledWith('Bearer refreshed-token')
  })

  it('clears auth state when backend payload reports 401', async () => {
    const onUnauthorized = vi.fn()

    const client = createApiClient({
      baseURL: 'http://example.test/api',
      getToken: () => 'Bearer expired-token',
      setToken: vi.fn(),
      onUnauthorized,
    })

    await expect(
      client.get('/users/getUserInfo', {
        adapter: async (config) => ({
          data: {
            code: 401,
            msg: '登录状态已过期',
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        }),
      }),
    ).rejects.toThrow('登录状态已过期')

    expect(onUnauthorized).toHaveBeenCalledTimes(1)
  })
})
