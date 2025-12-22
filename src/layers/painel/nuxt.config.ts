export default defineNuxtConfig({
  routeRules: {
    "/painel": {
      cache: {
        maxAge: 600,
      },
    },
  },
});
