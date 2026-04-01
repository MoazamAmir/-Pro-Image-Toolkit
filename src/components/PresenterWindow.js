import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    X, ChevronLeft, ChevronRight, Maximize2, Play, Pause,
    PenTool, Keyboard, Timer, Clipboard, MoreHorizontal,
    RotateCcw, ZoomIn, Edit3, Radio, Settings, Users, Copy,
    ThumbsUp, Clock, ChevronDown, Eraser, Highlighter, Pen, Undo,
    Download, Trash2, CheckCircle,
    Mic, MicOff
} from 'lucide-react';
import FirebaseSyncService from '../services/FirebaseSyncService';
import LiveSessionService from '../services/LiveSessionService';
import useRecording from './PresentAndRecord/useRecording';
import SlideRenderer from './SlideRenderer';
// import firebaseVoiceService from '../services/FirebaseVoiceService';
import agoraVoiceService from '../services/AgoraVoiceService';

const PresenterWindow = ({ designId, user }) => {
    // Design state
    const [pages, setPages] = useState([]);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [canvasSize, setCanvasSize] = useState({ width: 1920, height: 1080 });
    const [adjustments, setAdjustments] = useState({});
    const [isMicOn, setIsMicOn] = useState(false);
    const [previewImages, setPreviewImages] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [voiceLevel, setVoiceLevel] = useState(0);
    const [includeSystemAudio, setIncludeSystemAudio] = useState(false);

    // Audio level monitoring for host visualizer (Agora)
    useEffect(() => {
        agoraVoiceService.onLevelChange((levels) => {
            if (isMicOn) {
                setVoiceLevel(levels.local);
            } else {
                setVoiceLevel(0);
            }
        });
    }, [isMicOn]);

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

    // Audio device selection state
    const [showMicSelectModal, setShowMicSelectModal] = useState(false);
    const [availableMics, setAvailableMics] = useState([]);
    const [selectedMicId, setSelectedMicId] = useState('');
    const commentsUnsubRef = useRef(null);
    const reactionUnsubRef = useRef(null);

    const [reactions, setReactions] = useState([]); // { id, type, x, y }
    const lastDrawingSyncRef = useRef(0);


    // Magic Shortcuts State
    const [activeMagicEffect, setActiveMagicEffect] = useState(null); // 'blur' | 'quiet' | 'bubbles' | 'confetti' | 'drumroll' | 'curtain' | 'mic-drop'
    const [showMagicPopup, setShowMagicPopup] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [showRecSetup, setShowRecSetup] = useState(false);
    const audioRef = useRef(null);
    const moreMenuRef = useRef(null);

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
        recordedBlob, processingProgress, error: recError,
        microphones, selectedMicrophone, setSelectedMicrophone, audioLevel,
        startCountdown, prepareRecording, executeRecording,
        pauseRecording, resumeRecording, stopRecording,
        downloadRecording, discardRecording, formatTime: formatRecordTime,
        enumerateDevices, startAudioMonitor, stopAudioMonitor
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

    // Handle microphone meter in setup
    useEffect(() => {
        if (showRecSetup && selectedMicrophone) {
            startAudioMonitor(selectedMicrophone);
        } else if (!showRecSetup) {
            stopAudioMonitor();
        }
    }, [showRecSetup, selectedMicrophone, startAudioMonitor, stopAudioMonitor]);

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
    }, [designId, renderAllPreviews]);

    // -- Navigation --
    const totalPages = pages.length;
    const goToPage = useCallback((idx) => {
        if (idx >= 0 && idx < totalPages) {
            setCurrentPageIndex(idx);
            if (liveSession?.id) {
                LiveSessionService.updateActivePage(liveSession.id, idx);
            }
        }
    }, [totalPages, liveSession]); // Using liveSession since found is local to other effect
    const goNext = useCallback(() => goToPage(currentPageIndex + 1), [goToPage, currentPageIndex]);
    const goPrev = useCallback(() => goToPage(currentPageIndex - 1), [goToPage, currentPageIndex]);

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
    }, [currentPageIndex, totalPages, triggerMagicEffect, showMagicPopup, goNext, goPrev]);

    useEffect(() => {
        const onDocClick = (e) => {
            if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
                setShowMoreMenu(false);
            }
        };
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, []);

    // -- Live Session --
    const startLiveSession = async () => {
        if (!designId || !user) return;
        try {
            const { sessionId, sessionCode: code } = await LiveSessionService.createSession(
                designId, user.uid, user.displayName || user.email
            );
            setSessionCode(code);

            // Initialize Firebase WebRTC voice (COMMENTED OUT)
            // await firebaseVoiceService.startHost(sessionId);
            
            // Initialize Agora Voice
            await agoraVoiceService.startHost(sessionId);
            
            // If mic was already toggled "on" before starting session, publish it now
            if (isMicOn) {
                console.log('[Presenter] Mic was already on, publishing now...');
                await agoraVoiceService.toggleMic(true, selectedMicId);
            }

            if (includeSystemAudio) {
                await agoraVoiceService.startSystemAudio();
            }

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
                const newReaction = {
                    id,
                    type: reaction.type,
                    x: 20 + Math.random() * 60,
                    y: 80
                };
                setReactions(prev => [...prev.slice(-15), newReaction]);
                setTimeout(() => {
                    setReactions(prev => prev.filter(r => r.id !== id));
                }, 4000);
            });
        } catch (err) {
            console.error('Failed to start live session:', err);
        }
    };

    const endLiveSession = async () => {
        // Stop Firebase voice (COMMENTED OUT)
        // await firebaseVoiceService.stop();
        
        // Stop Agora voice
        await agoraVoiceService.stop();
        
        setIsMicOn(false);

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
        const url = `${window.location.origin}/live/${sessionCode.replace(/\s/g, '')}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopiedInvite(true);
            setTimeout(() => setCopiedInvite(false), 2000);
        });
    };

    const copyQuickLink = async () => {
        const liveUrl = liveSession?.id && sessionCode ? `${window.location.origin}/live/${sessionCode.replace(/\s/g, '')}` : null;
        const presenterUrl = `${window.location.origin}/presenter/${designId}`;
        const textToCopy = liveUrl || presenterUrl;

        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopiedInvite(true);
            setTimeout(() => setCopiedInvite(false), 1800);
        } catch (error) {
            console.error('Clipboard copy failed:', error);
        }
    };

    const handleClosePresenter = () => {
        if (window.opener) {
            window.close();
            return;
        }
        window.history.back();
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

    // Fetch available microphones (called when opening the mic selection modal)
    const fetchMicrophones = async () => {
        try {
            // Request permission first to get hardware labels (otherwise they show as generic entries)
            await navigator.mediaDevices.getUserMedia({ audio: true });
            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioInputs = devices.filter(device => device.kind === 'audioinput');
            setAvailableMics(audioInputs);
            if (audioInputs.length > 0) {
                // Pre-select the default or first device
                const defaultDevice = audioInputs.find(d => d.deviceId === 'default') || audioInputs[0];
                setSelectedMicId(defaultDevice.deviceId);
            }
        } catch (err) {
            console.error('Error fetching microphones:', err);
            alert('Cannot access microphones. Please check your browser permissions.');
        }
    };

    // Toggle microphone — opening popup first before starting
    const toggleMic = async () => {
        if (!isMicOn) {
            // Instead of instantly broadcasting, show the setup modal so user can pick Bluetooth or external mic
            await fetchMicrophones();
            setShowMicSelectModal(true);
        } else {
            // Stop publishing (Agora)
            await agoraVoiceService.toggleMic(false);
            
            // Stop publishing (Firebase - COMMENTED OUT)
            // await firebaseVoiceService.toggleMic(false);
            
            setIsMicOn(false);
            if (liveSession?.id) {
                await LiveSessionService.updateMicStatus(liveSession.id, false);
            }
        }
    };

    // Called when user clicks "Connect Device" from the modal
    const handleConfirmMic = async () => {
        setShowMicSelectModal(false);
        try {
            // If already hosting, we might need to switch or restart
            if (liveSession?.id) {
                // If we already have a session, just toggle/publish
                await agoraVoiceService.toggleMic(true, selectedMicId);
            } else {
                // If starting for the first time, this is handled in startLiveSession
                // but if they click it later, toggleMic handles it
                await agoraVoiceService.toggleMic(true, selectedMicId);
            }
            
            setIsMicOn(true);
            if (liveSession?.id) {
                await LiveSessionService.updateMicStatus(liveSession.id, true);
            }
        } catch (err) {
            console.error('Microphone connection error:', err);
            alert('An error occurred connecting the microphone.');
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            // firebaseVoiceService.stop();
            agoraVoiceService.stop();
        };
    }, []);

    const currentSrc = pages[currentPageIndex] ? previewImages[pages[currentPageIndex].id] : null;

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
                            <span>VOICE RECORDING</span>
                            <div className="pw-voice-wave">
                                <span className="pw-wave-bar" style={{ height: `${Math.max(4, voiceLevel * 0.4)}px` }}></span>
                                <span className="pw-wave-bar" style={{ height: `${Math.max(4, voiceLevel * 0.8)}px` }}></span>
                                <span className="pw-wave-bar" style={{ height: `${Math.max(4, voiceLevel * 0.5)}px` }}></span>
                                <span className="pw-wave-bar" style={{ height: `${Math.max(4, voiceLevel * 0.3)}px` }}></span>
                            </div>
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
                                setShowRecSetup(true);
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
                            {isMicOn ? <Mic size={18} className="text-cyan-300" /> : <MicOff size={18} />}
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
                    <button
                        className={`pw-tool-btn ${timerRunning ? 'active' : ''}`}
                        title={timerRunning ? 'Pause timer' : 'Start timer'}
                        onClick={() => setTimerRunning((v) => !v)}
                    >
                        <Timer size={18} />
                    </button>
                    <button className={`pw-tool-btn ${copiedInvite ? 'active' : ''}`} title="Copy link" onClick={copyQuickLink}>
                        <Clipboard size={18} />
                    </button>
                    <div className="pw-tool-group" ref={moreMenuRef}>
                        <button
                            className={`pw-tool-btn ${showMoreMenu ? 'active' : ''}`}
                            title="More options"
                            onClick={() => setShowMoreMenu((v) => !v)}
                        >
                            <MoreHorizontal size={18} />
                        </button>
                        {showMoreMenu && (
                            <div className="pw-more-menu">
                                <button className="pw-more-item" onClick={() => { setActiveTool(activeTool === 'laser' ? null : 'laser'); setShowDrawingToolbar(false); setShowMoreMenu(false); }}>
                                    <PenTool size={14} />
                                    <span>{activeTool === 'laser' ? 'Disable laser' : 'Enable laser'}</span>
                                </button>
                                <button className="pw-more-item" onClick={() => { toggleFullscreen(); setShowMoreMenu(false); }}>
                                    <Maximize2 size={14} />
                                    <span>Toggle fullscreen</span>
                                </button>
                                <button className="pw-more-item" onClick={() => { setElapsed(0); setTimerRunning(false); setShowMoreMenu(false); }}>
                                    <RotateCcw size={14} />
                                    <span>Reset timer</span>
                                </button>
                                <button className="pw-more-item" onClick={async () => { if (liveSession?.id) await endLiveSession(); else await startLiveSession(); setShowMoreMenu(false); }}>
                                    <Radio size={14} />
                                    <span>{liveSession?.id ? 'End live session' : 'Start live session'}</span>
                                </button>
                            </div>
                        )}
                    </div>
                    <button className="pw-tool-btn" title="Close presenter" onClick={handleClosePresenter}>
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* === BODY === */}
            <div className="pw-body">
                {/* Audio Device Selection Modal */}
                {showMicSelectModal && (
                    <div className="pw-mic-modal-overlay">
                        <div className="pw-mic-modal-content">
                            <div className="pw-mic-modal-header">
                                <Radio size={20} className="pw-mic-modal-icon" />
                                <h3>Select Microphone</h3>
                                <button className="pw-icon-btn pw-close-modal" onClick={() => setShowMicSelectModal(false)}>
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="pw-mic-modal-body">
                                <p>Choose your preferred audio input device (like Bluetooth headset or external mic).</p>
                                <div className="pw-device-selector">
                                    <Mic size={16} />
                                    <select
                                        value={selectedMicId}
                                        onChange={(e) => setSelectedMicId(e.target.value)}
                                        className="pw-device-select"
                                    >
                                        {availableMics.length === 0 && <option value="">No microphones found</option>}
                                        {availableMics.map(mic => (
                                            <option key={mic.deviceId} value={mic.deviceId}>
                                                {mic.label.toLowerCase().includes('bluetooth') ? '🎧 ' : '🎙️ '}
                                                {mic.label || `Microphone ${mic.deviceId.substring(0, 5)}...`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="pw-system-audio-toggle">
                                    <label className="pw-toggle-label">
                                        <input 
                                            type="checkbox" 
                                            checked={includeSystemAudio}
                                            onChange={(e) => setIncludeSystemAudio(e.target.checked)}
                                        />
                                        <span>Include System Audio (Share desktop sound)</span>
                                    </label>
                                    <p className="pw-toggle-hint">Useful for sharing audio from videos or music playing on your computer.</p>
                                </div>
                            </div>
                            <div className="pw-mic-modal-footer">
                                <button className="pw-btn pw-btn-cancel" onClick={() => setShowMicSelectModal(false)}>Cancel</button>
                                <button className="pw-btn pw-btn-connect" onClick={handleConfirmMic} disabled={!selectedMicId}>
                                    Connect Target Device
                                </button>
                            </div>
                        </div>
                    </div>
                )}

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
                                            {[...Array(30)].map((_, i) => <div key={i} className="pw-confetti-piece" style={{ left: `${Math.random() * 100}%`, backgroundColor: ['#06b6d4', '#38bdf8', '#2563eb', '#67e8f9'][i % 4], animationDelay: `${Math.random() * 0.5}s` }} />)}
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

                        {showRecSetup && (
                            <div className="pw-rec-overlay pw-setup-overlay">
                                <div className="pw-setup-card">
                                    <div className="pw-setup-header">
                                        <h3>Recording Studio</h3>
                                        <button className="pw-setup-close" onClick={() => setShowRecSetup(false)}><X size={20} /></button>
                                    </div>
                                    <div className="pw-setup-body">
                                        <div className="pw-setup-section">
                                            <label>Select Microphone</label>
                                            <select
                                                value={selectedMicrophone}
                                                onChange={(e) => setSelectedMicrophone(e.target.value)}
                                                className="pw-setup-select"
                                            >
                                                <option value="none">No Microphone</option>
                                                {microphones.map(m => (
                                                    <option key={m.deviceId} value={m.deviceId}>
                                                        {m.label.toLowerCase().includes('bluetooth') ? '🎧 ' : '🎙️ '}
                                                        {m.label || `Microphone ${m.deviceId.slice(0, 5)}`}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="pw-setup-section">
                                            <label>Input Level</label>
                                            <div className="pw-mic-meter-container">
                                                <div className="pw-mic-meter-bg">
                                                    <div
                                                        className="pw-mic-meter-fill"
                                                        style={{
                                                            width: `${audioLevel * 100}%`,
                                                            background: audioLevel > 0.8 ? '#ef4444' : audioLevel > 0.5 ? '#f59e0b' : '#10b981'
                                                        }}
                                                    />
                                                </div>
                                                <div className="pw-mic-meter-markers">
                                                    {[...Array(5)].map((_, i) => <div key={i} className="pw-meter-mark" />)}
                                                </div>
                                            </div>
                                            <p className="pw-mic-hint">
                                                {audioLevel > 0.05 ? 'Sound detected' : 'Speak into your microphone to test'}
                                            </p>
                                        </div>

                                        {recError && <div className="pw-rec-error">{recError}</div>}
                                    </div>
                                    <div className="pw-setup-footer">
                                        <button
                                            className="pw-start-rec-btn"
                                            onClick={async () => {
                                                setShowRecSetup(false);
                                                const ok = await prepareRecording();
                                                if (ok) {
                                                    startCountdown(() => {
                                                        executeRecording();
                                                        setTimerRunning(true);
                                                    });
                                                }
                                            }}
                                        >
                                            Start Recording
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
                                        <p>Ask your audience to visit <strong>{window.location.origin}/live</strong> on their device and enter the code <strong>{sessionCode}</strong> to participate.</p>
                                        <button className="pw-copy-btn" onClick={copyInvitation}>
                                            <Copy size={14} />
                                            {copiedInvite ? 'Copied!' : 'Copy invitation'}
                                        </button>
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
        background:
            radial-gradient(circle at top left, rgba(6,182,212,0.10), transparent 24%),
            radial-gradient(circle at top right, rgba(59,130,246,0.12), transparent 30%),
            linear-gradient(160deg, #020617 0%, #0b1120 52%, #020617 100%);
        font-family: 'Inter', 'Outfit', sans-serif;
        color: #e0e0e0;
        display: flex; flex-direction: column;
        overflow: hidden; user-select: none;
    }

    .pw-loading {
        flex: 1; display: flex; flex-direction: column;
        align-items: center; justify-content: center; gap: 16px;
    }
    .pw-loading p { color: #cbd5e1; font-size: 14px; }
    .pw-spinner {
        width: 40px; height: 40px;
        border: 3px solid rgba(255,255,255,0.08);
        border-top-color: #22d3ee;
        border-radius: 50%;
        animation: pw-spin 0.8s linear infinite;
    }
    @keyframes pw-spin { to { transform: rotate(360deg); } }

    /* === TOP BAR === */
    .pw-topbar {
        height: 48px; flex-shrink: 0;
        display: flex; align-items: center; justify-content: space-between;
        padding: 0 20px;
        background: rgba(2, 6, 23, 0.82);
        border-bottom: 1px solid rgba(148,163,184,0.12);
        backdrop-filter: blur(24px) saturate(140%);
    }
    .pw-topbar-left { display: flex; align-items: center; gap: 12px; }
    .pw-clock { font-size: 20px; font-weight: 700; color: #f8fafc; letter-spacing: -0.5px; }
    
    .pw-voice-badge {
        display: flex; align-items: center; gap: 8px;
        padding: 4px 12px; border-radius: 20px;
        background: rgba(34, 211, 238, 0.10);
        border: 1px solid rgba(34, 211, 238, 0.22);
        color: #67e8f9; font-size: 11px; font-weight: 800;
        letter-spacing: 0.5px;
        animation: pw-pulse 2s infinite;
    }

    .pw-voice-wave {
        display: flex; align-items: flex-end; gap: 2px;
        height: 12px;
    }

    .pw-wave-bar {
        width: 2px; height: 4px;
        background: #67e8f9;
        border-radius: 1px;
        animation: pw-wave 1s ease-in-out infinite;
    }
    .pw-wave-bar:nth-child(2) { animation-delay: 0.1s; height: 8px; }
    .pw-wave-bar:nth-child(3) { animation-delay: 0.2s; height: 10px; }
    .pw-wave-bar:nth-child(4) { animation-delay: 0.3s; height: 7px; }
    .pw-wave-bar:nth-child(5) { animation-delay: 0.4s; height: 5px; }

    @keyframes pw-wave {
        0%, 100% { transform: scaleY(1); }
        50% { transform: scaleY(2); }
    }

    @keyframes pw-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
    }

    .pw-divider { color: rgba(255,255,255,0.2); font-size: 18px; margin: 0 4px; }
    .pw-timer { font-size: 20px; font-weight: 600; color: rgba(226,232,240,0.72); font-variant-numeric: tabular-nums; }

    .pw-topbar-tools {
        display: flex; align-items: center; gap: 6px;
        padding: 4px;
        border-radius: 14px;
        background: rgba(15, 23, 42, 0.55);
        border: 1px solid rgba(148,163,184,0.14);
    }
    .pw-tool-btn {
        width: 34px; height: 34px;
        display: flex; align-items: center; justify-content: center;
        border: 1px solid rgba(148,163,184,0.16);
        background: rgba(15,23,42,0.68);
        color: rgba(226,232,240,0.68);
        border-radius: 10px; cursor: pointer;
        transition: all 0.15s;
    }
    .pw-tool-btn:hover { background: rgba(34,211,238,0.10); color: #fff; transform: translateY(-1px); }
    .pw-tool-btn.active { background: rgba(34,211,238,0.12); border-color: rgba(34,211,238,0.34); color: #67e8f9; box-shadow: 0 0 0 1px rgba(34,211,238,0.18); }

    .pw-tool-group { position: relative; display: flex; align-items: center; }
    .pw-more-menu {
        position: absolute;
        top: 44px;
        right: 0;
        min-width: 190px;
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: 6px;
        border-radius: 14px;
        background: rgba(2, 6, 23, 0.94);
        border: 1px solid rgba(148,163,184,0.18);
        box-shadow: 0 24px 50px rgba(2,8,23,0.48);
        z-index: 1200;
        backdrop-filter: blur(14px);
    }
    .pw-more-item {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        border: none;
        border-radius: 10px;
        background: transparent;
        color: rgba(226,232,240,0.82);
        font-size: 12px;
        font-weight: 600;
        text-align: left;
        padding: 8px 10px;
        cursor: pointer;
        transition: all 0.15s ease;
    }
    .pw-more-item:hover {
        background: rgba(34,211,238,0.12);
        color: #fff;
    }
    
    .pw-drawing-toolbar {
        position: absolute;
        top: 44px; right: 0;
        background: rgba(2, 6, 23, 0.88);
        border: 1px solid rgba(148,163,184,0.14);
        border-radius: 18px;
        padding: 6px;
        display: flex; align-items: center; gap: 4px;
        box-shadow: 0 24px 50px rgba(2,8,23,0.42);
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
    .pw-draw-tool.active { background: linear-gradient(135deg, #06b6d4, #2563eb); color: #fff; }
    
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
        background: rgba(15,23,42,0.78);
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
        background: #22d3ee;
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
        background:
            radial-gradient(circle at center, rgba(34,211,238,0.10) 0%, rgba(15,23,42,0.24) 32%, rgba(2,6,23,0.95) 78%),
            linear-gradient(180deg, #08111f 0%, #020617 100%);
    }
    .pw-slide-frame {
        display: flex; align-items: center; justify-content: center;
        position: relative;
        background: #fff;
        border-radius: 18px;
        border: 1px solid rgba(148,163,184,0.16);
        box-shadow: 0 28px 95px rgba(2,8,23,0.58);
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
        background: rgba(2,6,23,0.68); border: 1px solid rgba(148,163,184,0.14);
        color: rgba(226,232,240,0.78); cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: all 0.2s; z-index: 10;
        opacity: 0;
    }
    .pw-slide-container:hover .pw-nav-arrow { opacity: 1; }
    .pw-nav-arrow:hover { background: rgba(15,23,42,0.92); color: #fff; transform: translateY(-50%) scale(1.04); }
    .pw-nav-left { left: 16px; }
    .pw-nav-right { right: 16px; }

    /* Bottom bar */
    .pw-bottombar {
        height: 40px; flex-shrink: 0;
        display: flex; align-items: center; justify-content: space-between;
        padding: 0 16px;
        background: rgba(2, 6, 23, 0.76);
        border-top: 1px solid rgba(148,163,184,0.12);
        backdrop-filter: blur(24px) saturate(140%);
    }
    .pw-bottom-left, .pw-bottom-right { display: flex; align-items: center; gap: 4px; }
    .pw-page-num {
        font-size: 13px; font-weight: 600;
        color: rgba(203,213,225,0.72);
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
    .pw-thumb.active { border-color: #22d3ee; box-shadow: 0 0 0 1px #22d3ee; }
    .pw-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .pw-thumb-empty { width: 100%; height: 100%; background: rgba(255,255,255,0.05); }

    /* === RIGHT SIDEBAR === */
    .pw-sidebar {
        width: 280px; flex-shrink: 0;
        display: flex; flex-direction: column;
        background: rgba(2, 6, 23, 0.84);
        border-left: 1px solid rgba(148,163,184,0.12);
        backdrop-filter: blur(26px) saturate(140%);
    }

    .pw-sidebar-tabs {
        display: flex; flex-shrink: 0;
        border-bottom: 1px solid rgba(148,163,184,0.12);
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
    .pw-stab.active { color: #fff; border-bottom-color: #22d3ee; }

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

    /* Recording Setup Overlay */
    .pw-rec-overlay {
        position: absolute; inset: 0; z-index: 2000;
        background: rgba(10, 10, 25, 0.85);
        backdrop-filter: blur(8px);
        display: flex; align-items: center; justify-content: center;
        animation: pw-fade-in 0.3s ease;
    }
    @keyframes pw-fade-in { from { opacity: 0; } to { opacity: 1; } }

    .pw-setup-card {
        width: 400px; background: #22223b;
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 20px; padding: 24px;
        box-shadow: 0 30px 60px rgba(0,0,0,0.6);
    }
    .pw-setup-header {
        display: flex; align-items: center; justify-content: space-between;
        margin-bottom: 24px;
    }
    .pw-setup-header h3 { margin: 0; font-size: 20px; font-weight: 700; color: #fff; }
    .pw-setup-close { border: none; background: transparent; color: #6b7280; cursor: pointer; }
    .pw-setup-close:hover { color: #fff; }

    .pw-setup-section { margin-bottom: 24px; }
    .pw-setup-section label { display: block; margin-bottom: 10px; font-size: 13px; font-weight: 600; color: #9ca3af; }
    
    .pw-setup-select {
        width: 100%; padding: 12px; border-radius: 12px;
        background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1);
        color: #fff; font-size: 14px; outline: none; transition: border-color 0.2s;
    }
    .pw-setup-select:focus { border-color: #22d3ee; }

    .pw-mic-meter-container {
        position: relative; height: 12px; margin-bottom: 8px;
    }
    .pw-mic-meter-bg {
        width: 100%; height: 100%; background: rgba(0,0,0,0.3);
        border-radius: 6px; overflow: hidden;
    }
    .pw-mic-meter-fill {
        height: 100%; transition: width 0.05s ease-out;
    }
    .pw-mic-meter-markers {
        position: absolute; inset: 0; display: flex; justify-content: space-between; padding: 0 10%;
    }
    .pw-meter-mark { width: 1px; height: 100%; background: rgba(255,255,255,0.1); }
    
    .pw-mic-hint { font-size: 11px; color: #6b7280; margin: 0; }
    .pw-rec-error { color: #ef4444; font-size: 12px; margin-top: 12px; padding: 10px; background: rgba(239, 68, 68, 0.1); border-radius: 8px; }

    .pw-start-rec-btn {
        width: 100%; padding: 14px; border-radius: 14px;
        background: linear-gradient(135deg, #06b6d4, #2563eb); border: none; color: #fff;
        font-weight: 700; font-size: 15px; cursor: pointer;
        transition: all 0.2s;
    }
    .pw-start-rec-btn:hover { filter: brightness(1.05); transform: translateY(-2px); box-shadow: 0 10px 20px rgba(37, 99, 235, 0.28); }

    .pw-rec-indicator {
        position: absolute; top: 0; right: 0;
        width: 8px; height: 8px; border-radius: 50%;
        background: #ef4444; animation: pw-blink 1s infinite;
    }
    @keyframes pw-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }


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
        background: linear-gradient(135deg, #06b6d4, #2563eb);
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
        background: rgba(40, 40, 60, 0.98);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px; padding: 16px;
        box-shadow: 0 12px 40px rgba(0,0,0,0.4);
    }
    .pw-invite-popup h4 { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 8px; }
    .pw-invite-popup p { font-size: 12px; color: rgba(255,255,255,0.5); line-height: 1.5; margin-bottom: 12px; }
    .pw-invite-popup strong { color: rgba(255,255,255,0.8); }

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

    /* === MICROPHONE SELECTION MODAL === */
    .pw-mic-modal-overlay {
        position: fixed; inset: 0;
        background: rgba(0,0,0,0.6);
        backdrop-filter: blur(4px);
        display: flex; align-items: center; justify-content: center;
        z-index: 99999;
    }
    .pw-mic-modal-content {
        width: 400px;
        background: #1f2937;
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        color: #fff;
        display: flex; flex-direction: column;
        animation: pw-pop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes pw-pop {
        0% { transform: scale(0.95); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
    }
    .pw-mic-modal-header {
        display: flex; align-items: center; gap: 10px;
        padding: 16px 20px;
        border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .pw-mic-modal-icon { color: #22d3ee; }
    .pw-mic-modal-header h3 { font-size: 16px; font-weight: 600; margin: 0; flex: 1; }
    .pw-close-modal { padding: 4px; color: rgba(255,255,255,0.5); border: none; background: transparent; cursor: pointer; }
    .pw-close-modal:hover { color: #fff; }
    
    .pw-mic-modal-body { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
    .pw-mic-modal-body p { font-size: 13px; color: rgba(255,255,255,0.6); line-height: 1.5; margin: 0; }
    
    .pw-device-selector {
        display: flex; align-items: center; gap: 12px;
        background: rgba(0,0,0,0.2);
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 8px;
        padding: 10px 14px;
    }
    .pw-device-selector svg { color: #67e8f9; flex-shrink: 0; }
    .pw-device-select {
        flex: 1; background: transparent; border: none;
        color: #fff; font-size: 14px; outline: none;
        font-family: inherit; cursor: pointer;
    }
    .pw-device-select option { background: #1f2937; color: #fff; }

    .pw-mic-modal-footer {
        display: flex; justify-content: flex-end; gap: 12px;
        padding: 16px 20px;
        border-top: 1px solid rgba(255,255,255,0.08);
        background: rgba(0,0,0,0.1);
        border-bottom-left-radius: 12px;
        border-bottom-right-radius: 12px;
    }
    .pw-btn {
        padding: 8px 16px; font-size: 13px; font-weight: 600;
        border-radius: 6px; cursor: pointer; border: none; transition: all 0.2s;
    }
    .pw-btn-cancel {
        background: transparent; color: rgba(255,255,255,0.7);
    }
    .pw-btn-cancel:hover { background: rgba(255,255,255,0.1); color: #fff; }
    .pw-btn-connect {
        background: linear-gradient(135deg, #06b6d4, #2563eb); color: #fff;
    }
    .pw-btn-connect:hover { filter: brightness(1.05); }
    .pw-btn-connect:disabled { opacity: 0.5; cursor: not-allowed; }

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
        color: #22d3ee;
        text-shadow: 0 0 30px rgba(139, 61, 255, 0.5);
        animation: pw-scale-in 1s ease-out infinite;
    }
    @keyframes pw-scale-in {
        from { transform: scale(0.5); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
    }

    .pw-processing-card, .pw-done-card {
        background: rgba(2, 6, 23, 0.92);
        padding: 40px; border-radius: 24px;
        border: 1px solid rgba(148,163,184,0.14);
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
        height: 100%; background: linear-gradient(90deg, #22d3ee, #38bdf8, #2563eb);
        transition: width 0.3s ease;
    }

    .pw-done-icon { color: #10b981; margin-bottom: 20px; }
    .pw-done-card h3 { font-size: 24px; font-weight: 700; margin-bottom: 10px; }
    .pw-done-card p { color: rgba(255,255,255,0.6); margin-bottom: 30px; }

    .pw-done-actions { display: grid; gap: 12px; }
    .pw-btn-download {
        background: linear-gradient(135deg, #06b6d4, #2563eb); color: #fff;
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
        background: rgba(2, 6, 23, 0.92);
        border: 1px solid rgba(148,163,184,0.14);
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
    .pw-magic-item.active { background: rgba(34, 211, 238, 0.10); color: #67e8f9; }
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
    /* Mic Selection Modal */
    .pw-mic-modal-overlay {
        position: fixed; inset: 0; z-index: 2000;
        background: rgba(0,0,0,0.8);
        display: flex; align-items: center; justify-content: center;
        backdrop-filter: blur(8px);
    }
    .pw-mic-modal-content {
        width: 400px; background: rgba(2, 6, 23, 0.96);
        border: 1px solid rgba(148,163,184,0.14);
        border-radius: 16px; overflow: hidden;
        box-shadow: 0 30px 60px rgba(0,0,0,0.6);
    }
    .pw-mic-modal-header {
        padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.06);
        display: flex; align-items: center; gap: 12px;
    }
    .pw-mic-modal-header h3 { font-size: 16px; font-weight: 700; color: #fff; margin: 0; }
    .pw-mic-modal-body { padding: 20px; }
    .pw-mic-modal-body p { font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.5; margin-bottom: 20px; }
    
    .pw-device-selector {
        display: flex; align-items: center; gap: 12px;
        background: rgba(15,23,42,0.72); padding: 12px 16px;
        border-radius: 12px; border: 1px solid rgba(148,163,184,0.14);
        margin-bottom: 20px;
    }
    .pw-device-select {
        flex: 1; background: transparent; border: none;
        color: #fff; font-size: 14px; outline: none;
    }
    .pw-device-select option { background: #0f172a; color: #fff; }

    .pw-system-audio-toggle {
        background: rgba(34, 211, 238, 0.06);
        border: 1px dashed rgba(34, 211, 238, 0.24);
        border-radius: 10px; padding: 12px;
    }
    .pw-toggle-label {
        display: flex; align-items: center; gap: 10px;
        font-size: 13px; font-weight: 600; color: #67e8f9;
        cursor: pointer;
    }
    .pw-toggle-label input { width: 16px; height: 16px; accent-color: #06b6d4; }
    .pw-toggle-hint { font-size: 11px; color: rgba(255,255,255,0.4); margin: 6px 0 0 26px; }

    .pw-mic-modal-footer {
        padding: 16px 20px; border-top: 1px solid rgba(255,255,255,0.06);
        display: flex; justify-content: flex-end; gap: 10px;
    }
    .pw-btn {
        padding: 10px 18px; border-radius: 8px; font-size: 14px; font-weight: 600;
        cursor: pointer; transition: all 0.2s; border: none;
    }
    .pw-btn-cancel { background: transparent; color: rgba(255,255,255,0.5); }
    .pw-btn-cancel:hover { color: #fff; background: rgba(255,255,255,0.05); }
    .pw-btn-connect { background: linear-gradient(135deg, #06b6d4, #2563eb); color: #fff; }
    .pw-btn-connect:hover { filter: brightness(1.05); transform: translateY(-1px); }
    .pw-btn-connect:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

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

    /* === RESPONSIVE DESIGN === */
    @media (max-width: 1024px) {
        .pw-sidebar { width: 260px; }
        .pw-thumbnails { height: 80px; }
        .pw-thumb { width: 80px; height: 56px; }
    }

    @media (max-width: 768px) {
        .pw-body { flex-direction: column; }
        .pw-sidebar { 
            width: 100%; height: 280px; 
            border-left: none; border-top: 1px solid rgba(255,255,255,0.06); 
        }
        .pw-topbar { padding: 0 12px; height: auto; min-height: 48px; flex-wrap: wrap; gap: 8px; justify-content: center; }
        .pw-topbar-left, .pw-topbar-tools { justify-content: center; width: 100%; }
        .pw-slide-container { padding: 10px; }
        .pw-nav-arrow { width: 36px; height: 36px; }
        .pw-magic-popup { right: 10px; top: 100px; width: 160px; }
        .pw-drawing-toolbar { right: 10px; top: 100px; }
    }

    @media (max-width: 480px) {
        .pw-clock, .pw-timer { font-size: 16px; }
        .pw-voice-badge { display: none; }
        .pw-tool-btn { width: 32px; height: 32px; }
        .pw-page-num { font-size: 11px; }
        .pw-bottom-left { gap: 2px; }
        .pw-thumbnails { height: 60px; padding: 4px 8px; }
        .pw-thumb { width: 60px; height: 42px; }
    }

    /* Premium Glassmorphism Improvements */
    .pw-topbar, .pw-bottombar, .pw-thumbnails, .pw-sidebar {
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
    }
    
    .pw-root {
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.02);
    }
`;

export default PresenterWindow;
