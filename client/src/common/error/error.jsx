import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/app_context.jsx';
import './error.css';
import errorTexts from './error.json';

const Error404 = () => {
    const navigate = useNavigate();
    const { copyToClipboard } = useAppContext();
    
    // State for the color generator
    const [currentColor, setCurrentColor] = useState('#6366f1');
    const [showCopyNotification, setShowCopyNotification] = useState(false);
    
    // Generate random color
    const generateRandomColor = useCallback(() => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }, []);
    
    // Convert hex to RGB
    const hexToRgb = useCallback((hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }, []);
    
    // Convert hex to HSL
    const hexToHsl = useCallback((hex) => {
        const rgb = hexToRgb(hex);
        if (!rgb) return null;
        
        const r = rgb.r / 255;
        const g = rgb.g / 255;
        const b = rgb.b / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
                default: h = 0;
            }
            h /= 6;
        }
        
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }, [hexToRgb]);
    
    // Handle color generation
    const handleGenerateColor = useCallback(() => {
        const newColor = generateRandomColor();
        setCurrentColor(newColor);
    }, [generateRandomColor]);
    
    // Handle color copy
    const handleCopyColor = useCallback(async () => {
        const result = await copyToClipboard(currentColor);
        if (result.success) {
            setShowCopyNotification(true);
            setTimeout(() => setShowCopyNotification(false), 3000);
        }
    }, [currentColor, copyToClipboard]);
    
    // Handle navigation
    const handleGoHome = useCallback(() => {
        navigate('/');
    }, [navigate]);
    
    const handleExplorePalettes = useCallback(() => {
        navigate('/color-palettes');
    }, [navigate]);
    
    // Generate initial color on mount
    useEffect(() => {
        handleGenerateColor();
    }, [handleGenerateColor]);
    
    // Get color values
    const rgb = hexToRgb(currentColor);
    const hsl = hexToHsl(currentColor);
    
    return (
        <div className="error_404">
            {/* Floating background colors */}
            <div className="floating-colors">
                {errorTexts.animations.floatingColors.map((color, index) => (
                    <div
                        key={index}
                        className="floating-color"
                        style={{ backgroundColor: color }}
                    />
                ))}
            </div>
            
            {/* Copy notification */}
            {showCopyNotification && (
                <div className="copy-notification">
                    {errorTexts.colorCopied}
                </div>
            )}
            
            <div className="error-container">
                {/* Main 404 content */}
                <h1 className="error-title">{errorTexts.title}</h1>
                <h2 className="error-subtitle">{errorTexts.subtitle}</h2>
                <p className="error-description">{errorTexts.description}</p>
                
                {/* Navigation buttons */}
                <div className="button-container">
                    <button 
                        className="error-button primary-button"
                        onClick={handleGoHome}
                        aria-label={errorTexts.homeButton}
                    >
                        <svg 
                            width="20" 
                            height="20" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2"
                        >
                            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                            <polyline points="9,22 9,12 15,12 15,22"/>
                        </svg>
                        {errorTexts.homeButton}
                    </button>
                    
                    <button 
                        className="error-button secondary-button"
                        onClick={handleExplorePalettes}
                        aria-label={errorTexts.exploreButton}
                    >
                        <svg 
                            width="20" 
                            height="20" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2"
                        >
                            <circle cx="11" cy="11" r="8"/>
                            <path d="m21 21-4.35-4.35"/>
                        </svg>
                        {errorTexts.exploreButton}
                    </button>
                </div>
                
                {/* Interactive color generator */}
                <div className="color-generator">
                    <h3 className="generator-title">{errorTexts.colorGeneratorTitle}</h3>
                    
                    {/* Color display */}
                    <div 
                        className="color-display"
                        style={{ backgroundColor: currentColor }}
                        onClick={handleCopyColor}
                        role="button"
                        tabIndex={0}
                        aria-label={`Current color: ${currentColor}. Click to copy.`}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleCopyColor();
                            }
                        }}
                    />
                    
                    {/* Color information */}
                    <div className="color-info">
                        <div className="color-value">
                            <div className="color-label">{errorTexts.colorInfo.hex}</div>
                            <div className="color-code">{currentColor.toUpperCase()}</div>
                        </div>
                        
                        {rgb && (
                            <div className="color-value">
                                <div className="color-label">{errorTexts.colorInfo.rgb}</div>
                                <div className="color-code">{`${rgb.r}, ${rgb.g}, ${rgb.b}`}</div>
                            </div>
                        )}
                        
                        {hsl && (
                            <div className="color-value">
                                <div className="color-label">{errorTexts.colorInfo.hsl}</div>
                                <div className="color-code">{`${hsl.h}°, ${hsl.s}%, ${hsl.l}%`}</div>
                            </div>
                        )}
                    </div>
                    
                    {/* Generator buttons */}
                    <div className="generator-buttons">
                        <button 
                            className="generator-button generate-btn"
                            onClick={handleGenerateColor}
                            aria-label={errorTexts.generateColorButton}
                        >
                            <svg 
                                width="16" 
                                height="16" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2"
                            >
                                <polyline points="23 4 23 10 17 10"/>
                                <polyline points="1 20 1 14 7 14"/>
                                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                            </svg>
                            {errorTexts.generateColorButton}
                        </button>
                        
                        <button 
                            className="generator-button copy-btn"
                            onClick={handleCopyColor}
                            aria-label={errorTexts.copyColorButton}
                        >
                            <svg 
                                width="16" 
                                height="16" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2"
                            >
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                            </svg>
                            {errorTexts.copyColorButton}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Error404;