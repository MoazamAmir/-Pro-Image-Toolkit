import React, { useState, useRef, useEffect } from 'react';
import { Upload, Image, FileText, Film, Grid3x3, X, Download, CheckCircle, Music, Settings, Zap, Moon, Sun, Edit2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

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
  const [showToolDropdown, setShowToolDropdown] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [customFileName, setCustomFileName] = useState('');
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [ffmpegLoading, setFfmpegLoading] = useState(false);
  // Watermark customization states
  const [watermarkText, setWatermarkText] = useState('Pro Image Toolkit');
  const [watermarkPosition, setWatermarkPosition] = useState('bottom-right');
  const [watermarkFontSize, setWatermarkFontSize] = useState(30);
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.5);
  const [watermarkColor, setWatermarkColor] = useState('#FFFFFF');
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const toolDropdownRef = useRef(null);
  const ffmpegRef = useRef(new FFmpeg());

  // Auto-populate filename when file is converted
  useEffect(() => {
    if (convertedFile && convertedFile.name) {
      // Remove extension from the default name
      const nameWithoutExt = convertedFile.name.replace(/\.[^/.]+$/, '');
      setCustomFileName(nameWithoutExt);
    }
  }, [convertedFile]);

  // Initialize FFmpeg
  const loadFFmpeg = async () => {
    if (ffmpegLoaded || ffmpegLoading) return;
    setFfmpegLoading(true);
    try {
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      const ffmpeg = ffmpegRef.current;
      ffmpeg.on('log', ({ message }) => {
        console.log(message);
      });
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      setFfmpegLoaded(true);
    } catch (error) {
      console.error('FFmpeg failed to load:', error);
      alert('Failed to load video/audio converter. Please refresh the page.');
    } finally {
      setFfmpegLoading(false);
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
      // { name: 'Remove Background', from: 'image', to: 'nobg', accept: 'image/*' },
      { name: 'Image Crop', from: 'image', to: 'crop', accept: 'image/*' },
      { name: 'Brightness/Contrast', from: 'image', to: 'brightness', accept: 'image/*' },
      { name: 'Blur Effect', from: 'image', to: 'blur', accept: 'image/*' },
      { name: 'Sharpen Effect', from: 'image', to: 'sharpen', accept: 'image/*' },
      { name: 'Add Watermark', from: 'image', to: 'watermark', accept: 'image/*' },
      { name: 'PNG to ICO', from: 'png', to: 'ico', accept: 'image/png' },
      { name: 'HTML to PDF', from: 'html', to: 'pdf', accept: '.html' },
      { name: 'PDF to Images', from: 'pdf', to: 'images', accept: 'application/pdf' },
    ],
  };

  const handleMouseEnter = () => setShowDropdown(true);
  const handleMouseLeave = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.relatedTarget)) {
      setShowDropdown(false);
    }
  };

  const Header = () => (
    <header className={`${darkMode ? 'bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900' : 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600'} shadow-2xl sticky top-0 z-50 transition-all duration-500 backdrop-blur-sm`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center cursor-pointer group" onClick={() => { setActiveConverter(null); setSelectedFile(null); setConvertedFile(null); }}>
            <div className="relative">
              <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 mr-2 sm:mr-3 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 animate-glow" />
              <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-30 group-hover:opacity-60 transition-opacity duration-300 animate-pulse-soft"></div>
            </div>
            <span className="text-base sm:text-xl font-bold text-white group-hover:text-yellow-300 transition-all duration-300 tracking-tight">Pro Image Toolkit</span>
          </div>
          <nav className="flex space-x-2 sm:space-x-8">
            <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} ref={dropdownRef}>
              <button className={`${darkMode ? 'text-gray-200 hover:text-yellow-300' : 'text-white hover:text-yellow-200'} px-2 sm:px-4 py-2 text-xs sm:text-sm font-semibold flex items-center transition-all duration-300 rounded-lg hover:bg-white/10`}>
                <span className="hidden sm:inline">Convert Tools</span>
                <span className="sm:hidden">Tools</span>
                <svg className={`ml-1 sm:ml-2 w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {showDropdown && (
                <div
                  className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 sm:mt-3 ${darkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'} backdrop-blur-xl shadow-premium-lg rounded-xl sm:rounded-2xl border-2 z-50 w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-[1200px] max-h-[80vh] overflow-y-auto animate-slideDown`}
                  style={{
                    animation: 'slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <style>{`
                    @keyframes slideDown {
                      from {
                        opacity: 0;
                        transform: translateX(-50%) translateY(-10px);
                      }
                      to {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                      }
                    }
                  `}</style>
                  <div className="p-4 sm:p-6 md:p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 md:gap-8">
                      {Object.entries(converters).map(([category, items]) => (
                        <div key={category} className="space-y-2 sm:space-y-3">
                          <div className="flex items-center mb-3 sm:mb-4 pb-2 sm:pb-3 border-b-2 border-gradient-to-r from-purple-500 to-blue-500">
                            {category === 'Video & Audio' && <Film className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />}
                            {category === 'Image' && <Image className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />}
                            {category === 'PDF & Documents' && <FileText className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />}
                            {category === 'GIF & Animation' && <Grid3x3 className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 ${darkMode ? 'text-pink-400' : 'text-pink-600'}`} />}
                            {category === 'Advanced' && <Settings className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 ${darkMode ? 'text-violet-400' : 'text-violet-600'}`} />}
                            <h3 className={`font-bold text-xs sm:text-sm ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{category}</h3>
                          </div>
                          <ul className="space-y-2">
                            {items.map((item) => (
                              <li key={item.name}>
                                <button
                                  onClick={() => {
                                    setActiveConverter(item);
                                    setShowDropdown(false);
                                    setSelectedFile(null);
                                    setConvertedFile(null);
                                    setPreviewUrl(null);
                                  }}
                                  className={`text-xs sm:text-xs ${darkMode ? 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600' : 'text-gray-700 hover:text-purple-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50'} w-full text-left py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg font-medium hover-lift`}
                                >
                                  {item.name}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </nav>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl ${darkMode ? 'bg-gray-700/50 hover:bg-gray-600/50' : 'bg-white/20 hover:bg-white/30'} transition-all duration-300 hover:scale-110 transform backdrop-blur-sm`}
            >
              {darkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
            </button>
            <span className={`hidden sm:inline text-xs font-bold ${darkMode ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' : 'bg-white/20 text-white'} px-3 sm:px-4 py-1 sm:py-1.5 rounded-full backdrop-blur-sm`}>⚡ Fast & Free</span>
          </div>
        </div>
      </div>
    </header>
  );

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      if (activeConverter?.multiple) {
        setSelectedFile(Array.from(files));
      } else {
        setSelectedFile(files[0]);
      }
      setConvertedFile(null);
      setPreviewUrl(null);
      if (files[0].type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => setPreviewUrl(ev.target.result);
        reader.readAsDataURL(files[0]);
      } else if (files[0].type.startsWith('video/') || files[0].type.startsWith('audio/')) {
        setPreviewUrl(URL.createObjectURL(files[0]));
      }
    }
  };

  // Handle drag and drop events
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      if (activeConverter?.multiple) {
        setSelectedFile(Array.from(files));
      } else {
        setSelectedFile(files[0]);
      }
      setConvertedFile(null);
      setPreviewUrl(null);
      if (files[0].type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => setPreviewUrl(ev.target.result);
        reader.readAsDataURL(files[0]);
      } else if (files[0].type.startsWith('video/') || files[0].type.startsWith('audio/')) {
        setPreviewUrl(URL.createObjectURL(files[0]));
      }
    }
  };

  const convertImage = (file, format) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (format === 'jpg' || format === 'jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          ctx.drawImage(img, 0, 0);
          const mime = format === 'jpg' ? 'image/jpeg' : format === 'png' ? 'image/png' : `image/${format}`;
          canvas.toBlob((blob) => {
            if (blob) resolve({ url: URL.createObjectURL(blob), name: `converted.${format}`, blob, type: mime });
            else reject(new Error('Conversion failed'));
          }, mime, 0.95);
        };
        img.onerror = () => reject(new Error('Image load failed'));
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const resizeImage = (file, width, height) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) resolve({ url: URL.createObjectURL(blob), name: `resized.png`, blob, type: 'image/png' });
            else reject(new Error('Resize failed'));
          }, 'image/png', 0.95);
        };
        img.onerror = () => reject(new Error('Image load failed'));
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const convertToSVG = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${img.width}" height="${img.height}" viewBox="0 0 ${img.width} ${img.height}">
  <image width="${img.width}" height="${img.height}" xlink:href="${e.target.result}"/>
