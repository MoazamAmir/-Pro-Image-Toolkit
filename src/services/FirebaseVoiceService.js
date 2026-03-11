/**
 * FirebaseVoiceService — WebRTC voice streaming with Firebase Firestore signaling.
 * 
 * Fixed Version:
 * - Track renegotiation: adds tracks to existing connections when mic starts late.
 * - Stable viewer connection: viewer connects once, doesn't reconnect on broadcast toggle.
 * - Direct <audio> element playback (most reliable cross-browser approach).
 * - Cleans stale signaling docs before creating new offers.
 * - Robust connection state monitoring with auto-reconnect.
 */
import { db } from './firebase';
import {
    doc, collection, addDoc, onSnapshot, updateDoc,
    deleteDoc, getDocs, setDoc, serverTimestamp
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
        this.role = null;
        this.viewerId = null;
        this.isPublishing = false;
        this.isMuted = false;
        this.unsubscribers = [];
        this.hostMetaUnsub = null;
        this._reconnectTimer = null;
        this._isConnecting = false;

        // Create a hidden audio element for playback
        if (typeof document !== 'undefined') {
            let el = document.getElementById('firebase-voice-audio');
            if (!el) {
                el = document.createElement('audio');
                el.id = 'firebase-voice-audio';
                el.autoplay = true;
                el.playsInline = true;
                // Use a visible-but-tiny element (some browsers need non-zero size for autoplay)
                el.style.cssText = 'position:fixed;bottom:0;left:0;width:1px;height:1px;opacity:0.01;pointer-events:none;z-index:-1';
                document.body.appendChild(el);
            }
            this.audioEl = el;
        }
    }

    // ======================== HOST METHODS ========================

    async startHost(sessionId) {
        this.sessionId = sessionId;
        this.role = 'host';
        console.log('[FirebaseVoice] Host mode initialized');
        await this._updateHostBroadcastState(false);
        this._listenForViewerOffers(sessionId);
    }

    async startPublishing(audioDeviceId = null) {
        try {
            console.log('[FirebaseVoice] Capturing microphone...');
            if (this.localStream) this.localStream.getTracks().forEach(t => t.stop());

            const constraints = {
                audio: {
                    deviceId: audioDeviceId ? { exact: audioDeviceId } : undefined,
                    echoCancellation: true,
                    noiseSuppression: false,
                    autoGainControl: true,
                    // Request high quality for Bluetooth compatibility
                    sampleRate: 48000,
                    channelCount: 1,
                },
                video: false
            };

            this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
            this.isPublishing = true;
            this.isMuted = false;

            // Log track status
            this.localStream.getAudioTracks().forEach(t => {
                console.log(`[FirebaseVoice] Mic track active: ${t.label}, State: ${t.readyState}, Enabled: ${t.enabled}`);
                // Monitor track ending unexpectedly
                t.onended = () => console.warn('[FirebaseVoice] ⚠️ Mic track ended unexpectedly:', t.label);
            });

            // FIX #1: Push audio tracks to ALL existing peer connections
            this._pushTracksToAllPeers();

            await this._updateHostBroadcastState(true);
            console.log('[FirebaseVoice] ✅ Mic publishing started');
            return true;
        } catch (e) {
            console.error('[FirebaseVoice] Mic capture failed:', e);
            return false;
        }
    }

    /**
     * FIX #1: Add/replace audio tracks on all existing peer connections.
     * This handles the case where viewers connected BEFORE the host turned on the mic.
     */
    _pushTracksToAllPeers() {
        if (!this.localStream) return;
        const audioTrack = this.localStream.getAudioTracks()[0];
        if (!audioTrack) return;

        for (const [viewerId, pc] of Object.entries(this.peerConnections)) {
            if (pc.connectionState === 'closed') continue;

            const senders = pc.getSenders();
            const audioSender = senders.find(s => s.track?.kind === 'audio' || (s.track === null));

            if (audioSender) {
                // Replace the track on the existing sender
                console.log(`[FirebaseVoice] Replacing audio track for viewer ${viewerId}`);
                audioSender.replaceTrack(audioTrack).catch(err => {
                    console.error(`[FirebaseVoice] replaceTrack failed for ${viewerId}:`, err);
                });
            } else {
                // No audio sender yet - add the track
                console.log(`[FirebaseVoice] Adding audio track to viewer ${viewerId}`);
                pc.addTrack(audioTrack, this.localStream);
            }
        }
    }

    async toggleMic(on, audioDeviceId = null) {
        if (on) {
            if (!this.localStream) return await this.startPublishing(audioDeviceId);
            this.localStream.getAudioTracks().forEach(t => { t.enabled = true; });
            this.isMuted = false;
            // Also push tracks in case new peers connected while muted
            this._pushTracksToAllPeers();
            await this._updateHostBroadcastState(true);
            return true;
        } else {
            if (this.localStream) this.localStream.getAudioTracks().forEach(t => { t.enabled = false; });
            this.isMuted = true;
            await this._updateHostBroadcastState(false);
            return true;
        }
    }

    async _updateHostBroadcastState(isBroadcasting) {
        if (!this.sessionId) return;
        const ref = doc(db, 'live_sessions', this.sessionId, 'voice_meta', 'host');
        await setDoc(ref, { isBroadcasting, updatedAt: serverTimestamp() }, { merge: true });
    }

    _listenForViewerOffers(sessionId) {
        const viewersCol = collection(db, 'live_sessions', sessionId, 'voice_viewers');
        this.unsubscribers.push(onSnapshot(viewersCol, (snapshot) => {
            snapshot.docChanges().forEach(async (change) => {
                const viewerId = change.doc.id;
                const data = change.doc.data();
                if ((change.type === 'added' || change.type === 'modified') && data.offer && !this.peerConnections[viewerId]) {
                    console.log(`[FirebaseVoice] Answering offer from ${viewerId}`);
                    await this._handleViewerOffer(sessionId, viewerId, data.offer);
                }
                if (change.type === 'removed') this._closeViewerConnection(viewerId);
            });
        }));
    }

    async _handleViewerOffer(sessionId, viewerId, offer) {
        const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
        this.peerConnections[viewerId] = pc;
        const iceQueue = [];

        // Add audio track if we already have one
        if (this.localStream) {
            this.localStream.getAudioTracks().forEach(track => {
                console.log(`[FirebaseVoice] Adding track to new peer ${viewerId}: ${track.label}, enabled=${track.enabled}`);
                pc.addTrack(track, this.localStream);
            });
        } else {
            // No local stream yet — add a transceiver so the SDP has audio m-line
            // When mic starts later, _pushTracksToAllPeers will replace the track
            console.log(`[FirebaseVoice] No localStream yet for ${viewerId}, adding sendonly transceiver`);
            pc.addTransceiver('audio', { direction: 'sendonly' });
        }

        pc.oniceconnectionstatechange = () => {
            console.log(`[FirebaseVoice] Host->Viewer(${viewerId}) ICE: ${pc.iceConnectionState}`);
            if (pc.iceConnectionState === 'failed') {
                console.warn(`[FirebaseVoice] ICE failed for ${viewerId}, attempting restart`);
                pc.restartIce();
            }
        };
        pc.onconnectionstatechange = () => {
            console.log(`[FirebaseVoice] Host->Viewer(${viewerId}) Conn: ${pc.connectionState}`);
            if (pc.connectionState === 'failed') {
                this._closeViewerConnection(viewerId);
            }
        };

        pc.onicecandidate = (e) => {
            if (e.candidate) {
                addDoc(collection(db, 'live_sessions', sessionId, 'voice_viewers', viewerId, 'host_candidates'), {
                    candidate: e.candidate.toJSON(), createdAt: serverTimestamp()
                });
            }
        };

        try {
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            while (iceQueue.length > 0) await pc.addIceCandidate(iceQueue.shift());

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            await updateDoc(doc(db, 'live_sessions', sessionId, 'voice_viewers', viewerId), {
                answer: { type: answer.type, sdp: answer.sdp },
                answeredAt: serverTimestamp()
            });

            const unsub = onSnapshot(collection(db, 'live_sessions', sessionId, 'voice_viewers', viewerId, 'viewer_candidates'), (s) => {
                s.docChanges().forEach(c => {
                    if (c.type === 'added') {
                        const candidate = new RTCIceCandidate(c.doc.data().candidate);
                        if (pc.remoteDescription) pc.addIceCandidate(candidate).catch(() => { });
                        else iceQueue.push(candidate);
                    }
                });
            });
            this.unsubscribers.push(unsub);
        } catch (e) {
            console.error('[FirebaseVoice] Host negotiation error:', e);
        }
    }

    _closeViewerConnection(viewerId) {
        if (this.peerConnections[viewerId]) {
            this.peerConnections[viewerId].close();
            delete this.peerConnections[viewerId];
        }
    }

    // ======================== VIEWER METHODS ========================

    async startViewer(sessionId, viewerId) {
        this.sessionId = sessionId;
        this.role = 'viewer';
        this.viewerId = viewerId;
        console.log('[FirebaseVoice] Viewer mode active');

        // FIX #2: Connect to host IMMEDIATELY (once) regardless of broadcast state.
        // The audio will simply start flowing when the host adds tracks.
        await this._connectToHost();

        // Listen to broadcast state for UI purposes only (the AudienceViewer component
        // already does this via LiveSessionService.listenToSession -> session.isMicOn)
        // We don't need to react to it here anymore.
    }

    async _connectToHost() {
        if (this.hostConnection || this._isConnecting) return;
        this._isConnecting = true;
        console.log('[FirebaseVoice] Connecting to host...');

        // FIX #4: Clean stale signaling docs before creating new offer
        await this._cleanSignalingDocs();

        const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
        this.hostConnection = pc;
        const iceQueue = [];

        pc.oniceconnectionstatechange = () => {
            console.log(`[FirebaseVoice] Viewer ICE: ${pc.iceConnectionState}`);
            if (pc.iceConnectionState === 'failed') {
                console.warn('[FirebaseVoice] Viewer ICE failed, attempting restart');
                pc.restartIce();
            }
        };
        pc.onconnectionstatechange = () => {
            console.log(`[FirebaseVoice] Viewer Conn: ${pc.connectionState}`);
            if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
                // Schedule reconnection attempt
                this._scheduleReconnect();
            }
            if (pc.connectionState === 'connected') {
                console.log('[FirebaseVoice] ✅ Viewer fully connected to host');
                if (this._reconnectTimer) {
                    clearTimeout(this._reconnectTimer);
                    this._reconnectTimer = null;
                }
            }
        };

        // FIX #3: Simple and reliable audio playback via <audio> element
        pc.ontrack = (e) => {
            console.log('[FirebaseVoice] ✅ Audio track received:', e.track.id,
                'kind:', e.track.kind,
                'readyState:', e.track.readyState,
                'muted:', e.track.muted,
                'enabled:', e.track.enabled);

            if (e.streams && e.streams[0]) {
                console.log('[FirebaseVoice] Setting stream on audio element, tracks:', e.streams[0].getAudioTracks().length);

                // Direct assignment to audio element - most reliable cross-browser method
                this.audioEl.srcObject = e.streams[0];

                // Force play (handle autoplay policy)
                const playPromise = this.audioEl.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        console.log('[FirebaseVoice] ✅ Audio playback started successfully');
                    }).catch(err => {
                        console.warn('[FirebaseVoice] ⚠️ Audio play() blocked:', err.message);
                        // Will retry on next user interaction via unlockAudio()
                    });
                }

                // Monitor the track for mute/unmute events
                e.track.onmute = () => console.log('[FirebaseVoice] 🔇 Remote track muted');
                e.track.onunmute = () => {
                    console.log('[FirebaseVoice] 🔊 Remote track unmuted');
                    // Ensure audio is still playing
                    if (this.audioEl.paused) {
                        this.audioEl.play().catch(() => { });
                    }
                };
                e.track.onended = () => console.log('[FirebaseVoice] ⚠️ Remote track ended');
            } else {
                console.warn('[FirebaseVoice] ⚠️ ontrack fired without streams, creating stream from track');
                const stream = new MediaStream([e.track]);
                this.audioEl.srcObject = stream;
                this.audioEl.play().catch(() => { });
            }
        };

        pc.addTransceiver('audio', { direction: 'recvonly' });

        pc.onicecandidate = (e) => {
            if (e.candidate) {
                addDoc(collection(db, 'live_sessions', this.sessionId, 'voice_viewers', this.viewerId, 'viewer_candidates'), {
                    candidate: e.candidate.toJSON(), createdAt: serverTimestamp()
                });
            }
        };

        try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            const viewerDoc = doc(db, 'live_sessions', this.sessionId, 'voice_viewers', this.viewerId);
            await setDoc(viewerDoc, {
                offer: { type: offer.type, sdp: offer.sdp },
                createdAt: serverTimestamp()
            });

            const stopSub = onSnapshot(viewerDoc, async (s) => {
                const data = s.data();
                if (data?.answer && pc.signalingState === 'have-local-offer') {
                    try {
                        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
                        console.log('[FirebaseVoice] ✅ Remote description set');
                        while (iceQueue.length > 0) await pc.addIceCandidate(iceQueue.shift());
                    } catch (err) {
                        console.error('[FirebaseVoice] Error setting remote description:', err);
                    }
                }
            });
            this.unsubscribers.push(stopSub);

            const unsubIce = onSnapshot(collection(db, 'live_sessions', this.sessionId, 'voice_viewers', this.viewerId, 'host_candidates'), (sn) => {
                sn.docChanges().forEach(c => {
                    if (c.type === 'added') {
                        const candidate = new RTCIceCandidate(c.doc.data().candidate);
                        if (pc.remoteDescription) pc.addIceCandidate(candidate).catch(() => { });
                        else iceQueue.push(candidate);
                    }
                });
            });
            this.unsubscribers.push(unsubIce);
        } catch (e) {
            console.error('[FirebaseVoice] Connection failed:', e);
        } finally {
            this._isConnecting = false;
        }
    }

    /**
     * FIX #4: Clean up stale signaling docs before reconnection.
     */
    async _cleanSignalingDocs() {
        if (!this.sessionId || !this.viewerId) return;
        try {
            // Delete old viewer doc
            const viewerDocRef = doc(db, 'live_sessions', this.sessionId, 'voice_viewers', this.viewerId);
            await deleteDoc(viewerDocRef).catch(() => { });

            // Delete old viewer candidates  
            const viewerCandidates = await getDocs(
                collection(db, 'live_sessions', this.sessionId, 'voice_viewers', this.viewerId, 'viewer_candidates')
            ).catch(() => null);
            if (viewerCandidates) {
                viewerCandidates.forEach(d => deleteDoc(d.ref).catch(() => { }));
            }

            // Delete old host candidates for this viewer
            const hostCandidates = await getDocs(
                collection(db, 'live_sessions', this.sessionId, 'voice_viewers', this.viewerId, 'host_candidates')
            ).catch(() => null);
            if (hostCandidates) {
                hostCandidates.forEach(d => deleteDoc(d.ref).catch(() => { }));
            }

            // Small delay to let Firestore propagate the deletion 
            // (so the host-side listener doesn't re-process the old doc)
            await new Promise(resolve => setTimeout(resolve, 300));
            console.log('[FirebaseVoice] Cleaned stale signaling docs');
        } catch (e) {
            console.warn('[FirebaseVoice] Error cleaning signaling docs:', e);
        }
    }

    /**
     * Schedule a reconnection attempt after connection failure.
     */
    _scheduleReconnect() {
        if (this._reconnectTimer) return;
        console.log('[FirebaseVoice] Scheduling reconnect in 3s...');
        this._reconnectTimer = setTimeout(async () => {
            this._reconnectTimer = null;
            if (this.role !== 'viewer') return;

            // Close old connection
            if (this.hostConnection) {
                this.hostConnection.close();
                this.hostConnection = null;
            }
            this._isConnecting = false;

            console.log('[FirebaseVoice] Attempting reconnect...');
            await this._connectToHost();
        }, 3000);
    }

    _disconnectFromHost() {
        if (this.hostConnection) {
            this.hostConnection.close();
            this.hostConnection = null;
        }
        if (this.audioEl) this.audioEl.srcObject = null;
        if (this._reconnectTimer) {
            clearTimeout(this._reconnectTimer);
            this._reconnectTimer = null;
        }
        this._isConnecting = false;
    }

    async stop() {
        console.log('[FirebaseVoice] Stopping...');
        if (this.hostMetaUnsub) this.hostMetaUnsub();
        this.unsubscribers.forEach(u => typeof u === 'function' && u());
        this.unsubscribers = [];

        if (this.localStream) {
            this.localStream.getTracks().forEach(t => t.stop());
            this.localStream = null;
        }

        for (const vid in this.peerConnections) this.peerConnections[vid].close();
        this.peerConnections = {};
        this._disconnectFromHost();

        if (this.sessionId && this.role === 'host') {
            await this._updateHostBroadcastState(false);
            const snap = await getDocs(collection(db, 'live_sessions', this.sessionId, 'voice_viewers'));
            snap.forEach(d => deleteDoc(d.ref).catch(() => { }));
        }

        if (this.sessionId && this.role === 'viewer' && this.viewerId) {
            deleteDoc(doc(db, 'live_sessions', this.sessionId, 'voice_viewers', this.viewerId)).catch(() => { });
        }

        this.sessionId = null;
        this.role = null;
        this.isPublishing = false;
        this.isMuted = false;
        console.log('[FirebaseVoice] ✅ Service stopped');
    }

    /**
     * Unlock audio for autoplay policy. Call this from a user gesture handler.
     */
    unlockAudio() {
        if (this.audioEl) {
            // Play a tiny silent sound to unlock audio
            this.audioEl.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
            this.audioEl.play().then(() => {
                console.log('[FirebaseVoice] ✅ Audio unlocked via user gesture');
                // Reset srcObject so our stream can take over
                this.audioEl.src = '';
                // If we already have a stream assigned, re-assign it
                if (this.hostConnection) {
                    const receivers = this.hostConnection.getReceivers();
                    const audioReceiver = receivers.find(r => r.track?.kind === 'audio');
                    if (audioReceiver && audioReceiver.track) {
                        const stream = new MediaStream([audioReceiver.track]);
                        this.audioEl.srcObject = stream;
                        this.audioEl.play().catch(() => { });
                    }
                }
            }).catch(() => { });
        }
    }
}

const firebaseVoiceService = new FirebaseVoiceService();
export default firebaseVoiceService;
