# Repository Guidelines

## Project Structure & Module Organization

- Core Nuxt app in `src/` (client-only, `ssr: false`, static generate). Feature-sliced layers in `src/layers/*` (login, painel, fornecedores, equipe, concorrentes, prospectos, ocorrencias, rotas, checkin) are extended in `nuxt.config.ts`; each layer bundles components/composables/pages/stores/types/nuxt.config.ts.
- Shared UI system lives in `src/components/ui/*`; global layouts in `src/layouts`; top-level shell in `src/app.vue`.
- Global styles and tokens in `src/assets/styles/*`; images/icons in `src/assets/img`.
- Backend-for-frontend in `src/server` (`api` routes, `schemas` with Zod validators, `middleware`, `utils`). Domain helpers live in `src/utils`, `src/types`, `src/composables`.
- Public static files in `public/`; Electron entry in `electron/src`.

## Build, Test, and Development Commands

- `npm install` (triggers `nuxt prepare`).
- `npm run dev` or `npm run dev:host` to start SPA at :3000 (host exposes LAN).
- `npm run build` builds production bundle; `npm run preview` serves the build.
- `npm run generate` emits static site (used before desktop packaging).
- `npm run electron:dev` runs Nuxt dev plus Electron shell; `npm run electron:build` generates static output and packages the desktop app.

## Coding Style & Naming Conventions

- Prefer `<script setup lang="ts">` for new Vue files; keep options API style when only touching legacy components.
- 2-space indent; PascalCase component files (`ComponentName.vue`); kebab-case routes/pages; camelCase composables/utilities; UPPER_SNAKE env keys.
- Use Composition API + Pinia stores; rely on Nuxt auto-imports for `composables/**`, `utils/**`, `stores/**`.
- Styling via Tailwind plus `src/assets/styles/variables.css`; keep shared tokens in CSS vars; avoid inline magic colors.

## Testing Guidelines

- No automated runner wired; at minimum run `npm run build` and `npm run preview` as smoke before PR.
- When adding tests, place `*.spec.ts` near the feature (e.g., `src/layers/<feature>/tests/`) using Vitest + @vue/test-utils; focus on composables, forms, and critical flows.
- Manual smoke: login, dashboard widgets, fornecedor CRUD, prospecto map, and Electron shell if touched.

## Commit & Pull Request Guidelines

- Commits: short, imperative, Portuguese ok (e.g., `ajusta autenticacao`, `corrige mapa prospectos`); group related changes per commit.
- PRs: add summary, scope/layer touched, screenshots or clips for UI, env vars added/changed, manual test notes; link issues/tasks.
- Keep `.env.example` updated with any new config and never commit real secrets.

## Security & Configuration Tips

- Runtime config reads `.env` (`API_SECRET`, `API_LOGIN`, `API_URL`, `API_URL_HOMOL`, `NUXT_PUBLIC_*`); keep secrets local.
- Dev proxy `/api/v1` targets `api.sagierp.com.br`; do not hardcode URLs in client code; use runtime config or composables.
- Share request/response schemas through `src/server/schemas` and reuse on client to keep Zod validation in sync.
