// GreenMind - Error Handling Middleware
// Author: Fatemeh - Group 6
// Description: Centralized error handling for the application

const { config } = require('../config/environment');

/**
 * Custom Application Error class
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Error handling middleware class
 */
class ErrorHandler {
    /**
     * Async error catcher wrapper
     * @param {Function} fn - Async function to wrap
     * @returns {Function} Wrapped function
     */
    static catchAsync(fn) {
        return (req, res, next) => {
            fn(req, res, next).catch(next);
        };
    }

    /**
     * Handle MongoDB cast errors
     * @param {Error} err - MongoDB cast error
     * @returns {AppError} Formatted error
     */
    static handleCastErrorDB(err) {
        const message = `Invalid ${err.path}: ${err.value}`;
        return new AppError(message, 400);
    }

    /**
     * Handle MongoDB duplicate field errors
     * @param {Error} err - MongoDB duplicate error
     * @returns {AppError} Formatted error
     */
    static handleDuplicateFieldsDB(err) {
        const value = err.errmsg ? err.errmsg.match(/(["'])(\\?.)*?\1/)[0] : 'unknown';
        const message = `Duplicate field value: ${value}. Please use another value!`;
        return new AppError(message, 400);
    }

    /**
     * Handle MongoDB validation errors
     * @param {Error} err - MongoDB validation error
     * @returns {AppError} Formatted error
     */
    static handleValidationErrorDB(err) {
        const errors = Object.values(err.errors).map(el => el.message);
        const message = `Invalid input data. ${errors.join('. ')}`;
        return new AppError(message, 400);
    }

    /**
     * Handle JWT errors
     * @returns {AppError} Formatted error
     */
    static handleJWTError() {
        return new AppError('Invalid token. Please log in again!', 401);
    }

    /**
     * Handle JWT expired errors
     * @returns {AppError} Formatted error
     */
    static handleJWTExpiredError() {
        return new AppError('Your token has expired! Please log in again.', 401);
    }

    /**
     * Send error response in development
     * @param {Error} err - Error object
     * @param {Object} res - Express response object
     */
    static sendErrorDev(err, res) {
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Send error response in production
     * @param {Error} err - Error object
     * @param {Object} res - Express response object
     */
    static sendErrorProd(err, res) {
        // Operational, trusted error: send message to client
        if (err.isOperational) {
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
                timestamp: new Date().toISOString()
            });
        } else {
            // Programming or other unknown error: don't leak error details
            console.error('ERROR 💥', err);
            
            res.status(500).json({
                status: 'error',
                message: 'Something went wrong!',
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Global error handling middleware
     * @param {Error} err - Error object
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    static globalErrorHandler(err, req, res, next) {
        err.statusCode = err.statusCode || 500;
        err.status = err.status || 'error';

        // Log error
        console.error(`❌ Error ${err.statusCode}: ${err.message}`);
        if (config.server.environment === 'development') {
            console.error('Stack trace:', err.stack);
        }

        if (config.server.environment === 'development') {
            ErrorHandler.sendErrorDev(err, res);
        } else {
            let error = { ...err };
            error.message = err.message;

            // Handle specific error types
            if (error.name === 'CastError') error = ErrorHandler.handleCastErrorDB(error);
            if (error.code === 11000) error = ErrorHandler.handleDuplicateFieldsDB(error);
            if (error.name === 'ValidationError') error = ErrorHandler.handleValidationErrorDB(error);
            if (error.name === 'JsonWebTokenError') error = ErrorHandler.handleJWTError();
            if (error.name === 'TokenExpiredError') error = ErrorHandler.handleJWTExpiredError();

            ErrorHandler.sendErrorProd(error, res);
        }
    }

    /**
     * Handle 404 errors
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    static handle404(req, res, next) {
        const err = new AppError(`Can't find ${req.originalUrl} on this server!`, 404);
        next(err);
    }

    /**
     * Handle unhandled promise rejections
     */
    static handleUnhandledRejection() {
        process.on('unhandledRejection', (err, promise) => {
            console.log('💥 UNHANDLED PROMISE REJECTION! Shutting down...');
            console.error('Error:', err.message);
            console.error('Stack:', err.stack);
            process.exit(1);
        });
    }

    /**
     * Handle uncaught exceptions
     */
    static handleUncaughtException() {
        process.on('uncaughtException', (err) => {
            console.log('💥 UNCAUGHT EXCEPTION! Shutting down...');
            console.error('Error:', err.message);
            console.error('Stack:', err.stack);
            process.exit(1);
        });
    }

    /**
     * Graceful shutdown handler
     * @param {Object} server - HTTP server instance
     */
    static handleGracefulShutdown(server) {
        const shutdown = (signal) => {
            console.log(`\n👋 ${signal} signal received, closing server gracefully...`);
            
            server.close(() => {
                console.log('🔒 HTTP server closed');
                
                // Close database connection
                const mongoose = require('mongoose');
                mongoose.connection.close().then(() => {
                    console.log('📦 MongoDB connection closed');
                    process.exit(0);
                });
            });

            // Force close after 10 seconds
            setTimeout(() => {
                console.error('❌ Could not close connections in time, forcefully shutting down');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    }

    /**
     * Setup all error handlers
     * @param {Object} server - HTTP server instance
     */
    static setupErrorHandlers(server) {
        ErrorHandler.handleUncaughtException();
        ErrorHandler.handleUnhandledRejection();
        if (server) {
            ErrorHandler.handleGracefulShutdown(server);
        }
    }

    /**
     * Validation error formatter for better error messages
     * @param {Object} errors - Validation errors object
     * @returns {Object} Formatted errors
     */
    static formatValidationErrors(errors) {
        const formatted = {};
        
        Object.keys(errors).forEach(field => {
            const error = errors[field];
            formatted[field] = {
                message: error.message || error,
                value: error.value || null,
                kind: error.kind || 'validation'
            };
        });
        
        return formatted;
    }

    /**
     * API response formatter for consistent error responses
     * @param {Error} err - Error object
     * @param {Object} req - Express request object
     * @returns {Object} Formatted response
     */
    static formatApiError(err, req) {
        const response = {
            status: 'error',
            message: err.message,
            timestamp: new Date().toISOString(),
            path: req.originalUrl,
            method: req.method
        };

        // Add error details in development
        if (config.server.environment === 'development') {
            response.error = {
                name: err.name,
                stack: err.stack
            };
        }

        // Add validation errors if present
        if (err.name === 'ValidationError' && err.errors) {
            response.errors = ErrorHandler.formatValidationErrors(err.errors);
        }

        return response;
    }
}

module.exports = {
    AppError,
    ErrorHandler,
    catchAsync: ErrorHandler.catchAsync
};