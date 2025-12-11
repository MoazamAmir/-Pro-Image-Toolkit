// src/components/Header.js
import React, { useState, useRef } from 'react';
import { Zap, Moon, Sun, Film, Image, FileText, Grid3x3, Settings } from 'lucide-react';

const Header = ({
    darkMode,
    setDarkMode,
    converters,
    handleSetActiveConverter,
    setSelectedFile,
    setConvertedFile,
    setPreviewUrl,
}) => {
    const [activeDropdown, setActiveDropdown] = useState(null);
    const dropdownRefs = useRef({});

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Video & Audio':
                return <Film className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 ${darkMode ? 'text-purple-400' : 'text-purple-200'}`} />;
            case 'Image':
                return <Image className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 ${darkMode ? 'text-blue-400' : 'text-blue-200'}`} />;
            case 'PDF & Documents':
                return <FileText className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 ${darkMode ? 'text-indigo-400' : 'text-indigo-200'}`} />;
            case 'GIF & Animation':
                return <Grid3x3 className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 ${darkMode ? 'text-pink-400' : 'text-pink-200'}`} />;
            case 'Advanced':
                return <Settings className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 ${darkMode ? 'text-violet-400' : 'text-violet-200'}`} />;
            default:
                return null;
        }
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'Video & Audio':
                return darkMode ? 'from-purple-600 to-purple-500' : 'from-purple-100 to-purple-50';
            case 'Image':
                return darkMode ? 'from-blue-600 to-blue-500' : 'from-blue-100 to-blue-50';
            case 'PDF & Documents':
                return darkMode ? 'from-indigo-600 to-indigo-500' : 'from-indigo-100 to-indigo-50';
            case 'GIF & Animation':
                return darkMode ? 'from-pink-600 to-pink-500' : 'from-pink-100 to-pink-50';
            case 'Advanced':
                return darkMode ? 'from-violet-600 to-violet-500' : 'from-violet-100 to-violet-50';
            default:
                return darkMode ? 'from-gray-600 to-gray-500' : 'from-gray-100 to-gray-50';
        }
    };

    const handleMouseEnter = (category) => {
        setActiveDropdown(category);
    };

    const handleMouseLeave = (category, e) => {
        if (dropdownRefs.current[category] && !dropdownRefs.current[category].contains(e.relatedTarget)) {
            setActiveDropdown(null);
        }
    };

    const handleToolClick = (item) => {
        handleSetActiveConverter(item);
        setActiveDropdown(null);
        setSelectedFile(null);
        setConvertedFile(null);
        setPreviewUrl(null);
    };

    return (
        <header className={`${darkMode ? 'bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900' : 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600'} shadow-2xl sticky top-0 z-50 transition-all duration-500 backdrop-blur-sm`}>
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                <div className="flex justify-between items-center h-14 sm:h-16">
                    {/* Logo */}
                    <div className="flex items-center cursor-pointer group" onClick={() => {
                        handleSetActiveConverter(null);
                        setSelectedFile(null);
                        setConvertedFile(null);
                        setPreviewUrl(null);
                    }}>
                        <div className="relative">
                            <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 mr-2 sm:mr-3 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 animate-glow" />
                            <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-30 group-hover:opacity-60 transition-opacity duration-300 animate-pulse-soft"></div>
                        </div>
                        <span className="text-base sm:text-xl font-bold text-white group-hover:text-yellow-300 transition-all duration-300 tracking-tight">Pro Image Toolkit</span>
                    </div>

                    {/* Category Navigation */}
                    <nav className="hidden md:flex space-x-1 lg:space-x-2">
                        {Object.entries(converters).map(([category, items]) => {
                            const displayName = category === 'Advanced' ? 'Tools' : category;
                            return (
                                <div
                                    key={category}
                                    className="relative"
                                    onMouseEnter={() => handleMouseEnter(category)}
                                    onMouseLeave={(e) => handleMouseLeave(category, e)}
                                    ref={(el) => (dropdownRefs.current[category] = el)}
                                >
                                    <button className={`${darkMode ? 'text-gray-200 hover:text-yellow-300' : 'text-white hover:text-yellow-200'} px-2 lg:px-3 py-2 text-xs lg:text-sm font-semibold flex items-center transition-all duration-300 rounded-lg hover:bg-white/10`}>
                                        {getCategoryIcon(category)}
                                        <span className="hidden lg:inline">{displayName}</span>
                                        <span className="lg:hidden">{displayName.split(' ')[0]}</span>
                                    </button>

                                    {/* Dropdown for each category */}
                                    {activeDropdown === category && (
                                        <div
                                            className={`absolute top-full left-0 mt-2 ${darkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'} backdrop-blur-xl shadow-premium-lg rounded-xl border-2 z-50 min-w-[220px] animate-slideDown`}
                                        >
                                            <style>{`
                                                @keyframes slideDown {
                                                    from { opacity: 0; transform: translateY(-10px); }
                                                    to { opacity: 1; transform: translateY(0); }
                                                }
                                            `}</style>
                                            <div className="p-3">
                                                <div className={`flex items-center mb-3 pb-2 border-b-2 bg-gradient-to-r ${getCategoryColor(category)} rounded-lg px-2 py-1`}>
                                                    {getCategoryIcon(category)}
                                                    <h3 className={`font-bold text-sm ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{displayName}</h3>
                                                </div>
                                                <ul className="space-y-1 max-h-[60vh] overflow-y-auto">
                                                    {items.map((item) => (
                                                        <li key={item.name}>
                                                            <button
                                                                onClick={() => handleToolClick(item)}
                                                                className={`text-xs ${darkMode ? 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600' : 'text-gray-700 hover:text-purple-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50'} w-full text-left py-2 px-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg font-medium`}
                                                            >
                                                                {item.name}
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>

                    {/* Mobile Menu - Single Dropdown */}
                    <nav className="md:hidden">
                        <div
                            className="relative"
                            onMouseEnter={() => handleMouseEnter('mobile')}
                            onMouseLeave={(e) => handleMouseLeave('mobile', e)}
                            ref={(el) => (dropdownRefs.current['mobile'] = el)}
                        >
                            <button className={`${darkMode ? 'text-gray-200 hover:text-yellow-300' : 'text-white hover:text-yellow-200'} px-2 sm:px-4 py-2 text-xs sm:text-sm font-semibold flex items-center transition-all duration-300 rounded-lg hover:bg-white/10`}>
                                <span>Tools</span>
                                <svg className={`ml-1 w-3 h-3 transition-transform duration-300 ${activeDropdown === 'mobile' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {activeDropdown === 'mobile' && (
                                <div
                                    className={`fixed top-14 left-1/2 transform -translate-x-1/2 mt-2 ${darkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'} backdrop-blur-xl shadow-premium-lg rounded-xl border-2 z-50 w-[95vw] max-h-[70vh] overflow-y-auto animate-slideDown`}
                                >
                                    <div className="p-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            {Object.entries(converters).map(([category, items]) => {
                                                const displayName = category === 'Advanced' ? 'Tools' : category;
                                                return (
                                                    <div key={category} className="space-y-2">
                                                        <div className={`flex items-center mb-2 pb-2 border-b-2 bg-gradient-to-r ${getCategoryColor(category)} rounded-lg px-2 py-1`}>
                                                            {getCategoryIcon(category)}
                                                            <h3 className={`font-bold text-xs ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{displayName}</h3>
                                                        </div>
                                                        <ul className="space-y-1">
                                                            {items.map((item) => (
                                                                <li key={item.name}>
                                                                    <button
                                                                        onClick={() => handleToolClick(item)}
                                                                        className={`text-xs ${darkMode ? 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600' : 'text-gray-700 hover:text-purple-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50'} w-full text-left py-2 px-2 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg font-medium`}
                                                                    >
                                                                        {item.name}
                                                                    </button>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </nav>

                    {/* Right Side - Dark Mode & Badge */}
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
};

export default Header;