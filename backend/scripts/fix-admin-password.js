const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Conexión a MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/prestamos');
        console.log('MongoDB conectado');
    } catch (error) {
        console.error('Error conectando MongoDB:', error);
        process.exit(1);
    }
};

// Esquema de Usuario
const usuarioSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    nombre: { type: String, required: true },
    rol: { type: String, enum: ['admin', 'cobrador'], default: 'cobrador' },
    activo: { type: Boolean, default: true },
    fechaCreacion: { type: Date, default: Date.now }
});

const Usuario = mongoose.model('Usuario', usuarioSchema);

const updateAdminPassword = async () => {
    await connectDB();
    
    try {
        // Buscar el usuario admin
        let admin = await Usuario.findOne({ email: 'admin' });
        
        if (!admin) {
            console.log('Usuario admin no encontrado, creando...');
            // Si no existe, crear el usuario admin
            const hashedPassword = await bcrypt.hash('741741', 10);
            admin = new Usuario({
                email: 'admin',
                password: hashedPassword,
                nombre: 'Administrador',
                rol: 'admin',
                activo: true
            });
            await admin.save();
            console.log('Usuario admin creado exitosamente');
        } else {
            // Si existe, actualizar la contraseña
            const hashedPassword = await bcrypt.hash('741741', 10);
            admin.password = hashedPassword;
            await admin.save();
            console.log('Contraseña del admin actualizada exitosamente');
        }
        
        // Verificar que la contraseña funcione
        const passwordMatch = await bcrypt.compare('741741', admin.password);
        console.log('Verificación de contraseña:', passwordMatch ? 'OK' : 'ERROR');
        
        console.log('Usuario admin actualizado:');
        console.log('- Email:', admin.email);
        console.log('- Nombre:', admin.nombre);
        console.log('- Rol:', admin.rol);
        console.log('- Activo:', admin.activo);
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Conexión cerrada');
    }
};

updateAdminPassword();