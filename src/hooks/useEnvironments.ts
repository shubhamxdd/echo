import { useState, useCallback } from 'react';
import { getDb } from '../lib/db';
import { Environment, KeyValueItem } from '../types';

export function useEnvironments() {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [loading, setLoading] = useState(false);

  const loadEnvironments = useCallback(async () => {
    setLoading(true);
    try {
      const db = await getDb();
      const rows = (await db.select(
        'SELECT * FROM environments ORDER BY created_at DESC'
      )) as any[];

      const parsed: Environment[] = rows.map((r) => ({
        id: r.id,
        name: r.name,
        variables: JSON.parse(r.variables || '[]'),
        created_at: r.created_at,
        updated_at: r.updated_at,
      }));

      setEnvironments(parsed);
    } catch (error) {
      console.error('Failed to load environments:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createEnvironment = async (name: string, variables: KeyValueItem[]) => {
    try {
      const db = await getDb();
      const id = crypto.randomUUID();
      const now = Date.now();

      await db.execute(
        `INSERT INTO environments (id, name, variables, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`,
        [id, name, JSON.stringify(variables), now, now]
      );

      await loadEnvironments();
      return id;
    } catch (error) {
      console.error('Failed to create environment:', error);
      throw error;
    }
  };

  const updateEnvironment = async (id: string, name: string, variables: KeyValueItem[]) => {
    try {
      const db = await getDb();
      const now = Date.now();

      await db.execute(
        `UPDATE environments SET name = ?, variables = ?, updated_at = ? WHERE id = ?`,
        [name, JSON.stringify(variables), now, id]
      );

      await loadEnvironments();
    } catch (error) {
      console.error('Failed to update environment:', error);
      throw error;
    }
  };

  const deleteEnvironment = async (id: string) => {
    try {
      const db = await getDb();
      await db.execute('DELETE FROM environments WHERE id = ?', [id]);
      await loadEnvironments();
    } catch (error) {
      console.error('Failed to delete environment:', error);
      throw error;
    }
  };

  return {
    environments,
    loading,
    loadEnvironments,
    createEnvironment,
    updateEnvironment,
    deleteEnvironment,
  };
}
