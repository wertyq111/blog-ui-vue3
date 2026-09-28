/** 首页背包格子的入口 */
export interface HomeModule {
  key: string;
  color: string;
  tag: string;
  title: string;
  sub: string;
  icon: string;
}

export const unauthModules: HomeModule[] = [
  { key: "daily", color: "pink", tag: "DAILY · 日常", title: "工作日常", sub: "日报 · 周报 · 月报的打理", icon: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" },
  { key: "docs", color: "yellow", tag: "DOCS · 开发", title: "开发文档", sub: "小岛技术结晶与沉淀", icon: "M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" },
  { key: "docker", color: "blue", tag: "TRANSIT · 联运", title: "Dodo 联运", sub: "本地远端服务无缝对接", icon: "M22 12h-4l-3 9L9 3l-3 9H2" },
  { key: "site", color: "green", tag: "BLUEPRINT · 蓝图", title: "建设蓝图", sub: "站点字典参数系统配置", icon: "M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" },
];

export const modules: HomeModule[] = [
  { key: "daily", color: "pink", tag: "DAILY", title: "工作日常", sub: "日报 · 周报 · 月报", icon: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" },
  { key: "docs", color: "yellow", tag: "DOCS", title: "开发文档", sub: "项目资料沉淀", icon: "M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" },
  { key: "source", color: "blue", tag: "SOURCE", title: "平台来源", sub: "绑定项目上下文", icon: "M6 3h12l4 6-10 13L2 9z" },
  { key: "route", color: "teal", tag: "ROUTE", title: "路径转换", sub: "网址与服务器地址", icon: "M13 2L3 14h9l-1 8 10-12h-9z" },
  { key: "init", color: "orange", tag: "INIT", title: "模型初始化", sub: "框架模板配置", icon: "M12 3v18M3 12h18" },
  { key: "user", color: "purple", tag: "USER", title: "会员管理", sub: "用户资料与头像", icon: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z" },
  { key: "sys", color: "green", tag: "SYS", title: "系统管理", sub: "菜单 · 角色 · 权限", icon: "M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" },
  { key: "site", color: "peach", tag: "SITE", title: "站点配置", sub: "字典 · 参数 · 日志", icon: "M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" },
  { key: "api", color: "lime", tag: "API", title: "接口后台", sub: "Laravel API", icon: "M18 20V10M12 20V4M6 20v-6" },
  { key: "docker", color: "red", tag: "DOCKER", title: "远端验证", sub: "Docker 运行环境", icon: "M22 12h-4l-3 9L9 3l-3 9H2" },
  { key: "mini", color: "brown", tag: "MINI", title: "小程序内容", sub: "壁纸 · 相册 · 记录", icon: "M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 17a4 4 0 100-8 4 4 0 000 8z" },
  { key: "me", color: "mint", tag: "ME", title: "个人中心", sub: "岛主信息与偏好", icon: "M12 12m-10 0a10 10 0 1020 0 10 10 0 10-20 0M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" },
];
