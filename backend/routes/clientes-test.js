const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Cliente = require('../models/Cliente');

// Endpoint temporal simple para debug
router.get('/test', auth, async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        
        // Consulta muy simple sin filtros ni ordenamiento
        const clientes = await Cliente.find({}).limit(limit);
        const total = await Cliente.countDocuments({});
        
        res.json({
            success: true,
            data: clientes,
            total: total,
            found: clientes.length
        });

    } catch (error) {
        console.error('Error en endpoint test:', error);
        next(error);
    }
});

module.exports = router;