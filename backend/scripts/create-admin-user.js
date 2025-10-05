const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');

// Configuración de MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sistema-prestamos';

async function createAdminUser() {
    try {
        // Conectar a MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB');

        // No hashear aquí, el modelo lo hará automáticamente
        const plainPassword = '741741';

        // Eliminar usuario admin existente si existe
        await Usuario.deleteMany({ 
            $or: [
                { email: 'admin@demo.com' },
                { email: 'admin' },
                { rol: 'admin' }
            ]
        });

        // Crear el nuevo usuario admin sin @
        const nuevoAdmin = new Usuario({
            nombre: 'Administrador Sistema',
            email: 'admin', // Sin símbolo @
            password: plainPassword, // El modelo lo hasheará automáticamente
            rol: 'admin',
            activo: true,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await nuevoAdmin.save();
        console.log('✅ Usuario admin creado exitosamente');
        console.log('📧 Usuario: admin (sin @)');
        console.log('🔑 Contraseña: 741741');

        // Verificar que el usuario fue creado
        const adminUser = await Usuario.findOne({ email: 'admin' });
        
        if (adminUser) {
            console.log('✅ Verificación exitosa - Usuario creado correctamente');
            console.log('');
            console.log('=== CREDENCIALES DE ACCESO ===');
            console.log('Usuario: admin');
            console.log('Contraseña: 741741');
            console.log('Rol: Administrador');
            console.log('Estado: Activo');
            console.log('=============================');
        } else {
            console.log('❌ Error: Usuario no encontrado después de la creación');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Desconectado de MongoDB');
        process.exit(0);
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    createAdminUser();
}

module.exports = createAdminUser;