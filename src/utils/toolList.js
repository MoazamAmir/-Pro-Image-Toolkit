
// src/utils/toolList.js
// Note: HEIC is removed from imageFormats because we can decode HEIC (using heic2any) but cannot encode TO HEIC in browser.
// HEIC from conversions are handled separately in 'PDF & Documents' section.

export const imageFormats = [
    { ext: 'png', mime: 'image/png' },
    { ext: 'jpg', mime: 'image/jpeg' },
    { ext: 'webp', mime: 'image/webp' },
    { ext: 'bmp', mime: 'image/bmp' },
    { ext: 'ico', mime: 'image/x-icon' },
    { ext: 'jfif', mime: 'image/jfif' },
    { ext: 'gif', mime: 'image/gif' },
];

export const videoFormats = [
    { ext: 'mp4', mime: 'video/mp4' },
    { ext: 'webm', mime: 'video/webm', label: 'WebM' },
    { ext: 'avi', mime: 'video/x-msvideo' },
    { ext: 'mov', mime: 'video/quicktime' },
    { ext: 'mkv', mime: 'video/x-matroska' },
    { ext: 'wmv', mime: 'video/x-ms-wmv' },
    { ext: 'flv', mime: 'video/x-flv' },
    { ext: '3gp', mime: 'video/3gpp' },
    { ext: 'mpg', mime: 'video/mpeg' }
];

export const audioFormats = [
    { ext: 'mp3', mime: 'audio/mpeg' },
    { ext: 'wav', mime: 'audio/wav' },
    { ext: 'aac', mime: 'audio/aac' },
    { ext: 'flac', mime: 'audio/flac' },
    { ext: 'ogg', mime: 'audio/ogg' },
    { ext: 'm4a', mime: 'audio/mp4' },
    { ext: 'wma', mime: 'audio/x-ms-wma' },
    { ext: 'opus', mime: 'audio/opus' },
    { ext: 'aiff', mime: 'audio/x-aiff' },
];

export const ebookFormats = [
    { ext: 'epub', mime: 'application/epub+zip', label: 'EPUB' },
    { ext: 'mobi', mime: 'application/x-mobipocket-ebook', label: 'MOBI' },
    { ext: 'azw3', mime: 'application/vnd.amazon.mobi8-ebook', label: 'AZW3' },
    { ext: 'azw', mime: 'application/vnd.amazon.ebook', label: 'AZW' },
    { ext: 'azw4', mime: 'application/x-amz-ebook-4', label: 'AZW4' },
    { ext: 'fb2', mime: 'application/x-fictionbook+xml', label: 'FB2' },
    { ext: 'chm', mime: 'application/vnd.ms-htmlhelp', label: 'CHM' },
    { ext: 'lit', mime: 'application/x-ms-reader', label: 'LIT' },
];

