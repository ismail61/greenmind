// GreenMind - Routes Index
// Author: Fatemeh - Group 6
// Description: Central routing configuration

const express = require('express');
const appRoutes = require('./appRoutes');
const contactRoutes = require('./contactRoutes');
const quizRoutes = require('./quizRoutes');
const { AppController } = require('../controllers');

const router = express.Router();

/**
 * Configure all API routes
 * @param {Object} app - Express application instance
 */
function configureRoutes(app) {
    // API routes
    router.use('/', appRoutes);
    router.use('/contact', contactRoutes);
    router.use('/quiz', quizRoutes);

    // Mount API router
    app.use('/api', router);

    // Handle API 404s
    app.use('/api/*', AppController.handleApiNotFound);

    // Serve main HTML file for root route
    app.get('/', AppController.serveHomePage);

    // Handle web page 404s
    app.use('*', AppController.handlePageNotFound);
}

module.exports = {
    configureRoutes,
    router
};