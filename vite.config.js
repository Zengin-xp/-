import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import WindiCSS from 'vite-plugin-windicss'

import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  resolve:{
    // 别名配置
    alias:{
      "~":path.resolve(__dirname,"src")
    }
  },

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

  // 使用插件
  plugins: [vue(),WindiCSS()]
})
