const FEATURES = [
  "login",
  "painel",
  "fornecedores",
  "equipe",
  "concorrentes",
  "prospectos",
  "ocorrencias",
  "rotas",
  "checkin",
];

const crossFeatureZones = FEATURES.flatMap((targetFeature) =>
  FEATURES.filter((fromFeature) => fromFeature !== targetFeature).map((fromFeature) => ({
    target: `./src/layers/${targetFeature}`,
    from: `./src/layers/${fromFeature}`,
    message:
      `Evite importar de outra feature (${fromFeature}). ` +
      "Se for algo compartilhável, extraia para src/components, src/utils ou src/composables.",
  })),
);

module.exports = {
  root: true,

  env: {
    browser: true,
    node: true,
    es2022: true,
  },

  // Não precisamos mais definir globals manualmente!
  // O TypeScript já conhece todos os auto-imports do Nuxt através de .nuxt/tsconfig.json
  // O parser do TypeScript no ESLint vai usar essas informações automaticamente
  globals: {
    // Apenas globals do ambiente que não são cobertos pelo TypeScript
    // Os auto-imports do Nuxt (Vue, composables, utils, etc.) são reconhecidos
    // automaticamente através do tsconfig.json que estende .nuxt/tsconfig.json
  },

  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "@typescript-eslint/parser",
    ecmaVersion: 2022,
    sourceType: "module",
    extraFileExtensions: [".vue"],
  },

  plugins: ["vue", "@typescript-eslint", "import"],

  extends: [
    "eslint:recommended",
    "plugin:vue/vue3-essential",
    "plugin:@typescript-eslint/recommended",
    "prettier",
    "plugin:storybook/recommended"
  ],

  rules: {
    // no-undef será desabilitado apenas para arquivos TypeScript/Vue nos overrides
    // Para arquivos JS, mantemos a verificação padrão

    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        ignoreRestSiblings: true,
      },
    ],

    "vue/multi-word-component-names": "off",
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-debugger": "error",

    "import/no-restricted-paths": [
      "error",
      {
        zones: [
          {
            target: "./src/components",
            from: "./src/layers",
            message: "Componentes compartilhados não devem importar de features (src/layers/*).",
          },
          {
            target: "./src/composables",
            from: "./src/layers",
            message: "Composables compartilhados não devem importar de features (src/layers/*).",
          },
          {
            target: "./src/stores",
            from: "./src/layers",
            message: "Stores globais não devem importar de features (src/layers/*).",
          },
          {
            target: "./src/utils",
            from: "./src/layers",
            message: "Utils compartilhados não devem importar de features (src/layers/*).",
          },
          {
            target: "./src/types",
            from: "./src/layers",
            message: "Types compartilhados não devem importar de features (src/layers/*).",
          },
          {
            target: "./src/layouts",
            from: "./src/layers",
            message: "Layouts não devem importar direto de features (src/layers/*).",
          },
          {
            target: "./src/plugins",
            from: "./src/layers",
            message: "Plugins não devem importar direto de features (src/layers/*).",
          },
          {
            target: "./src/middleware",
            from: "./src/layers",
            message: "Middleware não deve importar direto de features (src/layers/*).",
          },
          {
            target: "./src/server",
            from: "./src/layers",
            message: "Código de server não deve importar de features (src/layers/*).",
          },
          ...crossFeatureZones,
        ],
      },
    ],
  },

  overrides: [
    {
      // Para arquivos TypeScript e Vue, desabilita no-undef
      // O TypeScript já faz essa verificação e conhece todos os auto-imports do Nuxt
      // através do tsconfig.json que estende .nuxt/tsconfig.json
      files: ["**/*.{ts,vue}"],
      rules: {
        "no-undef": "off",
      },
    },
    {
      // Para arquivos JavaScript puros (.js, .cjs), ainda precisamos de no-undef
      // já que não têm verificação de tipos do TypeScript
      files: ["**/*.{js,cjs,mjs}"],
      rules: {
        "no-undef": "error",
      },
    },
    {
      files: ["src/layers/**/*.{ts,vue}"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: ["~/layers/**", "@/layers/**"],
                message:
                  "Dentro de um layer, prefira imports relativos e não dependa de outras features.",
              },
            ],
          },
        ],
      },
    },
    {
      files: [
        "src/components/**/*.{ts,vue}",
        "src/composables/**/*.{ts,vue}",
        "src/stores/**/*.{ts,vue}",
        "src/utils/**/*.{ts,vue}",
        "src/types/**/*.{ts,vue}",
        "src/layouts/**/*.{ts,vue}",
        "src/plugins/**/*.{ts,vue}",
        "src/middleware/**/*.{ts,vue}",
        "src/server/**/*.{ts,vue}",
        "src/app.vue",
      ],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: ["~/layers/**", "@/layers/**"],
                message: "Código compartilhado não deve importar de src/layers/*.",
              },
            ],
          },
        ],
      },
    },
  ],
};
