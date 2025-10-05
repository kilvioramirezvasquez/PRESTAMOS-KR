const rateLimit = require('express-rate-limit');

// Rate limiting general
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // límite de 100 requests por ventana de tiempo
    message: {
        success: false,
        message: 'Demasiadas solicitudes, intenta de nuevo en 15 minutos'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Rate limiting para autenticación
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // límite de 5 intentos de login por IP
    message: {
        success: false,
        message: 'Demasiados intentos de login, intenta de nuevo en 15 minutos'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true
});

module.exports = { generalLimiter, authLimiter };