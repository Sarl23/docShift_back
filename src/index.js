require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';
const NODE_ENV = process.env.NODE_ENV || 'development';


process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error.message);
    console.error(error.stack);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});


const startServer = async () => {
    try {
        
        const requiredEnvVars = ['FIREBASE_PROJECT_ID'];
        const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
        
        if (missingEnvVars.length > 0) {
            throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
        }
        
        const server = app.listen(PORT, HOST, () => {
            console.log('🚀 Server Information:');
            console.log(`   ➜ Environment: ${NODE_ENV}`);
            console.log(`   ➜ URL: http://${HOST}:${PORT}`);
            console.log(`   ➜ Health: http://${HOST}:${PORT}/health`);
            if (NODE_ENV === 'development') {
                console.log(`   ➜ Swagger: http://${HOST}:${PORT}/api-docs`);
            }
            console.log('   ➜ Press Ctrl+C to stop\n');
        });

        server.timeout = 30000; // 30 seg

        // Manejo graceful
        const gracefulShutdown = (signal) => {
            console.log(`\n📴 Received ${signal}. Starting graceful shutdown...`);
            
            server.close((err) => {
                if (err) {
                    console.error('❌ Error during server shutdown:', err);
                    process.exit(1);
                }
                
                console.log('✅ Server closed successfully');
                process.exit(0);
            });
            
            // Forzar cierre después de 10 segundos
            setTimeout(() => {
                console.error('❌ Forced shutdown after 10s timeout');
                process.exit(1);
            }, 10000);
        };

        // Escuchar señales de cierre
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        return server;

    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

// Iniciar servidor solo si este archivo es ejecutado directamente
if (require.main === module) {
    startServer();
}

module.exports = { startServer };