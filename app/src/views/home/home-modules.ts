/** 首页模块区入口；path 取自后端菜单表（2026-09-28 核对） */
export interface HomeModule {
  key: string;
  color: string;
  tag: string;
  title: string;
  sub: string;
  icon: string;
  path: string;
}

export const homeModules: HomeModule[] = [
  {
    key: "daily",
    color: "pink",
    tag: "DAILY",
    title: "工作日常",
    sub: "日报 · 周报 · 月报",
    icon: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
    path: "/develop/work-daily",
  },
  {
    key: "docs",
    color: "yellow",
    tag: "DOCS",
    title: "工作文档",
    sub: "项目资料沉淀",
    icon: "M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z",
    path: "/develop/work-doc",
  },
  {
    key: "route",
    color: "teal",
    tag: "ROUTE",
    title: "路径转换",
    sub: "网址与服务器地址",
    icon: "M13 2L3 14h9l-1 8 10-12h-9z",
    path: "/develop/convert-path",
  },
  {
    key: "script",
    color: "orange",
    tag: "SCRIPT",
    title: "平台脚本",
    sub: "平台自动化脚本",
    icon: "M16 18l6-6-6-6M8 6l-6 6 6 6",
    path: "/develop/platform-script",
  },
];
