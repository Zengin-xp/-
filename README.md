# 蒂莎后台管理系统

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

配置对应router/index.js

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
