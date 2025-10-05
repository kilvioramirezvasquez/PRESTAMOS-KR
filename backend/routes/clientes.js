const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const Cliente = require('../models/Cliente');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Obtener todos los clientes con paginación
router.get('/', auth, [
    query('page').optional().isInt({ min: 1 }).withMessage('Página debe ser un número positivo'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite debe estar entre 1 y 100'),
    query('estado').optional().isIn(['activo', 'inactivo', 'mora']).withMessage('Estado inválido')
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
        if (req.query.zona) filter.zona = new RegExp(req.query.zona, 'i');
        if (req.query.search) {
            filter.$or = [
                { nombre: new RegExp(req.query.search, 'i') },
                { cedula: new RegExp(req.query.search, 'i') }
            ];
        }

        // Si es cobrador, solo puede ver sus clientes
        if (req.usuario.rol === 'cobrador') {
            filter.cobrador = req.usuario._id;
        }

        // Usar consulta directa para obtener TODOS los datos migrados
        const db = mongoose.connection.db;
        const total = await db.collection('clientes').countDocuments(filter);
        const clientes = await db.collection('clientes').find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ nombre: 1 })
            .toArray();

        res.json({
            success: true,
            data: clientes,
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

// Buscar cliente por cédula
router.get('/cedula/:cedula', auth, async (req, res, next) => {
    try {
        const { cedula } = req.params;
        
        // Buscar en base de datos local primero
        const db = mongoose.connection.db;
        const cliente = await db.collection('clientes').findOne({ 
            cedula: cedula.replace(/\D/g, '') 
        });

        if (cliente) {
            return res.json({
                success: true,
                data: {
                    nombre: cliente.nombre,
                    foto: cliente.foto || null,
                    telefono: cliente.telefono,
                    email: cliente.email,
                    direccion: cliente.direccion
                },
                source: 'database'
            });
        }

        // Si no existe, buscar en API externa (simulado)
        // Aquí podrías integrar con una API de datos gubernamentales
        const datosExternos = await buscarDatosExternosPorCedula(cedula);
        
        res.json({
            success: true,
            data: datosExternos,
            source: 'external'
        });
    } catch (error) {
        next(error);
    }
});

// Función simulada para buscar datos externos
async function buscarDatosExternosPorCedula(cedula) {
    // Simulación de datos externos - en producción esto vendría de una API real
    const datosFalsos = {
        '40228499204': { nombre: 'Alexander Tavarez Rodriguez', foto: null },
        '02600818252': { nombre: 'Albinely Pineda Beriguete', foto: null },
        '02600192203': { nombre: 'Alejandrina Sanchez', foto: null }
    };
    
    return datosFalsos[cedula] || { nombre: null, foto: null };
}

// Crear nuevo cliente
router.post('/', auth, authorize('admin', 'gerente', 'cobrador'), [
    body('nombre').isLength({ min: 2 }).withMessage('Nombre debe tener al menos 2 caracteres'),
    body('cedula').isLength({ min: 8 }).withMessage('Cédula debe tener al menos 8 caracteres'),
    body('telefono').isMobilePhone().withMessage('Teléfono inválido'),
    body('direccion').optional().isLength({ min: 10 }).withMessage('Dirección debe tener al menos 10 caracteres')
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

        const clienteData = { ...req.body };
        
        // Si es cobrador, asignar automáticamente
        if (req.usuario.rol === 'cobrador') {
            clienteData.cobrador = req.usuario._id;
        }

        const cliente = new Cliente(clienteData);
        await cliente.save();
        
        await cliente.populate('cobrador', 'nombre email');
        
        logger.audit('CLIENT_CREATED', req.usuario._id, { 
            clienteId: cliente._id, 
            cedula: cliente.cedula 
        });

        res.status(201).json({
            success: true,
            message: 'Cliente creado exitosamente',
            data: cliente
        });
    } catch (error) {
        next(error);
    }
});

// Obtener cliente por ID
router.get('/:id', auth, async (req, res, next) => {
    try {
        const cliente = await Cliente.findById(req.params.id).populate('cobrador', 'nombre email');
        
        if (!cliente) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }

        // Si es cobrador, solo puede ver sus clientes
        if (req.usuario.rol === 'cobrador' && 
            cliente.cobrador && 
            cliente.cobrador._id.toString() !== req.usuario._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para ver este cliente'
            });
        }

        res.json({
            success: true,
            data: cliente
        });
    } catch (error) {
        next(error);
    }
});

// Actualizar cliente
router.put('/:id', auth, authorize('admin', 'gerente', 'cobrador'), [
    body('nombre').optional().isLength({ min: 2 }).withMessage('Nombre debe tener al menos 2 caracteres'),
    body('telefono').optional().isMobilePhone().withMessage('Teléfono inválido'),
    body('estado').optional().isIn(['activo', 'inactivo', 'mora']).withMessage('Estado inválido')
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

        const cliente = await Cliente.findById(req.params.id);
        
        if (!cliente) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }

        // Si es cobrador, solo puede actualizar sus clientes
        if (req.usuario.rol === 'cobrador' && 
            cliente.cobrador && 
            cliente.cobrador.toString() !== req.usuario._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para actualizar este cliente'
            });
        }

        Object.assign(cliente, req.body);
        await cliente.save();
        
        await cliente.populate('cobrador', 'nombre email');
        
        logger.audit('CLIENT_UPDATED', req.usuario._id, { 
            clienteId: cliente._id,
            changes: req.body
        });

        res.json({
            success: true,
            message: 'Cliente actualizado exitosamente',
            data: cliente
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
