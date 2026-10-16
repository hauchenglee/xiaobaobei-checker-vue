# Cloudflare Pages configuration

This file is the version-controlled contract for the Cloudflare Pages dashboard configuration.

| Setting | Production | Preview |
| --- | --- | --- |
| Pages project | `xiaobaobei-checker-vue` | `xiaobaobei-checker-vue` |
| Branch | `main` | Non-production branches |
| Build command | `npm run build` | `npm run build` |
| Build output | `dist` | `dist` |
| Build system | Version 3 | Version 3 |
| Node.js | `22.22.2` (`.node-version`) | `22.22.2` (`.node-version`) |
| `VITE_API_BASE_URL` | `https://xiaobaobei-project-server-production.up.railway.app` | `https://xiaobaobei-project-server-production.up.railway.app` |

Canonical domain: `https://xiaobaobei-checker-vue.pages.dev`.

The Railway API must allow this canonical origin through `CORS_ALLOWED_ORIGINS` and
`https://*.xiaobaobei-checker-vue.pages.dev` through `CORS_ALLOWED_ORIGIN_PATTERNS`.
