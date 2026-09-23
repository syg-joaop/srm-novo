# Repository Guidelines

## Estrutura

- App Vue 3 + Vite + TypeScript, 100% client-side (sem backend). Entrada em `src/main.ts` / `src/App.vue`.
- Dados de referência em `src/data` (perfis de medicações e regras de interação). Lógica pura em `src/lib` (modelo farmacocinético, datas).
- Estado persistido em `src/store.ts` (localStorage `medtempo:v1`); navegação/modais em `src/ui.ts`.
- Telas em `src/views`, componentes reutilizáveis em `src/components`. Tokens de tema e animações globais em `src/styles.css`.

## Comandos

- `npm run dev` (ou `dev:host`), `npm test` (Vitest), `npm run build` (vue-tsc + vite build), `npm run preview`.

## Estilo

- `<script setup lang="ts">`, 2 espaços, componentes em PascalCase, nomes de domínio em português.
- Cores via variáveis CSS em `styles.css` (tema claro/escuro); cores por medicação vêm dos dados.
- Animações devem respeitar `prefers-reduced-motion` (já tratado globalmente).

## Testes

- Specs `*.spec.ts` ao lado do código (ex.: `src/lib/farmaco.spec.ts`). Ao mexer no modelo PK ou nas regras de interação, atualize/adicione testes.
- Antes de subir: `npm test` e `npm run build`.

## Conteúdo médico

- Valores da biblioteca são aproximações de bula e literatura; mantenha o aviso de que não substitui orientação médica.
