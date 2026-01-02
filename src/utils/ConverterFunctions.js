import { Document, Packer, Paragraph, ImageRun, TextRun } from 'docx';
import { jsPDF } from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import html2canvas from 'html2canvas';
import mammoth from 'mammoth';
import pptxgen from 'pptxgenjs';
import heic2any from 'heic2any';

// Set worker source to a reliable CDN that matches the version (Legacy for Webpack 5)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/legacy/build/pdf.worker.min.mjs`;

export const convertHTMLToPDF = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                // Create a temporary container to render HTML
                const container = document.createElement('div');
                container.innerHTML = e.target.result;
                container.style.position = 'absolute';
                container.style.left = '-9999px';
                container.style.top = '0';
                container.style.width = '800px'; // Set a fixed width for A4 consistency
                document.body.appendChild(container);

                // Use html2canvas to capture the rendered HTML
                const canvas = await html2canvas(container, {
                    scale: 2, // Improve quality
                    useCORS: true
                });

                document.body.removeChild(container);

                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });

                const imgProps = pdf.getImageProperties(imgData);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                const pdfBlob = pdf.output('blob');

                resolve({
                    url: URL.createObjectURL(pdfBlob),
                    name: 'converted.pdf',
                    blob: pdfBlob,
                    type: 'application/pdf',
                    note: 'Calculated layout from HTML'
                });
            } catch (error) {
                reject(new Error('HTML to PDF failed: ' + error.message));
            }
        };
        reader.onerror = () => reject(new Error('File read failed'));
        reader.readAsText(file);
    });
};

export const convertDOCXToPDF = async (file) => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const html = result.value;

        // Use the existing convertHTMLToPDF logic but from memory
        const container = document.createElement('div');
        container.innerHTML = html;
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '0';
        container.style.width = '800px';
        document.body.appendChild(container);

        const canvas = await html2canvas(container, { scale: 2, useCORS: true });
        document.body.removeChild(container);

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        const pdfBlob = pdf.output('blob');

        return {
            url: URL.createObjectURL(pdfBlob),
            name: 'converted.pdf',
            blob: pdfBlob,
            type: 'application/pdf',
            note: 'Converted from Word via HTML'
        };
    } catch (error) {
        throw new Error('Word to PDF conversion failed: ' + error.message);
    }
};

export const convertPDFToImages = async (file, format = 'png', quality = 1.0, onProgress) => {
    if (onProgress) onProgress(10);
    return new Promise(async (resolve, reject) => {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            // For now, we extract the first page. For multiple pages, we would return an array.
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 2 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport: viewport }).promise;

            const mimeType = format === 'jpg' || format === 'jpeg' ? 'image/jpeg' : 'image/png';
            const ext = format === 'jpg' || format === 'jpeg' ? 'jpg' : 'png';

            canvas.toBlob((blob) => {
                if (blob) {
                    resolve({
                        url: URL.createObjectURL(blob),
                        name: `page-1.${ext}`,
                        blob,
                        type: mimeType,
                        note: `Converted Page 1 of ${pdf.numPages}`
                    });
                } else {
                    reject(new Error('Canvas to Blob failed'));
                }
            }, mimeType, quality || 1.0);
        } catch (error) {
            reject(new Error('PDF to Image failed: ' + error.message));
        }
    });
};

export const convertPDFToText = async (file, onProgress) => {
    if (onProgress) onProgress(10);
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            if (onProgress) onProgress(Math.round(10 + (i / pdf.numPages) * 80));
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n\n';
        }

        const blob = new Blob([fullText], { type: 'text/plain' });
        return {
            url: URL.createObjectURL(blob),
            name: 'extracted-text.txt',
            blob: blob,
            type: 'text/plain',
            text: fullText
        };
    } catch (error) {
        throw new Error('PDF to Text extraction failed: ' + error.message);
    }
};

