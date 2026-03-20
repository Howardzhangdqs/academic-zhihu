import { ref, watch } from 'vue';
import { GM } from '$';
import { DEFAULT_SETTINGS, STORAGE_KEY } from '../constants/defaults';
import type { UserSettings } from '../types';

const settings = ref<UserSettings>({ ...DEFAULT_SETTINGS });

// Load settings from GM storage asynchronously
GM.getValue(STORAGE_KEY, DEFAULT_SETTINGS).then((stored) => {
  if (stored && typeof stored === 'object') {
    settings.value = { ...DEFAULT_SETTINGS, ...stored };
  }
  console.log('[AZ] settings loaded:', {
    enabled: settings.value.enabled,
    provider: settings.value.apiProvider,
    baseUrl: settings.value.apiBaseUrl,
    hasApiKey: !!settings.value.apiKey,
    model: settings.value.modelName,
    hideMode: settings.value.hideMode,
    batchSize: settings.value.batchSize,
  });
});

let saveTimer: ReturnType<typeof setTimeout> | null = null;

watch(
  settings,
  (newVal) => {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      GM.setValue(STORAGE_KEY, newVal);
    }, 500);
  },
  { deep: true },
);

export function useSettings() {
  function resetToDefaults() {
    settings.value = { ...DEFAULT_SETTINGS };
  }

  return { settings, resetToDefaults };
}
