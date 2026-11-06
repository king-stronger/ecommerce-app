# Ecommerce app

SvelteKit storefront for the ecommerce API.

## Setup

```bash
pnpm install
cp .env.example .env
```

Start the API (`ecommerce-api`, port 8787), then:

```bash
pnpm gen:api
pnpm dev
```

App: `http://localhost:5173`

`API_URL` is public and inlined at build time. The OpenAPI client and Better Auth client both send `credentials: 'include'`.

Demo admin after `pnpm db:seed` on the API: `admin@example.com` / `adminadmin123`.

## Stack

SvelteKit · Tailwind 4 · shadcn-svelte · `@hey-api/openapi-ts` · Better Auth

Regenerate the typed client with `pnpm gen:api` while the API is running. Output: `src/lib/api/client`.