export const convertPDFToXLSX = async (file) => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let rows = [];

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            // Coordinate based extraction is complex; here we provide a CSV-like row mapping
            const lines = textContent.items.map(item => item.str);
            rows.push(lines.join(','));
        }

        const csvContent = rows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });

        return {
            url: URL.createObjectURL(blob),
            name: 'extracted-table.csv',
            blob: blob,
            type: 'text/csv',
            note: 'Text formatted as CSV'
        };
    } catch (error) {
        throw new Error('PDF to XLSX conversion failed: ' + error.message);
    }
};

export const convertPDFToWORD = async (file) => {
    try {
        const textResult = await convertPDFToText(file);
        const text = textResult.text;

        const lines = text.split('\n');
        const paragraphs = lines.map(line => new Paragraph({
            children: [new TextRun(line)],
        }));

        const doc = new Document({
            sections: [{
                properties: {},
                children: paragraphs,
            }],
        });

        const blob = await Packer.toBlob(doc);
        return {
            url: URL.createObjectURL(blob),
            name: 'converted-from-pdf.docx',
            blob: blob,
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            note: 'Text extracted from PDF'
        };
    } catch (error) {
        throw new Error('PDF to Word conversion failed: ' + error.message);
    }
};

export const convertPDFToPPTX = async (file) => {
    try {
        const textResult = await convertPDFToText(file);
        const text = textResult.text;
        const pages = text.split('\n\n');

        const pptx = new pptxgen();
        pages.forEach((pageText, index) => {
            if (pageText.trim()) {
                const slide = pptx.addSlide();
                slide.addText(`Slide ${index + 1}`, { x: 0.5, y: 0.5, fontSize: 18, color: '363636' });
                slide.addText(pageText.substring(0, 2000), { x: 0.5, y: 1.2, fontSize: 11, color: '000000', align: 'left' });
            }
        });

        const buffer = await pptx.write('arraybuffer');
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });

        return {
            url: URL.createObjectURL(blob),
            name: 'converted.pptx',
            blob: blob,
            type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            note: 'Generated from PDF text content'
        };
    } catch (error) {
        throw new Error('PDF to PPTX conversion failed: ' + error.message);
    }
};

export const convertPNGToICO = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new window.Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                // Standard favicon size
                canvas.width = 32;
                canvas.height = 32;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, 32, 32);
                canvas.toBlob((blob) => {
                    resolve({
                        url: URL.createObjectURL(blob),
                        name: 'favicon.ico',
                        blob,
                        type: 'image/x-icon',
                        note: '32x32 Favicon'
                    });
                }, 'image/vnd.microsoft.icon');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
};

// --- Image Conversions ---
export const convertImage = (file, format, quality = 1.0) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new window.Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                if (format === 'jpg' || format === 'jpeg') {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                ctx.drawImage(img, 0, 0);
                const mime = format === 'jpg' ? 'image/jpeg' : format === 'png' ? 'image/png' : `image/${format}`;
                canvas.toBlob((blob) => {
                    if (blob) resolve({ url: URL.createObjectURL(blob), name: `converted.${format}`, blob, type: mime });
                    else reject(new Error('Conversion failed'));
                }, mime, quality);
            };
            img.onerror = () => reject(new Error('Image load failed'));
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
};

export const resizeImage = (file, width, height, format = 'png', quality = 0.95) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new window.Image();
            img.onload = () => {
                const originalWidth = img.width;
                const originalHeight = img.height;

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                // Add white background for JPG
                if (format === 'jpg' || format === 'jpeg') {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }

                ctx.drawImage(img, 0, 0, width, height);

                const mimeType = format === 'jpg' || format === 'jpeg' ? 'image/jpeg' :
                    format === 'png' ? 'image/png' :
                        format === 'webp' ? 'image/webp' : 'image/png';

                const extension = format === 'jpg' || format === 'jpeg' ? 'jpg' : format;

                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve({
                            url: URL.createObjectURL(blob),
                            name: `resized.${extension}`,
                            blob,
                            type: mimeType,
                            originalWidth,
                            originalHeight,
                            newWidth: width,
                            newHeight: height,
                            originalSize: file.size,
                            newSize: blob.size
                        });
                    } else {
                        reject(new Error('Resize failed'));
                    }
                }, mimeType, quality);
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

