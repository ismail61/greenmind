// GreenMind - Quiz JavaScript
// Author: Fatemeh - Group 6
// Description: Interactive quiz functionality with OOP design and array management

"use strict";

// ============================================================================
// QUIZ QUESTION DATA (Array Implementation as Required)
// ============================================================================

/**
 * Environmental awareness quiz questions array
 * Each question object contains question text, options array, correct answer, category, and explanation
 */
const QUIZ_QUESTIONS = [
    {
        id: 1,
        category: "Recycling",
        question: "What color recycling bin is typically used for paper and cardboard?",
        options: [
            "Green bin",
            "Blue bin", 
            "Yellow bin",
            "Red bin"
        ],
        correctAnswer: 1, // Blue bin
        explanation: "Blue bins are commonly used for paper and cardboard recycling in most recycling programs.",
        difficulty: "easy"
    },
    {
        id: 2,
        category: "Energy Conservation",
        question: "Which type of light bulb uses the least amount of energy?",
        options: [
            "Incandescent bulbs",
            "Halogen bulbs",
            "CFL bulbs",
            "LED bulbs"
        ],
        correctAnswer: 3, // LED bulbs
        explanation: "LED bulbs use up to 75% less energy than incandescent bulbs and last 25 times longer.",
        difficulty: "easy"
    },
    {
        id: 3,
        category: "Water Conservation",
        question: "How much water can a dripping faucet waste per year?",
        options: [
            "100 gallons",
            "500 gallons",
            "1,000 gallons",
            "3,000+ gallons"
        ],
        correctAnswer: 3, // 3,000+ gallons
        explanation: "A single dripping faucet can waste over 3,000 gallons of water per year, which is enough for more than 180 showers!",
        difficulty: "medium"
    },
    {
        id: 4,
        category: "Climate Change",
        question: "What is the main greenhouse gas responsible for climate change?",
        options: [
            "Oxygen (O2)",
            "Carbon Dioxide (CO2)",
            "Nitrogen (N2)",
            "Hydrogen (H2)"
        ],
        correctAnswer: 1, // Carbon Dioxide (CO2)
        explanation: "Carbon dioxide (CO2) is the primary greenhouse gas emitted through human activities, mainly from burning fossil fuels.",
        difficulty: "easy"
    },
    {
        id: 5,
        category: "Recycling",
        question: "Which of these items should NOT be put in regular recycling bins?",
        options: [
            "Clean pizza boxes",
            "Plastic bottles",
            "Batteries",
            "Aluminum cans"
        ],
        correctAnswer: 2, // Batteries
        explanation: "Batteries contain hazardous materials and should be taken to special recycling centers, not put in regular recycling bins.",
        difficulty: "medium"
    },
    {
        id: 6,
        category: "Energy Conservation",
        question: "What percentage of home energy can be saved by properly sealing air leaks?",
        options: [
            "5-10%",
            "10-20%",
            "20-30%",
            "30-40%"
        ],
        correctAnswer: 1, // 10-20%
        explanation: "Sealing air leaks around windows, doors, and other openings can save 10-20% on heating and cooling costs.",
        difficulty: "medium"
    },
    {
        id: 7,
        category: "Water Conservation",
        question: "What is the average amount of water used in a 10-minute shower?",
        options: [
            "15-25 gallons",
            "25-35 gallons",
            "35-45 gallons",
            "45-55 gallons"
        ],
        correctAnswer: 1, // 25-35 gallons
        explanation: "A typical 10-minute shower uses about 25-35 gallons of water, depending on the showerhead flow rate.",
        difficulty: "medium"
    },
    {
        id: 8,
        category: "Climate Change",
        question: "How much has the global average temperature increased since 1880?",
        options: [
            "0.5°C (0.9°F)",
            "1.1°C (2°F)",
            "2.0°C (3.6°F)",
            "3.0°C (5.4°F)"
        ],
        correctAnswer: 1, // 1.1°C (2°F)
        explanation: "The global average temperature has increased by approximately 1.1°C (2°F) since 1880, with most warming occurring in the past 40 years.",
        difficulty: "hard"
    },
    {
        id: 9,
        category: "Recycling",
        question: "What percentage of plastic waste is actually recycled globally?",
        options: [
            "Less than 10%",
            "10-20%",
            "20-30%",
            "More than 50%"
        ],
        correctAnswer: 0, // Less than 10%
        explanation: "Unfortunately, less than 10% of all plastic waste ever produced has been recycled. Most ends up in landfills or the environment.",
        difficulty: "hard"
    },
    {
        id: 10,
        category: "Energy Conservation",
        question: "Which home appliance typically uses the most electricity?",
        options: [
            "Refrigerator",
            "Washing machine",
            "Air conditioning/heating system",
            "Television"
        ],
        correctAnswer: 2, // Air conditioning/heating system
        explanation: "Heating and cooling systems typically account for about 48% of home energy use, making them the largest energy consumer in most homes.",
        difficulty: "medium"
    }
];

