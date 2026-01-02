
// src/components/ToolDetailsPanel.js
import React from 'react';
import {
    Check, Award, Shield, Info, Zap, Grid3x3, ArrowRight, ChevronDown
} from 'lucide-react';
import { toolDetails } from '../utils/toolDetailsData';

const getCategoryColor = (toolName, darkMode) => {
    let category = 'Image Editing';
    const name = toolName.toLowerCase();

    if (name.includes('png') || name.includes('jpg') || name.includes('webp') || name.includes('image') || name.includes('bmp') || name.includes('svg') || name.includes('ico')) {
        category = 'Image';
    }
    if (name.includes('mp4') || name.includes('mp3') || name.includes('wav') || name.includes('video') || name.includes('audio') || name.includes('avi') || name.includes('mov') || name.includes('m4a') || name.includes('ogg')) {
        category = 'Video & Audio';
    }
    if (name.includes('pdf') || name.includes('doc') || name.includes('text') || name.includes('html') || name.includes('txt') || name.includes('docx') || name.includes('ebook') || name.includes('epub') || name.includes('mobi') || name.includes('azw')) {
        category = 'PDF & Documents';
    }
    if (name.includes('gif')) {
        category = 'GIF & Animation';
    }

    switch (category) {
        case 'Video & Audio':
            return darkMode ? 'from-purple-600 to-purple-500' : 'from-purple-100 to-purple-50 text-purple-700';
        case 'Image':
            return darkMode ? 'from-blue-600 to-blue-500' : 'from-blue-100 to-blue-50 text-blue-700';
        case 'PDF & Documents':
            return darkMode ? 'from-indigo-600 to-indigo-500' : 'from-indigo-100 to-indigo-50 text-indigo-700';
        case 'GIF & Animation':
            return darkMode ? 'from-pink-600 to-pink-500' : 'from-pink-100 to-pink-50 text-pink-700';
        case 'Image Editing':
            return darkMode ? 'from-violet-600 to-violet-500' : 'from-violet-100 to-violet-50 text-violet-700';
        default:
            return darkMode ? 'from-gray-600 to-gray-500' : 'from-gray-100 to-gray-50 text-gray-700';
    }
};

