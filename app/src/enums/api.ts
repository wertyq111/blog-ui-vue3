/**
 * API 相关枚举
 *
 * @description
 * 包含 API 响应码、请求状态等枚举定义
 * 适配 Laravel 后端：code 为整型，0 = 成功，401 = 未授权
 */

/**
 * API 响应码枚举
 */
export const enum ApiCodeEnum {
  /**
   * 成功
   */
  SUCCESS = 0,

  /**
   * 未授权（Token 无效或过期）
   */
  UNAUTHORIZED = 401,
}
