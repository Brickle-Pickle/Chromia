import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../../context/app_context.jsx';
import './register.css';
import registerTexts from './register.json';

// React Icons imports - using FA icons for consistency with login component
import { 
    FaEye, 
    FaEyeSlash, 
    FaUser, 
    FaLock, 
    FaCheck, 
    FaExclamationTriangle,
    FaPalette,
    FaInfoCircle,
    FaMobile,
    FaDesktop
} from 'react-icons/fa';

const Register = () => {
    const navigate = useNavigate();
    const { register, isLoading, error, clearError, isAuthenticated } = useAppContext();
    
    // Form state
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: ''
    });
    
    // UI state
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    
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
    
    // Form validation
    const validateField = (name, value) => {
        const errors = {};
        
        switch (name) {
            case 'username':
                if (!value.trim()) {
                    errors.username = registerTexts.form.username.validation.required;
                } else if (value.length < 3) {
                    errors.username = registerTexts.form.username.validation.minLength;
                } else if (value.length > 20) {
                    errors.username = registerTexts.form.username.validation.maxLength;
                }
                break;
                
            case 'password':
                if (!value) {
                    errors.password = registerTexts.form.password.validation.required;
                } else if (value.length < 6) {
                    errors.password = registerTexts.form.password.validation.minLength;
                } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(value)) {
                    errors.password = registerTexts.form.password.validation.pattern;
                }
                break;
                
            case 'confirmPassword':
                if (!value) {
                    errors.confirmPassword = registerTexts.form.confirmPassword.validation.required;
                } else if (value !== formData.password) {
                    errors.confirmPassword = registerTexts.form.confirmPassword.validation.match;
                }
                break;
                
            default:
                break;
        }
        
        return errors;
    };
    
    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear validation errors for this field
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
        
        // Real-time validation
        const fieldErrors = validateField(name, value);
        if (Object.keys(fieldErrors).length > 0) {
            setValidationErrors(prev => ({
                ...prev,
                ...fieldErrors
            }));
        }
        
        // Special case for confirm password when password changes
        if (name === 'password' && formData.confirmPassword) {
            const confirmErrors = validateField('confirmPassword', formData.confirmPassword);
            if (Object.keys(confirmErrors).length > 0) {
                setValidationErrors(prev => ({
                    ...prev,
                    ...confirmErrors
                }));
            } else {
                setValidationErrors(prev => ({
                    ...prev,
                    confirmPassword: ''
                }));
            }
        }
    };
    
    // Validate entire form
    const validateForm = () => {
        const errors = {};
        
        Object.keys(formData).forEach(field => {
            const fieldErrors = validateField(field, formData[field]);
            Object.assign(errors, fieldErrors);
        });
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };
    
    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setIsSubmitting(true);
        clearError();
        setSuccessMessage('');
        
        try {
            const result = await register(formData.username, formData.password);
            
            if (result.success) {
                setSuccessMessage(registerTexts.messages.success);
                
                // Redirect after a short delay to show success message
                setTimeout(() => {
                    navigate('/');
                }, 1500);
            }
        } catch (err) {
            console.error('Registration error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Toggle password visibility
    const togglePasswordVisibility = (field) => {
        if (field === 'password') {
            setShowPassword(!showPassword);
        } else {
            setShowConfirmPassword(!showConfirmPassword);
        }
    };
    
    // Get input class based on validation state
    const getInputClass = (fieldName) => {
        let className = 'register__input';
        
        if (validationErrors[fieldName]) {
            className += ' error';
        } else if (formData[fieldName] && !validationErrors[fieldName]) {
            className += ' success';
        }
        
        return className;
    };
    
    // Feature icons mapping
    const featureIcons = [
        <FaPalette />,
        <FaInfoCircle />,
        <FaDesktop />,
        <FaMobile />
    ];
    
    return (
        <div className="register">
            <div className="register__container">
                {/* Form Section */}
                <div className="register__form-section">
                    <div className="register__header">
                        <h1 className="register__title">{registerTexts.title}</h1>
                        <p className="register__subtitle">{registerTexts.subtitle}</p>
                    </div>
                    
                    <form className="register__form" onSubmit={handleSubmit}>
                        {/* Username Field */}
                        <div className="register__field">
                            <label htmlFor="username" className="register__label">
                                {registerTexts.form.username.label}
                            </label>
                            <div className="register__input-wrapper">
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    placeholder={registerTexts.form.username.placeholder}
                                    className={getInputClass('username')}
                                    disabled={isSubmitting}
                                    autoComplete="username"
                                />
                                <FaUser className="register__input-icon" />
                            </div>
                            {validationErrors.username && (
                                <div className="register__error">
                                    <FaExclamationTriangle />
                                    {validationErrors.username}
                                </div>
                            )}
                            {formData.username && !validationErrors.username && (
                                <div className="register__success">
                                    <FaCheck />
                                    Nombre de usuario válido
                                </div>
                            )}
                        </div>
                        
                        {/* Password Field */}
                        <div className="register__field">
                            <label htmlFor="password" className="register__label">
                                {registerTexts.form.password.label}
                            </label>
                            <div className="register__input-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder={registerTexts.form.password.placeholder}
                                    className={getInputClass('password')}
                                    disabled={isSubmitting}
                                    autoComplete="new-password"
                                />
                                <FaLock className="register__input-icon" />
                                <button
                                    type="button"
                                    className="register__password-toggle"
                                    onClick={() => togglePasswordVisibility('password')}
                                    aria-label={showPassword ? registerTexts.buttons.hidePassword : registerTexts.buttons.showPassword}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            {validationErrors.password && (
                                <div className="register__error">
                                    <FaExclamationTriangle />
                                    {validationErrors.password}
                                </div>
                            )}
                            {formData.password && !validationErrors.password && (
                                <div className="register__success">
                                    <FaCheck />
                                    Contraseña válida
                                </div>
                            )}
                        </div>
                        
                        {/* Confirm Password Field */}
                        <div className="register__field">
                            <label htmlFor="confirmPassword" className="register__label">
                                {registerTexts.form.confirmPassword.label}
                            </label>
                            <div className="register__input-wrapper">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    placeholder={registerTexts.form.confirmPassword.placeholder}
                                    className={getInputClass('confirmPassword')}
                                    disabled={isSubmitting}
                                    autoComplete="new-password"
                                />
                                <FaLock className="register__input-icon" />
                                <button
                                    type="button"
                                    className="register__password-toggle"
                                    onClick={() => togglePasswordVisibility('confirmPassword')}
                                    aria-label={showConfirmPassword ? registerTexts.buttons.hidePassword : registerTexts.buttons.showPassword}
                                >
                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            {validationErrors.confirmPassword && (
                                <div className="register__error">
                                    <FaExclamationTriangle />
                                    {validationErrors.confirmPassword}
                                </div>
                            )}
                            {formData.confirmPassword && !validationErrors.confirmPassword && (
                                <div className="register__success">
                                    <FaCheck />
                                    Las contraseñas coinciden
                                </div>
                            )}
                        </div>
                        
                        {/* Global Error Message */}
                        {error && (
                            <div className="register__error">
                                <FaExclamationTriangle />
                                {error}
                            </div>
                        )}
                        
                        {/* Success Message */}
                        {successMessage && (
                            <div className="register__success">
                                <FaCheck />
                                {successMessage}
                            </div>
                        )}
                        
                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="register__submit"
                            disabled={isSubmitting || isLoading}
                        >
                            {isSubmitting || isLoading ? (
                                <div className="register__loading">
                                    <div className="register__spinner"></div>
                                    {registerTexts.buttons.registering}
                                </div>
                            ) : (
                                registerTexts.buttons.register
                            )}
                        </button>
                    </form>
                    
                    {/* Login Link */}
                    <div className="register__login-link">
                        {registerTexts.links.loginText}{' '}
                        <Link to="/login">{registerTexts.links.loginLink}</Link>
                    </div>
                </div>
                
                {/* Info Section */}
                <div className="register__info-section">
                    <div className="register__features">
                        <h2 className="register__features-title">
                            {registerTexts.features.title}
                        </h2>
                        <div className="register__features-list">
                            {registerTexts.features.items.map((feature, index) => (
                                <div key={index} className="register__feature">
                                    <div className="register__feature-icon">
                                        {featureIcons[index]}
                                    </div>
                                    <div className="register__feature-content">
                                        <h4>{feature.title}</h4>
                                        <p>{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;