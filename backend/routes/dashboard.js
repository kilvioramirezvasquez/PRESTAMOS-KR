const express = require('express');
const router = express.Router();
const { query, validationResult } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const Cobro = require('../models/Cobro');
const Prestamo = require('../models/Prestamo');
const Cliente = require('../models/Cliente');
const Usuario = require('../models/Usuario');
const mongoose = require('mongoose');

// Estadísticas generales del dashboard
router.get('/estadisticas', auth, [
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

        const dateFilter = {};
        if (req.query.fechaDesde || req.query.fechaHasta) {
            if (req.query.fechaDesde) dateFilter.$gte = new Date(req.query.fechaDesde);
            if (req.query.fechaHasta) dateFilter.$lte = new Date(req.query.fechaHasta);
        }

        // Filtros por rol
        const userFilter = {};
        if (req.usuario.rol === 'cobrador') {
            userFilter.cobrador = req.usuario._id;
        }

        // Pipeline base para cobros
        const cobrosPipeline = [
            { $match: { ...userFilter, ...(Object.keys(dateFilter).length && { fecha: dateFilter }) } },
            { $group: { _id: null, total: { $sum: '$monto' }, count: { $sum: 1 } } }
        ];

        // Pipeline para préstamos
        const prestamosPipeline = [
            { $match: userFilter },
            {
                $group: {
                    _id: null,
                    totalPrestado: { $sum: '$monto' },
                    totalPendiente: { $sum: '$saldoPendiente' },
                    count: { $sum: 1 },
                    activos: { $sum: { $cond: [{ $eq: ['$estado', 'activo'] }, 1, 0] } },
                    pagados: { $sum: { $cond: [{ $eq: ['$estado', 'pagado'] }, 1, 0] } },
                    mora: { $sum: { $cond: [{ $eq: ['$estado', 'mora'] }, 1, 0] } }
                }
            }
        ];

        const [totalCobrado, totalPrestamos, totalClientes] = await Promise.all([
            Cobro.aggregate(cobrosPipeline),
            Prestamo.aggregate(prestamosPipeline),
            Cliente.countDocuments(req.usuario.rol === 'cobrador' ? { cobrador: req.usuario._id } : {})
        ]);

        // Estadísticas de cobros por día (últimos 7 días)
        const hace7Dias = new Date();
        hace7Dias.setDate(hace7Dias.getDate() - 7);

        const cobrosPorDia = await Cobro.aggregate([
            {
                $match: {
                    ...userFilter,
                    fecha: { $gte: hace7Dias }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$fecha' } },
                    total: { $sum: '$monto' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const estadisticas = {
            cobros: {
                total: totalCobrado[0]?.total || 0,
                cantidad: totalCobrado[0]?.count || 0
            },
            prestamos: {
                totalPrestado: totalPrestamos[0]?.totalPrestado || 0,
                totalPendiente: totalPrestamos[0]?.totalPendiente || 0,
                cantidad: totalPrestamos[0]?.count || 0,
                activos: totalPrestamos[0]?.activos || 0,
                pagados: totalPrestamos[0]?.pagados || 0,
                mora: totalPrestamos[0]?.mora || 0
            },
            clientes: {
                total: totalClientes
            },
            cobrosPorDia
        };

        res.json({
            success: true,
            data: estadisticas
        });
    } catch (error) {
        next(error);
    }
});

// Endpoint específico para el dashboard frontend
router.get('/stats', auth, async (req, res, next) => {
    try {
        console.log('=== DASHBOARD STATS REQUEST ===');
        console.log('Usuario:', req.usuario?.email);
        
        // Usar consulta directa para obtener datos migrados correctos
        const db = mongoose.connection.db;
        console.log('Base de datos:', db.databaseName);
        
        // Obtener estadísticas directas de las colecciones
        const totalClientes = await db.collection('clientes').countDocuments();
        const totalPrestamos = await db.collection('prestamos').countDocuments();
        const totalCobros = await db.collection('cobros').countDocuments();
        
        // Estadísticas de préstamos
        const prestamosStats = await db.collection('prestamos').aggregate([
            {
                $group: {
                    _id: null,
                    totalPrestado: { $sum: '$monto' },
                    totalPendiente: { $sum: '$saldoPendiente' },
                    cantidad: { $sum: 1 },
                    activos: { $sum: { $cond: [{ $eq: ['$estado', 'activo'] }, 1, 0] } },
                    pagados: { $sum: { $cond: [{ $eq: ['$estado', 'pagado'] }, 1, 0] } },
                    mora: { $sum: { $cond: [{ $eq: ['$estado', 'mora'] }, 1, 0] } }
                }
            }
        ]).toArray();

        // Estadísticas de cobros
        const cobrosStats = await db.collection('cobros').aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: '$monto' },
                    cantidad: { $sum: 1 }
                }
            }
        ]).toArray();

        // Formato que espera el frontend
        const stats = {
            totalClientes: totalClientes,
            totalPrestamos: totalPrestamos,
            montoTotal: prestamosStats[0]?.totalPrestado || 0,
            cobrosHoy: 0, // Calculado más adelante si es necesario
            clientesActivos: totalClientes,
            prestamosActivos: prestamosStats[0]?.activos || 0,
            morosidad: ((prestamosStats[0]?.mora || 0) / totalPrestamos * 100) || 0,
            ingresosMes: cobrosStats[0]?.total || 0
        };

        console.log('Estadísticas calculadas:', stats);
        res.json(stats);

    } catch (error) {
        console.error('Error obteniendo estadísticas dashboard:', error);
        next(error);
    }
});

