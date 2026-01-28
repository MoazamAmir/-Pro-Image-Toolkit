import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, Wand2, Layers, Palette, ArrowRight, Check, Star, Github, Twitter, Linkedin, Instagram, Mail, Phone, MapPin, Send } from 'lucide-react';
import AuthModal from '../Auth/AuthModal';
import './LandingPage.css';

const LandingPage = ({ onLoginSuccess }) => {
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [pendingTool, setPendingTool] = useState(null);
    const [scrollY, setScrollY] = useState(0);
    const [email, setEmail] = useState('');

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        {
            icon: <Zap />,
            title: "Lightning Fast",
            desc: "Process images in milliseconds with our optimized engine"
        },
        {
            icon: <Wand2 />,
            title: "AI-Powered",
            desc: "Smart enhancement & automatic optimization"
        },
        {
            icon: <Layers />,
            title: "Batch Processing",
            desc: "Handle hundreds of files at once effortlessly"
        },
        {
            icon: <Palette />,
            title: "Pro Editing",
            desc: "Advanced tools for creative professionals"
        }
    ];

    const tools = [
        { name: "Image Resizer", uses: "2.4M uses" },
        { name: "MP4 to MP3", uses: "1.8M uses" },
        { name: "PDF to WORD", uses: "3.1M uses" },
        { name: "Video to GIF", uses: "892K uses" },
        { name: "Image Compressor", uses: "4.2M uses" },
        { name: "Image to PDF", uses: "1.5M uses" }
    ];

    const handleActionClick = (toolName = null) => {
        setPendingTool(toolName);
        setShowAuthModal(true);
    };

    const footerLinks = {
        product: [
            { name: "Features", href: "#" },
            { name: "Pricing", href: "#" },
            { name: "API", href: "#" },
            { name: "Integrations", href: "#" },
            { name: "Changelog", href: "#" }
        ],
        company: [
            { name: "About Us", href: "#" },
            { name: "Careers", href: "#" },
            { name: "Blog", href: "#" },
            { name: "Press Kit", href: "#" },
            { name: "Contact", href: "#" }
        ],
        resources: [
            { name: "Documentation", href: "#" },
            { name: "Tutorials", href: "#" },
            { name: "Community", href: "#" },
            { name: "Support", href: "#" },
            { name: "Status", href: "#" }
        ],
        legal: [
            { name: "Privacy Policy", href: "#" },
            { name: "Terms of Service", href: "#" },
            { name: "Cookie Policy", href: "#" },
            { name: "GDPR", href: "#" }
        ]
    };

    const handleNewsletterSubmit = (e) => {
        e.preventDefault();
        alert('Thanks for subscribing!');
        setEmail('');
    };

    return (
        <div className="landing-container">
            {/* Animated Background */}
            <div className="bg-animation">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
            </div>

            {/* Header */}
            <header className="landing-header">
                <div className="landing-logo">
                    <div className="logo-icon">
                        <Sparkles size={28} strokeWidth={2.5} />
                    </div>
                    <span>Pro Image Toolkit</span>
                </div>

                <nav className="landing-nav">
                    <button onClick={() => handleActionClick()}>Features</button>
                    <button onClick={() => handleActionClick()}>Tools</button>
                    <button onClick={() => handleActionClick()}>Pricing</button>
                    <button onClick={() => handleActionClick()}>API</button>
                </nav>

                <div className="landing-auth-btns">
                    <button className="landing-btn login-btn" onClick={() => handleActionClick()}>
                        Log in
                    </button>
                    <button className="landing-btn signup-btn" onClick={() => handleActionClick()}>
                        <span>Get started</span>
                        <ArrowRight size={16} />
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <main className="landing-hero">
                <div className="hero-badge">
                    <Star size={14} fill="currentColor" />
                    <span>Trusted by 10M+ creators worldwide</span>
                </div>

                <h1 className="hero-title">
                    Transform Your
                    <span className="gradient-text"> Visual Content</span>
                    <br />
                    In Seconds
                </h1>

                <p className="hero-subtitle">
                    Professional-grade image processing, video conversion, and creative tools.
                    <br />
                    No software installation required. Start creating instantly.
                </p>

                <div className="hero-cta-group">
                    <button className="hero-cta primary" onClick={() => handleActionClick()}>
                        <span>Start creating for free</span>
                        <ArrowRight size={20} />
                    </button>
                    <button className="hero-cta secondary" onClick={() => handleActionClick()}>
                        <span>Watch demo</span>
                    </button>
                </div>

                <div className="hero-features">
                    <div className="feature-item">
                        <Check size={16} />
                        <span>No credit card required</span>
                    </div>
                    <div className="feature-item">
                        <Check size={16} />
                        <span>Free forever plan</span>
                    </div>
                    <div className="feature-item">
                        <Check size={16} />
                        <span>Cancel anytime</span>
                    </div>
                </div>
            </main>

            {/* Feature Cards */}
            <section className="features-section">
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="feature-card"
                            style={{ animationDelay: `${index * 0.1}s` }}
                            onClick={() => handleActionClick(feature.title)}
                        >
                            <div className="feature-icon">{feature.icon}</div>
                            <h3>{feature.title}</h3>
                            <p>{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="stats-container">
                    <div className="stat-item">
                        <div className="stat-number">10M+</div>
                        <div className="stat-label">Active Users</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">500M+</div>
                        <div className="stat-label">Files Processed</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">99.9%</div>
                        <div className="stat-label">Uptime</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">150+</div>
                        <div className="stat-label">Countries</div>
                    </div>
                </div>
            </section>

            {/* Tools Showcase */}
            <section className="tools-section">
                <h2 className="section-title">Popular Tools</h2>
                <div className="tools-grid">
                    {tools.map((tool, index) => (
                        <div
                            key={index}
                            className="tool-card"
                            onClick={() => handleActionClick(tool.name)}
                        >
                            <div className="tool-info">
                                <h4>{tool.name}</h4>
                                <span className="tool-uses">{tool.uses}</span>
                            </div>
                            <ArrowRight size={20} className="tool-arrow" />
                        </div>
                    ))}
                </div>
            </section>

            {/* Visual Showcase */}
            <section className="showcase-section">
                <h2 className="section-title">See What's Possible</h2>
                <div className="showcase-grid">
                    <div className="showcase-card large" onClick={() => handleActionClick("Image Resizer")}>
                        <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format" alt="Design 1" />
                        <div className="showcase-overlay">
                            <span>Image Processing</span>
                        </div>
                    </div>
                    <div className="showcase-card" onClick={() => handleActionClick("Sharpen Effect")}>
                        <img src="https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&auto=format" alt="Design 2" />
                        <div className="showcase-overlay">
                            <span>AI Enhancement</span>
                        </div>
                    </div>
                    <div className="showcase-card" onClick={() => handleActionClick("Video to GIF")}>
                        <img src="https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400&auto=format" alt="Design 3" />
                        <div className="showcase-overlay">
                            <span>Video Editing</span>
                        </div>
                    </div>
                    <div className="showcase-card" onClick={() => handleActionClick("Add Watermark")}>
                        <img src="https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&auto=format" alt="Design 4" />
                        <div className="showcase-overlay">
                            <span>Creative Tools</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="final-cta">
                <h2>Ready to Create Something Amazing?</h2>
                <p>Join millions of creators using Pro Image Toolkit</p>
                <button className="hero-cta primary" onClick={() => handleActionClick()}>
                    <span>Get started now</span>
                    <ArrowRight size={20} />
                </button>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    {/* Footer Top */}
                    <div className="footer-top">
                        <div className="footer-brand">
                            <div className="footer-logo">
                                <div className="logo-icon">
                                    <Sparkles size={28} strokeWidth={2.5} />
                                </div>
                                <span>Pro Image Toolkit</span>
                            </div>
                            <p className="footer-tagline">
                                Transform your visual content with professional-grade tools.
                                Trusted by millions of creators worldwide.
                            </p>
                            <div className="footer-social">
                                <a href="#" className="social-link" aria-label="Twitter">
                                    <Twitter size={20} />
                                </a>
                                <a href="#" className="social-link" aria-label="Github">
                                    <Github size={20} />
                                </a>
                                <a href="#" className="social-link" aria-label="LinkedIn">
                                    <Linkedin size={20} />
                                </a>
                                <a href="#" className="social-link" aria-label="Instagram">
                                    <Instagram size={20} />
                                </a>
                            </div>
                        </div>

                        <div className="footer-links">
                            <div className="footer-column">
                                <h4>Product</h4>
                                <ul>
                                    {footerLinks.product.map((link, index) => (
                                        <li key={index}>
                                            <a href={link.href}>{link.name}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="footer-column">
                                <h4>Company</h4>
                                <ul>
                                    {footerLinks.company.map((link, index) => (
                                        <li key={index}>
                                            <a href={link.href}>{link.name}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="footer-column">
                                <h4>Resources</h4>
                                <ul>
                                    {footerLinks.resources.map((link, index) => (
                                        <li key={index}>
                                            <a href={link.href}>{link.name}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="footer-column">
                                <h4>Legal</h4>
                                <ul>
                                    {footerLinks.legal.map((link, index) => (
                                        <li key={index}>
                                            <a href={link.href}>{link.name}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="footer-newsletter">
                            <h4>Stay Updated</h4>
                            <p>Get the latest updates and news delivered to your inbox.</p>
                            <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
                                <div className="newsletter-input-group">
                                    <Mail size={18} />
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="newsletter-btn">
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Footer Bottom */}
                    <div className="footer-bottom">
                        <div className="footer-copyright">
                            <p>© 2025 Pro Image Toolkit. All rights reserved.</p>
                        </div>
                        <div className="footer-contact">
                            <a href="mailto:hello@proimagetoolkit.com" className="contact-item">
                                <Mail size={16} />
                                <span>hello@proimagetoolkit.com</span>
                            </a>
                            <a href="tel:+1234567890" className="contact-item">
                                <Phone size={16} />
                                <span>+1 (234) 567-890</span>
                            </a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Auth Modal */}
            {showAuthModal && (
                <AuthModal
                    isOpen={true}
                    onClose={() => setShowAuthModal(false)}
                    onAuthSuccess={(user) => {
                        setShowAuthModal(false);
                        onLoginSuccess(user, pendingTool);
                    }}
                />
            )}
        </div>
    );
};

export default LandingPage;