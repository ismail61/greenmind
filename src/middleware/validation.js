// GreenMind - Validation Middleware
// Author: Fatemeh - Group 6
// Description: Request validation middleware functions

/**
 * Validation middleware class
 */
class ValidationMiddleware {
    /**
     * Validate contact form data
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    static validateContactForm(req, res, next) {
        const { name, email, subject, message } = req.body;
        const errors = {};

        // Name validation
        if (!name || typeof name !== 'string') {
            errors.name = 'Name is required and must be a string';
        } else if (name.trim().length < 2) {
            errors.name = 'Name must be at least 2 characters long';
        } else if (name.trim().length > 100) {
            errors.name = 'Name cannot exceed 100 characters';
        } else {
            // Check for realistic name format
            const nameParts = name.trim().split(/\s+/);
            if (nameParts.length < 2 || !nameParts.every(part => part.length >= 2)) {
                errors.name = 'Please enter your full name (first and last name)';
            }
        }

        // Email validation
        if (!email || typeof email !== 'string') {
            errors.email = 'Email is required and must be a string';
        } else if (email.trim().length > 255) {
            errors.email = 'Email cannot exceed 255 characters';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.trim())) {
                errors.email = 'Please enter a valid email address';
            } else {
                // Additional domain validation
                const domain = email.split('@')[1];
                if (!domain || !/\.[a-z]{2,}$/i.test(domain)) {
                    errors.email = 'Please enter an email with a valid domain';
                }
            }
        }

        // Subject validation
        if (!subject || typeof subject !== 'string') {
            errors.subject = 'Subject is required and must be a string';
        } else {
            const validSubjects = ['general', 'recycling', 'energy', 'water', 'climate', 'feedback', 'collaboration', 'other'];
            if (!validSubjects.includes(subject.trim().toLowerCase())) {
                errors.subject = 'Please select a valid subject';
            }
        }

        // Message validation
        if (!message || typeof message !== 'string') {
            errors.message = 'Message is required and must be a string';
        } else if (message.trim().length < 10) {
            errors.message = 'Message must be at least 10 characters long';
        } else if (message.trim().length > 1000) {
            errors.message = 'Message cannot exceed 1000 characters';
        } else {
            // Basic spam detection
            const spamPatterns = [/urgent/i, /congratulations/i, /click here/i, /free money/i, /lottery/i];
            const suspiciousCount = spamPatterns.reduce((count, pattern) => {
                return count + (pattern.test(message) ? 1 : 0);
            }, 0);
            
            if (suspiciousCount >= 2) {
                errors.message = 'Please write a genuine message';
            }
        }

        // If there are validation errors, return them
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors
            });
        }

        next();
    }

    /**
     * Validate quiz submission data
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    static validateQuizSubmission(req, res, next) {
        const { score, totalQuestions, correctAnswers, timeTaken, categories } = req.body;
        const errors = {};

        // Score validation
        if (typeof score !== 'number') {
            errors.score = 'Score must be a number';
        } else if (!Number.isInteger(score)) {
            errors.score = 'Score must be a whole number';
        } else if (score < 0 || score > 100) {
            errors.score = 'Score must be between 0 and 100';
        }

        // Total questions validation
        if (typeof totalQuestions !== 'number') {
            errors.totalQuestions = 'Total questions must be a number';
        } else if (!Number.isInteger(totalQuestions)) {
            errors.totalQuestions = 'Total questions must be a whole number';
        } else if (totalQuestions < 1 || totalQuestions > 50) {
            errors.totalQuestions = 'Total questions must be between 1 and 50';
        }

        // Correct answers validation
        if (typeof correctAnswers !== 'number') {
            errors.correctAnswers = 'Correct answers must be a number';
        } else if (!Number.isInteger(correctAnswers)) {
            errors.correctAnswers = 'Correct answers must be a whole number';
        } else if (correctAnswers < 0) {
            errors.correctAnswers = 'Correct answers cannot be negative';
        } else if (typeof totalQuestions === 'number' && correctAnswers > totalQuestions) {
            errors.correctAnswers = 'Correct answers cannot exceed total questions';
        }

        // Cross-validation: check if score matches calculation
        if (typeof score === 'number' && typeof totalQuestions === 'number' && typeof correctAnswers === 'number') {
            const calculatedScore = Math.round((correctAnswers / totalQuestions) * 100);
            if (Math.abs(score - calculatedScore) > 1) {
                errors.score = 'Score does not match the correct answers and total questions';
            }
        }

        // Time taken validation (optional)
        if (timeTaken !== undefined && timeTaken !== null) {
            if (typeof timeTaken !== 'number') {
                errors.timeTaken = 'Time taken must be a number';
            } else if (!Number.isInteger(timeTaken)) {
                errors.timeTaken = 'Time taken must be a whole number of seconds';
            } else if (timeTaken < 1) {
                errors.timeTaken = 'Time taken must be at least 1 second';
            } else if (timeTaken > 3600) {
                errors.timeTaken = 'Time taken cannot exceed 1 hour';
            }
        }

        // Categories validation (optional)
        if (categories !== undefined && categories !== null) {
            if (typeof categories !== 'object') {
                errors.categories = 'Categories must be an object';
            } else {
                // Validate each category
                for (const [category, stats] of Object.entries(categories)) {
                    if (!stats || typeof stats !== 'object') {
                        errors.categories = `Invalid category stats for ${category}`;
                        break;
                    }
                    
                    if (typeof stats.correct !== 'number' || typeof stats.total !== 'number') {
                        errors.categories = `Category ${category} must have numeric correct and total values`;
                        break;
                    }
                    
                    if (stats.correct > stats.total || stats.correct < 0 || stats.total < 1) {
                        errors.categories = `Invalid stats for category ${category}`;
                        break;
                    }
                }
            }
        }

        // If there are validation errors, return them
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors
            });
        }

        next();
    }

    /**
     * Validate pagination parameters
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    static validatePagination(req, res, next) {
        const { page, limit } = req.query;

        if (page !== undefined) {
            const pageNum = parseInt(page);
            if (isNaN(pageNum) || pageNum < 1) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Page must be a positive integer'
                });
            }
            req.query.page = pageNum;
        }

        if (limit !== undefined) {
            const limitNum = parseInt(limit);
            if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Limit must be between 1 and 100'
                });
            }
            req.query.limit = limitNum;
        }

        next();
    }

    /**
     * Validate MongoDB ObjectId
     * @param {string} paramName - Name of the parameter to validate
     * @returns {Function} Middleware function
     */
    static validateObjectId(paramName = 'id') {
        return (req, res, next) => {
            const id = req.params[paramName];
            
            if (!id) {
                return res.status(400).json({
                    status: 'error',
                    message: `${paramName} parameter is required`
                });
            }

            // Check if it's a valid MongoDB ObjectId
            const mongoose = require('mongoose');
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    status: 'error',
                    message: `Invalid ${paramName} format`
                });
            }

            next();
        };
    }

    /**
     * Validate date range parameters
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    static validateDateRange(req, res, next) {
        const { startDate, endDate } = req.query;

        if (startDate) {
            const start = new Date(startDate);
            if (isNaN(start.getTime())) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid start date format'
                });
            }
            req.query.startDate = start;
        }

        if (endDate) {
            const end = new Date(endDate);
            if (isNaN(end.getTime())) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid end date format'
                });
            }
            req.query.endDate = end;
        }

        // Check if start date is before end date
        if (startDate && endDate && req.query.startDate > req.query.endDate) {
            return res.status(400).json({
                status: 'error',
                message: 'Start date must be before end date'
            });
        }

        next();
    }

    /**
     * Validate search query
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    static validateSearchQuery(req, res, next) {
        const { q, field } = req.query;

        if (!q || typeof q !== 'string') {
            return res.status(400).json({
                status: 'error',
                message: 'Search query (q) is required and must be a string'
            });
        }

        if (q.trim().length < 2) {
            return res.status(400).json({
                status: 'error',
                message: 'Search query must be at least 2 characters long'
            });
        }

        if (q.trim().length > 100) {
            return res.status(400).json({
                status: 'error',
                message: 'Search query cannot exceed 100 characters'
            });
        }

        // Validate field parameter if provided
        if (field) {
            const validFields = ['all', 'name', 'email', 'subject', 'message'];
            if (!validFields.includes(field)) {
                return res.status(400).json({
                    status: 'error',
                    message: `Invalid field. Must be one of: ${validFields.join(', ')}`
                });
            }
        }

        next();
    }
}

module.exports = ValidationMiddleware;