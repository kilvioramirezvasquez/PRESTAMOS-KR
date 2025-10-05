const fs = require('fs');
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const MONGO_URI = 'mongodb://localhost:27017/prestamos';

// Datos completos del sistema anterior (desde prestamos.sql)
const clientesAntiguos = [
  { id: 1, name: 'Fermin Enrique Cruz Santana', email: ' ', telefono: '8098340218', direccion: 'Calle Mauricio Baez #47', cedula: '02600856443', tel2: '8098340218', status: 1 },
  { id: 2, name: 'William De Jesus Rojas Perez', email: '', telefono: '829-843-6456', direccion: 'Calle 1ra. Ens. Maria Rubio', cedula: '026-0103365-3', tel2: '829-843-6456', status: 1 },
  { id: 3, name: 'Luis Emilio Cordero Santana', email: '', telefono: '829-850-4748', direccion: '', cedula: '001-0273050-4', tel2: '', status: 1 },
  { id: 4, name: 'Irma Doris Sanchez Cayetano', email: '', telefono: '809-397-5059', direccion: 'Calle 4ta. #75', cedula: '026-0055805-6', tel2: '', status: 1 },
  { id: 5, name: 'Luis De La Rosa', email: ' ', telefono: '8294222337', direccion: 'Ruta Piedra Linda ', cedula: '02601144849', tel2: '', status: 1 },
  { id: 6, name: 'Isabel Carreras Santana', email: ' ', telefono: '8094130206', direccion: 'Quisqueya Manzana #23', cedula: '02700035369', tel2: '', status: 1 },
  { id: 7, name: 'Joan Manuel Baez', email: ' ', telefono: '8296538519', direccion: 'C Santa Rosa #172 Frente al Julio', cedula: '02600777235', tel2: '', status: 1 },
  { id: 8, name: 'Benito Peguero', email: ' ', telefono: '8294598489', direccion: 'Anacaona Barrio York #22', cedula: '02600463075', tel2: '', status: 1 },
  { id: 9, name: 'Pascual Yone Ponceano', email: '', telefono: '8299055855', direccion: 'Ave. Libertad Prox. a Jumbo', cedula: '02301029399', tel2: '', status: 1 },
  { id: 10, name: 'Rafael Disney Medina Feliz', email: '', telefono: '8292122616', direccion: 'C/ Hidrante #7 carretera', cedula: '00104542378', tel2: '', status: 1 },
  { id: 11, name: 'Ramon Antonio Mercedes', email: '', telefono: '8097164338', direccion: 'Mercado Viejo', cedula: '02600266288', tel2: '', status: 1 },
  { id: 12, name: 'Rufino Antonio Alfonso Guzmán', email: ' ', telefono: '8094981277', direccion: 'C/ Juan Pablo #58 La Sabanita', cedula: '02600607762', tel2: '', status: 1 },
  { id: 13, name: 'Alexandra Jose Felix', email: '', telefono: '8094940511', direccion: 'Villa Hermosa C/ Anacaona #51', cedula: '0250029736', tel2: '', status: 1 },
  { id: 14, name: 'Juan Guillermo Razuk', email: '', telefono: '8294537190', direccion: 'Eugenio A. Miranda #102', cedula: '00116192113', tel2: '8097675434', status: 1 },
  { id: 15, name: 'Angela Cespedes Batista', email: '', telefono: '8097856610', direccion: 'Fray Juan De Utrera Esq. Gaston', cedula: '02301499956', tel2: '', status: 1 },
  { id: 16, name: 'Albinely Pineda Beriguete', email: '', telefono: '8095500094', direccion: 'Villa España #14 Calle 2da', cedula: '02600818252', tel2: '8094776408', status: 1 },
  { id: 17, name: 'Caridad De Aza Rodriguez', email: '', telefono: '8099831304', direccion: 'Manzana 23 Casa #61 Quisqueya', cedula: '02600668590', tel2: '', status: 1 },
  { id: 18, name: 'Cristian Rodriguez Taveras', email: '', telefono: '8496205832', direccion: 'Carretera Romana- San Pedro ', cedula: '02601377142', tel2: '', status: 1 },
  { id: 19, name: 'Ubaldo Medina', email: '', telefono: '8099884225', direccion: 'Castillo Marquez #185', cedula: '02600904391', tel2: '', status: 1 },
  { id: 20, name: 'Wilson Abreu Guzman', email: '', telefono: '8299872828', direccion: 'C/ E, San Carlos, #12', cedula: '02600674796', tel2: '', status: 1 },
  { id: 21, name: 'Domingo Paulino Corporan ', email: '', telefono: '8297070160', direccion: 'Casa #8, Pica Pedra', cedula: '02300021074', tel2: '', status: 1 },
  { id: 22, name: 'Juan Ysidro Liriano Diaz', email: '', telefono: '8298030045', direccion: 'Manzana #33 Casa Numero 53, Quisqueya', cedula: '02700072404', tel2: '', status: 1 },
  { id: 23, name: 'Bartolo Peguero Chalas', email: '', telefono: '8099161520', direccion: 'Villa Caoba C/17', cedula: '02600732065', tel2: '8295299766', status: 1 },
  { id: 24, name: 'Francisco Silvestre', email: '', telefono: '8095044570', direccion: 'Don Juan 1, Carretera Vieja ', cedula: '02500223876', tel2: '8094592621', status: 1 },
  { id: 25, name: 'Margarito Inirio Laureano', email: '', telefono: '8299741641', direccion: 'C/ Principal, Frente al Mercado', cedula: '02600689521', tel2: '8496509712', status: 1 },
  { id: 26, name: 'Juan Alberto Pula Pache', email: '', telefono: '8295316767', direccion: 'Km 2 1/2 Carretera Romana-San Pedro ', cedula: '02600802363', tel2: '', status: 1 },
  { id: 27, name: 'Norma Cresencia Sanchez', email: '', telefono: '8294597466', direccion: 'C/ Francisco Richiez #123 Rio Salado', cedula: '02600485482', tel2: '', status: 1 },
  { id: 28, name: 'Catalina Nuñez', email: '', telefono: '8293650400', direccion: 'C/ 2da #38, Benjamin', cedula: '02800666212', tel2: '', status: 1 },
  { id: 29, name: 'Gilberto Jose Bartolo Peguero', email: '', telefono: '8492643036', direccion: 'C/ Los Cristianos', cedula: '02601271212', tel2: '', status: 1 },
  { id: 30, name: 'Lisbety Meity Cedano Paulino', email: '', telefono: '8292189047', direccion: 'C/ Concepcion Bona Esq. Padre Abreu', cedula: '02800957231', tel2: '8097467621', status: 1 },
  { id: 31, name: 'Indhira Maria Beras Wilson', email: '', telefono: '8498821101', direccion: 'C/ D, #56, Sector Savica (Alquilda) 2', cedula: '02600869750', tel2: '8299893697', status: 1 },
  { id: 32, name: 'Yenny Deomaris Perez Medrano', email: '', telefono: '8095565156', direccion: 'Edificio Luis Chicho Apto 2 Don Juan', cedula: '02600011171', tel2: '8092722113', status: 1 },
  { id: 33, name: 'Victor Charles', email: ' ', telefono: '8098532365', direccion: 'Hector P. Quezada #334', cedula: '02600889196', tel2: '8093592295', status: 1 },
  { id: 34, name: 'Elina Mercedes', email: '', telefono: '8095508724', direccion: 'C/ 2da Urb. Don Juan', cedula: '02600513390', tel2: '', status: 1 },
  { id: 35, name: 'Wilquin Leon Franco', email: '', telefono: '8093776674', direccion: 'Apto. de Pepe 3ra Planta Cerca', cedula: '02601161066', tel2: '8094887307', status: 1 },
  { id: 36, name: 'Orlando Radhames Abreu', email: '', telefono: '8293327075', direccion: 'Calle Rene Gil #5', cedula: '02600565523', tel2: '', status: 1 },
  { id: 37, name: 'Mauricio Beriguete', email: '', telefono: '8094849306', direccion: 'C/ Enrriquillo #33', cedula: '00118829332', tel2: '', status: 1 },
  { id: 38, name: 'Maritza Avila Abad', email: '', telefono: '8294573084', direccion: 'Pedro A. Lluberes', cedula: '02600689091', tel2: '8094025423', status: 1 },
  { id: 39, name: 'Camilo Ludger', email: '', telefono: '8099933523', direccion: 'Anin Abel Hasbum #16', cedula: '02600202929', tel2: '', status: 1 },
  { id: 40, name: 'Candy Annabel Inirio', email: '', telefono: '8299019513', direccion: 'Carretera Vieja Roman-San Pedrp', cedula: '02600790675', tel2: '8292274969', status: 1 },
  { id: 41, name: 'Yolanda Santana Perez', email: '', telefono: '8296895490', direccion: 'Av. Padre Abreu Esq. Respaldo', cedula: '02600896498', tel2: '8093518434', status: 1 },
  { id: 42, name: 'Nury Laureano Guerrero', email: '', telefono: '829-246-5465', direccion: 'CALLE GREGORIO LUPERON', cedula: '02600138925', tel2: '', status: 1 },
  { id: 43, name: 'Niurk Maria Silvestre Delgado', email: '', telefono: '8096671944', direccion: '', cedula: '02300153901', tel2: '', status: 1 },
  { id: 44, name: 'Emeli Batista', email: '', telefono: '8098379994', direccion: 'Calle D #32 Urbanización Don Juan', cedula: '40238464115', tel2: '', status: 1 },
  { id: 45, name: 'Diana Faulkner Rodriguez', email: '', telefono: '8492141164', direccion: 'Calle Gregorio Luperón #159', cedula: '40214164564', tel2: '', status: 1 },
  { id: 46, name: 'Lucila Cedano', email: '', telefono: '8296615054', direccion: 'Calle Santa Rosa', cedula: '02600790451', tel2: '', status: 1 },
  { id: 47, name: 'Franchesca Veronica Perez Valdez', email: '', telefono: '8292586796', direccion: 'Calle #7 Villa Pereyra', cedula: '02601258136', tel2: '', status: 1 },
  { id: 48, name: 'Manuel Antonio De Jesus Woss Ferreras', email: '', telefono: '8299679458', direccion: 'Calle 1ra. Villa Princesa #7', cedula: '02600784116', tel2: '', status: 1 },
  { id: 49, name: 'Victor Manuel Severino Mariano', email: '', telefono: '8493561471', direccion: 'Parada Habichuelas Ruta Villa Hermosa', cedula: '02800725935', tel2: '', status: 1 },
  { id: 50, name: 'Jose Ramon Valdez Morales', email: '', telefono: '8297554243', direccion: 'Calle Principal #75, Sector Picapiedra', cedula: '02600494278', tel2: '', status: 1 },
  { id: 51, name: 'Mary Leonardo Matos', email: '', telefono: '8296685021', direccion: 'Calle Principal, Sector Villa Hermosa Frente Al Garaje', cedula: '29500026231', tel2: '8494016092', status: 1 },
  { id: 52, name: 'Jose Ramon Fulgencio Lombert', email: '', telefono: '8095568130', direccion: 'Calle B #37, San Carlos', cedula: '02600948042', tel2: '8299018068', status: 1 },
  { id: 53, name: 'Jose Jean', email: ' ', telefono: '8099747256', direccion: 'Don Juan II', cedula: '02800313237', tel2: '', status: 1 },
  { id: 54, name: 'Miguel Antonio Alicea Pichardo', email: '', telefono: '8297956528', direccion: 'Calle 3era. #216 Barrio George', cedula: '10300070306', tel2: '', status: 1 },
  { id: 55, name: 'Dalbin Isidro Guzman Garcia', email: '', telefono: '8092604218', direccion: 'calle 2da #01 Caleta', cedula: '02600551580', tel2: '', status: 1 }
];

