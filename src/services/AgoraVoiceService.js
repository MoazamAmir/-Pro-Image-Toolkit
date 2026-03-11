import AgoraRTC from "agora-rtc-sdk-ng";

/**
 * AgoraVoiceService — High-reliability voice streaming using Agora.io SDK.
 */
class AgoraVoiceService {
    constructor() {
        this.client = null;
        this.localAudioTrack = null;
        this.remoteUsers = {}; // uid -> IRemoteAudioTrack
        this.appid = process.env.REACT_APP_AGORA_APP_ID;
        this.channelName = null;
        this.role = null;
        this.onLevelChangeCallback = null;
        this._isInitialized = false;
    }

    /**
     * Initialize the Agora Client
     */
    async _init() {
        if (this._isInitialized) return;
        
        this.client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        
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
     * Start as HOST (Presenter)
     */
    async startHost(channelName, microphoneId = null, includeSystemAudio = false) {
        try {
            await this._init();
            this.role = "host";
            this.channelName = channelName;

            // Join the channel (uid = 1 for host for simplicity)
            await this.client.join(this.appid, channelName, null, 1);
            console.log(`[AgoraVoice] Joined channel ${channelName} as Host`);

            const tracks = [];

            // 1. Create Microphone Track
            try {
                const micConfig = {
                    encoderConfig: "high_quality_stereo",
                    AEC: true,
                    ANS: true,
                    AGC: true
                };
                if (microphoneId) {
                    micConfig.microphoneId = microphoneId;
                }
                
                this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack(micConfig);
                tracks.push(this.localAudioTrack);
                console.log(`[AgoraVoice] Mic track created${microphoneId ? ` with device: ${microphoneId}` : ''}`);
            } catch (micErr) {
                console.error("[AgoraVoice] Failed to create mic track:", micErr);
            }

            // 2. Create System Audio Track (Screen Capture Audio)
            if (includeSystemAudio) {
                try {
                    // This typically requires user permission for screen share
                    this.screenAudioTrack = await AgoraRTC.createScreenVideoTrack({
                        withAudio: "enable"
                    }, "auto").then(tracks => {
                        // We only want the audio part if any
                        const audioTrack = Array.isArray(tracks) ? tracks.find(t => t.trackMediaType === "audio") : null;
                        return audioTrack;
                    });
                    
                    if (this.screenAudioTrack) {
                        tracks.push(this.screenAudioTrack);
                        console.log("[AgoraVoice] System audio track added");
                    }
                } catch (sysErr) {
                    console.warn("[AgoraVoice] System audio capture failed or cancelled:", sysErr);
                }
            }

            if (tracks.length > 0) {
                await this.client.publish(tracks);
                console.log(`[AgoraVoice] ${tracks.length} track(s) published`);
            }

            return true;
        } catch (err) {
            console.error("[AgoraVoice] Host start failed:", err);
            return false;
        }
    }

    /**
     * Switch microphone on the fly
     */
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
     * Start as VIEWER (Audience)
     */
    async startViewer(channelName) {
        try {
            await this._init();
            this.role = "viewer";
            this.channelName = channelName;

            // Join with random UID
            const uid = await this.client.join(this.appid, channelName, null, null);
            console.log(`[AgoraVoice] Joined channel ${channelName} as Viewer (UID: ${uid})`);
            return true;
        } catch (err) {
            console.error("[AgoraVoice] Viewer join failed:", err);
            return false;
        }
    }

    /**
     * Mute/Unmute toggle
     */
    async toggleMic(on, deviceId = null) {
        // If we don't have a track yet, try to start it (if host)
        if (!this.localAudioTrack && on && this.role === "host") {
            // This case might happen if they toggle mic after stopping
            // Re-creating track is safer
            this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
                microphoneId: deviceId,
                AEC: true, ANS: true, AGC: true
            });
            await this.client.publish(this.localAudioTrack);
        }

        if (this.localAudioTrack) {
            await this.localAudioTrack.setEnabled(on);
            console.log(`[AgoraVoice] Mic ${on ? "Enabled" : "Disabled"}`);
        }
    }

    /**
     * Stop and cleanup
     */
    async stop() {
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
            await this.client.leave();
            this.client = null;
        }
        this._isInitialized = false;
        this.remoteUsers = {};
        console.log("[AgoraVoice] Service stopped");
    }

    onLevelChange(callback) {
        this.onLevelChangeCallback = callback;
    }
}

const agoraVoiceService = new AgoraVoiceService();
export default agoraVoiceService;
