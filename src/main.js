import { createApp } from 'vue'
import App from './App.vue'
// 引入ElementPlus组件库及图标库
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import { router } from './router'
import store from './store'
const app = createApp(App)
app.use(store)
app.use(router)

app.use(ElementPlus)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
// 引入winds.css
import 'virtual:windi.css'
// 引入进度条
import "nprogress/nprogress.css"
import "./permission"



import permission from "~/directives/permission.js"
app.use(permission)

app.mount('#app')
