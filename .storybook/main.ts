import type { StorybookConfig } from '@storybook/vue3-vite';
import { mergeConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding"
  ],
  "framework": "@storybook/vue3-vite",
  async viteFinal(config) {
    return mergeConfig(config, {
      plugins: [
        vue(),
        AutoImport({
          imports: [
            'vue',
            {
              'vue': [
                'ref',
                'computed',
                'watch',
                'watchEffect',
                'onMounted',
                'onUnmounted',
                'onBeforeUnmount',
                'nextTick',
                'reactive',
                'toRef',
                'toRefs',
                'defineProps',
                'defineEmits',
                'defineOptions',
                'withDefaults',
              ]
            }
          ],
          vueTemplate: true,
          dts: false,
        }),
      ],
      resolve: {
        alias: {
          '~': path.resolve(__dirname, '../src'),
          '@': path.resolve(__dirname, '../src'),
        },
      },
      define: {
        'import.meta.client': 'true',
        'import.meta.server': 'false',
      },
    });
  },
};
export default config;
