import React, { useState, useEffect, useRef } from 'react';
import { Heart, Send, Radio, ChevronLeft, ChevronRight, ZoomIn, Maximize2, RotateCcw, Hash } from 'lucide-react';
import FirebaseSyncService from '../services/FirebaseSyncService';
import LiveSessionService from '../services/LiveSessionService';
import { onAuthChange } from '../services/firebase';

const AudienceViewer = ({ sessionCode }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [pages, setPages] = useState([]);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [previewImages, setPreviewImages] = useState({});
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [guestName, setGuestName] = useState('');
    const [isJoined, setIsJoined] = useState(false);

    const commentsEndRef = useRef(null);
    const sessionUnsubRef = useRef(null);
    const commentsUnsubRef = useRef(null);
    const designUnsubRef = useRef(null);

    // Auth listener
    useEffect(() => {
        const unsub = onAuthChange((u) => setUser(u));
        return () => unsub();
    }, []);

    // Find session by code
    useEffect(() => {
        if (!sessionCode) return;
        const findSession = async () => {
            setIsLoading(true);
            try {
                // Normalize code — remove spaces
                const normalizedCode = sessionCode.toUpperCase().replace(/\s/g, '');
                // Try with spaces inserted
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

                // Listen to session updates (page changes)
                sessionUnsubRef.current = LiveSessionService.listenToSession(found.id, (data) => {
                    setSession(prev => ({ ...prev, ...data }));
                    if (data.activePageIndex !== undefined) {
                        setCurrentPageIndex(data.activePageIndex);
                    }
                    if (!data.isActive) {
                        setError('This session has ended.');
                    }
                });

                // Join session (increment viewer count)
                LiveSessionService.joinSession(found.id);

                // Listen to comments
                commentsUnsubRef.current = LiveSessionService.listenToComments(found.id, (c) => {
                    setComments(c);
                });

                // Load design
                const designData = await FirebaseSyncService.getDesign(found.designId);
                if (designData?.pages) {
                    setPages(designData.pages);
                    renderPreviews(designData.pages);
                }

                // Listen for design changes
                designUnsubRef.current = FirebaseSyncService.initSync(found.designId, (data) => {
                    if (data?.pages) {
                        setPages(data.pages);
                        renderPreviews(data.pages);
                    }
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
            if (session?.id) LiveSessionService.leaveSession(session.id);
        };
    }, [sessionCode, session?.id]);

    // Scroll comments
    useEffect(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [comments]);

    const renderPreviews = (pp) => {
        pp.forEach(page => {
            const layers = page.layers || [];
            const bgLayer = layers.find(l => l.id === 'background-layer' || l.isBackground);
            const imgLayer = layers.find(l => l.shapeType === 'image' && l.content);
            const src = bgLayer?.content || imgLayer?.content || null;
            if (src) setPreviewImages(prev => ({ ...prev, [page.id]: src }));
        });
    };

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

    const totalPages = pages.length;
    const currentPage = pages[currentPageIndex];
    const currentSrc = currentPage ? previewImages[currentPage.id] : null;

    // Auto-join for logged-in users
    useEffect(() => {
        if (user) setIsJoined(true);
    }, [user]);

    const handleSendReaction = async (type) => {
        if (!session) return;
        await LiveSessionService.sendReaction(session.id, type);
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="av-root">
                <div className="av-loading">
                    <div className="av-spinner" />
                    <p>Joining session...</p>
                </div>
                <style>{audienceStyles}</style>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="av-root">
                <div className="av-loading">
                    <Radio size={40} className="av-error-icon" />
                    <h2>{error}</h2>
                    <p>The live session may have ended or the code is invalid.</p>
                </div>
                <style>{audienceStyles}</style>
            </div>
        );
    }

    // Guest name entry (only for non-logged-in users)
    if (!user && !isJoined) {
        return (
            <div className="av-root">
                <div className="av-join-screen">
                    <Radio size={36} className="av-join-icon" />
                    <h2>Join Live Session</h2>
                    <p>Enter your name to participate</p>
                    <input
                        className="av-name-input"
                        placeholder="Your name..."
                        value={guestName}
                        onChange={e => setGuestName(e.target.value)}
                        onKeyPress={e => { if (e.key === 'Enter' && guestName.trim()) setIsJoined(true); }}
                    />
                    <button className="av-join-btn" onClick={() => { if (guestName.trim()) setIsJoined(true); }} disabled={!guestName.trim()}>
                        Join Session
                    </button>
                </div>
                <style>{audienceStyles}</style>
            </div>
        );
    }

    return (
        <div className="av-root">
            {/* Live header bar */}
            <div className="av-header">
                <div className="av-live-badge">
                    <Radio size={12} />
                    <span>LIVE</span>
                </div>
                <span className="av-host-name">Hosted by {session?.hostName || 'Unknown'}</span>
            </div>

            <div className="av-body">
                {/* LEFT: Slide viewer */}
                <div className="av-viewer">
                    <div className="av-slide-area">
                        <div className="av-slide-frame">
                            {/* Drawings Layer */}
                            <svg className="av-drawings-layer" viewBox="0 0 100 100" preserveAspectRatio="none">
                                {pages[currentPageIndex] && (session?.drawings?.[pages[currentPageIndex].id] || []).map((path, idx) => (
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
                                {/* Real-time Current Path */}
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
                            {currentSrc ? (
                                <img src={currentSrc} alt={`Slide ${currentPageIndex + 1}`} className="av-slide-img" draggable={false} />
                            ) : (
                                <div className="av-slide-empty">
                                    <Hash size={48} strokeWidth={1} />
                                    <span>Waiting for content...</span>
                                </div>
                            )}
                            {session?.laserPos && (
                                <div
                                    className="av-laser-dot"
                                    style={{ left: `${session.laserPos.x}%`, top: `${session.laserPos.y}%` }}
                                />
                            )}
                        </div>
                    </div>

                    {/* Bottom controls */}
                    <div className="av-viewer-bottom">
                        <div className="av-bottom-nav">
                            <span className="av-page-info">{currentPageIndex + 1} / {totalPages}</span>
                        </div>
                        {/* Thumbnails */}
                        <div className="av-thumbs">
                            {pages.map((page, idx) => (
                                <div key={page.id} className={`av-thumb ${idx === currentPageIndex ? 'active' : ''}`}>
                                    {previewImages[page.id] ? (
                                        <img src={previewImages[page.id]} alt={`Page ${idx + 1}`} />
                                    ) : (
                                        <div className="av-thumb-empty" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Comments */}
                <div className="av-comments-panel">
                    <div className="av-comments-header">
                        <h3>💬 Comments</h3>
                        <span className="av-comment-count">{comments.length}</span>
                    </div>

                    <div className="av-comments-list">
                        {comments.length === 0 && (
                            <div className="av-no-comments">
                                <p>No comments yet. Be the first!</p>
                            </div>
                        )}
                        {comments.map(c => (
                            <div key={c.id} className="av-comment">
                                <div className="av-comment-avatar">
                                    {c.userPhoto ? <img src={c.userPhoto} alt="" /> : <span>{(c.userName || 'A')[0]}</span>}
                                </div>
                                <div className="av-comment-content">
                                    <div className="av-comment-top">
                                        <span className="av-comment-name">{c.userName}</span>
                                        <span className="av-comment-time">
                                            {c.createdAt?.toDate ? new Date(c.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                    </div>
                                    <p className="av-comment-text">{c.text}</p>
                                </div>
                            </div>
                        ))}
                        <div ref={commentsEndRef} />
                    </div>

                    {/* Comment input */}
                    <div className="av-comment-input-area">
                        <input
                            className="av-comment-input"
                            placeholder="Write a comment..."
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <button className="av-send-btn" onClick={handleSendComment} disabled={!newComment.trim()}>
                            <Send size={16} />
                        </button>
                    </div>

                    {/* Reactions Bar */}
                    <div className="av-reactions-bar">
                        <button className="av-reaction-btn" onClick={() => handleSendReaction('heart')} title="Heart">❤️</button>
                        <button className="av-reaction-btn" onClick={() => handleSendReaction('clap')} title="Clap">👏</button>
                        <button className="av-reaction-btn" onClick={() => handleSendReaction('celebrate')} title="Celebrate">🎉</button>
                        <button className="av-reaction-btn" onClick={() => handleSendReaction('like')} title="Like">👍</button>
                    </div>
                </div>
            </div>

            <style>{audienceStyles}</style>
        </div >
    );
};

// ====================== STYLES ======================
const audienceStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    .av-root {
        position: fixed; inset: 0; z-index: 999999;
        background: #111827;
        font-family: 'Inter', 'Outfit', sans-serif;
        color: #e0e0e0;
        display: flex; flex-direction: column;
        overflow: hidden;
    }

    .av-loading, .av-join-screen {
        flex: 1; display: flex; flex-direction: column;
        align-items: center; justify-content: center; gap: 16px;
        text-align: center;
    }
    .av-loading p, .av-loading h2 { color: #9ca3af; }
    .av-error-icon { color: #ef4444; }
    .av-spinner {
        width: 40px; height: 40px;
        border: 3px solid rgba(255,255,255,0.08);
        border-top-color: #8B3DFF;
        border-radius: 50%;
        animation: av-spin 0.8s linear infinite;
    }
    @keyframes av-spin { to { transform: rotate(360deg); } }

    /* Join screen */
    .av-join-icon { color: #8B3DFF; }
    .av-join-screen h2 { font-size: 22px; font-weight: 700; color: #fff; }
    .av-join-screen p { font-size: 13px; color: rgba(255,255,255,0.5); }
    .av-name-input {
        width: 280px; padding: 12px 16px;
        background: rgba(255,255,255,0.06);
        border: 1.5px solid rgba(255,255,255,0.15);
        border-radius: 10px; color: #fff;
        font-size: 14px; outline: none;
        transition: border-color 0.2s;
    }
    .av-name-input:focus { border-color: #8B3DFF; }
    .av-name-input::placeholder { color: rgba(255,255,255,0.3); }
    .av-join-btn {
        padding: 12px 36px;
        background: #8B3DFF; color: #fff;
        border: none; border-radius: 10px;
        font-size: 14px; font-weight: 700;
        cursor: pointer; transition: all 0.2s;
    }
    .av-join-btn:hover:not(:disabled) { background: #7a32e6; }
    .av-join-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    /* Header */
    .av-header {
        height: 44px; flex-shrink: 0;
        display: flex; align-items: center; gap: 10px;
        padding: 0 20px;
        background: rgba(15, 15, 30, 0.95);
        border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .av-live-badge {
        display: flex; align-items: center; gap: 4px;
        padding: 3px 10px; border-radius: 20px;
        background: rgba(239, 68, 68, 0.15);
        border: 1px solid rgba(239, 68, 68, 0.4);
        color: #ef4444; font-size: 11px; font-weight: 700;
    }
    .av-live-badge svg { animation: av-pulse 2s linear infinite; }
    @keyframes av-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
    .av-host-name { font-size: 13px; color: rgba(255,255,255,0.5); }

    /* Body */
    .av-body { flex: 1; display: flex; overflow: hidden; }

    /* Viewer */
    .av-viewer {
        flex: 1; display: flex; flex-direction: column;
        min-width: 0;
    }
    .av-slide-area {
        flex: 1; display: flex; align-items: center; justify-content: center;
        padding: 24px;
        background: radial-gradient(ellipse at center, #1e1e3a 0%, #111827 60%);
    }
    .av-slide-frame {
        max-width: 85%; max-height: 100%;
        display: flex; align-items: center; justify-content: center;
    }
    .av-slide-img {
        max-width: 100%; max-height: calc(100vh - 200px);
        object-fit: contain; border-radius: 6px;
        box-shadow: 0 20px 80px rgba(0,0,0,0.5);
    }
    .av-slide-empty {
        width: 500px; height: 350px;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center; gap: 12px;
        background: rgba(255,255,255,0.03);
        border: 1px dashed rgba(255,255,255,0.1);
        border-radius: 12px; color: rgba(255,255,255,0.2);
    }

    /* Viewer bottom */
    .av-viewer-bottom {
        flex-shrink: 0;
        background: rgba(10, 10, 25, 0.95);
        border-top: 1px solid rgba(255,255,255,0.05);
    }
    .av-bottom-nav {
        display: flex; align-items: center; justify-content: center;
        padding: 6px 16px;
    }
    .av-page-info { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); }
    .av-thumbs {
        display: flex; gap: 6px;
        padding: 6px 16px 10px;
        overflow-x: auto;
    }
    .av-thumbs::-webkit-scrollbar { height: 3px; }
    .av-thumbs::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
    .av-thumb {
        flex-shrink: 0; width: 72px; height: 50px;
        border-radius: 5px; overflow: hidden;
        border: 2px solid transparent;
        background: rgba(255,255,255,0.03);
    }
    .av-thumb.active { border-color: #8B3DFF; }
    .av-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .av-thumb-empty { width: 100%; height: 100%; background: rgba(255,255,255,0.05); }

    /* Comments panel */
    .av-comments-panel {
        width: 320px; flex-shrink: 0;
        display: flex; flex-direction: column;
        background: rgba(20, 20, 38, 0.98);
        border-left: 1px solid rgba(255,255,255,0.06);
    }
    .av-comments-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 14px 16px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .av-comments-header h3 { font-size: 15px; font-weight: 700; color: #fff; }
    .av-comment-count {
        font-size: 11px; font-weight: 700;
        padding: 2px 8px; border-radius: 10px;
        background: rgba(139,61,255,0.15); color: #a78bfa;
    }

    .av-comments-list {
        flex: 1; overflow-y: auto;
        padding: 12px 12px;
        display: flex; flex-direction: column; gap: 12px;
    }
    .av-no-comments {
        flex: 1; display: flex; align-items: center; justify-content: center;
    }
    .av-no-comments p { font-size: 13px; color: rgba(255,255,255,0.2); }

    .av-comment { display: flex; gap: 8px; }
    .av-comment-avatar {
        width: 30px; height: 30px; flex-shrink: 0;
        border-radius: 50%; overflow: hidden;
        background: linear-gradient(135deg, #8B3DFF, #a855f7);
        display: flex; align-items: center; justify-content: center;
        font-size: 12px; font-weight: 700; color: #fff;
    }
    .av-comment-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .av-comment-content { flex: 1; }
    .av-comment-top { display: flex; align-items: center; gap: 6px; margin-bottom: 2px; }
    .av-comment-name { font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.7); }
    .av-comment-time { font-size: 10px; color: rgba(255,255,255,0.25); }
    .av-comment-text { font-size: 13px; color: rgba(255,255,255,0.55); line-height: 1.4; }
    .av-like-btn {
        display: flex; align-items: center; gap: 4px;
        margin-top: 4px; padding: 2px 6px;
        border: none; background: transparent;
        color: rgba(255,255,255,0.3); cursor: pointer;
        font-size: 11px; border-radius: 4px;
        transition: all 0.15s;
    }
    .av-like-btn:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.6); }

    /* Comment input */
    .av-comment-input-area {
        display: flex; align-items: center; gap: 8px;
        padding: 12px;
        border-top: 1px solid rgba(255,255,255,0.06);
    }
    .av-comment-input {
        flex: 1; padding: 10px 14px;
        background: rgba(255,255,255,0.05);
        border: 1.5px solid rgba(255,255,255,0.1);
        border-radius: 10px; color: #fff;
        font-size: 13px; outline: none;
        transition: border-color 0.2s;
    }
    .av-comment-input:focus { border-color: #8B3DFF; }
    .av-comment-input::placeholder { color: rgba(255,255,255,0.2); }
    .av-send-btn {
        width: 38px; height: 38px;
        display: flex; align-items: center; justify-content: center;
        background: #8B3DFF; border: none; border-radius: 10px;
        color: #fff; cursor: pointer; transition: all 0.15s;
    }
    .av-send-btn:hover:not(:disabled) { background: #7a32e6; }
    .av-send-btn:disabled { opacity: 0.3; cursor: not-allowed; }

    /* Reactions bar */
    .av-reactions-bar {
        display: flex; gap: 8px; justify-content: center;
        padding: 10px; background: rgba(0,0,0,0.2);
    }
    .av-reaction-btn {
        font-size: 20px; background: transparent; border: none;
        cursor: pointer; transition: transform 0.2s;
    }
    .av-reaction-btn:hover { transform: scale(1.3); }
    .av-reaction-btn:active { transform: scale(0.9); }

    /* Drawings */
    .av-slide-frame { position: relative; }
    .av-drawings-layer {
        position: absolute; inset: 0;
        pointer-events: none; z-index: 50;
        width: 100%; height: 100%;
        overflow: visible;
    }
    .av-drawings-layer polyline {
        vector-effect: non-scaling-stroke;
    }

    .av-laser-dot {
        position: absolute;
        width: 10px; height: 10px;
        background: #ff3b3b;
        border-radius: 50%;
        box-shadow: 0 0 10px 3px rgba(255,59,59,0.5);
        pointer-events: none;
        transform: translate(-50%, -50%);
        z-index: 100;
        transition: left 0.05s ease-out, top 0.05s ease-out;
    }
`;

export default AudienceViewer;
