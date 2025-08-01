// GreenMind - Utilities Index
// Author: Fatemeh - Group 6
// Description: Utility functions and helpers

const { AppError, catchAsync } = require('../middleware/errorHandler');

/**
 * Utility functions class
 */
class Utils {
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
        if (typeof str !== 'string') return str;
        
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }

    /**
     * Generate unique ID
     * @returns {string} Unique identifier
     */
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Format date to readable string
     * @param {Date} date - Date object
     * @param {string} locale - Locale string (default: en-US)
     * @returns {string} Formatted date string
     */
    static formatDate(date, locale = 'en-US') {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        
        return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    /**
     * Calculate percentage
     * @param {number} part - Part value
     * @param {number} total - Total value
     * @param {number} precision - Decimal precision (default: 2)
     * @returns {number} Percentage
     */
    static calculatePercentage(part, total, precision = 2) {
        if (total === 0) return 0;
        return Math.round((part / total) * 100 * Math.pow(10, precision)) / Math.pow(10, precision);
    }

    /**
     * Validate environment variables
     * @param {Array} requiredVars - Array of required variable names
     * @throws {AppError} If required variables are missing
     */
    static validateEnvironmentVariables(requiredVars) {
        const missingVars = requiredVars.filter(varName => !process.env[varName]);
        
        if (missingVars.length > 0) {
            throw new AppError(
                `Missing required environment variables: ${missingVars.join(', ')}`,
                500
            );
        }
    }

    /**
     * Sleep function for async operations
     * @param {number} ms - Milliseconds to sleep
     * @returns {Promise} Sleep promise
     */
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Retry function with exponential backoff
     * @param {Function} fn - Function to retry
     * @param {number} maxRetries - Maximum number of retries
     * @param {number} baseDelay - Base delay in milliseconds
     * @returns {Promise} Result of the function
     */
    static async retry(fn, maxRetries = 3, baseDelay = 1000) {
        let lastError;
        
        for (let i = 0; i <= maxRetries; i++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;
                
                if (i === maxRetries) {
                    throw lastError;
                }
                
                const delay = baseDelay * Math.pow(2, i);
                await Utils.sleep(delay);
            }
        }
    }

    /**
     * Deep clone an object
     * @param {Object} obj - Object to clone
     * @returns {Object} Cloned object
     */
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        
        if (obj instanceof Array) {
            return obj.map(item => Utils.deepClone(item));
        }
        
        if (typeof obj === 'object') {
            const cloned = {};
            Object.keys(obj).forEach(key => {
                cloned[key] = Utils.deepClone(obj[key]);
            });
            return cloned;
        }
        
        return obj;
    }

    /**
     * Check if value is empty
     * @param {*} value - Value to check
     * @returns {boolean} True if empty
     */
    static isEmpty(value) {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim().length === 0;
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
    }

    /**
     * Capitalize first letter of string
     * @param {string} str - String to capitalize
     * @returns {string} Capitalized string
     */
    static capitalize(str) {
        if (typeof str !== 'string' || str.length === 0) return str;
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    /**
     * Convert string to slug
     * @param {string} str - String to convert
     * @returns {string} Slug string
     */
    static slugify(str) {
        return str
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    /**
     * Truncate text to specified length
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length
     * @param {string} suffix - Suffix to add (default: '...')
     * @returns {string} Truncated text
     */
    static truncate(text, maxLength, suffix = '...') {
        if (typeof text !== 'string') return text;
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - suffix.length) + suffix;
    }

    /**
     * Parse JSON safely
     * @param {string} jsonString - JSON string to parse
     * @param {*} defaultValue - Default value if parsing fails
     * @returns {*} Parsed JSON or default value
     */
    static safeJsonParse(jsonString, defaultValue = null) {
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            return defaultValue;
        }
    }

    /**
     * Get client IP address from request
     * @param {Object} req - Express request object
     * @returns {string} Client IP address
     */
    static getClientIP(req) {
        return req.ip || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress ||
               (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
               'unknown';
    }

    /**
     * Validate password strength
     * @param {string} password - Password to validate
     * @returns {Object} Validation result
     */
    static validatePasswordStrength(password) {
        const result = {
            isValid: false,
            score: 0,
            feedback: []
        };

        if (!password || typeof password !== 'string') {
            result.feedback.push('Password is required');
            return result;
        }

        if (password.length < 8) {
            result.feedback.push('Password must be at least 8 characters long');
        } else {
            result.score += 1;
        }

        if (!/[a-z]/.test(password)) {
            result.feedback.push('Password must contain at least one lowercase letter');
        } else {
            result.score += 1;
        }

        if (!/[A-Z]/.test(password)) {
            result.feedback.push('Password must contain at least one uppercase letter');
        } else {
            result.score += 1;
        }

        if (!/\d/.test(password)) {
            result.feedback.push('Password must contain at least one number');
        } else {
            result.score += 1;
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            result.feedback.push('Password must contain at least one special character');
        } else {
            result.score += 1;
        }

        result.isValid = result.score >= 4 && result.feedback.length === 0;
        return result;
    }

    /**
     * Generate random string
     * @param {number} length - Length of string
     * @param {string} charset - Character set to use
     * @returns {string} Random string
     */
    static generateRandomString(length = 10, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return result;
    }

    /**
     * Convert bytes to human readable format
     * @param {number} bytes - Bytes to convert
     * @param {number} decimals - Number of decimal places
     * @returns {string} Human readable format
     */
    static formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
}

module.exports = {
    Utils,
    AppError,
    catchAsync
};