import type { UserSettings } from '../types';

export const SELECTORS = {
  feedContainer: '.Topstory-recommend',
  feedCard: '.Card.TopstoryItem',
  contentItem: '.ContentItem',
  answerItem: '.ContentItem.AnswerItem',
  articleItem: '.ContentItem.ArticleItem',
  titleLink: 'h2.ContentItem-title a',
  richContent: '.RichContent-inner',
} as const;

export const DEFAULT_SETTINGS: UserSettings = {
  enabled: true,
  apiProvider: 'openai-compatible',
  apiBaseUrl: 'https://api.openai.com/v1/chat/completions',
  apiKey: '',
  modelName: 'gpt-4o-mini',
  systemPrompt: `你是一个学术内容判断助手。请判断以下知乎内容是否为学术内容。

学术内容的判断标准：
- 涉及科学、技术、工程、数学、医学、计算机科学、机器学习、大语言模型等学术领域

一旦涉及以下话题都不能被视作学术内容：
- 中医

请以JSON格式返回结果，格式如下：
{"results": [{"item_id": "...", "is_academic": true/false}]}`,
  hideMode: 'dim',
  batchSize: 5,
  customHeaders: '',
  customBody: '',
};

export const STORAGE_KEY = 'academic-zhihu-settings';
