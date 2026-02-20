import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
    X, Pause, Play, Mic, Video, ChevronLeft, ChevronRight,
    Monitor, Download, Trash2, CheckCircle, Clock, Settings
} from 'lucide-react';
import useRecording from './useRecording';

const PresentAndRecordStudio = ({
    pages,
    activePageId,
    switchPage,
    layers,
    canvasSize,
    adjustments,
    renderFinalCanvas,
    onClose,
    darkMode
}) => {
    const {
        phase, setPhase,
        elapsedTime, countdownValue,
        recordedBlob, processingProgress,
        cameras, microphones,
        selectedCamera, setSelectedCamera,
        selectedMicrophone, setSelectedMicrophone,
        audioLevel,
        enumerateDevices, startAudioMonitor,
        startCameraPreview,
        startCountdown, prepareRecording, executeRecording,
        pauseRecording, resumeRecording, stopRecording,
        downloadRecording, discardRecording,
        cleanup, formatTime
    } = useRecording();

    const [notes, setNotes] = useState({});
    const [showCameraDropdown, setShowCameraDropdown] = useState(false);
    const [showMicDropdown, setShowMicDropdown] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const [fontSize, setFontSize] = useState(18);
    const [previewImgSrc, setPreviewImgSrc] = useState(null);

    const previewCanvasRef = useRef(null);
    const cameraVideoRef = useRef(null);

    const currentPageIndex = pages.findIndex(p => p.id === activePageId);
    const totalPages = pages.length;

    // Initialize
    useEffect(() => {
        enumerateDevices();
    }, [enumerateDevices]);

    // Mic monitor
    useEffect(() => {
        if (selectedMicrophone) startAudioMonitor(selectedMicrophone);
    }, [selectedMicrophone, startAudioMonitor]);

    // Camera preview
    useEffect(() => {
        const setupCamera = async () => {
            const stream = await startCameraPreview(selectedCamera);
            setCameraStream(stream);
            if (stream && cameraVideoRef.current) cameraVideoRef.current.srcObject = stream;
        };
        setupCamera();
    }, [selectedCamera, startCameraPreview]);

    // Render design to canvas
    const renderDesignToCanvas = useCallback(async (canvas) => {
        if (!canvas || !renderFinalCanvas) return;
        try {
            const renderedCanvas = await renderFinalCanvas(layers, adjustments, {
                scale: 1, transparent: false, useOriginalResolution: false
            });
            if (renderedCanvas && canvas) {
                const ctx = canvas.getContext('2d');
                canvas.width = canvasSize.width;
                canvas.height = canvasSize.height;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(renderedCanvas, 0, 0, canvas.width, canvas.height);
                setPreviewImgSrc(canvas.toDataURL('image/jpeg', 0.8));
            }
        } catch (err) {
            console.error('Render error:', err);
        }
    }, [layers, adjustments, canvasSize, renderFinalCanvas]);

    useEffect(() => {
        if (previewCanvasRef.current) renderDesignToCanvas(previewCanvasRef.current);
    }, [renderDesignToCanvas, layers, adjustments]);

    const handleStartRecording = async () => {
        // Step 1: Prepare streams (acquires permissions immediately)
        const success = await prepareRecording();
        if (success) {
            // Step 2: Set phase to countdown for UI
            setPhase('countdown');
            // Step 3: Start countdown
            startCountdown(() => {
                // Step 4: Countdown finished, start actual recording
                executeRecording();
                // Phase is set to 'recording' inside executeRecording()
            });
        }
    };

    const handlePageSwitch = (direction) => {
        const nextIndex = currentPageIndex + direction;
        if (nextIndex >= 0 && nextIndex < totalPages) {
            switchPage(pages[nextIndex].id);
        }
    };

    const handleNoteChange = (e) => {
        setNotes(prev => ({
            ...prev,
            [activePageId]: e.target.value
        }));
    };

    // Audio Bar Visualizer Component
    const AudioBars = () => {
        const barCount = 5;
        return (
            <div className="prs-audio-bars">
                {[...Array(barCount)].map((_, i) => (
                    <div
                        key={i}
                        className="prs-audio-bar"
                        style={{
                            height: `${Math.max(4, audioLevel * (100 - (i * 10)))}%`,
                            transition: 'height 50ms ease-out'
                        }}
                    />
                ))}
            </div>
        );
    };

    return createPortal(
        <div className={`prs-studio ${phase === 'setup' ? 'prs-is-setup' : ''}`}>
            {/* TOP BAR */}
            <div className="prs-topbar">
                <div className="prs-brand">
                    <div className="prs-logo">
                        <Video className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <div className="prs-logo-text">Studio <span className="text-purple-400">PRO</span></div>
                        <div className="prs-status-text">
                            {phase === 'recording' ? 'Live Recording' : phase === 'paused' ? 'Paused' : 'Setup Mode'}
                        </div>
                    </div>
                </div>

                <div className={`prs-timer-container ${(phase === 'setup' || phase === 'countdown') ? 'prs-timer-dim' : ''}`}>
                    <Clock className="w-5 h-5 opacity-50" />
                    <span className="prs-timer">{formatTime(phase === 'setup' || phase === 'countdown' ? 0 : elapsedTime)}</span>
                </div>

                <div className="prs-topbar-controls">
                    {(phase === 'recording' || phase === 'paused') && (
                        <>
                            <button onClick={phase === 'paused' ? resumeRecording : pauseRecording} className="prs-control-btn prs-pause-btn">
                                {phase === 'paused' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                                <span>{phase === 'paused' ? 'Resume' : 'Pause'}</span>
                            </button>
                            <button onClick={stopRecording} className="prs-control-btn prs-end-btn">
                                <div className="prs-stop-icon" />
                                <span>Finish</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="prs-content">
                {/* COLUMN 1: LEFT CONTROLS */}
                <div className="prs-left-sidebar">
                    <div className="prs-sidebar-top">
                        {(phase === 'recording' || phase === 'paused') && (
                            <div className="prs-indicator-group">
                                <div className="prs-recording-badge">
                                    <span className="prs-rec-dot" />
                                    <span>{phase === 'paused' ? 'Paused' : 'Recording'}</span>
                                </div>
                                <div className="prs-audio-monitor-box">
                                    <Mic className="w-4 h-4 text-purple-400" />
                                    <AudioBars />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="prs-sidebar-bottom">
                        {previewImgSrc && (
                            <div className="prs-thumbnail-card">
                                <span className="prs-thumb-label">Current Page</span>
                                <div className="prs-thumbnail">
                                    <img src={previewImgSrc} alt="Preview" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* COLUMN 2: CENTER CANVAS */}
                <div className="prs-center">
                    <div className="prs-main-stage">
                        <div className="prs-canvas-container shadow-2xl">
                            <canvas ref={previewCanvasRef} className="prs-canvas" />

                            {cameraStream && selectedCamera !== 'none' && (
                                <div className="prs-camera-overlay">
                                    <video ref={cameraVideoRef} autoPlay muted playsInline />
                                </div>
                            )}
                        </div>

                        {/* Page Navigation Overlay */}
                        <div className="prs-page-nav-overlay">
                            <button
                                onClick={() => handlePageSwitch(-1)}
                                disabled={currentPageIndex === 0}
                                className="prs-nav-circle-btn"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <div className="prs-page-pill">
                                Page {currentPageIndex + 1} of {totalPages}
                            </div>
                            <button
                                onClick={() => handlePageSwitch(1)}
                                disabled={currentPageIndex === totalPages - 1}
                                className="prs-nav-circle-btn"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* COLUMN 3: RIGHT NOTES */}
                <div className="prs-right-sidebar">
                    <div className="prs-notes-pane">
                        <div className="prs-notes-header">
                            <span className="font-bold">Speaker Notes</span>
                            <span className="text-[10px] opacity-50 uppercase tracking-widest">Page {currentPageIndex + 1}</span>
                        </div>
                        <textarea
                            className="prs-notes-textarea scrollbar-hide"
                            placeholder="Add notes for this page..."
                            value={notes[activePageId] || ''}
                            onChange={handleNoteChange}
                            style={{ fontSize: `${fontSize}px` }}
                        />
                        <div className="prs-notes-footer">
                            <button onClick={() => setFontSize(p => Math.max(12, p - 2))} className="prs-font-btn">A-</button>
                            <button onClick={() => setFontSize(p => Math.min(36, p + 2))} className="prs-font-btn">A+</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* OVERLAYS */}
            {phase === 'setup' && (
                <div className="prs-overlay prs-setup-bg">
                    <div className="prs-setup-card card-glass">
                        <div className="prs-setup-header">
                            <div className="prs-setup-icon-box">
                                <Settings className="w-8 h-8 text-purple-400" />
                            </div>
                            <h3>Studio Setup</h3>
                            <p className="opacity-50 text-xs">Configure your inputs before starting</p>
                        </div>

                        <div className="prs-setup-body">
                            <div className="prs-input-config">
                                <div className="prs-config-item">
                                    <div className="flex items-center gap-2 mb-2 text-xs font-bold text-gray-400">
                                        <Video className="w-3 h-3" /> CAMERA
                                    </div>
                                    <div className="prs-custom-select">
                                        <button onClick={() => setShowCameraDropdown(!showCameraDropdown)} className="prs-select-trigger">
                                            {selectedCamera === 'none' ? 'No camera' : cameras.find(c => c.deviceId === selectedCamera)?.label || 'Camera'}
                                        </button>
                                        {showCameraDropdown && (
                                            <div className="prs-select-options">
                                                <button onClick={() => { setSelectedCamera('none'); setShowCameraDropdown(false); }}>No camera</button>
                                                {cameras.map(c => <button key={c.deviceId} onClick={() => { setSelectedCamera(c.deviceId); setShowCameraDropdown(false); }}>{c.label}</button>)}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="prs-config-item">
                                    <div className="flex items-center gap-2 mb-2 text-xs font-bold text-gray-400">
                                        <Mic className="w-3 h-3" /> MICROPHONE
                                    </div>
                                    <div className="prs-custom-select">
                                        <button onClick={() => setShowMicDropdown(!showMicDropdown)} className="prs-select-trigger">
                                            {microphones.find(m => m.deviceId === selectedMicrophone)?.label || 'Select Mic'}
                                        </button>
                                        {showMicDropdown && (
                                            <div className="prs-select-options">
                                                {microphones.map(m => <button key={m.deviceId} onClick={() => { setSelectedMicrophone(m.deviceId); setShowMicDropdown(false); }}>{m.label}</button>)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="prs-mic-check">
                                <div className="text-[10px] uppercase font-bold text-gray-500 mb-2">Mic Level</div>
                                <div className="prs-mic-bar-bg">
                                    <div className="prs-mic-bar-fill" style={{ width: `${audioLevel * 100}%` }} />
                                </div>
                            </div>
                        </div>

                        <div className="prs-setup-footer">
                            <button onClick={handleStartRecording} className="prs-btn-primary">
                                <Play className="w-5 h-5 mr-2" /> Start Recording
                            </button>
                            <button onClick={() => onClose()} className="prs-btn-ghost">Discard and Exit</button>
                        </div>
                    </div>
                </div>
            )}

            {phase === 'countdown' && (
                <div className="prs-overlay prs-countdown-bg">
                    <div className="prs-countdown-circle">
                        <span className="prs-countdown-val">{countdownValue}</span>
                    </div>
                </div>
            )}

            {phase === 'processing' && (
                <div className="prs-overlay prs-processing-bg">
                    <div className="prs-loader-box">
                        <div className="prs-ring-container">
                            <div className="prs-ring" />
                            <div className="prs-ring-inner" />
                            <span className="prs-load-percent">{processingProgress}%</span>
                        </div>
                        <p className="prs-load-text">Optimizing and encoding your recording...</p>
                    </div>
                </div>
            )}

            {phase === 'done' && (
                <div className="prs-overlay prs-done-bg">
                    <div className="prs-done-card card-glass">
                        <div className="prs-done-header">
                            <div className="prs-success-icon">
                                <CheckCircle className="w-12 h-12 text-emerald-400" />
                            </div>
                            <h3>Recording Complete!</h3>
                            <p className="opacity-50 text-xs">Your video is ready to download</p>
                        </div>

                        <div className="prs-done-body">
                            <div className="prs-preview-placeholder">
                                <Video className="w-10 h-10 opacity-20" />
                                <span className="text-[10px] mt-2 opacity-30">ENCODED WEB MEDIA</span>
                            </div>
                        </div>

                        <div className="prs-done-footer">
                            <button onClick={downloadRecording} className="prs-btn-primary">
                                <Download className="w-5 h-5 mr-2" /> Download File
                            </button>
                            <div className="flex gap-2 w-full">
                                <button onClick={() => setPhase('setup')} className="prs-btn-danger flex-1">
                                    <Trash2 className="w-4 h-4 mr-2" /> Discard
                                </button>
                                <button onClick={() => onClose()} className="prs-btn-secondary flex-1">
                                    Close Studio
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .prs-studio { position: fixed; inset: 0; z-index: 999999; background: #0f111a; display: flex; flex-direction: column; font-family: 'Outfit', 'Inter', sans-serif; color: white; overflow: hidden; }
                .prs-is-setup .prs-topbar, .prs-is-setup .prs-content { filter: blur(15px); pointer-events: none; opacity: 0.5; transition: all 0.5s ease; }
                
                /* Topbar Styling */
                .prs-topbar { height: 72px; display: flex; align-items: center; justify-content: space-between; padding: 0 40px; background: rgba(15, 17, 26, 0.8); backdrop-blur: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); z-index: 100; }
                .prs-brand { display: flex; align-items: center; gap: 15px; }
                .prs-logo { width: 36px; height: 36px; background: linear-gradient(135deg, #7c3aed, #4f46e5); border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3); }
                .prs-logo-text { font-size: 18px; font-weight: 900; letter-spacing: -0.5px; }
                .prs-status-text { font-size: 10px; font-weight: 700; color: #7c3aed; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; }
                
                .prs-timer-container { display: flex; align-items: center; gap: 10px; background: rgba(0,0,0,0.3); padding: 8px 16px; border-radius: 99px; border: 1px solid rgba(255,255,255,0.05); }
                .prs-timer { font-family: 'Space Mono', monospace; font-size: 20px; font-weight: bold; min-width: 60px; }
                .prs-timer-dim { opacity: 0.2; }
                
                .prs-topbar-controls { display: flex; gap: 12px; }
                .prs-control-btn { padding: 8px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; border: none; font-size: 13px; display: flex; align-items: center; gap: 10px; transition: all 0.2s; }
                .prs-pause-btn { background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.1); }
                .prs-pause-btn:hover { background: rgba(255,255,255,0.1); }
                .prs-end-btn { background: #ef4444; color: white; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3); }
                .prs-end-btn:hover { background: #dc2626; transform: translateY(-1px); }
                .prs-stop-icon { width: 10px; height: 10px; background: white; border-radius: 2px; }

                /* Sidebar Styling */
                .prs-content { flex: 1; display: flex; overflow: hidden; background: radial-gradient(circle at center, #1a1c2e 0%, #0f111a 100%); }
                .prs-left-sidebar { width: 180px; display: flex; flex-direction: column; padding: 30px 20px; border-right: 1px solid rgba(255,255,255,0.03); }
                .prs-recording-badge { background: rgba(239, 68, 68, 0.1); color: #ef4444; font-size: 9px; font-weight: 900; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; border: 1px solid rgba(239, 68, 68, 0.2); }
                .prs-rec-dot { width: 8px; height: 8px; background: #ef4444; border-radius: 50%; animation: pulse 1.5s infinite; }
                @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } 100% { opacity: 1; transform: scale(1); } }
                
                .prs-audio-monitor-box { width: 100%; padding: 15px; background: rgba(255,255,255,0.03); border-radius: 15px; display: flex; align-items: center; gap: 12px; border: 1px solid rgba(255,255,255,0.05); }
                .prs-audio-bars { flex: 1; display: flex; align-items: flex-end; gap: 3px; height: 24px; }
                .prs-audio-bar { flex: 1; background: #8B3DFF; border-radius: 2px; min-height: 4px; }
                
                .prs-thumbnail-card { margin-top: auto; }
                .prs-thumb-label { font-size: 10px; font-weight: 800; color: rgba(255,255,255,0.3); text-transform: uppercase; margin-bottom: 10px; display: block; }
                .prs-thumbnail { width: 100%; aspect-ratio: 4/3; border-radius: 12px; border: 2px solid #7c3aed; overflow: hidden; background: #000; box-shadow: 0 8px 25px rgba(0,0,0,0.4); }
                .prs-thumbnail img { width: 100%; height: 100%; object-fit: cover; }

                /* Stage Styling */
                .prs-center { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; }
                .prs-main-stage { position: relative; width: 100%; max-width: 900px; display: flex; flex-direction: column; gap: 25px; }
                .prs-canvas-container { position: relative; width: 100%; aspect-ratio: 16/9; background: #000; border-radius: 20px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05); }
                .prs-canvas { width: 100%; height: 100%; object-fit: contain; }
                .prs-camera-overlay { position: absolute; bottom: 30px; left: 30px; width: 180px; height: 180px; border-radius: 50%; overflow: hidden; border: 4px solid #8B3DFF; box-shadow: 0 12px 40px rgba(0,0,0,0.6); z-index: 50; }
                .prs-camera-overlay video { width: 100%; height: 100%; object-fit: cover; }

                .prs-page-nav-overlay { display: flex; align-items: center; justify-content: center; gap: 15px; }
                .prs-nav-circle-btn { width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
                .prs-nav-circle-btn:hover:not(:disabled) { background: #7c3aed; transform: scale(1.1); }
                .prs-nav-circle-btn:disabled { opacity: 0.2; cursor: not-allowed; }
                .prs-page-pill { padding: 8px 24px; background: rgba(124, 58, 237, 0.1); border: 1px solid rgba(124, 58, 237, 0.2); border-radius: 99px; font-size: 13px; font-weight: 800; color: #a78bfa; }

                /* Notes Styling */
                .prs-right-sidebar { width: 280px; display: flex; flex-direction: column; padding: 30px 20px; border-left: 1px solid rgba(255,255,255,0.03); }
                .prs-notes-pane { flex: 1; display: flex; flex-direction: column; background: rgba(255,255,255,0.02); border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; }
                .prs-notes-header { padding: 15px 20px; background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; font-size: 12px; }
                .prs-notes-textarea { flex: 1; background: transparent; border: none; color: rgba(255,255,255,0.8); outline: none; resize: none; line-height: 1.8; padding: 20px; font-family: 'Outfit', sans-serif; }
                .prs-notes-footer { padding: 12px 20px; display: flex; gap: 10px; justify-content: flex-end; }
                .prs-font-btn { width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; cursor: pointer; font-size: 10px; font-weight: 800; }
                
                /* Overlays */
                .prs-overlay { position: absolute; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px); }
                .prs-setup-bg { background: rgba(15, 17, 26, 0.9); }
                .card-glass { background: #1e1e2e; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 30px 80px rgba(0,0,0,0.8); border-radius: 32px; overflow: hidden; }
                .prs-setup-card { width: 440px; padding: 40px; }
                .prs-setup-header { text-align: center; margin-bottom: 30px; }
                .prs-setup-icon-box { width: 64px; height: 64px; background: rgba(124, 58, 237, 0.1); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
                .prs-setup-header h3 { font-size: 24px; font-weight: 900; margin-bottom: 8px; }

                .prs-input-config { display: flex; flex-direction: column; gap: 20px; margin-bottom: 30px; }
                .prs-custom-select { position: relative; }
                .prs-select-trigger { width: 100%; padding: 14px 20px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; color: white; text-align: left; cursor: pointer; font-size: 13px; font-weight: 600; }
                .prs-select-options { position: absolute; bottom: 100%; left: 0; right: 0; background: #2a2a3e; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; max-height: 150px; overflow-y: auto; z-index: 50; margin-bottom: 8px; }
                .prs-select-options button { width: 100%; padding: 12px 20px; background: transparent; border: none; color: white; text-align: left; cursor: pointer; font-size: 12px; border-bottom: 1px solid rgba(255,255,255,0.03); }
                .prs-select-options button:hover { background: rgba(124, 58, 237, 0.1); }
                
                .prs-mic-bar-bg { height: 6px; background: rgba(255,255,255,0.05); border-radius: 10px; overflow: hidden; }
                .prs-mic-bar-fill { height: 100%; background: linear-gradient(90deg, #7c3aed, #ec4899); transition: width 0.1s; }

                .prs-btn-primary { width: 100%; padding: 16px; background: #7c3aed; color: white; font-weight: 800; border-radius: 16px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px rgba(124, 58, 237, 0.4); margin-bottom: 15px; }
                .prs-btn-ghost { width: 100%; background: transparent; border: none; color: rgba(255,255,255,0.4); font-weight: 700; cursor: pointer; font-size: 12px; }
                
                /* Countdown */
                .prs-countdown-circle { width: 220px; height: 220px; border-radius: 50%; background: rgba(124, 58, 237, 0.1); border: 4px solid #7c3aed; display: flex; align-items: center; justify-content: center; }
                .prs-countdown-val { font-size: 100px; font-weight: 900; background: linear-gradient(to bottom, #fff, #7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

                /* Processing */
                .prs-loader-box { text-align: center; }
                .prs-ring-container { position: relative; width: 120px; height: 120px; margin: 0 auto 30px; }
                .prs-ring { position: absolute; inset: 0; border: 4px solid rgba(124, 58, 237, 0.1); border-top-color: #7c3aed; border-radius: 50%; animation: spin 2s linear infinite; }
                .prs-ring-inner { position: absolute; inset: 15px; border: 4px solid rgba(236, 72, 153, 0.1); border-bottom-color: #ec4899; border-radius: 50%; animation: spin 1s linear reverse infinite; }
                .prs-load-percent { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 900; }
                @keyframes spin { to { transform: rotate(360deg); } }

                /* Done Card */
                .prs-done-card { width: 440px; padding: 40px; }
                .prs-done-header { text-align: center; margin-bottom: 30px; }
                .prs-success-icon { margin-bottom: 20px; }
                .prs-preview-placeholder { height: 160px; background: rgba(0,0,0,0.3); border-radius: 20px; border: 1px dashed rgba(255,255,255,0.1); display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 30px; }
                .prs-btn-secondary { background: rgba(255,255,255,0.05); color: white; padding: 12px; border-radius: 12px; font-weight: 700; cursor: pointer; border: 1px solid rgba(255,255,255,0.1); }
                .prs-btn-danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 12px; border-radius: 12px; font-weight: 700; cursor: pointer; border: 1px solid rgba(239, 68, 68, 0.2); }
                
                .scrollbar-hide::-webkit-scrollbar { display: none; }
            `}</style>
        </div>,
        document.body
    );
};

export default PresentAndRecordStudio;
