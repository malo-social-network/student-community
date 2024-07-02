require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const { createDatabase, initializeDefaultUser } = require('./config/database');
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
        await createDatabase();
        console.log('Database created');

        console.log('Initializing default user...');
        await initializeDefaultUser();
        console.log('Default user initialized');

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Serveur démarré sur le port ${PORT}`);
            console.log(`Doc API http://localhost:${PORT}/api-docs/`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
    }
};

if (require.main === module) {
    startServer();
}

module.exports = app;
