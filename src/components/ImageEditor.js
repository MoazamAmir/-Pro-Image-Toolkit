import React, { useState, useRef, useEffect } from 'react';
import { threeDElements } from '../data/threeDElements';
import {
    Type,
    ImageIcon,
    Sliders,
    Crop,
    Layers,
    Download,
    RotateCw,
    FlipHorizontal,
    Undo,
    Redo,
    Trash2,
    Plus,
    Search,
    Check,
    X,
    ChevronRight,
    ChevronLeft,
    Sparkles,
    Maximize,
    Baseline,
    Palette,
    Minus,
    ArrowLeft,
    ChevronDown,
    MoreHorizontal,
    Music,
    Video,
    PieChart,
    Layout,
    Grid,
    Box,
    Smartphone,
    FileText,
    Sun,
    Smile,
    Triangle,
    Hexagon,
    Star,
    Circle as CircleIcon,
    Square as SquareIcon,
    ArrowRight,
    Heart,
    Instagram,
    Twitter,
    Facebook,
    Youtube,
    Bell,
    Mail,
    MapPin,
    Phone,
    Camera,
    Globe,
    Lock,
    User,
    Play,
    Copy,
    Clipboard,
    Unlock,
    MoreVertical,
    Trash,
    ArrowUp,
    ArrowDown,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Eye,
    EyeOff
} from 'lucide-react';
import { photoCategories } from '../data/photoCategories';
import { textTemplates } from '../data/textTemplates';
import { formTemplates, formCategories } from '../data/formTemplates';

