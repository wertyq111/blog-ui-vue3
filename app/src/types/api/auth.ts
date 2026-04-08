/**
 * 认证相关类型定义
 * 适配 Laravel 后端 JWT 认证
 */

/**
 * 登录请求参数
 */
export interface LoginRequest {
  /** 用户名 */
  username: string;
  /** 密码 */
  password: string;
  /** 验证码缓存key */
  captcha_key?: string;
  /** 验证码 */
  captcha?: string;
  /** 记住我 */
  remember?: boolean;
}

/**
 * 登录响应
 */
export interface LoginResponse {
  /** 访问令牌 */
  access_token: string;
  /** 令牌类型 */
  token_type?: string;
  /** 过期时间(单位:秒) */
  expires_in?: number;
}

/**
 * 验证码响应
 */
export interface CaptchaInfo {
  /** 验证码图片Base64 */
  captcha_image_content: string;
  /** 验证码缓存key */
  captcha_key: string;
}
