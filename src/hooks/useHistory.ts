import { useState, useCallback } from 'react';
import { getDb } from '../lib/db';
import { HistoryItem } from '../types';

export function useHistory() {
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const db = await getDb();
      const rows = (await db.select(
        'SELECT * FROM history ORDER BY fired_at DESC'
      )) as any[];

      const parsed: HistoryItem[] = rows.map((r) => ({
        id: r.id,
        method: r.method,
        url: r.url,
        status_code: r.status_code,
        duration_ms: r.duration_ms,
        request_headers: JSON.parse(r.request_headers || '[]'),
        request_body: r.request_body || null,
        response_headers: JSON.parse(r.response_headers || '[]'),
        response_body: r.response_body || null,
        error: r.error || null,
        fired_at: r.fired_at,
      }));

      setHistoryList(parsed);
    } catch (error) {
      console.error('Failed to load request history:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addHistoryItem = async (item: Omit<HistoryItem, 'id' | 'fired_at'>) => {
    try {
      const db = await getDb();
      const id = crypto.randomUUID();
      const fired_at = Date.now();

      // Truncate response body to ~1MB if it's too large to save database performance
      let responseBody = item.response_body;
      if (responseBody && responseBody.length > 1024 * 1024) {
        responseBody = responseBody.substring(0, 1024 * 1024) + '\n... [Response Body Truncated to 1MB]';
      }

      await db.execute(
        `INSERT INTO history (id, method, url, status_code, duration_ms, request_headers, request_body, response_headers, response_body, error, fired_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          item.method,
          item.url,
          item.status_code,
          item.duration_ms,
          JSON.stringify(item.request_headers),
          item.request_body,
          JSON.stringify(item.response_headers),
          responseBody,
          item.error,
          fired_at,
        ]
      );

      // Auto-prune to keep only the last 500 entries
      await db.execute(
        `DELETE FROM history WHERE id NOT IN (
          SELECT id FROM history ORDER BY fired_at DESC LIMIT 500
        )`
      );

      await loadHistory();
      return id;
    } catch (error) {
      console.error('Failed to save request to history:', error);
    }
  };

  const clearHistory = async () => {
    try {
      const db = await getDb();
      await db.execute('DELETE FROM history');
      setHistoryList([]);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  };

  const deleteHistoryItem = async (id: string) => {
    try {
      const db = await getDb();
      await db.execute('DELETE FROM history WHERE id = ?', [id]);
      await loadHistory();
    } catch (error) {
      console.error('Failed to delete history item:', error);
    }
  };

  return {
    historyList,
    loading,
    loadHistory,
    addHistoryItem,
    clearHistory,
    deleteHistoryItem,
  };
}
