import { jsPDF } from 'jspdf';

// --- Image Conversions ---
export const convertImage = (file, format) => {
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

export const resizeImage = (file, width, height) => {
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

export const convertToSVG = (file) => {
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

export const convertToBMP = (file) => {
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

export const applyGrayscale = (file) => {
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

export const rotateImage = (file) => {
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

export const flipImage = (file) => {
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

export const mirrorImage = (file, direction = 'horizontal') => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new window.Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');

                if (direction === 'horizontal') {
                    // Flip left-to-right (horizontal mirror)
                    ctx.translate(canvas.width, 0);
                    ctx.scale(-1, 1);
                } else {
                    // Flip top-to-bottom (vertical mirror)
                    ctx.translate(0, canvas.height);
                    ctx.scale(1, -1);
                }

                ctx.drawImage(img, 0, 0);
                canvas.toBlob((blob) => {
                    resolve({
                        url: URL.createObjectURL(blob),
                        name: `mirrored-${direction}.png`,
                        blob,
                        type: 'image/png',
                        note: `Mirrored ${direction === 'horizontal' ? 'left-to-right' : 'top-to-bottom'}`
                    });
                }, 'image/png');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
};

export const compressImage = (file) => {
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

export const cropImage = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new window.Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
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

export const adjustBrightness = (file, brightnessValue = 100, contrastValue = 100) => {
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

                // Convert percentage values to actual values
                // Brightness: 0-200 mapped to -128 to +128
                const brightness = (brightnessValue - 100) * 1.28;
                // Contrast: 0-200 mapped to 0 to 2
                const contrast = contrastValue / 100;

                for (let i = 0; i < data.length; i += 4) {
                    data[i] = Math.min(255, Math.max(0, ((data[i] - 128) * contrast + 128) + brightness));
                    data[i + 1] = Math.min(255, Math.max(0, ((data[i + 1] - 128) * contrast + 128) + brightness));
                    data[i + 2] = Math.min(255, Math.max(0, ((data[i + 2] - 128) * contrast + 128) + brightness));
                }
                ctx.putImageData(imageData, 0, 0);
                canvas.toBlob((blob) => {
                    const brightnessLabel = brightnessValue > 100 ? `+${brightnessValue - 100}` : brightnessValue < 100 ? `${brightnessValue - 100}` : '0';
                    const contrastLabel = contrastValue > 100 ? `+${contrastValue - 100}` : contrastValue < 100 ? `${contrastValue - 100}` : '0';
                    resolve({
                        url: URL.createObjectURL(blob),
                        name: 'adjusted.png',
                        blob,
                        type: 'image/png',
                        note: `Brightness ${brightnessLabel}%, Contrast ${contrastLabel}%`
                    });
                }, 'image/png');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
};

export const blurImage = (file) => {
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

export const sharpenImage = (file, intensity = 1) => {
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

                // Adjust sharpen kernel based on intensity (0-2)
                const centerWeight = 1 + (4 * intensity);
                const edgeWeight = -1 * intensity;
                const weights = [0, edgeWeight, 0, edgeWeight, centerWeight, edgeWeight, 0, edgeWeight, 0];

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
                        output.data[dstOff] = Math.min(255, Math.max(0, r));
                        output.data[dstOff + 1] = Math.min(255, Math.max(0, g));
                        output.data[dstOff + 2] = Math.min(255, Math.max(0, b));
                        output.data[dstOff + 3] = data[dstOff + 3];
                    }
                }
                ctx.putImageData(output, 0, 0);
                canvas.toBlob((blob) => {
                    resolve({
                        url: URL.createObjectURL(blob),
                        name: 'sharpened.png',
                        blob,
                        type: 'image/png',
                        note: `Sharpness intensity: ${intensity.toFixed(1)}`
                    });
                }, 'image/png');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
};

export const addWatermark = (file, options) => {
    const { text, position, fontSize, opacity, color } = options;
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
                ctx.font = `bold ${fontSize}px Arial`;
                const hexToRgba = (hex, alpha) => {
                    const r = parseInt(hex.slice(1, 3), 16);
                    const g = parseInt(hex.slice(3, 5), 16);
                    const b = parseInt(hex.slice(5, 7), 16);
                    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                };
                ctx.fillStyle = hexToRgba(color, opacity);
                const padding = 20;
                let x, y;
                switch (position) {
                    case 'top-left': ctx.textAlign = 'left'; ctx.textBaseline = 'top'; x = padding; y = padding; break;
                    case 'top-right': ctx.textAlign = 'right'; ctx.textBaseline = 'top'; x = img.width - padding; y = padding; break;
                    case 'bottom-left': ctx.textAlign = 'left'; ctx.textBaseline = 'bottom'; x = padding; y = img.height - padding; break;
                    case 'bottom-right': ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; x = img.width - padding; y = img.height - padding; break;
                    case 'center': ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; x = img.width / 2; y = img.height / 2; break;
                    default: ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; x = img.width - padding; y = img.height - padding;
                }
                ctx.fillText(text, x, y);
                canvas.toBlob((blob) => {
                    resolve({ url: URL.createObjectURL(blob), name: 'watermarked.png', blob, type: 'image/png' });
                }, 'image/png');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
};

export const convertToPDF = async (file) => {
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

export const convertSVGToPDF = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const svgText = e.target.result;
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
            const svgElement = svgDoc.documentElement;
            let width = parseFloat(svgElement.getAttribute('width')) || 800;
            let height = parseFloat(svgElement.getAttribute('height')) || 600;
            if (!svgElement.getAttribute('width') && svgElement.getAttribute('viewBox')) {
                const viewBox = svgElement.getAttribute('viewBox').split(' ');
                width = parseFloat(viewBox[2]);
                height = parseFloat(viewBox[3]);
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            const img = new window.Image();
            img.onload = () => {
                try {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, width, height);
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
            const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);
            img.src = url;
        };
        reader.onerror = () => reject(new Error('File read failed'));
        reader.readAsText(file);
    });
};

export const convertMultipleImagesToPDF = async (files) => {
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

export const convertTextToPDF = async (file) => {
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

export const extractThumbnail = (file) => {
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

export const imageToBase64 = (file) => {
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

export const convertGIFToPNG = (file) => {
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

export const convertPNGToICO = (file) => {
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

export const convertHTMLToPDF = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const htmlContent = e.target.result;
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlContent, 'text/html');
                const text = doc.body.textContent || doc.body.innerText || '';
                const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
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

// PDF to Images (requires pdfjs-dist in real app)
export const convertPDFToImages = async (file) => {
    return new Promise((resolve) => {
        // Placeholder: return first page as image
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 1132;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#333';
        ctx.font = '20px Arial';
        ctx.fillText('PDF Page 1 (Demo)', 50, 100);
        canvas.toBlob((blob) => {
            resolve({ url: URL.createObjectURL(blob), name: 'page-1.png', blob, type: 'image/png', note: 'Demo: First page only' });
        }, 'image/png');
    });
};