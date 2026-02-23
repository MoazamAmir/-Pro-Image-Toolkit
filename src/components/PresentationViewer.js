import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
    X, ChevronLeft, ChevronRight, Maximize2, Minimize2,
    Search, Share2, Monitor, MoreHorizontal, Pause, Play
} from 'lucide-react';

const PresentationViewer = ({
    pages,
    activePageId,
    switchPage,
    layers,
    canvasSize,
    adjustments,
    renderFinalCanvas,
    onClose,
    darkMode,
    mode = 'fullscreen' // 'fullscreen' or 'autoplay'
}) => {
    const [currentPageIndex, setCurrentPageIndex] = useState(() => {
        const idx = pages.findIndex(p => p.id === activePageId);
        return idx >= 0 ? idx : 0;
    });
    const [zoom, setZoom] = useState(1);
    const [previewImages, setPreviewImages] = useState({});
    const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);
    const [autoplayProgress, setAutoplayProgress] = useState(0);
    const autoplayTimerRef = useRef(null);
    const autoplayProgressRef = useRef(null);
    const totalPages = pages.length;
    const autoplayInterval = 5000; // 5 seconds per page

    // Render all page previews
    const renderPagePreview = useCallback(async (page) => {
        if (!renderFinalCanvas) return null;
        try {
            const pageLayers = page.layers || [];
            const pageCanvasSize = page.canvasSize || canvasSize;
            const canvas = await renderFinalCanvas(pageLayers, adjustments, {
                scale: 1, transparent: false, useOriginalResolution: false
            });
            if (canvas) {
                return canvas.toDataURL('image/jpeg', 0.9);
            }
        } catch (err) {
            console.error('Preview render error:', err);
        }
        return null;
    }, [renderFinalCanvas, adjustments, canvasSize]);

    // Pre-render all pages
    useEffect(() => {
        const renderAll = async () => {
            for (const page of pages) {
                if (!previewImages[page.id]) {
                    const src = await renderPagePreview(page);
                    if (src) {
                        setPreviewImages(prev => ({ ...prev, [page.id]: src }));
                    }
                }
            }
        };
        renderAll();
    }, [pages, renderPagePreview]);

    // Also render current page's live canvas
    useEffect(() => {
        const renderCurrent = async () => {
            const page = pages[currentPageIndex];
            if (page) {
                const src = await renderPagePreview(page);
                if (src) {
                    setPreviewImages(prev => ({ ...prev, [page.id]: src }));
                }
            }
        };
        renderCurrent();
    }, [currentPageIndex, layers, adjustments]);

    // Navigate pages
    const goToPage = useCallback((index) => {
        if (index >= 0 && index < totalPages) {
            setCurrentPageIndex(index);
            switchPage(pages[index].id);
            setAutoplayProgress(0);
        }
    }, [totalPages, pages, switchPage]);

    const goNext = useCallback(() => {
        if (currentPageIndex < totalPages - 1) {
            goToPage(currentPageIndex + 1);
        } else if (mode === 'autoplay') {
            // Loop back to first page in autoplay
            goToPage(0);
        }
    }, [currentPageIndex, totalPages, goToPage, mode]);

    const goPrev = useCallback(() => {
        if (currentPageIndex > 0) {
            goToPage(currentPageIndex - 1);
        }
    }, [currentPageIndex, goToPage]);

    // Click navigation: left half = prev, right half = next
    const handleStageClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const midpoint = rect.width / 2;
        if (clickX < midpoint) {
            goPrev();
        } else {
            goNext();
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowRight' || e.key === ' ') {
                e.preventDefault();
                goNext();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                goPrev();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [goNext, goPrev, onClose]);

    // Autoplay logic
    useEffect(() => {
        if (mode !== 'autoplay' || isAutoplayPaused) {
            if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
            if (autoplayProgressRef.current) clearInterval(autoplayProgressRef.current);
            return;
        }

        const progressStep = 50; // update progress every 50ms
        let elapsed = 0;

        autoplayProgressRef.current = setInterval(() => {
            elapsed += progressStep;
            setAutoplayProgress((elapsed / autoplayInterval) * 100);
        }, progressStep);

        autoplayTimerRef.current = setTimeout(() => {
            goNext();
        }, autoplayInterval);

        return () => {
            if (autoplayTimerRef.current) clearTimeout(autoplayTimerRef.current);
            if (autoplayProgressRef.current) clearInterval(autoplayProgressRef.current);
        };
    }, [mode, currentPageIndex, isAutoplayPaused, goNext]);

    // Fullscreen toggle
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const currentPage = pages[currentPageIndex];
    const currentImageSrc = currentPage ? previewImages[currentPage.id] : null;

    return createPortal(
        <div className="pv-viewer">
            {/* Main Stage */}
            <div className="pv-stage" onClick={handleStageClick}>
                <div className="pv-canvas-wrapper" style={{ transform: `scale(${zoom})` }}>
                    {currentImageSrc ? (
                        <img src={currentImageSrc} alt={`Page ${currentPageIndex + 1}`} className="pv-canvas-img" draggable={false} />
                    ) : (
                        <div className="pv-loading">
                            <div className="pv-spinner" />
                        </div>
                    )}
                </div>

                {/* Navigation hint areas */}
                <div className="pv-nav-hint pv-nav-hint-left">
                    <ChevronLeft className="w-8 h-8" />
                </div>
                <div className="pv-nav-hint pv-nav-hint-right">
                    <ChevronRight className="w-8 h-8" />
                </div>
            </div>

            {/* Progress bar (teal) */}
            <div className="pv-progress-bar-track">
                <div
                    className="pv-progress-bar-fill"
                    style={{
                        width: mode === 'autoplay'
                            ? `${autoplayProgress}%`
                            : `${((currentPageIndex + 1) / totalPages) * 100}%`,
                        transition: mode === 'autoplay' ? 'width 50ms linear' : 'width 0.3s ease'
                    }}
                />
            </div>

            {/* Bottom Toolbar */}
            <div className="pv-toolbar">
                <div className="pv-toolbar-left">
                    {/* Page Navigation */}
                    <button
                        onClick={(e) => { e.stopPropagation(); goPrev(); }}
                        disabled={currentPageIndex === 0 && mode !== 'autoplay'}
                        className="pv-toolbar-btn"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="pv-page-indicator">
                        {currentPageIndex + 1}/{totalPages}
                    </span>
                    <button
                        onClick={(e) => { e.stopPropagation(); goNext(); }}
                        disabled={currentPageIndex === totalPages - 1 && mode !== 'autoplay'}
                        className="pv-toolbar-btn"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                <div className="pv-toolbar-right">
                    {/* Autoplay pause/play */}
                    {mode === 'autoplay' && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsAutoplayPaused(!isAutoplayPaused); }}
                            className="pv-toolbar-btn"
                            title={isAutoplayPaused ? 'Resume autoplay' : 'Pause autoplay'}
                        >
                            {isAutoplayPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                        </button>
                    )}

                    {/* Zoom */}
                    <button
                        onClick={(e) => { e.stopPropagation(); setZoom(z => Math.max(0.5, z - 0.1)); }}
                        className="pv-toolbar-btn"
                        title="Zoom out"
                    >
                        <Search className="w-4 h-4" />
                    </button>

                    {/* Share */}
                    <button onClick={(e) => e.stopPropagation()} className="pv-toolbar-btn" title="Share">
                        <Share2 className="w-5 h-5" />
                    </button>

                    {/* More */}
                    <button onClick={(e) => e.stopPropagation()} className="pv-toolbar-btn" title="More options">
                        <Monitor className="w-5 h-5" />
                    </button>

                    {/* Presenter display */}
                    <button onClick={(e) => e.stopPropagation()} className="pv-toolbar-btn" title="Presenter display">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>

                    {/* Fullscreen */}
                    <button
                        onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                        className="pv-toolbar-btn"
                        title="Toggle fullscreen"
                    >
                        <Maximize2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <style>{`
                .pv-viewer {
                    position: fixed;
                    inset: 0;
                    z-index: 999999;
                    background: #000;
                    display: flex;
                    flex-direction: column;
                    font-family: 'Outfit', 'Inter', sans-serif;
                    color: white;
                    overflow: hidden;
                    user-select: none;
                }

                /* Stage */
                .pv-stage {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    cursor: pointer;
                    overflow: hidden;
                    background: radial-gradient(ellipse at center, #1a1a2e 0%, #000 70%);
                }

                .pv-canvas-wrapper {
                    max-width: 90%;
                    max-height: 90%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.2s ease;
                }

                .pv-canvas-img {
                    max-width: 100%;
                    max-height: calc(100vh - 120px);
                    object-fit: contain;
                    border-radius: 4px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
                }

                .pv-loading {
                    width: 400px;
                    height: 300px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .pv-spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(255,255,255,0.1);
                    border-top-color: #8B3DFF;
                    border-radius: 50%;
                    animation: pv-spin 0.8s linear infinite;
                }
                @keyframes pv-spin { to { transform: rotate(360deg); } }

                /* Nav hints */
                .pv-nav-hint {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    width: 80px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.2s;
                    color: rgba(255,255,255,0.6);
                    z-index: 10;
                }
                .pv-nav-hint-left { left: 0; }
                .pv-nav-hint-right { right: 0; }
                .pv-stage:hover .pv-nav-hint { opacity: 1; }
                .pv-nav-hint:hover { color: white; }

                /* Progress bar */
                .pv-progress-bar-track {
                    height: 4px;
                    background: rgba(255,255,255,0.08);
                    flex-shrink: 0;
                }
                .pv-progress-bar-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #2dd4bf, #14b8a6);
                    border-radius: 0 2px 2px 0;
                }

                /* Bottom Toolbar */
                .pv-toolbar {
                    height: 52px;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 16px;
                    background: rgba(15, 15, 25, 0.95);
                    backdrop-filter: blur(20px);
                    border-top: 1px solid rgba(255,255,255,0.05);
                }

                .pv-toolbar-left,
                .pv-toolbar-right {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .pv-toolbar-btn {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: none;
                    background: transparent;
                    color: rgba(255,255,255,0.5);
                    cursor: pointer;
                    border-radius: 10px;
                    transition: all 0.15s;
                }
                .pv-toolbar-btn:hover:not(:disabled) {
                    background: rgba(255,255,255,0.08);
                    color: white;
                }
                .pv-toolbar-btn:disabled {
                    opacity: 0.2;
                    cursor: not-allowed;
                }

                .pv-page-indicator {
                    font-size: 14px;
                    font-weight: 800;
                    color: rgba(255,255,255,0.7);
                    min-width: 40px;
                    text-align: center;
                    letter-spacing: 0.5px;
                }
            `}</style>
        </div>,
        document.body
    );
};

export default PresentationViewer;
