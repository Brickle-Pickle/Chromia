import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaExternalLinkAlt, FaHeart, FaPalette, FaEye } from 'react-icons/fa';
import { HiColorSwatch } from 'react-icons/hi';
import { useAppContext } from '../../context/app_context.jsx';
import footerData from './footer.json';
import './footer.css';

const Footer = () => {
    const { palettes } = useAppContext();
    const [isVisible, setIsVisible] = useState(false);

    // Colors for each day of the week
    const weeklyColors = {
        'Mo': '#6366f1', // Monday - Indigo
        'Tu': '#818cf8', // Tuesday - Light Indigo
        'We': '#4f46e5', // Wednesday - Dark Indigo
        'Th': '#10b981', // Thursday - Emerald
        'Fr': '#f59e0b', // Friday - Amber
        'Sa': '#ef4444', // Saturday - Red
        'Su': '#3b82f6'  // Sunday - Blue
    };

    // Get current day of the week
    const getCurrentDayColor = () => {
        const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
        const today = new Date().getDay();
        const dayKey = days[today];
        return {
            color: weeklyColors[dayKey],
            dayKey: dayKey,
            dayName: getDayName(dayKey)
        };
    };

    // Get full day name in Spanish
    const getDayName = (dayKey) => {
        const dayNames = {
            'Mo': 'Lunes',
            'Tu': 'Martes', 
            'We': 'Miércoles',
            'Th': 'Jueves',
            'Fr': 'Viernes',
            'Sa': 'Sábado',
            'Su': 'Domingo'
        };
        return dayNames[dayKey];
    };

    // Get current day info
    const currentDay = getCurrentDayColor();

    // Array of colors for animated background and particles
    const animatedColors = Object.values(weeklyColors);

    // Intersection Observer for scroll animations
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.1 }
        );

        const footerElement = document.querySelector('.footer');
        if (footerElement) {
            observer.observe(footerElement);
        }

        return () => {
            if (footerElement) {
                observer.unobserve(footerElement);
            }
        };
    }, []);

    const handleLogoClick = () => {
        // Add a fun bounce animation to the logo
        const logo = document.querySelector('.footer__logo-img');
        if (logo) {
            logo.classList.add('footer__logo-bounce');
            setTimeout(() => {
                logo.classList.remove('footer__logo-bounce');
            }, 600);
        }
    };

    const handleSocialHover = (e) => {
        // Create ripple effect on social icons
        const rect = e.currentTarget.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = 40;
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('footer__ripple');
        
        e.currentTarget.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    };

    return (
        <footer className={`footer ${isVisible ? 'footer--visible' : ''}`}>
            {/* Animated background gradient */}
            <div 
                className="footer__background"
                style={{
                    background: `linear-gradient(135deg, ${currentDay.color}20, ${currentDay.color}10)`
                }}
            />
            
            {/* Floating particles */}
            <div className="footer__particles">
                {[...Array(6)].map((_, i) => (
                    <div 
                        key={i} 
                        className="footer__particle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            backgroundColor: animatedColors[Math.floor(Math.random() * animatedColors.length)]
                        }}
                    />
                ))}
            </div>

            <div className="container">
                <div className="footer__content">
                    {/* Brand Section */}
                    <div className="footer__brand">
                        <div className="footer__logo" onClick={handleLogoClick}>
                            <img 
                                src="/logo.png" 
                                alt="Chromia Logo" 
                                className="footer__logo-img"
                            />
                            <div className="footer__logo-text">
                                <h3 className="footer__brand-name">{footerData.company.name}</h3>
                                <p className="footer__brand-tagline">{footerData.company.tagline}</p>
                            </div>
                        </div>
                        <p className="footer__description">
                            {footerData.company.description}
                        </p>
                        
                        {/* Stats Section */}
                        <div className="footer__stats">
                            <div className="footer__stat">
                                <FaPalette className="footer__stat-icon" />
                                <span className="footer__stat-number">{palettes.length}</span>
                                <span className="footer__stat-label">Paletas</span>
                            </div>
                            <div className="footer__stat">
                                <HiColorSwatch className="footer__stat-icon" />
                                <span className="footer__stat-number">{palettes.length * 5}</span>
                                <span className="footer__stat-label">Colores</span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Section */}
                    <div className="footer__section">
                        <h4 className="footer__section-title">Navegación</h4>
                        <nav className="footer__nav">
                            <Link to="/colors" className="footer__nav-link">
                                <HiColorSwatch className="footer__nav-icon" />
                                {footerData.navigation.colors}
                            </Link>
                            <Link to="/color-palettes" className="footer__nav-link">
                                <FaPalette className="footer__nav-icon" />
                                {footerData.navigation.palettes}
                            </Link>
                        </nav>
                    </div>

                    {/* Legal Section */}
                    <div className="footer__section">
                        <h4 className="footer__section-title">Legal</h4>
                        <div className="footer__links">
                            <a href="/terms" className="footer__link">
                                {footerData.links.termsAndConditions}
                            </a>
                            <a href="/privacy" className="footer__link">
                                {footerData.links.privacyPolicy}
                            </a>
                        </div>
                    </div>

                    {/* Social Section */}
                    <div className="footer__section">
                        <h4 className="footer__section-title">{footerData.social.connectWith}</h4>
                        <div className="footer__social">
                            <a 
                                href="https://github.com/Brickle-Pickle" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="footer__social-link"
                                onMouseEnter={handleSocialHover}
                            >
                                <FaGithub className="footer__social-icon" />
                                <span>{footerData.links.github}</span>
                            </a>
                            <a 
                                href="https://brickle-pickle.vercel.app" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="footer__social-link"
                                onMouseEnter={handleSocialHover}
                            >
                                <FaExternalLinkAlt className="footer__social-icon" />
                                <span>{footerData.links.portfolio}</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="footer__bottom">
                    <div className="footer__copyright">
                        <p>{footerData.copyright.text}</p>
                        <p className="footer__made-by">
                            {footerData.copyright.madeBy} <FaHeart className="footer__heart" /> {footerData.copyright.by}
                        </p>
                    </div>
                    
                    {/* Interactive color picker */}
                    <div className="footer__color-picker">
                        <span className="footer__color-picker-label">Color del {currentDay.dayName}:</span>
                        <div 
                            className="footer__color-sample"
                            style={{ backgroundColor: currentDay.color }}
                            title={`${currentDay.dayName}: ${currentDay.color}`}
                        />
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;