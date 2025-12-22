# Regras do SRM App

Este documento existe para manter o projeto consistente: estrutura, dependências e padrões de código.

## Arquitetura

- Nuxt 3 em modo SPA (`ssr: false`)
- Organização por feature-first via Nuxt Layers em `src/layers/*`
- Backend-for-frontend (proxy + validação) em `src/server`

## Estrutura de pastas

- `src/layers/<feature>/`
  - `pages/`: rotas da feature
  - `components/`: componentes da feature
  - `composables/`: lógica da feature (opcional)
  - `stores/`: Pinia stores da feature (opcional)
  - `*.types.ts` / `*.helpers.ts`: tipos e helpers da feature (quando fizer sentido)
- `src/components/ui/`: design system (componentes genéricos)
- `src/components/common/`: componentes compartilhados “compostos” (comportamento)
- `src/composables/`: composables compartilhados (não dependem de features)
- `src/stores/`: stores globais (cross-feature)
- `src/utils/` e `src/types/`: utilitários e tipos compartilhados
- `src/server/`: rotas, schemas (Zod), middleware e utils do BFF

## Fronteiras (obrigatório)

Regras de dependência que mantêm o feature-first saudável:

- Código compartilhado (`src/components|src/composables|src/stores|src/utils|src/types|src/layouts|src/plugins|src/server`)
  - não importa nada de `src/layers/*`
- Uma feature (`src/layers/<feature>`)
  - não importa nada de outra feature (`src/layers/<outra>`)

Essas regras são aplicadas automaticamente por ESLint em `.eslintrc.cjs`.

### Imports

- Use `~/` como alias padrão para imports absolutos.
- Dentro de `src/layers/*`, prefira imports relativos (`./` e `../`) para arquivos da própria feature.

## Padrões de código

- Vue: preferir `<script setup lang="ts">` em arquivos novos
- Indentação: 2 espaços
- Componentes: PascalCase (`UiButton.vue`, `UserProfile.vue`)
- Páginas: kebab-case (Nuxt) e em `pages/`
- Composables/utilitários: camelCase (`useAuth`, `formatarMoeda`)

## Autenticação (visão rápida)

- Login via `src/server/api/login.post.ts` (seta cookie HttpOnly `auth_token`)
- Sessão verificada em `src/server/api/session.get.ts`
- Estado no client em `src/stores/auth.ts` (persiste usuário sem token no `localStorage`)
- Proteção de rotas no client em `src/middleware/auth.global.ts`

## BFF / API

- `src/utils/api.ts`:
  - `useAuthApi()` chama endpoints internos em `/api/*`
  - `useMainApi()` chama proxy em `/api/v2` e `/api/v2-homol`
- `src/server/utils/api-client.ts` cria `$fetch` com `Authorization` (cookie) e `x-secret` (runtimeConfig)

## Como criar uma nova feature (layer)

1. Crie `src/layers/nova-feature/` com o mínimo necessário (comece por `pages/`)
2. Adicione `src/layers/nova-feature/nuxt.config.ts`
3. Registre o layer no `nuxt.config.ts` (campo `extends`)
4. Se algo começar a ser usado por mais de uma feature, extraia para `src/components/ui`, `src/utils` ou `src/composables`

## Qualidade / revisão

- Antes de enviar: `npm run lint` + `npm run format:check`
- Smoke manual sugerido: login, painel (widgets + gráficos), fornecedores (lista + mapa), prospectos (mapa) e Electron se tiver alterado desktop
