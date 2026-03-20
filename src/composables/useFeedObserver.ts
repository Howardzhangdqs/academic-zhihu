import type { FeedItem } from '../types';
import { SELECTORS } from '../constants/defaults';
import { extractFeedItem } from '../services/content-extractor';

export function useFeedObserver(onNewItems: (items: FeedItem[]) => void, isEnabled: () => boolean) {
  let observer: MutationObserver | null = null;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let pollingTimer: ReturnType<typeof setInterval> | null = null;

  function isProcessed(card: Element): boolean {
    return card.hasAttribute('data-azh');
  }

  function scanFeedItems(): FeedItem[] {
    const container = document.querySelector(SELECTORS.feedContainer);
    if (!container) return [];

    const cards = container.querySelectorAll(SELECTORS.feedCard);
    const newItems: FeedItem[] = [];

    cards.forEach((card) => {
      if (isProcessed(card)) return;
      const el = card.querySelector(SELECTORS.contentItem) as HTMLElement | null;
      if (!el) return;
      const item = extractFeedItem(el);
      if (item) newItems.push(item);
    });

    return newItems;
  }

  function handleMutation() {
    if (!isEnabled()) return;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const items = scanFeedItems();
      if (items.length > 0) {
        console.log('[AZ] new items detected:', items.map(i => i.title));
        onNewItems(items);
      }
    }, 300);
  }

  function startObserving() {
    console.log('[AZ] starting feed observer...');
    const tryStart = () => {
      const container = document.querySelector(SELECTORS.feedContainer);
      if (container) {
        const initialItems = scanFeedItems();
        console.log('[AZ] feed container found, initial items:', initialItems.length);
        if (initialItems.length > 0) {
          console.log('[AZ] initial items:', initialItems.map(i => i.title));
          onNewItems(initialItems);
        }

        observer = new MutationObserver(handleMutation);
        observer.observe(container, { childList: true, subtree: true });
        console.log('[AZ] mutation observer attached');

        pollingTimer = setInterval(() => {
          if (!isEnabled()) return;
          const items = scanFeedItems();
          if (items.length > 0) {
            console.log('[AZ] poll: caught missed items:', items.length);
            onNewItems(items);
          }
        }, 3000);
      } else {
        console.log('[AZ] feed container not found, retrying in 1s...');
        setTimeout(tryStart, 1000);
      }
    };
    tryStart();
  }

  function stopObserving() {
    observer?.disconnect();
    observer = null;
    if (debounceTimer) clearTimeout(debounceTimer);
    if (pollingTimer) clearInterval(pollingTimer);
  }

  return { startObserving, stopObserving };
}
