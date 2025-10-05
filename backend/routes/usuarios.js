const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const Usuario = require('../models/Usuario');
const logger = require('../utils/logger');
const bcrypt = require('bcryptjs');

// Obtener todos los usuarios con paginación
router.get('/', auth, authorize('admin'), [
    query('page').optional().isInt({ min: 1 }).withMessage('Página debe ser un número positivo'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite debe estar entre 1 y 100'),
    query('rol').optional().isIn(['admin', 'gerente', 'cobrador']).withMessage('Rol inválido')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Parámetros de consulta inválidos',
                errors: errors.array()
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        const filter = {};
        if (req.query.rol) filter.rol = req.query.rol;
        if (req.query.search) {
            filter.$or = [
                { nombre: new RegExp(req.query.search, 'i') },
                { email: new RegExp(req.query.search, 'i') }
            ];
        }

        const total = await Usuario.countDocuments(filter);
        const usuarios = await Usuario.find(filter)
            .select('-password')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: {
                usuarios,
                total,
                page,
                pages: Math.ceil(total / limit),
                limit
            }
        });
    } catch (error) {
        next(error);
    }
});

// Obtener usuario por ID
router.get('/:id', auth, authorize('admin', 'gerente'), async (req, res, next) => {
    try {
        const usuario = await Usuario.findById(req.params.id).select('-password');
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            data: usuario
        });
    } catch (error) {
        next(error);
    }
});

// Crear nuevo usuario
router.post('/', auth, authorize('admin'), [
    body('nombre').trim().notEmpty().withMessage('Nombre es requerido'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('Contraseña debe tener al menos 6 caracteres'),
    body('rol').isIn(['admin', 'gerente', 'cobrador']).withMessage('Rol inválido'),
    body('telefono').optional().isMobilePhone().withMessage('Teléfono inválido'),
    body('zona').optional().trim().notEmpty().withMessage('Zona inválida')
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

        // Verificar que el email no exista
        const existeUsuario = await Usuario.findOne({ email: req.body.email });
        if (existeUsuario) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe un usuario con ese email'
            });
        }

        // Encriptar contraseña
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

        const usuario = new Usuario({
            ...req.body,
            password: hashedPassword
        });

        await usuario.save();

        logger.info(`Nuevo usuario creado: ${usuario.email}`, {
            usuarioId: usuario._id,
            rol: usuario.rol,
            creadoPor: req.usuario._id
        });

        // Retornar usuario sin contraseña
        const usuarioResponse = usuario.toObject();
        delete usuarioResponse.password;

        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            data: usuarioResponse
        });
    } catch (error) {
        next(error);
    }
});

// Actualizar usuario
router.put('/:id', auth, authorize('admin'), [
    body('nombre').optional().trim().notEmpty().withMessage('Nombre no puede estar vacío'),
    body('email').optional().isEmail().withMessage('Email inválido'),
    body('rol').optional().isIn(['admin', 'gerente', 'cobrador']).withMessage('Rol inválido'),
    body('telefono').optional().isMobilePhone().withMessage('Teléfono inválido'),
    body('zona').optional().trim().notEmpty().withMessage('Zona inválida'),
    body('activo').optional().isBoolean().withMessage('Estado activo debe ser verdadero o falso')
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

        const usuario = await Usuario.findById(req.params.id);
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Si se cambió el email, verificar que no exista
        if (req.body.email && req.body.email !== usuario.email) {
            const existeEmail = await Usuario.findOne({ email: req.body.email });
            if (existeEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe un usuario con ese email'
                });
            }
        }

        // Actualizar campos
        Object.keys(req.body).forEach(key => {
            if (key !== 'password') {
                usuario[key] = req.body[key];
            }
        });

        await usuario.save();

        logger.info(`Usuario actualizado: ${usuario.email}`, {
            usuarioId: usuario._id,
            actualizadoPor: req.usuario._id
        });

        // Retornar usuario sin contraseña
        const usuarioResponse = usuario.toObject();
        delete usuarioResponse.password;

        res.json({
            success: true,
            message: 'Usuario actualizado exitosamente',
            data: usuarioResponse
        });
    } catch (error) {
        next(error);
    }
});

// Cambiar contraseña de usuario
router.put('/:id/password', auth, authorize('admin'), [
    body('password').isLength({ min: 6 }).withMessage('Contraseña debe tener al menos 6 caracteres')
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

        const usuario = await Usuario.findById(req.params.id);
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Encriptar nueva contraseña
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
        
        usuario.password = hashedPassword;
        await usuario.save();

        logger.info(`Contraseña cambiada para usuario: ${usuario.email}`, {
            usuarioId: usuario._id,
            cambiadaPor: req.usuario._id
        });

        res.json({
            success: true,
            message: 'Contraseña actualizada exitosamente'
        });
    } catch (error) {
        next(error);
    }
});

// Eliminar usuario (desactivar)
router.delete('/:id', auth, authorize('admin'), async (req, res, next) => {
    try {
        const usuario = await Usuario.findById(req.params.id);
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // No permitir eliminar el propio usuario
        if (usuario._id.toString() === req.usuario._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'No puedes eliminar tu propio usuario'
            });
        }

        // Desactivar en lugar de eliminar
        usuario.activo = false;
        await usuario.save();

        logger.info(`Usuario desactivado: ${usuario.email}`, {
            usuarioId: usuario._id,
            desactivadoPor: req.usuario._id
        });

        res.json({
            success: true,
            message: 'Usuario desactivado exitosamente'
        });
    } catch (error) {
        next(error);
    }
});

// Obtener estadísticas de usuarios
router.get('/stats/resumen', auth, authorize('admin'), async (req, res, next) => {
    try {
        const totalUsuarios = await Usuario.countDocuments();
        const usuariosActivos = await Usuario.countDocuments({ activo: true });
        const usuariosPorRol = await Usuario.aggregate([
            {
                $group: {
                    _id: '$rol',
                    count: { $sum: 1 }
                }
            }
        ]);

        const stats = {
            total: totalUsuarios,
            activos: usuariosActivos,
            inactivos: totalUsuarios - usuariosActivos,
            porRol: usuariosPorRol.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {})
        };

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;