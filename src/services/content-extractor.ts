import { SELECTORS } from '../constants/defaults';
import type { FeedItem } from '../types';

export function extractFeedItem(element: HTMLElement): FeedItem | null {
  try {
    let itemId = '';
    let authorName = '';

    const zopStr = element.getAttribute('data-zop');
    if (zopStr) {
      const zop = JSON.parse(zopStr);
      itemId = String(zop.itemId || '');
      authorName = String(zop.authorName || '');
    }

    if (!itemId) {
      itemId = `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }

    const titleEl = element.querySelector(SELECTORS.titleLink);
    const title = titleEl?.textContent?.trim() || '';
    const url = (titleEl as HTMLAnchorElement)?.href || '';

    const richContent = element.querySelector(SELECTORS.richContent);
    const excerpt = richContent?.textContent?.trim() || '';

    const isArticle = element.classList.contains('ArticleItem');
    const type: FeedItem['type'] = isArticle ? 'article' : 'answer';

    if (!title && !excerpt) return null;

    return { element, itemId, title, excerpt, authorName, type, url };
  } catch {
    return null;
  }
}
