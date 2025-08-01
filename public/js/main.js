// GreenMind - Main JavaScript File
// Author: Fatemeh - Group 6
// Description: Core JavaScript functionality for the GreenMind website

"use strict";

// ============================================================================
// GLOBAL CONSTANTS AND CONFIGURATION
// ============================================================================

const CONFIG = {
    API_BASE_URL: window.location.origin + '/api',
    ANIMATION_DURATION: 300,
    DEBOUNCE_DELAY: 500,
    MAX_RETRIES: 3
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Utility class with helper functions
 */
class Utils {
    /**
     * Debounce function to limit rapid function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Delay in milliseconds
     * @returns {Function} Debounced function
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function to limit function execution rate
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} Throttled function
     */
    static throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Format date to readable string
     * @param {Date} date - Date object
     * @returns {string} Formatted date string
     */
    static formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    }

    /**
     * Generate unique ID
     * @returns {string} Unique identifier
     */
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} True if valid email
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Sanitize HTML string
     * @param {string} str - String to sanitize
     * @returns {string} Sanitized string
     */
    static sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }

    /**
     * Show notification message
     * @param {string} message - Message to display
     * @param {string} type - Type of notification (success, error, info)
     * @param {number} duration - Duration in milliseconds
     */
    static showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${Utils.sanitizeHTML(message)}</span>
                <button class="notification-close" aria-label="Close notification">&times;</button>
            </div>
        `;

        // Add styles if not already present
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 100px;
                    right: 20px;
                    max-width: 400px;
                    padding: 1rem;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 10000;
                    transform: translateX(100%);
                    transition: transform 0.3s ease;
                }
                .notification.show {
                    transform: translateX(0);
                }
                .notification-success {
                    background: #e8f5e8;
                    border-left: 4px solid #4caf50;
                    color: #2d7d32;
                }
                .notification-error {
                    background: #ffebee;
                    border-left: 4px solid #f44336;
                    color: #d32f2f;
                }
                .notification-info {
                    background: #e3f2fd;
                    border-left: 4px solid #2196f3;
                    color: #1976d2;
                }
                .notification-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 1rem;
                }
                .notification-close {
                    background: none;
                    border: none;
                    font-size: 1.2rem;
                    cursor: pointer;
                    color: inherit;
                    opacity: 0.7;
                }
                .notification-close:hover {
                    opacity: 1;
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);

        // Auto remove
        const removeNotification = () => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        };

        // Close button
        notification.querySelector('.notification-close').addEventListener('click', removeNotification);

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(removeNotification, duration);
        }
    }
}

// ============================================================================
// NAVIGATION COMPONENT
// ============================================================================

/**
 * Navigation functionality
 */
class Navigation {
    constructor() {
        this.hamburger = document.querySelector('.hamburger');
        this.navMenu = document.querySelector('.nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.header = document.querySelector('.header');
        
        this.init();
    }

    init() {
        this.setupHamburgerMenu();
        this.setupSmoothScrolling();
        this.setupActiveNavLinks();
        this.setupScrollHeader();
    }

    setupHamburgerMenu() {
        if (!this.hamburger || !this.navMenu) return;

        this.hamburger.addEventListener('click', () => {
            this.hamburger.classList.toggle('active');
            this.navMenu.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = this.navMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu when clicking on nav links
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.hamburger.classList.remove('active');
                this.navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (event) => {
            if (!this.navMenu.contains(event.target) && !this.hamburger.contains(event.target)) {
                this.hamburger.classList.remove('active');
                this.navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    setupSmoothScrolling() {
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    setupActiveNavLinks() {
        // Set active nav link based on current page
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        this.navLinks.forEach(link => {
            const linkPage = link.getAttribute('href');
            if (linkPage === currentPage || 
                (currentPage === '' && linkPage === 'index.html') ||
                (currentPage === '/' && linkPage === 'index.html')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    setupScrollHeader() {
        let lastScrollY = window.scrollY;
        
        const handleScroll = Utils.throttle(() => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > 100) {
                this.header.classList.add('scrolled');
                this.header.style.background = 'rgba(255, 255, 255, 0.98)';
                this.header.style.backdropFilter = 'blur(15px)';
            } else {
                this.header.classList.remove('scrolled');
                this.header.style.background = 'rgba(255, 255, 255, 0.95)';
                this.header.style.backdropFilter = 'blur(10px)';
            }
            
            lastScrollY = currentScrollY;
        }, 100);

        window.addEventListener('scroll', handleScroll);
    }
}

// ============================================================================
// FORM VALIDATION
// ============================================================================

/**
 * Form validation utility
 */
class FormValidator {
    constructor(form) {
        this.form = form;
        this.errors = {};
        this.rules = {};
    }

    /**
     * Add validation rule for a field
     * @param {string} fieldName - Name of the field
     * @param {Object} rules - Validation rules
     */
    addRule(fieldName, rules) {
        this.rules[fieldName] = rules;
    }

    /**
     * Validate a single field
     * @param {string} fieldName - Name of the field
     * @param {*} value - Value to validate
     * @returns {string|null} Error message or null if valid
     */
    validateField(fieldName, value) {
        const rules = this.rules[fieldName];
        if (!rules) return null;

        // Required validation
        if (rules.required && (!value || value.toString().trim() === '')) {
            return rules.requiredMessage || `${fieldName} is required`;
        }

        // Skip other validations if field is empty and not required
        if (!value || value.toString().trim() === '') {
            return null;
        }

        // Email validation
        if (rules.email && !Utils.isValidEmail(value)) {
            return rules.emailMessage || 'Please enter a valid email address';
        }

        // Minimum length validation
        if (rules.minLength && value.length < rules.minLength) {
            return rules.minLengthMessage || `Minimum ${rules.minLength} characters required`;
        }

        // Maximum length validation
        if (rules.maxLength && value.length > rules.maxLength) {
            return rules.maxLengthMessage || `Maximum ${rules.maxLength} characters allowed`;
        }

        // Pattern validation
        if (rules.pattern && !rules.pattern.test(value)) {
            return rules.patternMessage || 'Invalid format';
        }

        // Custom validation
        if (rules.custom && typeof rules.custom === 'function') {
            const result = rules.custom(value);
            if (result !== true) {
                return result || 'Invalid value';
            }
        }

        return null;
    }

    /**
     * Validate all fields
     * @returns {boolean} True if all fields are valid
     */
    validate() {
        this.errors = {};
        let isValid = true;

        // Validate each field with rules
        Object.keys(this.rules).forEach(fieldName => {
            const field = this.form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                const error = this.validateField(fieldName, field.value);
                if (error) {
                    this.errors[fieldName] = error;
                    isValid = false;
                }
            }
        });

        this.displayErrors();
        return isValid;
    }

    /**
     * Display validation errors
     */
    displayErrors() {
        // Clear previous errors
        this.form.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
            el.classList.remove('show');
        });
        
        this.form.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(el => {
            el.classList.remove('error');
        });

        // Show new errors
        Object.keys(this.errors).forEach(fieldName => {
            const field = this.form.querySelector(`[name="${fieldName}"]`);
            const errorElement = this.form.querySelector(`#${fieldName}-error`);
            
            if (field && errorElement) {
                field.classList.add('error');
                errorElement.textContent = this.errors[fieldName];
                errorElement.classList.add('show');
            }
        });
    }

    /**
     * Clear all errors
     */
    clearErrors() {
        this.errors = {};
        this.displayErrors();
    }
}

