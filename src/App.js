// src/App.js
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Moon, Sun, Edit2 } from 'lucide-react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import Header from './components/Header';
import Footer from './components/Footer';
import ConverterUI from './components/ConverterUI';
import CropImageTool from './components/CropImageTool';
import ToolDetailsPanel from './components/ToolDetailsPanel';
import ImageEditor from './components/ImageEditor';
import { AuthModal } from './components/Auth';
import LandingPage from './components/LandingPage/LandingPage';
import { onAuthChange, logOut, getGoogleRedirectResult, auth } from './services/firebase';

import {
  convertImage,
  resizeImage,
  convertToSVG,
  convertToBMP,
  applyGrayscale,
  rotateImage,
  flipImage,
  mirrorImage,
  compressImage,
  cropImage,
  adjustBrightness,
  blurImage,
  sharpenImage,
  addWatermark,
  convertToPDF,
  convertSVGToPDF,
  convertMultipleImagesToPDF,
  convertTextToPDF,
  extractThumbnail,
  convertPNGToICO,
  convertHTMLToPDF,
  convertPDFToImages,
  imageToBase64,
  convertGIFToPNG,
  convertPNGToDOCX,
  convertTXTToDOCX,
  convertDOCXToImage,
  convertDOCXToPDF,
  convertPDFToText,
  convertPDFToWORD,
  convertPDFToPPTX,
  convertHEIC,
  convertHEICToPDF,
  convertHEICToTIFF,
  convertEPUBToPDF,
  base64ToImage,
} from './utils/ConverterFunctions';

// Define converters outside component to avoid dependency issues
import { converters } from './utils/toolList';

