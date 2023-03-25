# 闪迪后台管理系统

## 项目构建

### 使用vite创建项目

```
npm init vite@latest shop-admin --template vue
cd shop-admin
npm install
```

### 安装element-plus插件

```
npm install element-plus --save
```

#### 使用全局引入

```
// main.ts import ElementPlus from 'element-plus' import 'element-plus/dist/index.css' app.use(ElementPlus)
```

### 安装Windi CSS工具库

```
npm i -D vite-pliugin-windicss windicss
```

```jsx
// vite.config.js
import WindiCSS from 'vite-plugin-windicss'

export default {
  plugins: [
    WindiCSS(),
  ],
}
```

```jsx
// main.js
import 'virtual:windi.css'
```

vsocde可安装windicss代码提示插件

### 引入vue-router

```
npm install vue-router@4
```

创建router文件夹配置index

```jsx
// main.js
import router from './router'
app.use(router)
```

### 配置路径别名

```js
import path from "path"
resolve:{
  // 别名配置
  alias:{
    "~":path.resolve(__dirname,"src")
  }
},
```

### 路由配置和404捕获页面

创建pages文件夹、index.vue页面、404页面

#### 配置对应router/index.js

```js
import {
    createRouter,
    createWebHashHistory
} from 'vue-router'

import Index from '~/pages/index.vue'
import NotFound from '~/pages/404.vue'

const routes = [
    {
        path: "/",
        component: index,
    },{
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: NotFound
    }
]

export const router = createRouter({
    history: createWebHashHistory(),
    routes
})
```

// 404.vue

```vue
<template>
    <div>
        <el-result
            icon="warning"
            title="404提示"
            sub-title="你找的页面走丢了~"
        >
            <template #extra>
                <el-button type="primary" @click="$router.push('/')">回到首页</el-button>
            </template>
        </el-result>
    </div>
</template>
```

## 登录页开发

### login页面

#### 创建login.vue 

配置对应router 设置响应式（PC Pad Phone）页面样式 表单验证 前后端交互  配置axios以及请求拦截器和响应拦截器

##### 安装element图标

`npm install @element-plus/icon-vue`

注册图标

```js
// main.js
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
```

#### 登录页前后端交互

#### 使用useCookies

##### 安装

`npm i @vueuse/integrations`

`npm i universal-cookie`

#### 封装常用常用工具方法

##### 封装cookie操作的方法

创建composables/auth.js 封装操作token方法

使用cookie存储用户登录信息

```js
import { useCookies } from '@vueuse/integrations/useCookies'
const TokenKey = "admin-token"
const cookie = useCookies()

// 获取token
export function getToken(){
    return cookie.get(TokenKey)
}

// 设置token
export function setToken(token){
    return cookie.set(TokenKey,token)
}

// 清除token
export function removeToken(){
    return cookie.remove(TokenKey)
}
```

##### 封装消息提示框

新建util.js

```js
import { ElNotification,ElMessageBox } from 'element-plus'

// 消息提示 传入提示信息，提示类型，html的提示
export function toast(message,type = "success",dangerouslyUseHTMLString = true){
    ElNotification({
        message,
        type,
        dangerouslyUseHTMLString,
        // 停留时间
        duration:3000
    })
}

// 选项提示
export function showModal(content = "提示内容",type = "warning",title = ""){
    return ElMessageBox.confirm(
        content,
        title,
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type,
        }
      )
}

```

#### 安装axios库

`npm install axios`

##### 配置axios 以及请求拦截和响应拦截

axios.js

```js
/**
 * axios请求封装
 */
import axios from "axios"
import { toast } from '~/composables/util'
import { getToken } from '~/composables/auth'
import store from "./store"

const service = axios.create({
    baseURL:import.meta.env.VITE_APP_BASE_API,
})

// 添加请求拦截器
service.interceptors.request.use(function (config) {

    // 往header头自动添加token
    const token = getToken()
    if(token){
        config.headers["token"] = token
    }

    return config;
  }, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  });

// 添加响应拦截器
service.interceptors.response.use(function (response) {
    // 对响应数据做点什么
    return response.request.responseType === "blob" ? response.data : response.data.data;
  }, function (error) {
    const msg = error.response.data.msg || "请求失败"
    
    if(msg === "非法token，请先登录！"){
        // 未登录派发logout退出登录并重新加载页面
      store.dispatch("logout").finally(()=>location.reload())
    }

    toast(msg,"error")

    return Promise.reject(error);
 })

export default service
```

