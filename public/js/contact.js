// GreenMind - Contact Form JavaScript
// Author: Fatemeh - Group 6
// Description: AJAX form submission with async validation as required

"use strict";

// ============================================================================
// CONTACT FORM MANAGER CLASS
// ============================================================================

/**
 * Contact Form Manager - handles form validation and AJAX submission
 */
class ContactFormManager {
    /**
     * Initialize contact form manager
     */
    constructor() {
        this.form = document.getElementById('contact-form');
        this.validator = null;
        this.apiClient = new window.GreenMind.ApiClient();
        this.isSubmitting = false;
        
        this.init();
    }

    /**
     * Initialize form manager
     */
    init() {
        if (!this.form) {
            console.warn('Contact form not found');
            return;
        }

        this.setupFormValidation();
        this.setupEventListeners();
        this.setupCharacterCounter();
        
        console.log('📋 Contact form initialized');
    }

    /**
     * Setup form validation rules
     */
    setupFormValidation() {
        this.validator = new window.GreenMind.FormValidator(this.form);
        
        // Name validation
        this.validator.addRule('name', {
            required: true,
            requiredMessage: 'Please enter your full name',
            minLength: 2,
            minLengthMessage: 'Name must be at least 2 characters long',
            maxLength: 100,
            maxLengthMessage: 'Name cannot exceed 100 characters',
            pattern: /^[a-zA-Z\s\-'\.]+$/,
            patternMessage: 'Name can only contain letters, spaces, hyphens, apostrophes, and periods'
        });

        // Email validation
        this.validator.addRule('email', {
            required: true,
            requiredMessage: 'Please enter your email address',
            email: true,
            emailMessage: 'Please enter a valid email address',
            maxLength: 255,
            maxLengthMessage: 'Email cannot exceed 255 characters'
        });

        // Subject validation
        this.validator.addRule('subject', {
            required: true,
            requiredMessage: 'Please select a subject',
            custom: (value) => {
                if (value === '') {
                    return 'Please select a subject from the dropdown';
                }
                return true;
            }
        });

        // Message validation
        this.validator.addRule('message', {
            required: true,
            requiredMessage: 'Please enter your message',
            minLength: 10,
            minLengthMessage: 'Message must be at least 10 characters long',
            maxLength: 1000,
            maxLengthMessage: 'Message cannot exceed 1000 characters'
        });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (event) => {
            event.preventDefault();
            this.handleFormSubmit();
        });

        // Real-time validation on field blur (async error display as required)
        const fields = this.form.querySelectorAll('input, select, textarea');
        fields.forEach(field => {
            // Validate on blur (when user moves to another field as required)
            field.addEventListener('blur', () => {
                this.validateFieldAsync(field);
            });

            // Clear errors on input
            field.addEventListener('input', () => {
                this.clearFieldError(field);
            });
        });

        // Reset button
        const resetButton = this.form.querySelector('button[type="reset"]');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                this.resetForm();
            });
        }

        // Retry button in error message
        const retryButton = document.getElementById('retry-btn');
        if (retryButton) {
            retryButton.addEventListener('click', () => {
                this.hideMessages();
                this.handleFormSubmit();
            });
        }
    }

    /**
     * Setup character counter for message field
     */
    setupCharacterCounter() {
        const messageField = this.form.querySelector('#message');
        const charCounter = document.getElementById('char-count');
        
        if (messageField && charCounter) {
            const updateCounter = () => {
                const currentLength = messageField.value.length;
                charCounter.textContent = currentLength;
                
                // Change color based on usage
                if (currentLength > 900) {
                    charCounter.style.color = '#d32f2f'; // Red when near limit
                } else if (currentLength > 800) {
                    charCounter.style.color = '#f57f17'; // Orange when getting close
                } else {
                    charCounter.style.color = '#666'; // Default gray
                }
            };

            messageField.addEventListener('input', updateCounter);
            updateCounter(); // Initial count
        }
    }

    /**
     * Validate field asynchronously (shows errors when user moves to another field)
     * @param {HTMLElement} field - Field to validate
     */
    async validateFieldAsync(field) {
        if (!field) return;
        
        // Simulate async validation delay for demonstration
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const fieldName = field.name || field.getAttribute('name');
        const fieldValue = field.value || '';
        
        // Validate the field
        const error = this.validator.validateField(fieldName, fieldValue);
        
        if (error) {
            this.showFieldError(field, error);
        } else {
            this.clearFieldError(field);
        }
    }

    /**
     * Show error for a specific field
     * @param {HTMLElement} field - Field element
     * @param {string} error - Error message
     */
    showFieldError(field, error) {
        if (!field) return;
        
        // Remove success state first
        field.classList.remove('success');
        
        // Add error class to field
        field.classList.add('error');
        
        // Show error message
        const errorElement = this.form.querySelector(`#${field.name}-error`);
        if (errorElement) {
            errorElement.textContent = error;
            errorElement.classList.add('show');
        }
        
        // Trigger shake animation (handled by CSS)
        field.focus();
    }

    /**
     * Clear error for a specific field
     * @param {HTMLElement} field - Field element
     */
    clearFieldError(field) {
        if (!field) return;
        
        field.classList.remove('error');
        
        // Add success state if field has valid content
        if (field.value && field.value.trim()) {
            field.classList.add('success');
        } else {
            field.classList.remove('success');
        }
        
        const errorElement = this.form.querySelector(`#${field.name}-error`);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
        }
    }

    /**
     * Handle form submission
     */
    async handleFormSubmit() {
        if (this.isSubmitting) {
            return; // Prevent double submission
        }

        // Validate all fields
        const isValid = this.validator.validate();
        if (!isValid) {
            this.showValidationErrors();
            return;
        }

        // Show loading state
        this.setSubmittingState(true);
        
        try {
            // Collect form data
            const formData = this.collectFormData();
            
            // Submit via AJAX
            const response = await this.submitFormData(formData);
            
            // Show success message
            this.showSuccessMessage(response.message);
            
            // Reset form
            this.resetForm();
            
            // Track successful submission
            window.GreenMind.app.performanceMonitor.recordMetric('contact_form_submitted', Date.now());
            
        } catch (error) {
            console.error('❌ Form submission failed:', error);
            this.showErrorMessage(error.message);
        } finally {
            this.setSubmittingState(false);
        }
    }

    /**
     * Show validation errors
     */
    showValidationErrors() {
        // Find first field with error and focus it
        const firstErrorField = this.form.querySelector('.form-input.error, .form-select.error, .form-textarea.error');
        if (firstErrorField) {
            firstErrorField.focus();
            firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        // Show notification
        window.GreenMind.Utils.showNotification(
            'Please fix the errors in the form before submitting.',
            'error',
            5000
        );
    }

    /**
     * Collect form data using JSON (not FormData as per requirements)
     * @returns {Object} Form data object
     */
    collectFormData() {
        // Use direct form access instead of FormData for better null handling
        const nameField = this.form.querySelector('[name="name"]');
        const emailField = this.form.querySelector('[name="email"]');
        const subjectField = this.form.querySelector('[name="subject"]');
        const messageField = this.form.querySelector('[name="message"]');
        const newsletterField = this.form.querySelector('[name="newsletter"]');
        
        return {
            name: (nameField?.value || '').trim(),
            email: (emailField?.value || '').trim().toLowerCase(),
            subject: (subjectField?.value || '').trim(),
            message: (messageField?.value || '').trim(),
            newsletter: newsletterField?.checked || false,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };
    }

    /**
     * Submit form data via AJAX
     * @param {Object} data - Form data
     * @returns {Promise} Response promise
     */
    async submitFormData(data) {
        // Add retry logic
        const maxRetries = 3;
        let retryCount = 0;
        
        while (retryCount < maxRetries) {
            try {
                const response = await this.apiClient.post('/contact', data);
                return response;
            } catch (error) {
                retryCount++;
                
                if (retryCount >= maxRetries) {
                    throw error;
                }
                
                // Wait before retry (exponential backoff)
                const delay = Math.pow(2, retryCount) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
                
                console.log(`🔄 Retrying form submission (attempt ${retryCount + 1}/${maxRetries})`);
            }
        }
    }

    /**
     * Set submitting state
     * @param {boolean} isSubmitting - Whether form is being submitted
     */
    setSubmittingState(isSubmitting) {
        this.isSubmitting = isSubmitting;
        
        const submitButton = this.form.querySelector('#submit-btn');
        if (submitButton) {
            if (isSubmitting) {
                window.GreenMind.LoadingManager.showButtonLoading(submitButton);
            } else {
                window.GreenMind.LoadingManager.hideButtonLoading(submitButton);
            }
        }
        
        // Disable/enable all form fields
        const formFields = this.form.querySelectorAll('input, select, textarea, button');
        formFields.forEach(field => {
            field.disabled = isSubmitting;
        });
    }

    /**
     * Show success message
     * @param {string} message - Success message
     */
    showSuccessMessage(message) {
        this.hideMessages();
        
        const successElement = document.getElementById('form-success');
        if (successElement) {
            const messageElement = successElement.querySelector('p');
            if (messageElement) {
                messageElement.textContent = message;
            }
            successElement.classList.add('show');
            successElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        // Also show notification
        window.GreenMind.Utils.showNotification(message, 'success', 5000);
    }

    /**
     * Show error message
     * @param {string} error - Error message
     */
    showErrorMessage(error) {
        this.hideMessages();
        
        const errorElement = document.getElementById('form-error');
        if (errorElement) {
            const errorText = errorElement.querySelector('#error-text');
            if (errorText) {
                errorText.textContent = error;
            }
            errorElement.classList.add('show');
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        // Also show notification
        window.GreenMind.Utils.showNotification(error, 'error', 8000);
    }

    /**
     * Hide all messages
     */
    hideMessages() {
        const messages = [
            document.getElementById('form-success'),
            document.getElementById('form-error')
        ];
        
        messages.forEach(message => {
            if (message) {
                message.classList.remove('show');
            }
        });
    }

    /**
     * Reset form
     */
    resetForm() {
        this.form.reset();
        this.validator.clearErrors();
        this.hideMessages();
        
        // Reset character counter
        const charCounter = document.getElementById('char-count');
        if (charCounter) {
            charCounter.textContent = '0';
            charCounter.style.color = '#666';
        }
        
        // Focus first field
        const firstField = this.form.querySelector('input, select, textarea');
        if (firstField) {
            setTimeout(() => firstField.focus(), 100);
        }
    }
}

// ============================================================================
// CONTACT FORM ANALYTICS CLASS
// ============================================================================

/**
 * Contact Form Analytics - tracks form interactions
 */
class ContactFormAnalytics {
    constructor() {
        this.startTime = Date.now();
        this.interactions = [];
        this.fieldFocusTimes = {};
        
        this.init();
    }

    /**
     * Initialize analytics tracking
     */
    init() {
        this.trackFormInteractions();
        this.trackFieldFocus();
        this.trackFieldErrors();
    }

    /**
     * Track form interactions
     */
    trackFormInteractions() {
        const form = document.getElementById('contact-form');
        if (!form) return;

        // Track form start (first interaction)
        form.addEventListener('input', () => {
            if (this.interactions.length === 0) {
                this.recordInteraction('form_started');
            }
        }, { once: true });

        // Track field changes
        const fields = form.querySelectorAll('input, select, textarea');
        fields.forEach(field => {
            field.addEventListener('change', () => {
                this.recordInteraction('field_changed', {
                    fieldName: field.name,
                    fieldType: field.type,
                    hasValue: !!field.value
                });
            });
        });

        // Track form submission attempts
        form.addEventListener('submit', () => {
            this.recordInteraction('form_submitted');
        });
    }

    /**
     * Track field focus times
     */
    trackFieldFocus() {
        const fields = document.querySelectorAll('#contact-form input, #contact-form select, #contact-form textarea');
        
        fields.forEach(field => {
            let focusStartTime;
            
            field.addEventListener('focus', () => {
                focusStartTime = Date.now();
            });
            
            field.addEventListener('blur', () => {
                if (focusStartTime) {
                    const focusTime = Date.now() - focusStartTime;
                    
                    if (!this.fieldFocusTimes[field.name]) {
                        this.fieldFocusTimes[field.name] = [];
                    }
                    this.fieldFocusTimes[field.name].push(focusTime);
                    
                    this.recordInteraction('field_focused', {
                        fieldName: field.name,
                        focusTime: focusTime
                    });
                }
            });
        });
    }

    /**
     * Track field errors
     */
    trackFieldErrors() {
        // Observer for error message visibility changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const element = mutation.target;
                    if (element.classList.contains('error-message') && element.classList.contains('show')) {
                        const fieldName = element.id.replace('-error', '');
                        this.recordInteraction('field_error_shown', {
                            fieldName: fieldName,
                            errorMessage: element.textContent
                        });
                    }
                }
            });
        });

        // Observe error messages
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(errorMsg => {
            observer.observe(errorMsg, { attributes: true });
        });
    }

    /**
     * Record interaction
     * @param {string} action - Action type
     * @param {Object} data - Additional data
     */
    recordInteraction(action, data = {}) {
        const interaction = {
            action,
            timestamp: Date.now(),
            timeFromStart: Date.now() - this.startTime,
            ...data
        };
        
        this.interactions.push(interaction);
        console.log('📊 Form interaction recorded:', interaction);
    }

    /**
     * Get analytics summary
     * @returns {Object} Analytics summary
     */
    getAnalyticsSummary() {
        const totalTime = Date.now() - this.startTime;
        const fieldFocusStats = {};
        
        // Calculate average focus times
        Object.entries(this.fieldFocusTimes).forEach(([fieldName, times]) => {
            fieldFocusStats[fieldName] = {
                totalFocusTime: times.reduce((sum, time) => sum + time, 0),
                averageFocusTime: times.reduce((sum, time) => sum + time, 0) / times.length,
                focusCount: times.length
            };
        });
        
        return {
            totalInteractions: this.interactions.length,
            totalTimeOnForm: totalTime,
            fieldFocusStats,
            interactions: this.interactions
        };
    }
}

