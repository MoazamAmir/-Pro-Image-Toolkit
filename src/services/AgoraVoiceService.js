import AgoraRTC from "agora-rtc-sdk-ng";

/**
 * AgoraVoiceService — High-reliability voice streaming using Agora.io SDK.
 */
class AgoraVoiceService {
    constructor() {
        this.client = null;
        this.localAudioTrack = null;
        this.screenAudioTrack = null;
        this.remoteUsers = {}; // uid -> IRemoteAudioTrack
        this.appid = process.env.REACT_APP_AGORA_APP_ID;
        this.channelName = null;
        this.role = null; // 'host' or 'audience'
        this.onLevelChangeCallback = null;
        this._isInitialized = false;
        this._isJoined = false;
    }

    /**
     * Initialize the Agora Client
     */
    async _init(role = "audience") {
        if (this._isInitialized && this.client) {
            console.log(`[AgoraVoice] Client already initialized, updating role to: ${role}`);
            await this.client.setClientRole(role);
            return;
        }
        
        console.log(`[AgoraVoice] Initializing client as ${role}`);
        this.client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
        await this.client.setClientRole(role);
        
        // Listen for remote users joining
        this.client.on("user-published", async (user, mediaType) => {
            if (mediaType === "audio") {
                console.log(`[AgoraVoice] User ${user.uid} published audio`);
                await this.client.subscribe(user, mediaType);
                user.audioTrack.play();
                this.remoteUsers[user.uid] = user.audioTrack;
            }
        });

        this.client.on("user-unpublished", (user) => {
            console.log(`[AgoraVoice] User ${user.uid} unpublished`);
            if (this.remoteUsers[user.uid]) {
                delete this.remoteUsers[user.uid];
            }
        });

        // Set up volume indicators (for visualizers)
        this.client.enableAudioVolumeIndicator();
        this.client.on("volume-indicator", (volumes) => {
            if (!this.onLevelChangeCallback) return;

            let localLevel = 0;
            let remoteLevel = 0;

            volumes.forEach((volume) => {
                if (volume.uid === 0 || volume.uid === this.client.uid) {
                    localLevel = volume.level; // 0-100
                } else {
                    remoteLevel = Math.max(remoteLevel, volume.level);
                }
            });

            this.onLevelChangeCallback({ local: localLevel, remote: remoteLevel });
        });

        this._isInitialized = true;
    }

    /**
     * Start as HOST (Presenter) — Joins channel and optionally publishes microphone
     */
    async startHost(channelName, microphoneId = null) {
        try {
            await this._init("host");
            this.role = "host";
            this.channelName = channelName;

            if (!this._isJoined) {
                // Join the channel (uid = 1 for host for simplicity)
                await this.client.join(this.appid, channelName, null, 1);
                this._isJoined = true;
                console.log(`[AgoraVoice] Joined channel ${channelName} as Host (UID: 1)`);
            } else {
                console.warn("[AgoraVoice] Already joined a channel");
            }

            // If a microphone ID is provided, publish it immediately
            if (microphoneId && microphoneId !== 'none') {
                console.log(`[AgoraVoice] Auto-publishing mic for host: ${microphoneId}`);
                await this.publishMic(microphoneId);
            }

            return true;
        } catch (err) {
            console.error("[AgoraVoice] Host join/start failed:", err);
            return false;
        }
    }

    /**
     * Publish Microphone Track
     */
    async publishMic(microphoneId = null) {
        if (!this._isJoined) {
            console.error("[AgoraVoice] Cannot publish mic before joining channel");
            return false;
        }

        try {
            if (this.localAudioTrack) {
                if (microphoneId && microphoneId !== 'none') {
                    await this.localAudioTrack.setDevice(microphoneId);
                }
                // Only publish if not already published
                if (!this.client.localTracks.includes(this.localAudioTrack)) {
                    await this.client.publish(this.localAudioTrack);
                }
                await this.localAudioTrack.setEnabled(true);
                return true;
            }

            const micConfig = {
                encoderConfig: "high_quality_stereo",
                AEC: true,
                ANS: true,
                AGC: true
            };
            if (microphoneId && microphoneId !== 'none') micConfig.microphoneId = microphoneId;

            this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack(micConfig);
            await this.client.publish(this.localAudioTrack);
            // Ensure track is enabled immediately after publishing
            await this.localAudioTrack.setEnabled(true);
            console.log("[AgoraVoice] Microphone track published and enabled");
            return true;
        } catch (err) {
            console.error("[AgoraVoice] Mic publish failed:", err);
            return false;
        }
    }

    async switchMicrophone(deviceId) {
        if (!this.localAudioTrack) return;
        try {
            await this.localAudioTrack.setDevice(deviceId);
            console.log(`[AgoraVoice] Switched to device: ${deviceId}`);
            return true;
        } catch (err) {
            console.error("[AgoraVoice] Device switch failed:", err);
            return false;
        }
    }

    /**
     * Start System Audio (Screen Audio)
     */
    async startSystemAudio() {
        if (!this._isJoined) return false;
        try {
            this.screenAudioTrack = await AgoraRTC.createScreenVideoTrack({
                withAudio: "enable"
            }, "auto").then(tracks => {
                const audioTrack = Array.isArray(tracks) ? tracks.find(t => t.trackMediaType === "audio") : null;
                return audioTrack;
            });

            if (this.screenAudioTrack) {
                await this.client.publish(this.screenAudioTrack);
                console.log("[AgoraVoice] System audio track published");
                return true;
            }
            return false;
        } catch (err) {
            console.warn("[AgoraVoice] System audio capture failed:", err);
            return false;
        }
    }

    async startViewer(channelName) {
        try {
            await this._init("audience");
            this.role = "audience";
            this.channelName = channelName;

            if (this._isJoined) return true;

            // Join with random UID
            const uid = await this.client.join(this.appid, channelName, null, null);
            this._isJoined = true;
            console.log(`[AgoraVoice] Joined channel ${channelName} as Audience (UID: ${uid})`);
            return true;
        } catch (err) {
            console.error("[AgoraVoice] Audience join failed:", err);
            return false;
        }
    }

    /**
     * Mute/Unmute toggle
     */
    async toggleMic(on, deviceId = null) {
        try {
            if (on) {
                if (!this.localAudioTrack) {
                    await this.publishMic(deviceId);
                } else {
                    await this.localAudioTrack.setEnabled(true);
                }
            } else {
                if (this.localAudioTrack) {
                    await this.localAudioTrack.setEnabled(false);
                }
            }
            console.log(`[AgoraVoice] Mic ${on ? "Enabled" : "Disabled"}`);
        } catch (err) {
            console.error("[AgoraVoice] Mic toggle failed:", err);
        }
    }

    /**
     * Stop and cleanup
     */
    async stop() {
        try {
            if (this.localAudioTrack) {
                this.localAudioTrack.stop();
                this.localAudioTrack.close();
                this.localAudioTrack = null;
            }
            if (this.screenAudioTrack) {
                this.screenAudioTrack.stop();
                this.screenAudioTrack.close();
                this.screenAudioTrack = null;
            }
            if (this.client) {
                if (this._isJoined) {
                    await this.client.leave();
                    this._isJoined = false;
                }
                this.client = null;
            }
            this._isInitialized = false;
            this.remoteUsers = {};
            console.log("[AgoraVoice] Service stopped");
        } catch (err) {
            console.error("[AgoraVoice] Stop failed:", err);
        }
    }

    onLevelChange(callback) {
        this.onLevelChangeCallback = callback;
    }
}

const agoraVoiceService = new AgoraVoiceService();
export default agoraVoiceService;
