import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Radio, Mic } from 'lucide-react';
import FirebaseSyncService from '../services/FirebaseSyncService';
import LiveSessionService from '../services/LiveSessionService';
import SlideRenderer from './SlideRenderer';
import { onAuthChange } from '../services/firebase';
import agoraVoiceService from '../services/AgoraVoiceService';

const AudienceViewer = ({ sessionCode }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [pages, setPages] = useState([]);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [previewImages, setPreviewImages] = useState({});
    const [audioLevel, setAudioLevel] = useState(0);
    const [comments, setComments] = useState([]);
    const [canvasSize, setCanvasSize] = useState({ width: 1920, height: 1080 });
    const [adjustments, setAdjustments] = useState({});
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [guestName, setGuestName] = useState('');
    const [isJoined, setIsJoined] = useState(false);

    const commentsEndRef = useRef(null);
    const sessionUnsubRef = useRef(null);
    const commentsUnsubRef = useRef(null);
    const designUnsubRef = useRef(null);

    // Monitor audio levels for visual feedback (Agora)
    useEffect(() => {
        agoraVoiceService.onLevelChange((levels) => {
            setAudioLevel(levels.remote);
        });
    }, []);

    // Auth listener
    useEffect(() => {
        const unsub = onAuthChange((u) => setUser(u));
        return () => unsub();
    }, []);

    const renderPreviews = useCallback((pp) => {
        pp.forEach(page => {
            const layers = page.layers || [];
            const bgLayer = layers.find(l => l.id === 'background-layer' || l.isBackground);
            const imgLayer = layers.find(l => l.shapeType === 'image' && l.content);
            const src = bgLayer?.content || imgLayer?.content || null;
            if (src) setPreviewImages(prev => ({ ...prev, [page.id]: src }));
        });
    }, []);

    // Find session by code
    useEffect(() => {
        if (!sessionCode) return;
        const findSession = async () => {
            setIsLoading(true);
            try {
                const normalizedCode = sessionCode.toUpperCase().replace(/\s/g, '');
                const codeWithSpaces = normalizedCode.length === 8
                    ? `${normalizedCode.slice(0, 4)} ${normalizedCode.slice(4)}`
                    : normalizedCode;

                let found = await LiveSessionService.getSessionByCode(codeWithSpaces);
                if (!found) found = await LiveSessionService.getSessionByCode(normalizedCode);

                if (!found) {
                    setError('Session not found or has ended.');
                    setIsLoading(false);
                    return;
                }

                setSession(found);

                sessionUnsubRef.current = LiveSessionService.listenToSession(found.id, (data) => {
                    setSession(prev => ({ ...prev, ...data }));
                    if (data.activePageIndex !== undefined) setCurrentPageIndex(data.activePageIndex);
                    if (!data.isActive) {
                        setError('This session has ended.');
                        agoraVoiceService.stop();
                    }
                });

                commentsUnsubRef.current = LiveSessionService.listenToComments(found.id, (c) => {
                    setComments(c);
                });

                const designData = await FirebaseSyncService.getDesign(found.designId);
                if (designData?.pages) {
                    setPages(designData.pages);
                    renderPreviews(designData.pages);
                }

                designUnsubRef.current = FirebaseSyncService.initSync(found.designId, (data) => {
                    if (data?.pages) {
                        setPages(data.pages);
                        renderPreviews(data.pages);
                    }
                    if (data?.canvasSize) setCanvasSize(data.canvasSize);
                    if (data?.adjustments) setAdjustments(data.adjustments);
                });
            } catch (err) {
                console.error('Error joining session:', err);
                setError('Failed to join session.');
            } finally {
                setIsLoading(false);
            }
        };
        findSession();

        return () => {
            if (sessionUnsubRef.current) sessionUnsubRef.current();
            if (commentsUnsubRef.current) commentsUnsubRef.current();
            if (designUnsubRef.current) designUnsubRef.current();
        };
    }, [sessionCode, renderPreviews]);

    // Join voice and notify presence ONLY after explicit user interaction
    useEffect(() => {
        if (isJoined && session?.id && !error) {
            const sessionId = session.id;
            const joinVoiceAndSession = async () => {
                try {
                    await agoraVoiceService.startViewer(sessionId);
                    LiveSessionService.joinSession(sessionId);
                } catch (err) {
                    console.error('Error joining voice session:', err);
                }
            };
            joinVoiceAndSession();
            return () => {
                agoraVoiceService.stop();
                LiveSessionService.leaveSession(sessionId);
            };
        }
    }, [isJoined, session?.id, error]);

    // Scroll comments to bottom
    useEffect(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [comments]);

    const handleSendComment = async () => {
        if (!newComment.trim() || !session) return;
        const displayName = user?.displayName || guestName || 'Anonymous';
        await LiveSessionService.addComment(session.id, {
            userId: user?.uid || `guest_${Date.now()}`,
            userName: displayName,
            userPhoto: user?.photoURL || null,
            text: newComment
        });
        setNewComment('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendComment();
        }
    };

    const handleJoinClick = useCallback(() => {
        setIsJoined(true);
    }, []);

    const handleSendReaction = async (type) => {
        if (!session) return;
        await LiveSessionService.sendReaction(session.id, type);
    };

    const totalPages = pages.length;
    const currentPage = pages[currentPageIndex];

    // ─── Loading ───────────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="av-root">
                <div className="av-center-screen">
                    <div className="av-spinner" />
                    <p className="av-muted-text">Joining session...</p>
                </div>
                <style>{audienceStyles}</style>
            </div>
        );
    }

    // ─── Error ─────────────────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="av-root">
                <div className="av-center-screen">
                    <div className="av-icon-circle av-icon-circle--error">
                        <Radio size={22} />
                    </div>
                    <h2 className="av-heading">{error}</h2>
                    <p className="av-muted-text">The live session may have ended or the code is invalid.</p>
                </div>
                <style>{audienceStyles}</style>
            </div>
        );
    }

    // ─── Join screen ───────────────────────────────────────────────────────────
    if (!isJoined) {
        return (
            <div className="av-root av-root--scrollable">
                <div className="av-center-screen av-join-screen">
                    <div className="av-icon-circle av-icon-circle--live">
                        <Radio size={22} />
                    </div>
                    <h2 className="av-heading">Join Live Session</h2>

                    {user ? (
                        <>
                            <p className="av-muted-text">
                                Joining as <strong className="av-highlight">{user.displayName || user.email || 'User'}</strong>
                            </p>
                            <button className="av-join-btn" onClick={handleJoinClick}>
                                Join Session
                            </button>
                        </>
                    ) : (
                        <>
                            <p className="av-muted-text">Enter your name to participate</p>
                            <input
                                className="av-text-input"
                                placeholder="Your name..."
                                value={guestName}
                                onChange={e => setGuestName(e.target.value)}
                                onKeyPress={e => { if (e.key === 'Enter' && guestName.trim()) handleJoinClick(); }}
                                autoFocus
                            />
                            <button
                                className="av-join-btn"
                                onClick={() => { if (guestName.trim()) handleJoinClick(); }}
                                disabled={!guestName.trim()}
                            >
                                Join Session
                            </button>
                        </>
                    )}
                </div>
                <style>{audienceStyles}</style>
            </div>
        );
    }

    // ─── Main viewer ──────────────────────────────────────────────────────────
    return (
        <div className="av-root">
            {/* Header */}
            <header className="av-header">
                <div className="av-badge av-badge--live">
                    <Radio size={10} />
                    <span>LIVE</span>
                </div>

                {session?.isMicOn && (
                    <div className="av-badge av-badge--voice">
                        <Mic size={10} />
                        <span>HOST SPEAKING</span>
                        <div className="av-wave">
                            {[0.4, 0.8, 0.5, 0.3].map((mult, i) => (
                                <div
                                    key={i}
                                    className="av-wave-bar"
                                    style={{ height: `${Math.max(3, audioLevel * mult)}px` }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <span className="av-host-label">
                    Hosted by {session?.hostName || 'Unknown'}
                </span>
            </header>

            {/* Body */}
            <div className="av-body">

                {/* ── LEFT: Slide viewer ── */}
                <div className="av-viewer">

                    {/* Slide canvas */}
                    <div className="av-slide-area">
                        <div className="av-slide-frame">
                            <SlideRenderer
                                page={pages[currentPageIndex]}
                                canvasSize={canvasSize}
                                adjustments={adjustments}
                                style={{ boxShadow: '0 20px 80px rgba(0,0,0,0.5)' }}
                                overlays={
                                    <>
                                        {/* Drawing paths */}
                                        <svg
                                            className="av-drawings-layer"
                                            viewBox="0 0 100 100"
                                            preserveAspectRatio="none"
                                            style={{
                                                position: 'absolute', inset: 0,
                                                zIndex: 50, pointerEvents: 'none',
                                                width: '100%', height: '100%'
                                            }}
                                        >
                                            {pages[currentPageIndex] &&
                                                (session?.drawings?.[pages[currentPageIndex].id] || []).map((path, idx) => (
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
                                                ))
                                            }
                                            {session?.currentPath && (
                                                <polyline
                                                    points={session.currentPath.points.map(p => `${p.x} ${p.y}`).join(',')}
                                                    stroke={session.currentPath.color}
                                                    strokeWidth={session.currentPath.width}
                                                    strokeOpacity={session.currentPath.opacity}
                                                    fill="none"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    style={session.currentPath.tool === 'eraser' ? { mixBlendMode: 'destination-out' } : {}}
                                                />
                                            )}
                                        </svg>

                                        {/* Laser pointer */}
                                        {session?.laserPos && (
                                            <div
                                                className="av-laser-dot"
                                                style={{
                                                    left: `${session.laserPos.x}%`,
                                                    top: `${session.laserPos.y}%`
                                                }}
                                            />
                                        )}
                                    </>
                                }
                            />
                        </div>
                    </div>

                    {/* Bottom bar: page info + thumbnails */}
                    <div className="av-viewer-bottom">
                        <span className="av-page-info">{currentPageIndex + 1} / {totalPages}</span>
                        <div className="av-thumbs">
                            {pages.map((page, idx) => (
                                <div
                                    key={page.id}
                                    className={`av-thumb ${idx === currentPageIndex ? 'av-thumb--active' : ''}`}
                                >
                                    {previewImages[page.id]
                                        ? <img src={previewImages[page.id]} alt={`Page ${idx + 1}`} />
                                        : <div className="av-thumb-empty" />
                                    }
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: Comments panel ── */}
                <aside className="av-comments-panel">

                    <div className="av-comments-header">
                        <h3 className="av-comments-title">💬 Comments</h3>
                        <span className="av-count-badge">{comments.length}</span>
                    </div>

                    <div className="av-comments-list">
                        {comments.length === 0 && (
                            <p className="av-empty-msg">No comments yet. Be the first!</p>
                        )}
                        {comments.map(c => (
                            <div key={c.id} className="av-comment">
                                <div className="av-avatar">
                                    {c.userPhoto
                                        ? <img src={c.userPhoto} alt="" />
                                        : <span>{(c.userName || 'A')[0].toUpperCase()}</span>
                                    }
                                </div>
                                <div className="av-comment-body">
                                    <div className="av-comment-meta">
                                        <span className="av-comment-name">{c.userName}</span>
                                        <span className="av-comment-time">
                                            {c.createdAt?.toDate
                                                ? new Date(c.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                : ''}
                                        </span>
                                    </div>
                                    <p className="av-comment-text">{c.text}</p>
                                </div>
                            </div>
                        ))}
                        <div ref={commentsEndRef} />
                    </div>

                    {/* Input */}
                    <div className="av-input-row">
                        <input
                            className="av-comment-input"
                            placeholder="Write a comment..."
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <button
                            className="av-send-btn"
                            onClick={handleSendComment}
                            disabled={!newComment.trim()}
                            aria-label="Send comment"
                        >
                            <Send size={15} />
                        </button>
                    </div>

                    {/* Reactions */}
                    <div className="av-reactions">
                        {[['heart', '❤️'], ['clap', '👏'], ['celebrate', '🎉'], ['like', '👍']].map(([type, emoji]) => (
                            <button
                                key={type}
                                className="av-reaction-btn"
                                onClick={() => handleSendReaction(type)}
                                title={type}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </aside>
            </div>

            <style>{audienceStyles}</style>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════
//  STYLES
// ═══════════════════════════════════════════════════════════════════
const audienceStyles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* ── Reset & root ─────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; }

.av-root {
    position: fixed;
    inset: 0;
    z-index: 999999;
    background:
        radial-gradient(circle at top left,  rgba(6,182,212,0.10)  0%, transparent 28%),
        radial-gradient(circle at top right, rgba(59,130,246,0.12) 0%, transparent 32%),
        linear-gradient(160deg, #020617 0%, #0b1120 52%, #020617 100%);
    font-family: 'Inter', sans-serif;
    color: #e2e8f0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* Scrollable variant for join / error screens on small devices */
.av-root--scrollable {
    overflow-y: auto;
}

/* ── Center screens (loading / error / join) ──────────────────── */
.av-center-screen {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    padding: 32px 20px;
    text-align: center;
    min-height: 100%;
}

.av-heading {
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    color: #f8fafc;
}

.av-muted-text {
    margin: 0;
    font-size: 13px;
    color: rgba(203,213,225,0.60);
}

.av-highlight {
    color: #e2e8f0;
    font-weight: 600;
}

/* Spinner */
.av-spinner {
    width: 42px;
    height: 42px;
    border: 3px solid rgba(255,255,255,0.08);
    border-top-color: #22d3ee;
    border-radius: 50%;
    animation: av-spin 0.8s linear infinite;
}

@keyframes av-spin { to { transform: rotate(360deg); } }

/* Icon circle */
.av-icon-circle {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.av-icon-circle--live {
    background: rgba(34,211,238,0.12);
    border: 1px solid rgba(34,211,238,0.28);
    color: #22d3ee;
}

.av-icon-circle--error {
    background: rgba(239,68,68,0.12);
    border: 1px solid rgba(239,68,68,0.28);
    color: #ef4444;
}

/* Join screen extras */
.av-join-screen { max-width: 380px; width: 100%; margin: auto; }

.av-text-input {
    width: 100%;
    max-width: 300px;
    padding: 12px 16px;
    background: rgba(15,23,42,0.75);
    border: 1.5px solid rgba(148,163,184,0.18);
    border-radius: 10px;
    color: #fff;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.av-text-input:focus {
    border-color: #22d3ee;
    box-shadow: 0 0 0 4px rgba(34,211,238,0.12);
}

.av-text-input::placeholder { color: rgba(203,213,225,0.32); }

.av-join-btn {
    padding: 12px 40px;
    background: linear-gradient(135deg, #06b6d4, #2563eb);
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.18s, filter 0.18s;
}

.av-join-btn:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.08); }
.av-join-btn:active:not(:disabled) { transform: translateY(0); }
.av-join-btn:disabled { opacity: 0.38; cursor: not-allowed; }

/* ── Header bar ───────────────────────────────────────────────── */
.av-header {
    height: 46px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    padding: 0 18px;
    background: rgba(2,6,23,0.86);
    border-bottom: 1px solid rgba(148,163,184,0.11);
    backdrop-filter: blur(24px) saturate(140%);
}

/* Badges */
.av-badge {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.4px;
    white-space: nowrap;
}

.av-badge--live {
    background: rgba(239,68,68,0.14);
    border: 1px solid rgba(239,68,68,0.38);
    color: #ef4444;
}

.av-badge--live svg { animation: av-pulse 2s linear infinite; }

.av-badge--voice {
    background: rgba(34,211,238,0.10);
    border: 1px solid rgba(34,211,238,0.22);
    color: #67e8f9;
    animation: av-pulse 2s infinite;
}

@keyframes av-pulse { 0%,100% { opacity:1; } 50% { opacity:0.35; } }

/* Wave bars */
.av-wave {
    display: flex;
    align-items: flex-end;
    gap: 2px;
    height: 12px;
}

.av-wave-bar {
    width: 2px;
    min-height: 3px;
    background: #a78bfa;
    border-radius: 1px;
    transition: height 0.1s ease;
}

.av-host-label {
    margin-left: auto;
    font-size: 12px;
    color: rgba(148,163,184,0.60);
}

/* ── Body layout ──────────────────────────────────────────────── */
.av-body {
    flex: 1;
    display: flex;
    overflow: hidden;     /* children handle their own scroll */
    min-height: 0;
}

/* ── Left: viewer ─────────────────────────────────────────────── */
.av-viewer {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow: hidden;
}

/* Slide canvas area */
.av-slide-area {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    overflow: hidden;
    background:
        radial-gradient(circle at center, rgba(34,211,238,0.09) 0%, rgba(15,23,42,0.22) 30%, rgba(2,6,23,0.94) 76%),
        linear-gradient(180deg, #08111f 0%, #020617 100%);
}

.av-slide-frame {
    position: relative;
    width: 100%;
    max-width: 960px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    border-radius: 24px;
    background: rgba(15,23,42,0.32);
    border: 1px solid rgba(148,163,184,0.11);
    box-shadow: 0 24px 80px rgba(2,8,23,0.40);
    backdrop-filter: blur(14px);
    overflow: hidden;
}

/* Drawing SVG overlay */
.av-drawings-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 50;
    width: 100%;
    height: 100%;
    overflow: visible;
}

.av-drawings-layer polyline { vector-effect: non-scaling-stroke; }

/* Laser dot */
.av-laser-dot {
    position: absolute;
    width: 10px;
    height: 10px;
    background: #ff3b3b;
    border-radius: 50%;
    box-shadow: 0 0 10px 3px rgba(255,59,59,0.5);
    pointer-events: none;
    transform: translate(-50%, -50%);
    z-index: 100;
    transition: left 0.05s ease-out, top 0.05s ease-out;
}

/* Bottom bar */
.av-viewer-bottom {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 16px;
    background: rgba(2,6,23,0.80);
    border-top: 1px solid rgba(148,163,184,0.10);
    backdrop-filter: blur(20px) saturate(130%);
    overflow: hidden;
}

.av-page-info {
    flex-shrink: 0;
    font-size: 11px;
    font-weight: 600;
    color: rgba(148,163,184,0.60);
    white-space: nowrap;
}

/* Thumbnail strip */
.av-thumbs {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    padding-bottom: 2px;   /* room for scrollbar */
    scroll-behavior: smooth;
}

.av-thumbs::-webkit-scrollbar { height: 3px; }
.av-thumbs::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.10); border-radius: 3px; }

.av-thumb {
    flex-shrink: 0;
    width: 74px;
    height: 50px;
    border-radius: 5px;
    overflow: hidden;
    border: 2px solid transparent;
    background: rgba(15,23,42,0.65);
    transition: border-color 0.15s;
}

.av-thumb--active {
    border-color: #22d3ee;
    box-shadow: 0 0 0 1px rgba(34,211,238,0.32);
}

.av-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.av-thumb-empty { width: 100%; height: 100%; background: rgba(255,255,255,0.04); }

/* ── Right: comments panel ────────────────────────────────────── */
.av-comments-panel {
    width: 310px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: rgba(2,6,23,0.86);
    border-left: 1px solid rgba(148,163,184,0.10);
    backdrop-filter: blur(26px) saturate(140%);
}

.av-comments-header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 13px 15px;
    border-bottom: 1px solid rgba(148,163,184,0.10);
}

.av-comments-title { margin: 0; font-size: 14px; font-weight: 700; color: #f8fafc; }

.av-count-badge {
    font-size: 11px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 10px;
    background: rgba(34,211,238,0.10);
    color: #67e8f9;
}

/* Scrollable comments list */
.av-comments-list {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    scroll-behavior: smooth;
    min-height: 0;
}

.av-comments-list::-webkit-scrollbar { width: 3px; }
.av-comments-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }

.av-empty-msg {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    color: rgba(148,163,184,0.30);
    text-align: center;
    margin: auto;
}

/* Single comment */
.av-comment { display: flex; gap: 8px; }

.av-avatar {
    width: 30px;
    height: 30px;
    flex-shrink: 0;
    border-radius: 50%;
    overflow: hidden;
    background: linear-gradient(135deg, #06b6d4, #2563eb);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    color: #fff;
}

.av-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }

.av-comment-body { flex: 1; min-width: 0; }

.av-comment-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 2px;
}

.av-comment-name { font-size: 12px; font-weight: 700; color: rgba(241,245,249,0.82); }
.av-comment-time { font-size: 10px; color: rgba(148,163,184,0.38); }
.av-comment-text { margin: 0; font-size: 13px; color: rgba(203,213,225,0.70); line-height: 1.5; word-break: break-word; }

/* Comment input row */
.av-input-row {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border-top: 1px solid rgba(148,163,184,0.10);
}

.av-comment-input {
    flex: 1;
    padding: 9px 13px;
    background: rgba(15,23,42,0.75);
    border: 1.5px solid rgba(148,163,184,0.15);
    border-radius: 10px;
    color: #fff;
    font-size: 13px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.av-comment-input:focus {
    border-color: #22d3ee;
    box-shadow: 0 0 0 4px rgba(34,211,238,0.10);
}

.av-comment-input::placeholder { color: rgba(148,163,184,0.30); }

.av-send-btn {
    flex-shrink: 0;
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #06b6d4, #2563eb);
    border: none;
    border-radius: 10px;
    color: #fff;
    cursor: pointer;
    transition: transform 0.15s, filter 0.15s;
}

.av-send-btn:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.06); }
.av-send-btn:disabled { opacity: 0.28; cursor: not-allowed; }

/* Reactions bar */
.av-reactions {
    flex-shrink: 0;
    display: flex;
    gap: 6px;
    justify-content: center;
    padding: 10px 12px;
    background: rgba(15,23,42,0.40);
    border-top: 1px solid rgba(148,163,184,0.08);
}

.av-reaction-btn {
    font-size: 22px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: 8px;
    transition: transform 0.18s, background 0.15s;
    line-height: 1;
}

.av-reaction-btn:hover { transform: scale(1.30); background: rgba(255,255,255,0.06); }
.av-reaction-btn:active { transform: scale(0.88); }

/* ── Responsive ────────────────────────────────────────────────── */

/* Tablet: narrow comments panel */
@media (max-width: 900px) {
    .av-comments-panel { width: 260px; }
}

/* Mobile: stack slide + comments vertically */
@media (max-width: 640px) {

    /* Allow body to scroll vertically on mobile */
    .av-body {
        flex-direction: column;
        overflow-y: auto;
        overflow-x: hidden;
    }

    /* Viewer takes natural height, no overflow clipping */
    .av-viewer {
        flex: none;
        overflow: visible;
    }

    .av-slide-area {
        padding: 12px;
        min-height: 220px;
    }

    .av-slide-frame {
        padding: 8px;
        border-radius: 14px;
    }

    /* Full-width comments panel on mobile */
    .av-comments-panel {
        width: 100%;
        border-left: none;
        border-top: 1px solid rgba(148,163,184,0.10);
        /* Fixed height so it doesn't push content off-screen */
        height: 360px;
        flex-shrink: 0;
    }

    /* Header wraps on very small screens */
    .av-header {
        height: auto;
        min-height: 40px;
        padding: 6px 12px;
        gap: 6px;
    }

    .av-host-label { font-size: 11px; }

    /* Wider thumbs strip on mobile */
    .av-viewer-bottom { padding: 6px 10px; }
    .av-thumb { width: 58px; height: 40px; }

    /* Make join / error screens comfortable on small screens */
    .av-center-screen { padding: 24px 16px; }
    .av-text-input { max-width: 100%; }
}

/* Very small phones */
@media (max-width: 380px) {
    .av-comments-panel { height: 300px; }
    .av-reaction-btn { font-size: 18px; }
}
`;

export default AudienceViewer;