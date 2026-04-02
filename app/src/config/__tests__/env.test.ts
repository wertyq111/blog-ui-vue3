import { describe, expect, it } from 'vitest'

import { resolveAppEnv } from '../env'

describe('env config', () => {
  it('falls back to local api defaults when vite env is missing in local development', () => {
    expect(
      resolveAppEnv({} as ImportMetaEnv, {
        protocol: 'http:',
        hostname: '127.0.0.1',
      } as Location),
    ).toEqual({
      appTitle: '个人博客管理台 Vue3',
      apiBaseUrl: 'http://127.0.0.1:8000/api',
    })
  })

  it('derives remote-first api base url from the current browser host when vite env is blank', () => {
    expect(
      resolveAppEnv(
        {
          VITE_API_BASE_URL: '   ',
        } as unknown as ImportMetaEnv,
        {
          protocol: 'http:',
          hostname: '10.10.9.184',
        } as Location,
      ),
    ).toEqual({
      appTitle: '个人博客管理台 Vue3',
      apiBaseUrl: 'http://10.10.9.184:3925/api',
    })
  })

  it('overrides the loopback default api env when the browser is already running on the remote host', () => {
    expect(
      resolveAppEnv(
        {
          VITE_API_BASE_URL: 'http://127.0.0.1:8000/api',
        } as unknown as ImportMetaEnv,
        {
          protocol: 'http:',
          hostname: '10.10.9.184',
        } as Location,
      ),
    ).toEqual({
      appTitle: '个人博客管理台 Vue3',
      apiBaseUrl: 'http://10.10.9.184:3925/api',
    })
  })

  it('trims explicit vite env values', () => {
    expect(
      resolveAppEnv(
        {
          VITE_APP_TITLE: '  管理后台  ',
          VITE_API_BASE_URL: '  /api  ',
        } as unknown as ImportMetaEnv,
        {
          protocol: 'https:',
          hostname: 'example.com',
        } as Location,
      ),
    ).toEqual({
      appTitle: '管理后台',
      apiBaseUrl: '/api',
    })
  })
})
