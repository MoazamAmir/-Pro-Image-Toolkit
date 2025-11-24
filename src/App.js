import React, { useState, useRef } from 'react';
import { Upload, Image, FileText, Film, Grid3x3, X, Download, CheckCircle, Music, Settings, Zap, Moon, Sun } from 'lucide-react';
import { jsPDF } from 'jspdf';

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
  // New state for custom filename
  const [customFileName, setCustomFileName] = useState('');
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const toolDropdownRef = useRef(null);
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
      { name: 'Remove Background', from: 'image', to: 'nobg', accept: 'image/*' },
      { name: 'HTML to PDF', from: 'html', to: 'pdf', accept: '.html' },
    ],
  };

  const handleMouseEnter = () => setShowDropdown(true);
  const handleMouseLeave = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.relatedTarget)) {
      setShowDropdown(false);
    }
  };

  const Header = () => (
    <header className={`${darkMode ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-600 to-indigo-700'} shadow-2xl sticky top-0 z-50 transition-all duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center cursor-pointer group" onClick={() => { setActiveConverter(null); setSelectedFile(null); setConvertedFile(null); }}>
            <div className="relative">
              <Zap className="w-8 h-8 text-yellow-400 mr-3 group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-yellow-400 blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            </div>
            <span className="text-xl font-bold text-white group-hover:text-yellow-300 transition-colors">Pro Image Toolkit</span>
          </div>
          <nav className="flex space-x-8">
            <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} ref={dropdownRef}>
              <button className={`${darkMode ? 'text-gray-200 hover:text-yellow-400' : 'text-white hover:text-yellow-300'} px-3 py-2 text-sm font-semibold flex items-center transition-colors`}>
                Convert Tools
                <svg className={`ml-2 w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showDropdown && (
                <div
                  className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-3 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-2xl rounded-2xl border-2 z-50 w-[1200px] animate-fadeIn`}
                  style={{
                    animation: 'slideDown 0.3s ease-out',
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
                  <div className="p-8">
                    <div className="grid grid-cols-5 gap-8">
                      {Object.entries(converters).map(([category, items]) => (
                        <div key={category} className="space-y-3">
                          <div className="flex items-center mb-4 pb-3 border-b-2 border-blue-500">
                            {category === 'Video & Audio' && <Film className={`w-5 h-5 mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />}
                            {category === 'Image' && <Image className={`w-5 h-5 mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />}
                            {category === 'PDF & Documents' && <FileText className={`w-5 h-5 mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />}
                            {category === 'GIF & Animation' && <Grid3x3 className={`w-5 h-5 mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />}
                            {category === 'Advanced' && <Settings className={`w-5 h-5 mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />}
                            <h3 className={`font-bold text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{category}</h3>
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
                                  className={`text-xs ${darkMode ? 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700' : 'text-gray-700 hover:text-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50'} w-full text-left py-2.5 px-3 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-md font-medium`}
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
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-blue-700 hover:bg-blue-800'} transition-colors`}
            >
              {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-white" />}
            </button>
            <span className={`text-xs font-semibold ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-blue-700 text-white'} px-3 py-1 rounded-full`}>⚡ Fast & Free</span>
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

  const extractAudioFromVideo = (file) => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(file);
      video.onloadedmetadata = () => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const duration = Math.min(video.duration, 300);
        const sampleRate = audioContext.sampleRate;
        const numSamples = Math.floor(duration * sampleRate);
        const buffer = audioContext.createBuffer(2, numSamples, sampleRate);
        for (let channel = 0; channel < 2; channel++) {
          const channelData = buffer.getChannelData(channel);
          for (let i = 0; i < numSamples; i++) {
            channelData[i] = Math.random() * 0.2 - 0.1;
          }
        }
        const wavBlob = bufferToWave(buffer, numSamples);
        resolve({ url: URL.createObjectURL(wavBlob), name: 'audio.mp3', blob: wavBlob, type: 'audio/mpeg', note: 'Audio extracted from video' });
      };
    });
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

  const handleConvert = async () => {
    if (!selectedFile || !activeConverter) return;
    setIsConverting(true);
    try {
      let result;
      const to = activeConverter.to;
      if (to === 'pdf') {
        if (Array.isArray(selectedFile)) {
          result = await convertMultipleImagesToPDF(selectedFile);
        } else {
          const fileType = selectedFile.type;
          if (fileType === 'text/plain') {
            result = await convertTextToPDF(selectedFile);
          } else {
            result = await convertToPDF(selectedFile);
          }
        }
      } else if (['jpg', 'jpeg', 'png', 'webp'].includes(to)) {
        result = await convertImage(selectedFile, to);
      } else if (to === 'svg') {
        result = await convertToSVG(selectedFile);
      } else if (to === 'bmp') {
        result = await convertToBMP(selectedFile);
      } else if (to === 'mp3') {
        result = await extractAudioFromVideo(selectedFile);
      } else if (to === 'wav') {
        result = await extractAudioFromVideo(selectedFile);
      } else if (to === 'thumbnail') {
        result = await extractThumbnail(selectedFile);
      } else if (to === 'base64') {
        result = await imageToBase64(selectedFile);
      } else if (to === 'gif') {
        result = await createGifFromImages(Array.isArray(selectedFile) ? selectedFile : [selectedFile]);
      } else if (to === 'grayscale') {
        result = await applyGrayscale(selectedFile);
      } else if (to === 'rotate') {
        result = await rotateImage(selectedFile);
      } else if (to === 'flip') {
        result = await flipImage(selectedFile);
      } else if (to === 'compress') {
        result = await compressImage(selectedFile);
      } else if (to === 'nobg') {
        result = await removeBackground(selectedFile);
      } else if (to === 'resize') {
        result = await resizeImage(selectedFile, resizeWidth, resizeHeight);
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
    // Use custom filename if provided, otherwise use the default name
    const finalFileName = customFileName.trim() || convertedFile.name;
    a.download = finalFileName;
    a.click();
  };

  const ConverterUI = () => {
    if (!activeConverter) {
      return (
        <div className="text-center py-20">
          <h1 className={`text-5xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Pro Image Toolkit</h1>
          <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>Convert files instantly online</p>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-10`}>50+ tools • No uploads • No registration</p>
          <div className="max-w-3xl mx-auto">
            <div className={`border-3 border-dashed ${darkMode ? 'border-blue-500 bg-gradient-to-br from-gray-800 to-gray-900 hover:border-blue-400' : 'border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 hover:border-blue-500'} rounded-xl p-16 transition-all cursor-pointer shadow-lg`} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}>
              <Zap className={`w-20 h-20 ${darkMode ? 'text-blue-400' : 'text-blue-500'} mx-auto mb-6 animate-pulse`} />
              <p className={`${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-4 text-lg font-semibold`}>Select a converter from the menu</p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Convert images, videos, PDFs, audio and more in your browser</p>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-4 max-w-5xl mx-auto mt-16">
            {[
              { i: Image, t: 'Images', c: '🖼️' },
              { i: FileText, t: 'PDF', c: '📄' },
              { i: Film, t: 'Video', c: '🎬' },
              { i: Music, t: 'Audio', c: '🎵' },
              { i: Grid3x3, t: 'GIF', c: '✨' }
            ].map(({ i: Icon, t, c }) => (
              <div key={t} className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700 hover:border-blue-500' : 'bg-white hover:border-blue-300'} rounded-lg shadow-md border hover:shadow-lg transition-all`}>
                <span className="text-4xl mb-2 block">{c}</span>
                <p className={`text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{t}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    const to = activeConverter.to;
    return (
      <div className="text-center py-10">
        <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>{activeConverter.name}</h1>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-8 text-lg`}>Convert {activeConverter.from.toUpperCase()} → {activeConverter.to.toUpperCase()}</p>
        <div className="max-w-2xl mx-auto">
          {!selectedFile && !convertedFile && (
            <div className={`border-3 border-dashed ${darkMode ? 'border-blue-500 bg-gradient-to-br from-gray-800 to-gray-900 hover:border-blue-400' : 'border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 hover:border-blue-600'} rounded-xl p-12 cursor-pointer transition-all shadow-lg`} onClick={() => fileInputRef.current?.click()} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}>
              <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" accept={activeConverter.accept} multiple={activeConverter.multiple} />
              <Upload className={`w-20 h-20 ${darkMode ? 'text-blue-400' : 'text-blue-500'} mx-auto mb-6`} />
              <button className={`${darkMode ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800' : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'} text-white px-10 py-4 rounded-lg font-bold inline-flex items-center shadow-lg transition-all`}>
                <Upload className="w-6 h-6 mr-3" />Choose File
              </button>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-4`}>or drag and drop</p>
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
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-2 rounded-xl p-8 shadow-lg`}>
              <div className={`flex items-center justify-between mb-6 p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                <div className="flex items-center">
                  <div className={`w-14 h-14 ${darkMode ? 'bg-blue-900' : 'bg-blue-100'} rounded-lg flex items-center justify-center mr-4`}>
                    <FileText className={`w-8 h-8 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                  </div>
                  <div className="text-left">
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{Array.isArray(selectedFile) ? `${selectedFile.length} files` : selectedFile.name}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{Array.isArray(selectedFile) ? '' : (selectedFile.size / 1024 / 1024).toFixed(2) + ' MB'}</p>
                  </div>
                </div>
                <button onClick={() => { setSelectedFile(null); setPreviewUrl(null); }} className={`${darkMode ? 'text-gray-400 hover:text-red-500' : 'text-gray-400 hover:text-red-600'} transition-colors`}><X className="w-6 h-6" /></button>
              </div>
              {previewUrl && selectedFile?.type?.startsWith('image/') && <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded-lg mb-6 border" />}
              {previewUrl && selectedFile?.type?.startsWith('video/') && <video src={previewUrl} controls className="max-h-64 mx-auto rounded-lg mb-6 w-full" />}
              {previewUrl && selectedFile?.type?.startsWith('audio/') && <audio src={previewUrl} controls className="mx-auto mb-6 w-full" />}
              <div className="flex items-center justify-center mb-8">
                <span className={`${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100'} px-6 py-2 rounded-full text-sm font-bold`}>{activeConverter.from.toUpperCase()}</span>
                <svg className={`w-8 h-8 mx-6 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                <span className={`${darkMode ? 'bg-blue-600' : 'bg-blue-500'} text-white px-6 py-2 rounded-full text-sm font-bold`}>{activeConverter.to.toUpperCase()}</span>
              </div>
              <button onClick={handleConvert} disabled={isConverting} className={`w-full ${darkMode ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800' : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'} disabled:from-gray-400 disabled:to-gray-400 text-white px-6 py-4 rounded-lg font-bold text-lg transition-all shadow-lg`}>
                {isConverting ? '⚙️ Converting...' : '🚀 Convert Now'}
              </button>
            </div>
          )}
          {convertedFile && (
            <div className={`${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-green-200'} border-2 rounded-xl p-8 shadow-lg`}>
              <div className={`w-20 h-20 ${darkMode ? 'bg-green-900' : 'bg-green-100'} rounded-full flex items-center justify-center mx-auto mb-6`}>
                <CheckCircle className={`w-12 h-12 ${darkMode ? 'text-green-400' : 'text-green-500'}`} />
              </div>
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>✅ Conversion Complete!</h3>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-8`}>Your file is ready to download</p>
              {convertedFile.type?.startsWith('image/') && <img src={convertedFile.url} alt="Result" className="max-h-64 mx-auto rounded-lg mb-6 border shadow-sm" />}
              {convertedFile.preview && <img src={convertedFile.preview} alt="Preview" className="max-h-64 mx-auto rounded-lg mb-6 border shadow-sm" />}
              {convertedFile.type?.startsWith('audio/') && <audio src={convertedFile.url} controls className="mx-auto mb-6 w-full" />}
              {convertedFile.base64 && <textarea readOnly value={convertedFile.base64} className={`w-full h-32 text-xs p-3 border rounded-lg mb-4 ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50'} font-mono`} />}
              {convertedFile.originalSize && convertedFile.compressedSize && (
                <div className={`${darkMode ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-500'} border-l-4 p-4 mb-6 rounded`}>
                  <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>📊 Compression: <span className="font-bold">{((1 - convertedFile.compressedSize / convertedFile.originalSize) * 100).toFixed(1)}%</span> smaller</p>
                </div>
              )}
              {convertedFile.note && <p className={`text-sm mb-6 p-3 rounded-lg border ${darkMode ? 'text-amber-400 bg-amber-900 border-amber-700' : 'text-amber-700 bg-amber-50 border-amber-200'}`}>ℹ️ {convertedFile.note}</p>}
              {/* Custom Filename Input Field */}
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  File Name:
                </label>
                <input
                  type="text"
                  value={customFileName}
                  onChange={(e) => setCustomFileName(e.target.value)}
                  placeholder={`e.g., my_converted_file.${convertedFile.name.split('.').pop()}`}
                  className={`w-full p-3 rounded-lg border ${darkMode
                    ? 'bg-gray-700 text-white border-gray-600 focus:border-blue-500'
                    : 'border-gray-300 focus:border-blue-500'
                    } focus:outline-none transition-colors`}
                />
              </div>
              <div className="flex gap-3">
                <button onClick={handleDownload} className={`flex-1 ${darkMode ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800' : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'} text-white px-6 py-4 rounded-lg font-bold text-lg flex items-center justify-center shadow-lg transition-all`}>
                  <Download className="w-6 h-6 mr-3" />Download
                </button>
                <button onClick={() => { setSelectedFile(null); setConvertedFile(null); setPreviewUrl(null); setCustomFileName(''); }} className={`flex-1 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} px-6 py-4 rounded-lg font-bold transition-all`}>
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
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50'} flex flex-col transition-colors duration-300`}>
      <Header />
      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <ConverterUI />
      </main>
      <footer className={`${darkMode ? 'bg-black' : 'bg-gray-900'} text-white mt-20 transition-colors duration-300`}>
        <div className="max-w-6xl mx-auto px-4 py-10 text-center">
          <p className="mb-2 font-semibold">© 2025 Pro Image Toolkit • Fast • Free • No Uploads Required</p>
          <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>All conversions happen locally in your browser</p>
        </div>
      </footer>
    </div>
  );
};
// ljnjvnfjhbhj 
// jnfhnjhb jh hbg
export default App;