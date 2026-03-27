
// LocalRecordingsService.js - IndexedDB based storage for audio recordings
const DB_NAME = 'StudioProRecordingsDB';
const STORE_NAME = 'audio_recordings';
const DB_VERSION = 3;

class LocalRecordingsService {
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
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
            };

            request.onsuccess = (event) => resolve(event.target.result);
        });
    }

    async saveRecording(blob, userId, name = null, duration = 0) {
        try {
            const db = await this.openDB();
            const id = `local_${Date.now()}`;
            const recording = {
                id,
                userId,
                name: name || `Local Recording ${new Date().toLocaleString()}`,
                blob,
                duration: duration || 0, // Store duration in seconds
                createdAt: Date.now(),
                isLocal: true
            };

            return new Promise((resolve, reject) => {
                const transaction = db.transaction([STORE_NAME], 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.add(recording);

                request.onsuccess = () => {
                    // Return with a temporary URL for immediate UI update
                    resolve({ ...recording, url: URL.createObjectURL(blob) });
                };
                request.onerror = (e) => reject(e.target.error);
            });
        } catch (err) {
            console.error('Failed to save recording to IndexedDB:', err);
            return null;
        }
    }

    async getRecordings(userId) {
        try {
            const db = await this.openDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([STORE_NAME], 'readonly');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.getAll();

                request.onsuccess = (event) => {
                    const all = event.target.result;
                    // Filter by userId if provided
                    const userRecordings = userId 
                        ? all.filter(r => r.userId === userId || r.userId === 'guest')
                        : all;
                    
                    // Map blobs to URLs to ensure they are playable
                    const mapped = userRecordings.map(r => ({
                        ...r,
                        url: URL.createObjectURL(r.blob)
                    }));
                    
                    resolve(mapped.sort((a, b) => b.createdAt - a.createdAt));
                };

                request.onerror = (e) => reject(e.target.error);
            });
        } catch (err) {
            console.error('Failed to load recordings from IndexedDB:', err);
            return [];
        }
    }

    async deleteRecording(id) {
        try {
            const db = await this.openDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([STORE_NAME], 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.delete(id);

                request.onsuccess = () => resolve(true);
                request.onerror = (e) => reject(e.target.error);
            });
        } catch (err) {
            console.error('Failed to delete recording from IndexedDB:', err);
            return false;
        }
    }

    async clearAllRecordings() {
        try {
            const db = await this.openDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([STORE_NAME], 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.clear();

                request.onsuccess = () => {
                    console.log('>>> All local recordings cleared from IndexedDB');
                    resolve(true);
                };
                request.onerror = (e) => reject(e.target.error);
            });
        } catch (err) {
            console.error('Failed to clear recordings from IndexedDB:', err);
            return false;
        }
    }
}

const localRecordingsService = new LocalRecordingsService();
export default localRecordingsService;
