// src/components/Footer.js
import React from 'react';
import { Zap } from 'lucide-react';

const Footer = ({ darkMode }) => (
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
);

export default Footer;