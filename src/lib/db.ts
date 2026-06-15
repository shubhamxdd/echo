import Database from '@tauri-apps/plugin-sql';

let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (!dbInstance) {
    dbInstance = await Database.load('sqlite:echo.db');
  }
  return dbInstance;
}

export async function initDb(): Promise<void> {
  try {
    const db = await getDb();
    
    // Enable foreign keys for cascading deletes
    await db.execute('PRAGMA foreign_keys = ON;');

    // 1. Create collections table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS collections (
        id          TEXT PRIMARY KEY,
        name        TEXT NOT NULL,
        description TEXT,
        parent_id   TEXT REFERENCES collections(id) ON DELETE CASCADE,
        created_at  INTEGER NOT NULL,
        updated_at  INTEGER NOT NULL
      );
    `);

    // 2. Create requests table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS requests (
        id            TEXT PRIMARY KEY,
        collection_id TEXT REFERENCES collections(id) ON DELETE CASCADE,
        name          TEXT NOT NULL,
        method        TEXT NOT NULL,
        url           TEXT NOT NULL,
        headers       TEXT,
        params        TEXT,
        body_type     TEXT,
        body          TEXT,
        auth_type     TEXT,
        auth_data     TEXT,
        created_at    INTEGER NOT NULL,
        updated_at    INTEGER NOT NULL
      );
    `);

    // 3. Create history table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS history (
        id               TEXT PRIMARY KEY,
        method           TEXT NOT NULL,
        url              TEXT NOT NULL,
        status_code      INTEGER,
        duration_ms      INTEGER,
        request_headers  TEXT,
        request_body     TEXT,
        response_headers TEXT,
        response_body    TEXT,
        error            TEXT,
        fired_at         INTEGER NOT NULL
      );
    `);

    console.log('Database initialized successfully with schema');
  } catch (error) {
    console.error('Failed to initialize database schema:', error);
    throw error;
  }
}