// ============================================================================
// QUIZ QUESTION CLASS (OOP Implementation as Required)
// ============================================================================

/**
 * Quiz Question class representing a single question
 */
class QuizQuestion {
    /**
     * Create a quiz question
     * @param {Object} questionData - Question data object
     */
    constructor(questionData) {
        this.id = questionData.id;
        this.category = questionData.category;
        this.question = questionData.question;
        this.options = [...questionData.options]; // Create copy of options array
        this.correctAnswer = questionData.correctAnswer;
        this.explanation = questionData.explanation;
        this.difficulty = questionData.difficulty;
        this.userAnswer = null;
        this.isAnswered = false;
    }

    /**
     * Set user's answer for this question
     * @param {number} answerIndex - Index of selected answer
     */
    setUserAnswer(answerIndex) {
        this.userAnswer = answerIndex;
        this.isAnswered = true;
    }

    /**
     * Check if user's answer is correct
     * @returns {boolean} True if answer is correct
     */
    isCorrect() {
        return this.isAnswered && this.userAnswer === this.correctAnswer;
    }

    /**
     * Get the correct answer text
     * @returns {string} Correct answer text
     */
    getCorrectAnswerText() {
        return this.options[this.correctAnswer];
    }

    /**
     * Get user's answer text
     * @returns {string|null} User's answer text or null if not answered
     */
    getUserAnswerText() {
        return this.isAnswered ? this.options[this.userAnswer] : null;
    }

    /**
     * Reset the question (clear user answer)
     */
    reset() {
        this.userAnswer = null;
        this.isAnswered = false;
    }

    /**
     * Generate HTML for this question
     * @param {number} questionNumber - Question number for display
     * @returns {string} HTML string
     */
    generateHTML(questionNumber) {
        const optionsHTML = this.options.map((option, index) => `
            <div class="option-container">
                <input type="radio" 
                       id="q${this.id}_option${index}" 
                       name="question_${this.id}" 
                       value="${index}" 
                       class="option-input"
                       ${this.userAnswer === index ? 'checked' : ''}>
                <label for="q${this.id}_option${index}" class="option-label">
                    <span class="option-text">${window.GreenMind.Utils.sanitizeHTML(option)}</span>
                </label>
            </div>
        `).join('');

        return `
            <div class="question-container" data-question-id="${this.id}">
                <h3 class="question-text">
                    <span class="question-number">Question ${questionNumber}</span>
                    <span class="question-category">(${this.category})</span>
                    <br>
                    ${window.GreenMind.Utils.sanitizeHTML(this.question)}
                </h3>
                <div class="question-options">
                    ${optionsHTML}
                </div>
            </div>
        `;
    }
}

// ============================================================================
// QUIZ MANAGER CLASS (Main OOP Implementation)
// ============================================================================

/**
 * Quiz Manager class - handles all quiz functionality
 */
