const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const routes = require('../src/routes/index.js');
const {swaggerUi, specs } = require('./swagger');
const path = require('path');

const app = express();

app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? 'https://tu-dominio-productivo.com'
        : 'http://localhost:5173',
    credentials: true,
}));

app.use(morgan('dev'));
app.use(express.json());
app.use('/api', routes);

app.use('/docs', express.static(path.join(__dirname, 'node_modules/swagger-ui-dist')));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));

app.get('/', (req, res) => {
    res.send('Hello World');
});

module.exports = app;