const cobradoresAntiguos = [
  {
    id: 1,
    nombre: 'JUAN BATISTA',
    direccion: '',
    telefono: '8494051197',
    cedula: '',
    usuario: 'juan',
    password: '1234',
    email: '',
    status: 1
  },
  {
    id: 2,
    nombre: 'miguel',
    direccion: 'los alcarrizos',
    telefono: '8888888888',
    cedula: '88888888888',
    usuario: 'miguel',
    password: '1234',
    email: '',
    status: 1
  }
];

// Préstamos del sistema anterior (algunos ejemplos)
const prestamosAntiguos = [
  {
    id: 1,
    acreedor_id: 1,
    fecha_inicio: new Date('2020-03-11'),
    dias_pago: 7,
    monto: 20000,
    status: 0,
    saldado: 1,
    nota: '',
    monto_cuotas: 2000,
    total_cuotas: 13,
    porc_interes: 0,
    porc_mora: 0,
    codigo: 'B71',
    tipo: 1,
    garantias: 'null'
  },
  {
    id: 2,
    acreedor_id: 2,
    fecha_inicio: new Date('2020-03-11'),
    dias_pago: 7,
    monto: 25400,
    status: 0,
    saldado: 1,
    nota: '',
    monto_cuotas: 1954,
    total_cuotas: 13,
    porc_interes: 0,
    porc_mora: 0,
    codigo: 'N52',
    tipo: 1,
    garantias: 'null'
  },
  {
    id: 3,
    acreedor_id: 3,
    fecha_inicio: new Date('2020-01-15'),
    dias_pago: 7,
    monto: 40000,
    status: 0,
    saldado: 0,
    nota: '',
    monto_cuotas: 4000,
    total_cuotas: 13,
    porc_interes: 0,
    porc_mora: 0,
    codigo: 'L03',
    tipo: 1,
    garantias: 'null'
  }
];

