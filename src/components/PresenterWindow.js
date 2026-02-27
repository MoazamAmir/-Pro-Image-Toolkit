import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    X, ChevronLeft, ChevronRight, Maximize2, Play, Pause,
    PenTool, Keyboard, Timer, Clipboard, MoreHorizontal,
    RotateCcw, ZoomIn, Edit3, Radio, Settings, Users, Copy, Hash,
    ThumbsUp, Clock, ChevronDown, Eraser, Highlighter, Pen, Undo,
    Video, CheckCircle, Check, Download, Trash2,
    Palette, Search, ImageIcon, LayoutGrid, Layers, MousePointer2,
    Type, Square as SquareIcon, Circle as CircleIcon, Triangle as TriangleIcon,
    Pentagon as PentagonIcon, Hexagon as HexagonIcon, Octagon as OctagonIcon,
    Star as StarIcon, ArrowRight, Minus, RefreshCw, Lock, Unlock,
    ArrowUp, ArrowDown, Move, RotateCw, FlipHorizontal, Sparkles, MoreVertical,
    Mic, MicOff
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import FirebaseSyncService from '../services/FirebaseSyncService';
import LiveSessionService from '../services/LiveSessionService';
import useRecording from './PresentAndRecord/useRecording';
import SlideRenderer from './SlideRenderer';

