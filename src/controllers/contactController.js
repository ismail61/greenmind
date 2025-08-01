// GreenMind - Contact Controller
// Author: Fatemeh - Group 6
// Description: Controller for handling contact form operations

const { Contact } = require('../models');
const { AppError, catchAsync } = require('../utils');

/**
 * Contact Controller Class
 */
class ContactController {
    /**
     * Submit contact form
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    static submitContact = catchAsync(async (req, res, next) => {
        const { name, email, subject, message, newsletter } = req.body;

        // Validation
        if (!name || !email || !subject || !message) {
            const errors = {};
            if (!name) errors.name = 'Name is required';
            if (!email) errors.email = 'Email is required';
            if (!subject) errors.subject = 'Subject is required';
            if (!message) errors.message = 'Message is required';

            return res.status(400).json({
                status: 'error',
                message: 'All required fields must be provided',
                errors
            });
        }

        // Create contact message with additional metadata
        const contactData = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            subject: subject.trim(),
            message: message.trim(),
            newsletter: newsletter === true || newsletter === 'on',

            userAgent: req.get('User-Agent')
        };

        const newContact = new Contact(contactData);
        await newContact.save();

        console.log(`📧 New contact message from ${name} (${email}) - Subject: ${subject}`);

        // Send success response
        res.status(201).json({
            status: 'success',
            message: 'Thank you for your message! We will get back to you soon.',
            data: {
                id: newContact._id,
                createdAt: newContact.createdAt,
                formattedDate: newContact.formattedDate
            }
        });
    });

    /**
     * Get all contact messages (for admin use)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    static getAllContacts = catchAsync(async (req, res, next) => {
        const {
            page = 1,
            limit = 10,
            status,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build query
        const query = {};
        if (status) {
            query.status = status;
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Execute query with pagination
        const skip = (page - 1) * limit;
        const contacts = await Contact
            .find(query)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .select('-__v');

        // Get total count for pagination
        const total = await Contact.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        res.json({
            status: 'success',
            data: {
                contacts,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalItems: total,
                    itemsPerPage: parseInt(limit),
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });
    });

    /**
     * Get contact by ID
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    static getContactById = catchAsync(async (req, res, next) => {
        const { id } = req.params;

        const contact = await Contact.findById(id).select('-__v');
        
        if (!contact) {
            return next(new AppError('Contact message not found', 404));
        }

        res.json({
            status: 'success',
            data: { contact }
        });
    });

    /**
     * Update contact status
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    static updateContactStatus = catchAsync(async (req, res, next) => {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['new', 'read', 'replied', 'archived'];
        if (!validStatuses.includes(status)) {
            return next(new AppError('Invalid status. Must be one of: ' + validStatuses.join(', '), 400));
        }

        const contact = await Contact.findByIdAndUpdate(
            id,
            { status, updatedAt: new Date() },
            { new: true, runValidators: true }
        ).select('-__v');

        if (!contact) {
            return next(new AppError('Contact message not found', 404));
        }

        res.json({
            status: 'success',
            message: `Contact status updated to ${status}`,
            data: { contact }
        });
    });

    /**
     * Delete contact message
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    static deleteContact = catchAsync(async (req, res, next) => {
        const { id } = req.params;

        const contact = await Contact.findByIdAndDelete(id);

        if (!contact) {
            return next(new AppError('Contact message not found', 404));
        }

        console.log(`🗑️ Contact message deleted: ${contact.name} (${contact.email})`);

        res.status(204).json({
            status: 'success',
            message: 'Contact message deleted successfully'
        });
    });

    /**
     * Get contact statistics
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    static getContactStats = catchAsync(async (req, res, next) => {
        const [statusStats, recentContacts] = await Promise.all([
            Contact.getStats(),
            Contact.findRecent(30)
        ]);

        // Calculate additional statistics
        const totalContacts = await Contact.countDocuments();
        const subscribedToNewsletter = await Contact.countDocuments({ newsletter: true });
        
        // Subject distribution
        const subjectStats = await Contact.aggregate([
            {
                $group: {
                    _id: '$subject',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.json({
            status: 'success',
            data: {
                totalContacts,
                subscribedToNewsletter,
                statusDistribution: statusStats,
                subjectDistribution: subjectStats,
                recentContactsCount: recentContacts.length,
                recentContacts: recentContacts.slice(0, 5) // Latest 5
            }
        });
    });

    /**
     * Search contacts
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    static searchContacts = catchAsync(async (req, res, next) => {
        const { q, field = 'all' } = req.query;

        if (!q || q.trim().length < 2) {
            return next(new AppError('Search query must be at least 2 characters long', 400));
        }

        const searchTerm = q.trim();
        let searchQuery = {};

        if (field === 'all') {
            searchQuery = {
                $or: [
                    { name: { $regex: searchTerm, $options: 'i' } },
                    { email: { $regex: searchTerm, $options: 'i' } },
                    { subject: { $regex: searchTerm, $options: 'i' } },
                    { message: { $regex: searchTerm, $options: 'i' } }
                ]
            };
        } else {
            searchQuery[field] = { $regex: searchTerm, $options: 'i' };
        }

        const contacts = await Contact
            .find(searchQuery)
            .sort({ createdAt: -1 })
            .limit(20)
            .select('-__v');

        res.json({
            status: 'success',
            data: {
                query: searchTerm,
                field,
                results: contacts,
                count: contacts.length
            }
        });
    });
}

module.exports = ContactController;