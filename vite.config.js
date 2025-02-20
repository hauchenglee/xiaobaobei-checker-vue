import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    host: '0.0.0.0',    // 允許外部訪問
    port: 5173,         // 指定端口
    strictPort: true,   // 如果端口被占用，直接報錯
    allowedHosts: [
      'srv415056.hstgr.cloud',
      'localhost',
      '62.72.59.32'
    ]
  }
})
