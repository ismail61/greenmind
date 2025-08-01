// GreenMind - Application Routes
// Author: Fatemeh - Group 6
// Description: Routes for general application operations

const express = require('express');
const { AppController } = require('../controllers');

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', AppController.healthCheck);

/**
 * @route   GET /api/info
 * @desc    Get application information
 * @access  Public
 */
router.get('/info', AppController.getAppInfo);

/**
 * @route   GET /api/docs
 * @desc    Get API documentation
 * @access  Public
 */
router.get('/docs', AppController.getApiDocs);

/**
 * @route   GET /api/stats
 * @desc    Get system statistics
 * @access  Private
 */
router.get('/stats', AppController.getSystemStats);

module.exports = router;