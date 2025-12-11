// src/App.js
import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Upload, Image, FileText, Film, Grid3x3, X, Download, CheckCircle, Music, Settings, Zap, Moon, Sun, Edit2 } from 'lucide-react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import Header from './components/Header';
import Footer from './components/Footer';
import ConverterUI from './components/ConverterUI';
import CropImageTool from './components/CropImageTool';

// Import non-FFmpeg functions
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
} from './utils/ConverterFunctions';

// Define converters outside component to avoid dependency issues
const converters = {
  'Image': [
    { name: 'PNG to JPG', from: 'png', to: 'jpg', accept: 'image/png' },
    { name: 'JPG to PNG', from: 'jpg', to: 'png', accept: 'image/jpeg' },
    { name: 'WEBP to PNG', from: 'webp', to: 'png', accept: 'image/webp' },
    { name: 'WEBP to JPG', from: 'webp', to: 'jpg', accept: 'image/webp' },
    { name: 'PNG to WEBP', from: 'png', to: 'webp', accept: 'image/png' },
    { name: 'JPG to WEBP', from: 'jpg', to: 'webp', accept: 'image/jpeg' },
    { name: 'Image to SVG', from: 'image', to: 'svg', accept: 'image/*' },
    { name: 'PNG to SVG', from: 'png', to: 'svg', accept: 'image/png' },
    { name: 'JPG to SVG', from: 'jpg', to: 'svg', accept: 'image/jpeg' },
    { name: 'Image Resizer', from: 'image', to: 'resize', accept: 'image/*' },
    { name: 'Image to Base64', from: 'image', to: 'base64', accept: 'image/*' },
    { name: 'Image to BMP', from: 'image', to: 'bmp', accept: 'image/*' },
    { name: 'Image Compressor', from: 'image', to: 'compress', accept: 'image/*' },
    { name: 'Grayscale Filter', from: 'image', to: 'grayscale', accept: 'image/*' },
  ],
  'PDF & Documents': [
    { name: 'Image to PDF', from: 'image', to: 'pdf', accept: 'image/*' },
    { name: 'PNG to PDF', from: 'png', to: 'pdf', accept: 'image/png' },
    { name: 'JPG to PDF', from: 'jpg', to: 'pdf', accept: 'image/jpeg' },
    { name: 'Multiple Images to PDF', from: 'images', to: 'pdf', accept: 'image/*', multiple: true },
    { name: 'Text to PDF', from: 'text', to: 'pdf', accept: '.txt' },
    { name: 'SVG to PDF', from: 'svg', to: 'pdf', accept: 'image/svg+xml' },
  ],
  'Video & Audio': [
    { name: 'MP4 to MP3', from: 'mp4', to: 'mp3', accept: 'video/mp4' },
    { name: 'Video to WebM', from: 'video', to: 'webm', accept: 'video/*' },
    { name: 'MP3 to WAV', from: 'mp3', to: 'wav', accept: 'audio/mp3' },
    { name: 'WAV to MP3', from: 'wav', to: 'mp3', accept: 'audio/wav' },
    { name: 'Video Thumbnail', from: 'video', to: 'thumbnail', accept: 'video/*' },
    { name: 'Extract Audio (MP3)', from: 'video', to: 'mp3', accept: 'video/*' },
  ],
  'GIF & Animation': [
    { name: 'Video to GIF', from: 'video', to: 'gif', accept: 'video/*' },
    { name: 'Images to GIF', from: 'images', to: 'gif', accept: 'image/*', multiple: true },
    { name: 'GIF to Video (MP4)', from: 'gif', to: 'mp4', accept: 'image/gif' },
    { name: 'GIF to PNG', from: 'gif', to: 'png', accept: 'image/gif' },
  ],
  'Image Editing': [
    { name: 'Image Rotate 90°', from: 'image', to: 'rotate', accept: 'image/*' },
    { name: 'Image Flip', from: 'image', to: 'flip', accept: 'image/*' },
    { name: 'Image Mirror', from: 'image', to: 'mirror', accept: 'image/*' },
    { name: 'Image Crop', from: 'image', to: 'crop', accept: 'image/*' },
    { name: 'Brightness/Contrast', from: 'image', to: 'brightness', accept: 'image/*' },
    { name: 'Blur Effect', from: 'image', to: 'blur', accept: 'image/*' },
    { name: 'Sharpen Effect', from: 'image', to: 'sharpen', accept: 'image/*' },
    { name: 'Add Watermark', from: 'image', to: 'watermark', accept: 'image/*' },

  ],
  'File Conversion': [
    { name: 'PNG to ICO', from: 'png', to: 'ico', accept: 'image/png' },
    { name: 'HTML to PDF', from: 'html', to: 'pdf', accept: '.html' },
  ]
};

