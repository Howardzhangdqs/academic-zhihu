# Academic Zhihu - 知乎过滤器

> 让你的知乎变得更学术。使用大语言模型（LLM）自动识别和过滤知乎信息流中的非学术内容，帮你聚焦真正有价值的学术讨论。

## 功能特性

- **智能分类** — 通过大语言模型对知乎首页信息流中的问题和回答进行学术/非学术内容分类
- **灵活过滤** — 支持三种隐藏模式：颜色变淡、折叠、折叠+变淡，鼠标悬停即可恢复查看
- **自定义提示词** — 可编辑系统提示词，定义你自己的"学术"标准
- **多模型支持** — 支持 OpenAI Compatible 和 Anthropic 接口，兼容 DeepSeek、智谱 GLM、OpenRouter 等
- **高级配置** — 支持自定义请求头和请求体，满足各种 API 代理需求
- **一键测试** — 内置连通性测试，快速验证 API 是否可用
- **批量处理** — 可配置批量大小（1-10 条/次），平衡 API 成本与响应速度

## 安装

### 从 GreasyFork 安装

在 [GreasyFork](https://greasyfork.org/zh-CN/scripts/570917) 页面点击安装，需要先安装 [Tampermonkey](https://www.tampermonkey.net/) 浏览器扩展。

### 从源码安装

```bash
# 安装依赖
bun install

# 构建
bun run build
```

构建产物位于 `dist/academic-zhihu.user.js`，将其安装到 Tampermonkey 即可。

## 使用方法

1. 安装脚本后打开 [知乎首页](https://www.zhihu.com)
2. 点击左下角悬浮按钮打开设置面板
3. 填入你的 API Key（支持 OpenAI Compatible 和 Anthropic Compatible 接口）
4. 根据需要调整提示词和过滤模式
5. 保存设置后，脚本将自动过滤信息流中的非学术内容

## 开发

```bash
bun install
bun run dev
```

启动 Vite 开发服务器，支持 HMR 热更新。

## 技术栈

| 项目 | 技术 |
|------|------|
| 语言 | TypeScript (strict) |
| 框架 | Vue 3 (Composition API) |
| 构建 | Vite 8 + vite-plugin-monkey |
| 类型检查 | vue-tsc |
| 包管理 | Bun |

## 项目结构

```
src/
├── main.ts                    # 入口，创建 Vue 应用并挂载到 DOM
├── App.vue                    # 根组件，整合设置、监听和分类逻辑
├── components/
│   ├── FloatingButton.vue     # 左下角悬浮按钮
│   └── SettingsPanel.vue      # 设置面板（API 配置、提示词、过滤模式等）
├── composables/
│   ├── useSettings.ts         # 响应式设置，持久化到 GM 存储
│   ├── useFeedObserver.ts     # MutationObserver 监听信息流变化
│   └── useClassifier.ts       # 分类调度：队列管理、批量请求、应用样式
├── services/
│   ├── content-extractor.ts   # 从 DOM 提取标题、摘要、作者等信息
│   └── llm-client.ts          # LLM API 客户端（GM_xmlhttpRequest）
├── constants/
│   └── defaults.ts            # 知乎 DOM 选择器、默认设置
└── types/
    └── index.ts               # TypeScript 类型定义
```

## 隐私说明

- 你的 API Key 仅存储在浏览器本地（油猴 GM 存储），不会上传到任何第三方服务器
- 脚本仅将知乎信息流中的标题和摘要文本发送到你配置的 LLM API 进行分类，不发送任何其他数据

## License

[MIT](./LICENSE)
