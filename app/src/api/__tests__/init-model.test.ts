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
  convertInitModel,
  createInitModel,
  deleteInitModel,
  fetchInitModelDetail,
  fetchInitModelList,
  updateInitModel,
} from '../init-model'

describe('init model api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses the current backend list endpoint with flat code and name filters', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        code: 0,
        data: [
          {
            id: 9,
            code: 'oa',
            name: 'OA',
            tip: 'name|type|length|comment|nullable',
            template: '/** %name% */',
          },
        ],
        count: 1,
      },
    } as never)

    const result = await fetchInitModelList(
      {
        code: ' oa ',
        name: ' OA ',
      },
      {
        page: 3,
        perPage: 10,
      },
    )

    expect(apiClient.get).toHaveBeenCalledWith('/init-model/index', {
      params: {
        code: 'oa',
        name: 'OA',
        page: 3,
      },
    })
    expect(result.items).toEqual([
      {
        id: 9,
        code: 'oa',
        name: 'OA',
        tip: 'name|type|length|comment|nullable',
        template: '/** %name% */',
      },
    ])
  })

  it('fetches init model detail from the resource endpoint', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        code: 0,
        data: {
          id: 9,
          code: 'default',
          name: 'Default',
          tip: 'name|type|comment',
          template: '/** %name% */',
        },
      },
    } as never)

    const result = await fetchInitModelDetail(9)

    expect(apiClient.get).toHaveBeenCalledWith('/init-model/9')
    expect(result).toEqual({
      id: 9,
      code: 'default',
      name: 'Default',
      tip: 'name|type|comment',
      template: '/** %name% */',
    })
  })

  it('creates init model records on the verified add path', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        data: {
          id: 9,
          code: 'default',
          name: 'Default',
          tip: 'name|type|comment',
          template: '/** %name% */',
        },
      },
    } as never)

    await createInitModel({
      code: ' default ',
      name: ' Default ',
      tip: ' name|type|comment ',
      template: ' /** %name% */ ',
    })

    expect(apiClient.post).toHaveBeenCalledWith('/init-model/add', {
      code: 'default',
      name: 'Default',
      tip: 'name|type|comment',
      template: '/** %name% */',
    })
  })

  it('updates init model records on the verified resource path', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        data: {
          id: 9,
          code: 'default',
          name: 'Default Updated',
          tip: 'name|type|comment',
          template: '/** %name% updated */',
        },
      },
    } as never)

    await updateInitModel(9, {
      id: 9,
      code: 'default',
      name: 'Default Updated',
      tip: 'name|type|comment',
      template: '/** %name% updated */',
    })

    expect(apiClient.post).toHaveBeenCalledWith('/init-model/9', {
      code: 'default',
      name: 'Default Updated',
      tip: 'name|type|comment',
      template: '/** %name% updated */',
    })
  })

  it('submits trimmed multiline columns to the convert endpoint', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        data: "/** user_name */\n/** age */\n",
      },
    } as never)

    const result = await convertInitModel(9, {
      column: ' user_name|string|用户名 \n\n age|integer|年龄 ',
    })

    expect(apiClient.post).toHaveBeenCalledWith('/init-model/convert/9', {
      columns: ['user_name|string|用户名', 'age|integer|年龄'],
    })
    expect(result).toBe("/** user_name */\n/** age */\n")
  })

  it('deletes init model records on the backend resource path', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({} as never)

    await deleteInitModel(9)

    expect(apiClient.delete).toHaveBeenCalledWith('/init-model/9')
  })
})
