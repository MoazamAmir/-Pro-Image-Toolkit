import React from 'react';
import { Lock, Sparkles } from 'lucide-react';

const AccessDenied = ({ user, onRequestAccess, onSwitchAccount }) => {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-lg flex flex-col items-center text-center animate-fadeIn">

                {/* Illustration Area */}
                <div className="relative w-64 h-64 mb-8 flex items-center justify-center">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-10 text-cyan-400">
                        <Sparkles className="w-8 h-8 animate-pulse" />
                    </div>
                    <div className="absolute bottom-10 left-0 text-cyan-400">
                        <Sparkles className="w-6 h-6 animate-pulse delay-700" />
                    </div>

                    {/* Main Lock Illustration */}
                    <div className="relative z-10 w-48 h-48 bg-purple-100 dark:bg-purple-900/20 rounded-[2rem] flex items-center justify-center border-4 border-white dark:border-gray-900 shadow-2xl rotate-3">
                        <div className="absolute -inset-1 bg-gradient-to-tr from-purple-400 to-indigo-500 rounded-[2.1rem] opacity-20 blur-lg -z-10"></div>
                        <div className="text-purple-600 dark:text-purple-400">
                            <Lock className="w-24 h-24" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
                    You don't have permission to see this design
                </h1>

                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
                    Want to view or edit this design? Ask the owner to share it with you.
                </p>

                {user && (
                    <div className="text-sm text-gray-500 dark:text-gray-500 mb-8">
                        You are currently logged in as <span className="font-semibold text-gray-900 dark:text-gray-300">{user.email}</span>.
                    </div>
                )}

                <div className="flex flex-wrap gap-4 justify-center w-full max-w-md">
                    <button
                        onClick={onRequestAccess}
                        className="flex-1 min-w-[160px] py-3 px-6 bg-[#8B3DFF] hover:bg-[#7a32e6] text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/25 active:scale-[0.98]"
                    >
                        Request Access
                    </button>

                    <button
                        onClick={onSwitchAccount}
                        className="flex-1 min-w-[160px] py-3 px-6 bg-white dark:bg-transparent border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-900 dark:text-white font-bold rounded-xl transition-all active:scale-[0.98]"
                    >
                        Switch account
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
};

export default AccessDenied;
