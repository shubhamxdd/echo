import { useState, useCallback } from 'react';
import { getDb } from '../lib/db';
import { Collection, SavedRequest } from '../types';

export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCollections = useCallback(async () => {
    setLoading(true);
    try {
      const db = await getDb();

      // Load all collections
      const rawCols = (await db.select(
        'SELECT * FROM collections ORDER BY created_at DESC'
      )) as any[];

      // Load all saved requests
      const rawReqs = (await db.select(
        'SELECT * FROM requests ORDER BY created_at DESC'
      )) as any[];

      // Map requests with parsed JSON strings
      const parsedReqs: SavedRequest[] = rawReqs.map((r) => ({
        id: r.id,
        collection_id: r.collection_id,
        name: r.name,
        method: r.method,
        url: r.url,
        headers: JSON.parse(r.headers || '[]'),
        params: JSON.parse(r.params || '[]'),
        body_type: r.body_type,
        body: r.body || '',
        auth_type: r.auth_type || 'none',
        auth_data: JSON.parse(r.auth_data || '{}'),
        created_at: r.created_at,
        updated_at: r.updated_at,
      }));

      // Construct tree structure
      const colMap = new Map<string, Collection>();
      
      rawCols.forEach((c) => {
        colMap.set(c.id, {
          id: c.id,
          name: c.name,
          description: c.description || null,
          parent_id: c.parent_id || null,
          created_at: c.created_at,
          updated_at: c.updated_at,
          children: [],
          requests: [],
        });
      });

      // Distribute requests to their respective collections
      parsedReqs.forEach((req) => {
        const col = colMap.get(req.collection_id);
        if (col) {
          col.requests?.push(req);
        }
      });

      // Distribute child collections to parents, and identify root nodes
      const rootCols: Collection[] = [];
      
      colMap.forEach((col) => {
        if (col.parent_id) {
          const parent = colMap.get(col.parent_id);
          if (parent) {
            parent.children?.push(col);
          } else {
            // If parent_id doesn't match an active collection, treat as root
            rootCols.push(col);
          }
        } else {
          rootCols.push(col);
        }
      });

      // Sort collections/requests by name or creation date for cleaner display
      const sortTree = (cols: Collection[]) => {
        cols.sort((a, b) => a.name.localeCompare(b.name));
        cols.forEach((c) => {
          if (c.children) sortTree(c.children);
          c.requests?.sort((a, b) => a.name.localeCompare(b.name));
        });
      };
      
      sortTree(rootCols);
      setCollections(rootCols);
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCollection = async (
    name: string,
    description: string | null = null,
    parentId: string | null = null
  ) => {
    try {
      const db = await getDb();
      const id = crypto.randomUUID();
      const now = Date.now();

      await db.execute(
        `INSERT INTO collections (id, name, description, parent_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, name, description, parentId, now, now]
      );

      await loadCollections();
      return id;
    } catch (error) {
      console.error('Failed to create collection:', error);
      throw error;
    }
  };

  const updateCollection = async (id: string, name: string, description: string | null = null) => {
    try {
      const db = await getDb();
      const now = Date.now();

      await db.execute(
        `UPDATE collections SET name = ?, description = ?, updated_at = ? WHERE id = ?`,
        [name, description, now, id]
      );

      await loadCollections();
    } catch (error) {
      console.error('Failed to update collection:', error);
      throw error;
    }
  };

  const deleteCollection = async (id: string) => {
    try {
      const db = await getDb();
      // SQLite CASCADE handles requests and child collections deletion
      await db.execute('DELETE FROM collections WHERE id = ?', [id]);
      await loadCollections();
    } catch (error) {
      console.error('Failed to delete collection:', error);
      throw error;
    }
  };

  const saveRequest = async (request: Omit<SavedRequest, 'created_at' | 'updated_at'>) => {
    try {
      const db = await getDb();
      const now = Date.now();

      // Check if request exists
      const existing = (await db.select('SELECT id FROM requests WHERE id = ?', [request.id])) as any[];

      if (existing.length > 0) {
        // Update
        await db.execute(
          `UPDATE requests 
           SET collection_id = ?, name = ?, method = ?, url = ?, headers = ?, params = ?, body_type = ?, body = ?, auth_type = ?, auth_data = ?, updated_at = ?
           WHERE id = ?`,
          [
            request.collection_id,
            request.name,
            request.method,
            request.url,
            JSON.stringify(request.headers),
            JSON.stringify(request.params),
            request.body_type,
            request.body,
            request.auth_type,
            JSON.stringify(request.auth_data),
            now,
            request.id,
          ]
        );
      } else {
        // Insert
        await db.execute(
          `INSERT INTO requests (id, collection_id, name, method, url, headers, params, body_type, body, auth_type, auth_data, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            request.id,
            request.collection_id,
            request.name,
            request.method,
            request.url,
            JSON.stringify(request.headers),
            JSON.stringify(request.params),
            request.body_type,
            request.body,
            request.auth_type,
            JSON.stringify(request.auth_data),
            now,
            now,
          ]
        );
      }

      await loadCollections();
    } catch (error) {
      console.error('Failed to save request:', error);
      throw error;
    }
  };

  const deleteRequest = async (id: string) => {
    try {
      const db = await getDb();
      await db.execute('DELETE FROM requests WHERE id = ?', [id]);
      await loadCollections();
    } catch (error) {
      console.error('Failed to delete request:', error);
      throw error;
    }
  };

  return {
    collections,
    loading,
    loadCollections,
    createCollection,
    updateCollection,
    deleteCollection,
    saveRequest,
    deleteRequest,
  };
}
