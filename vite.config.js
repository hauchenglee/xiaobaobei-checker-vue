import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
    // [新增] 設定基礎路徑，必須與 Nginx location /checker/ 對應
    base: '/checker-v/',

    plugins: [
        vue(),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        },
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        strictPort: true,
        cors: true,
        allowedHosts: [
            'srv415056.hstgr.cloud',
            'localhost',
            '62.72.59.32'
        ],
        // [修改] HMR 設定
        hmr: {
            host: 'srv415056.hstgr.cloud',
            // 這裡不能寫 5173，因為外部無法訪問 5173
            // 我們透過 Nginx (Port 80) 轉發 WebSocket，所以這裡告訴瀏覽器連 Port 80
            clientPort: 80,
            // 如果 Nginx 有設定 location /checker/ 支援 upgrade，這裡通常不需要特別改 path
        },
        // Headers 其實在 Nginx 層處理了，這裡保留也沒關係
        headers: {
            'Access-Control-Allow-Origin': '*',
        }
    }
})
