// GreenMind - Application Setup
// Author: Fatemeh - Group 6
// Description: Express application configuration

const express = require('express');
const path = require('path');
const { config } = require('./config/environment');
const { SecurityMiddleware, ErrorHandler } = require('./middleware');
const { configureRoutes } = require('./routes');

/**
 * Create and configure Express application
 * @returns {Object} Configured Express app
 */
function createApp() {
    const app = express();

    // Trust proxy (for deployment behind reverse proxy)
    app.set('trust proxy', 1);

    // Security middleware
    app.use(SecurityMiddleware.configureHelmet());
    app.use(SecurityMiddleware.configureCORS());
    app.use(SecurityMiddleware.addSecurityHeaders);
    app.use(SecurityMiddleware.logRequests);

    // Rate limiting for API routes
    app.use('/api/', SecurityMiddleware.configureApiRateLimit());

    // Body parsing middleware
    app.use(express.json({ 
        limit: '10mb',
        strict: true,
        type: 'application/json'
    }));
    
    app.use(express.urlencoded({ 
        extended: true, 
        limit: '10mb',
        parameterLimit: 1000
    }));

    // Input sanitization
    app.use(SecurityMiddleware.sanitizeInput);

    // Content type validation for API routes
    app.use('/api/*', SecurityMiddleware.validateContentType);

    // Serve static files with caching
    app.use(express.static(path.join(__dirname, '../public'), {
        maxAge: config.server.environment === 'production' ? '1y' : '0',
        etag: true,
        lastModified: true
    }));

    // Configure routes
    configureRoutes(app);

    // Global error handler (must be last)
    app.use(ErrorHandler.globalErrorHandler);

    return app;
}

module.exports = createApp;