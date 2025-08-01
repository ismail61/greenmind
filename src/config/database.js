// GreenMind - Database Configuration
// Author: Fatemeh - Group 6
// Description: MongoDB connection configuration

const mongoose = require('mongoose');

/**
 * Database connection configuration
 */
class DatabaseConfig {
    /**
     * Connect to MongoDB database
     * @returns {Promise} Connection promise
     */
    static async connect() {
        try {
            const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/greenmind';
            
            await mongoose.connect(mongoURI);
            
            console.log('✅ MongoDB connected successfully');
            console.log(`📦 Database: ${mongoose.connection.name}`);
            
            return mongoose.connection;
        } catch (error) {
            console.error('❌ MongoDB connection error:', error.message);
            process.exit(1);
        }
    }

    /**
     * Disconnect from MongoDB
     * @returns {Promise} Disconnection promise
     */
    static async disconnect() {
        try {
            await mongoose.connection.close();
            console.log('📦 MongoDB connection closed');
        } catch (error) {
            console.error('❌ Error closing MongoDB connection:', error.message);
        }
    }

    /**
     * Get connection status
     * @returns {string} Connection status
     */
    static getConnectionStatus() {
        const states = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };
        
        return states[mongoose.connection.readyState] || 'unknown';
    }

    /**
     * Setup database event listeners
     */
    static setupEventListeners() {
        // Connection successful
        mongoose.connection.on('connected', () => {
            console.log('🔗 Mongoose connected to MongoDB');
        });

        // Connection error
        mongoose.connection.on('error', (error) => {
            console.error('❌ Mongoose connection error:', error);
        });

        // Connection disconnected
        mongoose.connection.on('disconnected', () => {
            console.log('📦 Mongoose disconnected from MongoDB');
        });

        // Application termination
        process.on('SIGINT', async () => {
            await DatabaseConfig.disconnect();
            process.exit(0);
        });
    }
}

module.exports = DatabaseConfig;