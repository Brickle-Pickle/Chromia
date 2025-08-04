import React, { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaExclamationTriangle, 
    FaEnvelope, 
    FaCopy, 
    FaCheckCircle, 
    FaArrowLeft,
    FaTools,
    FaUser
} from 'react-icons/fa';
import { useAppContext } from '../../context/app_context.jsx';
import forgotPasswordTexts from './forgot_password.json';
import './forgot_password.css';

const ForgotPassword = () => {
    const { clearError } = useAppContext();
    
    // UI state
    const [emailCopied, setEmailCopied] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    
    // Clear errors when component mounts
    React.useEffect(() => {
        clearError();
    }, [clearError]);
    
    // Email template configuration
    const emailConfig = useMemo(() => ({
        to: 'bricklepicklegs@gmail.com',
        subject: forgotPasswordTexts.contact.emailSubject,
        body: forgotPasswordTexts.contact.emailBody
    }), []);
    
    // Handle copy email to clipboard - memoized
    const handleCopyEmail = useCallback(async () => {
        try {
            setIsAnimating(true);
            
            const emailText = `Para: ${emailConfig.to}\nAsunto: ${emailConfig.subject}\n\n${emailConfig.body}`;
            
            await navigator.clipboard.writeText(emailText);
            
            setEmailCopied(true);
            
            // Reset success state after 3 seconds
            setTimeout(() => {
                setEmailCopied(false);
            }, 3000);
            
        } catch (err) {
            console.error('Error copying to clipboard:', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = `Para: ${emailConfig.to}\nAsunto: ${emailConfig.subject}\n\n${emailConfig.body}`;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            setEmailCopied(true);
            setTimeout(() => {
                setEmailCopied(false);
            }, 3000);
        } finally {
            setTimeout(() => {
                setIsAnimating(false);
            }, 300);
        }
    }, [emailConfig]);
    
    // Handle mailto link - memoized
    const handleMailtoLink = useCallback(() => {
        const mailtoUrl = `mailto:${emailConfig.to}?subject=${encodeURIComponent(emailConfig.subject)}&body=${encodeURIComponent(emailConfig.body)}`;
        window.open(mailtoUrl, '_blank');
    }, [emailConfig]);
    
    // Memoize main content to prevent unnecessary re-renders
    const mainContent = useMemo(() => (
        <div className="forgot_password__content">
            {/* Warning Section */}
            <div className="forgot_password__warning">
                <div className="forgot_password__warning-icon">
                    <FaTools />
                </div>
                <div className="forgot_password__warning-content">
                    <h2 className="forgot_password__warning-title">
                        {forgotPasswordTexts.unavailable.title}
                    </h2>
                    <p className="forgot_password__warning-description">
                        {forgotPasswordTexts.unavailable.description}
                    </p>
                </div>
            </div>
            
            {/* Contact Section */}
            <div className="forgot_password__contact">
                <div className="forgot_password__contact-header">
                    <FaUser className="forgot_password__contact-icon" />
                    <h3 className="forgot_password__contact-title">
                        {forgotPasswordTexts.contact.title}
                    </h3>
                </div>
                
                <p className="forgot_password__contact-description">
                    {forgotPasswordTexts.contact.description}
                </p>
                
                {/* Email Actions */}
                <div className="forgot_password__email-actions">
                    <button
                        type="button"
                        className={`forgot_password__email-button ${isAnimating ? 'forgot_password__email-button--animating' : ''}`}
                        onClick={handleCopyEmail}
                        disabled={isAnimating}
                        aria-label={forgotPasswordTexts.accessibility.copyEmail}
                    >
                        <div className="forgot_password__email-button-content">
                            {emailCopied ? (
                                <>
                                    <FaCheckCircle className="forgot_password__email-icon" />
                                    <span>{forgotPasswordTexts.contact.emailCopied}</span>
                                </>
                            ) : (
                                <>
                                    <FaCopy className="forgot_password__email-icon" />
                                    <span>{forgotPasswordTexts.contact.emailButton}</span>
                                </>
                            )}
                        </div>
                        <div className="forgot_password__email-button-ripple"></div>
                    </button>
                    
                    <button
                        type="button"
                        className="forgot_password__mailto-button"
                        onClick={handleMailtoLink}
                        aria-label="Abrir cliente de correo"
                    >
                        <FaEnvelope className="forgot_password__mailto-icon" />
                        <span>Abrir en cliente de correo</span>
                    </button>
                </div>
                
                {/* Email Preview */}
                <div className="forgot_password__email-preview">
                    <div className="forgot_password__email-preview-header">
                        <span className="forgot_password__email-preview-label">Vista previa del email:</span>
                    </div>
                    <div className="forgot_password__email-preview-content">
                        <div className="forgot_password__email-field">
                            <strong>Para:</strong> {emailConfig.to}
                        </div>
                        <div className="forgot_password__email-field">
                            <strong>Asunto:</strong> {emailConfig.subject}
                        </div>
                        <div className="forgot_password__email-field">
                            <strong>Mensaje:</strong>
                            <pre className="forgot_password__email-body">{emailConfig.body}</pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    ), [emailConfig, isAnimating, emailCopied, handleCopyEmail, handleMailtoLink]);
    
    return (
        <div className="forgot_password">
            <div className="forgot_password__container">
                <div className="forgot_password__header">
                    <div className="forgot_password__header-icon">
                        <FaExclamationTriangle />
                    </div>
                    <h1 className="forgot_password__title">
                        {forgotPasswordTexts.title}
                    </h1>
                    <p className="forgot_password__subtitle">
                        {forgotPasswordTexts.subtitle}
                    </p>
                </div>
                
                {/* Main Content */}
                {mainContent}
                
                {/* Back to Login */}
                <div className="forgot_password__actions">
                    <Link 
                        to="/login" 
                        className="forgot_password__back-link"
                        aria-label={forgotPasswordTexts.accessibility.backToLogin}
                    >
                        <FaArrowLeft className="forgot_password__back-icon" />
                        <span>{forgotPasswordTexts.backToLogin}</span>
                    </Link>
                </div>
            </div>
            
            {/* Success Notification */}
            {emailCopied && (
                <div className="forgot_password__notification" role="alert">
                    <FaCheckCircle />
                    <span>{forgotPasswordTexts.contact.emailCopied}</span>
                </div>
            )}
        </div>
    );
};

export default ForgotPassword;