##### 创建api文件夹

管理请求

manager.js 配置登录api  退出登录api

```js
import axios from '~/axios'
export function login(username,password){
    return axios.post("/admin/login",{
        username,
        password
    })
}

// 退出登录
export function logout(){
    return axios.post("/admin/logout")
}
```

#### 配置跨域

vite.config.js

```js
server:{
  proxy:{
    // 使用/api代理域名
    '/api': {
      target: 'http://ceshi13.dishait.cn',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')
    },
  }
},
```

#### 安装vuex使用

##### 安装

`npm install vuex@next --save`

##### 创建store/index.js 使用vuex存储用户登录信息

实现login和logout登录和退出登录action

```js
import { createStore } from 'vuex'
import { login,getinfo } from '~/api/manager'
import {
    setToken,
    removeToken
} from '~/composables/auth'
const store = createStore({
    state() {
        return {
            // 用户信息
            user: {},

            // 侧边宽度
            asideWidth:"250px",

            menus:[],
            ruleNames:[]
        }
    },
    mutations: {
        // 记录用户信息
        SET_USERINFO(state,user){
            state.user = user
        },
        // 展开/缩起侧边
        handleAsideWidth(state){
            state.asideWidth = state.asideWidth == "250px" ? "64px" : "250px"
        },
        SET_MENUS(state,menus){
            state.menus = menus
        },
        SET_RULENAMES(state,ruleNames){
            state.ruleNames = ruleNames
        }
    },
    actions:{
        // 登录
        login({ commit }, { username,password }){
            return new Promise((resolve,reject)=>{
                login(username,password).then(res=>{
                    setToken(res.token)

                    resolve(res)
                }).catch(err=>reject(err))
            })
        },
        // 获取当前登录用户信息
        getinfo({ commit }){
            return new Promise((resolve,reject)=>{
                getinfo().then(res=>{
                    commit("SET_USERINFO",res)
                    commit("SET_MENUS",res.menus)
                    commit("SET_RULENAMES",res.ruleNames)
                    resolve(res)
                }).catch(err=>reject(err))
            })
        },
        // 退出登录
        logout({ commit }){
            // 移除cookie里的token
            removeToken()
            // 清除当前用户状态 vuex
            commit("SET_USERINFO",{})
        }
    }
})

export default store
```

```js
// main.js
import store from './store'
app.use(store)
```

##### 配置全局守卫

创建permission.js 设置全局路由 判断token是否存在或者过期

如果token不存在或过跳转登录页，如果token存在跳转页面（除登录页，防止重复登录）

```js
import { router,addRoutes } from "~/router"
import { getToken } from "~/composables/auth"
import { toast } from "~/composables/util"
import store from "./store"

// 全局前置守卫
let hasGetInfo = false
router.beforeEach(async (to,from,next)=>{
    const token = getToken()

    // 没有登录，强制跳转回登录页
    if(!token && to.path != "/login"){
        toast("请先登录","error")
        return next({ path:"/login" })
    }

    // 防止重复登录
    if(token && to.path == "/login"){
        toast("请勿重复登录","error")
        return next({ path:from.path ? from.path : "/" })
    }

    // 如果用户登录了，自动获取用户信息，并存储在vuex当中
    let hasNewRoutes = false
    if(token && !hasGetInfo){
        let { menus } = await store.dispatch("getinfo")
        hasGetInfo = true
        // 动态添加路由
        hasNewRoutes = addRoutes(menus)
    }
	next()
})   
```

login.vue

