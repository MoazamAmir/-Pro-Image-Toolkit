import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Play, Pause, MoreHorizontal, Copy, Clipboard, Trash,
    Volume2, VolumeX, Scissors, Music, GripVertical,
    SkipBack, SkipForward, Repeat, ChevronDown, X,
    Wind, Wand2, Music2
} from 'lucide-react';

/**
 * AudioTimeline Component
 * Shows audio tracks below the image in the editor.
 * Supports play/pause, trim, drag-and-drop reorder, volume, and context menu.
 */
const AudioTimeline = ({ audioTracks = [], onUpdateTracks, darkMode, activeTrackId, onSelectTrack }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [contextMenu, setContextMenu] = useState(null); // { trackId, x, y }
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [trimming, setTrimming] = useState(null); // { trackId, handle: 'start' | 'end' }
    const [volumePopup, setVolumePopup] = useState(null); // trackId
    const [isLooping, setIsLooping] = useState(false);

    const audioRef = useRef(new Audio());
    const timelineRef = useRef(null);
    const animFrameRef = useRef(null);
    const dragItemRef = useRef(null);

    // Total timeline duration (max end time of all tracks)
    const totalDuration = Math.min(Math.max(audioTracks.reduce((max, t) => {
        const end = (t.startTime || 0) + (t.trimEnd || t.duration || 10);
        return isFinite(end) ? Math.max(max, end) : max;
    }, 0), 30), 3600); // Caps at 1 hour for safety, defaults to 30s

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            audioRef.current.pause();
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, []);

    // Play active track
    const playTrack = useCallback((track) => {
        const audio = audioRef.current;
        audio.pause();
        audio.src = track.url;
        audio.volume = (track.volume ?? 100) / 100;
        audio.currentTime = track.trimStart || 0;
        audio.play().catch(e => console.warn('Play failed:', e));
        setIsPlaying(true);
        onSelectTrack(track.id);

        const updateTime = () => {
            setCurrentTime(audio.currentTime);
            setDuration(audio.duration || 0);
            if (track.trimEnd && audio.currentTime >= track.trimEnd) {
                if (isLooping) {
                    audio.currentTime = track.trimStart || 0;
                } else {
                    audio.pause();
                    setIsPlaying(false);
                    return;
                }
            }
            if (!audio.paused) {
                animFrameRef.current = requestAnimationFrame(updateTime);
            }
        };
        updateTime();

        audio.onended = () => {
            setIsPlaying(false);
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [isLooping]);

    const togglePlay = () => {
        if (!activeTrackId && audioTracks.length > 0) {
            playTrack(audioTracks[0]);
            return;
        }
        const audio = audioRef.current;
        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        } else {
            const track = audioTracks.find(t => t.id === activeTrackId);
            if (track) playTrack(track);
        }
    };

    const stopAll = () => {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
        setCurrentTime(0);
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };

    // Context menu actions
    const handleContextAction = (action, trackId) => {
        const track = audioTracks.find(t => t.id === trackId);
        if (!track) return;

        switch (action) {
            case 'delete':
                onUpdateTracks(audioTracks.filter(t => t.id !== trackId));
                if (activeTrackId === trackId) stopAll();
                break;
            case 'duplicate': {
                const newTrack = {
                    ...track,
                    id: `audio_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                    name: `${track.name} (copy)`,
                    startTime: (track.startTime || 0) + 2
                };
                onUpdateTracks([...audioTracks, newTrack]);
                break;
            }
            case 'copy':
                localStorage.setItem('_audio_clipboard', JSON.stringify(track));
                break;
            case 'paste': {
                const clip = localStorage.getItem('_audio_clipboard');
                if (clip) {
                    const parsed = JSON.parse(clip);
                    const pasted = {
                        ...parsed,
                        id: `audio_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                        name: `${parsed.name} (pasted)`,
                        startTime: (track.startTime || 0) + 2
                    };
                    onUpdateTracks([...audioTracks, pasted]);
                }
                break;
            }
            case 'mute':
                onUpdateTracks(audioTracks.map(t => t.id === trackId ? { ...t, muted: !t.muted } : t));
                break;
            default:
                break;
        }
        setContextMenu(null);
    };

    // Volume change
    const handleVolumeChange = (trackId, vol) => {
        onUpdateTracks(audioTracks.map(t => t.id === trackId ? { ...t, volume: vol } : t));
        if (activeTrackId === trackId) {
            audioRef.current.volume = vol / 100;
        }
    };

    // Trim handlers
    const handleTrimMouseDown = (e, trackId, handle) => {
        e.preventDefault();
        e.stopPropagation();
        setTrimming({ trackId, handle });

        const onMouseMove = (moveE) => {
            if (!timelineRef.current) return;
            const rect = timelineRef.current.getBoundingClientRect();
            const width = rect.width || 1;
            const x = Math.max(0, Math.min(moveE.clientX - rect.left, width));
            const timePos = (x / width) * totalDuration;

            onUpdateTracks(audioTracks.map(t => {
                if (t.id !== trackId) return t;
                const dur = t.duration || 10;
                if (handle === 'start') {
                    return { ...t, trimStart: Math.max(0, Math.min(timePos, (t.trimEnd || dur) - 0.5)) };
                } else {
                    return { ...t, trimEnd: Math.max((t.trimStart || 0) + 0.5, Math.min(timePos, dur)) };
                }
            }));
        };

        const onMouseUp = () => {
            setTrimming(null);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };

    // Drag track position on timeline
    const handleTrackDragOnTimeline = (e, trackId) => {
        e.preventDefault();
        e.stopPropagation();

        const onMouseMove = (moveE) => {
            if (!timelineRef.current) return;
            const rect = timelineRef.current.getBoundingClientRect();
            const width = rect.width || 1;
            const x = Math.max(0, moveE.clientX - rect.left);
            const timePos = (x / width) * totalDuration;
            onUpdateTracks(audioTracks.map(t =>
                t.id === trackId ? { ...t, startTime: Math.max(0, timePos) } : t
            ));
        };

        const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };

    // Drag-and-drop reorder
    const handleDragStart = (e, index) => {
        dragItemRef.current = index;
        setIsDragging(true);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleDrop = (e, index) => {
        e.preventDefault();
        const fromIndex = dragItemRef.current;
        if (fromIndex === null || fromIndex === index) return;

        const updated = [...audioTracks];
        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(index, 0, moved);
        onUpdateTracks(updated);
        dragItemRef.current = null;
        setIsDragging(false);
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        setDragOverIndex(null);
        dragItemRef.current = null;
    };

    // Format time mm:ss
    const fmt = (s) => {
        if (!s || isNaN(s)) return '0:00';
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    // Time markers
    const markers = [];
    const safeDuration = isFinite(totalDuration) ? totalDuration : 30;
    const step = safeDuration <= 15 ? 1 : safeDuration <= 60 ? 5 : 10;
    for (let i = 0; i <= safeDuration; i += step) {
        markers.push(i);
        if (markers.length > 500) break; // Final safety break
    }

    if (audioTracks.length === 0) return null;

    return (
        <div
            className={`audio-timeline-container ${darkMode ? 'at-dark' : 'at-light'}`}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Transport Controls */}
            <div className="at-transport">
                <div className="at-transport-left">
                    <button onClick={stopAll} className="at-ctrl-btn" title="Stop">
                        <SkipBack className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={togglePlay} className="at-play-btn" title={isPlaying ? 'Pause' : 'Play'}>
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button onClick={() => setIsLooping(!isLooping)} className={`at-ctrl-btn ${isLooping ? 'at-active' : ''}`} title="Loop">
                        <Repeat className="w-3.5 h-3.5" />
                    </button>
                </div>
                <div className="at-transport-center">
                    <span className="at-time-display">{fmt(currentTime)}</span>
                    <span className="at-time-sep">/</span>
                    <span className="at-time-total">{fmt(totalDuration)}</span>
                </div>
                <div className="at-transport-right">
                    <Music className="w-3.5 h-3.5 opacity-40" />
                    <span className="at-track-count">{audioTracks.length} track{audioTracks.length !== 1 ? 's' : ''}</span>
                </div>
            </div>

            {/* Timeline Ruler */}
            <div className="at-ruler">
                {markers.map(m => (
                    <div key={m} className="at-ruler-mark" style={{ left: `${(m / totalDuration) * 100}%` }}>
                        <div className="at-ruler-line" />
                        <span className="at-ruler-label">{fmt(m)}</span>
                    </div>
                ))}
                {/* Playhead */}
                {isPlaying && (
                    <div
                        className="at-playhead"
                        style={{ left: `${(currentTime / totalDuration) * 100}%` }}
                    >
                        <div className="at-playhead-head" />
                        <div className="at-playhead-line" />
                    </div>
                )}
            </div>

            {/* Track Lanes */}
            <div className="at-tracks" ref={timelineRef}>
                {audioTracks.map((track, index) => {
                    const trackStart = ((track.startTime || 0) / totalDuration) * 100;
                    const trackDur = ((track.trimEnd || track.duration || 10) - (track.trimStart || 0));
                    const trackWidth = (trackDur / totalDuration) * 100;
                    const isActive = activeTrackId === track.id;
                    const isMuted = track.muted;

                    return (
                        <div
                            key={track.id}
                            className={`at-track-lane ${dragOverIndex === index ? 'at-drag-over' : ''}`}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDrop={(e) => handleDrop(e, index)}
                        >
                            {/* Track Label */}
                            <div className="at-track-label">
                                <div
                                    className="at-drag-handle"
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragEnd={handleDragEnd}
                                >
                                    <GripVertical className="w-3 h-3" />
                                </div>
                                <div className="at-track-info" onClick={() => { onSelectTrack(track.id); playTrack(track); }}>
                                    <div className={`at-track-icon ${isActive ? 'at-glow' : ''}`}>
                                        <Music className="w-3 h-3" />
                                    </div>
                                    <span className="at-track-name">{track.name || 'Audio'}</span>
                                </div>
                                <button
                                    onClick={() => handleVolumeChange(track.id, isMuted ? 100 : 0)}
                                    className={`at-mute-btn ${isMuted ? 'at-muted' : ''}`}
                                    title={isMuted ? 'Unmute' : 'Mute'}
                                >
                                    {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                                </button>
                            </div>

                            {/* Track Block on Timeline */}
                            <div className="at-track-timeline">
                                <div
                                    className={`at-track-block ${isActive ? 'at-block-active' : ''} ${isMuted ? 'at-block-muted' : ''}`}
                                    style={{ left: `${trackStart}%`, width: `${Math.max(trackWidth, 2)}%` }}
                                    onMouseDown={(e) => handleTrackDragOnTimeline(e, track.id)}
                                    onClick={(e) => { e.stopPropagation(); onSelectTrack(track.id); }}
                                >
                                    {/* Waveform Visual */}
                                    <div className="at-waveform">
                                        {Array.from({ length: 40 }).map((_, i) => (
                                            <div
                                                key={i}
                                                className="at-wave-bar"
                                                style={{
                                                    height: `${20 + Math.sin(i * 0.8) * 30 + Math.random() * 30}%`,
                                                    animationDelay: `${i * 30}ms`
                                                }}
                                            />
                                        ))}
                                    </div>

                                    {/* Trim Handles */}
                                    <div
                                        className="at-trim-handle at-trim-start"
                                        onMouseDown={(e) => handleTrimMouseDown(e, track.id, 'start')}
                                    >
                                        <div className="at-trim-grip" />
                                    </div>
                                    <div
                                        className="at-trim-handle at-trim-end"
                                        onMouseDown={(e) => handleTrimMouseDown(e, track.id, 'end')}
                                    >
                                        <div className="at-trim-grip" />
                                    </div>

                                    {/* Track Name Overlay */}
                                    <div className="at-block-label">
                                        <Music className="w-2.5 h-2.5" />
                                        <span>{track.name || 'Audio'}</span>
                                    </div>

                                    {/* 3-Dot Menu */}
                                    <button
                                        className="at-block-menu"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setContextMenu(contextMenu?.trackId === track.id ? null : { trackId: track.id, x: e.clientX, y: e.clientY });
                                        }}
                                    >
                                        <MoreHorizontal className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <>
                    <div className="at-ctx-backdrop" onClick={() => setContextMenu(null)} />
                    <div
                        className="at-ctx-menu"
                        style={{ top: contextMenu.y - 280, left: Math.min(contextMenu.x, window.innerWidth - 220) }}
                    >
                        <button onClick={() => handleContextAction('copy', contextMenu.trackId)}>
                            <Copy className="w-3.5 h-3.5" /> Copy <span className="at-shortcut">Ctrl+C</span>
                        </button>
                        <button onClick={() => handleContextAction('paste', contextMenu.trackId)}>
                            <Clipboard className="w-3.5 h-3.5" /> Paste <span className="at-shortcut">Ctrl+V</span>
                        </button>
                        <button onClick={() => handleContextAction('duplicate', contextMenu.trackId)}>
                            <Copy className="w-3.5 h-3.5" /> Duplicate track <span className="at-shortcut">Ctrl+D</span>
                        </button>
                        <button className="at-ctx-danger" onClick={() => handleContextAction('delete', contextMenu.trackId)}>
                            <Trash className="w-3.5 h-3.5" /> Delete track <span className="at-shortcut">DELETE</span>
                        </button>
                        
                        <div className="at-ctx-divider" />
                        
                        <button className="text-gray-400 cursor-not-allowed" onClick={() => {}}>
                            <Scissors className="w-3.5 h-3.5" /> Adjust
                        </button>
                        <button className="text-gray-400 cursor-not-allowed" onClick={() => {}}>
                            <Wind className="w-3.5 h-3.5" /> Fade
                        </button>
                        <button className="text-gray-400 cursor-not-allowed" onClick={() => {}}>
                            <Music2 className="w-3.5 h-3.5" /> Beat Sync
                        </button>
                        
                        <div className="at-ctx-divider" />
                        
                        <div className="at-ctx-volume">
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Volume</span>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={audioTracks.find(t => t.id === contextMenu.trackId)?.volume ?? 100}
                                onChange={(e) => handleVolumeChange(contextMenu.trackId, parseInt(e.target.value))}
                                className="at-vol-slider"
                            />
                            <span className="at-vol-val">{audioTracks.find(t => t.id === contextMenu.trackId)?.volume ?? 100}%</span>
                        </div>
                    </div>
                </>
            )}

            <style>{`
                .audio-timeline-container {
                    width: 100%;
                    border-top: 1px solid rgba(0,0,0,0.08);
                    font-family: 'Inter', 'Outfit', sans-serif;
                    user-select: none;
                    background: #fafbfc;
                    animation: atSlideUp 0.3s ease;
                }
                .at-dark {
                    background: #14161f;
                    border-top-color: rgba(255,255,255,0.06);
                }
                @keyframes atSlideUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Transport */
                .at-transport {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 6px 16px;
                    border-bottom: 1px solid rgba(0,0,0,0.05);
                }
                .at-dark .at-transport { border-bottom-color: rgba(255,255,255,0.05); }
                .at-transport-left, .at-transport-right { display: flex; align-items: center; gap: 6px; }
                .at-transport-center { display: flex; align-items: center; gap: 4px; font-family: 'JetBrains Mono', 'SF Mono', monospace; }
                .at-ctrl-btn {
                    width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
                    border: none; border-radius: 8px; cursor: pointer; transition: all 0.15s;
                    background: transparent; color: #6b7280;
                }
                .at-dark .at-ctrl-btn { color: #9ca3af; }
                .at-ctrl-btn:hover { background: rgba(124,58,237,0.08); color: #7c3aed; }
                .at-ctrl-btn.at-active { background: rgba(124,58,237,0.15); color: #7c3aed; }
                .at-play-btn {
                    width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
                    border: none; border-radius: 50%; cursor: pointer; transition: all 0.2s;
                    background: linear-gradient(135deg, #7c3aed, #6d28d9); color: white;
                    box-shadow: 0 2px 8px rgba(124,58,237,0.3);
                }
                .at-play-btn:hover { transform: scale(1.1); box-shadow: 0 4px 16px rgba(124,58,237,0.4); }
                .at-time-display { font-size: 12px; font-weight: 700; color: #1f2937; }
                .at-dark .at-time-display { color: #e5e7eb; }
                .at-time-sep { font-size: 10px; color: #9ca3af; margin: 0 2px; }
                .at-time-total { font-size: 11px; color: #9ca3af; }
                .at-track-count { font-size: 10px; font-weight: 700; color: #9ca3af; }

                /* Ruler */
                .at-ruler {
                    position: relative; height: 20px; margin: 0 16px;
                    border-bottom: 1px solid rgba(0,0,0,0.05);
                }
                .at-dark .at-ruler { border-bottom-color: rgba(255,255,255,0.05); }
                .at-ruler-mark { position: absolute; top: 0; height: 100%; }
                .at-ruler-line { width: 1px; height: 8px; background: rgba(0,0,0,0.1); }
                .at-dark .at-ruler-line { background: rgba(255,255,255,0.1); }
                .at-ruler-label { font-size: 8px; font-weight: 600; color: #9ca3af; position: absolute; top: 8px; left: 2px; white-space: nowrap; }
                .at-playhead { position: absolute; top: 0; bottom: -200px; z-index: 20; pointer-events: none; }
                .at-playhead-head { width: 10px; height: 10px; background: #ef4444; border-radius: 50%; transform: translateX(-5px); box-shadow: 0 1px 4px rgba(239,68,68,0.4); }
                .at-playhead-line { width: 2px; height: 200px; background: #ef4444; opacity: 0.6; margin-left: -1px; }

                /* Tracks */
                .at-tracks { padding: 4px 0; max-height: 200px; overflow-y: auto; }
                .at-track-lane {
                    display: flex; align-items: center; height: 44px;
                    border-bottom: 1px solid rgba(0,0,0,0.03); transition: background 0.15s;
                }
                .at-dark .at-track-lane { border-bottom-color: rgba(255,255,255,0.03); }
                .at-track-lane.at-drag-over { background: rgba(124,58,237,0.05); }
                .at-track-label {
                    width: 160px; min-width: 160px; display: flex; align-items: center; gap: 6px;
                    padding: 0 8px 0 12px; font-size: 11px; flex-shrink: 0;
                }
                .at-drag-handle { cursor: grab; color: #d1d5db; display: flex; align-items: center; opacity: 0; transition: opacity 0.15s; }
                .at-track-lane:hover .at-drag-handle { opacity: 1; }
                .at-dark .at-drag-handle { color: #4b5563; }
                .at-track-info { display: flex; align-items: center; gap: 6px; flex: 1; cursor: pointer; overflow: hidden; }
                .at-track-icon {
                    width: 22px; height: 22px; border-radius: 6px; display: flex; align-items: center; justify-content: center;
                    background: linear-gradient(135deg, #ede9fe, #ddd6fe); color: #7c3aed; flex-shrink: 0;
                }
                .at-dark .at-track-icon { background: linear-gradient(135deg, #312e81, #3b0764); color: #a78bfa; }
                .at-track-icon.at-glow { box-shadow: 0 0 8px rgba(124,58,237,0.4); }
                .at-track-name { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #374151; }
                .at-dark .at-track-name { color: #d1d5db; }
                .at-mute-btn {
                    width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;
                    border: none; border-radius: 6px; cursor: pointer; background: transparent; color: #9ca3af; transition: all 0.15s;
                }
                .at-mute-btn:hover { background: rgba(0,0,0,0.05); color: #6b7280; }
                .at-dark .at-mute-btn:hover { background: rgba(255,255,255,0.05); color: #d1d5db; }
                .at-mute-btn.at-muted { color: #ef4444; }

                /* Track Block */
                .at-track-timeline { flex: 1; position: relative; height: 32px; margin-right: 12px; }
                .at-track-block {
                    position: absolute; top: 1px; bottom: 1px;
                    background: linear-gradient(90deg, #814bf6 0%, #6e3ad9 100%);
                    border-radius: 8px; cursor: move; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex; align-items: center; overflow: hidden;
                    border: 1px solid rgba(255,255,255,0.1);
                }
                .at-track-block:hover { 
                    transform: translateY(-1px);
                    box-shadow: 0 4px 20px rgba(129,75,246,0.3);
                    border-color: rgba(255,255,255,0.2);
                }
                .at-block-active { 
                    box-shadow: 0 0 0 2px #814bf6, 0 6px 24px rgba(129,75,246,0.4); 
                    border-color: rgba(255,255,255,0.3);
                }
                .at-block-muted { opacity: 0.4; filter: grayscale(1); }

                /* Waveform */
                .at-waveform { display: flex; align-items: center; gap: 1.5px; height: 80%; padding: 0 24px; flex: 1; overflow: hidden; opacity: 0.6; }
                .at-wave-bar { width: 1.5px; border-radius: 1px; background: white; flex-shrink: 0; min-height: 2px; }

                /* Trim Handles */
                .at-trim-handle {
                    position: absolute; top: 0; bottom: 0; width: 10px; cursor: col-resize; z-index: 5;
                    display: flex; align-items: center; justify-content: center;
                    background: rgba(255,255,255,0.1);
                    transition: all 0.2s;
                }
                .at-trim-start { left: 0; border-radius: 8px 0 0 8px; border-right: 1.5px solid rgba(255,255,255,0.3); }
                .at-trim-end { right: 0; border-radius: 0 8px 8px 0; border-left: 1.5px solid rgba(255,255,255,0.3); }
                .at-trim-grip { width: 1px; height: 12px; background: rgba(255,255,255,0.5); }
                .at-trim-handle:hover { background: rgba(255,255,255,0.2); }

                /* Block Label */
                .at-block-label {
                    position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
                    display: flex; align-items: center; gap: 4px; color: rgba(255,255,255,0.7);
                    font-size: 9px; font-weight: 700; pointer-events: none; white-space: nowrap;
                }

                /* Block Menu */
                .at-block-menu {
                    position: absolute; right: 4px; top: 50%; transform: translateY(-50%);
                    width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;
                    border: none; border-radius: 4px; cursor: pointer; background: rgba(0,0,0,0.2); color: white;
                    opacity: 0; transition: opacity 0.15s;
                }
                .at-track-block:hover .at-block-menu { opacity: 1; }
                .at-block-menu:hover { background: rgba(0,0,0,0.4); }

                /* Context Menu */
                .at-ctx-backdrop { position: fixed; inset: 0; z-index: 998; }
                .at-ctx-menu {
                    position: fixed; z-index: 999; min-width: 190px; padding: 6px;
                    background: white; border: 1px solid #e5e7eb; border-radius: 12px;
                    box-shadow: 0 8px 30px rgba(0,0,0,0.12); animation: atFadeIn 0.12s ease;
                }
                .at-dark .at-ctx-menu { background: #1e1e2e; border-color: rgba(255,255,255,0.08); box-shadow: 0 8px 30px rgba(0,0,0,0.4); }
                @keyframes atFadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
                .at-ctx-menu button {
                    width: 100%; padding: 7px 10px; display: flex; align-items: center; gap: 8px;
                    border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500;
                    background: transparent; color: #374151; transition: all 0.1s;
                }
                .at-dark .at-ctx-menu button { color: #d1d5db; }
                .at-ctx-menu button:hover { background: #f3f4f6; }
                .at-dark .at-ctx-menu button:hover { background: rgba(255,255,255,0.05); }
                .at-ctx-danger { color: #ef4444 !important; }
                .at-ctx-danger:hover { background: #fef2f2 !important; }
                .at-dark .at-ctx-danger:hover { background: rgba(239,68,68,0.1) !important; }
                .at-shortcut { margin-left: auto; font-size: 10px; color: #9ca3af; font-weight: 600; }
                .at-ctx-divider { height: 1px; background: #f3f4f6; margin: 4px 0; }
                .at-dark .at-ctx-divider { background: rgba(255,255,255,0.05); }
                .at-ctx-volume { display: flex; align-items: center; gap: 6px; padding: 7px 10px; font-size: 12px; font-weight: 500; color: #374151; }
                .at-dark .at-ctx-volume { color: #d1d5db; }
                .at-vol-slider { flex: 1; accent-color: #7c3aed; height: 3px; cursor: pointer; }
                .at-vol-val { font-size: 10px; font-weight: 700; color: #7c3aed; min-width: 32px; text-align: right; }

                /* Light theme track colors */
                .at-light .at-track-lane:nth-child(even) { background: rgba(0,0,0,0.01); }
            `}</style>
        </div>
    );
};

export default AudioTimeline;
