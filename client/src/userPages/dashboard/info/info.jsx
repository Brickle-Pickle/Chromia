import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../../context/app_context.jsx';
import {
    FiUser, 
    FiCode, 
    FiCalendar, 
    FiMonitor,
    FiServer,
    FiDatabase,
    FiMapPin,
    FiAward,
    FiTrendingUp
} from 'react-icons/fi';
import { FaLightbulb } from "react-icons/fa";
import { IoMdRocket } from "react-icons/io";
import './info.css';
import infoData from './info.json';

const Info = () => {
    const navigate = useNavigate();
    const { user } = useAppContext();
    const [visibleCards, setVisibleCards] = useState([]);
    const [visibleTimelineItems, setVisibleTimelineItems] = useState([]);

    // Icon mapping for dynamic icon rendering
    const iconMap = {
        lightbulb: FaLightbulb,
        user: FiUser,
        code: FiCode,
        calendar: FiCalendar,
        rocket: IoMdRocket,
        monitor: FiMonitor,
        server: FiServer,
        database: FiDatabase
    };

    // Animation on scroll effect
    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    
                    if (element.classList.contains('info-card')) {
                        const cardIndex = Array.from(document.querySelectorAll('.info-card')).indexOf(element);
                        setTimeout(() => {
                            setVisibleCards(prev => [...prev, cardIndex]);
                        }, cardIndex * 150);
                    }
                    
                    if (element.classList.contains('timeline-item')) {
                        const timelineIndex = Array.from(document.querySelectorAll('.timeline-item')).indexOf(element);
                        setTimeout(() => {
                            setVisibleTimelineItems(prev => [...prev, timelineIndex]);
                        }, timelineIndex * 200);
                    }
                }
            });
        }, observerOptions);

        // Observe cards and timeline items after component mounts
        setTimeout(() => {
            document.querySelectorAll('.info-card, .timeline-item').forEach(el => {
                observer.observe(el);
            });
        }, 100);

        return () => observer.disconnect();
    }, []);

    // Handle CTA button click
    const handleCTAClick = () => {
        if (user) {
            navigate('/color-palettes');
        } else {
            navigate('/login');
        }
    };

    // Render technology items
    const renderTechItems = (techArray) => {
        return techArray.map((tech, index) => (
            <div key={index} className="tech-item">
                <span className="tech-name">{tech.name}</span>
                <span className="tech-description">{tech.description}</span>
            </div>
        ));
    };

    // Render timeline status icon
    const getTimelineStatusClass = (status) => {
        switch (status) {
            case 'completed':
                return 'completed';
            case 'in-progress':
                return 'in-progress';
            case 'pending':
            default:
                return 'pending';
        }
    };

    return (
        <div className="dashboard_info">
            <div className="container">
                {/* Header Section */}
                <div className="info-header">
                    <h1>{infoData.title}</h1>
                    <p>{infoData.subtitle}</p>
                </div>

                {/* Main Information Grid */}
                <div className="info-grid">
                    {/* Inspiration Card */}
                    <div className={`info-card ${visibleCards.includes(0) ? 'visible' : ''}`}>
                        <div className="card-header">
                            <div className="card-icon">
                                {React.createElement(iconMap[infoData.sections.inspiration.icon])}
                            </div>
                            <h3 className="card-title">{infoData.sections.inspiration.title}</h3>
                        </div>
                        <p>{infoData.sections.inspiration.content}</p>
                    </div>

                    {/* Enhanced Developer Card */}
                    <div className={`info-card developer-card ${visibleCards.includes(1) ? 'visible' : ''}`}>
                        <div className="card-header">
                            <div className="card-icon">
                                {React.createElement(iconMap[infoData.sections.developer.icon])}
                            </div>
                            <h3 className="card-title">{infoData.sections.developer.title}</h3>
                        </div>
                        <div className="developer-info">
                            <div className="developer-name">{infoData.sections.developer.name}</div>
                            <div className="developer-real-name">({infoData.sections.developer.realName})</div>
                            <div className="developer-location">
                                <FiMapPin size={14} />
                                {infoData.sections.developer.location}
                            </div>
                            <p className="developer-description">{infoData.sections.developer.description}</p>
                            
                            {/* Experience Stats */}
                            <div className="developer-stats">
                                <div className="stat-item">
                                    <FiTrendingUp />
                                    <span className="stat-value">{infoData.sections.developer.experience.years}</span>
                                    <span className="stat-label">Experiencia</span>
                                </div>
                                <div className="stat-item">
                                    <FiAward />
                                    <span className="stat-value">{infoData.sections.developer.experience.projects}</span>
                                    <span className="stat-label">Proyectos</span>
                                </div>
                            </div>

                            {/* Specialties */}
                            <div className="developer-specialties">
                                <h4>Especialidades:</h4>
                                <div className="specialties-list">
                                    {infoData.sections.developer.specialties.map((specialty, index) => (
                                        <span key={index} className="specialty-tag">
                                            {specialty}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="developer-philosophy">
                                <em>"{infoData.sections.developer.philosophy}"</em>
                            </div>
                        </div>
                    </div>

                    {/* Technologies Card */}
                    <div className={`info-card ${visibleCards.includes(2) ? 'visible' : ''}`}>
                        <div className="card-header">
                            <div className="card-icon">
                                {React.createElement(iconMap[infoData.sections.technologies.icon])}
                            </div>
                            <h3 className="card-title">{infoData.sections.technologies.title}</h3>
                        </div>
                        
                        <div className="tech-section">
                            <div className="tech-category">Frontend</div>
                            <div className="tech-list">
                                {renderTechItems(infoData.sections.technologies.frontend)}
                            </div>
                        </div>
                        
                        <div className="tech-section">
                            <div className="tech-category">Backend</div>
                            <div className="tech-list">
                                {renderTechItems(infoData.sections.technologies.backend)}
                            </div>
                        </div>
                    </div>

                    {/* Development Duration Card */}
                    <div className={`info-card ${visibleCards.includes(3) ? 'visible' : ''}`}>
                        <div className="card-header">
                            <div className="card-icon">
                                {React.createElement(iconMap[infoData.sections.development.icon])}
                            </div>
                            <h3 className="card-title">{infoData.sections.development.title}</h3>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ 
                                fontSize: 'var(--text-3xl)', 
                                fontWeight: '600', 
                                color: 'var(--primary-color)',
                                marginBottom: 'var(--space-sm)'
                            }}>
                                {infoData.sections.development.duration}
                            </div>
                            <p>{infoData.sections.development.description}</p>
                        </div>
                    </div>

                    {/* Future Vision Card */}
                    <div className={`info-card ${visibleCards.includes(4) ? 'visible' : ''}`}>
                        <div className="card-header">
                            <div className="card-icon">
                                {React.createElement(iconMap[infoData.sections.future.icon])}
                            </div>
                            <h3 className="card-title">{infoData.sections.future.title}</h3>
                        </div>
                        <p style={{ marginBottom: 'var(--space-lg)' }}>
                            {infoData.sections.future.description}
                        </p>
                        <ul className="future-list">
                            {infoData.sections.future.features.map((feature, index) => (
                                <li key={index} className="future-item">
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Timeline Section */}
                <div className="timeline-section">
                    <div className="timeline-header">
                        <h2 className="timeline-title">{infoData.timeline.title}</h2>
                    </div>
                    
                    <div className="timeline">
                        {infoData.timeline.phases.map((phase, index) => (
                            <div 
                                key={index} 
                                className={`timeline-item ${getTimelineStatusClass(phase.status)} ${
                                    visibleTimelineItems.includes(index) ? 'visible' : ''
                                }`}
                            >
                                <div className="timeline-marker"></div>
                                <div className="timeline-content">
                                    <div className="timeline-phase">{phase.phase}</div>
                                    <h4 className="timeline-title-item">{phase.title}</h4>
                                    <p className="timeline-description">{phase.description}</p>
                                    <ul className="timeline-tasks">
                                        {phase.tasks.map((task, taskIndex) => (
                                            <li key={taskIndex} className="timeline-task">
                                                {task}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Call to Action Section */}
                <div className="cta-section">
                    <h3 className="cta-title">{infoData.cta.title}</h3>
                    <p className="cta-description">{infoData.cta.description}</p>
                    <button 
                        className="cta-button"
                        onClick={handleCTAClick}
                    >
                        {infoData.cta.button}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Info;