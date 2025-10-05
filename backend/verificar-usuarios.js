const mongoose = require('mongoose');
const Usuario = require('./models/Usuario');

async function verificarUsuarios() {
  try {
    await mongoose.connect('mongodb://localhost:27017/prestamos');
    console.log('Conectado a MongoDB');
    
    const usuarios = await Usuario.find({}).select('nombre email rol activo');
    console.log('Usuarios encontrados:', usuarios);
    
    // Buscar específicamente el admin
    const admin = await Usuario.findOne({ email: 'admin' });
    if (admin) {
      console.log('Usuario admin encontrado:', admin);
    } else {
      console.log('Usuario admin NO encontrado');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

verificarUsuarios();
