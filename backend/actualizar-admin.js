const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Usuario = require('./models/Usuario');

async function actualizarAdmin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/prestamos');
    console.log('Conectado a MongoDB');
    
    // Buscar el usuario admin
    const admin = await Usuario.findOne({ email: 'admin' });
    if (!admin) {
      console.log('Usuario admin no encontrado');
      return;
    }
    
    console.log('Usuario admin encontrado:', admin.nombre);
    
    // Generar hash de la nueva contraseña
    const nuevaPassword = '741741';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(nuevaPassword, salt);
    
    // Actualizar la contraseña
    await Usuario.findByIdAndUpdate(admin._id, { 
      password: hashedPassword 
    });
    
    console.log('Contraseña del admin actualizada exitosamente a: 741741');
    
    // Verificar que se puede hacer login
    const adminActualizado = await Usuario.findOne({ email: 'admin' }).select('+password');
    const isMatch = await bcrypt.compare('741741', adminActualizado.password);
    console.log('Verificación de contraseña:', isMatch ? 'CORRECTA' : 'INCORRECTA');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

actualizarAdmin();
