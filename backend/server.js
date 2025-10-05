const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const { generalLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');
require('dotenv').config();

const app = express();

// Middlewares de seguridad
app.use(helmet());
app.use(compression());
app.use(mongoSanitize());
app.use(generalLimiter);

// Configuración CORS específica
app.use(cors({
    origin: ['http://localhost:3000', 'http://159.203.69.59:3000', 'http://localhost:3007', 'http://159.203.69.59:3007', 'http://localhost:3006', 'http://159.203.69.59:3006', 'http://localhost:3003', 'http://159.203.69.59:3003', 'http://localhost:3001', 'http://159.203.69.59:3001', 'http://localhost:8081', 'http://159.203.69.59:8081'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middlewares básicos  
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Conexión MongoDB - FORZAR prestamos
mongoose.connect('mongodb://localhost:27017/prestamos')
    .then(() => logger.info('MongoDB conectado exitosamente'))
    .catch(err => logger.error('Error conectando MongoDB:', { error: err.message }));

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/prestamos', require('./routes/prestamos'));
app.use('/api/cobradores', require('./routes/cobradores'));
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/clientes-test', require('./routes/clientes-test'));
app.use('/api/debug-data', require('./routes/debug-data'));
app.use('/api/cobros', require('./routes/cobros'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/estadisticas-migradas', require('./routes/estadisticas-migradas'));
app.use('/api/diagnostico', require('./routes/diagnostico'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/reportes', require('./routes/reportes'));

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ 
        success: true,
        message: 'API Sistema de Préstamos funcionando correctamente',
        version: '1.0.0'
    });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
    logger.info(`Servidor corriendo en ${HOST}:${PORT}`, { host: HOST, port: PORT });
});
