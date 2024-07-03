require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const { initializeDatabase, initializeDefaultUser } = require('./config/database');
const routes = require('./routes');
const logger = require('./config/logger');

const app = express();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api', routes);

const startServer = async () => {
    try {
        console.log('Starting server...');
        console.log('Creating database...');
        await initializeDatabase();
        console.log('Database created');

        const PORT = process.env.PORT || 5000;
        const server = app.listen(PORT, () => {
            console.log(`Serveur démarré sur le port ${PORT}`);
            console.log(`Doc API http://localhost:${PORT}/api-docs/`);
        });

        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.log(`Le port ${PORT} est déjà utilisé. Tentative avec le port ${PORT + 1}`);
                server.close();
                app.listen(PORT + 1);
            } else {
                console.error('Erreur du serveur:', error);
            }
        });
    } catch (error) {
        console.error('Error starting server:', error);
    }
};

if (require.main === module) {
    startServer();
}

module.exports = app;
