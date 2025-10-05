const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/sistema-prestamos')
  .then(async () => {
    console.log('Conectado a MongoDB');
    
    // Hashear la nueva contraseña
    const newPassword = 'miguel';
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Actualizar el usuario miguel
    const result = await mongoose.connection.db.collection('usuarios').updateOne(
      { email: 'miguel@demo.com' },
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date()
        } 
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log('✅ Contraseña de miguel actualizada exitosamente');
      console.log('📧 Email: miguel@demo.com');
      console.log('🔑 Contraseña: miguel');
    } else {
      console.log('❌ No se pudo actualizar la contraseña');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
