// GreenMind - Quiz Result Model
// Author: Fatemeh - Group 6
// Description: MongoDB model for quiz results and statistics

const mongoose = require('mongoose');

/**
 * Quiz result schema
 */
const quizResultSchema = new mongoose.Schema({
    score: {
        type: Number,
        required: [true, 'Score is required'],
        min: [0, 'Score cannot be negative'],
        max: [100, 'Score cannot exceed 100'],
        validate: {
            validator: Number.isInteger,
            message: 'Score must be a whole number'
        }
    },
    
    totalQuestions: {
        type: Number,
        required: [true, 'Total questions is required'],
        min: [1, 'Total questions must be at least 1'],
        max: [50, 'Total questions cannot exceed 50'],
        validate: {
            validator: Number.isInteger,
            message: 'Total questions must be a whole number'
        }
    },
    
    correctAnswers: {
        type: Number,
        required: [true, 'Correct answers count is required'],
        min: [0, 'Correct answers cannot be negative'],
        validate: {
            validator: function(correctAnswers) {
                return Number.isInteger(correctAnswers) && correctAnswers <= this.totalQuestions;
            },
            message: 'Correct answers must be a whole number and not exceed total questions'
        }
    },
    
    timeTaken: {
        type: Number, // Time in seconds
        min: [1, 'Time taken must be at least 1 second'],
        max: [3600, 'Time taken cannot exceed 1 hour'], // 1 hour max
        validate: {
            validator: Number.isInteger,
            message: 'Time taken must be a whole number of seconds'
        }
    },
    
    categories: {
        type: Map,
        of: {
            correct: {
                type: Number,
                min: 0,
                default: 0
            },
            total: {
                type: Number,
                min: 1,
                default: 1
            }
        },
        default: new Map()
    },
    
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard', 'mixed'],
        default: 'mixed'
    },
    
    completedAt: {
        type: Date,
        default: Date.now
    },
    

    
    userAgent: {
        type: String,
        trim: true,
        maxlength: [500, 'User agent cannot exceed 500 characters']
    },
    
    sessionId: {
        type: String,
        trim: true
    }
}, {
    timestamps: true,
    collection: 'quiz_results'
});

/**
 * Pre-save validation
 */
quizResultSchema.pre('save', function(next) {
    // Validate score calculation
    const calculatedScore = Math.round((this.correctAnswers / this.totalQuestions) * 100);
    if (Math.abs(this.score - calculatedScore) > 1) { // Allow 1% tolerance for rounding
        return next(new Error('Score does not match correct answers and total questions'));
    }
    
    next();
});

/**
 * Instance methods
 */
quizResultSchema.methods.getPerformanceLevel = function() {
    if (this.score >= 90) return 'excellent';
    if (this.score >= 80) return 'good';
    if (this.score >= 70) return 'fair';
    if (this.score >= 60) return 'needs_improvement';
    return 'poor';
};

quizResultSchema.methods.getPerformanceMessage = function() {
    const level = this.getPerformanceLevel();
    const messages = {
        excellent: "Outstanding! You're an environmental champion! 🌟",
        good: "Excellent work! You have great environmental knowledge! 🌱",
        fair: "Good job! You're on the right track with environmental awareness! 👍",
        needs_improvement: "Not bad! Keep learning about environmental conservation! 📚",
        poor: "There's room for improvement. Check out our Learn page for more info! 💪"
    };
    return messages[level];
};

quizResultSchema.methods.getCategoryPerformance = function() {
    const performance = {};
    
    for (const [category, stats] of this.categories) {
        const percentage = Math.round((stats.correct / stats.total) * 100);
        performance[category] = {
            score: percentage,
            correct: stats.correct,
            total: stats.total,
            level: percentage >= 80 ? 'strong' : percentage >= 60 ? 'moderate' : 'weak'
        };
    }
    
    return performance;
};

/**
 * Static methods
 */
quizResultSchema.statics.getOverallStats = function() {
    return this.aggregate([
        {
            $group: {
                _id: null,
                totalAttempts: { $sum: 1 },
                averageScore: { $avg: '$score' },
                highestScore: { $max: '$score' },
                lowestScore: { $min: '$score' },
                averageTime: { $avg: '$timeTaken' }
            }
        }
    ]);
};

quizResultSchema.statics.getScoreDistribution = function() {
    return this.aggregate([
        {
            $bucket: {
                groupBy: '$score',
                boundaries: [0, 20, 40, 60, 80, 100],
                default: 'other',
                output: {
                    count: { $sum: 1 },
                    averageTime: { $avg: '$timeTaken' }
                }
            }
        }
    ]);
};

quizResultSchema.statics.getRecentResults = function(days = 30) {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);
    
    return this.find({ 
        completedAt: { $gte: dateLimit } 
    }).sort({ completedAt: -1 });
};

quizResultSchema.statics.getCategoryStats = function() {
    return this.aggregate([
        { $unwind: '$categories' },
        {
            $group: {
                _id: '$categories.k',
                totalAttempts: { $sum: 1 },
                averageCorrect: { $avg: '$categories.v.correct' },
                averageTotal: { $avg: '$categories.v.total' }
            }
        },
        {
            $project: {
                category: '$_id',
                totalAttempts: 1,
                averagePercentage: {
                    $multiply: [
                        { $divide: ['$averageCorrect', '$averageTotal'] },
                        100
                    ]
                }
            }
        }
    ]);
};

/**
 * Indexes for better query performance
 */
quizResultSchema.index({ completedAt: -1 });
quizResultSchema.index({ score: -1 });
quizResultSchema.index({ sessionId: 1 });


/**
 * Virtual for formatted completion date
 */
quizResultSchema.virtual('formattedDate').get(function() {
    return this.completedAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
});

/**
 * Virtual for time taken in human readable format
 */
quizResultSchema.virtual('formattedTime').get(function() {
    if (!this.timeTaken) return 'Unknown';
    
    const minutes = Math.floor(this.timeTaken / 60);
    const seconds = this.timeTaken % 60;
    
    if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
});

// Ensure virtual fields are serialized
quizResultSchema.set('toJSON', { virtuals: true });

const QuizResult = mongoose.model('QuizResult', quizResultSchema);

module.exports = QuizResult;