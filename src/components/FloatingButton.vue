<template>
  <div class="azh-float-btn" :class="{ 'azh-float-btn--warning': !hasApiKey }" @click="$emit('toggle')">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useSettings } from '../composables/useSettings';

defineEmits<{ toggle: [] }>();

const { settings } = useSettings();
const hasApiKey = computed(() => !!settings.value.apiKey);

// Move the button to <body> directly to escape any ancestor
// with transform/filter/perspective that breaks position:fixed
onMounted(() => {
  const btn = document.querySelector('.azh-float-btn') as HTMLElement;
  if (btn && btn.parentElement !== document.body) {
    document.body.appendChild(btn);
  }
});
</script>

<style>
.azh-float-btn {
  position: fixed !important;
  bottom: 28px !important;
  left: 28px !important;
  top: auto !important;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #175199;
  color: #fff;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  z-index: 2147483647 !important;
  box-shadow: 0 2px 12px rgba(23, 81, 153, 0.35);
  transition: background 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: visible;
}

.azh-float-btn:hover {
  background: #1a5cb0 !important;
  box-shadow: 0 4px 16px rgba(23, 81, 153, 0.45) !important;
}

.azh-float-btn--warning {
  background: #cf8e17 !important;
  box-shadow: 0 2px 12px rgba(207, 142, 23, 0.35) !important;
}

.azh-float-btn--warning:hover {
  background: #b87d14 !important;
  box-shadow: 0 4px 16px rgba(207, 142, 23, 0.45) !important;
}
</style>
