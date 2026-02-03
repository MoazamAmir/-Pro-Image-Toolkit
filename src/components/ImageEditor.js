import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { threeDElements } from '../data/threeDElements';
import { framesElements } from '../data/framesElements';
import { gridTemplates } from '../data/gridTemplates';
import * as LucideIcons from 'lucide-react';
import { photoCategories } from '../data/photoCategories';
import { textTemplates } from '../data/textTemplates';
import { formTemplates } from '../data/formTemplates';
import { mockupElements } from '../data/mockupElements';
import { animatedElements } from '../data/animatedElements';
import { graphicsElements } from '../data/graphicsElements';
import lottie from 'lottie-web';
import { saveEditorState, loadEditorState, saveRecentlyUsedAnimations, loadRecentlyUsedAnimations } from '../utils/editorStorage';
import ExportManager from './ExportManager';
import PageThumbnail from './PageThumbnail';
import p2pService from '../services/P2PService';
import FirebaseSyncService from '../services/FirebaseSyncService';
import AccessDenied from './AccessDenied';
import imageCompression from 'browser-image-compression';
import { uploadToCloudinary } from '../services/cloudinary';

const {
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
    Trash,
    Plus,
    Minus,
    Search,
    Check,
    X,
    ChevronRight,
    ChevronLeft,
    Sparkles,
    Maximize,
    Baseline,
    Palette,
    ArrowLeft,

    Loader2,
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
    Circle: CircleIcon,
    Square: SquareIcon,
    ArrowRight,
    Heart,
    Instagram,
    LayoutGrid,
    Maximize2,
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
    ArrowUp,
    ArrowDown,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Eye,
    EyeOff,
    ChevronUp,
    HelpCircle,
    ShoppingBag,
    Wallet,
    Map,
    Share2,
    FolderKanban
} = LucideIcons;

// ImageEditor component continues...

