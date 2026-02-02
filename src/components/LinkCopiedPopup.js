import React from 'react';
import { createPortal } from 'react-dom';

const LinkCopiedPopup = ({ isOpen, onClose, onAllowAccess, onCopyPrivate }) => {
    if (!isOpen) return null;

    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'transparent',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        margin: 0,
        padding: 0,
        pointerEvents: 'auto'
    };

    const popupStyle = {
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        width: '100%',
        maxWidth: '360px',
        margin: '16px',
        overflow: 'hidden',
        position: 'relative',
        animation: 'popupFadeIn 0.2s ease-out forwards'
    };

    const closeButtonStyle = {
        position: 'absolute',
        top: '12px',
        right: '12px',
        width: '28px',
        height: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        border: 'none',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        zIndex: 10
    };

    const contentStyle = {
        padding: '32px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
    };

    const lockIconContainerStyle = {
        width: '80px',
        height: '80px',
        background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px',
        boxShadow: '0 10px 25px -5px rgba(139, 92, 246, 0.4)'
    };

    const titleStyle = {
        fontSize: '18px',
        fontWeight: '600',
        color: '#111827',
        marginBottom: '8px',
        lineHeight: '1.4'
    };

    const descriptionStyle = {
        fontSize: '13px',
        color: '#6b7280',
        marginBottom: '24px',
        lineHeight: '1.5'
    };

    const buttonsContainerStyle = {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    };

    const primaryButtonStyle = {
        width: '100%',
        padding: '12px 16px',
        backgroundColor: '#8B3DFF',
        color: 'white',
        fontSize: '14px',
        fontWeight: '600',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: '0 4px 12px rgba(139, 61, 255, 0.3)'
    };

    const secondaryButtonStyle = {
        width: '100%',
        padding: '12px 16px',
        backgroundColor: 'white',
        color: '#374151',
        fontSize: '14px',
        fontWeight: '500',
        border: '1px solid #d1d5db',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'all 0.2s'
    };

    // Lock Icon SVG
    const LockIcon = () => (
        <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
    );

    // X Icon SVG
    const XIcon = () => (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6b7280"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    );

    const popupContent = (
        <div style={overlayStyle} onClick={onClose}>
            <style>
                {`
                    @keyframes popupFadeIn {
                        from { opacity: 0; transform: scale(0.95); }
                        to { opacity: 1; transform: scale(1); }
                    }
                `}
            </style>
            <div style={popupStyle} onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    style={closeButtonStyle}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                    <XIcon />
                </button>

                <div style={contentStyle}>
                    {/* Lock Icon */}
                    <div style={lockIconContainerStyle}>
                        <LockIcon />
                    </div>

                    <h3 style={titleStyle}>
                        You've copied a link only<br />you can access
                    </h3>

                    <p style={descriptionStyle}>
                        If you'd like to share with others, change who<br />can access this design.
                    </p>

                    <div style={buttonsContainerStyle}>
                        <button
                            onClick={onAllowAccess}
                            style={primaryButtonStyle}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#7a32e6'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#8B3DFF'}
                        >
                            Allow view access
                        </button>

                        <button
                            onClick={onCopyPrivate}
                            style={secondaryButtonStyle}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                        >
                            Copy private link
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // Use React Portal to render outside the component hierarchy
    return createPortal(popupContent, document.body);
};

export default LinkCopiedPopup;
