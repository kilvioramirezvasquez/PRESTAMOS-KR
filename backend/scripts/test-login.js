const mongoose = require('mongoose');
const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');

async function testLogin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sistema-prestamos');
        
        const usuario = await Usuario.findOne({ email: 'admin' }).select('+password');
        
        if (!usuario || !usuario.activo) {
            console.log('❌ Usuario no encontrado o inactivo');
            return;
        }

        const esPasswordCorrecta = await usuario.compararPassword('741741');
        
        if (!esPasswordCorrecta) {
            console.log('❌ Contraseña incorrecta');
            return;
        }

        // Generar token JWT
        const token = jwt.sign(
            { 
                _id: usuario._id, 
                email: usuario.email, 
                rol: usuario.rol 
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        console.log('✅ Login exitoso!');
        console.log('Token JWT generado:', token.substring(0, 50) + '...');
        console.log('Usuario:', {
            id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol,
            activo: usuario.activo
        });

        await mongoose.disconnect();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        await mongoose.disconnect();
    }
}

testLogin();