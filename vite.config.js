import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
    const env = loadEnv(mode, process.cwd(), '')
    const isServe = command === 'serve'
    const devPort = Number(env.VITE_DEV_PORT || 5173)
    const allowedHosts = (env.VITE_DEV_ALLOWED_HOSTS || 'localhost,127.0.0.1')
        .split(',')
        .map((host) => host.trim())
        .filter(Boolean)
    const hmrHost = env.VITE_DEV_HMR_HOST

    return {
        base: env.VITE_APP_BASE_PATH || '/checker-v/',

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
            port: devPort,
            strictPort: true,
            cors: true,
            allowedHosts,
            hmr: isServe && hmrHost ? {
                host: hmrHost,
                clientPort: Number(env.VITE_DEV_HMR_CLIENT_PORT || devPort),
                protocol: env.VITE_DEV_HMR_PROTOCOL || 'ws',
            } : undefined,
            proxy: {
                '/api': {
                    target: env.VITE_DEV_API_PROXY_TARGET || 'http://localhost:8080',
                    changeOrigin: true,
                },
            },
        },
    }
})
