import React, { useState, useRef, useEffect } from 'react';
import { Upload, Shield, Scissors, Ruler, ImageIcon, Globe, Heart, Download, RefreshCw, X } from 'lucide-react';

export default function CropImageTool({ isDarkMode }) {
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
    const [aspectRatio, setAspectRatio] = useState('FreeForm');
    const [cropSettings, setCropSettings] = useState({
        width: 200,
        height: 200,
        positionX: 50,
        positionY: 50,
    });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [resizeHandle, setResizeHandle] = useState(null);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const fileInputRef = useRef(null);
    const imageRef = useRef(null);
    const containerRef = useRef(null);

    // Theme-aware classes
    const theme = {
        bgPrimary: isDarkMode ? 'bg-gray-900' : 'bg-gray-50',
        bgSecondary: isDarkMode ? 'bg-gray-800' : 'bg-white',
        textPrimary: isDarkMode ? 'text-white' : 'text-gray-900',
        textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
        textTertiary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
        border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
        inputBg: isDarkMode ? 'bg-gray-700' : 'bg-gray-50',
        accent: 'text-indigo-600',
        accentBg: 'bg-indigo-600',
        accentHover: 'hover:bg-indigo-700',
        buttonSecondary: isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200',
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            processFile(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const processFile = (file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            setSelectedImage(event.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            processFile(file);
        }
    };

    useEffect(() => {
        if (selectedImage && imageRef.current) {
            const img = imageRef.current;
            setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
            // Reset crop to center initially
            setCropSettings({
                width: Math.min(200, img.naturalWidth),
                height: Math.min(200, img.naturalHeight),
                positionX: (img.naturalWidth - Math.min(200, img.naturalWidth)) / 2,
                positionY: (img.naturalHeight - Math.min(200, img.naturalHeight)) / 2,
            });
        }
    }, [selectedImage]);

    useEffect(() => {
        if (aspectRatio !== 'FreeForm' && aspectRatio !== 'Custom') {
            const ratios = {
                '1:1 Square': 1,
                '4:3': 4 / 3,
                '16:9': 16 / 9,
                '2:3': 2 / 3,
            };
            const ratio = ratios[aspectRatio];
            if (ratio) {
                setCropSettings((prev) => ({
                    ...prev,
                    height: Math.round(prev.width / ratio),
                }));
            }
        }
    }, [aspectRatio, cropSettings.width]);

    const handleReset = () => {
        if (!imageDimensions.width) return;
        setCropSettings({
            width: Math.min(200, imageDimensions.width),
            height: Math.min(200, imageDimensions.height),
            positionX: (imageDimensions.width - Math.min(200, imageDimensions.width)) / 2,
            positionY: (imageDimensions.height - Math.min(200, imageDimensions.height)) / 2,
        });
        setAspectRatio('FreeForm');
    };

    const getScale = () => {
        if (!imageRef.current) return 1;
        const displayWidth = imageRef.current.width;
        const naturalWidth = imageRef.current.naturalWidth;
        return naturalWidth / displayWidth;
    };

    const handleCropApply = () => {
        if (!imageRef.current) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = cropSettings.width;
        canvas.height = cropSettings.height;

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            ctx.drawImage(
                img,
                cropSettings.positionX,
                cropSettings.positionY,
                cropSettings.width,
                cropSettings.height,
                0,
                0,
                cropSettings.width,
                cropSettings.height
            );

            canvas.toBlob((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `cropped-image-${Date.now()}.png`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }
            }, 'image/png');
        };
        img.src = selectedImage;
    };

    const handleMouseDown = (e, handle = null) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent event bubbling
        if (handle) {
            setIsResizing(true);
            setResizeHandle(handle);
        } else {
            setIsDragging(true);
        }
        setDragStart({
            x: e.clientX,
            y: e.clientY,
            cropX: cropSettings.positionX,
            cropY: cropSettings.positionY,
            cropW: cropSettings.width,
            cropH: cropSettings.height,
        });
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!imageRef.current || (!isDragging && !isResizing)) return;

            const scale = getScale();
            const deltaX = (e.clientX - dragStart.x) * scale;
            const deltaY = (e.clientY - dragStart.y) * scale;

            if (isDragging) {
                const newX = Math.max(0, Math.min(dragStart.cropX + deltaX, imageDimensions.width - cropSettings.width));
                const newY = Math.max(0, Math.min(dragStart.cropY + deltaY, imageDimensions.height - cropSettings.height));

                setCropSettings((prev) => ({
                    ...prev,
                    positionX: Math.round(newX),
                    positionY: Math.round(newY),
                }));
            } else if (isResizing && resizeHandle) {
                let newWidth = dragStart.cropW;
                let newHeight = dragStart.cropH;
                let newX = dragStart.cropX;
                let newY = dragStart.cropY;

                if (resizeHandle.includes('e')) newWidth = Math.max(50, dragStart.cropW + deltaX);
                if (resizeHandle.includes('w')) {
                    newWidth = Math.max(50, dragStart.cropW - deltaX);
                    newX = dragStart.cropX + deltaX;
                }
                if (resizeHandle.includes('s')) newHeight = Math.max(50, dragStart.cropH + deltaY);
                if (resizeHandle.includes('n')) {
                    newHeight = Math.max(50, dragStart.cropH - deltaY);
                    newY = dragStart.cropY + deltaY;
                }

                if (aspectRatio !== 'FreeForm' && aspectRatio !== 'Custom') {
                    const ratios = { '1:1 Square': 1, '4:3': 4 / 3, '16:9': 16 / 9, '2:3': 2 / 3 };
                    const ratio = ratios[aspectRatio];
                    if (ratio) newHeight = newWidth / ratio;
                }

                // Boundary checks
                newX = Math.max(0, Math.min(newX, imageDimensions.width - newWidth));
                newY = Math.max(0, Math.min(newY, imageDimensions.height - newHeight));
                newWidth = Math.min(newWidth, imageDimensions.width - newX);
                newHeight = Math.min(newHeight, imageDimensions.height - newY);

                setCropSettings({
                    width: Math.round(newWidth),
                    height: Math.round(newHeight),
                    positionX: Math.round(newX),
                    positionY: Math.round(newY),
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setIsResizing(false);
            setResizeHandle(null);
        };

        if (isDragging || isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, isResizing, dragStart, resizeHandle, imageDimensions, cropSettings.width, cropSettings.height, aspectRatio]);

    const features = [
        { icon: <Scissors className="w-6 h-6" />, title: 'Easy Cropping', description: 'Intuitive drag & drop interface.' },
        { icon: <Ruler className="w-6 h-6" />, title: 'Precise Control', description: 'Pixel-perfect dimensions.' },
        { icon: <ImageIcon className="w-6 h-6" />, title: 'Aspect Ratios', description: 'Preset common ratios.' },
        { icon: <Shield className="w-6 h-6" />, title: 'Privacy First', description: 'Processing happens locally.' },
        { icon: <Globe className="w-6 h-6" />, title: 'Universal', description: 'Works on all devices.' },
        { icon: <Heart className="w-6 h-6" />, title: '100% Free', description: 'No hidden costs.' },
    ];

    // =============== LANDING PAGE ===============
    if (!selectedImage) {
        return (
            <div className={`min-h-screen ${theme.bgPrimary} transition-colors duration-300`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Hero Section */}
                    <div className="text-center mb-16 space-y-4">
                        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient-x">
                            Crop Image Online
                        </h1>
                        <p className={`text-lg md:text-xl ${theme.textSecondary} max-w-2xl mx-auto`}>
                            The simplest way to crop your images. Fast, free, and secure.
                        </p>
                    </div>

                    {/* Upload Area */}
                    <div className="max-w-3xl mx-auto mb-20">
                        <div
                            onClick={() => fileInputRef.current.click()}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`
                                relative group cursor-pointer
                                rounded-3xl border-4 border-dashed p-12 text-center transition-all duration-300
                                ${isDragging
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 scale-[1.02]'
                                    : `${theme.border} ${theme.bgSecondary} hover:border-indigo-400 hover:shadow-xl`
                                }
                            `}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageSelect}
                                accept="image/*"
                                className="hidden"
                            />
                            <div className="flex flex-col items-center space-y-6">
                                <div className={`p-6 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-indigo-50'} group-hover:scale-110 transition-transform duration-300`}>
                                    <Upload className={`w-12 h-12 ${theme.accent}`} />
                                </div>
                                <div>
                                    <h3 className={`text-2xl font-bold ${theme.textPrimary} mb-2`}>
                                        Upload Image
                                    </h3>
                                    <p className={`${theme.textSecondary}`}>
                                        Drag & drop or click to browse
                                    </p>
                                </div>
                                <p className={`text-sm ${theme.textTertiary}`}>
                                    Supports JPG, PNG, WEBP • Max 10MB
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                        {features.map((item, index) => (
                            <div
                                key={index}
                                className={`
                                    p-6 rounded-2xl ${theme.bgSecondary} border ${theme.border}
                                    hover:shadow-lg hover:-translate-y-1 transition-all duration-300
                                `}
                            >
                                <div className={`w-12 h-12 rounded-xl ${theme.accentBg} flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-500/30`}>
                                    {item.icon}
                                </div>
                                <h3 className={`text-lg font-bold ${theme.textPrimary} mb-2`}>{item.title}</h3>
                                <p className={`text-sm ${theme.textSecondary}`}>{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // =============== CROPPING EDITOR ===============
    return (
        <div className={`min-h-screen flex flex-col lg:flex-row ${theme.bgPrimary} overflow-hidden`}>

            {/* Sidebar Controls */}
            <div className={`
                w-full lg:w-96 flex-shrink-0 
                ${theme.bgSecondary} border-b lg:border-b-0 lg:border-r ${theme.border}
                flex flex-col h-[40vh] lg:h-[calc(100vh-64px)] overflow-y-auto z-20 shadow-xl
            `}>
                <div className="p-6 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className={`text-xl font-bold ${theme.textPrimary}`}>Crop Settings</h2>
                        <button
                            onClick={() => setSelectedImage(null)}
                            className={`p-2 rounded-lg ${theme.buttonSecondary} transition-colors`}
                            title="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Dimensions */}
                    <div className="space-y-4">
                        <label className={`text-sm font-semibold ${theme.textSecondary} uppercase tracking-wider`}>Dimensions</label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold ${theme.textTertiary}`}>W</span>
                                <input
                                    type="number"
                                    value={cropSettings.width}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value) || 0;
                                        setCropSettings({ ...cropSettings, width: Math.min(val, imageDimensions.width) });
                                    }}
                                    className={`w-full pl-8 pr-3 py-2 rounded-lg border ${theme.border} ${theme.inputBg} ${theme.textPrimary} focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all`}
                                />
                            </div>
                            <div className="relative">
                                <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold ${theme.textTertiary}`}>H</span>
                                <input
                                    type="number"
                                    value={cropSettings.height}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value) || 0;
                                        setCropSettings({ ...cropSettings, height: Math.min(val, imageDimensions.height) });
                                    }}
                                    className={`w-full pl-8 pr-3 py-2 rounded-lg border ${theme.border} ${theme.inputBg} ${theme.textPrimary} focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Aspect Ratio */}
                    <div className="space-y-4">
                        <label className={`text-sm font-semibold ${theme.textSecondary} uppercase tracking-wider`}>Aspect Ratio</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['FreeForm', '1:1 Square', '4:3', '16:9', '2:3'].map((ratio) => (
                                <button
                                    key={ratio}
                                    onClick={() => setAspectRatio(ratio)}
                                    className={`
                                        px-2 py-2 text-xs font-medium rounded-lg border transition-all
                                        ${aspectRatio === ratio
                                            ? `${theme.accentBg} text-white border-transparent shadow-md`
                                            : `${theme.bgPrimary} ${theme.textSecondary} ${theme.border} hover:border-indigo-300`
                                        }
                                    `}
                                >
                                    {ratio.replace('Square', '')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Position */}
                    <div className="space-y-4">
                        <label className={`text-sm font-semibold ${theme.textSecondary} uppercase tracking-wider`}>Position</label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold ${theme.textTertiary}`}>X</span>
                                <input
                                    type="number"
                                    value={cropSettings.positionX}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value) || 0;
                                        setCropSettings({
                                            ...cropSettings,
                                            positionX: Math.max(0, Math.min(val, imageDimensions.width - cropSettings.width)),
                                        });
                                    }}
                                    className={`w-full pl-8 pr-3 py-2 rounded-lg border ${theme.border} ${theme.inputBg} ${theme.textPrimary} focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all`}
                                />
                            </div>
                            <div className="relative">
                                <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold ${theme.textTertiary}`}>Y</span>
                                <input
                                    type="number"
                                    value={cropSettings.positionY}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value) || 0;
                                        setCropSettings({
                                            ...cropSettings,
                                            positionY: Math.max(0, Math.min(val, imageDimensions.height - cropSettings.height)),
                                        });
                                    }}
                                    className={`w-full pl-8 pr-3 py-2 rounded-lg border ${theme.border} ${theme.inputBg} ${theme.textPrimary} focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 space-y-3">
                        <button
                            onClick={handleReset}
                            className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 ${theme.buttonSecondary} transition-all`}
                        >
                            <RefreshCw className="w-4 h-4" /> Reset
                        </button>
                        <button
                            onClick={handleCropApply}
                            className={`w-full py-3 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 ${theme.accentBg} ${theme.accentHover} transition-all transform active:scale-[0.98]`}
                        >
                            <Download className="w-5 h-5" /> Crop & Download
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Canvas Area */}
            <div className={`flex-1 relative overflow-hidden flex items-center justify-center p-4 lg:p-8 ${isDarkMode ? 'bg-gray-950' : 'bg-gray-100'}`}>

                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5 pointer-events-none"
                    style={{
                        backgroundImage: `radial-gradient(${isDarkMode ? '#ffffff' : '#000000'} 1px, transparent 1px)`,
                        backgroundSize: '20px 20px'
                    }}
                />

                <div ref={containerRef} className="relative shadow-2xl rounded-lg overflow-hidden" style={{ userSelect: 'none', maxHeight: '85vh', maxWidth: '100%' }}>
                    <img
                        ref={imageRef}
                        src={selectedImage}
                        alt="Preview"
                        className="max-w-full max-h-[80vh] object-contain block"
                        draggable={false}
                    />

                    {/* Overlay & Crop Box */}
                    {imageRef.current && (
                        <>
                            {/* Dark Overlay outside crop area - simulated with 4 divs */}
                            {/* This is complex to do perfectly with just divs over an image that scales. 
                                Instead, we'll just rely on the crop box border and maybe a dimming effect if possible, 
                                but standard CSS crop tools often just use a border. 
                                Let's stick to the border for simplicity and performance, but make it pop.
                            */}

                            <div
                                className="absolute cursor-move group"
                                style={{
                                    left: `${cropSettings.positionX / getScale()}px`,
                                    top: `${cropSettings.positionY / getScale()}px`,
                                    width: `${cropSettings.width / getScale()}px`,
                                    height: `${cropSettings.height / getScale()}px`,
                                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)', // The dimming overlay
                                    border: '2px solid white',
                                    outline: '1px solid rgba(0,0,0,0.2)'
                                }}
                                onMouseDown={(e) => handleMouseDown(e)}
                            >
                                {/* Grid Lines (Rule of Thirds) */}
                                <div className="absolute inset-0 flex flex-col pointer-events-none opacity-0 group-hover:opacity-50 transition-opacity">
                                    <div className="flex-1 border-b border-white/30"></div>
                                    <div className="flex-1 border-b border-white/30"></div>
                                    <div className="flex-1"></div>
                                </div>
                                <div className="absolute inset-0 flex pointer-events-none opacity-0 group-hover:opacity-50 transition-opacity">
                                    <div className="flex-1 border-r border-white/30"></div>
                                    <div className="flex-1 border-r border-white/30"></div>
                                    <div className="flex-1"></div>
                                </div>

                                {/* Resize Handles */}
                                {['nw', 'ne', 'sw', 'se', 'n', 's', 'w', 'e'].map((dir) => {
                                    const style = {
                                        nw: { left: '-6px', top: '-6px', cursor: 'nw-resize' },
                                        ne: { right: '-6px', top: '-6px', cursor: 'ne-resize' },
                                        sw: { left: '-6px', bottom: '-6px', cursor: 'sw-resize' },
                                        se: { right: '-6px', bottom: '-6px', cursor: 'se-resize' },
                                        n: { left: '50%', top: '-6px', transform: 'translateX(-50%)', cursor: 'n-resize', width: '20px', height: '6px', borderRadius: '4px' },
                                        s: { left: '50%', bottom: '-6px', transform: 'translateX(-50%)', cursor: 's-resize', width: '20px', height: '6px', borderRadius: '4px' },
                                        w: { left: '-6px', top: '50%', transform: 'translateY(-50%)', cursor: 'w-resize', width: '6px', height: '20px', borderRadius: '4px' },
                                        e: { right: '-6px', top: '50%', transform: 'translateY(-50%)', cursor: 'e-resize', width: '6px', height: '20px', borderRadius: '4px' },
                                    }[dir];

                                    const isCorner = dir.length === 2;

                                    return (
                                        <div
                                            key={dir}
                                            className={`absolute bg-indigo-500 border-2 border-white shadow-sm transition-transform hover:scale-125 z-10`}
                                            style={{
                                                width: isCorner ? '12px' : undefined,
                                                height: isCorner ? '12px' : undefined,
                                                borderRadius: isCorner ? '50%' : undefined,
                                                ...style
                                            }}
                                            onMouseDown={(e) => {
                                                e.stopPropagation();
                                                handleMouseDown(e, dir);
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