// ============================================================================
// FORM VALIDATION HELPERS
// ============================================================================

/**
 * Additional validation helpers for contact form
 */
class ContactFormValidationHelpers {
    /**
     * Validate email domain
     * @param {string} email - Email to validate
     * @returns {boolean} True if domain is valid
     */
    static isValidEmailDomain(email) {
        const commonDomains = [
            'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
            'icloud.com', 'aol.com', 'protonmail.com'
        ];
        
        const domain = email.split('@')[1]?.toLowerCase();
        if (!domain) return false;
        
        // Check if it's a common domain or has valid TLD
        return commonDomains.includes(domain) || /\.[a-z]{2,}$/i.test(domain);
    }

    /**
     * Check for spam patterns in message
     * @param {string} message - Message to check
     * @returns {boolean} True if message seems legitimate
     */
    static isLegitimateMessage(message) {
        const spamPatterns = [
            /urgent/i,
            /congratulations/i,
            /click here/i,
            /free money/i,
            /viagra/i,
            /lottery/i
        ];
        
        const suspiciousCount = spamPatterns.reduce((count, pattern) => {
            return count + (pattern.test(message) ? 1 : 0);
        }, 0);
        
        return suspiciousCount < 2; // Allow some flexibility
    }

    /**
     * Validate name format
     * @param {string} name - Name to validate
     * @returns {boolean} True if name format is valid
     */
    static isValidNameFormat(name) {
        // Check for minimum realistic name length and format
        const trimmedName = name.trim();
        
        // Must have at least first and last name
        const nameParts = trimmedName.split(/\s+/);
        if (nameParts.length < 2) return false;
        
        // Each part should be at least 2 characters
        return nameParts.every(part => part.length >= 2);
    }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Global contact form manager instance
let contactFormManager = null;
let contactFormAnalytics = null;

// Initialize contact form when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the contact page
    if (document.getElementById('contact-form')) {
        contactFormManager = new ContactFormManager();
        contactFormAnalytics = new ContactFormAnalytics();
        
        console.log('📞 Contact form system initialized');
        
        // Add additional validation rules
        if (contactFormManager.validator) {
            // Enhanced email validation
            const originalEmailRule = contactFormManager.validator.rules.email;
            contactFormManager.validator.addRule('email', {
                ...originalEmailRule,
                custom: (value) => {
                    if (!window.GreenMind.Utils.isValidEmail(value)) {
                        return 'Please enter a valid email address';
                    }
                    if (!ContactFormValidationHelpers.isValidEmailDomain(value)) {
                        return 'Please enter an email with a valid domain';
                    }
                    return true;
                }
            });
            
            // Enhanced name validation
            const originalNameRule = contactFormManager.validator.rules.name;
            contactFormManager.validator.addRule('name', {
                ...originalNameRule,
                custom: (value) => {
                    if (!ContactFormValidationHelpers.isValidNameFormat(value)) {
                        return 'Please enter your full name (first and last name)';
                    }
                    return true;
                }
            });
            
            // Enhanced message validation
            const originalMessageRule = contactFormManager.validator.rules.message;
            contactFormManager.validator.addRule('message', {
                ...originalMessageRule,
                custom: (value) => {
                    if (!ContactFormValidationHelpers.isLegitimateMessage(value)) {
                        return 'Please write a genuine message';
                    }
                    return true;
                }
            });
        }
    }
});

// Add shake animation CSS
const shakeAnimationCSS = `
    @keyframes shake {
        0%, 20%, 40%, 60%, 80%, 100% {
            transform: translateX(0);
        }
        10%, 30%, 50%, 70%, 90% {
            transform: translateX(-5px);
        }
    }
`;

// Inject shake animation CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = shakeAnimationCSS;
document.head.appendChild(styleSheet);

// Export for global access
if (typeof window !== 'undefined') {
    window.ContactFormManager = ContactFormManager;
    window.ContactFormAnalytics = ContactFormAnalytics;
    window.ContactFormValidationHelpers = ContactFormValidationHelpers;
}