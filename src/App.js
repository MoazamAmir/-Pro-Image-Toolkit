// src/App.js
import React, { useState, useRef, useEffect } from 'react';
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

const App = () => {
  const [activeConverter, setActiveConverter] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [convertedFile, setConvertedFile] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [resizeWidth, setResizeWidth] = useState(800);
  const [resizeHeight, setResizeHeight] = useState(600);
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

  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const ffmpegRef = useRef(new FFmpeg());

  useEffect(() => {
    if (convertedFile?.name) {
      const nameWithoutExt = convertedFile.name.replace(/\.[^/.]+$/, '');
      setCustomFileName(nameWithoutExt);
    }
  }, [convertedFile]);

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
    await ffmpeg.writeFile(`input.${ext}`, await fetchFile(file));
    await ffmpeg.exec(['-i', `input.${ext}`, '-vf', 'fps=10,scale=480:-1:flags=lanczos,palettegen', 'palette.png']);
    await ffmpeg.exec(['-i', `input.${ext}`, '-i', 'palette.png', '-filter_complex', 'fps=10,scale=480:-1:flags=lanczos[x];[x][1:v]paletteuse', 'output.gif']);
    const data = await ffmpeg.readFile('output.gif');
    const blob = new Blob([data.buffer], { type: 'image/gif' });
    await ffmpeg.deleteFile(`input.${ext}`);
    await ffmpeg.deleteFile('palette.png');
    await ffmpeg.deleteFile('output.gif');
    return { url: URL.createObjectURL(blob), name: 'converted.gif', blob, type: 'image/gif' };
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

  // === Event Handlers ===
  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (!files.length) return;
    const file = activeConverter?.multiple ? Array.from(files) : files[0];
    setSelectedFile(file);
    setConvertedFile(null);
    setPreviewUrl(null);
    if (Array.isArray(file) ? file[0] : file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreviewUrl(ev.target.result);
      reader.readAsDataURL(Array.isArray(file) ? file[0] : file);
    } else if ((Array.isArray(file) ? file[0] : file).type.startsWith('video/') || (Array.isArray(file) ? file[0] : file).type.startsWith('audio/')) {
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
    if (Array.isArray(file) ? file[0] : file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreviewUrl(ev.target.result);
      reader.readAsDataURL(Array.isArray(file) ? file[0] : file);
    } else if ((Array.isArray(file) ? file[0] : file).type.startsWith('video/') || (Array.isArray(file) ? file[0] : file).type.startsWith('audio/')) {
      setPreviewUrl(URL.createObjectURL(Array.isArray(file) ? file[0] : file));
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
      else if (to === 'resize') result = await resizeImage(selectedFile, resizeWidth, resizeHeight);
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
        if (selectedFile.type.startsWith('video/')) result = await extractAudioFromVideo(selectedFile);
        else if (from === 'wav') result = await convertWAVToMP3(selectedFile);
        else result = await extractAudioFromVideo(selectedFile);
      }
      else if (to === 'mp4' && from === 'gif') result = await convertGIFToVideo(selectedFile);
      else if (to === 'webm') result = await convertVideoToWebM(selectedFile);
      else if (to === 'wav') result = await convertMP3ToWAV(selectedFile);
      else if (to === 'gif' && (from === 'video' || selectedFile.type.startsWith('video/'))) result = await convertVideoToGIF(selectedFile);
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

  const handleMouseEnter = () => setShowDropdown(true);
  const handleMouseLeave = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.relatedTarget)) {
      setShowDropdown(false);
    }
  };

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
    'Advanced': [
      { name: 'Image Rotate 90°', from: 'image', to: 'rotate', accept: 'image/*' },
      { name: 'Image Flip', from: 'image', to: 'flip', accept: 'image/*' },
      { name: 'Image Mirror', from: 'image', to: 'mirror', accept: 'image/*' },
      { name: 'Image Crop', from: 'image', to: 'crop', accept: 'image/*' },
      { name: 'Brightness/Contrast', from: 'image', to: 'brightness', accept: 'image/*' },
      { name: 'Blur Effect', from: 'image', to: 'blur', accept: 'image/*' },
      { name: 'Sharpen Effect', from: 'image', to: 'sharpen', accept: 'image/*' },
      { name: 'Add Watermark', from: 'image', to: 'watermark', accept: 'image/*' },
      { name: 'PNG to ICO', from: 'png', to: 'ico', accept: 'image/png' },
      { name: 'HTML to PDF', from: 'html', to: 'pdf', accept: '.html' },
      // { name: 'PDF to Images', from: 'pdf', to: 'images', accept: 'application/pdf' },
    ],
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50'} flex flex-col transition-all duration-500`}>
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        showDropdown={showDropdown}
        setShowDropdown={setShowDropdown}
        converters={converters}
        setActiveConverter={setActiveConverter}
        setSelectedFile={setSelectedFile}
        setConvertedFile={setConvertedFile}
        setPreviewUrl={setPreviewUrl}
        dropdownRef={dropdownRef}
        handleMouseEnter={handleMouseEnter}
        handleMouseLeave={handleMouseLeave}
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
        />
      </main>
      <Footer darkMode={darkMode} />
    </div>
  );
};

export default App;