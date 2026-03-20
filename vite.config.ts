import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import monkey, { cdn } from 'vite-plugin-monkey';

export default defineConfig({
  plugins: [
    vue(),
    monkey({
      entry: 'src/main.ts',
      userscript: {
        icon: 'https://vitejs.dev/logo.svg',
        name: 'Academic Zhihu Filter',
        namespace: 'academic-zhihu',
        description: '使用 LLM 自动识别并隐藏知乎上的非学术内容',
        version: '0.1.0',
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
      },
      build: {
        externalGlobals: {
          vue: cdn.jsdelivr('Vue', 'dist/vue.global.prod.js'),
        },
      },
    }),
  ],
});
