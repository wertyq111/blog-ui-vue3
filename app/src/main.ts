import { createApp, defineComponent, h } from 'vue'
import ElementPlus from 'element-plus'
import { createPinia } from 'pinia'
import { RouterView } from 'vue-router'

import { resolveAppEnv } from '@/config/env'
import AppDialog from '@/components/AppDialog.vue'
import { createPermissionPlugin } from '@/directives/permission'
import { createAppRouter, installAppGuards } from '@/router'
import { useAuthStore } from '@/stores/auth'
import '@/styles/admin-page.css'

const appEnv = resolveAppEnv(import.meta.env)
const pinia = createPinia()
const router = createAppRouter()
const authStore = useAuthStore(pinia)

authStore.attachClientHandlers()
installAppGuards(router, authStore)

document.title = appEnv.appTitle

const RootApp = defineComponent({
  name: 'RootApp',
  setup() {
    return () => h(RouterView)
  },
})

createApp(RootApp)
  .use(pinia)
  .use(router)
  .use(ElementPlus)
  .use(createPermissionPlugin(() => authStore.permissions))
  .component('AppDialog', AppDialog)
  .mount('#app')
