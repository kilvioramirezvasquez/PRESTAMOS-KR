const express = require('express');
const router = express.Router();
const { query, validationResult } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const Cliente = require('../models/Cliente');
const Prestamo = require('../models/Prestamo');
const Cobro = require('../models/Cobro');
const Usuario = require('../models/Usuario');
const logger = require('../utils/logger');

// Reporte general del sistema
router.get('/general', auth, authorize('admin', 'gerente'), [
    query('fechaInicio').optional().isISO8601().withMessage('Fecha inicio inválida'),
    query('fechaFin').optional().isISO8601().withMessage('Fecha fin inválida')
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

        const fechaInicio = req.query.fechaInicio ? new Date(req.query.fechaInicio) : new Date(new Date().getFullYear(), 0, 1);
        const fechaFin = req.query.fechaFin ? new Date(req.query.fechaFin) : new Date();

        const filtroFecha = {
            createdAt: {
                $gte: fechaInicio,
                $lte: fechaFin
            }
        };

        // Estadísticas de clientes
        const totalClientes = await Cliente.countDocuments();
        const clientesNuevos = await Cliente.countDocuments(filtroFecha);
        const clientesActivos = await Cliente.countDocuments({ estado: 'activo' });

        // Estadísticas de préstamos
        const totalPrestamos = await Prestamo.countDocuments();
        const prestamosNuevos = await Prestamo.countDocuments(filtroFecha);
        const prestamosActivos = await Prestamo.countDocuments({ estado: 'activo' });
        const prestamosPagados = await Prestamo.countDocuments({ estado: 'pagado' });
        const prestamosMora = await Prestamo.countDocuments({ estado: 'mora' });

        // Montos de préstamos
        const montosResult = await Prestamo.aggregate([
            {
                $group: {
                    _id: null,
                    montoTotal: { $sum: '$monto' },
                    saldoPendienteTotal: { $sum: '$saldoPendiente' }
                }
            }
        ]);

        const montos = montosResult[0] || { montoTotal: 0, saldoPendienteTotal: 0 };

        // Estadísticas de cobros
        const totalCobros = await Cobro.countDocuments();
        const cobrosDelPeriodo = await Cobro.countDocuments(filtroFecha);
        
        const cobrosResult = await Cobro.aggregate([
            {
                $match: filtroFecha
            },
            {
                $group: {
                    _id: null,
                    montoTotalCobros: { $sum: '$monto' }
                }
            }
        ]);

        const montoTotalCobros = cobrosResult[0]?.montoTotalCobros || 0;

        // Estadísticas de usuarios
        const totalUsuarios = await Usuario.countDocuments();
        const usuariosActivos = await Usuario.countDocuments({ activo: true });

        const reporte = {
            periodo: {
                fechaInicio: fechaInicio.toISOString().split('T')[0],
                fechaFin: fechaFin.toISOString().split('T')[0]
            },
            clientes: {
                total: totalClientes,
                nuevos: clientesNuevos,
                activos: clientesActivos,
                inactivos: totalClientes - clientesActivos
            },
            prestamos: {
                total: totalPrestamos,
                nuevos: prestamosNuevos,
                activos: prestamosActivos,
                pagados: prestamosPagados,
                enMora: prestamosMora,
                montoTotal: montos.montoTotal,
                saldoPendiente: montos.saldoPendienteTotal
            },
            cobros: {
                total: totalCobros,
                delPeriodo: cobrosDelPeriodo,
                montoTotalCobrado: montoTotalCobros
            },
            usuarios: {
                total: totalUsuarios,
                activos: usuariosActivos,
                inactivos: totalUsuarios - usuariosActivos
            },
            rendimiento: {
                tasaCobranza: montos.montoTotal > 0 ? (montoTotalCobros / montos.montoTotal * 100) : 0,
                eficienciaCobro: prestamosActivos > 0 ? (prestamosPagados / (prestamosActivos + prestamosPagados) * 100) : 0
            }
        };

        res.json({
            success: true,
            data: reporte
        });
    } catch (error) {
        next(error);
    }
});

