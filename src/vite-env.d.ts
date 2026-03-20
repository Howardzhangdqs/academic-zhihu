/// <reference types="vite/client" />
/// <reference types="vite-plugin-monkey/client" />
/// <reference types="vite-plugin-monkey/global" />
/// <reference types="vite-plugin-monkey/style" />

declare function GM_xmlhttpRequest(details: {
  method?: string;
  url: string;
  headers?: Record<string, string>;
  data?: string;
  timeout?: number;
  responseType?: string;
  onload?: (response: any) => void;
  onerror?: (error: any) => void;
  ontimeout?: () => void;
  onabort?: () => void;
}): void;
