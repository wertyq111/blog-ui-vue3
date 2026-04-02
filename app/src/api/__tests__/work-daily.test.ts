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
  createWorkDailyLog,
  deleteWorkDailyLog,
  exportWorkDailyReport,
  fetchWorkDailyDetail,
  fetchWorkDailyList,
  fetchWorkDailyReportModels,
  importWorkDailyMarkdown,
  updateWorkDailyLog,
} from '../work-daily'

describe('work daily api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses the current backend list endpoint with flat filters and normalizes platform content', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        code: 0,
        data: [
          {
            id: 11,
            logDate: '2026-04-02',
            content: {
              platforms: [
                {
                  platformId: 3,
                  platformName: '博客后台',
                  content: '整理 system 模块',
                },
              ],
            },
          },
        ],
        count: 1,
      },
    } as never)

    const result = await fetchWorkDailyList(
      {
        platformId: 3,
        dateRange: ['2026-04-01', '2026-04-02'],
        content: ' system ',
      },
      {
        page: 2,
        perPage: 10,
      },
    )

    expect(apiClient.get).toHaveBeenCalledWith('/work-daily/index', {
      params: {
        platform_id: 3,
        start_date: '2026-04-01',
        end_date: '2026-04-02',
        content: 'system',
        page: 2,
        limit: 10,
      },
    })
    expect(result.items[0]?.content.platforms).toEqual([
      {
        platformId: 3,
        platformName: '博客后台',
        content: '整理 system 模块',
      },
    ])
  })

  it('fetches work daily detail from the resource endpoint', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        code: 0,
        data: {
          id: 11,
          logDate: '2026-04-02',
          content: {
            platforms: [
              {
                platform_id: 5,
                platform_name: '运营后台',
                content: '修复菜单权限',
              },
            ],
          },
        },
      },
    } as never)

    const result = await fetchWorkDailyDetail(11)

    expect(apiClient.get).toHaveBeenCalledWith('/work-daily/11')
    expect(result.content.platforms).toEqual([
      {
        platformId: 5,
        platformName: '运营后台',
        content: '修复菜单权限',
      },
    ])
  })

  it('creates work daily records on the verified add path', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        data: {
          id: 11,
        },
      },
    } as never)

    await createWorkDailyLog({
      logDate: '2026-04-02',
      platforms: [
        {
          platformId: 3,
          platformName: '',
          content: ' 完成菜单联调 ',
        },
        {
          platformId: null,
          platformName: '临时项目',
          content: ' 补记录 ',
        },
      ],
    })

    expect(apiClient.post).toHaveBeenCalledWith('/work-daily/add', {
      log_date: '2026-04-02',
      platforms: [
        {
          platform_id: 3,
          content: '完成菜单联调',
        },
        {
          platform_id: null,
          platform_name: '临时项目',
          content: '补记录',
        },
      ],
    })
  })

  it('updates work daily records on the verified resource path', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        data: {
          id: 11,
        },
      },
    } as never)

    await updateWorkDailyLog(11, {
      id: 11,
      logDate: '2026-04-03',
      platforms: [
        {
          platformId: 5,
          platformName: '',
          content: '整理 develop 波次',
        },
      ],
    })

    expect(apiClient.post).toHaveBeenCalledWith('/work-daily/11', {
      log_date: '2026-04-03',
      platforms: [
        {
          platform_id: 5,
          content: '整理 develop 波次',
        },
      ],
    })
  })

  it('reads report models and accepts current_model from the backend payload', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        code: 0,
        data: {
          models: ['github-copilot/gpt-5.2-codex', 'deepseek/chat'],
          current_model: 'github-copilot/gpt-5.2-codex',
        },
      },
    } as never)

    const result = await fetchWorkDailyReportModels()

    expect(apiClient.get).toHaveBeenCalledWith('/work-daily/report/models')
    expect(result).toEqual({
      models: ['github-copilot/gpt-5.2-codex', 'deepseek/chat'],
      currentModel: 'github-copilot/gpt-5.2-codex',
    })
  })

  it('downloads reports from the current month route with blob response', async () => {
    const blob = new Blob(['# 月报'], { type: 'text/markdown;charset=utf-8' })
    vi.mocked(apiClient.get).mockResolvedValue({
      data: blob,
    } as never)

    const result = await exportWorkDailyReport('month', {
      month: '2026-04',
      model: 'github-copilot/gpt-5.2-codex',
    })

    expect(apiClient.get).toHaveBeenCalledWith('/work-daily/report/month', {
      params: {
        month: '2026-04',
        model: 'github-copilot/gpt-5.2-codex',
      },
      responseType: 'blob',
    })
    expect(result).toBe(blob)
  })

  it('uploads markdown files with multipart form data', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        data: {
          count: 2,
        },
      },
    } as never)

    const file = new File(['# 0402'], 'daily.md', { type: 'text/markdown' })

    const result = await importWorkDailyMarkdown({
      file,
      year: '2026',
    })

    expect(apiClient.post).toHaveBeenCalledWith(
      '/work-daily/import',
      expect.any(FormData),
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    )
    expect(result).toEqual({
      count: 2,
    })
  })

  it('deletes work daily records on the backend resource path', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({} as never)

    await deleteWorkDailyLog(11)

    expect(apiClient.delete).toHaveBeenCalledWith('/work-daily/11')
  })
})
