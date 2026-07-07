# blog-ui-vue3

`blog-ui-vue3` 是 blog 工作区的**主力前端**，用 `Vue 3 + TypeScript + Vite + Node 20.19+/22.12+` 构建，兼容当前博客后台接口与动态菜单。旧版 `blog-ui`（Vue 2）已于 2026-06-10 进入维护模式，新功能一律在本仓库开发。

该目录是一个**独立 git 仓库**，对应远端 `git@github.com:wertyq111/blog-ui-vue3.git`。后续 Vue3 前端代码、文档和提交都必须留在这个仓库内，不要提交到 overview 仓库，也不要回写到旧的 `blog-ui` 仓库。

## 技术栈

- Vue 3.5
- TypeScript 5
- Vite 8
- Vue Router 5
- Pinia 3
- Element Plus 2 + animal-island-vue（动森风组件库）
- UnoCSS + Sass
- vue-i18n（zh-cn / en）
- Axios
- pnpm 包管理（`preinstall` 强制，不能用 npm/yarn）
- Docker / Node 20.19+ 或 22.12+

## 目录约定

```text
blog-ui-vue3/
├── compose.yaml
└── app/
    ├── Dockerfile
    ├── package.json
    ├── src/
    └── ...
```

## 本地开发

```bash
cd /Volumes/AgentAPFS/Program/Personal/blog/blog-ui-vue3/app
cp .env.example .env.development
pnpm install
pnpm run dev
```

如果你在本机单独启动前端并连接本机后端，请在 `.env.development` 里显式设置 `VITE_APP_API_HOST`、`VITE_APP_API_PORT` 和 `VITE_APP_API_PREFIX`。

> 部分功能依赖后端接口：个人资料页的头像上传裁剪走后端 `POST user/avatar`（后端需安装 ImageMagick 做裁剪，见后端 README），本地需连上后端才能验证头像更换。

## Docker 开发

```bash
cd /Volumes/AgentAPFS/Program/Personal/blog/blog-ui-vue3
cp .env.example .env
docker compose up --build
```

远端验证遵循 remote-first 流程，运行前请先阅读：

- `docs/migration/current-state.md`
- `docs/migration/remote-workflow.md`

默认访问地址：

- 新版：`http://localhost:${VITE_APP_HOST_PORT}/`
- 旧版：`http://localhost:${VUE2_FRONTEND_HOST_PORT}/`

## 环境变量

参考 [app/.env.example](/Volumes/AgentAPFS/Program/Personal/blog/blog-ui-vue3/app/.env.example)：

- `VITE_APP_HOST`：Vite 监听主机
- `VITE_APP_PORT`：Vite 监听端口
- `VITE_APP_API_PROTOCOL`、`VITE_APP_API_HOST`、`VITE_APP_API_PORT`、`VITE_APP_API_PREFIX`：后端 API 地址拆分变量
- `VITE_APP_API_URL`：后端 API 完整地址，由上面的变量拼出来
- `VITE_APP_TITLE`：页面标题