async function migrarDatos() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectado a MongoDB');
    
    const db = mongoose.connection.db;
    
    // 1. Limpiar datos existentes
    console.log('\n🧹 Limpiando datos existentes...');
    await db.collection('clientes').deleteMany({});
    await db.collection('prestamos').deleteMany({});
    await db.collection('cobros').deleteMany({});
    await db.collection('cobradores').deleteMany({});
    
    console.log('✅ Datos limpiados exitosamente');
    
    // 2. Migrar clientes
    console.log('\n👥 Migrando clientes...');
    const clientesNuevos = clientesAntiguos.map(cliente => ({
      nombre: cliente.name,
      email: cliente.email || '',
      telefono: cliente.telefono,
      telefono2: cliente.tel2 || '',
      cedula: cliente.cedula,
      direccion: cliente.direccion || '',
      referencias: '',
      activo: cliente.status === 1,
      fechaRegistro: new Date(),
      clienteId: cliente.id // Mantener ID original para referencias
    }));
    
    if (clientesNuevos.length > 0) {
      await db.collection('clientes').insertMany(clientesNuevos);
      console.log(`✅ ${clientesNuevos.length} clientes migrados`);
    }
    
    // 3. Migrar cobradores
    console.log('\n🚴 Migrando cobradores...');
    const cobradoresNuevos = [];
    
    for (const cobrador of cobradoresAntiguos) {
      const hashedPassword = await bcryptjs.hash(cobrador.password, 10);
      
      cobradoresNuevos.push({
        nombre: cobrador.nombre,
        telefono: cobrador.telefono,
        cedula: cobrador.cedula || '',
        direccion: cobrador.direccion || '',
        email: cobrador.email || '',
        usuario: cobrador.usuario,
        password: hashedPassword,
        activo: cobrador.status === 1,
        fechaRegistro: new Date(),
        cobradorId: cobrador.id // Mantener ID original para referencias
      });
    }
    
    if (cobradoresNuevos.length > 0) {
      await db.collection('cobradores').insertMany(cobradoresNuevos);
      console.log(`✅ ${cobradoresNuevos.length} cobradores migrados`);
    }
    
    // 4. Migrar préstamos
    console.log('\n💰 Migrando préstamos...');
    const prestamosNuevos = [];
    
    for (const prestamo of prestamosAntiguos) {
      // Buscar cliente por ID original
      const cliente = await db.collection('clientes').findOne({ clienteId: prestamo.acreedor_id });
      
      if (cliente) {
        // Mapear tipo de préstamo
        let tipoPrestamo = 'Amortizado';
        switch (prestamo.tipo) {
          case 1:
            tipoPrestamo = 'Amortizado';
            break;
          case 2:
            tipoPrestamo = 'Capitalizado';
            break;
          case 3:
            tipoPrestamo = 'Capitalizado Fijo';
            break;
          case 4:
            tipoPrestamo = 'Capitalizado Fijo con Cuotas';
            break;
        }
        
        // Determinar frecuencia de pago basada en días
        let frecuenciaPago = 'Semanal';
        switch (prestamo.dias_pago) {
          case 1:
            frecuenciaPago = 'Diario';
            break;
          case 7:
            frecuenciaPago = 'Semanal';
            break;
          case 14:
            frecuenciaPago = 'Quincenal';
            break;
          case 30:
            frecuenciaPago = 'Mensual';
            break;
        }
        
        prestamosNuevos.push({
          clienteId: cliente._id,
          monto: prestamo.monto,
          tasaInteres: prestamo.porc_interes || 20, // Tasa por defecto si no hay
          tipoPrestamo: tipoPrestamo,
          frecuenciaPago: frecuenciaPago,
          numeroRenovaciones: 0,
          fechaInicio: prestamo.fecha_inicio,
          fechaVencimiento: new Date(prestamo.fecha_inicio.getTime() + (prestamo.total_cuotas * prestamo.dias_pago * 24 * 60 * 60 * 1000)),
          montoCuota: prestamo.monto_cuotas,
          totalCuotas: prestamo.total_cuotas,
          cuotasPagadas: prestamo.saldado === 1 ? prestamo.total_cuotas : 0,
          estado: prestamo.saldado === 1 ? 'Completado' : 'Activo',
          saldoPendiente: prestamo.saldado === 1 ? 0 : prestamo.monto,
          garantias: prestamo.garantias !== 'null' ? prestamo.garantias : '',
          observaciones: prestamo.nota || '',
          fechaCreacion: new Date(),
          prestamoId: prestamo.id // Mantener ID original para referencias
        });
      }
    }
    
    if (prestamosNuevos.length > 0) {
      await db.collection('prestamos').insertMany(prestamosNuevos);
      console.log(`✅ ${prestamosNuevos.length} préstamos migrados`);
    }
    
    // 5. Generar cobros para préstamos activos
    console.log('\n📋 Generando cobros para préstamos activos...');
    const prestamosActivos = await db.collection('prestamos').find({ estado: 'Activo' }).toArray();
    const cobrosNuevos = [];
    
    for (const prestamo of prestamosActivos) {
      const cliente = await db.collection('clientes').findOne({ _id: prestamo.clienteId });
      
      if (cliente) {
        // Generar cobros pendientes basados en las cuotas
        const cuotasPendientes = prestamo.totalCuotas - prestamo.cuotasPagadas;
        
        for (let i = 1; i <= cuotasPendientes; i++) {
          const fechaCobro = new Date(prestamo.fechaInicio);
          
          // Calcular fecha de cobro basada en frecuencia
          let diasSumar = 0;
          switch (prestamo.frecuenciaPago) {
            case 'Diario':
              diasSumar = (prestamo.cuotasPagadas + i) * 1;
              break;
            case 'Semanal':
              diasSumar = (prestamo.cuotasPagadas + i) * 7;
              break;
            case 'Quincenal':
              diasSumar = (prestamo.cuotasPagadas + i) * 14;
              break;
            case 'Mensual':
              diasSumar = (prestamo.cuotasPagadas + i) * 30;
              break;
          }
          
          fechaCobro.setDate(fechaCobro.getDate() + diasSumar);
          
          cobrosNuevos.push({
            prestamoId: prestamo._id,
            clienteId: prestamo.clienteId,
            fechaCobro: fechaCobro,
            montoCobro: prestamo.montoCuota,
            montoInteres: Math.round(prestamo.montoCuota * 0.1), // 10% de interés por defecto
            montoTotal: prestamo.montoCuota + Math.round(prestamo.montoCuota * 0.1),
            numeroCuota: prestamo.cuotasPagadas + i,
            estado: fechaCobro <= new Date() ? 'Vencido' : 'Pendiente',
            fechaCreacion: new Date(),
            observaciones: ''
          });
        }
      }
    }
    
    if (cobrosNuevos.length > 0) {
      await db.collection('cobros').insertMany(cobrosNuevos);
      console.log(`✅ ${cobrosNuevos.length} cobros generados`);
    }
    
    // 6. Crear usuario administrador del sistema anterior
    console.log('\n👤 Creando usuario administrador...');
    const hashedAdminPassword = await bcryptjs.hash('741741', 10);
    
    await db.collection('usuarios').deleteMany({});
    await db.collection('usuarios').insertOne({
      email: 'admin',
      password: hashedAdminPassword,
      nombre: 'Administrador',
      rol: 'admin',
      fechaCreacion: new Date(),
      activo: true
    });
    
    console.log('✅ Usuario administrador creado');
    
    // 7. Mostrar resumen de migración
    console.log('\n📊 RESUMEN DE MIGRACIÓN:');
    console.log('='.repeat(50));
    
    const totalClientes = await db.collection('clientes').countDocuments();
    const totalCobradores = await db.collection('cobradores').countDocuments();
    const totalPrestamos = await db.collection('prestamos').countDocuments();
    const totalCobros = await db.collection('cobros').countDocuments();
    const totalUsuarios = await db.collection('usuarios').countDocuments();
    
    console.log(`👥 Clientes: ${totalClientes}`);
    console.log(`🚴 Cobradores: ${totalCobradores}`);
    console.log(`💰 Préstamos: ${totalPrestamos}`);
    console.log(`📋 Cobros: ${totalCobros}`);
    console.log(`👤 Usuarios: ${totalUsuarios}`);
    
    console.log('\n✅ ¡MIGRACIÓN COMPLETADA EXITOSAMENTE!');
    console.log('🔑 Usuario Admin: admin');
    console.log('🔑 Contraseña Admin: 741741');
    
    if (totalCobradores > 0) {
      console.log('\n🚴 Cobradores disponibles:');
      const cobradores = await db.collection('cobradores').find({}, { projection: { nombre: 1, usuario: 1 } }).toArray();
      cobradores.forEach(cobrador => {
        console.log(`   - ${cobrador.nombre} (usuario: ${cobrador.usuario})`);
      });
      console.log('🔑 Contraseña para todos los cobradores: 1234');
    }
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

// Ejecutar migración
console.log('🚀 Iniciando migración de datos del sistema anterior...');
console.log('⚠️  ADVERTENCIA: Esto eliminará todos los datos actuales');
console.log('');

migrarDatos().catch(console.error);