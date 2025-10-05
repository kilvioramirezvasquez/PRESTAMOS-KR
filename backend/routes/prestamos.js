const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const Prestamo = require('../models/Prestamo');
const Cliente = require('../models/Cliente');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Obtener todos los préstamos con paginación
router.get('/', auth, [
    query('page').optional().isInt({ min: 1 }).withMessage('Página debe ser un número positivo'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite debe estar entre 1 y 100'),
    query('estado').optional().isIn(['activo', 'pagado', 'mora']).withMessage('Estado inválido')
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
        if (req.query.estado) filter.estado = req.query.estado;

        // Si es cobrador, solo puede ver sus préstamos
        if (req.usuario.rol === 'cobrador') {
            filter.cobrador = req.usuario._id;
        }

        // Usar consulta directa para obtener todos los préstamos migrados
        const db = mongoose.connection.db;
        const total = await db.collection('prestamos').countDocuments(filter);
        const prestamos = await db.collection('prestamos').find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ fechaPrestamo: -1 })
            .toArray();

        res.json({
            success: true,
            data: prestamos,
            pagination: {
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

// Crear nuevo préstamo
router.post('/', auth, authorize('admin', 'gerente'), [
    body('cliente').isMongoId().withMessage('ID de cliente inválido'),
    body('monto').isFloat({ min: 1 }).withMessage('Monto debe ser mayor a 0'),
    body('interes').isFloat({ min: 0, max: 100 }).withMessage('Interés debe estar entre 0 y 100%'),
    body('cuotas').isInt({ min: 1 }).withMessage('Cuotas debe ser mayor a 0'),
    body('cobrador').optional().isMongoId().withMessage('ID de cobrador inválido')
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

        // Verificar que el cliente existe
        const cliente = await Cliente.findById(req.body.cliente);
        if (!cliente) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }

        // Calcular valores del préstamo
        const { monto, interes, cuotas } = req.body;
        const montoTotal = monto + (monto * interes / 100);
        const montoCuota = Math.round((montoTotal / cuotas) * 100) / 100;

        const prestamoData = {
            ...req.body,
            montoCuota,
            saldoPendiente: montoTotal,
            cobrador: req.body.cobrador || cliente.cobrador
        };

        const prestamo = new Prestamo(prestamoData);
        await prestamo.save();
        
        await prestamo.populate(['cliente', 'cobrador']);
        
        logger.audit('LOAN_CREATED', req.usuario._id, { 
            prestamoId: prestamo._id,
            clienteId: cliente._id,
            monto,
            cuotas
        });

        res.status(201).json({
            success: true,
            message: 'Préstamo creado exitosamente',
            data: prestamo
        });
    } catch (error) {
        next(error);
    }
});

// Obtener préstamo por ID
router.get('/:id', auth, async (req, res, next) => {
    try {
        const prestamo = await Prestamo.findById(req.params.id)
            .populate('cliente', 'nombre cedula telefono direccion')
            .populate('cobrador', 'nombre email telefono');
        
        if (!prestamo) {
            return res.status(404).json({
                success: false,
                message: 'Préstamo no encontrado'
            });
        }

        // Si es cobrador, solo puede ver sus préstamos
        if (req.usuario.rol === 'cobrador' && 
            prestamo.cobrador && 
            prestamo.cobrador._id.toString() !== req.usuario._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para ver este préstamo'
            });
        }

        res.json({
            success: true,
            data: prestamo
        });
    } catch (error) {
        next(error);
    }
});

// Actualizar estado del préstamo
router.patch('/:id/estado', auth, authorize('admin', 'gerente', 'cobrador'), [
    body('estado').isIn(['activo', 'pagado', 'mora']).withMessage('Estado inválido')
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

        const prestamo = await Prestamo.findById(req.params.id);
        
        if (!prestamo) {
            return res.status(404).json({
                success: false,
                message: 'Préstamo no encontrado'
            });
        }

        // Si es cobrador, solo puede actualizar sus préstamos
        if (req.usuario.rol === 'cobrador' && 
            prestamo.cobrador && 
            prestamo.cobrador.toString() !== req.usuario._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para actualizar este préstamo'
            });
        }

        const estadoAnterior = prestamo.estado;
        prestamo.estado = req.body.estado;
        
        // Si se marca como pagado, saldo pendiente = 0
        if (req.body.estado === 'pagado') {
            prestamo.saldoPendiente = 0;
        }
        
        await prestamo.save();
        
        logger.audit('LOAN_STATUS_UPDATED', req.usuario._id, { 
            prestamoId: prestamo._id,
            estadoAnterior,
            estadoNuevo: req.body.estado
        });

        res.json({
            success: true,
            message: 'Estado del préstamo actualizado exitosamente',
            data: prestamo
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
