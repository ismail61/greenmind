// GreenMind - Application Controller
// Author: Fatemeh - Group 6
// Description: Controller for general application operations

const path = require('path');
const { catchAsync } = require('../utils');
const { config } = require('../config/environment');

/**
 * Application Controller Class
 */
class AppController {
    /**
     * Health check endpoint
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static healthCheck = catchAsync(async (req, res) => {
        // Get system information
        const healthData = {
            status: 'success',
            message: `${config.app.name} API is running!`,
            timestamp: new Date().toISOString(),
            version: config.app.version,
            environment: config.server.environment,
            uptime: process.uptime(),
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
            },
            node_version: process.version
        };

        // Check database connection
        const mongoose = require('mongoose');
        const dbStatus = mongoose.connection.readyState;
        const dbStates = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };

        healthData.database = {
            status: dbStates[dbStatus] || 'unknown',
            name: mongoose.connection.name || 'unknown'
        };

        res.json(healthData);
    });

    /**
     * Get application information
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static getAppInfo = catchAsync(async (req, res) => {
        const appInfo = {
            status: 'success',
            data: {
                name: config.app.name,
                version: config.app.version,
                description: config.app.description,
                environment: config.server.environment,
                features: [
                    'Environmental Education Content',
                    'Interactive Quiz System',
                    'AJAX Contact Form',
                    'Responsive Design',
                    'MongoDB Integration',
                    'RESTful API'
                ],
                technologies: {
                    frontend: ['HTML5', 'CSS3', 'JavaScript (ES6+)'],
                    backend: ['Node.js', 'Express.js', 'MongoDB', 'Mongoose'],
                    security: ['Helmet.js', 'CORS', 'Rate Limiting', 'Input Validation']
                },
                author: {
                    name: 'Fatemeh',
                    university: 'Abu Dhabi University (ADU)',
                    course: 'ITE410 - Web Development',
                    group: 6
                },
                lastUpdated: new Date().toISOString()
            }
        };

        res.json(appInfo);
    });

    /**
     * Serve main HTML file for root route
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static serveHomePage = (req, res) => {
        res.sendFile(path.join(__dirname, '../../public/index.html'));
    };

    /**
     * Handle 404 errors for API routes
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static handleApiNotFound = (req, res) => {
        res.status(404).json({
            status: 'error',
            message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
            availableEndpoints: {
                health: 'GET /api/health',
                info: 'GET /api/info',
                contact: 'POST /api/contact',
                quiz: {
                    submit: 'POST /api/quiz/submit',
                    stats: 'GET /api/quiz/stats',
                    recent: 'GET /api/quiz/recent',
                    leaderboard: 'GET /api/quiz/leaderboard'
                }
            },
            timestamp: new Date().toISOString()
        });
    };

    /**
     * Handle 404 errors for web pages
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static handlePageNotFound = (req, res) => {
        res.status(404).sendFile(path.join(__dirname, '../../public/404.html'));
    };

    /**
     * Get API documentation
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static getApiDocs = catchAsync(async (req, res) => {
        const apiDocs = {
            status: 'success',
            data: {
                title: `${config.app.name} API Documentation`,
                version: config.app.version,
                baseUrl: `${req.protocol}://${req.get('host')}${config.api.prefix}`,
                endpoints: {
                    health: {
                        method: 'GET',
                        path: '/health',
                        description: 'Check API health and system status',
                        response: 'System health information'
                    },
                    info: {
                        method: 'GET',
                        path: '/info',
                        description: 'Get application information',
                        response: 'Application details and metadata'
                    },
                    docs: {
                        method: 'GET',
                        path: '/docs',
                        description: 'Get API documentation',
                        response: 'This documentation'
                    },
                    contact: {
                        submit: {
                            method: 'POST',
                            path: '/contact',
                            description: 'Submit contact form',
                            body: {
                                name: 'string (required)',
                                email: 'string (required)',
                                subject: 'string (required)',
                                message: 'string (required)',
                                newsletter: 'boolean (optional)'
                            },
                            response: 'Success message with contact ID'
                        }
                    },
                    quiz: {
                        submit: {
                            method: 'POST',
                            path: '/quiz/submit',
                            description: 'Submit quiz results',
                            body: {
                                score: 'number (0-100, required)',
                                totalQuestions: 'number (required)',
                                correctAnswers: 'number (required)',
                                timeTaken: 'number (optional)',
                                categories: 'object (optional)'
                            },
                            response: 'Success message with performance feedback'
                        },
                        stats: {
                            method: 'GET',
                            path: '/quiz/stats',
                            description: 'Get quiz statistics',
                            response: 'Overall quiz statistics and analytics'
                        },
                        recent: {
                            method: 'GET',
                            path: '/quiz/recent',
                            description: 'Get recent quiz results',
                            query: {
                                days: 'number (default: 30)',
                                limit: 'number (default: 10)'
                            },
                            response: 'Recent quiz results'
                        },
                        leaderboard: {
                            method: 'GET',
                            path: '/quiz/leaderboard',
                            description: 'Get quiz leaderboard',
                            query: {
                                limit: 'number (default: 10)',
                                period: 'string (week|month|year|all, default: all)'
                            },
                            response: 'Top quiz scores'
                        }
                    }
                },
                errorCodes: {
                    400: 'Bad Request - Invalid input data',
                    404: 'Not Found - Endpoint does not exist',
                    500: 'Internal Server Error - Server-side error'
                },
                responseFormat: {
                    success: {
                        status: 'success',
                        message: 'Description of what happened',
                        data: 'Response data object'
                    },
                    error: {
                        status: 'error',
                        message: 'Error description',
                        errors: 'Detailed validation errors (optional)'
                    }
                }
            }
        };

        res.json(apiDocs);
    });

    /**
     * Get system statistics
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static getSystemStats = catchAsync(async (req, res) => {
        const { Contact, QuizResult } = require('../models');
        
        const [
            totalContacts,
            totalQuizResults,
            recentContacts,
            recentQuizzes
        ] = await Promise.all([
            Contact.countDocuments(),
            QuizResult.countDocuments(),
            Contact.countDocuments({ 
                createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
            }),
            QuizResult.countDocuments({ 
                completedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
            })
        ]);

        const stats = {
            status: 'success',
            data: {
                overview: {
                    totalContacts,
                    totalQuizResults,
                    recentContacts, // Last 7 days
                    recentQuizzes   // Last 7 days
                },
                system: {
                    uptime: Math.round(process.uptime()),
                    uptimeFormatted: this.formatUptime(process.uptime()),
                    memory: process.memoryUsage(),
                    nodeVersion: process.version,
                    platform: process.platform
                },
                generatedAt: new Date().toISOString()
            }
        };

        res.json(stats);
    });

    /**
     * Format uptime in human readable format
     * @param {number} uptimeSeconds - Uptime in seconds
     * @returns {string} Formatted uptime
     */
    static formatUptime(uptimeSeconds) {
        const days = Math.floor(uptimeSeconds / 86400);
        const hours = Math.floor((uptimeSeconds % 86400) / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        const seconds = Math.floor(uptimeSeconds % 60);

        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (seconds > 0) parts.push(`${seconds}s`);

        return parts.join(' ') || '0s';
    }
}

module.exports = AppController;