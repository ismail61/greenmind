// GreenMind - Middleware Index
// Author: Fatemeh - Group 6
// Description: Central export point for all middleware

const SecurityMiddleware = require('./security');
const ValidationMiddleware = require('./validation');
const { ErrorHandler, AppError, catchAsync } = require('./errorHandler');

module.exports = {
    SecurityMiddleware,
    ValidationMiddleware,
    ErrorHandler,
    AppError,
    catchAsync
};