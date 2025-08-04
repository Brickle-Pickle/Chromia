import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { useAppContext } from '../../context/app_context.jsx';
import loginTexts from './login.json';
import './login.css';

const Login = () => {
    const navigate = useNavigate();
    const { login, isLoading, error, isAuthenticated, clearError } = useAppContext();
    
    // Form state
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    
    // UI state
    const [showPassword, setShowPassword] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [showSuccess, setShowSuccess] = useState(false);
    
    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);
    
    // Clear errors when component mounts
    useEffect(() => {
        clearError();
    }, [clearError]);
    
    // Handle input changes - memoized to prevent recreation
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear field-specific error when user starts typing
        setFormErrors(prev => {
            if (prev[name]) {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            }
            return prev;
        });
        
        // Clear global error when user starts typing
        if (error) {
            clearError();
        }
    }, [error, clearError]);
    
    // Validate form - memoized
    const validateForm = useCallback(() => {
        const errors = {};
        
        if (!formData.username.trim()) {
            errors.username = loginTexts.errors.required;
        }
        
        if (!formData.password.trim()) {
            errors.password = loginTexts.errors.required;
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    }, [formData.username, formData.password]);
    
    // Handle form submission - memoized
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        try {
            const result = await login(formData.username, formData.password);
            
            if (result.success) {
                setShowSuccess(true);
                setTimeout(() => {
                    navigate('/');
                }, 1500);
            }
        } catch (err) {
            console.error('Login error:', err);
        }
    }, [validateForm, login, formData.username, formData.password, navigate]);
    
    // Toggle password visibility - memoized
    const togglePasswordVisibility = useCallback(() => {
        setShowPassword(prev => !prev);
    }, []);
    
    // Handle keyboard navigation - memoized
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && !isLoading) {
            handleSubmit(e);
        }
    }, [handleSubmit, isLoading]);
    
    // Memoize form fields to prevent unnecessary re-renders
    const usernameField = useMemo(() => (
        <div className="login__field login_form">
            <label 
                htmlFor="username" 
                className="login__label"
            >
                {loginTexts.username.label}
            </label>
            <div className="login__input-wrapper">
                <input
                    id="username"
                    name="username"
                    type="text"
                    className="login__input"
                    placeholder={loginTexts.username.placeholder}
                    value={formData.username}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    autoComplete="username"
                    aria-invalid={!!formErrors.username}
                    aria-describedby={formErrors.username ? "username-error" : undefined}
                />
                <FaUser className="login__input-icon" />
            </div>
            {formErrors.username && (
                <div 
                    id="username-error" 
                    className="login__error"
                    role="alert"
                >
                    <FaExclamationTriangle />
                    {formErrors.username}
                </div>
            )}
        </div>
    ), [formData.username, formErrors.username, handleInputChange, handleKeyDown, isLoading]);
    
    const passwordField = useMemo(() => (
        <div className="login__field">
            <label 
                htmlFor="password" 
                className="login__label"
            >
                {loginTexts.password.label}
            </label>
            <div className="login__input-wrapper">
                <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="login__input"
                    placeholder={loginTexts.password.placeholder}
                    value={formData.password}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    autoComplete="current-password"
                    aria-invalid={!!formErrors.password}
                    aria-describedby={formErrors.password ? "password-error" : undefined}
                />
                <button
                    type="button"
                    className="login__password-toggle"
                    onClick={togglePasswordVisibility}
                    disabled={isLoading}
                    aria-label={
                        showPassword 
                            ? loginTexts.accessibility.hidePassword 
                            : loginTexts.accessibility.showPassword
                    }
                >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
            </div>
            {formErrors.password && (
                <div 
                    id="password-error" 
                    className="login__error"
                    role="alert"
                >
                    <FaExclamationTriangle />
                    {formErrors.password}
                </div>
            )}
        </div>
    ), [formData.password, formErrors.password, showPassword, handleInputChange, handleKeyDown, togglePasswordVisibility, isLoading]);
    
    return (
        <div className="login">
            <div className="login__container">
                <div className="login__header">
                    <h1 className="login__title">
                        {loginTexts.title}
                    </h1>
                    <p className="login__subtitle">
                        {loginTexts.subtitle}
                    </p>
                </div>
                
                <form 
                    className="login__form" 
                    onSubmit={handleSubmit}
                    aria-label={loginTexts.accessibility.loginForm}
                    noValidate
                >
                    {/* Username Field */}
                    {usernameField}
                    
                    {/* Password Field */}
                    {passwordField}
                    
                    {/* Global Error */}
                    {error && (
                        <div className="login__error" role="alert">
                            <FaExclamationTriangle />
                            {error}
                        </div>
                    )}
                    
                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="login__submit"
                        disabled={isLoading}
                        aria-describedby={isLoading ? "loading-status" : undefined}
                    >
                        {isLoading ? (
                            <div className="login__loading">
                                <div className="login__spinner" aria-hidden="true"></div>
                                <span id="loading-status">{loginTexts.loading}</span>
                            </div>
                        ) : (
                            loginTexts.loginButton
                        )}
                    </button>
                </form>
                
                {/* Links */}
                <div className="login__links">
                    <Link 
                        to="/forgot-password" 
                        className="login__link"
                        tabIndex={isLoading ? -1 : 0}
                    >
                        {loginTexts.forgotPassword}
                    </Link>
                    
                    <div className="login__divider">
                        {loginTexts.noAccount}
                    </div>
                    
                    <Link 
                        to="/register" 
                        className="login__link"
                        tabIndex={isLoading ? -1 : 0}
                    >
                        {loginTexts.createAccount}
                    </Link>
                </div>
            </div>
            
            {/* Success Notification */}
            {showSuccess && (
                <div className="login__success" role="alert">
                    <FaCheckCircle />
                    {loginTexts.success.login}
                </div>
            )}
        </div>
    );
};

export default Login;