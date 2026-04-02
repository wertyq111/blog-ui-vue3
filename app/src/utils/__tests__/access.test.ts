import { describe, expect, it } from 'vitest'

import { hasAnyPermission, hasPermission, normalizePermissionCodes } from '../access'

describe('access utilities', () => {
  it('normalizes mixed permission sources into flat string codes', () => {
    expect(
      normalizePermissionCodes([
        'sys:user:add',
        { permission: 'sys:user:edit' },
        { permission: undefined },
      ]),
    ).toEqual(['sys:user:add', 'sys:user:edit'])
  })

  it('checks required permissions', () => {
    const permissions = ['sys:user:add', 'sys:user:edit']

    expect(hasPermission(permissions, 'sys:user:add')).toBe(true)
    expect(hasPermission(permissions, ['sys:user:add', 'sys:user:edit'])).toBe(true)
    expect(hasPermission(permissions, ['sys:user:add', 'sys:user:delete'])).toBe(false)
    expect(hasAnyPermission(permissions, ['sys:user:delete', 'sys:user:edit'])).toBe(true)
  })
})
