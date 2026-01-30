import React from 'react';
import { Lock, X } from 'lucide-react';

const LinkCopiedPopup = ({ isOpen, onClose, onAllowAccess, onCopyPrivate }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fadeIn scale-100">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors z-10"
                >
                    <X className="w-5 h-5 text-gray-500" />
                </button>

                <div className="p-8 flex flex-col items-center text-center">
                    {/* Lock Icon */}
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6 text-purple-600">
                        <Lock className="w-8 h-8" />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        You've copied a link only you can access
                    </h3>

                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                        If you'd like to share with others, change who can access this design.
                    </p>

                    <div className="w-full space-y-3">
                        <button
                            onClick={onAllowAccess}
                            className="w-full py-3 px-4 bg-[#8B3DFF] hover:bg-[#7a32e6] text-white font-bold rounded-xl transition-all active:scale-[0.98]"
                        >
                            Allow view access
                        </button>

                        <button
                            onClick={onCopyPrivate}
                            className="w-full py-3 px-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-900 dark:text-white font-bold rounded-xl transition-all active:scale-[0.98]"
                        >
                            Copy private link
                        </button>
                    </div>
                </div>
            </div>
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default LinkCopiedPopup;
