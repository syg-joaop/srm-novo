import { useAuthStore } from "~/stores/auth";

export default defineNuxtPlugin({
  name: "auth",
  async setup() {
    await useAuthStore().initAuth();
  },
});
