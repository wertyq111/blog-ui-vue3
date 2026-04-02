import { type RouteRecordRaw } from 'vue-router'

export const APP_SHELL_ROUTE_NAME = 'app-shell'

export function createStaticRoutes(): RouteRecordRaw[] {
  return [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/login/index.vue'),
      meta: {
        title: '登录',
        public: true,
      },
    },
    {
      path: '/',
      name: APP_SHELL_ROUTE_NAME,
      component: () => import('@/layouts/AdminLayout.vue'),
      redirect: '/dashboard/workplace',
      children: [
        {
          path: 'dashboard',
          redirect: '/dashboard/workplace',
          meta: {
            title: '工作台',
          },
        },
        {
          path: 'dashboard/workplace',
          name: 'dashboard:workplace',
          component: () => import('@/views/dashboard/workplace/index.vue'),
          meta: {
            title: '工作台',
          },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/dashboard/workplace',
    },
  ]
}
