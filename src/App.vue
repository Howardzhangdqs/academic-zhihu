<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import FloatingButton from './components/FloatingButton.vue';
import SettingsPanel from './components/SettingsPanel.vue';
import { useSettings } from './composables/useSettings';
import { useFeedObserver } from './composables/useFeedObserver';
import { useClassifier } from './composables/useClassifier';
import type { FeedItem } from './types';

const { settings } = useSettings();
const { classifyItems, clearStyles } = useClassifier();

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

// When hide mode changes, re-clear and re-observe
watch(
  () => settings.value.hideMode,
  () => {
    clearStyles();
    if (settings.value.enabled && settings.value.apiKey) {
      // Reset observer to re-process all items
      stopObserving();
      setTimeout(() => startObserving(), 100);
    }
  },
);
</script>

<template>
  <FloatingButton @toggle="isPanelOpen = !isPanelOpen" />
  <SettingsPanel :visible="isPanelOpen" @close="isPanelOpen = false" />
</template>
