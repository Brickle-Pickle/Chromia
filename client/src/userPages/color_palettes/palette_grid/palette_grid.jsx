import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../../context/app_context.jsx';
import { 
    FiSearch, 
    FiEdit3, 
    FiTrash2, 
    FiCopy, 
    FiShare2, 
    FiEye,
    FiCalendar,
    FiPlus
} from 'react-icons/fi';
import { BiPalette } from 'react-icons/bi';
import './palette_grid.css';
import paletteGridTexts from './palette_grid.json';

const PaletteGrid = () => {
    const navigate = useNavigate();
    const { 
        palettes, 
        isLoading, 
        error, 
        fetchPalettes, 
        deletePalette, 
        createPalette,
        copyToClipboard 
    } = useAppContext();

    // Local state
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [isDeleting, setIsDeleting] = useState(null);
    const [isDuplicating, setIsDuplicating] = useState(null);

    // Fetch palettes on component mount
    useEffect(() => {
        fetchPalettes();
    }, [fetchPalettes]);

    // Filter and sort palettes
    const filteredAndSortedPalettes = useMemo(() => {
        let filtered = palettes.filter(palette =>
            palette.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Sort palettes
        switch (sortBy) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'name':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'nameDesc':
                filtered.sort((a, b) => b.name.localeCompare(a.name));
                break;
            default:
                break;
        }

        return filtered;
    }, [palettes, searchTerm, sortBy]);

    // Calculate stats
    const stats = useMemo(() => {
        const totalPalettes = palettes.length;
        const totalColors = palettes.reduce((acc, palette) => acc + palette.colors.length, 0);
        const lastCreated = palettes.length > 0 
            ? new Date(Math.max(...palettes.map(p => new Date(p.createdAt)))).toLocaleDateString()
            : 'N/A';

        return { totalPalettes, totalColors, lastCreated };
    }, [palettes]);

    // Handle palette deletion
    const handleDelete = async (paletteId, paletteName) => {
        if (window.confirm(`${paletteGridTexts.confirmations.delete.message}`)) {
            setIsDeleting(paletteId);
            try {
                await deletePalette(paletteId);
            } catch (error) {
                console.error('Error deleting palette:', error);
            } finally {
                setIsDeleting(null);
            }
        }
    };

    // Handle palette duplication
    const handleDuplicate = async (palette) => {
        setIsDuplicating(palette._id);
        try {
            const duplicatedPalette = {
                name: `${palette.name} (Copia)`,
                colors: palette.colors
            };
            await createPalette(duplicatedPalette);
        } catch (error) {
            console.error('Error duplicating palette:', error);
        } finally {
            setIsDuplicating(null);
        }
    };

    // Handle color copy
    const handleCopyColors = async (colors) => {
        const colorString = colors.map(color => color.color).join(', ');
        const result = await copyToClipboard(colorString);
        if (result.success) {
            // You could add a toast notification here
            console.log('Colors copied to clipboard');
        }
    };

    // Handle view details
    const handleViewDetails = (paletteId) => {
        navigate(`/color-palettes/view/${paletteId}`);
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="palette_grid">
                <div className="loading">
                    <div className="loading-spinner"></div>
                    {paletteGridTexts.loading.fetching}
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="palette_grid">
                <div className="error-state">
                    <div className="error-message">{paletteGridTexts.errors.fetchError}</div>
                    <button className="retry-btn" onClick={fetchPalettes}>
                        {paletteGridTexts.errors.retry}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="palette_grid">
            {/* Header */}
            <div className="header">
                <h1>{paletteGridTexts.title}</h1>
                <p className="subtitle">{paletteGridTexts.subtitle}</p>
                <p className="description">{paletteGridTexts.description}</p>
            </div>

            {palettes.length === 0 ? (
                // Empty state
                <div className="empty-state">
                    <div className="empty-icon">
                        <BiPalette />
                    </div>
                    <h2 className="empty-title">{paletteGridTexts.emptyState.title}</h2>
                    <p className="empty-description">{paletteGridTexts.emptyState.description}</p>
                    
                </div>
            ) : (
                <>
                    {/* Controls */}
                    <div className="controls">
                        <div className="search-container">
                            <input
                                type="text"
                                className="search-input"
                                placeholder={paletteGridTexts.search.placeholder}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <FiSearch className="search-icon" />
                        </div>
                        <div className="filters">
                            <select
                                className="filter-select"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="newest">{paletteGridTexts.filters.sortOptions.newest}</option>
                                <option value="oldest">{paletteGridTexts.filters.sortOptions.oldest}</option>
                                <option value="name">{paletteGridTexts.filters.sortOptions.name}</option>
                                <option value="nameDesc">{paletteGridTexts.filters.sortOptions.nameDesc}</option>
                            </select>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="stats">
                        <div className="stat-card">
                            <div className="stat-number">{stats.totalPalettes}</div>
                            <div className="stat-label">{paletteGridTexts.stats.totalPalettes}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">{stats.totalColors}</div>
                            <div className="stat-label">{paletteGridTexts.stats.totalColors}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">{stats.lastCreated}</div>
                            <div className="stat-label">{paletteGridTexts.stats.lastCreated}</div>
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="grid-container">
                        {filteredAndSortedPalettes.length === 0 ? (
                            <div className="empty-state">
                                <h3>{paletteGridTexts.search.noResults}</h3>
                            </div>
                        ) : (
                            <div className="palettes-grid">
                                {filteredAndSortedPalettes.map((palette) => (
                                    <div key={palette._id} className="palette-card">
                                        {/* Colors Preview */}
                                        <div className="palette-colors">
                                            {palette.colors.map((color, index) => (
                                                <div
                                                    key={index}
                                                    className="color-swatch"
                                                    style={{ backgroundColor: color.color }}
                                                    title={`${color.name}: ${color.color}`}
                                                    onClick={() => copyToClipboard(color.color)}
                                                />
                                            ))}
                                        </div>

                                        {/* Palette Info */}
                                        <div className="palette-info">
                                            <h3 className="palette-name">{palette.name}</h3>
                                            
                                            <div className="palette-meta">
                                                <span className="color-count">
                                                    <BiPalette />
                                                    {palette.colors.length} colores
                                                </span>
                                                <span className="created-date">
                                                    <FiCalendar />
                                                    {formatDate(palette.createdAt)}
                                                </span>
                                            </div>

                                            {/* Actions */}
                                            <div className="palette-actions">
                                                
                                                <button
                                                    className="action-btn"
                                                    onClick={() => handleCopyColors(palette.colors)}
                                                    title={paletteGridTexts.actions.copyColors}
                                                >
                                                    <FiShare2 />
                                                    {paletteGridTexts.actions.copyColors}
                                                </button>
                                                
                                                <button
                                                    className="action-btn"
                                                    onClick={() => handleViewDetails(palette._id)}
                                                    title={paletteGridTexts.actions.viewDetails}
                                                >
                                                    <FiEye />
                                                    {paletteGridTexts.actions.viewDetails}
                                                </button>
                                                
                                                <button
                                                    className="action-btn delete"
                                                    onClick={() => handleDelete(palette._id, palette.name)}
                                                    disabled={isDeleting === palette._id}
                                                    title={paletteGridTexts.actions.delete}
                                                >
                                                    <FiTrash2 />
                                                    {isDeleting === palette._id 
                                                        ? paletteGridTexts.loading.deleting 
                                                        : paletteGridTexts.actions.delete
                                                    }
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default PaletteGrid;