import React, { useState, useRef, useEffect } from 'react';
import { X, Mic, Square, Play, Pause, Save, Trash2, Loader2, Clock } from 'lucide-react';
import LocalRecordingsService from '../services/LocalRecordingsService';
import agoraVoiceService from '../services/AgoraVoiceService';
import { getBestAudioDevice } from '../utils/audioUtils';

/**
 * AudioRecorderModal
 * A modal for recording audio in-place. Saves to IndexedDB via LocalRecordingsService.
 */
const AudioRecorderModal = ({ onClose, onSave, darkMode, user }) => {
    const [phase, setPhase] = useState('idle'); // idle, recording, paused, done
    const [elapsedTime, setElapsedTime] = useState(0);
    const [audioLevel, setAudioLevel] = useState(0);
    const [recordedBlob, setRecordedBlob] = useState(null);
    const [recordedUrl, setRecordedUrl] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [saving, setSaving] = useState(false);
    const [recordingName, setRecordingName] = useState('');
    const [error, setError] = useState(null);

    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);
    const streamRef = useRef(null);
    const audioCtxRef = useRef(null);
    const analyserRef = useRef(null);
    const animFrameRef = useRef(null);
    const playbackRef = useRef(new Audio());

    useEffect(() => {
        return () => { stopEverything(); };
    }, []);

    const stopEverything = async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        
        // Stop Agora Service
        await agoraVoiceService.stop();

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        if (audioCtxRef.current) {
            audioCtxRef.current.close().catch(() => { });
            audioCtxRef.current = null;
        }
        if (playbackRef.current) {
            playbackRef.current.pause();
            playbackRef.current.src = '';
        }
    };

    const startRecording = async () => {
        try {
            setError(null);
            
            // 1. Identify best audio device
            const deviceId = await getBestAudioDevice();
            
            // 2. Start Agora Host (High reliability mic capture)
            const channelName = `rec_solo_${Date.now()}`;
            const agoraSuccess = await agoraVoiceService.startHost(channelName, deviceId);
            
            if (!agoraSuccess || !agoraVoiceService.localAudioTrack) {
                throw new Error('Failed to initialize high-quality audio track.');
            }

            // 3. Extract MediaStreamTrack from Agora
            const agoraTrack = agoraVoiceService.localAudioTrack.getMediaStreamTrack();
            console.log('[AudioRecorder] Captured Agora track:', agoraTrack.label);
            const stream = new MediaStream([agoraTrack]);
            streamRef.current = stream;

            // 4. Set up Visualizer
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            audioCtxRef.current = audioCtx;
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            analyserRef.current = analyser;

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const checkLevel = () => {
                if (!analyserRef.current) return;
                analyser.getByteFrequencyData(dataArray);
                const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
                setAudioLevel(avg / 255);
                animFrameRef.current = requestAnimationFrame(checkLevel);
            };
            checkLevel();

            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus' : 'audio/webm';

            chunksRef.current = [];
            const recorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = recorder;

            recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: mimeType });
                setRecordedBlob(blob);
                setRecordedUrl(URL.createObjectURL(blob));
                setPhase('done');
                
                // Cleanup
                await agoraVoiceService.stop();
                if (streamRef.current) { 
                    streamRef.current.getTracks().forEach(t => t.stop()); 
                    streamRef.current = null; 
                }
                if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
                if (audioCtxRef.current) { 
                    audioCtxRef.current.close().catch(() => { }); 
                    audioCtxRef.current = null; 
                }
                setAudioLevel(0);
            };

            recorder.start(250);
            setPhase('recording');
            setElapsedTime(0);
            timerRef.current = setInterval(() => setElapsedTime(p => p + 1), 1000);
        } catch (err) {
            console.error('Recording failed:', err);
            setError('Audio recording failed. Please check microphone permissions.');
            await agoraVoiceService.stop();
        }
    };

    const pauseRecording = () => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.pause();
            if (timerRef.current) clearInterval(timerRef.current);
            setPhase('paused');
        }
    };

    const resumeRecording = () => {
        if (mediaRecorderRef.current?.state === 'paused') {
            mediaRecorderRef.current.resume();
            timerRef.current = setInterval(() => setElapsedTime(p => p + 1), 1000);
            setPhase('recording');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const discardRecording = () => {
        if (recordedUrl) URL.revokeObjectURL(recordedUrl);
        setRecordedBlob(null);
        setRecordedUrl(null);
        setElapsedTime(0);
        setPhase('idle');
        setRecordingName('');
        playbackRef.current.pause();
        setIsPlaying(false);
    };

    const togglePlayback = () => {
        if (!recordedUrl) return;
        if (isPlaying) {
            playbackRef.current.pause();
            setIsPlaying(false);
        } else {
            playbackRef.current.src = recordedUrl;
            playbackRef.current.play();
            setIsPlaying(true);
            playbackRef.current.onended = () => setIsPlaying(false);
        }
    };

    const saveRecording = async () => {
        if (!recordedBlob) return;
        setSaving(true);
        try {
            const userId = user?.uid || 'guest';
            const name = recordingName.trim() || `Recording ${new Date().toLocaleString()}`;
            const saved = await LocalRecordingsService.saveRecording(recordedBlob, userId, name, elapsedTime);
            if (saved && onSave) onSave(saved);
            onClose();
        } catch (err) {
            console.error('Save failed:', err);
            setError('Failed to save recording.');
        } finally {
            setSaving(false);
        }
    };

    const fmt = (s) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    };

    const bars = 30;

    return (
        <>
            {/* Overlay — inline styles guarantee centering regardless of any parent CSS */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    zIndex: 999999,
                    background: 'rgba(2,6,23,0.58)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    boxSizing: 'border-box',
                }}
            >
                {/* Modal */}
                <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        width: '100%',
                        maxWidth: '480px',
                        background: darkMode ? 'rgba(2,6,23,0.94)' : 'rgba(255,255,255,0.94)',
                        border: `1px solid ${darkMode ? 'rgba(148,163,184,0.14)' : 'rgba(148,163,184,0.16)'}`,
                        borderRadius: '24px',
                        overflow: 'hidden',
                        boxShadow: '0 30px 70px rgba(15,23,42,0.28)',
                        backdropFilter: 'blur(24px)',
                    }}
                >
                    {/* Header */}
                    <div className="arm-header">
                        <div className="arm-header-left">
                            <div className="arm-icon-box">
                                <Mic className="w-5 h-5 text-cyan-300" />
                            </div>
                            <div>
                                <h3 className="arm-title">Record Audio</h3>
                                <p className="arm-subtitle">
                                    {phase === 'idle' ? 'Ready to record' :
                                        phase === 'recording' ? 'Recording...' :
                                            phase === 'paused' ? 'Paused' : 'Recording complete'}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="arm-close-btn">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="arm-body">
                        {error && (
                            <div className="arm-error">
                                <X className="w-4 h-4" /> {error}
                            </div>
                        )}

                        <div className="arm-waveform-container">
                            {phase === 'recording' && (
                                <div className="arm-rec-badge">
                                    <span className="arm-rec-dot" />
                                    REC
                                </div>
                            )}
                            <div className="arm-waveform">
                                {Array.from({ length: bars }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`arm-wave-bar ${phase === 'recording' ? 'arm-wave-active' : ''}`}
                                        style={{
                                            height: phase === 'recording'
                                                ? `${Math.max(8, audioLevel * 100 * (0.5 + Math.sin(i * 0.6 + Date.now() / 200) * 0.5))}%`
                                                : phase === 'done'
                                                    ? `${20 + Math.sin(i * 0.7) * 25 + Math.random() * 15}%`
                                                    : '8%',
                                            transition: phase === 'recording' ? 'height 80ms ease' : 'height 0.3s ease'
                                        }}
                                    />
                                ))}
                            </div>
                            <div className="arm-timer">{fmt(elapsedTime)}</div>
                        </div>

                        {phase === 'done' && (
                            <div className="arm-done-details">
                                <div className="arm-duration-badge">
                                    <Clock className="w-3 h-3 text-cyan-300" />
                                    <span>Total Duration: {fmt(elapsedTime)}</span>
                                </div>
                                <div className="arm-name-field">
                                    <label className="arm-label">Recording Name</label>
                                    <input
                                        type="text"
                                        value={recordingName}
                                        onChange={(e) => setRecordingName(e.target.value)}
                                        placeholder="My recording..."
                                        className="arm-input"
                                        autoFocus
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="arm-footer">
                        {phase === 'idle' && (
                            <button onClick={startRecording} className="arm-btn-primary">
                                <Mic className="w-4 h-4" /> Start Recording
                            </button>
                        )}
                        {phase === 'recording' && (
                            <div className="arm-btn-group">
                                <button onClick={pauseRecording} className="arm-btn-secondary">
                                    <Pause className="w-4 h-4" /> Pause
                                </button>
                                <button onClick={stopRecording} className="arm-btn-stop">
                                    <Square className="w-4 h-4" /> Stop
                                </button>
                            </div>
                        )}
                        {phase === 'paused' && (
                            <div className="arm-btn-group">
                                <button onClick={resumeRecording} className="arm-btn-secondary">
                                    <Play className="w-4 h-4" /> Resume
                                </button>
                                <button onClick={stopRecording} className="arm-btn-stop">
                                    <Square className="w-4 h-4" /> Stop
                                </button>
                            </div>
                        )}
                        {phase === 'done' && (
                            <div className="arm-btn-group">
                                <button onClick={togglePlayback} className="arm-btn-secondary">
                                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                    {isPlaying ? 'Pause' : 'Preview'}
                                </button>
                                <button onClick={discardRecording} className="arm-btn-danger">
                                    <Trash2 className="w-4 h-4" /> Discard
                                </button>
                                <button onClick={saveRecording} className="arm-btn-primary" disabled={saving}>
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        )}
                    </div>

                    <style>{`
                        .arm-header {
                            display: flex; align-items: center; justify-content: space-between;
                            padding: 20px 24px;
                            border-bottom: 1px solid ${darkMode ? 'rgba(148,163,184,0.12)' : 'rgba(148,163,184,0.12)'};
                        }
                        .arm-header-left { display: flex; align-items: center; gap: 14px; }
                        .arm-icon-box {
                            width: 44px; height: 44px; border-radius: 14px;
                            display: flex; align-items: center; justify-content: center;
                            background: ${darkMode ? 'rgba(34,211,238,0.12)' : 'rgba(14,165,233,0.10)'};
                            flex-shrink: 0;
                        }
                        .arm-title { font-size: 16px; font-weight: 800; color: ${darkMode ? '#fff' : '#111827'}; margin: 0; }
                        .arm-subtitle { font-size: 11px; font-weight: 600; color: #94a3b8; margin: 2px 0 0; }
                        .arm-close-btn {
                            width: 36px; height: 36px; border: none; border-radius: 10px; cursor: pointer;
                            background: ${darkMode ? 'rgba(15,23,42,0.72)' : 'rgba(248,250,252,0.92)'};
                            color: ${darkMode ? '#94a3b8' : '#64748b'};
                            display: flex; align-items: center; justify-content: center;
                            flex-shrink: 0; transition: background 0.15s;
                        }
                        .arm-close-btn:hover { background: ${darkMode ? 'rgba(34,211,238,0.10)' : 'rgba(14,165,233,0.08)'}; }
                        .arm-body { padding: 24px; }
                        .arm-error {
                            display: flex; align-items: center; gap: 8px; padding: 10px 14px;
                            background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.15);
                            border-radius: 10px; color: #ef4444; font-size: 12px; font-weight: 600; margin-bottom: 16px;
                        }
                        .arm-waveform-container {
                            position: relative; height: 120px;
                            display: flex; flex-direction: column; align-items: center; justify-content: center;
                            background: ${darkMode ? 'rgba(15,23,42,0.72)' : 'rgba(248,250,252,0.96)'};
                            border-radius: 18px;
                            border: 1px solid ${darkMode ? 'rgba(148,163,184,0.12)' : 'rgba(148,163,184,0.14)'};
                            overflow: hidden;
                        }
                        .arm-rec-badge {
                            position: absolute; top: 10px; left: 12px;
                            display: flex; align-items: center; gap: 6px;
                            font-size: 9px; font-weight: 900; color: #ef4444;
                            text-transform: uppercase; letter-spacing: 1px;
                        }
                        .arm-rec-dot {
                            width: 6px; height: 6px; background: #ef4444;
                            border-radius: 50%; animation: armPulse 1s infinite;
                        }
                        @keyframes armPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
                        .arm-waveform { display: flex; align-items: center; gap: 2px; height: 60px; padding: 0 20px; }
                        .arm-wave-bar {
                            width: 4px; border-radius: 2px; min-height: 4px; flex-shrink: 0;
                            background: ${darkMode ? '#06b6d4' : '#38bdf8'};
                        }
                        .arm-wave-bar.arm-wave-active { background: linear-gradient(to top, #06b6d4, #2563eb); }
                        .arm-timer {
                            font-family: 'JetBrains Mono', 'SF Mono', monospace;
                            font-size: 22px; font-weight: 800;
                            color: ${darkMode ? '#e5e7eb' : '#1f2937'}; margin-top: 8px;
                        }
                        .arm-name-field { margin-top: 16px; }
                        .arm-label {
                            display: block; font-size: 10px; font-weight: 700;
                            text-transform: uppercase; color: #9ca3af; margin-bottom: 6px; letter-spacing: 0.5px;
                        }
                        .arm-input {
                            width: 100%; padding: 10px 14px; border-radius: 10px;
                            font-size: 13px; font-weight: 600; outline: none;
                            border: 1px solid ${darkMode ? 'rgba(148,163,184,0.14)' : 'rgba(148,163,184,0.16)'};
                            background: ${darkMode ? 'rgba(15,23,42,0.72)' : '#f8fafc'};
                            color: ${darkMode ? '#fff' : '#111827'};
                            transition: border-color 0.15s; box-sizing: border-box;
                        }
                        .arm-input:focus { border-color: #06b6d4; box-shadow: 0 0 0 3px rgba(6,182,212,0.12); }
                        .arm-footer {
                            padding: 16px 24px;
                            border-top: 1px solid ${darkMode ? 'rgba(148,163,184,0.12)' : 'rgba(148,163,184,0.12)'};
                        }
                        .arm-btn-group { display: flex; gap: 8px; }
                        .arm-btn-primary {
                            flex: 1; padding: 12px;
                            display: flex; align-items: center; justify-content: center; gap: 8px;
                            border: none; border-radius: 12px; cursor: pointer;
                            font-size: 13px; font-weight: 700;
                            background: linear-gradient(135deg, #06b6d4, #2563eb); color: white;
                            box-shadow: 0 10px 24px rgba(37,99,235,0.24); transition: all 0.2s;
                        }
                        .arm-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 14px 28px rgba(37,99,235,0.28); }
                        .arm-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
                        .arm-btn-secondary {
                            flex: 1; padding: 12px;
                            display: flex; align-items: center; justify-content: center; gap: 8px;
                            border: 1px solid ${darkMode ? 'rgba(148,163,184,0.14)' : 'rgba(148,163,184,0.16)'};
                            border-radius: 12px; cursor: pointer; font-size: 13px; font-weight: 700;
                            background: ${darkMode ? 'rgba(15,23,42,0.72)' : '#fff'};
                            color: ${darkMode ? '#d1d5db' : '#374151'}; transition: all 0.15s;
                        }
                        .arm-btn-secondary:hover { background: ${darkMode ? 'rgba(255,255,255,0.1)' : '#f9fafb'}; }
                        .arm-btn-stop {
                            flex: 1; padding: 12px;
                            display: flex; align-items: center; justify-content: center; gap: 8px;
                            border: none; border-radius: 12px; cursor: pointer;
                            font-size: 13px; font-weight: 700;
                            background: #ef4444; color: white;
                            box-shadow: 0 4px 12px rgba(239,68,68,0.3); transition: all 0.2s;
                        }
                        .arm-btn-stop:hover { background: #dc2626; }
                        .arm-btn-danger {
                            flex: 1; padding: 12px;
                            display: flex; align-items: center; justify-content: center; gap: 8px;
                            border: 1px solid rgba(239,68,68,0.2); border-radius: 12px; cursor: pointer;
                            font-size: 13px; font-weight: 700;
                            background: rgba(239,68,68,0.08); color: #ef4444; transition: all 0.15s;
                        }
                        .arm-btn-danger:hover { background: rgba(239,68,68,0.15); }

                        .arm-done-details { margin-top: 4px; }
                        .arm-duration-badge {
                            display: inline-flex; align-items: center; gap: 6px;
                            padding: 6px 12px; border-radius: 8px;
                            background: ${darkMode ? 'rgba(34,211,238,0.10)' : 'rgba(14,165,233,0.08)'};
                            color: ${darkMode ? '#67e8f9' : '#0284c7'};
                            font-size: 12px; font-weight: 700; margin-bottom: 12px;
                            border: 1px solid ${darkMode ? 'rgba(34,211,238,0.16)' : 'rgba(14,165,233,0.16)'};
                        }
                    `}</style>
                </div>
            </div>
        </>
    );
};

export default AudioRecorderModal;