```vue
<template>
    <el-row class="login-container">
      <!--响应式布局 宽屏占16:8 中屏占12:12-->
        <el-col :lg="16" :md="12" class="left">
            <div>
                <div>欢迎光临</div>
                <div>这里是《闪迪后台管理》------为您服务！</div>
            </div>
        </el-col>
        <el-col :lg="8" :md="12" class="right">
            <h2 class="title">欢迎回来</h2>
            <div>
                <span class="line"></span>
                <span>账号密码登录</span>
                <span class="line"></span>
            </div>
          <!--登录表单部分-->
            <el-form ref="formRef" :rules="rules" :model="form" class="w-[250px]">
                <el-form-item prop="username">
                    <el-input v-model="form.username" placeholder="请输入用户名">
                        <template #prefix>
                            <el-icon><user /></el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input type="password" v-model="form.password" placeholder="请输入密码" show-password>
                        <template #prefix>
                            <el-icon><lock /></el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item>
                    <el-button round color="#626aef" class="w-[250px]" type="primary" @click="onSubmit" :loading="loading">登 录</el-button>
                </el-form-item>
            </el-form>
        </el-col>
    </el-row>
</template>

<script setup>
import { ref,reactive,onMounted,onBeforeUnmount } from 'vue'
import { toast } from '~/composables/util'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const store = useStore()
const router = useRouter()

// do not use same name with ref
const form = reactive({
  username:"",
  password:""
})

// 验证规则
const rules = {
    username:[
        { 
            required: true, 
            message: '用户名不能为空', 
            trigger: 'blur' 
        },
    ],
    password:[
        { 
            required: true, 
            message: '用户名不能为空', 
            trigger: 'blur' 
        },
    ]
}

const formRef = ref(null)
const loading = ref(false)
const onSubmit = () => {
    formRef.value.validate((valid)=>{
        if(!valid){
            return false
        }
        loading.value = true
        
        store.dispatch("login",form).then(res=>{
            toast("登录成功")
          // 登录成功路由跳转到首页
            router.push("/")
        }).finally(()=>{
            loading.value = false
        })
    })
}

// 监听回车事件
function onKeyUp(e){
  // 按下回车提交表单
    if(e.key === "Enter") onSubmit()
}

// 添加键盘监听
onMounted(()=>{
    document.addEventListener("keyup",onKeyUp)
})
// 移除键盘监听
onBeforeUnmount(()=>{
    document.removeEventListener("keyup",onKeyUp)
})

</script>

<style scoped>
.login-container{
    @apply min-h-screen bg-indigo-500;
}
.login-container .left,.login-container .right{
    @apply flex items-center justify-center;
}
.login-container .right{
    @apply bg-light-50 flex-col;
}
.left>div>div:first-child{
    @apply font-bold text-5xl text-light-50 mb-4;
}
.left>div>div:last-child{
    @apply text-gray-200 text-sm;
}
.right .title{
    @apply font-bold text-3xl text-gray-800;
}
.right>div{
    @apply flex items-center justify-center my-5 text-gray-300 space-x-2;
}
.right .line{
    @apply h-[1px] w-16 bg-gray-200;
}
</style>
```

```js
    {
        path: "/login",
        component: Login,
        meta: {
            title: "登录页"
        }
    }
```

## 全局loading进度条实现

### 安装nprogress库

`npm i --save nprogress`

```js
// mian.js
import "nprogress/nprogress.css"
```

composables/util.js

```js
import nprogress from 'nprogress'

// 显示全屏loading
export function showFullLoading(){
  nprogress.start()
}

// 隐藏全屏loading
export function hideFullLoading(){
  nprogress.done()
}
```

### permission.js 中配置全局loading加载

```js
import { router,addRoutes } from "~/router"
import { getToken } from "~/composables/auth"
import { 
    toast,
    showFullLoading,
    hideFullLoading
} from "~/composables/util"
import store from "./store"

// 全局前置守卫
let hasGetInfo = false
router.beforeEach(async (to,from,next)=>{
    // 显示loading
    showFullLoading()

    const token = getToken()

    // 没有登录，强制跳转回登录页
    if(!token && to.path != "/login"){
        toast("请先登录","error")
        return next({ path:"/login" })
    }

    // 防止重复登录
    if(token && to.path == "/login"){
        toast("请勿重复登录","error")
        return next({ path:from.path ? from.path : "/" })
    }

    // 如果用户登录了，自动获取用户信息，并存储在vuex当中
    let hasNewRoutes = false
    if(token && !hasGetInfo){
        let { menus } = await store.dispatch("getinfo")
        hasGetInfo = true
        // 动态添加路由
        hasNewRoutes = addRoutes(menus)
    }
	next()
})

// 全局后置守卫
router.afterEach((to, from) => hideFullLoading())
```