// Reporte de cobradores
router.get('/cobradores', auth, authorize('admin', 'gerente'), [
    query('fechaInicio').optional().isISO8601().withMessage('Fecha inicio inválida'),
    query('fechaFin').optional().isISO8601().withMessage('Fecha fin inválida'),
    query('cobrador').optional().isMongoId().withMessage('ID de cobrador inválido')
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

        const fechaInicio = req.query.fechaInicio ? new Date(req.query.fechaInicio) : new Date(new Date().getFullYear(), 0, 1);
        const fechaFin = req.query.fechaFin ? new Date(req.query.fechaFin) : new Date();

        const matchStage = {
            createdAt: {
                $gte: fechaInicio,
                $lte: fechaFin
            }
        };

        if (req.query.cobrador) {
            matchStage.cobrador = require('mongoose').Types.ObjectId(req.query.cobrador);
        }

        const reporteCobradores = await Cobro.aggregate([
            { $match: matchStage },
            {
                $lookup: {
                    from: 'usuarios',
                    localField: 'cobrador',
                    foreignField: '_id',
                    as: 'cobradorInfo'
                }
            },
            { $unwind: '$cobradorInfo' },
            {
                $group: {
                    _id: '$cobrador',
                    nombre: { $first: '$cobradorInfo.nombre' },
                    email: { $first: '$cobradorInfo.email' },
                    totalCobros: { $sum: 1 },
                    montoTotalCobrado: { $sum: '$monto' },
                    promedioCobroPorDia: { $avg: '$monto' }
                }
            },
            { $sort: { montoTotalCobrado: -1 } }
        ]);

        // Obtener también estadísticas de préstamos por cobrador
        const prestamosCobradores = await Prestamo.aggregate([
            {
                $lookup: {
                    from: 'usuarios',
                    localField: 'cobrador',
                    foreignField: '_id',
                    as: 'cobradorInfo'
                }
            },
            { $unwind: { path: '$cobradorInfo', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: '$cobrador',
                    nombre: { $first: '$cobradorInfo.nombre' },
                    totalPrestamos: { $sum: 1 },
                    prestamosActivos: {
                        $sum: { $cond: [{ $eq: ['$estado', 'activo'] }, 1, 0] }
                    },
                    prestamosPagados: {
                        $sum: { $cond: [{ $eq: ['$estado', 'pagado'] }, 1, 0] }
                    },
                    prestamosMora: {
                        $sum: { $cond: [{ $eq: ['$estado', 'mora'] }, 1, 0] }
                    },
                    montoTotalPrestamos: { $sum: '$monto' },
                    saldoPendienteTotal: { $sum: '$saldoPendiente' }
                }
            }
        ]);

        // Combinar datos
        const reporte = reporteCobradores.map(cobrador => {
            const prestamoData = prestamosCobradores.find(p => 
                p._id && p._id.toString() === cobrador._id.toString()
            ) || {};

            return {
                ...cobrador,
                totalPrestamos: prestamoData.totalPrestamos || 0,
                prestamosActivos: prestamoData.prestamosActivos || 0,
                prestamosPagados: prestamoData.prestamosPagados || 0,
                prestamosMora: prestamoData.prestamosMora || 0,
                montoTotalPrestamos: prestamoData.montoTotalPrestamos || 0,
                saldoPendienteTotal: prestamoData.saldoPendienteTotal || 0,
                eficienciaCobro: prestamoData.totalPrestamos > 0 ? 
                    (prestamoData.prestamosPagados / prestamoData.totalPrestamos * 100) : 0
            };
        });

        res.json({
            success: true,
            data: {
                periodo: {
                    fechaInicio: fechaInicio.toISOString().split('T')[0],
                    fechaFin: fechaFin.toISOString().split('T')[0]
                },
                cobradores: reporte
            }
        });
    } catch (error) {
        next(error);
    }
});

