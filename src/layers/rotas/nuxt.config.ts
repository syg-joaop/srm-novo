import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const currentDir = dirname(fileURLToPath(import.meta.url));

export default defineNuxtConfig({
  imports: {
    dirs: ["composables/**", "utils/**"],
  },
  hooks: {
    "pages:extend"(pages) {
      pages.push({
        name: "rotas",
        path: "/rotas",
        file: resolve(currentDir, "pages/index.vue"),
      });
    },
  },
});
