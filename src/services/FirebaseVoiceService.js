/**
 * FirebaseVoiceService — WebRTC voice streaming with Firebase Firestore signaling
 * 
 * Replaces ZegoCloud. Uses browser's built-in WebRTC API.
 * Host publishes microphone audio → Viewers receive and play it.
 * Firebase Firestore is used for signaling (offer/answer/ICE candidates).
 */
import { db } from './firebase';
import {
    doc, collection, addDoc, onSnapshot, updateDoc,
    deleteDoc, getDocs, setDoc, serverTimestamp, query, orderBy
} from 'firebase/firestore';

const ICE_SERVERS = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
];

class FirebaseVoiceService {
    constructor() {
        this.localStream = null;
        this.peerConnections = {};   // viewerId -> RTCPeerConnection (host side)
        this.hostConnection = null;  // Single RTCPeerConnection (viewer side)
        this.sessionId = null;
        this.role = null; // 'host' | 'viewer'
        this.viewerId = null;
        this.isPublishing = false;
        this.isMuted = false;
        this.unsubscribers = [];

        // Shared audio element for viewer playback
        if (typeof document !== 'undefined') {
            let el = document.getElementById('firebase-voice-audio');
            if (!el) {
                el = document.createElement('audio');
                el.id = 'firebase-voice-audio';
                el.autoplay = true;
                el.playsInline = true;
                el.style.cssText = 'position:absolute;width:0;height:0;opacity:0;pointer-events:none';
                document.body.appendChild(el);
            }
            this.audioEl = el;
        }
    }

    // ======================== HOST METHODS ========================

    /**
     * Host starts and waits for viewers to connect
     * @param {string} sessionId - The live session ID
     */
    async startHost(sessionId) {
        this.sessionId = sessionId;
        this.role = 'host';
        console.log('[FirebaseVoice] Host started for session:', sessionId);

        // Listen for new viewer join requests
        this._listenForViewerOffers(sessionId);
    }

    /**
     * Host starts publishing audio from microphone
     * @param {string} audioDeviceId - Optional specific mic device ID
     */
    async startPublishing(audioDeviceId = null) {
        if (this.isPublishing && this.localStream) {
            // Already publishing, just unmute
            this._setTrackEnabled(true);
            return true;
        }

        try {
            const constraints = { audio: audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true, video: false };
            this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
            this.isPublishing = true;
            this.isMuted = false;
            console.log('[FirebaseVoice] ✅ Microphone captured successfully');

            // Add audio track to all existing peer connections
            for (const viewerId in this.peerConnections) {
                const pc = this.peerConnections[viewerId];
                if (pc && pc.connectionState !== 'closed') {
                    this.localStream.getAudioTracks().forEach(track => {
                        const senders = pc.getSenders();
                        const audioSender = senders.find(s => s.track?.kind === 'audio');
                        if (audioSender) {
                            audioSender.replaceTrack(track);
                        } else {
                            pc.addTrack(track, this.localStream);
                        }
                    });
                }
            }

            // Notify session that host is broadcasting
            await this._updateHostBroadcastState(true);
            return true;
        } catch (e) {
            console.error('[FirebaseVoice] Failed to capture microphone:', e);
            return false;
        }
    }

    /**
     * Toggle microphone on/off
     * @param {boolean} on - Whether to enable mic
     * @param {string} audioDeviceId - Optional device ID
     */
    async toggleMic(on, audioDeviceId = null) {
        if (on) {
            if (!this.localStream) {
                return await this.startPublishing(audioDeviceId);
            }
            this._setTrackEnabled(true);
            this.isMuted = false;
            await this._updateHostBroadcastState(true);
            return true;
        } else {
            this._setTrackEnabled(false);
            this.isMuted = true;
            await this._updateHostBroadcastState(false);
            return true;
        }
    }

    _setTrackEnabled(enabled) {
        if (this.localStream) {
            this.localStream.getAudioTracks().forEach(track => {
                track.enabled = enabled;
            });
        }
    }

    async _updateHostBroadcastState(isBroadcasting) {
        if (!this.sessionId) return;
        try {
            const ref = doc(db, 'live_sessions', this.sessionId, 'voice_meta', 'host');
            await setDoc(ref, {
                isBroadcasting,
                updatedAt: serverTimestamp()
            }, { merge: true });
        } catch (e) {
            console.warn('[FirebaseVoice] Failed to update broadcast state:', e);
        }
    }

    /**
     * Listen for viewer offers and create peer connections
     */
    _listenForViewerOffers(sessionId) {
        const viewersCol = collection(db, 'live_sessions', sessionId, 'voice_viewers');
        const unsub = onSnapshot(viewersCol, (snapshot) => {
            snapshot.docChanges().forEach(async (change) => {
                if (change.type === 'added') {
                    const viewerData = change.doc.data();
                    const viewerId = change.doc.id;

                    // Only respond if there's an offer
                    if (viewerData.offer) {
                        console.log('[FirebaseVoice] New viewer offer from:', viewerId);
                        await this._handleViewerOffer(sessionId, viewerId, viewerData.offer);
                    }
                }
                if (change.type === 'removed') {
                    const viewerId = change.doc.id;
                    this._closeViewerConnection(viewerId);
                }
            });
        });
        this.unsubscribers.push(unsub);
    }

