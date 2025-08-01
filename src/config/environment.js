// GreenMind - Environment Configuration
// Author: Fatemeh - Group 6
// Description: Environment variables and application configuration

require('dotenv').config();

/**
 * Application configuration from environment variables
 */
const config = {
    // Server configuration
    server: {
        port: process.env.PORT || 3000,
        environment: process.env.NODE_ENV || 'development',
        host: process.env.HOST || 'localhost'
    },

    // Database configuration
    database: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/greenmind',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    },

    // Application settings
    app: {
        name: process.env.APP_NAME || 'GreenMind',
        version: process.env.APP_VERSION || '1.0.0',
        description: 'Environmental Awareness Website'
    },

    // Security settings
    security: {
        sessionSecret: process.env.SESSION_SECRET || 'greenmind-default-secret-change-in-production',
        corsOrigins: process.env.NODE_ENV === 'production' 
            ? (process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['https://your-domain.com'])
            : ['http://localhost:3000', 'http://127.0.0.1:3000'],
        rateLimitWindow: 15 * 60 * 1000, // 15 minutes
        rateLimitMax: 100 // requests per window
    },

    // API settings
    api: {
        prefix: '/api',
        version: 'v1',
        timeout: 30000 // 30 seconds
    },
};

/**
 * Validate required environment variables
 */
function validateConfig() {
    const requiredVars = [];
    
    if (config.server.environment === 'production') {
        requiredVars.push('MONGODB_URI', 'SESSION_SECRET');
    }
    
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
        console.error('❌ Missing required environment variables:', missingVars.join(', '));
        console.error('💡 Please check your .env file or environment configuration');
        process.exit(1);
    }
}

/**
 * Display configuration summary
 */
function displayConfig() {
    console.log('🚀 Application Configuration:');
    console.log(`   Environment: ${config.server.environment}`);
    console.log(`   Port: ${config.server.port}`);
    console.log(`   Database: ${config.database.uri.replace(/\/\/.*@/, '//***@')}`); // Hide credentials
    console.log(`   API Prefix: ${config.api.prefix}`);
    console.log(`   CORS Origins: ${config.security.corsOrigins.join(', ')}`);
}

// Validate configuration on load
validateConfig();

module.exports = {
    config,
    validateConfig,
    displayConfig
};