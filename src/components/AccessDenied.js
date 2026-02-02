import React from 'react';

const AccessDenied = ({ user, onRequestAccess, onSwitchAccount }) => {
    // Enhanced Lock SVG with modern design
    const LockIllustration = () => (
        <svg width="280" height="280" viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Glow effect background */}
            <defs>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <linearGradient id="lockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#6366F1" />
                </linearGradient>
            </defs>

            {/* Background circle */}
            <circle cx="140" cy="140" r="120" fill="#F5F3FF" opacity="0.5" />
            <circle cx="140" cy="140" r="100" fill="#EDE9FE" opacity="0.6" />

            {/* Sparkle decorations */}
            <g className="sparkles">
                <path d="M240 40 L244 50 L254 54 L244 58 L240 68 L236 58 L226 54 L236 50 Z" fill="#06B6D4" opacity="0.8" />
                <path d="M60 30 L62 35 L67 37 L62 39 L60 44 L58 39 L53 37 L58 35 Z" fill="#06B6D4" opacity="0.8" />
                <path d="M30 200 L33 208 L41 211 L33 214 L30 222 L27 214 L19 211 L27 208 Z" fill="#06B6D4" opacity="0.8" />
                <path d="M250 220 L252 225 L257 227 L252 229 L250 234 L248 229 L243 227 L248 225 Z" fill="#06B6D4" opacity="0.8" />
                <path d="M20 120 L22 126 L28 128 L22 130 L20 136 L18 130 L12 128 L18 126 Z" fill="#06B6D4" opacity="0.8" />
            </g>

            {/* Decorative dots */}
            <g opacity="0.4">
                <circle cx="220" cy="100" r="3" fill="#8B5CF6" />
                <circle cx="60" cy="160" r="3" fill="#8B5CF6" />
                <circle cx="230" cy="180" r="2" fill="#06B6D4" />
                <circle cx="50" cy="90" r="2" fill="#06B6D4" />
            </g>

            {/* Lock illustration */}
            <g transform="translate(140, 155)">
                {/* Lock shadow */}
                <rect x="-58" y="-20" width="116" height="100" rx="14" fill="#000000" opacity="0.05" />

                {/* Lock body */}
                <rect x="-60" y="-25" width="120" height="105" rx="16" fill="url(#lockGradient)" filter="url(#glow)" />

                {/* Lock body highlight */}
                <rect x="-55" y="-20" width="110" height="15" rx="8" fill="#FFFFFF" opacity="0.2" />

                {/* Lock shackle */}
                <path
                    d="M-35 -25 L-35 -60 C-35 -85 35 -85 35 -60 L35 -25"
                    stroke="#6366F1"
                    strokeWidth="18"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.9"
                />

                {/* Inner shackle highlight */}
                <path
                    d="M-28 -25 L-28 -58 C-28 -78 28 -78 28 -58 L28 -25"
                    stroke="#8B5CF6"
                    strokeWidth="6"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.4"
                />

                {/* Keyhole */}
                <g>
                    <circle cx="0" cy="25" r="16" fill="#FFFFFF" opacity="0.95" />
                    <rect x="-6" y="25" width="12" height="28" rx="3" fill="#FFFFFF" opacity="0.95" />
                </g>

                {/* Keyhole shadow */}
                <circle cx="0" cy="25" r="14" fill="#5B21B6" opacity="0.1" />
            </g>
        </svg>
    );

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#FAFAFA',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9999,
            overflow: 'auto',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        }}>
            {/* Header */}
            <header style={{
                padding: '20px 40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
                backgroundColor: '#FFFFFF',
                borderBottom: '1px solid #E5E7EB',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.02)'
            }}>
                {/* Logo */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <div style={{
                        fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                        fontSize: '26px',
                        fontWeight: '700',
                        background: 'linear-gradient(135deg, #06B6D4 0%, #8B5CF6 50%, #6366F1 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        letterSpacing: '-0.5px'
                    }}>
                        Pro Image Toolkit
                    </div>
                </div>

                {/* User Avatar */}
                {user && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '6px 12px 6px 6px',
                        backgroundColor: '#F9FAFB',
                        borderRadius: '24px',
                        border: '1px solid #E5E7EB'
                    }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: '2px solid #FFFFFF',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}>
                            <img
                                src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName || 'User'}`}
                                alt={user.displayName || 'User'}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                        <span style={{
                            fontSize: '13px',
                            fontWeight: '500',
                            color: '#6B7280',
                            maxWidth: '150px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>
                            {user.displayName || user.email}
                        </span>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px 40px',
                maxWidth: '1200px',
                margin: '0 auto',
                width: '100%'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    gap: '80px',
                    flexWrap: 'wrap-reverse'
                }}>
                    {/* Left Content */}
                    <div style={{
                        flex: '1',
                        minWidth: '300px',
                        maxWidth: '480px'
                    }}>
                        {/* Badge */}
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 14px',
                            backgroundColor: '#FEF3C7',
                            color: '#92400E',
                            fontSize: '13px',
                            fontWeight: '600',
                            borderRadius: '20px',
                            marginBottom: '24px',
                            border: '1px solid #FDE68A'
                        }}>
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                <path d="M8 0L9.88 5.56L16 6.18L11.56 9.88L13.18 16L8 12.56L2.82 16L4.44 9.88L0 6.18L6.12 5.56L8 0Z" fill="#F59E0B" />
                            </svg>
                            Access Required
                        </div>

                        <h1 style={{
                            fontSize: '38px',
                            fontWeight: '800',
                            color: '#111827',
                            marginBottom: '16px',
                            lineHeight: '1.2',
                            margin: 0,
                            marginBottom: '16px',
                            letterSpacing: '-0.5px'
                        }}>
                            You don't have permission to view this design
                        </h1>

                        <p style={{
                            fontSize: '17px',
                            color: '#6B7280',
                            marginBottom: '20px',
                            lineHeight: '1.6',
                            margin: 0,
                            marginBottom: '20px'
                        }}>
                            This design is private. To view or edit it, you'll need the owner to share access with you.
                        </p>

                        {user && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '14px 18px',
                                backgroundColor: '#F3F4F6',
                                borderRadius: '12px',
                                marginBottom: '32px',
                                border: '1px solid #E5E7EB'
                            }}>
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: '#10B981'
                                }}></div>
                                <p style={{
                                    fontSize: '14px',
                                    color: '#374151',
                                    margin: 0
                                }}>
                                    Signed in as{' '}
                                    <span style={{ fontWeight: '600', color: '#111827' }}>
                                        {user.email}
                                    </span>
                                </p>
                            </div>
                        )}

                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            flexWrap: 'wrap'
                        }}>
                            <button
                                onClick={onRequestAccess}
                                style={{
                                    padding: '14px 28px',
                                    backgroundColor: '#8B5CF6',
                                    color: 'white',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    border: 'none',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#7C3AED';
                                    e.target.style.transform = 'translateY(-1px)';
                                    e.target.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = '#8B5CF6';
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M8 1V15M1 8H15" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                                Request Access
                            </button>

                            <button
                                onClick={onSwitchAccount}
                                style={{
                                    padding: '14px 28px',
                                    backgroundColor: 'white',
                                    color: '#374151',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    border: '1.5px solid #D1D5DB',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#F9FAFB';
                                    e.target.style.borderColor = '#9CA3AF';
                                    e.target.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = 'white';
                                    e.target.style.borderColor = '#D1D5DB';
                                    e.target.style.transform = 'translateY(0)';
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M10 4L14 8M14 8L10 12M14 8H6M6 1H4C2.89543 1 2 1.89543 2 3V13C2 14.1046 2.89543 15 4 15H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Switch Account
                            </button>
                        </div>

                        {/* Help text */}
                        <p style={{
                            fontSize: '13px',
                            color: '#9CA3AF',
                            marginTop: '24px',
                            margin: 0,
                            marginTop: '24px'
                        }}>
                            Need help? <a href="#" style={{ color: '#8B5CF6', textDecoration: 'none', fontWeight: '500' }}>Contact support</a>
                        </p>
                    </div>

                    {/* Right Illustration */}
                    <div style={{
                        flex: '0 0 auto',
                        display: 'flex',
                        justifyContent: 'center'
                    }}>
                        <LockIllustration />
                    </div>
                </div>
            </main>

            <style>
                {`
                    @keyframes pulse {
                        0%, 100% { 
                            opacity: 1;
                            transform: scale(1);
                        }
                        50% { 
                            opacity: 0.6;
                            transform: scale(0.95);
                        }
                    }
                    
                    @keyframes float {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-10px); }
                    }
                    
                    .sparkles path {
                        animation: pulse 2.5s ease-in-out infinite;
                    }
                    .sparkles path:nth-child(1) { animation-delay: 0s; }
                    .sparkles path:nth-child(2) { animation-delay: 0.5s; }
                    .sparkles path:nth-child(3) { animation-delay: 1s; }
                    .sparkles path:nth-child(4) { animation-delay: 1.5s; }
                    .sparkles path:nth-child(5) { animation-delay: 2s; }

                    button:active {
                        transform: scale(0.98) !important;
                    }

                    @media (max-width: 768px) {
                        h1 {
                            font-size: 28px !important;
                        }
                        main > div {
                            gap: 40px !important;
                        }
                    }
                `}
            </style>
        </div>
    );
};

export default AccessDenied;