export const documentFormats = [
    { ext: 'doc', mime: 'application/msword', label: 'DOC' },
    { ext: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', label: 'DOCX' },
    { ext: 'xls', mime: 'application/vnd.ms-excel', label: 'XLS' },
    { ext: 'xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', label: 'XLSX' },
    { ext: 'xlsm', mime: 'application/vnd.ms-excel.sheet.macroEnabled.12', label: 'XLSM' },
    { ext: 'ppt', mime: 'application/vnd.ms-powerpoint', label: 'PPT' },
    { ext: 'pptx', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', label: 'PPTX' },
    { ext: 'pptm', mime: 'application/vnd.ms-powerpoint.presentation.macroEnabled.12', label: 'PPTM' },
    { ext: 'odt', mime: 'application/vnd.oasis.opendocument.text', label: 'ODT' },
    { ext: 'ods', mime: 'application/vnd.oasis.opendocument.spreadsheet', label: 'ODS' },
    { ext: 'odp', mime: 'application/vnd.oasis.opendocument.presentation', label: 'ODP' },
    { ext: 'rtf', mime: 'application/rtf', label: 'RTF' },
    { ext: 'csv', mime: 'text/csv', label: 'CSV' },
    { ext: 'txt', mime: 'text/plain', label: 'TXT' },
    { ext: 'text', mime: 'text/plain', label: 'TEXT' },
    { ext: 'xml', mime: 'application/xml', label: 'XML' },
    { ext: 'pdf', mime: 'application/pdf', label: 'PDF' },
    { ext: 'ps', mime: 'application/postscript', label: 'PS' },
    { ext: 'vsdx', mime: 'application/vnd.visio', label: 'VSDX' },
    { ext: 'vsd', mime: 'application/vnd.visio', label: 'VSD' },
    { ext: 'ppsx', mime: 'application/vnd.ms-powerpoint.slideshow.macroEnabled.12', label: 'PPSX' },
    { ext: 'pps', mime: 'application/vnd.ms-powerpoint', label: 'PPS' },
    { ext: 'pages', mime: 'application/x-iwork-pages-sffpages', label: 'PAGES' },
    { ext: 'wps', mime: 'application/vnd.ms-works', label: 'WPS' },
    { ext: 'dot', mime: 'application/msword', label: 'DOT' },
    { ext: 'dotx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.template', label: 'DOTX' },
    { ext: 'hwp', mime: 'application/x-hwp', label: 'HWP' },
    { ext: 'pot', mime: 'application/vnd.ms-powerpoint', label: 'POT' },
    { ext: 'potx', mime: 'application/vnd.openxmlformats-officedocument.presentationml.template', label: 'POTX' },
    { ext: 'htm', mime: 'text/html', label: 'HTM' },
    { ext: 'html', mime: 'text/html', label: 'HTML' },
    { ext: 'pub', mime: 'application/x-mspublisher', label: 'PUB' },
    { ext: 'xps', mime: 'application/vnd.ms-xpsdocument', label: 'XPS' },
    { ext: 'eml', mime: 'message/rfc822', label: 'EML' },
    { ext: 'docm', mime: 'application/vnd.ms-word.document.macroEnabled.12', label: 'DOCM' },
    { ext: 'wps', mime: 'application/vnd.ms-works', label: 'WPS' }
];

// Helper to generate format pairs
const createConverters = (formats) => {
    const list = [];
    formats.forEach(from => {
        formats.forEach(to => {
            if (from.ext !== to.ext) {
                list.push({
                    name: `${from.label || from.ext.toUpperCase()} to ${to.label || to.ext.toUpperCase()}`,
                    from: from.ext,
                    to: to.ext,
                    accept: from.mime
                });
            }
        });
    });
    return list;
};

export const converters = {
    'Image': [
        ...createConverters(imageFormats),
        { name: 'JFIF to PNG', from: 'jfif', to: 'png', accept: 'image/jfif' },
        { name: 'JFIF to JPG', from: 'jfif', to: 'jpg', accept: 'image/jfif' },
        { name: 'JFIF to JPEG', from: 'jfif', to: 'jpg', accept: 'image/jfif' },
        { name: 'JFIF to WebP', from: 'jfif', to: 'webp', accept: 'image/jfif' },
        { name: 'JFIF to GIF', from: 'jfif', to: 'gif', accept: 'image/jfif' },
        { name: 'JFIF to BMP', from: 'jfif', to: 'bmp', accept: 'image/jfif' },
        { name: 'JFIF to TIFF', from: 'jfif', to: 'tiff', accept: 'image/jfif' },
        { name: 'Image to Base64', from: 'image', to: 'base64', accept: 'image/*' },
        { name: 'Base64 to Image', from: 'base64', to: 'image', accept: 'text/plain' },
        { name: 'Image to BMP', from: 'image', to: 'bmp', accept: 'image/*' },
    ],
    'Video & Audio': [
        ...createConverters(videoFormats),
        ...createConverters(audioFormats),
        { name: 'Video to WebM', from: 'video', to: 'webm', accept: 'video/*' },
        { name: 'MP4 to MP3', from: 'mp4', to: 'mp3', accept: 'video/mp4' },
        { name: 'AVI to MP4', from: 'avi', to: 'mp4', accept: 'video/x-msvideo' },
        { name: 'MP4 to AVI', from: 'mp4', to: 'avi', accept: 'video/mp4' },
        { name: 'MOV to MP4', from: 'mov', to: 'mp4', accept: 'video/quicktime' },
        { name: 'M4A to MP3', from: 'm4a', to: 'mp3', accept: 'audio/mp4' },
        { name: 'OGG to MP3', from: 'ogg', to: 'mp3', accept: 'audio/ogg' },
        { name: 'MP3 to WAV', from: 'mp3', to: 'wav', accept: 'audio/mpeg' },
        { name: 'WAV to MP3', from: 'wav', to: 'mp3', accept: 'audio/wav' },
        { name: 'Video to GIF', from: 'video', to: 'gif', accept: 'video/*' },
        { name: 'Extract Audio (MP3)', from: 'video', to: 'mp3', accept: 'video/*' },
        { name: 'Extract Thumbnail', from: 'video', to: 'thumbnail', accept: 'video/*' },
    ],
    'PDF & Documents': [
        // === MAIN TOOLS (Show in header dropdown) ===
        { name: 'PDF to WORD', from: 'pdf', to: 'docx', accept: 'application/pdf' },
        { name: 'PDF to JPG', from: 'pdf', to: 'jpg', accept: 'application/pdf' },
        { name: 'PDF to PNG', from: 'pdf', to: 'png', accept: 'application/pdf' },
        { name: 'PDF to TEXT', from: 'pdf', to: 'txt', accept: 'application/pdf' },
        { name: 'PDF to PPTX', from: 'pdf', to: 'pptx', accept: 'application/pdf' },
        { name: 'Image to PDF', from: 'image', to: 'pdf', accept: 'image/*', multiple: true },
        { name: 'HEIC Converter', from: 'heic', to: 'jpg', accept: 'image/heic' },
        { name: 'HTML to PDF', from: 'html', to: 'pdf', accept: 'text/html' },

        // === RELATED TOOLS (Show in related tools panel) ===
        { name: 'Multiple Images to PDF', from: 'images', to: 'pdf', accept: 'image/*', multiple: true },
        { name: 'Text to PDF', from: 'txt', to: 'pdf', accept: 'text/plain' },
        { name: 'SVG to PDF', from: 'svg', to: 'pdf', accept: 'image/svg+xml' },
        { name: 'PDF to DOCX', from: 'pdf', to: 'docx', accept: 'application/pdf' },
        { name: 'PNG to DOCX', from: 'png', to: 'docx', accept: 'image/png' },
        { name: 'TXT to DOCX', from: 'txt', to: 'docx', accept: 'text/plain' },

        // === HEIC Conversions (all functional with heic2any) ===
        { name: 'HEIC to PDF', from: 'heic', to: 'pdf', accept: 'image/heic' },
        { name: 'HEIC to JPG', from: 'heic', to: 'jpg', accept: 'image/heic' },
        { name: 'HEIC to PNG', from: 'heic', to: 'png', accept: 'image/heic' },
        { name: 'HEIC to WEBP', from: 'heic', to: 'webp', accept: 'image/heic' },
        { name: 'HEIC to BMP', from: 'heic', to: 'bmp', accept: 'image/heic' },
        { name: 'HEIC to GIF', from: 'heic', to: 'gif', accept: 'image/heic' },

        // === Image Format to PDF (all functional with jsPDF) ===
        { name: 'JPG to PDF', from: 'jpg', to: 'pdf', accept: 'image/jpeg' },
        { name: 'PNG to PDF', from: 'png', to: 'pdf', accept: 'image/png' },
        { name: 'WEBP to PDF', from: 'webp', to: 'pdf', accept: 'image/webp' },
        { name: 'BMP to PDF', from: 'bmp', to: 'pdf', accept: 'image/bmp' },
        { name: 'GIF to PDF', from: 'gif', to: 'pdf', accept: 'image/gif' },
        { name: 'JFIF to PDF', from: 'jfif', to: 'pdf', accept: 'image/jfif' },
    ],
    'GIF & Animation': [
        { name: 'GIF to Video (MP4)', from: 'gif', to: 'mp4', accept: 'image/gif' },
        { name: 'Images to GIF', from: 'images', to: 'gif', accept: 'image/*', multiple: true },
        { name: 'Video to GIF', from: 'video', to: 'gif', accept: 'video/*' },
        { name: 'GIF to PNG', from: 'gif', to: 'png', accept: 'image/gif' },
        ...imageFormats.map(fmt => ({ name: `GIF to ${fmt.ext.toUpperCase()}`, from: 'gif', to: fmt.ext, accept: 'image/gif' })),
    ],
    'Image Editing': [
        { name: 'Image Compressor', from: 'image', to: 'compress', accept: 'image/*' },
        { name: 'Image Resizer', from: 'image', to: 'resize', accept: 'image/*' },
        { name: 'Image Crop', from: 'image', to: 'crop', accept: 'image/*' },
        { name: 'Image Rotate 90°', from: 'image', to: 'rotate', accept: 'image/*' },
        { name: 'Image Flip', from: 'image', to: 'flip', accept: 'image/*' },
        { name: 'Image Mirror', from: 'image', to: 'mirror', accept: 'image/*' },
        { name: 'Grayscale Filter', from: 'image', to: 'grayscale', accept: 'image/*' },
        { name: 'Brightness/Contrast', from: 'image', to: 'brightness', accept: 'image/*' },
        { name: 'Blur Effect', from: 'image', to: 'blur', accept: 'image/*' },
        { name: 'Sharpen Effect', from: 'image', to: 'sharpen', accept: 'image/*' },
        { name: 'Add Watermark', from: 'image', to: 'watermark', accept: 'image/*' },
        { name: 'PNG to ICO', from: 'png', to: 'ico', accept: 'image/png' },
        { name: 'Video Thumbnail', from: 'video', to: 'thumbnail', accept: 'video/*' },
    ]
};