class QuizManager {
    /**
     * Create quiz manager
     */
    constructor() {
        this.questions = []; // Array of QuizQuestion objects
        this.currentQuestionIndex = 0;
        this.isQuizStarted = false;
        this.isQuizCompleted = false;
        this.startTime = null;
        this.endTime = null;
        this.apiClient = new window.GreenMind.ApiClient();
        
        // DOM elements
        this.quizContainer = document.querySelector('.quiz-container');
        this.welcomeScreen = document.getElementById('quiz-welcome');
        this.quizContent = document.getElementById('quiz-content');
        this.quizResults = document.getElementById('quiz-results');
        this.quizLoading = document.getElementById('quiz-loading');
        this.quizError = document.getElementById('quiz-error');
        
        this.init();
    }

    /**
     * Initialize quiz manager
     */
    init() {
        this.loadQuestions();
        this.setupEventListeners();
        this.updateUI();
    }

    /**
     * Load questions from the questions array into QuizQuestion objects
     */
    loadQuestions() {
        this.questions = QUIZ_QUESTIONS.map(questionData => new QuizQuestion(questionData));
        console.log(`📚 Loaded ${this.questions.length} quiz questions`);
    }

    /**
     * Setup event listeners for quiz interactions
     */
    setupEventListeners() {
        // Start quiz button
        const startButton = document.getElementById('start-quiz-btn');
        if (startButton) {
            startButton.addEventListener('click', () => this.startQuiz());
        }

        // Navigation buttons
        const prevButton = document.getElementById('prev-btn');
        const nextButton = document.getElementById('next-btn');
        const submitButton = document.getElementById('submit-btn');
        const reviewButton = document.getElementById('review-btn');

        if (prevButton) {
            prevButton.addEventListener('click', () => this.previousQuestion());
        }
        if (nextButton) {
            nextButton.addEventListener('click', () => this.nextQuestion());
        }
        if (submitButton) {
            submitButton.addEventListener('click', () => this.submitQuiz());
        }
        if (reviewButton) {
            reviewButton.addEventListener('click', () => this.reviewAnswers());
        }

        // Result action buttons
        const retakeButton = document.getElementById('retake-quiz-btn');
        // const shareButton = document.getElementById('share-results-btn'); // Commented out
        const retrySubmitButton = document.getElementById('retry-submit-btn');

        if (retakeButton) {
            retakeButton.addEventListener('click', () => this.retakeQuiz());
        }
        // if (shareButton) {
        //     shareButton.addEventListener('click', () => this.shareResults());
        // }
        if (retrySubmitButton) {
            retrySubmitButton.addEventListener('click', () => this.submitQuiz());
        }

        // Listen for answer changes
        document.addEventListener('change', (event) => {
            if (event.target.matches('input[type="radio"][name^="question_"]')) {
                this.handleAnswerChange(event);
            }
        });
    }

    /**
     * Start the quiz
     */
    startQuiz() {
        this.isQuizStarted = true;
        this.startTime = new Date();
        this.currentQuestionIndex = 0;
        
        // Reset all questions
        this.questions.forEach(question => question.reset());
        
        this.showQuizContent();
        this.renderCurrentQuestion();
        this.updateProgress();
        this.updateNavigation();
        
        console.log('🎯 Quiz started');
        window.GreenMind.app.performanceMonitor.recordMetric('quiz_started', this.startTime);
    }

    /**
     * Show quiz content and hide other screens
     */
    showQuizContent() {
        this.hideAllScreens();
        if (this.quizContent) {
            this.quizContent.style.display = 'block';
        }
    }

    /**
     * Hide all quiz screens
     */
    hideAllScreens() {
        const screens = [this.welcomeScreen, this.quizContent, this.quizResults, this.quizLoading, this.quizError];
        screens.forEach(screen => {
            if (screen) {
                screen.style.display = 'none';
            }
        });
    }

