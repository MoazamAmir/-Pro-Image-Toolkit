import React, { useState, useEffect } from 'react';
import {
    Image as ImageIcon, FileText, Video,
    Play, Check, ChevronDown, Monitor,
    Link2, Globe, Lock, User, ArrowLeft, Instagram, LayoutGrid, Clipboard, MoreHorizontal,
    Search, Settings, Users, Link, Download as DownloadIcon, Eye, Instagram as InstagramIcon,
    Video as VideoIcon, Layout as LayoutIcon, Presentation, Copy as CopyIcon, MoreHorizontal as MoreHorizontalIcon,
    Plus, Sparkles, Crown, Info
} from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import pptxgen from 'pptxgenjs';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import GIF from 'gif.js';
import PageThumbnail from './PageThumbnail';
import FirebaseSyncService from '../services/FirebaseSyncService';
import LinkCopiedPopup from './LinkCopiedPopup';

const ExportManager = ({
    isOpen,
    onClose,
    pages = [],
    activePageId,
    layers = [],
    renderFinalCanvas,
    generateSVG,
    canvasSize,
    darkMode,
    designId,
    onDesignIdGenerated,
    canvasPreviewRef,
    adjustments,
    user
}) => {
    const [view, setView] = useState('share_design'); // Default to share_design view
    const [publicViewStatus, setPublicViewStatus] = useState('idle'); // 'idle', 'creating', 'live'
    const [publicLink, setPublicLink] = useState('');
    const [fileType, setFileType] = useState('PNG');
    const [size, setSize] = useState(1);
    const [compressFile, setCompressFile] = useState(false);
    const [transparentBg, setTransparentBg] = useState(false);
    const [selectedPages, setSelectedPages] = useState(['all']); // ['all'], ['current'], or [pageIds]
    const [savePreferences, setSavePreferences] = useState(true);

    const [showFileTypeDropdown, setShowFileTypeDropdown] = useState(false);
    const [showPageSelector, setShowPageSelector] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const [isCopying, setIsCopying] = useState(false);
    const [previewSrc, setPreviewSrc] = useState(null);

    // Share Design State
    const [accessLevel, setAccessLevel] = useState('private'); // 'private' or 'public'
    const [showLinkCopiedPopup, setShowLinkCopiedPopup] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Fetch existing access level
    useEffect(() => {
        if (designId) {
            FirebaseSyncService.getDesign(designId).then(data => {
                if (data && data.accessLevel) {
                    setAccessLevel(data.accessLevel);
                }
            });
        }
    }, [designId]);

    const handleAccessLevelChange = async (newLevel) => {
        setAccessLevel(newLevel);
        if (designId) {
            await FirebaseSyncService.updateDesign(designId, { accessLevel: newLevel });
        }
    };

    // Share link - point to the collaboration (edit) link
    const shareUrl = designId
        ? `${window.location.origin}/edit/${designId}`
        : window.location.href.split('#')[0];

    // Generate preview when opening public link view
    useEffect(() => {
        if (view === 'public_view_link' && !previewSrc) {
            const generatePreview = async () => {
                try {
                    if (canvasPreviewRef?.current) {
                        const src = canvasPreviewRef.current.toDataURL('image/jpeg', 0.5);
                        setPreviewSrc(src);
                    } else if (renderFinalCanvas) {
                        const canvas = await renderFinalCanvas(layers, adjustments, { scale: 0.5, transparent: false });
                        setPreviewSrc(canvas.toDataURL('image/jpeg', 0.5));
                    }
                } catch (e) {
                    console.error("Failed to generate preview", e);
                }
            };
            generatePreview();
        }
    }, [view, canvasPreviewRef, renderFinalCanvas, layers, adjustments, previewSrc]);

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

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const zip = new JSZip();
            const date = new Date().toISOString().split('T')[0];
            const baseFileName = `design_${date}`;

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
                if (ffmpeg) await ffmpeg.load();

                const generateForPage = async (page) => {
                    const gif = fileType === 'GIF' ? new GIF({
                        workers: 2, quality: 10,
                        width: (page.width || 1080) * size,
                        height: (page.height || 720) * size,
                        workerScript: '/gif.worker.js'
                    }) : null;

                    const duration = 3;
                    const fps = 15;
                    const totalFrames = duration * fps;

                    for (let i = 0; i < totalFrames; i++) {
                        const frameTime = (i / totalFrames) * duration;
                        const canvas = await renderFinalCanvas(page.layers, null, {
                            scale: size, transparent: transparentBg, frameTime, duration,
                            useOriginalResolution: true, limitResolution: true, isFrame: true
                        });

                        if (fileType === 'MP4' && ffmpeg) {
                            const frameData = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                            await ffmpeg.writeFile(`frame_${i.toString().padStart(3, '0')}.png`, await fetchFile(frameData));
                        } else if (fileType === 'GIF' && gif) {
                            gif.addFrame(canvas, { copy: true, delay: 1000 / fps });
                        }
                    }

                    if (fileType === 'MP4' && ffmpeg) {
                        await ffmpeg.exec(['-framerate', fps.toString(), '-i', 'frame_%03d.png', '-vf', 'pad=ceil(iw/2)*2:ceil(ih/2)*2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', 'output.mp4']);
                        const data = await ffmpeg.readFile('output.mp4');
                        return new Blob([data.buffer], { type: 'video/mp4' });
                    } else if (fileType === 'GIF' && gif) {
                        return new Promise((resolve) => {
                            gif.on('finished', (blob) => resolve(blob));
                            gif.render();
                        });
                    }
                    return null;
                };

                if (pagesToExport.length > 1) {
                    for (let i = 0; i < pagesToExport.length; i++) {
                        setExportProgress(Math.round((i / pagesToExport.length) * 100));
                        const blob = await generateForPage(pagesToExport[i]);
                        if (blob) zip.file(`page_${i + 1}.${fileType === 'MP4' ? 'mp4' : 'gif'}`, blob);
                    }
                    const content = await zip.generateAsync({ type: 'blob' });
                    saveAs(content, `${baseFileName}.zip`);
                } else {
                    const blob = await generateForPage(pagesToExport[0]);
                    if (blob) saveAs(blob, `${baseFileName}.${fileType === 'MP4' ? 'mp4' : 'gif'}`);
                }
            } else if (fileType === 'PDF_STD' || fileType === 'PDF_PRINT') {
                let pdf = null;
                for (let i = 0; i < pagesToExport.length; i++) {
                    const canvas = await renderFinalCanvas(pagesToExport[i].layers, null, { scale: size, transparent: transparentBg, useOriginalResolution: true });
                    if (canvas) {
                        if (!pdf) {
                            pdf = new jsPDF({ orientation: canvas.width > canvas.height ? 'l' : 'p', unit: 'px', format: [canvas.width, canvas.height] });
                        } else {
                            pdf.addPage([canvas.width, canvas.height], canvas.width > canvas.height ? 'l' : 'p');
                        }
                        pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, canvas.width, canvas.height);
                    }
                }
                if (pdf) {
                    const pdfBlob = pdf.output('blob');
                    zip.file(`${baseFileName}.pdf`, pdfBlob);
                    const content = await zip.generateAsync({ type: 'blob' });
                    saveAs(content, `${baseFileName}.zip`);
                }
            } else if (fileType === 'SVG') {
                if (pagesToExport.length > 1) {
                    for (let i = 0; i < pagesToExport.length; i++) zip.file(`page_${i + 1}.svg`, generateSVG(pagesToExport[i].layers));
                    const content = await zip.generateAsync({ type: 'blob' });
                    saveAs(content, `${baseFileName}.zip`);
                } else {
                    saveAs(new Blob([generateSVG(pagesToExport[0].layers)], { type: 'image/svg+xml' }), `${baseFileName}.svg`);
                }
            } else if (shouldZip) {
                for (let i = 0; i < pagesToExport.length; i++) {
                    const canvas = await renderFinalCanvas(pagesToExport[i].layers, null, { scale: size, transparent: transparentBg, useOriginalResolution: true });
                    if (canvas) {
                        const mime = fileType === 'JPG' ? 'image/jpeg' : 'image/png';
                        const blob = await new Promise(resolve => canvas.toBlob(resolve, mime, fileType === 'JPG' ? 0.9 : 1));
                        zip.file(`page_${i + 1}.${fileType === 'JPG' ? 'jpg' : 'png'}`, blob);
                    }
                }
                const content = await zip.generateAsync({ type: 'blob' });
                saveAs(content, `${baseFileName}.zip`);
            } else if (fileType === 'PPTX') {
                const pptx = new pptxgen();
                for (let i = 0; i < pagesToExport.length; i++) {
                    const canvas = await renderFinalCanvas(pagesToExport[i].layers, null, { scale: size, transparent: transparentBg, useOriginalResolution: true });
                    if (canvas) {
                        const slide = pptx.addSlide();
                        slide.addImage({ data: canvas.toDataURL('image/png'), x: 0, y: 0, w: '100%', h: '100%' });
                    }
                }
                const pptxBlob = await pptx.write('blob');
                saveAs(pptxBlob, `${baseFileName}.pptx`);
            } else {
                const canvas = await renderFinalCanvas(pagesToExport[0].layers, null, { scale: size, transparent: transparentBg, useOriginalResolution: true });
                if (canvas) {
                    const link = document.createElement('a');
                    link.download = `${baseFileName}.${fileType === 'JPG' ? 'jpg' : 'png'}`;
                    link.href = canvas.toDataURL(fileType === 'JPG' ? 'image/jpeg' : 'image/png', fileType === 'JPG' ? 0.9 : 1);
                    link.click();
                }
            }
            setIsExporting(false);
            onClose();
        } catch (err) {
            console.error('Export fail:', err);
            alert(`Export failed: ${err.message}.`);
            setIsExporting(false);
        }
    };

    const handleCopyLink = async () => {
        setIsCopying(true);
        let urlToCopy = shareUrl;

        // If no designId, we need to create one first to share
        if (!designId) {
            try {
                const currentState = {
                    pages: pages.map(p => p.id === activePageId ? { ...p, layers } : p),
                    activePageId,
                    canvasSize,
                    adjustments,
                    lastModified: Date.now()
                };
                const newDesignId = await FirebaseSyncService.createDesign(currentState, user?.uid);
                onDesignIdGenerated(newDesignId);
                urlToCopy = `${window.location.origin}/edit/${newDesignId}`;
            } catch (err) {
                console.error('Failed to create design for sharing:', err);
                setIsCopying(false);
                alert("Failed to create share link. Please try again.");
                return;
            }
        }

        navigator.clipboard.writeText(urlToCopy);
        setTimeout(() => setIsCopying(false), 2000);
    };

    const handleCreatePublicLink = async () => {
        setPublicViewStatus('creating');
        try {
            // Use current designId if it exists, otherwise create new
            let currentDesignId = designId;

            if (!currentDesignId) {
                // Prepare state for initial save
                const currentState = {
                    pages: pages.map(p => p.id === activePageId ? { ...p, layers } : p),
                    activePageId,
                    canvasSize,
                    adjustments,
                    lastModified: Date.now()
                };

                // Save to cloud for the first time
                currentDesignId = await FirebaseSyncService.createDesign(currentState, user?.uid);
                onDesignIdGenerated(currentDesignId);
            }

            if (currentDesignId) {
                const link = `${window.location.origin}/view/${currentDesignId}`;
                setPublicLink(link);
                setPublicViewStatus('live');
            }
        } catch (error) {
            console.error('Failed to create public link:', error);
            setPublicViewStatus('idle');
            alert("Failed to create public link. Please check your connection.");
        }
    };

    const ShareAction = ({ icon: Icon, label, onClick, badge }) => (
        <button onClick={onClick} className="flex flex-col items-center gap-1.5 group p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95">
            <div className="w-11 h-11 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/10 group-hover:border-purple-200 dark:group-hover:border-purple-900/30 group-hover:text-purple-600 transition-all relative">
                <Icon className="w-5 h-5" />
                {badge && <div className="absolute -top-1 -right-1">{badge}</div>}
            </div>
            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 text-center leading-tight group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{label}</span>
        </button>
    );

    const renderShareDesignView = () => (
        <div className="flex flex-col h-full animate-fadeIn">
            <div className="flex items-center justify-between px-4 py-2 border-b dark:border-gray-800">
                <h2 className="font-bold text-base dark:text-white">Share design</h2>
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /><span className="text-xs font-medium">0 visitors</span></div>
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><Settings className="w-4 h-4" /></button>
                </div>
            </div>
            <div className="px-4 space-y-3 pt-4 pb-4 overflow-y-auto flex-1 custom-scrollbar">

                {/* People with access */}
                <div className="space-y-2">
                    <label className="text-sm font-bold dark:text-white">People with access</label>
                    <div className="space-y-3">
                        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="Add people or groups" className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-950 border dark:border-gray-800 rounded-xl text-sm" /></div>

                        {/* Owner Badge */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden border border-white shadow-sm">
                                    <img src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.displayName || 'User'}`} alt={user?.displayName || 'User'} className="w-full h-full object-cover" />
                                </div>
                                <div className="w-8 h-8 rounded-full border border-gray-300 border-dashed flex items-center justify-center hover:bg-gray-50 cursor-pointer">
                                    <Plus className="w-4 h-4 text-gray-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Access Level */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold dark:text-white">Access level</label>
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full flex items-center justify-between p-2 border dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-all text-left"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300">
                                    {accessLevel === 'private' ? <Lock className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
                                </div>
                                <div>
                                    <div className="text-xs font-semibold dark:text-white">
                                        {accessLevel === 'private' ? 'Only you can access' : 'Anyone with the link'}
                                    </div>
                                </div>
                            </div>
                            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden animate-fadeIn">
                                <button
                                    onClick={() => { handleAccessLevelChange('private'); setIsDropdownOpen(false); }}
                                    className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${accessLevel === 'private' ? 'bg-purple-50 dark:bg-purple-900/10' : ''}`}
                                >
                                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium dark:text-gray-200">Only you can access</span>
                                    {accessLevel === 'private' && <Check className="w-4 h-4 text-purple-600 ml-auto" />}
                                </button>
                                <button
                                    onClick={() => { handleAccessLevelChange('public'); setIsDropdownOpen(false); }}
                                    className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${accessLevel === 'public' ? 'bg-purple-50 dark:bg-purple-900/10' : ''}`}
                                >
                                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                                        <Globe className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium dark:text-gray-200">Anyone with the link</span>
                                    {accessLevel === 'public' && <Check className="w-4 h-4 text-purple-600 ml-auto" />}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        onClick={() => {
                            if (accessLevel === 'private') {
                                handleCopyLink();
                                setShowLinkCopiedPopup(true);
                            } else {
                                handleCopyLink();
                            }
                        }}
                        className="w-full py-3 bg-[#8B3DFF] hover:bg-[#7a32e6] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-all"
                    >
                        <Link className="w-5 h-5" />
                        <span>Copy link</span>
                    </button>
                    {isCopying && <div className="text-center text-xs text-green-500 mt-2 font-medium">Link copied to clipboard!</div>}
                </div>

                <div className="h-px bg-gray-100 dark:bg-gray-800 my-2" />

                <div className="grid grid-cols-4 gap-2">
                    <ShareAction icon={DownloadIcon} label="Download" onClick={() => setView('download')} />
                    <ShareAction icon={Link} label="Public view link" onClick={() => setView('public_view_link')} />
                    <ShareAction icon={InstagramIcon} label="Instagram" onClick={() => { }} />
                    <ShareAction icon={VideoIcon} label="Present and record" onClick={() => { }} />
                </div>

                <div className="grid grid-cols-4 gap-2 pt-2">
                    <ShareAction icon={LayoutIcon} label="Template link" badge={<span className="text-orange-400">👑</span>} onClick={() => { }} />
                    <ShareAction icon={Presentation} label="Present" onClick={() => { }} />
                    <ShareAction icon={CopyIcon} label="Copy to clipboard" onClick={() => { }} />
                    <ShareAction icon={MoreHorizontalIcon} label="See all" onClick={() => { }} />
                </div>

            </div>
        </div>
    );

    const renderShareView = () => (
        <div className="flex flex-col h-full animate-fadeIn">
            <div className="flex items-center px-4 py-3 border-b dark:border-gray-800">
                <button onClick={() => setView('share_design')} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg mr-2 text-gray-500"><ArrowLeft className="w-5 h-5" /></button>
                <h2 className="font-bold text-lg dark:text-white">Collaborate</h2>
            </div>
            <div className="p-4 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-xl border border-purple-100 dark:border-purple-900/20">
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">Share this link to let others edit this design with you in real-time.</p>
                </div>
                <button onClick={handleCopyLink} className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center justify-center gap-3">
                    {isCopying ? <Check className="w-5 h-5" /> : <Link2 className="w-5 h-5" />}
                    <span>{isCopying ? 'Link copied!' : 'Copy collaboration link'}</span>
                </button>
            </div>
        </div>
    );

    const renderPublicViewLinkView = () => {
        return (
            <div className="flex flex-col h-full animate-fadeIn">
                <div className="flex items-center px-4 py-3 border-b dark:border-gray-800">
                    <button onClick={() => setView('share_design')} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg mr-2 text-gray-500"><ArrowLeft className="w-5 h-5" /></button>
                    <h2 className="font-bold text-lg dark:text-white">Public view link {publicViewStatus === 'live' && <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-600 text-[10px] rounded-full uppercase">Live</span>}</h2>
                </div>
                <div className="p-4 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                    {publicViewStatus !== 'live' ? (
                        <>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Create a public view link for a view-only version of this design.</p>
                            <div className="aspect-[3/2] w-full bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border dark:border-gray-700">
                                {previewSrc ? <img src={previewSrc} alt="Preview" className="w-full h-full object-contain" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-12 h-12 opacity-20" /></div>}
                            </div>
                            <button onClick={handleCreatePublicLink} disabled={publicViewStatus === 'creating'} className="w-full py-3 bg-[#8B3DFF] hover:bg-[#7a32e6] text-white font-bold rounded-xl flex items-center justify-center gap-2">
                                {publicViewStatus === 'creating' ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create public view link'}
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="aspect-[3/2] w-full bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border dark:border-gray-700">
                                {previewSrc && <img src={previewSrc} alt="Preview" className="w-full h-full object-contain" />}
                            </div>
                            <div className="space-y-3">
                                <label className="text-sm font-bold dark:text-white">Public view link</label>
                                <div className="flex gap-2">
                                    <input type="text" readOnly value={publicLink} className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-950 border dark:border-gray-800 rounded-xl text-sm" />
                                    <button onClick={() => { navigator.clipboard.writeText(publicLink); setIsCopying(true); setTimeout(() => setIsCopying(false), 2000); }} className="px-4 py-2 bg-[#8B3DFF] hover:bg-[#7a32e6] text-white font-bold rounded-xl text-sm">
                                        {isCopying ? <Check className="w-4 h-4" /> : 'Copy'}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    };

    const renderDownloadView = () => (
        <div className="flex flex-col h-full animate-fadeIn select-none">
            <div className="flex items-center px-4 py-2 border-b dark:border-gray-800">
                <button onClick={() => setView('share_design')} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg mr-2 text-gray-500"><ArrowLeft className="w-4 h-4" /></button>
                <h2 className="font-bold text-base dark:text-white">Download</h2>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar">

                {/* File Type */}
                <div className="space-y-2 relative">
                    <label className="text-xs font-bold dark:text-gray-200">File type</label>
                    <button
                        onClick={() => setShowFileTypeDropdown(!showFileTypeDropdown)}
                        className={`w-full flex items-center justify-between p-2 border ${showFileTypeDropdown ? 'border-purple-600 ring-1 ring-purple-600' : 'dark:border-gray-800'} rounded-xl bg-white dark:bg-gray-950 transition-all`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                {fileTypes.find(t => t.id === fileType)?.icon}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold dark:text-white">{fileTypes.find(t => t.id === fileType)?.label}</span>
                                {fileTypes.find(t => t.id === fileType)?.suggested && (
                                    <span className="bg-blue-600 text-white text-[9px] font-bold px-1 py-0.5 rounded">Suggested</span>
                                )}
                            </div>
                        </div>
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                    </button>

                    {showFileTypeDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden max-h-[300px] overflow-y-auto custom-scrollbar">
                            {fileTypes.map(type => (
                                <button
                                    key={type.id}
                                    onClick={() => { setFileType(type.id); setShowFileTypeDropdown(false); }}
                                    className={`w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${fileType === type.id ? 'bg-purple-50 dark:bg-purple-900/10' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                            {type.icon}
                                        </div>
                                        <div className="text-left">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold dark:text-white">{type.label}</span>
                                                {type.suggested && (
                                                    <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">Suggested</span>
                                                )}
                                                {type.premium && (
                                                    <Crown className="w-3 h-3 text-orange-400" />
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{type.desc}</div>
                                        </div>
                                    </div>
                                    {fileType === type.id && <Check className="w-4 h-4 text-purple-600" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Size */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-bold dark:text-gray-200">Size <span className="text-gray-400 text-[10px] font-normal ml-1">×</span></label>
                        <div className="flex items-center gap-2">
                            <div className="px-3 py-1.5 border dark:border-gray-800 rounded-lg text-sm bg-white dark:bg-gray-950 min-w-[50px] text-center font-medium dark:text-white flex items-center justify-center gap-1">
                                {size} <Crown className="w-3 h-3 text-orange-400" />
                            </div>
                        </div>
                    </div>
                    <div className="relative h-6 flex items-center">
                        <div className="absolute w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-600 rounded-full" style={{ width: `${((size - 0.5) / 2.5) * 100}%` }}></div>
                        </div>
                        <input
                            type="range" min="0.5" max="3" step="0.125"
                            value={size}
                            onChange={(e) => setSize(parseFloat(e.target.value))}
                            className="absolute w-full opacity-0 cursor-pointer h-full"
                        />
                        <div
                            className="w-5 h-5 bg-white border-2 border-purple-600 rounded-full shadow absolute pointer-events-none transition-all"
                            style={{ left: `calc(${((size - 0.5) / 2.5) * 100}% - 10px)` }}
                        />
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {Math.round(canvasSize.width * size)} × {Math.round(canvasSize.height * size)} px
                    </div>
                </div>

                {/* Options */}
                <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-4 h-4 rounded border border-gray-300 dark:border-gray-700 flex items-center justify-center group-hover:border-purple-500 transition-colors">
                            {/* Disabled logic for illustration */}
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-300">Limit file size</span>
                        <Info className="w-4 h-4 text-gray-400" />
                        <Crown className="w-3 h-3 text-orange-400 ml-auto" />
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group" onClick={() => setCompressFile(!compressFile)}>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${compressFile ? 'bg-purple-600 border-purple-600' : 'border-gray-300 dark:border-gray-700 group-hover:border-purple-500'}`}>
                            {compressFile && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-300">Compress file (lower quality)</span>
                        <Crown className="w-3 h-3 text-orange-400 ml-auto" />
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group" onClick={() => setTransparentBg(!transparentBg)}>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${transparentBg ? 'bg-purple-600 border-purple-600' : 'border-gray-300 dark:border-gray-700 group-hover:border-purple-500'}`}>
                            {transparentBg && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-300">Transparent background</span>
                        <Crown className="w-3 h-3 text-orange-400 ml-auto" />
                    </label>
                </div>

                {/* Select Pages */}
                <div className="space-y-2 relative">
                    <label className="text-sm font-bold dark:text-gray-200">Select pages</label>
                    <button
                        onClick={() => setShowPageSelector(!showPageSelector)}
                        className="w-full flex items-center justify-between p-3 border dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-all bg-white dark:bg-gray-950"
                    >
                        <span className="text-xs dark:text-white">
                            {selectedPages.includes('all') ? `All pages (${pages.length})` :
                                selectedPages.includes('current') ? `Current page (Page ${activePageId})` :
                                    `${selectedPages.length} selected`}
                        </span>
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showPageSelector ? 'rotate-180' : ''}`} />
                    </button>

                    {showPageSelector && (
                        <div className="absolute bottom-full mb-2 left-0 right-0 bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[300px]">
                            <div className="p-2 border-b dark:border-gray-700 overflow-y-auto custom-scrollbar flex-1 space-y-1">
                                <label className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
                                    <div
                                        onClick={() => setSelectedPages(['all'])}
                                        className={`w-5 h-5 rounded border flex items-center justify-center ${selectedPages.includes('all') ? 'bg-purple-600 border-purple-600' : 'border-gray-300 dark:border-gray-600'}`}
                                    >
                                        {selectedPages.includes('all') && <Check className="w-3.5 h-3.5 text-white" />}
                                    </div>
                                    <span className="text-sm font-medium dark:text-gray-200">All pages ({pages.length})</span>
                                </label>
                                <label className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
                                    <div
                                        onClick={() => setSelectedPages(['current'])}
                                        className={`w-5 h-5 rounded border flex items-center justify-center ${selectedPages.includes('current') ? 'bg-purple-600 border-purple-600' : 'border-gray-300 dark:border-gray-600'}`}
                                    >
                                        {selectedPages.includes('current') && <Check className="w-3.5 h-3.5 text-white" />}
                                    </div>
                                    <span className="text-sm font-medium dark:text-gray-200">Current page (Page {activePageId})</span>
                                </label>
                                <div className="h-px bg-gray-100 dark:bg-gray-800 my-1"></div>
                                {pages.map((p, i) => (
                                    <label key={p.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer group">
                                        <div
                                            onClick={() => {
                                                if (selectedPages.includes('all')) setSelectedPages([p.id]);
                                                else if (selectedPages.includes('current')) setSelectedPages([...pages.filter(pg => pg.id !== activePageId).map(pg => pg.id), p.id]);
                                                else {
                                                    const newSelection = selectedPages.includes(p.id)
                                                        ? selectedPages.filter(id => id !== p.id)
                                                        : [...selectedPages, p.id];
                                                    setSelectedPages(newSelection.length === pages.length ? ['all'] : newSelection.length === 0 ? ['current'] : newSelection);
                                                }
                                            }}
                                            className={`w-5 h-5 rounded border flex items-center justify-center ${selectedPages.includes(p.id) || selectedPages.includes('all') || (selectedPages.includes('current') && p.id === activePageId) ? 'bg-purple-600 border-purple-600' : 'border-gray-300 dark:border-gray-600'}`}
                                        >
                                            {(selectedPages.includes(p.id) || selectedPages.includes('all') || (selectedPages.includes('current') && p.id === activePageId)) && <Check className="w-3.5 h-3.5 text-white" />}
                                        </div>
                                        <div className="w-8 h-8 rounded border bg-gray-100 flex items-center justify-center overflow-hidden">
                                            <div className="w-full h-full bg-gray-200" />
                                        </div>
                                        <span className="text-sm font-medium dark:text-gray-200">Page {i + 1}</span>
                                        <span className="text-xs text-gray-400 ml-auto">Custom size</span>
                                    </label>
                                ))}
                            </div>
                            <div className="p-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                <button
                                    onClick={() => setShowPageSelector(false)}
                                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-sm transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Preferences */}
                <div className="pt-2">
                    <label className="text-sm font-bold dark:text-gray-200 mb-2 block">Preferences</label>
                    <label className="flex items-center gap-3 cursor-pointer group" onClick={() => setSavePreferences(!savePreferences)}>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${savePreferences ? 'bg-purple-600 border-purple-600' : 'border-gray-300 dark:border-gray-700 group-hover:border-purple-500'}`}>
                            {savePreferences && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">Save download settings</span>
                    </label>
                </div>

                <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-600/20 active:scale-[0.98] transition-all mt-4"
                >
                    {isExporting ? `Exporting ${exportProgress}%` : 'Download'}
                </button>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-none">
            <div className="absolute inset-0 pointer-events-auto" onClick={onClose} />
            <div className="absolute top-14 right-4 z-[1001] pointer-events-auto bg-white dark:bg-gray-900 w-[320px] rounded-xl shadow-2xl overflow-hidden border dark:border-gray-800 shadow-black/20 animate-slideDown flex flex-col" style={{ height: 'auto', maxHeight: 'calc(100vh - 100px)' }}>
                {view === 'share_design' ? renderShareDesignView() :
                    view === 'share' ? renderShareView() :
                        view === 'public_view_link' ? renderPublicViewLinkView() :
                            renderDownloadView()}
            </div>
            <style>{`
                @keyframes slideDown { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-slideDown { animation: slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .dark.custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
            `}</style>

            <LinkCopiedPopup
                isOpen={showLinkCopiedPopup}
                onClose={() => setShowLinkCopiedPopup(false)}
                onAllowAccess={() => {
                    handleAccessLevelChange('public');
                    setShowLinkCopiedPopup(false);
                }}
                onCopyPrivate={() => {
                    handleCopyLink(); // Copies private link again
                    setShowLinkCopiedPopup(false);
                }}
            />
        </div>
    );
};

export default ExportManager;
