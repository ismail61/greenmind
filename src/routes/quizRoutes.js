// GreenMind - Quiz Routes
// Author: Fatemeh - Group 6
// Description: Routes for quiz operations

const express = require('express');
const { QuizController } = require('../controllers');
const { ValidationMiddleware, SecurityMiddleware } = require('../middleware');

const router = express.Router();

/**
 * @route   POST /api/quiz/submit
 * @desc    Submit quiz results
 * @access  Public
 */
router.post('/submit',
    SecurityMiddleware.configureFormRateLimit(),
    ValidationMiddleware.validateQuizSubmission,
    QuizController.submitQuizResults
);

/**
 * @route   GET /api/quiz/stats
 * @desc    Get quiz statistics
 * @access  Public
 */
router.get('/stats',
    QuizController.getQuizStats
);

/**
 * @route   GET /api/quiz/recent
 * @desc    Get recent quiz results
 * @access  Public
 */
router.get('/recent',
    ValidationMiddleware.validatePagination,
    QuizController.getRecentResults
);

/**
 * @route   GET /api/quiz/leaderboard
 * @desc    Get quiz leaderboard
 * @access  Public
 */
router.get('/leaderboard',
    ValidationMiddleware.validatePagination,
    QuizController.getLeaderboard
);

/**
 * @route   GET /api/quiz/analytics
 * @desc    Get quiz analytics
 * @access  Private
 */
router.get('/analytics',
    QuizController.getQuizAnalytics
);

/**
 * @route   GET /api/quiz/export
 * @desc    Export quiz data
 * @access  Private
 */
router.get('/export',
    ValidationMiddleware.validateDateRange,
    QuizController.exportQuizData
);

module.exports = router;