import React, { useState, useRef, useEffect, } from 'react';
import { Upload, } from 'lucide-react';
import {
    Shield,
    Scissors,
    Ruler,
    ImageIcon,
    Globe,
    Heart,
} from 'lucide-react';

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

    // ✅ Theme-aware classes (no hardcoded dark:)
    const bgPrimary = isDarkMode ? 'bg-[#111727]' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100';
    const bgCard = isDarkMode ? 'bg-[#1a2332]' : 'bg-white';
    const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
    const textSecondary = isDarkMode ? 'text-gray-300' : 'text-gray-700';
    const textTertiary = isDarkMode ? 'text-gray-400' : 'text-gray-500';
    const borderColor = isDarkMode ? 'border-gray-700' : 'border-gray-200';
    const inputBg = isDarkMode ? 'bg-[#1f2937]' : 'bg-white';
    const buttonBg = isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-800';
    const adBg = isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-100 border-blue-200';
    const adText = isDarkMode ? 'text-blue-300' : 'text-blue-800';
    const adSubText = isDarkMode ? 'text-blue-400' : 'text-blue-600';

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setSelectedImage(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    useEffect(() => {
        if (selectedImage && imageRef.current) {
            const img = imageRef.current;
            setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        }
    }, [selectedImage]);

    useEffect(() => {
        if (aspectRatio !== 'FreeForm' && aspectRatio !== 'Custom') {
            const ratios = {
                '1:1 Square': 1,
                '4:3': 4 / 3,
                '16:9': 16 / 9,
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

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setSelectedImage(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleReset = () => {
        setCropSettings({
            width: 200,
            height: 200,
            positionX: 50,
            positionY: 50,
        });
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
            if (!imageRef.current) return;

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
                    const ratios = { '1:1 Square': 1, '4:3': 4 / 3, '16:9': 16 / 9 };
                    const ratio = ratios[aspectRatio];
                    if (ratio) newHeight = newWidth / ratio;
                }

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
        { icon: <Scissors className="w-10 h-10 text-white mb-4" />, title: 'Quick and Easy to Use', description: 'Crop images easily by drawing a crop rectangle...' },
        { icon: <Ruler className="w-10 h-10 text-white mb-4" />, title: 'Crop Image to Any Size', description: 'Crop your image to an exact pixel size...' },
        { icon: <ImageIcon className="w-10 h-10 text-white mb-4" />, title: 'Crop to Any Aspect Ratio', description: 'Choose from many different crop aspect ratios...' },
        { icon: <Shield className="w-10 h-10 text-white mb-4" />, title: 'Privacy Protected', description: 'We crop image files right on the browser...' },
        { icon: <Globe className="w-10 h-10 text-white mb-4" />, title: 'Online Tool', description: 'This image cropper works on any device...' },
        { icon: <Heart className="w-10 h-10 text-white mb-4" />, title: '100% Free', description: 'This photo cropper is entirely free...' },
    ];

    // =============== LANDING PAGE ===============
    if (!selectedImage) {
        return (
            <div className={`${bgPrimary} min-h-screen overflow-x-hidden`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent text-center">Crop Image</h1>
                        <p className={`text-lg ${textTertiary}`}>Quickly crop image files online for free!</p>
                    </div>

                    {/* Ad Banner */}
                    <div className="text-center mt-5">
                        <div className={`rounded-lg p-4 sm:p-6 flex flex-col items-center justify-center min-h-[90px] mx-auto w-full max-w-[728px] shadow-md border ${adBg}`}>
                            <p className={`text-sm sm:text-base font-semibold ${adText}`}>Advertisement Space 728x90</p>
                            <p className={`text-xs sm:text-sm mt-1 ${adSubText}`}>Your Banner Ad Here</p>
                        </div>
                    </div>

                    {/* Upload Area */}
                    <div className="max-w-4xl mx-auto mt-10">
                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-1 rounded-lg mb-6">
                            <div className={`${bgCard} rounded-lg p-12 text-center`}>
                                <div
                                    onClick={() => fileInputRef.current.click()}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`border-4 border-dashed rounded-lg p-16 transition-all duration-300 cursor-pointer ${isDragging
                                        ? isDarkMode
                                            ? 'border-blue-400 bg-blue-900/20'
                                            : 'border-blue-500 bg-blue-50'
                                        : isDarkMode
                                            ? 'border-white/20'
                                            : 'border-white/30'
                                        }`}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageSelect}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <Upload className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`} />
                                    <h3 className={`text-2xl font-semibold ${textPrimary} mb-2`}>
                                        Upload or Drop Image
                                    </h3>
                                    <p className={`mt-6 ${isDarkMode ? 'text-white/80' : 'text-gray-800'} text-lg`}>
                                        Drag & drop an image here, or click to browse
                                    </p>
                                    <p className={`mt-3 ${textTertiary} text-sm`}>
                                        Max file size: 10 MB. <span className="underline cursor-pointer">Sign up</span> for more.
                                    </p>
                                </div>

                            </div>
                        </div>

                        <div className="mt-16 max-w-6xl mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {features.map((item, index) => (
                                    <div
                                        key={index}
                                        className={`p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border ${borderColor} ${bgCard}`}
                                    >
                                        <div className="flex flex-col items-center">
                                            <div className={textPrimary}>
                                                {React.cloneElement(item.icon, { className: `w-10 h-10 mb-4 ${textPrimary}` })}
                                            </div>
                                            <h3 className={`text-lg font-semibold mb-2 ${textPrimary}`}>{item.title}</h3>
                                            <p className={`text-sm leading-relaxed ${textTertiary}`}>{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={`mt-8 sm:mt-12 ${bgCard} rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-8 transition-opacity duration-700 opacity-100 `}>
                            <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                                <span className="text-2xl sm:text-3xl">❓</span>
                                How to Crop Images?
                            </h2>
                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl hover-lift">
                                    <span className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base">1</span>
                                    <div>
                                        <p className="text-gray-700 text-sm sm:text-base">Click the <span className="font-bold text-indigo-600">"Add More Files"</span> button and select from Device, Dropbox, Google Drive, OneDrive, or URL.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg sm:rounded-xl hover-lift">
                                    <span className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base">2</span>
                                    <div>
                                        <p className="text-gray-700 text-sm sm:text-base">Select a target image format from the <span className="font-bold text-purple-600">"Output"</span> drop-down list.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg sm:rounded-xl hover-lift">
                                    <span className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base">3</span>
                                    <div>
                                        <p className="text-gray-700 text-sm sm:text-base">Click on the <span className="font-bold text-green-600">"Convert"</span> button to start the conversion.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Ads */}
                    <div className="hidden lg:block absolute left-4 top-[390px]">
                        <div className={`rounded-lg p-4 w-[110px] h-[500px] shadow-md border ${adBg}`}>
                            <p className={`text-xs mt-2 rotate-90 whitespace-nowrap ${adSubText}`}>Left Skyscraper Banner</p>
                        </div>
                    </div>
                    <div className="hidden lg:block absolute right-4 top-[390px]">
                        <div className={`rounded-lg p-4 w-[110px] h-[500px] shadow-md border ${adBg}`}>
                            <p className={`text-xs mt-2 rotate-90 whitespace-nowrap ${adSubText}`}>Right Skyscraper Banner</p>
                        </div>
                    </div>


                    <div className="max-w-6xl mx-auto mt-20 px-6 pb-16">
                        <h2 className={`text-3xl font-bold ${textPrimary} text-center mb-12`}>
                            Crop Images Free with Our Online Photo Cropper
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { icon: <Globe className="w-12 h-12 text-blue-400 mb-4" />, title: 'Customizable Cropping...', desc: 'Choose from predefined aspect ratios...' },
                                { icon: <Shield className="w-12 h-12 text-blue-400 mb-4" />, title: 'Secure and Reliable...', desc: 'Our commitment extends beyond...' },
                                { icon: <Ruler className="w-12 h-12 text-blue-400 mb-4" />, title: 'Precise Cropping...', desc: 'Adjust your photos with precision...' },
                                { icon: <ImageIcon className="w-12 h-12 text-blue-400 mb-4" />, title: 'Versatile Format Support...', desc: 'Our image cropper handles various file types...' }
                            ].map((item, i) => (
                                <div key={i} className={`${bgCard} border ${borderColor} rounded-xl p-8 hover:border-gray-600 transition-colors`}>
                                    <div className="flex flex-col items-center text-center">
                                        {item.icon}
                                        <h3 className={`text-xl font-bold ${textPrimary} mb-3`}>{item.title}</h3>
                                        <p className={`leading-relaxed ${textTertiary}`}>{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Feature Images */}
                    <div className="max-w-6xl mx-auto mt-40 flex flex-col md:flex-row items-center gap-10 px-6">
                        <div className="flex-1 flex justify-center">
                            <img src="/assets/Crop-Image-Feature.png" alt="Interactive Cropping Interface" className="rounded-xl shadow-lg w-full max-w-md" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h2 className={`text-3xl font-bold ${textPrimary} mb-4`}>Interactive Cropping Interface</h2>
                            <p className={`leading-relaxed ${textTertiary}`}>
                                With our cropping tool, you can see your photo changes instantly...
                            </p>
                        </div>
                    </div>

                    <div className="max-w-6xl mx-auto mt-40 flex flex-col md:flex-row items-center gap-10 px-6 pb-20">
                        <div className="flex-1 text-center md:text-left order-2 md:order-1">
                            <h2 className={`text-3xl font-bold ${textPrimary} mb-4`}>
                                Perfect Your Images with Custom Ratios...
                            </h2>
                            <p className={`leading-relaxed ${textTertiary}`}>
                                Choose from a wide selection of predefined ratios...
                            </p>
                        </div>
                        <div className="flex-1 flex justify-center order-1 md:order-2">
                            <img src="/assets/Crop-Image-Feature-2.png" alt="Custom Ratios" className="rounded-xl shadow-lg w-full max-w-md" />
                        </div>
                    </div>
                </div>

            </div>
        );
    }

    // =============== CROPPING EDITOR ===============
    return (
        <div className={`min-h-screen ${bgPrimary}`}>

            <div className="flex h-[calc(100vh-73px)]">
                <div className={`${isDarkMode ? 'bg-[#1a2332]' : 'bg-gray-50'} w-80 border-r ${borderColor} p-6 overflow-y-auto`}>
                    <div className="mb-6">
                        <h2 className={`font-bold text-xl ${textPrimary} mb-1`}>Crop Rectangle</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className={`block text-xs mb-2 font-medium ${textTertiary}`}>Width (px)</label>
                            <input
                                type="number"
                                value={cropSettings.width}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    setCropSettings({ ...cropSettings, width: Math.min(val, imageDimensions.width) });
                                }}
                                className={`w-full px-3 py-2.5 rounded border ${borderColor} focus:border-blue-500 focus:outline-none ${inputBg} ${textPrimary}`}
                            />
                        </div>
                        <div>
                            <label className={`block text-xs mb-2 font-medium ${textTertiary}`}>Height (px)</label>
                            <input
                                type="number"
                                value={cropSettings.height}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    setCropSettings({ ...cropSettings, height: Math.min(val, imageDimensions.height) });
                                }}
                                className={`w-full px-3 py-2.5 rounded border ${borderColor} focus:border-blue-500 focus:outline-none ${inputBg} ${textPrimary}`}
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className={`block text-xs mb-2 font-medium ${textTertiary}`}>Aspect Ratio</label>
                        <select
                            value={aspectRatio}
                            onChange={(e) => setAspectRatio(e.target.value)}
                            className={`w-full px-3 py-2.5 rounded border ${borderColor} focus:border-blue-500 focus:outline-none ${inputBg} ${textPrimary}`}
                        >
                            <option>FreeForm</option>
                            <option>1:1 Square</option>
                            <option>4:3</option>
                            <option>16:9</option>
                            <option>Custom</option>
                        </select>
                    </div>

                    <div className="mb-6">
                        <h3 className={`font-bold text-lg ${textPrimary} mb-4`}>Crop Position</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={`block text-xs mb-2 font-medium ${textTertiary}`}>Position X (px)</label>
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
                                    className={`w-full px-3 py-2.5 rounded border ${borderColor} focus:border-blue-500 focus:outline-none ${inputBg} ${textPrimary}`}
                                />
                            </div>
                            <div>
                                <label className={`block text-xs mb-2 font-medium ${textTertiary}`}>Position Y (px)</label>
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
                                    className={`w-full px-3 py-2.5 rounded border ${borderColor} focus:border-blue-500 focus:outline-none ${inputBg} ${textPrimary}`}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={`mb-4 p-3 rounded ${bgCard}`}>
                        <div className={`text-xs ${textTertiary} mb-1`}>Original Image</div>
                        <div className={`text-sm ${textPrimary}`}>{imageDimensions.width} × {imageDimensions.height} px</div>
                    </div>

                    <button
                        onClick={handleReset}
                        className={`w-full py-3 rounded-lg mb-3 font-medium ${buttonBg} hover:opacity-90`}
                    >
                        Reset
                    </button>

                    <button
                        onClick={handleCropApply}
                        className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                        Crop & Download →
                    </button>
                </div>

                <div className={`${bgPrimary} flex-1 p-8 overflow-auto flex flex-col items-center justify-center`}>


                    {/* Image Preview */}
                    <div ref={containerRef} className="relative inline-block" style={{ userSelect: 'none' }}>
                        <img
                            ref={imageRef}
                            src={selectedImage}
                            alt="Preview"
                            className="max-w-full max-h-[calc(100vh-200px)] block"
                            draggable={false}
                        />
                        {imageRef.current && (
                            <div
                                className="absolute border-2 border-blue-500 cursor-move"
                                style={{
                                    left: `${cropSettings.positionX / getScale()}px`,
                                    top: `${cropSettings.positionY / getScale()}px`,
                                    width: `${cropSettings.width / getScale()}px`,
                                    height: `${cropSettings.height / getScale()}px`,
                                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                                }}
                                onMouseDown={(e) => handleMouseDown(e)}
                            >
                                {['nw', 'ne', 'sw', 'se', 'n', 's', 'w', 'e'].map((dir) => {
                                    const positions = {
                                        nw: { left: '-6px', top: '-6px', cursor: 'nw-resize' },
                                        ne: { right: '-6px', top: '-6px', cursor: 'ne-resize' },
                                        sw: { left: '-6px', bottom: '-6px', cursor: 'sw-resize' },
                                        se: { right: '-6px', bottom: '-6px', cursor: 'se-resize' },
                                        n: { left: '50%', top: '-6px', transform: 'translateX(-50%)', cursor: 'n-resize' },
                                        s: { left: '50%', bottom: '-6px', transform: 'translateX(-50%)', cursor: 's-resize' },
                                        w: { left: '-6px', top: '50%', transform: 'translateY(-50%)', cursor: 'w-resize' },
                                        e: { right: '-6px', top: '50%', transform: 'translateY(-50%)', cursor: 'e-resize' },
                                    }[dir];
                                    return (
                                        <div
                                            key={dir}
                                            className="absolute w-2 h-2 bg-blue-500 border border-white"
                                            style={positions}
                                            onMouseDown={(e) => {
                                                e.stopPropagation();
                                                handleMouseDown(e, dir);
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
