/**
 * ZegoVoiceService — Wrapper for ZegoCloud real-time voice
 * 
 * Uses ZegoCloud Express SDK for reliable, low-latency voice streaming.
 * Host publishes audio; Viewers auto-play received audio.
 */
import { ZegoExpressEngine } from 'zego-express-engine-webrtc';
import { generateToken04 } from '../utils/zegoTokenGenerator';

const APP_ID = parseInt(process.env.REACT_APP_ZEGO_APP_ID || '0', 10);
const SERVER_SECRET = process.env.REACT_APP_ZEGO_SERVER_SECRET || '';

class ZegoVoiceService {
    constructor() {
        this.engine = null;
        this.localStream = null;
        this.roomId = null;
        this.userId = null;
        this.isPublishing = false;

        // Ensure a single persistent audio element exists for ZegoCloud playback
        if (typeof document !== 'undefined') {
            let el = document.getElementById('zego-shared-audio');
            if (!el) {
                el = document.createElement('audio');
                el.id = 'zego-shared-audio';
                el.autoplay = true;
                el.playsInline = true;
                el.style.position = 'absolute';
                el.style.width = '0px';
                el.style.height = '0px';
                el.style.opacity = '0';
                document.body.appendChild(el);
            }
            this.sharedAudioEl = el;
        }
    }

    /**
     * Unlock the shared audio element on user interaction
     */
    unlockAudio() {
        if (this.sharedAudioEl) {
            this.sharedAudioEl.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
            this.sharedAudioEl.play().catch(e => console.warn('[ZegoVoice] Audio unlock blocked:', e));
        }
    }

    /**
     * Initialize the ZegoExpress engine
     */
    initEngine() {
        if (this.engine) return;

        try {
            // Updated Server URL to dynamically inject APP_ID to prevent mismatched socket connections
            const serverUrl = `wss://webliveroom${APP_ID}-api.coolzcloud.com/ws`;
            this.engine = new ZegoExpressEngine(APP_ID, serverUrl);
            console.log('[ZegoVoice] Engine initialized with AppID:', APP_ID, 'Server:', serverUrl);

            // Listen for remote streams (viewer side)
            this.engine.on('roomStreamUpdate', async (roomID, updateType, streamList) => {
                console.log('[ZegoVoice] Stream update:', updateType, streamList.map(s => s.streamID));

                if (updateType === 'ADD') {
                    for (const stream of streamList) {
                        try {
                            const remoteStream = await this.engine.startPlayingStream(stream.streamID);
                            console.log('[ZegoVoice] Playing remote stream:', stream.streamID);

                            // Reuse the shared audio element for playback
                            if (this.sharedAudioEl) {
                                this.sharedAudioEl.srcObject = remoteStream;
                                this.sharedAudioEl.play().catch(e => {
                                    console.warn('[ZegoVoice] Autoplay blocked, user interaction needed:', e);
                                });
                            }
                        } catch (e) {
                            console.error('[ZegoVoice] Failed to play stream:', stream.streamID, e);
                        }
                    }
                } else if (updateType === 'DELETE') {
                    for (const stream of streamList) {
                        try {
                            this.engine.stopPlayingStream(stream.streamID);
                            console.log('[ZegoVoice] Stopped playing:', stream.streamID);
                        } catch (e) { }

                        // Clean up audio element
                        if (this.sharedAudioEl && this.sharedAudioEl.srcObject) {
                            this.sharedAudioEl.srcObject = null;
                        }
                    }
                }
            });

            // Room state changes
            this.engine.on('roomStateChanged', (roomID, reason, errorCode, extendedData) => {
                console.log(`[ZegoVoice] Room ${roomID} state: ${reason}, code: ${errorCode}`);
            });

            // Connection state
            this.engine.on('roomUserUpdate', (roomID, updateType, userList) => {
                console.log(`[ZegoVoice] Room ${roomID} users ${updateType}:`, userList.map(u => u.userID));
            });
        } catch (e) {
            console.error('[ZegoVoice] Failed to init engine:', e);
        }
    }

    /**
     * Generate a simple token for authentication
     * Note: In production, generate tokens server-side for security
     */
    generateToken(userId) {
        if (!APP_ID || !SERVER_SECRET) {
            console.error('[ZegoVoice] Missing AppID or ServerSecret in .env');
            return '';
        }
        // Generate Token valid for 24 hours (86400 seconds)
        return generateToken04(APP_ID, userId, SERVER_SECRET, 86400, '');
    }

