// src/components/Header.js
import React from 'react';
import { Zap, Moon, Sun, Film, Image, FileText, Grid3x3, Settings } from 'lucide-react';

const Header = ({
    darkMode,
    setDarkMode,
    showDropdown,
    setShowDropdown,
    converters,
    setActiveConverter,
    setSelectedFile,
    setConvertedFile,
    setPreviewUrl,
    dropdownRef,
    handleMouseEnter,
    handleMouseLeave,
}) => {
    return (
        <header className={`${darkMode ? 'bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900' : 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600'} shadow-2xl sticky top-0 z-50 transition-all duration-500 backdrop-blur-sm`}>
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                <div className="flex justify-between items-center h-14 sm:h-16">
                    <div className="flex items-center cursor-pointer group" onClick={() => {
                        setActiveConverter(null);
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
                    <nav className="flex space-x-2 sm:space-x-8">
                        <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} ref={dropdownRef}>
                            <button className={`${darkMode ? 'text-gray-200 hover:text-yellow-300' : 'text-white hover:text-yellow-200'} px-2 sm:px-4 py-2 text-xs sm:text-sm font-semibold flex items-center transition-all duration-300 rounded-lg hover:bg-white/10`}>
                                <span className="hidden sm:inline">Convert Tools</span>
                                <span className="sm:hidden">Tools</span>
                                <svg className={`ml-1 sm:ml-2 w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </button>
                            {showDropdown && (
                                <div
                                    className={`fixed top-14 sm:top-16 left-1/2 transform -translate-x-1/2 mt-2 sm:mt-3 ${darkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'} backdrop-blur-xl shadow-premium-lg rounded-xl sm:rounded-2xl border-2 z-50 w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-[1200px] max-h-[80vh] overflow-y-auto animate-slideDown`}
                                >
                                    <style>{`
                    @keyframes slideDown {
                      from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
                      to { opacity: 1; transform: translateX(-50%) translateY(0); }
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
};

export default Header;