const App = () => {
  const { toolSlug, designId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeConverter, setActiveConverter] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [convertedFile, setConvertedFile] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [resizeWidth, setResizeWidth] = useState(800);
  const [resizeHeight, setResizeHeight] = useState(600);
  const [resizeMode, setResizeMode] = useState('bySize'); // 'bySize', 'byPercentage', 'socialMedia'
  const [resizePercentage, setResizePercentage] = useState(100);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [resizeFormat, setResizeFormat] = useState('original'); // 'jpg', 'png', 'webp', 'original'
  const [targetFileSize, setTargetFileSize] = useState(''); // in KB
  const [socialMediaPreset, setSocialMediaPreset] = useState('');
  const [originalDimensions, setOriginalDimensions] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [customFileName, setCustomFileName] = useState('');
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [ffmpegLoading, setFfmpegLoading] = useState(false);
  const loadingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [editedFile, setEditedFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);

  // Container management
  const [containers, setContainers] = useState([{ id: 1, selected: true, convertedFile: null }]);
  const [selectedContainerId, setSelectedContainerId] = useState(1);
  const [selectedDownloadType, setSelectedDownloadType] = useState(null); // For MP4/GIF selection
  // Watermark
  const [watermarkText, setWatermarkText] = useState('Pro Image Toolkit');
  const [watermarkPosition, setWatermarkPosition] = useState('bottom-right');
  const [watermarkFontSize, setWatermarkFontSize] = useState(30);
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.5);
  const [watermarkColor, setWatermarkColor] = useState('#FFFFFF');

  // Brightness/Contrast
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);

  // Mirror Direction
  const [mirrorDirection, setMirrorDirection] = useState('horizontal');
  const [shouldAutoDownload, setShouldAutoDownload] = useState(false);

  // Sharpen Intensity
  const [sharpenIntensity, setSharpenIntensity] = useState(1);

  // Video Thumbnail
  const [videoDuration, setVideoDuration] = useState(0);
  const [selectedTime, setSelectedTime] = useState(0);
  const [generatedThumbnails, setGeneratedThumbnails] = useState([]);

  // Video to GIF Options
  const [gifTrimStart, setGifTrimStart] = useState(0);
  const [gifTrimEnd, setGifTrimEnd] = useState(0);
  const [gifWidth, setGifWidth] = useState(480);
  const [gifLoopCount, setGifLoopCount] = useState(0);
  const [gifPreserveTransparency, setGifPreserveTransparency] = useState(false);
  const [gifFPS, setGifFPS] = useState(15);
  const [gifCompression, setGifCompression] = useState(10);
  const [gifOptimizeBackground, setGifOptimizeBackground] = useState(false);
  const [conversionQuality, setConversionQuality] = useState(100);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [error, setError] = useState(null);

  // Auth State
  const [user, setUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const fileInputRef = useRef(null);
  const ffmpegRef = useRef(new FFmpeg());

  // Auth State Listener
  useEffect(() => {
    console.log("Auth System: Initializing...");

    // Safety timeout to clear loading screen
    const safetyTimeout = setTimeout(() => {
      setAuthLoading(prev => {
        if (prev) {
          console.warn("Auth System: Timeout reached. Forcing ready state.");
          return false;
        }
        return prev;
      });
    }, 4000);

    const unsubscribe = onAuthChange((currentUser) => {
      console.log("Auth System: User status received ->", currentUser ? currentUser.email : "Guest");
      setUser(currentUser);
      setAuthLoading(false);
      clearTimeout(safetyTimeout);
    });

    return () => {
      unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, []);

  useEffect(() => {
    if (convertedFile?.name) {
      const nameWithoutExt = convertedFile.name.replace(/\.[^/.]+$/, '');
      setCustomFileName(nameWithoutExt);
    }
  }, [convertedFile]);

  // Global Error Handler for diagnostics
  useEffect(() => {
    const handleError = (e) => {
      console.error('GLOBAL ERROR:', e.message || 'Script Error (CORS)');
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Load converter from URL on mount
  useEffect(() => {
    if (toolSlug && !activeConverter) {
      // Find the converter by name from all categories
      const allConverters = Object.values(converters).flat();
      const foundConverter = allConverters.find(
        item => item.name.toLowerCase().replace(/[^a-z0-9]/g, '-') === toolSlug
      );
      if (foundConverter) {
        setActiveConverter(foundConverter);
      }
    }

    // Handle view/edit route
    if (designId && !isEditing) {
      setIsEditing(true);
      const viewOnly = location.pathname.includes('/view/');
      setIsViewOnly(viewOnly);

      // Create a dummy file object for the editor to initialize
      setSelectedFile({ name: 'Project', type: 'image/project' });
    }
  }, [toolSlug, designId, location.pathname, isEditing]);

  // Update URL when converter changes
  const handleSetActiveConverter = (converter) => {
    setActiveConverter(converter);
    if (converter) {
      const slug = converter.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      navigate(`/${slug}`);
    } else {
      navigate('/');
    }
  };

  const loadFFmpeg = async () => {
    if (ffmpegLoaded) return;
    if (loadingRef.current) {
      console.log('FFmpeg is already loading, waiting...');
      while (loadingRef.current) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      if (ffmpegLoaded) return;
      throw new Error('FFmpeg failed to load in background.');
    }

    setFfmpegLoading(true);
    loadingRef.current = true;
    console.log('Starting FFmpeg load process...');
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on('log', ({ message }) => console.log('FFmpeg Log:', message));
    ffmpeg.on('progress', ({ progress }) => {
      setConversionProgress(Math.round(progress * 100));
    });

    const cdnSources = [
      'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd',
      'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd',
      'https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd',
      'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.2/dist/umd'
    ];

    let loaded = false;
    let lastError = null;

    try {
      for (const source of cdnSources) {
        if (loaded) break;
        try {
          console.log(`Trying FFmpeg source: ${source}`);
          const coreURL = await toBlobURL(`${source}/ffmpeg-core.js`, 'text/javascript');
          const wasmURL = await toBlobURL(`${source}/ffmpeg-core.wasm`, 'application/wasm');
          const workerURL = await toBlobURL(`${source}/ffmpeg-core.worker.js`, 'text/javascript');

          await ffmpeg.load({ coreURL, wasmURL, workerURL });
          console.log(`FFmpeg successfully loaded from: ${source}`);
          loaded = true;
          setFfmpegLoaded(true);
        } catch (e) {
          console.warn(`Source ${source} failed:`, e.message);
          lastError = e;
        }
      }

      if (!loaded) {
        throw lastError || new Error('All FFmpeg sources failed to load.');
      }
    } catch (error) {
      console.error('Final FFmpeg loading failure:', error);
      throw new Error(`Failed to load converter: ${error.message}. This can happen if CDNs like unpkg.com are blocked by your network or VPN. Please try disabling any blockers or check your internet.`);
    } finally {
      setFfmpegLoading(false);
      loadingRef.current = false;
    }
  };

  // === FFmpeg-based functions (stay in App.js) ===
  const convertMP4ToMP3 = async (file) => {
    await loadFFmpeg();
    const ffmpeg = ffmpegRef.current;
    await ffmpeg.writeFile('input.mp4', await fetchFile(file));
    await ffmpeg.exec(['-i', 'input.mp4', '-vn', '-ar', '44100', '-ac', '2', '-b:a', '192k', 'output.mp3']);
    const data = await ffmpeg.readFile('output.mp3');
    const blob = new Blob([data.buffer], { type: 'audio/mp3' });
    await ffmpeg.deleteFile('input.mp4');
    await ffmpeg.deleteFile('output.mp3');
    return { url: URL.createObjectURL(blob), name: 'converted.mp3', blob, type: 'audio/mp3' };
  };

  const convertVideoToWebM = async (file) => {
    await loadFFmpeg();
    const ffmpeg = ffmpegRef.current;
    const ext = file.name.split('.').pop();
    const inputFileName = `input.${ext}`;
    const outputFileName = 'output.webm';

    try {
      await ffmpeg.writeFile(inputFileName, await fetchFile(file));
      // Using simple parameters compatible with FFmpeg.wasm
      await ffmpeg.exec([
        '-i', inputFileName,
        '-c:v', 'libvpx',
        '-b:v', '1M',
        '-c:a', 'libvorbis',
        '-q:a', '4',
        outputFileName
      ]);
      const data = await ffmpeg.readFile(outputFileName);
      const blob = new Blob([data.buffer], { type: 'video/webm' });

      // Clean up
      await ffmpeg.deleteFile(inputFileName);
      await ffmpeg.deleteFile(outputFileName);

      return { url: URL.createObjectURL(blob), name: 'converted.webm', blob, type: 'video/webm' };
    } catch (error) {
      // Clean up on error
      console.error('WebM conversion error:', error);
      try {
        await ffmpeg.deleteFile(inputFileName);
        await ffmpeg.deleteFile(outputFileName);
      } catch (e) {
        // Ignore cleanup errors
      }
      throw new Error('Video to WebM conversion failed. Please try with a different video format or smaller file size.');
    }
  };

  const convertMP3ToWAV = async (file) => {
    await loadFFmpeg();
    const ffmpeg = ffmpegRef.current;
    await ffmpeg.writeFile('input.mp3', await fetchFile(file));
    await ffmpeg.exec(['-i', 'input.mp3', '-acodec', 'pcm_s16le', '-ar', '44100', 'output.wav']);
    const data = await ffmpeg.readFile('output.wav');
    const blob = new Blob([data.buffer], { type: 'audio/wav' });
    await ffmpeg.deleteFile('input.mp3');
    await ffmpeg.deleteFile('output.wav');
    return { url: URL.createObjectURL(blob), name: 'converted.wav', blob, type: 'audio/wav' };
  };

  const convertWAVToMP3 = async (file) => {
    await loadFFmpeg();
    const ffmpeg = ffmpegRef.current;
    await ffmpeg.writeFile('input.wav', await fetchFile(file));
    await ffmpeg.exec(['-i', 'input.wav', '-vn', '-ar', '44100', '-ac', '2', '-b:a', '192k', 'output.mp3']);
    const data = await ffmpeg.readFile('output.mp3');
    const blob = new Blob([data.buffer], { type: 'audio/mp3' });
    await ffmpeg.deleteFile('input.wav');
    await ffmpeg.deleteFile('output.mp3');
    return { url: URL.createObjectURL(blob), name: 'converted.mp3', blob, type: 'audio/mp3' };
  };

  const extractAudioFromVideo = async (file) => {
    await loadFFmpeg();
    const ffmpeg = ffmpegRef.current;
    const ext = file.name.split('.').pop();
    await ffmpeg.writeFile(`input.${ext}`, await fetchFile(file));
    await ffmpeg.exec(['-i', `input.${ext}`, '-vn', '-ar', '44100', '-ac', '2', '-b:a', '192k', 'output.mp3']);
    const data = await ffmpeg.readFile('output.mp3');
    const blob = new Blob([data.buffer], { type: 'audio/mp3' });
    await ffmpeg.deleteFile(`input.${ext}`);
    await ffmpeg.deleteFile('output.mp3');
    return { url: URL.createObjectURL(blob), name: 'audio.mp3', blob, type: 'audio/mp3' };
  };

  const convertVideoToGIF = async (file) => {
    await loadFFmpeg();
    const ffmpeg = ffmpegRef.current;
    const ext = file.name.split('.').pop();
    const inputFileName = `input.${ext}`;

    try {
      await ffmpeg.writeFile(inputFileName, await fetchFile(file));

      // Build FFmpeg command with options
      const trimStart = gifTrimStart || 0;
      const trimEnd = gifTrimEnd || 0;
      const width = gifWidth || 480;
      const fps = gifFPS || 15;
      const loopCount = gifLoopCount;

      // Build filter string
      let filterString = `fps=${fps},scale=${width}:-1:flags=lanczos`;

      // First pass: generate palette
      const paletteCmd = ['-i', inputFileName];

      // Add trim if specified
      if (trimStart > 0) {
        paletteCmd.push('-ss', trimStart.toString());
      }
      if (trimEnd > 0 && trimEnd > trimStart) {
        paletteCmd.push('-to', trimEnd.toString());
      }

      paletteCmd.push('-vf', `${filterString},palettegen`);
      paletteCmd.push('palette.png');

      await ffmpeg.exec(paletteCmd);

      // Second pass: create GIF
      const gifCmd = ['-i', inputFileName, '-i', 'palette.png'];

      // Add trim if specified
      if (trimStart > 0) {
        gifCmd.push('-ss', trimStart.toString());
      }
      if (trimEnd > 0 && trimEnd > 0) {
        gifCmd.push('-to', trimEnd.toString());
      }

      // Add filter complex
      gifCmd.push('-filter_complex', `${filterString}[x];[x][1:v]paletteuse`);

      // Add loop count
      gifCmd.push('-loop', loopCount.toString());

      // Output file
      gifCmd.push('output.gif');

      await ffmpeg.exec(gifCmd);

      const data = await ffmpeg.readFile('output.gif');
      const blob = new Blob([data.buffer], { type: 'image/gif' });

      // Clean up files
      try {
        await ffmpeg.deleteFile(inputFileName);
        await ffmpeg.deleteFile('palette.png');
        await ffmpeg.deleteFile('output.gif');
      } catch (cleanupError) {
        console.warn('Cleanup error:', cleanupError);
      }

      return {
        url: URL.createObjectURL(blob),
        name: 'converted.gif',
        blob,
        type: 'image/gif',
        note: `${width}px width, ${fps} FPS${trimStart > 0 || trimEnd > 0 ? ', trimmed' : ''}${loopCount === 0 ? ', infinite loop' : loopCount > 0 ? `, ${loopCount} loops` : ''}`
      };
    } catch (error) {
      // Clean up on error
      console.error('Video to GIF conversion error:', error);
      try {
        await ffmpeg.deleteFile(inputFileName);
        await ffmpeg.deleteFile('palette.png');
        await ffmpeg.deleteFile('output.gif');
      } catch (e) {
        // Ignore cleanup errors
      }
      throw new Error('Video to GIF conversion failed. Please try with a shorter video or different format.');
    }
  };

  const convertGIFToVideo = async (file) => {
    await loadFFmpeg();
    const ffmpeg = ffmpegRef.current;
    await ffmpeg.writeFile('input.gif', await fetchFile(file));
    await ffmpeg.exec(['-i', 'input.gif', '-movflags', 'faststart', '-pix_fmt', 'yuv420p', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', 'output.mp4']);
    const data = await ffmpeg.readFile('output.mp4');
    const blob = new Blob([data.buffer], { type: 'video/mp4' });
    await ffmpeg.deleteFile('input.gif');
    await ffmpeg.deleteFile('output.mp4');
    return { url: URL.createObjectURL(blob), name: 'converted.mp4', blob, type: 'video/mp4' };
  };

  const convertImagesToGIF = async (files) => {
    await loadFFmpeg();
    const ffmpeg = ffmpegRef.current;

    try {
      // Write all image files
      for (let i = 0; i < files.length; i++) {
        const ext = files[i].name.split('.').pop();
        await ffmpeg.writeFile(`image${i}.${ext}`, await fetchFile(files[i]));
      }

      // Create a concat file list for ffmpeg
      let concatContent = '';
      for (let i = 0; i < files.length; i++) {
        const ext = files[i].name.split('.').pop();
        concatContent += `file 'image${i}.${ext}'\nduration 1\n`;
      }
      // Add the last image one more time for proper duration
      const lastExt = files[files.length - 1].name.split('.').pop();
      concatContent += `file 'image${files.length - 1}.${lastExt}'\n`;

      await ffmpeg.writeFile('concat.txt', new TextEncoder().encode(concatContent));

      // Convert images to GIF with 1 second per frame
      await ffmpeg.exec([
        '-f', 'concat',
        '-safe', '0',
        '-i', 'concat.txt',
        '-vf', 'fps=1,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse',
        '-loop', '0',
        'output.gif'
      ]);

      const data = await ffmpeg.readFile('output.gif');
      const blob = new Blob([data.buffer], { type: 'image/gif' });

      // Clean up all files
      for (let i = 0; i < files.length; i++) {
        const ext = files[i].name.split('.').pop();
        await ffmpeg.deleteFile(`image${i}.${ext}`);
      }
      await ffmpeg.deleteFile('concat.txt');
      await ffmpeg.deleteFile('output.gif');

      return { url: URL.createObjectURL(blob), name: 'animated.gif', blob, type: 'image/gif' };
    } catch (error) {
      // Clean up on error
      console.error('Images to GIF conversion error:', error);
      throw new Error('Images to GIF conversion failed. Please ensure all files are valid images.');
    }
  };

  const extractThumbnailFFmpeg = async (file, time) => {
    await loadFFmpeg();
    const ffmpeg = ffmpegRef.current;
    const ext = file.name.split('.').pop();
    const inputFileName = `input_${Date.now()}.${ext}`;
    const outputFileName = `thumb_${Date.now()}.jpg`;

    try {
      await ffmpeg.writeFile(inputFileName, await fetchFile(file));
      // -ss before -i is faster for large files
      await ffmpeg.exec(['-ss', time.toString(), '-i', inputFileName, '-vframes', '1', '-q:v', '2', outputFileName]);
      const data = await ffmpeg.readFile(outputFileName);
      const blob = new Blob([data.buffer], { type: 'image/jpeg' });
      await ffmpeg.deleteFile(inputFileName);
      await ffmpeg.deleteFile(outputFileName);
      return { url: URL.createObjectURL(blob), name: 'thumbnail.jpg', blob, type: 'image/jpeg' };
    } catch (error) {
      console.error('Thumbnail extraction failed:', error);
      try { await ffmpeg.deleteFile(inputFileName); } catch (e) { }
      try { await ffmpeg.deleteFile(outputFileName); } catch (e) { }
      throw new Error('Failed to extract thumbnail. Try another timestamp or format.');
    }
  };

  // Generic Image Conversion using FFmpeg (for formats not supported by Canvas/Browser naturally like TIFF, EPS)
  const convertMediaFFmpeg = async (file, format) => {
    await loadFFmpeg();

    // Handle aliases
    if (format === 'audio') format = 'mp3';
    if (format === 'video') format = 'mp4';
    if (format === 'image') format = 'png';

    const ffmpeg = ffmpegRef.current;
    const logHistory = [];
    const logHandler = ({ message }) => {
      console.log('FFmpeg Log:', message);
      logHistory.push(message);
      if (logHistory.length > 20) logHistory.shift();
    };

    const progressHandler = ({ progress }) => {
      setConversionProgress(Math.round(progress * 100));
    };

    ffmpeg.on('log', logHandler);
    ffmpeg.on('progress', progressHandler);

    // Manual MIME type mapping
    let mimeType = '';
    const videoFormats = ['mp4', 'webm', 'avi', 'mov', 'mkv', 'flv', 'wmv', '3gp', 'mpg', 'vob', 'ts', 'ogv'];
    const audioFormats = ['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a', 'wma', 'amr', 'aiff', 'opus', 'ac3', 'ra'];

    if (videoFormats.includes(format)) {
      mimeType = `video/${format === 'mpg' ? 'mpeg' : format === 'mov' ? 'quicktime' : format}`;
    } else if (audioFormats.includes(format)) {
      mimeType = `audio/${format === 'm4a' ? 'mp4' : format === 'mp3' ? 'mpeg' : format}`;
    } else {
      const mimeMap = {
        'eps': 'application/postscript', 'pdf': 'application/pdf', 'tiff': 'image/tiff',
        'psd': 'image/vnd.adobe.photoshop', 'ico': 'image/x-icon', 'svg': 'image/svg+xml',
        'tga': 'image/x-tga', 'jfif': 'image/jpeg', 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg',
        'heic': 'image/heic', 'bmp': 'image/bmp', 'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel', 'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'ppt': 'application/vnd.ms-powerpoint', 'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'epub': 'application/epub+zip', 'mobi': 'application/x-mobipocket-ebook', 'rtf': 'application/rtf',
        'txt': 'text/plain', 'xml': 'application/xml', 'htm': 'text/html'
      };
      mimeType = mimeMap[format] || `image/${format}`;
    }

    // Generate unique filenames to avoid FS collisions (FS error)
    const timestamp = Date.now();
    const ext = file.name.split('.').pop() || 'tmp';
    const inputFileName = `input_${timestamp}.${ext}`;
    const outputFileName = `output_${timestamp}.${format}`;

    try {
      // Clear VFS before starting (Best practice for memory)
      try {
        const files = await ffmpeg.listDir('.');
        for (const f of files) {
          if (f.name !== '.' && f.name !== '..') {
            await ffmpeg.deleteFile(f.name);
          }
        }
      } catch (e) { /* ignore */ }

      await ffmpeg.writeFile(inputFileName, await fetchFile(file));

      // Use more conservative memory settings or simple commands where possible
      // Use more conservative memory settings or simple commands where possible
      // Specialized flags for common formats to ensure browser compatibility
      let ffmpegArgs = ['-i', inputFileName];

      if (format === 'mp4') {
        ffmpegArgs.push('-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-movflags', 'faststart');
      } else if (format === 'webm') {
        ffmpegArgs.push('-c:v', 'libvpx', '-b:v', '1M', '-c:a', 'libvorbis');
      } else if (format === 'mp3') {
        ffmpegArgs.push('-vn', '-ar', '44100', '-ac', '2', '-b:a', '192k');
      } else if (['jpg', 'jpeg', 'png', 'webp'].includes(format)) {
        // No special flags needed for basic image output, but could add quality
      }

      ffmpegArgs.push(outputFileName);
      await ffmpeg.exec(ffmpegArgs);

      const data = await ffmpeg.readFile(outputFileName);
      const blob = new Blob([data.buffer], { type: mimeType });

      // Immediate cleanup
      await ffmpeg.deleteFile(inputFileName);
      await ffmpeg.deleteFile(outputFileName);
      ffmpeg.off('log', logHandler);
      ffmpeg.off('progress', progressHandler);

      return { url: URL.createObjectURL(blob), name: `converted_${timestamp}.${format}`, blob, type: mimeType };
    } catch (error) {
      ffmpeg.off('log', logHandler);
      ffmpeg.off('progress', progressHandler);
      console.error('FFmpeg error:', error);
      // Attempt cleanup on failure
      try { await ffmpeg.deleteFile(inputFileName); } catch (e) { }
      try { await ffmpeg.deleteFile(outputFileName); } catch (e) { }

      const lastLogs = logHistory.slice(-5).join(' | ');
      if (error?.message?.includes('memory access out of bounds')) {
        throw new Error('Conversion failed due to memory limits. This can happen with very large files or complex videos in the browser.');
      }
      throw new Error(`Conversion to ${format} failed. ${lastLogs || error?.message || 'FFmpeg process crashed'}`);
    }
  };

  // === Event Handlers ===
  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (!files.length) return;
    const file = activeConverter?.multiple ? Array.from(files) : files[0];
    setSelectedFile(file);
    setEditedFile(null); // Clear edited file on new selection
    setConvertedFile(null);
    setPreviewUrl(null);

    if ((Array.isArray(file) ? file[0]?.type : file.type)?.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviewUrl(ev.target.result);

        // Load original dimensions for resize mode
        if (activeConverter?.to === 'resize') {
          const img = new window.Image();
          img.onload = () => {
            setOriginalDimensions({ width: img.width, height: img.height });
            setResizeWidth(img.width);
            setResizeHeight(img.height);
          };
          img.src = ev.target.result;
        }
      };
      reader.readAsDataURL(Array.isArray(file) ? file[0] : file);
    } else if ((Array.isArray(file) ? file[0]?.type : file.type)?.startsWith('video/') || (Array.isArray(file) ? file[0]?.type : file.type)?.startsWith('audio/')) {
      setPreviewUrl(URL.createObjectURL(Array.isArray(file) ? file[0] : file));
    }
  };

  const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    const files = e.dataTransfer.files;
    if (!files.length) return;
    const file = activeConverter?.multiple ? Array.from(files) : files[0];
    setSelectedFile(file);
    setEditedFile(null); // Clear edited file on new selection
    setConvertedFile(null);
    setPreviewUrl(null);
    if ((Array.isArray(file) ? file[0]?.type : file.type)?.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreviewUrl(ev.target.result);
      reader.readAsDataURL(Array.isArray(file) ? file[0] : file);
    } else if ((Array.isArray(file) ? file[0]?.type : file.type)?.startsWith('video/') || (Array.isArray(file) ? file[0]?.type : file.type)?.startsWith('audio/')) {
      setPreviewUrl(URL.createObjectURL(Array.isArray(file) ? file[0] : file));
    }
  };

  const handleResizeWidthChange = (newWidth) => {
    setResizeWidth(newWidth);
    if (lockAspectRatio && originalDimensions) {
      const aspectRatio = originalDimensions.height / originalDimensions.width;
      setResizeHeight(Math.round(newWidth * aspectRatio));
    }
  };

  const handleResizeHeightChange = (newHeight) => {
    setResizeHeight(newHeight);
    if (lockAspectRatio && originalDimensions) {
      const aspectRatio = originalDimensions.width / originalDimensions.height;
      setResizeWidth(Math.round(newHeight * aspectRatio));
    }
  };

  const handleImageEdit = (blob) => {
    if (!blob) {
      setIsEditing(false);
      return;
    }
    const newFile = new File([blob], selectedFile.name, { type: 'image/png' });
    setEditedFile(newFile);
    setIsEditing(false);

    // Update preview with the edited version
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);

    // Set auto-download flag and trigger conversion
    // setShouldAutoDownload(true); // Disable auto-download: User must click download manually
    handleConvert(newFile);
  };

  const handleResizeConversion = async (file) => {
    const img = new window.Image();
    await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => { img.onload = () => resolve(); img.src = e.target.result; };
      reader.readAsDataURL(file);
    });
    if (!originalDimensions) setOriginalDimensions({ width: img.width, height: img.height });

    let finalWidth = resizeWidth;
    let finalHeight = resizeHeight;
    if (resizeMode === 'byPercentage') {
      finalWidth = Math.round(img.width * (resizePercentage / 100));
      finalHeight = Math.round(img.height * (resizePercentage / 100));
    } else if (resizeMode === 'socialMedia' && socialMediaPreset) {
      const presets = { 'instagram-post': { width: 1080, height: 1080 }, 'instagram-story': { width: 1080, height: 1920 }, 'facebook-cover': { width: 820, height: 312 }, 'twitter-post': { width: 1200, height: 675 }, 'youtube-thumbnail': { width: 1280, height: 720 } };
      if (presets[socialMediaPreset]) { finalWidth = presets[socialMediaPreset].width; finalHeight = presets[socialMediaPreset].height; }
    }

    let outputFormat = resizeFormat === 'original' ? (file.type.includes('png') ? 'png' : file.type.includes('webp') ? 'webp' : 'jpg') : resizeFormat;
    let quality = (targetFileSize && parseInt(targetFileSize) > 0) ? Math.max(0.1, Math.min(1.0, (parseInt(targetFileSize) * 1024) / (finalWidth * finalHeight * 3))) : conversionQuality / 100;
    return await resizeImage(file, finalWidth, finalHeight, outputFormat, quality);
  };

  const handleConvert = async (overrideFile = null) => {
    // If overrideFile is an event (from button click), ignore it and use editedFile || selectedFile
    const actualFile = (overrideFile instanceof File || overrideFile instanceof Blob) ? overrideFile : null;
    const sourceFile = actualFile || editedFile || selectedFile;

    if (!sourceFile || !activeConverter) return;
    setIsConverting(true);
    setConversionProgress(0);
    setError(null);

    const from = activeConverter.from.toLowerCase();
    const to = activeConverter.to.toLowerCase();

    // Ultra-Premium 20s Progress Simulation Wrapper
    let progressInterval;
    let simulationComplete;
    const simulationPromise = new Promise(resolve => simulationComplete = resolve);

    const startSimulation = () => {
      let currentProgress = 0;
      // Faster, more dynamic simulation (approx 3-5 seconds max)
      progressInterval = setInterval(() => {
        // Increment faster: 2-5% per 100ms
        currentProgress += 1.5 + Math.random() * 3.5;
        if (currentProgress > 98) {
          clearInterval(progressInterval);
          setConversionProgress(98);
          simulationComplete();
        } else {
          setConversionProgress(Math.floor(currentProgress));
        }
      }, 80);
    };

    try {
      // Use the lowercase 'to' and 'from' already defined outer scope
      startSimulation();

      const conversionPromise = (async () => {
        if (to === 'pdf') {
          if (Array.isArray(sourceFile)) return await convertMultipleImagesToPDF(sourceFile);
          if (sourceFile.type === 'text/plain' || from === 'txt') return await convertTextToPDF(sourceFile);
          if (sourceFile.type === 'image/svg+xml' || from === 'svg') return await convertSVGToPDF(sourceFile);
          if (from === 'html') return await convertHTMLToPDF(sourceFile);
          if (from === 'heic') return await convertHEICToPDF(sourceFile);
          if (sourceFile.type?.startsWith('image/')) return await convertToPDF(sourceFile);
          if (from === 'docx' || sourceFile.name?.endsWith('.docx')) return await convertDOCXToPDF(sourceFile);
          return await convertMediaFFmpeg(sourceFile, 'pdf');
        }

        if (['jpg', 'png', 'webp', 'jfif'].includes(to) && ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'svg', 'ico', 'gif', 'jfif'].includes(from)) {
          if (from === 'gif' && to === 'png') return await convertGIFToPNG(sourceFile);
          return await convertImage(sourceFile, to === 'jpg' ? 'jpeg' : to, conversionQuality / 100);
        }

        if (to === 'svg') return await convertToSVG(sourceFile);
        if (to === 'bmp') return await convertToBMP(sourceFile);
        if (to === 'grayscale') return await applyGrayscale(sourceFile);
        if (to === 'rotate') return await rotateImage(sourceFile);
        if (to === 'flip') return await flipImage(sourceFile);
        if (to === 'mirror') return await mirrorImage(sourceFile, mirrorDirection);
        if (to === 'compress') return await compressImage(sourceFile, conversionQuality / 100);

        if (to === 'resize') return await handleResizeConversion(sourceFile);

        if (to === 'crop') return await cropImage(sourceFile);
        if (to === 'brightness') return await adjustBrightness(sourceFile, brightness, contrast);
        if (to === 'blur') return await blurImage(sourceFile);
        if (to === 'sharpen') return await sharpenImage(sourceFile, sharpenIntensity);
        if (to === 'watermark') return await addWatermark(sourceFile, { text: watermarkText, position: watermarkPosition, fontSize: watermarkFontSize, opacity: watermarkOpacity, color: watermarkColor });
        if (to === 'ico') return await convertPNGToICO(sourceFile);
        if (to === 'base64') return await imageToBase64(sourceFile);
        if (to === 'thumbnail') {
          try {
            // Try browser native extraction first (faster)
            return await extractThumbnail(sourceFile, selectedTime);
          } catch (e) {
            // Fallback to FFmpeg if browser fails (common for AVI, MKV)
            return await extractThumbnailFFmpeg(sourceFile, selectedTime);
          }
        }

        if (to === 'docx') {
          if (from === 'txt') return await convertTXTToDOCX(sourceFile);
          if (from === 'png') return await convertPNGToDOCX(sourceFile);
          if (from === 'pdf') return await convertPDFToWORD(sourceFile);
          return await convertMediaFFmpeg(sourceFile, 'docx');
        }

        if (to === 'txt' && from === 'pdf') return await convertPDFToText(sourceFile, setConversionProgress);
        if (to === 'gif') {
          if (from === 'images' && Array.isArray(sourceFile)) return await convertImagesToGIF(sourceFile);
          if (from === 'video' || sourceFile.type?.startsWith('video/')) return await convertVideoToGIF(sourceFile);
          return await convertMediaFFmpeg(sourceFile, 'gif');
        }
        if (from === 'docx' && ['jpg', 'png', 'webp'].includes(to)) return await convertDOCXToImage(sourceFile);
        if (to === 'pptx' && from === 'pdf') return await convertPDFToPPTX(sourceFile);
        if (from === 'pdf' && ['jpg', 'png', 'webp', 'jfif', 'jpeg'].includes(to)) return await convertPDFToImages(sourceFile, to, conversionQuality / 100, setConversionProgress);
        if (from === 'heic' && ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif'].includes(to)) return await convertHEIC(sourceFile, to);
        if (from === 'heic' && to === 'tiff') return await convertHEICToTIFF(sourceFile);
        if (from === 'base64' && to === 'image') {
          // Assuming sourceFile is a text file or we can get text from it
          const text = await sourceFile.text();
          return await base64ToImage(text, sourceFile.name);
        }

        // === Video & Audio Routing ===
        if (from === 'mp4' && to === 'mp3') return await convertMP4ToMP3(sourceFile);
        if (to === 'webm' && (from === 'video' || sourceFile.type?.startsWith('video/'))) return await convertVideoToWebM(sourceFile);
        if (from === 'mp3' && to === 'wav') return await convertMP3ToWAV(sourceFile);
        if (from === 'wav' && to === 'mp3') return await convertWAVToMP3(sourceFile);
        if (to === 'mp3' && (from === 'video' || sourceFile.type?.startsWith('video/'))) return await extractAudioFromVideo(sourceFile);
        if (from === 'gif' && to === 'mp4') return await convertGIFToVideo(sourceFile);

        return await convertMediaFFmpeg(sourceFile, to);
      })();

      const [conversionResult] = await Promise.all([conversionPromise, simulationPromise]);
      setConversionProgress(100);
      await new Promise(r => setTimeout(r, 600));

      // Update the selected container with the converted file
      setContainers(prevContainers =>
        prevContainers.map(container =>
          container.id === selectedContainerId
            ? { ...container, convertedFile: conversionResult }
            : container
        )
      );
      setConvertedFile(conversionResult);

      // Auto-download if triggered from editor
      if (shouldAutoDownload) {
        // Trigger download directly using the result
        const a = document.createElement('a');
        a.href = conversionResult.url;
        const ext = conversionResult.name.split('.').pop();
        let name = customFileName.trim() || conversionResult.name;
        if (customFileName.trim() && !customFileName.includes('.')) name = `${customFileName.trim()}.${ext}`;
        a.download = name;
        a.click();
        setShouldAutoDownload(false);
      }
    } catch (err) {
      console.error('Conversion error:', err);
      alert('❌ Conversion failed. Please try again.');
    } finally {
      clearInterval(progressInterval);
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    // Find the selected container
    const selectedContainer = containers.find(container => container.id === selectedContainerId);
    if (!selectedContainer || !selectedContainer.convertedFile) return;

    const fileToDownload = selectedContainer.convertedFile;
    const a = document.createElement('a');
    a.href = fileToDownload.url;
    const ext = selectedDownloadType || fileToDownload.name.split('.').pop();
    let name = customFileName.trim() || fileToDownload.name;
    if (customFileName.trim() && !customFileName.includes('.')) name = `${customFileName.trim()}.${ext}`;
    a.download = name;
    a.click();

    // Reset the selected download type after download
    setSelectedDownloadType(null);
  };

  const addContainer = () => {
    const newId = Math.max(...containers.map(c => c.id)) + 1;
    const newContainer = {
      id: newId,
      selected: false,
      convertedFile: null
    };
    setContainers([...containers, newContainer]);
    // Optionally select the new container
    setSelectedContainerId(newId);
  };

  // If auth is loading, show a simple loading state
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #8b5cf6 0%, #06b6d4 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40,
            height: 40,
            border: '3px solid rgba(255,255,255,0.3)',
            borderTopColor: 'white',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px'
          }} />
          {error && (
            <div style={{ color: 'white', background: 'rgba(255,0,0,0.3)', padding: '12px', borderRadius: '8px', maxWidth: '300px' }}>
              <p style={{ margin: 0, fontSize: '14px' }}>{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const handleLandingPageLogin = (userData, pendingTool) => {
    setUser(userData);
    if (pendingTool) {
      console.log("Auto-redirecting to tool:", pendingTool);
      const allConverters = Object.values(converters).flat();
      const foundConverter = allConverters.find(
        c => c.name.toLowerCase() === pendingTool.toLowerCase() ||
          c.name.toLowerCase().replace(/[^a-z0-9]/g, '-') === pendingTool.toLowerCase().replace(/[^a-z0-9]/g, '-')
      );
      if (foundConverter) {
        handleSetActiveConverter(foundConverter);
      }
    }
  };

  // If no user is logged in, show Landing Page
  if (!user) {
    return (
      <LandingPage
        onLoginSuccess={handleLandingPageLogin}
      />
    );
  }

  // User is logged in, show main app
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50'} flex flex-col transition-all duration-500`}>
      {!isEditing && (
        <Header
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          converters={converters}
          handleSetActiveConverter={handleSetActiveConverter}
          setSelectedFile={setSelectedFile}
          setConvertedFile={setConvertedFile}
          conversionQuality={conversionQuality}
          setConversionQuality={setConversionQuality}
          setPreviewUrl={setPreviewUrl}
          user={user}
          onLogout={async () => { await logOut(); setUser(null); }}
        />
      )}
      <main className={!isEditing ? "flex-grow max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 w-full" : "w-screen h-screen"}>
        <ConverterUI
          converters={converters}
          handleSetActiveConverter={handleSetActiveConverter}
          activeConverter={activeConverter}
          selectedFile={selectedFile}
          convertedFile={convertedFile}
          isConverting={isConverting}
          previewUrl={previewUrl}
          darkMode={darkMode}
          resizeWidth={resizeWidth}
          resizeHeight={resizeHeight}
          setResizeWidth={setResizeWidth}
          setResizeHeight={setResizeHeight}
          resizeMode={resizeMode}
          setResizeMode={setResizeMode}
          resizePercentage={resizePercentage}
          setResizePercentage={setResizePercentage}
          lockAspectRatio={lockAspectRatio}
          setLockAspectRatio={setLockAspectRatio}
          resizeFormat={resizeFormat}
          setResizeFormat={setResizeFormat}
          targetFileSize={targetFileSize}
          setTargetFileSize={setTargetFileSize}
          socialMediaPreset={socialMediaPreset}
          setSocialMediaPreset={setSocialMediaPreset}
          originalDimensions={originalDimensions}
          setOriginalDimensions={setOriginalDimensions}
          handleResizeWidthChange={handleResizeWidthChange}
          handleResizeHeightChange={handleResizeHeightChange}
          fileInputRef={fileInputRef}
          handleFileSelect={handleFileSelect}
          handleImageEdit={handleImageEdit}
          editedFile={editedFile}
          setEditedFile={setEditedFile}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          isViewOnly={isViewOnly}
          initialDesignId={designId}
          handleDragEnter={handleDragEnter}
          handleDragLeave={handleDragLeave}
          handleDragOver={handleDragOver}
          handleDrop={handleDrop}
          handleConvert={handleConvert}
          handleDownload={handleDownload}
          setSelectedFile={setSelectedFile}
          setPreviewUrl={setPreviewUrl}
          setConvertedFile={setConvertedFile}
          customFileName={customFileName}
          setCustomFileName={setCustomFileName}
          ffmpegLoading={ffmpegLoading}
          conversionQuality={conversionQuality}
          setConversionQuality={setConversionQuality}
          conversionProgress={conversionProgress}
          watermarkText={watermarkText}
          setWatermarkText={setWatermarkText}
          watermarkPosition={watermarkPosition}
          setWatermarkPosition={setWatermarkPosition}
          watermarkFontSize={watermarkFontSize}
          setWatermarkFontSize={setWatermarkFontSize}
          watermarkOpacity={watermarkOpacity}
          setWatermarkOpacity={setWatermarkOpacity}
          watermarkColor={watermarkColor}
          setWatermarkColor={setWatermarkColor}
          brightness={brightness}
          setBrightness={setBrightness}
          contrast={contrast}
          setContrast={setContrast}
          mirrorDirection={mirrorDirection}
          setMirrorDirection={setMirrorDirection}
          sharpenIntensity={sharpenIntensity}
          setSharpenIntensity={setSharpenIntensity}
          videoDuration={videoDuration}
          setVideoDuration={setVideoDuration}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
          generatedThumbnails={generatedThumbnails}
          setGeneratedThumbnails={setGeneratedThumbnails}
          gifTrimStart={gifTrimStart}
          setGifTrimStart={setGifTrimStart}
          gifTrimEnd={gifTrimEnd}
          setGifTrimEnd={setGifTrimEnd}
          gifWidth={gifWidth}
          setGifWidth={setGifWidth}
          gifLoopCount={gifLoopCount}
          setGifLoopCount={setGifLoopCount}
          gifPreserveTransparency={gifPreserveTransparency}
          setGifPreserveTransparency={setGifPreserveTransparency}
          gifFPS={gifFPS}
          setGifFPS={setGifFPS}
          gifCompression={gifCompression}
          setGifCompression={setGifCompression}
          gifOptimizeBackground={gifOptimizeBackground}
          setGifOptimizeBackground={setGifOptimizeBackground}
          containers={containers}
          selectedContainerId={selectedContainerId}
          setSelectedContainerId={setSelectedContainerId}
          addContainer={addContainer}
          selectedDownloadType={selectedDownloadType}
          setSelectedDownloadType={setSelectedDownloadType}
          user={user}
        />
      </main>
      {!isEditing && <Footer darkMode={darkMode} />}
    </div>
  );
};

export default App;