import React, { useState, useRef, useEffect } from 'react';
import { Zap, Moon, Sun, ChevronDown, Sparkles, Search, ArrowLeft, LogOut, User } from 'lucide-react';

const Header = ({
    darkMode,
    setDarkMode,
    converters,
    handleSetActiveConverter,
    setSelectedFile,
    setConvertedFile,
    setPreviewUrl,
    user,
    onLogout,
}) => {
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const dropdownRefs = useRef({});

    // Main tools for each category (all functional)
    const mainTools = {
        'Image': ['PNG to JPG', 'JPG to PNG', 'WEBP to PNG', 'JFIF to PNG', 'Image to PDF', 'Image Resizer'],
        'Video & Audio': ['MP4 to MP3', 'Video to WebM', 'MP3 to WAV', 'WAV to MP3', 'Video Thumbnail', 'Extract Audio (MP3)'],
        'PDF & Documents': ['PDF to WORD', 'PDF to JPG', 'PDF to PNG', 'PDF to TEXT', 'Image to PDF', 'HEIC Converter', 'HTML to PDF', 'PDF to PPTX'],
        'GIF & Animation': ['GIF to Video (MP4)', 'Images to GIF', 'GIF to PNG', 'GIF to JPG', 'Video to GIF'],
        'Image Editing': ['Image Resizer', 'Image Compressor', 'Image Crop', 'Rotate Image', 'Add Watermark', 'PNG to ICO']
    };

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (activeDropdown && activeDropdown !== 'hover-keep') {
                const ref = dropdownRefs.current[activeDropdown];
                if (ref && !ref.contains(event.target)) {
                    setActiveDropdown(null);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activeDropdown]);

    // Search logic
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setSearchResults([]);
            return;
        }

        const query = searchQuery.toLowerCase();
        const results = [];
        for (const category in converters) {
            converters[category].forEach(tool => {
                if (tool.name.toLowerCase().includes(query)) {
                    results.push({ ...tool, category });
                }
            });
        }
        setSearchResults(results);
    }, [searchQuery, converters]);

    // Body scroll lock when search is open
    useEffect(() => {
        if (isSearchOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [isSearchOpen]);

    const getCategoryIcon = (category) => {
        const iconClass = "w-4 h-4";
        switch (category) {
            case 'Video & Audio':
                return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
            case 'Image':
                return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
            case 'PDF & Documents':
                return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
            case 'GIF & Animation':
                return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
            case 'Image Editing':
                return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
            case 'Advanced':
                return <Zap className={iconClass} />;
            default:
                return null;
        }
    };

    const handleToolClick = (item) => {
        handleSetActiveConverter(item);
        setActiveDropdown(null);
        setSelectedFile(null);
        setConvertedFile(null);
        setPreviewUrl(null);
    };

    const findToolByName = (toolName) => {
        for (const category in converters) {
            const tool = converters[category].find(item => item.name === toolName);
            if (tool) return tool;
        }
        return null;
    };

    const handleHoverOpen = (category) => {
        if (activeDropdown !== category) {
            setActiveDropdown(category);
        }
    };

    return (
        <header className={`${darkMode ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' : 'bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600'} shadow-2xl sticky top-0 z-50 transition-all duration-500 backdrop-blur-md border-b ${darkMode ? 'border-purple-800/30' : 'border-white/20'}`}>
            {/* Animated background effect */}
            <div className="absolute inset-0 overflow-hidden opacity-20">
                <div className={`absolute -top-1/2 -left-1/4 w-96 h-96 ${darkMode ? 'bg-purple-500' : 'bg-white'} rounded-full blur-3xl animate-pulse`}></div>
                <div className={`absolute -bottom-1/2 -right-1/4 w-96 h-96 ${darkMode ? 'bg-blue-500' : 'bg-yellow-200'} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="flex justify-between items-center h-16 sm:h-18">
                    {/* Logo */}
                    <div
                        className="flex items-center cursor-pointer group"
                        onClick={() => {
                            handleSetActiveConverter(null);
                            setSelectedFile(null);
                            setConvertedFile(null);
                            setPreviewUrl(null);
                            setActiveDropdown(null);
                        }}
                    >
                        <div className="relative">
                            <Zap className="w-7 h-7 sm:w-9 sm:h-9 text-yellow-400 mr-2.5 sm:mr-3 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 drop-shadow-lg" />
                            <div className="absolute inset-0 bg-yellow-400 blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                            <Sparkles className="w-3 h-3 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg sm:text-2xl font-bold text-white group-hover:text-yellow-300 transition-all duration-300 tracking-tight leading-tight">
                                Pro Image Toolkit
                            </span>
                            <span className={`text-[9px] sm:text-[10px] ${darkMode ? 'text-purple-300' : 'text-white/80'} font-medium tracking-wider`}>
                                CONVERT • EDIT • OPTIMIZE
                            </span>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-1 lg:space-x-2">
                        {Object.entries(converters).map(([category, items]) => {
                            const displayName = category;
                            const categoryMainTools = mainTools[category] || [];

                            return (
                                <div
                                    key={category}
                                    className="relative"
                                    onMouseEnter={() => handleHoverOpen(category)}
                                    ref={(el) => (dropdownRefs.current[category] = el)}
                                >
                                    <button
                                        className={`${darkMode ? 'text-gray-200 hover:text-yellow-300 hover:bg-white/10' : 'text-white hover:text-yellow-100 hover:bg-white/20'} px-3 lg:px-4 py-2.5 text-xs lg:text-sm font-semibold flex items-center gap-1.5 transition-all duration-300 rounded-xl backdrop-blur-sm group relative overflow-hidden`}
                                    >
                                        <span className="relative z-10 flex items-center gap-1.5">
                                            <span className="hidden lg:inline">{displayName}</span>
                                            <span className="lg:hidden">{displayName.split(' ')[0]}</span>
                                            <ChevronDown
                                                className={`w-3.5 h-3.5 transition-transform duration-300 ${activeDropdown === category ? 'rotate-180' : ''}`}
                                            />
                                        </span>
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    </button>

                                    {/* Dropdown */}
                                    {activeDropdown === category && (
                                        <div
                                            className={`absolute top-full left-0 mt-3 ${darkMode ? 'bg-gray-900/95 border-purple-700/50' : 'bg-white/95 border-purple-300/50'} shadow-2xl rounded-2xl border-2 z-50 animate-slideDown backdrop-blur-xl overflow-hidden`}
                                            style={{ minWidth: '200px' }}
                                        >
                                            <style>{`
                                                @keyframes slideDown {
                                                    from {
                                                        opacity: 0;
                                                        transform: translateY(-10px);
                                                    }
                                                    to {
                                                        opacity: 1;
                                                        transform: translateY(0);
                                                    }
                                                }
                                                .animate-slideDown {
                                                    animation: slideDown 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
                                                }
                                            `}</style>

                                            {/* Category Header */}
                                            <div className={`px-4 py-3 ${darkMode ? 'bg-purple-900/30 border-b border-purple-700/30' : 'bg-purple-100/50 border-b border-purple-300/30'} flex items-center gap-2`}>
                                                {/* <div className={`${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                                                    {getCategoryIcon(category)}
                                                </div> */}
                                                {/* <span className={`font-bold text-xs ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                                                    {displayName}
                                                </span> */}
                                            </div>

                                            {/* Tools List */}
                                            <div className="py-2">
                                                {categoryMainTools.map((toolName) => {
                                                    const tool = findToolByName(toolName);
                                                    if (!tool) return null;
                                                    return (
                                                        <button
                                                            key={toolName}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleToolClick(tool);
                                                            }}
                                                            className={`block w-full text-left px-4 py-2.5 text-xs font-medium transition-all duration-200 group relative ${darkMode
                                                                ? 'text-gray-200 hover:bg-purple-800/40 hover:text-white'
                                                                : 'text-gray-700 hover:bg-purple-100 hover:text-purple-900'
                                                                }`}
                                                        >
                                                            <span className="relative z-10">{toolName}</span>
                                                            <div className={`absolute left-0 top-0 h-full w-1 ${darkMode ? 'bg-purple-500' : 'bg-purple-600'} transform scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-top`}></div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>

                    {/* Mobile Menu */}
                    <nav className="md:hidden">
                        <div
                            className="relative"
                            ref={(el) => (dropdownRefs.current['mobile'] = el)}
                        >
                            <button
                                className={`${darkMode ? 'text-gray-200 hover:text-yellow-300 bg-white/5' : 'text-white hover:text-yellow-100 bg-white/20'} px-4 py-2 text-sm font-bold flex items-center gap-2 transition-all duration-300 rounded-xl backdrop-blur-sm border ${darkMode ? 'border-purple-700/30' : 'border-white/30'}`}
                                onClick={() => setActiveDropdown(activeDropdown === 'mobile' ? null : 'mobile')}
                            >
                                <span>Tools</span>
                                <ChevronDown
                                    className={`w-4 h-4 transition-transform duration-300 ${activeDropdown === 'mobile' ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {activeDropdown === 'mobile' && (
                                <div
                                    className={`fixed top-16 left-1/2 transform -translate-x-1/2 mt-2 ${darkMode ? 'bg-gray-900/98 border-purple-700/50' : 'bg-white/98 border-purple-300/50'} shadow-2xl rounded-3xl border-2 z-50 w-[95vw] max-h-[80vh] overflow-y-auto backdrop-blur-xl`}
                                >
                                    <div className="p-5">
                                        {Object.entries(converters).map(([category, items]) => {
                                            const displayName = category === 'Advanced' ? 'Tools' : category;
                                            const categoryMainTools = mainTools[category] || [];

                                            return (
                                                <div key={category} className="mb-6 last:mb-0">
                                                    <div className={`flex items-center mb-3 pb-2 ${darkMode ? 'border-purple-700/30' : 'border-purple-300/30'} border-b-2`}>
                                                        <div className={`w-6 h-6 mr-2.5 flex items-center justify-center rounded-lg ${darkMode ? 'bg-purple-900/40 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                                                            {getCategoryIcon(category)}
                                                        </div>
                                                        <h3 className={`font-bold text-sm ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                                                            {displayName}
                                                        </h3>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2.5">
                                                        {categoryMainTools.map((toolName) => {
                                                            const tool = findToolByName(toolName);
                                                            if (!tool) return null;
                                                            return (
                                                                <button
                                                                    key={toolName}
                                                                    onClick={() => {
                                                                        handleToolClick(tool);
                                                                        setActiveDropdown(null);
                                                                    }}
                                                                    className={`text-[11px] ${darkMode ? 'text-gray-300 bg-gray-800/50 hover:bg-purple-800/50 hover:text-white border-gray-700' : 'text-gray-700 bg-gray-50 hover:bg-purple-100 border-gray-200'} text-left py-3 px-3 rounded-xl transition-all duration-200 font-semibold border hover:scale-[1.02] transform`}
                                                                >
                                                                    {toolName}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </nav>

                    {/* Dark Mode Toggle & Badge */}
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className={`p-2.5 sm:p-3 rounded-xl ${darkMode ? 'bg-gray-800/60 hover:bg-gray-700/60 border-purple-700/30' : 'bg-white/25 hover:bg-white/35 border-white/30'} transition-all duration-300 hover:scale-110 transform backdrop-blur-md shadow-xl border-2 group relative overflow-hidden`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <Search className="w-5 h-5 sm:w-5 sm:h-5 text-white relative z-10 drop-shadow-lg" />
                        </button>
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className={`p-2.5 sm:p-3 rounded-xl ${darkMode ? 'bg-gray-800/60 hover:bg-gray-700/60 border-purple-700/30' : 'bg-white/25 hover:bg-white/35 border-white/30'} transition-all duration-300 hover:scale-110 transform backdrop-blur-md shadow-xl border-2 group relative overflow-hidden`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            {darkMode ? (
                                <Sun className="w-5 h-5 sm:w-5 sm:h-5 text-yellow-400 relative z-10 drop-shadow-lg" />
                            ) : (
                                <Moon className="w-5 h-5 sm:w-5 sm:h-5 text-white relative z-10 drop-shadow-lg" />
                            )}
                        </button>

                        {/* User Profile & Logout */}
                        {user && (
                            <div className="relative" ref={(el) => (dropdownRefs.current['user'] = el)}>
                                <button
                                    onClick={() => setActiveDropdown(activeDropdown === 'user' ? null : 'user')}
                                    className={`flex items-center gap-2 p-1.5 sm:p-2 pr-3 rounded-xl ${darkMode ? 'bg-gray-800/60 hover:bg-gray-700/60 border-purple-700/30' : 'bg-white/25 hover:bg-white/35 border-white/30'} transition-all duration-300 backdrop-blur-md shadow-xl border-2`}
                                >
                                    {user.photoURL ? (
                                        <img
                                            src={user.photoURL}
                                            alt="Profile"
                                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover"
                                        />
                                    ) : (
                                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${darkMode ? 'bg-purple-600' : 'bg-purple-500'} flex items-center justify-center`}>
                                            <User className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                    <ChevronDown className={`w-3.5 h-3.5 text-white transition-transform duration-300 ${activeDropdown === 'user' ? 'rotate-180' : ''}`} />
                                </button>

                                {activeDropdown === 'user' && (
                                    <div className={`absolute top-full right-0 mt-2 ${darkMode ? 'bg-gray-900/95 border-purple-700/50' : 'bg-white/95 border-purple-300/50'} shadow-2xl rounded-xl border-2 z-50 backdrop-blur-xl overflow-hidden min-w-[200px]`}>
                                        <div className={`px-4 py-3 ${darkMode ? 'border-b border-purple-700/30' : 'border-b border-purple-200'}`}>
                                            <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                                                {user.displayName || 'User'}
                                            </p>
                                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                                                {user.email}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setActiveDropdown(null);
                                                onLogout && onLogout();
                                            }}
                                            className={`w-full flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all ${darkMode ? 'text-red-400 hover:bg-red-900/30' : 'text-red-600 hover:bg-red-50'}`}
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Log out
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Search Dropdown - Positions directly below header */}
            {isSearchOpen && (
                <>
                    {/* Backdrop to close search when clicking outside */}
                    <div className="fixed inset-0 bg-black/5 z-[55] backdrop-blur-[2px]" onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}></div>

                    <div className={`absolute top-full left-0 right-0 z-[60] ${darkMode ? 'bg-slate-900 border-purple-800' : 'bg-white border-purple-100'} border-b shadow-2xl overflow-hidden transition-all duration-300`}>
                        <div className="max-w-4xl mx-auto px-4 py-4">
                            {/* Search Input Area */}
                            <div className="flex items-center space-x-3">
                                <div className="relative flex-1">
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Search for tools (e.g. JPG to PNG)..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className={`w-full py-2.5 px-4 pr-10 rounded-xl text-sm font-medium focus:outline-none border transition-all ${darkMode ? 'bg-gray-800 border-gray-700 text-white focus:border-purple-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-purple-600'}`}
                                    />
                                    <Search className={`absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                </div>
                                <button
                                    onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                                    className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'} transition-all`}
                                >
                                    <ArrowLeft className="w-5 h-5 rotate-[180deg]" />
                                </button>
                            </div>

                            {/* Search Results Display */}
                            {searchQuery.trim() !== '' && (
                                <div className="mt-4 overflow-y-auto max-h-[350px] custom-scrollbar pr-1">
                                    {searchResults.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-2">
                                            {searchResults.map((tool, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => {
                                                        handleToolClick(tool);
                                                        setIsSearchOpen(false);
                                                        setSearchQuery('');
                                                    }}
                                                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between group ${darkMode ? 'bg-gray-800/40 border-gray-700 hover:border-purple-500 text-white' : 'bg-white border-gray-100 hover:border-purple-600 text-gray-900'} shadow-sm`}
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter mb-1 inline-block ${darkMode ? 'bg-purple-900/50 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>{tool.category}</span>
                                                        <h3 className="font-bold text-xs truncate group-hover:text-purple-600 transition-colors uppercase">{tool.name}</h3>
                                                    </div>
                                                    <ChevronDown className="w-3 h-3 text-gray-300 rotate-[-90deg] group-hover:text-purple-600 transition-all ml-2" />
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-medium`}>No tools found for "{searchQuery}"</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Empty Query Hint */}
                            {searchQuery.trim() === '' && (
                                <div className={`text-center py-4 mt-2 border-t ${darkMode ? 'border-gray-800' : 'border-gray-50'}`}>
                                    <p className={`text-[11px] ${darkMode ? 'text-gray-500' : 'text-gray-400 font-medium'}`}>Type to search through 100+ professional file tools...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </header>
    );
};

export default Header;
