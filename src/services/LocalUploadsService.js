
// LocalUploadsService.js - IndexedDB based storage for images, videos, and folders
const DB_NAME = 'ImageEditorUploadsDB';
const MEDIA_STORE = 'media_uploads';
const FOLDER_STORE = 'folders';
const DB_VERSION = 3;

class LocalUploadsService {
    async openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = (event) => {
                const error = event.target.error;
                console.error('[IndexedDB] Database open error:', error);
                reject('IndexedDB error: ' + error);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(MEDIA_STORE)) {
                    const mediaStore = db.createObjectStore(MEDIA_STORE, { keyPath: 'id' });
                    mediaStore.createIndex('folderId', 'folderId', { unique: false });
                    mediaStore.createIndex('type', 'type', { unique: false });
                }
                if (!db.objectStoreNames.contains(FOLDER_STORE)) {
                    db.createObjectStore(FOLDER_STORE, { keyPath: 'id' });
                }
            };

            request.onsuccess = (event) => resolve(event.target.result);
        });
    }

    // --- Media Methods ---

    async saveMedia(file, userId, folderId = null) {
        try {
            const db = await this.openDB();
            const id = `media_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            const type = file.type.startsWith('video/') ? 'video' : 'image';
            
            const mediaItem = {
                id,
                userId: userId || 'guest',
                name: file.name,
                blob: file,
                type,
                folderId,
                createdAt: Date.now(),
                isLocal: true
            };

            return new Promise((resolve, reject) => {
                const transaction = db.transaction([MEDIA_STORE], 'readwrite');
                const store = transaction.objectStore(MEDIA_STORE);
                const request = store.add(mediaItem);

                request.onsuccess = () => {
                    resolve({ ...mediaItem, url: URL.createObjectURL(file) });
                };
                request.onerror = (e) => reject(e.target.error);
            });
        } catch (err) {
            console.error('Failed to save media to IndexedDB:', err);
            return null;
        }
    }

    async getMedia(userId, type = null) {
        try {
            const db = await this.openDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([MEDIA_STORE], 'readonly');
                const store = transaction.objectStore(MEDIA_STORE);
                const request = store.getAll();

                request.onsuccess = (event) => {
                    let items = event.target.result;
                    // Filter by userId
                    items = items.filter(i => i.userId === userId || i.userId === 'guest');
                    
                    // Filter by type if provided
                    if (type) {
                        items = items.filter(i => i.type === type);
                    }
                    
                    // Map blobs to URLs
                    const mapped = items.map(i => ({
                        ...i,
                        url: URL.createObjectURL(i.blob)
                    }));
                    
                    resolve(mapped.sort((a, b) => b.createdAt - a.createdAt));
                };

                request.onerror = (e) => reject(e.target.error);
            });
        } catch (err) {
            console.error('Failed to load media from IndexedDB:', err);
            return [];
        }
    }

    async deleteMedia(id) {
        try {
            const db = await this.openDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([MEDIA_STORE], 'readwrite');
                const store = transaction.objectStore(MEDIA_STORE);
                const request = store.delete(id);

                request.onsuccess = () => resolve(true);
                request.onerror = (e) => reject(e.target.error);
            });
        } catch (err) {
            console.error('Failed to delete media from IndexedDB:', err);
            return false;
        }
    }

    // --- Folder Methods ---

    async createFolder(name, userId) {
        try {
            const db = await this.openDB();
            const id = `folder_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            const folder = {
                id,
                name,
                userId: userId || 'guest',
                createdAt: Date.now()
            };

            return new Promise((resolve, reject) => {
                const transaction = db.transaction([FOLDER_STORE], 'readwrite');
                const store = transaction.objectStore(FOLDER_STORE);
                const request = store.add(folder);

                request.onsuccess = () => resolve(folder);
                request.onerror = (e) => reject(e.target.error);
            });
        } catch (err) {
            console.error('Failed to create folder in IndexedDB:', err);
            return null;
        }
    }

    async getFolders(userId) {
        try {
            const db = await this.openDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([FOLDER_STORE], 'readonly');
                const store = transaction.objectStore(FOLDER_STORE);
                const request = store.getAll();

                request.onsuccess = (event) => {
                    const folders = event.target.result;
                    const userFolders = folders.filter(f => f.userId === userId || f.userId === 'guest');
                    resolve(userFolders.sort((a, b) => b.createdAt - a.createdAt));
                };

                request.onerror = (e) => reject(e.target.error);
            });
        } catch (err) {
            console.error('Failed to load folders from IndexedDB:', err);
            return [];
        }
    }

    async deleteFolder(id) {
        try {
            const db = await this.openDB();
            // Also need to unassign media from this folder
            // (In this simple version, we just delete the folder metadata)
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([FOLDER_STORE], 'readwrite');
                const store = transaction.objectStore(FOLDER_STORE);
                const request = store.delete(id);

                request.onsuccess = () => resolve(true);
                request.onerror = (e) => reject(e.target.error);
            });
        } catch (err) {
            console.error('Failed to delete folder from IndexedDB:', err);
            return false;
        }
    }
}

const localUploadsService = new LocalUploadsService();
export default localUploadsService;