    /**
     * Host handles a viewer's offer — creates answer and sends it back
     */
    async _handleViewerOffer(sessionId, viewerId, offer) {
        // Close any existing connection for this viewer
        this._closeViewerConnection(viewerId);

        const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
        this.peerConnections[viewerId] = pc;

        // Add local audio tracks if we have them
        if (this.localStream) {
            this.localStream.getAudioTracks().forEach(track => {
                pc.addTrack(track, this.localStream);
            });
        }

        // ICE candidate handling — send to viewer via Firestore
        pc.onicecandidate = async (event) => {
            if (event.candidate) {
                try {
                    await addDoc(
                        collection(db, 'live_sessions', sessionId, 'voice_viewers', viewerId, 'host_candidates'),
                        { candidate: event.candidate.toJSON(), createdAt: serverTimestamp() }
                    );
                } catch (e) {
                    console.warn('[FirebaseVoice] Failed to send host ICE candidate:', e);
                }
            }
        };

        pc.onconnectionstatechange = () => {
            console.log(`[FirebaseVoice] Host->Viewer(${viewerId}) connection: ${pc.connectionState}`);
            if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
                // Attempt reconnection after a delay
                setTimeout(() => {
                    if (this.peerConnections[viewerId] === pc) {
                        this._closeViewerConnection(viewerId);
                    }
                }, 5000);
            }
        };

