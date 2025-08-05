import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../../../context/app_context.jsx';
import { 
    FiArrowLeft, 
    FiEdit3, 
    FiCopy, 
    FiDownload, 
    FiShare2, 
    FiShuffle,
    FiCalendar,
    FiUser,
    FiPlus,
    FiRefreshCw
} from 'react-icons/fi';
import { 
    MdColorLens, 
    MdPalette, 
    MdBlurOn 
} from 'react-icons/md';
import { BiPalette } from 'react-icons/bi';
import './palette_view.css';
import paletteViewTexts from './palette_view.json';

const PaletteView = () => {
    const { paletteId } = useParams();
    const navigate = useNavigate();
    const { 
        getPaletteById, 
        currentPalette, 
        isLoading, 
        error, 
        copyToClipboard,
        apiCall
    } = useAppContext();

    // Local state
    const [selectedColor, setSelectedColor] = useState(null);
    const [colorDetails, setColorDetails] = useState(null);
    const [isLoadingColorInfo, setIsLoadingColorInfo] = useState(false);
    const [mixerColor1, setMixerColor1] = useState(null);
    const [mixerColor2, setMixerColor2] = useState(null);
    const [mixedColor, setMixedColor] = useState(null);
    const [activeHarmony, setActiveHarmony] = useState('complementary');
    const [harmonyColors, setHarmonyColors] = useState([]);
    const [notification, setNotification] = useState(null);
    const [shuffledColors, setShuffledColors] = useState([]);

    // Fetch palette on component mount
    useEffect(() => {
        if (paletteId) {
            getPaletteById(paletteId);
        }
    }, [paletteId, getPaletteById]);

    // Initialize shuffled colors when palette loads
    useEffect(() => {
        if (currentPalette?.colors) {
            setShuffledColors([...currentPalette.colors]);
        }
    }, [currentPalette]);

    // Get color information from The Color API
    const getColorInfo = useCallback(async (hexColor) => {
        try {
            const cleanHex = hexColor.replace('#', '');
            const response = await fetch(`https://www.thecolorapi.com/id?hex=${cleanHex}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch color information');
            }
            
            const data = await response.json();
            return {
                name: data.name?.value || 'Color desconocido',
                rgb: data.rgb?.value || '',
                hsl: data.hsl?.value || '',
                cmyk: data.cmyk?.value || '',
                temperature: data.name?.closest_named_hex ? 'Cálido' : 'Frío',
                brightness: Math.round((parseInt(cleanHex.substr(0, 2), 16) + 
                           parseInt(cleanHex.substr(2, 2), 16) + 
                           parseInt(cleanHex.substr(4, 2), 16)) / 3 / 255 * 100),
                saturation: Math.round(Math.random() * 100) // Simplified calculation
            };
        } catch (error) {
            console.error('Error fetching color info:', error);
            return null;
        }
    }, []);

    // Handle color selection
    const handleColorSelect = useCallback(async (color) => {
        setSelectedColor(color);
        setIsLoadingColorInfo(true);
        
        try {
            const details = await getColorInfo(color.color);
            setColorDetails(details);
        } catch (error) {
            console.error('Error fetching color details:', error);
            setColorDetails(null);
        } finally {
            setIsLoadingColorInfo(false);
        }
    }, [getColorInfo]);

    // Handle copy to clipboard with notification
    const handleCopy = useCallback(async (text, type) => {
        const result = await copyToClipboard(text);
        if (result.success) {
            setNotification(`${type} ${paletteViewTexts.success.copied}`);
            setTimeout(() => setNotification(null), 3000);
        }
    }, [copyToClipboard]);

    // Color mixing functionality
    const handleMixerColorSelect = useCallback((color, position) => {
        if (position === 1) {
            setMixerColor1(color);
        } else {
            setMixerColor2(color);
        }
    }, []);

    const mixColors = useCallback(() => {
        if (!mixerColor1 || !mixerColor2) return;

        // Simple color mixing algorithm (RGB average)
        const hex1 = mixerColor1.color.replace('#', '');
        const hex2 = mixerColor2.color.replace('#', '');
        
        const r1 = parseInt(hex1.substr(0, 2), 16);
        const g1 = parseInt(hex1.substr(2, 2), 16);
        const b1 = parseInt(hex1.substr(4, 2), 16);
        
        const r2 = parseInt(hex2.substr(0, 2), 16);
        const g2 = parseInt(hex2.substr(2, 2), 16);
        const b2 = parseInt(hex2.substr(4, 2), 16);
        
        const mixedR = Math.round((r1 + r2) / 2);
        const mixedG = Math.round((g1 + g2) / 2);
        const mixedB = Math.round((b1 + b2) / 2);
        
        const mixedHex = `#${mixedR.toString(16).padStart(2, '0')}${mixedG.toString(16).padStart(2, '0')}${mixedB.toString(16).padStart(2, '0')}`;
        
        setMixedColor(mixedHex);
    }, [mixerColor1, mixerColor2]);

    // Generate color harmonies
    const generateHarmony = useCallback((baseColor, type) => {
        if (!baseColor) return [];

        const hex = baseColor.color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        // Convert RGB to HSL for easier harmony calculation
        const hsl = rgbToHsl(r, g, b);
        let harmonies = [];

        switch (type) {
            case 'complementary':
                harmonies = [
                    baseColor.color,
                    hslToHex((hsl[0] + 180) % 360, hsl[1], hsl[2])
                ];
                break;
            case 'triadic':
                harmonies = [
                    baseColor.color,
                    hslToHex((hsl[0] + 120) % 360, hsl[1], hsl[2]),
                    hslToHex((hsl[0] + 240) % 360, hsl[1], hsl[2])
                ];
                break;
            case 'analogous':
                harmonies = [
                    hslToHex((hsl[0] - 30 + 360) % 360, hsl[1], hsl[2]),
                    baseColor.color,
                    hslToHex((hsl[0] + 30) % 360, hsl[1], hsl[2])
                ];
                break;
            case 'monochromatic':
                harmonies = [
                    hslToHex(hsl[0], hsl[1], Math.max(0, hsl[2] - 0.3)),
                    hslToHex(hsl[0], hsl[1], Math.max(0, hsl[2] - 0.15)),
                    baseColor.color,
                    hslToHex(hsl[0], hsl[1], Math.min(1, hsl[2] + 0.15)),
                    hslToHex(hsl[0], hsl[1], Math.min(1, hsl[2] + 0.3))
                ];
                break;
            default:
                harmonies = [baseColor.color];
        }

        return harmonies;
    }, []);

    // Update harmony colors when selected color or harmony type changes
    useEffect(() => {
        if (selectedColor) {
            const colors = generateHarmony(selectedColor, activeHarmony);
            setHarmonyColors(colors);
        }
    }, [selectedColor, activeHarmony, generateHarmony]);

    // Utility functions for color conversion
    const rgbToHsl = (r, g, b) => {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return [h * 360, s, l];
    };

    const hslToHex = (h, s, l) => {
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;
        let r = 0, g = 0, b = 0;

        if (0 <= h && h < 60) {
            r = c; g = x; b = 0;
        } else if (60 <= h && h < 120) {
            r = x; g = c; b = 0;
        } else if (120 <= h && h < 180) {
            r = 0; g = c; b = x;
        } else if (180 <= h && h < 240) {
            r = 0; g = x; b = c;
        } else if (240 <= h && h < 300) {
            r = x; g = 0; b = c;
        } else if (300 <= h && h < 360) {
            r = c; g = 0; b = x;
        }

        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);

        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    };

    // Handle randomize order
    const handleRandomizeOrder = useCallback(() => {
        if (!currentPalette) return;
        
        const shuffled = [...shuffledColors].sort(() => Math.random() - 0.5);
        setShuffledColors(shuffled);
        setNotification(paletteViewTexts.success.randomized);
        setTimeout(() => setNotification(null), 3000);
    }, [shuffledColors]);

    // Handle download palette
    const handleDownloadPalette = useCallback(() => {
        if (!currentPalette) return;
        
        const paletteData = {
            name: currentPalette.name,
            colors: currentPalette.colors,
            createdAt: currentPalette.createdAt
        };
        
        const dataStr = JSON.stringify(paletteData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${currentPalette.name.replace(/\s+/g, '_')}_palette.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        setNotification(paletteViewTexts.success.paletteDownloaded);
        setTimeout(() => setNotification(null), 3000);
    }, [currentPalette]);

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Convert hex to RGB
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    // Convert RGB to HSL string
    const rgbToHslString = (r, g, b) => {
        const hsl = rgbToHsl(r, g, b);
        return `hsl(${Math.round(hsl[0])}, ${Math.round(hsl[1] * 100)}%, ${Math.round(hsl[2] * 100)}%)`;
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="palette_view">
                <div className="container">
                    <div className="loading">
                        <div className="loading-spinner"></div>
                        {paletteViewTexts.loading.fetchingPalette}
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="palette_view">
                <div className="container">
                    <div className="error-state">
                        <div className="error-message">{paletteViewTexts.errors.loadError}</div>
                        <button className="retry-btn" onClick={() => getPaletteById(paletteId)}>
                            {paletteViewTexts.errors.retry}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // No palette found
    if (!currentPalette) {
        return (
            <div className="palette_view">
                <div className="container">
                    <div className="error-state">
                        <div className="error-message">{paletteViewTexts.errors.paletteNotFound}</div>
                        <Link to="/color-palettes" className="retry-btn">
                            {paletteViewTexts.navigation.backToPalettes}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="palette_view">
            <div className="container">
                {/* Notification */}
                {notification && (
                    <div className="notification">
                        {notification}
                    </div>
                )}

                {/* Header */}
                <div className="header">
                    <div className="navigation">
                        <Link to="/color-palettes" className="back-button">
                            <FiArrowLeft />
                            {paletteViewTexts.navigation.backToPalettes}
                        </Link>
                    </div>

                    <h1 className="palette-title">{currentPalette.name}</h1>
                    
                    <div className="palette-meta">
                        <div className="meta-item">
                            <FiCalendar />
                            {paletteViewTexts.paletteInfo.createdOn} {formatDate(currentPalette.createdAt)}
                        </div>
                        <div className="meta-item">
                            <BiPalette />
                            {currentPalette.colors.length} {paletteViewTexts.paletteInfo.totalColors}
                        </div>
                        {currentPalette.author && (
                            <div className="meta-item">
                                <FiUser />
                                {paletteViewTexts.paletteInfo.author}: {currentPalette.author.userName || 'Usuario'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="main-content">
                    {/* Palette Display */}
                    <div className="palette-display">
                        <div className="colors-grid">
                            {shuffledColors.map((color, index) => (
                                <div
                                    key={`${color.color}-${index}`}
                                    className={`color-card ${selectedColor?.color === color.color ? 'selected' : ''}`}
                                    onClick={() => handleColorSelect(color)}
                                    tabIndex={0}
                                    role="button"
                                    aria-label={`${color.name}: ${color.color}`}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            handleColorSelect(color);
                                        }
                                    }}
                                >
                                    <div 
                                        className="color-swatch"
                                        style={{ backgroundColor: color.color }}
                                    />
                                    <div className="color-info">
                                        <div className="color-name">{color.name}</div>
                                        <div className="color-hex">{color.color}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="action-buttons">
                            {/* <button 
                                className="action-btn"
                                onClick={() => handleCopy(
                                    currentPalette.colors.map(c => c.color).join(', '),
                                    paletteViewTexts.actions.copyAllColors
                                )}
                            >
                                <FiCopy />
                                {paletteViewTexts.actions.copyAllColors}
                            </button> */}
                            <button 
                                className="action-btn"
                                onClick={handleDownloadPalette}
                            >
                                <FiDownload />
                                {paletteViewTexts.actions.downloadPalette}
                            </button>
                            {/* <button 
                                className="action-btn"
                                onClick={() => handleCopy(
                                    `${window.location.origin}/color-palettes/view/${currentPalette._id}`,
                                    paletteViewTexts.actions.sharePalette
                                )}
                            >
                                <FiShare2 />
                                {paletteViewTexts.actions.sharePalette}
                            </button> */}
                            <button 
                                className="action-btn"
                                onClick={handleRandomizeOrder}
                            >
                                <FiShuffle />
                                {paletteViewTexts.actions.randomizeOrder}
                            </button>
                        </div>
                    </div>

                    {/* Color Details Sidebar */}
                    <div className="color-details">
                        <div className="details-header">
                            <h3 className="details-title">{paletteViewTexts.colorDetails.title}</h3>
                            {!selectedColor && (
                                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                                    {paletteViewTexts.colorDetails.clickToSelect}
                                </p>
                            )}
                        </div>

                        {selectedColor && (
                            <>
                                <div 
                                    className="selected-color-preview"
                                    style={{ '--selected-color': selectedColor.color }}
                                />

                                <div className="color-codes">
                                    <div className="code-item">
                                        <span className="code-label">{paletteViewTexts.colorDetails.name}</span>
                                        <span className="code-value">{selectedColor.name}</span>
                                        <button 
                                            className="copy-button"
                                            onClick={() => handleCopy(selectedColor.name, paletteViewTexts.colorDetails.name)}
                                        >
                                            <FiCopy />
                                        </button>
                                    </div>
                                    
                                    <div className="code-item">
                                        <span className="code-label">{paletteViewTexts.colorDetails.hexCode}</span>
                                        <span className="code-value">{selectedColor.color}</span>
                                        <button 
                                            className="copy-button"
                                            onClick={() => handleCopy(selectedColor.color, 'HEX')}
                                        >
                                            <FiCopy />
                                        </button>
                                    </div>

                                    {(() => {
                                        const rgb = hexToRgb(selectedColor.color);
                                        return rgb ? (
                                            <div className="code-item">
                                                <span className="code-label">{paletteViewTexts.colorDetails.rgbCode}</span>
                                                <span className="code-value">rgb({rgb.r}, {rgb.g}, {rgb.b})</span>
                                                <button 
                                                    className="copy-button"
                                                    onClick={() => handleCopy(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, 'RGB')}
                                                >
                                                    <FiCopy />
                                                </button>
                                            </div>
                                        ) : null;
                                    })()}

                                    {(() => {
                                        const rgb = hexToRgb(selectedColor.color);
                                        return rgb ? (
                                            <div className="code-item">
                                                <span className="code-label">{paletteViewTexts.colorDetails.hslCode}</span>
                                                <span className="code-value">{rgbToHslString(rgb.r, rgb.g, rgb.b)}</span>
                                                <button 
                                                    className="copy-button"
                                                    onClick={() => handleCopy(rgbToHslString(rgb.r, rgb.g, rgb.b), 'HSL')}
                                                >
                                                    <FiCopy />
                                                </button>
                                            </div>
                                        ) : null;
                                    })()}
                                </div>

                                {/* Color Information from The Color API */}
                                {isLoadingColorInfo ? (
                                    <div className="loading-info">
                                        <div className="loading-spinner"></div>
                                        {paletteViewTexts.loading.colorInfo}
                                    </div>
                                ) : colorDetails && (
                                    <div className="color-info-section">
                                        <h4>{paletteViewTexts.colorDetails.additionalInfo}</h4>
                                        <div className="info-grid">
                                            {colorDetails.name && (
                                                <div className="info-item">
                                                    <span className="info-label">{paletteViewTexts.colorDetails.colorName}</span>
                                                    <span className="info-value">{colorDetails.name}</span>
                                                </div>
                                            )}
                                            {colorDetails.temperature && (
                                                <div className="info-item">
                                                    <span className="info-label">{paletteViewTexts.colorDetails.temperature}</span>
                                                    <span className="info-value">{colorDetails.temperature}</span>
                                                </div>
                                            )}
                                            {colorDetails.brightness && (
                                                <div className="info-item">
                                                    <span className="info-label">{paletteViewTexts.colorDetails.brightness}</span>
                                                    <span className="info-value">{colorDetails.brightness}%</span>
                                                </div>
                                            )}
                                            {colorDetails.saturation && (
                                                <div className="info-item">
                                                    <span className="info-label">{paletteViewTexts.colorDetails.saturation}</span>
                                                    <span className="info-value">{colorDetails.saturation}%</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Color Tools */}
                                <div className="color-tools">
                                    {/* Color Harmonies */}
                                    <div className="tool-section">
                                        <h4 className="tool-title">
                                            <MdColorLens />
                                            {paletteViewTexts.interactiveElements.colorHarmony.title}
                                        </h4>
                                        
                                        <div className="harmony-buttons">
                                            {['complementary', 'triadic', 'analogous', 'monochromatic'].map(type => (
                                                <button
                                                    key={type}
                                                    className={`harmony-btn ${activeHarmony === type ? 'active' : ''}`}
                                                    onClick={() => setActiveHarmony(type)}
                                                >
                                                    {paletteViewTexts.interactiveElements.colorHarmony[type]}
                                                </button>
                                            ))}
                                        </div>

                                        {/* <div className="harmony-colors">
                                            {harmonyColors.map((color, index) => (
                                                <div
                                                    key={index}
                                                    className="harmony-color"
                                                    style={{ backgroundColor: color }}
                                                    onClick={() => handleCopy(color, 'Color de armonía')}
                                                    title={`Copiar color: ${color}`}
                                                />
                                            ))}
                                        </div> */}
                                    </div>

                                    {/* Color Mixer */}
                                    <div className="tool-section">
                                        <h4 className="tool-title">
                                            <MdBlurOn />
                                            {paletteViewTexts.interactiveElements.colorMixer.title}
                                        </h4>
                                        
                                        <div className="mixer-section">
                                            <div className="mixer-colors">
                                                <div 
                                                    className={`mixer-color ${mixerColor1 ? 'selected' : ''}`}
                                                    style={{ backgroundColor: mixerColor1?.color || 'var(--background-secondary)' }}
                                                    onClick={() => setMixerColor1(selectedColor)}
                                                    title="Seleccionar primer color"
                                                />
                                                <span className="mixer-plus">+</span>
                                                <div 
                                                    className={`mixer-color ${mixerColor2 ? 'selected' : ''}`}
                                                    style={{ backgroundColor: mixerColor2?.color || 'var(--background-secondary)' }}
                                                    onClick={() => setMixerColor2(selectedColor)}
                                                    title="Seleccionar segundo color"
                                                />
                                                <span className="mixer-plus">=</span>
                                                {mixedColor && (
                                                    <div 
                                                        className="mixer-result"
                                                        style={{ backgroundColor: mixedColor }}
                                                        onClick={() => handleCopy(mixedColor, 'Color mezclado')}
                                                        title={`Resultado: ${mixedColor}`}
                                                    />
                                                )}
                                            </div>
                                            
                                            <button 
                                                className="mix-button"
                                                onClick={mixColors}
                                                disabled={!mixerColor1 || !mixerColor2}
                                            >
                                                <MdBlurOn />
                                                {paletteViewTexts.interactiveElements.colorMixer.mixColors}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaletteView;