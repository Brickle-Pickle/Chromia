import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiDroplet, FiUser, FiLogIn, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { BiPalette } from "react-icons/bi";
import { useAppContext } from '../../context/app_context.jsx';
import navbarTexts from './navbar.json';
import './navbar.css';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    
    const { 
        isAuthenticated, 
        user, 
        logout, 
        isLoading 
    } = useAppContext();

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            setIsScrolled(scrollTop > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMobileMenuOpen && !event.target.closest('.navbar-container')) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isMobileMenuOpen]);

    // Handle logout
    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    // Handle mobile menu toggle
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Check if current path is active
    const isActiveLink = (path) => {
        return location.pathname === path;
    };

    // Get user initials for avatar
    const getUserInitials = () => {
        if (!user?.username) return 'U';
        return user.username.charAt(0).toUpperCase();
    };

    // Navigation items configuration
    const navigationItems = [
        {
            path: '/colors',
            label: navbarTexts.navigation.colors,
            icon: FiDroplet,
            tooltip: navbarTexts.tooltips.colors
        },
        {
            path: '/color-palettes',
            label: navbarTexts.navigation.palettes,
            icon: BiPalette,
            tooltip: navbarTexts.tooltips.palettes
        }
    ];

    return (
        <nav className={`navbar ${isScrolled ? 'scrolled' : ''} ${isLoading ? 'navbar-loading' : ''}`}>
            <div className="navbar-container">
                {/* Brand Section */}
                <Link 
                    to="/" 
                    className="navbar-brand"
                    title={navbarTexts.tooltips.home}
                    aria-label={navbarTexts.tooltips.home}
                >
                    <img 
                        src="/logo.png" 
                        alt={navbarTexts.brand.alt}
                        className="navbar-logo"
                    />
                    <span className="navbar-brand-text">
                        {navbarTexts.brand.name}
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <ul className="navbar-nav">
                    {navigationItems.map((item) => {
                        const IconComponent = item.icon;
                        return (
                            <li key={item.path} className="navbar-nav-item">
                                <Link
                                    to={item.path}
                                    className={`navbar-nav-link ${isActiveLink(item.path) ? 'active' : ''}`}
                                    title={item.tooltip}
                                    aria-label={item.tooltip}
                                >
                                    <IconComponent size={18} />
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                {/* Desktop Auth Section */}
                <div className="navbar-auth">
                    {isAuthenticated ? (
                        <>
                            <div className="navbar-user-info">
                                <div 
                                    className="navbar-user-avatar"
                                    title={`${navbarTexts.auth.profile}: ${user?.username || ''}`}
                                    aria-label={navbarTexts.tooltips.profile}
                                >
                                    {getUserInitials()}
                                </div>
                                <span>¡Hola, {user?.username || 'Usuario'}!</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="navbar-auth-btn logout"
                                title={navbarTexts.tooltips.logout}
                                aria-label={navbarTexts.tooltips.logout}
                                disabled={isLoading}
                            >
                                <FiLogOut size={16} />
                                <span>{navbarTexts.auth.logout}</span>
                            </button>
                        </>
                    ) : (
                        <Link
                            to="/login"
                            className="navbar-auth-btn nav_login"
                            title={navbarTexts.tooltips.login}
                            aria-label={navbarTexts.tooltips.login}
                        >
                            <FiLogIn size={16} />
                            <span>{navbarTexts.auth.login}</span>
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className={`navbar-mobile-toggle ${isMobileMenuOpen ? 'active' : ''}`}
                    onClick={toggleMobileMenu}
                    aria-label={isMobileMenuOpen ? navbarTexts.mobile.close : navbarTexts.mobile.menu}
                    aria-expanded={isMobileMenuOpen}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                {/* Mobile Menu */}
                <div className={`navbar-mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
                    <div className="navbar-mobile-nav">
                        {navigationItems.map((item) => {
                            const IconComponent = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`navbar-nav-link ${isActiveLink(item.path) ? 'active' : ''}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <IconComponent size={20} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    <div className="navbar-mobile-auth">
                        {isAuthenticated ? (
                            <>
                                <div className="navbar-user-info">
                                    <div className="navbar-user-avatar">
                                        {getUserInitials()}
                                    </div>
                                    <span>¡Hola, {user?.username || 'Usuario'}!</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="navbar-auth-btn logout"
                                    disabled={isLoading}
                                >
                                    <FiLogOut size={16} />
                                    <span>{navbarTexts.auth.logout}</span>
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className="navbar-auth-btn nav_login"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <FiLogIn size={16} />
                                <span>{navbarTexts.auth.login}</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;