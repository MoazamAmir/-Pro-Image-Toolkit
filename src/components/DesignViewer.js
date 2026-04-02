import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    ChevronLeft, ChevronRight, Share2,
    Maximize2, ZoomIn, ZoomOut,
    X, Check, Copy
} from 'lucide-react';
import FirebaseSyncService from '../services/FirebaseSyncService';
import SlideRenderer from './SlideRenderer';

const DesignViewer = ({ designId, user }) => {
    const [pages, setPages] = useState([]);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [canvasSize, setCanvasSize] = useState({ width: 1920, height: 1080 });
    const [adjustments, setAdjustments] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scale, setScale] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showSharePopup, setShowSharePopup] = useState(false);
    const [copied, setCopied] = useState(false);

    const containerRef = useRef(null);
    const canvasAreaRef = useRef(null);

    // -- Load Design --
    useEffect(() => {
        if (!designId) return;

        const loadDesign = async () => {
            setIsLoading(true);
            try {
                const data = await FirebaseSyncService.getDesign(designId);
                if (data) {
                    setPages(data.pages || []);
                    setCanvasSize(data.canvasSize || { width: 1080, height: 720 });
                    setAdjustments(data.adjustments || {});
                } else {
                    setError('Design not found.');
                }
            } catch (err) {
                console.error('Error loading design:', err);
                setError('Failed to load design.');
            } finally {
                setIsLoading(false);
            }
        };

        loadDesign();

        // Listen for real-time updates
        const unsub = FirebaseSyncService.initSync(designId, (data) => {
            if (data?.pages) setPages(data.pages);
            if (data?.canvasSize) setCanvasSize(data.canvasSize);
            if (data?.adjustments) setAdjustments(data.adjustments);
        });

        return () => { if (unsub) unsub(); };
    }, [designId]);

    // -- Responsive Scaling --
    const updateScale = useCallback(() => {
        if (!canvasAreaRef.current) return;

        const padding = 48;
        const availableWidth = canvasAreaRef.current.clientWidth - padding;
        const availableHeight = canvasAreaRef.current.clientHeight - padding;

        const scaleX = availableWidth / canvasSize.width;
        const scaleY = availableHeight / canvasSize.height;

        // No max cap — always fit content fully inside screen
        const fitScale = Math.min(scaleX, scaleY);
        setScale(fitScale > 0 ? fitScale : 1);
    }, [canvasSize]);

    useEffect(() => {
        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, [updateScale, pages, isLoading]);

    // -- Navigation --
    const goNext = () => setCurrentPageIndex(prev => Math.min(prev + 1, pages.length - 1));
    const goPrev = () => setCurrentPageIndex(prev => Math.max(prev - 1, 0));

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight' || e.key === ' ') goNext();
            else if (e.key === 'ArrowLeft') goPrev();
            else if (e.key === 'f' || e.key === 'F') toggleFullscreen();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [pages.length]);

    // -- Fullscreen --
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        const handleFsChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
            // Recalculate scale after fullscreen change
            setTimeout(updateScale, 100);
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, [updateScale]);

    // -- Share --
    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isLoading) {
        return (
            <div className="dv-loading">
                <div className="dv-spinner" />
                <p>Loading design...</p>
                <style>{styles}</style>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dv-error">
                <div className="dv-error-card">
                    <h2>Oops!</h2>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Retry</button>
                </div>
                <style>{styles}</style>
            </div>
        );
    }

    return (
        <div className="dv-root" ref={containerRef}>
            {/* --- Header --- */}
            <header className="dv-header">
                <div className="dv-logo">
                    <div className="dv-logo-icon">P</div>
                    <span>Editor PRO</span>
                </div>

                <div className="dv-header-actions">
                    <button className="dv-share-btn" onClick={() => setShowSharePopup(!showSharePopup)}>
                        <Share2 size={16} />
                        <span>Share</span>
                    </button>

                    {showSharePopup && (
                        <div className="dv-share-popup">
                            <div className="dv-share-header">
                                <h3>Share this design</h3>
                                <button onClick={() => setShowSharePopup(false)}><X size={14} /></button>
                            </div>
                            <div className="dv-share-body">
                                <div className="dv-link-box">
                                    <input type="text" readOnly value={window.location.href} />
                                    <button onClick={handleCopyLink}>
                                        {copied ? <Check size={14} style={{ color: '#4ade80' }} /> : <Copy size={14} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* --- Main Content --- */}
            <main className="dv-main" ref={canvasAreaRef}>
                {/* Canvas — scaled to fit, never overflows */}
                <div
                    className="dv-canvas-wrapper"
                    style={{
                        transform: `scale(${scale})`,
                        transformOrigin: 'center center',
                        width: `${canvasSize.width}px`,
                        height: `${canvasSize.height}px`,
                        flexShrink: 0,
                    }}
                >
                    <SlideRenderer
                        page={pages[currentPageIndex]}
                        canvasSize={canvasSize}
                        adjustments={adjustments}
                    />
                </div>

                {/* Side Navigation Buttons (Floating) */}
                {pages.length > 1 && (
                    <>
                        <button
                            className={`dv-nav-float left ${currentPageIndex === 0 ? 'disabled' : ''}`}
                            onClick={goPrev}
                            disabled={currentPageIndex === 0}
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            className={`dv-nav-float right ${currentPageIndex === pages.length - 1 ? 'disabled' : ''}`}
                            onClick={goNext}
                            disabled={currentPageIndex === pages.length - 1}
                        >
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}
            </main>

            {/* --- Footer Controls --- */}
            <footer className="dv-footer">
                <div className="dv-footer-left">
                    <div className="dv-page-nav">
                        <button onClick={goPrev} disabled={currentPageIndex === 0}>
                            <ChevronLeft size={18} />
                        </button>
                        <span className="dv-page-info">
                            {currentPageIndex + 1} / {pages.length}
                        </span>
                        <button onClick={goNext} disabled={currentPageIndex === pages.length - 1}>
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>

                <div className="dv-footer-center">
                    <div className="dv-zoom-controls">
                        <button onClick={() => setScale(s => Math.max(0.05, s - 0.1))}><ZoomOut size={16} /></button>
                        <span className="dv-zoom-level">{Math.round(scale * 100)}%</span>
                        <button onClick={() => setScale(s => Math.min(3, s + 0.1))}><ZoomIn size={16} /></button>
                        <button className="dv-fit-btn" onClick={updateScale}>Fit</button>
                    </div>
                </div>

                <div className="dv-footer-right">
                    <button className="dv-fs-btn" onClick={toggleFullscreen}>
                        <Maximize2 size={18} />
                    </button>
                </div>
            </footer>

            <style>{styles}</style>
        </div>
    );
};

const styles = `
    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }

    .dv-root {
        position: fixed;
        inset: 0;
        background: #f8fafc; /* Changed to light gray */
        color: #1e293b;
        display: flex;
        flex-direction: column;
        font-family: 'Inter', system-ui, sans-serif;
        overflow: hidden;
        z-index: 9999;
    }

    /* ── Loading & Error ── */
    .dv-loading, .dv-error {
        position: fixed;
        inset: 0;
        background: #f8fafc;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #1e293b;
        gap: 12px;
    }
    .dv-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid rgba(0,0,0,0.1);
        border-top-color: #6366f1;
        border-radius: 50%;
        animation: dv-spin 0.8s linear infinite;
    }
    @keyframes dv-spin { to { transform: rotate(360deg); } }

    .dv-error-card {
        background: #fff;
        padding: 32px;
        border-radius: 20px;
        text-align: center;
        border: 1px solid rgba(0,0,0,0.1);
        box-shadow: 0 10px 25px rgba(0,0,0,0.05);
    }
    .dv-error-card h2 { margin-bottom: 12px; color: #f43f5e; }
    .dv-error-card button {
        margin-top: 20px;
        padding: 8px 24px;
        background: #6366f1;
        border: none;
        border-radius: 8px;
        color: #fff;
        cursor: pointer;
        font-size: 14px;
    }

    /* ── Header ── */
    .dv-header {
        height: 56px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 20px;
        background: #ffffff;
        border-bottom: 1px solid rgba(0,0,0,0.08);
        z-index: 10;
        flex-shrink: 0;
    }
    .dv-logo {
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 700;
        font-size: 16px;
        color: #0f172a;
    }
    .dv-logo-icon {
        width: 30px;
        height: 30px;
        background: linear-gradient(135deg, #6366f1, #a855f7);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 15px;
        font-weight: 700;
    }
    .dv-header-actions {
        position: relative;
    }
    .dv-share-btn {
        display: flex;
        align-items: center;
        gap: 7px;
        background: #f1f5f9;
        border: 1px solid #e2e8f0;
        padding: 7px 14px;
        border-radius: 9px;
        color: #475569;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
    }
    .dv-share-btn:hover { background: #e2e8f0; color: #1e293b; }

    .dv-share-popup {
        position: absolute;
        top: calc(100% + 10px);
        right: 0;
        width: 300px;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        padding: 14px;
        animation: dv-pop 0.18s ease-out;
        z-index: 100;
    }
    @keyframes dv-pop {
        from { opacity: 0; transform: translateY(-8px); }
        to   { opacity: 1; transform: translateY(0); }
    }
    .dv-share-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
    }
    .dv-share-header h3 { font-size: 13px; font-weight: 600; color: #1e293b; }
    .dv-share-header button {
        background: none;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        padding: 2px;
        display: flex;
        align-items: center;
    }
    .dv-link-box {
        display: flex;
        align-items: center;
        gap: 6px;
        background: #f8fafc;
        padding: 7px 10px;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
    }
    .dv-link-box input {
        flex: 1;
        background: none;
        border: none;
        color: #94a3b8;
        font-size: 11px;
        outline: none;
        min-width: 0;
    }
    .dv-link-box button {
        background: #e2e8f0;
        border: none;
        color: #475569;
        padding: 5px 6px;
        border-radius: 5px;
        cursor: pointer;
        display: flex;
        align-items: center;
        flex-shrink: 0;
    }

    /* ── Main Canvas Area ── */
    .dv-main {
        flex: 1;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        background: #f1f5f9; /* Soft workspace background */
    }

    .dv-canvas-wrapper {
        position: relative;
        box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        border-radius: 4px;
        background: #fff;
        transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Side nav float buttons */
    .dv-nav-float {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 44px;
        height: 44px;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #475569;
        cursor: pointer;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        transition: all 0.2s;
        z-index: 5;
    }
    .dv-nav-float:hover:not(.disabled) {
        background: #f8fafc;
        transform: translateY(-50%) scale(1.1);
        color: #1e293b;
    }
    .dv-nav-float.left  { left: 16px; }
    .dv-nav-float.right { right: 16px; }
    .dv-nav-float.disabled { opacity: 0.18; cursor: default; }

    /* ── Footer ── */
    .dv-footer {
        height: 52px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 20px;
        background: #ffffff;
        border-top: 1px solid rgba(0,0,0,0.08);
        z-index: 10;
        flex-shrink: 0;
    }
    .dv-footer-left,
    .dv-footer-center,
    .dv-footer-right {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .dv-page-nav {
        display: flex;
        align-items: center;
        gap: 10px;
        background: #f1f5f9;
        padding: 4px 10px;
        border-radius: 9px;
        border: 1px solid #e2e8f0;
    }
    .dv-page-nav button {
        background: none;
        border: none;
        color: #475569;
        cursor: pointer;
        opacity: 0.6;
        transition: opacity 0.15s;
        display: flex;
        align-items: center;
    }
    .dv-page-nav button:hover:not(:disabled) { opacity: 1; }
    .dv-page-nav button:disabled { opacity: 0.2; cursor: default; }
    .dv-page-info {
        font-size: 12px;
        font-weight: 600;
        min-width: 36px;
        text-align: center;
        color: #1e293b;
    }

    .dv-zoom-controls {
        display: flex;
        align-items: center;
        gap: 10px;
        background: #f1f5f9;
        padding: 4px 10px;
        border-radius: 9px;
        border: 1px solid #e2e8f0;
    }
    .dv-zoom-controls button {
        background: none;
        border: none;
        color: #475569;
        cursor: pointer;
        opacity: 0.6;
        transition: opacity 0.15s;
        display: flex;
        align-items: center;
    }
    .dv-zoom-controls button:hover { opacity: 1; }
    .dv-zoom-level {
        font-size: 12px;
        font-weight: 600;
        min-width: 40px;
        text-align: center;
        color: #1e293b;
    }
    .dv-fit-btn {
        font-size: 10px !important;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        background: #e2e8f0 !important;
        padding: 3px 8px !important;
        border-radius: 5px !important;
        opacity: 1 !important;
        color: #475569 !important;
    }
    .dv-fit-btn:hover {
        background: #cbd5e1 !important;
        color: #1e293b !important;
    }

    .dv-fs-btn {
        background: #f1f5f9;
        border: 1px solid #e2e8f0;
        color: #475569;
        width: 34px;
        height: 34px;
        border-radius: 9px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
    }
    .dv-fs-btn:hover { background: #e2e8f0; color: #1e293b; }
`;

export default DesignViewer;