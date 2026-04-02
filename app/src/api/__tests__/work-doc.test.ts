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
  createWorkDoc,
  createWorkDocCategory,
  deleteWorkDoc,
  deleteWorkDocCategory,
  fetchWorkDocCategories,
  fetchWorkDocCategoryDetail,
  fetchWorkDocDetail,
  fetchWorkDocList,
  reorderWorkDocCategories,
  updateWorkDoc,
  updateWorkDocCategory,
} from '../work-doc'

describe('work doc api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses the current backend category list endpoint with flat status filter', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        code: 0,
        data: [
          {
            id: 3,
            parentId: 0,
            name: '开发规范',
            icon: 'el-icon-folder',
            description: '规范文档',
            sort: 10,
            status: 1,
          },
        ],
      },
    } as never)

    const result = await fetchWorkDocCategories({ status: 1 })

    expect(apiClient.get).toHaveBeenCalledWith('/work-doc-category/list', {
      params: {
        status: 1,
      },
    })
    expect(result).toEqual([
      {
        id: 3,
        parentId: 0,
        name: '开发规范',
        icon: 'el-icon-folder',
        description: '规范文档',
        sort: 10,
        status: 1,
      },
    ])
  })

  it('fetches category detail from the resource endpoint', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        code: 0,
        data: {
          id: 5,
          parent_id: 3,
          name: '接口文档',
          icon: 'el-icon-document',
          description: '接口规范',
          sort: 20,
          status: 1,
        },
      },
    } as never)

    const result = await fetchWorkDocCategoryDetail(5)

    expect(apiClient.get).toHaveBeenCalledWith('/work-doc-category/5')
    expect(result).toEqual({
      id: 5,
      parentId: 3,
      name: '接口文档',
      icon: 'el-icon-document',
      description: '接口规范',
      sort: 20,
      status: 1,
    })
  })

  it('creates categories on the verified add path', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        data: {
          id: 9,
        },
      },
    } as never)

    await createWorkDocCategory({
      parentId: 3,
      name: ' 接口文档 ',
      icon: ' el-icon-document ',
      description: ' 接口规范 ',
      sort: 20,
      status: 1,
    })

    expect(apiClient.post).toHaveBeenCalledWith('/work-doc-category/add', {
      parent_id: 3,
      name: '接口文档',
      icon: 'el-icon-document',
      description: '接口规范',
      sort: 20,
      status: 1,
    })
  })

  it('updates categories on the verified resource path', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        data: {
          id: 9,
        },
      },
    } as never)

    await updateWorkDocCategory(9, {
      id: 9,
      parentId: 0,
      name: '接口文档更新',
      icon: 'el-icon-folder-opened',
      description: '更新后的接口规范',
      sort: 30,
      status: 0,
    })

    expect(apiClient.post).toHaveBeenCalledWith('/work-doc-category/9', {
      parent_id: 0,
      name: '接口文档更新',
      icon: 'el-icon-folder-opened',
      description: '更新后的接口规范',
      sort: 30,
      status: 0,
    })
  })

  it('saves reordered categories through the reorder endpoint', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        msg: '分类排序已保存',
      },
    } as never)

    await reorderWorkDocCategories([
      { id: 3, parentId: 0, sort: 10 },
      { id: 5, parentId: 3, sort: 20 },
    ])

    expect(apiClient.post).toHaveBeenCalledWith('/work-doc-category/reorder', {
      order: [
        { id: 3, parent_id: 0, sort: 10 },
        { id: 5, parent_id: 3, sort: 20 },
      ],
    })
  })

  it('deletes categories on the backend resource path', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({} as never)

    await deleteWorkDocCategory(9)

    expect(apiClient.delete).toHaveBeenCalledWith('/work-doc-category/9')
  })

  it('uses the current backend doc list endpoint with keyword, status, template and category filters', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        code: 0,
        data: [
          {
            id: 21,
            categoryId: 5,
            title: '接口幂等设计',
            content: '# 幂等设计',
            templateType: 'design',
            tags: ['接口', '幂等'],
            status: 1,
            priority: 8,
            source: 'Blog Admin',
            isPin: 1,
          },
        ],
        count: 1,
      },
    } as never)

    const result = await fetchWorkDocList(
      {
        keyword: ' 幂等 ',
        status: 1,
        templateType: 'design',
        categoryId: 5,
      },
      {
        page: 2,
        perPage: 15,
      },
    )

    expect(apiClient.get).toHaveBeenCalledWith('/work-doc/index', {
      params: {
        keyword: '幂等',
        status: 1,
        template_type: 'design',
        category_id: 5,
        page: 2,
        pageSize: 15,
      },
    })
    expect(result.items).toEqual([
      {
        id: 21,
        categoryId: 5,
        title: '接口幂等设计',
        content: '# 幂等设计',
        templateType: 'design',
        tags: ['接口', '幂等'],
        status: 1,
        priority: 8,
        source: 'Blog Admin',
        isPin: 1,
      },
    ])
  })

  it('fetches doc detail from the resource endpoint', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        code: 0,
        data: {
          id: 21,
          category_id: 5,
          title: '接口幂等设计',
          content: '# 幂等设计',
          template_type: 'design',
          tags: '接口,幂等',
          status: 1,
          priority: 8,
          source: 'Blog Admin',
          is_pin: 1,
        },
      },
    } as never)

    const result = await fetchWorkDocDetail(21)

    expect(apiClient.get).toHaveBeenCalledWith('/work-doc/21')
    expect(result).toEqual({
      id: 21,
      categoryId: 5,
      title: '接口幂等设计',
      content: '# 幂等设计',
      templateType: 'design',
      tags: ['接口', '幂等'],
      status: 1,
      priority: 8,
      source: 'Blog Admin',
      isPin: 1,
    })
  })

  it('creates docs on the verified add path', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        data: {
          id: 21,
        },
      },
    } as never)

    await createWorkDoc({
      categoryId: 5,
      title: ' 接口幂等设计 ',
      content: ' # 幂等设计 ',
      templateType: 'design',
      tags: ['接口', '幂等'],
      status: 1,
      priority: 8,
      source: ' Blog Admin ',
      isPin: 1,
    })

    expect(apiClient.post).toHaveBeenCalledWith('/work-doc/add', {
      category_id: 5,
      title: '接口幂等设计',
      content: '# 幂等设计',
      template_type: 'design',
      tags: ['接口', '幂等'],
      status: 1,
      priority: 8,
      source: 'Blog Admin',
      is_pin: 1,
    })
  })

  it('updates docs on the verified resource path', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        data: {
          id: 21,
        },
      },
    } as never)

    await updateWorkDoc(21, {
      id: 21,
      categoryId: 5,
      title: '接口幂等设计更新',
      content: '# 幂等设计更新',
      templateType: 'knowledge',
      tags: ['接口', '幂等', '知识库'],
      status: 0,
      priority: 9,
      source: 'Blog Admin',
      isPin: 0,
    })

    expect(apiClient.post).toHaveBeenCalledWith('/work-doc/21', {
      category_id: 5,
      title: '接口幂等设计更新',
      content: '# 幂等设计更新',
      template_type: 'knowledge',
      tags: ['接口', '幂等', '知识库'],
      status: 0,
      priority: 9,
      source: 'Blog Admin',
      is_pin: 0,
    })
  })

  it('deletes docs on the backend resource path', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({} as never)

    await deleteWorkDoc(21)

    expect(apiClient.delete).toHaveBeenCalledWith('/work-doc/21')
  })
})
