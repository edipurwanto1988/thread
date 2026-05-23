# AI Threads Content Generator

Astro SSR + Supabase app untuk generate konten Threads via OpenRouter, menyimpan draft, approve, schedule, publish via Buffer, dan audit logs.

## Setup Supabase

1. Buka Supabase Dashboard untuk project dari `supase.md`.
2. Masuk ke SQL Editor.
3. Jalankan seluruh isi `database/schema.sql`.
4. Jalankan seed admin:

```bash
npm run db:seed
```

Default admin dari seed:

```text
admin@example.com / admin12345
```

## Environment

Isi `.env`:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
DATABASE_URL=
APP_SECRET=
OPENROUTER_API_KEY=
BUFFER_ACCESS_TOKEN=
```

## Development

```bash
npm run dev
```

Buka `http://localhost:4322` atau port yang ditampilkan Astro.

## Production Build

```bash
npm run build
npm run preview
```
