# SRM App — Sistema de Relacionamento com Fornecedores

SPA em Nuxt 3 (`ssr: false`) organizada em feature-first via Nuxt Layers.

## Comandos

```bash
npm install
npm run dev

npm run build
npm run preview

npm run electron:dev
npm run electron:build

npm run lint
npm run lint:fix
npm run format
npm run format:check
```

## Estrutura

- `src/layers/<feature>`: páginas e lógica por feature (Nuxt Layer)
- `src/components/ui`: design system compartilhado
- `src/components/common`: componentes compartilhados com comportamento
- `src/composables`, `src/stores`, `src/utils`, `src/types`: base compartilhada
- `src/server`: backend-for-frontend (proxy/rotas/schemas)

## Fronteiras (ESLint)

- compartilhado não importa `src/layers/*`
- feature não importa outra feature
- dentro de `src/layers/*`, prefira imports relativos; use `~/` para shared

## Configuração

- copie `.env.example` para `.env` e ajuste `API_*` e `NUXT_PUBLIC_*`

## Docs

- `regras-srm.MD`
