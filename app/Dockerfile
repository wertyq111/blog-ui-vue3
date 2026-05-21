FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /project

FROM base AS development
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --ignore-scripts
COPY . .
EXPOSE 3000
CMD ["pnpm", "run", "dev"]

FROM base AS build
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY . .
RUN pnpm run build-only

FROM nginx:stable-alpine AS production
COPY --from=build /project/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
