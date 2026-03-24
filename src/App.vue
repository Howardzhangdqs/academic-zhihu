<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import FloatingButton from './components/FloatingButton.vue';
import SettingsPanel from './components/SettingsPanel.vue';
import { useSettings } from './composables/useSettings';
import { useFeedObserver } from './composables/useFeedObserver';
import { useClassifier } from './composables/useClassifier';
import type { FeedItem } from './types';

const { settings } = useSettings();
const { classifyItems } = useClassifier();

const isPanelOpen = ref(false);

function handleNewItems(items: FeedItem[]) {
  classifyItems(items);
}

const { startObserving, stopObserving } = useFeedObserver(handleNewItems, () => settings.value.enabled);

onMounted(() => {
  console.log('[AZ] mounted, settings:', { enabled: settings.value.enabled, apiKey: !!settings.value.apiKey, provider: settings.value.apiProvider });
  if (settings.value.enabled && settings.value.apiKey) {
    startObserving();
  }
});

watch(
  () => [settings.value.enabled, settings.value.apiKey],
  ([enabled, apiKey]) => {
    console.log('[AZ] settings changed:', { enabled, hasKey: !!apiKey });
    if (enabled && apiKey) {
      startObserving();
    } else {
      stopObserving();
    }
  },
);

// When hide mode changes, only swap CSS classes without re-classifying
watch(
  () => settings.value.hideMode,
  (newMode) => {
    document.querySelectorAll('[data-azh]').forEach((el) => {
      el.classList.remove('azh-dimmed', 'azh-collapsed');
      if (el.getAttribute('data-azh') === 'non-academic') {
        if (newMode === 'dim' || newMode === 'both') el.classList.add('azh-dimmed');
        if (newMode === 'collapse' || newMode === 'both') el.classList.add('azh-collapsed');
      }
    });
  },
);
</script>

<template>
  <FloatingButton @toggle="isPanelOpen = !isPanelOpen" />
  <SettingsPanel :visible="isPanelOpen" @close="isPanelOpen = false" />
</template>
