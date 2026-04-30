# blog-ui-vue3

`blog-ui-vue3` 是与现有 `blog-ui` 并行的全新前端工程，目标是用 `Vue 3 + TypeScript + Vite + Node 22+` 重建后台壳层，同时继续兼容当前博客后台接口与动态菜单。

该目录是一个**独立 git 仓库**，对应远端 `git@github.com:wertyq111/blog-ui-vue3.git`。后续 Vue3 前端代码、文档和提交都必须留在这个仓库内，不要提交到 overview 仓库，也不要回写到旧的 `blog-ui` 仓库。

## 技术栈

- Vue 3
- TypeScript
- Vite
- Vue Router 4
- Pinia
- Element Plus
- Axios
- Vitest
- Docker / Node 22

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
cd /Volumes/T7/Program/Personal/blog/blog-ui-vue3/app
cp .env.example .env.development
npm install
npm run dev
```

如果你在本机单独启动前端并连接本机后端，请在 `.env.development` 里显式设置 `VITE_APP_API_HOST`、`VITE_APP_API_PORT` 和 `VITE_APP_API_PREFIX`。

## Docker 开发

```bash
cd /Volumes/T7/Program/Personal/blog/blog-ui-vue3
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

参考 [app/.env.example](/Volumes/T7/Program/Personal/blog/blog-ui-vue3/app/.env.example)：

- `VITE_APP_HOST`：Vite 监听主机
- `VITE_APP_PORT`：Vite 监听端口
- `VITE_APP_API_PROTOCOL`、`VITE_APP_API_HOST`、`VITE_APP_API_PORT`、`VITE_APP_API_PREFIX`：后端 API 地址拆分变量
- `VITE_APP_API_URL`：后端 API 完整地址，由上面的变量拼出来
- `VITE_APP_TITLE`：页面标题