const ImageEditor = ({
    file,
    onApply,
    onCancel,
    darkMode,
    isViewOnly = false,
    initialDesignId = null,
    user
}) => {
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
    const [showExportPopup, setShowExportPopup] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [extractedColors, setExtractedColors] = useState([]);
    const [colorSearchQuery, setColorSearchQuery] = useState('');
    const [showAllColors, setShowAllColors] = useState(false);
    const [activeColorProperty, setActiveColorProperty] = useState('color'); // 'color' or 'borderColor' or 'backgroundColor'



    const [pages, setPages] = useState([{ id: 1, layers: [] }]);
    const [activePageId, setActivePageId] = useState(1);
    const navigate = useNavigate(); // For navigation
    const [zoom, setZoom] = useState(0.8); // 80% default zoom
    const [isGridView, setIsGridView] = useState(false);
    const [recentlyUsedAnimations, setRecentlyUsedAnimations] = useState([]);
    const [hasInteracted, setHasInteracted] = useState(false);

    const [hasPermission, setHasPermission] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const [accessLevelState, setAccessLevelState] = useState('private');

    // Canvas Size State
    const [canvasSize, setCanvasSize] = useState({ width: 1080, height: 720 });
    const [isResizingCanvas, setIsResizingCanvas] = useState(false); // { handle: 'e' | 's' | 'se' }

    const [designId, setDesignId] = useState(initialDesignId);
    const [isSyncing, setIsSyncing] = useState(false);
    const isReceivingSync = useRef(false);
    const syncTimeoutRef = useRef(null);

    const hasLoadedInitialData = useRef(!initialDesignId);

    // Projects Panel State
    const [userProjects, setUserProjects] = useState([]);
    const [projectsLoading, setProjectsLoading] = useState(false);
    const [projectSearchQuery, setProjectSearchQuery] = useState('');
    const [projectMenuOpen, setProjectMenuOpen] = useState(null); // design id of open menu


    useEffect(() => {
        setPages(prev => prev.map(p => p.id === activePageId ? { ...p, layers } : p));
    }, [layers]);

    // Initialize Firebase Sync
    useEffect(() => {
        const initFirebaseSync = async () => {
            if (!designId && !initialDesignId) {
                // Not in sync mode yet, maybe create a design later
                return;
            }

            const activeDesignId = designId || initialDesignId;
            setIsSyncing(true);

            try {
                // Initialize sync with callback for remote updates
                await FirebaseSyncService.initSync(activeDesignId, (remoteData) => {
                    if (isReceivingSync.current) return;

                    // Permission check
                    const designOwnerId = remoteData.ownerId;
                    const designAccessLevel = remoteData.accessLevel || 'private';
                    const currentUserId = user?.uid;

                    const isUserOwner = currentUserId && designOwnerId === currentUserId;
                    const hasAccess = designAccessLevel === 'public' || isUserOwner;

                    setIsOwner(isUserOwner);
                    setAccessLevelState(designAccessLevel);
                    setHasPermission(hasAccess);

                    if (!hasAccess) {
                        setIsSyncing(false);
                        return;
                    }

                    isReceivingSync.current = true;
                    console.log('[FirebaseSync] Received update:', remoteData);

                    if (remoteData.pages) {
                        setPages(remoteData.pages);
                        const activePage = remoteData.pages.find(p => p.id === (remoteData.activePageId || activePageId));
                        if (activePage) {
                            setLayers(activePage.layers || []);
                        }
                    }
                    if (remoteData.activePageId) setActivePageId(remoteData.activePageId);
                    if (remoteData.canvasSize) setCanvasSize(remoteData.canvasSize);
                    if (remoteData.adjustments) setAdjustments(prev => ({ ...prev, ...remoteData.adjustments }));

                    // Mark initial data as loaded so we can start syncing back
                    hasLoadedInitialData.current = true;

                    setTimeout(() => { isReceivingSync.current = false; }, 100);
                });

                if (initialDesignId) {
                    setDesignId(initialDesignId);
                }
            } catch (error) {
                console.error('[FirebaseSync] Initialization failed:', error);
            } finally {
                setIsSyncing(false);
            }
        };

        initFirebaseSync();

        return () => {
            FirebaseSyncService.stopSync();
        };
    }, [initialDesignId]);

    // Broadcast changes to Firebase (throttled)
    useEffect(() => {
        if (isReceivingSync.current || !designId || isViewOnly) return;

        // IMPORTANT: preventing overwriting server data with empty initial state
        if (!hasLoadedInitialData.current) return;

        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

        syncTimeoutRef.current = setTimeout(async () => {
            const currentState = {
                pages: pages.map(p => p.id === activePageId ? { ...p, layers } : p),
                activePageId,
                canvasSize,
                adjustments,
                lastModified: Date.now()
            };

            try {
                await FirebaseSyncService.updateDesign(designId, currentState);
            } catch (error) {
                console.error('[FirebaseSync] Update failed:', error);
            }
        }, 100);

        return () => {
            if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        };
    }, [pages, activePageId, canvasSize, adjustments, layers, designId, isViewOnly]);

    // Update URL when designId changes for sharing/collaborating
    useEffect(() => {
        if (designId && !isViewOnly) {
            const currentPath = window.location.pathname;
            const newPath = `/edit/${designId}`;
            if (currentPath !== newPath) {
                window.history.replaceState(null, '', newPath);
            }
        }
    }, [designId, isViewOnly]);


    // Load recently used animations on mount
    useEffect(() => {
        const loaded = loadRecentlyUsedAnimations();
        if (loaded && loaded.length > 0) {
            setRecentlyUsedAnimations(loaded);
        }
    }, []);

    // Fetch user projects when Projects tab is opened
    useEffect(() => {
        const fetchUserProjects = async () => {
            if (activeTab === 'projects' && user?.uid && !projectsLoading) {
                setProjectsLoading(true);
                try {
                    const designs = await FirebaseSyncService.getUserDesigns(user.uid);
                    setUserProjects(designs);
                } catch (error) {
                    console.error('Failed to fetch user projects:', error);
                } finally {
                    setProjectsLoading(false);
                }
            }
        };
        fetchUserProjects();
    }, [activeTab, user?.uid]);

    // Function to handle project deletion
    const handleDeleteProject = async (projectId) => {
        if (!user?.uid || !projectId) return;

        const confirmed = window.confirm('Are you sure you want to delete this project? This action cannot be undone.');
        if (!confirmed) return;

        try {
            const success = await FirebaseSyncService.deleteDesign(projectId, user.uid);
            if (success) {
                setUserProjects(prev => prev.filter(p => p.id !== projectId));
                setProjectMenuOpen(null);
            } else {
                alert('Failed to delete project. Please try again.');
            }
        } catch (error) {
            console.error('Delete project error:', error);
            alert('Failed to delete project. Please try again.');
        }
    };

    // Function to open a project for editing
    const handleOpenProject = (projectId) => {
        if (projectId === designId) return; // Already editing this design
        navigate(`/edit/${projectId}`);
    };


    // Add current layers state to history
    const saveToHistory = React.useCallback((newLayers) => {
        setHistory(prevHistory => {
            const nextHistory = prevHistory.slice(0, historyIndex + 1);
            return [...nextHistory, JSON.parse(JSON.stringify(newLayers))];
        });
        setHistoryIndex(prevIndex => prevIndex + 1);
    }, [historyIndex]);

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

    // Page Management functionality
    const addPage = () => {
        const newPageId = pages.length > 0 ? Math.max(...pages.map(p => p.id)) + 1 : 1;

        // Calculate dimensions to fit the screen
        let newWidth = canvasSize.width;
        let newHeight = canvasSize.height;

        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            // Use 90% of the container size to ensure it fits nicely within the screen
            // We use a fixed aspect ratio or just fill the available space minus padding
            newWidth = rect.width * 0.9;
            newHeight = rect.height * 0.9;
            setCanvasSize({ width: newWidth, height: newHeight });
        }

        const newBgLayer = {
            id: 'background-layer',
            type: 'shape',
            shapeType: 'rectangle', // Default to a white rectangle background
            color: '#ffffff',
            width: newWidth,
            height: newHeight,
            x: 50,
            y: 50,
            isSelected: true,
            isLocked: false,
            isBackground: true
        };
        const newPage = { id: newPageId, layers: [newBgLayer] };
        setPages(prev => {
            const updatedPages = [...prev, newPage];
            // Save all pages to ensure proper sync
            const updatedPagesWithCurrent = updatedPages.map(p =>
                p.id === activePageId ? { ...p, layers } : p
            );
            return updatedPagesWithCurrent;
        });
        setActivePageId(newPageId);
        setLayers([newBgLayer]);
        setActiveLayerId(newBgLayer.id);
        setHistory([[newBgLayer]]);
        setHistoryIndex(0);
        // Save state after page change
        saveEditorState({ layers: [newBgLayer], adjustments });
    };

    const switchPage = (pageId) => {
        // First save current layers to active page
        setPages(prev => {
            const updatedPages = prev.map(p =>
                p.id === activePageId ? { ...p, layers } : p
            );
            // Save the updated pages state
            saveEditorState({ layers: layers, adjustments });
            return updatedPages;
        });

        const targetPage = pages.find(p => p.id === pageId);
        if (targetPage) {
            setActivePageId(pageId);
            const savedLayers = targetPage.layers || [];
            setLayers(savedLayers);
            // Select background layer by default if it exists
            const bgLayer = savedLayers.find(l => l.id === 'background-layer');
            if (bgLayer) {
                setActiveLayerId(bgLayer.id);
                setLayers(savedLayers.map(l => ({ ...l, isSelected: l.id === bgLayer.id })));
            } else {
                setActiveLayerId(null);
            }
            setHistory([savedLayers]);
            setHistoryIndex(0);
        }
    };

    const deletePage = (e, pageId) => {
        e.stopPropagation();
        if (pages.length <= 1) return; // Prevent deleting the last page
        const newPages = pages.filter(p => p.id !== pageId);
        setPages(newPages);
        if (activePageId === pageId) {
            const lastPage = newPages[newPages.length - 1];
            setActivePageId(lastPage.id);
            setLayers(lastPage.layers);
        }
        // Save state after page deletion
        saveEditorState({ layers, adjustments });
    };

    // Canvas Resizing Logic
    const handleCanvasResizeMouseDown = (e, handle) => {
        if (isViewOnly) return;
        e.stopPropagation();
        e.preventDefault();
        setIsResizingCanvas({ handle });
    };

    // Context Menu Actions
    const handleDuplicate = (layerId) => {
        if (isViewOnly) return;
        const layer = layers.find(l => l.id === layerId);
        if (layer) {
            const newLayer = {
                ...layer,
                id: Date.now(),
                x: Math.min(100, layer.x + 5),
                y: Math.min(100, layer.y + 5),
                isSelected: true
            };
            addLayerWithSync(newLayer);
        }
        setContextMenu(null);
    };

    const handleDelete = (layerId) => {
        if (isViewOnly) return;
        const nextLayers = layers.filter(l => l.id !== layerId).map(l => ({
            ...l,
            isSelected: l.id === 'background-layer'
        }));
        setLayers(nextLayers);
        saveToHistory(nextLayers);
        setActiveLayerId('background-layer');
        // Ensure state is saved immediately after deletion
        saveEditorState({ layers: nextLayers, adjustments });
        setContextMenu(null);
    };

    const handleLock = (layerId) => {
        if (isViewOnly) return;
        const nextLayers = layers.map(l => l.id === layerId ? { ...l, isLocked: !l.isLocked } : l);
        setLayers(nextLayers);
        saveToHistory(nextLayers);
        setContextMenu(null);
    };

    const handleCopy = (layerId) => {
        if (isViewOnly) return;
        const layer = layers.find(l => l.id === layerId);
        if (layer) {
            setClipboard(layer);
        }
        setContextMenu(null);
    };

    const handlePaste = () => {
        if (isViewOnly) return;
        if (clipboard) {
            const newLayer = {
                ...clipboard,
                id: Date.now(),
                x: Math.min(100, clipboard.x + 5),
                y: Math.min(100, clipboard.y + 5),
                isSelected: true
            };
            addLayerWithSync(newLayer);
        }
        setContextMenu(null);
    };

    /**
     * Helper to handle image compression and Cloudinary upload
     */
    const handleFileUpload = async (file) => {
        if (!file || !file.type.startsWith('image/')) return null;

        setIsUploading(true);
        try {
            // 1. Compress image
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
                fileType: 'image/jpeg'
            };

            let processedFile = file;
            try {
                processedFile = await imageCompression(file, options);
            } catch (e) {
                console.warn('Compression failed, using original:', e);
            }

            // 2. Upload to Cloudinary
            const cloudinaryUrl = await uploadToCloudinary(processedFile);
            return cloudinaryUrl;
        } catch (error) {
            console.error('File upload error:', error);
            alert('Image upload failed. Please check your connection.');
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    const generateSVG = (customLayers = null) => {
        const targetLayers = customLayers || layers;
        const width = canvasSize.width;
        const height = canvasSize.height;

        let svgContent = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;

        targetLayers.forEach(layer => {
            if (layer.isHidden) return;
            const x = (layer.x * width) / 100;
            const y = (layer.y * height) / 100;
            const w = (layer.width * width) / 100;
            const h = (layer.height * height) / 100;
            const rotation = layer.rotation || 0;
            const transform = `translate(${x}, ${y}) rotate(${rotation}) scale(${layer.flipX ? -1 : 1}, ${layer.flipY ? -1 : 1})`;

            if (layer.type === 'text') {
                svgContent += `<text transform="${transform}" font-family="${layer.fontFamily}" font-size="${layer.fontSize}" fill="${layer.color}" text-anchor="middle" dominant-baseline="middle">${layer.content}</text>`;
            } else if (layer.type === 'shape' && layer.shapeType === 'rectangle') {
                svgContent += `<rect transform="${transform}" x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="${layer.color}" />`;
            } else if (layer.type === 'shape' && layer.shapeType === 'circle') {
                svgContent += `<circle transform="${transform}" cx="0" cy="0" r="${Math.min(w, h) / 2}" fill="${layer.color}" />`;
            } else if (layer.type === 'shape' && layer.shapeType === 'image') {
                // Simplified: embed image as base64 or just a placeholder
                svgContent += `<rect transform="${transform}" x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="#f3f4f6" stroke="#e5e7eb" />`;
            }
            // Add more types as needed
        });

        svgContent += '</svg>';
        return svgContent;
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
        const processFile = async () => {
            if (file) {
                // Skip processing for dummy project file used for P2P connection
                if (file.name === 'Project' && file.type === 'image/project') {
                    console.log('Opened in Project Mode, waiting for P2P state...');
                    return;
                }

                try {
                    // Reset everything to start fresh with a new upload IMMEDIATELY
                    setLayers([]);
                    setImageSrc(null); // Clear previous image
                    setPages([{ id: 1, layers: [] }]);
                    setActivePageId(1);
                    setHistory([]);
                    setHistoryIndex(-1);
                    setDesignId(null); // New upload is a new design
                    hasLoadedInitialData.current = true; // Mark as loaded so we don't fetch old project sync

                    setAdjustments({
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

                    // 1. CREATE LOCAL PREVIEW IMMEDIATELY
                    const localUrl = URL.createObjectURL(file);
                    setImageSrc(localUrl);

                    // Pre-load image to get dimensions and show immediate canvas
                    const previewImg = new Image();
                    previewImg.src = localUrl;
                    previewImg.onload = () => {
                        let width = previewImg.width;
                        let height = previewImg.height;
                        const maxInitialWidth = 1500;
                        const maxInitialHeight = window.innerHeight * 0.8;

                        if (width > maxInitialWidth) {
                            const ratio = maxInitialWidth / width;
                            width = maxInitialWidth;
                            height = height * ratio;
                        }
                        if (height > maxInitialHeight) {
                            const ratio = maxInitialHeight / height;
                            height = maxInitialHeight;
                            width = width * ratio;
                        }

                        setCanvasSize({ width, height });

                        const initialBgLayer = {
                            id: 'background-layer',
                            type: 'shape',
                            shapeType: 'image',
                            content: localUrl,
                            color: 'transparent',
                            width: width,
                            height: height,
                            x: 50,
                            y: 50,
                            isSelected: true,
                            isLocked: false,
                            isBackground: true
                        };
                        setLayers([initialBgLayer]);
                        saveToHistory([initialBgLayer]);
                    };

                    // 2. START BACKGROUND UPLOAD TO CLOUDINARY
                    const cloudinaryUrl = await handleFileUpload(file);
                    if (!cloudinaryUrl) return;

                    // 3. UPDATE PERMANENT SOURCE ONCE READY
                    setImageSrc(cloudinaryUrl);
                    setLayers(prev => prev.map(l =>
                        l.id === 'background-layer' ? { ...l, content: cloudinaryUrl } : l
                    ));

                } catch (err) {
                    console.error("Error processing file:", err);
                }
            }
        };
        processFile();
    }, [file]);

    // Auto-save layers and adjustments to localStorage whenever they change
    useEffect(() => {
        // Only save if we have more than just the background layer or adjustments have changed
        if (layers.length > 0) {
            saveEditorState({ layers, adjustments });
        }
    }, [layers, adjustments]);

    // Enhanced function to add layers with proper synchronization
    const addLayerWithSync = (newLayer) => {
        const nextLayers = [...layers.map(l => ({ ...l, isSelected: false })), newLayer];
        setLayers(nextLayers);
        saveToHistory(nextLayers);
        setActiveLayerId(newLayer.id);
        // Ensure state is saved immediately after adding new elements
        saveEditorState({ layers: nextLayers, adjustments });
    };


    // Load state from local storage on mount
    useEffect(() => {
        const savedState = loadEditorState();
        if (savedState) {
            // Sanitize layers to remove corrupted elements and ensure proper serialization
            const sanitizedLayers = (savedState.layers || []).map(layer => {
                // If content is an object when it should be a string, try to recover
                if (layer.shapeType === 'icon' && typeof layer.content === 'object' && layer.content !== null) {
                    console.warn('Recovered corrupted icon layer:', layer);
                    return { ...layer, content: layer.content.name || 'Star' }; // Use name property if available
                }

                // Handle lottie items that might not serialize properly
                if ((layer.type === 'lottie' || layer.type === 'gif') && layer.lottieItem && typeof layer.lottieItem === 'object') {
                    // Ensure lottieItem is properly formatted
                    return { ...layer, lottieItem: { ...layer.lottieItem } };
                }

                return layer;
            });

            if (sanitizedLayers.length > 0) {
                setLayers(sanitizedLayers);
                // Restore imageSrc from background layer
                const bgLayer = sanitizedLayers.find(l => l.id === 'background-layer');
                if (bgLayer && bgLayer.content) {
                    setImageSrc(bgLayer.content);
                }
            }
            if (savedState.adjustments) {
                setAdjustments(prev => ({ ...prev, ...savedState.adjustments }));
            }
        }
    }, []);

    // Extract dominant colors from image when it changes
    useEffect(() => {
        if (!imageSrc) return;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const sampleSize = 50; // Sample a small version for performance
            canvas.width = sampleSize;
            canvas.height = sampleSize;
            ctx.drawImage(img, 0, 0, sampleSize, sampleSize);

            try {
                const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
                const data = imageData.data;
                const colorCounts = {};

                // Sample every 4th pixel for performance
                for (let i = 0; i < data.length; i += 16) {
                    const r = Math.round(data[i] / 32) * 32;
                    const g = Math.round(data[i + 1] / 32) * 32;
                    const b = Math.round(data[i + 2] / 32) * 32;
                    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                    colorCounts[hex] = (colorCounts[hex] || 0) + 1;
                }

                // Sort by frequency and get top 8 colors
                const sortedColors = Object.entries(colorCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 8)
                    .map(([color]) => color);

                setExtractedColors(sortedColors);
            } catch (e) {
                console.warn('Could not extract colors from image:', e);
            }
        };
        img.src = imageSrc;
    }, [imageSrc]);

    const handleMouseDown = (e, layer) => {
        if (isViewOnly) return;
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

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        if (isCropMode && cropRect && imageRef.current) {
            const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
            const scaleY = imageRef.current.naturalHeight / imageRef.current.height;
            const dx = e.movementX * scaleX;
            const dy = e.movementY * scaleY;
            if (isDraggingLayer) {
                setCropRect(prev => ({
                    ...prev,
                    x: Math.round(Math.max(0, Math.min(prev.x + dx, imageRef.current.naturalWidth - prev.width))),
                    y: Math.round(Math.max(0, Math.min(prev.y + dy, imageRef.current.naturalHeight - prev.height)))
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
                    // Constrain and Round
                    x = Math.round(Math.max(0, Math.min(x, img.naturalWidth - width)));
                    y = Math.round(Math.max(0, Math.min(y, img.naturalHeight - height)));
                    width = Math.round(Math.min(width, img.naturalWidth - x));
                    height = Math.round(Math.min(height, img.naturalHeight - y));
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

    const handleMouseUp = React.useCallback(() => {
        if (dragRef.current.isDragging || resizing || isResizingCrop) {
            saveToHistory(layers);
        }
        setIsDraggingLayer(false);
        setResizing(null);
        setIsResizingCrop(false);
        dragRef.current = { isDragging: false, layerId: null, offset: { x: 0, y: 0 } };
    }, [layers, saveToHistory, resizing, isResizingCrop]);

    // Global movement handling for maximum responsiveness
    useEffect(() => {
        const handleGlobalMouseMove = (e) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();

            if (dragRef.current.isDragging && dragRef.current.layerId) {
                const { layerId, offset } = dragRef.current;
                let newX = ((e.clientX - rect.left - offset.x) / rect.width) * 100;
                let newY = ((e.clientY - rect.top - offset.y) / rect.height) * 100;

                setLayers(prev => {
                    // Get the layer to calculate its size constraints
                    const layer = prev.find(l => l.id === layerId);
                    if (layer) {
                        // Calculate element's actual size
                        let layerWidth, layerHeight;

                        if (layer.type === 'text') {
                            // Estimate text width based on content length and fontSize
                            const textLength = (layer.content || '').length;
                            layerWidth = textLength * layer.fontSize * 0.6; // More accurate estimation
                            layerHeight = layer.fontSize * 1.2;
                        } else if (layer.type === 'form') {
                            layerWidth = layer.width || 280;
                            layerHeight = layer.height || 350;
                        } else {
                            layerWidth = layer.width || 100;
                            layerHeight = layer.height || 100;
                        }

                        const halfWidthPercent = (layerWidth / 2 / rect.width) * 100;
                        const halfHeightPercent = (layerHeight / 2 / rect.height) * 100;

                        // Constrain so element stays fully inside the image boundary
                        newX = Math.max(halfWidthPercent, Math.min(100 - halfWidthPercent, newX));
                        newY = Math.max(halfHeightPercent, Math.min(100 - halfHeightPercent, newY));
                    }

                    return prev.map(l =>
                        l.id === layerId ? { ...l, x: newX, y: newY } : l
                    );
                });
            } else if (isResizingCanvas && isResizingCanvas.handle) {
                const moveX = e.movementX / (zoom || 1);
                const moveY = e.movementY / (zoom || 1);

                setCanvasSize(prev => {
                    let newWidth = prev.width;
                    let newHeight = prev.height;
                    const { handle } = isResizingCanvas; // 'e', 's', or 'se'

                    // Calculate potential new dimensions
                    if (handle === 'e' || handle === 'se') {
                        newWidth = Math.max(200, prev.width + moveX);
                    }
                    if (handle === 's' || handle === 'se') {
                        newHeight = Math.max(200, prev.height + moveY);
                    }

                    // Calculate Scale Ratios
                    // Avoid division by zero
                    const ratioX = prev.width > 0 ? newWidth / prev.width : 1;
                    const ratioY = prev.height > 0 ? newHeight / prev.height : 1;

                    // For corner resize ('se'), we might want uniform scaling or independent.
                    // For side resize ('e' or 's'), one ratio is 1.

                    // Logic:
                    // 1. Shapes/Images: Scale width by ratioX, height by ratioY.
                    // 2. Text: Scale fontSize. Since text doesn't have independent w/h in this model (it flows),
                    //    we scale fontSize. Ideally by the average resize or dominant dimension.
                    //    If dragging 'e' (width only), text should probably not grow vertically? 
                    //    But if the USER wants "zoom in" effect, they usually drag corner.
                    //    Let's scale fontSize by the geometric average (sqrt of product) to balance it, or just max.
                    //    Actually, if resizing JUST width, mostly text shouldn't stretch typically? 
                    //    User said "bas text ke hight aor wight kam honi chay" -> implying they want it to change.
                    //    Let's use the average of valid ratios (if ratio != 1).

                    let fontScale = 1;
                    if (handle === 'se') {
                        fontScale = Math.sqrt(ratioX * ratioY);
                    } else if (handle === 'e') {
                        fontScale = ratioX;
                    } else if (handle === 's') {
                        fontScale = ratioY;
                    }

                    setLayers(layersPrev => layersPrev.map(l => {
                        // Background layer always fills the container
                        if (l.isBackground || l.id === 'background-layer') {
                            return { ...l, width: newWidth, height: newHeight };
                        }

                        // Other layers: Scale proportionally
                        let updated = { ...l };

                        // Scale Dimensions
                        if (updated.width) updated.width *= ratioX;
                        if (updated.height) updated.height *= ratioY;

                        // Scale Text
                        if (updated.fontSize) {
                            updated.fontSize *= fontScale;
                        }

                        return updated;
                    }));

                    return { width: newWidth, height: newHeight };
                });
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

                        // Calculate max allowed size based on position
                        const maxWidthFromLeft = (x / 100) * rect.width * 2;
                        const maxWidthFromRight = ((100 - x) / 100) * rect.width * 2;
                        const maxWidth = Math.min(maxWidthFromLeft, maxWidthFromRight);

                        const maxHeightFromTop = (y / 100) * rect.height * 2;
                        const maxHeightFromBottom = ((100 - y) / 100) * rect.height * 2;
                        const maxHeight = Math.min(maxHeightFromTop, maxHeightFromBottom);

                        if (ly.id === 'background-layer' || (ly.type === 'shape' && ly.shapeType === 'image')) {
                            if (handle.includes('e')) width = Math.max(20, Math.min(maxWidth, width + dx));
                            if (handle.includes('w')) width = Math.max(20, Math.min(maxWidth, width - dx));
                            if (handle.includes('s')) height = Math.max(20, Math.min(maxHeight, height + dy));
                            if (handle.includes('n')) height = Math.max(20, Math.min(maxHeight, height - dy));
                        } else if (ly.type === 'text' || (ly.type === 'shape' && ly.shapeType === 'icon')) {
                            const movement = Math.abs(dx) > Math.abs(dy) ? dx : dy;

                            // Calculate max fontSize based on position and text content length
                            const textLength = (ly.content || '').length || 1;
                            const maxFontSizeByWidth = maxWidth / (textLength * 0.6);
                            const maxFontSizeByHeight = maxHeight / 1.2;
                            const maxFontSize = Math.min(maxFontSizeByWidth, maxFontSizeByHeight);

                            if (handle.includes('e') || handle.includes('s')) {
                                if (ly.type === 'text') fontSize = Math.max(8, Math.min(maxFontSize, fontSize + movement));
                                else {
                                    const newSize = Math.max(20, Math.min(Math.min(maxWidth, maxHeight), width + movement));
                                    width = newSize;
                                    height = newSize;
                                }
                            } else {
                                if (ly.type === 'text') fontSize = Math.max(8, Math.min(maxFontSize, fontSize - movement));
                                else {
                                    const newSize = Math.max(20, Math.min(Math.min(maxWidth, maxHeight), width - movement));
                                    width = newSize;
                                    height = newSize;
                                }
                            }
                        } else {
                            if (handle.includes('e')) width = Math.max(20, Math.min(maxWidth, width + dx));
                            if (handle.includes('w')) width = Math.max(20, Math.min(maxWidth, width - dx));
                            if (handle.includes('s')) height = Math.max(20, Math.min(maxHeight, height + dy));
                            if (handle.includes('n')) height = Math.max(20, Math.min(maxHeight, height - dy));
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
    }, [isDraggingLayer, resizing, handleMouseUp]);


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
            // New properties for template fidelity
            fontStyle: template.style.italic ? 'italic' : 'normal',
            textDecoration: template.style.underline ? 'underline' : 'none',
            stroke: template.style.stroke || false,
            backgroundColor: template.style.bg || null,
            letterSpacing: template.style.spacing || 0,
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
        addLayerWithSync(newLayer);
    };

    const enterCropMode = () => {
        if (!imageRef.current) return;
        const img = imageRef.current;
        const initialCrop = {
            width: Math.round(img.naturalWidth * 0.8),
            height: Math.round(img.naturalHeight * 0.8),
            x: Math.round(img.naturalWidth * 0.1),
            y: Math.round(img.naturalHeight * 0.1)
        };
        setCropRect(initialCrop);
        setIsCropMode(true);
        setIsPanelOpen(false);
    };

    const applyCrop = () => {
        if (!cropRect || !imageRef.current) return;

        const canvas = document.createElement('canvas');
        // Round to avoid sub-pixel rendering issues
        const cropW = Math.round(cropRect.width);
        const cropH = Math.round(cropRect.height);
        const cropX = Math.round(cropRect.x);
        const cropY = Math.round(cropRect.y);

        canvas.width = cropW;
        canvas.height = cropH;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
            const newDataUrl = canvas.toDataURL();
            setImageSrc(newDataUrl);

            // Update the background layer content and PHYSICAL size
            // If we don't update width/height, it will stretch the new content to the old size
            const bgLayer = layers.find(l => l.id === 'background-layer');
            const oldW = bgLayer?.width || 1000;
            const oldH = bgLayer?.height || 1000;

            // New physical size in the editor
            const newW = cropW * (oldW / imageRef.current.naturalWidth);
            const newH = cropH * (oldH / imageRef.current.naturalHeight);

            const nextLayers = layers.map(l => {
                if (l.id === 'background-layer') {
                    return { ...l, content: newDataUrl, width: newW, height: newH };
                }

                // Reposition other layers so they stay on the same part of the image
                // Coordinates are in % of container (which is bgLayer size)
                // This is a bit complex because % is relative to the NEW size
                const xInPx = (l.x / 100) * oldW;
                const yInPx = (l.y / 100) * oldH;

                // Translate px to be relative to the cropped area
                const cropXInPx = (cropX / imageRef.current.naturalWidth) * oldW;
                const cropYInPx = (cropY / imageRef.current.naturalHeight) * oldH;

                const newXInPx = xInPx - cropXInPx;
                const newYInPx = yInPx - cropYInPx;

                return {
                    ...l,
                    x: (newXInPx / newW) * 100,
                    y: (newYInPx / newH) * 100
                };
            });

            setLayers(nextLayers);
            saveToHistory(nextLayers);

            setIsCropMode(false);
            setCropRect(null);
        };
        img.src = imageSrc;
    };

    const updateFormFieldValue = (layerId, fieldIdx, value) => {
        setLayers(prev => {
            const updatedLayers = prev.map(l => {
                if (l.id === layerId) {
                    const newValues = { ...(l.formData.values || {}) };
                    newValues[fieldIdx] = value;
                    return {
                        ...l,
                        formData: {
                            ...l.formData,
                            values: newValues
                        }
                    };
                }
                return l;
            });
            // Save the updated state immediately
            saveEditorState({ layers: updatedLayers, adjustments });
            return updatedLayers;
        });
    };

    const addShape = (type, content = null) => {
        const isIcon = type === 'icon';
        const isGradient = type === 'gradient';

        let width = 100;
        let height = 100;
        let color = '#9333ea';
        if (type.startsWith('line') || type === 'arrow') {
            width = 200;
            height = 20; // Hit area height
            color = darkMode ? '#ffffff' : '#000000';
        } else if (isIcon) {
            width = 80;
            height = 80;
            color = '#3b82f6';
        } else if (isGradient) {
            color = content;
        }
        const newLayer = {
            id: Date.now(),
            type: 'shape',
            shapeType: type,
            // Store content as string for icons (name of icon)
            content: content || (isIcon ? 'Star' : null),
            color,
            width,
            height,
            x: 50,
            y: 50,
            rotation: 0,
            isSelected: true,
            isLocked: false
        };
        addLayerWithSync(newLayer);
        setIsPanelOpen(false); // Close panel on mobile after adding
    };



    const addImageLayer = (urlOrItem) => {
        const url = typeof urlOrItem === 'string' ? urlOrItem : urlOrItem?.thumb;
        if (!url) return;

        const newLayer = {
            id: Date.now(),
            type: 'shape',
            shapeType: 'image',
            content: url,
            color: 'transparent',
            width: 400,
            height: 600,
            x: 50,
            y: 50,
            isSelected: true
        };
        addLayerWithSync(newLayer);
    };

    const addFrame = (frameItem) => {
        if (!frameItem) return;

        // Support both direct URL string and frame item object
        const isString = typeof frameItem === 'string';
        const item = isString ? { thumb: frameItem, shapeType: 'basic' } : frameItem;

        let initialWidth = 300;
        let initialHeight = 300;
        if (item.aspectRatio) {
            if (item.aspectRatio > 1) { // Wider than tall
                initialHeight = 300 / item.aspectRatio;
            } else { // Taller than wide or square
                initialWidth = 300 * item.aspectRatio;
            }
        }

        const newLayer = {
            id: Date.now(),
            type: 'frame',
            frameType: item.shapeType || item.frameStyle || 'basic', // basic, complex
            frameProps: item,
            content: null, // User image will go here
            placeholder: (item.frameStyle === 'Paper' || item.frameStyle === 'paper') ? null : item.thumb,
            width: initialWidth,
            height: initialHeight,
            x: 50,
            y: 50,
            isSelected: true,
            backgroundColor: 'transparent', // Default background fill
            borderColor: '#ffffff', // Default white border
            borderWidth: 10 // Default border width in pixels
        };
        const nextLayers = [...layers.map(l => ({ ...l, isSelected: false })), newLayer];
        setLayers(nextLayers);
        saveToHistory(nextLayers);
        setActiveLayerId(newLayer.id);
    };

    const addGrid = (template) => {
        const bgLayer = layers.find(l => l.id === 'background-layer');
        // Default to a reasonable size if no background layer (though there should be one)
        const baseW = bgLayer ? bgLayer.width : canvasSize.width;
        const baseH = bgLayer ? bgLayer.height : canvasSize.height;

        const timestamp = Date.now();
        const newGridLayers = template.slots.map((slot, i) => {
            // Convert slot percentages to actual px width/height and center position percentages
            const wPx = baseW * (slot.w / 100);
            const hPx = baseH * (slot.h / 100);

            const centerX = slot.x + (slot.w / 2);
            const centerY = slot.y + (slot.h / 2);

            return {
                id: timestamp + i,
                type: 'frame',
                frameType: 'basic',
                frameProps: {
                    title: `Grid ${i + 1}`,
                    style: { backgroundColor: 'transparent', border: '5px solid #ffffff' }
                },
                content: null,
                width: wPx,
                height: hPx,
                x: centerX,
                y: centerY,
                backgroundColor: 'transparent', // Default fill
                borderColor: '#ffffff', // Default border
                borderWidth: 5,
                isSelected: i === 0 // Select the first one
            };
        });

        const nextLayers = [...layers.map(l => ({ ...l, isSelected: false })), ...newGridLayers];
        setLayers(nextLayers);
        saveToHistory(nextLayers);
        if (newGridLayers.length > 0) {
            setActiveLayerId(newGridLayers[0].id);
        }
    };

    const applyPresetFilter = (f) => {
        setAdjustments({
            brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: 0, sepia: 0, hue: 0, invert: 0,
            ...f.filter
        });
    };

    const addLottieLayer = (itemOrUrl) => {
        if (!itemOrUrl) return;

        const isString = typeof itemOrUrl === 'string';
        const item = isString ? { url: itemOrUrl, title: 'Animated Element', type: 'lottie' } : itemOrUrl;

        const isGif = item.type === 'gif';
        const newLayer = {
            id: Date.now(),
            type: isGif ? 'gif' : 'lottie',
            content: item.url,
            lottieItem: { ...item }, // Create a deep copy to ensure it's properly serializable
            name: item.title,
            width: 200,
            height: 200,
            x: 50,
            y: 50,
            isSelected: true,
            speed: 1
        };

        // Update recently used animations
        const updatedRecent = [item, ...recentlyUsedAnimations.filter((_, i) => i < 9)]; // Keep only top 10
        setRecentlyUsedAnimations(updatedRecent);
        saveRecentlyUsedAnimations(updatedRecent);

        const nextLayers = [...layers.map(l => ({ ...l, isSelected: false })), newLayer];
        setLayers(nextLayers);
        saveToHistory(nextLayers);
        setActiveLayerId(newLayer.id);
    };

    const renderPlaceholder = (ctx, w, h, text, scaleX) => {
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.strokeStyle = '#9333ea';
        ctx.lineWidth = 2 * scaleX;
        if (ctx.roundRect) ctx.roundRect(-w / 2, -h / 2, w, h, 10);
        else ctx.rect(-w / 2, -h / 2, w, h);
        ctx.stroke();

        ctx.font = `${Math.min(w, h) * 0.4}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#9333ea';
        ctx.fillText(text, 0, 0);
    };

    const lottieCache = useRef({});

    const renderFinalCanvas = async (customLayers = null, customAdjustments = null, options = {}) => {
        const { scale = 1, transparent = false, frameTime = 0, useOriginalResolution = false } = options;
        const canvas = document.createElement('canvas');
        const targetLayers = customLayers || layers;
        const targetAdjustments = customAdjustments || adjustments;

        // Use canvasSize as the absolute base for export - FIXED TO USE ORIGINAL SIZE
        const baseWidth = canvasSize.width;
        const baseHeight = canvasSize.height;

        // Determine effective scale
        let finalScale = scale;

        if (useOriginalResolution) {
            const bgLayer = targetLayers.find(l => l.id === 'background-layer' || (l.isBackground && l.shapeType === 'image'));
            if (bgLayer && bgLayer.content) {
                try {
                    const imgObj = new Image();
                    imgObj.crossOrigin = "anonymous";
                    imgObj.src = bgLayer.content;
                    await new Promise((resolve) => {
                        imgObj.onload = resolve;
                        imgObj.onerror = resolve;
                    });

                    if (imgObj.naturalWidth > 0) {
                        finalScale = imgObj.naturalWidth / baseWidth;
                    }
                } catch (e) {
                    console.warn("Failed to load bg for resolution sync", e);
                }
            }
        }

        canvas.width = baseWidth * finalScale;
        canvas.height = baseHeight * finalScale;
        const ctx = canvas.getContext('2d');

        if (!transparent) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Clip everything to the canvas bounds
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, canvas.width, canvas.height);
        ctx.clip();

        for (const layer of targetLayers) {
            if (layer.isHidden) continue;

            // Coordinates are percentage-based (0-100) relative to canvasSize
            const canvasX = (layer.x / 100) * canvas.width;
            const canvasY = (layer.y / 100) * canvas.height;

            ctx.save();
            ctx.translate(canvasX, canvasY);
            ctx.rotate(((layer.rotation || 0) * Math.PI) / 180);
            ctx.scale(layer.flipX ? -1 : 1, layer.flipY ? -1 : 1);

            // Width and Height are in editor pixels, scale them for export
            // FIX: Use the actual layer dimensions relative to the canvas size
            const w = (layer.width || 100) * finalScale;
            const h = (layer.height || 100) * finalScale;

            if (layer.id === 'background-layer' || (layer.type === 'shape' && layer.shapeType === 'image')) {
                if (layer.content && (layer.shapeType === 'image' || layer.id === 'background-layer')) {
                    const imgObj = new Image();
                    imgObj.crossOrigin = "anonymous";
                    imgObj.src = layer.content;
                    await new Promise((resolve) => {
                        imgObj.onload = resolve;
                        imgObj.onerror = resolve;
                    });

                    if (layer.id === 'background-layer') {
                        // Background layer should fill the entire canvas
                        ctx.filter = `brightness(${targetAdjustments.brightness}%) contrast(${targetAdjustments.contrast}%) saturate(${targetAdjustments.saturation}%) blur(${targetAdjustments.blur}px) grayscale(${targetAdjustments.grayscale}%) sepia(${targetAdjustments.sepia}%) hue-rotate(${targetAdjustments.hue}deg) invert(${targetAdjustments.invert}%)`;
                        ctx.drawImage(imgObj, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
                        ctx.filter = 'none';

                        if (adjustments.highlights !== 0 || adjustments.shadows !== 0) {
                            try {
                                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                                const data = imageData.data;
                                const h_adj = adjustments.highlights / 100;
                                const s_adj = adjustments.shadows / 100;
                                for (let i = 0; i < data.length; i += 4) {
                                    for (let j = 0; j < 3; j++) {
                                        let v = data[i + j] / 255;
                                        if (h_adj !== 0 && v > 0.5) v += (v - 0.5) * 2 * h_adj;
                                        if (s_adj !== 0 && v < 0.5) v += (0.5 - v) * 2 * s_adj;
                                        data[i + j] = Math.max(0, Math.min(255, v * 255));
                                    }
                                }
                                ctx.putImageData(imageData, 0, 0);
                            } catch (e) {
                                console.error("Filter apply failed:", e);
                            }
                        }
                    } else {
                        ctx.drawImage(imgObj, -w / 2, -h / 2, w, h);
                    }
                } else if (layer.color) {
                    ctx.fillStyle = layer.color;
                    ctx.fillRect(-w / 2, -h / 2, w, h);
                }
            }
            else if (layer.type === 'lottie' || layer.type === 'gif') {
                const targetUrl = layer.content;
                const fallbackUrl = layer.lottieItem?.fallback;
                const isActuallyGif = (layer.type === 'gif') || (targetUrl && (targetUrl.toLowerCase().endsWith('.gif')));
                const isLottieJson = (layer.type === 'lottie') || (targetUrl && (targetUrl.toLowerCase().endsWith('.json') || targetUrl.includes('lottie.host') || targetUrl.includes('gstatic.com/s/e/notoemoji') || targetUrl.includes('flaticon.com')));
                const isSvgFallback = fallbackUrl && typeof fallbackUrl === 'string' && fallbackUrl.startsWith('http') && fallbackUrl.endsWith('.svg');

                if ((isActuallyGif || isSvgFallback) && !isLottieJson) {
                    const imgToDraw = isSvgFallback ? fallbackUrl : targetUrl;
                    const imgObj = new Image();
                    imgObj.crossOrigin = "anonymous";
                    imgObj.referrerPolicy = "no-referrer";
                    imgObj.src = imgToDraw;

                    await new Promise((resolve) => {
                        imgObj.onload = resolve;
                        imgObj.onerror = resolve;
                        setTimeout(resolve, 3000);
                    });

                    if (imgObj.complete && imgObj.naturalWidth > 0) {
                        ctx.drawImage(imgObj, -w / 2, -h / 2, w, h);
                    } else {
                        renderPlaceholder(ctx, w, h, isActuallyGif ? 'GIF' : 'ICON', scale);
                    }
                } else if (targetUrl) {
                    try {
                        let animData = lottieCache.current[targetUrl];
                        if (!animData) {
                            animData = await fetch(targetUrl).then(res => res.ok ? res.json() : null).catch(() => null);
                            if (animData) lottieCache.current[targetUrl] = animData;
                        }

                        if (animData) {
                            const tempDiv = document.createElement('div');
                            tempDiv.style.width = Math.round(w) + 'px';
                            tempDiv.style.height = Math.round(h) + 'px';
                            tempDiv.style.position = 'fixed';
                            tempDiv.style.left = '-9999px';
                            tempDiv.style.top = '-9999px';
                            tempDiv.style.visibility = 'hidden';
                            document.body.appendChild(tempDiv);

                            const anim = lottie.loadAnimation({
                                container: tempDiv,
                                renderer: 'canvas',
                                loop: false,
                                autoplay: false,
                                animationData: animData,
                                rendererSettings: {
                                    preserveAspectRatio: 'xMidYMid meet',
                                    clearCanvas: true
                                }
                            });

                            await new Promise(resolve => {
                                const checkReady = () => {
                                    if (anim.isLoaded && anim.totalFrames > 0) {
                                        const fr = anim.frameRate || 30;
                                        const animDuration = anim.totalFrames / fr;
                                        const loopTime = frameTime % animDuration;
                                        const frameIndex = loopTime * fr;
                                        anim.goToAndStop(frameIndex, true);
                                        setTimeout(() => {
                                            const lottieCanvas = tempDiv.querySelector('canvas');
                                            if (lottieCanvas) ctx.drawImage(lottieCanvas, -w / 2, -h / 2, w, h);
                                            resolve();
                                        }, 400);
                                    } else {
                                        setTimeout(checkReady, 50);
                                    }
                                };
                                if (anim.isLoaded) checkReady();
                                else anim.addEventListener('DOMLoaded', checkReady);
                                setTimeout(resolve, 8000);
                            });

                            anim.destroy();
                            document.body.removeChild(tempDiv);
                        } else {
                            renderPlaceholder(ctx, w, h, 'ICON', scale);
                        }
                    } catch (err) {
                        console.error('Lottie Export Err:', err);
                        renderPlaceholder(ctx, w, h, 'ICON', scale);
                    }
                }
            } else if (layer.type === 'frame') {
                let w = (layer.width || 100) * scale;
                let h = (layer.height || 100) * scale;

                // Draw frame content if available
                if (layer.content) {
                    const imgObj = new Image();
                    imgObj.crossOrigin = "anonymous";
                    imgObj.src = layer.content;
                    await new Promise((resolve) => {
                        imgObj.onload = resolve;
                        imgObj.onerror = resolve;
                    });
                    ctx.drawImage(imgObj, -w / 2, -h / 2, w, h);
                } else if (layer.placeholder) {
                    // Draw placeholder if content is not set
                    const imgObj = new Image();
                    imgObj.crossOrigin = "anonymous";
                    imgObj.src = layer.placeholder;
                    await new Promise((resolve) => {
                        imgObj.onload = resolve;
                        imgObj.onerror = resolve;
                    });
                    ctx.globalAlpha = 0.3; // Make placeholder semi-transparent
                    ctx.drawImage(imgObj, -w / 2, -h / 2, w, h);
                    ctx.globalAlpha = 1.0;
                }

                // Draw frame border
                ctx.strokeStyle = layer.borderColor || '#ffffff';
                ctx.lineWidth = (layer.borderWidth || 10) * scale;
                ctx.strokeRect(-w / 2, -h / 2, w, h);
            } else if (layer.type === 'text') {
                // Properly handle text layers - ensure font size is proportional
                const fontSize = (layer.fontSize || 16) * finalScale;
                const fontStyle = layer.fontStyle || 'normal';

                ctx.font = `${fontStyle} ${layer.fontWeight || 'normal'} ${fontSize}px ${layer.fontFamily || 'Arial'}`;

                // Handle Letter Spacing if supported or manual fallback (using native if avail, else ignoring for now as simple fallback is complex)
                if (ctx.letterSpacing) {
                    ctx.letterSpacing = `${(layer.letterSpacing || 0) * finalScale}px`;
                }

                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                // Text layout - split only by explicit newlines, no auto-wrapping
                const lines = (layer.content || '').split('\n');

                // Calculate total height
                const lineHeight = fontSize * 1.2;
                const totalHeight = lines.length * lineHeight;

                // Draw Background if exists
                if (layer.backgroundColor) {
                    ctx.fillStyle = layer.backgroundColor;
                    // Calculate loose bounds
                    let maxLineW = 0;
                    lines.forEach(l => {
                        const m = ctx.measureText(l);
                        if (m.width > maxLineW) maxLineW = m.width;
                    });
                    const pad = 10 * finalScale;
                    ctx.fillRect(-maxLineW / 2 - pad, -totalHeight / 2 - pad, maxLineW + pad * 2, totalHeight + pad * 2);
                }

                lines.forEach((line, index) => {
                    const y = (index - (lines.length - 1) / 2) * lineHeight;

                    // Stroke
                    if (layer.stroke) {
                        ctx.lineWidth = 2 * finalScale;
                        ctx.strokeStyle = '#000000'; // Default stroke color
                        ctx.strokeText(line, 0, y);
                    }

                    // Fill
                    if (layer.color !== 'none') {
                        ctx.fillStyle = layer.color || (darkMode ? '#ffffff' : '#000000');
                        ctx.fillText(line, 0, y);
                    }
                });

                // Reset context properties to avoid bleeding
                if (ctx.letterSpacing) ctx.letterSpacing = '0px';
            } else if (layer.type === 'shape') {
                // Handle different shape types
                if (layer.shapeType === 'icon') {
                    // Draw icon using lucide-react icons - scale appropriately
                    try {
                        // We can't draw React components to canvas directly
                        // Instead, draw a proper visualization of the icon
                        ctx.fillStyle = layer.color || '#3b82f6';
                        ctx.beginPath();
                        ctx.arc(0, 0, Math.min(w, h) / 2 * 0.8, 0, 2 * Math.PI);
                        ctx.fill();

                        // Draw a recognizable symbol inside the icon
                        ctx.fillStyle = '#ffffff';
                        ctx.font = `${Math.min(w, h) * 0.4}px Arial`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        // Use first letter of icon name as a fallback
                        const iconSymbol = layer.content ? layer.content.charAt(0).toUpperCase() : '?';
                        ctx.fillText(iconSymbol, 0, 0);
                    } catch (e) {
                        console.warn('Could not render icon:', layer.content);
                        // Draw a fallback circle
                        ctx.fillStyle = layer.color || '#3b82f6';
                        ctx.beginPath();
                        ctx.arc(0, 0, Math.min(w, h) / 2 * 0.8, 0, 2 * Math.PI);
                        ctx.fill();
                    }
                } else if (layer.shapeType === 'image') {
                    if (layer.content) {
                        const imgObj = new Image();
                        imgObj.crossOrigin = "anonymous";
                        imgObj.src = layer.content;
                        await new Promise((resolve) => {
                            imgObj.onload = resolve;
                            imgObj.onerror = resolve;
                        });
                        ctx.drawImage(imgObj, -w / 2, -h / 2, w, h);
                    }
                } else {
                    // Handle basic shapes
                    ctx.fillStyle = layer.color || '#9333ea';

                    if (layer.shapeType === 'rectangle') {
                        ctx.fillRect(-w / 2, -h / 2, w, h);
                    } else if (layer.shapeType === 'circle') {
                        ctx.beginPath();
                        ctx.arc(0, 0, Math.min(w, h) / 2, 0, 2 * Math.PI);
                        ctx.fill();
                    } else if (layer.shapeType === 'triangle') {
                        ctx.beginPath();
                        ctx.moveTo(0, -h / 2);
                        ctx.lineTo(-w / 2, h / 2);
                        ctx.lineTo(w / 2, h / 2);
                        ctx.closePath();
                        ctx.fill();
                    } else if (layer.shapeType === 'star-5') {
                        ctx.beginPath();
                        for (let i = 0; i < 5; i++) {
                            const angle = (i * 4 * Math.PI / 5) - Math.PI / 2;
                            const x = Math.cos(angle) * Math.min(w, h) / 2;
                            const y = Math.sin(angle) * Math.min(w, h) / 2;
                            if (i === 0) ctx.moveTo(x, y);
                            else ctx.lineTo(x, y);

                            const innerAngle = ((i + 0.5) * 4 * Math.PI / 5) - Math.PI / 2;
                            const innerX = Math.cos(innerAngle) * Math.min(w, h) / 4;
                            const innerY = Math.sin(innerAngle) * Math.min(w, h) / 4;
                            ctx.lineTo(innerX, innerY);
                        }
                        ctx.closePath();
                        ctx.fill();
                    } else {
                        // Default to rectangle
                        ctx.fillRect(-w / 2, -h / 2, w, h);
                    }
                }
            }
            ctx.restore();
        }

        // Restore the main clipping context
        ctx.restore();

        return canvas;
    };

    const handleClose = async () => {
        // If viewing only, just close
        if (isViewOnly) {
            onCancel();
            return;
        }

        // setIsSaving(true);
        try {
            // Generate thumbnail
            // Calculate scale to target approx 300px width
            const targetWidth = 300;
            const scale = targetWidth / canvasSize.width;

            const thumbnailCanvas = await renderFinalCanvas(null, null, { scale: scale, transparent: false });
            // Use JPEG with 0.7 quality for good balance of size/quality
            const thumbnailDataUrl = thumbnailCanvas.toDataURL('image/jpeg', 0.7);

            // Save thumbnail to Firebase if we have a design ID
            // Fire-and-forget save logic
            (async () => {
                try {
                    if (designId) {
                        await FirebaseSyncService.updateDesign(designId, {
                            thumbnail: thumbnailDataUrl,
                            lastModified: Date.now()
                        });
                    } else if (file && user?.uid) {
                        await FirebaseSyncService.createDesign({
                            pages: pages,
                            activePageId: activePageId,
                            canvasSize: canvasSize,
                            adjustments: adjustments,
                            thumbnail: thumbnailDataUrl,
                            name: file.name ? file.name.replace(/\.[^/.]+$/, "") : 'Untitled Design'
                        }, user.uid);
                    }
                } catch (e) {
                    console.error('Background save failed:', e);
                }
            })();
        } catch (error) {
            console.error('Error auto-saving thumbnail:', error);
        } finally {
            // Remove the /edit/:id from URL and go back to base state
            navigate('/image-editor', { replace: true });
            onCancel(); // Close the editor immediately
        }
    };

    const handleApply = async () => {
        setIsSaving(true);
        // Small delay to ensure UI updates before heavy canvas work
        await new Promise(r => setTimeout(r, 500));

        try {
            // Ensure all layers are properly synchronized before saving
            const currentState = { layers, adjustments };
            saveEditorState(currentState);

            const canvas = await renderFinalCanvas();
            if (canvas) {
                canvas.toBlob((blob) => {
                    setIsSaving(false);
                    if (blob) {
                        // Navigate directly to converter - no loading indicator
                        onApply(blob);
                    } else {
                        console.error('Failed to create blob');
                        onApply(null);
                    }
                }, 'image/png');
            } else {
                setIsSaving(false);
                console.error('Failed to render canvas');
                onCancel();
            }
        } catch (err) {
            console.error('Apply error:', err);
            setIsSaving(false);
            alert("Could not process image. A security restriction on an animation icon might be blocking the save. Try removing recently added icons.");
        }
    };

    const handleDownload = async () => {
        setIsSaving(true);
        // Ensure the current state is saved before downloading
        saveEditorState({ layers, adjustments });
        await new Promise(r => setTimeout(r, 500));

        try {
            const canvas = await renderFinalCanvas();
            if (canvas) {
                const link = document.createElement('a');
                link.download = `edited_${file.name.replace(/\.[^/.]+$/, "")}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
                setIsSaving(false);
            } else {
                setIsSaving(false);
            }
        } catch (err) {
            console.error('Download error:', err);
            setIsSaving(false);
            alert("Download failed. A security restriction on an animation icon is blocking the export. Please try removing the icon and try again.");
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

    const applyMockup = (mockup) => {
        const img = new Image();
        img.onload = () => {
            // 1. Set background
            setImageSrc(mockup.image);

            // 2. Create background layer
            const bgLayer = {
                id: 'background-layer',
                type: 'shape',
                shapeType: 'image',
                content: mockup.image,
                color: 'transparent',
                width: 1000,
                height: 1000 * (img.height / img.width),
                x: 50,
                y: 50,
                isSelected: false,
                isLocked: true, // Lock background
                isBackground: true
            };

            // 3. Create frame layers
            const frameLayers = mockup.frames.map((frame, index) => ({
                id: `mockup-frame-${Date.now()}-${index}`,
                type: 'frame',
                frameType: 'basic',
                content: null,
                placeholder: null, // Transparent to show background or maybe a semi-transparent hint?
                // Actually, for mockups, usually the frame area is empty or specific. 
                // We'll use a transparent placeholder so the user can drop onto it.
                // But to make it visible we might need a border?
                // The images have frames in them, so we just need invisible "drop zones".
                // But wait, the previous frame implementation draws a shape.
                // If we want it to look like it's IN the image, we should probably just have the drop zone.
                // Let's set opacity to 0.1 or something if empty, or just rely on 'frame' logic.
                width: frame.width * 10,
                height: frame.height * 10,
                x: frame.x,
                y: frame.y,
                rotation: frame.rotation || 0,
                isSelected: false,
                isLocked: false, // Unlocked to allow user adjustment
                isPlaceholder: true, // Flag to indicate this is a drop zone
                backgroundColor: 'rgba(0, 0, 0, 0.05)', // Slight tint to make it visible
                frameProps: {
                    ...frame,
                    shapeType: 'basic',
                    // style property removed to prevent dashed border in export. Overlay handles UI visibility.
                }
            }));

            setLayers([bgLayer, ...frameLayers]);
            saveToHistory([bgLayer, ...frameLayers]);
            setActiveLayerId(null);
        };
        img.src = mockup.image;
    };

    const renderPresentationHeader = () => (
        <header className="h-16 flex-shrink-0 flex items-center justify-between px-6 bg-gray-900 border-b border-white/5 z-[100]">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg group cursor-pointer hover:scale-110 transition-all duration-300">
                    <Sparkles className="w-6 h-6 text-white fill-white/20" />
                </div>
                <div className="flex flex-col">
                    <span className="font-black text-white text-lg tracking-tight leading-tight">Pro Image <span className="text-purple-400">Toolkit</span></span>
                    <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Presentation Mode</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* <button
                    onClick={() => {
                        const editUrl = window.location.href.replace('/view/', '/edit/');
                        navigator.clipboard.writeText(editUrl);
                        alert("Design link copied to clipboard!");
                    }}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl border border-white/20 hover:bg-white/10 transition-all font-bold text-sm text-white"
                >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                </button> */}
                {/* <button
                    onClick={onCancel}
                    className="p-2.5 hover:bg-white/10 rounded-full transition-all text-gray-400 hover:text-white"
                >
                    <X className="w-6 h-6" />
                </button> */}
            </div>
        </header>
    );

    const renderPresentationFooter = () => {
        const currentPage = pages.findIndex(p => p.id === activePageId) + 1;
        const totalPages = pages.length;

        const goToNextPage = () => {
            const currentIndex = pages.findIndex(p => p.id === activePageId);
            if (currentIndex < pages.length - 1) {
                switchPage(pages[currentIndex + 1].id);
            }
        };

        const goToPrevPage = () => {
            const currentIndex = pages.findIndex(p => p.id === activePageId);
            if (currentIndex > 0) {
                switchPage(pages[currentIndex - 1].id);
            }
        };

        return (
            <div className="h-20 flex-shrink-0 flex items-center justify-between px-8 bg-gray-900/80 backdrop-blur-xl border-t border-white/5 z-[100]">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-2xl border border-white/10 shadow-inner">
                        <button
                            onClick={goToPrevPage}
                            disabled={currentPage === 1}
                            className={`p-2.5 rounded-xl transition-all ${currentPage === 1 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/10 text-white active:scale-95'}`}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="font-black text-sm px-4 min-w-[70px] text-center text-white/90">
                            {currentPage} / {totalPages}
                        </div>
                        <button
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                            className={`p-2.5 rounded-xl transition-all ${currentPage === totalPages ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/10 text-white active:scale-95'}`}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4 bg-white/5 px-6 py-2.5 rounded-2xl border border-white/10 min-w-[240px] shadow-inner">
                        <Search className="w-4 h-4 text-gray-500" />
                        <input
                            type="range"
                            min="0.1"
                            max="3"
                            step="0.1"
                            value={zoom}
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500"
                        />
                        <span className="text-xs font-black text-white/80 w-12 text-right">{Math.round(zoom * 100)}%</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="p-3.5 hover:bg-white/10 rounded-2xl transition-all text-gray-400 hover:text-white active:scale-95">
                            <MoreHorizontal className="w-6 h-6" />
                        </button>
                        <button
                            onClick={() => {
                                if (!document.fullscreenElement) {
                                    document.documentElement.requestFullscreen();
                                } else {
                                    document.exitFullscreen();
                                }
                            }}
                            className="p-3.5 hover:bg-white/10 rounded-2xl transition-all text-gray-400 hover:text-white active:scale-95"
                        >
                            <Maximize2 className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        );
    };


    if (!hasPermission) {
        return (
            <AccessDenied
                user={user}
                onRequestAccess={() => alert("Access request sent to owner")}
                onSwitchAccount={() => {
                    // This is a placeholder, usually would trigger logout/login
                    window.location.href = '/';
                }}
            />
        );
    }

    return (
        <div className={`fixed inset-0 z-[100] flex flex-col h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-all duration-500 overflow-hidden text-sm`}>
            {/* TOP NAVIGATION BAR */}
            {isViewOnly ? renderPresentationHeader() : (
                <header className={`h-14 flex-shrink-0 flex items-center justify-between px-4 border-b ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} z-[60]`}>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleClose}
                            className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-purple-600'}`}
                            title="Close Editor"
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
                        {!isViewOnly && (
                            <>
                                <button
                                    onClick={handleDownload}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-purple-50 text-purple-600 hover:bg-purple-100'}`}
                                >
                                    <Download className="w-4 h-4" />
                                    <span className="hidden xs:inline">Download Design</span>
                                </button>
                                <button
                                    onClick={() => setShowExportPopup(true)}
                                    className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-purple-500/20 active:scale-95 transform"
                                >
                                    <Check className="w-4 h-4" />
                                    <span>Save Changes</span>
                                </button>
                            </>
                        )}
                        {isViewOnly && (
                            <div className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-[10px] font-bold border border-amber-500/20">
                                VIEW ONLY MODE
                            </div>
                        )}
                    </div>
                </header>
            )}

            {/* Export Manager Popup */}
            <ExportManager
                isOpen={showExportPopup}
                onClose={() => setShowExportPopup(false)}
                renderFinalCanvas={renderFinalCanvas}
                generateSVG={generateSVG}
                pages={pages}
                activePageId={activePageId}
                layers={layers}
                canvasSize={canvasSize}
                darkMode={darkMode}
                adjustments={adjustments}
                designId={designId}
                onDesignIdGenerated={setDesignId}
                user={user}
            />
            <div className="flex flex-1 overflow-hidden relative">
                {/* LEFT SIDEBAR */}
                {!isViewOnly && (
                    <div className={`w-[72px] sm:w-[64px] h-full flex-shrink-0 flex flex-col items-center py-2 border-r ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} z-50`}>
                        {/* <TabButton id="design" icon={Layout} label="Design" /> */}
                        <TabButton id="elements" icon={Grid} label="Elements" />
                        <TabButton id="text" icon={Type} label="Text" />
                        <TabButton id="layers" icon={Layers} label="Layers" />
                        <TabButton id="filters" icon={Palette} label="Filters" />
                        {/* <TabButton id="adjust" icon={Sliders} label="Adjust" /> */}
                        <TabButton id="brand" icon={Box} label="Brand" premium />
                        <TabButton id="forms" icon={FileText} label="Forms" />
                        <TabButton id="projects" icon={FolderKanban} label="Projects" />
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
                )}
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
                                                        { id: 'graphics', name: 'Graphics', icon: <Sun className="w-5 h-5" />, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                                                        { id: 'Animations', name: 'Animations', icon: <Play className="w-5 h-5" />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                                                        { id: 'photos', name: 'Photos', icon: <ImageIcon className="w-5 h-5" />, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                                                        { id: 'videos', name: 'Videos', icon: <Video className="w-5 h-5" />, color: 'text-pink-500', bg: 'bg-pink-500/10' },
                                                        { id: 'audio', name: 'Audio', icon: <Music className="w-5 h-5" />, color: 'text-red-500', bg: 'bg-red-500/10' },
                                                        // { id: 'charts', name: 'Charts', icon: <PieChart className="w-5 h-5" />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                                                        // { id: 'tables', name: 'Tables', icon: <Grid className="w-5 h-5" />, color: 'text-orange-500', bg: 'bg-orange-500/10' },
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
                                            {/* <div>
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
                                            </div> */}
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

                                            {/* Dynamic Graphics Categories */}
                                            {Object.entries(graphicsElements).map(([category, items]) => (
                                                <div key={category}>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className={`text-[10px] font-black uppercase ${darkMode ? 'text-gray-500' : 'text-gray-400'} flex items-center gap-1`}>
                                                            {category} {category === 'Magic Recommendations' && <Sparkles className="w-3 h-3 text-purple-500" />}
                                                        </h4>
                                                        <button className={`text-[10px] hover:underline opacity-60 ${category === 'Magic Recommendations' ? 'text-purple-500 font-bold' : ''}`}>See all</button>
                                                    </div>
                                                    <div className="grid grid-cols-4 gap-x-2 gap-y-4">
                                                        {items.slice(0, 12).map((item, i) => (
                                                            <button
                                                                key={i}
                                                                onClick={() => item.type === 'icon' ? addShape('icon', item.icon) : addImageLayer(item.url)}
                                                                className="flex flex-col items-center gap-1.5 group w-full"
                                                                title={item.title}
                                                            >
                                                                <div className="w-full aspect-square flex items-center justify-center p-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800/80 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 group-hover:scale-105 transition-all shadow-sm border border-transparent group-hover:border-purple-200 dark:group-hover:border-purple-500/30">
                                                                    {item.type === 'icon' ? (
                                                                        (() => {
                                                                            const IconCmp = LucideIcons[item.icon] || LucideIcons.HelpCircle;
                                                                            return <IconCmp className="w-8 h-8 text-gray-600 dark:text-gray-300 group-hover:text-purple-600 transition-colors" />;
                                                                        })()
                                                                    ) : (
                                                                        <img
                                                                            src={item.thumbnail || item.url}
                                                                            alt={item.title}
                                                                            className="w-full h-full object-contain pointer-events-none drop-shadow-sm"
                                                                            referrerPolicy="no-referrer"
                                                                            crossOrigin="anonymous"
                                                                            loading="lazy"
                                                                        />
                                                                    )}
                                                                </div>
                                                                <span className={`text-[10px] font-semibold w-full text-center truncate px-0.5 leading-tight ${darkMode ? 'text-gray-400 group-hover:text-blue-300' : 'text-gray-500 group-hover:text-purple-600'} transition-colors`}>
                                                                    {item.title}
                                                                </span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
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
                                                                className="aspect-[3/2] rounded-lg bg-gray-200 dark:bg-gray-800 overflow-hidden relative group cursor-move"
                                                                draggable={true}
                                                                onDragStart={(e) => {
                                                                    e.dataTransfer.setData('text/plain', url);
                                                                    e.dataTransfer.effectAllowed = 'copy';
                                                                }}
                                                            >
                                                                <img
                                                                    src={url}
                                                                    alt={category.title}
                                                                    className="w-full h-full object-cover transition-transform group-hover:scale-110 pointer-events-none"
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
                                                { title: 'Trending', icon: <Sparkles className="w-5 h-5" /> },
                                                { title: 'Business & Office', icon: <Wallet className="w-5 h-5" /> },
                                                { title: 'Activity & Objects', icon: <Box className="w-5 h-5" /> },
                                                { title: 'Holiday & Festive', icon: <Sun className="w-5 h-5" /> }
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
                                    {elementsView === 'frames' && (
                                        <div className="animate-fadeIn space-y-6">
                                            {/* Header */}
                                            <div className="flex items-center gap-3 pb-2 border-b border-gray-100 dark:border-gray-800">
                                                <button
                                                    onClick={() => setElementsView('home')}
                                                    className={`p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
                                                >
                                                    <ArrowLeft className="w-4 h-4" />
                                                </button>
                                                <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Frames</h3>
                                            </div>
                                            {/* Subcategories */}
                                            {[
                                                { title: 'Basic shapes', icon: <SquareIcon className="w-5 h-5" /> },
                                                { title: 'Film and photo', icon: <Camera className="w-5 h-5" /> },
                                                { title: 'Devices', icon: <Smartphone className="w-5 h-5" /> },
                                                { title: 'Paper', icon: <FileText className="w-5 h-5" /> },
                                                { title: 'Flowers', icon: <Sun className="w-5 h-5" /> },
                                                { title: 'Blob', icon: <CircleIcon className="w-5 h-5" /> },
                                                { title: 'Retro', icon: <Star className="w-5 h-5" /> },
                                                { title: 'Letters', icon: <Type className="w-5 h-5" /> },
                                                { title: 'Numbers', icon: <Grid className="w-5 h-5" /> },
                                                { title: 'Trending', icon: <Sparkles className="w-5 h-5" /> }
                                            ].map((sub, index) => (
                                                <ThreeDCategory
                                                    key={index}
                                                    sub={sub}
                                                    items={framesElements[sub.title]}
                                                    onAdd={(item) => addFrame(item)}
                                                    darkMode={darkMode}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    {elementsView === 'grids' && (
                                        <div className="animate-fadeIn space-y-6">
                                            <div className="flex items-center gap-3 pb-2 border-b border-gray-100 dark:border-gray-800">
                                                <button
                                                    onClick={() => setElementsView('home')}
                                                    className={`p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
                                                >
                                                    <ArrowLeft className="w-4 h-4" />
                                                </button>
                                                <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Grids</h3>
                                            </div>

                                            <div className="grid grid-cols-3 gap-3">
                                                {gridTemplates.map((template) => (
                                                    <button
                                                        key={template.id}
                                                        onClick={() => addGrid(template)}
                                                        className={`aspect-[2/3] w-full rounded-md border-2 transition-all hover:scale-105 hover:border-teal-500 relative overflow-hidden ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}
                                                        title={template.title}
                                                    >
                                                        {template.slots.map((slot, i) => (
                                                            <div
                                                                key={i}
                                                                className="absolute border border-gray-400/30 bg-gray-500/10"
                                                                style={{
                                                                    left: `${slot.x}%`,
                                                                    top: `${slot.y}%`,
                                                                    width: `${slot.w}%`,
                                                                    height: `${slot.h}%`
                                                                }}
                                                            />
                                                        ))}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {elementsView === 'mockups' && (
                                        <div className="animate-fadeIn space-y-6">
                                            <div className="flex items-center gap-3 pb-2 border-b border-gray-100 dark:border-gray-800">
                                                <button
                                                    onClick={() => setElementsView('home')}
                                                    className={`p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
                                                >
                                                    <ArrowLeft className="w-4 h-4" />
                                                </button>
                                                <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Mockups</h3>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                {mockupElements.map((mockup) => (
                                                    <button
                                                        key={mockup.id}
                                                        onClick={() => applyMockup(mockup)}
                                                        className={`aspect-square w-full rounded-xl border-2 transition-all hover:scale-105 hover:border-purple-500 relative overflow-hidden group ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}
                                                    >
                                                        <img
                                                            src={mockup.thumb}
                                                            alt={mockup.title}
                                                            className="w-full h-full object-cover pointer-events-none"
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <span className="text-white font-bold text-xs">{mockup.title}</span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {elementsView === 'Animations' && (
                                        <div className="animate-fadeIn space-y-6">
                                            <div className="flex items-center gap-3 pb-2 border-b border-gray-100 dark:border-gray-800">
                                                <button
                                                    onClick={() => setElementsView('home')}
                                                    className={`p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
                                                >
                                                    <ArrowLeft className="w-4 h-4" />
                                                </button>
                                                <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Animations</h3>
                                            </div>

                                            <div className="pb-4 space-y-6">
                                                {/* {recentlyUsedAnimations.length > 0 && (
                                                    <div className="animate-fadeIn">
                                                        <h4 className={`text-[10px] font-black uppercase mb-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Recently Used</h4>
                                                        <div className="grid grid-cols-4 gap-x-2 gap-y-4">
                                                            {recentlyUsedAnimations.map((item, i) => (
                                                                <button
                                                                    key={`recent-${i}`}
                                                                    onClick={() => addLottieLayer(item)}
                                                                    className="flex flex-col items-center gap-1.5 group w-full"
                                                                    title={item.title}
                                                                >
                                                                    <div className="w-full aspect-square flex items-center justify-center p-2 rounded-xl bg-gray-50 dark:bg-gray-800/80 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 group-hover:scale-105 transition-all shadow-sm border border-transparent group-hover:border-purple-200 dark:group-hover:border-purple-500/30 overflow-hidden">
                                                                        <Play className="w-6 h-6 text-emerald-500 pointer-events-none" />
                                                                    </div>
                                                                    <span className={`text-[10px] font-semibold w-full text-center truncate px-0.5 leading-tight ${darkMode ? 'text-gray-400 group-hover:text-blue-300' : 'text-gray-500 group-hover:text-purple-600'} transition-colors`}>
                                                                        {item.title}
                                                                    </span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )} */}
                                                {[
                                                    { title: 'Emojis', icon: <Smile className="w-5 h-5" /> },
                                                    { title: 'Arrows', icon: <ArrowRight className="w-5 h-5" /> },
                                                    { title: 'Interface', icon: <Grid className="w-5 h-5" /> },
                                                    { title: 'Nature', icon: <Sun className="w-5 h-5" /> },
                                                    { title: 'Business', icon: <FileText className="w-5 h-5" /> },
                                                    { title: 'Social', icon: <Instagram className="w-5 h-5" /> },
                                                    { title: 'Food', icon: <Heart className="w-5 h-5" /> },
                                                    { title: 'Travel', icon: <MapPin className="w-5 h-5" /> },
                                                    { title: 'Festive', icon: <Sparkles className="w-5 h-5" /> },
                                                    { title: 'Words', icon: <Type className="w-5 h-5" /> }
                                                ].map((sub, index) => (
                                                    <LottieCategory
                                                        key={index}
                                                        sub={sub}
                                                        loop={true}
                                                        autoplay={true}
                                                        items={animatedElements[sub.title]}
                                                        onAdd={addLottieLayer}
                                                        darkMode={darkMode}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Default view for other categories (Placeholder) */}
                                    {elementsView !== 'home' && elementsView !== 'shapes' && elementsView !== 'graphics' && elementsView !== 'photos' && elementsView !== '3d' && elementsView !== 'frames' && elementsView !== 'grids' && elementsView !== 'mockups' && elementsView !== 'Animations' && (
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
                                                                layer.shapeType === 'icon' ? (
                                                                    (() => {
                                                                        const IconCmp = LucideIcons[layer.content] || Smile;
                                                                        return <IconCmp className="w-5 h-5 text-blue-600" />;
                                                                    })()
                                                                ) : <div className="w-5 h-5 rounded-sm bg-blue-500/20 border-2 border-blue-500" />
                                                            )
                                                        ) : layer.type === 'lottie' ? (
                                                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                                <Play className="w-4 h-4 text-emerald-600" />
                                                            </div>
                                                        ) :
                                                            layer.type === 'form' ? <FileText className="w-5 h-5 text-orange-600" /> :
                                                                <ImageIcon className="w-5 h-5 text-gray-400" />}
                                                </div>

                                                {/* Layer Info */}
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-xs font-bold truncate ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                                        {layer.id === 'background-layer' ? 'Background Image' : (layer.name || (layer.type === 'lottie' ? 'Animation' : (layer.content?.substring(0, 20) || layer.type)))}
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
                                        )
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
                                    { label: 'Brightness', key: 'brightness', min: 0, max: 200, icon: <Sun className="w-3.5 h-3.5" /> },
                                    { label: 'Contrast', key: 'contrast', min: 0, max: 200, icon: <Sliders className="w-3.5 h-3.5" /> },
                                    { label: 'Saturation', key: 'saturation', min: 0, max: 200, icon: <Palette className="w-3.5 h-3.5" /> },
                                    { label: 'Blur', key: 'blur', min: 0, max: 20, icon: <Maximize className="w-3.5 h-3.5" /> },
                                    { label: 'Grayscale', key: 'grayscale', min: 0, max: 100, icon: <Baseline className="w-3.5 h-3.5" /> },
                                    { label: 'Sepia', key: 'sepia', min: 0, max: 100, icon: <Sun className="w-3.5 h-3.5" /> },
                                    { label: 'Hue Rotate', key: 'hue', min: 0, max: 360, icon: <RotateCw className="w-3.5 h-3.5" /> },
                                    { label: 'Invert', key: 'invert', min: 0, max: 100, icon: <Check className="w-3.5 h-3.5" /> }
                                ].map(adj => (
                                    <div key={adj.key} className="space-y-1.5">
                                        <div className="flex justify-between items-center text-[10px]">
                                            <div className="flex items-center gap-1.5 font-bold">
                                                <span className="text-purple-500">{adj.icon}</span>
                                                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{adj.label}</span>
                                            </div>
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
                                                    onClick={() => {
                                                        if (activeLayerId) {
                                                            setLayers(layers.map(l => l.id === activeLayerId ? { ...l, color } : l));
                                                            saveToHistory(layers.map(l => l.id === activeLayerId ? { ...l, color } : l));
                                                        }
                                                    }}
                                                    className={`w-full aspect-square rounded-lg border shadow-sm hover:scale-105 transition-transform ${activeLayerId && layers.find(l => l.id === activeLayerId)?.color === color ? 'ring-2 ring-purple-600 border-transparent' : 'border-gray-200'}`}
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
                                                        const newLayer = {
                                                            id: Date.now(),
                                                            type: 'form',
                                                            formData: { ...form, values: {} },
                                                            width: 280,
                                                            height: 350,
                                                            x: 50,
                                                            y: 50,
                                                            isSelected: true
                                                        };
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
                        {activeTab === 'projects' && (
                            <div className="animate-fadeIn space-y-4">
                                <h3 className={`text-lg font-black ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Your Projects</h3>

                                {/* Search Bar */}
                                <div className="relative mb-4">
                                    <div className={`absolute inset-y-0 left-3 flex items-center pointer-events-none ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        <Search className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search your projects..."
                                        value={projectSearchQuery}
                                        onChange={(e) => setProjectSearchQuery(e.target.value)}
                                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border-none shadow-sm ${darkMode ? 'bg-gray-800 text-white placeholder:text-gray-500' : 'bg-white text-gray-900 placeholder:text-gray-400 ring-1 ring-gray-200'} text-xs focus:ring-2 focus:ring-purple-500 transition-all`}
                                    />
                                </div>

                                {/* Loading State */}
                                {projectsLoading && (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-3" />
                                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading your projects...</p>
                                    </div>
                                )}

                                {/* Not Logged In State */}
                                {!user && !projectsLoading && (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className={`w-16 h-16 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} flex items-center justify-center mb-4`}>
                                            <User className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Sign in to see your projects</p>
                                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Your saved designs will appear here</p>
                                    </div>
                                )}

                                {/* Empty State */}
                                {user && !projectsLoading && userProjects.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className={`w-16 h-16 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} flex items-center justify-center mb-4`}>
                                            <FolderKanban className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>No projects yet</p>
                                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Start creating and your designs will appear here</p>
                                    </div>
                                )}

                                {/* Projects Grid */}
                                {user && !projectsLoading && userProjects.length > 0 && (
                                    <div className="grid grid-cols-2 gap-3">
                                        {userProjects
                                            .filter(project =>
                                                project.name.toLowerCase().includes(projectSearchQuery.toLowerCase())
                                            )
                                            .map(project => (
                                                <div
                                                    key={project.id}
                                                    className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02] ${project.id === designId
                                                        ? 'ring-2 ring-purple-500'
                                                        : `${darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-gray-100 hover:bg-gray-50'}`
                                                        }`}
                                                    onClick={() => handleOpenProject(project.id)}
                                                >
                                                    {/* Thumbnail */}
                                                    <div className={`aspect-[4/3] ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center overflow-hidden`}>
                                                        {project.thumbnail ? (
                                                            <img
                                                                src={project.thumbnail}
                                                                alt={project.name}
                                                                className="w-full h-full object-cover"
                                                                crossOrigin="anonymous"
                                                                referrerPolicy="no-referrer"
                                                                onError={(e) => {
                                                                    // Hide broken image and show placeholder
                                                                    e.target.style.display = 'none';
                                                                    e.target.parentElement.innerHTML = '<div class="flex items-center justify-center w-full h-full"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg></div>';
                                                                }}
                                                            />
                                                        ) : (
                                                            <ImageIcon className="w-8 h-8 text-gray-400" />
                                                        )}
                                                    </div>

                                                    {/* Info */}
                                                    <div className="p-2">
                                                        <p className={`text-xs font-bold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                            {project.name}
                                                        </p>
                                                        <p className={`text-[10px] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                                            {Math.round(project.canvasSize?.width || 1080)} x {Math.round(project.canvasSize?.height || 720)} px
                                                        </p>
                                                    </div>

                                                    {/* 3-Dot Menu Button - Shows on Hover */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setProjectMenuOpen(projectMenuOpen === project.id ? null : project.id);
                                                        }}
                                                        className={`absolute top-2 right-2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${darkMode ? 'bg-black/50 hover:bg-black/70' : 'bg-white/80 hover:bg-white'
                                                            } shadow-sm`}
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>

                                                    {/* Dropdown Menu */}
                                                    {projectMenuOpen === project.id && (
                                                        <div
                                                            className={`absolute top-10 right-2 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-xl z-50 overflow-hidden`}
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteProject(project.id);
                                                                }}
                                                                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium w-full transition-colors ${darkMode
                                                                    ? 'text-red-400 hover:bg-red-500/20'
                                                                    : 'text-red-600 hover:bg-red-50'
                                                                    }`}
                                                            >
                                                                <Trash className="w-4 h-4" />
                                                                <span>Delete</span>
                                                            </button>
                                                        </div>
                                                    )}

                                                    {/* Current Badge */}
                                                    {project.id === designId && (
                                                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-purple-600 text-white text-[9px] font-bold rounded-full">
                                                            CURRENT
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        }
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* SAVING OVERLAY */}
                {isSaving && (
                    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
                        <div className={`p-8 rounded-3xl ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} border-2 shadow-2xl flex flex-col items-center gap-4 max-w-xs w-full`}>
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-purple-500/20 rounded-full animate-ping absolute inset-0" />
                                <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin relative z-10" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Sparkles className="w-6 h-6 text-purple-600 animate-pulse" />
                                </div>
                            </div>
                            <div className="text-center">
                                <h3 className={`text-lg font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>Saving Design</h3>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Processing and capturing your masterpiece...</p>
                            </div>
                            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mt-2">
                                <div className="h-full bg-gradient-to-r from-purple-600 to-blue-600 animate-shimmer" style={{ width: '60%' }} />
                            </div>
                        </div>
                    </div>
                )}

                {/* UPLOADING OVERLAY - Made more transparent to show preview */}
                {isUploading && (
                    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-white/40 dark:bg-black/40 animate-fadeIn">
                        <div className={`p-8 rounded-3xl ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} border-2 shadow-2xl flex flex-col items-center gap-4 max-w-xs w-full backdrop-blur-md`}>
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-blue-500/20 rounded-full animate-ping absolute inset-0" />
                                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin relative z-10" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <ImageIcon className="w-6 h-6 text-blue-600 animate-pulse" />
                                </div>
                            </div>
                            <div className="text-center">
                                <h3 className={`text-lg font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>Uploading Image</h3>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Sending your image to the cloud...</p>
                            </div>
                            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mt-2">
                                <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 animate-shimmer" style={{ width: '75%' }} />
                            </div>
                        </div>
                    </div>
                )}

                {/* MAIN CANVAS AREA */}
                <div
                    className={`flex-1 relative flex flex-col ${isViewOnly ? 'bg-[#0f111a]' : (darkMode ? 'bg-[#0f111a]' : 'bg-[#f4f7fa]')} transition-all overflow-hidden`}
                    onMouseMove={isViewOnly ? undefined : handleMouseMove}
                    onMouseUp={isViewOnly ? undefined : handleMouseUp}
                    onMouseLeave={isViewOnly ? undefined : handleMouseUp}
                    onClick={() => {
                        if (isViewOnly) return;
                        setActiveLayerId(null);
                        setLayers(layers.map(l => ({ ...l, isSelected: false })));
                        setShowColorPicker(false);
                    }}
                >
                    {/* Workspace (Canvas) */}
                    <div className={`flex-1 relative overflow-hidden flex items-center justify-center ${isViewOnly ? 'p-0 bg-gray-900' : 'p-8 pb-32 bg-gray-100 dark:bg-gray-900'}`} ref={containerRef}>
                        {/* High-quality localized loading indicator for project transitions */}
                        {isSyncing && (
                            <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-md z-[100] flex flex-col items-center justify-center transition-all duration-500 animate-fadeIn">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-xl group-hover:bg-purple-500/50 transition-all duration-500 animate-pulse"></div>
                                    <div className="relative flex flex-col items-center gap-6">
                                        <div className="relative">
                                            <div className="w-20 h-20 border-4 border-purple-500/20 rounded-2xl animate-[spin_3s_linear_infinite] absolute inset-0"></div>
                                            <div className="w-20 h-20 border-4 border-purple-600 border-t-transparent rounded-2xl animate-spin relative z-10 flex items-center justify-center">
                                                <Sparkles className="w-8 h-8 text-purple-600 animate-pulse" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center gap-2">
                                            <h2 className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 animate-gradient-x">Loading Project</h2>
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 rounded-full border border-purple-500/20">
                                                <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-purple-600">Syncing with Cloud</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Canvas Area */}
                        <div
                            className="relative transition-all duration-300 ease-out"
                            style={{
                                width: `${canvasSize.width}px`,
                                height: `${canvasSize.height}px`,
                                transform: `scale(${zoom})`,
                                transformOrigin: 'center center'
                            }}
                            onMouseDown={(e) => {
                                if (isViewOnly) return;
                                // Select background layer when clicking on canvas
                                const bgLayer = layers.find(l => l.id === 'background-layer');
                                if (bgLayer) {
                                    e.stopPropagation();
                                    setActiveLayerId('background-layer');
                                    setLayers(prev => prev.map(l => ({ ...l, isSelected: l.id === 'background-layer' })));
                                }
                            }}
                        >
                            {/* Canvas Resize Handles */}
                            {!isViewOnly && (
                                <>
                                    <div
                                        onMouseDown={(e) => handleCanvasResizeMouseDown(e, 'e')}
                                        className="absolute top-1/2 -right-3 w-4 h-16 -translate-y-1/2 cursor-e-resize flex items-center justify-center hover:bg-purple-100 rounded-full group/handle"
                                    >
                                        <div className="w-1.5 h-8 bg-gray-300 rounded-full group-hover/handle:bg-purple-500 transition-colors" />
                                    </div>
                                    <div
                                        onMouseDown={(e) => handleCanvasResizeMouseDown(e, 's')}
                                        className="absolute bottom-[-12px] left-1/2 -translate-x-1/2 h-4 w-16 cursor-s-resize flex items-center justify-center hover:bg-purple-100 rounded-full group/handle"
                                    >
                                        <div className="h-1.5 w-8 bg-gray-300 rounded-full group-hover/handle:bg-purple-500 transition-colors" />
                                    </div>
                                    <div
                                        onMouseDown={(e) => handleCanvasResizeMouseDown(e, 'se')}
                                        className="absolute -bottom-3 -right-3 w-6 h-6 cursor-se-resize flex items-center justify-center bg-white rounded-full shadow-md border hover:border-purple-500 z-50"
                                    >
                                        <div className="w-2 h-2 bg-gray-400 rounded-full" />
                                    </div>
                                </>
                            )}
                            {imageSrc && (
                                <div className="relative group/canvas overflow-hidden w-full h-full">
                                    {/* Background handles its own rendering as a layer below */}
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

                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                            {/* Floating Crop Confirmation Toolbar - Moved here to avoid overflow clipping */}
                            {isCropMode && cropRect && imageRef.current && (
                                <div
                                    className="absolute flex items-center gap-3 bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[70] animate-fadeIn min-w-[320px]"
                                    style={{
                                        left: `${((cropRect.x + cropRect.width / 2) / imageRef.current.naturalWidth) * 100}%`,
                                        top: `${(cropRect.y / imageRef.current.naturalHeight) * 100}%`,
                                        transform: 'translate(-50%, -120%)'
                                    }}
                                    onMouseDown={(e) => e.stopPropagation()}
                                >
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
                            )}
                            {/* LAYERS */}
                            {layers.map(layer => (
                                <div
                                    key={layer.id}
                                    onMouseDown={(e) => handleMouseDown(e, layer)}
                                    onClick={(e) => {
                                        if (isViewOnly) return;
                                        e.stopPropagation();
                                        setActiveLayerId(layer.id);
                                        setLayers(prev => prev.map(l => ({
                                            ...l,
                                            isSelected: l.id === layer.id
                                        })));
                                    }}
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
                                    {layer.type === 'frame' ? (
                                        <div
                                            className="w-full h-full overflow-hidden pointer-events-auto relative group/frame"
                                            style={{
                                                width: `${layer.width}px`,
                                                height: `${layer.height}px`,
                                                clipPath: layer.frameProps?.clipPath,
                                                // Removed border from here to avoid clipping and permanent export
                                                ...(layer.frameProps?.style && { ...layer.frameProps.style, border: undefined }),
                                                backgroundColor: layer.backgroundColor || '#f3f4f6',
                                                // Add customizable border
                                                border: layer.borderWidth ? `${layer.borderWidth}px solid ${layer.borderColor || '#ffffff'}` : undefined
                                            }}
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                e.currentTarget.style.opacity = '0.8';
                                            }}
                                            onDragLeave={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                e.currentTarget.style.opacity = '1';
                                            }}
                                            onDrop={async (e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                e.currentTarget.style.opacity = '1';

                                                let imageUrl = null;

                                                // Handle File Drop
                                                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                                    const file = e.dataTransfer.files[0];
                                                    if (file.type.startsWith('image/')) {
                                                        imageUrl = await handleFileUpload(file);
                                                    }
                                                }
                                                // Handle Sidebar Image Drop (if data transfer has src)
                                                else {
                                                    const draggedUrl = e.dataTransfer.getData('text/plain');
                                                    if (draggedUrl && (draggedUrl.startsWith('http') || draggedUrl.startsWith('blob:'))) {
                                                        imageUrl = draggedUrl;
                                                    }
                                                }

                                                if (imageUrl) {
                                                    setLayers(prev => prev.map(l =>
                                                        l.id === layer.id ? { ...l, content: imageUrl } : l
                                                    ));
                                                }
                                            }}
                                        >
                                            {(layer.content || layer.placeholder) && (
                                                <img
                                                    src={layer.content || layer.placeholder}
                                                    alt="Frame content"
                                                    className="w-full h-full pointer-events-none"
                                                    style={{ objectFit: 'fill', width: '100%', height: '100%' }}
                                                    draggable={false}
                                                />
                                            )}

                                            {/* Film Perforations (DOM) */}
                                            {layer.frameProps?.frameStyle === 'paper' && layer.frameProps?.thumb && (
                                                <div
                                                    className="absolute inset-0 w-full h-full pointer-events-none z-20"
                                                    style={{
                                                        backgroundImage: `url(${layer.frameProps.thumb})`,
                                                        backgroundSize: '100% 100%',
                                                        backgroundPosition: 'center',
                                                        mixBlendMode: 'multiply'
                                                    }}
                                                />
                                            )}

                                            {layer.frameProps?.frameStyle === 'film' && (
                                                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                                    {layer.frameProps?.orientation === 'horizontal' ? (
                                                        <>
                                                            <div className="absolute top-0 left-0 right-0 h-[20px] flex justify-around items-center px-1">
                                                                {Array.from({ length: 8 }).map((_, i) => <div key={i} className="w-[10px] h-[10px] bg-white opacity-20 rounded-sm" />)}
                                                            </div>
                                                            <div className="absolute bottom-0 left-0 right-0 h-[20px] flex justify-around items-center px-1">
                                                                {Array.from({ length: 8 }).map((_, i) => <div key={i} className="w-[10px] h-[10px] bg-white opacity-20 rounded-sm" />)}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="absolute top-0 bottom-0 left-0 w-[20px] flex flex-col justify-around items-center py-1">
                                                                {Array.from({ length: 8 }).map((_, i) => <div key={i} className="w-[10px] h-[10px] bg-white opacity-20 rounded-sm" />)}
                                                            </div>
                                                            <div className="absolute top-0 bottom-0 right-0 w-[20px] flex flex-col justify-around items-center py-1">
                                                                {Array.from({ length: 8 }).map((_, i) => <div key={i} className="w-[10px] h-[10px] bg-white opacity-20 rounded-sm" />)}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}

                                            {/* Tape Overlay (DOM) */}
                                            {layer.frameProps?.hasTape && (
                                                <div
                                                    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 h-8 bg-[#e8e4db] opacity-80 shadow-sm pointer-events-none"
                                                    style={{ transform: `translateX(-50%) translateY(-50%) rotate(${(layer.id % 10) - 5}deg)` }}
                                                />
                                            )}

                                            {/* Browser Controls Overlay */}
                                            {layer.frameProps?.frameStyle === 'browser' && (
                                                <div className="absolute top-[-30px] left-3 flex gap-1.5 pointer-events-none">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] shadow-sm" />
                                                    <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] shadow-sm" />
                                                    <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f] shadow-sm" />
                                                </div>
                                            )}

                                            {/* Phone/Tablet Decorations */}
                                            {(layer.frameProps?.frameStyle === 'phone' || layer.frameProps?.frameStyle === 'tablet') && (
                                                <>
                                                    {layer.frameProps?.hasNotch && (
                                                        <div className="absolute top-[-1px] left-1/2 -translate-x-1/2 w-[40%] h-[25px] bg-[#1a1a1a] rounded-b-xl pointer-events-none z-10" />
                                                    )}
                                                    {layer.frameProps?.hasHolePunch && (
                                                        <div className="absolute top-[15px] left-1/2 -translate-x-1/2 w-4 h-4 bg-[#1a1a1a] rounded-full shadow-inner pointer-events-none z-10" />
                                                    )}
                                                    {layer.frameProps?.hasButtons && (
                                                        <>
                                                            <div className="absolute top-[20%] right-[-14px] w-[5px] h-[40px] bg-[#1a1a1a] rounded-r-sm pointer-events-none" />
                                                            <div className="absolute top-[18%] left-[-14px] w-[5px] h-[30px] bg-[#1a1a1a] rounded-l-sm pointer-events-none" />
                                                            <div className="absolute top-[28%] left-[-14px] w-[5px] h-[30px] bg-[#1a1a1a] rounded-l-sm pointer-events-none" />
                                                        </>
                                                    )}
                                                </>
                                            )}

                                            {/* Watch Decorations */}
                                            {layer.frameProps?.frameStyle === 'watch' && layer.frameProps?.hasCrown && (
                                                <>
                                                    <div className="absolute top-[30%] right-[-15px] w-[10px] h-[25px] bg-[#222] rounded-r-md border border-[#333] pointer-events-none z-10" />
                                                    <div className="absolute top-[55%] right-[-13px] w-[5px] h-[30px] bg-[#222] rounded-r-sm pointer-events-none" />
                                                </>
                                            )}

                                            {/* Monitor Stand Overlay */}
                                            {(layer.frameProps?.frameStyle === 'monitor' || layer.frameProps?.frameStyle === 'laptop') && (
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-1/3 h-10 bg-gray-400 dark:bg-gray-600 pointer-events-none"
                                                    style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)', marginTop: layer.frameProps?.frameStyle === 'laptop' ? '-14px' : '-16px', zIndex: -1 }} />
                                            )}
                                            {layer.frameProps?.frameStyle === 'laptop' && (
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-[120%] h-4 bg-[#222] pointer-events-none -mt-[6px] rounded-sm" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 95% 100%, 5% 100%)' }}>
                                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[20%] h-1.5 bg-[#111] rounded-b-sm" />
                                                </div>
                                            )}

                                            {!layer.content && (
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <span className="bg-black/50 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm">
                                                        Drop image here
                                                    </span>
                                                </div>
                                            )}

                                            {/* Alignment Overlay: Visible ONLY ONLY when NOT saving */}
                                            {layer.frameProps?.shapeType === 'basic' && layer.isPlaceholder && !isSaving && (
                                                <div
                                                    className="absolute inset-0 pointer-events-none z-50 border-4 border-cyan-400 border-dashed opacity-80"
                                                    style={{ width: '100%', height: '100%' }}
                                                />
                                            )}
                                        </div>
                                    ) : layer.type === 'text' ? (
                                        <div
                                            contentEditable={editingLayerId === layer.id}
                                            suppressContentEditableWarning
                                            onBlur={(e) => {
                                                setEditingLayerId(null);
                                                setLayers(layers.map(l => l.id === layer.id ? { ...l, content: e.target.innerText } : l));
                                            }}
                                            className={`px-1.5 py-0.5 outline-none ${editingLayerId === layer.id ? 'cursor-text' : 'cursor-move'} select-none`}
                                            style={{
                                                fontSize: `${layer.fontSize}px`,
                                                fontFamily: layer.fontFamily,
                                                fontWeight: layer.fontWeight,
                                                fontStyle: layer.fontStyle || 'normal',
                                                letterSpacing: `${layer.letterSpacing || 0}px`,
                                                backgroundColor: layer.backgroundColor || 'transparent',
                                                padding: layer.backgroundColor ? '4px 8px' : '0',
                                                borderRadius: layer.backgroundColor ? '4px' : '0',
                                                WebkitTextStroke: layer.stroke ? '1px black' : 'unset',
                                                color: layer.color === 'none' ? 'transparent' : layer.color,
                                                whiteSpace: 'nowrap',
                                                textShadow: darkMode ? '0 1px 2px rgba(0,0,0,0.6)' : 'none'
                                            }}
                                        >
                                            {layer.content}
                                        </div>
                                    ) : layer.type === 'form' ? (
                                        <div
                                            className="rounded-lg shadow-lg overflow-hidden flex flex-col"
                                            style={{
                                                width: `${layer.width}px`,
                                                height: `${layer.height}px`,
                                                background: layer.formData?.bg || '#fff',
                                                border: `1px solid ${layer.formData?.borderColor || '#e5e7eb'}`,
                                                pointerEvents: 'auto'
                                            }}

                                        >
                                            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
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
                                                                <input
                                                                    type="text"
                                                                    placeholder={field.label}
                                                                    value={layer.formData.values?.[fIdx] || ''}
                                                                    onChange={(e) => updateFormFieldValue(layer.id, fIdx, e.target.value)}
                                                                    onMouseDown={(e) => e.stopPropagation()}
                                                                    className="w-full h-10 rounded-md border bg-white/50 px-3 flex items-center text-sm outline-none focus:ring-2 focus:ring-purple-500/50"
                                                                    style={{ borderColor: layer.formData?.borderColor || '#e5e7eb', color: layer.formData?.textColor || '#1f2937' }}
                                                                />
                                                            )}
                                                            {field.type === 'textarea' && (
                                                                <textarea
                                                                    placeholder={field.label}
                                                                    value={layer.formData.values?.[fIdx] || ''}
                                                                    onChange={(e) => updateFormFieldValue(layer.id, fIdx, e.target.value)}
                                                                    onMouseDown={(e) => e.stopPropagation()}
                                                                    className="w-full h-20 rounded-md border bg-white/50 px-3 pt-2 text-sm outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                                                                    style={{ borderColor: layer.formData?.borderColor || '#e5e7eb', color: layer.formData?.textColor || '#1f2937' }}
                                                                />
                                                            )}
                                                            {field.type === 'radio' && (
                                                                <div className="flex flex-col gap-2">
                                                                    {field.options?.map((opt, oIdx) => (
                                                                        <div
                                                                            key={oIdx}
                                                                            className="flex items-center gap-2 text-sm cursor-pointer"
                                                                            style={{ color: layer.formData?.textColor || '#374151' }} onMouseDown={(e) => e.stopPropagation()} onClick={() => updateFormFieldValue(layer.id, fIdx, opt)}
                                                                        >
                                                                            <div className="w-4 h-4 rounded-full border bg-white/50 flex items-center justify-center" style={{ borderColor: layer.formData?.borderColor || '#d1d5db' }}>
                                                                                {layer.formData.values?.[fIdx] === opt && <div className="w-2 h-2 rounded-full bg-purple-600" />}
                                                                            </div>
                                                                            {opt}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            {field.type === 'checkbox' && (
                                                                <div className="flex flex-col gap-2">
                                                                    {field.options?.map((opt, oIdx) => {
                                                                        const currentVal = layer.formData.values?.[fIdx] || [];
                                                                        const isChecked = currentVal.includes(opt);
                                                                        return (
                                                                            <div
                                                                                key={oIdx}
                                                                                className="flex items-center gap-2 text-sm cursor-pointer"
                                                                                style={{ color: layer.formData?.textColor || '#374151' }} onMouseDown={(e) => e.stopPropagation()} onClick={() => {
                                                                                    const newVal = isChecked ? currentVal.filter(v => v !== opt) : [...currentVal, opt];
                                                                                    updateFormFieldValue(layer.id, fIdx, newVal);
                                                                                }}
                                                                            >
                                                                                <div className="w-4 h-4 rounded-sm border bg-white/50 flex items-center justify-center" style={{ borderColor: layer.formData?.borderColor || '#d1d5db' }}>
                                                                                    {isChecked && <Check className="w-3 h-3 text-purple-600" />}
                                                                                </div>
                                                                                {opt}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                            {field.type === 'rating' && (
                                                                <div className="flex gap-1.5" onMouseDown={(e) => e.stopPropagation()}>
                                                                    {[...Array(field.max || 5)].map((_, sIdx) => (
                                                                        <Star
                                                                            key={sIdx}
                                                                            className={`w-6 h-6 cursor-pointer ${(layer.formData.values?.[fIdx] || 0) > sIdx ? 'fill-current' : ''}`}
                                                                            style={{ color: (layer.formData.values?.[fIdx] || 0) > sIdx ? (layer.formData?.accentColor || '#fbbf24') : '#d1d5db' }}
                                                                            onClick={() => updateFormFieldValue(layer.id, fIdx, sIdx + 1)}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                                {layer.formData?.buttonText && (
                                                    <div
                                                        className={`mt-6 py-3 px-6 rounded-lg text-sm font-black text-center shadow-lg transition-all ${layer.formData.values?.isSubmitted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'}`} onMouseDown={(e) => e.stopPropagation()} style={{
                                                            backgroundColor: layer.formData?.buttonStyle?.bg || '#1f2937',
                                                            color: layer.formData?.buttonStyle?.color || '#ffffff'
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (layer.formData.values?.isSubmitted) return;
                                                            updateFormFieldValue(layer.id, 'isSubmitted', true);
                                                        }}
                                                    >
                                                        {layer.formData.values?.isSubmitted ? 'Submitted' : layer.formData.buttonText}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (layer.type === 'lottie' || layer.type === 'gif') ? (
                                        <div
                                            className="pointer-events-none overflow-hidden"
                                            style={{
                                                width: `${layer.width}px`,
                                                height: `${layer.height}px`,
                                            }}
                                        >
                                            <LottiePreview item={layer.lottieItem} url={layer.content} />
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

                                                const isTextableShape = ['square', 'square-rounded', 'circle', 'triangle', 'pentagon', 'hexagon', 'octagon', 'parallelogram', 'star-5'].includes(layer.shapeType);

                                                if (layer.shapeType === 'icon') {
                                                    const IconCmp = LucideIcons[layer.content] || LucideIcons.HelpCircle;
                                                    return (
                                                        <div style={{ width: `${Math.min(layer.width, layer.height) * 0.6}px`, height: `${Math.min(layer.width, layer.height) * 0.6}px`, color: layer.color }}>
                                                            <IconCmp className="w-full h-full" stroke={layer.color} />
                                                        </div>
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
                                                            ref={layer.id === 'background-layer' ? imageRef : null}
                                                            src={layer.content}
                                                            alt=""
                                                            className="w-full h-full pointer-events-none"
                                                            draggable={false}
                                                            referrerPolicy="no-referrer"
                                                            crossOrigin="anonymous"
                                                            style={{
                                                                objectFit: 'contain',
                                                                ...(layer.id === 'background-layer' ? {
                                                                    filter: `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%) blur(${adjustments.blur}px) grayscale(${adjustments.grayscale}%) sepia(${adjustments.sepia}%) hue-rotate(${adjustments.hue}deg) invert(${adjustments.invert}%)`
                                                                } : {})
                                                            }}
                                                        />
                                                    );
                                                }
                                                return (
                                                    <div style={style} className="relative flex items-center justify-center overflow-hidden">
                                                        {isTextableShape && (
                                                            <div
                                                                contentEditable={layer.isSelected}
                                                                suppressContentEditableWarning
                                                                onBlur={(e) => {
                                                                    setLayers(layers.map(l => l.id === layer.id ? { ...l, content: e.target.innerText } : l));
                                                                    saveToHistory(layers.map(l => l.id === layer.id ? { ...l, content: e.target.innerText } : l));
                                                                }}
                                                                onMouseDown={(e) => e.stopPropagation()}
                                                                className={`w-full max-h-full p-2 outline-none text-center break-words overflow-hidden ${layer.isSelected ? 'cursor-text' : 'cursor-move'}`}
                                                                style={{
                                                                    color: darkMode ? '#ffffff' : '#000000',
                                                                    fontSize: `${Math.min(layer.width, layer.height) * 0.15}px`,
                                                                    fontWeight: 'bold',
                                                                    lineHeight: '1.2',
                                                                    zIndex: 10,
                                                                    transform: layer.shapeType === 'parallelogram' ? 'skewX(20deg)' : 'none'
                                                                }}
                                                            >
                                                                {layer.content || ''}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
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

                                        </>
                                    )}
                                </div>
                            ))}

                        </div>
                    </div>
                </div >

                {/* Floating Bottom Page Controls (Center) */}
                {!isViewOnly && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-[80vw] flex items-end justify-center">
                        <div className="flex items-center gap-3 overflow-x-auto p-2 scrollbar-hide bg-transparent rounded-xl">
                            {pages.map((page, index) => (
                                <div key={page.id} className="relative group flex-shrink-0">
                                    <button
                                        onClick={() => switchPage(page.id)}
                                        className="flex flex-col items-center gap-1 group transition-all"
                                    >
                                        <div className={`w-20 h-12 rounded-lg border-2 overflow-hidden relative bg-white transition-all ${activePageId === page.id ? 'border-purple-600 ring-2 ring-purple-600/20 shadow-lg scale-105' : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'}`}>
                                            {/* Content Preview */}
                                            <div className="absolute inset-0 flex items-center justify-center text-[8px] text-gray-400">
                                                {page.layers.length > 0 ? (
                                                    <div className="w-full h-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                                                        {page.layers.find(l => l.shapeType === 'image') ? <ImageIcon className="w-4 h-4 opacity-50" /> : <div className="flex gap-0.5 transform scale-50"><div className="w-2 h-2 bg-gray-300 rounded-full"></div></div>}
                                                    </div>
                                                ) : 'Empty'}
                                            </div>
                                            {/* Page Number Badge */}
                                            <div className="absolute bottom-0 left-0 bg-black/50 text-white text-[9px] px-1.5 py-0.5 rounded-tr-md font-medium backdrop-blur-sm">
                                                {index + 1}
                                            </div>
                                        </div>
                                    </button>

                                    {/* Delete Button on Hover */}
                                    {pages.length > 1 && (
                                        <button
                                            onClick={(e) => deletePage(e, page.id)}
                                            className="absolute -top-1 -right-1 bg-white dark:bg-gray-700 text-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-all shadow-sm border border-gray-200 dark:border-gray-600 transform scale-75 hover:scale-100"
                                            title="Delete Page"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            ))}

                            {/* Add Page Button */}
                            <button
                                onClick={addPage}
                                className="w-20 h-12 flex-shrink-0 flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-purple-500 bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 transition-all group"
                            >
                                <div className="flex items-center gap-1 text-gray-400 group-hover:text-purple-500">
                                    <Plus className="w-5 h-5" />
                                    <ChevronDown className="w-3 h-3" />
                                </div>
                            </button>
                        </div>
                    </div >
                )}


                {/* GRID VIEW OVERLAY */}
                {!isViewOnly && isGridView && (
                    <div className="absolute inset-0 z-[200] bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-md animate-fadeIn flex flex-col">
                        {/* Grid View Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Pages</h2>
                            <button
                                onClick={() => setIsGridView(false)}
                                className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Grid Content */}
                        <div className="flex-1 overflow-y-auto p-8">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
                                {pages.map((page, index) => (
                                    <div key={page.id} className="flex flex-col gap-2 group">
                                        {/* Card */}
                                        <div
                                            onClick={() => {
                                                switchPage(page.id);
                                                setIsGridView(false);
                                            }}
                                            className={`relative aspect-video rounded-xl overflow-hidden border-2 cursor-pointer transition-all shadow-sm hover:shadow-md group-hover:scale-[1.02]
                                            ${activePageId === page.id
                                                    ? 'border-purple-500 ring-2 ring-purple-500/20'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-400'
                                                } bg-white dark:bg-gray-800`}
                                        >
                                            {/* Live Thumbnail Preview */}
                                            <div className="absolute inset-0 pointer-events-none">
                                                {/* Use a container with mapped scaling for the thumbnail content */}
                                                <div className="w-full h-full relative">
                                                    <PageThumbnail
                                                        layers={page.layers}
                                                        canvasSize={canvasSize}
                                                        darkMode={darkMode}
                                                    />
                                                </div>
                                            </div>

                                            {/* Page Number Badge */}
                                            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded text-xs font-bold">
                                                {index + 1}
                                            </div>

                                            {/* Active Indicator Check */}
                                            {activePageId === page.id && (
                                                <div className="absolute top-2 right-2 bg-purple-500 text-white p-1 rounded-full shadow-lg">
                                                    <Check className="w-3 h-3" />
                                                </div>
                                            )}

                                            {/* Delete Button (Only on Hover, not for single page) */}
                                            {pages.length > 1 && (
                                                <button
                                                    onClick={(e) => deletePage(e, page.id)}
                                                    className="absolute bottom-2 right-2 p-1.5 bg-red-100 hover:bg-red-500 text-red-500 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                                                    title="Delete Page"
                                                >
                                                    <Trash className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        {/* Label */}
                                        <div className="flex items-center justify-between px-1">
                                            <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                Page {index + 1}
                                            </span>
                                        </div>
                                    </div>
                                ))}

                                {/* Add Page Button in Grid */}
                                <button
                                    onClick={() => {
                                        addPage();
                                        // Optional: scroll to bottom?
                                    }}
                                    className={`aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all
                                    ${darkMode
                                            ? 'border-gray-700 hover:border-purple-500 hover:bg-gray-800'
                                            : 'border-gray-300 hover:border-purple-500 hover:bg-purple-50'
                                        }`}
                                >
                                    <div className={`p-3 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} group-hover:scale-110 transition-transform`}>
                                        <Plus className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                    </div>
                                    <span className={`font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Add Page</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bottom Right Toolbar */}
                {!isViewOnly && (
                    <div className="absolute bottom-4 right-4 z-50 flex items-center gap-3 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 px-2">
                            <input
                                type="range"
                                min="0.1"
                                max="2"
                                step="0.05"
                                value={zoom}
                                onChange={(e) => setZoom(parseFloat(e.target.value))}
                                className="w-24 accent-purple-600 h-1 bg-gray-200 rounded-lg cursor-pointer"
                            />
                            <span className="text-xs font-mono w-9 text-right">{Math.round(zoom * 100)}%</span>
                        </div>

                        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700"></div>

                        <button
                            onClick={() => setIsGridView(true)}
                            className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors"
                        >
                            <Layers className="w-4 h-4" />
                            <span>Pages</span>
                            <span className="bg-gray-100 dark:bg-gray-900 px-1.5 py-0.5 rounded text-[10px]">
                                {pages.findIndex(p => p.id === activePageId) + 1} / {pages.length}
                            </span>
                        </button>

                        <button
                            onClick={() => setIsGridView(true)}
                            className={`p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${isGridView ? 'text-purple-600 bg-purple-50' : 'text-gray-700 dark:text-gray-300'}`}
                            title="Grid View"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>

                        <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 transition-colors" title="Fullscreen">
                            <Maximize2 className="w-4 h-4" />
                        </button>
                    </div>
                )}

            </div >

            {isViewOnly && renderPresentationFooter()}

            {/* Contextual Toolbar for Selected Layer - Fixed at root level to avoid zoom issues */}
            {
                !isViewOnly && activeLayerId && !isCropMode && (() => {
                    const layer = layers.find(l => l.id === activeLayerId);
                    if (!layer) return null;
                    return (
                        <div className="fixed top-14 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white dark:bg-gray-800 p-1 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 pointer-events-auto z-[200] animate-fadeIn">
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


                            {/* Color Button - For shapes, text AND frames (background) */}
                            {(layer.type === 'shape' || layer.type === 'text' || layer.type === 'frame') && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveColorProperty(layer.type === 'frame' ? 'backgroundColor' : 'color');
                                        setShowColorPicker(!showColorPicker);
                                        setContextMenu(null);
                                    }}
                                    className={`p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md ${showColorPicker && (activeColorProperty === 'color' || activeColorProperty === 'backgroundColor') ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600' : ''}`}
                                    title={layer.type === 'frame' ? "Background Color" : "Color"}
                                >
                                    <div
                                        className="w-4 h-4 rounded-full border border-gray-200 dark:border-gray-700"
                                        style={{
                                            backgroundColor: (layer.type === 'frame' ? layer.backgroundColor : layer.color) || '#000000',
                                            background: typeof layer.color === 'string' && layer.color.startsWith('linear-gradient') ? layer.color : undefined
                                        }}
                                    />
                                </button>
                            )}

                            {/* Border Color Button - Only for frames */}
                            {layer.type === 'frame' && (
                                <>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveColorProperty('borderColor');
                                            setShowColorPicker(!showColorPicker);
                                            setContextMenu(null);
                                        }}
                                        className={`p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md ${showColorPicker && activeColorProperty === 'borderColor' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600' : ''}`}
                                        title="Border Color"
                                    >
                                        <div className="relative w-5 h-5">
                                            <div className="absolute inset-0 rounded border-2" style={{ borderColor: layer.borderColor || '#ffffff' }} />
                                            <Palette className="w-3 h-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400" />
                                        </div>
                                    </button>
                                    <input
                                        type="range"
                                        min="0"
                                        max="50"
                                        value={layer.borderWidth || 10}
                                        onChange={(e) => {
                                            const borderWidth = parseInt(e.target.value);
                                            const updated = layers.map(l => l.id === activeLayerId ? { ...l, borderWidth } : l);
                                            setLayers(updated);
                                        }}
                                        onMouseUp={() => saveToHistory(layers)}
                                        className="w-16 accent-purple-600 h-1 bg-gray-200 rounded-lg cursor-pointer"
                                        title="Border Width"
                                    />
                                </>
                            )}


                            {/* Color Picker Popup */}
                            {showColorPicker && (layer.type === 'shape' || layer.type === 'text' || layer.type === 'frame') && (
                                <div
                                    className="fixed top-[108px] left-1/2 -translate-x-1/2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[300] animate-fadeIn overflow-hidden"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                        <span className="font-bold text-sm dark:text-white">Color</span>
                                        <button
                                            onClick={() => setShowColorPicker(false)}
                                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                                        >
                                            <X className="w-4 h-4 text-gray-500" />
                                        </button>
                                    </div>

                                    <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar space-y-4">
                                        {/* Search Bar */}
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder='Try "blue" or "#00c4cc"'
                                                value={colorSearchQuery}
                                                onChange={(e) => setColorSearchQuery(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                                            />
                                        </div>

                                        {/* Document Colors */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Palette className="w-4 h-4 text-gray-400" />
                                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Document colors</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <label className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center hover:border-purple-500 transition-colors cursor-pointer">
                                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-500 via-green-500 to-blue-500 flex items-center justify-center">
                                                        <Plus className="w-3 h-3 text-white" />
                                                    </div>
                                                    <input
                                                        type="color"
                                                        className="sr-only"
                                                        onChange={(e) => {
                                                            const color = e.target.value;
                                                            const updated = layers.map(l => l.id === activeLayerId ? { ...l, [activeColorProperty]: color } : l);
                                                            setLayers(updated);
                                                            saveToHistory(updated);
                                                        }}
                                                    />
                                                </label>
                                                {Array.from(new Set(layers.filter(l => l.type === 'shape' || l.type === 'text' || l.type === 'frame').map(l => (l.type === 'frame' ? l.backgroundColor : l.color)))).filter(Boolean).map((color, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => {
                                                            const updated = layers.map(l => l.id === activeLayerId ? { ...l, [activeColorProperty]: color } : l);
                                                            setLayers(updated);
                                                            saveToHistory(updated);
                                                        }}
                                                        className={`w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 hover:scale-110 transition-transform ${layers.find(l => l.id === activeLayerId)?.[activeColorProperty] === color ? 'ring-2 ring-purple-500 border-transparent shadow-lg' : ''}`}
                                                        style={{ backgroundColor: color }}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {/* Photo Colors */}
                                        {extractedColors.length > 0 && (
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Camera className="w-4 h-4 text-gray-400" />
                                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Photo colors</span>
                                                </div>
                                                <div className="grid grid-cols-7 gap-2">
                                                    {extractedColors.map((color, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => {
                                                                const updated = layers.map(l => l.id === activeLayerId ? { ...l, [activeColorProperty]: color } : l);
                                                                setLayers(updated);
                                                                saveToHistory(updated);
                                                            }}
                                                            className={`w-full aspect-square rounded-lg border hover:scale-110 transition-transform ${layers.find(l => l.id === activeLayerId)?.[activeColorProperty] === color ? 'ring-2 ring-purple-500 border-transparent' : 'border-gray-200 dark:border-gray-600'}`}
                                                            style={{ backgroundColor: color }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Default Solid Colors */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <CircleIcon className="w-4 h-4 text-gray-400" />
                                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Default solid colors</span>
                                                </div>
                                                <button
                                                    onClick={() => setShowAllColors(!showAllColors)}
                                                    className="text-[10px] text-purple-600 font-bold hover:underline"
                                                >
                                                    {showAllColors ? 'Show less' : 'See all'}
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-7 gap-2">
                                                {(() => {
                                                    const baseColors = [
                                                        'transparent', '#000000', '#545454', '#737373', '#a6a6a6', '#d9d9d9', '#ffffff',
                                                        '#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#5ac8fa', '#007aff', '#5856d6',
                                                        '#ff2d55', '#ff6b6b', '#ffa07a', '#98d8c8', '#87ceeb', '#9b59b6', '#3498db',
                                                        '#00d4aa', '#20b2aa', '#48d1cc', '#40e0d0', '#00ced1', '#1abc9c', '#16a085'
                                                    ];
                                                    const moreColors = [
                                                        '#e74c3c', '#c0392b', '#9b59b6', '#8e44ad', '#2980b9', '#3498db', '#1abc9c',
                                                        '#16a085', '#27ae60', '#2ecc71', '#f1c40f', '#f39c12', '#e67e22', '#d35400',
                                                        '#ecf0f1', '#bdc3c7', '#95a5a6', '#7f8c8d', '#34495e', '#2c3e50', '#1a1a2e',
                                                        '#ff6f61', '#6b5b95', '#88b04b', '#f7cac9', '#92a8d1', '#955251', '#b565a7',
                                                        '#009b77', '#dd4124', '#d65076', '#45b8ac', '#efc050', '#5b5ea6', '#9b2335'
                                                    ];
                                                    let allColors = showAllColors ? [...baseColors, ...moreColors] : baseColors;

                                                    if (colorSearchQuery.trim()) {
                                                        const query = colorSearchQuery.toLowerCase().trim();
                                                        const colorNames = {
                                                            red: ['#ff3b30', '#ff2d55', '#ff6b6b', '#e74c3c', '#c0392b', '#dd4124', '#9b2335', '#955251'],
                                                            blue: ['#5ac8fa', '#007aff', '#3498db', '#2980b9', '#87ceeb', '#92a8d1', '#5b5ea6'],
                                                            green: ['#34c759', '#1abc9c', '#16a085', '#00d4aa', '#27ae60', '#2ecc71', '#88b04b', '#009b77', '#45b8ac'],
                                                            yellow: ['#ffcc00', '#f1c40f', '#f39c12', '#efc050'],
                                                            orange: ['#ff9500', '#ffa07a', '#e67e22', '#d35400', '#ff6f61'],
                                                            purple: ['#5856d6', '#9b59b6', '#8e44ad', '#6b59b6', '#b565a7', '#d65076'],
                                                            pink: ['#ff2d55', '#f7cac9', '#d65076'],
                                                            black: ['#000000', '#1a1a2e', '#2c3e50', '#34495e'],
                                                            white: ['#ffffff', '#ecf0f1', '#d9d9d9'],
                                                            gray: ['#545454', '#737373', '#a6a6a6', '#bdc3c7', '#95a5a6', '#7f8c8d'],
                                                            cyan: ['#48d1cc', '#40e0d0', '#00ced1', '#20b2aa', '#98d8c8', '#45b8ac'],
                                                            teal: ['#009b77', '#1abc9c', '#16a085', '#20b2aa']
                                                        };
                                                        if (query.startsWith('#')) {
                                                            allColors = allColors.filter(c => c.toLowerCase().includes(query));
                                                        } else if (colorNames[query]) {
                                                            allColors = allColors.filter(c => colorNames[query].includes(c));
                                                        }
                                                    }

                                                    return allColors.map((color, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => {
                                                                const updated = layers.map(l => l.id === activeLayerId ? { ...l, [activeColorProperty]: color } : l);
                                                                setLayers(updated);
                                                                saveToHistory(updated);
                                                            }}
                                                            className={`w-full aspect-square rounded-lg border hover:scale-110 transition-transform ${layers.find(l => l.id === activeLayerId)?.[activeColorProperty] === color ? 'ring-2 ring-purple-500 border-transparent' : 'border-gray-200 dark:border-gray-600'}`}
                                                            style={{
                                                                backgroundColor: color === 'transparent' ? '#fff' : color,
                                                                backgroundImage: color === 'transparent' ? 'linear-gradient(45deg, #eee 25%, transparent 25%, transparent 75%, #eee 75%, #eee), linear-gradient(45deg, #eee 25%, transparent 25%, transparent 75%, #eee 75%, #eee)' : undefined,
                                                                backgroundPosition: color === 'transparent' ? '0 0, 4px 4px' : undefined,
                                                                backgroundSize: color === 'transparent' ? '8px 8px' : undefined
                                                            }}
                                                        />
                                                    ));
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-0.5" />
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (contextMenu && contextMenu.layerId === layer.id) {
                                        setContextMenu(null);
                                    } else {
                                        setContextMenu({ x: e.clientX, y: e.clientY + 20, layerId: layer.id });
                                    }
                                }}
                                className={`p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-700 dark:text-gray-300 ${contextMenu?.layerId === layer.id ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                                title="More"
                            >
                                <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* Context Menu */}
                            {contextMenu && contextMenu.layerId === layer.id && (
                                <div
                                    className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-[150] w-48 py-1 overflow-hidden animate-fadeIn"
                                    style={{ top: '100px', left: 'calc(50% + 80px)', transform: 'translateX(-50%)' }}
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
                        </div>
                    );
                })()
            }

            <style>{`
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
        <div className="mb-8 animate-fadeIn relative group/category">
            {/* Subcategory Header */}
            <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} text-purple-500 shadow-sm`}>
                        {sub.icon}
                    </div>
                    <h4 className={`text-[10px] font-black uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {sub.title}
                    </h4>
                </div>
                <button className="text-[10px] text-purple-600 font-bold hover:underline opacity-60">See all</button>
            </div>

            {/* Horizontal Carousel */}
            <div className="relative">
                {/* Left Navigation */}
                <button
                    onClick={() => scroll('left')}
                    className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full shadow-lg opacity-0 group-hover/category:opacity-100 transition-all ${darkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-800 hover:bg-gray-50'} -ml-2 border border-gray-100 dark:border-gray-700`}
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Items Container */}
                <div
                    ref={scrollRef}
                    className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x px-1"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {items && items.map((rawItem, i) => {
                        const isString = typeof rawItem === 'string';
                        const item = isString ? { thumb: rawItem, title: 'Element' } : rawItem;
                        const url = item.thumb;
                        const aspectRatio = item.aspectRatio || 1;

                        return (
                            <div key={i} className="flex-none w-[100px] flex flex-col items-center gap-2 group/item snap-start">
                                <button
                                    onClick={() => onAdd(item)}
                                    className={`w-full aspect-square bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 transition-all flex items-center justify-center p-2.5 relative overflow-hidden shadow-sm hover:shadow-md active:scale-95`}
                                    draggable={true}
                                    onDragStart={(e) => {
                                        if (isString) {
                                            e.dataTransfer.setData('text/plain', rawItem);
                                        } else {
                                            e.dataTransfer.setData('application/json', JSON.stringify(rawItem));
                                            e.dataTransfer.setData('text/plain', item.thumb);
                                        }
                                        const dragImg = new Image();
                                        dragImg.src = url || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                                        e.dataTransfer.setDragImage(dragImg, 0, 0);
                                    }}
                                >
                                    {url && !['paper', 'Paper'].includes(item.frameStyle) ? (
                                        <img
                                            src={url}
                                            alt={item.title}
                                            className="w-full h-full pointer-events-none transition-transform group-hover/item:scale-110"
                                            style={{ clipPath: item.clipPath || 'none', objectFit: 'contain', ...(item.style || {}) }}
                                            referrerPolicy="no-referrer"
                                            crossOrigin="anonymous"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center pointer-events-none">
                                            <div
                                                className="bg-gray-400 dark:bg-gray-600 group-hover/item:bg-purple-500 transition-colors relative"
                                                style={{
                                                    clipPath: item.clipPath,
                                                    ...(item.style || {}),
                                                    width: aspectRatio > 1 ? '85%' : `${85 * aspectRatio}%`,
                                                    height: aspectRatio > 1 ? `${85 / aspectRatio}%` : '85%',
                                                    borderWidth: item.style?.border ? '1.5px' : '0',
                                                    borderRadius: item.style?.borderRadius ? (parseInt(item.style.borderRadius) / 6) + 'px' : '4px',
                                                    borderTopWidth: item.style?.borderTop ? '5px' : undefined,
                                                    borderBottomWidth: item.style?.borderBottomWidth ? '3px' : undefined,
                                                    boxShadow: 'none'
                                                }}
                                            >
                                                {/* Mini Decorations for sidebar */}
                                                {item.frameStyle === 'browser' && (
                                                    <div className="absolute top-[-4px] left-0.5 flex gap-0.5 scale-[0.3] origin-top-left">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[#ff5f56]" />
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[#ffbd2e]" />
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[#27c93f]" />
                                                    </div>
                                                )}
                                                {/* Paper Frame Overlay */}
                                                {item.frameStyle === 'paper' && item.thumb && (
                                                    <div
                                                        className="absolute inset-0 w-full h-full pointer-events-none z-20"
                                                        style={{
                                                            backgroundImage: `url(${item.thumb})`,
                                                            backgroundSize: '100% 100%',
                                                            backgroundPosition: 'center',
                                                            mixBlendMode: 'multiply'
                                                        }}
                                                    />
                                                )}

                                                {/* Device Frames Decorations */}
                                                {(item.frameStyle === 'phone' || item.frameStyle === 'tablet') && (
                                                    <>
                                                        {item.hasNotch && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-[8%] bg-[#1a1a1a] rounded-b-[1px]" />}
                                                        {item.hasHolePunch && <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[6%] h-[6%] bg-[#1a1a1a] rounded-full shadow-inner" />}
                                                        {item.hasButtons && (
                                                            <>
                                                                <div className="absolute top-[20%] right-[-2px] w-[2px] h-[15%] bg-[#1a1a1a] rounded-r-[1px]" />
                                                                <div className="absolute top-[18%] left-[-2px] w-[2px] h-[10%] bg-[#1a1a1a] rounded-l-[1px]" />
                                                                <div className="absolute top-[30%] left-[-2px] w-[2px] h-[10%] bg-[#1a1a1a] rounded-l-[1px]" />
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                                {item.frameStyle === 'watch' && item.hasCrown && (
                                                    <div className="absolute top-[30%] right-[-2.5px] w-[2.5px] h-[15%] bg-[#222] rounded-r-[1px]" />
                                                )}
                                                {(item.frameStyle === 'monitor' || item.frameStyle === 'laptop') && (
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-1/3 h-[10%] bg-gray-400 dark:bg-gray-600 pointer-events-none"
                                                        style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)', marginTop: item.frameStyle === 'laptop' ? '-5%' : '-8%', zIndex: -1 }} />
                                                )}
                                                {item.frameStyle === 'laptop' && (
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-[120%] h-[5%] bg-[#222] pointer-events-none -mt-[2%] rounded-[1px]" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 95% 100%, 5% 100%)' }}>
                                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[20%] h-full bg-[#111] rounded-b-[1px] opacity-50" />
                                                    </div>
                                                )}
                                                {item.frameStyle === 'browser' && (
                                                    <div className="absolute top-[5%] left-[5%] flex gap-[2px]">
                                                        <div className="w-[3px] h-[3px] rounded-full bg-[#ff5f56]" />
                                                        <div className="w-[3px] h-[3px] rounded-full bg-[#ffbd2e]" />
                                                        <div className="w-[3px] h-[3px] rounded-full bg-[#27c93f]" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/0 group-hover/item:bg-purple-600/5 transition-colors flex items-center justify-center opacity-0 group-hover/item:opacity-100">
                                        <Plus className="w-5 h-5 text-purple-600 drop-shadow-sm" />
                                    </div>
                                </button>
                                <span className="text-[9px] text-gray-500 dark:text-gray-400 font-bold truncate w-full text-center px-1">
                                    {item.title || 'Element'}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Right Navigation */}
                <button
                    onClick={() => scroll('right')}
                    className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full shadow-lg opacity-0 group-hover/category:opacity-100 transition-all ${darkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-800 hover:bg-gray-50'} -mr-2 border border-gray-100 dark:border-gray-700`}
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

// Helper component for previews with hybrid loading (SVG/Icon -> Lottie)
const LottiePreview = ({ item, url }) => {
    const container = useRef(null);
    const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'failed'

    useEffect(() => {
        const targetUrl = item?.url || url;
        const isActuallyGif = (item?.type === 'gif') || (targetUrl && (targetUrl.endsWith('.gif') || targetUrl.includes('flaticon.com')));

        if (!container.current || !targetUrl || isActuallyGif) return;

        let anim = null;
        let isCancelled = false;

        const loadLottie = () => {
            setStatus('loading');
            try {
                if (isCancelled) return;

                anim = lottie.loadAnimation({
                    container: container.current,
                    renderer: 'svg',
                    loop: true,
                    autoplay: true,
                    path: targetUrl,
                    rendererSettings: {
                        preserveAspectRatio: 'xMidYMid meet'
                    }
                });

                anim.addEventListener('DOMLoaded', () => {
                    if (!isCancelled) setStatus('success');
                });

                anim.addEventListener('data_failed', () => {
                    console.error('Lottie data failed:', targetUrl);
                    if (!isCancelled) setStatus('failed');
                });

                anim.addEventListener('error', (e) => {
                    console.error('Lottie internal error:', targetUrl, e);
                    if (!isCancelled) setStatus('failed');
                });

            } catch (error) {
                console.error('Lottie init error:', targetUrl, error);
                if (!isCancelled) setStatus('failed');
            }
        };

        loadLottie();

        return () => {
            isCancelled = true;
            if (anim) anim.destroy();
        };
    }, [item?.url, url, item?.type]);


    const renderFallback = () => {
        const targetUrl = item?.url || url;
        const targetTitle = item?.title || 'Animation';
        const isActuallyGif = (item?.type === 'gif') || (targetUrl && (targetUrl.endsWith('.gif') || targetUrl.includes('flaticon.com')));

        if (isActuallyGif) {
            return (
                <div className="relative w-full h-full flex items-center justify-center">
                    <img
                        src={targetUrl}
                        alt={targetTitle}
                        className="relative z-10 w-full h-full object-contain p-1"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        loading="eager"
                        onError={(e) => {
                            console.error("GIF fail:", targetUrl);
                            setStatus('failed');
                            // e.target.style.display = 'none';
                        }}
                    />
                </div>
            );
        }

        if (item?.type === 'noto') {
            return (
                <img
                    src={item.fallback}
                    alt={item.title}
                    className="w-full h-full object-contain p-2"
                />
            );
        }

        if ((item?.type === 'lordicon' || item?.type === 'local-arrow') && item.fallbackIcon) {
            const IconComponent = LucideIcons[item.fallbackIcon] || LucideIcons.HelpCircle;
            return <IconComponent className="w-8 h-8 text-gray-300 dark:text-gray-600" />;
        }

        return <LucideIcons.Sparkles className="w-8 h-8 text-gray-200" />;
    };


    const targetUrl = item?.url || url;
    const isActuallyGif = (item?.type === 'gif') || (targetUrl && (targetUrl.endsWith('.gif') || targetUrl.includes('flaticon.com')));

    if (isActuallyGif) {
        return (
            <div className="w-full h-full relative flex items-center justify-center p-1 overflow-hidden">
                <img
                    src={targetUrl}
                    alt={item?.title || 'GIF Animation'}
                    className="relative z-10 w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    loading="eager"
                    onError={(e) => {
                        console.error("GIF preview/layer fail:", targetUrl);
                        setStatus('failed');
                        // e.target.style.display = 'none';
                    }}
                />
            </div>
        );
    }

    return (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">

            {/* Fallback Layer - only if failed or really loading and it's not a gif */}
            {status !== 'success' && (
                <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${status === 'success' ? 'opacity-0' : 'opacity-100'}`}>
                    {renderFallback()}
                </div>
            )}

            {/* Lottie Animation Layer */}
            <div
                ref={container}
                className={`w-full h-full transition-opacity duration-300 z-10 ${status === 'failed' ? 'opacity-0' : 'opacity-100'}`}
            />

            {/* Subtle Loading Spinner only if it's REALLY taking time or failed */}
            {status === 'loading' && (
                <div className="absolute top-1 right-1">
                    <LucideIcons.Loader2 className="w-3 h-3 text-purple-500 animate-spin opacity-20" />
                </div>
            )}
        </div>
    );
};


const LottieCategory = ({ sub, items, onAdd, darkMode }) => {
    const scrollRef = useRef(null);
    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = 240;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (!items || items.length === 0) return null;

    return (
        <div className="mb-6 group/cat">
            <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-gray-800 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                        {sub.icon}
                    </div>
                    <h4 className={`text-xs font-bold tracking-tight ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        {sub.title}
                    </h4>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover/cat:opacity-100 transition-opacity">
                    <button onClick={() => scroll('left')} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
                        <ChevronLeft className="w-3 h-3" />
                    </button>
                    <button onClick={() => scroll('right')} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
                        <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex gap-3 overflow-x-auto pb-2 px-1 scrollbar-hide no-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {items.map((item, i) => (
                    <button
                        key={i}
                        onClick={() => onAdd(item)}
                        title={item.title}
                        className={`flex-shrink-0 w-24 aspect-square relative flex items-center justify-center rounded-2xl ${darkMode ? 'hover:bg-gray-700/30' : 'hover:bg-white'} border-2 border-transparent hover:border-purple-500/30 transition-all group overflow-hidden shadow-sm hover:shadow-md`}
                    >
                        <div className="w-full h-full p-2 pointer-events-none">
                            <LottiePreview item={item} />
                        </div>
                        <div className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-1 right-1 p-1 bg-purple-500 text-white rounded-lg scale-0 group-hover:scale-100 transition-transform shadow-lg z-20">
                            <Plus className="w-3 h-3" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ImageEditor;
