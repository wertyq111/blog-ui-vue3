import { describe, expect, it, vi } from 'vitest'

import type { WorkDailyRow } from '@/types/work-daily'

import { useWorkDailyPage } from '../use-work-daily-page'

function createListResponse(items: WorkDailyRow[]) {
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

describe('useWorkDailyPage', () => {
  it('opens the edit dialog with detail mapped into grouped platform content', async () => {
    const fetchLogDetail = vi.fn().mockResolvedValue({
      id: 11,
      logDate: '2026-04-02',
      content: {
        platforms: [
          {
            platformId: 3,
            platformName: '博客后台',
            content: '完成菜单联调',
          },
          {
            platformId: null,
            platformName: '临时项目',
            content: '补日报',
          },
        ],
      },
    } satisfies WorkDailyRow)

    const page = useWorkDailyPage({
      fetchLogs: vi.fn().mockResolvedValue(createListResponse([])),
      fetchLogDetail,
      createLog: vi.fn(),
      updateLog: vi.fn(),
      deleteLog: vi.fn(),
      fetchPlatforms: vi.fn().mockResolvedValue([]),
      fetchReportModels: vi.fn().mockResolvedValue({ models: [], currentModel: '' }),
      exportReport: vi.fn(),
      importMarkdown: vi.fn(),
      confirmWarning: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    await page.openEdit({
      id: 11,
      logDate: '2026-04-02',
      content: { platforms: [] },
    })

    expect(fetchLogDetail).toHaveBeenCalledWith(11)
    expect(page.dialog.visible.value).toBe(true)
    expect(page.dialog.value.value).toEqual({
      id: 11,
      logDate: '2026-04-02',
      platforms: [
        {
          platformId: 3,
          platformName: '博客后台',
          content: '完成菜单联调',
        },
        {
          platformId: null,
          platformName: '临时项目',
          content: '补日报',
        },
      ],
    })
  })

  it('creates a work daily log and reloads the list after submit success', async () => {
    const fetchLogs = vi
      .fn()
      .mockResolvedValueOnce(createListResponse([]))
      .mockResolvedValueOnce(
        createListResponse([
          {
            id: 11,
            logDate: '2026-04-02',
            content: {
              platforms: [
                {
                  platformId: 3,
                  platformName: '博客后台',
                  content: '完成菜单联调',
                },
              ],
            },
          },
        ]),
      )
    const createLog = vi.fn().mockResolvedValue({ id: 11 })

    const page = useWorkDailyPage({
      fetchLogs,
      fetchLogDetail: vi.fn(),
      createLog,
      updateLog: vi.fn(),
      deleteLog: vi.fn(),
      fetchPlatforms: vi.fn().mockResolvedValue([]),
      fetchReportModels: vi.fn().mockResolvedValue({ models: [], currentModel: '' }),
      exportReport: vi.fn(),
      importMarkdown: vi.fn(),
      confirmWarning: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    await page.list.reload()
    page.openCreate()
    page.dialog.value.value.logDate = '2026-04-02'
    page.dialog.value.value.platforms = [
      {
        platformId: 3,
        platformName: '博客后台',
        content: '完成菜单联调',
      },
    ]

    await page.submitDialog()

    expect(createLog).toHaveBeenCalledWith({
      logDate: '2026-04-02',
      platforms: [
        {
          platformId: 3,
          platformName: '博客后台',
          content: '完成菜单联调',
        },
      ],
    })
    expect(page.dialog.visible.value).toBe(false)
    expect(page.list.items.value).toHaveLength(1)
  })

  it('imports markdown and reloads the list', async () => {
    const importMarkdown = vi.fn().mockResolvedValue({ count: 2 })
    const fetchLogs = vi
      .fn()
      .mockResolvedValueOnce(createListResponse([]))
      .mockResolvedValueOnce(createListResponse([]))

    const page = useWorkDailyPage({
      fetchLogs,
      fetchLogDetail: vi.fn(),
      createLog: vi.fn(),
      updateLog: vi.fn(),
      deleteLog: vi.fn(),
      fetchPlatforms: vi.fn().mockResolvedValue([]),
      fetchReportModels: vi.fn().mockResolvedValue({ models: [], currentModel: '' }),
      exportReport: vi.fn(),
      importMarkdown,
      confirmWarning: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    await page.list.reload()

    const file = new File(['# 0402'], 'daily.md', { type: 'text/markdown' })
    page.importState.year.value = '2026'

    await page.importMarkdown(file)

    expect(importMarkdown).toHaveBeenCalledWith({
      file,
      year: '2026',
    })
    expect(fetchLogs).toHaveBeenCalledTimes(2)
  })

  it('exports the selected report and returns the generated filename', async () => {
    const reportBlob = new Blob(['# 月报'], { type: 'text/markdown;charset=utf-8' })
    const exportReport = vi.fn().mockResolvedValue(reportBlob)

    const page = useWorkDailyPage({
      fetchLogs: vi.fn().mockResolvedValue(createListResponse([])),
      fetchLogDetail: vi.fn(),
      createLog: vi.fn(),
      updateLog: vi.fn(),
      deleteLog: vi.fn(),
      fetchPlatforms: vi.fn().mockResolvedValue([]),
      fetchReportModels: vi.fn().mockResolvedValue({ models: [], currentModel: '' }),
      exportReport,
      importMarkdown: vi.fn(),
      confirmWarning: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    page.report.type.value = 'month'
    page.report.month.value = '2026-04'
    page.report.model.value = 'github-copilot/gpt-5.2-codex'

    const result = await page.exportCurrentReport()

    expect(exportReport).toHaveBeenCalledWith('month', {
      month: '2026-04',
      model: 'github-copilot/gpt-5.2-codex',
    })
    expect(result).toEqual({
      blob: reportBlob,
      filename: '牛马日常月报-2026-04.md',
    })
  })
})
