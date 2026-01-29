import { db } from './firebase';
import {
    doc,
    setDoc,
    getDoc,
    onSnapshot,
    collection,
    addDoc,
    serverTimestamp
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
}

const firebaseSyncService = new FirebaseSyncService();
export default firebaseSyncService;
