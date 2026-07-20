/**
 * Thin promise-based wrapper around IndexedDB.
 *
 * IndexedDB is our "mock backend": it persists across page reloads, lives
 * entirely in the browser (so the app works on a static host with zero infra),
 * and — unlike localStorage — can store binary Blobs, which we need for the PDF
 * bytes.
 *
 * Two object stores:
 *   - `nodes`: folder/file metadata, keyed by `id`, indexed by `parentId` so we
 *     can list a folder's children cheaply.
 *   - `blobs`: the raw PDF bytes, keyed by `blobId`. Kept separate from metadata
 *     so listing a folder never has to pull megabytes of file data into memory.
 */

export const DB_NAME = "dataroom";
export const DB_VERSION = 1;
export const NODES_STORE = "nodes";
export const BLOBS_STORE = "blobs";
export const PARENT_INDEX = "parentId";

let dbPromise: Promise<IDBDatabase> | null = null;

/** Opens (and lazily caches) the IndexedDB connection. */
export function openDB(): Promise<IDBDatabase> {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("IndexedDB is only available in the browser"),
    );
  }
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(NODES_STORE)) {
        const nodes = db.createObjectStore(NODES_STORE, { keyPath: "id" });
        nodes.createIndex(PARENT_INDEX, "parentId", { unique: false });
      }
      if (!db.objectStoreNames.contains(BLOBS_STORE)) {
        db.createObjectStore(BLOBS_STORE, { keyPath: "blobId" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

/**
 * Runs a single read request and resolves with its result. The success handler
 * is attached synchronously to the request (before it can fire), which is why
 * reads must go through this helper rather than pulling the request out of a
 * transaction and awaiting it later — by then `onsuccess` has already run.
 */
export function readRequest<T>(
  storeName: string,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(storeName, "readonly");
        const request = fn(tx.objectStore(storeName));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }),
  );
}

/** Runs `fn` inside a transaction and resolves once the transaction commits. */
export function withStore<T>(
  storeNames: string | string[],
  mode: IDBTransactionMode,
  fn: (getStore: (name: string) => IDBObjectStore) => T,
): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(storeNames, mode);
        let result: T;
        tx.oncomplete = () => resolve(result);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
        try {
          result = fn((name) => tx.objectStore(name));
        } catch (err) {
          tx.abort();
          reject(err);
        }
      }),
  );
}
