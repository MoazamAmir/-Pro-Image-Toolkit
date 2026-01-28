// P2P Sync Service using PeerJS for real-time cross-browser collaboration
import Peer from 'peerjs';

class P2PSyncService {
    constructor() {
        this.peer = null;
        this.connections = new Map(); // peerId -> connection
        this.projectId = null;
        this.onStateUpdate = null; // callback when state received from peer
        this.localState = null;
        this.isHost = false;
        this.broadcastChannel = null;
        this.incomingChunks = new Map(); // peerId -> { chunks: Map<index, data>, total: number, id: string }
        this.CHUNK_SIZE = 16 * 1024; // 16KB safe limit for PeerJS
    }

    // Generate a short project ID
    generateProjectId() {
        return 'p-' + Math.random().toString(36).substring(2, 10);
    }

    // Extract project ID from URL
    getProjectIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('project');
    }

    // Update URL with project ID without page reload
    setProjectIdInUrl(projectId) {
        const url = new URL(window.location.href);
        url.searchParams.set('project', projectId);
        window.history.replaceState({}, '', url.toString());
    }

    // Initialize the P2P connection
    async init(onStateUpdate) {
        this.onStateUpdate = onStateUpdate;

        // Setup BroadcastChannel for same-browser tabs sync (faster than PeerJS for same browser)
        this.broadcastChannel = new BroadcastChannel('image-editor-sync');
        this.broadcastChannel.onmessage = (event) => {
            if (event.data.type === 'state-update' && event.data.projectId === this.projectId) {
                if (this.onStateUpdate) {
                    this.onStateUpdate(event.data.state, 'broadcast');
                }
            }
        };

        // Check if project ID exists in URL
        let projectId = this.getProjectIdFromUrl();

        if (!projectId) {
            // New project - generate ID and set as host
            projectId = this.generateProjectId();
            this.setProjectIdInUrl(projectId);
            this.isHost = true;
        }

        this.projectId = projectId;

        // Create peer with project ID as peer ID (for host) or random ID (for guest)
        const peerId = this.isHost ? projectId : `${projectId}-${Date.now()}`;

        return new Promise((resolve, reject) => {
            try {
                this.peer = new Peer(peerId, {
                    debug: 0, // Reduce console noise
                    config: {
                        iceServers: [
                            { urls: 'stun:stun.l.google.com:19302' },
                            { urls: 'stun:stun1.l.google.com:19302' }
                        ]
                    }
                });

                this.peer.on('open', (id) => {
                    console.log('[P2P] Connected with peer ID:', id);

                    if (!this.isHost) {
                        // Guest: Connect to host
                        this.connectToHost(projectId);
                    }

                    resolve({ projectId, isHost: this.isHost });
                });

                this.peer.on('connection', (conn) => {
                    this.handleIncomingConnection(conn);
                });

                this.peer.on('error', (err) => {
                    console.warn('[P2P] Peer error:', err.type);
                    // Handle "unavailable-id" - means we're connecting to existing project
                    if (err.type === 'unavailable-id') {
                        this.isHost = false;
                        // Reconnect with random ID
                        this.peer = new Peer(`${projectId}-${Date.now()}`);
                        this.peer.on('open', () => {
                            this.connectToHost(projectId);
                            resolve({ projectId, isHost: false });
                        });
                        this.peer.on('connection', (conn) => {
                            this.handleIncomingConnection(conn);
                        });
                    } else if (err.type === 'peer-unavailable') {
                        // Host not available, we become the host
                        console.log('[P2P] No host found, becoming host');
                        this.isHost = true;
                        resolve({ projectId, isHost: true });
                    } else {
                        // Other errors
                        resolve({ projectId, isHost: this.isHost });
                    }
                });

                this.peer.on('disconnected', () => {
                    console.log('[P2P] Disconnected, attempting reconnect...');
                    this.peer.reconnect();
                });

            } catch (e) {
                console.error('[P2P] Init failed:', e);
                resolve({ projectId, isHost: true }); // Fallback to working locally
            }
        });
    }

    // Connect to host peer
    connectToHost(hostPeerId) {
        console.log('[P2P] Connecting to host:', hostPeerId);
        const conn = this.peer.connect(hostPeerId, { reliable: true });

        conn.on('open', () => {
            console.log('[P2P] Connected to host');
            this.connections.set(hostPeerId, conn);

            // Request current state from host
            conn.send({ type: 'request-state' });
        });

        conn.on('data', (data) => {
            this.handleData(data, conn);
        });

        conn.on('close', () => {
            console.log('[P2P] Host connection closed');
            this.connections.delete(hostPeerId);
            this.incomingChunks.delete(hostPeerId);
        });

        conn.on('error', (err) => {
            console.warn('[P2P] Connection error:', err);
        });
    }

    // Handle incoming peer connections
    handleIncomingConnection(conn) {
        console.log('[P2P] Incoming connection from:', conn.peer);

        conn.on('open', () => {
            this.connections.set(conn.peer, conn);
            console.log('[P2P] Connection established, total peers:', this.connections.size);
        });

        conn.on('data', (data) => {
            this.handleData(data, conn);
        });

        conn.on('close', () => {
            this.connections.delete(conn.peer);
            this.incomingChunks.delete(conn.peer);
        });
    }

    // Helper to send data in chunks
    async sendChunked(conn, data) {
        try {
            const json = JSON.stringify(data);
            const totalChunks = Math.ceil(json.length / this.CHUNK_SIZE);
            const msgId = Date.now().toString(36) + Math.random().toString(36).substr(2);

            for (let i = 0; i < totalChunks; i++) {
                const chunk = json.substr(i * this.CHUNK_SIZE, this.CHUNK_SIZE);
                conn.send({
                    type: 'chunk-part',
                    id: msgId,
                    idx: i,
                    total: totalChunks,
                    payload: chunk
                });

                // Throttle to prevent WebRTC buffer overflow
                // This is critical for large image data transfer reliability
                if (i % 5 === 0) { // Slight optimization: wait every 5 chunks
                    await new Promise(resolve => setTimeout(resolve, 10));
                }
            }
        } catch (e) {
            console.error('[P2P] Failed to send chunked data:', e);
        }
    }

    // Handle incoming data from peers
    handleData(data, fromConn) {
        // Handle chunks
        if (data.type === 'chunk-part') {
            const { id, idx, total, payload } = data;

            let tracker = this.incomingChunks.get(fromConn.peer);
            if (!tracker || tracker.id !== id) {
                tracker = { id, chunks: new Map(), total };
                this.incomingChunks.set(fromConn.peer, tracker);
            }

            tracker.chunks.set(idx, payload);

            if (tracker.chunks.size === total) {
                // All chunks received, reassemble
                try {
                    let fullJson = '';
                    for (let i = 0; i < total; i++) {
                        fullJson += tracker.chunks.get(i);
                    }
                    const originalData = JSON.parse(fullJson);
                    this.incomingChunks.delete(fromConn.peer);

                    // Recursive call to handle the reassembled data
                    this.handleData(originalData, fromConn);
                    return;
                } catch (e) {
                    console.error('[P2P] Failed to reassemble chunks:', e);
                    this.incomingChunks.delete(fromConn.peer);
                    return;
                }
            }
            return;
        }

        // Handle regular messages
        if (data.type === 'request-state') {
            // Send current state to requester
            if (this.localState) {
                // Use chunked sending for full state as it might be large
                this.sendChunked(fromConn, { type: 'full-state', state: this.localState });
            }
        } else if (data.type === 'full-state') {
            // Received full state (usually when joining)
            if (this.onStateUpdate) {
                this.onStateUpdate(data.state, 'p2p-full');
            }
        } else if (data.type === 'state-update') {
            // Received incremental state update
            if (this.onStateUpdate) {
                this.onStateUpdate(data.state, 'p2p-update');
            }
            // Forward to other peers if we're host (excluding sender)
            if (this.isHost) {
                this.broadcast(data, fromConn.peer);
            }
        }
    }

    // Broadcast state to all connected peers and same-browser tabs
    broadcast(data, excludePeerId = null) {
        // P2P broadcast - use chunked for reliability
        this.connections.forEach((conn, peerId) => {
            if (peerId !== excludePeerId && conn.open) {
                this.sendChunked(conn, data);
            }
        });

        // BroadcastChannel for same-browser tabs (no chunking needed)
        if (this.broadcastChannel) {
            this.broadcastChannel.postMessage({
                type: 'state-update',
                projectId: this.projectId,
                state: data.state
            });
        }
    }

    // Update local state and broadcast to peers
    syncState(state) {
        this.localState = state;
        this.broadcast({ type: 'state-update', state });
    }

    // Get current project URL for sharing
    getShareUrl() {
        const url = new URL(window.location.href);
        url.searchParams.set('project', this.projectId);
        // Remove hash if any
        url.hash = '';
        return url.toString();
    }

    // Cleanup
    destroy() {
        if (this.peer) {
            this.peer.destroy();
        }
        if (this.broadcastChannel) {
            this.broadcastChannel.close();
        }
        this.connections.clear();
        this.incomingChunks.clear();
    }
}

// Singleton instance
const p2pService = new P2PSyncService();
export default p2pService;