        try {
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            // Send answer back to viewer's doc
            const viewerDoc = doc(db, 'live_sessions', sessionId, 'voice_viewers', viewerId);
            await updateDoc(viewerDoc, {
                answer: { type: answer.type, sdp: answer.sdp },
                answeredAt: serverTimestamp()
            });

            console.log('[FirebaseVoice] ✅ Answer sent to viewer:', viewerId);

            // Listen for viewer's ICE candidates
            const candidatesCol = collection(db, 'live_sessions', sessionId, 'voice_viewers', viewerId, 'viewer_candidates');
            const candidateUnsub = onSnapshot(candidatesCol, (snap) => {
                snap.docChanges().forEach(change => {
                    if (change.type === 'added') {
                        const data = change.doc.data();
                        if (data.candidate && pc.remoteDescription) {
                            pc.addIceCandidate(new RTCIceCandidate(data.candidate))
                                .catch(e => console.warn('[FirebaseVoice] Failed to add viewer ICE:', e));
                        }
                    }
                });
            });
            this.unsubscribers.push(candidateUnsub);
        } catch (e) {
            console.error('[FirebaseVoice] Error handling viewer offer:', e);
        }
    }

    _closeViewerConnection(viewerId) {
        const pc = this.peerConnections[viewerId];
        if (pc) {
            pc.close();
            delete this.peerConnections[viewerId];
            console.log('[FirebaseVoice] Closed connection for viewer:', viewerId);
        }
    }

    // ======================== VIEWER METHODS ========================

    /**
     * Viewer connects to host's audio stream
     * @param {string} sessionId
     * @param {string} viewerId - Unique viewer identifier
     */
    async startViewer(sessionId, viewerId) {
        this.sessionId = sessionId;
        this.role = 'viewer';
        this.viewerId = viewerId;

        console.log('[FirebaseVoice] Viewer connecting:', viewerId);

        const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
        this.hostConnection = pc;

        // Handle incoming audio from host
        pc.ontrack = (event) => {
            console.log('[FirebaseVoice] ✅ Received audio track from host!');
            if (this.audioEl && event.streams[0]) {
                this.audioEl.srcObject = event.streams[0];
                this.audioEl.play().catch(e => {
                    console.warn('[FirebaseVoice] Autoplay blocked:', e);
                });
            }
        };

        // Add a transceiver to signal we want to receive audio
        pc.addTransceiver('audio', { direction: 'recvonly' });

        // ICE candidates — send to Firestore
        pc.onicecandidate = async (event) => {
            if (event.candidate) {
                try {
                    await addDoc(
                        collection(db, 'live_sessions', sessionId, 'voice_viewers', viewerId, 'viewer_candidates'),
                        { candidate: event.candidate.toJSON(), createdAt: serverTimestamp() }
                    );
                } catch (e) {
                    console.warn('[FirebaseVoice] Failed to send viewer ICE candidate:', e);
                }
            }
        };

        pc.onconnectionstatechange = () => {
            console.log(`[FirebaseVoice] Viewer connection state: ${pc.connectionState}`);
            if (pc.connectionState === 'connected') {
                console.log('[FirebaseVoice] ✅ Viewer connected to host audio!');
            }
            if (pc.connectionState === 'failed') {
                console.log('[FirebaseVoice] Connection failed, attempting reconnect...');
                setTimeout(() => this._reconnectViewer(), 3000);
            }
        };

        try {
            // Create offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            // Send offer to Firestore
            const viewerDoc = doc(db, 'live_sessions', sessionId, 'voice_viewers', viewerId);
            await setDoc(viewerDoc, {
                offer: { type: offer.type, sdp: offer.sdp },
                createdAt: serverTimestamp()
            });

            console.log('[FirebaseVoice] Offer sent, waiting for host answer...');

            // Listen for host's answer
            const unsub = onSnapshot(viewerDoc, async (snap) => {
                const data = snap.data();
                if (data?.answer && pc.signalingState === 'have-local-offer') {
                    try {
                        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
                        console.log('[FirebaseVoice] ✅ Host answer received and set');
                    } catch (e) {
                        console.error('[FirebaseVoice] Error setting host answer:', e);
                    }
                }
            });
            this.unsubscribers.push(unsub);

            // Listen for host's ICE candidates
            const hostCandidatesCol = collection(db, 'live_sessions', sessionId, 'voice_viewers', viewerId, 'host_candidates');
            const candidateUnsub = onSnapshot(hostCandidatesCol, (snap) => {
                snap.docChanges().forEach(change => {
                    if (change.type === 'added') {
                        const data = change.doc.data();
                        if (data.candidate && pc.remoteDescription) {
                            pc.addIceCandidate(new RTCIceCandidate(data.candidate))
                                .catch(e => console.warn('[FirebaseVoice] Failed to add host ICE:', e));
                        }
                    }
                });
            });
            this.unsubscribers.push(candidateUnsub);

        } catch (e) {
            console.error('[FirebaseVoice] Error creating viewer offer:', e);
        }
    }

    /**
     * Reconnect viewer if connection fails
     */
    async _reconnectViewer() {
        if (this.role !== 'viewer' || !this.sessionId || !this.viewerId) return;
        console.log('[FirebaseVoice] Reconnecting viewer...');

        // Cleanup old connection
        if (this.hostConnection) {
            this.hostConnection.close();
            this.hostConnection = null;
        }

        // Clean up old viewer doc
        try {
            const viewerDoc = doc(db, 'live_sessions', this.sessionId, 'voice_viewers', this.viewerId);
            await deleteDoc(viewerDoc);
        } catch (e) { /* ignore */ }

        // Short delay then reconnect
        await new Promise(r => setTimeout(r, 1000));
        await this.startViewer(this.sessionId, this.viewerId);
    }

    // ======================== CLEANUP ========================

    /**
     * Stop everything and clean up
     */
    async stop() {
        console.log('[FirebaseVoice] Stopping...');

        // Unsubscribe all Firestore listeners
        this.unsubscribers.forEach(unsub => {
            try { unsub(); } catch (e) { /* ignore */ }
        });
        this.unsubscribers = [];

        // Stop local media tracks
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }

        // Close all host-side peer connections
        for (const viewerId in this.peerConnections) {
            try {
                this.peerConnections[viewerId].close();
            } catch (e) { /* ignore */ }
        }
        this.peerConnections = {};

        // Close viewer-side connection
        if (this.hostConnection) {
            this.hostConnection.close();
            this.hostConnection = null;
        }

        // Clear audio element
        if (this.audioEl) {
            this.audioEl.srcObject = null;
        }

        // Clean up Firestore voice data
        if (this.sessionId && this.role === 'viewer' && this.viewerId) {
            try {
                const viewerDoc = doc(db, 'live_sessions', this.sessionId, 'voice_viewers', this.viewerId);
                await deleteDoc(viewerDoc);
            } catch (e) { /* ignore */ }
        }

        if (this.sessionId && this.role === 'host') {
            try {
                // Clean up all viewer docs and voice meta
                const viewersCol = collection(db, 'live_sessions', this.sessionId, 'voice_viewers');
                const snap = await getDocs(viewersCol);
                const deletes = [];
                snap.forEach(d => deletes.push(deleteDoc(d.ref)));
                await Promise.all(deletes);

                // Remove host broadcast state
                const metaRef = doc(db, 'live_sessions', this.sessionId, 'voice_meta', 'host');
                await deleteDoc(metaRef);
            } catch (e) { /* ignore */ }
        }

        this.isPublishing = false;
        this.isMuted = false;
        this.sessionId = null;
        this.role = null;
        this.viewerId = null;

        console.log('[FirebaseVoice] ✅ Cleanup complete');
    }

    /**
     * Unlock audio context (for Safari/mobile autoplay policy)
     */
    unlockAudio() {
        if (this.audioEl) {
            this.audioEl.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
            this.audioEl.play().catch(() => { });
        }
    }
}

const firebaseVoiceService = new FirebaseVoiceService();
export default firebaseVoiceService;
