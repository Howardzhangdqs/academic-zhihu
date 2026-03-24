import { ref } from 'vue';
import { GM } from '$';
import { classifyBatch } from '../services/llm-client';
import { useSettings } from './useSettings';
import { SELECTORS } from '../constants/defaults';
import type { FeedItem, ClassificationResult, ItemStatus } from '../types';

// Inject global CSS for hiding items (runs once at module load)
GM.addStyle(`
  .azh-dimmed {
    opacity: 0.2 !important;
    transition: opacity 0.3s linear !important;
    filter: grayscale(50%) !important;
  }
  .azh-dimmed:hover {
    opacity: 1 !important;
    filter: none !important;
  }
  .azh-collapsed {
    max-height: 48px !important;
    overflow: hidden !important;
  }
  .azh-collapsed:hover {
    max-height: none !important;
  }
  .azh-loading {
    border-left: 3px solid #999 !important;
  }
`);

export function useClassifier() {
  const { settings } = useSettings();
  const itemStatusMap = ref<Map<string, ItemStatus>>(new Map());
  const isProcessing = ref(false);
  const pendingQueue: FeedItem[] = [];
  const stats = ref({ academic: 0, nonAcademic: 0 });

  function getCard(feedElement: HTMLElement): HTMLElement | null {
    return feedElement.closest(SELECTORS.feedCard);
  }

  function applyClassification(item: FeedItem, result: ClassificationResult) {
    if (!settings.value.enabled) return;

    const card = getCard(item.element);
    if (!card) return;

    card.classList.remove('azh-loading');

    if (result.isAcademic) {
      stats.value.academic++;
      card.setAttribute('data-azh', 'academic');
    } else {
      stats.value.nonAcademic++;
      const mode = settings.value.hideMode;
      if (mode === 'dim' || mode === 'both') card.classList.add('azh-dimmed');
      if (mode === 'collapse' || mode === 'both') card.classList.add('azh-collapsed');
      card.setAttribute('data-azh', 'non-academic');
    }
  }

  async function classifyItems(items: FeedItem[]) {
    console.log('[AZ] classifyItems called, items:', items.length, 'apiKey:', !!settings.value.apiKey, 'processing:', isProcessing.value);
    if (!settings.value.apiKey) {
      console.log('[AZ] no API key, skipping');
      return;
    }

    pendingQueue.push(...items);
    if (isProcessing.value) {
      console.log('[AZ] already processing, queued:', pendingQueue.length);
      return;
    }

    while (pendingQueue.length > 0) {
      isProcessing.value = true;
      const currentItems = pendingQueue.splice(0);

      currentItems.forEach((item) => {
        itemStatusMap.value.set(item.itemId, 'loading');
        const card = getCard(item.element);
        card?.classList.add('azh-loading');
        card?.setAttribute('data-azh', 'processing');
      });

      try {
        const batchSize = settings.value.batchSize;
        for (let i = 0; i < currentItems.length; i += batchSize) {
          const batch = currentItems.slice(i, i + batchSize);
          console.log(`[AZ] sending batch ${Math.floor(i / batchSize) + 1}, size: ${batch.length}`);
          const results = await classifyBatch(batch, settings.value);
          console.log('[AZ] batch result:', results);

          results.forEach((result) => {
            itemStatusMap.value.set(result.itemId, 'classified');
            const item = batch.find((b) => b.itemId === result.itemId);
            if (item) applyClassification(item, result);
          });
        }
      } catch (err) {
        console.error('[AZ] classification error:', err);
        currentItems.forEach((item) => {
          if (itemStatusMap.value.get(item.itemId) === 'loading') {
            itemStatusMap.value.set(item.itemId, 'error');
            const card = getCard(item.element);
            card?.classList.remove('azh-loading');
            card?.setAttribute('data-azh', 'error');
          }
        });
      }
    }
    isProcessing.value = false;
  }

  function clearStyles() {
    document.querySelectorAll('[data-azh]').forEach((el) => {
      el.classList.remove('azh-dimmed', 'azh-collapsed', 'azh-loading');
      el.removeAttribute('data-azh');
    });
    itemStatusMap.value.clear();
    stats.value = { academic: 0, nonAcademic: 0 };
  }

  return { classifyItems, itemStatusMap, isProcessing, stats, clearStyles };
}