export const compressImage = (file, quality = 0.6) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new window.Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0);
                canvas.toBlob((blob) => {
                    resolve({ url: URL.createObjectURL(blob), name: 'compressed.jpg', blob, type: 'image/jpeg', originalSize: file.size, compressedSize: blob.size });
                }, 'image/jpeg', (typeof quality === 'number' ? quality : 0.6));
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
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
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

// Old HEIC placeholder functions removed - now using heic2any-based functions at end of file

export const convertEPUBToPDF = async (file) => {
    // EPUB is a zipped collection of HTML/CSS.
    // A full EPUB to PDF converter in browser is massive.
    // We can offer a simplified version that handles text extraction or rely on FFmpeg.
    throw new Error('EPUB conversion is restricted to FFmpeg for best results. Loading...');
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

export const extractThumbnail = (file, time = 1) => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        video.currentTime = time;
        video.onloadeddata = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            canvas.toBlob((blob) => {
                resolve({
                    url: URL.createObjectURL(blob),
                    name: `thumbnail-${time.toFixed(2)}s.jpg`,
                    blob,
                    type: 'image/jpeg',
                    time: time
                });
            }, 'image/jpeg', 0.9);
        };
        video.onerror = () => reject(new Error('Failed to load video'));
    });
};

export const imageToBase64 = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target.result;
            // Create a downloadable text file with the base64 string
            const blob = new Blob([base64], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            resolve({
                url: url,
                name: 'base64.txt',
                blob: blob,
                type: 'text/plain',
                base64: base64,
                note: `Base64 string (${Math.round(base64.length / 1024)} KB)`
            });
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

export const convertPNGToDOCX = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const base64Data = e.target.result;
                const imageBuffer = await fetch(base64Data).then(res => res.arrayBuffer());
                const img = new window.Image();
                img.onload = async () => {
                    const maxWidth = 600;
                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth) {
                        const ratio = maxWidth / width;
                        width = maxWidth;
                        height = height * ratio;
                    }

                    const doc = new Document({
                        sections: [{
                            properties: {},
                            children: [
                                new Paragraph({
                                    children: [
                                        new ImageRun({
                                            data: imageBuffer,
                                            transformation: {
                                                width: width,
                                                height: height,
                                            },
                                        }),
                                    ],
                                }),
                            ],
                        }],
                    });

                    const blob = await Packer.toBlob(doc);
                    resolve({
                        url: URL.createObjectURL(blob),
                        name: 'converted.docx',
                        blob: blob,
                        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                    });
                };
                img.src = base64Data;
            } catch (error) {
                reject(new Error('PNG to DOCX conversion failed: ' + error.message));
            }
        };
        reader.onerror = () => reject(new Error('File read failed'));
        reader.readAsDataURL(file);
    });
};

export const convertTXTToDOCX = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target.result;
                // Create a document with the text content
                const doc = new Document({
                    sections: [{
                        properties: {},
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: text,
                                        font: "Times New Roman",
                                        size: 24, // 12pt
                                    }),
                                ],
                            }),
                        ],
                    }],
                });

                const blob = await Packer.toBlob(doc);
                resolve({
                    url: URL.createObjectURL(blob),
                    name: 'converted.docx',
                    blob: blob,
                    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                });
            } catch (error) {
                reject(new Error('TXT to DOCX conversion failed: ' + error.message));
            }
        };
        reader.onerror = () => reject(new Error('File read failed'));
        reader.readAsText(file);
    });
};