    /**
     * Render the current question
     */
    renderCurrentQuestion() {
        const quizForm = document.getElementById('quiz-form');
        if (!quizForm) return;

        const currentQuestion = this.questions[this.currentQuestionIndex];
        if (!currentQuestion) return;

        quizForm.innerHTML = currentQuestion.generateHTML(this.currentQuestionIndex + 1);
    }

    /**
     * Update progress bar and counter
     */
    updateProgress() {
        const progressFill = document.getElementById('progress-fill');
        const questionCounter = document.getElementById('question-counter');
        
        const progressPercentage = ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
        
        if (progressFill) {
            progressFill.style.width = `${progressPercentage}%`;
        }
        
        if (questionCounter) {
            questionCounter.textContent = `Question ${this.currentQuestionIndex + 1} of ${this.questions.length}`;
        }
    }

    /**
     * Update navigation button states
     */
    updateNavigation() {
        const prevButton = document.getElementById('prev-btn');
        const nextButton = document.getElementById('next-btn');
        const submitButton = document.getElementById('submit-btn');
        const reviewButton = document.getElementById('review-btn');

        // Previous button
        if (prevButton) {
            prevButton.disabled = this.currentQuestionIndex === 0;
        }

        // Next/Submit buttons
        const isLastQuestion = this.currentQuestionIndex === this.questions.length - 1;
        
        if (nextButton) {
            nextButton.style.display = isLastQuestion ? 'none' : 'inline-flex';
        }
        
        if (submitButton) {
            submitButton.style.display = isLastQuestion ? 'inline-flex' : 'none';
        }

        // Review button (show if all questions answered)
        if (reviewButton) {
            const allAnswered = this.questions.every(q => q.isAnswered);
            reviewButton.style.display = allAnswered ? 'inline-flex' : 'none';
        }
    }

    /**
     * Handle answer selection change
     * @param {Event} event - Change event
     */
    handleAnswerChange(event) {
        const questionId = parseInt(event.target.name.split('_')[1]);
        const answerIndex = parseInt(event.target.value);
        
        const question = this.questions.find(q => q.id === questionId);
        if (question) {
            question.setUserAnswer(answerIndex);
            this.updateNavigation();
            
            console.log(`📝 Question ${questionId} answered: ${answerIndex}`);
        }
    }

