import React, { useState, useEffect } from 'react';
import {
    Image as ImageIcon, FileText,
    Play, Check, ChevronDown, Monitor,
    Link2, Globe, Lock, User, ArrowLeft, Instagram, LayoutGrid, Clipboard, MoreHorizontal,
    Search, Settings, Users, Link, Download as DownloadIcon, Eye,
    Video as VideoIcon, Layout as LayoutIcon, Presentation, Copy as CopyIcon,
    Plus, Crown, Info, Maximize, MonitorPlay, Mic, X
} from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import pptxgen from 'pptxgenjs';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import GIF from 'gif.js';
import PageThumbnail from './PageThumbnail';
import FirebaseSyncService from '../services/FirebaseSyncService';
import LinkCopiedPopup from './LinkCopiedPopup';

/* ─── Design Tokens ─── */
const tokens = {
    brand: '#6366f1',
    brandHover: '#4f46e5',
    brandLight: 'rgba(99,102,241,0.15)',
    success: '#1D9E75',
    danger: '#E24B4A',
    amber: '#BA7517',
};

/* ─── Small reusable atoms ─── */
const Label = ({ children, className = '' }) => (
    <span className={`block text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 dark:text-gray-500 mb-1.5 ${className}`}>
        {children}
    </span>
);

const Divider = () => <div className="h-px bg-gray-100 dark:bg-gray-800 my-1" />;

const BrandButton = ({ onClick, disabled, children, className = '', size = 'default' }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full flex items-center justify-center gap-2 font-semibold rounded-xl transition-all active:scale-[.98] disabled:opacity-60
      ${size === 'sm' ? 'py-2.5 text-xs' : 'py-3.5 text-sm'}
      bg-gradient-to-tr from-[#6366f1] to-[#a855f7] hover:from-[#4f46e5] hover:to-[#9333ea] text-white shadow-[0_4px_20px_rgba(99,102,241,0.4)]
      ${className}`}
    >
        {children}
    </button>
);

const GhostButton = ({ onClick, children, className = '' }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-[.98] ${className}`}
    >
        {children}
    </button>
);

const BackButton = ({ onClick }) => (
    <button
        onClick={onClick}
        className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mr-2 flex-shrink-0"
    >
        <ArrowLeft className="w-4 h-4" />
    </button>
);

const ProBadge = () => (
    <span className="ml-auto flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
        PRO
    </span>
);

const SuggestedBadge = () => (
    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
        SUGGESTED
    </span>
);

