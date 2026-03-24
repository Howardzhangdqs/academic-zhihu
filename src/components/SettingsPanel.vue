<template>
  <div v-if="visible" class="azh-overlay" @click.self="$emit('close')">
    <div class="azh-panel">
      <div class="azh-panel-header">
        <h3>Academic Zhihu Filter</h3>
        <button class="azh-close-btn" @click="$emit('close')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div class="azh-panel-body">
        <label class="azh-row">
          <span>启用过滤</span>
          <input type="checkbox" v-model="localSettings.enabled" />
        </label>

        <div v-if="!localSettings.apiKey" class="azh-hint">
          请先配置 API Key 才能使用过滤功能
        </div>

        <label class="azh-row">
          <span>API 提供商</span>
          <select v-model="localSettings.apiProvider" @change="onProviderChange">
            <option value="openai-compatible">OpenAI Compatible</option>
            <option value="anthropic">Anthropic</option>
          </select>
        </label>

        <label class="azh-row">
          <span>Base URL</span>
          <input type="text" v-model="localSettings.apiBaseUrl" placeholder="https://api.openai.com/v1" />
        </label>

        <label class="azh-row">
          <span>API Key</span>
          <input type="password" v-model="localSettings.apiKey" placeholder="sk-..." />
        </label>

        <label class="azh-row">
          <span>模型</span>
          <input type="text" v-model="localSettings.modelName" placeholder="gpt-4o-mini" />
        </label>

        <div class="azh-field">
          <span>系统提示词</span>
          <textarea v-model="localSettings.systemPrompt" rows="8" />
        </div>

        <div class="azh-row">
          <span>隐藏模式</span>
          <div class="azh-toggle-group">
            <button type="button" class="azh-toggle-btn"
              :class="{ 'azh-toggle-btn--active': localSettings.hideMode === 'dim' }"
              @click="localSettings.hideMode = 'dim'">
              颜色变淡
            </button>
            <button type="button" class="azh-toggle-btn"
              :class="{ 'azh-toggle-btn--active': localSettings.hideMode === 'collapse' }"
              @click="localSettings.hideMode = 'collapse'">
              折叠
            </button>
            <button type="button" class="azh-toggle-btn"
              :class="{ 'azh-toggle-btn--active': localSettings.hideMode === 'both' }"
              @click="localSettings.hideMode = 'both'">
              折叠+变淡
            </button>
          </div>
        </div>

        <label class="azh-row">
          <span>批量大小</span>
          <input type="number" v-model.number="localSettings.batchSize" min="1" max="10" />
        </label>

        <div class="azh-field">
          <span>自定义请求头 <span class="azh-optional">(可选)</span></span>
          <textarea v-model="localSettings.customHeaders" rows="4" placeholder='{"X-Custom-Header": "value"}' />
        </div>

        <div class="azh-field">
          <span>自定义请求体 <span class="azh-optional">(可选)</span></span>
          <textarea v-model="localSettings.customBody" rows="4" placeholder='{"temperature": 0.3}' />
        </div>
      </div>

      <div class="azh-panel-footer">
        <button class="azh-btn azh-btn--secondary" :disabled="testing" @click="onTest">
          {{ testing ? '测试中...' : '测试连通' }}
        </button>
        <span v-if="testResult" class="azh-test-result" :class="testResult.ok ? 'azh-test-ok' : 'azh-test-fail'">
          {{ testResult.message }}
        </span>
        <button class="azh-btn azh-btn--secondary" @click="onReset">重置默认</button>
        <button class="azh-btn azh-btn--primary" @click="onSave">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { useSettings } from '../composables/useSettings';
import { DEFAULT_SETTINGS } from '../constants/defaults';
import { testConnection } from '../services/llm-client';
import type { ApiProvider, UserSettings } from '../types';

const props = defineProps<{ visible: boolean }>();
const emit = defineEmits<{ close: [] }>();

const { settings, resetToDefaults } = useSettings();

const localSettings = reactive<UserSettings>({ ...settings.value });

watch(
  () => props.visible,
  (v) => {
    if (v) Object.assign(localSettings, settings.value);
  },
);

const PROVIDER_DEFAULTS: Record<ApiProvider, string> = {
  'openai-compatible': 'https://api.openai.com/v1/chat/completions',
  anthropic: 'https://api.anthropic.com/v1',
};

