import { db, storage } from './firebase';
import {
    doc,
    setDoc,
    getDoc,
    onSnapshot,
    collection,
    addDoc,
    serverTimestamp,
    query,
    where,
    orderBy,
    getDocs,
    deleteDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

class FirebaseSyncService {
    constructor() {
        this.unsubscribe = null;
    }

    /**
     * Create a new design document in Firestore
     * @param {Object} initialState - Initial design state
     * @returns {Promise<string>} - The new design ID
     */
    async createDesign(initialState, userId = null) {
        try {
            const docRef = await addDoc(collection(db, 'designs'), {
                ...initialState,
                ownerId: userId,
                accessLevel: 'private', // Default to private
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                version: 1
            });
            return docRef.id;
        } catch (error) {
            console.error('Error creating design:', error);
            throw error;
        }
    }

    /**
     * Save/Update design state in Firestore
     * @param {string} designId 
     * @param {Object} state 
     */
    async updateDesign(designId, state) {
        if (!designId) return;
        try {
            const docRef = doc(db, 'designs', designId);
            await setDoc(docRef, {
                ...state,
                updatedAt: serverTimestamp(),
                version: (state.version || 0) + 1
            }, { merge: true });
        } catch (error) {
            console.error('Error saving design state:', error);
        }
    }

    /**
     * Load design state once
     * @param {string} designId 
     */
    async getDesign(designId) {
        if (!designId) return null;
        try {
            const docRef = doc(db, 'designs', designId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return docSnap.data();
            }
            return null;
        } catch (error) {
            console.error('Error getting design:', error);
            return null;
        }
    }

    /**
     * Listen for real-time changes to a design
     * @param {string} designId 
     * @param {Function} callback 
     * @returns {Function} - Unsubscribe function
     */
    initSync(designId, callback) {
        if (!designId) return null;

        const docRef = doc(db, 'designs', designId);
        const unsubscribe = onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                callback(doc.data());
            }
        }, (error) => {
            console.error('Firestore Subscribe Error:', error);
        });

        return unsubscribe;
    }

    stopSync(unsub) {
        if (unsub && typeof unsub === 'function') {
            unsub();
        }
    }

    /**
     * Get all designs owned by a user
     * @param {string} userId - User's UID
     * @returns {Promise<Array>} - Array of user's designs
     */
    async getUserDesigns(userId) {
        if (!userId) return [];
        try {
            const designsRef = collection(db, 'designs');
            const q = query(
                designsRef,
                where('ownerId', '==', userId),
                orderBy('updatedAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            const designs = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();

                // Extract thumbnail from background layer of first page
                let thumbnail = data.thumbnail || null;
                if (!thumbnail && data.pages && data.pages.length > 0) {
                    const firstPage = data.pages[0];
                    if (firstPage.layers && firstPage.layers.length > 0) {
                        // Find background layer or first image layer
                        const bgLayer = firstPage.layers.find(l => l.id === 'background-layer' || l.isBackground);
                        if (bgLayer && bgLayer.content && typeof bgLayer.content === 'string') {
                            thumbnail = bgLayer.content;
                        } else {
                            // Fallback: find any image layer
                            const imageLayer = firstPage.layers.find(l =>
                                l.shapeType === 'image' && l.content && typeof l.content === 'string'
                            );
                            if (imageLayer) {
                                thumbnail = imageLayer.content;
                            }
                        }
                    }
                }

                designs.push({
                    id: doc.id,
                    name: data.name || 'Untitled Design',
                    thumbnail: thumbnail,
                    canvasSize: data.canvasSize || { width: 1080, height: 720 },
                    updatedAt: data.updatedAt?.toDate?.() || new Date(),
                    createdAt: data.createdAt?.toDate?.() || new Date(),
                    accessLevel: data.accessLevel || 'private'
                });
            });
            return designs;
        } catch (error) {
            console.error('Error getting user designs:', error);
            return [];
        }
    }

    /**
     * Delete a design
     * @param {string} designId - Design ID to delete
     * @param {string} userId - User's UID (for verification)
     * @returns {Promise<boolean>} - Success status
     */
    async deleteDesign(designId, userId) {
        if (!designId || !userId) return false;
        try {
            // First verify ownership
            const designDoc = await this.getDesign(designId);
            if (!designDoc || designDoc.ownerId !== userId) {
                console.error('Cannot delete: not owner or design not found');
                return false;
            }

            const docRef = doc(db, 'designs', designId);
            await deleteDoc(docRef);
            console.log('Design deleted successfully:', designId);
            return true;
        } catch (error) {
            console.error('Error deleting design:', error);
            return false;
        }
    }

    /**
     * Update the active design for a specific session (owner's UID)
     * @param {string} sessionId - Usually the owner's UID
     * @param {string} designId - The project ID currently being viewed
     * @param {string} lastUpdatedBy - Random string to identify the sender
     */
    async updateActiveSession(sessionId, designId, lastUpdatedBy) {
        if (!sessionId || !designId) return;
        try {
            const sessionRef = doc(db, 'active_sessions', sessionId);
            await setDoc(sessionRef, {
                activeDesignId: designId,
                updatedAt: serverTimestamp(),
                lastUpdatedBy: lastUpdatedBy || Math.random().toString(36).substr(2, 9)
            }, { merge: true });
        } catch (error) {
            console.error('Error updating active session:', error);
        }
    }

    /**
     * Listen for project switch events in a session
     * @param {string} sessionId 
     * @param {Function} callback 
     */
    listenToActiveSession(sessionId, callback) {
        if (!sessionId) return null;

        const sessionRef = doc(db, 'active_sessions', sessionId);
        return onSnapshot(sessionRef, (doc) => {
            if (doc.exists()) {
                callback(doc.data());
            }
        }, (error) => {
            console.error('Session Sync Error:', error);
        });
    }

    /**
     * Clear session data
     */
    async clearActiveSession(sessionId) {
        if (!sessionId) return;
        try {
            const sessionRef = doc(db, 'active_sessions', sessionId);
            await deleteDoc(sessionRef);
        } catch (error) {
            console.error('Error clearing active session:', error);
        }
    }

    /**
     * Update user presence in a design (cursor, selection, etc)
     */
    async updatePresence(designId, userId, data) {
        if (!designId || !userId) return;
        try {
            const presenceRef = doc(db, 'designs', designId, 'presence', userId);
            await setDoc(presenceRef, {
                ...data,
                userId,
                updatedAt: serverTimestamp()
            }, { merge: true });
        } catch (error) {
            // Silently fail for presence to avoid console spam
        }
    }

    /**
     * Clear user presence in a design
     */
    async clearPresence(designId, userId) {
        if (!designId || !userId) return;
        try {
            const presenceRef = doc(db, 'designs', designId, 'presence', userId);
            await deleteDoc(presenceRef);
        } catch (error) {
            // Silently fail to avoid console spam during cleanup
        }
    }

    /**
     * Listen to all users' presence in a design
     */
    listenToPresence(designId, callback) {
        if (!designId) return null;
        const presenceRef = collection(db, 'designs', designId, 'presence');
        return onSnapshot(presenceRef, (snapshot) => {
            const users = [];
            snapshot.forEach(doc => {
                users.push(doc.data());
            });
            callback(users);
        });
    }

    /**
     * Clean up old presence data
     */
    /**
     * Delete all data associated with a user
     * @param {string} userId 
     */
    async deleteAllUserData(userId) {
        if (!userId) return;
        try {
            console.log('>>> Cleaning up Firestore data for user:', userId);
            
            // 1. Delete all designs
            const designsRef = collection(db, 'designs');
            const q = query(designsRef, where('ownerId', '==', userId));
            const querySnapshot = await getDocs(q);
            
            const deletePromises = [];
            querySnapshot.forEach((doc) => {
                deletePromises.push(deleteDoc(doc.ref));
            });
            
            await Promise.all(deletePromises);
            console.log(`>>> Deleted ${deletePromises.length} designs`);

            // 2. Clear active session if exists
            await this.clearActiveSession(userId);
            
            console.log('>>> Firestore cleanup complete');
            return true;
        } catch (error) {
            console.error('Error during Firestore data cleanup:', error);
            return false;
        }
    }

    // Audio recordings are now handled locally via LocalRecordingsService
}

const firebaseSyncService = new FirebaseSyncService();
export default firebaseSyncService;
