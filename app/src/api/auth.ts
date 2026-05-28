import request from "@/utils/request";
import type { LoginRequest, LoginResponse, CaptchaInfo } from "@/types/api/auth";

const AuthAPI = {
  /** 登录接口 */
  login(data: LoginRequest) {
    return request<any, LoginResponse>({
      url: `/user/login`,
      method: "post",
      data: {
        username: data.username,
        password: data.password,
        captcha_key: data.captcha_key,
        captcha: data.captcha,
        remember: data.remember ?? false,
      },
    });
  },

  /** 退出登录接口 */
  logout() {
    return request({
      url: `/user/logout`,
      method: "delete",
      __silent: true,
    } as any);
  },

  /** 获取验证码接口 */
  getCaptcha() {
    return request<any, CaptchaInfo>({
      url: `/captcha`,
      method: "get",
    });
  },
};

export default AuthAPI;
