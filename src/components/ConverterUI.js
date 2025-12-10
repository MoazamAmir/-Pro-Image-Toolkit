// src/components/ConverterUI.js
import React, { useState, useEffect } from 'react';
import { Upload, FileText, X, Download, CheckCircle, Settings, Zap, Edit2 } from 'lucide-react';
import CropImageTool from './CropImageTool';

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
}) => {
    // State for live preview

    const to = activeConverter?.to;
    // State for live preview
    const [livePreview, setLivePreview] = useState(null);
    const [showComparison, setShowComparison] = useState(false);
    const [framePreviews, setFramePreviews] = useState([]);

    // Apply brightness/contrast to create live preview
    useEffect(() => {
        if (to === 'brightness' && previewUrl && selectedFile) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                // Convert percentage values
                const brightnessVal = (brightness - 100) * 1.28;
                const contrastVal = contrast / 100;

                for (let i = 0; i < data.length; i += 4) {
                    data[i] = Math.min(255, Math.max(0, ((data[i] - 128) * contrastVal + 128) + brightnessVal));
                    data[i + 1] = Math.min(255, Math.max(0, ((data[i + 1] - 128) * contrastVal + 128) + brightnessVal));
                    data[i + 2] = Math.min(255, Math.max(0, ((data[i + 2] - 128) * contrastVal + 128) + brightnessVal));
                }

                ctx.putImageData(imageData, 0, 0);
                setLivePreview(canvas.toDataURL('image/png'));
            };
            img.src = previewUrl;
        }
    }, [brightness, contrast, previewUrl, selectedFile, to]);

    // Apply sharpen effect to create live preview
    useEffect(() => {
        if (to === 'sharpen' && previewUrl && selectedFile) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                // Sharpen kernel
                const centerWeight = 1 + (4 * sharpenIntensity);
                const edgeWeight = -1 * sharpenIntensity;
                const weights = [0, edgeWeight, 0, edgeWeight, centerWeight, edgeWeight, 0, edgeWeight, 0];
                const side = 3;
                const halfSide = 1;
                const w = canvas.width;
                const h = canvas.height;
                const output = ctx.createImageData(w, h);

                for (let y = 0; y < h; y++) {
                    for (let x = 0; x < w; x++) {
                        const dstOff = (y * w + x) * 4;
                        let r = 0, g = 0, b = 0;
                        for (let cy = 0; cy < side; cy++) {
                            for (let cx = 0; cx < side; cx++) {
                                const scy = y + cy - halfSide;
                                const scx = x + cx - halfSide;
                                if (scy >= 0 && scy < h && scx >= 0 && scx < w) {
                                    const srcOff = (scy * w + scx) * 4;
                                    const wt = weights[cy * side + cx];
                                    r += data[srcOff] * wt;
                                    g += data[srcOff + 1] * wt;
                                    b += data[srcOff + 2] * wt;
                                }
                            }
                        }
                        output.data[dstOff] = Math.min(255, Math.max(0, r));
                        output.data[dstOff + 1] = Math.min(255, Math.max(0, g));
                        output.data[dstOff + 2] = Math.min(255, Math.max(0, b));
                        output.data[dstOff + 3] = data[dstOff + 3];
                    }
                }
                ctx.putImageData(output, 0, 0);
                setLivePreview(canvas.toDataURL('image/png'));
            };
            img.src = previewUrl;
        }
    }, [sharpenIntensity, previewUrl, selectedFile, to]);

    // Apply blur effect to create live preview
    useEffect(() => {
        if (to === 'blur' && previewUrl && selectedFile) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.filter = 'blur(5px)';
                ctx.drawImage(img, 0, 0);
                setLivePreview(canvas.toDataURL('image/png'));
            };
            img.src = previewUrl;
        }
    }, [previewUrl, selectedFile, to]);

    // Apply grayscale effect to create live preview
    useEffect(() => {
        if (to === 'grayscale' && previewUrl && selectedFile) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                for (let i = 0; i < data.length; i += 4) {
                    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                    data[i] = avg;
                    data[i + 1] = avg;
                    data[i + 2] = avg;
                }
                ctx.putImageData(imageData, 0, 0);
                setLivePreview(canvas.toDataURL('image/png'));
            };
            img.src = previewUrl;
        }
    }, [previewUrl, selectedFile, to]);

    // Generate frame previews for video thumbnail
    useEffect(() => {
        if (to === 'thumbnail' && previewUrl && selectedFile && videoDuration > 0) {
            const generateFrames = async () => {
                const video = document.createElement('video');
                video.src = previewUrl;
                video.crossOrigin = 'anonymous';

                await new Promise((resolve) => {
                    video.onloadedmetadata = resolve;
                });

                const frameCount = Math.min(15, Math.ceil(videoDuration)); // Max 15 frames
                const interval = videoDuration / frameCount;
                const frames = [];

                for (let i = 0; i < frameCount; i++) {
                    const time = i * interval;
                    video.currentTime = time;

                    await new Promise((resolve) => {
                        video.onseeked = () => {
                            const canvas = document.createElement('canvas');
                            canvas.width = video.videoWidth / 4; // Smaller for preview
                            canvas.height = video.videoHeight / 4;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                            frames.push({
                                url: canvas.toDataURL('image/jpeg', 0.7),
                                time: time
                            });
                            resolve();
                        };
                    });
                }

                setFramePreviews(frames);
            };

            generateFrames();
        }
    }, [previewUrl, selectedFile, to, videoDuration]);

    // Theme classes based on darkMode
    const theme = {
        border: darkMode ? 'border-purple-500/50' : 'border-purple-400',
        bgSecondary: darkMode
            ? 'bg-gradient-to-br from-gray-800 via-purple-900/20 to-gray-900'
            : 'bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50',
        textPrimary: darkMode ? 'text-white' : 'text-gray-900',
        textSecondary: darkMode ? 'text-gray-300' : 'text-gray-600',
        textTertiary: darkMode ? 'text-gray-400' : 'text-gray-500',
        accent: darkMode ? 'text-purple-400' : 'text-purple-500',
    };

    if (!activeConverter) {
        return (
            <div className="text-center py-10 sm:py-16 md:py-20 animate-fadeIn">
                <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2 sm:mb-3 tracking-tight px-4`}>
                    Pro Image <span className="gradient-text">Toolkit</span>
                </h1>
                <p className={`text-lg sm:text-xl md:text-2xl ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2 sm:mb-3 font-medium px-4`}>Convert files instantly online</p>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-8 sm:mb-12 text-sm sm:text-base md:text-lg px-4`}>34+ tools • No uploads • No registration</p>
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

    if (activeConverter.to === 'crop') {
        return <CropImageTool isDarkMode={darkMode} />;
    }

    // const to = activeConverter.to;

    return (
        <div className="text-center py-6 sm:py-8 md:py-10 animate-fadeIn px-4">
            <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2 sm:mb-3 tracking-tight`}>{activeConverter.name}</h1>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6 sm:mb-8 text-base sm:text-lg md:text-xl font-medium`}>Convert {activeConverter.from.toUpperCase()} → {activeConverter.to.toUpperCase()}</p>
            <div className="max-w-2xl mx-auto">
                {to === 'brightness' && selectedFile && !convertedFile && (
                    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-2 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-premium`}>
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

                {to === 'watermark' && !selectedFile && !convertedFile && (
                    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-2 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-premium`}>
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

                {to === 'mirror' && !selectedFile && !convertedFile && (
                    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-2 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-premium`}>
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

                {to === 'sharpen' && selectedFile && !convertedFile && (
                    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-2 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-premium`}>
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

                {(to === 'blur' || to === 'grayscale') && selectedFile && !convertedFile && (
                    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-2 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-premium`}>
                        <button
                            onClick={() => setShowComparison(!showComparison)}
                            className={`w-full px-4 py-3 rounded-lg font-semibold text-sm ${showComparison ? 'bg-purple-600 text-white' : darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} transition-all`}
                        >
                            {showComparison ? '✓ Comparing Before/After' : 'Show Before/After Comparison'}
                        </button>
                    </div>
                )}

                {/* Video Thumbnail Extractor UI */}
                {to === 'thumbnail' && previewUrl && selectedFile && (
                    <div className="space-y-6">
                        {/* Frame Selection Section */}
                        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-2 rounded-xl p-6 shadow-premium`}>
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
                                        🎬 Video Frames - Click to select
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
                                    ref={(video) => {
                                        if (video && selectedFile) {
                                            video.src = previewUrl;
                                            video.currentTime = selectedTime;
                                            video.onloadedmetadata = () => {
                                                setVideoDuration(video.duration);
                                                if (selectedTime === 0) setSelectedTime(0);
                                            };
                                        }
                                    }}
                                    className="w-full max-h-64 rounded-lg border-2 border-purple-500 shadow-lg"
                                />
                            </div>

                            {/* Generate Button */}
                            <button
                                onClick={handleConvert}
                                disabled={isConverting}
                                className={`w-full mt-4 ${darkMode ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' : 'bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700'} disabled:from-gray-400 disabled:to-gray-400 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all shadow-premium hover:shadow-premium-lg hover:scale-105 transform`}
                            >
                                {isConverting ? 'Generating...' : '📸 Generate Thumbnail from Current Frame'}
                            </button>
                        </div>

                        {/* Generated Thumbnails */}
                        {generatedThumbnails.length > 0 && (
                            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-2 rounded-xl p-6 shadow-premium`}>
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

                {/* Image Compressor Info */}
                {to === 'compress' && selectedFile && !convertedFile && (
                    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-2 rounded-xl p-6 mb-6 shadow-premium`}>
                        <h3 className={`font-bold text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
                            <Settings className="w-5 h-5 mr-2" />
                            Compression Info
                        </h3>
                        <div className="space-y-3">
                            <div className={`flex justify-between items-center p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gradient-to-r from-blue-50 to-indigo-50'} border-2 ${darkMode ? 'border-gray-600' : 'border-blue-200'}`}>
                                <div>
                                    <p className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Original Size</p>
                                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {(selectedFile.size / 1024).toFixed(0)} KB
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Quality</p>
                                    <p className={`text-xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>60%</p>
                                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>JPEG</p>
                                </div>
                            </div>
                            <div className={`${darkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-300'} border-l-4 p-4 rounded-lg`}>
                                <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'} font-medium`}>
                                    💡 Your image will be compressed to approximately <span className="font-bold">{(selectedFile.size * 0.4 / 1024 / 1024).toFixed(2)} MB</span> ({((1 - 0.4) * 100).toFixed(0)}% smaller)
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {!selectedFile && !convertedFile && (
                    <div className="max-w-3xl mx-auto mb-20">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onDragEnter={handleDragEnter}
                            className={`
                relative group cursor-pointer
                rounded-3xl border-4 border-dashed p-12 text-center transition-all duration-300
                ${darkMode
                                    ? 'border-purple-500/50 bg-gradient-to-br from-gray-800 via-purple-900/20 to-gray-900 hover:border-indigo-400'
                                    : 'border-purple-400 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 hover:border-indigo-500'}
                hover:shadow-xl hover:scale-[1.02]
              `}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept={activeConverter.accept}
                                multiple={activeConverter?.multiple}
                                className="hidden"
                            />
                            <div className="flex flex-col items-center space-y-6">
                                <div className={`p-6 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-indigo-50'} group-hover:scale-110 transition-transform duration-300`}>
                                    <Upload className={`w-12 h-12 ${darkMode ? 'text-purple-400' : 'text-purple-500'}`} />
                                </div>
                                <div>
                                    <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Upload {activeConverter.name.includes('Image') ? 'Image' : 'File'}</h3>
                                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Drag & drop or click to browse</p>
                                </div>
                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {activeConverter.accept === 'image/*' ? 'Supports JPG, PNG, WEBP' : 'Supported formats'}
                                    {activeConverter.multiple ? ' • Multiple files' : ''} • Max 10MB
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {to === 'resize' && !convertedFile && (
                    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl p-6 mb-6 shadow-lg border`}>
                        <h3 className={`font-bold text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Image Dimensions</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <input type="number" value={resizeWidth} onChange={(e) => setResizeWidth(parseInt(e.target.value))} placeholder="Width" className={`${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'border'} rounded-lg p-3 font-semibold`} />
                            <input type="number" value={resizeHeight} onChange={(e) => setResizeHeight(parseInt(e.target.value))} placeholder="Height" className={`${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'border'} rounded-lg p-3 font-semibold`} />
                        </div>
                    </div>
                )}

                {selectedFile && !convertedFile && (
                    <div className={`${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-2 rounded-2xl p-8 shadow-premium animate-scaleIn`}>
                        <div className={`flex items-center justify-between mb-6 p-5 ${darkMode ? 'bg-gray-700/50' : 'bg-gradient-to-r from-purple-50 to-blue-50'} rounded-xl`}>
                            <div className="flex items-center">
                                <div className={`w-16 h-16 ${darkMode ? 'bg-purple-900/50' : 'bg-purple-100'} rounded-xl flex items-center justify-center mr-4 shadow-lg`}>
                                    <FileText className={`w-9 h-9 ${darkMode ? 'text-purple-400' : 'text-purple-500'}`} />
                                </div>
                                <div className="text-left">
                                    <p className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{Array.isArray(selectedFile) ? `${selectedFile.length} files` : selectedFile.name}</p>
                                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-medium`}>{Array.isArray(selectedFile) ? '' : (selectedFile.size / 1024 / 1024).toFixed(2) + ' MB'}</p>
                                </div>
                            </div>
                            <button onClick={() => { setSelectedFile(null); setPreviewUrl(null); }} className={`${darkMode ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'} transition-all p-2 rounded-lg`}><X className="w-6 h-6" /></button>
                        </div>
                        {previewUrl && selectedFile?.type?.startsWith('image/') && (
                            <div className="relative mb-6">
                                {/* Show comparison view for effects with live preview */}
                                {(to === 'brightness' || to === 'sharpen' || to === 'blur' || to === 'grayscale') && livePreview && showComparison ? (
                                    <div className="space-y-4">
                                        <div className={`${darkMode ? 'bg-gray-700/50' : 'bg-gradient-to-r from-purple-50 to-blue-50'} ronded-xl p-4 border-2 ${darkMode ? 'border-gray-600' : 'border-purple-200'}`}>
                                            <p className={`text-sm font-semibold mb-3 text-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}> Before & After Comparison</p>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="text-center">
                                                    <p className={`text-xs font-bold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>BEFORE</p>
                                                    <img
                                                        src={previewUrl}
                                                        alt="Before"
                                                        className="w-full rounded-lg border-2 shadow-lg"
                                                    />
                                                </div>
                                                <div className="text-center">
                                                    <p className={`text-xs font-bold mb-2 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>AFTER </p>
                                                    <img
                                                        src={livePreview}
                                                        alt="After"
                                                        className="w-full rounded-lg border-2 border-purple-500 shadow-lg"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <img
                                            src={(to === 'brightness' || to === 'sharpen' || to === 'blur' || to === 'grayscale') && livePreview ? livePreview : previewUrl}
                                            alt="Preview"
                                            className="max-h-72 mx-auto rounded-xl border-2 shadow-lg transition-all duration-200"
                                        />
                                        {((to === 'brightness' || to === 'sharpen' || to === 'blur' || to === 'grayscale') && livePreview) && (
                                            <div className={`absolute top-2 left-2 ${darkMode ? 'bg-black/70' : 'bg-white/70'} backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                Live Preview ✨
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                        {previewUrl && selectedFile?.type?.startsWith('video/') && <video src={previewUrl} controls className="max-h-72 mx-auto rounded-xl mb-6 w-full shadow-lg" />}
                        {previewUrl && selectedFile?.type?.startsWith('audio/') && <audio src={previewUrl} controls className="mx-auto mb-6 w-full" />}
                        <div className="flex items-center justify-center mb-8">
                            <span className={`${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'} px-7 py-3 rounded-full text-sm font-bold shadow-md`}>{activeConverter.from.toUpperCase()}</span>
                            <svg className={`w-10 h-10 mx-7 ${darkMode ? 'text-purple-400' : 'text-purple-500'} animate-pulse-soft`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                            <span className={`${darkMode ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gradient-to-r from-purple-500 to-blue-600'} text-white px-7 py-3 rounded-full text-sm font-bold shadow-lg`}>{activeConverter.to.toUpperCase()}</span>
                        </div>
                        <button
                            onClick={handleConvert}
                            disabled={isConverting || ffmpegLoading}
                            className={`w-full ${darkMode ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' : 'bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700'} disabled:from-gray-400 disabled:to-gray-400 text-white px-4 sm:px-6 py-4 sm:py-5 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg md:text-xl transition-all duration-300 shadow-premium hover:shadow-premium-lg hover:scale-105 transform`}
                        >
                            {ffmpegLoading ? 'Loading Converter...' : isConverting ? 'Converting...' : 'Convert Now'}
                        </button>
                    </div>
                )}

                {convertedFile && (
                    <div className={`${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-green-500/30' : 'bg-white border-green-200'} border-2 rounded-2xl p-10 shadow-premium-lg animate-scaleIn`}>
                        <div className={`w-24 h-24 ${darkMode ? 'bg-gradient-to-br from-green-900 to-green-800' : 'bg-gradient-to-br from-green-100 to-emerald-100'} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-scaleIn`}>
                            <CheckCircle className={`w-14 h-14 ${darkMode ? 'text-green-400' : 'text-green-500'} animate-pulse-soft`} />
                        </div>
                        <h3 className={`text-3xl font-extrabold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2 tracking-tight`}>✅ Conversion Complete!</h3>
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-8 text-lg`}>Your file is ready to download</p>
                        {convertedFile.type?.startsWith('image/') && <img src={convertedFile.url} alt="Result" className="max-h-80 mx-auto rounded-xl mb-6 border-2 shadow-premium" />}
                        {convertedFile.preview && <img src={convertedFile.preview} alt="Preview" className="max-h-80 mx-auto rounded-xl mb-6 border-2 shadow-premium" />}
                        {convertedFile.type?.startsWith('audio/') && <audio src={convertedFile.url} controls className="mx-auto mb-6 w-full" />}
                        {convertedFile.base64 && <textarea readOnly value={convertedFile.base64} className={`w-full h-32 text-xs p-4 border-2 rounded-xl mb-6 ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 border-gray-200'} font-mono`} />}
                        {convertedFile.originalSize && convertedFile.compressedSize && (
                            <div className={`${darkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-500'} border-l-4 p-5 mb-6 rounded-lg`}>
                                <p className={`text-base ${darkMode ? 'text-gray-200' : 'text-gray-700'} font-semibold`}>📊 Compression: <span className="font-bold text-blue-500">{((1 - convertedFile.compressedSize / convertedFile.originalSize) * 100).toFixed(1)}%</span> smaller</p>
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
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <button onClick={handleDownload} className={`flex-1 ${darkMode ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'} text-white px-4 sm:px-6 py-4 sm:py-5 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg md:text-xl flex items-center justify-center shadow-premium transition-all duration-300 hover:scale-105 transform`}>
                                <Download className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 mr-2 sm:mr-3" />Download
                            </button>
                            <button onClick={() => { setSelectedFile(null); setConvertedFile(null); setPreviewUrl(null); setCustomFileName(''); }} className={`flex-1 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} px-4 sm:px-6 py-4 sm:py-5 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg md:text-xl transition-all duration-300 hover:scale-105 transform`}>
                                Convert Another
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};

export default ConverterUI;