const DB_NAME = 'dard-e-munasif-db';
const DB_VERSION = 1;
const HISTORY_STORE = 'history';
const DOWNLOADS_STORE = 'downloads';

export interface HistoryEntry {
  id: string;
  title: string;
  category: string;
  timestamp: number;
}

export interface DownloadEntry {
  id: string;
  title: string;
  category: string;
  blob: Blob;
}

let dbInstance: IDBDatabase | null = null;

export async function initDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(HISTORY_STORE)) {
        const historyStore = db.createObjectStore(HISTORY_STORE, { keyPath: 'id', autoIncrement: false });
        historyStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      if (!db.objectStoreNames.contains(DOWNLOADS_STORE)) {
        db.createObjectStore(DOWNLOADS_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error('IndexedDB error:', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

export async function addToHistory(entry: HistoryEntry): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(HISTORY_STORE, 'readwrite');
    const store = tx.objectStore(HISTORY_STORE);
    // Use composite key: category_originalId_timestamp to allow re-opening same post
    const uniqueEntry = { ...entry, id: `${entry.category}_${entry.id}_${entry.timestamp}` };
    const request = store.put(uniqueEntry);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getHistory(): Promise<HistoryEntry[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(HISTORY_STORE, 'readonly');
    const store = tx.objectStore(HISTORY_STORE);
    const index = store.index('timestamp');
    const request = index.openCursor(null, 'prev');
    const results: HistoryEntry[] = [];

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor && results.length < 50) {
        results.push(cursor.value as HistoryEntry);
        cursor.continue();
      } else {
        resolve(results);
      }
    };

    request.onerror = () => reject(request.error);
  });
}

export async function addToDownloads(entry: DownloadEntry): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DOWNLOADS_STORE, 'readwrite');
    const store = tx.objectStore(DOWNLOADS_STORE);
    const request = store.put(entry);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getDownloads(): Promise<DownloadEntry[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DOWNLOADS_STORE, 'readonly');
    const store = tx.objectStore(DOWNLOADS_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as DownloadEntry[]);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteFromDownloads(id: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DOWNLOADS_STORE, 'readwrite');
    const store = tx.objectStore(DOWNLOADS_STORE);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export function getBlobURL(blob: Blob): string {
  return URL.createObjectURL(blob);
}
