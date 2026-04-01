import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Shield, Scissors, Download, RefreshCw, X, ZoomIn, ZoomOut, RotateCw, FlipHorizontal, FlipVertical, Sun, Contrast, Droplet, Sliders, Maximize2, Copy, Check, Info } from 'lucide-react';

// ─── Google Font Import ────────────────────────────────────────────────────────
const FontLink = ({ colors, darkMode }) => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
    * { box-sizing: border-box; }
    body { font-family: 'DM Sans', sans-serif; }
    .brand-font { font-family: 'Syne', sans-serif; }
    .crop-canvas { image-rendering: pixelated; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(16px);} to { opacity:1; transform:translateY(0);} }
    @keyframes pulse-ring { 0%,100% { opacity:0.6; transform:scale(1);} 50% { opacity:1; transform:scale(1.08);} }
    @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
    .anim-fadeup { animation: fadeUp 0.5s ease both; }
    .anim-fadeup-2 { animation: fadeUp 0.5s 0.1s ease both; }
    .anim-fadeup-3 { animation: fadeUp 0.5s 0.2s ease both; }
    .shimmer-btn:hover::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent); animation:shimmer 0.8s linear; pointer-events:none; border-radius:inherit; }
    .shimmer-btn { position:relative; overflow:hidden; }
    input[type=range] { -webkit-appearance:none; appearance:none; height:4px; border-radius:99px; outline:none; cursor:pointer; background:${colors.border}; }
    input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:16px; height:16px; border-radius:50%; background:${colors.accent}; border:2px solid ${colors.surface}; cursor:pointer; }
    .sidebar-scroll::-webkit-scrollbar { width:4px; }
    .sidebar-scroll::-webkit-scrollbar-track { background:transparent; }
    .sidebar-scroll::-webkit-scrollbar-thumb { background:${colors.textFaint}; border-radius:4px; }
    .tab-active { border-bottom:2px solid ${colors.accent}; color:${colors.accent}; }
    .tab-inactive { border-bottom:2px solid transparent; color:${colors.textMuted}; }
    .handle-hover:hover { transform:scale(1.4); background:${colors.accent} !important; }
  `}</style>
);

// ─── Color Token ──────────────────────────────────────────────────────────────
const LIGHT_C = {
    bg: '#f5f7fb',
    surface: '#ffffff',
    surfaceHover: '#eef4fb',
    canvas: '#edf3f9',
    border: '#d5dfeb',
    accent: '#18b7aa',
    accentStrong: '#0f9a90',
    accentDim: '#18b7aa22',
    text: '#11243d',
    textMuted: '#617285',
    textFaint: '#90a0b3',
    textOnAccent: '#08353a',
    danger: '#e25555',
    warn: '#c28a14',
    success: '#2f9e67',
    pageStart: '#f9fbff',
    editorStart: '#f8fbff',
    glass: 'rgba(255,255,255,0.72)',
    shadow: '0 20px 60px rgba(148, 163, 184, 0.16)',
    sideShadow: '16px 0 40px rgba(148, 163, 184, 0.12)',
    canvasShadow: '0 28px 60px rgba(148, 163, 184, 0.25)',
    previewShadow: '0 24px 60px rgba(148, 163, 184, 0.25)',
    imageShadow: '0 16px 40px rgba(148, 163, 184, 0.28)',
    gridDot: '#d9e4ef',
    overlay: 'rgba(255,255,255,0.6)',
    outline: 'rgba(148,163,184,0.45)',
    glow: 'rgba(24,183,170,0.08)',
    modalBackdrop: 'rgba(241,245,249,0.82)',
    imageBg: '#ffffff',
    checkerA: '#eef4fb',
    checkerB: '#d9e7f5',
};

const DARK_C = {
    bg: '#08111f',
    surface: '#0f172a',
    surfaceHover: '#162235',
    canvas: '#071320',
    border: '#233246',
    accent: '#22d3c5',
    accentStrong: '#14b8a6',
    accentDim: '#22d3c522',
    text: '#e6eef9',
    textMuted: '#9fb0c7',
    textFaint: '#6f859f',
    textOnAccent: '#042f2c',
    danger: '#fb7185',
    warn: '#f59e0b',
    success: '#4ade80',
    pageStart: '#040b16',
    editorStart: '#06111d',
    glass: 'rgba(7,17,31,0.78)',
    shadow: '0 20px 60px rgba(2, 6, 23, 0.45)',
    sideShadow: '16px 0 40px rgba(2, 6, 23, 0.35)',
    canvasShadow: '0 28px 60px rgba(2, 6, 23, 0.55)',
    previewShadow: '0 24px 60px rgba(2, 6, 23, 0.48)',
    imageShadow: '0 16px 40px rgba(2, 6, 23, 0.48)',
    gridDot: '#1d334b',
    overlay: 'rgba(3, 11, 23, 0.72)',
    outline: 'rgba(148,163,184,0.3)',
    glow: 'rgba(34,211,197,0.12)',
    modalBackdrop: 'rgba(2,6,23,0.8)',
    imageBg: '#0b1220',
    checkerA: '#122033',
    checkerB: '#0c1726',
};

function getCropTheme(darkMode) {
    return darkMode ? DARK_C : LIGHT_C;
}

const ASPECT_RATIOS = [
    { label: 'Free', value: 'free' },
    { label: '1:1', value: '1:1' },
    { label: '4:3', value: '4:3' },
    { label: '16:9', value: '16:9' },
    { label: '3:2', value: '3:2' },
    { label: '2:3', value: '2:3' },
    { label: '9:16', value: '9:16' },
];

const RATIO_MAP = { '1:1': 1, '4:3': 4 / 3, '16:9': 16 / 9, '3:2': 3 / 2, '2:3': 2 / 3, '9:16': 9 / 16 };

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

// ─── Filters preview canvas ───────────────────────────────────────────────────
function applyFilters(ctx, canvas, img, sx, sy, sw, sh, filters, rotation, flipH, flipV) {
    const { brightness, contrast, saturation, blur } = filters;
    ctx.save();
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(img, sx, sy, sw, sh, -sw / 2, -sh / 2, sw, sh);
    ctx.restore();
}

export default function CropImageTool({ darkMode = false }) {
    const C = getCropTheme(darkMode);
    const [image, setImage] = useState(null); // base64
    const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
    const [crop, setCrop] = useState({ x: 0, y: 0, w: 200, h: 200 });
    const [aspectRatio, setAspectRatio] = useState('free');
    const [outputFormat, setOutputFormat] = useState('png');
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0); // 0,90,180,270
    const [flipH, setFlipH] = useState(false);
    const [flipV, setFlipV] = useState(false);
    const [filters, setFilters] = useState({ brightness: 100, contrast: 100, saturation: 100, blur: 0 });
    const [tab, setTab] = useState('crop'); // crop | adjust
    const [isDragOver, setIsDragOver] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [resizing, setResizing] = useState(false);
    const [resizeDir, setResizeDir] = useState(null);
    const [dragStart, setDragStart] = useState(null);
    const [copied, setCopied] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [viewportWidth, setViewportWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1280));

    const fileInputRef = useRef(null);
    const imgRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const updateViewportWidth = () => setViewportWidth(window.innerWidth);
        updateViewportWidth();
        window.addEventListener('resize', updateViewportWidth);
        return () => window.removeEventListener('resize', updateViewportWidth);
    }, []);

    // ── helpers ──────────────────────────────────────────────────────────────────
    const getScale = useCallback(() => {
        if (!imgRef.current) return 1;
        return imgRef.current.naturalWidth / imgRef.current.width;
    }, []);

    const getDisplayCrop = useCallback(() => {
        const s = getScale() * zoom;
        if (!s) return crop;
        return { x: crop.x / s, y: crop.y / s, w: crop.w / s, h: crop.h / s };
    }, [crop, getScale, zoom]);

    // ── file handling ─────────────────────────────────────────────────────────────
    const loadFile = (file) => {
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => setImage(e.target.result);
        reader.readAsDataURL(file);
    };

    const handleDrop = (e) => { e.preventDefault(); setIsDragOver(false); loadFile(e.dataTransfer.files[0]); };
    const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };

    // ── reset crop on image load ──────────────────────────────────────────────────
    useEffect(() => {
        if (image && imgRef.current) {
            const onLoad = () => {
                const { naturalWidth: nw, naturalHeight: nh } = imgRef.current;
                setNaturalSize({ w: nw, h: nh });
                const cw = Math.round(nw * 0.6);
                const ch = Math.round(nh * 0.6);
                setCrop({ x: Math.round((nw - cw) / 2), y: Math.round((nh - ch) / 2), w: cw, h: ch });
                setRotation(0); setFlipH(false); setFlipV(false);
                setFilters({ brightness: 100, contrast: 100, saturation: 100, blur: 0 });
                setZoom(1);
            };
            if (imgRef.current.complete && imgRef.current.naturalWidth) onLoad();
            else imgRef.current.addEventListener('load', onLoad, { once: true });
        }
    }, [image]);

    // ── aspect ratio lock ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (aspectRatio !== 'free' && RATIO_MAP[aspectRatio]) {
            const r = RATIO_MAP[aspectRatio];
            setCrop(prev => {
                const newH = Math.round(prev.w / r);
                return { ...prev, h: clamp(newH, 10, naturalSize.h - prev.y) };
            });
        }
    }, [aspectRatio, naturalSize.h]);

    // ── drag/resize mouse events ──────────────────────────────────────────────────
    useEffect(() => {
        if (!dragging && !resizing) return;
        const onMove = (e) => {
            if (!imgRef.current || !dragStart) return;
            const scale = getScale() * zoom;
            const dx = (e.clientX - dragStart.mx) * scale;
            const dy = (e.clientY - dragStart.my) * scale;
            const { w: nw, h: nh } = naturalSize;

            if (dragging) {
                const nx = clamp(dragStart.cx + dx, 0, nw - crop.w);
                const ny = clamp(dragStart.cy + dy, 0, nh - crop.h);
                setCrop(p => ({ ...p, x: Math.round(nx), y: Math.round(ny) }));
            } else if (resizing && resizeDir) {
                let { x, y, w, h } = { x: dragStart.cx, y: dragStart.cy, w: dragStart.cw, h: dragStart.ch };
                if (resizeDir.includes('e')) w = Math.max(20, dragStart.cw + dx);
                if (resizeDir.includes('w')) { w = Math.max(20, dragStart.cw - dx); x = dragStart.cx + dragStart.cw - w; }
                if (resizeDir.includes('s')) h = Math.max(20, dragStart.ch + dy);
                if (resizeDir.includes('n')) { h = Math.max(20, dragStart.ch - dy); y = dragStart.cy + dragStart.ch - h; }
                if (aspectRatio !== 'free' && RATIO_MAP[aspectRatio]) h = w / RATIO_MAP[aspectRatio];
                x = clamp(x, 0, nw - w); y = clamp(y, 0, nh - h);
                w = Math.min(w, nw - x); h = Math.min(h, nh - y);
                setCrop({ x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) });
            }
        };
        const onUp = () => { setDragging(false); setResizing(false); setResizeDir(null); };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    }, [dragging, resizing, dragStart, resizeDir, getScale, zoom, naturalSize, crop.w, crop.h, aspectRatio]);

    const startDrag = (e) => {
        e.preventDefault(); e.stopPropagation();
        setDragging(true);
        setDragStart({ mx: e.clientX, my: e.clientY, cx: crop.x, cy: crop.y, cw: crop.w, ch: crop.h });
    };
    const startResize = (e, dir) => {
        e.preventDefault(); e.stopPropagation();
        setResizing(true); setResizeDir(dir);
        setDragStart({ mx: e.clientX, my: e.clientY, cx: crop.x, cy: crop.y, cw: crop.w, ch: crop.h });
    };

    // ── crop & download ───────────────────────────────────────────────────────────
    const buildCanvas = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = crop.w;
        canvas.height = crop.h;
        if (outputFormat === 'jpg') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, crop.w, crop.h); }
        const img = new Image();
        img.src = image;
        return new Promise(res => {
            img.onload = () => {
                applyFilters(ctx, canvas, img, crop.x, crop.y, crop.w, crop.h, filters, rotation, flipH, flipV);
                res(canvas);
            };
        });
    };

    const handleDownload = async () => {
        const canvas = await buildCanvas();
        const mime = outputFormat === 'jpg' ? 'image/jpeg' : outputFormat === 'webp' ? 'image/webp' : 'image/png';
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `crop-${Date.now()}.${outputFormat}`;
            a.click(); URL.revokeObjectURL(url);
        }, mime, 0.95);
    };

    const handlePreview = async () => {
        const canvas = await buildCanvas();
        setPreviewUrl(canvas.toDataURL());
        setShowPreview(true);
    };

    const handleCopyToClipboard = async () => {
        const canvas = await buildCanvas();
        canvas.toBlob(async blob => {
            try {
                await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch { alert('Clipboard copy not supported in this browser.'); }
        });
    };

    const handleReset = () => {
        if (!naturalSize.w) return;
        const cw = Math.round(naturalSize.w * 0.6);
        const ch = Math.round(naturalSize.h * 0.6);
        setCrop({ x: Math.round((naturalSize.w - cw) / 2), y: Math.round((naturalSize.h - ch) / 2), w: cw, h: ch });
        setAspectRatio('free'); setRotation(0); setFlipH(false); setFlipV(false);
        setFilters({ brightness: 100, contrast: 100, saturation: 100, blur: 0 });
        setZoom(1);
    };

    const handleRotate = () => setRotation(r => (r + 90) % 360);

    const selectAll = () => setCrop({ x: 0, y: 0, w: naturalSize.w, h: naturalSize.h });

    // ── display values ─────────────────────────────────────────────────────────────
    const dCrop = getDisplayCrop();
    const isStackedLayout = viewportWidth < 1080;
    const isMobile = viewportWidth < 640;
    const imageMaxWidth = isStackedLayout ? 'calc(100vw - 32px)' : 'calc(100vw - 420px)';
    const imageMaxHeight = isStackedLayout ? '60vh' : '88vh';

    // ══════════════════════════ LANDING ══════════════════════════════════════════
    if (!image) return (
        <>
            <FontLink colors={C} darkMode={darkMode} />
            <div style={{ minHeight: '100vh', width: '100%', overflowX: 'hidden', background: `linear-gradient(180deg, ${C.pageStart} 0%, ${C.bg} 100%)`, color: C.text, fontFamily: "'DM Sans', sans-serif" }}>
                {/* Top bar */}
                <div style={{ borderBottom: `1px solid ${C.border}`, padding: isMobile ? '0 16px' : '0 32px', height: 60, display: 'flex', alignItems: 'center', gap: 12, background: C.glass, backdropFilter: 'blur(12px)' }}>
                    <div style={{ width: 28, height: 28, background: C.accent, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Scissors size={14} color={C.textOnAccent} />
                    </div>
                    <span className="brand-font" style={{ fontWeight: 700, fontSize: 17, color: C.text, letterSpacing: '-0.3px' }}>CropKit</span>
                    <span style={{ marginLeft: 8, background: `${C.accent}22`, color: C.accent, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99 }}>PRO</span>
                </div>

                {/* Hero */}
                <div style={{ width: '100%', maxWidth: 1240, margin: '0 auto', padding: isMobile ? '40px 16px 24px' : '72px 32px 40px', textAlign: 'center' }}>
                    <div className="anim-fadeup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `${C.accent}15`, border: `1px solid ${C.accent}33`, borderRadius: 99, padding: '6px 16px', marginBottom: 28 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.accent }} />
                        <span style={{ fontSize: 12, color: C.accent, fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Free • Private • No Upload</span>
                    </div>

                    <h1 className="anim-fadeup-2 brand-font" style={{ fontSize: 'clamp(36px, 7vw, 80px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-2px', marginBottom: 20, background: `linear-gradient(135deg, ${C.text} 0%, #4d6b88 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Crop Images<br />
                        <span style={{ background: `linear-gradient(90deg, ${C.accent}, #34a1ff)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Perfectly.</span>
                    </h1>

                    <p className="anim-fadeup-3" style={{ fontSize: 18, color: C.textMuted, maxWidth: 620, margin: '0 auto 48px', lineHeight: 1.7, fontWeight: 300 }}>
                        Professional image cropping with filters, rotation, flip, and multi-format export — all in your browser.
                    </p>

                    {/* Drop Zone */}
                    <div
                        onClick={() => fileInputRef.current.click()}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={() => setIsDragOver(false)}
                        style={{
                            width: '100%',
                            maxWidth: 980,
                            marginLeft: 'auto',
                            marginRight: 'auto',
                            border: `2px dashed ${isDragOver ? C.accent : C.border}`,
                            borderRadius: 20,
                            padding: isMobile ? '36px 18px' : '60px 24px',
                            cursor: 'pointer',
                            background: isDragOver ? `${C.accent}08` : C.surface,
                            transition: 'all 0.25s ease',
                            marginBottom: isMobile ? 32 : 48,
                            boxShadow: C.shadow,
                        }}
                    >
                        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
                        <div style={{ width: 72, height: 72, borderRadius: 20, background: `${C.accent}15`, margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${C.accent}33` }}>
                            <Upload size={28} color={C.accent} />
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Drop your image here</div>
                        <div style={{ fontSize: 14, color: C.textMuted }}>or click to browse · JPG, PNG, WEBP, GIF, AVIF supported</div>
                    </div>

                    {/* Feature cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, textAlign: 'left', maxWidth: 1120, margin: '0 auto' }}>
                        {[
                            { icon: <Scissors size={18} />, title: 'Smart Crop', desc: 'Drag, resize with aspect ratio lock' },
                            { icon: <Sliders size={18} />, title: 'Adjust & Filter', desc: 'Brightness, contrast, saturation, blur' },
                            { icon: <RotateCw size={18} />, title: 'Transform', desc: 'Rotate 90° and flip H/V' },
                            { icon: <Shield size={18} />, title: '100% Private', desc: 'All processing done locally' },
                            { icon: <Download size={18} />, title: 'Multi-Format', desc: 'Export to PNG, JPG, WEBP' },
                            { icon: <Copy size={18} />, title: 'Copy to Clipboard', desc: 'Paste directly into apps' },
                        ].map((f, i) => (
                            <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px 18px', transition: 'border-color 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = C.accent + '55'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                                <div style={{ color: C.accent, marginBottom: 10 }}>{f.icon}</div>
                                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{f.title}</div>
                                <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.5 }}>{f.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );

    // ══════════════════════════ EDITOR ═══════════════════════════════════════════
    return (
        <>
            <FontLink colors={C} darkMode={darkMode} />
            <div style={{ display: 'flex', flexDirection: isStackedLayout ? 'column' : 'row', width: '100%', minHeight: '100vh', background: `linear-gradient(180deg, ${C.editorStart} 0%, ${C.bg} 100%)`, color: C.text, overflowX: 'hidden', overflowY: 'hidden', fontFamily: "'DM Sans', sans-serif" }}>

                {/* ── SIDEBAR ─────────────────────────────────────────────────────────── */}
                <div style={{ width: isStackedLayout ? '100%' : 320, flexShrink: 0, background: C.surface, borderRight: isStackedLayout ? 'none' : `1px solid ${C.border}`, borderBottom: isStackedLayout ? `1px solid ${C.border}` : 'none', display: 'flex', flexDirection: 'column', height: isStackedLayout ? 'auto' : '100vh', boxShadow: isStackedLayout ? 'none' : C.sideShadow }}>

                    {/* Header */}
                    <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 24, height: 24, background: C.accent, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Scissors size={12} color={C.textOnAccent} />
                            </div>
                            <span className="brand-font" style={{ fontWeight: 700, fontSize: 15 }}>CropKit</span>
                        </div>
                        <button onClick={() => setImage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, padding: 4, borderRadius: 6, transition: 'color 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.color = C.danger}
                            onMouseLeave={e => e.currentTarget.style.color = C.textMuted}>
                            <X size={16} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
                        {[{ id: 'crop', label: 'Crop & Ratio' }, { id: 'adjust', label: 'Adjust' }].map(t => (
                            <button key={t.id} onClick={() => setTab(t.id)}
                                style={{ flex: 1, padding: '12px 0', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.id ? C.accent : 'transparent'}`, color: tab === t.id ? C.accent : C.textMuted, fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s' }}>
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Scrollable content */}
                    <div className="sidebar-scroll" style={{ overflowY: 'auto', flex: 1, padding: isMobile ? '16px' : '20px' }}>

                        {tab === 'crop' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                                {/* Image info */}
                                <div style={{ background: `${C.accent}10`, border: `1px solid ${C.accent}25`, borderRadius: 10, padding: '12px 14px', fontSize: 12, color: C.textMuted }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span>Original</span><span style={{ color: C.text }}>{naturalSize.w} × {naturalSize.h}px</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Crop</span><span style={{ color: C.accent, fontWeight: 600 }}>{crop.w} × {crop.h}px</span>
                                    </div>
                                </div>

                                {/* Dimensions */}
                                <Section label="Dimensions" colors={C}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                        {[['W', 'w', naturalSize.w], ['H', 'h', naturalSize.h]].map(([lbl, key, max]) => (
                                            <label key={key} style={{ position: 'relative' }}>
                                                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, fontWeight: 700, color: C.textFaint }}>{lbl}</span>
                                                <input type="number" value={crop[key]}
                                                    onChange={e => {
                                                        const v = clamp(+e.target.value || 0, 1, max);
                                                        setCrop(p => ({ ...p, [key]: v }));
                                                    }}
                                                    style={{ width: '100%', paddingLeft: 24, paddingRight: 8, paddingTop: 8, paddingBottom: 8, background: C.surfaceHover, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, outline: 'none' }} />
                                            </label>
                                        ))}
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
                                        {[['X', 'x', naturalSize.w - crop.w], ['Y', 'y', naturalSize.h - crop.h]].map(([lbl, key, max]) => (
                                            <label key={key} style={{ position: 'relative' }}>
                                                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, fontWeight: 700, color: C.textFaint }}>{lbl}</span>
                                                <input type="number" value={crop[key]}
                                                    onChange={e => { const v = clamp(+e.target.value || 0, 0, max); setCrop(p => ({ ...p, [key]: v })); }}
                                                    style={{ width: '100%', paddingLeft: 24, paddingRight: 8, paddingTop: 8, paddingBottom: 8, background: C.surfaceHover, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, outline: 'none' }} />
                                            </label>
                                        ))}
                                    </div>
                                </Section>

                                {/* Aspect Ratio */}
                                <Section label="Aspect Ratio" colors={C}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                                        {ASPECT_RATIOS.map(r => (
                                            <button key={r.value} onClick={() => setAspectRatio(r.value)}
                                                style={{ padding: '7px 4px', borderRadius: 8, border: `1px solid ${aspectRatio === r.value ? C.accent : C.border}`, background: aspectRatio === r.value ? `${C.accent}18` : C.surfaceHover, color: aspectRatio === r.value ? C.accent : C.textMuted, fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
                                                {r.label}
                                            </button>
                                        ))}
                                    </div>
                                </Section>

                                {/* Transform */}
                                <Section label="Transform" colors={C}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                                        {[
                                            { icon: <RotateCw size={16} />, label: 'Rotate', action: handleRotate },
                                            { icon: <FlipHorizontal size={16} />, label: 'Flip H', action: () => setFlipH(v => !v), active: flipH },
                                            { icon: <FlipVertical size={16} />, label: 'Flip V', action: () => setFlipV(v => !v), active: flipV },
                                        ].map((btn, i) => (
                                            <button key={i} onClick={btn.action}
                                                style={{ padding: '10px 6px', borderRadius: 10, border: `1px solid ${btn.active ? C.accent : C.border}`, background: btn.active ? `${C.accent}18` : C.surfaceHover, color: btn.active ? C.accent : C.textMuted, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 500, transition: 'all 0.15s' }}
                                                onMouseEnter={e => { if (!btn.active) e.currentTarget.style.borderColor = C.accent + '55'; }}
                                                onMouseLeave={e => { if (!btn.active) e.currentTarget.style.borderColor = C.border; }}>
                                                {btn.icon}{btn.label}
                                            </button>
                                        ))}
                                    </div>
                                    {rotation > 0 && <div style={{ marginTop: 8, fontSize: 12, color: C.textMuted, textAlign: 'center' }}>Rotation: {rotation}°</div>}
                                </Section>

                                {/* Zoom */}
                                <Section label={`Zoom: ${Math.round(zoom * 100)}%`} colors={C}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <button onClick={() => setZoom(v => Math.max(0.25, v - 0.1))} style={{ background: C.surfaceHover, border: `1px solid ${C.border}`, borderRadius: 8, color: C.textMuted, cursor: 'pointer', padding: '6px 8px', lineHeight: 0 }}><ZoomOut size={14} /></button>
                                        <input type="range" min="0.25" max="3" step="0.05" value={zoom} onChange={e => setZoom(+e.target.value)}
                                            style={{ flex: 1, accentColor: C.accent }} />
                                        <button onClick={() => setZoom(v => Math.min(3, v + 0.1))} style={{ background: C.surfaceHover, border: `1px solid ${C.border}`, borderRadius: 8, color: C.textMuted, cursor: 'pointer', padding: '6px 8px', lineHeight: 0 }}><ZoomIn size={14} /></button>
                                    </div>
                                </Section>

                                {/* Quick actions */}
                                <Section label="Quick Select" colors={C}>
                                    <button onClick={selectAll} style={{ width: '100%', padding: '8px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.surfaceHover, color: C.textMuted, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.15s' }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent + '55'; e.currentTarget.style.color = C.text; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textMuted; }}>
                                        <Maximize2 size={14} /> Select Entire Image
                                    </button>
                                </Section>

                                {/* Output Format */}
                                <Section label="Export Format" colors={C}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                                        {['png', 'jpg', 'webp'].map(fmt => (
                                            <button key={fmt} onClick={() => setOutputFormat(fmt)}
                                                style={{ padding: '8px', borderRadius: 8, border: `1px solid ${outputFormat === fmt ? C.accent : C.border}`, background: outputFormat === fmt ? `${C.accent}18` : C.surfaceHover, color: outputFormat === fmt ? C.accent : C.textMuted, fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase', transition: 'all 0.15s' }}>
                                                {fmt}
                                            </button>
                                        ))}
                                    </div>
                                </Section>
                            </div>
                        )}

                        {tab === 'adjust' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div style={{ background: `${C.warn}12`, border: `1px solid ${C.warn}30`, borderRadius: 10, padding: '10px 14px', fontSize: 12, color: C.warn, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                    <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                                    Adjustments apply to the exported image.
                                </div>
                                {[
                                    { key: 'brightness', icon: <Sun size={14} />, label: 'Brightness', min: 0, max: 200, default: 100 },
                                    { key: 'contrast', icon: <Contrast size={14} />, label: 'Contrast', min: 0, max: 300, default: 100 },
                                    { key: 'saturation', icon: <Droplet size={14} />, label: 'Saturation', min: 0, max: 300, default: 100 },
                                    { key: 'blur', icon: <Sliders size={14} />, label: 'Blur (px)', min: 0, max: 10, default: 0 },
                                ].map(f => (
                                    <Section key={f.key} label={<span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{f.icon}{f.label}: <span style={{ color: C.accent }}>{filters[f.key]}{f.key === 'blur' ? 'px' : '%'}</span></span>} colors={C}>
                                        <input type="range" min={f.min} max={f.max} step="1" value={filters[f.key]}
                                            onChange={e => setFilters(p => ({ ...p, [f.key]: +e.target.value }))}
                                            style={{ width: '100%', accentColor: C.accent }} />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.textFaint, marginTop: 4 }}>
                                            <span>{f.min}</span><span>{f.default} default</span><span>{f.max}</span>
                                        </div>
                                    </Section>
                                ))}
                                <button onClick={() => setFilters({ brightness: 100, contrast: 100, saturation: 100, blur: 0 })}
                                    style={{ width: '100%', padding: '9px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.surfaceHover, color: C.textMuted, fontSize: 13, cursor: 'pointer' }}>
                                    Reset Adjustments
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div style={{ padding: '16px 20px', borderTop: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            <button onClick={handlePreview}
                                style={{ padding: '10px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.surfaceHover, color: C.text, fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = C.accent + '55'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                                Preview
                            </button>
                            <button onClick={handleCopyToClipboard}
                                style={{ padding: '10px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.surfaceHover, color: copied ? C.success : C.text, fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'all 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = C.accent + '55'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                                {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
                            </button>
                        </div>
                        <button onClick={handleReset}
                            style={{ padding: '9px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.surfaceHover, color: C.textMuted, fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                            <RefreshCw size={14} /> Reset All
                        </button>
                        <button className="shimmer-btn" onClick={handleDownload}
                            style={{ padding: '13px', borderRadius: 12, border: 'none', background: `linear-gradient(135deg, ${C.accent}, #34a1ff)`, color: C.textOnAccent, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: "'Syne', sans-serif", letterSpacing: '-0.3px' }}>
                            <Download size={16} /> Crop & Download
                        </button>
                    </div>
                </div>

                {/* ── CANVAS AREA ─────────────────────────────────────────────────────── */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.canvas, position: 'relative', overflow: 'hidden', minHeight: isStackedLayout ? '68vh' : '100vh', padding: isMobile ? '16px' : '24px' }}
                    ref={containerRef}>

                    {/* Dot grid background */}
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(#d9e4ef 1px, transparent 1px)`, backgroundSize: '28px 28px', opacity: 0.7, pointerEvents: 'none' }} />

                    {/* Glow */}
                    <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(${C.accent}08, transparent 70%)`, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />

                    <div style={{ position: 'relative', userSelect: 'none', boxShadow: '0 28px 60px rgba(148, 163, 184, 0.25)', borderRadius: 18 }}>
                        <img
                            ref={imgRef}
                            src={image}
                            alt="source"
                            draggable={false}
                            style={{
                                maxWidth: imageMaxWidth,
                                maxHeight: imageMaxHeight,
                                display: 'block',
                                objectFit: 'contain',
                                filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) blur(${filters.blur}px)`,
                                transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1}) scale(${zoom})`,
                                transformOrigin: 'center',
                                transition: 'filter 0.1s',
                                borderRadius: 18,
                                background: '#ffffff',
                            }}
                        />

                        {/* Crop overlay */}
                        {imgRef.current && (
                            <div
                                onMouseDown={startDrag}
                                style={{
                                    position: 'absolute',
                                    left: dCrop.x,
                                    top: dCrop.y,
                                    width: dCrop.w,
                                    height: dCrop.h,
                                    boxShadow: '0 0 0 9999px rgba(255,255,255,0.6)',
                                    border: `1.5px solid ${C.accent}`,
                                    cursor: 'move',
                                    outline: `1px solid rgba(148,163,184,0.45)`,
                                }}>
                                {/* Rule of thirds */}
                                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.2, pointerEvents: 'none' }}>
                                    <line x1="33.33%" y1="0" x2="33.33%" y2="100%" stroke={C.accent} strokeWidth="0.8" />
                                    <line x1="66.66%" y1="0" x2="66.66%" y2="100%" stroke={C.accent} strokeWidth="0.8" />
                                    <line x1="0" y1="33.33%" x2="100%" y2="33.33%" stroke={C.accent} strokeWidth="0.8" />
                                    <line x1="0" y1="66.66%" x2="100%" y2="66.66%" stroke={C.accent} strokeWidth="0.8" />
                                </svg>

                                {/* Corner handles */}
                                {['nw', 'ne', 'sw', 'se'].map(dir => (
                                    <div key={dir} className="handle-hover"
                                        onMouseDown={e => startResize(e, dir)}
                                        style={{
                                            position: 'absolute',
                                            width: 10, height: 10,
                                            background: C.accent,
                                            border: `1.5px solid ${C.surface}`,
                                            borderRadius: '50%',
                                            ...(dir.includes('n') ? { top: -5 } : { bottom: -5 }),
                                            ...(dir.includes('w') ? { left: -5 } : { right: -5 }),
                                            cursor: dir + '-resize',
                                            transition: 'transform 0.1s, background 0.1s',
                                            zIndex: 10,
                                        }} />
                                ))}
                                {/* Edge handles */}
                                {['n', 's', 'w', 'e'].map(dir => (
                                    <div key={dir} className="handle-hover"
                                        onMouseDown={e => startResize(e, dir)}
                                        style={{
                                            position: 'absolute',
                                            background: C.accent,
                                            border: `1.5px solid ${C.surface}`,
                                            ...(dir === 'n' || dir === 's' ? { width: 20, height: 6, left: '50%', transform: 'translateX(-50%)', borderRadius: 3, ...(dir === 'n' ? { top: -3 } : { bottom: -3 }) }
                                                : { width: 6, height: 20, top: '50%', transform: 'translateY(-50%)', borderRadius: 3, ...(dir === 'w' ? { left: -3 } : { right: -3 }) }),
                                            cursor: dir + '-resize',
                                            transition: 'transform 0.1s, background 0.1s',
                                            zIndex: 10,
                                        }} />
                                ))}

                                {/* Size badge */}
                                <div style={{ position: 'absolute', bottom: -28, left: 0, background: `${C.accent}`, color: C.textOnAccent, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99, whiteSpace: 'nowrap', fontFamily: "'Syne', sans-serif", pointerEvents: 'none' }}>
                                    {crop.w} × {crop.h}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── PREVIEW MODAL ─────────────────────────────────────────────────────── */}
            {showPreview && previewUrl && (
                <div onClick={() => setShowPreview(false)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(241,245,249,0.82)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', padding: isMobile ? 16 : 24 }}>
                    <div onClick={e => e.stopPropagation()}
                        style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, overflow: 'hidden', maxWidth: '90vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 60px rgba(148, 163, 184, 0.25)' }}>
                        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="brand-font" style={{ fontWeight: 700, fontSize: 15 }}>Preview — {crop.w}×{crop.h}px</span>
                            <button onClick={() => setShowPreview(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted }}><X size={18} /></button>
                        </div>
                        <div style={{ overflow: 'auto', padding: isMobile ? 16 : 24, background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Crect width='8' height='8' fill='%23eef4fb'/%3E%3Crect x='8' y='8' width='8' height='8' fill='%23eef4fb'/%3E%3Crect x='8' y='0' width='8' height='8' fill='%23d9e7f5'/%3E%3Crect x='0' y='8' width='8' height='8' fill='%23d9e7f5'/%3E%3C/svg%3E")` }}>
                            <img src={previewUrl} alt="preview" style={{ maxWidth: '80vw', maxHeight: '70vh', objectFit: 'contain', display: 'block', boxShadow: '0 16px 40px rgba(148, 163, 184, 0.28)' }} />
                        </div>
                        <div style={{ padding: '12px 20px', borderTop: `1px solid ${C.border}`, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowPreview(false)}
                                style={{ padding: '9px 20px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.surfaceHover, color: C.text, fontSize: 13, cursor: 'pointer' }}>Close</button>
                            <button onClick={() => { setShowPreview(false); handleDownload(); }}
                                style={{ padding: '9px 20px', borderRadius: 10, border: 'none', background: C.accent, color: C.textOnAccent, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Download</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// ── Helper component ───────────────────────────────────────────────────────────
function Section({ label, children, colors }) {
    return (
        <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.6px', textTransform: 'uppercase', color: colors.textFaint, marginBottom: 10 }}>{label}</div>
            {children}
        </div>
    );
}
