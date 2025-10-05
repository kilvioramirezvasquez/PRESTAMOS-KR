const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    console.error(err);

    // Error de validación de Mongoose
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = { message: message.join(', '), statusCode: 400 };
    }

    // Error de duplicado de Mongoose
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `El ${field} ya existe`;
        error = { message, statusCode: 400 };
    }

    // Error de cast de Mongoose (ID inválido)
    if (err.name === 'CastError') {
        const message = 'Recurso no encontrado';
        error = { message, statusCode: 404 };
    }

    // Error de JWT
    if (err.name === 'JsonWebTokenError') {
        const message = 'Token no válido';
        error = { message, statusCode: 401 };
    }

    // Error de JWT expirado
    if (err.name === 'TokenExpiredError') {
        const message = 'Token expirado';
        error = { message, statusCode: 401 };
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;