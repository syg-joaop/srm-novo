export default defineNuxtConfig({
  ssr: false,

  srcDir: "src/",

  extends: [
    "./src/layers/login",
    "./src/layers/painel",
    "./src/layers/fornecedores",
    "./src/layers/equipe",
    "./src/layers/concorrentes",
    "./src/layers/prospectos",
    "./src/layers/ocorrencias",
    "./src/layers/rotas",
    "./src/layers/checkin",
  ],

  // DevTools não agregam no modo SPA e adicionam ruído no bundle.
  devtools: { enabled: false },

  modules: ["@pinia/nuxt", "@nuxt/image", "nuxt-typed-router"],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  sourcemap: {
    server: false,
    client: false,
  },

  experimental: {
    payloadExtraction: false,
  },

  css: [
    "~/assets/styles/variables.css",
    "~/assets/styles/base.css",
    "~/assets/styles/tailwind.css",
  ],

  imports: {
    dirs: ["composables/**", "utils/**", "stores/**"],
  },

  typescript: {
    strict: false,
    typeCheck: false,
  },

  runtimeConfig: {
    apiSecret: process.env.API_SECRET,
    apiBaseUrl: process.env.API_LOGIN,
    apiV2Url: process.env.API_URL,
    apiV2UrlHomol: process.env.API_URL_HOMOL,
    public: {
      apiBaseUrl: process.env.API_LOGIN ?? "",
      // Usa NUXT_PUBLIC_API_SECRET se disponível, senão usa API_SECRET como fallback
      apiSecret: process.env.NUXT_PUBLIC_API_SECRET ?? process.env.API_SECRET ?? "",
      apiV2Url: process.env.API_URL ?? "",
      apiV2UrlHomol: process.env.API_URL_HOMOL ?? "",
      appName: process.env.NUXT_PUBLIC_APP_NAME ?? "SRM App",
      appVersion: process.env.NUXT_PUBLIC_APP_VERSION ?? "0.0.0",
      supportChatUrl: process.env.NUXT_PUBLIC_SUPPORT_CHAT_URL ?? "",
      vrpApiUrl: process.env.NUXT_PUBLIC_VRP_API_URL ?? "",
      vrpApiKey: process.env.NUXT_PUBLIC_VRP_API_KEY ?? "",
    },
  },

  app: {
    baseURL: "/",
    buildAssetsDir: "/_nuxt/",
    head: {
      title: "SRM App",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content: "Sistema de Relacionamento com Fornecedores",
        },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },

  compatibilityDate: "2024-11-27",

  vite: {
    esbuild: {
      target: "es2020",
    },
    optimizeDeps: {
      esbuildOptions: {
        target: "es2020",
      },
      exclude: ["tailwindcss"],
    },
    ssr: {
      noExternal: ["tailwindcss"],
    },
  },

  nitro: {
    esbuild: {
      options: {
        target: "es2020",
      },
    },
    devProxy: {
      "/api/v1": {
        target: "https://api.sagierp.com.br/api/v1",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
