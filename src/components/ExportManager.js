import React, { useState, useEffect, useRef } from 'react';
import {
    X, Download, Link, Share2, Settings, Users, Lock, ChevronDown,
    ChevronLeft, Image as ImageIcon, FileText, Smartphone, Monitor,
    Play, Music, Video, Sparkles, Check, Copy, Clipboard, MoreHorizontal,
    ArrowRight, Presentation, Instagram, ExternalLink, Info, CheckSquare, Square
} from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import pptxgen from 'pptxgenjs';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import GIF from 'gif.js';
import PageThumbnail from './PageThumbnail';

const ExportManager = ({
    isOpen,
    onClose,
    pages = [],
    activePageId,
    layers = [],
    renderFinalCanvas,
    generateSVG,
    canvasSize,
    darkMode
}) => {
    const [view, setView] = useState('share'); // 'share' or 'download'
    const [fileType, setFileType] = useState('PNG');
    const [size, setSize] = useState(1);
    const [limitFileSize, setLimitFileSize] = useState(false);
    const [compressFile, setCompressFile] = useState(false);
    const [transparentBg, setTransparentBg] = useState(false);
    const [selectedPages, setSelectedPages] = useState(['all']); // ['all'], ['current'], or [pageIds]
    const [savePreferences, setSavePreferences] = useState(true);

    const [showFileTypeDropdown, setShowFileTypeDropdown] = useState(false);
    const [showPageSelector, setShowPageSelector] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);

    // Load preferences from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('export_preferences');
        if (saved) {
            try {
                const prefs = JSON.parse(saved);
                setFileType(prefs.fileType || 'PNG');
                setSize(prefs.size || 1);
                setCompressFile(!!prefs.compressFile);
                setTransparentBg(!!prefs.transparentBg);
                setSavePreferences(true);
            } catch (e) {
                console.error("Failed to load export preferences", e);
            }
        }
    }, []);

    // Save preferences to localStorage
    useEffect(() => {
        if (savePreferences) {
            const prefs = { fileType, size, compressFile, transparentBg };
            localStorage.setItem('export_preferences', JSON.stringify(prefs));
        } else {
            localStorage.removeItem('export_preferences');
        }
    }, [fileType, size, compressFile, transparentBg, savePreferences]);

    if (!isOpen) return null;

    const fileTypes = [
        { id: 'JPG', label: 'JPG', desc: 'Best for sharing', icon: <ImageIcon className="w-4 h-4" /> },
        { id: 'PNG', label: 'PNG', desc: 'Best for complex images, illustrations', icon: <ImageIcon className="w-4 h-4" />, suggested: true },
        { id: 'PDF_STD', label: 'PDF Standard', desc: 'Best for documents (and emailing)', icon: <FileText className="w-4 h-4" /> },
        { id: 'PDF_PRINT', label: 'PDF Print', desc: 'Best for printing', icon: <FileText className="w-4 h-4" /> },
        { id: 'SVG', label: 'SVG', desc: 'Best for web design and animations', icon: <ImageIcon className="w-4 h-4" />, premium: true },
        { id: 'MP4', label: 'MP4 Video', desc: 'High quality video', icon: <Video className="w-4 h-4" /> },
        { id: 'GIF', label: 'GIF', desc: 'Short clip, no sound', icon: <Play className="w-4 h-4" /> },
        { id: 'PPTX', label: 'PPTX', desc: 'Microsoft PowerPoint document', icon: <Monitor className="w-4 h-4" /> },
    ];

    const handleBackToShare = () => setView('share');
    const handleOpenDownload = () => setView('download');

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const zip = new JSZip();
            const date = new Date().toISOString().split('T')[0];
            const baseFileName = `design_${date}`;

            // Determine which pages to export
            let pagesToExport = [];
            if (selectedPages.includes('all')) {
                pagesToExport = pages;
            } else if (selectedPages.includes('current')) {
                pagesToExport = pages.filter(p => p.id === activePageId);
            } else {
                pagesToExport = pages.filter(p => selectedPages.includes(p.id));
            }

            if (pagesToExport.length === 0) {
                alert("No pages selected for export.");
                setIsExporting(false);
                return;
            }

            setExportProgress(0);
            const shouldZip = pagesToExport.length > 1 && !['PDF_STD', 'PDF_PRINT', 'PPTX', 'SVG'].includes(fileType);

            if (fileType === 'MP4' || fileType === 'GIF') {
                const ffmpeg = fileType === 'MP4' ? new FFmpeg() : null;
                if (ffmpeg) {
                    await ffmpeg.load();
                }

                const gif = fileType === 'GIF' ? new GIF({
                    workers: 2,
                    quality: 10,
                    width: (pagesToExport[0]?.width || 1080) * size,
                    height: (pagesToExport[0]?.height || 720) * size,
                    workerScript: '/gif.worker.js'
                }) : null;

                const duration = 3; // 3 seconds animation
                const fps = 15; // 15 fps balance between quality and speed
                const totalFrames = duration * fps;
                const page = pagesToExport[0]; // Export first selected page as animation

                for (let i = 0; i < totalFrames; i++) {
                    const frameTime = (i / totalFrames) * duration;
                    const canvas = await renderFinalCanvas(page.layers, null, {
                        scale: size,
                        transparent: transparentBg,
                        frameTime,
                        duration,
                        useOriginalResolution: true // Ensure high quality base even for video
                    });

                    if (fileType === 'MP4' && ffmpeg) {
                        const frameData = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                        await ffmpeg.writeFile(`frame_${i.toString().padStart(3, '0')}.png`, await fetchFile(frameData));
                    } else if (fileType === 'GIF' && gif) {
                        gif.addFrame(canvas, { copy: true, delay: 1000 / fps });
                    }

                    setExportProgress(Math.round((i / totalFrames) * 80)); // 0-80% for capturing
                }

                if (fileType === 'MP4' && ffmpeg) {
                    setExportProgress(85);
                    await ffmpeg.exec(['-framerate', fps.toString(), '-i', 'frame_%03d.png', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', 'output.mp4']);
                    const data = await ffmpeg.readFile('output.mp4');
                    saveAs(new Blob([data.buffer], { type: 'video/mp4' }), `${baseFileName}.mp4`);
                } else if (fileType === 'GIF' && gif) {
                    setExportProgress(85);
                    gif.on('finished', (blob) => {
                        saveAs(blob, `${baseFileName}.gif`);
                        setExportProgress(100);
                        setIsExporting(false);
                    });
                    gif.render();
                    return; // exit early as gif.on('finished') handles the end
                }
                setExportProgress(100);
            } else if (fileType === 'PDF_STD' || fileType === 'PDF_PRINT') {
                let pdf = null;
                // PDF Logic: Always ZIP
                // Iterate through selected pages
                for (let i = 0; i < pagesToExport.length; i++) {
                    // Use original resolution for highest quality
                    const canvas = await renderFinalCanvas(pagesToExport[i].layers, null, {
                        scale: size,
                        transparent: transparentBg,
                        useOriginalResolution: true
                    });

                    if (canvas) {
                        if (!pdf) {
                            pdf = new jsPDF({
                                orientation: canvas.width > canvas.height ? 'l' : 'p',
                                unit: 'px',
                                format: [canvas.width, canvas.height]
                            });
                        } else {
                            pdf.addPage([canvas.width, canvas.height], canvas.width > canvas.height ? 'l' : 'p');
                        }

                        const imgData = canvas.toDataURL('image/jpeg', 0.95);
                        pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
                    }
                }

                if (pdf) {
                    const pdfBlob = pdf.output('blob');
                    // ALWAYS put PDF in ZIP as requested
                    zip.file(`${baseFileName}.pdf`, pdfBlob);
                    const content = await zip.generateAsync({ type: 'blob' });
                    saveAs(content, `${baseFileName}.zip`);
                }
            } else if (fileType === 'SVG') {
                if (pagesToExport.length > 1) {
                    for (let i = 0; i < pagesToExport.length; i++) {
                        const svgData = generateSVG(pagesToExport[i].layers);
                        zip.file(`page_${i + 1}.svg`, svgData);
                    }
                    const content = await zip.generateAsync({ type: 'blob' });
                    saveAs(content, `${baseFileName}.zip`);
                } else {
                    const svgData = generateSVG(pagesToExport[0].layers);
                    const blob = new Blob([svgData], { type: 'image/svg+xml' });
                    saveAs(blob, `${baseFileName}.svg`);
                }
            } else if (shouldZip) {
                // ZIP of images
                for (let i = 0; i < pagesToExport.length; i++) {
                    const canvas = await renderFinalCanvas(pagesToExport[i].layers, null, {
                        scale: size,
                        transparent: transparentBg,
                        useOriginalResolution: true
                    });
                    if (canvas) {
                        const ext = fileType === 'JPG' ? 'jpg' : 'png';
                        const mime = fileType === 'JPG' ? 'image/jpeg' : 'image/png';
                        const blob = await new Promise(resolve => canvas.toBlob(resolve, mime, fileType === 'JPG' ? 0.9 : 1));
                        zip.file(`page_${i + 1}.${ext}`, blob);
                    }
                }
                const content = await zip.generateAsync({ type: 'blob' });
                saveAs(content, `${baseFileName}.zip`);
            } else if (fileType === 'PPTX') {
                const pptx = new pptxgen();
                for (let i = 0; i < pagesToExport.length; i++) {
                    const canvas = await renderFinalCanvas(pagesToExport[i].layers, null, {
                        scale: size,
                        transparent: transparentBg,
                        useOriginalResolution: true
                    });
                    if (canvas) {
                        const slide = pptx.addSlide();
                        slide.addImage({
                            data: canvas.toDataURL('image/png'),
                            x: 0, y: 0,
                            w: '100%', h: '100%'
                        });
                    }
                }
                const pptxBlob = await pptx.write('blob');
                // Wrap PPTX in ZIP for consistency if user desires, but prompt didn't explicitly ask for PPTX in zip, 
                // only "jo pdf ha wo zip ka ander he downlode honi chay". 
                // Sticking to standard download for PPTX for now unless "shouldZip" is true (multi-page).
                // Actually, "User: ...method bas mp4 vedio and gift ka laya ha baki sara usi tara he downlode ho"
                // meaning others should follow similar logic. But "zip ka ander jab pdf ma type select kar" implies specific rule for PDF.
                saveAs(pptxBlob, `${baseFileName}.pptx`);
            } else {
                // Single image export
                const page = pagesToExport[0];
                const canvas = await renderFinalCanvas(page.layers, null, {
                    scale: size,
                    transparent: transparentBg,
                    useOriginalResolution: true
                });
                if (canvas) {
                    const ext = fileType === 'JPG' ? 'jpg' : 'png';
                    const mime = fileType === 'JPG' ? 'image/jpeg' : 'image/png';
                    const link = document.createElement('a');
                    link.download = `${baseFileName}.${ext}`;
                    link.href = canvas.toDataURL(mime, fileType === 'JPG' ? 0.9 : 1);
                    link.click();
                }
            }

            setIsExporting(false);
            onClose();
        } catch (err) {
            console.error('Export fail:', err);
            alert(`Export failed: ${err.message || 'Unknown error'}. Please check if all images are loaded correctly.`);
            setIsExporting(false);
        }
    };

    const renderShareView = () => (
        <div className="flex flex-col h-full animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-1.5 border-b dark:border-gray-800">
                <div className="flex items-center gap-2">
                    <h2 className="font-bold text-sm dark:text-white">Share design</h2>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-[9px] text-gray-500">
                        <Monitor className="w-3 h-3" />
                        <span>0 visitors</span>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                </div>
            </div>

            <div className="p-2.5 space-y-2.5 overflow-y-auto flex-1 custom-scrollbar">
                {/* Access Level */}
                <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-700 dark:text-gray-300 uppercase">Access level</label>
                    <button className="w-full flex items-center justify-between p-2 border rounded-lg dark:bg-gray-900 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-center gap-2">
                            <div className="p-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                                <Lock className="w-3 h-3 text-gray-600" />
                            </div>
                            <span className="text-[11px] dark:text-white">Only you can access</span>
                        </div>
                        <ChevronDown className="w-3 h-3 text-gray-400" />
                    </button>
                </div>

                {/* Big purple button */}
                <button
                    onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        alert("Link copied to clipboard!");
                    }}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-1.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 active:scale-[0.98] transition-all text-xs"
                >
                    <Link className="w-3 h-3" />
                    <span>Copy link</span>
                </button>

                <div className="h-px bg-gray-100 dark:bg-gray-800" />

                {/* Grid of actions */}
                <div className="grid grid-cols-4 gap-1 pb-1">
                    {[
                        { icon: <Download className="w-3.5 h-3.5" />, label: 'Download', onClick: handleOpenDownload },
                        { icon: <ExternalLink className="w-3.5 h-3.5" />, label: 'Public view link' },
                        { icon: <Instagram className="w-3.5 h-3.5" />, label: 'Instagram' },
                        { icon: <div className="relative"><ImageIcon className="w-3.5 h-3.5" /><Sparkles className="w-1.5 h-1.5 text-amber-500 absolute -top-1 -right-1" /></div>, label: 'Template link' },
                        { icon: <Presentation className="w-3.5 h-3.5" />, label: 'Present' },
                        { icon: <Video className="w-3.5 h-3.5" />, label: 'Present and record' },
                        {
                            icon: <Clipboard className="w-3.5 h-3.5" />, label: 'Copy to clipboard', onClick: () => {
                                navigator.clipboard.writeText("Design Content Placeholder");
                                alert("Copied to clipboard!");
                            }
                        },
                        { icon: <MoreHorizontal className="w-3.5 h-3.5" />, label: 'See all' },
                    ].map((item, idx) => (
                        <button
                            key={idx}
                            onClick={item.onClick}
                            className="flex flex-col items-center gap-1 group py-1"
                        >
                            <div className="w-9 h-9 rounded-full border dark:border-gray-800 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group-hover:scale-105">
                                {item.icon}
                            </div>
                            <span className="text-[8px] text-center text-gray-600 dark:text-gray-400 font-medium leading-tight">
                                {item.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderDownloadView = () => (
        <div className="flex flex-col h-full animate-fadeIn">
            {/* Header */}
            <div className="flex items-center px-1.5 py-1.5 border-b dark:border-gray-800">
                <button onClick={handleBackToShare} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="font-bold text-base dark:text-white ml-1">Download</h2>
            </div>

            <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                {/* File Type */}
                <div className="space-y-1 relative">
                    <label className="text-[9px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">File type</label>
                    <button
                        onClick={() => setShowFileTypeDropdown(!showFileTypeDropdown)}
                        className="w-full flex items-center justify-between p-1.5 border rounded-lg dark:bg-gray-900 dark:border-gray-800 hover:border-purple-500 transition-all text-xs"
                    >
                        <div className="flex items-center gap-2">
                            {fileTypes.find(t => t.id === fileType)?.icon}
                            <span className="dark:text-white font-medium">{fileTypes.find(t => t.id === fileType)?.label}</span>
                            {fileTypes.find(t => t.id === fileType)?.suggested && (
                                <span className="bg-blue-600 text-white text-[7px] px-1.5 py-0.5 rounded-full font-bold">Recommended</span>
                            )}
                        </div>
                        <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform ${showFileTypeDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showFileTypeDropdown && (
                        <div
                            className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-slideUp"
                            style={{ maxHeight: '180px', overflowY: 'auto' }}
                        >
                            {fileTypes.map(type => (
                                <button
                                    key={type.id}
                                    onClick={() => {
                                        setFileType(type.id);
                                        setShowFileTypeDropdown(false);
                                    }}
                                    className={`w-full flex items-center justify-between p-1.5 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-left transition-colors ${fileType === type.id ? 'bg-purple-50 dark:bg-purple-900/10' : ''}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="text-gray-600 dark:text-gray-400">{type.icon}</div>
                                        <div>
                                            <span className="text-[11px] font-bold dark:text-white">{type.label}</span>
                                            <p className="text-[8px] text-gray-500 leading-tight">{type.desc}</p>
                                        </div>
                                    </div>
                                    {fileType === type.id && <Check className="w-3 h-3 text-purple-600" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Size Slider */}
                {(['PNG', 'JPG', 'SVG'].includes(fileType)) && (
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <label className="text-[9px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Size <span className="text-gray-400">×</span></label>
                            <div className="px-1.5 py-0.5 border rounded-lg dark:bg-gray-900 dark:border-gray-800 text-[9px] font-bold w-8 text-center">
                                {size}
                            </div>
                        </div>
                        <input
                            type="range"
                            min="0.5"
                            max="3"
                            step="0.5"
                            value={size}
                            onChange={(e) => setSize(parseFloat(e.target.value))}
                            className="w-full accent-purple-600 h-1 bg-gray-200 dark:bg-gray-800 rounded-lg cursor-pointer"
                        />
                        <p className="text-[8px] text-gray-400 text-center">1,344 × 768 px</p>
                    </div>
                )}

                {/* Checkbox Options */}
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setTransparentBg(!transparentBg)}>
                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${transparentBg ? 'bg-purple-600 border-purple-600' : 'border-gray-300 dark:border-gray-700'}`}>
                            {transparentBg && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <span className="text-[11px] dark:text-gray-200">Transparent background</span>
                    </div>

                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setCompressFile(!compressFile)}>
                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${compressFile ? 'bg-purple-600 border-purple-600' : 'border-gray-300 dark:border-gray-700'}`}>
                            {compressFile && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <span className="text-[11px] dark:text-gray-200">Compress file</span>
                    </div>
                </div>

                {/* Select Pages */}
                <div className="space-y-1 relative">
                    <label className="text-[9px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Select pages</label>
                    <button
                        onClick={() => setShowPageSelector(!showPageSelector)}
                        className="w-full flex items-center justify-between p-1.5 border rounded-lg dark:bg-gray-900 dark:border-gray-800 hover:border-purple-500 transition-all text-xs"
                    >
                        <span className="dark:text-white font-medium">
                            {selectedPages.includes('all') ? `All Pages (${(pages || []).length})` :
                                selectedPages.includes('current') ? `Current Page (${(pages || []).findIndex(p => p.id === activePageId) + 1})` :
                                    `${selectedPages.length} selected`}
                        </span>
                        <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform ${showPageSelector ? 'rotate-180' : ''}`} />
                    </button>

                    {showPageSelector && (
                        <div className="absolute top-0 left-0 right-0 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-2xl z-[60] overflow-hidden animate-slideUp">
                            <div className="flex items-center justify-between px-3 py-2 border-b dark:border-gray-700">
                                <span className="text-xs font-bold dark:text-white">Select pages</span>
                                <button onClick={() => setShowPageSelector(false)} className="text-[10px] text-purple-600 font-bold hover:underline">Done</button>
                            </div>
                            <div className="p-2 space-y-2 overflow-y-auto" style={{ maxHeight: '220px' }}>
                                <div
                                    className="flex items-center gap-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer border-b dark:border-gray-800 pb-2"
                                    onClick={() => setSelectedPages(['all'])}
                                >
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedPages.includes('all') ? 'bg-purple-600 border-purple-600' : 'border-gray-300 dark:border-gray-600'}`}>
                                        {selectedPages.includes('all') && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <span className="text-xs font-medium dark:text-white">All pages ({(pages || []).length})</span>
                                </div>

                                <div className="grid grid-cols-1 gap-1 pt-1">
                                    {(pages || []).map((page, index) => {
                                        const isSelected = selectedPages.includes('all') || selectedPages.includes(page.id) || (selectedPages.includes('current') && page.id === activePageId);
                                        return (
                                            <div
                                                key={page.id}
                                                className={`flex items-center gap-3 p-1.5 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-purple-50 dark:bg-purple-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                                onClick={() => {
                                                    let newSelected;
                                                    if (selectedPages.includes('all')) {
                                                        newSelected = pages.filter(p => p.id !== page.id).map(p => p.id);
                                                    } else if (selectedPages.includes('current')) {
                                                        if (page.id === activePageId) {
                                                            newSelected = [];
                                                        } else {
                                                            newSelected = [activePageId, page.id];
                                                        }
                                                    } else if (selectedPages.includes(page.id)) {
                                                        newSelected = selectedPages.filter(id => id !== page.id);
                                                    } else {
                                                        newSelected = [...selectedPages, page.id];
                                                    }

                                                    if (newSelected.length === pages.length) {
                                                        setSelectedPages(['all']);
                                                    } else {
                                                        setSelectedPages(newSelected);
                                                    }
                                                }}
                                            >
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300 dark:border-gray-600'}`}>
                                                    {isSelected && <Check className="w-3 h-3 text-white" />}
                                                </div>
                                                <div className="w-10 h-7 rounded border dark:border-gray-700 overflow-hidden bg-gray-50 shrink-0">
                                                    <PageThumbnail layers={page.layers || []} canvasSize={{ width: page.width, height: page.height }} />
                                                </div>
                                                <span className="text-xs dark:text-white truncate">Page {index + 1}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Save Preferences */}
                <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => setSavePreferences(!savePreferences)}>
                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${savePreferences ? 'bg-purple-600 border-purple-600' : 'border-gray-300 dark:border-gray-700'}`}>
                        {savePreferences && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <span className="text-[11px] dark:text-gray-200">Save download settings</span>
                </div>

                {/* Download Button */}
                <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold py-2 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 active:scale-[0.98] transition-all text-sm mt-1"
                >
                    {isExporting ? (
                        <>
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>{exportProgress > 0 ? `Exporting ${exportProgress}%` : 'Exporting...'}</span>
                        </>
                    ) : (
                        <span>Download</span>
                    )}
                </button>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[1000] pointer-events-none">
            {/* Transparent backdrop to catch clicks for closing */}
            <div
                className="absolute inset-0 pointer-events-auto bg-black/5 sm:bg-transparent"
                onClick={onClose}
            />

            <div
                className="absolute top-14 right-4 z-[1001] pointer-events-auto bg-white dark:bg-gray-900 w-[340px] rounded-xl shadow-2xl overflow-hidden border dark:border-gray-800 shadow-black/20 animate-slideDown flex flex-col"
                style={{ height: 'auto', maxHeight: 'calc(100vh - 80px)' }}
            >
                {view === 'share' ? renderShareView() : renderDownloadView()}
            </div>

            <style>{`
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-slideDown { animation: slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
                
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #334155;
                }
            `}</style>
        </div>
    );
};

export default ExportManager;
