import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../../context/app_context';
import { 
    FaPalette, 
    FaPlus, 
    FaSearch, 
    FaTimes, 
    FaRandom, 
    FaCopy, 
    FaCheck,
    FaTrash,
    FaEye,
    FaLightbulb,
    FaSpinner
} from 'react-icons/fa';
import { MdColorLens, MdShuffle } from 'react-icons/md';
import './palette_create.css';
import texts from './palette_create.json';

const PaletteCreate = () => {
    const navigate = useNavigate();
    const { 
        createPalette, 
        createColor, 
        searchCommunityColors, 
        copyToClipboard,
        isLoading,
        error,
        clearError,
        isAuthenticated,
        user
    } = useAppContext();

    // Form state
    const [paletteName, setPaletteName] = useState('');
    const [paletteColors, setPaletteColors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    
    // Color creation state
    const [newColorName, setNewColorName] = useState('');
    const [newColorHex, setNewColorHex] = useState('#000000');
    const [isCreatingColor, setIsCreatingColor] = useState(false);
    
    // UI state
    const [activeTab, setActiveTab] = useState('search'); // 'search' or 'create'
    const [copiedColor, setCopiedColor] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const [currentTip, setCurrentTip] = useState(0);
    const [showPreview, setShowPreview] = useState(false);

    // Tips rotation
    const tips = [
        texts.tips.colorTheory,
        texts.tips.harmony,
        texts.tips.accessibility,
        texts.tips.inspiration
    ];

    // Rotate tips every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTip((prev) => (prev + 1) % tips.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [tips.length]);

    // Clear error when component mounts
    useEffect(() => {
        clearError();
    }, [clearError]);

    // Validation functions
    const validatePaletteName = useCallback((name) => {
        const errors = {};
        if (!name.trim()) {
            errors.paletteName = texts.messages.validation.nameRequired;
        } else if (name.trim().length < 3) {
            errors.paletteName = texts.messages.validation.nameMinLength;
        } else if (name.trim().length > 50) {
            errors.paletteName = texts.messages.validation.nameMaxLength;
        }
        return errors;
    }, []);

    const validateColorName = useCallback((name) => {
        const errors = {};
        if (!name.trim()) {
            errors.colorName = texts.messages.validation.colorNameRequired;
        } else if (name.trim().length < 2) {
            errors.colorName = texts.messages.validation.colorNameMinLength;
        } else if (name.trim().length > 30) {
            errors.colorName = texts.messages.validation.colorNameMaxLength;
        }
        return errors;
    }, []);

    const validateHexColor = useCallback((hex) => {
        const errors = {};
        const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        if (!hexRegex.test(hex)) {
            errors.colorHex = texts.messages.errors.invalidHex;
        }
        return errors;
    }, []);

    // Search colors function
    const handleSearchColors = useCallback(async () => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const result = await searchCommunityColors(searchTerm.trim());
            if (result.success) {
                setSearchResults(result.data || []);
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, [searchTerm, searchCommunityColors]);

    // Debounced search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm.trim()) {
                handleSearchColors();
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, handleSearchColors]);

    // Generate random color
    const generateRandomColor = useCallback(() => {
        const randomHex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        setNewColorHex(randomHex);
    }, []);

    // Add color to palette
    const addColorToPalette = useCallback((color) => {
        // Check if color already exists in palette
        const colorExists = paletteColors.some(c => c.color.toLowerCase() === color.color.toLowerCase());
        if (colorExists) {
            setValidationErrors({ duplicate: texts.messages.errors.duplicateColor });
            setTimeout(() => setValidationErrors({}), 3000);
            return;
        }

        // Check max colors limit
        if (paletteColors.length >= 7) {
            setValidationErrors({ maxColors: texts.messages.errors.maxColors });
            setTimeout(() => setValidationErrors({}), 3000);
            return;
        }

        setPaletteColors(prev => [...prev, color]);
        setValidationErrors({});
    }, [paletteColors]);

    // Remove color from palette
    const removeColorFromPalette = useCallback((index) => {
        setPaletteColors(prev => prev.filter((_, i) => i !== index));
    }, []);

    // Create new color
    const handleCreateColor = useCallback(async () => {
        const nameErrors = validateColorName(newColorName);
        const hexErrors = validateHexColor(newColorHex);
        const errors = { ...nameErrors, ...hexErrors };

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        setIsCreatingColor(true);
        try {
            const result = await createColor({
                name: newColorName.trim(),
                color: newColorHex
            });

            if (result.success) {
                addColorToPalette(result.data);
                setNewColorName('');
                setNewColorHex('#000000');
                setValidationErrors({});
                
                // Show success message briefly
                setValidationErrors({ success: texts.messages.success.colorCreated });
                setTimeout(() => setValidationErrors({}), 2000);
            } else {
                setValidationErrors({ createColor: result.error });
            }
        } catch (error) {
            setValidationErrors({ createColor: error.message });
        } finally {
            setIsCreatingColor(false);
        }
    }, [newColorName, newColorHex, validateColorName, validateHexColor, createColor, addColorToPalette]);

    // Create palette
    const handleCreatePalette = useCallback(async () => {
        // Check if user is authenticated
        if (!isAuthenticated || !user) {
            setValidationErrors({ createPalette: 'Debes estar autenticado para crear una paleta' });
            navigate('/login');
            return;
        }

        const nameErrors = validatePaletteName(paletteName);
        let errors = { ...nameErrors };

        if (paletteColors.length < 3) {
            errors.minColors = texts.messages.errors.minColors;
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        try {
            const result = await createPalette({
                name: paletteName.trim(),
                colors: paletteColors
            });

            if (result.success) {
                // Show success message
                setValidationErrors({ success: texts.messages.success.paletteCreated });
                setTimeout(() => {
                    // Reset form state instead of reloading
                    setPaletteName('');
                    setPaletteColors([]);
                    setValidationErrors({});
                    setSearchTerm('');
                    setSearchResults([]);
                    setNewColorName('');
                    setNewColorHex('#000000');
                    setActiveTab('search');
                }, 1500);
            } else {
                setValidationErrors({ createPalette: result.error });
            }
        } catch (error) {
            setValidationErrors({ createPalette: error.message });
        }
    }, [paletteName, paletteColors, validatePaletteName, createPalette, navigate, isAuthenticated, user]);

    // Copy color to clipboard
    const handleCopyColor = useCallback(async (color) => {
        const result = await copyToClipboard(color);
        if (result.success) {
            setCopiedColor(color);
            setTimeout(() => setCopiedColor(null), 2000);
        }
    }, [copyToClipboard]);

    // Memoized computed values
    const canCreatePalette = useMemo(() => {
        return paletteName.trim().length >= 3 && paletteColors.length >= 3 && paletteColors.length <= 7;
    }, [paletteName, paletteColors]);

    const progressPercentage = useMemo(() => {
        return Math.min((paletteColors.length / 7) * 100, 100);
    }, [paletteColors.length]);

    return (
        <div className="palette_create">
            <div className="container">
                {/* Header Section */}
                <div className="palette-create-header">
                    <div className="header-content">
                        <div className="header-icon-container">
                            <div className="header-icon">
                                <FaPalette />
                            </div>
                        </div>
                        <div className="header-text">
                            <h1>{texts.title}</h1>
                            <p>{texts.subtitle}</p>
                            <span className="description">{texts.description}</span>
                        </div>
                    </div>
                    
                    {/* Tips Section */}
                    <div className="tips-section">
                        <div className="tip-icon">
                            <FaLightbulb />
                        </div>
                        <div className="tip-content">
                            <span className="tip-text">{tips[currentTip]}</span>
                        </div>
                    </div>
                </div>

                <div className="palette-create-content">
                    {/* Left Column - Color Selection */}
                    <div className="color-selection-section">
                        {/* Palette Name Input */}
                        <div className="form-group">
                            <label htmlFor="paletteName">{texts.form.paletteName.label}</label>
                            <input
                                type="text"
                                id="paletteName"
                                value={paletteName}
                                onChange={(e) => setPaletteName(e.target.value)}
                                placeholder={texts.form.paletteName.placeholder}
                                className={validationErrors.paletteName ? 'error' : ''}
                                maxLength={50}
                            />
                            {validationErrors.paletteName && (
                                <span className="error-message">{validationErrors.paletteName}</span>
                            )}
                        </div>

                        {/* Tab Navigation */}
                        <div className="tab-navigation">
                            <button
                                className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
                                onClick={() => setActiveTab('search')}
                            >
                                <FaSearch />
                                {texts.sections.searchSection}
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
                                onClick={() => setActiveTab('create')}
                            >
                                <MdColorLens />
                                {texts.sections.createSection}
                            </button>
                        </div>

                        {/* Search Colors Tab */}
                        {activeTab === 'search' && (
                            <div className="search-section">
                                <div className="search-input-group">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder={texts.form.colorSearch.placeholder}
                                        className="search-input"
                                    />
                                    <button
                                        onClick={handleSearchColors}
                                        className="search-button"
                                        disabled={isSearching}
                                    >
                                        {isSearching ? <FaSpinner className="spinning" /> : <FaSearch />}
                                    </button>
                                    {searchTerm && (
                                        <button
                                            onClick={() => {
                                                setSearchTerm('');
                                                setSearchResults([]);
                                            }}
                                            className="clear-search-button"
                                        >
                                            <FaTimes />
                                        </button>
                                    )}
                                </div>

                                {/* Search Results */}
                                <div className="search-results">
                                    {isSearching && (
                                        <div className="loading-message">
                                            <FaSpinner className="spinning" />
                                            {texts.loading.searching}
                                        </div>
                                    )}
                                    
                                    {!isSearching && searchTerm && searchResults.length === 0 && (
                                        <div className="no-results">
                                            {texts.form.colorSearch.noResults}
                                        </div>
                                    )}
                                    
                                    {searchResults.length > 0 && (
                                        <div className="color-grid">
                                            {searchResults.map((color, index) => (
                                                <div key={index} className="color-item">
                                                    <div 
                                                        className="color-swatch"
                                                        style={{ backgroundColor: color.color }}
                                                        onClick={() => handleCopyColor(color.color)}
                                                        title={texts.buttons.copyHex}
                                                    >
                                                        {copiedColor === color.color && (
                                                            <div className="copied-indicator">
                                                                <FaCheck />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="color-info">
                                                        <span className="color-name">{color.name}</span>
                                                        <span className="color-hex">{color.color}</span>
                                                        <span className="color-author">
                                                            {color.author?.userName || 'Unknown'}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => addColorToPalette(color)}
                                                        className="add-color-button"
                                                        disabled={paletteColors.length >= 7}
                                                    >
                                                        <FaPlus />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Create Color Tab */}
                        {activeTab === 'create' && (
                            <div className="create-section">
                                <div className="form-group">
                                    <label htmlFor="colorName">{texts.form.createColor.nameLabel}</label>
                                    <input
                                        type="text"
                                        id="colorName"
                                        value={newColorName}
                                        onChange={(e) => setNewColorName(e.target.value)}
                                        placeholder={texts.form.createColor.namePlaceholder}
                                        className={validationErrors.colorName ? 'error' : ''}
                                        maxLength={30}
                                    />
                                    {validationErrors.colorName && (
                                        <span className="error-message">{validationErrors.colorName}</span>
                                    )}
                                </div>

                                <div className="color-input-group">
                                    <div className="form-group">
                                        <label htmlFor="colorHex">{texts.form.createColor.colorLabel}</label>
                                        <div className="color-input-wrapper">
                                            <input
                                                type="color"
                                                id="colorPicker"
                                                value={newColorHex}
                                                onChange={(e) => setNewColorHex(e.target.value)}
                                                className="color-picker"
                                            />
                                            <input
                                                type="text"
                                                id="colorHex"
                                                value={newColorHex}
                                                onChange={(e) => setNewColorHex(e.target.value)}
                                                placeholder={texts.form.createColor.colorPlaceholder}
                                                className={`hex-input ${validationErrors.colorHex ? 'error' : ''}`}
                                                maxLength={7}
                                            />
                                            <button
                                                onClick={generateRandomColor}
                                                className="random-color-button"
                                                type="button"
                                                title={texts.buttons.randomColor}
                                            >
                                                <MdShuffle />
                                            </button>
                                        </div>
                                        {validationErrors.colorHex && (
                                            <span className="error-message">{validationErrors.colorHex}</span>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={handleCreateColor}
                                    className="create-color-button"
                                    type="button"
                                    disabled={isCreatingColor || !newColorName.trim() || !newColorHex}
                                >
                                    {isCreatingColor ? (
                                        <>
                                            <FaSpinner className="spinning" />
                                            {texts.loading.addingColor}
                                        </>
                                    ) : (
                                        <>
                                            <FaPlus />
                                            {texts.buttons.createColor}
                                        </>
                                    )}
                                </button>

                                {validationErrors.createColor && (
                                    <div className="error-message">{validationErrors.createColor}</div>
                                )}
                                {validationErrors.success && (
                                    <div className="success-message">{validationErrors.success}</div>
                                )}
                            </div>
                        )}

                        {/* Error Messages */}
                        {(validationErrors.duplicate || validationErrors.maxColors) && (
                            <div className="error-message global-error">
                                {validationErrors.duplicate || validationErrors.maxColors}
                            </div>
                        )}
                    </div>

                    {/* Right Column - Palette Preview */}
                    <div className="palette-preview-section">
                        <div className="palette-header">
                            <h3>{texts.sections.paletteSection}</h3>
                        </div>

                        {/* Color Count and Progress */}
                        <div className="palette-progress">
                            <div className="progress-info">
                                <span className="color-count">
                                    {paletteColors.length} {texts.form.paletteColors.currentCount}
                                </span>
                                <span className="color-limits">
                                    {texts.form.paletteColors.minColors} - {texts.form.paletteColors.maxColors}
                                </span>
                            </div>
                            <div className="progress-bar">
                                <div 
                                    className="progress-fill"
                                    style={{ width: `${progressPercentage}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Palette Colors */}
                        <div className="palette-colors-container">
                            {paletteColors.length === 0 ? (
                                <div className="empty-palette">
                                    <FaPalette className="empty-icon" />
                                    <p>Agrega colores para comenzar tu paleta</p>
                                </div>
                            ) : (
                                <div className="palette-colors-grid">
                                    {paletteColors.map((color, index) => (
                                        <div key={index} className="palette-color-item">
                                            <div 
                                                className="palette-color-swatch"
                                                style={{ backgroundColor: color.color }}
                                                onClick={() => handleCopyColor(color.color)}
                                            >
                                                {copiedColor === color.color && (
                                                    <div className="copied-indicator">
                                                        <FaCheck />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="palette-color-info">
                                                <span className="palette-color-name">{color.name}</span>
                                                <span className="palette-color-hex">{color.color}</span>
                                            </div>
                                            <button
                                                onClick={() => removeColorFromPalette(index)}
                                                className="remove-color-button"
                                                title={texts.buttons.removeColor}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Preview Section */}
                        {showPreview && paletteColors.length > 0 && (
                            <div className="palette-preview">
                                <h4>{texts.sections.previewSection}</h4>
                                <div className="preview-palette">
                                    {paletteColors.map((color, index) => (
                                        <div
                                            key={index}
                                            className="preview-color"
                                            style={{ backgroundColor: color.color }}
                                            title={`${color.name} - ${color.color}`}
                                        ></div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="action-buttons">
                            <button
                                onClick={() => navigate('/color-palettes')}
                                className="cancel-button"
                            >
                                {texts.buttons.cancel}
                            </button>
                            <button
                                onClick={handleCreatePalette}
                                className="create-palette-button"
                                disabled={!canCreatePalette || isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <FaSpinner className="spinning" />
                                        {texts.loading.creating}
                                    </>
                                ) : (
                                    <>
                                        <FaPalette />
                                        {texts.buttons.createPalette}
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Validation Errors */}
                        {validationErrors.minColors && (
                            <div className="error-message">{validationErrors.minColors}</div>
                        )}
                        {validationErrors.createPalette && (
                            <div className="error-message">{validationErrors.createPalette}</div>
                        )}
                        {validationErrors.success && (
                            <div className="success-message">{validationErrors.success}</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaletteCreate;