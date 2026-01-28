import React from 'react';
import { Sparkles, CheckCircle } from 'lucide-react';
import './LandingPage.css';

const LandingPage = ({ onSignupClick, onLoginClick }) => {
    return (
        <div className="landing-container">
            {/* Background elements if any... */}
            <div className="bg-animation">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
            </div>

            <header className="landing-header">
                <div className="landing-logo">
                    <div className="logo-icon">
                        <Sparkles size={24} />
                    </div>
                    <span>Pro Image Toolkit</span>
                </div>

                <nav className="landing-nav">
                    <button onClick={onLoginClick}>Image</button>
                    <button onClick={onLoginClick}>Video & Audio</button>
                    <button onClick={onLoginClick}>PDF & Documents</button>
                    <button onClick={onLoginClick}>GIF & Animation</button>
                    <button onClick={onLoginClick}>Image Editing</button>
                </nav>

                <div className="landing-auth-btns">
                    <button className="landing-btn login-btn" onClick={onLoginClick}>Log in</button>
                    <button className="landing-btn signup-btn" onClick={onSignupClick}>Sign up for free</button>
                </div>
            </header>

            <main className="landing-hero">
                <div className="hero-badge">
                    <Sparkles size={14} />
                    <span>The #1 Professional File Toolkit</span>
                </div>

                <h1 className="hero-title">
                    What will you <br />
                    <span className="gradient-text">design today?</span>
                </h1>

                <p className="hero-subtitle">
                    Convert, edit, and optimize your images with Pro Image Toolkit.
                    Professional results in seconds. Join millions of creators already using our tools.
                </p>

                <div className="hero-cta-group">
                    <button className="hero-cta primary" onClick={onSignupClick}>
                        Start designing for free
                    </button>
                    <button className="hero-cta secondary" onClick={onLoginClick}>
                        Log in to your account
                    </button>
                </div>

                <div className="hero-features">
                    <div className="feature-item">
                        <CheckCircle size={16} />
                        <span>No credit card required</span>
                    </div>
                    <div className="feature-item">
                        <CheckCircle size={16} />
                        <span>100+ Professional Tools</span>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LandingPage;
