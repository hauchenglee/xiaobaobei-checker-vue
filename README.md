# xiaobaobei-checker-vue

Xiaobaobei text checker frontend built with Vue and Vite.

## Development

```sh
npm install
npm run dev
```

## Verification

```sh
npm run build
```

## Cloudflare Pages

- Framework preset: Vue (or Vite)
- Build command: `npm run build`
- Build output directory: `dist`
- `VITE_API_BASE_URL=https://<Project Server public Railway domain>`

Use the same variables for Preview and Production while both environments are aligned.
`.node-version` pins the Cloudflare build runtime and `public/_redirects` provides SPA fallback.
