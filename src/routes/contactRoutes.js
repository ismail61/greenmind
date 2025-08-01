// GreenMind - Contact Routes
// Author: Fatemeh - Group 6
// Description: Routes for contact form operations

const express = require('express');
const { ContactController } = require('../controllers');
const { ValidationMiddleware, SecurityMiddleware } = require('../middleware');

const router = express.Router();

/**
 * @route   POST /api/contact
 * @desc    Submit contact form
 * @access  Public
 */
router.post('/',
    SecurityMiddleware.configureFormRateLimit(),
    ValidationMiddleware.validateContactForm,
    ContactController.submitContact
);

/**
 * @route   GET /api/contact
 * @desc    Get all contact messages (admin only)
 * @access  Private
 */
router.get('/',
    ValidationMiddleware.validatePagination,
    ContactController.getAllContacts
);

/**
 * @route   GET /api/contact/stats
 * @desc    Get contact statistics
 * @access  Private
 */
router.get('/stats',
    ContactController.getContactStats
);

/**
 * @route   GET /api/contact/search
 * @desc    Search contact messages
 * @access  Private
 */
router.get('/search',
    ValidationMiddleware.validateSearchQuery,
    ContactController.searchContacts
);

/**
 * @route   GET /api/contact/:id
 * @desc    Get contact by ID
 * @access  Private
 */
router.get('/:id',
    ValidationMiddleware.validateObjectId('id'),
    ContactController.getContactById
);

/**
 * @route   PUT /api/contact/:id
 * @desc    Update contact status
 * @access  Private
 */
router.put('/:id',
    ValidationMiddleware.validateObjectId('id'),
    ContactController.updateContactStatus
);

/**
 * @route   DELETE /api/contact/:id
 * @desc    Delete contact message
 * @access  Private
 */
router.delete('/:id',
    ValidationMiddleware.validateObjectId('id'),
    ContactController.deleteContact
);

module.exports = router;