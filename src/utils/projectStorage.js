
// projectStorage.js - IndexedDB based storage for large projects
const DB_NAME = 'ImageConverterDB';
const STORE_NAME = 'projects';
const DB_VERSION = 1;

/**
 * Open IndexedDB database
 */
const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => reject('IndexedDB error: ' + event.target.error);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };

        request.onsuccess = (event) => resolve(event.target.result);
    });
};

/**
 * Save project state to IndexedDB
 * @param {string} projectId 
 * @param {Object} state 
 */
export const saveProjectToDB = async (projectId, state) => {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            // Clean/Sanitize before saving if needed, similar to storage utils
            const record = {
                id: projectId,
                data: state,
                updatedAt: Date.now()
            };

            const request = store.put(record);

            request.onsuccess = () => {
                // Trigger localStorage for cross-tab sync
                // We only store a timestamp to notify other tabs
                localStorage.setItem(`project_update_${projectId}`, Date.now().toString());
                resolve(true);
            };

            request.onerror = (e) => reject(e.target.error);
        });
    } catch (err) {
        console.error('Failed to save to IndexedDB:', err);
    }
};

/**
 * Load project state from IndexedDB
 * @param {string} projectId 
 */
export const loadProjectFromDB = async (projectId) => {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(projectId);

            request.onsuccess = (event) => {
                const result = event.target.result;
                resolve(result ? result.data : null);
            };

            request.onerror = (e) => reject(e.target.error);
        });
    } catch (err) {
        console.error('Failed to load from IndexedDB:', err);
        return null;
    }
};
