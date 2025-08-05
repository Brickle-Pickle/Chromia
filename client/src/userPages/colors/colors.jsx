import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/app_context';
import { FaPalette, FaRandom, FaEye, FaUser, FaCopy, FaCheck } from 'react-icons/fa';
import { MdColorLens, MdTune } from 'react-icons/md';
import './colors.css';
import texts from './colors.json';

const Colors = () => {
    const navigate = useNavigate();
    const { 
        communityColors, 
        communityColorsLoading, 
        communityColorsPagination,
        fetchCommunityColors,
        copyToClipboard,
        getColorInfo
    } = useAppContext();

    const [copyNotification, setCopyNotification] = useState('');
    const [selectedColor, setSelectedColor] = useState(null);
    const [colorDetails, setColorDetails] = useState(null);

    // Load initial colors on component mount
    useEffect(() => {
        fetchCommunityColors(1, 12, true);
    }, [fetchCommunityColors]);

    // Handle copy color hex to clipboard
    const handleCopyHex = useCallback(async (hexColor, colorName) => {
        const result = await copyToClipboard(hexColor);
        if (result.success) {
            setCopyNotification(`${colorName} ${texts.colorCard.copied}`);
            setTimeout(() => setCopyNotification(''), 3000);
        }
    }, [copyToClipboard]);

    // Handle load more colors
    const handleLoadMore = useCallback(async () => {
        if (communityColorsPagination.hasMore && !communityColorsLoading) {
            await fetchCommunityColors(
                communityColorsPagination.page + 1, 
                communityColorsPagination.limit, 
                false
            );
        }
    }, [communityColorsPagination, communityColorsLoading, fetchCommunityColors]);

    // Handle color click for details
    const handleColorClick = useCallback(async (color) => {
        setSelectedColor(color);
        try {
            const details = await getColorInfo(color.color);
            setColorDetails(details);
        } catch (error) {
            console.error('Error fetching color details:', error);
        }
    }, [getColorInfo]);

    // Interactive elements handlers
    const handleRandomColor = useCallback(() => {
        if (communityColors.length > 0) {
            const randomIndex = Math.floor(Math.random() * communityColors.length);
            const randomColor = communityColors[randomIndex];
            handleColorClick(randomColor);
        }
    }, [communityColors, handleColorClick]);

    const handleColorWheel = useCallback(() => {
        // Generate a random color and show its details
        const randomHex = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
        const fakeColor = {
            _id: 'random',
            name: 'Random Color',
            color: randomHex,
            author: { userName: 'Color Wheel' }
        };
        handleColorClick(fakeColor);
    }, [handleColorClick]);

    // Render color card component
    const ColorCard = ({ color, index }) => (
        <div 
            className="color-card"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => handleColorClick(color)}
        >
            <div 
                className="color-swatch"
                style={{ backgroundColor: color.color }}
                title={texts.colorCard.copyHex}
            />
            <div className="color-info">
                <h3 className="color-name">{color.name}</h3>
                <div 
                    className="color-hex"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleCopyHex(color.color, color.name);
                    }}
                    title={texts.colorCard.copyHex}
                >
                    {color.color}
                </div>
                <div className="color-author">
                    <div className="author-icon">
                        <FaUser />
                    </div>
                    <span>{texts.colorCard.createdBy} {color.author?.userName || 'Unknown'}</span>
                </div>
            </div>
        </div>
    );

    // Render interactive elements
    const InteractiveCard = ({ icon, title, onClick }) => (
        <div className="interactive-card" onClick={onClick}>
            <div className="icon">{icon}</div>
            <h4 className="title">{title}</h4>
        </div>
    );

    return (
        <div className="color_page">
            <div className="container">
                {/* Header Section */}
                <header className="header">
                    <h1 className="title">{texts.title}</h1>
                    <h2 className="subtitle">{texts.subtitle}</h2>
                    <p className="description">{texts.description}</p>
                </header>

                {/* Interactive Elements Section */}
                <section className="interactive-section">
                    <div className="interactive-grid">
                        <InteractiveCard
                            icon={<MdColorLens />}
                            title={texts.interactiveElements.colorWheel}
                            onClick={handleColorWheel}
                        />
                        <InteractiveCard
                            icon={<FaRandom />}
                            title={texts.interactiveElements.randomColor}
                            onClick={handleRandomColor}
                        />
                        <InteractiveCard
                            icon={<FaPalette />}
                            title={texts.interactiveElements.colorMixer}
                            onClick={() => navigate('/color-palettes')}
                        />
                        <InteractiveCard
                            icon={<MdTune />}
                            title={texts.interactiveElements.colorHarmony}
                            onClick={() => {
                                if (selectedColor) {
                                    handleColorClick(selectedColor);
                                } else if (communityColors.length > 0) {
                                    handleColorClick(communityColors[0]);
                                }
                            }}
                        />
                    </div>
                </section>

                {/* Colors Grid Section */}
                <section className="colors-section">
                    {communityColorsLoading && communityColors.length === 0 ? (
                        <div className="loading">
                            <div className="loading-spinner"></div>
                            <p className="loading-text">{texts.loading}</p>
                        </div>
                    ) : communityColors.length === 0 ? (
                        <div className="empty">
                            <p>{texts.noColors}</p>
                        </div>
                    ) : (
                        <>
                            <div className="colors-grid">
                                {communityColors.map((color, index) => (
                                    <ColorCard 
                                        key={color._id} 
                                        color={color} 
                                        index={index}
                                    />
                                ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="actions">
                                {communityColorsPagination.hasMore && (
                                    <button 
                                        className="btn btn-secondary"
                                        onClick={handleLoadMore}
                                        disabled={communityColorsLoading}
                                    >
                                        {communityColorsLoading ? (
                                            <>
                                                <div className="loading-spinner" style={{ width: '16px', height: '16px' }}></div>
                                                Loading...
                                            </>
                                        ) : (
                                            <>
                                                <FaEye />
                                                {texts.loadMoreButton}
                                            </>
                                        )}
                                    </button>
                                )}
                                
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => navigate('/color-palettes')}
                                >
                                    <FaPalette />
                                    {texts.startUsingButton}
                                </button>
                            </div>
                        </>
                    )}
                </section>

                {/* Copy Notification */}
                {copyNotification && (
                    <div className={`copy-notification ${copyNotification ? 'show' : ''}`}>
                        <FaCheck style={{ marginRight: '8px' }} />
                        {copyNotification}
                    </div>
                )}

                {/* Enhanced Color Details Modal */}
                {selectedColor && colorDetails && (
                    <div className="color-details-overlay" onClick={() => {
                        setSelectedColor(null);
                        setColorDetails(null);
                    }}>
                        <div className="color-details-modal" onClick={(e) => e.stopPropagation()}>
                            {/* Modal Header */}
                            <div className="modal-header">
                                <h2 className="modal-title">{selectedColor.name}</h2>
                                <button 
                                    className="modal-close"
                                    onClick={() => {
                                        setSelectedColor(null);
                                        setColorDetails(null);
                                    }}
                                >
                                    ×
                                </button>
                            </div>

                            {/* Color Preview Section */}
                            <div className="color-preview-section">
                                <div 
                                    className="color-preview-large"
                                    style={{ backgroundColor: selectedColor.color }}
                                />
                                <div className="color-variations">
                                    {/* Generate lighter and darker variations */}
                                    {[0.8, 0.6, 0.4, 0.2].map((opacity, index) => (
                                        <div 
                                            key={index}
                                            className="color-variation"
                                            style={{ 
                                                backgroundColor: selectedColor.color,
                                                opacity: opacity
                                            }}
                                            title={`${Math.round(opacity * 100)}% opacity`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Color Information */}
                            <div className="color-details-content">
                                <div className="color-info-grid">
                                    {/* Hex Value */}
                                    <div className="color-info-item">
                                        <label>HEX</label>
                                        <div 
                                            className="color-value hex-value"
                                            onClick={() => handleCopyHex(selectedColor.color, selectedColor.name)}
                                        >
                                            <span>{selectedColor.color}</span>
                                            <FaCopy className="copy-icon" />
                                        </div>
                                    </div>

                                    {/* RGB Values */}
                                    <div className="color-info-item">
                                        <label>RGB</label>
                                        <div className="color-value">
                                            <span>
                                                rgb({colorDetails.rgb?.r}, {colorDetails.rgb?.g}, {colorDetails.rgb?.b})
                                            </span>
                                            <FaCopy 
                                                className="copy-icon"
                                                onClick={() => copyToClipboard(`rgb(${colorDetails.rgb?.r}, ${colorDetails.rgb?.g}, ${colorDetails.rgb?.b})`)}
                                            />
                                        </div>
                                    </div>

                                    {/* HSL Values */}
                                    <div className="color-info-item">
                                        <label>HSL</label>
                                        <div className="color-value">
                                            <span>
                                                hsl({colorDetails.hsl?.h}°, {colorDetails.hsl?.s}%, {colorDetails.hsl?.l}%)
                                            </span>
                                            <FaCopy 
                                                className="copy-icon"
                                                onClick={() => copyToClipboard(`hsl(${colorDetails.hsl?.h}, ${colorDetails.hsl?.s}%, ${colorDetails.hsl?.l}%)`)}
                                            />
                                        </div>
                                    </div>

                                    {/* CMYK Values (if available) */}
                                    {colorDetails.cmyk && (
                                        <div className="color-info-item">
                                            <label>CMYK</label>
                                            <div className="color-value">
                                                <span>
                                                    cmyk({colorDetails.cmyk?.c}%, {colorDetails.cmyk?.m}%, {colorDetails.cmyk?.y}%, {colorDetails.cmyk?.k}%)
                                                </span>
                                                <FaCopy 
                                                    className="copy-icon"
                                                    onClick={() => copyToClipboard(`cmyk(${colorDetails.cmyk?.c}%, ${colorDetails.cmyk?.m}%, ${colorDetails.cmyk?.y}%, ${colorDetails.cmyk?.k}%)`)}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Author Information */}
                                <div className="author-section">
                                    <div className="author-info">
                                        <div className="author-avatar">
                                            <FaUser />
                                        </div>
                                        <div className="author-details">
                                            <span className="author-label">Creado por</span>
                                            <span className="author-name">{selectedColor.author?.userName || 'Unknown'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="modal-actions">
                                    <button 
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            // Generate color palette based on this color
                                            navigate('/color-palettes', { 
                                                state: { baseColor: selectedColor.color } 
                                            });
                                        }}
                                    >
                                        <FaPalette />
                                        Crear paleta
                                    </button>
                                    <button 
                                        onClick={() => handleCopyHex(selectedColor.color, selectedColor.name)}
                                        className="btn btn-primary"
                                    >
                                        <FaCopy />
                                        Copiar Hex
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Colors;