const ImageEditor = ({ file, onApply, onCancel, darkMode }) => {
    const [activeTab, setActiveTab] = useState('text');
    const [imageSrc, setImageSrc] = useState(null);
    const [layers, setLayers] = useState([]);
    const [activeLayerId, setActiveLayerId] = useState(null);
    const [editingLayerId, setEditingLayerId] = useState(null);
    const [adjustments, setAdjustments] = useState({
        brightness: 100,
        contrast: 100,
        saturation: 100,
        blur: 0,
        grayscale: 0,
        sepia: 0,
        hue: 0,
        invert: 0,
        highlights: 0,
        shadows: 0
    });
    const [selectedFont, setSelectedFont] = useState('Inter');
    const [isConverting, setIsConverting] = useState(false);
    const [conversionProgress, setConversionProgress] = useState(0);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isCropMode, setIsCropMode] = useState(false);
    const [cropRect, setCropRect] = useState(null);
    const [elementsView, setElementsView] = useState('home'); // 'home', 'shapes', 'graphics', etc.
    const [formsView, setFormsView] = useState('home'); // 'home' or subcategory name
    const [contextMenu, setContextMenu] = useState(null); // { x, y, layerId }
    const [clipboard, setClipboard] = useState(null);
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [isSaving, setIsSaving] = useState(false);

    // Add current layers state to history
    const saveToHistory = (newLayers) => {
        const nextHistory = history.slice(0, historyIndex + 1);
        setHistory([...nextHistory, JSON.parse(JSON.stringify(newLayers))]);
        setHistoryIndex(nextHistory.length);
    };

    const undo = () => {
        if (historyIndex > 0) {
            const nextIndex = historyIndex - 1;
            setHistoryIndex(nextIndex);
            setLayers(JSON.parse(JSON.stringify(history[nextIndex])));
        } else if (historyIndex === 0) {
            // Initial state (empty layers)
            setHistoryIndex(-1);
            setLayers([]);
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            const nextIndex = historyIndex + 1;
            setHistoryIndex(nextIndex);
            setLayers(JSON.parse(JSON.stringify(history[nextIndex])));
        }
    };

    // Context Menu Actions
    const handleDuplicate = (layerId) => {
        const layer = layers.find(l => l.id === layerId);
        if (layer) {
            const newLayer = {
                ...layer,
                id: Date.now(),
                x: layer.x + 5,
                y: layer.y + 5,
                isSelected: true
            };
            const nextLayers = [...layers.map(l => ({ ...l, isSelected: false })), newLayer];
            setLayers(nextLayers);
            saveToHistory(nextLayers);
            setActiveLayerId(newLayer.id);
        }
        setContextMenu(null);
    };

    const handleDelete = (layerId) => {
        const nextLayers = layers.filter(l => l.id !== layerId);
        setLayers(nextLayers);
        saveToHistory(nextLayers);
        setActiveLayerId(null);
        setContextMenu(null);
    };

    const handleLock = (layerId) => {
        const nextLayers = layers.map(l => l.id === layerId ? { ...l, isLocked: !l.isLocked } : l);
        setLayers(nextLayers);
        saveToHistory(nextLayers);
        setContextMenu(null);
    };

    const handleCopy = (layerId) => {
        const layer = layers.find(l => l.id === layerId);
        if (layer) {
            setClipboard(layer);
        }
        setContextMenu(null);
    };

    const handlePaste = () => {
        if (clipboard) {
            const newLayer = {
                ...clipboard,
                id: Date.now(),
                x: clipboard.x + 5,
                y: clipboard.y + 5,
                isSelected: true
            };
            const nextLayers = [...layers.map(l => ({ ...l, isSelected: false })), newLayer];
            setLayers(nextLayers);
            saveToHistory(nextLayers);
            setActiveLayerId(newLayer.id);
        }
        setContextMenu(null);
    };

    const handleLayerOrder = (layerId, action) => {
        const layerIndex = layers.findIndex(l => l.id === layerId);
        if (layerIndex === -1) return;
        const newLayers = [...layers];
        const [movedLayer] = newLayers.splice(layerIndex, 1);
        if (action === 'front') {
            newLayers.push(movedLayer);
        } else if (action === 'back') {
            newLayers.unshift(movedLayer);
        }
        setLayers(newLayers);
        saveToHistory(newLayers);
        setContextMenu(null);
    };

    const handleRotate = (layerId) => {
        const nextLayers = layers.map(l => {
            if (l.id === layerId) {
                const rotation = ((l.rotation || 0) + 90) % 360;
                return { ...l, rotation };
            }
            return l;
        });
        setLayers(nextLayers);
        saveToHistory(nextLayers);
    };

    const handleFlipX = (layerId) => {
        const nextLayers = layers.map(l => {
            if (l.id === layerId) {
                return { ...l, flipX: !l.flipX };
            }
            return l;
        });
        setLayers(nextLayers);
        saveToHistory(nextLayers);
    };

    const handleFlipY = (layerId) => {
        const nextLayers = layers.map(l => {
            if (l.id === layerId) {
                return { ...l, flipY: !l.flipY };
            }
            return l;
        });
        setLayers(nextLayers);
        saveToHistory(nextLayers);
    };

    const handleToggleVisibility = (layerId) => {
        const nextLayers = layers.map(l => {
            if (l.id === layerId) {
                return { ...l, isHidden: !l.isHidden };
            }
            return l;
        });
        setLayers(nextLayers);
        saveToHistory(nextLayers);
    };

    const moveLayerInList = (index, direction) => {
        const newLayers = [...layers];
        const newIndex = direction === 'up' ? index + 1 : index - 1;
        if (newIndex < 0 || newIndex >= newLayers.length) return;

        const temp = newLayers[index];
        newLayers[index] = newLayers[newIndex];
        newLayers[newIndex] = temp;

        setLayers(newLayers);
        saveToHistory(newLayers);
    };

    const fonts = [
        { name: 'Inter', family: 'Inter, sans-serif' },
        { name: 'Roboto', family: 'Roboto, sans-serif' },
        { name: 'Playfair Display', family: '"Playfair Display", serif' },
        { name: 'Montserrat', family: 'Montserrat, sans-serif' },
        { name: 'Oswald', family: 'Oswald, sans-serif' },
        { name: 'Dancing Script', family: '"Dancing Script", cursive' }
    ];

    const filters = [
        { name: 'Normal', filter: {} },
        { name: 'Vintage', filter: { sepia: 50, contrast: 120, brightness: 90 } },
        { name: 'Cold', filter: { saturate: 80, hue: 180, contrast: 110 } },
        { name: 'Dramatic', filter: { contrast: 150, grayscale: 20 } },
        { name: 'B&W', filter: { grayscale: 100, contrast: 120 } },
        { name: 'Nostalgic', filter: { sepia: 30, brightness: 110, saturate: 120 } }
    ];

    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const imageRef = useRef(null);
    const [isDraggingLayer, setIsDraggingLayer] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [resizing, setResizing] = useState(null);
    const [isResizingCrop, setIsResizingCrop] = useState(false);

    // Use refs for dragging to avoid closure issues during rapid movements
    const dragRef = useRef({ isDragging: false, layerId: null, offset: { x: 0, y: 0 } });
    const resizeRef = useRef({ resizing: null });

    useEffect(() => {
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const src = e.target.result;
                // Initialize as a layer instead of background
                const img = new Image();
                img.onload = () => {
                    const newLayer = {
                        id: 'background-layer',
                        type: 'shape',
                        shapeType: 'image',
                        content: src,
                        color: 'transparent',
                        width: 1000, // Increased from 800 for better visibility
                        height: 1000 * (img.height / img.width),
                        x: 50,
                        y: 50,
                        isSelected: false,
                        isLocked: false, // Default unlocked so it can be deleted/moved if desired, or lock it by default
                        isBackground: true // 👈 NEW: Mark as background
                    };
                    setLayers([newLayer]);
                    saveToHistory([newLayer]);
                };
                img.src = src;
            };
            reader.readAsDataURL(file);
        }
    }, [file]);

    const handleMouseDown = (e, layer) => {
        if (editingLayerId === layer.id || layer.isLocked) return;

        e.preventDefault();
        e.stopPropagation();

        setActiveLayerId(layer.id);
        setLayers(prev => prev.map(l => ({
            ...l,
            isSelected: l.id === layer.id
        })));

        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();

        const layerXPx = ((layer.x || 0) / 100) * rect.width;
        const layerYPx = ((layer.y || 0) / 100) * rect.height;

        const offset = {
            x: e.clientX - rect.left - layerXPx,
            y: e.clientY - rect.top - layerYPx
        };

        setDragOffset(offset);
        setIsDraggingLayer(true);
        dragRef.current = { isDragging: true, layerId: layer.id, offset };
    };

    // Global movement handling for maximum responsiveness
    useEffect(() => {
        const handleGlobalMouseMove = (e) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();

            if (dragRef.current.isDragging && dragRef.current.layerId) {
                const { layerId, offset } = dragRef.current;
                const newX = ((e.clientX - rect.left - offset.x) / rect.width) * 100;
                const newY = ((e.clientY - rect.top - offset.y) / rect.height) * 100;

                setLayers(prev => prev.map(l =>
                    l.id === layerId ? { ...l, x: newX, y: newY } : l
                ));
            } else if (resizing) {
                const handle = resizing.handle;
                // movementX/Y are not always reliable in all browsers, 
                // but they are sufficient for relative resizing
                const dx = e.movementX;
                const dy = e.movementY;

                setLayers(prev => {
                    const l = prev.find(ly => ly.id === resizing.id);
                    if (!l) return prev;

                    return prev.map(ly => {
                        if (ly.id !== resizing.id) return ly;
                        let { width = 100, height = 100, fontSize = 24, x = 50, y = 50 } = ly;

                        if (ly.id === 'background-layer' || (ly.type === 'shape' && ly.shapeType === 'image')) {
                            if (handle.includes('e')) width = Math.max(20, width + dx);
                            if (handle.includes('w')) width = Math.max(20, width - dx);
                            if (handle.includes('s')) height = Math.max(20, height + dy);
                            if (handle.includes('n')) height = Math.max(20, height - dy);
                        } else if (ly.type === 'text' || (ly.type === 'shape' && ly.shapeType === 'icon')) {
                            const movement = Math.abs(dx) > Math.abs(dy) ? dx : dy;
                            if (handle.includes('e') || handle.includes('s')) {
                                if (ly.type === 'text') fontSize = Math.max(8, fontSize + movement);
                                else { width = Math.max(20, width + movement); height = width; }
                            } else {
                                if (ly.type === 'text') fontSize = Math.max(20, fontSize - movement);
                                else { width = Math.max(20, width - movement); height = width; }
                            }
                        } else {
                            if (handle.includes('e')) width = Math.max(20, width + dx);
                            if (handle.includes('w')) width = Math.max(20, width - dx);
                            if (handle.includes('s')) height = Math.max(20, height + dy);
                            if (handle.includes('n')) height = Math.max(20, height - dy);
                        }
                        return { ...ly, width, height, fontSize, x, y };
                    });
                });
            }
        };

        const handleGlobalMouseUp = () => {
            if (dragRef.current.isDragging || resizing) {
                handleMouseUp();
            }
        };

        if (isDraggingLayer || resizing) {
            window.addEventListener('mousemove', handleGlobalMouseMove);
            window.addEventListener('mouseup', handleGlobalMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleGlobalMouseMove);
            window.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [isDraggingLayer, resizing]);

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        if (isCropMode && cropRect && imageRef.current) {
            const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
            const scaleY = imageRef.current.naturalHeight / imageRef.current.height;
            const dx = e.movementX * scaleX;
            const dy = e.movementY * scaleY;
            if (isDraggingLayer) {
                setCropRect(prev => ({
                    ...prev,
                    x: Math.max(0, Math.min(prev.x + dx, imageRef.current.naturalWidth - prev.width)),
                    y: Math.max(0, Math.min(prev.y + dy, imageRef.current.naturalHeight - prev.height))
                }));
            } else if (isResizingCrop) {
                setCropRect(prev => {
                    let { width, height, x, y } = prev;
                    const img = imageRef.current;
                    if (isResizingCrop.includes('e')) width = Math.max(20, width + dx);
                    if (isResizingCrop.includes('s')) height = Math.max(20, height + dy);
                    if (isResizingCrop.includes('w')) {
                        const newWidth = Math.max(20, width - dx);
                        x += width - newWidth;
                        width = newWidth;
                    }
                    if (isResizingCrop.includes('n')) {
                        const newHeight = Math.max(20, height - dy);
                        y += height - newHeight;
                        height = newHeight;
                    }
                    // Constrain
                    x = Math.max(0, Math.min(x, img.naturalWidth - width));
                    y = Math.max(0, Math.min(y, img.naturalHeight - height));
                    width = Math.min(width, img.naturalWidth - x);
                    height = Math.min(height, img.naturalHeight - y);
                    return { ...prev, width, height, x, y };
                });
            }
            return;
        }

        if (dragRef.current.isDragging && dragRef.current.layerId) {
            // Already handled by global mouse move
            return;
        } else if (resizing) {
            // Already handled by global mouse move
            return;
        }
    };

    const handleMouseUp = () => {
        if (dragRef.current.isDragging || resizing || isResizingCrop) {
            saveToHistory(layers);
        }
        setIsDraggingLayer(false);
        setResizing(null);
        setIsResizingCrop(false);
        dragRef.current = { isDragging: false, layerId: null, offset: { x: 0, y: 0 } };
    };

    const handleResizeMouseDown = (e, layer, handle) => {
        e.stopPropagation();
        // For background layer, set a special flag
        if (layer.id === 'background-layer') {
            setResizing({ id: layer.id, handle, isBackground: true });
        } else {
            setResizing({ id: layer.id, handle });
        }
    };

    const handleCropMouseDown = (e, action) => {
        e.stopPropagation();
        if (action === 'move') setIsDraggingLayer(true);
        else setIsResizingCrop(action);
    };

    const addText = (type = 'body', template = null) => {
        const newLayer = template ? {
            id: Date.now(),
            type: 'text',
            content: template.name,
            fontSize: template.style.size || 32,
            fontFamily: template.style.font || selectedFont,
            fontWeight: template.style.weight || 'bold',
            color: template.style.color || (darkMode ? '#ffffff' : '#000000'),
            x: 50,
            y: 50,
            isSelected: true
        } : {
            id: Date.now(),
            type: 'text',
            content: type === 'heading' ? 'Add a heading' : type === 'subheading' ? 'Add a subheading' : 'Add a little bit of body text',
            fontSize: type === 'heading' ? 48 : type === 'subheading' ? 32 : 18,
            fontFamily: selectedFont,
            fontWeight: type === 'heading' ? '900' : 'normal',
            color: darkMode ? '#ffffff' : '#000000',
            x: 50,
            y: 50,
            isSelected: true
        };
        const nextLayers = [...layers.map(l => ({ ...l, isSelected: false })), newLayer];
        setLayers(nextLayers);
        saveToHistory(nextLayers);
        setActiveLayerId(newLayer.id);
    };

    const enterCropMode = () => {
        if (!imageRef.current) return;
        const img = imageRef.current;
        const initialCrop = {
            width: img.naturalWidth * 0.8,
            height: img.naturalHeight * 0.8,
            x: img.naturalWidth * 0.1,
            y: img.naturalHeight * 0.1
        };
        setCropRect(initialCrop);
        setIsCropMode(true);
        setIsPanelOpen(false);
    };

    const applyCrop = () => {
        if (!cropRect || !imageRef.current) return;
        const canvas = document.createElement('canvas');
        canvas.width = cropRect.width;
        canvas.height = cropRect.height;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            ctx.drawImage(img, cropRect.x, cropRect.y, cropRect.width, cropRect.height, 0, 0, cropRect.width, cropRect.height);
            const newDataUrl = canvas.toDataURL();
            setImageSrc(newDataUrl);

            // Update the background layer content if it exists
            const nextLayers = layers.map(l =>
                l.id === 'background-layer' ? { ...l, content: newDataUrl } : l
            );
            setLayers(nextLayers);
            saveToHistory(nextLayers);

            setIsCropMode(false);
            setCropRect(null);
        };
        img.src = imageSrc;
    };

    const addShape = (shapeType, extra = null) => {
        let width = 100;
        let height = 100;
        let color = '#9333ea';
        if (shapeType.startsWith('line') || shapeType === 'arrow') {
            width = 200;
            height = 20; // Hit area height
            color = darkMode ? '#ffffff' : '#000000';
        } else if (shapeType === 'icon') {
            width = 80;
            height = 80;
        } else if (shapeType === 'gradient') {
            color = extra;
        }
        const newLayer = {
            id: Date.now(),
            type: 'shape',
            shapeType,
            content: extra,
            color,
            width,
            height,
            x: 50,
            y: 50,
            isSelected: true
        };
        const nextLayers = [...layers.map(l => ({ ...l, isSelected: false })), newLayer];
        setLayers(nextLayers);
        saveToHistory(nextLayers);
        setActiveLayerId(newLayer.id);
    };

    const addIcon = (content) => {
        addShape('icon', content);
    };

    const addImageLayer = (url) => {
        const newLayer = {
            id: Date.now(),
            type: 'shape',
            shapeType: 'image',
            content: url,
            color: 'transparent',
            width: 400, // Increased from 200
            height: 600, // Increased from 300
            x: 50,
            y: 50,
            isSelected: true
        };
        const nextLayers = [...layers.map(l => ({ ...l, isSelected: false })), newLayer];
        setLayers(nextLayers);
        saveToHistory(nextLayers);
        setActiveLayerId(newLayer.id);
    };

    const applyPresetFilter = (f) => {
        setAdjustments({
            brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: 0, sepia: 0, hue: 0, invert: 0,
            ...f.filter
        });
    };

    const renderFinalCanvas = async () => {
        const canvas = document.createElement('canvas');
        const img = imageRef.current;
        if (!img) return null;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.filter = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%) blur(${adjustments.blur}px) grayscale(${adjustments.grayscale}%) sepia(${adjustments.sepia}%) hue-rotate(${adjustments.hue}deg) invert(${adjustments.invert}%)`;
        ctx.drawImage(img, 0, 0);
        if (adjustments.highlights !== 0 || adjustments.shadows !== 0) {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const h = adjustments.highlights / 100;
            const s = adjustments.shadows / 100;
            for (let i = 0; i < data.length; i += 4) {
                for (let j = 0; j < 3; j++) {
                    let v = data[i + j] / 255;
                    if (h !== 0 && v > 0.5) v += (v - 0.5) * 2 * h;
                    if (s !== 0 && v < 0.5) v += (0.5 - v) * 2 * s;
                    data[i + j] = Math.max(0, Math.min(255, v * 255));
                }
            }
            ctx.putImageData(imageData, 0, 0);
        }
        ctx.filter = 'none';
        for (const layer of layers) {
            if (layer.isHidden) continue;
            const rect = containerRef.current.getBoundingClientRect();
            const scaleX = img.naturalWidth / rect.width;
            const scaleY = img.naturalHeight / rect.height;
            const canvasX = (layer.x * rect.width / 100) * scaleX;
            const canvasY = (layer.y * rect.height / 100) * scaleY;

            ctx.save();
            ctx.translate(canvasX, canvasY);
            ctx.rotate(((layer.rotation || 0) * Math.PI) / 180);
            ctx.scale(layer.flipX ? -1 : 1, layer.flipY ? -1 : 1);

            if (layer.type === 'text') {
                ctx.font = `${layer.fontWeight} ${layer.fontSize * scaleX}px ${layer.fontFamily}`;
                ctx.fillStyle = layer.color;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(layer.content, 0, 0);
            } else if (layer.type === 'form') {
                const w = (layer.width || 280) * scaleX;
                const h = (layer.height || 350) * scaleY;
                const formData = layer.formData || {};

                // Draw Form Background
                ctx.fillStyle = formData.bg || '#ffffff';
                ctx.shadowColor = 'rgba(0,0,0,0.1)';
                ctx.shadowBlur = 20 * scaleX;
                // Simple rounded rect for export
                const r = 10 * scaleX;
                ctx.beginPath();
                if (ctx.roundRect) {
                    ctx.roundRect(-w / 2, -h / 2, w, h, r);
                } else {
                    ctx.rect(-w / 2, -h / 2, w, h);
                }
                ctx.fill();
                ctx.shadowBlur = 0;

                // Draw Border
                ctx.strokeStyle = formData.borderColor || '#e5e7eb';
                ctx.lineWidth = 1 * scaleX;
                ctx.stroke();

                // Draw Title
                ctx.fillStyle = formData.textColor || '#1f2937';
                ctx.font = `bold ${16 * scaleX}px Arial`;
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
                ctx.fillText(formData.name || '', -w / 2 + 16 * scaleX, -h / 2 + 16 * scaleX);

                // Draw Button
                if (formData.buttonText) {
                    const btnBg = formData.buttonStyle?.bg || '#1f2937';
                    const btnColor = formData.buttonStyle?.color || '#ffffff';
                    const btnW = w - 32 * scaleX;
                    const btnH = 40 * scaleY;
                    const btnX = -btnW / 2;
                    const btnY = h / 2 - btnH - 16 * scaleY;

                    ctx.fillStyle = btnBg;
                    ctx.beginPath();
                    if (ctx.roundRect) {
                        ctx.roundRect(btnX, btnY, btnW, btnH, 8 * scaleX);
                    } else {
                        ctx.rect(btnX, btnY, btnW, btnH);
                    }
                    ctx.fill();

                    ctx.fillStyle = btnColor;
                    ctx.font = `bold ${14 * scaleX}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(formData.buttonText, 0, btnY + btnH / 2);
                }

                // Draw Fields
                if (formData.fields) {
                    let currentY = -h / 2 + 50 * scaleY;
                    formData.fields.forEach((field) => {
                        const fieldW = w - 32 * scaleX;
                        const fieldStartX = -w / 2 + 16 * scaleX;

                        if (field.type === 'label' || field.label) {
                            ctx.fillStyle = formData.textColor || '#374151';
                            ctx.font = `600 ${12 * scaleX}px Arial`;
                            ctx.textAlign = 'left';
                            ctx.fillText(field.label || field.text || '', fieldStartX, currentY);
                            currentY += 18 * scaleY;
                        }

                        if (field.type === 'input' || field.type === 'textarea') {
                            ctx.strokeStyle = '#d1d5db';
                            ctx.lineWidth = 1 * scaleX;
                            const inputH = field.type === 'textarea' ? 60 * scaleY : 32 * scaleY;
                            ctx.strokeRect(fieldStartX, currentY, fieldW, inputH);
                            currentY += inputH + 12 * scaleY;
                        } else if (field.type === 'radio' || field.type === 'checkbox') {
                            const options = field.options || [];
                            options.forEach(opt => {
                                ctx.strokeStyle = '#d1d5db';
                                ctx.lineWidth = 1 * scaleX;
                                if (field.type === 'radio') {
                                    ctx.beginPath();
                                    ctx.arc(fieldStartX + 8 * scaleX, currentY + 8 * scaleY, 6 * scaleX, 0, Math.PI * 2);
                                    ctx.stroke();
                                } else {
                                    ctx.strokeRect(fieldStartX, currentY, 12 * scaleX, 12 * scaleY);
                                }
                                ctx.fillStyle = formData.textColor || '#374151';
                                ctx.font = `${11 * scaleX}px Arial`;
                                ctx.fillText(opt, fieldStartX + 20 * scaleX, currentY + 10 * scaleY);
                                currentY += 20 * scaleY;
                            });
                        } else if (field.type === 'rating') {
                            ctx.fillStyle = '#fbbf24';
                            for (let i = 0; i < (field.max || 5); i++) {
                                ctx.fillText('★', fieldStartX + (i * 20 * scaleX), currentY + 10 * scaleY);
                            }
                            currentY += 25 * scaleY;
                        }
                    });
                }
            } else if (layer.type === 'shape') {
                const w = (layer.width || 100) * scaleX;
                const h = (layer.height || 100) * scaleY;
                if (layer.shapeType === 'icon') {
                    ctx.font = `${Math.min(w, h) * 0.8}px Arial`;
                    ctx.fillStyle = layer.color || '#9333ea';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(layer.content, 0, 0);
                } else if (layer.shapeType === 'image') {
                    const imgObj = new Image();
                    imgObj.crossOrigin = "anonymous";
                    imgObj.src = layer.content;
                    await new Promise((resolve) => {
                        imgObj.onload = resolve;
                        imgObj.onerror = resolve; // Continue even if error
                    });
                    ctx.drawImage(imgObj, -w / 2, -h / 2, w, h);
                } else {
                    if (typeof layer.color === 'string' && layer.color.startsWith('linear-gradient')) {
                        const grad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
                        const colors = layer.color.match(/#[a-fA-F0-9]{6}/g);
                        if (colors && colors.length >= 2) {
                            grad.addColorStop(0, colors[0]);
                            grad.addColorStop(1, colors[1]);
                            ctx.fillStyle = grad;
                        } else {
                            ctx.fillStyle = '#9333ea';
                        }
                    } else {
                        ctx.fillStyle = layer.color;
                    }
                    if (layer.shapeType === 'square' || layer.shapeType === 'square-rounded') {
                        if (layer.shapeType === 'square-rounded') {
                            // Simple rounded rect implementation
                            const r = Math.min(w, h) * 0.2;
                            ctx.beginPath();
                            if (ctx.roundRect) {
                                ctx.roundRect(- w / 2, - h / 2, w, h, r);
                            } else {
                                ctx.rect(- w / 2, - h / 2, w, h);
                            }
                            ctx.fill();
                        } else {
                            ctx.fillRect(- w / 2, - h / 2, w, h);
                        }
                    } else if (layer.shapeType === 'circle') {
                        ctx.beginPath();
                        ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
                        ctx.fill();
                    } else if (layer.shapeType === 'triangle') {
                        ctx.beginPath();
                        ctx.moveTo(0, -h / 2);
                        ctx.lineTo(-w / 2, h / 2);
                        ctx.lineTo(w / 2, h / 2);
                        ctx.closePath();
                        ctx.fill();
                    } else if (layer.shapeType === 'pentagon') {
                        ctx.beginPath();
                        ctx.moveTo(0, -h / 2);
                        ctx.lineTo(w / 2, -h * 0.12);
                        ctx.lineTo(w * 0.32, h / 2);
                        ctx.lineTo(-w * 0.32, h / 2);
                        ctx.lineTo(-w / 2, -h * 0.12);
                        ctx.closePath();
                        ctx.fill();
                    } else if (layer.shapeType === 'hexagon') {
                        ctx.beginPath();
                        // Flat top hexagon: 25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%
                        ctx.moveTo(-w * 0.25, -h / 2);
                        ctx.lineTo(w * 0.25, -h / 2);
                        ctx.lineTo(w / 2, 0);
                        ctx.lineTo(w * 0.25, h / 2);
                        ctx.lineTo(- w * 0.25, h / 2);
                        ctx.lineTo(- w / 2, 0);
                        ctx.closePath();
                        ctx.fill();
                    } else if (layer.shapeType === 'octagon') {
                        ctx.beginPath();
                        // 30% 0%, 70% 0% ...
                        ctx.moveTo(- w * 0.2, - h / 2);
                        ctx.lineTo(w * 0.2, - h / 2);
                        ctx.lineTo(w / 2, - h * 0.2);
                        ctx.lineTo(w / 2, h * 0.2);
                        ctx.lineTo(w * 0.2, h / 2);
                        ctx.lineTo(- w * 0.2, h / 2);
                        ctx.lineTo(- w / 2, h * 0.2);
                        ctx.lineTo(- w / 2, - h * 0.2);
                        ctx.closePath();
                        ctx.fill();
                    } else if (layer.shapeType === 'parallelogram') {
                        ctx.beginPath();
                        // Skewed rect
                        const skewOffset = w * 0.2;
                        ctx.moveTo(- w / 2 + skewOffset, - h / 2);
                        ctx.lineTo(w / 2 + skewOffset, - h / 2);
                        ctx.lineTo(w / 2 - skewOffset, h / 2);
                        ctx.lineTo(- w / 2 - skewOffset, h / 2);
                        ctx.closePath();
                        ctx.fill();
                    } else if (layer.shapeType === 'star-5') {
                        ctx.beginPath();
                        const outerRadius = w / 2;
                        const innerRadius = w / 4;
                        for (let i = 0; i < 5; i++) {
                            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2; // Star points
                            ctx.lineTo(outerRadius * Math.cos(angle), outerRadius * Math.sin(angle));
                            const innerAngle = angle + Math.PI / 5;
                            ctx.lineTo(innerRadius * Math.cos(innerAngle), innerRadius * Math.sin(innerAngle));
                        }
                        ctx.closePath();
                        ctx.fill();
                    } else if (layer.shapeType?.startsWith('line')) {
                        ctx.beginPath();
                        ctx.lineWidth = Math.max(2, h * 0.1); // Match render scaling
                        ctx.strokeStyle = layer.color;
                        if (layer.shapeType === 'line-dashed') ctx.setLineDash([10, 5]);
                        if (layer.shapeType === 'line-dotted') ctx.setLineDash([2, 4]);
                        ctx.moveTo(- w / 2, 0);
                        ctx.lineTo(w / 2, 0);
                        ctx.stroke();
                        ctx.setLineDash([]);
                    } else if (layer.shapeType === 'arrow') {
                        ctx.beginPath();
                        ctx.lineWidth = Math.max(2, h * 0.1);
                        ctx.strokeStyle = layer.color;
                        ctx.fillStyle = layer.color;
                        // Line
                        ctx.moveTo(- w / 2, 0);
                        ctx.lineTo(w / 2, 0);
                        ctx.stroke();
                        // Arrow head
                        const headSize = Math.max(12, h * 0.6);
                        ctx.beginPath();
                        ctx.moveTo(w / 2, 0);
                        ctx.lineTo(w / 2 - headSize / 1.5, - headSize / 2);
                        ctx.lineTo(w / 2 - headSize / 1.5, headSize / 2);
                        ctx.closePath();
                        ctx.fill();
                    }
                }
            }
            ctx.restore();
        }
        return canvas;
    };

    const handleApply = async () => {
        try {
            setIsSaving(true);
            // Give UI a moment to show the saving overlay
            await new Promise(r => setTimeout(r, 100));

            const canvas = await renderFinalCanvas();
            if (canvas) {
                canvas.toBlob((blob) => {
                    if (blob) {
                        onApply(blob);
                    } else {
                        console.error('Failed to create blob');
                        onApply(null);
                    }
                    setIsSaving(false);
                }, 'image/png');
            } else {
                console.error('Failed to render canvas');
                setIsSaving(false);
                onCancel();
            }
        } catch (error) {
            console.error('Error during apply:', error);
            setIsSaving(false);
            onCancel();
        }
    };

    const handleDownload = async () => {
        const canvas = await renderFinalCanvas();
        if (canvas) {
            const link = document.createElement('a');
            link.download = `edited_${file.name.replace(/\.[^/.]+$/, "")}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
    };

    const TabButton = ({ id, icon: Icon, label, premium }) => (
        <button
            onClick={() => {
                if (activeTab === id) {
                    setIsPanelOpen(!isPanelOpen);
                } else {
                    setActiveTab(id);
                    setIsPanelOpen(true);
                }
            }}
            className={`group relative flex flex-col items-center justify-center w-full py-2.5 transition-all duration-200 ${activeTab === id && isPanelOpen
                ? (darkMode ? 'bg-gray-800 text-white' : 'bg-white text-purple-600')
                : (darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-purple-600')
                }`}
        >
            <div className={`p-1.5 rounded-lg transition-all duration-200 ${activeTab === id && isPanelOpen ? 'bg-purple-500/10' : 'group-hover:bg-gray-100/50'}`}>
                <Icon className={`w-5 h-5 ${activeTab === id && isPanelOpen ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
            </div>
            <span className="text-[8px] mt-1 font-bold uppercase tracking-tight">{label}</span>
            {premium && (
                <div className="absolute top-1 right-2">
                    <Sparkles className="w-2 h-2 text-amber-500 fill-amber-500" />
                </div>
            )}
            {activeTab === id && isPanelOpen && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-purple-600 rounded-r-full" />
            )}
        </button>
    );

    return (
        <div className={`fixed inset-0 z-[100] flex flex-col h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-all duration-500 overflow-hidden text-sm`}>
            {/* TOP NAVIGATION BAR */}
            <header className={`h-14 flex-shrink-0 flex items-center justify-between px-4 border-b ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} z-[60]`}>
                <div className="flex items-center gap-4">
                    <button
                        onClick={onCancel}
                        className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-purple-600'}`}
                        title="Cancel"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="h-6 w-px bg-gray-700/20 mx-1" />
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                            <Sparkles className="w-5 h-5 text-white fill-white/20" />
                        </div>
                        <span className="font-black tracking-tight text-sm hidden sm:block">Editor <span className="text-purple-500">PRO</span></span>
                    </div>
                    <div className="h-6 w-px bg-gray-700/20 mx-2 hidden md:block" />
                    <div className="flex items-center gap-1">
                        <button
                            onClick={undo}
                            disabled={historyIndex < 0}
                            className={`p-2 rounded-lg transition-all ${historyIndex < 0 ? 'opacity-30 cursor-not-allowed' : (darkMode ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-purple-600')}`}
                            title="Undo (Ctrl+Z)"
                        >
                            <Undo className="w-4 h-4" />
                        </button>
                        <button
                            onClick={redo}
                            disabled={historyIndex >= history.length - 1}
                            className={`p-2 rounded-lg transition-all ${historyIndex >= history.length - 1 ? 'opacity-30 cursor-not-allowed' : (darkMode ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-purple-600')}`}
                            title="Redo (Ctrl+Y)"
                        >
                            <Redo className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    <button
                        onClick={handleDownload}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-purple-50 text-purple-600 hover:bg-purple-100'}`}
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden xs:inline">Download Design</span>
                    </button>
                    <button
                        onClick={handleApply}
                        className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-purple-500/20 active:scale-95 transform"
                    >
                        <Check className="w-4 h-4" />
                        <span>Save Changes</span>
                    </button>
                </div>
            </header>
            <div className="flex flex-1 overflow-hidden relative">
                {/* LEFT SIDEBAR */}
                <div className={`w-[72px] sm:w-[64px] h-full flex-shrink-0 flex flex-col items-center py-2 border-r ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} z-50`}>
                    <TabButton id="design" icon={Layout} label="Design" />
                    <TabButton id="elements" icon={Grid} label="Elements" />
                    <TabButton id="text" icon={Type} label="Text" />
                    <TabButton id="layers" icon={Layers} label="Layers" />
                    <TabButton id="filters" icon={Palette} label="Filters" />
                    <TabButton id="adjust" icon={Sliders} label="Adjust" />
                    <TabButton id="brand" icon={Box} label="Brand" premium />
                    <TabButton id="forms" icon={FileText} label="Forms" />
                    <button
                        onClick={enterCropMode}
                        className={`group relative flex flex-col items-center justify-center w-full py-2.5 transition-all duration-200 ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-purple-600'}`}
                    >
                        <div className="p-1.5 rounded-lg group-hover:bg-gray-100/50">
                            <Crop className="w-5 h-5 stroke-[1.5px]" />
                        </div>
                        <span className="text-[8px] mt-1 font-bold uppercase tracking-tight">Crop</span>
                    </button>
                    <div className="flex-1" />
                </div>
                {/* DYNAMIC TOOL PANEL */}
                <div
                    className={`${isPanelOpen
                        ? 'w-[320px] sm:w-[280px] max-w-[90vw] translate-x-0'
                        : 'w-0 -translate-x-full opacity-0 pointer-events-none'
                        } h-full flex-shrink-0 transition-all duration-300 border-r ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} z-20 overflow-y-auto custom-scrollbar relative shadow-xl`}
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500" />
                    <div className="p-4 sm:p-6">
                        {activeTab === 'design' && (
                            <div className="animate-fadeIn space-y-4">
                                <h3 className={`text-lg font-black ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Design</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {[
                                        { name: 'Minimalist', desc: 'Clean and simple', icon: '✨' },
                                        { name: 'Corporate', desc: 'Professional', icon: '💼' },
                                        { name: 'E-commerce', desc: 'Product labels', icon: '📦' },
                                        { name: 'Social', desc: 'Bold typography', icon: '📱' }
                                    ].map(template => (
                                        <button
                                            key={template.name}
                                            className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all ${darkMode ? 'border-gray-800 bg-gray-800/40 hover:border-purple-500/50' : 'border-gray-100 bg-gray-50 hover:border-purple-200'} text-left group`}
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                                                {template.icon}
                                            </div>
                                            <div>
                                                <span className={`text-xs font-black uppercase ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{template.name}</span>
                                                <p className={`text-[9px] ${darkMode ? 'text-gray-600' : 'text-gray-400'} mt-0.5`}>{template.desc}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {activeTab === 'elements' && (
                            <div className="animate-fadeIn h-full flex flex-col">
                                {/* Search Bar - Always visible */}
                                <div className="relative mb-4 flex-shrink-0">
                                    <div className={`absolute inset-y-0 left-3 flex items-center pointer-events-none ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        <Search className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search elements"
                                        className={`w-full pl-10 pr-10 py-2.5 rounded-xl border-none shadow-sm ${darkMode ? 'bg-gray-800 text-white placeholder:text-gray-500' : 'bg-white text-gray-900 placeholder:text-gray-400 ring-1 ring-gray-200'} text-xs focus:ring-2 focus:ring-purple-500 transition-all`}
                                    />
                                    <button className={`absolute inset-y-0 right-3 flex items-center ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-purple-600'}`}>
                                        <Sliders className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2">
                                    {elementsView === 'home' && (
                                        <div className="space-y-6">
                                            {/* Categories Grid */}
                                            <div>
                                                <h3 className={`text-xs font-bold mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Browse categories</h3>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {[
                                                        { id: 'shapes', name: 'Shapes', icon: <div className="flex gap-0.5"><SquareIcon className="w-3 h-3 fill-current" /><CircleIcon className="w-3 h-3 fill-current" /></div>, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
                                                        // { id: 'graphics', name: 'Graphics', icon: <Sun className="w-5 h-5" />, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                                                        { id: 'stickers', name: 'Stickers', icon: <Smile className="w-5 h-5" />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                                                        { id: 'photos', name: 'Photos', icon: <ImageIcon className="w-5 h-5" />, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                                                        { id: 'videos', name: 'Videos', icon: <Video className="w-5 h-5" />, color: 'text-pink-500', bg: 'bg-pink-500/10' },
                                                        { id: 'audio', name: 'Audio', icon: <Music className="w-5 h-5" />, color: 'text-red-500', bg: 'bg-red-500/10' },
                                                        { id: 'charts', name: 'Charts', icon: <PieChart className="w-5 h-5" />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                                                        { id: 'tables', name: 'Tables', icon: <Grid className="w-5 h-5" />, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                                                        { id: 'frames', name: 'Frames', icon: <Crop className="w-5 h-5" />, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                                                        { id: 'grids', name: 'Grids', icon: <Layout className="w-5 h-5" />, color: 'text-teal-500', bg: 'bg-teal-500/10' },
                                                        { id: 'mockups', name: 'Mockups', icon: <Smartphone className="w-5 h-5" />, color: 'text-slate-500', bg: 'bg-slate-500/10' },
                                                        { id: '3d', name: '3D', icon: <Box className="w-5 h-5" />, color: 'text-violet-500', bg: 'bg-violet-500/10' }
                                                    ].map(cat => (
                                                        <button
                                                            key={cat.id}
                                                            onClick={() => setElementsView(cat.id)}
                                                            className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all hover:scale-105 ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
                                                        >
                                                            <div className={`w-10 h-10 rounded-lg ${cat.bg} ${cat.color} flex items-center justify-center shadow-sm`}>
                                                                {cat.icon}
                                                            </div>
                                                            <span className={`text-[10px] font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                                {cat.name}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            {/* Featured Section (example) */}
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <h3 className={`text-xs font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Featured</h3>
                                                    <button className="text-[10px] text-purple-600 font-bold hover:underline">See all</button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className={`h-24 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} flex items-center justify-center`}>
                                                        <Sparkles className="w-6 h-6 text-yellow-500" />
                                                    </div>
                                                    <div className={`h-24 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} flex items-center justify-center`}>
                                                        <Heart className="w-6 h-6 text-red-500" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {elementsView === 'shapes' && (
                                        <div className="animate-fadeIn space-y-6">
                                            {/* Header */}
                                            <div className="flex items-center gap-3 pb-2 border-b border-gray-100 dark:border-gray-800">
                                                <button
                                                    onClick={() => setElementsView('home')}
                                                    className={`p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
                                                >
                                                    <ArrowLeft className="w-4 h-4" />
                                                </button>
                                                <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Shapes</h3>
                                            </div>
                                            {/* Generate Shapes Button */}
                                            <button className={`w-full py-2.5 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 transition-all group ${darkMode ? 'border-gray-700 hover:border-purple-500 text-gray-400' : 'border-gray-200 hover:border-purple-500 text-gray-500'}`}>
                                                <Sparkles className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
                                                <span className="text-xs font-bold group-hover:text-purple-600">Generate shapes</span>
                                            </button>
                                            {/* Recently Used */}
                                            <div>
                                                <h4 className={`text-[10px] font-bold uppercase mb-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Recently used</h4>
                                                <div className="flex gap-3">
                                                    <button onClick={() => addShape('triangle')} className="w-12 h-12 flex items-center justify-center">
                                                        <Triangle className="w-10 h-10 fill-current text-gray-900 dark:text-white" />
                                                    </button>
                                                    <button onClick={() => addShape('circle')} className="w-12 h-12 flex items-center justify-center">
                                                        <CircleIcon className="w-10 h-10 fill-current text-gray-900 dark:text-white" />
                                                    </button>
                                                </div>
                                            </div>
                                            {/* Lines */}
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className={`text-[10px] font-bold uppercase ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Lines</h4>
                                                    <button className="text-[10px] hover:underline opacity-60">See all</button>
                                                </div>
                                                <div className="grid grid-cols-4 gap-4 items-center px-2">
                                                    <button onClick={() => addShape('line')} className="h-0.5 bg-gray-900 dark:bg-white w-full rounded-full" />
                                                    <button onClick={() => addShape('line-dashed')} className="h-0.5 border-t-2 border-dashed border-gray-900 dark:border-white w-full" />
                                                    <button onClick={() => addShape('line-dotted')} className="h-0.5 border-t-2 border-dotted border-gray-900 dark:border-white w-full" />
                                                    <button onClick={() => addShape('arrow')} className="flex items-center w-full">
                                                        <div className="h-0.5 bg-gray-900 dark:bg-white flex-1" />
                                                        <div className="w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[6px] border-l-gray-900 dark:border-l-white" />
                                                    </button>
                                                </div>
                                            </div>
                                            {/* Basic Shapes */}
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className={`text-[10px] font-bold uppercase ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Basic shapes</h4>
                                                    <button className="text-[10px] hover:underline opacity-60">See all</button>
                                                </div>
                                                <div className="grid grid-cols-4 gap-3 place-items-center">
                                                    <button onClick={() => addShape('square')} className="w-10 h-10 bg-gray-900 dark:bg-white rounded-sm hover:scale-110 transition-transform" />
                                                    <button onClick={() => addShape('square-rounded')} className="w-10 h-10 bg-gray-900 dark:bg-white rounded-xl hover:scale-110 transition-transform" />
                                                    <button onClick={() => addShape('circle')} className="w-10 h-10 bg-gray-900 dark:bg-white rounded-full hover:scale-110 transition-transform" />
                                                    <button onClick={() => addShape('triangle')} className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[35px] border-b-gray-900 dark:border-b-white hover:scale-110 transition-transform" />
                                                </div>
                                            </div>
                                            {/* Polygons */}
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className={`text-[10px] font-bold uppercase ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Polygons</h4>
                                                    <button className="text-[10px] hover:underline opacity-60">See all</button>
                                                </div>
                                                <div className="grid grid-cols-4 gap-3 place-items-center">
                                                    <button onClick={() => addShape('pentagon')} className="w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform">
                                                        <svg viewBox="0 0 24 24" className="w-full h-full fill-current text-gray-900 dark:text-white"><path d="M12 2L2 9L5 21H19L22 9L12 2Z" /></svg>
                                                    </button>
                                                    <button onClick={() => addShape('hexagon')} className="w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform">
                                                        <Hexagon className="w-full h-full fill-current text-gray-900 dark:text-white" />
                                                    </button>
                                                    <button onClick={() => addShape('octagon')} className="w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform">
                                                        <svg viewBox="0 0 24 24" className="w-full h-full fill-current text-gray-900 dark:text-white"><path d="M7.86 2H16.14L22 7.86V16.14L16.14 22H7.86L2 16.14V7.86L7.86 2Z" /></svg>
                                                    </button>
                                                    <button onClick={() => addShape('parallelogram')} className="w-10 h-10 bg-gray-900 dark:bg-white -skew-x-12 rounded-sm hover:scale-110 transition-transform" />
                                                </div>
                                            </div>
                                            {/* Stars */}
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className={`text-[10px] font-bold uppercase ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Stars</h4>
                                                    <button className="text-[10px] hover:underline opacity-60">See all</button>
                                                </div>
                                                <div className="grid grid-cols-4 gap-3 place-items-center">
                                                    <button onClick={() => addShape('star-5')} className="w-10 h-10 hover:scale-110 transition-transform">
                                                        <Star className="w-full h-full fill-current text-gray-900 dark:text-white" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {elementsView === 'graphics' && (
                                        <div className="animate-fadeIn space-y-8">
                                            {/* Header */}
                                            <div className="flex items-center gap-3 pb-2 border-b border-gray-100 dark:border-gray-800">
                                                <button
                                                    onClick={() => setElementsView('home')}
                                                    className={`p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
                                                >
                                                    <ArrowLeft className="w-4 h-4" />
                                                </button>
                                                <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Graphics</h3>
                                            </div>
                                            {/* Magic Recommendation */}
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className={`text-[10px] font-black uppercase ${darkMode ? 'text-gray-500' : 'text-gray-400'} flex items-center gap-1`}>
                                                        Magic Recommendation <Sparkles className="w-3 h-3 text-purple-500" />
                                                    </h4>
                                                    <button className="text-[10px] hover:underline opacity-60 text-purple-500 font-bold">See all</button>
                                                </div>
                                                <div className="grid grid-cols-4 gap-3">
                                                    {['✨', '🔥', '💎', '🎉'].map((emoji, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => addIcon(emoji)}
                                                            className="aspect-square flex items-center justify-center text-2xl hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border-2 border-transparent hover:border-purple-200"
                                                        >
                                                            {emoji}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            {/* Featured */}
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className={`text-[10px] font-black uppercase ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Featured</h4>
                                                    <button className="text-[10px] hover:underline opacity-60">See all</button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {[
                                                        { name: 'Summer', gradient: 'from-orange-400 to-rose-400' },
                                                        { name: 'Tech', gradient: 'from-blue-400 to-cyan-400' }
                                                    ].map((item) => (
                                                        <button
                                                            key={item.name}
                                                            className={`h-20 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg hover:scale-105 transition-transform`}
                                                        >
                                                            <span className="text-white font-bold text-xs drop-shadow-md">{item.name}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            {/* Gradients */}
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className={`text-[10px] font-black uppercase ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Gradients</h4>
                                                    <button className="text-[10px] hover:underline opacity-60">See all</button>
                                                </div>
                                                <div className="grid grid-cols-4 gap-3">
                                                    {[
                                                        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                                        'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
                                                        'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
                                                        'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)'
                                                    ].map((grad, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => addShape('gradient', grad)}
                                                            className="aspect-square rounded-full shadow-sm hover:scale-110 transition-transform border-2 border-white dark:border-gray-700"
                                                            style={{ background: grad }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            {/* Stickers */}
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className={`text-[10px] font-black uppercase ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Stickers</h4>
                                                    <button onClick={() => setElementsView('stickers')} className="text-[10px] hover:underline opacity-60">See all</button>
                                                </div>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {['🚀', '🎁', '👀'].map((emoji, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => addIcon(emoji)}
                                                            className="aspect-square flex items-center justify-center text-3xl hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                                                        >
                                                            {emoji}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            {/* Social Media */}
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className={`text-[10px] font-black uppercase ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Social Media</h4>
                                                    <button className="text-[10px] hover:underline opacity-60">See all</button>
                                                </div>
                                                <div className="grid grid-cols-4 gap-3">
                                                    {[
                                                        { name: 'Instagram', icon: <Instagram className="w-6 h-6" />, color: '#E1306C' },
                                                        { name: 'Twitter', icon: <Twitter className="w-6 h-6" />, color: '#1DA1F2' },
                                                        { name: 'Facebook', icon: <Facebook className="w-6 h-6" />, color: '#1877F2' },
                                                        { name: 'Youtube', icon: <Youtube className="w-6 h-6" />, color: '#FF0000' }
                                                    ].map((social) => (
                                                        <button
                                                            key={social.name}
                                                            onClick={() => addShape('icon', social.icon)}
                                                            className="aspect-square flex items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 shadow-sm transition-all group"
                                                            style={{ color: social.color }}
                                                        >
                                                            {social.icon}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            {/* Icons */}
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className={`text-[10px] font-black uppercase ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Icons</h4>
                                                    <button className="text-[10px] hover:underline opacity-60">See all</button>
                                                </div>
                                                <div className="grid grid-cols-5 gap-2">
                                                    {[
                                                        <Heart className="w-5 h-5" />,
                                                        <Star className="w-5 h-5" />,
                                                        <Bell className="w-5 h-5" />,
                                                        <Mail className="w-5 h-5" />,
                                                        <MapPin className="w-5 h-5" />,
                                                        <Phone className="w-5 h-5" />,
                                                        <Camera className="w-5 h-5" />,
                                                        <Globe className="w-5 h-5" />,
                                                        <Lock className="w-5 h-5" />,
                                                        <User className="w-5 h-5" />
                                                    ].map((icon, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => addShape('icon', icon)}
                                                            className={`aspect-square flex items-center justify-center rounded-lg ${darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'} transition-colors`}
                                                        >
                                                            {icon}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {elementsView === 'photos' && (
                                        <div className="animate-fadeIn space-y-6">
                                            {/* Header */}
                                            <div className="flex items-center gap-3 pb-2 border-b border-gray-100 dark:border-gray-800">
                                                <button
                                                    onClick={() => setElementsView('home')}
                                                    className={`p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
                                                >
                                                    <ArrowLeft className="w-4 h-4" />
                                                </button>
                                                <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Photos</h3>
                                            </div>
                                            {/* Photo Categories */}
                                            {photoCategories.map((category) => (
                                                <div key={category.title}>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className={`text-[10px] font-black uppercase ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{category.title}</h4>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {category.images.map((url, i) => (
                                                            <button
                                                                key={i}
                                                                onClick={() => addImageLayer(url)}
                                                                className="aspect-[3/2] rounded-lg bg-gray-200 dark:bg-gray-800 overflow-hidden relative group"
                                                            >
                                                                <img
                                                                    src={url}
                                                                    alt={category.title}
                                                                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                                                    loading="lazy"
                                                                    onError={(e) => e.target.parentElement.style.display = 'none'}
                                                                />
                                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                                    <Plus className="w-6 h-6 text-white drop-shadow-lg" />
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {elementsView === '3d' && (
                                        <div className="animate-fadeIn space-y-6">
                                            {/* Header */}
                                            <div className="flex items-center gap-3 pb-2 border-b border-gray-100 dark:border-gray-800">
                                                <button
                                                    onClick={() => setElementsView('home')}
                                                    className={`p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
                                                >
                                                    <ArrowLeft className="w-4 h-4" />
                                                </button>
                                                <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>3D Elements</h3>
                                            </div>
                                            {/* Subcategories */}
                                            {[
                                                { title: 'Icons & Stickers', icon: <Smile className="w-5 h-5" /> },
                                                { title: 'Characters & Emojis', icon: <User className="w-5 h-5" /> },
                                                { title: 'Food & Lifestyle', icon: <Heart className="w-5 h-5" /> },
                                                { title: 'Creative & Abstract', icon: <Hexagon className="w-5 h-5" /> },
                                                { title: 'Animals & Nature', icon: <Sun className="w-5 h-5" /> },
                                                { title: 'Work & Education', icon: <FileText className="w-5 h-5" /> },
                                                { title: 'Seasonal & Events', icon: <Sparkles className="w-5 h-5" /> }
                                            ].map((sub, index) => (
                                                <ThreeDCategory
                                                    key={index}
                                                    sub={sub}
                                                    items={threeDElements[sub.title]}
                                                    onAdd={addImageLayer}
                                                    darkMode={darkMode}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    {/* Default view for other categories (Placeholder) */}
                                    {elementsView !== 'home' && elementsView !== 'shapes' && elementsView !== 'graphics' && elementsView !== 'photos' && elementsView !== '3d' && (
                                        <div className="animate-fadeIn space-y-4">
                                            <div className="flex items-center gap-3 pb-2 border-b border-gray-100 dark:border-gray-800">
                                                <button
                                                    onClick={() => setElementsView('home')}
                                                    className={`p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
                                                >
                                                    <ArrowLeft className="w-4 h-4" />
                                                </button>
                                                <h3 className={`text-sm font-bold capitalize ${darkMode ? 'text-white' : 'text-gray-900'}`}>{elementsView}</h3>
                                            </div>
                                            <div className="flex flex-col items-center justify-center py-10 opacity-50">
                                                <Sparkles className="w-8 h-8 mb-2" />
                                                <p className="text-xs">More {elementsView} coming soon</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {activeTab === 'layers' && (
                            <div className="animate-fadeIn space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className={`text-lg font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>Layers</h3>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                                        {layers.length} Layers
                                    </span>
                                </div>
                                <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto pr-1 -mr-1 custom-scrollbar">
                                    {[...layers].reverse().map((layer, index) => {
                                        const actualIndex = layers.length - 1 - index;
                                        return (
                                            <div
                                                key={layer.id}
                                                onClick={() => {
                                                    setLayers(layers.map(l => ({ ...l, isSelected: l.id === layer.id })));
                                                    setActiveLayerId(layer.id);
                                                }}
                                                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer group ${layer.isSelected
                                                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                                                    : (darkMode ? 'border-gray-800 bg-gray-800/40 hover:border-gray-700' : 'border-gray-100 bg-gray-50 hover:border-gray-200')
                                                    }`}
                                            >
                                                {/* Layer Preview Icon */}
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-white dark:bg-gray-700 shadow-sm overflow-hidden flex-shrink-0`}>
                                                    {layer.type === 'text' ? <Type className="w-5 h-5 text-purple-600" /> :
                                                        layer.type === 'shape' ? (
                                                            layer.shapeType === 'image' ? (
                                                                <img src={layer.content} className="w-full h-full object-cover" alt="" />
                                                            ) : (
                                                                layer.shapeType === 'icon' ? <Smile className="w-5 h-5 text-blue-600" /> : <div className="w-5 h-5 rounded-sm bg-blue-500/20 border-2 border-blue-500" />
                                                            )
                                                        ) :
                                                            layer.type === 'form' ? <FileText className="w-5 h-5 text-orange-600" /> :
                                                                <ImageIcon className="w-5 h-5 text-gray-400" />}
                                                </div>

                                                {/* Layer Info */}
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-xs font-bold truncate ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                                        {layer.id === 'background-layer' ? 'Background Image' : (layer.content?.substring(0, 20) || layer.type)}
                                                    </p>
                                                    <p className="text-[9px] text-gray-500 capitalize tracking-wider">{layer.type}{layer.shapeType ? ` • ${layer.shapeType}` : ''}</p>
                                                </div>

                                                {/* Controls */}
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleToggleVisibility(layer.id); }}
                                                        className={`p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${layer.isHidden ? 'text-red-500 opacity-100' : 'text-gray-400 hover:text-purple-600'}`}
                                                        style={{ opacity: layer.isHidden ? 1 : undefined }}
                                                        title={layer.isHidden ? "Show Layer" : "Hide Layer"}
                                                    >
                                                        {layer.isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleLock(layer.id); }}
                                                        className={`p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${layer.isLocked ? 'text-amber-500 opacity-100' : 'text-gray-400 hover:text-purple-600'}`}
                                                        style={{ opacity: layer.isLocked ? 1 : undefined }}
                                                        title={layer.isLocked ? "Unlock Layer" : "Lock Layer"}
                                                    >
                                                        {layer.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                                                    </button>
                                                    <div className="flex flex-col gap-0.5 ml-1">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); moveLayerInList(actualIndex, 'up'); }}
                                                            disabled={actualIndex === layers.length - 1}
                                                            className="p-1 hover:text-purple-600 disabled:opacity-20 transition-colors"
                                                            title="Move Up"
                                                        >
                                                            <ArrowUp className="w-3 h-3" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); moveLayerInList(actualIndex, 'down'); }}
                                                            disabled={actualIndex === 0}
                                                            className="p-1 hover:text-purple-600 disabled:opacity-20 transition-colors"
                                                            title="Move Down"
                                                        >
                                                            <ArrowDown className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                                {/* Permanent status indicators if hidden or locked */}
                                                {!layer.isSelected && (layer.isHidden || layer.isLocked) && (
                                                    <div className="absolute right-3 top-3 flex gap-1 pointer-events-none group-hover:hidden">
                                                        {layer.isHidden && <EyeOff className="w-3 h-3 text-red-500" />}
                                                        {layer.isLocked && <Lock className="w-3 h-3 text-amber-500" />}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        {activeTab === 'text' && (
                            <div className="animate-fadeIn">
                                <div className="relative mb-4">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search fonts..."
                                        className={`w-full pl-9 pr-3 py-2 rounded-lg border-none ${darkMode ? 'bg-gray-800 text-white placeholder:text-gray-600' : 'bg-gray-100 text-gray-900 placeholder:text-gray-400'} text-xs focus:ring-2 focus:ring-purple-500`}
                                    />
                                </div>
                                <button
                                    onClick={() => addText('body')}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-1.5 mb-3 text-sm"
                                >
                                    <Plus className="w-4 h-4" /> Add text
                                </button>
                                <div className="space-y-4 mt-6">
                                    {/* Template Categories */}
                                    <div className="space-y-6">
                                        <h4 className={`text-[10px] font-black uppercase mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Templates</h4>
                                        {Object.entries(textTemplates).map(([category, items]) => (
                                            <React.Fragment key={category}>
                                                <TemplateCategory category={category} items={items} onAdd={(tpl) => addText('body', tpl)} darkMode={darkMode} />
                                                {false && (
                                                    <div key={category} className="animate-fadeIn">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h5 className={`text-[9px] font-bold uppercase ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>{category}</h5>
                                                            <button className="text-[9px] hover:underline opacity-60">See all</button>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {items.slice(0, 4).map((tpl, i) => (
                                                                <button
                                                                    key={i}
                                                                    onClick={() => addText('body', tpl)}
                                                                    className={`aspect-[3/2] rounded-xl border-2 transition-all flex flex-col items-center justify-center p-2 text-center group relative overflow-hidden snap-start ${darkMode ? 'border-gray-800 bg-gray-800/40 hover:border-purple-500/50' : 'border-gray-100 bg-gray-50 hover:border-purple-200'}`}
                                                                    style={{ backgroundColor: tpl.style.bg || 'transparent' }}
                                                                >
                                                                    <span
                                                                        style={{
                                                                            fontFamily: tpl.style.font,
                                                                            fontWeight: tpl.style.weight,
                                                                            fontSize: `${Math.min(24, tpl.style.size * 0.7)}px`,
                                                                            color: tpl.style.stroke ? 'transparent' : (tpl.style.bg ? (tpl.style.color || '#fff') : (darkMode ? '#fff' : (tpl.style.color || '#000'))),
                                                                            fontStyle: tpl.style.italic ? 'italic' : 'normal',
                                                                            letterSpacing: tpl.style.spacing ? `${tpl.style.spacing}px` : 'normal',
                                                                            WebkitTextStroke: tpl.style.stroke ? `1px ${darkMode ? '#fff' : '#0f172a'}` : 'none',
                                                                            lineHeight: 1.1
                                                                        }}
                                                                        className="pointer-events-none z-10"
                                                                    >
                                                                        {tpl.name}
                                                                    </span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                    <div>
                                        <h4 className={`text-[10px] font-black uppercase mb-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Fonts</h4>
                                        <div className="space-y-2">
                                            {fonts.map(font => (
                                                <button
                                                    key={font.name}
                                                    onClick={() => setSelectedFont(font.family)}
                                                    className={`w-full text-left px-3 py-2.5 rounded-xl border-2 transition-all group flex items-center justify-between ${selectedFont === font.family
                                                        ? (darkMode ? 'border-purple-600 bg-purple-600/20' : 'border-purple-600 bg-purple-50')
                                                        : (darkMode ? 'border-gray-800 hover:bg-gray-800' : 'border-gray-100 hover:bg-gray-50')
                                                        }`}
                                                >
                                                    <span style={{ fontFamily: font.family }} className="text-sm">{font.name}</span>
                                                    {selectedFont === font.family && <Check className="w-4 h-4 text-purple-600" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'filters' && (
                            <div className="animate-fadeIn space-y-4">
                                <h3 className={`text-lg font-black ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Filters</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {filters.map(f => (
                                        <button
                                            key={f.name}
                                            onClick={() => applyPresetFilter(f)}
                                            className={`p-2 rounded-xl border-2 transition-all ${darkMode ? 'border-gray-800 hover:bg-gray-800 hover:border-purple-500/30' : 'border-gray-100 hover:bg-gray-50 hover:border-purple-200'}`}
                                        >
                                            <div
                                                className="w-full aspect-[4/3] rounded-lg overflow-hidden relative"
                                                style={{
                                                    background: `url(${imageSrc}) center/cover`,
                                                    filter: f.name === 'Normal'
                                                        ? 'none'
                                                        : `brightness(${f.filter.brightness || 100}%) contrast(${f.filter.contrast || 100}%) saturate(${f.filter.saturate || 100}%) grayscale(${f.filter.grayscale || 0}%) sepia(${f.filter.sepia || 0}%)`
                                                }}
                                            />
                                            <span className={`text-[10px] block mt-1 font-bold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{f.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {activeTab === 'adjust' && (
                            <div className="animate-fadeIn space-y-5">
                                <h3 className={`text-lg font-black ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Adjust</h3>
                                {[
                                    { label: 'Brightness', key: 'brightness', min: 0, max: 200 },
                                    { label: 'Contrast', key: 'contrast', min: 0, max: 200 },
                                    { label: 'Saturation', key: 'saturation', min: 0, max: 200 },
                                    { label: 'Highlights', key: 'highlights', min: -100, max: 100 },
                                    { label: 'Shadows', key: 'shadows', min: -100, max: 100 },
                                    { label: 'Blur', key: 'blur', min: 0, max: 20 }
                                ].map(adj => (
                                    <div key={adj.key} className="space-y-1.5">
                                        <div className="flex justify-between text-[10px]">
                                            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{adj.label}</span>
                                            <span className="text-purple-600 font-bold">{adjustments[adj.key]}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min={adj.min}
                                            max={adj.max}
                                            value={adjustments[adj.key]}
                                            onChange={(e) => setAdjustments({ ...adjustments, [adj.key]: parseInt(e.target.value) })}
                                            className="w-full accent-purple-600 h-1.5 bg-gray-200 rounded-lg"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                        {activeTab === 'brand' && (
                            <div className="animate-fadeIn space-y-6">
                                <h3 className={`text-lg font-black ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Brand</h3>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className={`text-[10px] font-black uppercase mb-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Brand Colors</h4>
                                        <div className="grid grid-cols-4 gap-2">
                                            {['#9333ea', '#6366f1', '#f472b6', '#fbbf24', '#10b981', '#ef4444', '#3b82f6', '#000000'].map(color => (
                                                <button
                                                    key={color}
                                                    onClick={() => {/* Use color */ }}
                                                    className="w-full aspect-square rounded-lg border border-gray-200 shadow-sm hover:scale-105 transition-transform"
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className={`text-[10px] font-black uppercase mb-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Brand Kit</h4>
                                        <div className={`p-6 rounded-xl border-2 border-dashed ${darkMode ? 'border-gray-800 text-gray-500' : 'border-gray-200 text-gray-400'} flex flex-col items-center justify-center text-center`}>
                                            <Sparkles className="w-8 h-8 mb-2 opacity-20" />
                                            <p className="text-[10px] font-bold">Upload brand assets<br />(Coming Soon)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'forms' && (
                            <div className="animate-fadeIn h-full flex flex-col">
                                {formsView === 'home' ? (
                                    <div className="space-y-6">
                                        <h3 className={`text-lg font-black ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Forms</h3>
                                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Add pre-designed form templates to your design</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { id: 'Business', name: 'Business', icon: <FileText className="w-5 h-5" />, color: 'text-blue-500', bg: 'bg-blue-500/10', gradient: 'from-blue-400 to-blue-600' },
                                                { id: 'Education', name: 'Education', icon: <FileText className="w-5 h-5" />, color: 'text-green-500', bg: 'bg-green-500/10', gradient: 'from-green-400 to-green-600' },
                                                { id: 'Events', name: 'Events', icon: <FileText className="w-5 h-5" />, color: 'text-purple-500', bg: 'bg-purple-500/10', gradient: 'from-purple-400 to-purple-600' },
                                                { id: 'Feedback', name: 'Feedback', icon: <FileText className="w-5 h-5" />, color: 'text-orange-500', bg: 'bg-orange-500/10', gradient: 'from-orange-400 to-orange-600' },
                                                { id: 'Other', name: 'Other', icon: <MoreHorizontal className="w-5 h-5" />, color: 'text-gray-500', bg: 'bg-gray-500/10', gradient: 'from-gray-400 to-gray-600' }
                                            ].map(cat => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => setFormsView(cat.id)}
                                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-105 ${darkMode ? 'hover:bg-gray-800 bg-gray-800/50' : 'hover:bg-gray-50 bg-white'} shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}
                                                >
                                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center shadow-lg`}>
                                                        <span className="text-white">{cat.icon}</span>
                                                    </div>
                                                    <span className={`text-xs font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{cat.name}</span>
                                                    <span className={`text-[10px] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{formTemplates[cat.id]?.length || 0} templates</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 pb-2 border-b border-gray-100 dark:border-gray-800">
                                            <button onClick={() => setFormsView('home')} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                                <ArrowLeft className="w-4 h-4" />
                                            </button>
                                            <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formsView}</h3>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 pb-4">
                                            {formTemplates[formsView]?.map((form, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => {
                                                        const newLayer = { id: Date.now(), type: 'form', formData: form, width: 280, height: 350, x: 50, y: 50, isSelected: true };
                                                        const nextLayers = [...layers.map(l => ({ ...l, isSelected: false })), newLayer];
                                                        setLayers(nextLayers);
                                                        saveToHistory(nextLayers);
                                                        setActiveLayerId(newLayer.id);
                                                    }}
                                                    className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] border-2 border-transparent hover:border-purple-500/50"
                                                    style={{ background: form.bg }}
                                                >
                                                    <div className="p-4 min-h-[160px]">
                                                        <h4 className="font-bold text-sm mb-3 text-left" style={{ color: form.textColor || '#1f2937' }}>{form.name}</h4>
                                                        <div className="space-y-2">
                                                            {form.fields.slice(0, 3).map((field, fIdx) => (
                                                                <div key={fIdx}>
                                                                    {field.type === 'input' && <div className="h-6 rounded-md border px-2 flex items-center text-[9px] opacity-70" style={{ borderColor: form.borderColor || '#e5e7eb', color: form.textColor || '#6b7280' }}>{field.label}</div>}
                                                                    {field.type === 'textarea' && <div className="h-10 rounded-md border px-2 pt-1 text-[9px] opacity-70" style={{ borderColor: form.borderColor || '#e5e7eb', color: form.textColor || '#6b7280' }}>{field.label}</div>}
                                                                    {field.type === 'label' && <p className="text-[9px] font-medium text-left" style={{ color: form.textColor || '#374151' }}>{field.text}</p>}
                                                                    {field.type === 'radio' && (
                                                                        <div className="flex flex-col gap-1">
                                                                            {field.options?.slice(0, 2).map((opt, oIdx) => (
                                                                                <div key={oIdx} className="flex items-center gap-1 text-[8px]" style={{ color: form.textColor || '#374151' }}><div className="w-2.5 h-2.5 rounded-full border" style={{ borderColor: form.borderColor || '#d1d5db' }} />{opt}</div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                    {field.type === 'checkbox' && (
                                                                        <div className="flex flex-col gap-1">
                                                                            {field.options?.slice(0, 2).map((opt, oIdx) => (
                                                                                <div key={oIdx} className="flex items-center gap-1 text-[8px]" style={{ color: form.textColor || '#374151' }}>
                                                                                    <div className="w-2.5 h-2.5 rounded-sm border" style={{ borderColor: form.borderColor || '#d1d5db' }} />
                                                                                    {opt}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                        {form.buttonText && <div className="mt-3 py-1.5 px-3 rounded-md text-[9px] font-bold text-center" style={{ backgroundColor: form.buttonStyle?.bg || '#1f2937', color: form.buttonStyle?.color || '#ffffff' }}>{form.buttonText}</div>}
                                                    </div>
                                                    <div className="absolute inset-0 bg-purple-600/0 group-hover:bg-purple-600/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                        <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                                                            <Plus className="w-4 h-4 text-purple-600" />
                                                            <span className="text-xs font-bold text-purple-600">Add to canvas</span>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* MAIN CANVAS AREA */}
                <div
                    className={`flex-1 relative flex flex-col ${darkMode ? 'bg-[#0f111a]' : 'bg-[#f4f7fa]'} transition-all overflow-hidden`}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onClick={() => {
                        setActiveLayerId(null);
                        setLayers(layers.map(l => ({ ...l, isSelected: false })));
                    }}
                >
                    <div className="flex-1 overflow-auto p-3 sm:p-6 md:p-8 flex items-center justify-center custom-scrollbar relative">
                        <div
                            ref={containerRef}
                            onClick={(e) => e.stopPropagation()}
                            className="relative transition-all duration-700 animate-scaleIn shadow-xl border-2 border-transparent"
                            style={{
                                maxHeight: '90vh',
                                maxWidth: '95vw',
                                aspectRatio: imageRef.current ? `${imageRef.current.naturalWidth} / ${imageRef.current.naturalHeight}` : 'auto'
                            }}
                        >
                            {!activeLayerId && (
                                <div className="absolute -inset-1 border-2 border-purple-600/20 rounded pointer-events-none z-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                            {imageSrc && (
                                <div className="relative group/canvas overflow-hidden">
                                    <img
                                        ref={imageRef}
                                        src={imageSrc}
                                        alt="Working"
                                        className="max-w-full max-h-full block rounded pointer-events-none select-none"
                                        style={{
                                            filter: `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%) blur(${adjustments.blur}px) grayscale(${adjustments.grayscale}%) sepia(${adjustments.sepia}%) hue-rotate(${adjustments.hue}deg) invert(${adjustments.invert}%)`
                                        }}
                                    />
                                    {/* Crop Overlay */}
                                    {isCropMode && cropRect && imageRef.current && (
                                        <>
                                            <div
                                                className="absolute inset-0 bg-black/60 z-40 pointer-events-none"
                                                style={{
                                                    clipPath: `polygon(
                            0% 0%, 0% 100%,
                            ${(cropRect.x / imageRef.current.naturalWidth) * 100}% 100%,
                            ${(cropRect.x / imageRef.current.naturalWidth) * 100}% ${(cropRect.y / imageRef.current.naturalHeight) * 100}%,
                            ${((cropRect.x + cropRect.width) / imageRef.current.naturalWidth) * 100}% ${(cropRect.y / imageRef.current.naturalHeight) * 100}%,
                            ${((cropRect.x + cropRect.width) / imageRef.current.naturalWidth) * 100}% ${((cropRect.y + cropRect.height) / imageRef.current.naturalHeight) * 100}%,
                            ${(cropRect.x / imageRef.current.naturalWidth) * 100}% ${((cropRect.y + cropRect.height) / imageRef.current.naturalHeight) * 100}%,
                            ${(cropRect.x / imageRef.current.naturalWidth) * 100}% 100%,
                            100% 100%, 100% 0%
                          )`
                                                }}
                                            />
                                            <div
                                                onMouseDown={(e) => handleCropMouseDown(e, 'move')}
                                                className="absolute z-50 border-2 border-white cursor-move"
                                                style={{
                                                    left: `${(cropRect.x / imageRef.current.naturalWidth) * 100}%`,
                                                    top: `${(cropRect.y / imageRef.current.naturalHeight) * 100}%`,
                                                    width: `${(cropRect.width / imageRef.current.naturalWidth) * 100}%`,
                                                    height: `${(cropRect.height / imageRef.current.naturalHeight) * 100}%`,
                                                }}
                                            >
                                                {['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map(handle => (
                                                    <div
                                                        key={handle}
                                                        onMouseDown={(e) => handleCropMouseDown(e, handle)}
                                                        className={`absolute w-4 h-4 bg-white rounded-full border-2 border-purple-600 pointer-events-auto z-[60]
                            ${handle === 'nw' ? '-top-2 -left-2 cursor-nw-resize' : ''}
                            ${handle === 'n' ? '-top-2 left-1/2 -translate-x-1/2 cursor-n-resize' : ''}
                            ${handle === 'ne' ? '-top-2 -right-2 cursor-ne-resize' : ''}
                            ${handle === 'e' ? 'top-1/2 -right-2 -translate-y-1/2 cursor-e-resize' : ''}
                            ${handle === 'se' ? '-bottom-2 -right-2 cursor-se-resize' : ''}
                            ${handle === 's' ? '-bottom-2 left-1/2 -translate-x-1/2 cursor-s-resize' : ''}
                            ${handle === 'sw' ? '-bottom-2 -left-2 cursor-sw-resize' : ''}
                            ${handle === 'w' ? 'top-1/2 -left-2 -translate-y-1/2 cursor-w-resize' : ''}
                            `}
                                                    />
                                                ))}
                                                {/* Floating Crop Confirmation Toolbar */}
                                                <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-2xl border border-gray-200 z-[70] animate-fadeIn min-w-[320px]">
                                                    <div className="flex items-center gap-2 px-2">
                                                        <div className="flex flex-col">
                                                            <span className="text-[8px] font-black text-gray-400 uppercase">Width</span>
                                                            <input
                                                                type="number"
                                                                value={Math.round(cropRect.width)}
                                                                onChange={(e) => {
                                                                    const val = parseInt(e.target.value) || 0;
                                                                    const maxWidth = imageRef.current.naturalWidth - cropRect.x;
                                                                    setCropRect(prev => ({ ...prev, width: Math.max(20, Math.min(val, maxWidth)) }));
                                                                }}
                                                                className="w-16 bg-gray-100 border-none rounded-md px-2 py-1 text-xs font-bold text-purple-600 focus:ring-2 focus:ring-purple-500 outline-none"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[8px] font-black text-gray-400 uppercase">Height</span>
                                                            <input
                                                                type="number"
                                                                value={Math.round(cropRect.height)}
                                                                onChange={(e) => {
                                                                    const val = parseInt(e.target.value) || 0;
                                                                    const maxHeight = imageRef.current.naturalHeight - cropRect.y;
                                                                    setCropRect(prev => ({ ...prev, height: Math.max(20, Math.min(val, maxHeight)) }));
                                                                }}
                                                                className="w-16 bg-gray-100 border-none rounded-md px-2 py-1 text-xs font-bold text-purple-600 focus:ring-2 focus:ring-purple-500 outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="w-px h-8 bg-gray-200" />
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setIsCropMode(false); setCropRect(null); }}
                                                            className="px-3 py-2 text-[10px] font-black uppercase text-gray-500 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); applyCrop(); }}
                                                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-[10px] font-black uppercase rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center gap-1.5 active:scale-95"
                                                        >
                                                            <Check className="w-3.5 h-3.5" />
                                                            Apply
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                            {/* LAYERS */}
                            {layers.map(layer => (
                                <div
                                    key={layer.id}
                                    onMouseDown={(e) => handleMouseDown(e, layer)}
                                    onDoubleClick={(e) => {
                                        e.stopPropagation();
                                        if (layer.type === 'text') setEditingLayerId(layer.id);
                                    }}
                                    className={`absolute ${editingLayerId === layer.id ? 'cursor-text' : 'cursor-move'} select-none transition-shadow ${layer.isSelected ? 'ring-2 ring-purple-500 shadow-2xl' : 'hover:ring-1 hover:ring-purple-400'} ${layer.isHidden ? 'opacity-0 pointer-events-none' : ''}`}
                                    style={{
                                        left: `${layer.x}%`,
                                        top: `${layer.y}%`,
                                        transform: `translate(-50%, -50%) rotate(${layer.rotation || 0}deg) scale(${layer.flipX ? -1 : 1}, ${layer.flipY ? -1 : 1})`,
                                        zIndex: layer.id === 'background-layer' ? (layer.isSelected ? 5 : 0) : (layer.isSelected ? 30 : 10),
                                        visibility: layer.isHidden ? 'hidden' : 'visible',
                                        padding: '0px'
                                    }}
                                >
                                    {layer.type === 'text' ? (
                                        <div
                                            contentEditable={editingLayerId === layer.id}
                                            suppressContentEditableWarning
                                            onBlur={(e) => {
                                                setEditingLayerId(null);
                                                setLayers(layers.map(l => l.id === layer.id ? { ...l, content: e.target.innerText } : l));
                                            }}
                                            className={`px-1.5 py-0.5 outline-none ${editingLayerId === layer.id ? 'cursor-text select-text' : 'cursor-move select-none'}`}
                                            style={{
                                                fontSize: `${layer.fontSize}px`,
                                                fontFamily: layer.fontFamily,
                                                fontWeight: layer.fontWeight,
                                                color: layer.color,
                                                whiteSpace: 'nowrap',
                                                textShadow: darkMode ? '0 1px 2px rgba(0,0,0,0.6)' : 'none'
                                            }}
                                        >
                                            {layer.content}
                                        </div>
                                    ) : layer.type === 'form' ? (
                                        <div
                                            className="rounded-lg shadow-lg overflow-hidden flex flex-col pointer-events-none"
                                            style={{
                                                width: `${layer.width}px`,
                                                height: `${layer.height}px`,
                                                background: layer.formData?.bg || '#fff',
                                                border: `1px solid ${layer.formData?.borderColor || '#e5e7eb'}`
                                            }}
                                        >
                                            <div className="p-4 flex-1">
                                                <h4
                                                    className="font-bold text-base mb-4"
                                                    style={{ color: layer.formData?.textColor || '#1f2937' }}
                                                >
                                                    {layer.formData?.name}
                                                </h4>
                                                <div className="space-y-4">
                                                    {layer.formData?.fields?.map((field, fIdx) => (
                                                        <div key={fIdx} className="space-y-2">
                                                            {field.type === 'label' && (
                                                                <p className="text-xs font-semibold" style={{ color: layer.formData?.textColor || '#374151' }}>{field.text}</p>
                                                            )}
                                                            {field.type === 'input' && (
                                                                <div className="h-10 rounded-md border bg-white/50 px-3 flex items-center text-sm opacity-70" style={{ borderColor: layer.formData?.borderColor || '#e5e7eb', color: layer.formData?.textColor || '#6b7280' }}>
                                                                    {field.label}
                                                                </div>
                                                            )}
                                                            {field.type === 'textarea' && (
                                                                <div className="h-20 rounded-md border bg-white/50 px-3 pt-2 text-sm opacity-70" style={{ borderColor: layer.formData?.borderColor || '#e5e7eb', color: layer.formData?.textColor || '#6b7280' }}>
                                                                    {field.label}
                                                                </div>
                                                            )}
                                                            {field.type === 'radio' && (
                                                                <div className="flex flex-col gap-2">
                                                                    {field.options?.map((opt, oIdx) => (
                                                                        <div key={oIdx} className="flex items-center gap-2 text-sm" style={{ color: layer.formData?.textColor || '#374151' }}>
                                                                            <div className="w-4 h-4 rounded-full border bg-white/50" style={{ borderColor: layer.formData?.borderColor || '#d1d5db' }} />
                                                                            {opt}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            {field.type === 'checkbox' && (
                                                                <div className="flex flex-col gap-2">
                                                                    {field.options?.map((opt, oIdx) => (
                                                                        <div key={oIdx} className="flex items-center gap-2 text-sm" style={{ color: layer.formData?.textColor || '#374151' }}>
                                                                            <div className="w-4 h-4 rounded-sm border bg-white/50" style={{ borderColor: layer.formData?.borderColor || '#d1d5db' }} />
                                                                            {opt}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            {field.type === 'rating' && (
                                                                <div className="flex gap-1.5">
                                                                    {[...Array(field.max || 5)].map((_, sIdx) => (
                                                                        <Star key={sIdx} className="w-5 h-5" style={{ color: layer.formData?.accentColor || '#fbbf24' }} />
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                                {layer.formData?.buttonText && (
                                                    <div
                                                        className="mt-6 py-3 px-6 rounded-lg text-sm font-black text-center shadow-lg"
                                                        style={{
                                                            backgroundColor: layer.formData?.buttonStyle?.bg || '#1f2937',
                                                            color: layer.formData?.buttonStyle?.color || '#ffffff'
                                                        }}
                                                    >
                                                        {layer.formData?.buttonText}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className={`flex items-center justify-center ${layer.shapeType?.startsWith('line') || layer.shapeType === 'arrow' ? '' : 'overflow-hidden'}`}
                                            style={{
                                                width: `${layer.width}px`,
                                                height: `${layer.height}px`,
                                            }}
                                        >
                                            {/* Render Shape Content based on Type */}
                                            {(() => {
                                                const style = {
                                                    width: '100%',
                                                    height: '100%',
                                                    background: layer.shapeType === 'gradient' ? layer.color : (layer.shapeType === 'icon' || layer.shapeType === 'arrow' || layer.shapeType?.startsWith('line') ? 'transparent' : layer.color),
                                                };
                                                if (layer.shapeType === 'square-rounded') style.borderRadius = '20%';
                                                if (layer.shapeType === 'circle') style.borderRadius = '50%';
                                                if (layer.shapeType === 'triangle') style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
                                                if (layer.shapeType === 'pentagon') style.clipPath = 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)';
                                                if (layer.shapeType === 'hexagon') style.clipPath = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
                                                if (layer.shapeType === 'octagon') style.clipPath = 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)';
                                                if (layer.shapeType === 'parallelogram') { style.transform = 'skewX(-20deg)'; style.width = '80%'; } // visual approximation
                                                if (layer.shapeType === 'star-5') style.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
                                                // Icons
                                                if (layer.shapeType === 'icon') {
                                                    return (
                                                        <span style={{ fontSize: `${Math.min(layer.width, layer.height) * 0.6}px` }}>
                                                            {layer.content}
                                                        </span>
                                                    );
                                                }
                                                // Lines
                                                if (layer.shapeType?.startsWith('line')) {
                                                    const borderStyle = layer.shapeType === 'line-dashed' ? 'dashed' : layer.shapeType === 'line-dotted' ? 'dotted' : 'solid';
                                                    return (
                                                        <div style={{
                                                            width: '100%',
                                                            height: '0px',
                                                            borderTopWidth: `${Math.max(2, layer.height * 0.1)}px`,
                                                            borderTopStyle: borderStyle,
                                                            borderTopColor: layer.color
                                                        }} />
                                                    );
                                                }
                                                // Arrow
                                                if (layer.shapeType === 'arrow') {
                                                    return (
                                                        <div className="relative w-full flex items-center">
                                                            <div style={{ height: `${Math.max(2, layer.height * 0.1)}px`, background: layer.color, flex: 1 }} />
                                                            <div style={{
                                                                width: 0,
                                                                height: 0,
                                                                borderTop: `${Math.max(8, layer.height * 0.4)}px solid transparent`,
                                                                borderBottom: `${Math.max(8, layer.height * 0.4)}px solid transparent`,
                                                                borderLeft: `${Math.max(12, layer.height * 0.6)}px solid ${layer.color}`
                                                            }} />
                                                        </div>
                                                    );
                                                }
                                                // Image
                                                if (layer.shapeType === 'image') {
                                                    return (
                                                        <img
                                                            src={layer.content}
                                                            alt=""
                                                            className="w-full h-full object-cover pointer-events-none"
                                                            draggable={false}
                                                        />
                                                    );
                                                }
                                                return <div style={style} />;
                                            })()}
                                        </div>
                                    )}
                                    {layer.isSelected && (
                                        <>
                                            {/* Bounding box + handles */}
                                            <div className="absolute inset-0 border-2 border-purple-500 pointer-events-none">
                                                {['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map(handle => {
                                                    const isCorner = ['nw', 'ne', 'se', 'sw'].includes(handle);
                                                    if (!isCorner && (layer.type === 'text' || layer.shapeType === 'icon')) return null;
                                                    return (
                                                        <div
                                                            key={handle}
                                                            onMouseDown={(e) => handleResizeMouseDown(e, layer, handle)}
                                                            className={`absolute bg-white border border-gray-200 pointer-events-auto z-30 shadow-sm
                              ${handle === 'nw' || handle === 'ne' || handle === 'se' || handle === 'sw'
                                                                    ? 'w-3 h-3 rounded-full'
                                                                    : (handle === 'n' || handle === 's' ? 'w-6 h-2 rounded-full' : 'w-2 h-6 rounded-full')
                                                                }
                              ${handle === 'nw' ? '-top-1.5 -left-1.5 cursor-nw-resize' : ''}
                              ${handle === 'n' ? '-top-1 left-1/2 -translate-x-1/2 cursor-n-resize' : ''}
                              ${handle === 'ne' ? '-top-1.5 -right-1.5 cursor-ne-resize' : ''}
                              ${handle === 'e' ? 'top-1/2 -right-1 -translate-y-1/2 cursor-e-resize' : ''}
                              ${handle === 'se' ? '-bottom-1.5 -right-1.5 cursor-se-resize' : ''}
                              ${handle === 's' ? '-bottom-1 left-1/2 -translate-x-1/2 cursor-s-resize' : ''}
                              ${handle === 'sw' ? '-bottom-1.5 -left-1.5 cursor-sw-resize' : ''}
                              ${handle === 'w' ? 'top-1/2 -left-1 -translate-y-1/2 cursor-w-resize' : ''}
                              `}
                                                        />
                                                    );
                                                })}
                                            </div>
                                            {/* Floating Toolbar */}
                                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white dark:bg-gray-800 p-1 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 pointer-events-auto z-[100] animate-fadeIn">
                                                <button onClick={(e) => { e.stopPropagation(); handleDuplicate(layer.id); }} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-700 dark:text-gray-300" title="Duplicate">
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); handleDelete(layer.id); }} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md text-red-500" title="Delete">
                                                    <Trash className="w-4 h-4" />
                                                </button>
                                                <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-0.5" />
                                                <button onClick={(e) => { e.stopPropagation(); handleRotate(layer.id); }} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-700 dark:text-gray-300" title="Rotate 90°">
                                                    <RotateCw className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); handleFlipX(layer.id); }} className={`p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-700 dark:text-gray-300 ${layer.flipX ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600' : ''}`} title="Flip Horizontal">
                                                    <FlipHorizontal className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); handleFlipY(layer.id); }} className={`p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-700 dark:text-gray-300 ${layer.flipY ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600' : ''}`} title="Flip Vertical">
                                                    <FlipHorizontal className="w-3.5 h-3.5 rotate-90" />
                                                </button>
                                                <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-0.5" />
                                                <button onClick={(e) => { e.stopPropagation(); setContextMenu({ x: e.clientX, y: e.clientY, layerId: layer.id }); }} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-700 dark:text-gray-300" title="More">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                            {/* Context Menu */}
                                            {contextMenu && contextMenu.layerId === layer.id && (
                                                <div
                                                    className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-[150] w-48 py-1 overflow-hidden animate-fadeIn"
                                                    style={{ left: contextMenu.x, top: contextMenu.y }}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <button onClick={() => handleCopy(layer.id)} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 dark:text-gray-200">
                                                        <Copy className="w-3.5 h-3.5" /> Copy
                                                    </button>
                                                    <button onClick={() => handlePaste()} className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 dark:text-gray-200 ${!clipboard ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                        <Clipboard className="w-3.5 h-3.5" /> Paste
                                                    </button>
                                                    <button onClick={() => handleDuplicate(layer.id)} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 dark:text-gray-200">
                                                        <Copy className="w-3.5 h-3.5" /> Duplicate
                                                    </button>
                                                    <button onClick={() => handleDelete(layer.id)} className="w-full text-left px-3 py-2 text-xs hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 flex items-center gap-2">
                                                        <Trash className="w-3.5 h-3.5" /> Delete
                                                    </button>
                                                    <div className="h-px bg-gray-100 dark:bg-gray-700 my-1" />
                                                    <button onClick={() => handleLayerOrder(layer.id, 'front')} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 dark:text-gray-200">
                                                        <ArrowUp className="w-3.5 h-3.5" /> Bring to Front
                                                    </button>
                                                    <button onClick={() => handleLayerOrder(layer.id, 'back')} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 dark:text-gray-200">
                                                        <ArrowDown className="w-3.5 h-3.5" /> Send to Back
                                                    </button>
                                                    <div className="h-px bg-gray-100 dark:bg-gray-700 my-1" />
                                                    <button onClick={() => handleLock(layer.id)} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 dark:text-gray-200">
                                                        {layer.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />} {layer.isLocked ? 'Unlock' : 'Lock'}
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div >
            </div >

            {/* Saving Overlay */}
            {isSaving && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex flex-col items-center justify-center animate-fadeIn">
                    <div className="relative w-24 h-24 mb-6">
                        <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full" />
                        <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
                        </div>
                    </div>
                    <h3 className="text-xl font-black text-white mb-2 tracking-tight">Saving Your Design</h3>
                    <p className="text-gray-400 text-sm font-medium">Capturing every detail for conversion...</p>
                </div>
            )}

            <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(147, 51, 234, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(147, 51, 234, 0.4); }
        [contenteditable]:empty:before {
          content: attr(placeholder);
          color: #999;
          cursor: text;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
        </div >
    );
};

const TemplateCategory = ({ category, items, onAdd, darkMode }) => {
    const scrollRef = useRef(null);
    const scroll = (direction) => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = direction === 'left' ? -200 : 200;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };
    return (
        <div className="animate-fadeIn relative group/category">
            <div className="flex items-center justify-between mb-2">
                <h5 className={`text-[9px] font-bold uppercase ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>{category}</h5>
                <button className="text-[9px] hover:underline opacity-60">See all</button>
            </div>
            <div className="relative">
                <button
                    onClick={() => scroll('left')}
                    className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full shadow-lg opacity-0 group-hover/category:opacity-100 transition-opacity ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} -ml-3`}
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <div
                    ref={scrollRef}
                    className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {items.map((tpl, i) => (
                        <button
                            key={i}
                            onClick={() => onAdd(tpl)}
                            className={`flex-none w-[120px] aspect-[3/2] rounded-xl border-2 transition-all flex flex-col items-center justify-center p-2 text-center group relative overflow-hidden snap-start ${darkMode ? 'border-gray-800 bg-gray-800/40 hover:border-purple-500/50' : 'border-gray-100 bg-gray-50 hover:border-purple-200'}`}
                            style={{ backgroundColor: tpl.style.bg || 'transparent' }}
                        >
                            <span
                                style={{
                                    fontFamily: tpl.style.font,
                                    fontWeight: tpl.style.weight,
                                    fontSize: `${Math.min(20, tpl.style.size * 0.6)}px`,
                                    color: tpl.style.stroke ? 'transparent' : (tpl.style.bg ? (tpl.style.color || '#fff') : (darkMode ? '#fff' : (tpl.style.color || '#000'))),
                                    fontStyle: tpl.style.italic ? 'italic' : 'normal',
                                    letterSpacing: tpl.style.spacing ? `${tpl.style.spacing}px` : 'normal',
                                    WebkitTextStroke: tpl.style.stroke ? `1px ${darkMode ? '#fff' : '#0f172a'}` : 'none',
                                    lineHeight: 1.1
                                }}
                                className="pointer-events-none z-10"
                            >
                                {tpl.name}
                            </span>
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => scroll('right')}
                    className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full shadow-lg opacity-0 group-hover/category:opacity-100 transition-opacity ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} -mr-3`}
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

const ThreeDCategory = ({ sub, items, onAdd, darkMode }) => {
    const scrollRef = useRef(null);
    const scroll = (direction) => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = direction === 'left' ? -200 : 200;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };
    return (
        <div className="animate-fadeIn relative group/category">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} text-purple-500`}>
                        {sub.icon}
                    </div>
                    <h4 className={`text-[10px] font-black uppercase ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{sub.title}</h4>
                </div>
                <button className="text-[10px] hover:underline opacity-60">See all</button>
            </div>
            <div className="relative">
                <button
                    onClick={() => scroll('left')}
                    className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full shadow-lg opacity-0 group-hover/category:opacity-100 transition-opacity ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} -ml-3`}
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <div
                    ref={scrollRef}
                    className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {items ? items.map((url, i) => (
                        <button
                            key={i}
                            onClick={() => onAdd(url)}
                            className={`flex-none w-20 h-20 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden relative group hover:ring-2 hover:ring-purple-500 transition-all snap-start`}
                        >
                            <img
                                src={url}
                                alt={sub.title}
                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <Plus className="w-5 h-5 text-white drop-shadow-lg" />
                            </div>
                        </button>
                    )) : (
                        <div className="text-xs opacity-50 text-center py-4 w-full">No items</div>
                    )}
                </div>
                <button
                    onClick={() => scroll('right')}
                    className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full shadow-lg opacity-0 group-hover/category:opacity-100 transition-opacity ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} -mr-3`}
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default ImageEditor;