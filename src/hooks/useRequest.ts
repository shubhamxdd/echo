import { useState } from 'react';
import { fetch } from '@tauri-apps/plugin-http';
import { KeyValueItem, HttpResponse } from '../types';

export function useRequest() {
  const [loading, setLoading] = useState(false);

  const sendRequest = async (
    method: string,
    url: string,
    headers: KeyValueItem[],
    params: KeyValueItem[],
    bodyType: 'none' | 'raw' | 'json' | 'form',
    body: string,
    authType: 'none' | 'bearer' | 'basic' | 'apikey',
    authData: any,
    signal?: AbortSignal
  ): Promise<HttpResponse> => {
    setLoading(true);
    const startTime = performance.now();

    try {
      // 1. Build and clean URL
      let finalUrl = url.trim();
      if (!finalUrl) {
        throw new Error('URL cannot be empty');
      }
      
      if (!/^https?:\/\//i.test(finalUrl)) {
        finalUrl = 'http://' + finalUrl;
      }

      // 2. Append Query Parameters
      try {
        const urlObj = new URL(finalUrl);
        params.forEach((param) => {
          if (param.enabled && param.key) {
            urlObj.searchParams.append(param.key, param.value);
          }
        });
        
        // Handle API Key in Query if configured
        if (authType === 'apikey' && authData?.apikey_addTo === 'query' && authData?.apikey_key) {
          urlObj.searchParams.append(authData.apikey_key, authData.apikey_value || '');
        }
        
        finalUrl = urlObj.toString();
      } catch (e) {
        // Fallback if URL parsing fails: append manually
        const searchParams = new URLSearchParams();
        params.forEach((param) => {
          if (param.enabled && param.key) {
            searchParams.append(param.key, param.value);
          }
        });
        if (authType === 'apikey' && authData?.apikey_addTo === 'query' && authData?.apikey_key) {
          searchParams.append(authData.apikey_key, authData.apikey_value || '');
        }
        const qs = searchParams.toString();
        if (qs) {
          finalUrl += (finalUrl.includes('?') ? '&' : '?') + qs;
        }
      }

      // 3. Build Headers
      const reqHeaders: Record<string, string> = {};
      headers.forEach((header) => {
        if (header.enabled && header.key) {
          reqHeaders[header.key] = header.value;
        }
      });

      // 4. Apply Auth helpers
      if (authType === 'bearer' && authData?.bearer_token) {
        reqHeaders['Authorization'] = `Bearer ${authData.bearer_token}`;
      } else if (authType === 'basic' && (authData?.basic_username || authData?.basic_password)) {
        const username = authData.basic_username || '';
        const password = authData.basic_password || '';
        const encoded = btoa(`${username}:${password}`);
        reqHeaders['Authorization'] = `Basic ${encoded}`;
      } else if (authType === 'apikey' && authData?.apikey_addTo === 'header' && authData?.apikey_key) {
        reqHeaders[authData.apikey_key] = authData.apikey_value || '';
      }

      // 5. Build Request Body
      let requestBody: any = undefined;
      if (method !== 'GET' && method !== 'HEAD') {
        if (bodyType === 'json') {
          requestBody = body;
          if (!reqHeaders['Content-Type']) {
            reqHeaders['Content-Type'] = 'application/json';
          }
        } else if (bodyType === 'raw') {
          requestBody = body;
        } else if (bodyType === 'form') {
          try {
            const formItems = JSON.parse(body) as KeyValueItem[];
            const urlParams = new URLSearchParams();
            formItems.forEach((item) => {
              if (item.enabled && item.key) {
                urlParams.append(item.key, item.value);
              }
            });
            requestBody = urlParams.toString();
            if (!reqHeaders['Content-Type']) {
              reqHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
            }
          } catch (e) {
            requestBody = body; // fallback
          }
        }
      }

      // 6. Send Request
      const response = await fetch(finalUrl, {
        method,
        headers: reqHeaders,
        body: requestBody,
        connectTimeout: 30000, // 30s timeout
        signal,
      });

      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      // Convert response headers
      const resHeaders: KeyValueItem[] = [];
      response.headers.forEach((value, key) => {
        resHeaders.push({ key, value, enabled: true });
      });

      const bodyText = await response.text();

      return {
        status: response.status,
        statusText: response.statusText || 'OK',
        duration_ms: duration,
        headers: resHeaders,
        body: bodyText,
        error: null,
      };
    } catch (err: any) {
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      return {
        status: 0,
        statusText: 'Error',
        duration_ms: duration,
        headers: [],
        body: '',
        error: err?.message || String(err),
      };
    } finally {
      setLoading(false);
    }
  };

  return { sendRequest, loading };
}
