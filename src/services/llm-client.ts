/* eslint-disable @typescript-eslint/no-explicit-any */
import type { UserSettings, FeedItem, ClassificationResult } from '../types';

function buildUserPrompt(items: FeedItem[]): string {
  const list = items.map((item, i) => ({
    n: i + 1,
    title: item.title,
    excerpt: item.excerpt.substring(0, 300),
    author: item.authorName,
    type: item.type,
  }));
  return JSON.stringify(list, null, 2);
}

function parseLlmResponse(raw: string, items: FeedItem[]): ClassificationResult[] {
  let jsonStr = raw;
  const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) jsonStr = codeBlockMatch[1].trim();

  function mapResults(list: Record<string, unknown>[]): ClassificationResult[] {
    return list.map((r) => {
      const n = Number(r.n ?? r.item_id ?? 0);
      return {
        itemId: n > 0 && n <= items.length ? items[n - 1].itemId : String(r.item_id ?? ''),
        isAcademic: Boolean(r.is_academic),
        confidence: 1,
        reason: '',
      };
    });
  }

  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed.results && Array.isArray(parsed.results)) {
      return mapResults(parsed.results);
    }
  } catch {
    const arrayMatch = jsonStr.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        return mapResults(JSON.parse(arrayMatch[0]));
      } catch {
        // fall through
      }
    }
  }
  throw new Error('Failed to parse LLM response as JSON: ' + raw.substring(0, 200));
}

function gmRequest(details: {
  method: string;
  url: string;
  headers: Record<string, string>;
  data: string;
}): Promise<{ status: number; responseText: string; statusText?: string }> {
  return new Promise((resolve, reject) => {
    console.log('[AZ] gmRequest sending to:', details.url);
    console.log('[AZ] GM_xmlhttpRequest available:', typeof GM_xmlhttpRequest);
    try {
      // Use global GM_xmlhttpRequest directly for maximum compatibility
      GM_xmlhttpRequest({
        method: details.method,
        url: details.url,
        headers: details.headers,
        data: details.data,
        timeout: 60000,
        onload: function (response: any) {
          console.log('[AZ] gmRequest onload, status:', response.status);
          resolve({
            status: response.status,
            responseText: response.responseText || '',
            statusText: response.statusText,
          });
        },
        onerror: function (error: any) {
          console.error('[AZ] gmRequest onerror:', error);
          reject(new Error('GM request error: ' + JSON.stringify(error)));
        },
        ontimeout: function () {
          console.error('[AZ] gmRequest timeout after 60s, URL:', details.url);
          // Fallback: try fetch as last resort
          console.log('[AZ] trying fetch fallback...');
          fetch(details.url, {
            method: details.method,
            headers: details.headers,
            body: details.data,
          })
            .then(async (r) => {
              const text = await r.text();
              console.log('[AZ] fetch fallback got status:', r.status);
              resolve({ status: r.status, responseText: text });
            })
            .catch((e) => {
              console.error('[AZ] fetch fallback also failed:', e);
              reject(new Error('Request timeout after 60s (fetch fallback also failed: ' + e.message + ')'));
            });
        },
        onabort: function () {
          console.error('[AZ] gmRequest aborted');
          reject(new Error('Request aborted'));
        },
      });
    } catch (e) {
      console.error('[AZ] gmRequest threw:', e);
      reject(e);
    }
  });
}

function buildOpenAIUrl(baseUrl: string): string {
  const base = baseUrl.replace(/\/+$/, '');
  // If user already included the full path, use it as-is
  if (base.endsWith('/chat/completions')) return base;
  // Otherwise append the standard path
  return base + '/chat/completions';
}

function buildAnthropicUrl(baseUrl: string): string {
  const base = baseUrl.replace(/\/+$/, '');
  if (base.endsWith('/messages')) return base;
  return base + '/messages';
}

function mergeHeaders(defaults: Record<string, string>, customJson: string): Record<string, string> {
  if (!customJson?.trim()) return defaults;
  try {
    const custom = JSON.parse(customJson);
    return { ...defaults, ...custom };
  } catch {
    console.warn('[AZ] invalid custom headers JSON, using defaults');
    return defaults;
  }
}