const PresenterWindow = ({ designId, user }) => {
    // Design state
    const [pages, setPages] = useState([]);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [canvasSize, setCanvasSize] = useState({ width: 1920, height: 1080 });
    const [adjustments, setAdjustments] = useState({});
    const [isMicOn, setIsMicOn] = useState(false);
    const [previewImages, setPreviewImages] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    // Clock & Timer
    const [currentTime, setCurrentTime] = useState('');
    const [elapsed, setElapsed] = useState(0);
    const [timerRunning, setTimerRunning] = useState(false);
    const timerRef = useRef(null);

    // Right sidebar
    const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'live'
    const [notes, setNotes] = useState('');

    // Live session
    const [liveSession, setLiveSession] = useState(null);
    const [sessionCode, setSessionCode] = useState('');
    const [viewerCount, setViewerCount] = useState(0);
    const [showInvitePopup, setShowInvitePopup] = useState(false);
    const [comments, setComments] = useState([]);
    const [copiedInvite, setCopiedInvite] = useState(false);

    // Laser pointer position
    const [laserPos, setLaserPos] = useState({ x: 50, y: 50 });

    const [activeTool, setActiveTool] = useState(null); // 'laser' | 'draw'

    // Drawing state
    const [drawingPaths, setDrawingPaths] = useState({}); // { [pageId]: [] }
    const [currentPath, setCurrentPath] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawingColor, setDrawingColor] = useState('#ff3b3b');
    const [drawingTool, setDrawingTool] = useState('pen'); // 'pen' | 'marker' | 'highlighter' | 'eraser'
    const [showDrawingToolbar, setShowDrawingToolbar] = useState(false);

    const canvasRef = useRef(null);
    const lastLaserSyncRef = useRef(0);

    const sessionUnsubRef = useRef(null);
    const commentsUnsubRef = useRef(null);
    const reactionUnsubRef = useRef(null);

    const [reactions, setReactions] = useState([]); // { id, type, x, y }
    const lastDrawingSyncRef = useRef(0);

    // Magic Shortcuts State
    const [activeMagicEffect, setActiveMagicEffect] = useState(null); // 'blur' | 'quiet' | 'bubbles' | 'confetti' | 'drumroll' | 'curtain' | 'mic-drop'
    const [showMagicPopup, setShowMagicPopup] = useState(false);
    const audioRef = useRef(null);

    const magicShortcuts = [
        { id: 'blur', label: 'Blur', key: 'B', icon: <div className="pw-m-icon blur-icon">🌐</div> },
        { id: 'quiet', label: 'Quiet', key: 'Q', icon: <div className="pw-m-icon quiet-icon">🤫</div> },
        { id: 'bubbles', label: 'Bubbles', key: 'O', icon: <div className="pw-m-icon bubbles-icon">🫧</div> },
        { id: 'confetti', label: 'Confetti', key: 'C', icon: <div className="pw-m-icon confetti-icon">🎉</div> },
        { id: 'drumroll', label: 'Drumroll', key: 'D', icon: <div className="pw-m-icon drumroll-icon">🥁</div> },
        { id: 'curtain', label: 'Curtain call', key: 'U', icon: <div className="pw-m-icon curtain-icon">🎀</div> },
        { id: 'mic-drop', label: 'Mic drop', key: 'M', icon: <div className="pw-m-icon mic-icon">🎤</div> },
    ];

    const playMagicSound = (effectId) => {
        if (!audioRef.current) audioRef.current = new Audio();

        // Mapping of effects to sound URLs (Use user's sounds or placeholders)
        const sounds = {
            'blur': 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', // Whoosh
            'quiet': 'https://www.soundjay.com/human/shh-1.mp3', // Shh
            'bubbles': 'https://assets.mixkit.co/active_storage/sfx/1110/1110-preview.mp3', // Bubbles
            'confetti': 'https://assets.mixkit.co/active_storage/sfx/2012/2012-preview.mp3', // Pop
            'drumroll': 'https://assets.mixkit.co/active_storage/sfx/2654/2654-preview.mp3', // Drumroll
            'curtain': 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', // Slide
            'mic-drop': 'https://www.soundjay.com/mechanical/microphone-drop-1.mp3' // Mic drop
        };

        if (sounds[effectId]) {
            audioRef.current.src = sounds[effectId];
            audioRef.current.play().catch(e => console.log("Audio play blocked or failed"));
        }
    };

    const triggerMagicEffect = useCallback((effectId) => {
        if (effectId === 'clear') {
            setActiveMagicEffect(null);
            return;
        }
        setActiveMagicEffect(effectId);
        playMagicSound(effectId);

        // Auto-clear some effects after a few seconds
        if (['confetti', 'mic-drop', 'bubbles', 'drumroll'].includes(effectId)) {
            setTimeout(() => {
                setActiveMagicEffect(prev => (prev === effectId ? null : prev));
            }, 5000);
        }
    }, []);

    const {
        phase, setPhase, elapsedTime: recordElapsed, countdownValue,
        recordedBlob, processingProgress,
        startCountdown, prepareRecording, executeRecording,
        pauseRecording, resumeRecording, stopRecording,
        downloadRecording, discardRecording, formatTime: formatRecordTime,
        enumerateDevices
    } = useRecording();

    // -- Clock --
    useEffect(() => {
        const tick = () => {
            const now = new Date();
            let h = now.getHours();
            const ampm = h >= 12 ? 'pm' : 'am';
            h = h % 12 || 12;
            const m = String(now.getMinutes()).padStart(2, '0');
            setCurrentTime(`${h}:${m}${ampm}`);
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    // -- Enumerate Recording Devices --
    useEffect(() => {
        enumerateDevices();
    }, [enumerateDevices]);

    // -- Timer --
    useEffect(() => {
        if (timerRunning) {
            timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [timerRunning]);

    const formattedTimer = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`;

    // -- Load design from Firebase --
    useEffect(() => {
        if (!designId) return;
        const loadDesign = async () => {
            setIsLoading(true);
            try {
                const data = await FirebaseSyncService.getDesign(designId);
                if (data) {
                    const pp = data.pages || [{ id: 1, layers: [], canvasSize: data.canvasSize || { width: 1080, height: 720 } }];
                    setPages(pp);
                    setCanvasSize(data.canvasSize || { width: 1080, height: 720 });
                    setAdjustments(data.adjustments || {});
                    // Render thumbnails from layers
                    renderAllPreviews(pp);
                }
            } catch (err) {
                console.error('Error loading design:', err);
            } finally {
                setIsLoading(false);
            }
        };
        loadDesign();

        // Also listen for real-time updates
        const unsub = FirebaseSyncService.initSync(designId, (data) => {
            if (data?.pages) {
                setPages(data.pages);
                renderAllPreviews(data.pages);
            }
            if (data?.canvasSize) {
                setCanvasSize(data.canvasSize);
            }
            if (data?.adjustments) {
                setAdjustments(data.adjustments);
            }
        });

        return () => { if (unsub) unsub(); };
    }, [designId]);

    // Render page previews from layer data
    const renderAllPreviews = useCallback((pp) => {
        pp.forEach((page) => {
            const pageLayers = page.layers || [];
            // Find the best image to use as preview
            const bgLayer = pageLayers.find(l => l.id === 'background-layer' || l.isBackground);
            const imageLayer = pageLayers.find(l => l.shapeType === 'image' && l.content);
            const src = imageLayer?.content || bgLayer?.content || null;

            if (src && typeof src === 'string' && src.startsWith('http')) {
                setPreviewImages(prev => ({ ...prev, [page.id]: src }));
            } else if (bgLayer && bgLayer.color) {
                // If it's just a background color, store the color
                setPreviewImages(prev => ({ ...prev, [page.id]: { type: 'color', value: bgLayer.color } }));
            }
        });
    }, []);

    // -- Navigation --
    const totalPages = pages.length;
    const goToPage = (idx) => {
        if (idx >= 0 && idx < totalPages) {
            setCurrentPageIndex(idx);
            if (liveSession) {
                LiveSessionService.updateActivePage(liveSession.id, idx);
            }
        }
    };
    const goNext = () => goToPage(currentPageIndex + 1);
    const goPrev = () => goToPage(currentPageIndex - 1);

    // Keyboard
    useEffect(() => {
        const handleKey = (e) => {
            const key = e.key.toUpperCase();
            if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goNext(); }
            else if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
            else if (e.key === 'Escape') {
                if (showMagicPopup) setShowMagicPopup(false);
                else window.close();
            }
            // Magic Shortcuts
            else if (key === 'B') triggerMagicEffect('blur');
            else if (key === 'Q') triggerMagicEffect('quiet');
            else if (key === 'O') triggerMagicEffect('bubbles');
            else if (key === 'C') triggerMagicEffect('confetti');
            else if (key === 'D') triggerMagicEffect('drumroll');
            else if (key === 'U') triggerMagicEffect('curtain');
            else if (key === 'M') triggerMagicEffect('mic-drop');
            else if (key === 'X') triggerMagicEffect('clear');
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [currentPageIndex, totalPages, triggerMagicEffect, showMagicPopup]);

    // -- Live Session --
    const startLiveSession = async () => {
        if (!designId || !user) return;
        try {
            const { sessionId, sessionCode: code } = await LiveSessionService.createSession(
                designId, user.uid, user.displayName || user.email
            );
            setSessionCode(code);

            // Listen to session
            sessionUnsubRef.current = LiveSessionService.listenToSession(sessionId, (data) => {
                setLiveSession({ id: sessionId, ...data });
                setViewerCount(data.viewerCount || 0);
            });

            // Listen to comments
            commentsUnsubRef.current = LiveSessionService.listenToComments(sessionId, (c) => {
                setComments(c);
            });

            // Listen to reactions
            reactionUnsubRef.current = LiveSessionService.listenToReactions(sessionId, (reaction) => {
                const id = reaction.id || Date.now();
                // Random position for variety
                const newReaction = {
                    id,
                    type: reaction.type,
                    x: 20 + Math.random() * 60, // Keep in middle area
                    y: 80 // Start from bottom
                };
                setReactions(prev => [...prev.slice(-15), newReaction]); // Keep last 15
                // Auto-remove after animation
                setTimeout(() => {
                    setReactions(prev => prev.filter(r => r.id !== id));
                }, 4000);
            });

            setLiveSession({ id: sessionId });
        } catch (err) {
            console.error('Failed to start live session:', err);
        }
    };

    const endLiveSession = async () => {
        if (liveSession?.id) {
            await LiveSessionService.endSession(liveSession.id);
        }
        if (sessionUnsubRef.current) sessionUnsubRef.current();
        if (commentsUnsubRef.current) commentsUnsubRef.current();
        if (reactionUnsubRef.current) reactionUnsubRef.current();
        setLiveSession(null);
        setSessionCode('');
        setViewerCount(0);
        setComments([]);
        setReactions([]);
        setShowInvitePopup(false);
    };

    const handleToggleLike = async (commentId) => {
        if (!liveSession) return;
        await LiveSessionService.toggleLike(liveSession.id, commentId, user.uid);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (sessionUnsubRef.current) sessionUnsubRef.current();
            if (commentsUnsubRef.current) commentsUnsubRef.current();
            if (reactionUnsubRef.current) reactionUnsubRef.current();
        };
    }, []);

    const copyInvitation = () => {
        if (!sessionCode) return;
        // Normalize code: remove spaces for the URL, keep it simple
        const normalizedCode = sessionCode.replace(/\s/g, '');
        const url = `${window.location.origin}/live/${normalizedCode}`;

        navigator.clipboard.writeText(url).then(() => {
            setCopiedInvite(true);
            setTimeout(() => setCopiedInvite(false), 2000);
        });
    };

    // Fullscreen
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen();
        else document.exitFullscreen();
    };

    // -- Mouse Move for Laser --
    const handleMouseMove = (e) => {
        if (!activeTool) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        if (activeTool === 'laser') {
            setLaserPos({ x, y });
            // Sync laser position (throttled to ~20fps for better host-to-audience smoothness)
            const now = Date.now();
            if (liveSession?.id && now - lastLaserSyncRef.current > 50) {
                LiveSessionService.updateLaserPosition(liveSession.id, { x, y });
                lastLaserSyncRef.current = now;
            }
        } else if (activeTool === 'draw' && isDrawing) {
            const newPoint = { x, y };
            setCurrentPath(prev => {
                const updatedPath = {
                    ...prev,
                    points: [...prev.points, newPoint]
                };

                // Sync current path mid-draw (throttled to save Firestore writes)
                const now = Date.now();
                if (liveSession?.id && now - lastDrawingSyncRef.current > 200) {
                    LiveSessionService.updateCurrentPath(liveSession.id, updatedPath);
                    lastDrawingSyncRef.current = now;
                }

                return updatedPath;
            });
        }
    };

    const handleMouseDown = (e) => {
        if (activeTool !== 'draw') return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        setIsDrawing(true);
        setCurrentPath({
            tool: drawingTool,
            color: drawingTool === 'eraser' ? 'transparent' : drawingColor,
            width: drawingTool === 'marker' ? 8 : drawingTool === 'highlighter' ? 12 : 3,
            opacity: drawingTool === 'highlighter' ? 0.4 : 1,
            points: [{ x, y }]
        });
    };

    const syncDrawings = useCallback((paths) => {
        if (liveSession?.id) {
            LiveSessionService.updateDrawings(liveSession.id, paths);
        }
    }, [liveSession]);

    const handleMouseUp = () => {
        if (activeTool === 'draw' && isDrawing && currentPath) {
            const pageId = pages[currentPageIndex]?.id;
            if (pageId) {
                const newPaths = {
                    ...drawingPaths,
                    [pageId]: [...(drawingPaths[pageId] || []), currentPath]
                };
                setDrawingPaths(newPaths);
                syncDrawings(newPaths);
            }
        }
        setIsDrawing(false);
        setCurrentPath(null);
    };

    const undoDrawing = () => {
        const pageId = pages[currentPageIndex]?.id;
        if (pageId && drawingPaths[pageId]?.length > 0) {
            setDrawingPaths(prev => {
                const newPagePaths = [...prev[pageId]];
                newPagePaths.pop();
                const newPaths = { ...prev, [pageId]: newPagePaths };
                syncDrawings(newPaths);
                return newPaths;
            });
        }
    };

    const clearDrawings = () => {
        const pageId = pages[currentPageIndex]?.id;
        if (pageId) {
            const newPaths = { ...drawingPaths, [pageId]: [] };
            setDrawingPaths(newPaths);
            syncDrawings(newPaths);
        }
    };

    const toggleMic = async () => {
        if (!isMicOn) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                window.localStream = stream;
                setIsMicOn(true);
                if (liveSession?.id) {
                    await LiveSessionService.sendSignal(liveSession.id, {
                        type: 'host-voice-ready',
                        hostId: user.uid,
                        timestamp: Date.now()
                    });
                }
            } catch (err) {
                console.error('Microphone access denied:', err);
                alert('Microphone access is required for voice broadcast.');
            }
        } else {
            if (window.localStream) {
                window.localStream.getTracks().forEach(t => t.stop());
                window.localStream = null;
            }
            setIsMicOn(false);
            if (liveSession?.id) {
                await LiveSessionService.sendSignal(liveSession.id, {
                    type: 'host-voice-stopped',
                    hostId: user.uid,
                    timestamp: Date.now()
                });
            }
        }
    };

    // Voice Cleanup & Peer Management
    useEffect(() => {
        if (!liveSession?.id || !isMicOn) return;

        const pcs = {}; // viewerId -> RTCPeerConnection

        const unsub = LiveSessionService.listenToSignals(liveSession.id, async (signal) => {
            // Case 1: Viewer requesting voice stream
            if (signal.type === 'viewer-request-voice' && signal.toId === user.uid) {
                const viewerId = signal.fromId;
                if (pcs[viewerId]) return;

                const pc = new RTCPeerConnection({
                    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
                });
                pcs[viewerId] = pc;

                if (window.localStream) {
                    window.localStream.getTracks().forEach(track => pc.addTrack(track, window.localStream));
                }

                pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        LiveSessionService.sendSignal(liveSession.id, {
                            type: 'host-ice-candidate',
                            fromId: user.uid,
                            toId: viewerId,
                            candidate: event.candidate.toJSON()
                        });
                    }
                };

                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);

                await LiveSessionService.sendSignal(liveSession.id, {
                    type: 'host-voice-offer',
                    fromId: user.uid,
                    toId: viewerId,
                    offer: { sdp: offer.sdp, type: offer.type }
                });
            }
            // Case 2: Viewer providing an answer to our offer
            else if (signal.type === 'viewer-voice-answer' && signal.toId === user.uid) {
                const pc = pcs[signal.fromId];
                if (pc && pc.signalingState !== 'stable') {
                    await pc.setRemoteDescription(new RTCSessionDescription(signal.answer));
                }
            }
            // Case 3: Viewer providing ICE candidate
            else if (signal.type === 'viewer-ice-candidate' && signal.toId === user.uid) {
                const pc = pcs[signal.fromId];
                if (pc) {
                    await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
                }
            }
        });

        return () => {
            unsub();
            Object.values(pcs).forEach(pc => pc.close());
            if (window.localStream) {
                window.localStream.getTracks().forEach(t => t.stop());
                window.localStream = null;
            }
        };
    }, [liveSession?.id, isMicOn, user?.uid]);

    const currentPage = pages[currentPageIndex];
    const currentSrc = currentPage ? previewImages[currentPage.id] : null;

    if (isLoading) {
        return (
            <div className="pw-root">
                <div className="pw-loading">
                    <div className="pw-spinner" />
                    <p>Loading presentation...</p>
                </div>
                <style>{presenterStyles}</style>
            </div>
        );
    }

    return (
        <div className="pw-root">
            {/* === TOP BAR === */}
            <div className="pw-topbar">
                <div className="pw-topbar-left">
                    <span className="pw-clock">{currentTime}</span>
                    {isMicOn && (
                        <div className="pw-voice-badge">
                            <Mic size={12} />
                            <span>BROADCASTING</span>
                        </div>
                    )}
                    <span className="pw-divider">|</span>
                    <span className="pw-timer">{formattedTimer}</span>
                    <button className="pw-icon-btn" title="Reset timer" onClick={() => { setElapsed(0); setTimerRunning(false); if (phase === 'recording') stopRecording(); }}>
                        <RotateCcw size={16} />
                    </button>
                    <button
                        className={`pw-icon-btn pw-play-btn ${phase === 'recording' ? 'is-recording' : ''}`}
                        title={phase === 'recording' ? 'Pause Recording' : 'Start Recording'}
                        onClick={async () => {
                            if (phase === 'setup' || phase === 'done') {
                                const ok = await prepareRecording();
                                if (ok) {
                                    startCountdown(() => {
                                        executeRecording();
                                        setTimerRunning(true);
                                    });
                                }
                            } else if (phase === 'recording') {
                                pauseRecording();
                                setTimerRunning(false);
                            } else if (phase === 'paused') {
                                resumeRecording();
                                setTimerRunning(true);
                            }
                        }}
                    >
                        {phase === 'recording' ? <Pause size={16} /> : <Play size={16} />}
                        {phase === 'recording' && <span className="pw-rec-indicator" />}
                    </button>
                </div>
                <div className="pw-topbar-tools">
                    <div className="pw-tool-group">
                        <button
                            className={`pw-tool-btn ${isMicOn ? 'active' : ''}`}
                            title={isMicOn ? "Turn off Microphone" : "Turn on Microphone"}
                            onClick={toggleMic}
                        >
                            {isMicOn ? <Mic size={18} className="text-purple-400" /> : <MicOff size={18} />}
                        </button>

                        <button
                            className={`pw-tool-btn ${activeTool === 'draw' ? 'active' : ''}`}
                            title="Draw on page"
                            onClick={() => {
                                const newVal = activeTool === 'draw' ? null : 'draw';
                                setActiveTool(newVal);
                                setShowDrawingToolbar(newVal === 'draw');
                            }}
                        >
                            <Pen size={18} />
                        </button>

                        {showDrawingToolbar && (
                            <div className="pw-drawing-toolbar">
                                <button
                                    className={`pw-draw-tool ${drawingTool === 'pen' ? 'active' : ''}`}
                                    onClick={() => setDrawingTool('pen')}
                                    title="Pen"
                                >
                                    <Pen size={16} />
                                </button>
                                <button
                                    className={`pw-draw-tool ${drawingTool === 'marker' ? 'active' : ''}`}
                                    onClick={() => setDrawingTool('marker')}
                                    title="Marker"
                                >
                                    <PenTool size={16} />
                                </button>
                                <button
                                    className={`pw-draw-tool ${drawingTool === 'highlighter' ? 'active' : ''}`}
                                    onClick={() => setDrawingTool('highlighter')}
                                    title="Highlighter"
                                >
                                    <Highlighter size={16} />
                                </button>
                                <button
                                    className={`pw-draw-tool ${drawingTool === 'eraser' ? 'active' : ''}`}
                                    onClick={() => setDrawingTool('eraser')}
                                    title="Eraser"
                                >
                                    <Eraser size={16} />
                                </button>
                                <div className="pw-draw-divider" />
                                <div className="pw-color-options">
                                    {['#ff3b3b', '#ffffff', '#3b82f6', '#10b981', '#f59e0b'].map(c => (
                                        <button
                                            key={c}
                                            className={`pw-color-btn ${drawingColor === c ? 'active' : ''}`}
                                            style={{ backgroundColor: c }}
                                            onClick={() => setDrawingColor(c)}
                                        />
                                    ))}
                                </div>
                                <div className="pw-draw-divider" />
                                <button className="pw-draw-tool" onClick={undoDrawing} title="Undo">
                                    <Undo size={14} />
                                </button>
                                <button className="pw-draw-tool" onClick={clearDrawings} title="Clear all">
                                    <RotateCcw size={14} />
                                </button>
                                <button className="pw-draw-tool pw-close-draw" onClick={() => { setActiveTool(null); setShowDrawingToolbar(false); }} title="Close">
                                    <X size={14} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* <button className={`pw-tool-btn ${activeTool === 'laser' ? 'active' : ''}`} title="Laser pointer" onClick={() => { setActiveTool(activeTool === 'laser' ? null : 'laser'); setShowDrawingToolbar(false); }}>
                        <PenTool size={18} />
                    </button> */}
                    <button
                        className={`pw-tool-btn ${showMagicPopup ? 'active' : ''}`}
                        title="Magic shortcuts"
                        onClick={() => setShowMagicPopup(!showMagicPopup)}
                    >
                        <Keyboard size={18} />
                    </button>

                    {showMagicPopup && (
                        <div className="pw-magic-popup">
                            <div className="pw-magic-header">
                                <Keyboard size={14} />
                                <span>Magic Shortcuts</span>
                            </div>
                            <div className="pw-magic-list">
                                {magicShortcuts.map(s => (
                                    <button
                                        key={s.id}
                                        className={`pw-magic-item ${activeMagicEffect === s.id ? 'active' : ''}`}
                                        onClick={() => { triggerMagicEffect(s.id); setShowMagicPopup(false); }}
                                    >
                                        <span className="pw-magic-icon">{s.icon}</span>
                                        <span className="pw-magic-label">{s.label}</span>
                                        <span className="pw-magic-key">{s.key}</span>
                                    </button>
                                ))}
                                <div className="pw-magic-divider" />
                                <button className="pw-magic-item clear" onClick={() => { triggerMagicEffect('clear'); setShowMagicPopup(false); }}>
                                    <RotateCcw size={14} />
                                    <span className="pw-magic-label">Clear</span>
                                    <span className="pw-magic-key">X</span>
                                </button>
                            </div>
                        </div>
                    )}
                    <button className="pw-tool-btn" title="Timer">
                        <Timer size={18} />
                    </button>
                    <button className="pw-tool-btn" title="Clipboard">
                        <Clipboard size={18} />
                    </button>
                    <button className="pw-tool-btn" title="More options">
                        <MoreHorizontal size={18} />
                    </button>
                    <button className="pw-tool-btn" title="Close" onClick={() => window.close()}>
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* === BODY === */}
            <div className="pw-body">
                {/* Slide area */}
                <div className="pw-slide-area">
                    <div className="pw-slide-container">
                        {/* Nav arrows */}
                        {currentPageIndex > 0 && (
                            <button className="pw-nav-arrow pw-nav-left" onClick={goPrev}>
                                <ChevronLeft size={28} />
                            </button>
                        )}
                        <div
                            className="pw-slide-frame"
                            ref={canvasRef}
                            style={{
                                width: `${canvasSize.width}px`,
                                height: `${canvasSize.height}px`,
                                maxWidth: '100%',
                                maxHeight: 'calc(100vh - 220px)',
                                objectFit: 'contain',
                                position: 'relative',
                                containerType: 'size',
                                ...(activeTool === 'laser' ? { cursor: 'none' } : activeTool === 'draw' ? { cursor: 'crosshair' } : {})
                            }}
                            onMouseMove={handleMouseMove}
                            onMouseDown={handleMouseDown}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
                            {/* Faithful Layer Rendering using shared component */}
                            <SlideRenderer
                                page={pages[currentPageIndex]}
                                canvasSize={canvasSize}
                                adjustments={adjustments}
                                overlays={
                                    <>
                                        {/* Drawings Layer Overlay */}
                                        <svg className="pw-drawings-layer" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, zIndex: 50, pointerEvents: 'none', width: '100%', height: '100%' }}>
                                            {pages[currentPageIndex] && (drawingPaths[pages[currentPageIndex].id] || []).map((path, idx) => (
                                                <polyline
                                                    key={idx}
                                                    points={path.points.map(p => `${p.x} ${p.y}`).join(',')}
                                                    stroke={path.color}
                                                    strokeWidth={path.width}
                                                    strokeOpacity={path.opacity}
                                                    fill="none"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    style={path.tool === 'eraser' ? { mixBlendMode: 'destination-out' } : {}}
                                                />
                                            ))}
                                            {currentPath && (
                                                <polyline
                                                    points={currentPath.points.map(p => `${p.x} ${p.y}`).join(',')}
                                                    stroke={currentPath.color}
                                                    strokeWidth={currentPath.width}
                                                    strokeOpacity={currentPath.opacity}
                                                    fill="none"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    style={currentPath.tool === 'eraser' ? { mixBlendMode: 'destination-out' } : {}}
                                                />
                                            )}
                                        </svg>
                                        {/* Laser Pointer Overlay */}
                                        {activeTool === 'laser' && (
                                            <div
                                                className="pw-laser-dot"
                                                style={{ left: `${laserPos.x}%`, top: `${laserPos.y}%` }}
                                            />
                                        )}
                                    </>
                                }
                            />


                            {/* Floating Reactions */}
                            {reactions.map(r => (
                                <div
                                    key={r.id}
                                    className="pw-floating-reaction"
                                    style={{ left: `${r.x}%`, top: `${r.y}%` }}
                                >
                                    {r.type === 'heart' ? '❤️' : r.type === 'clap' ? '👏' : r.type === 'celebrate' ? '🎉' : '👍'}
                                </div>
                            ))}

                            {/* Magic Effects Layer */}
                            {activeMagicEffect && (
                                <div className={`pw-magic-layer ${activeMagicEffect}`}>
                                    {activeMagicEffect === 'blur' && <div className="pw-blur-overlay" />}
                                    {activeMagicEffect === 'quiet' && (
                                        <div className="pw-quiet-effect">
                                            <div className="pw-shh-emoji">🤫</div>
                                            <div className="pw-shh-pulse" />
                                        </div>
                                    )}
                                    {activeMagicEffect === 'bubbles' && (
                                        <div className="pw-bubbles-container">
                                            {[...Array(15)].map((_, i) => <div key={i} className="pw-bubble" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s` }} />)}
                                        </div>
                                    )}
                                    {activeMagicEffect === 'confetti' && (
                                        <div className="pw-confetti-container">
                                            {[...Array(30)].map((_, i) => <div key={i} className="pw-confetti-piece" style={{ left: `${Math.random() * 100}%`, backgroundColor: ['#8B3DFF', '#FFD700', '#00C2FF', '#FF3B3B'][i % 4], animationDelay: `${Math.random() * 0.5}s` }} />)}
                                        </div>
                                    )}
                                    {activeMagicEffect === 'curtain' && (
                                        <div className="pw-curtain-container">
                                            <div className="pw-curtain-left" />
                                            <div className="pw-curtain-right" />
                                        </div>
                                    )}
                                    {activeMagicEffect === 'mic-drop' && (
                                        <div className="pw-mic-drop-effect">
                                            <div className="pw-mic-icon">🎤</div>
                                            <div className="pw-mic-impact" />
                                        </div>
                                    )}
                                    {activeMagicEffect === 'drumroll' && (
                                        <div className="pw-drumroll-effect">
                                            <div className="pw-drum-icon">🥁</div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {currentPageIndex < totalPages - 1 && (
                            <button className="pw-nav-arrow pw-nav-right" onClick={goNext}>
                                <ChevronRight size={28} />
                            </button>
                        )}

                        {/* Recording Overlays */}
                        {phase === 'countdown' && (
                            <div className="pw-rec-overlay pw-countdown-overlay">
                                <div className="pw-countdown-num">{countdownValue}</div>
                            </div>
                        )}

                        {phase === 'processing' && (
                            <div className="pw-rec-overlay pw-processing-overlay">
                                <div className="pw-processing-card">
                                    <div className="pw-spinner" />
                                    <h3>Processing Recording...</h3>
                                    <div className="pw-progress-bar">
                                        <div className="pw-progress-fill" style={{ width: `${processingProgress}%` }} />
                                    </div>
                                    <span>{processingProgress}%</span>
                                </div>
                            </div>
                        )}

                        {phase === 'done' && recordedBlob && (
                            <div className="pw-rec-overlay pw-done-overlay">
                                <div className="pw-done-card">
                                    <CheckCircle size={48} className="pw-done-icon" />
                                    <h3>Recording Ready!</h3>
                                    <p>Your presentation has been recorded successfully.</p>
                                    <div className="pw-done-actions">
                                        <button className="pw-btn-download" onClick={downloadRecording}>
                                            <Download size={18} />
                                            Download
                                        </button>
                                        <button className="pw-btn-discard" onClick={discardRecording}>
                                            <Trash2 size={18} />
                                            Discard
                                        </button>
                                        <button className="pw-btn-close" onClick={() => setPhase('setup')}>
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom bar */}
                    <div className="pw-bottombar">
                        <div className="pw-bottom-left">
                            <button className="pw-icon-btn" title="Reset" onClick={() => goToPage(0)}><RotateCcw size={15} /></button>
                            <button className="pw-icon-btn" onClick={goPrev} disabled={currentPageIndex === 0}><ChevronLeft size={16} /></button>
                            <span className="pw-page-num">{currentPageIndex + 1} / {totalPages}</span>
                            <button className="pw-icon-btn" onClick={goNext} disabled={currentPageIndex >= totalPages - 1}><ChevronRight size={16} /></button>
                            <button className="pw-icon-btn" title="Zoom"><ZoomIn size={15} /></button>
                        </div>
                        <div className="pw-bottom-right">
                            <button className="pw-icon-btn" title="Fullscreen" onClick={toggleFullscreen}><Maximize2 size={15} /></button>
                        </div>
                    </div>

                    {/* Thumbnail strip */}
                    <div className="pw-thumbnails">
                        {pages.map((page, idx) => (
                            <button
                                key={page.id}
                                className={`pw-thumb ${idx === currentPageIndex ? 'active' : ''}`}
                                onClick={() => goToPage(idx)}
                            >
                                {previewImages[page.id] ? (
                                    typeof previewImages[page.id] === 'string' ? (
                                        <img src={previewImages[page.id]} alt={`Page ${idx + 1}`} />
                                    ) : previewImages[page.id].type === 'color' ? (
                                        <div
                                            className="pw-thumb-color"
                                            style={{ backgroundColor: previewImages[page.id].value, width: '100%', height: '100%' }}
                                        />
                                    ) : (
                                        <div className="pw-thumb-empty" />
                                    )
                                ) : (
                                    <div className="pw-thumb-empty" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* === RIGHT SIDEBAR === */}
                <div className="pw-sidebar">
                    {/* Tabs */}
                    <div className="pw-sidebar-tabs">
                        <button className={`pw-stab ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>
                            <Edit3 size={16} />
                            <span>Notes</span>
                        </button>
                        <button className={`pw-stab ${activeTab === 'live' ? 'active' : ''}`} onClick={() => setActiveTab('live')}>
                            <Radio size={16} />
                            <span>Canva Live</span>
                        </button>
                    </div>

                    {/* Tab content */}
                    <div className="pw-sidebar-content">
                        {activeTab === 'notes' && (
                            <div className="pw-notes-tab">
                                <textarea
                                    className="pw-notes-input"
                                    placeholder="Add notes to your design..."
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                />
                            </div>
                        )}

                        {activeTab === 'live' && !liveSession && (
                            <div className="pw-live-tab-initial">
                                {/* Illustration */}
                                <div className="pw-live-illustration">
                                    <div className="pw-live-bubble b1">💬</div>
                                    <div className="pw-live-bubble b2">❓</div>
                                    <div className="pw-live-bubble b3">👋</div>
                                </div>
                                <h3 className="pw-live-title">Canva Live</h3>
                                <p className="pw-live-desc">Start an interactive Q&A and let your audience join from any device</p>
                                <button className="pw-start-session-btn" onClick={startLiveSession}>
                                    Start new session
                                </button>
                                <p className="pw-live-terms">
                                    By interacting with Canva Live, you agree to our Terms of Use and acknowledge our Privacy Policy
                                </p>
                            </div>
                        )}

                        {activeTab === 'live' && liveSession && (
                            <div className="pw-live-tab-active">
                                {/* Header controls */}
                                <div className="pw-live-header">
                                    <div className="pw-live-badge">
                                        <Radio size={12} />
                                        <span>LIVE ({viewerCount})</span>
                                    </div>
                                    <button className="pw-end-session-btn" onClick={endLiveSession}>End session</button>
                                    <button className="pw-icon-btn" title="Invite" onClick={() => setShowInvitePopup(!showInvitePopup)}>
                                        <Users size={16} />
                                    </button>
                                    <button className="pw-icon-btn" title="Settings">
                                        <Settings size={16} />
                                    </button>
                                </div>

                                {/* Invite popup */}
                                {showInvitePopup && (
                                    <div className="pw-invite-popup">
                                        <h4>Invite people to join</h4>
                                        <div className="pw-invite-code-box">
                                            <span className="pw-invite-label">Session Code</span>
                                            <div className="pw-invite-code">{sessionCode}</div>
                                        </div>
                                        <p className="pw-invite-text">Share this direct link with your audience:</p>
                                        <div className="pw-direct-link-box">
                                            <input
                                                readOnly
                                                value={`${window.location.origin}/live/${sessionCode.replace(/\s/g, '')}`}
                                                className="pw-link-input"
                                            />
                                            <button className="pw-copy-action-btn" onClick={copyInvitation} title="Copy invitation link">
                                                {copiedInvite ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                                            </button>
                                        </div>
                                        {copiedInvite && <div className="pw-copied-toast">Invitation copied!</div>}
                                    </div>
                                )}

                                {/* Live Q&A Section */}
                                <div className="pw-live-qa-header">
                                    <h3>Live Q&A</h3>
                                </div>

                                <div className="pw-live-qa-toolbar">
                                    <div className="pw-sort-dropdown">
                                        <Clock size={14} />
                                        <span>Newest</span>
                                        <ChevronDown size={14} />
                                    </div>
                                    <button className="pw-icon-btn" title="Refresh">
                                        <RotateCcw size={14} />
                                    </button>
                                </div>

                                {/* Comments feed */}
                                <div className="pw-comments-feed">
                                    {comments.length === 0 ? (
                                        <div className="pw-no-comments">
                                            <p>No questions yet. Ask your audience to join!</p>
                                        </div>
                                    ) : (
                                        comments.map(c => (
                                            <div key={c.id} className="pw-comment-card">
                                                <div className="pw-comment-main">
                                                    <div className="pw-comment-avatar">
                                                        {c.userPhoto ? <img src={c.userPhoto} alt="" /> : <span>{(c.userName || 'A')[0]}</span>}
                                                    </div>
                                                    <div className="pw-comment-details">
                                                        <div className="pw-comment-meta">
                                                            <span className="pw-comment-author">{c.userName || 'Anonymous'}</span>
                                                            <span className="pw-comment-time">
                                                                {c.createdAt?.toDate ? 'Just now' : 'Just now'}
                                                            </span>
                                                        </div>
                                                        <p className="pw-comment-msg">{c.text}</p>
                                                    </div>
                                                    <div className="pw-comment-actions">
                                                        <button className="pw-more-btn">
                                                            <MoreHorizontal size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="pw-comment-footer">
                                                    <button
                                                        className={`pw-like-action-btn ${c.likes?.includes(user?.uid) ? 'active' : ''}`}
                                                        onClick={() => handleToggleLike(c.id)}
                                                    >
                                                        <ThumbsUp size={14} fill={c.likes?.includes(user?.uid) ? 'currentColor' : 'none'} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{presenterStyles}</style>
        </div>
    );
};

// ====================== STYLES ======================
const presenterStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    .pw-root {
        position: fixed; inset: 0; z-index: 999999;
        background: #1a1a2e;
        font-family: 'Inter', 'Outfit', sans-serif;
        color: #e0e0e0;
        display: flex; flex-direction: column;
        overflow: hidden; user-select: none;
    }

    .pw-loading {
        flex: 1; display: flex; flex-direction: column;
        align-items: center; justify-content: center; gap: 16px;
    }
    .pw-loading p { color: #9ca3af; font-size: 14px; }
    .pw-spinner {
        width: 40px; height: 40px;
        border: 3px solid rgba(255,255,255,0.08);
        border-top-color: #8B3DFF;
        border-radius: 50%;
        animation: pw-spin 0.8s linear infinite;
    }
    @keyframes pw-spin { to { transform: rotate(360deg); } }

    /* === TOP BAR === */
    .pw-topbar {
        height: 48px; flex-shrink: 0;
        display: flex; align-items: center; justify-content: space-between;
        padding: 0 20px;
        background: rgba(15, 15, 30, 0.95);
        border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .pw-topbar-left { display: flex; align-items: center; gap: 8px; }
    .pw-clock { font-size: 20px; font-weight: 700; color: #fff; letter-spacing: -0.5px; }
    .pw-divider { color: rgba(255,255,255,0.2); font-size: 18px; margin: 0 4px; }
    .pw-timer { font-size: 20px; font-weight: 600; color: rgba(255,255,255,0.7); font-variant-numeric: tabular-nums; }

    .pw-topbar-tools { display: flex; align-items: center; gap: 2px; }
    .pw-tool-btn {
        width: 36px; height: 36px;
        display: flex; align-items: center; justify-content: center;
        border: 1px solid rgba(255,255,255,0.12);
        background: rgba(255,255,255,0.04);
        color: rgba(255,255,255,0.6);
        border-radius: 8px; cursor: pointer;
        transition: all 0.15s;
    }
    .pw-tool-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
    .pw-tool-btn.active { background: rgba(139,61,255,0.2); border-color: #8B3DFF; color: #c4a0ff; }

    .pw-tool-group { position: relative; display: flex; align-items: center; }
    
    .pw-drawing-toolbar {
        position: absolute;
        top: 44px; right: 0;
        background: rgba(30, 30, 50, 0.98);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px;
        padding: 6px;
        display: flex; align-items: center; gap: 4px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        z-index: 1000;
        backdrop-filter: blur(10px);
    }
    
    .pw-draw-tool {
        width: 32px; height: 32px;
        display: flex; align-items: center; justify-content: center;
        border: none; background: transparent;
        color: rgba(255,255,255,0.5); border-radius: 8px;
        cursor: pointer; transition: all 0.2s;
    }
    .pw-draw-tool:hover { background: rgba(255,255,255,0.08); color: #fff; }
    .pw-draw-tool.active { background: #8B3DFF; color: #fff; }
    
    .pw-draw-divider { width: 1px; height: 20px; background: rgba(255,255,255,0.1); margin: 0 4px; }
    
    .pw-color-options { display: flex; align-items: center; gap: 6px; padding: 0 4px; }
    .pw-color-btn {
        width: 18px; height: 18px; border-radius: 50%;
        border: 2px solid transparent; cursor: pointer;
        transition: transform 0.2s;
    }
    .pw-color-btn:hover { transform: scale(1.2); }
    .pw-color-btn.active { border-color: #fff; transform: scale(1.1); }
    
    .pw-close-draw { color: rgba(255,255,255,0.3); margin-left: 4px; }
    .pw-close-draw:hover { color: #ef4444; }

    .pw-drawings-layer {
        position: absolute; inset: 0;
        pointer-events: none; z-index: 50;
        width: 100%; height: 100%;
        overflow: visible;
    }
    .pw-drawings-layer polyline {
        vector-effect: non-scaling-stroke;
        pointer-events: none;
    }
    
    /* Pencil styling to match screenshot */
    .pw-drawing-toolbar {
        padding: 8px 12px;
        gap: 8px;
        background: #2b2b45;
    }
    
    .pw-draw-tool {
        position: relative;
        height: 48px; width: 36px;
        display: flex; flex-direction: column;
        align-items: center; justify-content: flex-end;
        padding-bottom: 6px;
        transition: transform 0.2s;
    }
    .pw-draw-tool:hover { transform: translateY(-4px); background: transparent; }
    .pw-draw-tool.active { 
        transform: translateY(-8px);
        background: transparent;
        color: #fff;
    }
    .pw-draw-tool.active::after {
        content: '';
        position: absolute; bottom: -4px;
        width: 4px; height: 4px; border-radius: 50%;
        background: #8B3DFF;
    }
    
    .pw-draw-tool svg {
        transition: transform 0.2s;
    }
    .pw-draw-tool.active svg { transform: scale(1.2); }

    .pw-icon-btn {
        width: 32px; height: 32px;
        display: flex; align-items: center; justify-content: center;
        border: none; background: transparent;
        color: rgba(255,255,255,0.5); cursor: pointer;
        border-radius: 8px; transition: all 0.15s;
    }
    .pw-icon-btn:hover:not(:disabled) { background: rgba(255,255,255,0.08); color: #fff; }
    .pw-icon-btn:disabled { opacity: 0.25; cursor: not-allowed; }

    /* === BODY === */
    .pw-body { flex: 1; display: flex; overflow: hidden; }

    /* Slide area */
    .pw-slide-area {
        flex: 1; display: flex; flex-direction: column;
        min-width: 0;
    }
    .pw-slide-container {
        flex: 1; display: flex; align-items: center; justify-content: center;
        position: relative; padding: 20px 40px;
        background: radial-gradient(ellipse at center, #222244 0%, #1a1a2e 60%);
    }
    .pw-slide-frame {
        display: flex; align-items: center; justify-content: center;
        position: relative;
        background: #fff;
        border-radius: 6px;
        box-shadow: 0 20px 80px rgba(0,0,0,0.5);
        overflow: hidden;
        container-type: size;
    }
    .pw-slide-img {
        max-width: 100%; max-height: calc(100vh - 220px);
        object-fit: contain; border-radius: 6px;
        box-shadow: 0 20px 80px rgba(0,0,0,0.5);
    }
    .pw-slide-empty {
        width: 500px; height: 350px;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center; gap: 12px;
        background: rgba(255,255,255,0.03);
        border: 1px dashed rgba(255,255,255,0.1);
        border-radius: 12px; color: rgba(255,255,255,0.2);
    }
    .pw-laser-dot {
        position: absolute;
        width: 12px; height: 12px;
        background: #ff3b3b;
        border-radius: 50%;
        box-shadow: 0 0 12px 4px rgba(255,59,59,0.5);
        pointer-events: none;
        transform: translate(-50%, -50%);
        z-index: 100;
        transition: left 0.05s ease-out, top 0.05s ease-out;
    }

    /* Nav arrows */
    .pw-nav-arrow {
        position: absolute; top: 50%; transform: translateY(-50%);
        width: 44px; height: 44px; border-radius: 50%;
        background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1);
        color: rgba(255,255,255,0.7); cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: all 0.2s; z-index: 10;
        opacity: 0;
    }
    .pw-slide-container:hover .pw-nav-arrow { opacity: 1; }
    .pw-nav-arrow:hover { background: rgba(0,0,0,0.7); color: #fff; }
    .pw-nav-left { left: 16px; }
    .pw-nav-right { right: 16px; }

    /* Bottom bar */
    .pw-bottombar {
        height: 40px; flex-shrink: 0;
        display: flex; align-items: center; justify-content: space-between;
        padding: 0 16px;
        background: rgba(15, 15, 30, 0.9);
        border-top: 1px solid rgba(255,255,255,0.05);
    }
    .pw-bottom-left, .pw-bottom-right { display: flex; align-items: center; gap: 4px; }
    .pw-page-num {
        font-size: 13px; font-weight: 600;
        color: rgba(255,255,255,0.6);
        min-width: 40px; text-align: center;
        font-variant-numeric: tabular-nums;
    }

    /* Thumbnails */
    .pw-thumbnails {
        height: 90px; flex-shrink: 0;
        display: flex; align-items: center; gap: 8px;
        padding: 8px 16px;
        overflow-x: auto;
        background: rgba(10, 10, 25, 0.95);
        border-top: 1px solid rgba(255,255,255,0.05);
    }
    .pw-thumbnails::-webkit-scrollbar { height: 4px; }
    .pw-thumbnails::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
    .pw-thumb {
        flex-shrink: 0;
        width: 90px; height: 64px;
        border-radius: 6px; overflow: hidden;
        border: 2px solid transparent;
        cursor: pointer; background: rgba(255,255,255,0.03);
        transition: all 0.2s;
    }
    .pw-thumb:hover { border-color: rgba(139,61,255,0.4); }
    .pw-thumb.active { border-color: #8B3DFF; box-shadow: 0 0 0 1px #8B3DFF; }
    .pw-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .pw-thumb-empty { width: 100%; height: 100%; background: rgba(255,255,255,0.05); }

    /* === RIGHT SIDEBAR === */
    .pw-sidebar {
        width: 280px; flex-shrink: 0;
        display: flex; flex-direction: column;
        background: rgba(20, 20, 38, 0.98);
        border-left: 1px solid rgba(255,255,255,0.06);
    }

    .pw-sidebar-tabs {
        display: flex; flex-shrink: 0;
        border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .pw-stab {
        flex: 1; display: flex; flex-direction: column; align-items: center;
        gap: 4px; padding: 12px 8px;
        border: none; background: transparent;
        color: rgba(255,255,255,0.4); cursor: pointer;
        font-size: 11px; font-weight: 600;
        transition: all 0.15s;
        border-bottom: 2px solid transparent;
    }
    .pw-stab:hover { color: rgba(255,255,255,0.7); }
    .pw-stab.active { color: #fff; border-bottom-color: #8B3DFF; }

    .pw-sidebar-content { flex: 1; overflow-y: auto; padding: 16px; }

    /* Notes tab */
    .pw-notes-tab { height: 100%; }
    .pw-notes-input {
        width: 100%; height: 100%;
        background: transparent; border: none;
        color: rgba(255,255,255,0.7);
        font-size: 13px; line-height: 1.6;
        resize: none; outline: none;
        font-family: 'Inter', sans-serif;
    }
    .pw-notes-input::placeholder { color: rgba(255,255,255,0.2); }

    /* Canva Live - Initial */
    .pw-live-tab-initial {
        display: flex; flex-direction: column; align-items: center;
        text-align: center; padding-top: 24px; gap: 12px;
    }
    .pw-live-illustration {
        width: 160px; height: 120px;
        position: relative; margin-bottom: 8px;
    }
    .pw-live-bubble {
        position: absolute;
        width: 48px; height: 48px;
        background: linear-gradient(135deg, #8B3DFF, #a855f7);
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 20px;
        animation: pw-float 3s ease-in-out infinite;
    }
    .pw-live-bubble.b1 { top: 10px; left: 20px; animation-delay: 0s; }
    .pw-live-bubble.b2 { top: 0; right: 20px; animation-delay: 0.5s; width: 56px; height: 56px; }
    .pw-live-bubble.b3 { bottom: 0; left: 50%; transform: translateX(-50%); animation-delay: 1s; }
    @keyframes pw-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
    }

    .pw-live-title { font-size: 18px; font-weight: 700; color: #fff; }
    .pw-live-desc { font-size: 12px; color: rgba(255,255,255,0.5); line-height: 1.5; max-width: 220px; }
    .pw-start-session-btn {
        padding: 10px 28px;
        background: transparent; color: #fff;
        border: 1.5px solid rgba(255,255,255,0.3);
        border-radius: 8px; font-size: 13px; font-weight: 600;
        cursor: pointer; transition: all 0.2s;
    }
    .pw-start-session-btn:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.5); }
    .pw-live-terms { font-size: 10px; color: rgba(255,255,255,0.25); line-height: 1.4; max-width: 220px; margin-top: 8px; }

    /* Canva Live - Active */
    .pw-live-tab-active { display: flex; flex-direction: column; gap: 16px; }
    .pw-live-header { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
    .pw-live-badge {
        display: flex; align-items: center; gap: 4px;
        padding: 4px 10px; border-radius: 20px;
        background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4);
        color: #ef4444; font-size: 11px; font-weight: 700;
    }
    .pw-live-badge svg { animation: pw-pulse 2s linear infinite; }
    @keyframes pw-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

    .pw-end-session-btn {
        padding: 4px 12px; border-radius: 6px;
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.15);
        color: #fff; font-size: 11px; font-weight: 600;
        cursor: pointer; transition: all 0.15s;
    }
    .pw-end-session-btn:hover { background: rgba(239, 68, 68, 0.2); border-color: #ef4444; }

    .pw-live-info {
        display: flex; flex-direction: column; align-items: center;
        text-align: center; gap: 12px; padding: 16px 0;
    }
    .pw-live-info p { font-size: 12px; color: rgba(255,255,255,0.5); line-height: 1.5; }
    .pw-live-info strong { color: rgba(255,255,255,0.8); }
    .pw-live-icon-pulse { color: rgba(255,255,255,0.3); animation: pw-pulse 2s linear infinite; }

    .pw-copy-btn {
        display: flex; align-items: center; gap: 6px;
        padding: 8px 20px; border-radius: 8px;
        background: transparent; border: 1.5px solid rgba(255,255,255,0.25);
        color: #fff; font-size: 12px; font-weight: 600;
        cursor: pointer; transition: all 0.2s;
    }
    .pw-copy-btn:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.4); }

    /* Invite popup */
    .pw-invite-popup {
        position: absolute; top: 50px; left: 0; z-index: 100;
        width: 280px;
        background: #1e1e32;
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 12px; padding: 20px;
        box-shadow: 0 12px 40px rgba(0,0,0,0.5);
        display: flex; flex-direction: column; gap: 16px;
    }
    .pw-invite-popup h4 { font-size: 15px; font-weight: 700; color: #fff; margin: 0; }
    
    .pw-invite-code-box {
        background: rgba(139, 61, 255, 0.1);
        border: 1px dashed rgba(139, 61, 255, 0.4);
        border-radius: 8px; padding: 12px;
        text-align: center; display: flex; flex-direction: column; gap: 4px;
    }
    .pw-invite-label { font-size: 10px; font-weight: 700; color: #a78bfa; text-transform: uppercase; letter-spacing: 1px; }
    .pw-invite-code { font-size: 24px; font-weight: 800; color: #fff; letter-spacing: 2px; }

    .pw-invite-text { font-size: 11px; color: rgba(255,255,255,0.5); margin: 0; }
    
    .pw-direct-link-box {
        display: flex; align-items: center; gap: 4px;
        background: rgba(0,0,0,0.2); border-radius: 6px;
        border: 1px solid rgba(255,255,255,0.1); padding: 2px;
    }
    .pw-link-input {
        flex: 1; background: transparent; border: none;
        color: rgba(255,255,255,0.4); font-size: 11px;
        padding: 6px 8px; outline: none;
        text-overflow: ellipsis; white-space: nowrap; overflow: hidden;
    }
    .pw-copy-action-btn {
        width: 28px; height: 28px;
        display: flex; align-items: center; justify-content: center;
        background: rgba(255,255,255,0.06); border: none;
        color: rgba(255,255,255,0.7); border-radius: 4px;
        cursor: pointer; transition: all 0.2s;
    }
    .pw-copy-action-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
    
    .pw-copied-toast {
        font-size: 10px; color: #4ade80; font-weight: 600;
        text-align: center; animation: pw-fade-in 0.3s ease-out;
    }
    @keyframes pw-fade-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

    /* Comments / Q&A */
    .pw-live-qa-header { padding: 4px 0 8px; }
    .pw-live-qa-header h3 { font-size: 16px; font-weight: 700; color: #fff; }

    .pw-live-qa-toolbar {
        display: flex; align-items: center; justify-content: space-between;
        margin-bottom: 20px;
    }
    .pw-sort-dropdown {
        display: flex; align-items: center; gap: 8px;
        padding: 6px 12px; border: 1px solid rgba(255,255,255,0.15);
        border-radius: 6px; background: rgba(255,255,255,0.03);
        font-size: 13px; color: #fff; cursor: pointer;
    }

    .pw-comments-feed { display: flex; flex-direction: column; gap: 16px; }
    .pw-no-comments { text-align: center; padding: 40px 0; color: rgba(255,255,255,0.3); font-size: 13px; }

    .pw-comment-card {
        display: flex; flex-direction: column; gap: 8px;
    }
    .pw-comment-main { display: flex; gap: 12px; }
    .pw-comment-avatar {
        width: 32px; height: 32px; flex-shrink: 0;
        border-radius: 50%; overflow: hidden;
        background: #9ca3af; display: flex; align-items: center; justify-content: center;
        color: #fff; font-weight: 700; font-size: 14px;
    }
    .pw-comment-avatar img { width: 100%; height: 100%; object-fit: cover; }
    
    .pw-comment-details { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .pw-comment-meta { display: flex; flex-direction: column; }
    .pw-comment-author { font-size: 13px; font-weight: 600; color: #fff; }
    .pw-comment-time { font-size: 11px; color: rgba(255,255,255,0.4); }
    .pw-comment-msg { font-size: 13px; color: #fff; line-height: 1.4; margin-top: 4px; }

    .pw-comment-actions { flex-shrink: 0; }
    .pw-more-btn {
        background: transparent; border: none; color: rgba(255,255,255,0.4);
        cursor: pointer; padding: 4px;
    }

    .pw-comment-footer { padding-left: 44px; }
    .pw-like-action-btn {
        width: 32px; height: 32px;
        display: flex; align-items: center; justify-content: center;
        background: transparent; border: 1px solid rgba(255,255,255,0.2);
        border-radius: 6px; color: rgba(255,255,255,0.6);
        cursor: pointer; transition: all 0.2s;
    }
    .pw-like-action-btn:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.4); }
    .pw-like-action-btn.active { color: #fff; border-color: #fff; }

    /* Floating Reactions Animation */
    .pw-floating-reaction {
        position: absolute;
        font-size: 32px;
        pointer-events: none;
        z-index: 200;
        animation: pw-float-up 4s ease-out forwards;
        filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
    }

    @keyframes pw-float-up {
        0% { transform: translateY(0) scale(0.5); opacity: 0; }
        10% { transform: translateY(-20px) scale(1.2); opacity: 1; }
        100% { transform: translateY(-400px) scale(1); opacity: 0; }
    }

    /* === RECORDING UI === */
    .pw-play-btn.is-recording {
        background: rgba(239, 68, 68, 0.2) !important;
        border-color: #ef4444 !important;
        color: #ef4444 !important;
        position: relative;
    }
    .pw-rec-indicator {
        position: absolute;
        top: -2px; right: -2px;
        width: 8px; height: 8px;
        background: #ef4444;
        border-radius: 50%;
        animation: pw-pulse-indicator 1.5s infinite;
    }
    @keyframes pw-pulse-indicator {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.5); opacity: 0.5; }
        100% { transform: scale(1); opacity: 1; }
    }

    .pw-rec-overlay {
        position: absolute; inset: 0;
        z-index: 2000;
        display: flex; align-items: center; justify-content: center;
        background: rgba(15, 15, 30, 0.8);
        backdrop-filter: blur(8px);
    }

    .pw-layers-rendering-container {
        position: absolute;
        inset: 0;
        z-index: 50;
        container-type: size;
        transform-origin: center;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .pw-countdown-num {
        font-size: 120px; font-weight: 800;
        color: #8B3DFF;
        text-shadow: 0 0 30px rgba(139, 61, 255, 0.5);
        animation: pw-scale-in 1s ease-out infinite;
    }
    @keyframes pw-scale-in {
        from { transform: scale(0.5); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
    }

    .pw-processing-card, .pw-done-card {
        background: #1e1e2e;
        padding: 40px; border-radius: 24px;
        border: 1px solid rgba(255,255,255,0.1);
        text-align: center;
        max-width: 400px; width: 90%;
        box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    }

    .pw-progress-bar {
        width: 100%; height: 6px;
        background: rgba(255,255,255,0.05);
        border-radius: 10px; margin: 20px 0 10px;
        overflow: hidden;
    }
    .pw-progress-fill {
        height: 100%; background: #8B3DFF;
        transition: width 0.3s ease;
    }

    .pw-done-icon { color: #10b981; margin-bottom: 20px; }
    .pw-done-card h3 { font-size: 24px; font-weight: 700; margin-bottom: 10px; }
    .pw-done-card p { color: rgba(255,255,255,0.6); margin-bottom: 30px; }

    .pw-done-actions { display: grid; gap: 12px; }
    .pw-btn-download {
        background: #8B3DFF; color: #fff;
        border: none; padding: 12px; border-radius: 12px;
        font-weight: 600; cursor: pointer;
        display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .pw-btn-discard {
        background: rgba(239, 68, 68, 0.1); color: #ef4444;
        border: 1px solid rgba(239, 68, 68, 0.2);
        padding: 10px; border-radius: 12px;
        font-weight: 600; cursor: pointer;
        display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .pw-btn-close {
        background: transparent; color: rgba(255,255,255,0.4);
        border: none; padding: 10px; cursor: pointer;
        font-size: 13px;
    }

    /* === MAGIC SHORTCUTS UI === */
    .pw-magic-popup {
        position: absolute;
        top: 48px; right: 80px;
        width: 180px;
        background: rgba(30, 30, 50, 0.98);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.6);
        z-index: 2000;
        backdrop-filter: blur(12px);
        overflow: hidden;
    }
    .pw-magic-header {
        display: flex; align-items: center; gap: 8px;
        padding: 10px 12px;
        background: rgba(255,255,255,0.03);
        border-bottom: 1px solid rgba(255,255,255,0.06);
        font-size: 12px; font-weight: 700; color: #fff;
    }
    .pw-magic-list { padding: 4px; display: flex; flex-direction: column; }
    .pw-magic-item {
        display: flex; align-items: center; gap: 10px;
        padding: 8px 10px; border: none; background: transparent;
        color: rgba(255,255,255,0.7); border-radius: 8px;
        cursor: pointer; transition: all 0.2s;
        font-family: inherit;
    }
    .pw-magic-item:hover { background: rgba(255,255,255,0.06); color: #fff; }
    .pw-magic-item.active { background: rgba(139, 61, 255, 0.15); color: #c4a0ff; }
    .pw-magic-icon { 
        font-size: 16px; width: 20px; height: 20px; 
        display: flex; align-items: center; justify-content: center; 
    }
    .pw-magic-label { flex: 1; font-size: 13px; text-align: left; font-weight: 500; }
    .pw-magic-key {
        font-size: 10px; font-weight: 700;
        background: rgba(255,255,255,0.1);
        padding: 2px 6px; border-radius: 4px;
        color: rgba(255,255,255,0.4);
    }
    
    /* Specific Icon Styles to match image */
    .blur-icon { color: #00C2FF; filter: drop-shadow(0 0 5px rgba(0, 194, 255, 0.4)); }
    .quiet-icon { color: #FFD700; transform: scale(1.1); }
    .bubbles-icon { color: #00E5FF; }
    .confetti-icon { color: #FF3B3B; }
    .drumroll-icon { color: #FF00FF; }
    .curtain-icon { color: #E53935; }
    .mic-icon { color: #757575; }
    
    .pw-magic-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 4px 0; }
    .pw-magic-item.clear { color: rgba(255, 255, 255, 0.5); }
    .pw-magic-item.clear:hover { color: #fff; background: rgba(239, 68, 68, 0.1); }

    /* === MAGIC EFFECTS LAYERS === */
    .pw-magic-layer {
        position: absolute; inset: 0;
        z-index: 150; pointer-events: none;
        display: flex; align-items: center; justify-content: center;
        overflow: hidden; border-radius: 6px;
    }

   .pw-blur-overlay {
    position: fixed;
    inset: 0;

    backdrop-filter: blur(80px) saturate(180%);
    -webkit-backdrop-filter: blur(80px) saturate(180%);

    background: rgba(15, 23, 42, 0.65); /* dark glass effect */
    
    z-index: 9999;
}
    @keyframes pw-fade-in { from { opacity: 0; } to { opacity: 1; } }

    /* Quiet */
    .pw-quiet-effect { position: relative; display: flex; align-items: center; justify-content: center; z-index: 170; }
    .pw-shh-emoji { 
        font-size: 200px; 
        z-index: 171; 
        animation: pw-shh-appear 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
        filter: drop-shadow(0 0 30px rgba(255, 215, 0, 0.3));
    }
    @keyframes pw-shh-appear {
        from { transform: scale(0.5); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
    }
    .pw-shh-pulse {
        position: absolute; width: 300px; height: 300px;
        background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%);
        border-radius: 50%;
        animation: pw-shh-pulse 2s infinite;
    }
    @keyframes pw-shh-pulse {
        0% { transform: scale(0.8); opacity: 0.8; }
        100% { transform: scale(1.5); opacity: 0; }
    }
    @keyframes pw-bounce {
        from { transform: translateY(0); }
        to { transform: translateY(-20px); }
    }

    /* Bubbles */
    .pw-bubble {
        position: absolute; bottom: -50px;
        width: 15px; height: 15px;
        background: rgba(255,255,255,0.2);
        border: 1px solid rgba(255,255,255,0.3);
        border-radius: 50%;
        animation: pw-bubble-up 4s linear infinite;
    }
    @keyframes pw-bubble-up {
        0% { transform: translateY(0) scale(1); opacity: 0.8; }
        100% { transform: translateY(-100vh) scale(1.5); opacity: 0; }
    }

    /* Confetti */
    .pw-confetti-piece {
        position: absolute; top: -10px;
        width: 10px; height: 10px;
        border-radius: 2px;
        animation: pw-confetti-fall 3s linear forwards;
    }
    @keyframes pw-confetti-fall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
    }

    /* Curtain */
    .pw-curtain-container { position: absolute; inset: 0; display: flex; z-index: 200; }
    .pw-curtain-left, .pw-curtain-right {
        flex: 1; background: #8B0000;
        box-shadow: 0 0 50px rgba(0,0,0,0.8);
        transition: transform 1s ease-in-out;
    }
    .pw-magic-layer.curtain .pw-curtain-left { animation: pw-curtain-close-left 1s forwards; }
    .pw-magic-layer.curtain .pw-curtain-right { animation: pw-curtain-close-right 1s forwards; }
    @keyframes pw-curtain-close-left { from { transform: translateX(-100%); } to { transform: translateX(0); } }
    @keyframes pw-curtain-close-right { from { transform: translateX(100%); } to { transform: translateX(0); } }

    /* Mic Drop */
    .pw-mic-drop-effect { display: flex; align-items: center; justify-content: center; flex-direction: column; }
    .pw-mic-icon { font-size: 80px; animation: pw-mic-fall 0.8s cubic-bezier(.17,.67,.83,.67) forwards; }
    .pw-mic-impact {
        width: 100px; height: 2px; background: rgba(255,255,255,0.2);
        filter: blur(4px); box-shadow: 0 0 20px #fff;
        opacity: 0; animation: pw-mic-flash 0.1s 0.8s forwards;
    }
    @keyframes pw-mic-fall {
        0% { transform: translateY(-300px) rotate(-45deg); }
        80% { transform: translateY(100px) rotate(0); }
        100% { transform: translateY(15vh) rotate(0); }
    }
    @keyframes pw-mic-flash { 0% { opacity: 0; } 100% { opacity: 1; } }

    /* Drumroll */
    .pw-drum-icon { font-size: 100px; animation: pw-shake 0.1s infinite; }
    @keyframes pw-shake {
        0%, 100% { transform: translate(0, 0); }
        25% { transform: translate(-3px, -3px); }
        50% { transform: translate(3px, 3px); }
        75% { transform: translate(-3px, 3px); }
    }

`;

export default PresenterWindow;
