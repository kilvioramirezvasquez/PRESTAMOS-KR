// Script para poblar datos de clientes del sistema anterior en MongoDB para testing
const mongoose = require('mongoose');
const Cliente = require('../models/Cliente');

// Datos de ejemplo extraídos del sistema anterior (muestra)
const clientesAnteriores = [
  {
    nombre: 'Fermin Enrique Cruz Santana',
    cedula: '026-0085644-3', 
    telefono: '809-834-0218',
    direccion: 'Calle Mauricio Baez #47',
    ocupacion: 'Ebanista',
    estado: 'activo'
  },
  {
    nombre: 'William De Jesus Rojas Perez',
    cedula: '026-0103365-3',
    telefono: '829-843-6456', 
    direccion: 'Calle 1ra. Ens. Maria Rubio',
    estado: 'activo'
  },
  {
    nombre: 'Luis Emilio Cordero Santana',
    cedula: '001-0273050-4',
    telefono: '829-850-4748',
    direccion: '',
    estado: 'activo'
  },
  {
    nombre: 'Irma Doris Sanchez Cayetano',
    cedula: '026-0055805-6',
    telefono: '809-397-5059',
    direccion: 'Calle 4ta. #75',
    estado: 'activo'
  },
  {
    nombre: 'Luis De La Rosa',
    cedula: '026-0114484-9',
    telefono: '829-422-2337',
    direccion: 'Ruta Piedra Linda',
    estado: 'activo'
  },
  {
    nombre: 'Isabel Carreras Santana',
    cedula: '027-0003536-9',
    telefono: '809-413-0206', 
    direccion: 'Quisqueya Manzana #23',
    estado: 'activo'
  },
  {
    nombre: 'Joan Manuel Baez',
    cedula: '026-0077723-5',
    telefono: '829-653-8519',
    direccion: 'C Santa Rosa #172 Frente al Julio',
    estado: 'activo'
  },
  {
    nombre: 'Benito Peguero',
    cedula: '026-0046307-5',
    telefono: '829-459-8489',
    direccion: 'Anacaona Barrio York #22',
    estado: 'activo'
  },
  {
    nombre: 'Kilvio Ramirez Vasquez', // Tu nombre para pruebas
    cedula: '001-1333072-4',
    telefono: '829-000-0000',
    direccion: 'Dirección de Prueba',
    estado: 'activo'
  }
];

async function poblarDatosPrueba() {
  try {
    await mongoose.connect('mongodb://localhost:27017/prestamos');
    console.log('🔗 Conectado a MongoDB');

    // Limpiar datos existentes de prueba
    await Cliente.deleteMany({ 
      cedula: { $in: clientesAnteriores.map(c => c.cedula) }
    });

    // Crear clientes de prueba
    const clientesCreados = [];
    for (const clienteData of clientesAnteriores) {
      const [nombre, ...apellidos] = clienteData.nombre.split(' ');
      
      const cliente = new Cliente({
        nombre: nombre,
        apellidos: apellidos.join(' '),
        cedula: clienteData.cedula,
        telefono: clienteData.telefono,
        direccion: clienteData.direccion,
        ocupacion: clienteData.ocupacion || '',
        estado: clienteData.estado,
        tipoCliente: 'personal',
        // Metadatos para indicar que viene del sistema anterior
        datosVerificados: true,
        fuenteVerificacion: 'sistema_anterior',
        fechaVerificacion: new Date(),
        notas: 'Migrado del sistema anterior para pruebas'
      });

      await cliente.save();
      clientesCreados.push(cliente);
    }

    console.log(`✅ ${clientesCreados.length} clientes de prueba creados exitosamente`);
    
    // Mostrar algunos ejemplos
    console.log('\n📋 Cédulas disponibles para prueba:');
    clientesCreados.forEach((cliente, index) => {
      console.log(`${index + 1}. ${cliente.cedula} - ${cliente.nombre} ${cliente.apellidos}`);
    });

    console.log('\n🧪 Para probar la consulta, usa una de estas cédulas en el formulario');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  poblarDatosPrueba();
}

module.exports = { poblarDatosPrueba, clientesAnteriores };