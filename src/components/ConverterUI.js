// src/components/ConverterUI.js
import React, { Suspense, lazy, useState, useEffect, useRef } from 'react';
import { Upload, FileText, X, Download, CheckCircle, Settings, Zap, Edit2, Scissors, Shield } from 'lucide-react';
import { toolDetails } from '../utils/toolDetailsData';

const CropImageTool = lazy(() => import('./CropImageTool'));
const ToolDetailsPanel = lazy(() => import('./ToolDetailsPanel'));
const ImageEditor = lazy(() => import('./ImageEditor'));

const LIGHT_C = {
    bg: '#f5f7fb',
    surface: '#ffffff',
    surfaceHover: '#eef4fb',
    canvas: '#edf3f9',
    border: '#d5dfeb',
    accent: '#18b7aa',
    accentStrong: '#0f9a90',
    text: '#11243d',
    textMuted: '#617285',
    textFaint: '#90a0b3',
    textOnAccent: '#08353a',
    success: '#2f9e67',
    pageStart: '#f9fbff',
    glass: 'rgba(255,255,255,0.72)',
    panelShadow: '0 20px 60px rgba(148, 163, 184, 0.16)',
    cardShadow: '0 20px 40px rgba(148, 163, 184, 0.08)',
};

const DARK_C = {
    bg: '#07111f',
    surface: '#0f172a',
    surfaceHover: '#162235',
    canvas: '#091423',
    border: '#243447',
    accent: '#22d3c5',
    accentStrong: '#12b7ab',
    text: '#e5eefb',
    textMuted: '#9cb0c9',
    textFaint: '#69809d',
    textOnAccent: '#042f2c',
    success: '#4ade80',
    pageStart: '#040b16',
    glass: 'rgba(7,17,31,0.78)',
    panelShadow: '0 24px 80px rgba(2, 6, 23, 0.45)',
    cardShadow: '0 20px 40px rgba(2, 6, 23, 0.35)',
};

function getConverterTheme(darkMode) {
    return darkMode ? DARK_C : LIGHT_C;
}