const ToolDetailsPanel = ({ toolName, darkMode, converters, handleSetActiveConverter, activeConverter }) => {
    let details = toolDetails[toolName];

    // Dynamic Generation if details not found
    if (!details && activeConverter) {
        const from = activeConverter.from ? activeConverter.from.toUpperCase() : 'FILE';
        const to = activeConverter.to ? activeConverter.to.toUpperCase() : 'FORMAT';

        // Find related tools dynamically
        let related = [];
        if (converters) {
            Object.values(converters).forEach(category => {
                category.forEach(tool => {
                    if (tool.name !== activeConverter.name && (tool.from === activeConverter.from || tool.to === activeConverter.to)) {
                        related.push({ name: tool.name, link: tool.name.toLowerCase().replace(/[^a-z0-9]/g, '-') });
                    }
                });
            });
        }
        // Shuffle and slice for variety
        related = related.sort(() => 0.5 - Math.random()).slice(0, 12);

        details = {
            title: activeConverter.name,
            description: `Convert ${from} files to ${to} format online for free. Fast, secure, and high-quality conversion tool.`,
            steps: [
                `Click "Choose Files" to upload your ${from} file(s)`,
                `Select options if available, then click "Convert"`,
                `Download your converted ${to} file instantly`
            ],
            benefits: [
                {
                    icon: <Check className="w-8 h-8 text-green-600" />,
                    title: 'Easy & Fast',
                    desc: 'Simple interface designed for quick conversions.'
                },
                {
                    icon: <Award className="w-8 h-8 text-yellow-600" />,
                    title: 'High Quality',
                    desc: 'Advanced algorithms ensure the best output quality.'
                },
                {
                    icon: <Shield className="w-8 h-8 text-blue-600" />,
                    title: 'Secure & Private',
                    desc: 'Files are processed locally in your browser (where possible) for maximum privacy.'
                }
            ],
            relatedTools: related,
            color: 'from-blue-500 to-indigo-600' // Default fallback
        };

        // Assign category color
        const catColorClass = getCategoryColor(activeConverter.name, true);
        if (catColorClass) {
            details.color = catColorClass;
        }
    }

    const [isRelatedToolsOpen, setIsRelatedToolsOpen] = React.useState(true);

    // Filter related tools to ensure they exist in the converters list
    const validRelatedTools = React.useMemo(() => {
        if (!details || !details.relatedTools) return [];
        const allConverters = converters ? Object.values(converters).flat() : [];

        let related = details.relatedTools.map(tool => {
            const found = allConverters.find(c =>
                c.name === tool.name ||
                c.name.toLowerCase().replace(/[^a-z0-9]/g, '-') === tool.link
            );
            return found ? { name: found.name, link: found.name.toLowerCase().replace(/[^a-z0-9]/g, '-') } : null;
        }).filter(Boolean);

        // If too few related tools, supplement
        if (related.length < 4 && activeConverter) {
            allConverters.forEach(c => {
                if (related.length < 12 && c.name !== activeConverter.name && (c.to === activeConverter.to || c.from === activeConverter.from)) {
                    if (!related.find(r => r.name === c.name)) {
                        related.push({ name: c.name, link: c.name.toLowerCase().replace(/[^a-z0-9]/g, '-') });
                    }
                }
            });
        }

        return related.slice(0, 12);
    }, [details, converters, activeConverter]);

    if (!details) return null;

    const handleRelatedToolClick = (link) => {
        const allConverters = converters ? Object.values(converters).flat() : [];
        const targetConverter = allConverters.find(c => {
            const slug = c.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
            return slug === link;
        });

        if (targetConverter) {
            handleSetActiveConverter(targetConverter);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className={`mt-16 transition-all duration-300 ease-in-out pb-20`}>

            <div className={`relative overflow-hidden rounded-3xl p-10 mb-12 text-center shadow-2xl ${darkMode
                ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white'
                : 'bg-gradient-to-br from-white via-blue-50 to-indigo-50 text-gray-900'
                }`}>

                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 flex flex-col items-center">
                    {/* <div className={`inline-flex items-center justify-center p-4 rounded-2xl mb-6 shadow-lg transform hover:scale-105 transition-transform duration-300 bg-gradient-to-r ${details.color.includes('from-') ? details.color : 'from-blue-500 to-indigo-600'}`}>
                        <Award className="w-10 h-10 text-white" />
                    </div> */}
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
                        {details.title}
                    </h2>
                    <p className={`text-lg md:text-xl max-w-3xl mx-auto leading-relaxed opacity-90 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {details.description}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                <div className={`rounded-3xl p-8 shadow-lg border transition-all duration-300 hover:shadow-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <div className="flex items-center mb-8">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-4 shadow-sm ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                            <Info className="w-6 h-6" />
                        </div>
                        <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>How to Use</h3>
                    </div>
                    <div className="space-y-6">
                        {details.steps.map((step, index) => (
                            <div key={index} className="flex">
                                <span className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold mr-4 ${darkMode ? 'bg-blue-900 text-blue-400 border border-blue-800' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                                    {index + 1}
                                </span>
                                <p className={`text-base ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{step}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={`rounded-3xl p-8 shadow-lg border transition-all duration-300 hover:shadow-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <div className="flex items-center mb-8">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-4 shadow-sm ${darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                            <Zap className="w-6 h-6" />
                        </div>
                        <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Key Benefits</h3>
                    </div>
                    <div className="space-y-4">
                        {details.benefits && details.benefits.length > 0 ? (
                            details.benefits.map((benefit, index) => (
                                <div key={index} className={`flex items-start p-4 rounded-2xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                    <div className="mr-4 mt-1">{benefit.icon || <Check className="w-6 h-6 text-green-500" />}</div>
                                    <div>
                                        <h4 className={`font-bold mb-1 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{benefit.title}</h4>
                                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{benefit.desc}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="opacity-60 text-center py-8">Fast, secure, and high-quality conversion included.</p>
                        )}
                    </div>
                </div>
            </div>

            <div className={`rounded-3xl shadow-lg border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <button
                    onClick={() => setIsRelatedToolsOpen(!isRelatedToolsOpen)}
                    className="w-full flex items-center justify-between p-8 text-left"
                >
                    <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${darkMode ? 'bg-indigo-900 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                            <Grid3x3 className="w-5 h-5" />
                        </div>
                        <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Related Tools</h3>
                    </div>
                    <div className={`transform transition-transform ${isRelatedToolsOpen ? 'rotate-180' : ''}`}>
                        <ChevronDown className="w-6 h-6 opacity-50" />
                    </div>
                </button>

                {isRelatedToolsOpen && (
                    <div className="px-8 pb-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-6 border-t border-gray-700/30">
                            {validRelatedTools.map((tool, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleRelatedToolClick(tool.link)}
                                    className={`group flex items-center p-4 rounded-xl border transition-all ${darkMode ? 'bg-gray-700/30 border-gray-600 hover:bg-gray-700' : 'bg-gray-50 border-gray-100 hover:bg-blue-50'}`}
                                >
                                    <ArrowRight className={`w-4 h-4 mr-3 transition-transform group-hover:translate-x-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                                    <span className="font-medium truncate">{tool.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ToolDetailsPanel;