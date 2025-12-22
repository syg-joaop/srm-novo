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
        name: "ocorrencias",
        path: "/ocorrencias",
        file: resolve(currentDir, "pages/index.vue"),
      });
    },
  },
});