// Reporte de mora
router.get('/mora', auth, authorize('admin', 'gerente'), async (req, res, next) => {
    try {
        const fechaActual = new Date();
        
        // Préstamos en mora
        const prestamosMora = await Prestamo.find({ estado: 'mora' })
            .populate('cliente', 'nombre cedula telefono direccion')
            .populate('cobrador', 'nombre email telefono')
            .sort({ fechaVencimiento: 1 });

        // Estadísticas de mora por zona
        const moraPorZona = await Prestamo.aggregate([
            { $match: { estado: 'mora' } },
            {
                $lookup: {
                    from: 'clientes',
                    localField: 'cliente',
                    foreignField: '_id',
                    as: 'clienteInfo'
                }
            },
            { $unwind: '$clienteInfo' },
            {
                $group: {
                    _id: '$clienteInfo.zona',
                    totalPrestamos: { $sum: 1 },
                    montoTotal: { $sum: '$saldoPendiente' }
                }
            },
            { $sort: { montoTotal: -1 } }
        ]);

        // Antiguedad de mora
        const moraConAntiguedad = prestamosMora.map(prestamo => {
            const diasMora = Math.floor((fechaActual - new Date(prestamo.fechaVencimiento)) / (1000 * 60 * 60 * 24));
            return {
                ...prestamo.toObject(),
                diasMora
            };
        });

        const moraResumen = {
            total: prestamosMora.length,
            montoTotal: prestamosMora.reduce((sum, p) => sum + p.saldoPendiente, 0),
            por0a30Dias: moraConAntiguedad.filter(p => p.diasMora <= 30).length,
            por31a60Dias: moraConAntiguedad.filter(p => p.diasMora > 30 && p.diasMora <= 60).length,
            por61a90Dias: moraConAntiguedad.filter(p => p.diasMora > 60 && p.diasMora <= 90).length,
            masDe90Dias: moraConAntiguedad.filter(p => p.diasMora > 90).length
        };

        res.json({
            success: true,
            data: {
                resumen: moraResumen,
                prestamos: moraConAntiguedad,
                porZona: moraPorZona
            }
        });
    } catch (error) {
        next(error);
    }
});

// Reporte financiero
router.get('/financiero', auth, authorize('admin', 'gerente'), [
    query('fechaInicio').optional().isISO8601().withMessage('Fecha inicio inválida'),
    query('fechaFin').optional().isISO8601().withMessage('Fecha fin inválida')
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

        const fechaInicio = req.query.fechaInicio ? new Date(req.query.fechaInicio) : new Date(new Date().getFullYear(), 0, 1);
        const fechaFin = req.query.fechaFin ? new Date(req.query.fechaFin) : new Date();

        // Ingresos por cobros
        const ingresos = await Cobro.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: fechaInicio,
                        $lte: fechaFin
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m", date: "$createdAt" }
                    },
                    totalCobros: { $sum: '$monto' },
                    numeroCobros: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Préstamos otorgados
        const prestamosOtorgados = await Prestamo.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: fechaInicio,
                        $lte: fechaFin
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m", date: "$createdAt" }
                    },
                    totalPrestado: { $sum: '$monto' },
                    numeroPrestamos: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Cartera total
        const carteraTotal = await Prestamo.aggregate([
            {
                $group: {
                    _id: null,
                    totalCartera: { $sum: '$monto' },
                    carteraVigente: {
                        $sum: {
                            $cond: [{ $eq: ['$estado', 'activo'] }, '$saldoPendiente', 0]
                        }
                    },
                    carteraMora: {
                        $sum: {
                            $cond: [{ $eq: ['$estado', 'mora'] }, '$saldoPendiente', 0]
                        }
                    }
                }
            }
        ]);

        const cartera = carteraTotal[0] || { totalCartera: 0, carteraVigente: 0, carteraMora: 0 };

        res.json({
            success: true,
            data: {
                periodo: {
                    fechaInicio: fechaInicio.toISOString().split('T')[0],
                    fechaFin: fechaFin.toISOString().split('T')[0]
                },
                ingresosMensuales: ingresos,
                prestamosMensuales: prestamosOtorgados,
                cartera: {
                    total: cartera.totalCartera,
                    vigente: cartera.carteraVigente,
                    mora: cartera.carteraMora,
                    porcentajeMora: cartera.totalCartera > 0 ? 
                        (cartera.carteraMora / cartera.totalCartera * 100) : 0
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;