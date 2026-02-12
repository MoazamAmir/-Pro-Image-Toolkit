import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import useRecording from './useRecording';

const PresentAndRecordStudio = ({
    pages,
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
        startCountdown, startRecording,
        pauseRecording, resumeRecording, stopRecording,
        downloadRecording, discardRecording,
        cleanup, formatTime
    } = useRecording();

    const [notes, setNotes] = useState('');
    const [showCameraDropdown, setShowCameraDropdown] = useState(false);
    const [showMicDropdown, setShowMicDropdown] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const [fontSize, setFontSize] = useState(16);
    const [previewImgSrc, setPreviewImgSrc] = useState(null);

    const previewCanvasRef = useRef(null);
    const cameraVideoRef = useRef(null);

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

    const handleStartRecording = () => {
        startCountdown(() => {
            // Note: startRecording will trigger browser prompt
            startRecording();
        });
    };

    return createPortal(
        <div className={`prs-studio ${phase === 'setup' ? 'prs-is-setup' : ''}`}>
            {/* TOP BAR */}
            <div className="prs-topbar">
                <div className={`prs-timer ${(phase === 'setup' || phase === 'countdown') ? 'prs-timer-dim' : ''}`}>
                    {formatTime(phase === 'setup' || phase === 'countdown' ? 0 : elapsedTime)}
                </div>

                <div className="prs-topbar-controls">
                    {(phase === 'recording' || phase === 'paused') && (
                        <>
                            <button onClick={phase === 'paused' ? resumeRecording : pauseRecording} className="prs-control-btn prs-pause-btn">
                                {phase === 'paused' ? 'Resume' : 'Pause'}
                            </button>
                            <button onClick={stopRecording} className="prs-control-btn prs-end-btn">
                                <span className="prs-rec-circle" />
                                End recording
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* MAIN CONTENT AREA: 3 Columns */}
            <div className="prs-content">
                {/* COLUMN 1: LEFT SIDEBAR */}
                <div className="prs-left-sidebar">
                    {(phase === 'recording' || phase === 'paused') && (
                        <div className="prs-recording-indicator">
                            <div className="prs-recording-badge">
                                <span className="prs-rec-dot" />
                                <span>Recording</span>
                            </div>
                            <div className="prs-speaker-icon">
                                <div className="prs-mic-visualizer" style={{ transform: `scale(${1 + audioLevel * 0.5})` }}>🎙️</div>
                            </div>
                        </div>
                    )}
                    <div className="flex-1" />
                    {previewImgSrc && (
                        <div className="prs-thumbnail">
                            <img src={previewImgSrc} alt="Preview" />
                        </div>
                    )}
                </div>

                {/* COLUMN 2: CENTER DESIGN AREA */}
                <div className="prs-center">
                    <div className="prs-canvas-placeholder">
                        <canvas ref={previewCanvasRef} className="prs-canvas" />

                        {/* CAMERA BUBBLE (DOM based so displayMedia captures it) */}
                        {cameraStream && selectedCamera !== 'none' && (
                            <div className="prs-camera-bubble">
                                <video ref={cameraVideoRef} autoPlay muted playsInline />
                            </div>
                        )}
                    </div>
                </div>

                {/* COLUMN 3: RIGHT NOTES AREA */}
                <div className="prs-right-sidebar">
                    <div className="prs-notes-header">Add notes to your design</div>
                    <textarea
                        className="prs-notes-textarea"
                        placeholder="Type your notes here..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        style={{ fontSize: `${fontSize}px` }}
                    />
                </div>
            </div>

            {/* BOTTOM BAR: FONT CONTROLS */}
            <div className="prs-bottom-controls">
                <div className="prs-zoom-controls">
                    <button onClick={() => setFontSize(p => Math.max(10, p - 2))} className="prs-zoom-btn">−</button>
                    <span className="prs-zoom-label">aA</span>
                    <button onClick={() => setFontSize(p => Math.min(32, p + 2))} className="prs-zoom-btn">+</button>
                </div>
            </div>

            {/* OVERLAYS */}
            {phase === 'setup' && (
                <div className="prs-setup-overlay-fixed">
                    <div className="prs-setup-modal">
                        <h3>Set up your camera and microphone</h3>
                        <div className="prs-audio-visual-center">
                            <div className="prs-audio-ring" style={{ transform: `scale(${1 + audioLevel * 0.4})` }} />
                            <div className="prs-audio-icon-wrap">🎙️</div>
                        </div>

                        <div className="prs-dropdown">
                            <button onClick={() => setShowCameraDropdown(!showCameraDropdown)} className="prs-drop-btn">
                                {selectedCamera === 'none' ? 'No camera' : cameras.find(c => c.deviceId === selectedCamera)?.label || 'Camera'}
                            </button>
                            {showCameraDropdown && (
                                <div className="prs-drop-menu">
                                    <button onClick={() => { setSelectedCamera('none'); setShowCameraDropdown(false); }}>No camera</button>
                                    {cameras.map(c => <button key={c.deviceId} onClick={() => { setSelectedCamera(c.deviceId); setShowCameraDropdown(false); }}>{c.label}</button>)}
                                </div>
                            )}
                        </div>

                        <div className="prs-dropdown">
                            <button onClick={() => setShowMicDropdown(!showMicDropdown)} className="prs-drop-btn">
                                {microphones.find(m => m.deviceId === selectedMicrophone)?.label || 'Select Mic'}
                            </button>
                            {showMicDropdown && (
                                <div className="prs-drop-menu">
                                    {microphones.map(m => <button key={m.deviceId} onClick={() => { setSelectedMicrophone(m.deviceId); setShowMicDropdown(false); }}>{m.label}</button>)}
                                </div>
                            )}
                        </div>

                        <div className="prs-setup-instructions" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '15px' }}>
                            Tip: For best quality, select <strong>"This Tab"</strong> in the browser prompt.
                        </div>
                        <button onClick={handleStartRecording} className="prs-start-btn">Start recording</button>
                        <button onClick={() => onClose()} className="prs-cancel-btn">Back to editing</button>
                    </div>
                </div>
            )}

            {phase === 'countdown' && (
                <div className="prs-full-overlay">
                    <div className="prs-countdown-num">{countdownValue}</div>
                </div>
            )}

            {phase === 'processing' && (
                <div className="prs-full-overlay">
                    <div className="prs-process-box">
                        <div className="prs-spinner" />
                        <p>Processing: {processingProgress}%</p>
                    </div>
                </div>
            )}

            {phase === 'done' && (
                <div className="prs-full-overlay">
                    <div className="prs-done-box">
                        <h3>Recording Ready!</h3>
                        <div className="prs-done-actions">
                            <button onClick={() => setPhase('setup')} className="prs-discard-btn">Discard</button>
                            <button onClick={downloadRecording} className="prs-download-btn">Download</button>
                            <button onClick={() => onClose()} className="prs-save-btn">Save and exit</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .prs-studio { position: fixed; inset: 0; z-index: 999999; background: #1e1e2e; display: flex; flex-direction: column; font-family: 'Inter', sans-serif; color: white; overflow: hidden; }
                .prs-is-setup .prs-topbar, .prs-is-setup .prs-content, .prs-is-setup .prs-bottom-controls { filter: blur(8px); pointer-events: none; }
                
                .prs-topbar { display: flex; align-items: center; justify-content: space-between; padding: 12px 30px; background: rgba(0,0,0,0.2); }
                .prs-timer { font-family: monospace; font-size: 24px; font-weight: bold; width: 80px; }
                .prs-timer-dim { opacity: 0.3; }
                .prs-topbar-controls { display: flex; gap: 10px; }
                .prs-control-btn { padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; font-size: 14px; }
                .prs-pause-btn { background: rgba(255,255,255,0.1); color: white; }
                .prs-end-btn { background: white; color: #1a1a2e; }

                .prs-content { flex: 1; display: flex; overflow: hidden; }
                .prs-left-sidebar { width: 140px; display: flex; flex-direction: column; align-items: center; padding: 20px 10px; }
                .prs-recording-indicator { text-align: center; }
                .prs-recording-badge { background: rgba(239, 68, 68, 0.1); color: #ef4444; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; margin-bottom: 10px; display: flex; align-items: center; gap: 5px; }
                .prs-rec-dot { width: 6px; height: 6px; background: #ef4444; border-radius: 50%; }
                .prs-speaker-icon { font-size: 32px; width: 60px; height: 60px; background: rgba(255,255,255,0.05); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.1); }
                
                .prs-thumbnail { width: 120px; height: 80px; border-radius: 10px; border: 3px solid #7c3aed; overflow: hidden; background: #000; }
                .prs-thumbnail img { width: 100%; height: 100%; object-fit: cover; }

                .prs-center { flex: 1; display: flex; align-items: center; justify-content: center; padding: 20px; }
                .prs-canvas-placeholder { position: relative; width: 100%; max-width: 800px; aspect-ratio: 16/9; background: #000; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
                .prs-canvas { width: 100%; height: 100%; object-fit: contain; }
                .prs-camera-bubble { position: absolute; bottom: 20px; left: 20px; width: 140px; height: 140px; border-radius: 50%; overflow: hidden; border: 4px solid #8B3DFF; box-shadow: 0 8px 24px rgba(0,0,0,0.4); z-index: 50; }
                .prs-camera-bubble video { width: 100%; height: 100%; object-fit: cover; }

                .prs-right-sidebar { width: 220px; display: flex; flex-direction: column; padding: 20px; border-left: 1px solid rgba(255,255,255,0.05); }
                .prs-notes-header { font-size: 14px; opacity: 0.5; font-style: italic; margin-bottom: 15px; }
                .prs-notes-textarea { flex: 1; background: transparent; border: none; color: white; outline: none; resize: none; line-height: 1.6; }

                .prs-bottom-controls { display: flex; justify-content: flex-end; padding: 10px 30px 20px; }
                .prs-zoom-controls { display: flex; align-items: center; gap: 5px; }
                .prs-zoom-btn { width: 32px; height: 32px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: white; cursor: pointer; }
                
                .prs-setup-overlay-fixed { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.3); z-index: 10000; }
                .prs-setup-modal { width: 380px; background: #1e1e2e; border-radius: 20px; padding: 40px; text-align: center; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 60px rgba(0,0,0,0.6); }
                .prs-audio-visual-center { width: 100px; height: 100px; margin: 0 auto 30px; position: relative; display: flex; align-items: center; justify-content: center; }
                .prs-audio-ring { position: absolute; inset: -5px; border: 3px solid #8B3DFF; border-radius: 50%; opacity: 0.4; }
                .prs-audio-icon-wrap { width: 80px; height: 80px; background: #e5e7eb; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; }
                
                .prs-dropdown { margin-bottom: 12px; position: relative; }
                .prs-drop-btn { width: 100%; padding: 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white; text-align: left; cursor: pointer; }
                .prs-drop-menu { position: absolute; top: 100%; left: 0; right: 0; background: #252538; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); z-index: 100; max-height: 150px; overflow-y: auto; }
                .prs-drop-menu button { width: 100%; padding: 10px; background: transparent; border: none; color: white; text-align: left; cursor: pointer; }
                .prs-drop-menu button:hover { background: rgba(255,255,255,0.1); }
                
                .prs-start-btn { width: 100%; padding: 15px; background: #7c3aed; color: white; font-weight: 700; border-radius: 12px; border: none; cursor: pointer; font-size: 16px; margin-top: 15px; }
                .prs-cancel-btn { background: transparent; border: none; color: rgba(255,255,255,0.4); margin-top: 15px; cursor: pointer; font-size: 13px; }

                .prs-full-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; }
                .prs-countdown-num { font-size: 120px; font-weight: 800; }
                .prs-done-box { background: #1e1e2e; padding: 40px; border-radius: 20px; text-align: center; border: 1px solid rgba(255,255,255,0.1); }
                .prs-done-actions { display: flex; gap: 10px; margin-top: 20px; }
                .prs-download-btn { padding: 10px 20px; background: white; color: #1a1a2e; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; }
                .prs-save-btn { padding: 10px 20px; background: rgba(255,255,255,0.1); color: white; border: none; border-radius: 8px; cursor: pointer; }
                .prs-discard-btn { background: transparent; color: #ef4444; border: none; cursor: pointer; font-size: 14px; }
                
                .prs-spinner { width: 40px; height: 40px; border: 4px solid rgba(255,255,255,0.1); border-top-color: #7c3aed; border-radius: 50%; animation: prs-spin 1s linear infinite; margin: 0 auto 15px; }
                @keyframes prs-spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>,
        document.body
    );
};

export default PresentAndRecordStudio;
