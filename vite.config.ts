import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import monkey, { cdn } from 'vite-plugin-monkey';

export default defineConfig({
  plugins: [
    vue(),
    monkey({
      entry: 'src/main.ts',
      userscript: {
        icon: 'https://static.zhihu.com/heifetz/favicon.ico',
        name: '知乎过滤器',
        namespace: 'academic-zhihu',
        description: '让你的知乎变得更学术',
        version: '0.1.1',
        match: ['https://www.zhihu.com'],
        connect: [
          'api.openai.com',
          'api.anthropic.com',
          'open.bigmodel.cn',
          'openrouter.ai',
          'api.deepseek.com',
          '*',
        ],
        grant: ['GM_xmlhttpRequest', 'GM_getValue', 'GM_setValue', 'GM_addStyle'],
        'run-at': 'document-idle',
        license: 'MIT',
      },
      build: {
        externalGlobals: {
          vue: cdn.jsdelivr('Vue', 'dist/vue.global.prod.js'),
        },
      },
    }),
  ],
});
