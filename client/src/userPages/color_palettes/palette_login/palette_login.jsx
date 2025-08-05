import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BiPalette } from 'react-icons/bi';
import { FiSave, FiShare2, FiLogIn, FiUserPlus } from 'react-icons/fi';
import { useAppContext } from '../../../context/app_context.jsx';
import './palette_login.css';
import paletteLoginData from './palette_login.json';

const PaletteLogin = () => {
    const { copyToClipboard } = useAppContext();
    const [selectedColor, setSelectedColor] = useState(null);
    const [colorInfo, setColorInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Icon mapping for features
    const iconMap = {
        palette: BiPalette,
        save: FiSave,
        share: FiShare2
    };

    // Handle color click to get color information
    const handleColorClick = async (color) => {
        if (selectedColor === color) {
            setSelectedColor(null);
            setColorInfo(null);
            return;
        }

        setSelectedColor(color);
        setIsLoading(true);

        try {
            // Call The Color API to get color information
            const cleanColor = color.replace('#', '');
            const response = await fetch(`https://www.thecolorapi.com/id?hex=${cleanColor}`);
            
            if (response.ok) {
                const data = await response.json();
                setColorInfo({
                    hex: data.hex.value,
                    name: data.name.value,
                    rgb: `rgb(${data.rgb.r}, ${data.rgb.g}, ${data.rgb.b})`,
                    hsl: `hsl(${data.hsl.h}, ${data.hsl.s}%, ${data.hsl.l}%)`
                });
            } else {
                // Fallback if API fails
                setColorInfo({
                    hex: color,
                    name: 'Color Personalizado',
                    rgb: hexToRgb(color),
                    hsl: 'HSL no disponible'
                });
            }
        } catch (error) {
            console.error('Error fetching color info:', error);
            // Fallback if API fails
            setColorInfo({
                hex: color,
                name: 'Color Personalizado',
                rgb: hexToRgb(color),
                hsl: 'HSL no disponible'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Helper function to convert hex to RGB
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
            const r = parseInt(result[1], 16);
            const g = parseInt(result[2], 16);
            const b = parseInt(result[3], 16);
            return `rgb(${r}, ${g}, ${b})`;
        }
        return 'RGB no disponible';
    };

    // Handle color info click to copy to clipboard
    const handleColorInfoClick = async () => {
        if (colorInfo) {
            const result = await copyToClipboard(colorInfo.hex);
            if (result.success) {
                // You could add a toast notification here
                console.log('Color copied to clipboard!');
            }
        }
    };

    // Animation effect for color swatches
    useEffect(() => {
        const swatches = document.querySelectorAll('.color_swatch');
        swatches.forEach((swatch, index) => {
            swatch.style.animationDelay = `${index * 0.1}s`;
        });
    }, []);

    return (
        <div className="palette_login">
            <div className="palette_login_container">
                <div className="palette_login_content">
                    {/* Left Section - Information */}
                    <div className="palette_login_info">
                        <div className="palette_login_header">
                            <h1>{paletteLoginData.title}</h1>
                            <p>{paletteLoginData.subtitle}</p>
                            <p>{paletteLoginData.description}</p>
                        </div>

                        <div className="palette_login_features">
                            {paletteLoginData.features.map((feature, index) => {
                                const IconComponent = iconMap[feature.icon];
                                return (
                                    <div key={index} className="feature_item">
                                        <div className="feature_icon">
                                            <IconComponent />
                                        </div>
                                        <div className="feature_content">
                                            <h3>{feature.title}</h3>
                                            <p>{feature.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <ul className="benefits_list">
                            {paletteLoginData.benefits.map((benefit, index) => (
                                <li key={index}>{benefit}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Right Section - Interactive Demo */}
                    <div className="palette_login_demo">
                        <div className="demo_container">
                            <div className="demo_header">
                                <h2>{paletteLoginData.colorDemo.title}</h2>
                                <p>{paletteLoginData.colorDemo.subtitle}</p>
                            </div>

                            <div className="color_grid">
                                {paletteLoginData.colorDemo.colors.map((color, index) => (
                                    <div
                                        key={index}
                                        className="color_swatch"
                                        style={{ backgroundColor: color }}
                                        onClick={() => handleColorClick(color)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                handleColorClick(color);
                                            }
                                        }}
                                        tabIndex={0}
                                        role="button"
                                        aria-label={`Color ${color}`}
                                    />
                                ))}
                            </div>

                            <div 
                                className={`color_info ${selectedColor ? 'active' : ''}`}
                                onClick={handleColorInfoClick}
                                style={{ cursor: colorInfo ? 'pointer' : 'default' }}
                                role={colorInfo ? 'button' : 'status'}
                                tabIndex={colorInfo ? 0 : -1}
                                aria-label={colorInfo ? `Click to copy ${colorInfo.hex}` : undefined}
                            >
                                {isLoading ? (
                                    <div>Cargando información del color...</div>
                                ) : colorInfo ? (
                                    <>
                                        <div className="color_code">{colorInfo.hex}</div>
                                        <div className="color_name">{colorInfo.name}</div>
                                    </>
                                ) : (
                                    <>
                                        <div className="color_code">Selecciona un color</div>
                                        <div className="color_name">Haz clic en cualquier color para ver su información</div>
                                    </>
                                )}
                            </div>

                            <div className="cta_section">
                                <div className="cta_buttons">
                                    <Link to="/login" className="cta_button cta_primary">
                                        <FiLogIn />
                                        {paletteLoginData.cta.primary}
                                    </Link>
                                    <Link to="/register" className="cta_button cta_secondary">
                                        <FiUserPlus />
                                        {paletteLoginData.cta.secondary}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaletteLogin;