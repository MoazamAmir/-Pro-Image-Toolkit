import { db } from './firebase';
import {
    doc, setDoc, getDoc, deleteDoc, onSnapshot,
    collection, addDoc, query, orderBy, serverTimestamp,
    updateDoc, increment, arrayUnion, arrayRemove, where, getDocs
} from 'firebase/firestore';

// Generate random session code like "5A7S EMKV"
const generateSessionCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const part1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `${part1} ${part2}`;
};

class LiveSessionService {
    /**
     * Create a new live session
     * @param {string} designId - The design being presented
     * @param {string} hostId - The host user's UID
     * @param {string} hostName - Host's display name
     * @returns {{ sessionId: string, sessionCode: string }}
     */
    async createSession(designId, hostId, hostName) {
        const sessionCode = generateSessionCode();
        try {
            const sessionData = {
                designId,
                hostId,
                hostName: hostName || 'Host',
                sessionCode,
                isActive: true,
                activePageIndex: 0,
                viewerCount: 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            const docRef = await addDoc(collection(db, 'live_sessions'), sessionData);
            return { sessionId: docRef.id, sessionCode };
        } catch (error) {
            console.error('Error creating live session:', error);
            throw error;
        }
    }

    /**
     * End a live session
     */
    async endSession(sessionId) {
        if (!sessionId) return;
        try {
            const ref = doc(db, 'live_sessions', sessionId);
            await updateDoc(ref, { isActive: false, updatedAt: serverTimestamp() });
        } catch (error) {
            console.error('Error ending session:', error);
        }
    }

    /**
     * Find active session by code
     */
    async getSessionByCode(code) {
        try {
            // Use single-field query to avoid composite index requirement
            const q = query(
                collection(db, 'live_sessions'),
                where('sessionCode', '==', code.toUpperCase().trim())
            );
            const snapshot = await getDocs(q);
            if (snapshot.empty) return null;
            // Filter active sessions client-side
            const activeDocs = snapshot.docs.filter(d => d.data().isActive !== false);
            if (activeDocs.length === 0) return null;
            const docSnap = activeDocs[0];
            return { id: docSnap.id, ...docSnap.data() };
        } catch (error) {
            console.error('Error finding session:', error);
            return null;
        }
    }

    /**
     * Update current page index (host navigates)
     */
    async updateActivePage(sessionId, pageIndex) {
        if (!sessionId) return;
        try {
            const ref = doc(db, 'live_sessions', sessionId);
            await updateDoc(ref, { activePageIndex: pageIndex, updatedAt: serverTimestamp() });
        } catch (error) {
            console.error('Error updating active page:', error);
        }
    }

    /**
     * Update drawings for the session
     * @param {string} sessionId 
     * @param {Object} drawings - { [pageId]: paths[] }
     */
    async updateDrawings(sessionId, drawings) {
        if (!sessionId) return;
        try {
            const ref = doc(db, 'live_sessions', sessionId);
            // Also clear currentPath when a drawing is finished
            await updateDoc(ref, {
                drawings,
                currentPath: null,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating drawings:', error);
        }
    }

    /**
     * Update current path while drawing
     */
    async updateCurrentPath(sessionId, currentPath) {
        if (!sessionId) return;
        try {
            const ref = doc(db, 'live_sessions', sessionId);
            await updateDoc(ref, { currentPath, updatedAt: serverTimestamp() });
        } catch (error) {
            // High frequency, fail silently
        }
    }

    /**
     * Update laser pointer position
     */
    async updateLaserPosition(sessionId, laserPos) {
        if (!sessionId) return;
        try {
            const ref = doc(db, 'live_sessions', sessionId);
            await updateDoc(ref, { laserPos, updatedAt: serverTimestamp() });
        } catch (error) {
            // Quietly fail for high-frequency updates
        }
    }

    /**
     * Listen for session changes in real-time
     */
    listenToSession(sessionId, callback) {
        if (!sessionId) return null;
        const ref = doc(db, 'live_sessions', sessionId);
        return onSnapshot(ref, (snap) => {
            if (snap.exists()) callback({ id: snap.id, ...snap.data() });
        });
    }

    /**
     * Add a comment
     */
    async addComment(sessionId, { userId, userName, userPhoto, text }) {
        if (!sessionId || !text?.trim()) return;
        try {
            await addDoc(collection(db, 'live_sessions', sessionId, 'comments'), {
                userId,
                userName: userName || 'Anonymous',
                userPhoto: userPhoto || null,
                text: text.trim(),
                likes: [],
                likeCount: 0,
                createdAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    }

    /**
     * Send a real-time reaction
     */
    async sendReaction(sessionId, type) {
        if (!sessionId) return;
        try {
            await addDoc(collection(db, 'live_sessions', sessionId, 'reactions'), {
                type,
                createdAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error sending reaction:', error);
        }
    }

    /**
     * Listen to reactions in real-time
     */
    listenToReactions(sessionId, callback) {
        if (!sessionId) return null;
        // Only listen for reactions created in the last 10 seconds to keep it ephemeral
        const tenSecondsAgo = new Date(Date.now() - 10000);
        const q = query(
            collection(db, 'live_sessions', sessionId, 'reactions'),
            where('createdAt', '>', tenSecondsAgo),
            orderBy('createdAt', 'desc')
        );
        return onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    callback({ id: change.doc.id, ...change.doc.data() });
                }
            });
        });
    }

    /**
     * Viewer presence - Join
     */
    async joinSession(sessionId) {
        if (!sessionId) return;
        try {
            const ref = doc(db, 'live_sessions', sessionId);
            await updateDoc(ref, { viewerCount: increment(1) });
        } catch (error) {
            console.error('Error joining session count:', error);
        }
    }

    /**
     * Viewer presence - Leave
     */
    async leaveSession(sessionId) {
        if (!sessionId) return;
        try {
            const ref = doc(db, 'live_sessions', sessionId);
            await updateDoc(ref, { viewerCount: increment(-1) });
        } catch (error) {
            console.error('Error leaving session count:', error);
        }
    }

    /**
     * Toggle like on a comment
     */
    async toggleLike(sessionId, commentId, userId) {
        if (!sessionId || !commentId || !userId) return;
        try {
            const ref = doc(db, 'live_sessions', sessionId, 'comments', commentId);
            const snap = await getDoc(ref);
            if (!snap.exists()) return;

            const data = snap.data();
            const likes = data.likes || [];
            if (likes.includes(userId)) {
                await updateDoc(ref, {
                    likes: arrayRemove(userId),
                    likeCount: increment(-1)
                });
            } else {
                await updateDoc(ref, {
                    likes: arrayUnion(userId),
                    likeCount: increment(1)
                });
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    }

    /**
     * WebRTC Signaling: Send a signal (offer, answer, candidate)
     */
    async sendSignal(sessionId, signalData) {
        if (!sessionId) return;
        try {
            await addDoc(collection(db, 'live_sessions', sessionId, 'signaling'), {
                ...signalData,
                createdAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error sending signal:', error);
        }
    }

    /**
     * WebRTC Signaling: Listen for signals
     */
    listenToSignals(sessionId, callback) {
        if (!sessionId) return null;
        const q = query(
            collection(db, 'live_sessions', sessionId, 'signaling'),
            orderBy('createdAt', 'desc'),
            where('createdAt', '>', new Date(Date.now() - 30000)) // Only recent signals
        );
        return onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    callback({ id: change.doc.id, ...change.doc.data() });
                }
            });
        });
    }

    /**
     * Clear all signals for a session (maintenance)
     */
    async clearSignals(sessionId) {
        if (!sessionId) return;
        try {
            const q = query(collection(db, 'live_sessions', sessionId, 'signaling'));
            const snap = await getDocs(q);
            const batch = [];
            snap.forEach(d => batch.push(deleteDoc(d.ref)));
            await Promise.all(batch);
        } catch (e) { }
    }

    /**
     * Listen to comments in real-time
     */
    listenToComments(sessionId, callback) {
        if (!sessionId) return null;
        const q = query(
            collection(db, 'live_sessions', sessionId, 'comments'),
            orderBy('createdAt', 'asc')
        );
        return onSnapshot(q, (snapshot) => {
            const comments = [];
            snapshot.forEach(d => comments.push({ id: d.id, ...d.data() }));
            callback(comments);
        });
    }
}

const liveSessionService = new LiveSessionService();
export default liveSessionService;
