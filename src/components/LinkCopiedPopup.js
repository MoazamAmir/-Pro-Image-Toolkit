import React from 'react';
import { X } from 'lucide-react';

const LinkCopiedPopup = ({ isOpen, onClose, onAllowAccess, onCopyPrivate }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] overflow-hidden" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}>
            {/* Backdrop with heavy blur as requested */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-xl transition-opacity animate-fadeIn"
                onClick={onClose}
            />

            {/* Centered Modal Container */}
            <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] w-full max-w-[420px] overflow-hidden animate-popUp z-[10001]"
            >
                {/* Close Button - Top right inside */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 w-9 h-9 flex items-center justify-center bg-gray-900/10 dark:bg-white/10 hover:bg-gray-900/20 dark:hover:bg-white/20 rounded-full transition-all active:scale-90 group z-10"
                >
                    <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>

                <div className="p-10 pt-14 flex flex-col items-center text-center">
                    {/* Canva-style Stylized Lock Illustration */}
                    <div className="relative w-full flex justify-center mb-8">
                        {/* Lock Handle (Arc) */}
                        <div className="absolute top-[-30px] w-20 h-24 border-[10px] border-[#D8B4FE] dark:border-[#7E22CE] rounded-t-full -z-0"></div>

                        {/* Lock Body */}
                        <div className="relative w-32 h-24 bg-gradient-to-b from-[#C084FC] to-[#9333EA] rounded-[1.5rem] shadow-xl z-10 flex items-center justify-center border-4 border-white/20">
                            {/* Keyhole */}
                            <div className="flex flex-col items-center">
                                <div className="w-4 h-4 rounded-full bg-[#3B0764] shadow-inner"></div>
                                <div className="w-1.5 h-4 bg-[#3B0764] -mt-1 rounded-full shadow-inner"></div>
                            </div>
                        </div>

                        {/* Glow effect */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-500/20 blur-[60px] rounded-full -z-10"></div>
                    </div>

                    <h3 className="text-[28px] font-black text-[#1E293B] dark:text-white mb-3 leading-tight tracking-tight px-4">
                        You’ve copied a link only you can access
                    </h3>

                    <p className="text-[15px] font-medium text-gray-500 dark:text-gray-400 mb-9 leading-relaxed max-w-[320px]">
                        If you’d like to share with others, change who can access this design.
                    </p>

                    <div className="w-full space-y-4 px-2">
                        <button
                            onClick={onAllowAccess}
                            className="w-full py-4 bg-[#8B3DFF] hover:bg-[#7a32e6] text-white font-extrabold rounded-2xl transition-all shadow-xl shadow-purple-500/30 active:scale-[0.98] text-base"
                        >
                            Allow view access
                        </button>

                        <button
                            onClick={onCopyPrivate}
                            className="w-full py-4 bg-white dark:bg-transparent border-2 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white font-extrabold rounded-2xl transition-all active:scale-[0.98] text-base"
                        >
                            Copy private link
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes popUp {
                    from { opacity: 0; transform: translate(-50%, -40%) scale(0.9); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-popUp {
                    animation: popUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default LinkCopiedPopup;
