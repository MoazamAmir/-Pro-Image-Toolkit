import React, { useState } from 'react';
import { X, ChevronLeft, Briefcase } from 'lucide-react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../../services/firebase';
import './authStyles.css';

// Google Icon SVG
const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);

// Email Icon SVG
const EmailIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M22 6L12 13L2 6" />
    </svg>
);

// Apple Icon SVG
const AppleIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
);

// Microsoft Icon SVG
const MicrosoftIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20">
        <path fill="#F25022" d="M1 1h10v10H1z" />
        <path fill="#00A4EF" d="M1 13h10v10H1z" />
        <path fill="#7FBA00" d="M13 1h10v10H13z" />
        <path fill="#FFB900" d="M13 13h10v10H13z" />
    </svg>
);

// Facebook Icon SVG
const FacebookIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
);

// Clever Icon SVG (Simple C placeholder)
const CleverIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="#0047BB">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" />
        <path d="M12 6c-3.314 0-6 2.686-6 6s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 10c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z" />
    </svg>
);

// Phone Icon SVG
const PhoneIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
);

// Main Auth Modal Component
const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
    const [view, setView] = useState('main'); // 'main', 'extended', 'email'
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError('');

        const result = await signInWithGoogle();
        setLoading(false);

        if (result.error) {
            setError(result.error);
        } else if (result.user) {
            onAuthSuccess(result.user);
            onClose();
        }
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = isLogin
            ? await signInWithEmail(email, password)
            : await signUpWithEmail(email, password);

        setLoading(false);

        if (result.error) {
            setError(result.error);
        } else {
            onAuthSuccess(result.user);
            onClose();
        }
    };

    const resetState = () => {
        setView('main');
        setError('');
        setEmail('');
        setPassword('');
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    return (
        <div className="auth-overlay" onClick={handleClose}>
            <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
                {/* Left Side - Form */}
                <div className="auth-form-section">
                    {/* Back Button for sub-views */}
                    {view !== 'main' && (
                        <button className="auth-back-btn" onClick={() => setView('main')}>
                            <ChevronLeft size={20} />
                            Continue to Pro Image Toolkit
                        </button>
                    )}

                    {/* Main View */}
                    {view === 'main' && (
                        <>
                            <h2 className="auth-title">Log in or sign up in seconds</h2>
                            <p className="auth-subtitle">
                                Use your email or another service to continue with Pro Image Toolkit (it's free)!
                            </p>

                            {error && <div className="auth-error">{error}</div>}

                            <button className="auth-btn" onClick={handleGoogleSignIn} disabled={loading}>
                                <span className="auth-btn-icon">
                                    {loading ? <span className="spinner" style={{ width: '16px', height: '16px', borderTopColor: '#7c3aed' }}></span> : <GoogleIcon />}
                                </span>
                                {loading ? 'Redirecting to Google...' : 'Continue with Google'}
                            </button>

                            <button className="auth-btn" onClick={() => setView('extended')}>
                                <span className="auth-btn-icon"><FacebookIcon /></span>
                                Continue with Facebook
                            </button>

                            <button className="auth-btn" onClick={() => setView('email')}>
                                <span className="auth-btn-icon"><EmailIcon /></span>
                                Continue with email
                            </button>

                            <div className="auth-another-way" onClick={() => setView('extended')}>
                                Continue another way
                            </div>

                            <p className="auth-terms">
                                By continuing, you agree to Pro Image Toolkit's <a href="#">Terms of Use</a>. Read our <a href="#">Privacy Policy</a>.
                            </p>

                            <div className="auth-business">
                                <Briefcase size={18} />
                                Signing up for a business
                            </div>
                        </>
                    )}

                    {/* Extended Options View */}
                    {view === 'extended' && (
                        <>
                            <h2 className="auth-title">Continue to Pro Image Toolkit</h2>

                            {error && <div className="auth-error">{error}</div>}

                            <div className="extended-options-scroll" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
                                <button className="auth-btn">
                                    <span className="auth-btn-icon"><AppleIcon /></span>
                                    Continue with Apple
                                </button>

                                <button className="auth-btn" onClick={handleGoogleSignIn} disabled={loading}>
                                    <span className="auth-btn-icon">
                                        {loading ? <span className="spinner" style={{ width: '16px', height: '16px', borderTopColor: '#7c3aed' }}></span> : <GoogleIcon />}
                                    </span>
                                    {loading ? 'Redirecting...' : 'Continue with Google'}
                                </button>

                                <button className="auth-btn">
                                    <span className="auth-btn-icon"><FacebookIcon /></span>
                                    Continue with Facebook
                                </button>

                                <button className="auth-btn">
                                    <span className="auth-btn-icon"><MicrosoftIcon /></span>
                                    Continue with Microsoft
                                </button>

                                <button className="auth-btn">
                                    <span className="auth-btn-icon"><CleverIcon /></span>
                                    Continue with Clever
                                </button>

                                <button className="auth-btn" onClick={() => setView('email')}>
                                    <span className="auth-btn-icon"><EmailIcon /></span>
                                    Continue with email
                                </button>

                                <button className="auth-btn">
                                    <span className="auth-btn-icon"><EmailIcon /></span>
                                    Continue with work email
                                </button>

                                <button className="auth-btn">
                                    <span className="auth-btn-icon"><PhoneIcon /></span>
                                    Log in with phone number
                                </button>
                            </div>

                            <p className="auth-terms" style={{ marginTop: '16px' }}>
                                By continuing, you agree to Pro Image Toolkit's <a href="#">Terms of Use</a>. Read our <a href="#">Privacy Policy</a>.
                            </p>
                        </>
                    )}

                    {/* Email Form View */}
                    {view === 'email' && (
                        <>
                            <h2 className="auth-title">{isLogin ? 'Log in with email' : 'Sign up with email'}</h2>

                            {error && <div className="auth-error">{error}</div>}

                            <form className="email-form" onSubmit={handleEmailSubmit}>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        required
                                        minLength={6}
                                    />
                                </div>

                                <button type="submit" className="submit-btn" disabled={loading}>
                                    {loading ? (
                                        <span className="auth-loading">
                                            <span className="spinner"></span>
                                            Processing...
                                        </span>
                                    ) : (
                                        isLogin ? 'Log In' : 'Sign Up'
                                    )}
                                </button>
                            </form>

                            <div className="auth-toggle">
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                                <button onClick={() => setIsLogin(!isLogin)}>
                                    {isLogin ? 'Sign up' : 'Log in'}
                                </button>
                            </div>

                            <p className="auth-terms">
                                By continuing, you agree to Pro Image Toolkit's <a href="#">Terms of Use</a>. Read our <a href="#">Privacy Policy</a>.
                            </p>
                        </>
                    )}
                </div>

                {/* Right Side - Promo Image */}
                <div className="auth-image-section">
                    <button className="auth-close-btn" onClick={handleClose}>
                        <X size={18} />
                    </button>
                    <div className="auth-promo-content">
                        <div className="promo-laptop"></div>
                        <h2>Design with ease</h2>
                        <p>Create stunning images, convert formats, and edit like a pro with our powerful toolkit.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