const App = () => {
  const [searchParams, setSearchParams] = useSearchParams();
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
  const [isDragging, setIsDragging] = useState(false);
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

  const fileInputRef = useRef(null);
  const ffmpegRef = useRef(new FFmpeg());

  useEffect(() => {
    if (convertedFile?.name) {
      const nameWithoutExt = convertedFile.name.replace(/\.[^/.]+$/, '');
      setCustomFileName(nameWithoutExt);
    }
  }, [convertedFile]);

  // Load converter from URL on mount
  useEffect(() => {
    const tool = searchParams.get('tool');
    if (tool && !activeConverter) {
      // Find the converter by name from all categories
      const allConverters = Object.values(converters).flat();
      const foundConverter = allConverters.find(
        item => item.name.toLowerCase().replace(/[^a-z0-9]/g, '-') === tool
      );
      if (foundConverter) {
        setActiveConverter(foundConverter);
      }
    }
  }, [searchParams]);

  // Update URL when converter changes
  const handleSetActiveConverter = (converter) => {
    setActiveConverter(converter);
    if (converter) {
      const toolSlug = converter.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      setSearchParams({ tool: toolSlug });
    } else {
      setSearchParams({});
    }
  };

  const loadFFmpeg = async () => {
    if (ffmpegLoaded || ffmpegLoading) return;
    setFfmpegLoading(true);
    try {
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      const ffmpeg = ffmpegRef.current;
      ffmpeg.on('log', ({ message }) => console.log(message));
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      setFfmpegLoaded(true);
    } catch (error) {
      console.error('FFmpeg failed to load:', error);
      alert('Failed to load converter. Please refresh.');
    } finally {
      setFfmpegLoading(false);
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

  // === Event Handlers ===
  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (!files.length) return;
    const file = activeConverter?.multiple ? Array.from(files) : files[0];
    setSelectedFile(file);
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

  const handleConvert = async () => {
    if (!selectedFile || !activeConverter) return;
    setIsConverting(true);
    try {
      let result;
      const { to, from } = activeConverter;

      if (to === 'pdf') {
        if (Array.isArray(selectedFile)) {
          result = await convertMultipleImagesToPDF(selectedFile);
        } else if (selectedFile.type === 'text/plain') {
          result = await convertTextToPDF(selectedFile);
        } else if (selectedFile.type === 'image/svg+xml') {
          result = await convertSVGToPDF(selectedFile);
        } else if (from === 'html') {
          result = await convertHTMLToPDF(selectedFile);
        } else {
          result = await convertToPDF(selectedFile);
        }
      } else if (['jpg', 'png', 'webp'].includes(to)) {
        if (from === 'gif' && to === 'png') result = await convertGIFToPNG(selectedFile);
        else result = await convertImage(selectedFile, to);
      } else if (to === 'svg') result = await convertToSVG(selectedFile);
      else if (to === 'bmp') result = await convertToBMP(selectedFile);
      else if (to === 'grayscale') result = await applyGrayscale(selectedFile);
      else if (to === 'rotate') result = await rotateImage(selectedFile);
      else if (to === 'flip') result = await flipImage(selectedFile);
      else if (to === 'mirror') result = await mirrorImage(selectedFile, mirrorDirection);
      else if (to === 'compress') result = await compressImage(selectedFile);
      else if (to === 'resize') {
        let finalWidth = resizeWidth;
        let finalHeight = resizeHeight;

        // Load image to get original dimensions
        const img = new window.Image();
        const imageLoadPromise = new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            img.onload = () => resolve();
            img.src = e.target.result;
          };
          reader.readAsDataURL(selectedFile);
        });

        await imageLoadPromise;

        // Store original dimensions
        if (!originalDimensions) {
          setOriginalDimensions({ width: img.width, height: img.height });
        }

        // Calculate dimensions based on mode
        if (resizeMode === 'byPercentage') {
          finalWidth = Math.round(img.width * (resizePercentage / 100));
          finalHeight = Math.round(img.height * (resizePercentage / 100));
        } else if (resizeMode === 'socialMedia' && socialMediaPreset) {
          const presets = {
            'instagram-post': { width: 1080, height: 1080 },
            'instagram-story': { width: 1080, height: 1920 },
            'facebook-cover': { width: 820, height: 312 },
            'twitter-post': { width: 1200, height: 675 },
            'youtube-thumbnail': { width: 1280, height: 720 },
          };
          if (presets[socialMediaPreset]) {
            finalWidth = presets[socialMediaPreset].width;
            finalHeight = presets[socialMediaPreset].height;
          }
        }

        // Determine format
        let outputFormat = resizeFormat;
        if (resizeFormat === 'original') {
          const fileType = selectedFile.type;
          if (fileType === 'image/jpeg' || fileType === 'image/jpg') outputFormat = 'jpg';
          else if (fileType === 'image/png') outputFormat = 'png';
          else if (fileType === 'image/webp') outputFormat = 'webp';
          else outputFormat = 'png';
        }

        // Calculate quality based on target file size (simplified approach)
        let quality = 0.95;
        if (targetFileSize && parseInt(targetFileSize) > 0) {
          // Estimate quality needed (this is a rough approximation)
          const targetBytes = parseInt(targetFileSize) * 1024;
          const estimatedSize = finalWidth * finalHeight * 3; // rough estimate
          quality = Math.max(0.1, Math.min(0.95, targetBytes / estimatedSize));
        }

        result = await resizeImage(selectedFile, finalWidth, finalHeight, outputFormat, quality);
      }
      else if (to === 'crop') result = await cropImage(selectedFile);
      else if (to === 'brightness') result = await adjustBrightness(selectedFile, brightness, contrast);
      else if (to === 'blur') result = await blurImage(selectedFile);
      else if (to === 'sharpen') result = await sharpenImage(selectedFile, sharpenIntensity);
      else if (to === 'watermark') {
        result = await addWatermark(selectedFile, {
          text: watermarkText,
          position: watermarkPosition,
          fontSize: watermarkFontSize,
          opacity: watermarkOpacity,
          color: watermarkColor,
        });
      }
      else if (to === 'ico') result = await convertPNGToICO(selectedFile);
      // else if (to === 'images') result = await convertPDFToImages(selectedFile);
      else if (to === 'base64') result = await imageToBase64(selectedFile);
      else if (to === 'thumbnail') {
        result = await extractThumbnail(selectedFile, selectedTime);
        setGeneratedThumbnails(prev => [...prev, result]);
        return; // Don't set convertedFile for thumbnail, handle separately
      }

      // FFmpeg paths
      else if (to === 'mp3') {
        const fileType = Array.isArray(selectedFile) ? selectedFile[0]?.type : selectedFile.type;
        if (fileType?.startsWith('video/')) result = await extractAudioFromVideo(selectedFile);
        else if (from === 'wav') result = await convertWAVToMP3(selectedFile);
        else result = await extractAudioFromVideo(selectedFile);
      }
      else if (to === 'mp4' && from === 'gif') result = await convertGIFToVideo(selectedFile);
      else if (to === 'webm') result = await convertVideoToWebM(selectedFile);
      else if (to === 'wav') result = await convertMP3ToWAV(selectedFile);
      else if (to === 'gif' && from === 'images' && Array.isArray(selectedFile)) result = await convertImagesToGIF(selectedFile);
      else if (to === 'gif' && (from === 'video' || (!Array.isArray(selectedFile) && selectedFile.type?.startsWith('video/')))) result = await convertVideoToGIF(selectedFile);
      else result = await convertImage(selectedFile, 'png');

      setConvertedFile(result);
    } catch (err) {
      console.error('Conversion error:', err);
      alert('❌ ' + err.message);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!convertedFile) return;
    const a = document.createElement('a');
    a.href = convertedFile.url;
    const ext = convertedFile.name.split('.').pop();
    let name = customFileName.trim() || convertedFile.name;
    if (customFileName.trim() && !customFileName.includes('.')) name = `${customFileName.trim()}.${ext}`;
    a.download = name;
    a.click();
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50'} flex flex-col transition-all duration-500`}>
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        converters={converters}
        handleSetActiveConverter={handleSetActiveConverter}
        setSelectedFile={setSelectedFile}
        setConvertedFile={setConvertedFile}
        setPreviewUrl={setPreviewUrl}
      />
      <main className="flex-grow max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 w-full">
        <ConverterUI
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
        />
      </main>
      <Footer darkMode={darkMode} />
    </div>
  );
};

export default App;