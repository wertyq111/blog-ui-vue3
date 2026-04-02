import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

import { apiClient } from '@/api/client'

import {
  convertServerPath,
  createServerPath,
  deleteServerPath,
  fetchServerPathDetail,
  fetchServerPathList,
  updateServerPath,
} from '../server-path'

describe('server path api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses the current backend list endpoint with flat name filters', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        code: 0,
        data: [
          {
            id: 6,
            code: 'codex',
            name: 'Codex Convert',
            url: '',
            target: '/srv/demo',
            sources: '["/Users/demo/project"]',
            sort: 1,
          },
        ],
        count: 1,
      },
    } as never)

    const result = await fetchServerPathList(
      {
        name: 'Codex',
      },
      {
        page: 2,
        perPage: 10,
      },
    )

    expect(apiClient.get).toHaveBeenCalledWith('/server-path/index', {
      params: {
        name: 'Codex',
        page: 2,
      },
    })
    expect(result.items).toEqual([
      {
        id: 6,
        code: 'codex',
        name: 'Codex Convert',
        url: '',
        target: '/srv/demo',
        sources: ['/Users/demo/project'],
        sort: 1,
      },
    ])
  })

  it('parses detail sources from the backend string payload', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        code: 0,
        data: {
          id: 6,
          code: 'codex',
          name: 'Codex Convert',
          url: '',
          target: '/srv/demo',
          sources: '["/Users/demo/project","/Volumes/T7/demo"]',
          sort: 2,
        },
      },
    } as never)

    const result = await fetchServerPathDetail(6)

    expect(apiClient.get).toHaveBeenCalledWith('/server-path/6')
    expect(result.sources).toEqual(['/Users/demo/project', '/Volumes/T7/demo'])
  })

  it('creates server paths on the verified add path', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        data: {
          id: 6,
          code: 'codex',
          name: 'Codex Convert',
          url: '',
          target: '/srv/demo',
          sources: '["/Users/demo/project"]',
          sort: 1,
        },
      },
    } as never)

    await createServerPath({
      code: ' codex ',
      name: ' Codex Convert ',
      url: '   ',
      target: ' /srv/demo ',
      sources: [' /Users/demo/project ', '   '],
      sort: 1,
    })

    expect(apiClient.post).toHaveBeenCalledWith('/server-path/add', {
      code: 'codex',
      name: 'Codex Convert',
      url: '',
      target: '/srv/demo',
      sources: ['/Users/demo/project'],
      sort: 1,
    })
  })

  it('updates server paths on the verified resource path', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        data: {
          id: 6,
          code: 'codex',
          name: 'Codex Convert Updated',
          url: '',
          target: '/srv/demo-updated',
          sources: '["/Users/demo/project","/Volumes/T7/demo"]',
          sort: 2,
        },
      },
    } as never)

    await updateServerPath(6, {
      id: 6,
      code: 'codex',
      name: 'Codex Convert Updated',
      url: '',
      target: '/srv/demo-updated',
      sources: ['/Users/demo/project', '/Volumes/T7/demo'],
      sort: 2,
    })

    expect(apiClient.post).toHaveBeenCalledWith('/server-path/6', {
      code: 'codex',
      name: 'Codex Convert Updated',
      url: '',
      target: '/srv/demo-updated',
      sources: ['/Users/demo/project', '/Volumes/T7/demo'],
      sort: 2,
    })
  })

  it('converts paths through the verified convert endpoint', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        data: ['/srv/demo-updated/src/main.ts', '/tmp/no-match.txt'],
      },
    } as never)

    const result = await convertServerPath(6, {
      path: '/Users/demo/project/src/main.ts\n/tmp/no-match.txt',
    })

    expect(apiClient.post).toHaveBeenCalledWith('/server-path/convert/6', {
      paths: ['/Users/demo/project/src/main.ts', '/tmp/no-match.txt'],
    })
    expect(result).toEqual(['/srv/demo-updated/src/main.ts', '/tmp/no-match.txt'])
  })

  it('deletes server paths on the backend resource path', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({} as never)

    await deleteServerPath(6)

    expect(apiClient.delete).toHaveBeenCalledWith('/server-path/6')
  })
})