function onProviderChange() {
  localSettings.apiBaseUrl = PROVIDER_DEFAULTS[localSettings.apiProvider];
}

function onSave() {
  Object.assign(settings.value, { ...localSettings });
  emit('close');
}

function onReset() {
  Object.assign(localSettings, DEFAULT_SETTINGS);
  resetToDefaults();
}

const testing = ref(false);
const testResult = ref<{ ok: boolean; message: string } | null>(null);

async function onTest() {
  testing.value = true;
  testResult.value = null;
  const result = await testConnection({ ...localSettings });
  testResult.value = result;
  testing.value = false;
}
</script>

<style scoped>
.azh-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.azh-panel {
  background: #fff;
  border-radius: 12px;
  width: 520px;
  max-width: 90vw;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.azh-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e8e8e8;
}

.azh-panel-header h3 {
  margin: 0;
  font-size: 16px;
  color: #1a1a1a;
  font-weight: 600;
}

.azh-close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #8590a6;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.15s;
  all: initial;
  font-family: inherit;
}

.azh-close-btn:hover {
  color: #1a1a1a;
  background: #f6f6f6;
}

.azh-panel-body {
  padding: 16px 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.azh-hint {
  background: #fff8e6;
  border: 1px solid #f5d380;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 13px;
  color: #8a6d3b;
}

.azh-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
  color: #333;
}

.azh-row span {
  flex-shrink: 0;
  width: 90px;
  color: #1a1a1a;
  font-size: 14px;
}

.azh-row input[type='text'],
.azh-row input[type='password'],
.azh-row input[type='number'],
.azh-row select {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  color: #1a1a1a;
  background: #fff;
  font-family: inherit;
  all: initial;
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  color: #1a1a1a;
  background: #fff;
  font-family: inherit;
  box-sizing: border-box;
}

.azh-row input:focus,
.azh-row select:focus {
  border-color: #175199;
  box-shadow: 0 0 0 2px rgba(23, 81, 153, 0.1);
}

.azh-row input[type='checkbox'] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #175199;
  all: initial;
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #175199;
}

.azh-field>span:first-child {
  font-size: 14px;
  color: #1a1a1a;
}

.azh-optional {
  font-size: 12px;
  color: #999;
  font-weight: normal;
}

.azh-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
  color: #1a1a1a;
}

.azh-field textarea {
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 13px;
  font-family: 'SF Mono', 'Consolas', monospace;
  resize: vertical;
  outline: none;
  color: #1a1a1a;
  background: #fff;
  line-height: 1.5;
  all: initial;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 13px;
  font-family: 'SF Mono', 'Consolas', monospace;
  resize: vertical;
  outline: none;
  color: #1a1a1a;
  background: #fff;
  line-height: 1.5;
  display: block;
  box-sizing: border-box;
}

.azh-field textarea:focus {
  border-color: #175199;
  box-shadow: 0 0 0 2px rgba(23, 81, 153, 0.1);
}

.azh-toggle-group {
  display: flex;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.azh-toggle-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  font-size: 13px;
  color: #666;
  background: #fff;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
  box-sizing: border-box;
  border-right: 1px solid #e0e0e0;
}

.azh-toggle-btn:last-child {
  border-right: none;
}

.azh-toggle-btn:hover {
  background: #f6f6f6;
}

.azh-toggle-btn--active {
  background: #175199;
  color: #fff;
}

.azh-toggle-btn--active:hover {
  background: #1a5cb0;
}

.azh-panel-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid #e8e8e8;
}

.azh-test-result {
  font-size: 13px;
  flex: 1;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.azh-test-ok {
  color: #52c41a;
}

.azh-test-fail {
  color: #ff4d4f;
}

.azh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.azh-btn {
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: all 0.15s;
  font-weight: 500;
  all: initial;
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  box-sizing: border-box;
}

.azh-btn--primary {
  background: #175199;
  color: #fff;
}

.azh-btn--primary:hover {
  background: #1a5cb0;
}

.azh-btn--secondary {
  background: #f6f6f6;
  color: #666;
}

.azh-btn--secondary:hover {
  background: #ebebeb;
}
</style>
