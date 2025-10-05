const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Middleware de autenticación
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No hay token, acceso denegado' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const usuario = await Usuario.findById(decoded.id).select('-password');
        
        if (!usuario || !usuario.activo) {
            return res.status(401).json({ message: 'Token no válido o usuario inactivo' });
        }

        req.usuario = usuario;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token no válido' });
    }
};

// Middleware para verificar roles específicos
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.usuario) {
            return res.status(401).json({ message: 'No autenticado' });
        }
        
        if (!roles.includes(req.usuario.rol)) {
            return res.status(403).json({ message: 'No tienes permisos para esta acción' });
        }
        
        next();
    };
};

module.exports = { auth, authorize };