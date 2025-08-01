// GreenMind - Quiz Controller
// Author: Fatemeh - Group 6
// Description: Controller for handling quiz operations

const { QuizResult } = require('../models');
const { AppError, catchAsync } = require('../utils');

/**
 * Quiz Controller Class
 */
class QuizController {
    /**
     * Submit quiz results
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    static submitQuizResults = catchAsync(async (req, res, next) => {
        const { 
            score, 
            totalQuestions, 
            correctAnswers, 
            timeTaken, 
            categories,
            difficulty = 'mixed',
            sessionId 
        } = req.body;

        // Validation
        if (typeof score !== 'number' || typeof totalQuestions !== 'number' || typeof correctAnswers !== 'number') {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid quiz data provided. Score, total questions, and correct answers must be numbers.'
            });
        }

        // Additional validation
        if (score < 0 || score > 100) {
            return next(new AppError('Score must be between 0 and 100', 400));
        }

        if (correctAnswers > totalQuestions) {
            return next(new AppError('Correct answers cannot exceed total questions', 400));
        }

        if (totalQuestions <= 0) {
            return next(new AppError('Total questions must be greater than 0', 400));
        }

        // Validate calculated score matches provided score
        const calculatedScore = Math.round((correctAnswers / totalQuestions) * 100);
        if (Math.abs(score - calculatedScore) > 1) {
            return next(new AppError('Score calculation mismatch', 400));
        }

        // Create quiz result with metadata
        const quizResultData = {
            score,
            totalQuestions,
            correctAnswers,
            timeTaken: timeTaken || null,
            categories: categories || new Map(),
            difficulty,
            sessionId: sessionId || null,
            userAgent: req.get('User-Agent')
        };

        const quizResult = new QuizResult(quizResultData);
        await quizResult.save();

        console.log(`🎯 Quiz completed - Score: ${score}% (${correctAnswers}/${totalQuestions}) - Time: ${timeTaken || 'N/A'}s`);

        // Generate performance feedback
        const performanceLevel = quizResult.getPerformanceLevel();
        const performanceMessage = quizResult.getPerformanceMessage();
        const categoryPerformance = quizResult.getCategoryPerformance();

        res.status(201).json({
            status: 'success',
            message: 'Quiz results saved successfully!',
            data: {
                id: quizResult._id,
                score,
                correctAnswers,
                totalQuestions,
                performance: {
                    level: performanceLevel,
                    message: performanceMessage,
                    categories: categoryPerformance
                },
                completedAt: quizResult.completedAt,
                formattedDate: quizResult.formattedDate,
                formattedTime: quizResult.formattedTime
            }
        });
    });

    /**
     * Get quiz statistics
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    static getQuizStats = catchAsync(async (req, res, next) => {
        const [overallStats, scoreDistribution, categoryStats] = await Promise.all([
            QuizResult.getOverallStats(),
            QuizResult.getScoreDistribution(),
            QuizResult.getCategoryStats()
        ]);

        const stats = overallStats[0] || {
            totalAttempts: 0,
            averageScore: 0,
            highestScore: 0,
            lowestScore: 0,
            averageTime: 0
        };

        // Calculate additional metrics
        const recentResults = await QuizResult.getRecentResults(7); // Last 7 days
        const thisWeekAttempts = recentResults.length;
        
        // Performance level distribution
        const performanceLevels = await QuizResult.aggregate([
            {
                $addFields: {
                    performanceLevel: {
                        $switch: {
                            branches: [
                                { case: { $gte: ['$score', 90] }, then: 'excellent' },
                                { case: { $gte: ['$score', 80] }, then: 'good' },
                                { case: { $gte: ['$score', 70] }, then: 'fair' },
                                { case: { $gte: ['$score', 60] }, then: 'needs_improvement' }
                            ],
                            default: 'poor'
                        }
                    }
                }
            },
            {
                $group: {
                    _id: '$performanceLevel',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            status: 'success',
            data: {
                overall: {
                    ...stats,
                    averageScore: Math.round(stats.averageScore * 100) / 100,
                    averageTime: Math.round(stats.averageTime || 0),
                    thisWeekAttempts
                },
                scoreDistribution,
                categoryStats,
                performanceLevels,
                generatedAt: new Date()
            }
        });
    });

    /**
     * Get recent quiz results
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    static getRecentResults = catchAsync(async (req, res, next) => {
        const { days = 30, limit = 10 } = req.query;

        const results = await QuizResult
            .getRecentResults(parseInt(days))
            .limit(parseInt(limit))
            .select('-userAgent -__v');

        res.json({
            status: 'success',
            data: {
                results,
                count: results.length,
                period: `${days} days`
            }
        });
    });

    /**
     * Get quiz leaderboard
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    static getLeaderboard = catchAsync(async (req, res, next) => {
        const { limit = 10, period = 'all' } = req.query;

        let dateFilter = {};
        if (period !== 'all') {
            const days = {
                'week': 7,
                'month': 30,
                'year': 365
            }[period] || 30;

            const dateLimit = new Date();
            dateLimit.setDate(dateLimit.getDate() - days);
            dateFilter.completedAt = { $gte: dateLimit };
        }

        const leaderboard = await QuizResult
            .find(dateFilter)
            .sort({ score: -1, timeTaken: 1 }) // Best score first, then fastest time
            .limit(parseInt(limit))
            .select('score correctAnswers totalQuestions timeTaken completedAt formattedDate formattedTime -_id');

        // Add ranking
        const rankedLeaderboard = leaderboard.map((result, index) => ({
            rank: index + 1,
            score: result.score,
            correctAnswers: result.correctAnswers,
            totalQuestions: result.totalQuestions,
            timeTaken: result.timeTaken,
            formattedTime: result.formattedTime,
            completedAt: result.completedAt,
            formattedDate: result.formattedDate
        }));

        res.json({
            status: 'success',
            data: {
                leaderboard: rankedLeaderboard,
                period,
                count: rankedLeaderboard.length
            }
        });
    });

    /**
     * Get quiz analytics
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    static getQuizAnalytics = catchAsync(async (req, res, next) => {
        const { period = 'month' } = req.query;

        const days = {
            'week': 7,
            'month': 30,
            'quarter': 90,
            'year': 365
        }[period] || 30;

        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - days);

        // Daily attempts trend
        const dailyTrend = await QuizResult.aggregate([
            { $match: { completedAt: { $gte: dateLimit } } },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$completedAt'
                        }
                    },
                    attempts: { $sum: 1 },
                    averageScore: { $avg: '$score' },
                    totalTime: { $sum: '$timeTaken' }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        // Score trends
        const scoreTrends = await QuizResult.aggregate([
            { $match: { completedAt: { $gte: dateLimit } } },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$completedAt'
                        }
                    },
                    averageScore: { $avg: '$score' },
                    minScore: { $min: '$score' },
                    maxScore: { $max: '$score' }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        // Completion time analysis
        const timeAnalysis = await QuizResult.aggregate([
            { 
                $match: { 
                    completedAt: { $gte: dateLimit },
                    timeTaken: { $exists: true, $gt: 0 }
                } 
            },
            {
                $group: {
                    _id: null,
                    averageTime: { $avg: '$timeTaken' },
                    minTime: { $min: '$timeTaken' },
                    maxTime: { $max: '$timeTaken' },
                    medianTime: { $avg: '$timeTaken' } // Simplified median
                }
            }
        ]);

        res.json({
            status: 'success',
            data: {
                period,
                dailyTrend,
                scoreTrends,
                timeAnalysis: timeAnalysis[0] || {},
                generatedAt: new Date()
            }
        });
    });

    /**
     * Export quiz data (for admin/reporting)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    static exportQuizData = catchAsync(async (req, res, next) => {
        const { format = 'json', startDate, endDate } = req.query;

        let dateFilter = {};
        if (startDate) {
            dateFilter.completedAt = { $gte: new Date(startDate) };
        }
        if (endDate) {
            dateFilter.completedAt = { 
                ...dateFilter.completedAt, 
                $lte: new Date(endDate) 
            };
        }

        const results = await QuizResult
            .find(dateFilter)
            .sort({ completedAt: -1 })
            .select('-userAgent -__v');

        if (format === 'csv') {
            // Convert to CSV format
            const csvHeader = 'Date,Score,Correct Answers,Total Questions,Time Taken,Performance Level\n';
            const csvData = results.map(result => {
                const performance = result.getPerformanceLevel();
                return `${result.formattedDate},${result.score},${result.correctAnswers},${result.totalQuestions},${result.timeTaken || 'N/A'},${performance}`;
            }).join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=quiz-results.csv');
            return res.send(csvHeader + csvData);
        }

        // Default JSON format
        res.json({
            status: 'success',
            data: {
                results,
                count: results.length,
                exportedAt: new Date(),
                period: startDate && endDate ? `${startDate} to ${endDate}` : 'all time'
            }
        });
    });
}

module.exports = QuizController;