const CheckBox = ({ checked, onChange }) => (
    <div
        onClick={onChange}
        className={`w-4 h-4 rounded-[4px] border flex items-center justify-center flex-shrink-0 cursor-pointer transition-all
      ${checked ? 'bg-[#6C47FF] border-[#6C47FF]' : 'border-gray-300 dark:border-gray-600 hover:border-[#6C47FF]'}`}
    >
        {checked && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
    </div>
);

/* ─── Action tile for grid ─── */
const ActionTile = ({ icon: Icon, label, onClick, badge }) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center gap-1.5 p-2.5 rounded-[20px] border border-slate-100 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm hover:bg-purple-50 dark:hover:bg-purple-900/10 hover:border-purple-200 dark:hover:border-purple-900/30 transition-all group active:scale-95"
    >
        <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-500 group-hover:text-[#6C47FF] group-hover:border-purple-200 dark:group-hover:border-purple-900/40 transition-all relative">
            <Icon className="w-4 h-4" />
            {badge && <div className="absolute -top-1.5 -right-1.5">{badge}</div>}
        </div>
        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 text-center leading-tight group-hover:text-[#6C47FF] transition-colors uppercase tracking-wide">{label}</span>
    </button>
);

/* ─── View header ─── */
const ViewHeader = ({ title, onBack, extra }) => (
    <div className="flex items-center px-5 py-4 border-b border-slate-200/40 dark:border-slate-800/40 bg-white/10 dark:bg-slate-950/20 backdrop-blur-md">
        {onBack && <BackButton onClick={onBack} />}
        <h2 className="font-semibold text-sm text-gray-900 dark:text-white flex-1">{title}</h2>
        {extra}
    </div>
);

/* ─── File type data ─── */
const fileTypes = [
    { id: 'PNG', label: 'PNG', desc: 'Best for illustrations & web', icon: ImageIcon, suggested: true },
    { id: 'JPG', label: 'JPG', desc: 'Best for sharing', icon: ImageIcon },
    { id: 'PDF_STD', label: 'PDF Standard', desc: 'Best for documents & email', icon: FileText },
    { id: 'PDF_PRINT', label: 'PDF Print', desc: 'Best for printing', icon: FileText },
    { id: 'SVG', label: 'SVG', desc: 'Best for web & animations', icon: ImageIcon, premium: true },
    { id: 'MP4', label: 'MP4 Video', desc: 'High quality video', icon: VideoIcon },
    { id: 'GIF', label: 'GIF', desc: 'Short clip, no sound', icon: Play },
    { id: 'PPTX', label: 'PPTX', desc: 'Microsoft PowerPoint', icon: Monitor },
];

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
const ExportManager = ({
    isOpen, onClose, pages = [], activePageId, layers = [],
    renderFinalCanvas, generateSVG, canvasSize, darkMode,
    designId, onDesignIdGenerated, canvasPreviewRef, adjustments,
    user, onStartRecordingStudio, onStartPresentation, designAudios = [],
    localInstanceId
}) => {
    const [view, setView] = useState('share_design');
    const [publicViewStatus, setPublicViewStatus] = useState('idle');
    const [publicLink, setPublicLink] = useState('');
    const [fileType, setFileType] = useState('PNG');
    const [size, setSize] = useState(1);
    const [compressFile, setCompressFile] = useState(false);
    const [transparentBg, setTransparentBg] = useState(false);
    const [selectedPages, setSelectedPages] = useState(['all']);
    const [savePreferences, setSavePreferences] = useState(true);
    const [showFileTypeDropdown, setShowFileTypeDropdown] = useState(false);
    const [showPageSelector, setShowPageSelector] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const [isCopying, setIsCopying] = useState(false);
    const [previewSrc, setPreviewSrc] = useState(null);
    const [presentMode, setPresentMode] = useState('fullscreen');
    const [accessLevel, setAccessLevel] = useState('private');
    const [showLinkCopiedPopup, setShowLinkCopiedPopup] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [activeUsers, setActiveUsers] = useState([]);
    const [ownerId, setOwnerId] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        if (designId) {
            FirebaseSyncService.getDesign(designId).then(data => {
                if (data?.accessLevel) setAccessLevel(data.accessLevel);
                if (data?.ownerId) setOwnerId(data.ownerId);
            });

            const unsubscribePresence = FirebaseSyncService.listenToPresence(designId, (users) => {
                const uniqueUsers = Array.from(new Map(users.map(u => [u.userId, u])).values());
                setActiveUsers(uniqueUsers);
            });

            const presenceId = user?.uid || `guest_${Math.random().toString(36).substr(2, 6)}`;
            const presenceData = {
                userId: presenceId,
                displayName: user?.displayName || 'Guest User',
                email: user?.email || '',
                photoURL: user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.displayName || presenceId}`,
                lastSeen: Date.now(),
                isGuest: !user
            };

            FirebaseSyncService.updatePresence(designId, presenceId, presenceData);

            return () => {
                if (unsubscribePresence) unsubscribePresence();
                if (designId) FirebaseSyncService.clearPresence(designId, presenceId);
            };
        }
    }, [designId, user]);

    const handleAccessLevelChange = async (newLevel) => {
        setAccessLevel(newLevel);
        if (designId) await FirebaseSyncService.updateDesign(designId, { accessLevel: newLevel });
    };

    const shareUrl = designId
        ? `${window.location.origin}/edit/${designId}`
        : window.location.href.split('#')[0];

    useEffect(() => {
        if (['public_view_link', 'present_and_record', 'present'].includes(view) && !previewSrc) {
            (async () => {
                try {
                    if (canvasPreviewRef?.current) {
                        setPreviewSrc(canvasPreviewRef.current.toDataURL('image/jpeg', 0.5));
                    } else if (renderFinalCanvas) {
                        const canvas = await renderFinalCanvas(layers, adjustments, { scale: 0.5, transparent: false });
                        setPreviewSrc(canvas.toDataURL('image/jpeg', 0.5));
                    }
                } catch (e) { console.error(e); }
            })();
        }
    }, [view, previewSrc, canvasPreviewRef, renderFinalCanvas, layers, adjustments]);

    useEffect(() => {
        const saved = localStorage.getItem('export_preferences');
        if (saved) {
            try {
                const p = JSON.parse(saved);
                setFileType(p.fileType || 'PNG');
                setSize(p.size || 1);
                setCompressFile(!!p.compressFile);
                setTransparentBg(!!p.transparentBg);
            } catch (e) { }
        }
    }, []);

    useEffect(() => {
        if (savePreferences) {
            localStorage.setItem('export_preferences', JSON.stringify({ fileType, size, compressFile, transparentBg }));
        } else {
            localStorage.removeItem('export_preferences');
        }
    }, [fileType, size, compressFile, transparentBg, savePreferences]);

    if (!isOpen) return null;

    /* ── Export logic ── */
    const handleExport = async () => {
        setIsExporting(true);
        try {
            const zip = new JSZip();
            const date = new Date().toISOString().split('T')[0];
            const baseFileName = `design_${date}`;
            let pagesToExport = selectedPages.includes('all') ? pages
                : selectedPages.includes('current') ? pages.filter(p => p.id === activePageId)
                    : pages.filter(p => selectedPages.includes(p.id));

            if (!pagesToExport.length) { alert("No pages selected."); setIsExporting(false); return; }
            setExportProgress(0);
            const shouldZip = pagesToExport.length > 1 && !['PDF_STD', 'PDF_PRINT', 'PPTX', 'SVG'].includes(fileType);

            if (fileType === 'MP4' || fileType === 'GIF') {
                const ffmpeg = fileType === 'MP4' ? new FFmpeg() : null;
                if (ffmpeg) {
                    try {
                        let loaded = false;
                        const cdnSources = [
                            'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd',
                            'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd'
                        ];
                        for (const source of cdnSources) {
                            if (loaded) break;
                            try {
                                const coreURL = await toBlobURL(`${source}/ffmpeg-core.js`, 'text/javascript');
                                const wasmURL = await toBlobURL(`${source}/ffmpeg-core.wasm`, 'application/wasm');
                                const workerURL = await toBlobURL(`${source}/ffmpeg-core.worker.js`, 'text/javascript');
                                await ffmpeg.load({ coreURL, wasmURL, workerURL });
                                loaded = true;
                                console.log(`[Export] FFmpeg loaded from: ${source}`);
                            } catch (e) {
                                console.warn(`[Export] FFmpeg load failed for ${source}:`, e);
                            }
                        }
                        if (!loaded) throw new Error('All FFmpeg sources failed to load.');
                    } catch (loadErr) {
                        console.error('[Export] FFmpeg load failed:', loadErr);
                        throw new Error('FFmpeg failed to load. Please try again.');
                    }
                }

                const hasAudio = designAudios.length > 0 && fileType === 'MP4';

                if (hasAudio) {
                    const audioFiles = [];

                    // --- Pixel-to-Seconds conversion ---
                    // Timeline UI: each page = 80px wide + 12px gap = 92px per slot, each page = 3.0s
                    const PAGE_SLOT_PX = 92;
                    const PAGE_CONTENT_PX = 80;
                    const SECONDS_PER_PAGE = 3.0;

                    const pxToSec = (px) => {
                        const fullPages = Math.floor(px / PAGE_SLOT_PX);
                        const remainderPx = px - (fullPages * PAGE_SLOT_PX);
                        const secInPage = (Math.min(remainderPx, PAGE_CONTENT_PX) / PAGE_CONTENT_PX) * SECONDS_PER_PAGE;
                        return fullPages * SECONDS_PER_PAGE + secInPage;
                    };

                    // --- Load audio tracks ---
                    for (let i = 0; i < designAudios.length; i++) {
                        const track = designAudios[i];
                        if (track.muted) continue;
                        try {
                            console.log(`[Export] Loading audio track ${i + 1}/${designAudios.length}: ${track.name}`);

                            const response = await fetch(track.url);
                            if (!response.ok) throw new Error(`Failed to fetch audio: ${response.status}`);

                            const audioBlob = await response.blob();
                            const audioData = await fetchFile(audioBlob);
                            const fileName = `audio_${i}.mp3`;

                            await ffmpeg.writeFile(fileName, audioData);
                            console.log(`[Export] Audio track ${i + 1} loaded (${audioBlob.size} bytes)`);

                            const trimStart = track.trimStart || 0;
                            const trimEnd = track.trimEnd || track.duration || 0;
                            const audioDur = trimEnd - trimStart;

                            // Convert pixel position to seconds
                            const startTimeSec = pxToSec(track.startTime || 0);

                            audioFiles.push({
                                ...track,
                                fileName,
                                trimStart,
                                trimEnd,
                                actualDuration: audioDur,
                                startTimeSec
                            });
                        } catch (e) {
                            console.error(`[Export] Failed to load audio track ${i + 1}:`, e);
                        }
                    }

                    if (audioFiles.length === 0) {
                        console.warn('[Export] No audio tracks loaded, exporting video only');
                    }

                    // --- Calculate per-page durations based on audio coverage ---
                    const fps = 30;
                    const transitionDuration = 0.5;
                    const MIN_PAGE_DURATION = 3.0; // Minimum 3 seconds per page

                    // For each page, calculate exact audio coverage
                    const pageDurations = pagesToExport.map((page, pageIdx) => {
                        const pageStartPx = pageIdx * PAGE_SLOT_PX;
                        const pageEndPx = pageStartPx + PAGE_CONTENT_PX;

                        let totalAudioCoverage = 0;

                        for (const track of audioFiles) {
                            const trackStartPx = track.startTime || 0;
                            const trackEndPx = trackStartPx + (track.width || 0);
                            const totalTrackWidthPx = trackEndPx - trackStartPx;

                            // Check if this audio overlaps with this page
                            if (totalTrackWidthPx > 0 && trackStartPx < pageEndPx && trackEndPx > pageStartPx) {
                                const overlapStartPx = Math.max(trackStartPx, pageStartPx);
                                const overlapEndPx = Math.min(trackEndPx, pageEndPx);
                                const overlapPx = overlapEndPx - overlapStartPx;

                                // Calculate what fraction of the track this overlap represents
                                const overlapFraction = overlapPx / totalTrackWidthPx;
                                const audioTimeOnPage = track.actualDuration * overlapFraction;

                                // Add to total coverage (multiple tracks can overlap)
                                totalAudioCoverage += audioTimeOnPage;
                            }
                        }

                        // Use audio coverage if greater than minimum, otherwise use default
                        const pageDuration = Math.max(totalAudioCoverage, MIN_PAGE_DURATION);
                        console.log(`[Export] Page ${pageIdx + 1}: audioCoverage=${totalAudioCoverage.toFixed(2)}s, duration=${pageDuration.toFixed(2)}s`);
                        return pageDuration;
                    });

                    // Calculate cumulative page start times
                    const pageStartTimes = [0];
                    for (let i = 1; i < pageDurations.length; i++) {
                        pageStartTimes.push(pageStartTimes[i - 1] + pageDurations[i - 1]);
                    }

                    const totalDuration = pageStartTimes[pageStartTimes.length - 1] + pageDurations[pageDurations.length - 1];
                    const totalFrames = Math.ceil(totalDuration * fps);

                    console.log(`[Export] Page durations: ${pageDurations.map((d, i) => `P${i + 1}=${d.toFixed(1)}s`).join(', ')}`);
                    console.log(`[Export] Video duration: ${totalDuration.toFixed(1)}s, Total frames: ${totalFrames}`);

                    // --- Render frames with dynamic page durations ---
                    // Improved frame rendering for smoother transitions
                    for (let i = 0; i < totalFrames; i++) {
                        const currentTime = i / fps;

                        // Determine which page to show based on cumulative timing
                        let pageIdx = 0;
                        for (let p = pagesToExport.length - 1; p >= 0; p--) {
                            if (currentTime >= pageStartTimes[p]) {
                                pageIdx = p;
                                break;
                            }
                        }

                        const nextPageIdx = pageIdx + 1;
                        const pageEndTime = pageStartTimes[pageIdx] + pageDurations[pageIdx];
                        const timeInPage = currentTime - pageStartTimes[pageIdx];
                        const timeUntilNextPage = pageEndTime - currentTime;

                        let finalCanvas;

                        // Transition logic between pages (smoother crossfade)
                        if (nextPageIdx < pagesToExport.length && timeUntilNextPage <= transitionDuration / 2) {
                            const progress = Math.max(0, Math.min(1, (transitionDuration / 2 - timeUntilNextPage) / (transitionDuration / 2)));
                            const easedProgress = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

                            const canvasA = await renderFinalCanvas(pagesToExport[pageIdx].layers, null, {
                                scale: size, transparent: transparentBg, frameTime: timeInPage, duration: pageDurations[pageIdx],
                                useOriginalResolution: true, limitResolution: true, isFrame: true
                            });
                            const canvasB = await renderFinalCanvas(pagesToExport[nextPageIdx].layers, null, {
                                scale: size, transparent: transparentBg, frameTime: 0, duration: pageDurations[nextPageIdx],
                                useOriginalResolution: true, limitResolution: true, isFrame: true
                            });

                            // Crossfade composite
                            const composite = document.createElement('canvas');
                            composite.width = canvasA.width;
                            composite.height = canvasA.height;
                            const ctx = composite.getContext('2d');

                            // Draw current page
                            ctx.drawImage(canvasA, 0, 0);
                            // Crossfade to next page with slide effect
                            ctx.globalAlpha = easedProgress;
                            ctx.drawImage(canvasB, (1 - easedProgress) * canvasB.width, 0);
                            ctx.globalAlpha = 1.0;

                            finalCanvas = composite;
                        } else {
                            finalCanvas = await renderFinalCanvas(pagesToExport[pageIdx].layers, null, {
                                scale: size, transparent: transparentBg, frameTime: timeInPage, duration: pageDurations[pageIdx],
                                useOriginalResolution: true, limitResolution: true, isFrame: true
                            });
                        }

                        if (i % 5 === 0) setExportProgress(Math.round((i / totalFrames) * 85));
                        const blob = await new Promise(r => finalCanvas.toBlob(r, 'image/jpeg', 0.95));
                        await ffmpeg.writeFile(`frame_${i.toString().padStart(5, '0')}.jpg`, await fetchFile(blob));
                    }

                    // --- Build FFmpeg audio filter chain with improved timing ---
                    let audioFilter = '';
                    let audioInputs = '';

                    if (audioFiles.length > 0) {
                        audioFiles.forEach((f, idx) => {
                            // Calculate audio start time based on pixel position and dynamic page durations
                            const trackStartPx = f.startTime || 0;
                            const startPageIdx = Math.min(Math.floor(trackStartPx / PAGE_SLOT_PX), pagesToExport.length - 1);
                            const pxIntoPage = trackStartPx - (startPageIdx * PAGE_SLOT_PX);
                            const fractionIntoPage = Math.min(pxIntoPage / PAGE_CONTENT_PX, 1.0);
                            const audioStartSec = pageStartTimes[startPageIdx] + fractionIntoPage * pageDurations[startPageIdx];

                            const delayMs = Math.round(audioStartSec * 1000);
                            const volumeLevel = (f.volume || 100) / 100;

                            console.log(`[Export] Audio "${f.name}": startPx=${trackStartPx}, startSec=${audioStartSec.toFixed(2)}s, delay=${delayMs}ms, volume=${volumeLevel}`);

                            // Apply trim, delay, and volume
                            let filterChain = `[${idx + 1}:a]`;
                            if (f.trimStart > 0 || (f.trimEnd > 0 && f.trimEnd < (f.duration || Infinity))) {
                                filterChain += `atrim=start=${f.trimStart}:end=${f.trimEnd},asetpts=PTS-STARTPTS,`;
                            }
                            filterChain += `adelay=${delayMs}|${delayMs},volume=${volumeLevel}[a${idx}]`;

                            audioFilter += filterChain + ';';
                            audioInputs += `[a${idx}]`;
                        });
                        audioFilter += `${audioInputs}amix=inputs=${audioFiles.length}:duration=longest:dropout_transition=2[outa]`;
                    }

                    const ffmpegArgs = ['-framerate', fps.toString(), '-i', 'frame_%05d.jpg'];
                    audioFiles.forEach(f => ffmpegArgs.push('-i', f.fileName));
                    ffmpegArgs.push(
                        '-vf', 'pad=ceil(iw/2)*2:ceil(ih/2)*2',
                        '-c:v', 'libx264',
                        '-crf', '18',  // Lower CRF = better quality (18-23 is good range)
                        '-preset', 'slow',  // Slower preset = better compression/quality
                        '-pix_fmt', 'yuv420p',
                        '-movflags', '+faststart',
                        '-profile:v', 'high',
                        '-level', '4.0'
                    );
                    if (audioFiles.length > 0) {
                        ffmpegArgs.push('-filter_complex', audioFilter, '-map', '0:v', '-map', '[outa]', '-c:a', 'aac', '-b:a', '192k');
                    }
                    ffmpegArgs.push('output.mp4');

                    console.log('[Export] Encoding video with args:', ffmpegArgs.join(' '));
                    await ffmpeg.exec(ffmpegArgs);

                    console.log('[Export] Reading output...');
                    const data = await ffmpeg.readFile('output.mp4');
                    console.log(`[Export] Video size: ${data.length} bytes`);
                    saveAs(new Blob([data.buffer], { type: 'video/mp4' }), `${baseFileName}.mp4`);
                } else {
                    // Export without audio (video only or GIF)
                    const SECONDS_PER_PAGE = 3.0;
                    const fps = fileType === 'GIF' ? 15 : 30;
                    const transitionDuration = 0.5;

                    const generateForPage = async (page, pageIndex) => {
                        const pageDuration = SECONDS_PER_PAGE;
                        const totalFrames = Math.ceil(pageDuration * fps);

                        if (fileType === 'GIF') {
                            const gif = new GIF({
                                workers: 2,
                                quality: 10,
                                width: (canvasSize.width || 1080) * size,
                                height: (canvasSize.height || 720) * size,
                                workerScript: '/gif.worker.js'
                            });

                            for (let i = 0; i < totalFrames; i++) {
                                const canvas = await renderFinalCanvas(page.layers, null, {
                                    scale: size,
                                    transparent: transparentBg,
                                    frameTime: i / fps,
                                    duration: pageDuration,
                                    useOriginalResolution: true,
                                    limitResolution: true,
                                    isFrame: true
                                });
                                gif.addFrame(canvas, { copy: true, delay: 1000 / fps });
                            }

                            return new Promise((resolve, reject) => {
                                gif.on('finished', blob => resolve(blob));
                                gif.on('failed', reject);
                                gif.render();
                            });
                        } else {
                            // MP4 without audio
                            for (let i = 0; i < totalFrames; i++) {
                                const canvas = await renderFinalCanvas(page.layers, null, {
                                    scale: size,
                                    transparent: transparentBg,
                                    frameTime: i / fps,
                                    duration: pageDuration,
                                    useOriginalResolution: true,
                                    limitResolution: true,
                                    isFrame: true
                                });
                                const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.95));
                                await ffmpeg.writeFile(`frame_${pageIndex}_${i.toString().padStart(3, '0')}.jpg`, await fetchFile(blob));
                            }

                            await ffmpeg.exec([
                                '-framerate', fps.toString(),
                                '-i', `frame_${pageIndex}_%03d.jpg`,
                                '-vf', 'pad=ceil(iw/2)*2:ceil(ih/2)*2',
                                '-c:v', 'libx264',
                                '-pix_fmt', 'yuv420p',
                                '-movflags', '+faststart',
                                `output_${pageIndex}.mp4`
                            ]);

                            const data = await ffmpeg.readFile(`output_${pageIndex}.mp4`);
                            return new Blob([data.buffer], { type: 'video/mp4' });
                        }
                    };

                    if (pagesToExport.length > 1) {
                        // Multiple pages - create separate files or slideshow
                        if (fileType === 'GIF') {
                            // Create ZIP of GIFs
                            for (let i = 0; i < pagesToExport.length; i++) {
                                setExportProgress(Math.round((i / pagesToExport.length) * 100));
                                const blob = await generateForPage(pagesToExport[i], i);
                                if (blob) zip.file(`page_${i + 1}.gif`, blob);
                            }
                            saveAs(await zip.generateAsync({ type: 'blob' }), `${baseFileName}.zip`);
                        } else {
                            // Create slideshow MP4 with transitions
                            const totalDuration = pagesToExport.length * SECONDS_PER_PAGE;
                            const totalFrames = Math.ceil(totalDuration * fps);
                            const durationPerPage = SECONDS_PER_PAGE;

                            for (let i = 0; i < totalFrames; i++) {
                                const currentTime = i / fps;
                                let pageIdx = Math.floor(currentTime / durationPerPage);
                                if (pageIdx >= pagesToExport.length) pageIdx = pagesToExport.length - 1;

                                const nextPageIdx = pageIdx + 1;
                                const pageChangeTime = (pageIdx + 1) * durationPerPage;
                                let finalCanvas;

                                if (nextPageIdx < pagesToExport.length && currentTime > (pageChangeTime - transitionDuration / 2)) {
                                    const tStart = pageChangeTime - transitionDuration / 2;
                                    const progress = Math.max(0, Math.min(1, (currentTime - tStart) / transitionDuration));
                                    const easedProgress = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

                                    const canvasA = await renderFinalCanvas(pagesToExport[pageIdx].layers, null, {
                                        scale: size, transparent: transparentBg, frameTime: currentTime, duration: totalDuration,
                                        useOriginalResolution: true, limitResolution: true, isFrame: true
                                    });
                                    const canvasB = await renderFinalCanvas(pagesToExport[nextPageIdx].layers, null, {
                                        scale: size, transparent: transparentBg, frameTime: currentTime, duration: totalDuration,
                                        useOriginalResolution: true, limitResolution: true, isFrame: true
                                    });

                                    const composite = document.createElement('canvas');
                                    composite.width = canvasA.width;
                                    composite.height = canvasA.height;
                                    const ctx = composite.getContext('2d');
                                    ctx.drawImage(canvasA, -easedProgress * canvasA.width, 0);
                                    ctx.drawImage(canvasB, (1 - easedProgress) * canvasB.width, 0);
                                    finalCanvas = composite;
                                } else {
                                    finalCanvas = await renderFinalCanvas(pagesToExport[pageIdx].layers, null, {
                                        scale: size, transparent: transparentBg, frameTime: currentTime, duration: totalDuration,
                                        useOriginalResolution: true, limitResolution: true, isFrame: true
                                    });
                                }

                                if (i % 5 === 0) setExportProgress(Math.round((i / totalFrames) * 85));
                                const blob = await new Promise(r => finalCanvas.toBlob(r, 'image/jpeg', 0.95));
                                await ffmpeg.writeFile(`frame_${i.toString().padStart(5, '0')}.jpg`, await fetchFile(blob));
                            }

                            await ffmpeg.exec([
                                '-framerate', fps.toString(),
                                '-i', 'frame_%05d.jpg',
                                '-vf', 'pad=ceil(iw/2)*2:ceil(ih/2)*2',
                                '-c:v', 'libx264',
                                '-crf', '23',
                                '-preset', 'medium',
                                '-pix_fmt', 'yuv420p',
                                '-movflags', '+faststart',
                                'output.mp4'
                            ]);

                            const data = await ffmpeg.readFile('output.mp4');
                            saveAs(new Blob([data.buffer], { type: 'video/mp4' }), `${baseFileName}.mp4`);
                        }
                    } else {
                        // Single page
                        setExportProgress(10);
                        const blob = await generateForPage(pagesToExport[0], 0);
                        if (blob) saveAs(blob, `${baseFileName}.${fileType === 'MP4' ? 'mp4' : 'gif'}`);
                    }
                }
            } else if (fileType === 'PDF_STD' || fileType === 'PDF_PRINT') {
                let pdf = null;
                for (let i = 0; i < pagesToExport.length; i++) { const canvas = await renderFinalCanvas(pagesToExport[i].layers, null, { scale: size, transparent: transparentBg, useOriginalResolution: true }); if (canvas) { if (!pdf) pdf = new jsPDF({ orientation: canvas.width > canvas.height ? 'l' : 'p', unit: 'px', format: [canvas.width, canvas.height] }); else pdf.addPage([canvas.width, canvas.height], canvas.width > canvas.height ? 'l' : 'p'); pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, canvas.width, canvas.height); } }
                if (pdf) { zip.file(`${baseFileName}.pdf`, pdf.output('blob')); saveAs(await zip.generateAsync({ type: 'blob' }), `${baseFileName}.zip`); }
            } else if (fileType === 'SVG') {
                if (pagesToExport.length > 1) { for (let i = 0; i < pagesToExport.length; i++) zip.file(`page_${i + 1}.svg`, generateSVG(pagesToExport[i].layers)); saveAs(await zip.generateAsync({ type: 'blob' }), `${baseFileName}.zip`); }
                else saveAs(new Blob([generateSVG(pagesToExport[0].layers)], { type: 'image/svg+xml' }), `${baseFileName}.svg`);
            } else if (shouldZip) {
                for (let i = 0; i < pagesToExport.length; i++) {
                    setExportProgress(Math.round((i / pagesToExport.length) * 100));
                    const canvas = await renderFinalCanvas(pagesToExport[i].layers, null, { scale: size, transparent: transparentBg, useOriginalResolution: true });
                    if (canvas) {
                        const mime = fileType === 'JPG' ? 'image/jpeg' : 'image/png';
                        const blob = await new Promise(r => canvas.toBlob(r, mime, fileType === 'JPG' ? 0.9 : 1));
                        zip.file(`page_${i + 1}.${fileType === 'JPG' ? 'jpg' : 'png'}`, blob);
                    }
                }
                saveAs(await zip.generateAsync({ type: 'blob' }), `${baseFileName}.zip`);
            } else if (fileType === 'PPTX') {
                const pptx = new pptxgen();
                for (let i = 0; i < pagesToExport.length; i++) {
                    setExportProgress(Math.round((i / pagesToExport.length) * 100));
                    const canvas = await renderFinalCanvas(pagesToExport[i].layers, null, { scale: size, transparent: transparentBg, useOriginalResolution: true });
                    if (canvas) {
                        const slide = pptx.addSlide();
                        slide.addImage({ data: canvas.toDataURL('image/png'), x: 0, y: 0, w: '100%', h: '100%' });
                    }
                }
                saveAs(await pptx.write('blob'), `${baseFileName}.pptx`);
            } else {
                // Single file download (PNG, JPG, PDF, SVG)
                setExportProgress(50);
                const canvas = await renderFinalCanvas(pagesToExport[0].layers, null, { scale: size, transparent: transparentBg, useOriginalResolution: true });
                if (canvas) {
                    setExportProgress(90);
                    const a = document.createElement('a');
                    a.download = `${baseFileName}.${fileType === 'JPG' ? 'jpg' : 'png'}`;
                    a.href = canvas.toDataURL(fileType === 'JPG' ? 'image/jpeg' : 'image/png', fileType === 'JPG' ? 0.9 : 1);
                    a.click();
                }
            }
            setExportProgress(100);
            setIsExporting(false);
            onClose();
        } catch (err) {
            console.error('[Export] Export failed:', err);
            let errorMessage = err.message || 'Unknown error occurred';

            // Specific error messages
            if (errorMessage.includes('Array buffer') || errorMessage.includes('allocation failed') || errorMessage.includes('out of memory')) {
                errorMessage = 'Memory allocation failed. Try: 1) Using shorter audio tracks, 2) Reducing audio tracks, 3) Exporting at smaller size';
            } else if (errorMessage.includes('FFmpeg') || errorMessage.includes('ffmpeg')) {
                errorMessage = 'Video encoding failed. Please try again or reduce canvas size/audio length.';
            } else if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
                errorMessage = 'Network error: Could not load media files. Check your internet connection.';
            } else if (errorMessage.includes('blob') || errorMessage.includes('file')) {
                errorMessage = 'File processing error. Please try again.';
            } else if (errorMessage.includes('canvas') || errorMessage.includes('render')) {
                errorMessage = 'Rendering error. Try reducing export size or simplifying your design.';
            }

            alert(`Export failed: ${errorMessage}`);
            setIsExporting(false);
        }
    };

    const handleCopyLink = async () => {
        setIsCopying(true);
        let urlToCopy = shareUrl;
        if (!designId) {
            try {
                const currentState = { pages: pages.map(p => p.id === activePageId ? { ...p, layers } : p), activePageId, canvasSize, adjustments, lastModified: Date.now(), lastUpdatedBy: localInstanceId };
                const newId = await FirebaseSyncService.createDesign(currentState, user?.uid);
                onDesignIdGenerated(newId);
                urlToCopy = `${window.location.origin}/edit/${newId}`;
            } catch (err) { setIsCopying(false); alert("Failed to create share link."); return; }
        }
        navigator.clipboard.writeText(urlToCopy);
        setTimeout(() => setIsCopying(false), 2000);
    };

    const handleCreatePublicLink = async () => {
        setPublicViewStatus('creating');
        try {
            let id = designId;
            if (!id) {
                const state = { pages: pages.map(p => p.id === activePageId ? { ...p, layers } : p), activePageId, canvasSize, adjustments, lastModified: Date.now(), lastUpdatedBy: localInstanceId };
                id = await FirebaseSyncService.createDesign(state, user?.uid);
                onDesignIdGenerated(id);
            }
            if (id) {
                await FirebaseSyncService.updateDesign(id, { accessLevel: 'public' });
                setAccessLevel('public');
                setPublicLink(`${window.location.origin}/view/${id}`);
                setPublicViewStatus('live');
            }
        } catch (err) { console.error(err); setPublicViewStatus('idle'); alert("Failed to create public link."); }
    };

    /* ────────────────────────────────
       VIEW: Share Design (main)
    ──────────────────────────────── */
    const renderShareDesignView = () => (
        <div className="flex flex-col animate-in">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <h2 className="font-semibold text-sm text-gray-900 dark:text-white">Share design</h2>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                        <Users className="w-3 h-3" /> {activeUsers.filter(u => !u.isGuest).length} visitors
                    </div>
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
                        <Settings className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            <div className="p-4 flex flex-col gap-4 overflow-y-auto scrollbar-thin">
                {/* People */}
                <div>
                    <Label>People with access</Label>

                    {/* ── Logged-in user auto-show card ── */}
                    {user && (
                        <div className="flex items-center gap-3 p-3 mb-3 rounded-xl bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30">
                            <div className="relative flex-shrink-0">
                                <img
                                    src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName || 'user'}`}
                                    alt={user.displayName || 'You'}
                                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-gray-900"
                                    onError={(e) => {
                                        e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName || 'user'}`;
                                    }}
                                />
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                                        {user.displayName || 'You'}
                                    </span>
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-[#6C47FF] dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex-shrink-0">
                                        YOU
                                    </span>
                                </div>
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate mt-0.5 leading-tight">
                                    {user.email || 'No email provided'}
                                </p>
                            </div>
                            <span className="text-[9px] font-bold text-[#6C47FF] dark:text-purple-400 uppercase tracking-wider flex-shrink-0">
                                Owner
                            </span>
                        </div>
                    )}

                    <div className="relative mb-5">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input type="text" placeholder="Add people or groups" className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#6C47FF] focus:border-[#6C47FF] transition-all dark:text-white placeholder:text-gray-400" />
                    </div>

                    {/* Overlapping Avatars Stack */}
                    <div className="flex items-center mb-6 pl-1">
                        <div className="flex -space-x-3 overflow-hidden">
                            {activeUsers.filter(u => !u.isGuest).slice(0, 5).map((u, i) => (
                                <div
                                    key={u.userId}
                                    className="relative inline-block h-10 w-10 rounded-full ring-2 ring-white dark:ring-gray-900 transition-all group"
                                    style={{ zIndex: 10 - i }}
                                >
                                    <img
                                        className="h-full w-full rounded-full object-cover cursor-pointer"
                                        src={u.photoURL}
                                        alt={u.displayName}
                                        onClick={() => { setSelectedUser(u); setView('user_details'); }}
                                        onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.displayName}`; }}
                                    />
                                </div>
                            ))}
                            {activeUsers.filter(u => !u.isGuest).length > 5 && (
                                <div className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 ring-2 ring-white dark:ring-gray-900 text-[10px] font-bold text-gray-600 dark:text-gray-400">
                                    +{activeUsers.filter(u => !u.isGuest).length - 5}
                                </div>
                            )}
                            <button className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400 hover:border-[#6C47FF] hover:text-[#6C47FF] transition-all ml-4">
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* <div className="flex flex-col gap-2.5">
                        {activeUsers.filter(u => u.userId === ownerId || u.userId === user?.uid).map((u) => (
                            <div
                                key={u.userId}
                                className="flex items-center gap-2.5 p-2 rounded-xl transition-colors w-full hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border border-transparent hover:border-gray-100 dark:hover:border-gray-700"
                                onClick={() => { setSelectedUser(u); setView('user_details'); }}
                            >
                                <div className="w-9 h-9 rounded-full overflow-hidden ring-1 ring-gray-100 dark:ring-gray-800 shadow-sm flex-shrink-0 bg-gray-100">
                                    <img src={u.photoURL} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.displayName}`; }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                                            {u.displayName}
                                        </span>
                                        {u.userId === user?.uid && (
                                            <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 flex-shrink-0">YOU</span>
                                        )}
                                    </div>
                                    <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate leading-tight">
                                        {u.email || 'Guest User'}
                                    </div>
                                    <div className="text-[9px] font-bold text-[#6C47FF] uppercase tracking-wider mt-0.5">
                                        {u.userId === ownerId ? 'Owner' : 'Viewer'}
                                    </div>
                                </div>
                                <div className="ml-auto w-6 h-6 rounded-full flex items-center justify-center text-gray-300">
                                    <ChevronDown className="w-3.5 h-3.5" />
                                </div>
                            </div>
                        ))}
                    </div> */}
                </div>

                {/* <Divider /> */}

                {/* Access Level */}
                <div>
                    {/* <Label>Access level</Label> */}
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className={`w-full flex items-center gap-3 p-2.5 border rounded-xl text-left transition-all ${isDropdownOpen ? 'border-[#6C47FF] ring-1 ring-[#6C47FF]/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'} bg-white dark:bg-gray-900`}
                        >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${accessLevel === 'private' ? 'bg-gray-100 dark:bg-gray-800' : 'bg-[#6C47FF]/10'}`}>
                                {accessLevel === 'private' ? <Lock className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" /> : <Globe className="w-3.5 h-3.5 text-[#6C47FF]" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                                    {accessLevel === 'private' ? 'Only you can access' : 'Anyone with the link'}
                                </div>
                                <div className="text-[10px] text-gray-400 dark:text-gray-500">
                                    {accessLevel === 'private' ? 'Private design' : 'Public view access'}
                                </div>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                                {[
                                    { val: 'private', icon: Lock, label: 'Only you can access', desc: 'Private design' },
                                    { val: 'public', icon: Globe, label: 'Anyone with the link', desc: 'Public view access' },
                                ].map(({ val, icon: Icon, label, desc }) => (
                                    <button
                                        key={val}
                                        onClick={() => { handleAccessLevelChange(val); setIsDropdownOpen(false); }}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${accessLevel === val ? 'bg-purple-50 dark:bg-purple-900/10' : ''}`}
                                    >
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${val === 'public' ? 'bg-[#6C47FF]/10' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                            <Icon className={`w-3.5 h-3.5 ${val === 'public' ? 'text-[#6C47FF]' : 'text-gray-500'}`} />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">{label}</div>
                                            <div className="text-[10px] text-gray-400">{desc}</div>
                                        </div>
                                        {accessLevel === val && <Check className="w-3.5 h-3.5 text-[#6C47FF] flex-shrink-0" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <BrandButton onClick={() => { handleCopyLink(); if (accessLevel === 'private') setShowLinkCopiedPopup(true); }}>
                    <Link className="w-4 h-4" />
                    {isCopying ? 'Link copied!' : 'Copy link'}
                </BrandButton>

                {/* <Divider /> */}

                {/* Action tiles */}
                <div>
                    {/* <Label>More options</Label> */}
                    <div className="grid grid-cols-4 gap-2 mb-2">
                        <ActionTile icon={DownloadIcon} label="Download" onClick={() => setView('download')} />
                        <ActionTile icon={Link} label="Public link" onClick={() => setView('public_view_link')} />
                        <ActionTile icon={Instagram} label="Instagram" onClick={() => { }} />
                        <ActionTile icon={VideoIcon} label="Record" onClick={() => setView('present_and_record')} />
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        <ActionTile icon={LayoutIcon} label="Template" badge={<span className="text-amber-400 text-[10px]">👑</span>} onClick={() => { }} />
                        <ActionTile icon={Presentation} label="Present" onClick={() => setView('present')} />
                        <ActionTile icon={CopyIcon} label="Clipboard" onClick={() => { }} />
                        <ActionTile icon={MoreHorizontal} label="See all" onClick={() => { }} />
                    </div>
                </div>
            </div>
        </div>
    );

    /* ────────────────────────────────
       VIEW: Download
    ──────────────────────────────── */
    const renderDownloadView = () => {
        const currentFT = fileTypes.find(t => t.id === fileType) || fileTypes[0];
        const FTIcon = currentFT.icon;
        return (
            <div className="flex flex-col animate-in">
                <ViewHeader title="Download" onBack={() => setView('share_design')} />
                <div className="p-4 flex flex-col gap-4 overflow-y-auto scrollbar-thin">
                    {/* File type */}
                    <div className="relative">
                        <Label>File type</Label>
                        <button
                            onClick={() => setShowFileTypeDropdown(!showFileTypeDropdown)}
                            className={`w-full flex items-center gap-3 p-2.5 border rounded-xl bg-white dark:bg-gray-950 text-left transition-all ${showFileTypeDropdown ? 'border-[#6C47FF] ring-1 ring-[#6C47FF]/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
                        >
                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                                <FTIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{currentFT.label}</span>
                                    {currentFT.suggested && <SuggestedBadge />}
                                    {currentFT.premium && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 border border-amber-200">PRO</span>}
                                </div>
                                <div className="text-[10px] text-gray-400 truncate">{currentFT.desc}</div>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${showFileTypeDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        {showFileTypeDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto scrollbar-thin">
                                {fileTypes.map(t => {
                                    const TIcon = t.icon;
                                    return (
                                        <button
                                            key={t.id}
                                            onClick={() => { setFileType(t.id); setShowFileTypeDropdown(false); }}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${fileType === t.id ? 'bg-purple-50 dark:bg-purple-900/10' : ''}`}
                                        >
                                            <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                                                <TIcon className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-semibold dark:text-white">{t.label}</span>
                                                    {t.suggested && <SuggestedBadge />}
                                                    {t.premium && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 border border-amber-200">PRO</span>}
                                                </div>
                                                <div className="text-[10px] text-gray-400">{t.desc}</div>
                                            </div>
                                            {fileType === t.id && <Check className="w-3.5 h-3.5 text-[#6C47FF]" />}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Size slider */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <Label className="mb-0">Size</Label>
                            <span className="text-xs font-bold text-[#6C47FF]">×{size}</span>
                        </div>
                        <div className="relative h-5 flex items-center mb-1.5">
                            <div className="absolute w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-[#6C47FF] rounded-full" style={{ width: `${((size - 0.5) / 2.5) * 100}%` }} />
                            </div>
                            <input type="range" min="0.5" max="3" step="0.125" value={size} onChange={e => setSize(parseFloat(e.target.value))} className="absolute w-full opacity-0 cursor-pointer h-full" />
                            <div className="w-4 h-4 bg-white dark:bg-gray-800 border-2 border-[#6C47FF] rounded-full shadow absolute pointer-events-none" style={{ left: `calc(${((size - 0.5) / 2.5) * 100}% - 8px)` }} />
                        </div>
                        <div className="text-[10px] text-gray-400 dark:text-gray-500">
                            {Math.round(canvasSize.width * size)} × {Math.round(canvasSize.height * size)} px
                        </div>
                    </div>

                    {/* Options */}
                    <div>
                        <Label>Options</Label>
                        <div className="flex flex-col gap-2.5">
                            <label className="flex items-center gap-2.5 cursor-not-allowed opacity-60">
                                <CheckBox checked={false} onChange={() => { }} />
                                <span className="text-xs text-gray-600 dark:text-gray-300 flex-1">Limit file size</span>
                                <Info className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                <ProBadge />
                            </label>
                            <label className="flex items-center gap-2.5 cursor-pointer">
                                <CheckBox checked={compressFile} onChange={() => setCompressFile(!compressFile)} />
                                <span className="text-xs text-gray-600 dark:text-gray-300 flex-1">Compress file (lower quality)</span>
                                <ProBadge />
                            </label>
                            <label className="flex items-center gap-2.5 cursor-pointer">
                                <CheckBox checked={transparentBg} onChange={() => setTransparentBg(!transparentBg)} />
                                <span className="text-xs text-gray-600 dark:text-gray-300 flex-1">Transparent background</span>
                                <ProBadge />
                            </label>
                        </div>
                    </div>

                    {/* Pages */}
                    <div className="relative">
                        <Label>Select pages</Label>
                        <button
                            onClick={() => setShowPageSelector(!showPageSelector)}
                            className={`w-full flex items-center justify-between p-2.5 border rounded-xl bg-white dark:bg-gray-950 text-left transition-all ${showPageSelector ? 'border-[#6C47FF] ring-1 ring-[#6C47FF]/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
                        >
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                                {selectedPages.includes('all') ? `All pages (${pages.length})`
                                    : selectedPages.includes('current') ? 'Current page'
                                        : `${selectedPages.length} selected`}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showPageSelector ? 'rotate-180' : ''}`} />
                        </button>
                        {showPageSelector && (
                            <div className="absolute bottom-full mb-2 left-0 right-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 max-h-64 flex flex-col">
                                <div className="overflow-y-auto scrollbar-thin flex-1 p-2 space-y-0.5">
                                    {[
                                        { key: 'all', label: `All pages (${pages.length})` },
                                        { key: 'current', label: `Current page` },
                                    ].map(opt => (
                                        <label key={opt.key} className="flex items-center gap-2.5 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
                                            <CheckBox checked={selectedPages.includes(opt.key)} onChange={() => setSelectedPages([opt.key])} />
                                            <span className="text-xs font-medium dark:text-gray-200">{opt.label}</span>
                                        </label>
                                    ))}
                                    <Divider />
                                    {pages.map((p, i) => {
                                        const isSel = selectedPages.includes(p.id) || selectedPages.includes('all') || (selectedPages.includes('current') && p.id === activePageId);
                                        return (
                                            <label key={p.id} className="flex items-center gap-2.5 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
                                                <CheckBox checked={isSel} onChange={() => {
                                                    if (selectedPages.includes('all')) setSelectedPages([p.id]);
                                                    else {
                                                        const ns = selectedPages.includes(p.id) ? selectedPages.filter(id => id !== p.id) : [...selectedPages, p.id];
                                                        setSelectedPages(ns.length === pages.length ? ['all'] : ns.length === 0 ? ['current'] : ns);
                                                    }
                                                }} />
                                                <div className="w-7 h-7 rounded bg-gray-100 dark:bg-gray-800 flex-shrink-0 border border-gray-200 dark:border-gray-700" />
                                                <span className="text-xs font-medium dark:text-gray-200 flex-1">Page {i + 1}</span>
                                                <span className="text-[10px] text-gray-400">Custom</span>
                                            </label>
                                        );
                                    })}
                                </div>
                                <div className="p-2.5 border-t border-gray-100 dark:border-gray-800">
                                    <button onClick={() => setShowPageSelector(false)} className="w-full py-2 bg-[#6C47FF] hover:bg-[#5B38E8] text-white font-semibold rounded-lg text-xs transition-colors">Done</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Preferences */}
                    <div>
                        <Label>Preferences</Label>
                        <label className="flex items-center gap-2.5 cursor-pointer">
                            <CheckBox checked={savePreferences} onChange={() => setSavePreferences(!savePreferences)} />
                            <span className="text-xs text-gray-600 dark:text-gray-300">Save download settings</span>
                        </label>
                    </div>

                    <BrandButton onClick={handleExport} disabled={isExporting}>
                        {isExporting ? (
                            <>
                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Exporting {exportProgress}%…
                            </>
                        ) : (
                            <>
                                <DownloadIcon className="w-4 h-4" />
                                Download
                            </>
                        )}
                    </BrandButton>
                </div>
            </div>
        );
    };

    /* ────────────────────────────────
       VIEW: Public view link
    ──────────────────────────────── */
    const renderPublicViewLinkView = () => (
        <div className="flex flex-col animate-in">
            <ViewHeader
                title="Public view link"
                onBack={() => setView('share_design')}
                extra={publicViewStatus === 'live' && (
                    <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live
                    </span>
                )}
            />
            <div className="p-4 flex flex-col gap-4 overflow-y-auto scrollbar-thin">
                {publicViewStatus !== 'live' ? (
                    <>
                        <div className="p-3 rounded-xl border border-purple-100 dark:border-purple-900/30 bg-purple-50 dark:bg-purple-900/10 text-xs text-purple-700 dark:text-purple-300 leading-relaxed font-medium">
                            Create a view-only link. Anyone with the link can see your design — no editing allowed.
                        </div>
                        <div className="aspect-[16/10] w-full bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden flex items-center justify-center">
                            {previewSrc
                                ? <img src={previewSrc} alt="Preview" className="w-full h-full object-contain" />
                                : <div className="flex flex-col items-center gap-2 text-gray-300 dark:text-gray-700"><ImageIcon className="w-10 h-10" /><span className="text-xs">Preview</span></div>}
                        </div>
                        <BrandButton onClick={handleCreatePublicLink} disabled={publicViewStatus === 'creating'}>
                            {publicViewStatus === 'creating'
                                ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating link…</>
                                : <><Globe className="w-4 h-4" />Create public view link</>}
                        </BrandButton>
                    </>
                ) : (
                    <>
                        <div className="aspect-[16/10] w-full bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                            {previewSrc && <img src={previewSrc} alt="Preview" className="w-full h-full object-contain" />}
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800">
                            <Label>Your link is ready</Label>
                            <div className="flex gap-2">
                                <input readOnly value={publicLink} className="flex-1 px-3 py-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg text-[10px] font-mono text-gray-600 dark:text-gray-300 outline-none" />
                                <button
                                    onClick={() => { navigator.clipboard.writeText(publicLink); setIsCopying(true); setTimeout(() => setIsCopying(false), 2000); }}
                                    className={`px-3 py-2 rounded-lg text-xs font-semibold text-white transition-all active:scale-95 ${isCopying ? 'bg-green-500' : 'bg-[#6C47FF] hover:bg-[#5B38E8]'}`}
                                >
                                    {isCopying ? <Check className="w-3.5 h-3.5" /> : 'Copy'}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );

    /* ────────────────────────────────
       VIEW: Present & Record
    ──────────────────────────────── */
    const renderPresentAndRecordView = () => (
        <div className="flex flex-col animate-in">
            <ViewHeader title="Present and record" onBack={() => setView('share_design')} />
            <div className="p-4 flex flex-col gap-4 overflow-y-auto scrollbar-thin">
                <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-900/10 text-xs text-amber-700 dark:text-amber-300 leading-relaxed font-medium flex gap-2">
                    <VideoIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Record yourself presenting over your design — great for async updates, tutorials, or feedback.</span>
                </div>
                <div className="w-full aspect-video bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden relative group">
                    {previewSrc
                        ? <img src={previewSrc} alt="Preview" className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" />
                        : <div className="w-full h-full flex items-center justify-center"><div className="w-5 h-5 border-2 border-[#6C47FF] border-t-transparent rounded-full animate-spin" /></div>}
                    <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2.5 py-1.5 bg-black/50 backdrop-blur-sm rounded-full border border-white/10">
                        <div className="w-6 h-6 rounded-full overflow-hidden ring-1 ring-white/30 flex-shrink-0">
                            <img src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.displayName || 'User'}`} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[9px] font-bold text-white uppercase tracking-wider">Studio preview</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-center gap-6">
                    {[{ icon: Mic, label: 'Audio' }, { icon: LayoutGrid, label: 'Notes' }, { icon: ImageIcon, label: 'Frames' }].map(({ icon: Icon, label }) => (
                        <div key={label} className="flex flex-col items-center gap-1">
                            <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                                <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
                        </div>
                    ))}
                </div>
                <BrandButton onClick={() => { onClose(); onStartRecordingStudio?.(); }}>
                    <MonitorPlay className="w-4 h-4" />
                    Go to recording studio
                </BrandButton>
            </div>
        </div>
    );

    /* ────────────────────────────────
       VIEW: Present
    ──────────────────────────────── */
    const renderPresentView = () => {
        const modes = [
            { id: 'fullscreen', label: 'Full screen', desc: 'Present at your own pace', icon: Maximize },
            { id: 'presenter', label: 'Presenter', desc: 'View with speaker notes', icon: MonitorPlay },
            { id: 'present_and_record', label: 'Record', desc: 'Record while presenting', icon: VideoIcon },
            { id: 'autoplay', label: 'Autoplay', desc: 'Auto-advance slides', icon: Play },
        ];
        const activeModeDesc = modes.find(m => m.id === presentMode)?.desc;
        return (
            <div className="flex flex-col animate-in">
                <ViewHeader title="Present" onBack={() => setView('share_design')} />
                <div className="p-4 flex flex-col gap-4 overflow-y-auto scrollbar-thin">
                    <div>
                        <Label>Presentation mode</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {modes.map(m => {
                                const MIcon = m.icon;
                                const isActive = presentMode === m.id;
                                return (
                                    <button
                                        key={m.id}
                                        onClick={() => setPresentMode(m.id)}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${isActive ? 'border-[#6C47FF] bg-purple-50 dark:bg-purple-900/10' : 'border-transparent bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-[#6C47FF] text-white shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700'}`}>
                                            <MIcon className="w-4 h-4" />
                                        </div>
                                        <span className={`text-[9px] font-semibold uppercase tracking-wide ${isActive ? 'text-[#6C47FF]' : 'text-gray-500 dark:text-gray-400'}`}>{m.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className="w-full aspect-video bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden relative">
                        {previewSrc
                            ? <img src={previewSrc} alt="Preview" className="w-full h-full object-contain" />
                            : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-10 h-10 text-gray-200 dark:text-gray-800" /></div>}
                        {activeModeDesc && (
                            <div className="absolute inset-x-0 bottom-0 px-3 py-2.5 bg-gradient-to-t from-black/50 to-transparent">
                                <p className="text-[10px] text-white font-medium">{activeModeDesc}</p>
                            </div>
                        )}
                    </div>
                    <BrandButton onClick={async () => {
                        onClose();
                        if (presentMode === 'present_and_record') { 
                            onStartRecordingStudio?.(); 
                            return;
                        }

                        let did = designId;
                        if (!did) {
                            try {
                                const s = { pages: pages.map(p => p.id === activePageId ? { ...p, layers } : p), activePageId, canvasSize, adjustments, lastModified: Date.now(), lastUpdatedBy: localInstanceId };
                                did = await FirebaseSyncService.createDesign(s, user?.uid);
                                onDesignIdGenerated?.(did);
                            } catch { alert('Failed to save design. Please try again.'); return; }
                        }
                        
                        // Open in a new Pop-up Window for a "Canva-like" experience
                        const width = 1200;
                        const height = 800;
                        const left = (window.screen.width / 2) - (width / 2);
                        const top = (window.screen.height / 2) - (height / 2);
                        window.open(`/presenter/${did}?mode=${presentMode}`, 'PresenterWindow', `width=${width},height=${height},top=${top},left=${left},menubar=no,toolbar=no,location=no,status=no,resizable=yes`);
                    }}>
                        <Presentation className="w-4 h-4" />
                        Enter presentation
                    </BrandButton>
                </div>
            </div>
        );
    };

    /* ────────────────────────────────
       VIEW: User Details
    ──────────────────────────────── */
    const renderUserDetailsView = () => {
        if (!selectedUser) return null;
        const isSelf = selectedUser.userId === user?.uid;

        return (
            <div className="flex flex-col animate-in">
                <ViewHeader
                    title="User settings"
                    onBack={() => { setView('share_design'); setSelectedUser(null); }}
                />
                <div className="p-6 flex flex-col items-center gap-4 overflow-y-auto scrollbar-thin">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-purple-50 dark:ring-purple-900/20 shadow-lg">
                            <img
                                src={selectedUser.photoURL}
                                alt=""
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.displayName}`; }}
                            />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-white dark:border-gray-900 shadow-sm flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                        </div>
                    </div>

                    <div className="text-center">
                        <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-tight">{selectedUser.displayName}</h3>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mt-0.5">{selectedUser.email || 'No email provided'}</p>
                    </div>

                    <div className="w-full mt-2">
                        <Label>Access status</Label>
                        <div className="p-3 rounded-[20px] border border-slate-100 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm/50 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Design Role</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isSelf ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'} border border-transparent`}>
                                    {isSelf ? 'OWNER' : 'VIEWER'}
                                </span>
                            </div>
                            <Divider />
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Current View</span>
                                <span className="text-[10px] text-[#6C47FF] font-semibold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#6C47FF] animate-pulse" /> Live Now
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="w-full">
                        <Label>Actions</Label>
                        <div className="grid grid-cols-1 gap-2">
                            <GhostButton disabled={isSelf} className={isSelf ? 'opacity-50 grayscale' : ''}>
                                <Settings className="w-3.5 h-3.5" />
                                Change Access Level
                            </GhostButton>
                            <GhostButton className="text-red-500 border-red-100 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/10">
                                <X className="w-3.5 h-3.5" />
                                Remove from design
                            </GhostButton>
                        </div>
                    </div>

                    <BrandButton onClick={() => { setView('share_design'); setSelectedUser(null); }}>
                        Done
                    </BrandButton>
                </div>
            </div>
        );
    };

    /* ── Root render ── */
    return (
        <div className="fixed inset-0 z-[1000] flex items-start justify-end pointer-events-none">
            <div className="absolute inset-0 pointer-events-auto" onClick={onClose} />
            <div
                className="relative mt-14 mr-4 z-[1001] pointer-events-auto bg-white/80 dark:bg-slate-950/90 w-[calc(100vw-32px)] sm:w-[360px] rounded-[32px] shadow-[0_40px_100px_rgba(15,23,42,0.4)] border border-white/20 dark:border-slate-800/50 overflow-hidden flex flex-col backdrop-blur-[40px] ring-1 ring-black/5 dark:ring-white/5"
                style={{ maxHeight: 'calc(100vh - 80px)', animation: 'slideDown .25s cubic-bezier(.16,1,.3,1)' }}
            >
                {view === 'share_design' ? renderShareDesignView()
                    : view === 'download' ? renderDownloadView()
                        : view === 'public_view_link' ? renderPublicViewLinkView()
                            : view === 'present_and_record' ? renderPresentAndRecordView()
                                : view === 'present' ? renderPresentView()
                                    : view === 'user_details' ? renderUserDetailsView()
                                        : renderShareDesignView()}
            </div>

            <style>{`
        @keyframes slideDown { from { transform:translateY(-8px);opacity:0 } to { transform:translateY(0);opacity:1 } }
        .animate-in { animation: fadeUp .2s ease-out; }
        @keyframes fadeUp { from { opacity:0;transform:translateY(4px) } to { opacity:1;transform:translateY(0) } }
        .scrollbar-thin::-webkit-scrollbar { width:4px }
        .scrollbar-thin::-webkit-scrollbar-track { background:transparent }
        .scrollbar-thin::-webkit-scrollbar-thumb { background:rgba(0,0,0,.08);border-radius:4px }
        .dark .scrollbar-thin::-webkit-scrollbar-thumb { background:rgba(255,255,255,.08) }
      `}</style>

            <LinkCopiedPopup
                isOpen={showLinkCopiedPopup}
                onClose={() => setShowLinkCopiedPopup(false)}
                onAllowAccess={() => { handleAccessLevelChange('public'); setShowLinkCopiedPopup(false); }}
                onCopyPrivate={() => { handleCopyLink(); setShowLinkCopiedPopup(false); }}
            />
        </div>
    );
};

export default ExportManager;

