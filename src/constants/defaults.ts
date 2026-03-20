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
  apiBaseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  modelName: 'gpt-4o-mini',
  systemPrompt: `你是一个学术内容判断助手。请判断以下知乎内容是否为学术内容。

学术内容的判断标准：
- 涉及科学、技术、工程、数学、医学、人文社科等学术领域
- 内容具有一定的专业性和深度
- 可能包含学术论文、研究方法、数据分析、实验结果等

非学术内容包括但不限于：
- 情感倾诉、生活琐事
- 纯娱乐、八卦内容
- 广告营销内容
- 没有实质信息的闲聊

请以JSON格式返回结果，格式如下：
{"results": [{"n": 1, "is_academic": true/false}, ...]}`,
  hideMode: 'dim',
  batchSize: 5,
  customHeaders: '',
  customBody: '',
};

export const STORAGE_KEY = 'academic-zhihu-settings';
