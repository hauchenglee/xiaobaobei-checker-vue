# xiaobaobei-checker-vue

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

## Deploy to Cloudflare Pages

1. Connect this repository to Cloudflare Pages.
2. Select the `Vue` (or `Vite`) framework preset.
3. Set the build command to `npm run build` and the build output directory to `dist`.
4. Add these production environment variables in Pages:
   - `VITE_API_BASE_URL=https://your-railway-public-domain` (without a trailing slash)
   - `VITE_APP_BASE_PATH=/`
5. After the first deployment, add `https://<project>.pages.dev` to the Railway backend's
   `CORS_ALLOWED_ORIGINS`. Add a custom domain as another comma-separated origin when applicable.

Example:

```text
CORS_ALLOWED_ORIGINS=https://checker.pages.dev,https://checker.example.com
```

Each preview deployment has a different origin. Add the exact preview origin to the backend allowlist
when preview builds need API access, or test API calls only on the production domain.
