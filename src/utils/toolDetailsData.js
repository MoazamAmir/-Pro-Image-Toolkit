
// src/utils/toolDetailsData.js
import React from 'react';
import { Check, Award, Shield, BookOpen, FileText, Globe, Zap } from 'lucide-react';

export const toolDetails = {
    'PNG to JPG': {
        title: 'PNG to JPG Converter',
        description: 'Convert PNG images to JPG format online for free. This tool compresses images while maintaining high visual quality, perfect for web use.',
        steps: [
            'Click the “Choose Files” button to select your PNG files',
            'Click on the “Convert to JPG” button to start the conversion',
            'When the status changes to “Done”, click the “Download JPG” button'
        ],
        benefits: [
            {
                icon: <Check className="w-8 h-8 text-green-600" />,
                title: 'Easy to Use',
                desc: 'Simply upload your PNG files and click the convert button. You can also batch convert PNG to JPG format.'
            },
            {
                icon: <Award className="w-8 h-8 text-yellow-600" />,
                title: 'Best Quality',
                desc: 'PNG to JPG is converted at the highest image quality. Perfect for professional photography.'
            },
            {
                icon: <Shield className="w-8 h-8 text-blue-600" />,
                title: 'Free & Secure',
                desc: 'Our PNG to JPG converter is free and works on any web browser. Your files are processed locally for maximum security.'
            }
        ],
        relatedTools: [
            { name: 'PNG to SVG', link: 'png-to-svg' },
            { name: 'PNG to WEBP', link: 'png-to-webp' },
            { name: 'PNG to ICO', link: 'png-to-ico' },
            { name: 'PNG to DOCX', link: 'png-to-docx' }
        ],
        color: 'from-blue-500 to-cyan-500'
    },
    'JPG to PNG': {
        title: 'JPG to PNG Converter',
        description: 'Convert JPG to PNG online. PNG format is ideal for images with transparency or those requiring lossless compression.',
        steps: [
            'Select your JPG image by clicking "Choose Files"',
            'Click "Convert to PNG" to begin',
            'Download your PNG file once the conversion is complete'
        ],
        benefits: [
            {
                icon: <Check className="w-8 h-8 text-green-600" />,
                title: 'Lossless Conversion',
                desc: 'Maintain every pixel from your original JPG file.'
            },
            {
                icon: <Award className="w-8 h-8 text-yellow-600" />,
                title: 'Supports Transparency',
                desc: 'Perfect for logos and web graphics.'
            },
            {
                icon: <Shield className="w-8 h-8 text-blue-600" />,
                title: 'Quick & Private',
                desc: 'Instant processing directly in your browser.'
            }
        ],
        relatedTools: [
            { name: 'JPG to WEBP', link: 'jpg-to-webp' },
            { name: 'JPG to PDF', link: 'jpg-to-pdf' },
            { name: 'Image to SVG', link: 'image-to-svg' }
        ],
        color: 'from-indigo-500 to-blue-500'
    },
    'WEBP to PNG': {
        title: 'WEBP to PNG Converter',
        description: 'Easily convert WEBP images to PNG format for better compatibility with older software and web browsers.',
        steps: [
            'Upload your WEBP file(s)',
            'Press the "Convert" button',
            'Save your new PNG images'
        ],
        benefits: [
            {
                icon: <Check className="w-8 h-8 text-green-600" />,
                title: 'Wide Compatibility',
                desc: 'PNG works everywhere, from old Windows versions to modern apps.'
            },
            {
                icon: <Award className="w-8 h-8 text-yellow-600" />,
                title: 'Alpha Channel',
                desc: 'Preserves transparency information from the original WEBP.'
            },
            {
                icon: <Shield className="w-8 h-8 text-blue-600" />,
                title: 'Secure',
                desc: 'No server-side storage. Your files stay on your machine.'
            }
        ],
        relatedTools: [
            { name: 'WEBP to JPG', link: 'webp-to-jpg' },
            { name: 'PNG to WEBP', link: 'png-to-webp' }
        ],
        color: 'from-emerald-500 to-teal-500'
    },
    'WEBP to JPG': {
        title: 'WEBP to JPG Converter',
        description: 'Convert modern WEBP files to the universal JPG format. Ideal for social media and legacy systems.',
        steps: [
            'Upload your WEBP image',
            'Click "Convert to JPG"',
            'Download the result'
        ],
        benefits: [
            {
                icon: <Check className="w-8 h-8 text-green-600" />,
                title: 'Easy Sharing',
                desc: 'JPG is the most widely shared image format in the world.'
            },
            {
                icon: <Award className="w-8 h-8 text-yellow-600" />,
                title: 'Optimized Size',
                desc: 'Balance quality and file size for fast loading.'
            }
        ],
        relatedTools: [
            { name: 'JPG to PNG', link: 'jpg-to-png' },
            { name: 'WEBP to PNG', link: 'webp-to-png' }
        ],
        color: 'from-orange-500 to-amber-500'
    },
    'PNG to WEBP': {
        title: 'PNG to WEBP Converter',
        description: 'Modernize your images! WebP offers superior compression and smaller file sizes than PNG for the same quality.',
        steps: [
            'Select your PNG files',
            'Click "Convert to WEBP"',
            'Download your web-optimized images'
        ],
        benefits: [
            {
                icon: <Check className="w-8 h-8 text-green-600" />,
                title: 'Web Ready',
                desc: 'WebP is the standard for modern web performance.'
            },
            {
                icon: <Award className="w-8 h-8 text-yellow-600" />,
                title: 'Smaller Files',
                desc: 'Save up to 30% storage space compared to PNG.'
            }
        ],
        relatedTools: [
            { name: 'PNG to JPG', link: 'png-to-jpg' },
            { name: 'JPG to WEBP', link: 'jpg-to-webp' }
        ],
        color: 'from-cyan-500 to-blue-600'
    },
    'JPG to WEBP': {
        title: 'JPG to WEBP Converter',
        description: 'Upgrade your JPGs to WebP for faster websites and smaller storage requirements.',
        steps: [
            'Upload JPG file',
            'Click "Convert to WEBP"',
            'Download optimized file'
        ],
        benefits: [
            {
                icon: <Check className="w-8 h-8 text-green-600" />,
                title: 'Better Compression',
                desc: 'WebP usually produces smaller files than JPG at similar quality.'
            }
        ],
        relatedTools: [
            { name: 'JPG to PNG', link: 'jpg-to-png' },
            { name: 'WEBP to JPG', link: 'webp-to-jpg' }
        ],
        color: 'from-blue-600 to-purple-600'
    },
    'Image to SVG': {
        title: 'Image to SVG Converter',
        description: 'Vectorize your raster images. SVG is perfect for logos and icons that need to be scaled without losing quality.',
        steps: [
            'Select your image (PNG, JPG, etc.)',
            'Click "Vectorize" or "Convert to SVG"',
            'Download the scalable SVG file'
        ],
        benefits: [
            {
                icon: <Check className="w-8 h-8 text-green-600" />,
                title: 'Infinite Scaling',
                desc: 'Resize your logo to any size without blurriness.'
            },
            {
                icon: <Award className="w-8 h-8 text-yellow-600" />,
                title: 'Lightweight',
                desc: 'Vector data is often smaller than high-res pixels.'
            }
        ],
        relatedTools: [
            { name: 'PNG to SVG', link: 'png-to-svg' },
            { name: 'SVG to PDF', link: 'svg-to-pdf' }
        ],
        color: 'from-yellow-500 to-orange-600'
    },
    'Image Resizer': {
        title: 'Image Resizer',
        description: 'Quickly resize your images to specific pixel dimensions or percentage scales. Perfect for social media post requirements.',
        steps: [
            'Upload your image',
            'Enter target width and height',
            'Click "Resize Image" and download'
        ],
        benefits: [
            {
                icon: <Check className="w-8 h-8 text-green-600" />,
                title: 'Preserve Ratio',
                desc: 'Optionally lock aspect ratio to avoid distortion.'
            },
            {
                icon: <Award className="w-8 h-8 text-yellow-600" />,
                title: 'Multiple Modes',
                desc: 'Resize by pixels, percentage, or social media presets.'
            }
        ],
        relatedTools: [
            { name: 'Image Crop', link: 'image-crop' },
            { name: 'Image Compressor', link: 'image-compressor' }
        ],
        color: 'from-blue-400 to-indigo-500'
    },
    'Image to Base64': {
        title: 'Image to Base64 Converter',
        description: 'Convert your image files into a Base64 string for embedding directly into HTML or CSS.',
        steps: [
            'Upload your image',
            'Wait for the string generation',
            'Copy the resulting Base64 code'
        ],
        benefits: [
            {
                icon: <Check className="w-8 h-8 text-green-600" />,
                title: 'No Extra Requests',
                desc: 'Reduce HTTP requests by embedding images in your code.'
            },
            {
                icon: <Award className="w-8 h-8 text-yellow-600" />,
                title: 'Instant Link',
                desc: 'Generate a data URI instantly.'
            }
        ],
        relatedTools: [
            { name: 'Base64 to Image', link: 'base64-to-image' }
        ],
        color: 'from-gray-700 to-gray-900'
    },
    'Image to BMP': {
        title: 'Image to BMP Converter',
        description: 'Convert images to the uncompressed Windows Bitmap (BMP) format.',
        steps: [
            'Select input file',
            'Click "Convert to BMP"',
            'Download your BMP image'
        ],
        benefits: [
            {
                icon: <Check className="w-8 h-8 text-green-600" />,
                title: 'High Compatibility',
                desc: 'BMP is supported by almost every Windows program.'
            }
        ],
        relatedTools: [
            { name: 'JPG to BMP', link: 'jpg-to-bmp' },
            { name: 'PNG to BMP', link: 'png-to-bmp' }
        ],
        color: 'from-slate-400 to-slate-600'
    },
    'Image Compressor': {
        title: 'Image Compressor',
        description: 'Significantly reduce the file size of your images without compromising visual quality. Great for improving website speed.',
        steps: [
            'Choose your image(s)',
            'Set compression quality level',
            'Download the optimized files'
        ],
        benefits: [
            {
                icon: <Check className="w-8 h-8 text-green-600" />,
                title: 'Fast Loading',
                desc: 'Small image sizes mean faster page loads for your users.'
            }
        ],
        relatedTools: [
            { name: 'Image Resizer', link: 'image-resizer' }
        ],
        color: 'from-teal-400 to-green-500'
    },
    'Grayscale Filter': {
        title: 'Grayscale Filter',
        description: 'Transform any color image into an elegant black and white masterpiece.',
        steps: [
            'Upload color image',
            'Click "Apply Filter"',
            'Download grayscale image'
        ],
        benefits: [
            {
                title: 'Instant Preview',
                desc: 'See the result immediately in your browser.'
            }
        ],
        relatedTools: [
            { name: 'Brightness/Contrast', link: 'brightness-contrast' },
            { name: 'Blur Effect', link: 'blur-effect' }
        ],
        color: 'from-gray-400 to-gray-600'
    },
    'Image to PDF': {
        title: 'Image to PDF Converter',
        description: 'Convert individual images into high-quality PDF files. Ideal for sharing photos as a single document.',
        steps: [
            'Upload your image',
            'Click “Convert to PDF”',
            'Download your file'
        ],
        benefits: [
            {
                icon: <Check className="w-8 h-8 text-green-600" />,
                title: 'High Resolution',
                desc: 'Maintains the original quality of your photos.'
            }
        ],
        relatedTools: [
            { name: 'Multiple Images to PDF', link: 'multiple-images-to-pdf' },
            { name: 'PDF to JPG', link: 'pdf-to-jpg' }
        ],
        color: 'from-rose-500 to-red-600'
    },
    'Multiple Images to PDF': {
        title: 'Multiple Images to PDF',
        description: 'Combine dozens of images into a single sorted PDF file. Perfect for scan results or digital portfolios.',
        steps: [
            'Drag and drop multiple images',
            'Reorder them if necessary',
            'Click "Combine to PDF"'
        ],
        benefits: [
            {
                icon: <Check className="w-8 h-8 text-green-600" />,
                title: 'Sortable',
                desc: 'Easily arrange the order of pages.'
            }
        ],
        relatedTools: [
            { name: 'Image to PDF', link: 'image-to-pdf' }
        ],
        color: 'from-red-600 to-pink-700'
    },
    'Text to PDF': {
        title: 'Text to PDF Converter',
        description: 'Convert simple text (.txt) files into clean, professional PDF documents.',
        steps: [
            'Upload a TXT file',
            'Choose font settings (optional)',
            'Click "Generate PDF"'
        ],
        benefits: [],
        relatedTools: [
            { name: 'HTML to PDF', link: 'html-to-pdf' }
        ],
        color: 'from-blue-600 to-indigo-700'
    },
    'SVG to PDF': {
        title: 'SVG to PDF Converter',
        description: 'Convert scalable vector graphics to PDF format for printing or standard document sharing.',
        steps: [
            'Upload SVG file',
            'Convert to PDF',
            'Download'
        ],
        benefits: [
            {
                icon: <Award className="w-8 h-8 text-yellow-600" />,
                title: 'Print Quality',
                desc: 'Vectors stay sharp in the final PDF.'
            }
        ],
        relatedTools: [
            { name: 'Image to SVG', link: 'image-to-svg' }
        ],
        color: 'from-orange-400 to-red-500'
    },
    'MP4 to MP3': {
        title: 'MP4 to MP3 Converter',
        description: 'Extract high-quality audio from your video files. Ideal for saving music from videos.',
        steps: [
            'Upload MP4 video',
            'Click "Extract Audio"',
            'Save your MP3 file'
        ],
        benefits: [
            {
                icon: <Check className="w-8 h-8 text-green-600" />,
                title: 'High Bitrate',
                desc: 'Extract audio up to 320kbps for best quality.'
            }
        ],
        relatedTools: [
            { name: 'Extract Audio (MP3)', link: 'extract-audio-mp3' },
            { name: 'WAV to MP3', link: 'wav-to-mp3' }
        ],
        color: 'from-purple-500 to-indigo-600'
    },
    'Video to WebM': {
        title: 'Video to WebM Converter',
        description: 'Convert MP4 or other videos to WebM format for superior web streaming performance and smaller file sizes.',
        steps: [
            'Select video file',
            'Convert to WebM',
            'Download'
        ],
        benefits: [
            {
                icon: <Check className="w-8 h-8 text-green-600" />,
                title: 'Modern Codec',
                desc: 'Uses VP8/VP9 for efficient compression.'
            }
        ],
        relatedTools: [
            { name: 'MP4 to AVI', link: 'mp4-to-avi' }
        ],
        color: 'from-cyan-600 to-blue-700'
    },
    'MP3 to WAV': {
        title: 'MP3 to WAV Converter',
        description: 'Convert compressed MP3 files to uncompressed WAV format for editing or higher fidelity playback.',
        steps: [
            'Upload MP3',
            'Click "To WAV"',
            'Download'
        ],
        benefits: [],
        relatedTools: [
            { name: 'WAV to MP3', link: 'wav-to-mp3' }
        ],
        color: 'from-emerald-600 to-green-700'
    },
    'WAV to MP3': {
        title: 'WAV to MP3 Converter',
        description: 'Compress large WAV files to MP3 for easy sharing and playing on all devices.',
        steps: [
            'Upload WAV',
            'Set Bitrate',
            'Convert'
        ],
        benefits: [
            {
                icon: <Check className="w-8 h-8 text-green-600" />,
                title: 'Space Saver',
                desc: 'Significantly reduce audio file size.'
            }
        ],
        relatedTools: [
            { name: 'MP3 to WAV', link: 'mp3-to-wav' }
        ],
        color: 'from-purple-600 to-pink-600'
    },
    'Video Thumbnail': {
        title: 'Video Thumbnail Extractor',
        description: 'Capture any frame from a video and save it as a high-quality JPG or PNG image.',
        steps: [
            'Select video',
            'Navigate to desired frame',
            'Click "Capture Frame"'
        ],
        benefits: [
            {
                icon: <Award className="w-8 h-8 text-yellow-600" />,
                title: 'High Resolution',
                desc: 'Captures at the video\'s native resolution.'
            }
        ],
        relatedTools: [
            { name: 'Extract Thumbnail', link: 'extract-thumbnail' }
        ],
        color: 'from-amber-500 to-orange-600'
    },
    'Extract Audio (MP3)': {
        title: 'Extract Audio (MP3)',
        description: 'Separate the audio track from any video file and save it as an MP3 instantly.',
        steps: [
            'Upload video',
            'Select "Extract Audio"',
            'Download MP3'
        ],
        benefits: [],
        relatedTools: [
            { name: 'MP4 to MP3', link: 'mp4-to-mp3' }
        ],
        color: 'from-violet-500 to-purple-600'
    },
    'Video to GIF': {
        title: 'Video to GIF Converter',
        description: 'Turn your favorite video clips into animated GIFs for memes and social sharing.',
        steps: [
            'Upload short video clip',
            'Select start/end time',
            'Click "Create GIF"'
        ],
        benefits: [
            {
                icon: <Check className="w-8 h-8 text-green-600" />,
                title: 'Easy Sharing',
                desc: 'GIFs are perfect for Discord, Reddit, and Twitter.'
            }
        ],
        relatedTools: [
            { name: 'Images to GIF', link: 'images-to-gif' },
            { name: 'GIF to Video (MP4)', link: 'gif-to-video-mp4' }
        ],
        color: 'from-pink-500 to-rose-500'
    },
    'Images to GIF': {
        title: 'Images to GIF',
        description: 'Create an animated GIF by combining a series of static images.',
        steps: [
            'Upload several images',
            'Set frame duration',
            'Generate animation'
        ],
        benefits: [],
        relatedTools: [
            { name: 'Video to GIF', link: 'video-to-gif' }
        ],
        color: 'from-fuschia-500 to-purple-600'
    },
    'GIF to Video (MP4)': {
        title: 'GIF to Video (MP4)',
        description: 'Convert silent GIFs to MP4 videos. This often results in much smaller file sizes for long animations.',
        steps: [
            'Upload GIF',
            'Click "To Video"',
            'Download MP4'
        ],
        benefits: [
            {
                icon: <Check className="w-8 h-8 text-green-600" />,
                title: 'Smaller Size',
                desc: 'MP4 is more efficient than the legacy GIF format.'
            }
        ],
        relatedTools: [
            { name: 'GIF to PNG', link: 'gif-to-png' }
        ],
        color: 'from-blue-500 to-indigo-600'
    },
    'GIF to PNG': {
        title: 'GIF to PNG Frames',
        description: 'Extract all individual frames from an animated GIF as separate PNG images.',
        steps: [
            'Select animated GIF',
            'Decompose into frames',
            'Download a ZIP of all frames or individual ones'
        ],
        benefits: [],
        relatedTools: [
            { name: 'GIF to Video (MP4)', link: 'gif-to-video-mp4' }
        ],
        color: 'from-slate-500 to-gray-700'
    },
    'Image Rotate 90°': {
        title: 'Image Rotate',
        description: 'Rotate your photos 90 degrees clockwise or counter-clockwise. Correct orientation instantly.',
        steps: [
            'Upload image',
            'Select rotation direction',
            'Download rotated image'
        ],
        benefits: [],
        relatedTools: [
            { name: 'Image Flip', link: 'image-flip' },
            { name: 'Image Mirror', link: 'image-mirror' }
        ],
        color: 'from-blue-500 to-cyan-500'
    },
    'Image Flip': {
        title: 'Image Flip',
        description: 'Flip your images vertically or horizontally with a single click.',
        steps: [
            'Select image',
            'Click Flip Vertical or Horizontal',
            'Download'
        ],
        benefits: [],
        relatedTools: [
            { name: 'Image Rotate 90°', link: 'image-rotate-90' }
        ],
        color: 'from-indigo-500 to-purple-500'
    },
    'Image Mirror': {
        title: 'Image Mirror',
        description: 'Create a mirror reflection effect for your images.',
        steps: [
            'Choose input image',
            'Apply mirror effect',
            'Save'
        ],
        benefits: [],
        relatedTools: [
            { name: 'Image Flip', link: 'image-flip' }
        ],
        color: 'from-teal-500 to-blue-500'
    },
    'Image Crop': {
        title: 'Image Crop Tool',
        description: 'Remove unwanted outer areas of an image. Perfect for focusing on a specific subject.',
        steps: [
            'Upload image',
            'Select the crop area',
            'Confirm and download'
        ],
        benefits: [
            {
                icon: <Award className="w-8 h-8 text-yellow-600" />,
                title: 'Precise',
                desc: 'Select specific aspect ratios like 16:9 or 1:1.'
            }
        ],
        relatedTools: [
            { name: 'Image Resizer', link: 'image-resizer' }
        ],
        color: 'from-orange-500 to-red-500'
    },
    'Brightness/Contrast': {
        title: 'Brightness & Contrast',
        description: 'Enhance your photos by adjusting their lighting and color depth.',
        steps: [
            'Upload image',
            'Move sliders for brightness/contrast',
            'Apply and download'
        ],
        benefits: [],
        relatedTools: [
            { name: 'Blur Effect', link: 'blur-effect' },
            { name: 'Sharpen Effect', link: 'sharpen-effect' }
        ],
        color: 'from-amber-400 to-yellow-600'
    },
    'Blur Effect': {
        title: 'Blur Effect',
        description: 'Apply a smooth artistic blur or conceal parts of an image.',
        steps: [
            'Select image',
            'Adjust blur intensity',
            'Apply'
        ],
        benefits: [],
        relatedTools: [
            { name: 'Sharpen Effect', link: 'sharpen-effect' }
        ],
        color: 'from-gray-300 to-gray-500'
    },
    'Sharpen Effect': {
        title: 'Sharpen Effect',
        description: 'Bring out the details in your images with a sharpening filter.',
        steps: [
            'Upload image',
            'Set sharpening level',
            'Download result'
        ],
        benefits: [],
        relatedTools: [
            { name: 'Blur Effect', link: 'blur-effect' }
        ],
        color: 'from-blue-700 to-indigo-900'
    },
    'Add Watermark': {
        title: 'Add Watermark',
        description: 'Protect your images by adding text or image watermarks.',
        steps: [
            'Choose your design',
            'Set watermark position/opacity',
            'Save watermarked image'
        ],
        benefits: [
            {
                icon: <Shield className="w-8 h-8 text-blue-600" />,
                title: 'Copyright Protection',
                desc: 'Safeguard your creative work.'
            }
        ],
        relatedTools: [],
        color: 'from-slate-600 to-slate-800'
    },
    'PNG to ICO': {
        title: 'PNG to ICO Converter',
        description: 'Create high-quality icons (.ico) for Windows apps or websites from PNG images.',
        steps: [
            'Select PNG (preferably 1024x1024 or 512x512)',
            'Click "Generate ICO"',
            'Download icon file'
        ],
        benefits: [],
        relatedTools: [
            { name: 'PNG to JPG', link: 'png-to-jpg' }
        ],
        color: 'from-blue-400 to-indigo-500'
    },
    'HTML to PDF': {
        title: 'HTML to PDF Converter',
        description: 'Convert HTML files or raw code into professional PDF documents. Perfect for saving offline copies of webpages.',
        steps: [
            'Paste HTML or upload .html file',
            'Click "Generate PDF"',
            'Download'
        ],
        benefits: [
            {
                icon: <Award className="w-8 h-8 text-yellow-600" />,
                title: 'Precise Rendering',
                desc: 'Preserves CSS styling and layout.'
            }
        ],
        relatedTools: [
            { name: 'Text to PDF', link: 'text-to-pdf' }
        ],
        color: 'from-orange-600 to-red-600'
    },
    'MP4 to AVI': {
        title: 'MP4 to AVI Converter',
        description: 'Convert MP4 videos to AVI format for legacy player compatibility.',
        steps: [
            'Upload video',
            'Convert to AVI',
            'Download'
        ],
        benefits: [],
        relatedTools: [
            { name: 'AVI to MP4', link: 'avi-to-mp4' }
        ],
        color: 'from-blue-500 to-indigo-500'
    },
    'AVI to MP4': {
        title: 'AVI to MP4 Converter',
        description: 'Convert legacy AVI videos to modern, efficient MP4 format.',
        steps: [
            'Upload AVI',
            'Convert',
            'Download'
        ],
        benefits: [],
        relatedTools: [
            { name: 'MP4 to AVI', link: 'mp4-to-avi' }
        ],
        color: 'from-purple-500 to-pink-500'
    },
    'MP4 to MKV': {
        title: 'MP4 to MKV Converter',
        description: 'Wrap your MP4 videos in a flexible MKV container.',
        steps: [
            'Upload MP4',
            'Select "To MKV"',
            'Download'
        ],
        benefits: [],
        relatedTools: [],
        color: 'from-orange-500 to-red-500'
    },
    'MOV to MP4': {
        title: 'MOV to MP4 Converter',
        description: 'Convert QuickTime MOV videos to universal MP4 format.',
        steps: [
            'Upload MOV',
            'Convert',
            'Download'
        ],
        benefits: [],
        relatedTools: [],
        color: 'from-gray-500 to-slate-500'
    },
    'M4A to MP3': {
        title: 'M4A to MP3 Converter',
        description: 'Convert Apple M4A audio to the standard MP3 format.',
        steps: [
            'Upload M4A',
            'Convert to MP3',
            'Download'
        ],
        benefits: [],
        relatedTools: [],
        color: 'from-green-500 to-emerald-500'
    },
    'OGG to MP3': {
        title: 'OGG to MP3 Converter',
        description: 'Convert OGG audio files to MP3 for better hardware support.',
        steps: [
            'Upload OGG',
            'Click Convert',
            'Save MP3'
        ],
        benefits: [],
        relatedTools: [],
        color: 'from-teal-500 to-cyan-500'
    },
    'PDF to JPG': {
        title: 'PDF to JPG Converter',
        description: 'Turn your PDF pages into high-res JPG images.',
        steps: [
            'Upload PDF',
            'Process pages',
            'Download results'
        ],
        benefits: [],
        relatedTools: [
            { name: 'PDF to PNG', link: 'pdf-to-png' }
        ],
        color: 'from-red-500 to-pink-500'
    },
    'PDF to PNG': {
        title: 'PDF to PNG Converter',
        description: 'Extract PDF pages as lossless PNG shots.',
        steps: [
            'Select PDF',
            'Convert',
            'Save'
        ],
        benefits: [],
        relatedTools: [
            { name: 'PDF to JPG', link: 'pdf-to-jpg' }
        ],
        color: 'from-red-600 to-rose-600'
    },
    'PNG to DOCX': {
        title: 'PNG to Word (DOCX)',
        description: 'Convert your screenshots or designs to a Word document.',
        steps: [
            'Upload PNG',
            'Convert',
            'Download'
        ],
        benefits: [],
        relatedTools: [
            { name: 'TXT to DOCX', link: 'txt-to-docx' }
        ],
        color: 'from-blue-600 to-indigo-600'
    },
    'TXT to DOCX': {
        title: 'Text to Word (DOCX)',
        description: 'Convert simple text files to editable Word .docx files.',
        steps: [
            'Upload TXT',
            'Convert',
            'Download'
        ],
        benefits: [],
        relatedTools: [
            { name: 'PNG to DOCX', link: 'png-to-docx' }
        ],
        color: 'from-blue-500 to-cyan-500'
    },
    'JFIF to PNG': {
        title: 'JFIF to PNG Converter',
        description: 'Convert JFIF images to PNG format online for free. This tool compresses images while maintaining high visual quality, perfect for web use.',
        steps: [
            'Click the “Choose Files” button to select your JFIF files.',
            'Click the “Convert to PNG” button to start the conversion.',
            'When the status change to “Done” click the “Download PNG” button.'
        ],
        benefits: [
            {
                icon: <Check className="w-8 h-8 text-green-600" />,
                title: 'Easy to Use',
                desc: 'Simply upload your JFIF files and click the convert button. You can also batch convert JFIF to PNG format.'
            },
            {
                icon: <Award className="w-8 h-8 text-yellow-600" />,
                title: 'Best Quality',
                desc: 'We use both open source and custom software to make sure our conversions are of the highest quality. In most cases, you can fine-tune conversion parameters using “Advanced Settings” (optional, look for the gear icon).'
            },
            {
                icon: <Shield className="w-8 h-8 text-blue-600" />,
                title: 'Free & Secure',
                desc: 'Our JFIF to PNG Converter is free and works on any web browser. We guarantee file security and privacy. Files are protected with 256-bit SSL encryption and automatically delete after a few hours.'
            }
        ],
        relatedTools: [
            { name: 'JFIF Converter', link: 'jfif-to-png' },
            { name: 'JFIF to SVG', link: 'jfif-to-svg' },
            { name: 'JFIF to TIFF', link: 'jfif-to-tiff' },
            { name: 'JFIF to JPG', link: 'jfif-to-jpg' },
            { name: 'JFIF to BMP', link: 'jfif-to-bmp' },
            { name: 'JFIF to ODD', link: 'jfif-to-odd' },
            { name: 'JFIF to GIF', link: 'jfif-to-gif' },
            { name: 'JFIF to WebP', link: 'jfif-to-webp' },
            { name: 'JFIF to PSD', link: 'jfif-to-psd' },
            { name: 'JFIF to JPEG', link: 'jfif-to-jpg' },
            { name: 'JFIF to PS', link: 'jfif-to-ps' },
            { name: 'JFIF to PDF', link: 'jfif-to-pdf' }
        ],
        color: 'from-blue-500 to-indigo-600'
    },
    'HEIC to JPG': {
        title: 'HEIC to JPG Converter',
        description: 'Convert HEIC images to high-quality JPEG images in seconds! Our HEIC to JPG converter also supports converting HEIC files embedded with multiple images into JPEG format.',
        steps: [
            'Click the “Choose Files” button and select your HEIC files.',
            'Click on the “Convert to JPG” button to start the conversion.',
            'When the status change to “Done” click the “Download JPG” button.'
        ],
        benefits: [
            {
                icon: <Check className="w-8 h-8 text-green-600" />,
                title: 'Effortless',
                desc: 'Simply drag and drop your HEIC files and click "Convert to JPG!" Your HEIC files will be converted to JPG with the best quality.'
            },
            {
                icon: <Award className="w-8 h-8 text-yellow-600" />,
                title: 'Best Quality',
                desc: 'Convert HEIC images to high-quality JPEG images in seconds! Our HEIC to JPG converter also supports converting HEIC files embedded with multiple images into JPEG format.'
            },
            {
                icon: <Shield className="w-8 h-8 text-blue-600" />,
                title: 'Free & Secure',
                desc: 'Our HEIC to JPG converter is free and works on any web browser. Plus, we upload your files over a secure HTTPS connection and delete them automatically after a few hours. So you can convert your HEIC files to JPG without worrying about file security and privacy.'
            }
        ],
        relatedTools: [
            { name: 'HEIC Converter', link: 'heic-to-jpg' },
            { name: 'HEIC to SVG', link: 'heic-to-svg' },
            { name: 'HEIC to TIFF', link: 'heic-to-tiff' },
            { name: 'HEIC to BMP', link: 'heic-to-bmp' },
            { name: 'HEIC to PNG', link: 'heic-to-png' },
            { name: 'HEIC to ODD', link: 'heic-to-odd' },
            { name: 'HEIC to GIF', link: 'heic-to-gif' },
            { name: 'HEIC to WebP', link: 'heic-to-webp' },
            { name: 'HEIC to PSD', link: 'heic-to-psd' },
            { name: 'HEIC to JPEG', link: 'heic-to-jpg' },
            { name: 'HEIC to PS', link: 'heic-to-ps' },
            { name: 'HEIC to PDF', link: 'heic-to-pdf' }
        ],
        color: 'from-orange-500 to-amber-600'
    },
    'Document Converter': {
        title: 'Document Converter',
        description: 'Convert any document to over 40 formats. Support for Word, Excel, PowerPoint, PDF, HTML, and more.',
        steps: [
            'Click the “Choose Files” button to upload your document files',
            'Select a target document format from the “Convert To” drop-down list',
            'Click on the blue “Convert” button to start the conversion'
        ],
        benefits: [
            {
                icon: <FileText className="w-8 h-8 text-blue-600" />,
                title: 'Convert Any Document',
                desc: 'Support more than 40 document conversions. You can convert your files to DOC, PDF, HTML, PPT, ODP, and more.'
            },
            {
                icon: <Award className="w-8 h-8 text-yellow-600" />,
                title: 'High Quality',
                desc: 'We use both open source and proprietary software to make sure our conversions are of the highest quality.'
            },
            {
                icon: <Shield className="w-8 h-8 text-green-600" />,
                title: 'Free & Secure',
                desc: 'Our Document converter is free and works on any web browser. Files are protected with 256-bit SSL encryption and deleted automatically.'
            }
        ],
        relatedTools: [
            { name: 'DOC Converter', link: 'doc-converter' },
            { name: 'HTML Converter', link: 'html-converter' },
            { name: 'PPT Converter', link: 'ppt-converter' },
            { name: 'XLS Converter', link: 'xls-converter' },
            { name: 'WORD Converter', link: 'word-converter' },
            { name: 'PDF Converter', link: 'pdf-converter' },
            { name: 'DOCX Converter', link: 'docx-converter' },
            { name: 'RTF Converter', link: 'rtf-converter' },
            { name: 'ODT Converter', link: 'odt-converter' },
            { name: 'TXT Converter', link: 'txt-converter' }
        ],
        color: 'from-blue-600 to-indigo-700'
    },
    'Ebook Converter': {
        title: 'Ebook Converter',
        description: 'Convert your e-books to any format for Kindle, Kobo, and other readers. Supports 30+ ebook formats.',
        steps: [
            'Click the “Choose Files” button to upload your files',
            'Select a target ebook format from the “Convert To” drop-down list',
            'Click on the blue “Convert” button to start the conversion'
        ],
        benefits: [
            {
                icon: <Award className="w-8 h-8 text-yellow-600" />,
                title: 'Best Quality',
                desc: 'Use the advanced options to enable heuristic processing, add margins, or rescale fonts for the best reading experience.'
            },
            {
                icon: <BookOpen className="w-8 h-8 text-indigo-600" />,
                title: 'Convert Any e-book',
                desc: 'This ebook converter supports 30+ ebook conversions. You can optimize for Kindle Paperwhite, Kobo, and others.'
            },
            {
                icon: <Shield className="w-8 h-8 text-green-600" />,
                title: 'Free & Secure',
                desc: 'Works on Windows, Mac, Linux, and all browsers. Files are uploaded over secure HTTPS and deleted after a few hours.'
            }
        ],
        relatedTools: [
            { name: 'EPUB Converter', link: 'epub-converter' },
            { name: 'MOBI Converter', link: 'mobi-converter' },
            { name: 'AZW3 Converter', link: 'azw3-converter' },
            { name: 'FB2 Converter', link: 'fb2-converter' },
            { name: 'LIT Converter', link: 'lit-converter' },
            { name: 'CHM Converter', link: 'chm-converter' },
            { name: 'AZW Converter', link: 'azw-converter' },
            { name: 'PDF to EPUB', link: 'pdf-to-epub' }
        ],
        color: 'from-purple-600 to-violet-700'
    },
    'PDF to WORD': {
        title: 'PDF to Word Converter',
        description: 'Convert PDF documents to editable Microsoft Word files (DOCX) with high accuracy.',
        steps: [
            'Upload your PDF document',
            'Choose "Convert to WORD"',
            'Download your editable DOCX file'
        ],
        benefits: [
            {
                icon: <FileText className="w-8 h-8 text-blue-600" />,
                title: 'High Accuracy',
                desc: 'Maintains layout, fonts, and images from the original PDF.'
            },
            {
                icon: <Award className="w-8 h-8 text-yellow-600" />,
                title: 'Fast Conversion',
                desc: 'Get your Word document in seconds.'
            }
        ],
        relatedTools: [
            { name: 'PDF to JPG', link: 'pdf-to-jpg' },
            { name: 'PDF to PNG', link: 'pdf-to-png' },
            { name: 'PDF to TEXT', link: 'pdf-to-text' },
            { name: 'PDF to XLSX', link: 'pdf-to-xlsx' },
            { name: 'PDF to PPTX', link: 'pdf-to-pptx' },
            { name: 'PDF to RTF', link: 'pdf-to-rtf' },
            { name: 'PDF to EPUB', link: 'pdf-to-epub' },
            { name: 'PDF to MOBI', link: 'pdf-to-mobi' }
        ],
        color: 'from-blue-500 to-blue-700'
    },
    'EPUB to PDF': {
        title: 'EPUB to PDF Converter',
        description: 'Convert EPUB ebooks to PDF format online for free. Perfect for reading your ebooks on any device that supports PDF.',
        steps: [
            'Click the “Choose Files” button to upload your EPUB files',
            'Click on the blue “Convert to PDF” button to start the conversion',
            'Once done, click the “Download PDF” button to save your file'
        ],
        benefits: [
            {
                icon: <BookOpen className="w-8 h-8 text-indigo-600" />,
                title: 'Preserve Layout',
                desc: 'Our converter ensures that the original formatting, images, and fonts of your EPUB are maintained in the PDF output.'
            },
            {
                icon: <Award className="w-8 h-8 text-yellow-600" />,
                title: 'High Compatibility',
                desc: 'PDF files can be opened on almost any device, making it easier to share and read your ebooks anywhere.'
            },
            {
                icon: <Shield className="w-8 h-8 text-green-600" />,
                title: 'Safe & Secure',
                desc: 'Your files are uploaded over a 256-bit SSL encrypted connection and deleted automatically after a few hours.'
            }
        ],
        relatedTools: [
            { name: 'EPUB Converter', link: 'ebook-converter' },
            { name: 'EPUB to MOBI', link: 'epub-to-mobi' },
            { name: 'EPUB to AZW3', link: 'epub-to-azw3' },
            { name: 'EPUB to WORD', link: 'epub-to-word' },
            { name: 'EPUB to DOCX', link: 'epub-to-docx' }
        ],
        color: 'from-purple-500 to-indigo-600'
    },
    'HEIC to PDF': {
        title: 'HEIC to PDF Converter',
        description: 'Convert HEIC (High Efficiency Image Format) images from your iPhone or iPad to PDF documents easily.',
        steps: [
            'Upload your HEIC image files',
            'Select "Convert to PDF"',
            'Download the final PDF document'
        ],
        benefits: [
            {
                icon: <FileText className="w-8 h-8 text-blue-600" />,
                title: 'Unified Documents',
                desc: 'Combine multiple HEIC images into a single professional PDF document for easy sharing.'
            },
            {
                icon: <Award className="w-8 h-8 text-yellow-600" />,
                title: 'Retain Quality',
                desc: 'Conversion happens without losing the high-definition quality of your original Apple HEIF photos.'
            },
            {
                icon: <Shield className="w-8 h-8 text-green-600" />,
                title: 'Privacy Focused',
                desc: 'We do not store your images. All files are processed and then permanently removed from our servers.'
            }
        ],
        relatedTools: [
            { name: 'HEIC Converter', link: 'heic-converter' },
            { name: 'HEIC to PS', link: 'heic-to-ps' },
            { name: 'HEIC to JPEG', link: 'heic-to-jpeg' },
            { name: 'HEIC to PSD', link: 'heic-to-psd' },
            { name: 'HEIC to WebP', link: 'heic-to-webp' },
            { name: 'HEIC to GIF', link: 'heic-to-gif' },
            { name: 'HEIC to ODD', link: 'heic-to-odd' },
            { name: 'HEIC to PNG', link: 'heic-to-png' },
            { name: 'HEIC to BMP', link: 'heic-to-bmp' },
            { name: 'HEIC to JPG', link: 'heic-to-jpg' },
            { name: 'HEIC to TIFF', link: 'heic-to-tiff' },
            { name: 'HEIC to SVG', link: 'heic-to-svg' }
        ],
        color: 'from-orange-500 to-red-600'
    },
    'EPUB to MOBI': {
        title: 'EPUB to MOBI Converter',
        description: 'Convert EPUB ebooks to MOBI format for Kindle devices. High-quality conversion that preserves text and formatting.',
        steps: [
            'Click the “Choose Files” button to upload your EPUB files',
            'Click on the blue “Convert to MOBI” button to start the conversion',
            'Once done, click the “Download MOBI” button to save your file'
        ],
        benefits: [
            {
                icon: <BookOpen className="w-8 h-8 text-indigo-600" />,
                title: 'Kindle Ready',
                desc: 'MOBI is the standard format for older Kindle devices. Our converter ensures your ebooks are perfectly formatted for your e-reader.'
            },
            {
                icon: <Award className="w-8 h-8 text-yellow-600" />,
                title: 'Quick Conversion',
                desc: 'Get your Kindle-ready files in seconds without any loss of data or formatting.'
            }
        ],
        relatedTools: [
            { name: 'EPUB to PDF', link: 'epub-to-pdf' },
            { name: 'EPUB to AZW3', link: 'epub-to-azw3' },
            { name: 'EPUB to WORD', link: 'epub-to-word' }
        ],
        color: 'from-blue-600 to-indigo-700'
    },
    'EPUB to AZW3': {
        title: 'EPUB to AZW3 Converter',
        description: 'Convert EPUB to AZW3 (Kindle Format 8) for a superior reading experience on modern Kindle devices.',
        steps: ['Upload your EPUB', 'Choose AZW3 as target', 'Download and transfer to Kindle'],
        benefits: [
            {
                icon: <Zap className="w-8 h-8 text-yellow-500" />,
                title: 'Modern Format',
                desc: 'AZW3 supports more CSS styles and layouts than MOBI, providing a better reading experience.'
            }
        ],
        relatedTools: [
            { name: 'EPUB to MOBI', link: 'epub-to-mobi' },
            { name: 'EPUB to PDF', link: 'epub-to-pdf' }
        ],
        color: 'from-indigo-500 to-purple-600'
    },
    'EPUB to WORD': {
        title: 'EPUB to Word Converter',
        description: 'Convert EPUB ebooks to editable Microsoft Word (DOCX) documents easily.',
        steps: ['Select your EPUB file', 'Click "Convert to WORD"', 'Download your editable document'],
        benefits: [
            {
                icon: <FileText className="w-8 h-8 text-blue-600" />,
                title: 'Fully Editable',
                desc: 'Extract text from ebooks and convert them into Word documents that you can edit and reformat.'
            }
        ],
        relatedTools: [
            { name: 'EPUB to PDF', link: 'epub-to-pdf' },
            { name: 'PDF to WORD', link: 'pdf-to-word' }
        ],
        color: 'from-blue-400 to-blue-600'
    },

    // === PDF & Documents Tools ===
    'PDF to TEXT': {
        title: 'PDF to Text Converter',
        description: 'Extract text content from PDF files. Get plain text that you can copy, edit, or use in other applications.',
        steps: ['Upload your PDF', 'Click "Convert to TEXT"', 'Copy or download the extracted text'],
        benefits: [
            { icon: <FileText className="w-8 h-8 text-blue-600" />, title: 'Plain Text', desc: 'Get clean, unformatted text from your PDF.' },
            { icon: <Zap className="w-8 h-8 text-yellow-500" />, title: 'Fast', desc: 'Quick text extraction from any PDF.' }
        ],
        relatedTools: [
            { name: 'PDF to WORD', link: 'pdf-to-word' },
            { name: 'Text to PDF', link: 'text-to-pdf' }
        ],
        color: 'from-gray-500 to-gray-700'
    },
    'PDF to PPTX': {
        title: 'PDF to PowerPoint Converter',
        description: 'Convert PDF documents to editable PowerPoint (PPTX) presentations.',
        steps: ['Upload your PDF file', 'Click "Convert to PPTX"', 'Download your PowerPoint file'],
        benefits: [
            { icon: <Award className="w-8 h-8 text-yellow-600" />, title: 'Editable Slides', desc: 'Get a presentation you can edit in PowerPoint.' },
            { icon: <Check className="w-8 h-8 text-green-600" />, title: 'Page to Slide', desc: 'Each PDF page becomes a presentation slide.' }
        ],
        relatedTools: [
            { name: 'PDF to WORD', link: 'pdf-to-word' },
            { name: 'PDF to JPG', link: 'pdf-to-jpg' }
        ],
        color: 'from-orange-500 to-red-600'
    },
    'HEIC Converter': {
        title: 'HEIC Converter',
        description: 'Convert Apple HEIC/HEIF images to JPG, PNG, or other formats. Perfect for making iPhone photos compatible with any device.',
        steps: ['Upload your HEIC file', 'Select output format', 'Download the converted image'],
        benefits: [
            { icon: <Check className="w-8 h-8 text-green-600" />, title: 'Universal Format', desc: 'Convert to widely supported formats like JPG or PNG.' },
            { icon: <Shield className="w-8 h-8 text-blue-600" />, title: 'Browser-Based', desc: 'No software installation required. Works in your browser.' }
        ],
        relatedTools: [
            { name: 'HEIC to JPG', link: 'heic-to-jpg' },
            { name: 'HEIC to PNG', link: 'heic-to-png' },
            { name: 'HEIC to PDF', link: 'heic-to-pdf' }
        ],
        color: 'from-blue-400 to-cyan-500'
    },
    'HEIC to PNG': {
        title: 'HEIC to PNG Converter',
        description: 'Convert Apple HEIC photos to PNG format with transparency support.',
        steps: ['Upload HEIC image', 'Click Convert', 'Download PNG'],
        benefits: [
            { icon: <Check className="w-8 h-8 text-green-600" />, title: 'Lossless', desc: 'PNG is a lossless format with no quality degradation.' }
        ],
        relatedTools: [
            { name: 'HEIC to JPG', link: 'heic-to-jpg' },
            { name: 'HEIC Converter', link: 'heic-converter' }
        ],
        color: 'from-green-400 to-teal-500'
    },
    'JPG to PDF': {
        title: 'JPG to PDF Converter',
        description: 'Convert JPG images to PDF documents quickly and easily.',
        steps: ['Upload JPG image(s)', 'Click Convert', 'Download PDF'],
        benefits: [
            { icon: <FileText className="w-8 h-8 text-blue-600" />, title: 'Document Ready', desc: 'Create professional PDF documents from your images.' }
        ],
        relatedTools: [
            { name: 'PNG to PDF', link: 'png-to-pdf' },
            { name: 'Image to PDF', link: 'image-to-pdf' },
            { name: 'PDF to JPG', link: 'pdf-to-jpg' }
        ],
        color: 'from-red-400 to-pink-500'
    },
    'PNG to PDF': {
        title: 'PNG to PDF Converter',
        description: 'Convert PNG images to PDF format.',
        steps: ['Upload PNG image(s)', 'Click Convert', 'Download PDF'],
        benefits: [
            { icon: <FileText className="w-8 h-8 text-blue-600" />, title: 'Quality Preserved', desc: 'PNG quality is maintained in the PDF output.' }
        ],
        relatedTools: [
            { name: 'JPG to PDF', link: 'jpg-to-pdf' },
            { name: 'Image to PDF', link: 'image-to-pdf' }
        ],
        color: 'from-blue-400 to-indigo-500'
    }
};
