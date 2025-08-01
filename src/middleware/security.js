// GreenMind - Security Middleware
// Author: Fatemeh - Group 6
// Description: Security-related middleware functions

const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { config } = require('../config/environment');

/**
 * Security middleware configuration
 */
class SecurityMiddleware {
    /**
     * Configure Helmet for security headers
     * @returns {Function} Helmet middleware
     */
    static configureHelmet() {
        return helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'", "'unsafe-inline'"],
                    imgSrc: ["'self'", "data:", "https:"],
                    fontSrc: ["'self'"],
                    connectSrc: ["'self'"],
                    frameSrc: ["'none'"],
                    objectSrc: ["'none'"],
                    baseUri: ["'self'"]
                }
            },
            crossOriginEmbedderPolicy: false, // Disable for development
            hsts: {
                maxAge: 31536000, // 1 year
                includeSubDomains: true,
                preload: true
            }
        });
    }

    /**
     * Configure CORS
     * @returns {Function} CORS middleware
     */
    static configureCORS() {
        return cors({
            origin: function (origin, callback) {
                // Allow requests with no origin (like mobile apps or curl requests)
                if (!origin) return callback(null, true);
                
                if (config.security.corsOrigins.includes(origin)) {
                    return callback(null, true);
                }
                
                // In development, be more lenient
                if (config.server.environment === 'development') {
                    return callback(null, true);
                }
                
                const msg = `CORS policy doesn't allow access from origin: ${origin}`;
                return callback(new Error(msg), false);
            },
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
            exposedHeaders: ['X-Total-Count']
        });
    }

    /**
     * Configure rate limiting for API routes
     * @returns {Function} Rate limiting middleware
     */
    static configureApiRateLimit() {
        return rateLimit({
            windowMs: config.security.rateLimitWindow,
            max: config.security.rateLimitMax,
            message: {
                status: 'error',
                message: 'Too many requests from this IP. Please try again later.',
                retryAfter: Math.ceil(config.security.rateLimitWindow / 1000 / 60)
            },
            standardHeaders: true,
            legacyHeaders: false,
            handler: (req, res) => {
                console.log(`🚫 Rate limit exceeded for IP: ${req.ip}`);
                res.status(429).json({
                    status: 'error',
                    message: 'Too many requests from this IP. Please try again later.',
                    retryAfter: Math.ceil(config.security.rateLimitWindow / 1000 / 60)
                });
            }
        });
    }

    /**
     * Configure stricter rate limiting for form submissions
     * @returns {Function} Form rate limiting middleware
     */
    static configureFormRateLimit() {
        return rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 5, // 5 submissions per window
            message: {
                status: 'error',
                message: 'Too many form submissions. Please wait before submitting again.',
                retryAfter: 15
            },
            skipSuccessfulRequests: true,
            handler: (req, res) => {
                console.log(`🚫 Form rate limit exceeded for IP: ${req.ip}`);
                res.status(429).json({
                    status: 'error',
                    message: 'Too many form submissions. Please wait before submitting again.',
                    retryAfter: 15
                });
            }
        });
    }

    /**
     * Input sanitization middleware
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    static sanitizeInput(req, res, next) {
        if (req.body) {
            // Recursively sanitize all string values
            const sanitizeValue = (value) => {
                if (typeof value === 'string') {
                    // Remove potential XSS attempts
                    return value
                        .trim()
                        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                        .replace(/javascript:/gi, '')
                        .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
                        .replace(/on\w+\s*=\s*'[^']*'/gi, '');
                }
                if (typeof value === 'object' && value !== null) {
                    const sanitized = {};
                    for (const [key, val] of Object.entries(value)) {
                        sanitized[key] = sanitizeValue(val);
                    }
                    return sanitized;
                }
                return value;
            };

            req.body = sanitizeValue(req.body);
        }

        next();
    }

    /**
     * Request logging middleware
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    static logRequests(req, res, next) {
        const start = Date.now();
        const ip = req.ip || req.connection.remoteAddress;
        
        // Log request
        console.log(`📡 ${req.method} ${req.originalUrl} - IP: ${ip}`);
        
        // Log response when finished
        res.on('finish', () => {
            const duration = Date.now() - start;
            const statusEmoji = res.statusCode >= 400 ? '❌' : res.statusCode >= 300 ? '⚠️' : '✅';
            console.log(`${statusEmoji} ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
        });
        
        next();
    }

    /**
     * Security headers middleware
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    static addSecurityHeaders(req, res, next) {
        // Remove server information
        res.removeHeader('X-Powered-By');
        
        // Add custom security headers
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        
        // Add cache control for static assets
        if (req.url.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg)$/)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
        }
        
        next();
    }

    /**
     * Validate content type for API requests
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    static validateContentType(req, res, next) {
        if (req.method === 'POST' || req.method === 'PUT') {
            const contentType = req.get('Content-Type');
            
            if (!contentType || !contentType.includes('application/json')) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Content-Type must be application/json'
                });
            }
        }
        
        next();
    }
}

module.exports = SecurityMiddleware;