## 动态页面标题

### 给路由设置meta属性，设置title

router/index.js

```js
import {
    createRouter,
    createWebHashHistory
} from 'vue-router'

import Index from '~/pages/index.vue'
import Login from '~/pages/login.vue'
import NotFound from '~/pages/404.vue'


// 默认路由，所有用户共享
const routes = [
    {
        path: "/",
        component: Index,
        meta: {
            title: "登录页"
        }
    },
    {
        path: "/login",
        component: Login,
        meta: {
            title: "登录页"
        }
    }, {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: NotFound
    }]



export const router = createRouter({
    history: createWebHashHistory(),
    routes
})
```

### 在全局守卫设置页面标题

permission.js

```js
import { router,addRoutes } from "~/router"
import { getToken } from "~/composables/auth"
import { 
    toast,
    showFullLoading,
    hideFullLoading
} from "~/composables/util"
import store from "./store"

// 全局前置守卫
let hasGetInfo = false
router.beforeEach(async (to,from,next)=>{
    // 显示loading
    showFullLoading()

    const token = getToken()

    // 没有登录，强制跳转回登录页
    if(!token && to.path != "/login"){
        toast("请先登录","error")
        return next({ path:"/login" })
    }

    // 防止重复登录
    if(token && to.path == "/login"){
        toast("请勿重复登录","error")
        return next({ path:from.path ? from.path : "/" })
    }

    // 如果用户登录了，自动获取用户信息，并存储在vuex当中
    let hasNewRoutes = false
    if(token && !hasGetInfo){
        let { menus } = await store.dispatch("getinfo")
        hasGetInfo = true
        // 动态添加路由
        hasNewRoutes = addRoutes(menus)
    }

    // 设置页面标题
    let title = (to.meta.title ? to.meta.title : "") + "-闪迪商城后台"
    document.title = title

    hasNewRoutes ? next(to.fullPath) : next()
})

// 全局后置守卫
router.afterEach((to, from) => hideFullLoading())
```

## 后台主布局实现

### admin创建

新建scr/layouts/admin.vue

### 组件模块

新建layouts/components

components/FHeader.vue 头部侧边栏

components/FMeanuvue 菜单

components/FTagList.vue 标签导航

```js
// router/index.js
import {
    createRouter,
    createWebHashHistory
} from 'vue-router'

import Admin from "~/layouts/admin.vue";
import Index from '~/pages/index.vue'
import Login from '~/pages/login.vue'
import NotFound from '~/pages/404.vue'

// 默认路由，所有用户共享
const routes = [
    {
        path: "/",
        name:"admin",
        component: Admin,
        // 子路由
        children:[{
            path: "/",
            component: Index,
            meta: {
                title: "后台首页"
            }
        }]
    },
    {
        path: "/login",
        component: Login,
        meta: {
            title: "登录页"
        }
    }, {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: NotFound
    }
]

export const router = createRouter({
    history: createWebHashHistory(),
    routes
})
```





```vue
<template>
    <el-container>
        <el-header>
            <f-header/>
        </el-header>
        <el-container>
            <el-aside :width="$store.state.asideWidth">
                <f-menu></f-menu>
            </el-aside>
            <el-main>
                <f-tag-list/>
                <router-view v-slot="{ Component }">
                    <transition name="fade">
                        <keep-alive :max="10">
                            <component :is="Component"></component>
                        </keep-alive>
                    </transition>
                </router-view>
            </el-main>
        </el-container>
    </el-container>
</template>
<script setup>
import FHeader from './components/FHeader.vue';
import FMenu from './components/FMenu.vue';
import FTagList from './components/FTagList.vue';
</script>
<style>
.el-aside{
    transition: all 0.2s;
}
.fade-enter-from{
    opacity: 0;
}
.fade-enter-to{
    opacity: 1;
}
.fade-leave-from{
    opacity: 1;
}
.fade-leave-to{
    opacity: 0;
}
.fade-enter-active,
.fade-leave-active{
    transition: all 0.3s;
}
.fade-enter-active{
    transition-delay: 0.3s;
}
</style>
```

