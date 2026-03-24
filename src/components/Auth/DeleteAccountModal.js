import React, { useState } from 'react';
import { X, AlertTriangle, Trash2, ShieldAlert, AlertCircle } from 'lucide-react';

const DeleteAccountModal = ({ isOpen, onClose, onDeleteConfirm, loading, darkMode }) => {
    const [confirmText, setConfirmText] = useState('');
    const [step, setStep] = useState(1); // 1: Initial warning, 2: Final confirmation
    
    if (!isOpen) return null;

    const handleClose = () => {
        setConfirmText('');
        setStep(1);
        onClose();
    };

    const isConfirmed = confirmText.toLowerCase() === 'delete forever';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn" 
                onClick={!loading ? handleClose : undefined}
            ></div>
            
            {/* Modal Container */}
            <div className={`relative w-full max-w-md transform transition-all duration-300 animate-zoomIn ${darkMode ? 'bg-slate-900 border-red-900/30' : 'bg-white border-red-100'} border-2 rounded-3xl shadow-2xl overflow-hidden`}>
                
                {/* Close Button */}
                <button 
                    onClick={handleClose}
                    disabled={loading}
                    className={`absolute top-4 right-4 p-2 rounded-full transition-all ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                >
                    <X size={20} />
                </button>

                <div className="p-8">
                    {step === 1 ? (
                        <div className="space-y-6 text-center">
                            <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center animate-pulse">
                                <ShieldAlert size={40} className="text-red-600 dark:text-red-500" />
                            </div>
                            
                            <div>
                                <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Delete Account?
                                </h2>
                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    This action is <span className="text-red-500 font-bold uppercase">permanent</span> and cannot be undone. You will lose all your data.
                                </p>
                            </div>

                            <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-red-950/20 border-red-900/30' : 'bg-red-50 border-red-100'} text-left space-y-3`}>
                                <div className="flex gap-3">
                                    <AlertCircle size={18} className="text-red-500 shrink-0" />
                                    <p className={`text-xs ${darkMode ? 'text-red-200' : 'text-red-800'}`}>All your <strong>saved designs</strong> will be permanently deleted.</p>
                                </div>
                                <div className="flex gap-3">
                                    <AlertCircle size={18} className="text-red-500 shrink-0" />
                                    <p className={`text-xs ${darkMode ? 'text-red-200' : 'text-red-800'}`}>All <strong>voice recordings</strong> and local data will be wiped.</p>
                                </div>
                                <div className="flex gap-3">
                                    <AlertCircle size={18} className="text-red-500 shrink-0" />
                                    <p className={`text-xs ${darkMode ? 'text-red-200' : 'text-red-800'}`}>You will lose access to all premium features immediately.</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => setStep(2)}
                                    className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-600/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                                >
                                    Proceed to Deletion
                                </button>
                                <button
                                    onClick={handleClose}
                                    className={`w-full py-4 font-semibold rounded-2xl transition-all ${darkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Final Confirmation
                                </h2>
                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Please type <span className={`font-mono font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>delete forever</span> to confirm.
                                </p>
                            </div>

                            <input
                                autoFocus
                                type="text"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder="Type the confirmation text"
                                className={`w-full py-4 px-6 rounded-2xl border-2 text-center text-sm font-bold transition-all outline-none ${
                                    isConfirmed 
                                    ? (darkMode ? 'bg-red-900/20 border-red-500 text-white' : 'bg-red-50 border-red-600 text-red-900')
                                    : (darkMode ? 'bg-gray-800 border-gray-700 text-gray-300 focus:border-purple-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-purple-600')
                                }`}
                            />

                            <div className="flex flex-col gap-3">
                                <button
                                    disabled={!isConfirmed || loading}
                                    onClick={onDeleteConfirm}
                                    className={`w-full py-4 font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                                        isConfirmed && !loading
                                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20 hover:scale-[1.02] active:scale-95'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    {loading ? (
                                        <>
                                            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                                            Deleting Data...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 size={20} />
                                            Delete My Account Permanently
                                        </>
                                    )}
                                </button>
                                <button
                                    disabled={loading}
                                    onClick={() => setStep(1)}
                                    className={`w-full py-4 font-semibold rounded-2xl transition-all ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    Go Back
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes zoomIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
                .animate-zoomIn { animation: zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
            `}</style>
        </div>
    );
};

export default DeleteAccountModal;