</svg>`;
          const blob = new Blob([svgContent], { type: 'image/svg+xml' });
          resolve({ url: URL.createObjectURL(blob), name: 'converted.svg', blob, type: 'image/svg+xml' });
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const convertToBMP = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            resolve({ url: URL.createObjectURL(blob), name: 'converted.bmp', blob, type: 'image/bmp' });
          }, 'image/bmp');
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const applyGrayscale = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg;
            data[i + 1] = avg;
            data[i + 2] = avg;
          }
          ctx.putImageData(imageData, 0, 0);
          canvas.toBlob((blob) => {
            resolve({ url: URL.createObjectURL(blob), name: 'grayscale.png', blob, type: 'image/png' });
          }, 'image/png');
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const rotateImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.height;
          canvas.height = img.width;
          const ctx = canvas.getContext('2d');
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate(90 * Math.PI / 180);
          ctx.drawImage(img, -img.width / 2, -img.height / 2);
          canvas.toBlob((blob) => {
            resolve({ url: URL.createObjectURL(blob), name: 'rotated.png', blob, type: 'image/png' });
          }, 'image/png');
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const flipImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            resolve({ url: URL.createObjectURL(blob), name: 'flipped.png', blob, type: 'image/png' });
          }, 'image/png');
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            resolve({ url: URL.createObjectURL(blob), name: 'compressed.jpg', blob, type: 'image/jpeg', originalSize: file.size, compressedSize: blob.size });
          }, 'image/jpeg', 0.6);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const removeBackground = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            if (brightness > 200) {
              data[i + 3] = 0;
            }
          }
          ctx.putImageData(imageData, 0, 0);
          canvas.toBlob((blob) => {
            resolve({ url: URL.createObjectURL(blob), name: 'no-background.png', blob, type: 'image/png', note: 'Background removed' });
          }, 'image/png');
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const convertToPDF = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          try {
            const imgWidth = img.width;
            const imgHeight = img.height;
            const pdf = new jsPDF({
              orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
              unit: 'px',
              format: 'a4'
            });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = (pdfHeight - imgHeight * ratio) / 2;
            pdf.addImage(e.target.result, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio, undefined, 'FAST');
            const pdfBlob = pdf.output('blob');
            resolve({ url: URL.createObjectURL(pdfBlob), name: 'converted.pdf', blob: pdfBlob, type: 'application/pdf', preview: e.target.result });
          } catch (error) {
            reject(new Error('PDF conversion failed: ' + error.message));
          }
        };
        img.onerror = () => reject(new Error('Image load failed'));
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const convertSVGToPDF = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const svgText = e.target.result;
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
        const svgElement = svgDoc.documentElement;

        // Get SVG dimensions
        let width = parseFloat(svgElement.getAttribute('width')) || 800;
        let height = parseFloat(svgElement.getAttribute('height')) || 600;

        // Handle viewBox if width/height not specified
        if (!svgElement.getAttribute('width') && svgElement.getAttribute('viewBox')) {
          const viewBox = svgElement.getAttribute('viewBox').split(' ');
          width = parseFloat(viewBox[2]);
          height = parseFloat(viewBox[3]);
        }

        // Create a canvas to render the SVG
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Create an image from the SVG
        const img = new window.Image();
        img.onload = () => {
          try {
            // Fill white background
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, width, height);

            // Create PDF
            const pdf = new jsPDF({
              orientation: width > height ? 'landscape' : 'portrait',
              unit: 'px',
              format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const ratio = Math.min(pdfWidth / width, pdfHeight / height);
            const imgX = (pdfWidth - width * ratio) / 2;
            const imgY = (pdfHeight - height * ratio) / 2;

            canvas.toBlob((blob) => {
              const imgURL = URL.createObjectURL(blob);
              const finalImg = new window.Image();
              finalImg.onload = () => {
                pdf.addImage(imgURL, 'PNG', imgX, imgY, width * ratio, height * ratio, undefined, 'FAST');
                const pdfBlob = pdf.output('blob');
                resolve({
                  url: URL.createObjectURL(pdfBlob),
                  name: 'converted.pdf',
                  blob: pdfBlob,
                  type: 'application/pdf',
                  preview: imgURL
                });
              };
              finalImg.src = imgURL;
            }, 'image/png');
          } catch (error) {
            reject(new Error('SVG to PDF conversion failed: ' + error.message));
          }
        };
        img.onerror = () => reject(new Error('SVG rendering failed'));

        // Convert SVG to data URL
        const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        img.src = url;
      };
      reader.onerror = () => reject(new Error('File read failed'));
      reader.readAsText(file);
    });
  };

  const convertMultipleImagesToPDF = async (files) => {
    return new Promise((resolve, reject) => {
      try {
        let pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
        const processImage = (index) => {
          if (index >= files.length) {
            const pdfBlob = pdf.output('blob');
            resolve({ url: URL.createObjectURL(pdfBlob), name: 'merged.pdf', blob: pdfBlob, type: 'application/pdf' });
            return;
          }
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new window.Image();
            img.onload = () => {
              if (index > 0) pdf.addPage();
              const imgWidth = img.width, imgHeight = img.height;
              const pdfWidth = pdf.internal.pageSize.getWidth();
              const pdfHeight = pdf.internal.pageSize.getHeight();
              const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
              const width = imgWidth * ratio, height = imgHeight * ratio;
              const x = (pdfWidth - width) / 2, y = (pdfHeight - height) / 2;
              pdf.addImage(e.target.result, 'JPEG', x, y, width, height, undefined, 'FAST');
              processImage(index + 1);
            };
            img.onerror = () => reject(new Error('Image load failed'));
            img.src = e.target.result;
          };
          reader.readAsDataURL(files[index]);
        };
        processImage(0);
      } catch (error) {
        reject(new Error('Multiple images to PDF failed: ' + error.message));
      }
    });
  };

  const convertTextToPDF = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
          const splitText = pdf.splitTextToSize(text, 180);
          pdf.setFontSize(12);
          pdf.text(splitText, 10, 10);
          const pdfBlob = pdf.output('blob');
          resolve({ url: URL.createObjectURL(pdfBlob), name: 'text.pdf', blob: pdfBlob, type: 'application/pdf' });
        } catch (error) {
          reject(new Error('Text to PDF failed: ' + error.message));
        }
      };
      reader.onerror = () => reject(new Error('File read failed'));
      reader.readAsText(file);
    });
  };

  const extractThumbnail = (file) => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(file);
      video.currentTime = 1;
      video.onloadeddata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          resolve({ url: URL.createObjectURL(blob), name: 'thumbnail.jpg', blob, type: 'image/jpeg' });
        }, 'image/jpeg', 0.9);
      };
    });
  };

  // Real FFmpeg-based conversions
  const convertMP4ToMP3 = async (file) => {
    await loadFFmpeg();
    const ffmpeg = ffmpegRef.current;
    const inputName = 'input.mp4';
    const outputName = 'output.mp3';

    try {
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      await ffmpeg.exec(['-i', inputName, '-vn', '-ar', '44100', '-ac', '2', '-b:a', '192k', outputName]);
      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data.buffer], { type: 'audio/mp3' });
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
      return { url: URL.createObjectURL(blob), name: 'converted.mp3', blob, type: 'audio/mp3' };
    } catch (error) {
      throw new Error('MP4 to MP3 conversion failed: ' + error.message);
    }
  };

  const convertVideoToWebM = async (file) => {
    await loadFFmpeg();
    const ffmpeg = ffmpegRef.current;
    const inputName = 'input.' + file.name.split('.').pop();
    const outputName = 'output.webm';

    try {
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      await ffmpeg.exec(['-i', inputName, '-c:v', 'libvpx', '-b:v', '1M', '-c:a', 'libvorbis', outputName]);
      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data.buffer], { type: 'video/webm' });
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
      return { url: URL.createObjectURL(blob), name: 'converted.webm', blob, type: 'video/webm' };
    } catch (error) {
      throw new Error('Video to WebM conversion failed: ' + error.message);
    }
  };

  const convertMP3ToWAV = async (file) => {
    await loadFFmpeg();
    const ffmpeg = ffmpegRef.current;
    const inputName = 'input.mp3';
    const outputName = 'output.wav';

    try {
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      await ffmpeg.exec(['-i', inputName, '-acodec', 'pcm_s16le', '-ar', '44100', outputName]);
      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data.buffer], { type: 'audio/wav' });
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
      return { url: URL.createObjectURL(blob), name: 'converted.wav', blob, type: 'audio/wav' };
    } catch (error) {
      throw new Error('MP3 to WAV conversion failed: ' + error.message);
    }
  };

  const convertWAVToMP3 = async (file) => {
    await loadFFmpeg();
    const ffmpeg = ffmpegRef.current;
    const inputName = 'input.wav';
    const outputName = 'output.mp3';

    try {
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      await ffmpeg.exec(['-i', inputName, '-vn', '-ar', '44100', '-ac', '2', '-b:a', '192k', outputName]);
      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data.buffer], { type: 'audio/mp3' });
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
      return { url: URL.createObjectURL(blob), name: 'converted.mp3', blob, type: 'audio/mp3' };
    } catch (error) {
      throw new Error('WAV to MP3 conversion failed: ' + error.message);
    }
  };

  const extractAudioFromVideo = async (file) => {
    await loadFFmpeg();
    const ffmpeg = ffmpegRef.current;
    const inputName = 'input.' + file.name.split('.').pop();
    const outputName = 'output.mp3';

    try {
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      await ffmpeg.exec(['-i', inputName, '-vn', '-ar', '44100', '-ac', '2', '-b:a', '192k', outputName]);
      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data.buffer], { type: 'audio/mp3' });
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
      return { url: URL.createObjectURL(blob), name: 'audio.mp3', blob, type: 'audio/mp3' };
    } catch (error) {
      throw new Error('Audio extraction failed: ' + error.message);
    }
  };

  const bufferToWave = (buffer, len) => {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * bitsPerSample / 8;
    const blockAlign = numChannels * bitsPerSample / 8;
    const dataSize = len * numChannels * bitsPerSample / 8;
    const bufferSize = 44 + dataSize;
    const view = new DataView(new ArrayBuffer(bufferSize));
    const writeString = (o, s) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      let offset = 44 + channel * bitsPerSample / 8;
      for (let i = 0; i < len; i++) {
        const sample = Math.max(-1, Math.min(1, channelData[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += blockAlign;
      }
    }
    return new Blob([view], { type: 'audio/wav' });
  };

  const createGifFromImages = async (files) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 320;
      canvas.height = 240;
      let frameIndex = 0;
      const processFrame = () => {
        if (frameIndex >= files.length) {
          canvas.toBlob((blob) => {
            resolve({
              url: URL.createObjectURL(blob),
              name: 'animation.gif',
              blob,
              type: 'image/gif',
              note: 'GIF created from first image. Use a GIF library for full animation.'
            });
          }, 'image/png');
          return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new window.Image();
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            frameIndex++;
            setTimeout(processFrame, 100);
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(files[frameIndex]);
      };
      processFrame();
    });
  };

  const imageToBase64 = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        const blob = new Blob([base64], { type: 'text/plain' });
        resolve({ url: URL.createObjectURL(blob), name: 'base64.txt', blob, type: 'text/plain', base64 });
      };
      reader.readAsDataURL(file);
    });
  };

  // GIF & Animation Tools
  const convertVideoToGIF = async (file) => {
    await loadFFmpeg();
    const ffmpeg = ffmpegRef.current;
    const inputName = 'input.' + file.name.split('.').pop();
    const outputName = 'output.gif';

    try {
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      // Generate palette for better quality
      await ffmpeg.exec(['-i', inputName, '-vf', 'fps=10,scale=480:-1:flags=lanczos,palettegen', 'palette.png']);
      // Convert to GIF using palette
      await ffmpeg.exec(['-i', inputName, '-i', 'palette.png', '-filter_complex', 'fps=10,scale=480:-1:flags=lanczos[x];[x][1:v]paletteuse', outputName]);
      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data.buffer], { type: 'image/gif' });
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile('palette.png');
      await ffmpeg.deleteFile(outputName);
      return { url: URL.createObjectURL(blob), name: 'converted.gif', blob, type: 'image/gif' };
    } catch (error) {
      throw new Error('Video to GIF conversion failed: ' + error.message);
    }
  };

  const convertImagesToGIF = async (files) => {
    return new Promise((resolve, reject) => {
      try {
        // Dynamically import gif.js worker
        const GIF = window.GIF || require('gif.js');
        const gif = new GIF({
          workers: 2,
          quality: 10,
          width: 480,
          height: 360,
          workerScript: '/node_modules/gif.js/dist/gif.worker.js'
        });

        let processedCount = 0;
        files.forEach((file, index) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new window.Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = 480;
              canvas.height = 360;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, 480, 360);
              gif.addFrame(canvas, { delay: 500 }); // 500ms delay between frames
              processedCount++;
              if (processedCount === files.length) {
                gif.on('finished', (blob) => {
                  resolve({ url: URL.createObjectURL(blob), name: 'animation.gif', blob, type: 'image/gif' });
                });
                gif.render();
              }
            };
            img.src = e.target.result;
          };
          reader.readAsDataURL(file);
        });
      } catch (error) {
        reject(new Error('Images to GIF conversion failed: ' + error.message));
      }
    });
  };

  const convertGIFToVideo = async (file) => {
    await loadFFmpeg();
    const ffmpeg = ffmpegRef.current;
    const inputName = 'input.gif';
    const outputName = 'output.mp4';

    try {
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      await ffmpeg.exec(['-i', inputName, '-movflags', 'faststart', '-pix_fmt', 'yuv420p', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', outputName]);
      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data.buffer], { type: 'video/mp4' });
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
      return { url: URL.createObjectURL(blob), name: 'converted.mp4', blob, type: 'video/mp4' };
    } catch (error) {
      throw new Error('GIF to Video conversion failed: ' + error.message);
    }
  };

  const convertGIFToPNG = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            resolve({ url: URL.createObjectURL(blob), name: 'frame.png', blob, type: 'image/png', note: 'First frame extracted from GIF' });
          }, 'image/png');
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  // Advanced Tools
  const mirrorImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.translate(0, canvas.height);
          ctx.scale(1, -1);
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            resolve({ url: URL.createObjectURL(blob), name: 'mirrored.png', blob, type: 'image/png' });
          }, 'image/png');
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const cropImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          // Crop to center square
          const size = Math.min(img.width, img.height);
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          const x = (img.width - size) / 2;
          const y = (img.height - size) / 2;
          ctx.drawImage(img, x, y, size, size, 0, 0, size, size);
          canvas.toBlob((blob) => {
            resolve({ url: URL.createObjectURL(blob), name: 'cropped.png', blob, type: 'image/png', note: 'Cropped to center square' });
          }, 'image/png');
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const adjustBrightness = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          const brightness = 30; // Increase brightness
          const contrast = 1.2; // Increase contrast
          for (let i = 0; i < data.length; i += 4) {
            data[i] = ((data[i] - 128) * contrast + 128) + brightness;
            data[i + 1] = ((data[i + 1] - 128) * contrast + 128) + brightness;
            data[i + 2] = ((data[i + 2] - 128) * contrast + 128) + brightness;
          }
          ctx.putImageData(imageData, 0, 0);
          canvas.toBlob((blob) => {
            resolve({ url: URL.createObjectURL(blob), name: 'adjusted.png', blob, type: 'image/png', note: 'Brightness +30, Contrast +20%' });
          }, 'image/png');
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const blurImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.filter = 'blur(5px)';
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            resolve({ url: URL.createObjectURL(blob), name: 'blurred.png', blob, type: 'image/png' });
          }, 'image/png');
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const sharpenImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          const weights = [0, -1, 0, -1, 5, -1, 0, -1, 0];
          const side = Math.round(Math.sqrt(weights.length));
          const halfSide = Math.floor(side / 2);
          const w = canvas.width;
          const h = canvas.height;
          const output = ctx.createImageData(w, h);
          for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
              const dstOff = (y * w + x) * 4;
              let r = 0, g = 0, b = 0;
              for (let cy = 0; cy < side; cy++) {
                for (let cx = 0; cx < side; cx++) {
                  const scy = y + cy - halfSide;
                  const scx = x + cx - halfSide;
                  if (scy >= 0 && scy < h && scx >= 0 && scx < w) {
                    const srcOff = (scy * w + scx) * 4;
                    const wt = weights[cy * side + cx];
                    r += data[srcOff] * wt;
                    g += data[srcOff + 1] * wt;
                    b += data[srcOff + 2] * wt;
                  }
                }
              }
              output.data[dstOff] = r;
              output.data[dstOff + 1] = g;
              output.data[dstOff + 2] = b;
              output.data[dstOff + 3] = data[dstOff + 3];
            }
          }
          ctx.putImageData(output, 0, 0);
          canvas.toBlob((blob) => {
            resolve({ url: URL.createObjectURL(blob), name: 'sharpened.png', blob, type: 'image/png' });
          }, 'image/png');
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const addWatermark = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);

          // Use customizable watermark settings
          const fontSize = watermarkFontSize || Math.max(20, img.width / 20);
          ctx.font = `bold ${fontSize}px Arial`;

          // Convert hex color to rgba with opacity
          const hexToRgba = (hex, alpha) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
          };

          ctx.fillStyle = hexToRgba(watermarkColor, watermarkOpacity);

          // Set position based on user selection
          const padding = 20;
          let x, y;
          switch (watermarkPosition) {
            case 'top-left':
              ctx.textAlign = 'left';
              ctx.textBaseline = 'top';
              x = padding;
              y = padding;
              break;
            case 'top-right':
              ctx.textAlign = 'right';
              ctx.textBaseline = 'top';
              x = img.width - padding;
              y = padding;
              break;
            case 'bottom-left':
              ctx.textAlign = 'left';
              ctx.textBaseline = 'bottom';
              x = padding;
              y = img.height - padding;
              break;
            case 'bottom-right':
              ctx.textAlign = 'right';
              ctx.textBaseline = 'bottom';
              x = img.width - padding;
              y = img.height - padding;
              break;
            case 'center':
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              x = img.width / 2;
              y = img.height / 2;
              break;
            default:
              ctx.textAlign = 'right';
              ctx.textBaseline = 'bottom';
              x = img.width - padding;
              y = img.height - padding;
          }

          ctx.fillText(watermarkText || 'Pro Image Toolkit', x, y);
          canvas.toBlob((blob) => {
            resolve({ url: URL.createObjectURL(blob), name: 'watermarked.png', blob, type: 'image/png' });
          }, 'image/png');
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const convertPNGToICO = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 32;
          canvas.height = 32;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, 32, 32);
          canvas.toBlob((blob) => {
            resolve({ url: URL.createObjectURL(blob), name: 'favicon.ico', blob, type: 'image/x-icon', note: 'Resized to 32x32 for favicon' });
          }, 'image/png');
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const convertHTMLToPDF = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const htmlContent = e.target.result;
          const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

          // Parse HTML and extract text (basic implementation)
          const parser = new DOMParser();
          const doc = parser.parseFromString(htmlContent, 'text/html');
          const text = doc.body.textContent || doc.body.innerText || '';

          const splitText = pdf.splitTextToSize(text, 180);
          pdf.setFontSize(12);
          pdf.text(splitText, 10, 10);

          const pdfBlob = pdf.output('blob');
          resolve({ url: URL.createObjectURL(pdfBlob), name: 'converted.pdf', blob: pdfBlob, type: 'application/pdf', note: 'HTML text converted to PDF' });
        } catch (error) {
          reject(new Error('HTML to PDF failed: ' + error.message));
        }
      };
      reader.onerror = () => reject(new Error('File read failed'));
      reader.readAsText(file);
    });
  };

  const convertPDFToImages = async (file) => {
    return new Promise(async (resolve, reject) => {
      try {
        // This is a placeholder - full PDF parsing requires pdfjs-dist
        const pdfjsLib = window['pdfjs-dist/build/pdf'];
        pdfjsLib.GlobalWorkerOptions.workerSrc = '//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 2 });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        await page.render({ canvasContext: ctx, viewport: viewport }).promise;

        canvas.toBlob((blob) => {
          resolve({ url: URL.createObjectURL(blob), name: 'page-1.png', blob, type: 'image/png', note: 'First page extracted from PDF' });
        }, 'image/png');
      } catch (error) {
        reject(new Error('PDF to Images failed: ' + error.message));
      }
    });
  };


  const handleConvert = async () => {
    if (!selectedFile || !activeConverter) return;
    setIsConverting(true);
    try {
      let result;
      const to = activeConverter.to;
      const from = activeConverter.from;

      if (to === 'pdf') {
        if (Array.isArray(selectedFile)) {
          result = await convertMultipleImagesToPDF(selectedFile);
        } else {
          const fileType = selectedFile.type;
          if (fileType === 'text/plain') {
            result = await convertTextToPDF(selectedFile);
          } else if (fileType === 'image/svg+xml') {
            result = await convertSVGToPDF(selectedFile);
          } else if (from === 'html') {
            result = await convertHTMLToPDF(selectedFile);
          } else {
            result = await convertToPDF(selectedFile);
          }
        }
      } else if (['jpg', 'jpeg', 'png', 'webp'].includes(to)) {
        // Check if it's GIF to PNG conversion
        if (from === 'gif' && to === 'png') {
          result = await convertGIFToPNG(selectedFile);
        } else {
          result = await convertImage(selectedFile, to);
        }
      } else if (to === 'svg') {
        result = await convertToSVG(selectedFile);
      } else if (to === 'bmp') {
        result = await convertToBMP(selectedFile);
      } else if (to === 'mp3') {
        // Check if converting from video or audio
        if (selectedFile.type.startsWith('video/')) {
          result = await extractAudioFromVideo(selectedFile);
        } else if (from === 'wav') {
          result = await convertWAVToMP3(selectedFile);
        } else {
          result = await extractAudioFromVideo(selectedFile);
        }
      } else if (to === 'mp4') {
        // GIF to Video conversion
        if (from === 'gif') {
          result = await convertGIFToVideo(selectedFile);
        } else {
          result = await convertImage(selectedFile, 'png');
        }
      } else if (to === 'wav') {
        result = await convertMP3ToWAV(selectedFile);
      } else if (to === 'webm') {
        result = await convertVideoToWebM(selectedFile);
      } else if (to === 'thumbnail') {
        result = await extractThumbnail(selectedFile);
      } else if (to === 'base64') {
        result = await imageToBase64(selectedFile);
      } else if (to === 'gif') {
        // Check if it's from video or images
        if (from === 'video' || selectedFile.type.startsWith('video/')) {
          result = await convertVideoToGIF(selectedFile);
        } else if (Array.isArray(selectedFile)) {
          result = await convertImagesToGIF(selectedFile);
        } else {
          result = await createGifFromImages([selectedFile]);
        }
      } else if (to === 'grayscale') {
        result = await applyGrayscale(selectedFile);
      } else if (to === 'rotate') {
        result = await rotateImage(selectedFile);
      } else if (to === 'flip') {
        result = await flipImage(selectedFile);
      } else if (to === 'mirror') {
        result = await mirrorImage(selectedFile);
      } else if (to === 'compress') {
        result = await compressImage(selectedFile);
      } else if (to === 'nobg') {
        result = await removeBackground(selectedFile);
      } else if (to === 'resize') {
        result = await resizeImage(selectedFile, resizeWidth, resizeHeight);
      } else if (to === 'crop') {
        result = await cropImage(selectedFile);
      } else if (to === 'brightness') {
        result = await adjustBrightness(selectedFile);
      } else if (to === 'blur') {
        result = await blurImage(selectedFile);
      } else if (to === 'sharpen') {
        result = await sharpenImage(selectedFile);
      } else if (to === 'watermark') {
        result = await addWatermark(selectedFile);
      } else if (to === 'ico') {
        result = await convertPNGToICO(selectedFile);
      } else if (to === 'images') {
        // PDF to Images
        result = await convertPDFToImages(selectedFile);
      } else {
        result = await convertImage(selectedFile, 'png');
      }
      setConvertedFile(result);
    } catch (err) {
      console.error('Conversion error:', err);
      alert('❌ Conversion error: ' + err.message);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!convertedFile) return;
    const a = document.createElement('a');
    a.href = convertedFile.url;

    // Get the file extension from the converted file
    const extension = convertedFile.name.split('.').pop();

    // Use custom filename if provided, otherwise use the default name
    let finalFileName = customFileName.trim();

    if (finalFileName) {
      // Check if the custom filename already has an extension
      const hasExtension = finalFileName.includes('.');
      if (!hasExtension) {
        finalFileName = `${finalFileName}.${extension}`;
      }
    } else {
      finalFileName = convertedFile.name;
    }

    a.download = finalFileName;
    a.click();
  };

  const ConverterUI = () => {
    if (!activeConverter) {
      return (
        <div className="text-center py-10 sm:py-16 md:py-20 animate-fadeIn">
          <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2 sm:mb-3 tracking-tight px-4`}>
            Pro Image <span className="gradient-text">Toolkit</span>
          </h1>
          <p className={`text-lg sm:text-xl md:text-2xl ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2 sm:mb-3 font-medium px-4`}>Convert files instantly online</p>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-8 sm:mb-12 text-sm sm:text-base md:text-lg px-4`}>34+ tools • No uploads • No registration</p>
          <div className="max-w-3xl mx-auto px-4">
            <div className={`border-3 border-dashed ${darkMode ? 'border-purple-500/50 bg-gradient-to-br from-gray-800 via-purple-900/20 to-gray-900 hover:border-purple-400' : 'border-purple-300 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 hover:border-purple-500'} rounded-xl sm:rounded-2xl p-8 sm:p-12 md:p-16 transition-all duration-500 cursor-pointer shadow-premium hover:shadow-premium-lg hover:scale-105 transform`} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}>
              <Zap className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 ${darkMode ? 'text-purple-400' : 'text-purple-500'} mx-auto mb-4 sm:mb-6 animate-float`} />
              <p className={`${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-3 sm:mb-4 text-base sm:text-lg md:text-xl font-bold`}>Select a converter from the menu</p>
              <p className={`text-sm sm:text-base ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Convert images, videos, PDFs, audio and more in your browser</p>
            </div>
          </div>
          {/* <div className="grid grid-cols-5 gap-6 max-w-5xl mx-auto mt-20">
            {[
              { i: Image, t: 'Images', c: '🖼️', color: 'blue' },
              { i: FileText, t: 'PDF', c: '📄', color: 'indigo' },
              { i: Film, t: 'Video', c: '🎬', color: 'purple' },
              { i: Music, t: 'Audio', c: '🎵', color: 'pink' },
              { i: Grid3x3, t: 'GIF', c: '✨', color: 'violet' }
            ].map(({ i: Icon, t, c, color }) => (
              <div key={t} className={`p-8 ${darkMode ? `bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-${color}-500` : `bg-white hover:border-${color}-400`} rounded-2xl shadow-lg border-2 border-transparent hover:shadow-2xl transition-all duration-300 hover-lift cursor-pointer group`}>
                <span className="text-5xl mb-4 block group-hover:scale-110 transition-transform duration-300">{c}</span>
                <p className={`text-base font-bold ${darkMode ? 'text-gray-200' : 'text-gray-700'} group-hover:text-${color}-500 transition-colors`}>{t}</p>
              </div>
            ))}
          </div> */}
        </div>
      );
    }

    const to = activeConverter.to;
    return (
      <div className="text-center py-6 sm:py-8 md:py-10 animate-fadeIn px-4">
        <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2 sm:mb-3 tracking-tight`}>{activeConverter.name}</h1>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6 sm:mb-8 text-base sm:text-lg md:text-xl font-medium`}>Convert {activeConverter.from.toUpperCase()} → {activeConverter.to.toUpperCase()}</p>
        <div className="max-w-2xl mx-auto">
          {/* Watermark Customization Controls - Only show for watermark tool */}
          {to === 'watermark' && !selectedFile && !convertedFile && (
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-2 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-premium`}>
              <h3 className={`font-bold text-lg sm:text-xl mb-3 sm:mb-4 ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Customize Watermark
              </h3>

              {/* Watermark Text */}
              <div className="mb-4">
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Watermark Text
                </label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="Enter watermark text"
                  className={`w-full p-3 rounded-lg border-2 ${darkMode ? 'bg-gray-700 text-white border-gray-600 focus:border-purple-500' : 'border-gray-300 focus:border-purple-500'} focus:outline-none transition-all font-medium`}
                />
              </div>

              {/* Position Selector */}
              <div className="mb-4">
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Position
                </label>
                <select
                  value={watermarkPosition}
                  onChange={(e) => setWatermarkPosition(e.target.value)}
                  className={`w-full p-3 rounded-lg border-2 ${darkMode ? 'bg-gray-700 text-white border-gray-600 focus:border-purple-500' : 'border-gray-300 focus:border-purple-500'} focus:outline-none transition-all font-medium`}
                >
                  <option value="top-left">Top Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="bottom-right">Bottom Right</option>
                  <option value="center">Center</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* Font Size */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Font Size: {watermarkFontSize}px
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={watermarkFontSize}
                    onChange={(e) => setWatermarkFontSize(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Opacity */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Opacity: {Math.round(watermarkOpacity * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={watermarkOpacity}
                    onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Color Picker */}
              <div className="mb-4">
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={watermarkColor}
                    onChange={(e) => setWatermarkColor(e.target.value)}
                    className="h-12 w-20 rounded-lg cursor-pointer border-2 border-gray-300"
                  />
                  <input
                    type="text"
                    value={watermarkColor}
                    onChange={(e) => setWatermarkColor(e.target.value)}
                    className={`flex-1 p-3 rounded-lg border-2 ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'} focus:outline-none font-mono`}
                  />
                </div>
              </div>

              {/* Preview Text */}
              <div className={`${darkMode ? 'bg-gray-700/50' : 'bg-gradient-to-r from-purple-50 to-blue-50'} rounded-lg p-4 border-2 ${darkMode ? 'border-gray-600' : 'border-purple-200'}`}>
                <p className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Preview:</p>
                <div className="relative bg-gray-900 rounded-lg h-32 flex items-center justify-center overflow-hidden">
                  <span
                    style={{
                      fontSize: `${watermarkFontSize * 0.5}px`,
                      color: watermarkColor,
                      opacity: watermarkOpacity,
                      fontWeight: 'bold',
                      position: 'absolute',
                      ...(watermarkPosition === 'top-left' && { top: '10px', left: '10px' }),
                      ...(watermarkPosition === 'top-right' && { top: '10px', right: '10px' }),
                      ...(watermarkPosition === 'bottom-left' && { bottom: '10px', left: '10px' }),
                      ...(watermarkPosition === 'bottom-right' && { bottom: '10px', right: '10px' }),
                      ...(watermarkPosition === 'center' && { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' })
                    }}
                  >
                    {watermarkText || 'Your Watermark'}
                  </span>
                  <span className="text-gray-500 text-sm">Sample Image</span>
                </div>
              </div>
            </div>
          )}

          {!selectedFile && !convertedFile && (
            <div className={`border-3 border-dashed ${darkMode ? 'border-purple-500/50 bg-gradient-to-br from-gray-800 via-purple-900/20 to-gray-900 hover:border-purple-400' : 'border-purple-400 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 hover:border-purple-600'} rounded-xl sm:rounded-2xl p-8 sm:p-12 md:p-16 cursor-pointer transition-all duration-500 shadow-premium hover:shadow-premium-lg hover:scale-105 transform`} onClick={() => fileInputRef.current?.click()} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}>
              <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" accept={activeConverter.accept} multiple={activeConverter.multiple} />
              <Upload className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 ${darkMode ? 'text-purple-400' : 'text-purple-500'} mx-auto mb-4 sm:mb-6 animate-float`} />
              <button className={`${darkMode ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' : 'bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700'} text-white px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-5 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base md:text-lg inline-flex items-center shadow-premium transition-all duration-300 hover:scale-105`}>
                <Upload className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />Choose File
              </button>
              <p className={`text-sm sm:text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-4 sm:mt-5 font-medium`}>or drag and drop</p>
            </div>
          )}
          {to === 'resize' && !convertedFile && (
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl p-6 mb-6 shadow-lg border`}>
              <h3 className={`font-bold text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Image Dimensions</h3>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" value={resizeWidth} onChange={(e) => setResizeWidth(parseInt(e.target.value))} placeholder="Width" className={`${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'border'} rounded-lg p-3 font-semibold`} />
                <input type="number" value={resizeHeight} onChange={(e) => setResizeHeight(parseInt(e.target.value))} placeholder="Height" className={`${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'border'} rounded-lg p-3 font-semibold`} />
              </div>
            </div>
          )}
          {selectedFile && !convertedFile && (
            <div className={`${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-2 rounded-2xl p-8 shadow-premium animate-scaleIn`}>
              <div className={`flex items-center justify-between mb-6 p-5 ${darkMode ? 'bg-gray-700/50' : 'bg-gradient-to-r from-purple-50 to-blue-50'} rounded-xl`}>
                <div className="flex items-center">
                  <div className={`w-16 h-16 ${darkMode ? 'bg-purple-900/50' : 'bg-purple-100'} rounded-xl flex items-center justify-center mr-4 shadow-lg`}>
                    <FileText className={`w-9 h-9 ${darkMode ? 'text-purple-400' : 'text-purple-500'}`} />
                  </div>
                  <div className="text-left">
                    <p className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{Array.isArray(selectedFile) ? `${selectedFile.length} files` : selectedFile.name}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-medium`}>{Array.isArray(selectedFile) ? '' : (selectedFile.size / 1024 / 1024).toFixed(2) + ' MB'}</p>
                  </div>
                </div>
                <button onClick={() => { setSelectedFile(null); setPreviewUrl(null); }} className={`${darkMode ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'} transition-all p-2 rounded-lg`}><X className="w-6 h-6" /></button>
              </div>
              {previewUrl && selectedFile?.type?.startsWith('image/') && <img src={previewUrl} alt="Preview" className="max-h-72 mx-auto rounded-xl mb-6 border-2 shadow-lg" />}
              {previewUrl && selectedFile?.type?.startsWith('video/') && <video src={previewUrl} controls className="max-h-72 mx-auto rounded-xl mb-6 w-full shadow-lg" />}
              {previewUrl && selectedFile?.type?.startsWith('audio/') && <audio src={previewUrl} controls className="mx-auto mb-6 w-full" />}
              <div className="flex items-center justify-center mb-8">
                <span className={`${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'} px-7 py-3 rounded-full text-sm font-bold shadow-md`}>{activeConverter.from.toUpperCase()}</span>
                <svg className={`w-10 h-10 mx-7 ${darkMode ? 'text-purple-400' : 'text-purple-500'} animate-pulse-soft`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                <span className={`${darkMode ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gradient-to-r from-purple-500 to-blue-600'} text-white px-7 py-3 rounded-full text-sm font-bold shadow-lg`}>{activeConverter.to.toUpperCase()}</span>
              </div>
              <button onClick={handleConvert} disabled={isConverting || ffmpegLoading} className={`w-full ${darkMode ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' : 'bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700'} disabled:from-gray-400 disabled:to-gray-400 text-white px-4 sm:px-6 py-4 sm:py-5 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg md:text-xl transition-all duration-300 shadow-premium hover:shadow-premium-lg hover:scale-105 transform`}>
                {ffmpegLoading ? '⏳ Loading Converter...' : isConverting ? '⚙️ Converting...' : '🚀 Convert Now'}
              </button>
            </div>
          )}
          {convertedFile && (
            <div className={`${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-green-500/30' : 'bg-white border-green-200'} border-2 rounded-2xl p-10 shadow-premium-lg animate-scaleIn`}>
              <div className={`w-24 h-24 ${darkMode ? 'bg-gradient-to-br from-green-900 to-green-800' : 'bg-gradient-to-br from-green-100 to-emerald-100'} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-scaleIn`}>
                <CheckCircle className={`w-14 h-14 ${darkMode ? 'text-green-400' : 'text-green-500'} animate-pulse-soft`} />
              </div>
              <h3 className={`text-3xl font-extrabold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2 tracking-tight`}>✅ Conversion Complete!</h3>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-8 text-lg`}>Your file is ready to download</p>
              {convertedFile.type?.startsWith('image/') && <img src={convertedFile.url} alt="Result" className="max-h-80 mx-auto rounded-xl mb-6 border-2 shadow-premium" />}
              {convertedFile.preview && <img src={convertedFile.preview} alt="Preview" className="max-h-80 mx-auto rounded-xl mb-6 border-2 shadow-premium" />}
              {convertedFile.type?.startsWith('audio/') && <audio src={convertedFile.url} controls className="mx-auto mb-6 w-full" />}
              {convertedFile.base64 && <textarea readOnly value={convertedFile.base64} className={`w-full h-32 text-xs p-4 border-2 rounded-xl mb-6 ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 border-gray-200'} font-mono`} />}
              {convertedFile.originalSize && convertedFile.compressedSize && (
                <div className={`${darkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-500'} border-l-4 p-5 mb-6 rounded-lg`}>
                  <p className={`text-base ${darkMode ? 'text-gray-200' : 'text-gray-700'} font-semibold`}>📊 Compression: <span className="font-bold text-blue-500">{((1 - convertedFile.compressedSize / convertedFile.originalSize) * 100).toFixed(1)}%</span> smaller</p>
                </div>
              )}
              {convertedFile.note && <p className={`text-base mb-6 p-4 rounded-xl border-2 ${darkMode ? 'text-amber-400 bg-amber-900/30 border-amber-700' : 'text-amber-700 bg-amber-50 border-amber-200'} font-medium`}>ℹ️ {convertedFile.note}</p>}

              {/* Enhanced Custom Filename Input Field */}
              <div className={`mb-7 p-6 rounded-xl ${darkMode ? 'bg-gray-700/50 border-2 border-gray-600' : 'bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200'} shadow-lg`}>
                <div className="flex items-center mb-3">
                  <Edit2 className={`w-5 h-5 mr-2 ${darkMode ? 'text-purple-400' : 'text-purple-500'}`} />
                  <label className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Customize File Name
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={customFileName}
                    onChange={(e) => setCustomFileName(e.target.value)}
                    placeholder={`Enter filename (without extension)`}
                    className={`w-full p-4 rounded-xl border-2 ${darkMode
                      ? 'bg-gray-800 text-white border-gray-600 focus:border-purple-500 placeholder-gray-500'
                      : 'bg-white border-purple-300 focus:border-purple-500 placeholder-gray-400'
                      } focus:outline-none transition-all font-medium text-base shadow-inner`}
                  />
                  <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-base font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    .{convertedFile.name.split('.').pop()}
                  </span>
                </div>
                <p className={`text-sm mt-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-medium`}>
                  💡 File extension will be added automatically
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button onClick={handleDownload} className={`flex-1 ${darkMode ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'} text-white px-4 sm:px-6 py-4 sm:py-5 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg md:text-xl flex items-center justify-center shadow-premium transition-all duration-300 hover:scale-105 transform`}>
                  <Download className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 mr-2 sm:mr-3" />Download
                </button>
                <button onClick={() => { setSelectedFile(null); setConvertedFile(null); setPreviewUrl(null); setCustomFileName(''); }} className={`flex-1 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} px-4 sm:px-6 py-4 sm:py-5 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg md:text-xl transition-all duration-300 hover:scale-105 transform`}>
                  ↻ Convert Another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50'} flex flex-col transition-all duration-500`}>
      <Header />
      <main className="flex-grow max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 w-full">
        <ConverterUI />
      </main>
      <footer className={`${darkMode ? 'bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 border-t border-purple-500/20' : 'bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900'} text-white mt-12 sm:mt-16 md:mt-20 transition-all duration-500 shadow-2xl`}>
        <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10 md:py-12 text-center">
          <div className="mb-3 sm:mb-4">
            <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400 mx-auto mb-2 sm:mb-3 animate-glow" />
          </div>
          <p className="mb-2 font-bold text-sm sm:text-base md:text-lg px-4">© 2025 Pro Image Toolkit • Fast • Free • No Uploads Required</p>
          <p className={`text-xs sm:text-sm md:text-base ${darkMode ? 'text-gray-400' : 'text-gray-300'} px-4`}>All conversions happen locally in your browser</p>
          <div className="mt-4 sm:mt-6 flex flex-wrap justify-center gap-2 sm:gap-3 px-4">
            <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 rounded-full text-xs sm:text-sm font-medium backdrop-blur-sm">🔒 Secure</span>
            <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 rounded-full text-xs sm:text-sm font-medium backdrop-blur-sm">⚡ Instant</span>
            <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 rounded-full text-xs sm:text-sm font-medium backdrop-blur-sm">🌐 Offline</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;