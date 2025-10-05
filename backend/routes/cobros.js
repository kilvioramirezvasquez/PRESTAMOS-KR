const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const Cobro = require('../models/Cobro');
const Prestamo = require('../models/Prestamo');
const logger = require('../utils/logger');

// Registrar nuevo cobro
router.post('/', auth, authorize('admin', 'gerente', 'cobrador'), [
    body('prestamo').isMongoId().withMessage('ID de préstamo inválido'),
    body('monto').isFloat({ min: 0.01 }).withMessage('Monto debe ser mayor a 0'),
    body('metodoPago').isIn(['efectivo', 'transferencia', 'tarjeta']).withMessage('Método de pago inválido'),
    body('ubicacion.lat').optional().isFloat({ min: -90, max: 90 }).withMessage('Latitud inválida'),
    body('ubicacion.lng').optional().isFloat({ min: -180, max: 180 }).withMessage('Longitud inválida')
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

        // Verificar que el préstamo existe
        const prestamo = await Prestamo.findById(req.body.prestamo).populate('cliente');
        if (!prestamo) {
            return res.status(404).json({
                success: false,
                message: 'Préstamo no encontrado'
            });
        }

        // Verificar que el préstamo esté activo
        if (prestamo.estado === 'pagado') {
            return res.status(400).json({
                success: false,
                message: 'El préstamo ya está completamente pagado'
            });
        }

        // Si es cobrador, verificar que sea su préstamo
        if (req.usuario.rol === 'cobrador' && 
            prestamo.cobrador && 
            prestamo.cobrador.toString() !== req.usuario._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para registrar cobros en este préstamo'
            });
        }

        // Verificar que no se cobre más de lo pendiente
        if (req.body.monto > prestamo.saldoPendiente) {
            return res.status(400).json({
                success: false,
                message: `El monto excede el saldo pendiente (${prestamo.saldoPendiente})`
            });
        }

        const cobroData = {
            ...req.body,
            cliente: prestamo.cliente._id,
            cobrador: req.usuario._id
        };

        const cobro = new Cobro(cobroData);
        await cobro.save();

        // Actualizar saldo pendiente del préstamo
        prestamo.saldoPendiente -= req.body.monto;
        
        // Si se pagó completamente, cambiar estado
        if (prestamo.saldoPendiente <= 0) {
            prestamo.estado = 'pagado';
            prestamo.saldoPendiente = 0;
        }

        await prestamo.save();
        
        await cobro.populate(['cliente', 'cobrador', 'prestamo']);
        
        logger.audit('PAYMENT_REGISTERED', req.usuario._id, { 
            cobroId: cobro._id,
            prestamoId: prestamo._id,
            monto: req.body.monto,
            saldoPendienteRestante: prestamo.saldoPendiente
        });

        res.status(201).json({
            success: true,
            message: 'Cobro registrado exitosamente',
            data: cobro
        });
    } catch (error) {
        next(error);
    }
});

// Obtener todos los cobros con paginación
router.get('/', auth, [
    query('page').optional().isInt({ min: 1 }).withMessage('Página debe ser un número positivo'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite debe estar entre 1 y 100'),
    query('fechaDesde').optional().isISO8601().withMessage('Fecha desde inválida'),
    query('fechaHasta').optional().isISO8601().withMessage('Fecha hasta inválida')
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
        
        // Filtro por fechas
        if (req.query.fechaDesde || req.query.fechaHasta) {
            filter.fecha = {};
            if (req.query.fechaDesde) filter.fecha.$gte = new Date(req.query.fechaDesde);
            if (req.query.fechaHasta) filter.fecha.$lte = new Date(req.query.fechaHasta);
        }

        // Si es cobrador, solo puede ver sus cobros
        if (req.usuario.rol === 'cobrador') {
            filter.cobrador = req.usuario._id;
        }

        const total = await Cobro.countDocuments(filter);
        const cobros = await Cobro.find(filter)
            .populate('cliente', 'nombre cedula telefono')
            .populate('cobrador', 'nombre email')
            .populate('prestamo', 'monto saldoPendiente estado')
            .skip(skip)
            .limit(limit)
            .sort({ fecha: -1 });

        res.json({
            success: true,
            data: cobros,
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

// Obtener cobros de un préstamo específico
router.get('/prestamo/:prestamoId', auth, async (req, res, next) => {
    try {
        const prestamo = await Prestamo.findById(req.params.prestamoId);
        
        if (!prestamo) {
            return res.status(404).json({
                success: false,
                message: 'Préstamo no encontrado'
            });
        }

        // Si es cobrador, verificar permisos
        if (req.usuario.rol === 'cobrador' && 
            prestamo.cobrador && 
            prestamo.cobrador.toString() !== req.usuario._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para ver los cobros de este préstamo'
            });
        }

        const cobros = await Cobro.find({ prestamo: req.params.prestamoId })
            .populate('cliente', 'nombre cedula')
            .populate('cobrador', 'nombre')
            .sort({ fecha: -1 });

        res.json({
            success: true,
            data: cobros
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