const ConverterFontLink = ({ colors, darkMode }) => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;700&display=swap');
        .converter-crop-theme,
        .converter-crop-theme * {
            box-sizing: border-box;
        }
        .converter-crop-theme {
            font-family: 'DM Sans', sans-serif;
            color: ${colors.text};
        }
        .converter-crop-theme .brand-font {
            font-family: 'Syne', sans-serif;
        }
        .converter-crop-theme .converter-panel {
            background: ${colors.surface} !important;
            border: 1px solid ${colors.border} !important;
            border-radius: 20px !important;
            box-shadow: ${colors.panelShadow} !important;
        }
        .converter-crop-theme .converter-panel h3,
        .converter-crop-theme .converter-panel h4,
        .converter-crop-theme .converter-panel th,
        .converter-crop-theme .converter-panel .text-gray-900,
        .converter-crop-theme .converter-panel .text-white {
            color: ${colors.text} !important;
        }
        .converter-crop-theme .converter-panel p,
        .converter-crop-theme .converter-panel label,
        .converter-crop-theme .converter-panel .text-gray-700,
        .converter-crop-theme .converter-panel .text-gray-600,
        .converter-crop-theme .converter-panel .text-gray-500,
        .converter-crop-theme .converter-panel .text-gray-400,
        .converter-crop-theme .converter-panel .text-gray-300 {
            color: ${colors.textMuted} !important;
        }
        .converter-crop-theme .converter-soft-panel {
            background: ${colors.surfaceHover} !important;
            border: 1px solid ${colors.border} !important;
            border-radius: 14px !important;
        }
        .converter-crop-theme .converter-kicker {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 6px 16px;
            border-radius: 999px;
            border: 1px solid ${darkMode ? 'rgba(34, 211, 197, 0.24)' : 'rgba(24, 183, 170, 0.2)'};
            background: ${darkMode ? 'rgba(34, 211, 197, 0.12)' : 'rgba(24, 183, 170, 0.08)'};
            color: ${colors.accent};
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 0.08em;
            text-transform: uppercase;
        }
        .converter-crop-theme .converter-main-title {
            font-family: 'Syne', sans-serif;
            color: ${colors.text};
            letter-spacing: -0.04em;
        }
        .converter-crop-theme .converter-panel input[type='text'],
        .converter-crop-theme .converter-panel input[type='number'],
        .converter-crop-theme .converter-panel select {
            background: ${colors.surfaceHover} !important;
            border: 1px solid ${colors.border} !important;
            border-radius: 10px !important;
            color: ${colors.text} !important;
            box-shadow: none !important;
        }
        .converter-crop-theme .converter-panel input::placeholder {
            color: ${colors.textFaint} !important;
        }
        .converter-crop-theme .converter-panel input[type='range'] {
            -webkit-appearance: none;
            appearance: none;
            height: 4px;
            border-radius: 999px;
            outline: none;
            cursor: pointer;
        }
        .converter-crop-theme .converter-panel input[type='range']::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 999px;
            background: ${colors.accent};
            border: 2px solid ${colors.surface};
        }
        .converter-crop-theme [class*='text-purple-'] {
            color: ${colors.accent} !important;
        }
        .converter-crop-theme [class*='border-purple-'] {
            border-color: ${darkMode ? 'rgba(34, 211, 197, 0.26)' : 'rgba(24, 183, 170, 0.28)'} !important;
        }
        .converter-crop-theme [class*='from-purple-50'][class*='to-blue-50'],
        .converter-crop-theme [class*='from-purple-50'][class*='to-indigo-50'],
        .converter-crop-theme [class*='bg-purple-50'],
        .converter-crop-theme [class*='bg-indigo-50'],
        .converter-crop-theme [class*='bg-green-50'] {
            background: ${colors.surfaceHover} !important;
        }
        .converter-crop-theme [class*='from-purple-'][class*='to-blue-'],
        .converter-crop-theme [class*='from-purple-'][class*='to-indigo-'] {
            background-image: linear-gradient(135deg, ${colors.accent}, #34a1ff) !important;
            color: ${colors.textOnAccent} !important;
        }
        .converter-crop-theme .converter-primary-button {
            border: none !important;
            border-radius: 12px !important;
            background: linear-gradient(135deg, ${colors.accent}, #34a1ff) !important;
            color: ${colors.textOnAccent} !important;
            font-family: 'Syne', sans-serif;
            font-weight: 700 !important;
            letter-spacing: -0.02em;
            box-shadow: ${darkMode ? '0 20px 40px rgba(34, 211, 197, 0.12)' : '0 20px 40px rgba(24, 183, 170, 0.2)'} !important;
        }
        .converter-crop-theme .converter-secondary-button {
            background: ${colors.surfaceHover} !important;
            border: 1px solid ${colors.border} !important;
            color: ${colors.textMuted} !important;
            border-radius: 10px !important;
        }
        .converter-crop-theme .converter-upload-zone {
            background: ${colors.surface} !important;
            border: 2px dashed ${colors.border} !important;
            border-radius: 20px !important;
            box-shadow: ${colors.panelShadow};
            transition: all 0.25s ease;
        }
        .converter-crop-theme .converter-upload-zone:hover {
            border-color: ${colors.accent} !important;
            background: ${darkMode ? 'rgba(34, 211, 197, 0.06)' : 'rgba(24, 183, 170, 0.03)'} !important;
        }
    `}</style>
);
const ConverterUI = ({
    activeConverter,
    selectedFile,
    convertedFile,
    isConverting,
    previewUrl,
    darkMode,
    resizeWidth,
    resizeHeight,
    setResizeWidth,
    setResizeHeight,
    resizeMode,
    setResizeMode,
    resizePercentage,
    setResizePercentage,
    lockAspectRatio,
    setLockAspectRatio,
    resizeFormat,
    setResizeFormat,
    targetFileSize,
    setTargetFileSize,
    socialMediaPreset,
    setSocialMediaPreset,
    originalDimensions,
    setOriginalDimensions,
    handleResizeWidthChange,
    handleResizeHeightChange,
    fileInputRef,
    handleFileSelect,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleConvert,
    handleDownload,
    setSelectedFile,
    setPreviewUrl,
    setConvertedFile,
    customFileName,
    setCustomFileName,
    ffmpegLoading,
    watermarkText,
    setWatermarkText,
    watermarkPosition,
    setWatermarkPosition,
    watermarkFontSize,
    setWatermarkFontSize,
    watermarkOpacity,
    setWatermarkOpacity,
    watermarkColor,
    setWatermarkColor,
    brightness,
    setBrightness,
    contrast,
    setContrast,
    mirrorDirection,
    setMirrorDirection,
    sharpenIntensity,
    setSharpenIntensity,
    videoDuration,
    setVideoDuration,
    selectedTime,
    setSelectedTime,
    generatedThumbnails,
    setGeneratedThumbnails,
    gifTrimStart,
    setGifTrimStart,
    gifTrimEnd,
    setGifTrimEnd,
    gifWidth,
    setGifWidth,
    gifLoopCount,
    setGifLoopCount,
    gifPreserveTransparency,
    setGifPreserveTransparency,
    gifFPS,
    setGifFPS,
    gifCompression,
    setGifCompression,
    gifOptimizeBackground,
    setGifOptimizeBackground,
    converters,
    handleSetActiveConverter,
    conversionQuality,
    setConversionQuality,
    conversionProgress,
    handleImageEdit,
    editedFile,
    setEditedFile,
    currentStep,
    setCurrentStep,
    isEditing,
    setIsEditing,
    isViewOnly,
    initialDesignId,
    user
}) => {
    // State for live preview

    const C = getConverterTheme(darkMode);
    const to = activeConverter?.to;
    const currentToolDetails = activeConverter?.name ? toolDetails[activeConverter.name] : null;
    const toolHeading = currentToolDetails?.title || activeConverter?.name || 'Converter';
    const toolDescription = currentToolDetails?.description || (activeConverter
        ? `Convert your ${activeConverter.from?.toUpperCase?.() || 'source'} files to ${activeConverter.to?.toUpperCase?.() || 'the target format'} directly in your browser.`
        : 'Choose a tool to start converting files in your browser.');
    const toolSteps = (currentToolDetails?.steps?.length
        ? currentToolDetails.steps
        : [
            `Upload your ${activeConverter?.multiple ? 'files' : 'file'} to begin.`,
            `Adjust any available ${activeConverter?.name || 'converter'} options.`,
            'Convert and download the final result.'
        ]).slice(0, 3);
    const relatedToolNames = (currentToolDetails?.relatedTools || []).slice(0, 3).map((item) => item.name);
    const workspaceLabel = activeConverter?.from && activeConverter?.to
        ? `${String(activeConverter.from).toUpperCase()} TO ${String(activeConverter.to).toUpperCase()}`
        : 'PRIVATE BROWSER WORKSPACE';
    const theme = {
        border: 'border-purple-400',
        bgSecondary: 'bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50',
        accent: 'text-purple-500',
    };
    // State for live preview
    const [showComparison, setShowComparison] = useState(false);
    const [framePreviews, setFramePreviews] = useState([]);
    const videoRef = useRef(null);

    // Sync video preview with selected time
    useEffect(() => {
        const video = videoRef.current;
        if (video && previewUrl && to === 'thumbnail') {
            // Only update src if it changed
            if (video.getAttribute('data-src') !== previewUrl) {
                video.src = previewUrl;
                video.setAttribute('data-src', previewUrl);
            }

            const handleReady = () => {
                video.currentTime = selectedTime;
            };

            if (video.readyState >= 1) {
                video.currentTime = selectedTime;
            } else {
                video.addEventListener('loadedmetadata', handleReady);
            }

            const handleLoadedMetadata = () => {
                setVideoDuration(video.duration);
            };

            video.addEventListener('loadedmetadata', handleLoadedMetadata);
            return () => {
                video.removeEventListener('loadedmetadata', handleReady);
                video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            };
        }
    }, [previewUrl, selectedTime, to, setVideoDuration]);

    // Check for project ID in URL and auto-open editor
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('project')) {
            // Trigger edit mode with a placeholder file to bypass checks
            const dummyFile = new File([""], "Project", { type: "image/project" });
            setSelectedFile(dummyFile);
            setIsEditing(true);
        }
    }, [setSelectedFile, setIsEditing]);

    // Apply brightness/contrast to create live preview
    // Apply filter effects (Removed: livePreview state no longer used)







    // Generate frame previews for video thumbnail
    useEffect(() => {
        let isMounted = true;
        if (to === 'thumbnail' && previewUrl && selectedFile && videoDuration > 0) {
            const generateFrames = async () => {
                const video = document.createElement('video');
                video.src = previewUrl;
                video.muted = true;
                video.playsInline = true;
                video.crossOrigin = 'anonymous';

                await new Promise((resolve) => {
                    video.onloadedmetadata = resolve;
                    video.onerror = resolve; // Continue on error to allow cleanup
                });

                if (!isMounted) return;

                const frameCount = Math.min(10, Math.ceil(videoDuration)); // Max 10 frames for better performance
                const interval = (videoDuration - 0.5) / frameCount;
                const frames = [];

                for (let i = 0; i < frameCount; i++) {
                    if (!isMounted) break;
                    const time = Math.max(0.1, i * interval);
                    video.currentTime = time;

                    await new Promise((resolve) => {
                        const onSeeked = () => {
                            video.removeEventListener('seeked', onSeeked);
                            const canvas = document.createElement('canvas');
                            canvas.width = video.videoWidth / 4;
                            canvas.height = video.videoHeight / 4;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                            frames.push({
                                url: canvas.toDataURL('image/jpeg', 0.6),
                                time: time
                            });
                            resolve();
                        };
                        video.addEventListener('seeked', onSeeked);
                        // Add timeout for seeking
                        setTimeout(resolve, 2000);
                    });
                }

                if (isMounted) {
                    setFramePreviews(frames);
                }
            };

            generateFrames();
        }
        return () => { isMounted = false; };
    }, [previewUrl, selectedFile, to, videoDuration]);

    if (!activeConverter && !isEditing) {
        return (
            <>
                <ConverterFontLink colors={C} darkMode={darkMode} />
                <div
                    className="converter-crop-theme animate-fadeIn"
                    style={{ minHeight: '100vh', width: '100%', overflowX: 'hidden', background: `linear-gradient(180deg, ${C.pageStart} 0%, ${C.bg} 100%)` }}
                >
                    {/* <div style={{ borderBottom: `1px solid ${C.border}`, padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', gap: 12, background: C.glass, backdropFilter: 'blur(12px)' }}>
                        <div style={{ width: 28, height: 28, background: C.accent, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Scissors size={14} color={C.textOnAccent} />
                        </div>
                        <span className="brand-font" style={{ fontWeight: 700, fontSize: 17, color: C.text, letterSpacing: '-0.3px' }}>CropKit Studio</span>
                        <span style={{ marginLeft: 8, background: 'rgba(24, 183, 170, 0.12)', color: C.accent, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99 }}>PRO</span>
                    </div> */}
                    <div style={{ width: '100%', margin: '0 auto', padding: '72px 12px 40px', textAlign: 'center' }}>
                        <div className="converter-kicker" style={{ marginBottom: 28 }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.accent }} />
                            <span>Free • Private • No Upload</span>
                        </div>
                        <h1 className="converter-main-title" style={{ fontSize: 'clamp(36px, 7vw, 80px)', fontWeight: 800, lineHeight: 1.05, marginBottom: 20, background: `linear-gradient(135deg, ${C.text} 0%, #4d6b88 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Pro Image Toolkit<br />
                            <span style={{ background: `linear-gradient(90deg, ${C.accent}, #34a1ff)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Premium Converter Workspace.</span>
                        </h1>
                        <p style={{ fontSize: 18, color: C.textMuted, maxWidth: 640, margin: '0 auto 48px', lineHeight: 1.7, fontWeight: 300 }}>
                            The converter workspace features the same premium, professional design. Choose a tool from the menu and start private processing right in your browser.
                        </p>
                        <div
                            className="converter-upload-zone"
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            style={{ width: '100%', margin: '0 auto 48px', padding: '60px 24px', cursor: 'pointer' }}
                        >
                            <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(24, 183, 170, 0.08)', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(24, 183, 170, 0.22)' }}>
                                <Zap size={28} color={C.accent} />
                            </div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 8 }}>Select a converter from the menu</div>
                            <div style={{ fontSize: 14, color: C.textMuted }}>Use images, video, PDF and audio tools in the same calm, premium workspace</div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, textAlign: 'left', width: '100%', margin: '0 auto' }}>
                            {[
                                { icon: <Upload size={18} />, title: 'Clean Uploads', desc: 'Clear drag-and-drop hierarchy, just like the crop screen' },
                                { icon: <Settings size={18} />, title: 'Sharper Controls', desc: 'Panels and form inputs using the same visual language' },
                                { icon: <Shield size={18} />, title: 'Private Flow', desc: 'Existing browser-based functionality stays exactly the same' },
                            ].map((item) => (
                                <div key={item.title} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px 18px', boxShadow: C.cardShadow }}>
                                    <div style={{ color: C.accent, marginBottom: 10 }}>{item.icon}</div>
                                    <div style={{ fontWeight: 600, fontSize: 14, color: C.text, marginBottom: 4 }}>{item.title}</div>
                                    <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.5 }}>{item.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (!activeConverter && !isEditing && false) {
        return (
            <div className="text-center py-10 sm:py-16 md:py-20 animate-fadeIn">
                <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2 sm:mb-3 tracking-tight px-4`}>
                    Pro Image <span className="gradient-text">Toolkit</span>
                </h1>
                <p className={`text-lg sm:text-xl md:text-2xl ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2 sm:mb-3 font-medium px-4`}>Convert files instantly online</p>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-8 sm:mb-12 text-sm sm:text-base md:text-lg px-4`}>34+ tools • Browser processing • Sign in only for save/share</p>
                <div className="max-w-3xl mx-auto px-4">
                    <div
                        className={`${theme.border} ${theme.bgSecondary} rounded-xl sm:rounded-2xl p-8 sm:p-12 md:p-16 transition-all duration-500 cursor-pointer shadow-premium hover:shadow-premium-lg hover:scale-105 transform`}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        <Zap className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 ${theme.accent} mx-auto mb-4 sm:mb-6 animate-float`} />
                        <p className={`${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-3 sm:mb-4 text-base sm:text-lg md:text-xl font-bold`}>Select a converter from the menu</p>
                        <p className={`text-sm sm:text-base ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Convert images, videos, PDFs, audio and more in your browser</p>
                    </div>
                </div>
            </div>
        );
    }

    if (activeConverter?.to === 'crop') {
        return (
            <Suspense fallback={<div className="py-16 text-center text-sm text-slate-500">Loading crop workspace...</div>}>
                <CropImageTool darkMode={darkMode} />
            </Suspense>
        );
    }

    // const to = activeConverter.to;

    return (
        <>
            <ConverterFontLink colors={C} darkMode={darkMode} />
            <div
                className="converter-crop-theme animate-fadeIn"
                style={{ minHeight: '100vh', width: '100%', overflowX: 'hidden', background: `linear-gradient(180deg, ${C.pageStart} 0%, ${C.bg} 100%)` }}
            >
                <div className="text-center py-5 sm:py-7 md:py-8" style={{ width: '100%', paddingLeft: 8, paddingRight: 8 }}>
                    {!isConverting && (
                        <div className="mb-8 sm:mb-10">
                            <div className="converter-kicker mb-5">
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.accent }} />
                                <span>{workspaceLabel}</span>
                            </div>
                            <h1 className="converter-main-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 tracking-tight">
                                {toolHeading}
                            </h1>
                            <p style={{ color: C.textMuted, maxWidth: 860, margin: '0 auto', fontSize: 16, lineHeight: 1.7 }}>
                                {toolDescription}
                            </p>
                        </div>
                    )}
                    {/* <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6 sm:mb-8 text-base sm:text-lg md:text-xl font-medium`}>Convert {activeConverter.from.toUpperCase()} → {activeConverter.to.toUpperCase()}</p> */}

                    <div style={{ width: '100%', margin: '0 auto' }}>
                        {!isConverting && !convertedFile && to === 'brightness' && selectedFile && (
                            <div className={`converter-panel ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-2 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-premium`}>
                                <h3 className={`font-bold text-lg sm:text-xl mb-3 sm:mb-4 ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
                                    <Settings className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                    Adjust Brightness & Contrast
                                </h3>
                                <div className="mb-4">
                                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Brightness: {brightness}%</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="200"
                                        value={brightness}
                                        onChange={(e) => setBrightness(parseInt(e.target.value))}
                                        className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Contrast: {contrast}%</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="200"
                                        value={contrast}
                                        onChange={(e) => setContrast(parseInt(e.target.value))}
                                        className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                    />
                                </div>
                                <div className="flex gap-2 mb-4">
                                    <button
                                        onClick={() => { setBrightness(100); setContrast(100); }}
                                        className={`px-4 py-2 rounded-lg font-semibold text-sm ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} transition-all`}
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>
                        )}

                        {!isConverting && !convertedFile && to === 'watermark' && selectedFile && (
                            <div className={`converter-panel ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-2 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-premium`}>
                                <h3 className={`font-bold text-lg sm:text-xl mb-3 sm:mb-4 ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
                                    <Settings className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                    Customize Watermark
                                </h3>
                                <div className="mb-4">
                                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Watermark Text</label>
                                    <input
                                        type="text"
                                        value={watermarkText}
                                        onChange={(e) => setWatermarkText(e.target.value)}
                                        placeholder="Enter watermark text"
                                        className={`w-full p-3 rounded-lg border-2 ${darkMode ? 'bg-gray-700 text-white border-gray-600 focus:border-purple-500' : 'border-gray-300 focus:border-purple-500'} focus:outline-none transition-all font-medium`}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Position</label>
                                    <select
                                        value={watermarkPosition}
                                        onChange={(e) => setWatermarkPosition(e.target.value)}
                                        className={`w-full p-3 rounded-lg border-2 ${darkMode ? 'bg-gray-700 text-white border-gray-600 focus:border-purple-500' : 'border-gray-300 focus:border-purple-500'} focus:outline-none transition-all font-medium`}
                                    >
                                        <option value="top-left">Top Left</option>
                                        <option value="top-right">Top Right</option>
                                        <option value="bottom-left">Bottom Left</option>
                                        <option value="bottom-right">Bottom Right</option>
                                        <option value="center">Center</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Font Size: {watermarkFontSize}px</label>
                                        <input type="range" min="10" max="100" value={watermarkFontSize} onChange={(e) => setWatermarkFontSize(parseInt(e.target.value))} className="w-full" />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Opacity: {Math.round(watermarkOpacity * 100)}%</label>
                                        <input type="range" min="0" max="1" step="0.1" value={watermarkOpacity} onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))} className="w-full" />
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Color</label>
                                    <div className="flex items-center gap-3">
                                        <input type="color" value={watermarkColor} onChange={(e) => setWatermarkColor(e.target.value)} className="h-12 w-20 rounded-lg cursor-pointer border-2 border-gray-300" />
                                        <input type="text" value={watermarkColor} onChange={(e) => setWatermarkColor(e.target.value)} className={`flex-1 p-3 rounded-lg border-2 ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'} focus:outline-none font-mono`} />
                                    </div>
                                </div>
                                <div className={`${darkMode ? 'bg-gray-700/50' : 'bg-gradient-to-r from-purple-50 to-blue-50'} rounded-lg p-4 border-2 ${darkMode ? 'border-gray-600' : 'border-purple-200'}`}>
                                    <p className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Preview:</p>
                                    <div className="relative bg-gray-900 rounded-lg h-32 flex items-center justify-center overflow-hidden">
                                        <span
                                            style={{
                                                fontSize: `${watermarkFontSize * 0.5}px`,
                                                color: watermarkColor,
                                                opacity: watermarkOpacity,
                                                fontWeight: 'bold',
                                                position: 'absolute',
                                                ...(watermarkPosition === 'top-left' && { top: '10px', left: '10px' }),
                                                ...(watermarkPosition === 'top-right' && { top: '10px', right: '10px' }),
                                                ...(watermarkPosition === 'bottom-left' && { bottom: '10px', left: '10px' }),
                                                ...(watermarkPosition === 'bottom-right' && { bottom: '10px', right: '10px' }),
                                                ...(watermarkPosition === 'center' && { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' })
                                            }}
                                        >
                                            {watermarkText || 'Your Watermark'}
                                        </span>
                                        <span className="text-gray-500 text-sm">Sample Image</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!isConverting && !convertedFile && to === 'mirror' && selectedFile && (
                            <div className={`converter-panel ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-2 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-premium`}>
                                <h3 className={`font-bold text-lg sm:text-xl mb-3 sm:mb-4 ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
                                    <Settings className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                    Mirror Direction
                                </h3>
                                <div className="mb-4">
                                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Select Mirror Type</label>
                                    <select
                                        value={mirrorDirection}
                                        onChange={(e) => setMirrorDirection(e.target.value)}
                                        className={`w-full p-3 rounded-lg border-2 ${darkMode ? 'bg-gray-700 text-white border-gray-600 focus:border-purple-500' : 'border-gray-300 focus:border-purple-500'} focus:outline-none transition-all font-medium`}
                                    >
                                        <option value="horizontal">Horizontal (Flip Left-to-Right)</option>
                                        <option value="vertical">Vertical (Flip Top-to-Bottom)</option>
                                    </select>
                                </div>
                                <div className={`${darkMode ? 'bg-gray-700/50' : 'bg-gradient-to-r from-purple-50 to-blue-50'} rounded-lg p-4 border-2 ${darkMode ? 'border-gray-600' : 'border-purple-200'}`}>
                                    <p className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Preview:</p>
                                    <div className="flex items-center justify-center space-x-4">
                                        <div className="text-4xl"></div>
                                        <svg className={`w-8 h-8 ${darkMode ? 'text-purple-400' : 'text-purple-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                        <div className="text-4xl" style={{ transform: mirrorDirection === 'horizontal' ? 'scaleX(-1)' : 'scaleY(-1)' }}></div>
                                    </div>
                                    <p className={`text-xs mt-2 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {mirrorDirection === 'horizontal' ? 'Left  Right' : 'Top  Bottom'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {!isConverting && !convertedFile && to === 'sharpen' && selectedFile && (
                            <div className={`converter-panel ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-2 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-premium`}>
                                <h3 className={`font-bold text-lg sm:text-xl mb-3 sm:mb-4 ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
                                    <Settings className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                    Sharpen Intensity
                                </h3>
                                <div className="mb-4">
                                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Intensity: {sharpenIntensity.toFixed(1)}</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="2"
                                        step="0.1"
                                        value={sharpenIntensity}
                                        onChange={(e) => setSharpenIntensity(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                    />
                                    <div className="flex justify-between text-xs mt-1">
                                        <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Soft</span>
                                        <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Strong</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 mb-4">
                                    <button
                                        onClick={() => setSharpenIntensity(1)}
                                        className={`px-4 py-2 rounded-lg font-semibold text-sm ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} transition-all`}
                                    >
                                        Reset
                                    </button>
                                    <button
                                        onClick={() => setShowComparison(!showComparison)}
                                        className={`px-4 py-2 rounded-lg font-semibold text-sm ${showComparison ? 'bg-purple-600 text-white' : darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} transition-all`}
                                    >
                                        {showComparison ? '✓ Compare' : 'Compare Before/After'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {!isConverting && !convertedFile && (to === 'blur' || to === 'grayscale') && selectedFile && (
                            <div className={`converter-panel ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-2 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-premium`}>
                                <button
                                    onClick={() => setShowComparison(!showComparison)}
                                    className={`w-full px-4 py-3 rounded-lg font-semibold text-sm ${showComparison ? 'bg-purple-600 text-white' : darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} transition-all`}
                                >
                                    {showComparison ? '✓ Comparing Before/After' : 'Show Before/After Comparison'}
                                </button>
                            </div>
                        )}

                        {/* Video Thumbnail Extractor UI */}
                        {!isConverting && !convertedFile && to === 'thumbnail' && previewUrl && selectedFile && (
                            <div className="space-y-6">
                                {/* Frame Selection Section */}
                                <div className={`converter-panel ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-2 rounded-xl p-6 shadow-premium`}>
                                    <h3 className={`font-bold text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
                                        <Settings className="w-5 h-5 mr-2" />
                                        Select Frame
                                    </h3>

                                    {/* Time Slider */}
                                    <div className="mb-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className={`text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                                Time: {selectedTime.toFixed(2)}s
                                            </label>
                                            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                ({selectedTime.toFixed(2)} / {videoDuration.toFixed(2)}s)
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max={videoDuration || 1}
                                            step="0.1"
                                            value={selectedTime}
                                            onChange={(e) => setSelectedTime(parseFloat(e.target.value))}
                                            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                            disabled={!videoDuration}
                                        />
                                    </div>

                                    {/* Frame Preview Strip */}
                                    {framePreviews.length > 0 && (
                                        <div className="mb-4">
                                            <p className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                                Video Frames - Click to select
                                            </p>
                                            <div className="relative">
                                                <div className="flex gap-2 overflow-x-auto pb-2 scroll-smooth" style={{ scrollbarWidth: 'thin' }}>
                                                    {framePreviews.map((frame, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => setSelectedTime(frame.time)}
                                                            className={`flex-shrink-0 relative rounded-lg border-2 transition-all hover:scale-105 ${Math.abs(selectedTime - frame.time) < 0.2
                                                                ? 'border-purple-500 shadow-lg'
                                                                : darkMode
                                                                    ? 'border-gray-600 hover:border-purple-400'
                                                                    : 'border-gray-300 hover:border-purple-400'
                                                                }`}
                                                        >
                                                            <img
                                                                src={frame.url}
                                                                alt={`Frame at ${frame.time.toFixed(2)}s`}
                                                                className="w-24 h-16 object-cover rounded-md"
                                                            />
                                                            <div className={`absolute bottom-0 left-0 right-0 ${darkMode ? 'bg-black/70' : 'bg-white/70'} backdrop-blur-sm px-1 py-0.5 rounded-b-md`}>
                                                                <p className={`text-xs font-bold text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                                    {frame.time.toFixed(1)}s
                                                                </p>
                                                            </div>
                                                            {Math.abs(selectedTime - frame.time) < 0.2 && (
                                                                <div className="absolute top-1 right-1 bg-purple-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                                                    ✓
                                                                </div>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-gray-900/20 to-transparent pointer-events-none" />
                                                <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-gray-900/20 to-transparent pointer-events-none" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Current Frame Preview */}
                                    <div className={`${darkMode ? 'bg-gray-700/50' : 'bg-gradient-to-r from-purple-50 to-blue-50'} rounded-xl p-4 border-2 ${darkMode ? 'border-gray-600' : 'border-purple-200'}`}>
                                        <p className={`text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Current Frame Preview
                                        </p>
                                        <video
                                            ref={videoRef}
                                            className="w-full max-h-64 rounded-lg border-2 border-purple-500 shadow-lg"
                                            muted
                                            playsInline
                                        />
                                    </div>

                                    {/* Generate Button */}
                                    <button
                                        onClick={handleConvert}
                                        disabled={isConverting}
                                        className={`converter-primary-button w-full mt-4 ${darkMode ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' : 'bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700'} disabled:from-gray-400 disabled:to-gray-400 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all shadow-premium hover:shadow-premium-lg hover:scale-105 transform`}
                                    >
                                        {isConverting ? 'Generating...' : '📸 Generate Thumbnail from Current Frame'}
                                    </button>
                                </div>

                                {/* Generated Thumbnails */}
                                {generatedThumbnails.length > 0 && (
                                    <div className={`converter-panel ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-2 rounded-xl p-6 shadow-premium`}>
                                        <h3 className={`font-bold text-xl mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                            Generated Thumbnails ({generatedThumbnails.length})
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {generatedThumbnails.map((thumb, index) => (
                                                <div key={index} className={`${darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200'} border-2 rounded-xl p-4 shadow-lg hover:scale-105 transition-all`}>
                                                    <img
                                                        src={thumb.url}
                                                        alt={`Thumbnail ${index + 1}`}
                                                        className="w-full rounded-lg border-2 border-purple-400 mb-3 shadow-md"
                                                    />
                                                    <p className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                                        Time: {thumb.time.toFixed(2)}s
                                                    </p>
                                                    <button
                                                        onClick={() => {
                                                            const a = document.createElement('a');
                                                            a.href = thumb.url;
                                                            a.download = thumb.name;
                                                            a.click();
                                                        }}
                                                        className={`w-full ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center justify-center transition-all shadow-md hover:shadow-lg`}
                                                    >
                                                        <Download className="w-4 h-4 mr-2" />
                                                        Download
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => setGeneratedThumbnails([])}
                                            className={`w-full mt-4 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${darkMode ? 'text-white' : 'text-gray-700'} px-4 py-2 rounded-lg font-semibold transition-all`}
                                        >
                                            Clear All Thumbnails
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Video to GIF Options */}
                        {!isConverting && !convertedFile && (to === 'gif' && activeConverter?.from === 'video') && !selectedFile && (
                            <div className="space-y-4 mb-6">
                                <div className={`converter-panel ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-2 rounded-xl p-6 shadow-premium`}>
                                    <h3 className={`font-bold text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
                                        <Settings className="w-5 h-5 mr-2" />
                                        GIF Options
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className={`text-sm font-semibold mb-2 block ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Trim start </label>
                                            <div className="flex gap-2">
                                                <input type="number" value={gifTrimStart} onChange={(e) => setGifTrimStart(parseFloat(e.target.value) || 0)} placeholder="0" className={`flex-1 p-3 rounded-lg border-2 ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'} focus:outline-none font-medium`} />
                                                <button className={`px-4 py-3 rounded-lg font-semibold text-sm ${darkMode ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-purple-500 hover:bg-purple-600 text-white'} transition-all`}>Copy Player Time</button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className={`text-sm font-semibold mb-2 block ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Trim end </label>
                                            <div className="flex gap-2">
                                                <input type="number" value={gifTrimEnd} onChange={(e) => setGifTrimEnd(parseFloat(e.target.value) || 0)} placeholder="0" className={`flex-1 p-3 rounded-lg border-2 ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'} focus:outline-none font-medium`} />
                                                <button className={`px-4 py-3 rounded-lg font-semibold text-sm ${darkMode ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-purple-500 hover:bg-purple-600 text-white'} transition-all`}>Copy Player Time</button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Width (px)</label>
                                            <input type="number" value={gifWidth} onChange={(e) => setGifWidth(parseInt(e.target.value) || 480)} placeholder="480" className={`w-full p-3 rounded-lg border-2 ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'} focus:outline-none font-semibold`} />
                                            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Enter GIF width in pixels (0-10000)</p>
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Loop Count</label>
                                            <input type="number" value={gifLoopCount} onChange={(e) => setGifLoopCount(parseInt(e.target.value) || 0)} placeholder="0" className={`w-full p-3 rounded-lg border-2 ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'} focus:outline-none font-semibold`} />
                                            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Enter Loop count (0-10000). Leave empty (0) to loop infinitely.</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <label className="flex items-center cursor-pointer">
                                                <input type="checkbox" checked={gifPreserveTransparency} onChange={(e) => setGifPreserveTransparency(e.target.checked)} className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded" />
                                                <span className={`ml-2 text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Preserve transparency (transparent video to transparent GIF)</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className={`converter-panel ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-2 rounded-xl p-6 shadow-premium`}>
                                    <h3 className={`font-bold text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
                                        <Zap className="w-5 h-5 mr-2" />
                                        Optimize GIF
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>FPS</label>
                                            <select value={gifFPS} onChange={(e) => setGifFPS(parseInt(e.target.value))} className={`w-full p-3 rounded-lg border-2 ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'} focus:outline-none font-semibold`}>
                                                {[5, 10, 15, 20, 25, 30, 60].map(fps => (<option key={fps} value={fps}>{fps}</option>))}
                                            </select>
                                            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Higher FPS (Frames Per Second) produce a smoother animation. It is recommended.</p>
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Compression</label>
                                            <div className="flex items-center gap-4 mb-2">
                                                <input type="range" min="0" max="100" value={gifCompression} onChange={(e) => setGifCompression(parseInt(e.target.value))} className="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                                                <span className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{gifCompression}</span>
                                            </div>
                                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Applied level of compression. Default (10) is a good balance between compression & quality. Higher values compress more.</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <label className="flex items-center cursor-pointer">
                                                <input type="checkbox" checked={gifOptimizeBackground} onChange={(e) => setGifOptimizeBackground(e.target.checked)} className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded" />
                                                <span className={`ml-2 text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Optimize for static background (when most colors in moving parts of the image)</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="mt-6">
                                        <button onClick={() => { setGifTrimStart(0); setGifTrimEnd(0); setGifWidth(480); setGifLoopCount(0); setGifPreserveTransparency(false); setGifFPS(15); setGifCompression(10); setGifOptimizeBackground(false); }} className={`w-full px-4 py-3 rounded-lg font-semibold text-sm ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} transition-all shadow-md flex items-center justify-center gap-2`}>
                                            <Settings className="w-4 h-4" />
                                            Reset all options
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}



                        {!selectedFile && !convertedFile && (
                            <div className="w-full mb-10">
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onDragEnter={handleDragEnter}
                                    className="converter-upload-zone relative group cursor-pointer text-center"
                                    style={{ width: '100%', margin: '0 auto', padding: '56px 20px' }}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        accept={activeConverter?.accept}
                                        multiple={activeConverter?.multiple}
                                        className="hidden"
                                    />
                                    <div className="flex flex-col items-center">
                                        <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(24, 183, 170, 0.08)', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(24, 183, 170, 0.22)' }}>
                                            <Upload className="w-8 h-8" style={{ color: C.accent }} />
                                        </div>
                                        <p className="brand-font" style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 800, color: C.text, letterSpacing: '-1px', marginBottom: 10 }}>
                                            {activeConverter ? `Drop your ${activeConverter.multiple ? 'files' : 'file'} here` : 'Select a tool to begin'}
                                        </p>
                                        <p style={{ fontSize: 15, color: C.textMuted, maxWidth: 760, margin: '0 auto 20px', lineHeight: 1.7 }}>
                                            {toolDescription}
                                        </p>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, width: '100%', maxWidth: 1240, margin: '0 auto 18px' }}>
                                            {toolSteps.map((step, index) => (
                                                <div key={`${step}-${index}`} style={{ background: C.surfaceHover, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px', textAlign: 'left' }}>
                                                    <div style={{ color: C.accent, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                                                        Step {index + 1}
                                                    </div>
                                                    <div style={{ color: C.text, fontSize: 14, lineHeight: 1.55, fontWeight: 500 }}>
                                                        {step}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
                                            {(relatedToolNames.length ? relatedToolNames : ['Max size: 2GB', 'Secure & Private', activeConverter?.accept || 'Browser Processing']).map((label) => (
                                                <div key={label} style={{ padding: '8px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: label === (activeConverter?.accept || 'Browser Processing') ? 'rgba(24, 183, 170, 0.08)' : C.surfaceHover, border: label === (activeConverter?.accept || 'Browser Processing') ? '1px solid rgba(24, 183, 170, 0.18)' : `1px solid ${C.border}`, color: label === (activeConverter?.accept || 'Browser Processing') ? C.accent : C.textMuted }}>
                                                    {label}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!isConverting && to === 'resize' && !convertedFile && (
                            <div className="space-y-4 mb-6">
                                {/* Tab Navigation */}
                                <div className={`converter-panel ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-2 rounded-xl overflow-hidden shadow-premium`}>
                                    <div className="flex border-b border-gray-700">
                                        <button
                                            onClick={() => setResizeMode('bySize')}
                                            className={`flex-1 py-3 px-4 font-semibold text-sm transition-all ${resizeMode === 'bySize'
                                                ? darkMode
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-purple-500 text-white'
                                                : darkMode
                                                    ? 'bg-gray-900 text-gray-400 hover:bg-gray-800'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            By Size
                                        </button>
                                        <button
                                            onClick={() => setResizeMode('byPercentage')}
                                            className={`flex-1 py-3 px-4 font-semibold text-sm transition-all ${resizeMode === 'byPercentage'
                                                ? darkMode
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-purple-500 text-white'
                                                : darkMode
                                                    ? 'bg-gray-900 text-gray-400 hover:bg-gray-800'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            At Percentage
                                        </button>
                                        <button
                                            onClick={() => setResizeMode('socialMedia')}
                                            className={`flex-1 py-3 px-4 font-semibold text-sm transition-all ${resizeMode === 'socialMedia'
                                                ? darkMode
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-purple-500 text-white'
                                                : darkMode
                                                    ? 'bg-gray-900 text-gray-400 hover:bg-gray-800'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            Social Media
                                        </button>
                                    </div>

                                    {/* Tab Content */}
                                    <div className="p-6">
                                        {/* By Size Tab */}
                                        {resizeMode === 'bySize' && (
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <label className="flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={lockAspectRatio}
                                                            onChange={(e) => setLockAspectRatio(e.target.checked)}
                                                            className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                                                        />
                                                        <span className={`ml-2 text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>

                                                            Lock Aspect Ratio
                                                        </span>
                                                    </label>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                                            Width
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={resizeWidth}
                                                            onChange={(e) => handleResizeWidthChange(parseInt(e.target.value) || 0)}
                                                            placeholder="Enter Width"
                                                            className={`w-full p-3 rounded-lg border-2 ${darkMode
                                                                ? 'bg-gray-700 text-white border-gray-600 focus:border-purple-500'
                                                                : 'border-gray-300 focus:border-purple-500'
                                                                } focus:outline-none font-semibold`}
                                                        />
                                                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>px</p>
                                                    </div>
                                                    <div>
                                                        <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                                            Height
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={resizeHeight}
                                                            onChange={(e) => handleResizeHeightChange(parseInt(e.target.value) || 0)}
                                                            placeholder="Enter Height"
                                                            className={`w-full p-3 rounded-lg border-2 ${darkMode
                                                                ? 'bg-gray-700 text-white border-gray-600 focus:border-purple-500'
                                                                : 'border-gray-300 focus:border-purple-500'
                                                                } focus:outline-none font-semibold`}
                                                        />
                                                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>px</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* At Percentage Tab */}
                                        {resizeMode === 'byPercentage' && (
                                            <div className="space-y-4">
                                                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                                    Resize Percentage: {resizePercentage}%
                                                </label>
                                                <input
                                                    type="range"
                                                    min="1"
                                                    max="200"
                                                    value={resizePercentage}
                                                    onChange={(e) => setResizePercentage(parseInt(e.target.value))}
                                                    className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                                />
                                                <div className="flex justify-between text-xs">
                                                    <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>1%</span>
                                                    <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>200%</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Social Media Tab */}
                                        {resizeMode === 'socialMedia' && (
                                            <div className="space-y-3">
                                                <p className={`text-sm font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                                    Select Preset:
                                                </p>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {[
                                                        { id: 'instagram-post', label: 'Instagram Post', size: '1080 x 1080' },
                                                        { id: 'instagram-story', label: 'Instagram Story', size: '1080 x 1920' },
                                                        { id: 'facebook-cover', label: 'Facebook Cover', size: '820 x 312' },
                                                        { id: 'twitter-post', label: 'Twitter Post', size: '1200 x 675' },
                                                        { id: 'youtube-thumbnail', label: 'YouTube Thumbnail', size: '1280 x 720' },
                                                    ].map((preset) => (
                                                        <button
                                                            key={preset.id}
                                                            onClick={() => setSocialMediaPreset(preset.id)}
                                                            className={`p-3 rounded-lg text-left transition-all ${socialMediaPreset === preset.id
                                                                ? 'bg-purple-600 text-white shadow-lg'
                                                                : darkMode
                                                                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                                }`}
                                                        >
                                                            <div className="flex justify-between items-center">
                                                                <span className="font-semibold text-sm">{preset.label}</span>
                                                                <span className="text-xs opacity-75">{preset.size}</span>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Export Settings */}
                                <div className={`converter-panel ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-2 rounded-xl p-6 shadow-premium`}>
                                    <h3 className={`font-bold text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
                                        <Settings className="w-5 h-5 mr-2" />
                                        Export Settings
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                                Target File Size (optional)
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    value={targetFileSize}
                                                    onChange={(e) => setTargetFileSize(e.target.value)}
                                                    placeholder="Set a target output file size. Only works for JPG files"
                                                    className={`flex-1 p-3 rounded-lg border-2 ${darkMode
                                                        ? 'bg-gray-700 text-white border-gray-600 focus:border-purple-500'
                                                        : 'border-gray-300 focus:border-purple-500'
                                                        } focus:outline-none font-medium text-sm`}
                                                />
                                                <select
                                                    className={`p-3 rounded-lg border-2 ${darkMode
                                                        ? 'bg-gray-700 text-white border-gray-600'
                                                        : 'border-gray-300'
                                                        } font-semibold`}
                                                    value="KB"
                                                    disabled
                                                >
                                                    <option>KB</option>
                                                </select>
                                            </div>
                                            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                Set a hard output file size. Only works with JPG files
                                            </p>
                                        </div>

                                        <div>
                                            <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                                Save Image As
                                            </label>
                                            <select
                                                value={resizeFormat}
                                                onChange={(e) => setResizeFormat(e.target.value)}
                                                className={`w-full p-3 rounded-lg border-2 ${darkMode
                                                    ? 'bg-gray-700 text-white border-gray-600 focus:border-purple-500'
                                                    : 'border-gray-300 focus:border-purple-500'
                                                    } focus:outline-none font-semibold`}
                                            >
                                                <option value="original">Original</option>
                                                <option value="jpg">JPG</option>
                                                <option value="png">PNG</option>
                                                <option value="webp">WEBP</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedFile && !convertedFile && isEditing && (
                            <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center text-sm text-slate-500">Loading editor workspace...</div>}>
                                <ImageEditor
                                    file={selectedFile}
                                    onApply={handleImageEdit}
                                    onCancel={() => {
                                        setEditedFile(null);
                                        setIsEditing(false);
                                    }}
                                    darkMode={darkMode}
                                    isViewOnly={isViewOnly}
                                    initialDesignId={initialDesignId}
                                    user={user}
                                />
                            </Suspense>
                        )}

                        {selectedFile && !convertedFile && !isEditing && (
                            <div className={`converter-panel ${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-2 rounded-2xl p-5 shadow-premium animate-scaleIn`}>
                                {isConverting && (
                                    <div className={`${darkMode ? 'bg-gray-700/30' : 'bg-purple-50/50'} rounded-xl p-3 mb-6 flex items-center justify-between animate-pulse-soft border ${darkMode ? 'border-purple-500/20' : 'border-purple-100'}`}>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                                                <Zap className="w-4 h-4 text-white animate-pulse" />
                                            </div>
                                            <div className="text-left">
                                                <p className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>Processing File</p>
                                                <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'} truncate max-w-[150px] sm:max-w-xs`}>{Array.isArray(selectedFile) ? `${selectedFile.length} files` : selectedFile.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                                        </div>
                                    </div>
                                )}
                                {!isConverting && (
                                    <div className={`flex items-center justify-between mb-6 p-5 ${darkMode ? 'bg-gray-700/50' : 'bg-gradient-to-r from-purple-50 to-blue-50'} rounded-xl`}>
                                        <div className="flex items-center">
                                            <div className={`w-16 h-16 ${darkMode ? 'bg-purple-900/50' : 'bg-purple-100'} rounded-xl flex items-center justify-center mr-4 shadow-lg`}>
                                                <FileText className={`w-9 h-9 ${darkMode ? 'text-purple-400' : 'text-purple-500'}`} />
                                            </div>
                                            <div className="text-left">
                                                <p className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{Array.isArray(selectedFile) ? `${selectedFile.length} files` : (editedFile ? `Edited: ${selectedFile.name}` : selectedFile.name)}</p>
                                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-medium`}>{Array.isArray(selectedFile) ? '' : (selectedFile.size / 1024 / 1024).toFixed(2) + ' MB'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {!isEditing && selectedFile.type?.startsWith('image/') && (
                                                <button
                                                    onClick={() => setIsEditing(true)}
                                                    className={`converter-primary-button ${darkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'} text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold transition-all shadow-lg hover:shadow-purple-500/20 active:scale-95 transform`}
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                    <span>Edit Design</span>
                                                </button>
                                            )}
                                            <button onClick={() => { setSelectedFile(null); setPreviewUrl(null); }} className={`${darkMode ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'} transition-all p-2 rounded-lg`}><X className="w-6 h-6" /></button>
                                        </div>
                                    </div>
                                )}

                                {isConverting ? (
                                    <div className="flex flex-col items-center justify-center py-8 animate-fadeIn">
                                        <div className="relative flex flex-col items-center w-full">
                                            {/* Premium Progress Indicator Container */}
                                            <div className="relative flex flex-col items-center w-full max-w-sm">
                                                {/* Circular Progress with Glow */}
                                                <div className="relative w-44 h-44 sm:w-48 sm:h-48 mb-8 animate-scaleIn">
                                                    {/* Outer Glow Ring */}
                                                    <div className={`absolute inset-0 rounded-full blur-2xl opacity-20 ${conversionProgress === 100 ? 'bg-green-500' : 'bg-purple-500'} transition-all duration-1000`}></div>

                                                    <svg className="w-full h-full transform -rotate-90 relative z-10">
                                                        {/* Track Circle */}
                                                        <circle
                                                            cx="50%"
                                                            cy="50%"
                                                            r="42%"
                                                            className={`${darkMode ? 'stroke-gray-800' : 'stroke-gray-100'} fill-none stroke-[2]`}
                                                        />
                                                        {/* Progress Circle Fill (Background) */}
                                                        <circle
                                                            cx="50%"
                                                            cy="50%"
                                                            r="42%"
                                                            style={{
                                                                transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                                            }}
                                                            className={`${conversionProgress === 100 ? 'fill-green-600/10' : 'fill-purple-600/5'} stroke-none`}
                                                        />
                                                        {/* Main Progress Stroke */}
                                                        <circle
                                                            cx="50%"
                                                            cy="50%"
                                                            r="42%"
                                                            style={{
                                                                strokeDasharray: '264',
                                                                strokeDashoffset: 264 - (264 * conversionProgress) / 100,
                                                                transition: 'stroke-dashoffset 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                                            }}
                                                            stroke="currentColor"
                                                            className={`fill-none stroke-[6] stroke-round ${conversionProgress === 100 ? 'text-green-500' : 'text-purple-600'} drop-shadow-[0_0_8px_rgba(147,51,234,0.3)]`}
                                                        />
                                                    </svg>

                                                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                                                        <div className="flex items-baseline gap-0.5">
                                                            <span className={`text-5xl sm:text-6xl font-black ${conversionProgress === 100 ? (darkMode ? 'text-green-400' : 'text-green-600') : darkMode ? 'text-white' : 'text-gray-900'} tracking-tighter tabular-nums transition-all duration-500 animate-slideUp`}>
                                                                {conversionProgress}
                                                            </span>
                                                            <span className={`text-xl font-bold ${conversionProgress === 100 ? (darkMode ? 'text-green-400' : 'text-green-600') : darkMode ? 'text-gray-400' : 'text-gray-400'}`}>%</span>
                                                        </div>
                                                        <div className={`flex items-center gap-2 mt-2 px-4 py-1 rounded-full ${conversionProgress === 100 ? 'bg-green-500/10 text-green-500' : 'bg-purple-500/10 text-purple-500'} transition-all duration-500`}>
                                                            {conversionProgress === 100 ? (
                                                                <CheckCircle className="w-4 h-4 animate-bounce" />
                                                            ) : (
                                                                <div className="w-2 h-2 rounded-full bg-current animate-ping" />
                                                            )}
                                                            <span className="text-[11px] font-bold uppercase tracking-[0.2em]">
                                                                {conversionProgress === 100 ? 'Ready' : 'In Progress'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Linear "Slider" Progress Feel */}
                                                <div className="w-full px-6 animate-slideUp" style={{ animationDelay: '200ms' }}>
                                                    <div className="flex justify-between items-center mb-3">
                                                        <span className={`text-[11px] font-bold uppercase tracking-widest ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            Quality Engine v2.0
                                                        </span>
                                                        <span className={`text-[11px] font-black italic ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                                                            {conversionProgress < 30 ? 'Initializing...' : conversionProgress < 70 ? 'Optimizing Buffers...' : conversionProgress < 99 ? 'Finalizing Data...' : 'Success!'}
                                                        </span>
                                                    </div>
                                                    <div className={`relative h-2.5 w-full rounded-full ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} overflow-hidden shadow-inner`}>
                                                        <div
                                                            className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1) ${conversionProgress === 100 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-purple-600 via-blue-500 to-indigo-600'}`}
                                                            style={{ width: `${conversionProgress}%` }}
                                                        >
                                                            {/* Animated Shimmer on the progress bar */}
                                                            <div className="absolute top-0 left-0 h-full w-24 bg-white/20 -skew-x-12 animate-[shimmer_2s_infinite]"></div>
                                                        </div>
                                                    </div>
                                                    <p className={`mt-4 text-center text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} animate-pulse`}>
                                                        Estimated time: <span className="text-purple-500">~2 seconds</span>
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Status Info */}
                                            <div className="text-center mt-8 animate-slideUp" style={{ animationDelay: '400ms' }}>
                                                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                                                    {conversionProgress < 100 ? 'Processing your assets...' : 'Project Optimized!'}
                                                </h3>
                                                <p className={`text-[11px] font-medium ${darkMode ? 'text-gray-500' : 'text-gray-400'} max-w-[240px] mx-auto`}>
                                                    Local edge processing ensures maximum security and speed.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleConvert}
                                        disabled={isConverting || ffmpegLoading}
                                        className={`converter-primary-button w-full relative overflow-hidden ${darkMode ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' : 'bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700'} disabled:from-gray-400 disabled:to-gray-400 text-white px-4 sm:px-6 py-4 sm:py-5 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg md:text-xl transition-all duration-300 shadow-premium hover:shadow-premium-lg hover:scale-[1.02] active:scale-95 transform`}
                                    >
                                        {ffmpegLoading ? (
                                            <div className="flex items-center justify-center space-x-3">
                                                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Loading Converter...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center space-x-2">
                                                <Zap className="w-6 h-6 fill-current" />
                                                <span>Convert Now</span>
                                            </div>
                                        )}
                                    </button>
                                )}
                            </div>
                        )}

                        {
                            convertedFile && (
                                <div className={`converter-panel ${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-green-500/30' : 'bg-white border-green-200'} border-2 rounded-2xl p-6 sm:p-8 shadow-premium-lg animate-scaleIn`}>
                                    <div className={`w-16 h-16 sm:w-20 sm:h-20 ${darkMode ? 'bg-gradient-to-br from-green-900 to-green-800' : 'bg-gradient-to-br from-green-100 to-emerald-100'} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-scaleIn`}>
                                        <CheckCircle className={`w-10 h-10 sm:w-12 sm:h-12 ${darkMode ? 'text-green-400' : 'text-green-500'} animate-pulse-soft`} />
                                    </div>
                                    <h3 className={`text-2xl sm:text-3xl font-extrabold ${darkMode ? 'text-white' : 'text-gray-900'} mb-1 tracking-tight`}>✅ Conversion Complete!</h3>
                                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-6 text-base font-medium`}>Your file is ready to download</p>

                                    <div className={`${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} border-2 rounded-xl p-4 mb-6 flex items-center justify-between group hover:border-green-500/50 transition-all`}>
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-12 h-12 ${darkMode ? 'bg-green-900/30' : 'bg-green-50'} rounded-lg flex items-center justify-center`}>
                                                <FileText className={`w-6 h-6 ${darkMode ? 'text-green-400' : 'text-green-500'}`} />
                                            </div>
                                            <div className="text-left">
                                                <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'} truncate max-w-[180px] sm:max-w-xs`}>
                                                    {customFileName || convertedFile.name}
                                                </p>
                                                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} font-bold uppercase tracking-wider`}>
                                                    {convertedFile.type?.split('/')[1] || activeConverter?.to?.toUpperCase() || 'FILE'} • {(convertedFile.blob?.size / 1024).toFixed(1)} KB
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${darkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-600'}`}>
                                            READY
                                        </div>
                                    </div>
                                    {convertedFile.originalSize && convertedFile.compressedSize && (
                                        <div className={`${darkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-500'} border-l-4 p-5 mb-6 rounded-lg`}>
                                            <p className={`text-base ${darkMode ? 'text-gray-200' : 'text-gray-700'} font-semibold`}> Compression: <span className="font-bold text-blue-500">{((1 - convertedFile.compressedSize / convertedFile.originalSize) * 100).toFixed(1)}%</span> smaller</p>
                                        </div>
                                    )}

                                    {/* Resize Results Table */}
                                    {convertedFile.newWidth && convertedFile.newHeight && to === 'resize' && (
                                        <div className={`${darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200'} border-2 rounded-xl p-6 mb-6`}>
                                            <h4 className={`font-bold text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}> Resize Results</h4>
                                            <div className="overflow-x-auto">
                                                <table className={`w-full text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                                    <thead>
                                                        <tr className={`border-b-2 ${darkMode ? 'border-gray-600' : 'border-purple-300'}`}>
                                                            <th className="py-3 px-4 text-left font-bold">File Name</th>
                                                            <th className="py-3 px-4 text-center font-bold">Original (px)</th>
                                                            <th className="py-3 px-4 text-center font-bold">New (px)</th>
                                                            <th className="py-3 px-4 text-center font-bold">New Size</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr className={`${darkMode ? 'hover:bg-gray-600/50' : 'hover:bg-purple-100/50'} transition-colors`}>
                                                            <td className="py-4 px-4 font-semibold">
                                                                <div className="flex items-center gap-2">
                                                                    <FileText className={`w-4 h-4 ${darkMode ? 'text-purple-400' : 'text-purple-500'}`} />
                                                                    {convertedFile.name}
                                                                </div>
                                                            </td>
                                                            <td className="py-4 px-4 text-center font-mono">
                                                                {convertedFile.originalWidth} X {convertedFile.originalHeight}
                                                            </td>
                                                            <td className="py-4 px-4 text-center font-mono font-bold text-purple-500">
                                                                {convertedFile.newWidth} X {convertedFile.newHeight}
                                                            </td>
                                                            <td className="py-4 px-4 text-center">
                                                                <div className="flex flex-col items-center gap-1">
                                                                    <span className="font-bold text-green-500">
                                                                        {(convertedFile.newSize / 1024).toFixed(2)} KB ⬇️
                                                                    </span>
                                                                    <button
                                                                        onClick={handleDownload}
                                                                        className={`${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white px-3 py-1 rounded-lg font-semibold text-xs flex items-center transition-all shadow-md hover:shadow-lg`}
                                                                    >
                                                                        <Download className="w-3 h-3 mr-1" />
                                                                        Download
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {convertedFile.note && <p className={`text-base mb-6 p-4 rounded-xl border-2 ${darkMode ? 'text-amber-400 bg-amber-900/30 border-amber-700' : 'text-amber-700 bg-amber-50 border-amber-200'} font-medium`}> {convertedFile.note}</p>}
                                    <div className={`mb-7 p-6 rounded-xl ${darkMode ? 'bg-gray-700/50 border-2 border-gray-600' : 'bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200'} shadow-lg`}>
                                        <div className="flex items-center mb-3">
                                            <Edit2 className={`w-5 h-5 mr-2 ${darkMode ? 'text-purple-400' : 'text-purple-500'}`} />
                                            <label className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Customize File Name</label>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={customFileName}
                                                onChange={(e) => setCustomFileName(e.target.value)}
                                                placeholder={`Enter filename (without extension)`}
                                                className={`w-full p-4 rounded-xl border-2 ${darkMode
                                                    ? 'bg-gray-800 text-white border-gray-600 focus:border-purple-500 placeholder-gray-500'
                                                    : 'bg-white border-purple-300 focus:border-purple-500 placeholder-gray-400'
                                                    } focus:outline-none font-medium text-base shadow-inner`}
                                                autoComplete="off"
                                            />
                                            <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-base font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                .{convertedFile.name.split('.').pop()}
                                            </span>
                                        </div>
                                        <p className={`text-sm mt-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-medium`}> File extension will be added automatically</p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button onClick={handleDownload} className={`converter-primary-button flex-1 ${darkMode ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'} text-white px-4 py-4 rounded-xl font-bold text-base flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 transform`}>
                                            <Download className="w-5 h-5 mr-2" />Download
                                        </button>
                                        <button onClick={() => { setSelectedFile(null); setConvertedFile(null); setPreviewUrl(null); setCustomFileName(''); }} className={`converter-secondary-button flex-1 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} px-4 py-4 rounded-xl font-bold text-base transition-all duration-300 hover:scale-[1.02] active:scale-95 transform`}>
                                            Convert Another
                                        </button>
                                    </div>
                                </div>
                            )
                        }
                    </div >
                    {!isConverting && !isEditing && (
                        <Suspense fallback={null}>
                            <ToolDetailsPanel
                                toolName={activeConverter?.name}
                                activeConverter={activeConverter}
                                darkMode={darkMode}
                                converters={converters}
                                handleSetActiveConverter={handleSetActiveConverter}
                                className="mt-5"
                            />
                        </Suspense>
                    )}
                </div>
            </div>
        </>
    );
};

export default ConverterUI;