// ============================================================================
// LOADING STATES
// ============================================================================

/**
 * Loading state manager
 */
class LoadingManager {
    /**
     * Show loading state for a button
     * @param {HTMLElement} button - Button element
     */
    static showButtonLoading(button) {
        if (!button) return;
        
        button.classList.add('loading');
        button.disabled = true;
        
        // Store original text if not already stored
        if (!button.dataset.originalText) {
            button.dataset.originalText = button.textContent;
        }
    }

    /**
     * Hide loading state for a button
     * @param {HTMLElement} button - Button element
     */
    static hideButtonLoading(button) {
        if (!button) return;
        
        button.classList.remove('loading');
        button.disabled = false;
        
        // Restore original text
        if (button.dataset.originalText) {
            button.querySelector('.btn-text').textContent = button.dataset.originalText;
        }
    }

    /**
     * Show page loading overlay
     */
    static showPageLoading() {
        let overlay = document.getElementById('page-loading-overlay');
        
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'page-loading-overlay';
            overlay.innerHTML = `
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <p>Loading...</p>
                </div>
            `;
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                backdrop-filter: blur(5px);
            `;
            document.body.appendChild(overlay);
        }
        
        overlay.style.display = 'flex';
    }

    /**
     * Hide page loading overlay
     */
    static hidePageLoading() {
        const overlay = document.getElementById('page-loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
}

// ============================================================================
// API CLIENT
// ============================================================================

/**
 * API client for making HTTP requests
 */
class ApiClient {
    constructor(baseURL = CONFIG.API_BASE_URL) {
        this.baseURL = baseURL;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
        };
    }

    /**
     * Make HTTP request
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @returns {Promise} Response promise
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: { ...this.defaultHeaders, ...options.headers },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    /**
     * GET request
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @returns {Promise} Response promise
     */
    get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }

    /**
     * POST request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request data
     * @param {Object} options - Request options
     * @returns {Promise} Response promise
     */
    post(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * PUT request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request data
     * @param {Object} options - Request options
     * @returns {Promise} Response promise
     */
    put(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE request
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @returns {Promise} Response promise
     */
    delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }
}

// ============================================================================
// SCROLL ANIMATIONS
// ============================================================================

/**
 * Scroll-based animations
 */
class ScrollAnimations {
    constructor() {
        this.animatedElements = [];
        this.init();
    }

    init() {
        // Find elements to animate
        const elementsToAnimate = document.querySelectorAll(
            '.feature-card, .stat-item, .content-card, .interest-card, .academic-card, .timeline-item'
        );

        elementsToAnimate.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            element.style.transitionDelay = `${index * 0.1}s`;
            
            this.animatedElements.push(element);
        });

        this.setupScrollObserver();
    }

    setupScrollObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        this.animatedElements.forEach(element => {
            observer.observe(element);
        });
    }
}

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

/**
 * Performance monitoring utility
 */
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.init();
    }

    init() {
        // Monitor page load time
        window.addEventListener('load', () => {
            this.recordPageLoadTime();
        });

        // Monitor user interactions
        this.setupInteractionTracking();
    }

    recordPageLoadTime() {
        if (window.performance && window.performance.timing) {
            const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
            this.metrics.pageLoadTime = loadTime;
            
            console.log(`Page load time: ${loadTime}ms`);
            
            // Alert if page takes too long to load
            if (loadTime > 3000) {
                console.warn('Page load time exceeds 3 seconds');
            }
        }
    }

    setupInteractionTracking() {
        // Track form submissions
        document.addEventListener('submit', (event) => {
            const formId = event.target.id || 'unknown-form';
            console.log(`Form submitted: ${formId}`);
        });

        // Track button clicks
        document.addEventListener('click', (event) => {
            if (event.target.matches('.btn, button')) {
                const buttonText = event.target.textContent.trim();
                console.log(`Button clicked: ${buttonText}`);
            }
        });
    }

    /**
     * Record custom metric
     * @param {string} name - Metric name
     * @param {*} value - Metric value
     */
    recordMetric(name, value) {
        this.metrics[name] = value;
        console.log(`Metric recorded - ${name}: ${value}`);
    }

    /**
     * Get all recorded metrics
     * @returns {Object} All metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Main application initialization
 */
class GreenMindApp {
    constructor() {
        this.navigation = null;
        this.scrollAnimations = null;
        this.performanceMonitor = null;
        this.apiClient = new ApiClient();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }
    }

    initializeComponents() {
        try {
            // Initialize core components
            this.navigation = new Navigation();
            this.scrollAnimations = new ScrollAnimations();
            this.performanceMonitor = new PerformanceMonitor();

            // Setup global error handling
            this.setupErrorHandling();

            // Setup accessibility features
            this.setupAccessibility();

            console.log('✅ GreenMind application initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize GreenMind application:', error);
            Utils.showNotification('Application failed to load. Please refresh the page.', 'error');
        }
    }

    setupErrorHandling() {
        // Global error handler
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            // Don't show notification for every error to avoid spam
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
        });
    }

    setupAccessibility() {
        // Keyboard navigation support
        document.addEventListener('keydown', (event) => {
            // Escape key closes modals/menus
            if (event.key === 'Escape') {
                const activeMenu = document.querySelector('.nav-menu.active');
                if (activeMenu) {
                    const hamburger = document.querySelector('.hamburger.active');
                    if (hamburger) {
                        hamburger.click();
                    }
                }
            }
        });

        // Focus management for skip links
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) {
            skipLink.addEventListener('click', (event) => {
                event.preventDefault();
                const target = document.querySelector(skipLink.getAttribute('href'));
                if (target) {
                    target.focus();
                    target.scrollIntoView();
                }
            });
        }
    }
}

// ============================================================================
// GLOBAL APP INSTANCE
// ============================================================================

// Create and initialize the main application
const app = new GreenMindApp();
app.init();

// Export utilities for use in other modules
window.GreenMind = {
    Utils,
    FormValidator,
    LoadingManager,
    ApiClient,
    app
};