    /**
     * Go to previous question
     */
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.renderCurrentQuestion();
            this.updateProgress();
            this.updateNavigation();
        }
    }

    /**
     * Go to next question
     */
    nextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            this.renderCurrentQuestion();
            this.updateProgress();
            this.updateNavigation();
        }
    }

    /**
     * Review all answers
     */
    reviewAnswers() {
        // Show a summary of all answers
        const quizForm = document.getElementById('quiz-form');
        if (!quizForm) return;

        let reviewHTML = '<div class="quiz-review-summary"><h3>Review Your Answers</h3>';
        
        this.questions.forEach((question, index) => {
            const answerStatus = question.isAnswered ? '✅ Answered' : '❌ Not answered';
            const userAnswer = question.isAnswered ? question.getUserAnswerText() : 'No answer selected';
            
            reviewHTML += `
                <div class="review-item ${question.isAnswered ? 'answered' : 'unanswered'}">
                    <strong>Question ${index + 1}:</strong> ${window.GreenMind.Utils.sanitizeHTML(question.question)}<br>
                    <strong>Your answer:</strong> ${window.GreenMind.Utils.sanitizeHTML(userAnswer)} ${answerStatus}
                </div>
            `;
        });
        
        reviewHTML += '</div>';
        
        quizForm.innerHTML = reviewHTML;
    }

    /**
     * Go to specific question
     * @param {number} questionIndex - Index of question to show
     */
    goToQuestion(questionIndex) {
        if (questionIndex >= 0 && questionIndex < this.questions.length) {
            this.currentQuestionIndex = questionIndex;
            this.renderCurrentQuestion();
            this.updateProgress();
            this.updateNavigation();
        }
    }

    /**
     * Submit quiz and calculate results
     */
    async submitQuiz() {
        // Check if all questions are answered
        const unansweredQuestions = this.questions.filter(q => !q.isAnswered);
        if (unansweredQuestions.length > 0) {
            const confirmSubmit = confirm(
                `You have ${unansweredQuestions.length} unanswered question(s). Do you want to submit anyway?`
            );
            if (!confirmSubmit) {
                return;
            }
        }

        this.showLoadingScreen();
        
        try {
            // Calculate results
            const results = this.calculateResults();
            
            // Submit to backend
            await this.submitResultsToServer(results);
            
            // Show results
            this.showResults(results);
            
        } catch (error) {
            console.error('❌ Failed to submit quiz:', error);
            this.showErrorScreen(error.message);
        }
    }

    /**
     * Calculate quiz results
     * @returns {Object} Quiz results
     */
    calculateResults() {
        this.endTime = new Date();
        const timeTaken = Math.round((this.endTime - this.startTime) / 1000); // seconds
        
        let correctAnswers = 0;
        const categoryScores = {};
        const detailedResults = [];
        
        // Calculate scores
        this.questions.forEach((question, index) => {
            const isCorrect = question.isCorrect();
            if (isCorrect) {
                correctAnswers++;
            }
            
            // Category scoring
            if (!categoryScores[question.category]) {
                categoryScores[question.category] = { correct: 0, total: 0 };
            }
            categoryScores[question.category].total++;
            if (isCorrect) {
                categoryScores[question.category].correct++;
            }
            
            // Detailed results
            detailedResults.push({
                questionNumber: index + 1,
                question: question.question,
                category: question.category,
                userAnswer: question.getUserAnswerText(),
                correctAnswer: question.getCorrectAnswerText(),
                isCorrect: isCorrect,
                explanation: question.explanation
            });
        });
        
        const totalQuestions = this.questions.length;
        const score = Math.round((correctAnswers / totalQuestions) * 100);
        
        return {
            score,
            correctAnswers,
            totalQuestions,
            timeTaken,
            categoryScores,
            detailedResults,
            completedAt: this.endTime
        };
    }

    /**
     * Submit results to server
     * @param {Object} results - Quiz results
     */
    async submitResultsToServer(results) {
        try {
            const response = await this.apiClient.post('/quiz/submit', {
                score: results.score,
                totalQuestions: results.totalQuestions,
                correctAnswers: results.correctAnswers,
                timeTaken: results.timeTaken,
                categories: Object.fromEntries(
                    Object.entries(results.categoryScores).map(([key, value]) => [
                        key,
                        { correct: value.correct, total: value.total }
                    ])
                ),
                difficulty: 'mixed',
                sessionId: this.generateSessionId()
            });
            
            console.log('✅ Quiz results submitted to server:', response);
            return response;
        } catch (error) {
            console.warn('⚠️ Failed to submit to server, continuing with local results:', error);
            // Continue with local results even if server submission fails
            throw error;
        }
    }

    /**
     * Generate a session ID for tracking
     * @returns {string} Session ID
     */
    generateSessionId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Show loading screen
     */
    showLoadingScreen() {
        this.hideAllScreens();
        if (this.quizLoading) {
            this.quizLoading.style.display = 'block';
        }
    }

    /**
     * Show error screen
     * @param {string} errorMessage - Error message to display
     */
    showErrorScreen(errorMessage) {
        this.hideAllScreens();
        if (this.quizError) {
            this.quizError.style.display = 'block';
            const errorText = this.quizError.querySelector('#error-message');
            if (errorText) {
                errorText.textContent = errorMessage;
            }
        }
    }

    /**
     * Show quiz results
     * @param {Object} results - Quiz results to display
     */
    showResults(results) {
        this.isQuizCompleted = true;
        this.hideAllScreens();
        
        if (this.quizResults) {
            this.quizResults.style.display = 'block';
            this.renderResults(results);
        }
        
        console.log('🏆 Quiz completed with results:', results);
        window.GreenMind.app.performanceMonitor.recordMetric('quiz_completed', results);
    }

    /**
     * Render results in the UI
     * @param {Object} results - Quiz results
     */
    renderResults(results) {
        // Score display
        const scorePercentage = document.getElementById('score-percentage');
        const correctAnswersSpan = document.getElementById('correct-answers');
        const totalQuestionsSpan = document.getElementById('total-questions');
        const performanceMessage = document.getElementById('performance-message');
        
        if (scorePercentage) {
            scorePercentage.textContent = `${results.score}%`;
        }
        if (correctAnswersSpan) {
            correctAnswersSpan.textContent = results.correctAnswers;
        }
        if (totalQuestionsSpan) {
            totalQuestionsSpan.textContent = results.totalQuestions;
        }
        if (performanceMessage) {
            performanceMessage.textContent = this.getPerformanceMessage(results.score);
        }
        
        // Category breakdown
        this.renderCategoryBreakdown(results.categoryScores);
        
        // Personalized tips
        this.renderPersonalizedTips(results);
    }

    /**
     * Get performance message based on score
     * @param {number} score - Quiz score percentage
     * @returns {string} Performance message
     */
    getPerformanceMessage(score) {
        if (score >= 90) {
            return "Outstanding! You're an environmental champion! 🌟";
        } else if (score >= 80) {
            return "Excellent work! You have great environmental knowledge! 🌱";
        } else if (score >= 70) {
            return "Good job! You're on the right track with environmental awareness! 👍";
        } else if (score >= 60) {
            return "Not bad! Keep learning about environmental conservation! 📚";
        } else {
            return "There's room for improvement. Check out our Learn page for more info! 💪";
        }
    }

    /**
     * Render category breakdown
     * @param {Object} categoryScores - Scores by category
     */
    renderCategoryBreakdown(categoryScores) {
        const container = document.getElementById('category-breakdown');
        if (!container) return;
        
        let html = '';
        Object.entries(categoryScores).forEach(([category, scores]) => {
            const percentage = Math.round((scores.correct / scores.total) * 100);
            html += `
                <div class="category-item">
                    <div class="category-name">${category}</div>
                    <div class="category-score">${scores.correct}/${scores.total} (${percentage}%)</div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    /**
     * Render personalized tips based on performance
     * @param {Object} results - Quiz results
     */
    renderPersonalizedTips(results) {
        const container = document.getElementById('personalized-tips');
        if (!container) return;
        
        const tips = this.generatePersonalizedTips(results);
        
        let html = '';
        tips.forEach(tip => {
            html += `
                <div class="tip-card">
                    <h4>${tip.title}</h4>
                    <p>${tip.content}</p>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    /**
     * Generate personalized tips based on quiz performance
     * @param {Object} results - Quiz results
     * @returns {Array} Array of tip objects
     */
    generatePersonalizedTips(results) {
        const tips = [];
        
        // Analyze weak categories
        Object.entries(results.categoryScores).forEach(([category, scores]) => {
            const percentage = (scores.correct / scores.total) * 100;
            
            if (percentage < 70) {
                switch (category) {
                    case 'Recycling':
                        tips.push({
                            title: 'Improve Your Recycling Knowledge',
                            content: 'Learn more about what can and cannot be recycled in your area. Check with your local waste management for specific guidelines.'
                        });
                        break;
                    case 'Energy Conservation':
                        tips.push({
                            title: 'Focus on Energy Saving',
                            content: 'Simple changes like using LED bulbs, unplugging devices, and adjusting your thermostat can significantly reduce energy consumption.'
                        });
                        break;
                    case 'Water Conservation':
                        tips.push({
                            title: 'Water-Saving Strategies',
                            content: 'Fix leaky faucets, take shorter showers, and consider installing low-flow fixtures to conserve water at home.'
                        });
                        break;
                    case 'Climate Change':
                        tips.push({
                            title: 'Understanding Climate Change',
                            content: 'Stay informed about climate science and learn about actions you can take to reduce your carbon footprint.'
                        });
                        break;
                }
            }
        });
        
        // General tips based on overall score
        if (results.score >= 80) {
            tips.push({
                title: 'Share Your Knowledge',
                content: 'You have excellent environmental awareness! Consider sharing your knowledge with friends and family to spread environmental consciousness.'
            });
        } else if (results.score >= 60) {
            tips.push({
                title: 'Keep Learning',
                content: 'You\'re making good progress! Visit our Learn page to deepen your understanding of environmental topics.'
            });
        } else {
            tips.push({
                title: 'Start Your Environmental Journey',
                content: 'Begin with small changes like recycling properly, conserving water, and learning about sustainable practices. Every action counts!'
            });
        }
        
        return tips.slice(0, 3); // Return maximum 3 tips
    }

    /**
     * Retake quiz
     */
    retakeQuiz() {
        this.isQuizStarted = false;
        this.isQuizCompleted = false;
        this.currentQuestionIndex = 0;
        this.startTime = null;
        this.endTime = null;
        
        // Reset all questions
        this.questions.forEach(question => question.reset());
        
        // Show welcome screen
        this.hideAllScreens();
        if (this.welcomeScreen) {
            this.welcomeScreen.style.display = 'block';
        }
        
        console.log('🔄 Quiz reset for retake');
    }

    /**
     * Share quiz results
     */
    shareResults() {
        const score = document.getElementById('score-percentage')?.textContent || '0%';
        const shareText = `I just scored ${score} on the GreenMind Environmental Awareness Quiz! 🌱 Test your environmental knowledge too!`;
        
        if (navigator.share) {
            // Use native sharing if available
            navigator.share({
                title: 'GreenMind Quiz Results',
                text: shareText,
                url: window.location.href
            }).catch(error => {
                console.log('Native sharing failed:', error);
                this.fallbackShare(shareText);
            });
        } else {
            this.fallbackShare(shareText);
        }
    }

    /**
     * Fallback share method
     * @param {string} text - Text to share
     */
    fallbackShare(text) {
        // Copy to clipboard
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text + ' ' + window.location.href)
                .then(() => {
                    window.GreenMind.Utils.showNotification('Results copied to clipboard!', 'success');
                })
                .catch(() => {
                    this.showShareModal(text);
                });
        } else {
            this.showShareModal(text);
        }
    }

    /**
     * Show share modal with social media options
     * @param {string} text - Text to share
     */
    showShareModal(text) {
        const shareUrl = encodeURIComponent(window.location.href);
        const shareText = encodeURIComponent(text);
        
        const modal = document.createElement('div');
        modal.className = 'share-modal';
        modal.innerHTML = `
            <div class="share-modal-content">
                <h3>Share Your Results</h3>
                <div class="share-options">
                    <a href="https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}" 
                       target="_blank" class="share-btn twitter">
                        🐦 Twitter
                    </a>
                    <a href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}" 
                       target="_blank" class="share-btn facebook">
                        📘 Facebook
                    </a>
                    <button class="share-btn copy" onclick="navigator.clipboard.writeText('${text} ${window.location.href}'); this.textContent='Copied!'; setTimeout(() => this.textContent='📋 Copy Link', 2000);">
                        📋 Copy Link
                    </button>
                </div>
                <button class="btn btn-secondary close-modal">Close</button>
            </div>
        `;
        
        // Add styles
        const styles = `
            .share-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }
            .share-modal-content {
                background: white;
                padding: 2rem;
                border-radius: 12px;
                max-width: 400px;
                text-align: center;
            }
            .share-options {
                display: flex;
                flex-direction: column;
                gap: 1rem;
                margin: 1rem 0;
            }
            .share-btn {
                padding: 0.75rem 1rem;
                border: none;
                border-radius: 8px;
                text-decoration: none;
                color: white;
                font-weight: bold;
                cursor: pointer;
            }
            .share-btn.twitter { background: #1da1f2; }
            .share-btn.facebook { background: #4267b2; }
            .share-btn.copy { background: #2d7d32; }
            .close-modal { margin-top: 1rem; }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
        
        document.body.appendChild(modal);
        
        // Close modal
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
            document.head.removeChild(styleSheet);
        });
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
                document.head.removeChild(styleSheet);
            }
        });
    }

    /**
     * Update UI based on current state
     */
    updateUI() {
        if (!this.isQuizStarted) {
            this.hideAllScreens();
            if (this.welcomeScreen) {
                this.welcomeScreen.style.display = 'block';
            }
        }
    }
}

// ============================================================================
// QUIZ STATISTICS CLASS (Additional OOP Implementation)
// ============================================================================

/**
 * Quiz Statistics class for tracking quiz performance
 */
class QuizStatistics {
    constructor() {
        this.attempts = this.loadFromStorage('quiz_attempts') || [];
        this.bestScore = this.loadFromStorage('best_score') || 0;
        this.totalAttempts = this.attempts.length;
    }

    /**
     * Record a new quiz attempt
     * @param {Object} results - Quiz results
     */
    recordAttempt(results) {
        const attempt = {
            score: results.score,
            correctAnswers: results.correctAnswers,
            totalQuestions: results.totalQuestions,
            timeTaken: results.timeTaken,
            date: new Date().toISOString(),
            categoryScores: results.categoryScores
        };

        this.attempts.push(attempt);
        
        // Update best score
        if (results.score > this.bestScore) {
            this.bestScore = results.score;
            this.saveToStorage('best_score', this.bestScore);
        }
        
        // Keep only last 10 attempts
        if (this.attempts.length > 10) {
            this.attempts = this.attempts.slice(-10);
        }
        
        this.saveToStorage('quiz_attempts', this.attempts);
        this.totalAttempts = this.attempts.length;
        
        console.log('📊 Quiz attempt recorded:', attempt);
    }

    /**
     * Get average score
     * @returns {number} Average score
     */
    getAverageScore() {
        if (this.attempts.length === 0) return 0;
        const sum = this.attempts.reduce((acc, attempt) => acc + attempt.score, 0);
        return Math.round(sum / this.attempts.length);
    }

    /**
     * Get improvement trend
     * @returns {string} Improvement trend description
     */
    getImprovementTrend() {
        if (this.attempts.length < 2) return 'Not enough data';
        
        const recent = this.attempts.slice(-3);
        const older = this.attempts.slice(-6, -3);
        
        if (older.length === 0) return 'Building progress...';
        
        const recentAvg = recent.reduce((acc, a) => acc + a.score, 0) / recent.length;
        const olderAvg = older.reduce((acc, a) => acc + a.score, 0) / older.length;
        
        if (recentAvg > olderAvg + 5) return 'Improving! 📈';
        if (recentAvg < olderAvg - 5) return 'Keep practicing 📚';
        return 'Steady progress 📊';
    }

    /**
     * Save data to localStorage
     * @param {string} key - Storage key
     * @param {*} data - Data to save
     */
    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
        }
    }

    /**
     * Load data from localStorage
     * @param {string} key - Storage key
     * @returns {*} Loaded data or null
     */
    loadFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.warn('Failed to load from localStorage:', error);
            return null;
        }
    }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Global quiz manager instance
let quizManager = null;
let quizStatistics = null;

// Initialize quiz when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the quiz page
    if (document.querySelector('.quiz-container')) {
        quizManager = new QuizManager();
        quizStatistics = new QuizStatistics();
        
        console.log('🎯 Quiz system initialized');
        
        // Track quiz statistics when quiz is completed
        const originalShowResults = quizManager.showResults;
        quizManager.showResults = function(results) {
            quizStatistics.recordAttempt(results);
            originalShowResults.call(this, results);
        };
        
        // Make the instance globally accessible
        window.quizManager = quizManager;
    }
});

// Export for global access
if (typeof window !== 'undefined') {
    window.QuizManager = QuizManager;
    window.QuizQuestion = QuizQuestion;
    window.QuizStatistics = QuizStatistics;
}