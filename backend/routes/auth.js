const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { authLimiter } = require('../middleware/rateLimiter');
const { auth } = require('../middleware/auth');
const Usuario = require('../models/Usuario');
const logger = require('../utils/logger');

// Login
router.post('/login', authLimiter, [
    body('password').isLength({ min: 6 }).withMessage('Contraseña debe tener al menos 6 caracteres')
], async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        // Validación personalizada para email
        let emailToSearch = email;
        
        // Si es solo un nombre de usuario (sin @), intentar como cobrador
        if (email && email !== 'admin' && !email.includes('@')) {
            emailToSearch = `${email}@demo.com`;
        }
        
        if (!email || (email !== 'admin' && !emailToSearch.includes('@'))) {
            return res.status(400).json({
                success: false,
                message: 'Email válido es requerido, usar "admin" o nombre de cobrador'
            });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Datos de entrada inválidos',
                errors: errors.array()
            });
        }

        const usuario = await Usuario.findOne({ email: emailToSearch }).select('+password');
        
        if (!usuario || !usuario.activo) {
            logger.audit('LOGIN_FAILED', null, { email: emailToSearch, reason: 'Usuario no encontrado o inactivo' });
            return res.status(401).json({ 
                success: false,
                message: 'Credenciales inválidas' 
            });
        }
        
        const isMatch = await bcrypt.compare(password, usuario.password);
        if (!isMatch) {
            logger.audit('LOGIN_FAILED', usuario._id, { email: emailToSearch, reason: 'Contraseña incorrecta' });
            return res.status(401).json({ 
                success: false,
                message: 'Credenciales inválidas' 
            });
        }
        
        const token = jwt.sign(
            { id: usuario._id, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        logger.audit('LOGIN_SUCCESS', usuario._id, { email });
        
        res.json({ 
            success: true,
            token, 
            usuario: { 
                id: usuario._id, 
                nombre: usuario.nombre, 
                rol: usuario.rol,
                email: usuario.email
            } 
        });
    } catch (error) {
        next(error);
    }
});

// Registro
router.post('/register', [
    body('nombre').isLength({ min: 2 }).withMessage('Nombre debe tener al menos 2 caracteres'),
    body('email').isEmail().normalizeEmail().withMessage('Email válido es requerido'),
    body('password').isLength({ min: 6 }).withMessage('Contraseña debe tener al menos 6 caracteres'),
    body('rol').isIn(['admin', 'cobrador', 'gerente']).withMessage('Rol inválido')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Datos de entrada inválidos',
                errors: errors.array()
            });
        }

        const usuario = new Usuario(req.body);
        await usuario.save();
        
        logger.audit('USER_REGISTERED', usuario._id, { email: usuario.email, rol: usuario.rol });
        
        res.status(201).json({ 
            success: true,
            message: 'Usuario creado exitosamente',
            usuario: {
                id: usuario._id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        });
    } catch (error) {
        next(error);
    }
});

// Obtener perfil del usuario autenticado
router.get('/profile', auth, async (req, res, next) => {
    try {
        res.json({
            success: true,
            usuario: {
                id: req.usuario._id,
                nombre: req.usuario.nombre,
                email: req.usuario.email,
                rol: req.usuario.rol,
                zona: req.usuario.zona,
                telefono: req.usuario.telefono,
                createdAt: req.usuario.createdAt
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