// Estadísticas por cobrador (solo admin y gerente)
router.get('/cobradores', auth, authorize('admin', 'gerente'), async (req, res, next) => {
    try {
        const estadisticasCobradores = await Usuario.aggregate([
            { $match: { rol: 'cobrador', activo: true } },
            {
                $lookup: {
                    from: 'prestamos',
                    localField: '_id',
                    foreignField: 'cobrador',
                    as: 'prestamos'
                }
            },
            {
                $lookup: {
                    from: 'cobros',
                    localField: '_id',
                    foreignField: 'cobrador',
                    as: 'cobros'
                }
            },
            {
                $lookup: {
                    from: 'clientes',
                    localField: '_id',
                    foreignField: 'cobrador',
                    as: 'clientes'
                }
            },
            {
                $project: {
                    nombre: 1,
                    email: 1,
                    zona: 1,
                    totalPrestamos: { $size: '$prestamos' },
                    totalClientes: { $size: '$clientes' },
                    totalCobrado: { $sum: '$cobros.monto' },
                    totalCobros: { $size: '$cobros' },
                    prestamosActivos: {
                        $size: {
                            $filter: {
                                input: '$prestamos',
                                as: 'prestamo',
                                cond: { $eq: ['$$prestamo.estado', 'activo'] }
                            }
                        }
                    }
                }
            },
            { $sort: { totalCobrado: -1 } }
        ]);

        res.json({
            success: true,
            data: estadisticasCobradores
        });
    } catch (error) {
        next(error);
    }
});

// Resumen rápido para la vista principal
router.get('/resumen', auth, async (req, res, next) => {
    try {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const mañana = new Date(hoy);
        mañana.setDate(mañana.getDate() + 1);

        const userFilter = req.usuario.rol === 'cobrador' ? { cobrador: req.usuario._id } : {};

        const [cobrosHoy, prestamosVencidos, clientesMora] = await Promise.all([
            Cobro.aggregate([
                {
                    $match: {
                        ...userFilter,
                        fecha: { $gte: hoy, $lt: mañana }
                    }
                },
                { $group: { _id: null, total: { $sum: '$monto' }, count: { $sum: 1 } } }
            ]),
            Prestamo.countDocuments({ ...userFilter, estado: 'mora' }),
            Cliente.countDocuments({ ...userFilter, estado: 'mora' })
        ]);

        res.json({
            success: true,
            data: {
                cobrosHoy: {
                    total: cobrosHoy[0]?.total || 0,
                    cantidad: cobrosHoy[0]?.count || 0
                },
                prestamosVencidos,
                clientesMora
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
