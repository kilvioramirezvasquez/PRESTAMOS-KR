const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');

// Configuración de MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sistema-prestamos';

async function updateAdminPassword() {
    try {
        // Conectar a MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB');

        // Hashear la nueva contraseña
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash('741741', saltRounds);

        // Buscar y actualizar el usuario admin
        const result = await Usuario.updateOne(
            { email: 'admin@demo.com' },
            { 
                password: hashedPassword,
                updatedAt: new Date()
            }
        );

        if (result.matchedCount === 0) {
            console.log('❌ Usuario admin no encontrado');
            
            // Crear el usuario admin si no existe
            const nuevoAdmin = new Usuario({
                nombre: 'Administrador Sistema',
                email: 'admin@demo.com',
                password: hashedPassword,
                rol: 'admin',
                activo: true
            });

            await nuevoAdmin.save();
            console.log('✅ Usuario admin creado con contraseña 741741');
        } else {
            console.log('✅ Contraseña del admin actualizada a: 741741');
        }

        // Verificar que la contraseña funciona
        const adminUser = await Usuario.findOne({ email: 'admin@demo.com' });
        const passwordMatch = await bcrypt.compare('741741', adminUser.password);
        
        if (passwordMatch) {
            console.log('✅ Verificación exitosa - La contraseña funciona correctamente');
        } else {
            console.log('❌ Error en la verificación de contraseña');
        }

        console.log('\n🔑 CREDENCIALES ACTUALIZADAS:');
        console.log('Email: admin@demo.com');
        console.log('Contraseña: 741741');
        console.log('Rol: admin\n');

    } catch (error) {
        console.error('❌ Error actualizando contraseña:', error);
    } finally {
        await mongoose.connection.close();
        console.log('✅ Conexión cerrada');
        process.exit(0);
    }
}

updateAdminPassword();