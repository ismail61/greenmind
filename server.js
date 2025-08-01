// GreenMind - Main Server Entry Point
// Author: Fatemeh - Group 6
// Description: Clean, modular server for GreenMind environmental awareness website

const createApp = require('./src/app');
const DatabaseConfig = require('./src/config/database');
const { config, displayConfig } = require('./src/config/environment');
const { ErrorHandler } = require('./src/middleware');

/**
 * Start the GreenMind server
 */
async function startServer() {
    try {
        // Display configuration
        displayConfig();

        // Setup database event listeners
        DatabaseConfig.setupEventListeners();

        // Connect to database
        await DatabaseConfig.connect();

        // Create Express application
        const app = createApp();

        // Start HTTP server
        const server = app.listen(config.server.port, () => {
            console.log('🌍 GreenMind server started successfully!');
            console.log(`🔗 Local URL: http://localhost:${config.server.port}`);
            console.log(`📁 Serving static files from: ${__dirname}/public`);
            console.log(`📊 Database status: ${DatabaseConfig.getConnectionStatus()}`);
            console.log('✅ Server ready to handle requests');
        });

        // Setup error handlers
        ErrorHandler.setupErrorHandlers(server);

        // Return server instance for testing
        return server;

    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

// Start server if this file is run directly
if (require.main === module) {
    startServer();
}

module.exports = startServer;