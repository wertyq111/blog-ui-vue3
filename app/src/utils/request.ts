import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from "axios";
import qs from "qs";
import { ApiCodeEnum } from "@/enums/api";
import { AuthStorage, redirectToLogin } from "@/utils/auth";

// HTTP 请求实例
const http = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 50000,
  headers: { "Content-Type": "application/json;charset=utf-8" },
  paramsSerializer: (params) => qs.stringify(params, { arrayFormat: "repeat" }),
});

// 请求拦截器
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = AuthStorage.getAccessToken();

    if (config.headers.Authorization === "no-auth") {
      delete config.headers.Authorization;
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
http.interceptors.response.use(
  (response: AxiosResponse) => {
    const { responseType } = response.config;

    // 二进制数据直接返回
    if (responseType === "blob" || responseType === "arraybuffer") {
      return response;
    }

    // 从 response header 提取刷新后的 token（后端 JwtRefreshToken 中间件）
    const newToken = response.headers["authorization"];
    if (newToken) {
      const token = newToken.replace(/^Bearer\s+/i, "");
      AuthStorage.updateToken(token);
    }

    const { code, data, msg } = response.data;

    if (code === ApiCodeEnum.SUCCESS) {
      return data;
    }

    // 401 未授权
    if (code === ApiCodeEnum.UNAUTHORIZED) {
      redirectToLogin("登录已过期，请重新登录");
      return Promise.reject(new Error(msg || "未授权"));
    }

    ElMessage.error(msg || "系统出错");
    return Promise.reject(new Error(msg || "系统出错"));
  },

  async (error) => {
    const { response } = error;

    if (!response) {
      ElMessage.error("网络连接失败");
      return Promise.reject(error);
    }

    // HTTP 401 状态码
    if (response.status === 401) {
      await redirectToLogin("登录已过期，请重新登录");
      return Promise.reject(new Error("Unauthorized"));
    }

    const msg = response.data?.msg || response.data?.message || "请求失败";
    ElMessage.error(msg);
    return Promise.reject(new Error(msg));
  }
);

export default http;