    /**
     * Join a voice room
     * @param {string} roomId - Use sessionId as roomId
     * @param {string} userId - Unique user ID
     * @param {string} userName - Display name
     * @param {boolean} publishAudio - true for host (publish), false for viewer (listen only)
     */
    async joinRoom(roomId, userId, userName, publishAudio = false) {
        if (!this.engine) this.initEngine();
        if (!this.engine) {
            console.error('[ZegoVoice] Engine not available');
            return false;
        }

        try {
            this.roomId = roomId;
            // Make userId unique per tab to avoid conflicts
            this.userId = `${userId}_${Date.now().toString(36)}`;

            console.log(`[ZegoVoice] Joining room: ${roomId} as ${this.userId} (${publishAudio ? 'HOST' : 'VIEWER'})`);

            // Generate token
            const token = this.generateToken(this.userId);
            if (!token) {
                console.error('[ZegoVoice] Failed to generate token');
                return false;
            }

            // Login to room
            const result = await this.engine.loginRoom(roomId, token, {
                userID: this.userId,
                userName: userName || 'User'
            }, { userUpdate: true });

            console.log('[ZegoVoice] Login result:', result);

            // If host, start publishing audio
            if (publishAudio) {
                await this.startPublishing();
            }

            return true;
        } catch (e) {
            console.error('[ZegoVoice] Failed to join room:', e);
            return false;
        }
    }

    /**
     * Start publishing audio (host only)
     */
    async startPublishing(audioDeviceID = null) {
        if (!this.engine || !this.roomId) return false;

        try {
            // Create audio-only stream, specifying device if provided
            const cameraConfig = { audio: true, video: false };
            if (audioDeviceID) {
                cameraConfig.audioInput = audioDeviceID;
            }

            this.localStream = await this.engine.createStream({
                camera: cameraConfig
            });

            const streamID = `voice_${this.roomId}_${this.userId}`;
            console.log('[ZegoVoice] Publishing stream:', streamID);

            await this.engine.startPublishingStream(streamID, this.localStream);
            this.isPublishing = true;

            console.log('[ZegoVoice] ✅ Audio publishing started successfully');
            return true;
        } catch (e) {
            console.error('[ZegoVoice] Failed to start publishing:', e);
            return false;
        }
    }

    /**
     * Toggle microphone mute/unmute
     * @param {boolean} on - Whether to turn mic on
     * @param {string} audioDeviceID - Optional specific device ID to use
     */
    async toggleMic(on, audioDeviceID = null) {
        if (!this.localStream) {
            if (on) {
                // If turning on but no stream yet, start publishing
                return await this.startPublishing(audioDeviceID);
            }
            return false;
        }

        try {
            // Mute/unmute the audio track
            this.engine.muteMicrophone(!on);
            console.log(`[ZegoVoice] Mic ${on ? 'ON' : 'OFF'}`);
            return true;
        } catch (e) {
            console.error('[ZegoVoice] Failed to toggle mic:', e);
            return false;
        }
    }

    /**
     * Leave the room and clean up
     */
    async leaveRoom() {
        try {
            if (this.isPublishing && this.localStream) {
                const streamID = `voice_${this.roomId}_${this.userId}`;
                this.engine.stopPublishingStream(streamID);
                this.engine.destroyStream(this.localStream);
                this.localStream = null;
                this.isPublishing = false;
                console.log('[ZegoVoice] Stopped publishing');
            }

            if (this.roomId) {
                await this.engine.logoutRoom(this.roomId);
                console.log('[ZegoVoice] Left room:', this.roomId);
            }

            // Unset remote audio source
            if (this.sharedAudioEl) {
                this.sharedAudioEl.srcObject = null;
            }

            // Cleanup old dynamically created elements if they exist
            const audioElements = document.querySelectorAll('audio[id^="zego-audio-"]');
            audioElements.forEach(el => {
                el.srcObject = null;
                el.remove();
            });

            const oldAudioEl = document.getElementById('zego-remote-audio');
            if (oldAudioEl) {
                oldAudioEl.srcObject = null;
                oldAudioEl.remove();
            }

            this.roomId = null;
            this.userId = null;
        } catch (e) {
            console.error('[ZegoVoice] Error leaving room:', e);
        }
    }

    /**
     * Destroy the engine completely
     */
    destroy() {
        try {
            this.leaveRoom();
            if (this.engine) {
                this.engine.off('roomStreamUpdate');
                this.engine.off('roomStateChanged');
                this.engine.off('roomUserUpdate');
                // ZegoExpressEngine doesn't have a destroy method in web SDK
                // Just null out the reference
                this.engine = null;
                console.log('[ZegoVoice] Engine destroyed');
            }
        } catch (e) {
            console.error('[ZegoVoice] Error destroying:', e);
        }
    }
}

const zegoVoiceService = new ZegoVoiceService();
export default zegoVoiceService;