function mergeBody(defaults: Record<string, unknown>, customJson: string): string {
  if (!customJson?.trim()) return JSON.stringify(defaults);
  try {
    const custom = JSON.parse(customJson);
    return JSON.stringify({ ...defaults, ...custom }, null, 2);
  } catch {
    console.warn('[AZ] invalid custom body JSON, using defaults');
    return JSON.stringify(defaults);
  }
}

async function callOpenAI(settings: UserSettings, userMessage: string): Promise<string> {
  const url = buildOpenAIUrl(settings.apiBaseUrl);
  console.log('[AZ] calling OpenAI API:', url);
  const headers = mergeHeaders(
    { 'Content-Type': 'application/json', Authorization: `Bearer ${settings.apiKey}` },
    settings.customHeaders,
  );
  const defaultBody = {
    model: settings.modelName,
    messages: [
      { role: 'system', content: settings.systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.1,
  };
  const data = mergeBody(defaultBody, settings.customBody);
  console.log('[AZ] OpenAI request body:', JSON.parse(data));
  const response = await gmRequest({ method: 'POST', url, headers, data });

  console.log('[AZ] OpenAI response status:', response.status, 'body:', response.responseText);

  if (response.status !== 200) {
    let body: any;
    try { body = JSON.parse(response.responseText); } catch { body = {}; }
    throw new Error(`OpenAI API error ${response.status}: ${JSON.stringify(body?.error ?? response.statusText)}`);
  }

  const body = JSON.parse(response.responseText) as { choices: Array<{ message: { content: string } }> };
  return body.choices[0].message.content;
}

async function callAnthropic(settings: UserSettings, userMessage: string): Promise<string> {
  const url = buildAnthropicUrl(settings.apiBaseUrl);
  console.log('[AZ] calling Anthropic API:', url);
  const headers = mergeHeaders(
    { 'Content-Type': 'application/json', 'x-api-key': settings.apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
    settings.customHeaders,
  );
  const defaultBody = {
    model: settings.modelName,
    max_tokens: 2048,
    system: settings.systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  };
  const data = mergeBody(defaultBody, settings.customBody);
  console.log('[AZ] Anthropic request body:', JSON.parse(data));
  const response = await gmRequest({ method: 'POST', url, headers, data });

  console.log('[AZ] Anthropic response status:', response.status, 'body:', response.responseText);

  if (response.status !== 200) {
    let body: any;
    try { body = JSON.parse(response.responseText); } catch { body = {}; }
    throw new Error(`Anthropic API error ${response.status}: ${JSON.stringify(body?.error ?? response.statusText)}`);
  }

  const body = JSON.parse(response.responseText) as { content: Array<{ text: string }> };
  return body.content?.[0]?.text ?? '';
}

export async function testConnection(settings: UserSettings): Promise<{ ok: boolean; message: string }> {
  const testSettings: UserSettings = {
    ...settings,
    systemPrompt: 'You are a test assistant. Reply with exactly: OK',
  };
  try {
    let reply: string;
    if (testSettings.apiProvider === 'anthropic') {
      reply = await callAnthropic(testSettings, 'Reply with exactly: OK');
    } else {
      reply = await callOpenAI(testSettings, 'Reply with exactly: OK');
    }
    const trimmed = reply?.trim() ?? '';
    return { ok: true, message: `连接成功！模型返回: ${trimmed.substring(0, 100)}` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, message: `连接失败: ${msg}` };
  }
}

export async function classifyBatch(
  items: FeedItem[],
  settings: UserSettings,
): Promise<ClassificationResult[]> {
  const userMessage = buildUserPrompt(items);
  console.log('[AZ] classifyBatch, provider:', settings.apiProvider, 'model:', settings.modelName, 'url:', settings.apiBaseUrl);
  console.log('[AZ] user prompt length:', userMessage.length);
  let rawResponse: string;

  try {
    if (settings.apiProvider === 'anthropic') {
      rawResponse = await callAnthropic(settings, userMessage);
    } else {
      rawResponse = await callOpenAI(settings, userMessage);
    }
    console.log('[AZ] LLM response:', rawResponse);
  } catch (err) {
    console.error('[AZ] LLM API call failed:', err);
    throw err;
  }

  try {
    const results = parseLlmResponse(rawResponse, items);
    console.log('[AZ] parsed results:', results);
    return results;
  } catch (err) {
    console.error('[AZ] parse response failed:', err);
    throw err;
  }
}
