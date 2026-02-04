import { db } from './firebase';
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
     */
    initSync(designId, callback) {
        if (!designId) return null;

        if (this.unsubscribe) {
            this.unsubscribe();
        }

        const docRef = doc(db, 'designs', designId);
        this.unsubscribe = onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                callback(doc.data());
            }
        }, (error) => {
            console.error('Firestore Subscribe Error:', error);
        });

        return this.unsubscribe;
    }

    stopSync() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
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
}

const firebaseSyncService = new FirebaseSyncService();
export default firebaseSyncService;