export const convertDOCXToImage = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const arrayBuffer = e.target.result;
                const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
                const html = result.value;

                // Create container
                const container = document.createElement('div');
                container.innerHTML = html;
                container.style.position = 'absolute';
                container.style.left = '-9999px';
                container.style.top = '0';
                container.style.width = '800px'; // A4 width approx
                container.style.backgroundColor = 'white';
                container.style.padding = '40px';
                container.style.color = 'black';
                document.body.appendChild(container);

                const canvas = await html2canvas(container, {
                    scale: 2,
                    useCORS: true
                });

                document.body.removeChild(container);

                canvas.toBlob((blob) => {
                    resolve({
                        url: URL.createObjectURL(blob),
                        name: 'converted.png',
                        blob,
                        type: 'image/png',
                        note: 'Converted from DOCX'
                    });
                }, 'image/png');

            } catch (error) {
                reject(new Error('DOCX to Image failed: ' + error.message));
            }
        };
        reader.readAsArrayBuffer(file);
    });
};

export const base64ToImage = (base64String, fileName = 'converted-image.png') => {
    return new Promise((resolve, reject) => {
        try {
            const base64Content = base64String.includes(',') ? base64String.split(',')[1] : base64String;
            const mimeMatch = base64String.match(/^data:([^;]+);base64,/);
            const mime = mimeMatch ? mimeMatch[1] : 'image/png';
            const extension = mime.split('/')[1] || 'png';
            const byteCharacters = atob(base64Content);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: mime });
            resolve({
                url: URL.createObjectURL(blob),
                name: `${fileName.split('.')[0]}.${extension}`,
                blob: blob,
                type: mime,
                preview: URL.createObjectURL(blob)
            });
        } catch (error) {
            reject(new Error('Base64 to Image failed: ' + error.message));
        }
    });
};

// --- HEIC Conversions ---
export const convertHEIC = async (file, outputFormat = 'jpeg') => {
    try {
        // Map common format names to MIME types
        const formatMap = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'bmp': 'image/bmp',
        };

        const targetMime = formatMap[outputFormat.toLowerCase()] || 'image/jpeg';
        const extension = outputFormat === 'jpg' ? 'jpeg' : outputFormat;

        // Convert HEIC to the target format using heic2any
        const convertedBlob = await heic2any({
            blob: file,
            toType: targetMime,
            quality: 0.92
        });

        // heic2any can return a single Blob or an array of Blobs (for multi-image HEIC)
        const resultBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;

        return {
            url: URL.createObjectURL(resultBlob),
            name: `converted.${extension}`,
            blob: resultBlob,
            type: targetMime,
            preview: URL.createObjectURL(resultBlob)
        };
    } catch (error) {
        throw new Error(`HEIC conversion failed: ${error.message}`);
    }
};

export const convertHEICToPDF = async (file) => {
    try {
        // First convert HEIC to JPEG
        const jpegResult = await convertHEIC(file, 'jpeg');

        // Then use the JPEG to create a PDF
        const img = new window.Image();
        return new Promise((resolve, reject) => {
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
                    pdf.addImage(jpegResult.url, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio, undefined, 'FAST');
                    const pdfBlob = pdf.output('blob');
                    resolve({
                        url: URL.createObjectURL(pdfBlob),
                        name: 'converted.pdf',
                        blob: pdfBlob,
                        type: 'application/pdf',
                        preview: jpegResult.url
                    });
                } catch (error) {
                    reject(new Error('HEIC to PDF conversion failed: ' + error.message));
                }
            };
            img.onerror = () => reject(new Error('Failed to load converted HEIC image'));
            img.src = jpegResult.url;
        });
    } catch (error) {
        throw new Error(`HEIC to PDF conversion failed: ${error.message}`);
    }
};

export const convertHEICToTIFF = async (file) => {
    try {
        // Convert HEIC to PNG first (best quality for TIFF)
        const pngResult = await convertHEIC(file, 'png');

        // Note: Browser cannot natively create TIFF, but we can provide PNG as a high-quality alternative
        // For true TIFF, we would need a specialized library or backend
        return {
            ...pngResult,
            name: 'converted.png',
            note: 'Converted to high-quality PNG (TIFF requires server-side processing)'
        };
    } catch (error) {
        throw new Error(`HEIC to TIFF conversion failed: ${error.message}`);
    }
};
