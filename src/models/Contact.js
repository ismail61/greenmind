// GreenMind - Contact Model
// Author: Fatemeh - Group 6
// Description: MongoDB model for contact form submissions

const mongoose = require('mongoose');

/**
 * Contact message schema
 */
const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long'],
        maxlength: [100, 'Name cannot exceed 100 characters'],
        validate: {
            validator: function(name) {
                // Check for realistic name format (at least first and last name)
                const nameParts = name.trim().split(/\s+/);
                return nameParts.length >= 2 && nameParts.every(part => part.length >= 2);
            },
            message: 'Please enter your full name (first and last name)'
        }
    },
    
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        maxlength: [255, 'Email cannot exceed 255 characters'],
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            'Please enter a valid email address'
        ],
        validate: {
            validator: function(email) {
                // Additional email domain validation
                const domain = email.split('@')[1];
                return domain && /\.[a-z]{2,}$/i.test(domain);
            },
            message: 'Please enter an email with a valid domain'
        }
    },
    
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true,
        enum: {
            values: ['general', 'recycling', 'energy', 'water', 'climate', 'feedback', 'collaboration', 'other'],
            message: 'Please select a valid subject'
        },
        maxlength: [200, 'Subject cannot exceed 200 characters']
    },
    
    message: {
        type: String,
        required: [true, 'Message is required'],
        trim: true,
        minlength: [10, 'Message must be at least 10 characters long'],
        maxlength: [1000, 'Message cannot exceed 1000 characters'],
        validate: {
            validator: function(message) {
                // Basic spam detection
                const spamPatterns = [/urgent/i, /congratulations/i, /click here/i, /free money/i];
                const suspiciousCount = spamPatterns.reduce((count, pattern) => {
                    return count + (pattern.test(message) ? 1 : 0);
                }, 0);
                return suspiciousCount < 2;
            },
            message: 'Please write a genuine message'
        }
    },
    
    newsletter: {
        type: Boolean,
        default: false
    },
    
    status: {
        type: String,
        enum: ['new', 'read', 'replied', 'archived'],
        default: 'new'
    },
    

    
    userAgent: {
        type: String,
        trim: true
    },
    
    createdAt: {
        type: Date,
        default: Date.now
    },
    
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    collection: 'contacts'
});

/**
 * Pre-save middleware
 */
contactSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

/**
 * Instance methods
 */
contactSchema.methods.markAsRead = function() {
    this.status = 'read';
    return this.save();
};

contactSchema.methods.markAsReplied = function() {
    this.status = 'replied';
    return this.save();
};

contactSchema.methods.archive = function() {
    this.status = 'archived';
    return this.save();
};

/**
 * Static methods
 */
contactSchema.statics.findByStatus = function(status) {
    return this.find({ status });
};

contactSchema.statics.findRecent = function(days = 7) {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);
    return this.find({ createdAt: { $gte: dateLimit } }).sort({ createdAt: -1 });
};

contactSchema.statics.getStats = function() {
    return this.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);
};

/**
 * Indexes for better query performance
 */
contactSchema.index({ createdAt: -1 });
contactSchema.index({ status: 1 });
contactSchema.index({ email: 1 });

/**
 * Virtual for formatted creation date
 */
contactSchema.virtual('formattedDate').get(function() {
    return this.createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
});

// Ensure virtual fields are serialized
contactSchema.set('toJSON', { virtuals: true });

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;