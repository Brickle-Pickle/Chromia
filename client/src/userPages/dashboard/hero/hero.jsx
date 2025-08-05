import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../../context/app_context.jsx';
import { FiTrendingUp, FiInfo, FiArrowRight, FiUsers, FiEye } from 'react-icons/fi';
import { BiPalette } from 'react-icons/bi';
import paintingImage from '../../../assets/painting.png';
import heroData from './hero.json';
import './hero.css';

const Hero = () => {
    const { isAuthenticated, user } = useAppContext();
    const [animatedStats, setAnimatedStats] = useState({
        palettes: 0,
        users: 0,
        colors: 0
    });

    // Simulate animated counters for stats
    useEffect(() => {
        const targetStats = {
            palettes: 1250,
            users: 890,
            colors: 15600
        };

        const duration = 2000; // 2 seconds
        const steps = 60; // 60 steps for smooth animation
        const stepDuration = duration / steps;

        let currentStep = 0;
        const timer = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;
            
            setAnimatedStats({
                palettes: Math.floor(targetStats.palettes * progress),
                users: Math.floor(targetStats.users * progress),
                colors: Math.floor(targetStats.colors * progress)
            });

            if (currentStep >= steps) {
                clearInterval(timer);
                setAnimatedStats(targetStats);
            }
        }, stepDuration);

        return () => clearInterval(timer);
    }, []);

    // Feature icons mapping
    const featureIcons = [
        <BiPalette className="feature-icon" />,
        <FiTrendingUp className="feature-icon" />,
        <FiInfo className="feature-icon" />
    ];

    // Handle interactive feature clicks
    const handleFeatureClick = (index) => {
        // Add subtle animation or feedback
        console.log(`Feature ${index + 1} clicked`);
    };

    // Handle stat item clicks
    const handleStatClick = (statType) => {
        console.log(`${statType} stat clicked`);
    };

    return (
        <section className="hero">
            <div className="container">
                <div className="hero-content">
                    {/* Text Content */}
                    <div className="hero-text">
                        <h1 className="hero-title">
                            {heroData.title}
                        </h1>
                        
                        <h2 className="hero-subtitle">
                            {heroData.subtitle}
                        </h2>
                        
                        <p className="hero-description">
                            {heroData.description}
                        </p>

                        {/* Features List */}
                        <div className="hero-features">
                            {heroData.features.map((feature, index) => (
                                <div 
                                    key={index}
                                    className="feature-item"
                                    onClick={() => handleFeatureClick(index)}
                                    tabIndex="0"
                                    role="button"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            handleFeatureClick(index);
                                        }
                                    }}
                                >
                                    {featureIcons[index]}
                                    <div className="feature-content">
                                        <h4>{feature.title}</h4>
                                        <p>{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Call to Action Buttons */}
                        <div className="hero-cta">
                            {!isAuthenticated ? (
                                <Link to="/login" className="cta-primary">
                                    {heroData.cta.login}
                                    <FiArrowRight />
                                </Link>
                            ) : (
                                <Link to="/color-palettes" className="cta-primary">
                                    {heroData.cta.create}
                                    <BiPalette />
                                </Link>
                            )}
                            
                            <Link to="/colors" className="cta-secondary">
                                {heroData.cta.explore}
                                <FiEye />
                            </Link>
                        </div>
                    </div>

                    {/* Visual Content */}
                    <div className="hero-visual">
                        {/* Main Image with Floating Elements */}
                        <div className="hero-image-container">
                            <img 
                                src={paintingImage} 
                                alt="Chromia - Color Palette Creation"
                                className="hero-image"
                            />
                            
                            {/* Floating Color Swatches */}
                            <div className="floating-colors">
                                <div className="color-swatch-float"></div>
                                <div className="color-swatch-float"></div>
                                <div className="color-swatch-float"></div>
                                <div className="color-swatch-float"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;