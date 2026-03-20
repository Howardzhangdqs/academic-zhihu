export type ApiProvider = 'openai-compatible' | 'anthropic';

export interface UserSettings {
  enabled: boolean;
  apiProvider: ApiProvider;
  apiBaseUrl: string;
  apiKey: string;
  modelName: string;
  systemPrompt: string;
  hideMode: 'dim' | 'collapse';
  batchSize: number;
  customHeaders: string;
  customBody: string;
}

export interface FeedItem {
  element: HTMLElement;
  itemId: string;
  title: string;
  excerpt: string;
  authorName: string;
  type: 'answer' | 'article';
  url: string;
}

export interface ClassificationResult {
  itemId: string;
  isAcademic: boolean;
  confidence: number;
  reason: string;
}

export type ItemStatus = 'pending' | 'loading' | 'classified' | 'error';
