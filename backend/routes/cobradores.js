const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const Usuario = require('../models/Usuario');
const logger = require('../utils/logger');

// Obtener todos los cobradores
router.get('/', auth, async (req, res, next) => {
    try {
        const cobradores = await Usuario.find({ rol: 'cobrador' })
            .select('-password')
            .sort({ nombre: 1 });

        res.json({
            success: true,
            data: cobradores
        });
    } catch (error) {
        next(error);
    }
});

// Crear nuevo cobrador (solo admin y gerente)
router.post('/', auth, authorize('admin', 'gerente'), [
    body('nombre').isLength({ min: 2 }).withMessage('Nombre debe tener al menos 2 caracteres'),
    body('email').isEmail().normalizeEmail().withMessage('Email válido es requerido'),
    body('password').isLength({ min: 6 }).withMessage('Contraseña debe tener al menos 6 caracteres'),
    body('telefono').optional().isMobilePhone().withMessage('Teléfono inválido'),
    body('zona').optional().isLength({ min: 2 }).withMessage('Zona debe tener al menos 2 caracteres')
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

        const cobradorData = {
            ...req.body,
            rol: 'cobrador'
        };

        const cobrador = new Usuario(cobradorData);
        await cobrador.save();
        
        logger.audit('COLLECTOR_CREATED', req.usuario._id, { 
            cobradorId: cobrador._id,
            email: cobrador.email 
        });

        // Remover password de la respuesta
        const cobradorResponse = cobrador.toObject();
        delete cobradorResponse.password;

        res.status(201).json({
            success: true,
            message: 'Cobrador creado exitosamente',
            data: cobradorResponse
        });
    } catch (error) {
        next(error);
    }
});

// Obtener cobrador por ID
router.get('/:id', auth, async (req, res, next) => {
    try {
        const cobrador = await Usuario.findOne({ 
            _id: req.params.id, 
            rol: 'cobrador' 
        }).select('-password');
        
        if (!cobrador) {
            return res.status(404).json({
                success: false,
                message: 'Cobrador no encontrado'
            });
        }

        res.json({
            success: true,
            data: cobrador
        });
    } catch (error) {
        next(error);
    }
});

// Actualizar cobrador
router.put('/:id', auth, authorize('admin', 'gerente'), [
    body('nombre').optional().isLength({ min: 2 }).withMessage('Nombre debe tener al menos 2 caracteres'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Email válido es requerido'),
    body('telefono').optional().isMobilePhone().withMessage('Teléfono inválido'),
    body('zona').optional().isLength({ min: 2 }).withMessage('Zona debe tener al menos 2 caracteres'),
    body('activo').optional().isBoolean().withMessage('Activo debe ser booleano')
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

        const cobrador = await Usuario.findOne({ 
            _id: req.params.id, 
            rol: 'cobrador' 
        });
        
        if (!cobrador) {
            return res.status(404).json({
                success: false,
                message: 'Cobrador no encontrado'
            });
        }

        // No permitir cambio de rol o password por esta ruta
        const { rol, password, ...updateData } = req.body;

        Object.assign(cobrador, updateData);
        await cobrador.save();
        
        logger.audit('COLLECTOR_UPDATED', req.usuario._id, { 
            cobradorId: cobrador._id,
            changes: updateData
        });

        // Remover password de la respuesta
        const cobradorResponse = cobrador.toObject();
        delete cobradorResponse.password;

        res.json({
            success: true,
            message: 'Cobrador actualizado exitosamente',
            data: cobradorResponse
        });
    } catch (error) {
        next(error);
    }
});

// Activar/Desactivar cobrador
router.patch('/:id/estado', auth, authorize('admin', 'gerente'), [
    body('activo').isBoolean().withMessage('Activo debe ser booleano')
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

        const cobrador = await Usuario.findOne({ 
            _id: req.params.id, 
            rol: 'cobrador' 
        });
        
        if (!cobrador) {
            return res.status(404).json({
                success: false,
                message: 'Cobrador no encontrado'
            });
        }

        const estadoAnterior = cobrador.activo;
        cobrador.activo = req.body.activo;
        await cobrador.save();
        
        logger.audit('COLLECTOR_STATUS_CHANGED', req.usuario._id, { 
            cobradorId: cobrador._id,
            estadoAnterior,
            estadoNuevo: req.body.activo
        });

        res.json({
            success: true,
            message: `Cobrador ${req.body.activo ? 'activado' : 'desactivado'} exitosamente`,
            data: { id: cobrador._id, activo: cobrador.activo }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
