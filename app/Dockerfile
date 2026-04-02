# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS base

WORKDIR /project
ENV HOST=0.0.0.0

COPY package.json package-lock.json* ./
RUN npm config set registry https://registry.npmjs.org/ \
  && npm install --no-fund --no-audit

COPY . .

FROM base AS development
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

FROM base AS build
RUN npm run build

FROM nginx:1.27-alpine AS production
COPY --from=build /project/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
