// IndexedDB Persistence Utility for Yusuf Property ERP System
// Provides high-capacity client-side database storage (hundreds of MB/GB capacity)
// Replaces localStorage limits with asynchronous IndexedDB transactions

const DB_NAME = 'YusufProperty_ERP_DB';
const DB_VERSION = 1;
const STORE_NAME = 'erp_kv_store';

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB is not supported in this browser environment.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event: Event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onerror = (event: Event) => {
      console.error('IndexedDB Error:', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });

  return dbPromise;
}

export async function idbGet<T>(key: string): Promise<T | null> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);

      req.onsuccess = () => {
        resolve(req.result !== undefined ? (req.result as T) : null);
      };

      req.onerror = () => {
        reject(req.error);
      };
    });
  } catch (error) {
    console.error(`Error reading key "${key}" from IndexedDB:`, error);
    return null;
  }
}

export async function idbSet<T>(key: string, value: T): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (error) {
    console.error(`Error writing key "${key}" to IndexedDB:`, error);
  }
}

export async function idbRemove(key: string): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (error) {
    console.error(`Error removing key "${key}" from IndexedDB:`, error);
  }
}

export async function idbGetAllKeys(): Promise<string[]> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAllKeys();

      req.onsuccess = () => resolve((req.result as string[]) || []);
      req.onerror = () => reject(req.error);
    });
  } catch (error) {
    console.error('Error getting all keys from IndexedDB:', error);
    return [];
  }
}

// Seamless migration from old localStorage data to IndexedDB
export async function migrateLocalStorageToIndexedDB(): Promise<boolean> {
  try {
    const keysToMigrate = [
      'yp_erp_users',
      'yp_erp_current_user',
      'yp_erp_projects',
      'yp_erp_units',
      'yp_erp_sales',
      'yp_erp_construction',
      'yp_erp_finances',
      'yp_erp_customers',
      'yp_erp_materials',
      'yp_erp_material_usages',
      'yp_erp_progress_docs',
      'yp_erp_attendance',
      'yp_erp_prospects',
    ];

    let migratedAny = false;
    for (const key of keysToMigrate) {
      const existingInIdb = await idbGet(key);
      const lsValue = localStorage.getItem(key);

      if (!existingInIdb && lsValue) {
        try {
          const parsed = JSON.parse(lsValue);
          await idbSet(key, parsed);
          migratedAny = true;
        } catch (e) {
          console.warn(`Failed to parse localStorage key ${key}:`, e);
        }
      }
    }
    return migratedAny;
  } catch (err) {
    console.error('Migration error:', err);
    return false;
  }
}

// Export entire IndexedDB database to JSON file for backup or cross-device sync
export async function exportDatabaseToJson(): Promise<string> {
  const keys = await idbGetAllKeys();
  const dump: Record<string, any> = {};

  for (const k of keys) {
    dump[k] = await idbGet(k);
  }

  return JSON.stringify(
    {
      appName: 'Yusuf Property ERP System',
      exportedAt: new Date().toISOString(),
      version: '1.0',
      data: dump,
    },
    null,
    2
  );
}

// Import entire JSON backup into IndexedDB database
export async function importDatabaseFromJson(jsonString: string): Promise<boolean> {
  try {
    const parsed = JSON.parse(jsonString);
    const data = parsed.data || parsed;

    if (typeof data === 'object' && data !== null) {
      for (const [key, val] of Object.entries(data)) {
        await idbSet(key, val);
      }
      return true;
    }
    return false;
  } catch (err) {
    console.error('Failed to import database from JSON:', err);
    return false;
  }
}
