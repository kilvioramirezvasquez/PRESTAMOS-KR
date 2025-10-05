const fs = require('fs');
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const MONGO_URI = 'mongodb://localhost:27017/prestamos';

// Datos completos del sistema anterior (desde prestamosDatos.sql)
const clientesCompletos = [
  { id: 1, name: 'kilvio ramirez', email: 'kilvio@codetel.net.do', telefono: '8299288061', direccion: 'villa mella', cedula: '00113330724', tel2: '8092237408', status: 1, user_id: 0 },
  { id: 2, name: 'Hensley Rodriguez', email: 'hensleymrb@hotmail.com', telefono: '8098781197', direccion: '', cedula: '02601420934', tel2: '', status: 1, user_id: 0 },
  { id: 3, name: 'ELISAEL DE LOS SANTOS MERCEDES', email: 'ELISAEL@HOTMAIL.COM', telefono: '8091111111', direccion: '.', cedula: '03104189448', tel2: '8091111111', status: 1, user_id: 0 },
  { id: 4, name: 'ANA BANCA 102', email: '', telefono: '8090000000', direccion: '', cedula: '102', tel2: '', status: 1, user_id: 0 },
  { id: 5, name: 'DE LA ROSA BANCA #102', email: '', telefono: '8090000000', direccion: '', cedula: '00000000000', tel2: '', status: 1, user_id: 0 },
  { id: 6, name: 'YESSICA CRISLENY RODRIGUEZ GOMEZ (PROFESORA)', email: '', telefono: '8295873204', direccion: '', cedula: '02601366038', tel2: '', status: 1, user_id: 0 },
  { id: 7, name: 'PASCUALA MEJIA', email: '', telefono: '8098424134', direccion: '', cedula: '02600498956', tel2: '', status: 1, user_id: 0 },
  { id: 8, name: 'SANTOS MARTINEZ', email: '', telefono: '8099974080', direccion: '', cedula: '00108508581', tel2: '', status: 1, user_id: 0 },
  { id: 9, name: 'ANGELIN HERRERA', email: '', telefono: '8299248469', direccion: '', cedula: '02601282946', tel2: '', status: 1, user_id: 0 },
  { id: 10, name: 'CRISTINA UREÑA', email: '', telefono: '8095098340', direccion: '', cedula: '02600797365', tel2: '', status: 1, user_id: 0 },
  { id: 11, name: 'MARIA ESTELA RODRIGUEZ RODRIGUEZ', email: '', telefono: '8292693666', direccion: '', cedula: '02601316249', tel2: '', status: 1, user_id: 0 },
  { id: 12, name: 'YOHAIRA ROCHE', email: '', telefono: '8293957618', direccion: '', cedula: '00', tel2: '', status: 1, user_id: 0 },
  { id: 13, name: 'ANDERSON URBAEZ', email: '', telefono: '8292575396', direccion: '', cedula: '00105495071', tel2: '', status: 1, user_id: 0 },
  { id: 14, name: 'CLARIBEL SANTANA (VILAL HERMOSA)', email: '', telefono: '8295266950', direccion: '', cedula: '02601093608', tel2: '', status: 1, user_id: 0 },
  { id: 15, name: 'ANYELINA YOKASTA (VILLA HERMOSA) (ANA)', email: '', telefono: '8298433096', direccion: '', cedula: '40222666147', tel2: '', status: 1, user_id: 0 },
  { id: 16, name: 'CAROLIN SANTANA', email: '', telefono: '8097044308', direccion: '', cedula: '02601378157', tel2: '', status: 1, user_id: 0 },
  { id: 17, name: 'CAROLINA #32', email: '', telefono: '809', direccion: '', cedula: '00', tel2: '', status: 1, user_id: 0 },
  { id: 18, name: 'ADRIAN ENCARNACION', email: '', telefono: '8097292853', direccion: '', cedula: '40212798124', tel2: '', status: 1, user_id: 0 },
  { id: 19, name: 'ESPOSO CAROLINA', email: '', telefono: '809', direccion: '', cedula: '00', tel2: '', status: 1, user_id: 0 },
  { id: 20, name: 'HECTOR JULIO DE LA CRUZ', email: '', telefono: '8294489370', direccion: '', cedula: '02601178326', tel2: '', status: 1, user_id: 0 },
  { id: 21, name: 'ARIANNNY (VILLA HERMOSA)', email: '', telefono: '809', direccion: '', cedula: '00', tel2: '', status: 1, user_id: 0 },
  { id: 22, name: 'ROSA (VILLA HERMOSA)', email: '', telefono: '809', direccion: '', cedula: '00', tel2: '', status: 1, user_id: 0 },
  { id: 23, name: 'VERONICA (VILLA HERMOSA)', email: '', telefono: '00', direccion: '', cedula: '00', tel2: '', status: 1, user_id: 0 },
  { id: 24, name: 'MARISOL (CASA JUNIOR)', email: '', telefono: '00', direccion: '', cedula: '00', tel2: '', status: 1, user_id: 0 },
  { id: 25, name: 'ISIDRA GOMEZ', email: '', telefono: '', direccion: '', cedula: '02600598334', tel2: '', status: 1, user_id: 0 },
  { id: 26, name: 'MERCEDES (VILLA HERMOSA)', email: '', telefono: '00', direccion: '', cedula: '00', tel2: '', status: 1, user_id: 0 },
  { id: 27, name: 'ROSA MARIA RUIZ', email: '', telefono: '8098276969', direccion: '', cedula: '02600626416', tel2: '', status: 1, user_id: 0 },
  { id: 28, name: 'LOYDA (VILLA HERMOSA)', email: '', telefono: '00', direccion: '', cedula: '00', tel2: '', status: 1, user_id: 0 },
  { id: 29, name: 'TERESA ROCHE', email: '', telefono: '8096025942', direccion: '', cedula: '02600395517', tel2: '', status: 1, user_id: 0 },
  { id: 30, name: 'INGRID APONTE', email: '', telefono: '8298059567', direccion: '', cedula: '02601137249', tel2: '', status: 1, user_id: 0 },
  { id: 31, name: 'ROSAURA SENYU', email: '', telefono: '8298521051', direccion: '', cedula: '10300071866', tel2: '', status: 1, user_id: 0 },
  { id: 32, name: 'NELIA FRANCO (VENEZOLANA)', email: '', telefono: '8097633674', direccion: '', cedula: '00', tel2: '', status: 1, user_id: 0 },
  { id: 33, name: 'YANNA (HIJA PASCUALA)', email: '', telefono: '00', direccion: '', cedula: '00', tel2: '', status: 1, user_id: 0 },
  { id: 34, name: 'LILIBETH FRIAS', email: '', telefono: '8298357845', direccion: '', cedula: '02601440437', tel2: '', status: 1, user_id: 0 },
  { id: 35, name: 'FIOR RAMON CONCEPCION', email: '', telefono: '8492080734', direccion: '', cedula: '00114312929', tel2: '', status: 1, user_id: 0 },
  { id: 36, name: 'MARÍA (FARMACIA)', email: '', telefono: '00', direccion: '', cedula: '00', tel2: '', status: 1, user_id: 0 },
  { id: 37, name: 'CAROLINA (FARMACIA)', email: '', telefono: '00', direccion: '', cedula: '00', tel2: '', status: 1, user_id: 0 }
];

const prestamosCompletos = [
  { id: 3, user_id: 3, acreedor_id: 0, fecha_inicio: '2019-08-12', dias_pago: 7, total: 25000, status: 0, saldado: 1, nota: '', monto_cuotas: 3125, total_cuotas: 10, porc_interes: 25, cod: 'T33', type: 1 },
  { id: 4, user_id: 4, acreedor_id: 0, fecha_inicio: '2019-08-03', dias_pago: 7, total: 30000, status: 0, saldado: 1, nota: '', monto_cuotas: 3600, total_cuotas: 10, porc_interes: 20, cod: 'B94', type: 1 },
  { id: 6, user_id: 4, acreedor_id: 0, fecha_inicio: '2019-07-20', dias_pago: 7, total: 50000, status: 0, saldado: 1, nota: '', monto_cuotas: 4000, total_cuotas: 15, porc_interes: 20, cod: 'G46', type: 1 },
  { id: 7, user_id: 5, acreedor_id: 0, fecha_inicio: '2019-08-01', dias_pago: 7, total: 10000, status: 0, saldado: 1, nota: '', monto_cuotas: 1200, total_cuotas: 10, porc_interes: 20, cod: 'O17', type: 1 },
  { id: 8, user_id: 6, acreedor_id: 0, fecha_inicio: '2019-09-30', dias_pago: 30, total: 6000, status: 0, saldado: 1, nota: '', monto_cuotas: 1800, total_cuotas: 4, porc_interes: 20, cod: 'J98', type: 1 },
  { id: 11, user_id: 5, acreedor_id: 0, fecha_inicio: '2019-09-12', dias_pago: 7, total: 10000, status: 0, saldado: 1, nota: '', monto_cuotas: 1200, total_cuotas: 10, porc_interes: 20, cod: 'K411', type: 1 },
  { id: 12, user_id: 6, acreedor_id: 0, fecha_inicio: '2019-09-30', dias_pago: 30, total: 10000, status: 0, saldado: 0, nota: '', monto_cuotas: 2000, total_cuotas: 6, porc_interes: 20, cod: 'G312', type: 1 },
  { id: 13, user_id: 5, acreedor_id: 0, fecha_inicio: '2019-10-31', dias_pago: 7, total: 10000, status: 0, saldado: 1, nota: '', monto_cuotas: 1200, total_cuotas: 10, porc_interes: 20, cod: 'K013', type: 1 },
  { id: 33, user_id: 5, acreedor_id: 0, fecha_inicio: '2019-12-26', dias_pago: 7, total: 15000, status: 0, saldado: 0, nota: '', monto_cuotas: 1800, total_cuotas: 10, porc_interes: 20, cod: 'N533', type: 1 },
  { id: 34, user_id: 4, acreedor_id: 0, fecha_inicio: '2019-12-06', dias_pago: 7, total: 50000, status: 0, saldado: 0, nota: '', monto_cuotas: 4000, total_cuotas: 15, porc_interes: 20, cod: 'T334', type: 1 }
];

// Datos de cobros detallados del sistema anterior
const cobrosCompletos = [
  { id: 2, fecha: '2019-08-12 19:30:54', prestamo_id: 3, user_id: 3, num_cuota: 1, pago_cuota: 3125, pago_interes: 0, pago_total: 3125, tipo: 'pago', cobrador_id: 1 },
  { id: 3, fecha: '2019-08-19 19:31:04', prestamo_id: 3, user_id: 3, num_cuota: 2, pago_cuota: 3125, pago_interes: 0, pago_total: 3125, tipo: 'pago', cobrador_id: 1 },
  { id: 4, fecha: '2019-08-26 19:31:14', prestamo_id: 3, user_id: 3, num_cuota: 3, pago_cuota: 3125, pago_interes: 0, pago_total: 3125, tipo: 'pago', cobrador_id: 1 },
  { id: 5, fecha: '2019-09-02 19:34:47', prestamo_id: 3, user_id: 3, num_cuota: 4, pago_cuota: 3125, pago_interes: 0, pago_total: 3125, tipo: 'pago', cobrador_id: 1 },
  { id: 6, fecha: '2019-09-09 19:41:08', prestamo_id: 4, user_id: 4, num_cuota: 1, pago_cuota: 3600, pago_interes: 0, pago_total: 3600, tipo: 'pago', cobrador_id: 1 },
  { id: 7, fecha: '2019-09-09 19:41:08', prestamo_id: 4, user_id: 4, num_cuota: 2, pago_cuota: 3600, pago_interes: 0, pago_total: 3600, tipo: 'pago', cobrador_id: 1 },
  { id: 8, fecha: '2019-09-09 19:41:08', prestamo_id: 4, user_id: 4, num_cuota: 3, pago_cuota: 3600, pago_interes: 0, pago_total: 3600, tipo: 'pago', cobrador_id: 1 },
  { id: 9, fecha: '2019-09-09 19:41:08', prestamo_id: 4, user_id: 4, num_cuota: 4, pago_cuota: 3600, pago_interes: 0, pago_total: 3600, tipo: 'pago', cobrador_id: 1 },
  { id: 10, fecha: '2019-09-09 19:41:08', prestamo_id: 4, user_id: 4, num_cuota: 5, pago_cuota: 3600, pago_interes: 0, pago_total: 3600, tipo: 'pago', cobrador_id: 1 },
  { id: 18, fecha: '2019-09-09 19:45:25', prestamo_id: 6, user_id: 4, num_cuota: 1, pago_cuota: 4000, pago_interes: 0, pago_total: 4000, tipo: 'pago', cobrador_id: 1 },
  { id: 19, fecha: '2019-09-09 19:45:25', prestamo_id: 6, user_id: 4, num_cuota: 2, pago_cuota: 4000, pago_interes: 0, pago_total: 4000, tipo: 'pago', cobrador_id: 1 },
  { id: 20, fecha: '2019-09-09 19:45:25', prestamo_id: 6, user_id: 4, num_cuota: 3, pago_cuota: 4000, pago_interes: 0, pago_total: 4000, tipo: 'pago', cobrador_id: 1 },
  { id: 21, fecha: '2019-09-09 19:45:25', prestamo_id: 6, user_id: 4, num_cuota: 4, pago_cuota: 4000, pago_interes: 0, pago_total: 4000, tipo: 'pago', cobrador_id: 1 },
  { id: 22, fecha: '2019-09-09 19:45:25', prestamo_id: 6, user_id: 4, num_cuota: 5, pago_cuota: 4000, pago_interes: 0, pago_total: 4000, tipo: 'pago', cobrador_id: 1 },
  { id: 23, fecha: '2019-09-09 19:45:25', prestamo_id: 6, user_id: 4, num_cuota: 6, pago_cuota: 4000, pago_interes: 0, pago_total: 4000, tipo: 'pago', cobrador_id: 1 },
  { id: 24, fecha: '2019-09-09 19:45:25', prestamo_id: 6, user_id: 4, num_cuota: 7, pago_cuota: 4000, pago_interes: 0, pago_total: 4000, tipo: 'pago', cobrador_id: 1 }
];

const cobradoresCompletos = [
  { id: 1, nombre: 'JUAN BATISTA', telefono: '809-000-0000', cedula: '00000000001', direccion: 'LA ROMANA', email: 'juan@sistema.com', usuario: 'juan', password: 'juan123', status: 1 },
  { id: 2, nombre: 'miguel', telefono: '809-000-0001', cedula: '00000000002', direccion: 'LA ROMANA', email: 'miguel@sistema.com', usuario: 'miguel', password: 'miguel', status: 1 }
];

async function migrarDatosCompletos() {
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
    await db.collection('usuarios').deleteMany({});
    
    console.log('✅ Datos limpiados exitosamente');
    
    // 2. Migrar clientes completos
    console.log('\n👥 Migrando clientes completos...');
    const clientesNuevos = clientesCompletos.map(cliente => ({
      nombre: cliente.name,
      email: cliente.email || '',
      telefono: cliente.telefono || '00',
      telefono2: cliente.tel2 || '',
      cedula: cliente.cedula || '00',
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
    
    for (const cobrador of cobradoresCompletos) {
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
    
    // 4. Migrar préstamos completos
    console.log('\n💰 Migrando préstamos completos...');
    const prestamosNuevos = [];
    
    for (const prestamo of prestamosCompletos) {
      // Buscar cliente por ID original
      const cliente = await db.collection('clientes').findOne({ clienteId: prestamo.user_id });
      
      if (cliente) {
        // Mapear tipo de préstamo
        let tipoPrestamo = 'Capitalizado';
        switch (prestamo.type) {
          case 1:
            tipoPrestamo = 'Capitalizado';
            break;
          case 2:
            tipoPrestamo = 'Amortizado';
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
        
        const fechaInicio = new Date(prestamo.fecha_inicio);
        const fechaVencimiento = new Date(fechaInicio.getTime() + (prestamo.total_cuotas * prestamo.dias_pago * 24 * 60 * 60 * 1000));
        
        // Calcular cuotas pagadas basado en los cobros
        const cobrosPrestamo = cobrosCompletos.filter(c => c.prestamo_id === prestamo.id);
        const cuotasPagadas = cobrosPrestamo.length;
        const saldoPendiente = prestamo.saldado === 1 ? 0 : prestamo.total - (cuotasPagadas * prestamo.monto_cuotas);
        
        prestamosNuevos.push({
          clienteId: cliente._id,
          monto: prestamo.total,
          tasaInteres: prestamo.porc_interes || 20,
          tipoPrestamo: tipoPrestamo,
          frecuenciaPago: frecuenciaPago,
          numeroRenovaciones: 0,
          fechaInicio: fechaInicio,
          fechaVencimiento: fechaVencimiento,
          montoCuota: prestamo.monto_cuotas,
          totalCuotas: prestamo.total_cuotas,
          cuotasPagadas: cuotasPagadas,
          estado: prestamo.saldado === 1 ? 'Completado' : (fechaVencimiento < new Date() ? 'Mora' : 'Activo'),
          saldoPendiente: Math.max(0, saldoPendiente),
          garantias: '',
          observaciones: prestamo.nota || '',
          fechaCreacion: new Date(),
          prestamoId: prestamo.id, // Mantener ID original para referencias
          codigoPrestamo: prestamo.cod || ''
        });
      }
    }
    
    if (prestamosNuevos.length > 0) {
      await db.collection('prestamos').insertMany(prestamosNuevos);
      console.log(`✅ ${prestamosNuevos.length} préstamos migrados`);
    }
    
    // 5. Migrar cobros reales del sistema anterior
    console.log('\n📋 Migrando cobros del sistema anterior...');
    const cobrosNuevos = [];
    
    // Crear cobrador por defecto para los cobros migrados
    const cobradorMigracion = await db.collection('cobradores').findOne({ usuario: 'juan' });
    
    for (const cobro of cobrosCompletos) {
      const prestamo = await db.collection('prestamos').findOne({ prestamoId: cobro.prestamo_id });
      
      if (prestamo && cobradorMigracion) {
        const cliente = await db.collection('clientes').findOne({ _id: prestamo.clienteId });
        
        if (cliente) {
          cobrosNuevos.push({
            prestamoId: prestamo._id,
            clienteId: prestamo.clienteId,
            cobradorId: cobradorMigracion._id,
            fechaCobro: new Date(cobro.fecha),
            montoCobro: cobro.pago_cuota,
            montoInteres: cobro.pago_interes,
            montoTotal: cobro.pago_total,
            numeroCuota: cobro.num_cuota,
            estado: 'Cobrado',
            metodoPago: 'efectivo',
            fechaCreacion: new Date(cobro.fecha),
            observaciones: `Migrado - Cuota #${cobro.num_cuota}`,
            cobroId: cobro.id // Mantener ID original
          });
        }
      }
    }
    
    // 6. Generar cobros pendientes para préstamos activos
    console.log('\n📋 Generando cobros pendientes para préstamos activos...');
    const prestamosActivos = await db.collection('prestamos').find({ 
      estado: { $in: ['Activo', 'Mora'] } 
    }).toArray();
    
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
            montoInteres: Math.round(prestamo.montoCuota * 0.1),
            montoTotal: prestamo.montoCuota + Math.round(prestamo.montoCuota * 0.1),
            numeroCuota: prestamo.cuotasPagadas + i,
            estado: fechaCobro <= new Date() ? 'Vencido' : 'Pendiente',
            fechaCreacion: new Date(),
            observaciones: `Cobro pendiente - Cuota #${prestamo.cuotasPagadas + i}`
          });
        }
      }
    }
    
    if (cobrosNuevos.length > 0) {
      await db.collection('cobros').insertMany(cobrosNuevos);
      console.log(`✅ ${cobrosNuevos.length} cobros generados (reales + pendientes)`);
    }
    
    // 7. Crear usuario administrador
    console.log('\n👤 Creando usuario administrador...');
    const hashedAdminPassword = await bcryptjs.hash('741741', 10);
    
    await db.collection('usuarios').insertOne({
      email: 'admin',
      password: hashedAdminPassword,
      nombre: 'Administrador Prestasy-KR',
      rol: 'admin',
      fechaCreacion: new Date(),
      activo: true
    });
    
    console.log('✅ Usuario administrador creado');
    
    // 8. Mostrar resumen de migración completa
    console.log('\n📊 RESUMEN DE MIGRACIÓN COMPLETA:');
    console.log('='.repeat(50));
    
    const totalClientes = await db.collection('clientes').countDocuments();
    const totalCobradores = await db.collection('cobradores').countDocuments();
    const totalPrestamos = await db.collection('prestamos').countDocuments();
    const totalCobros = await db.collection('cobros').countDocuments();
    const totalUsuarios = await db.collection('usuarios').countDocuments();
    
    // Calcular estadísticas importantes
    const countPrestamosActivos = await db.collection('prestamos').countDocuments({ estado: { $in: ['Activo', 'Mora'] } });
    const prestamosCompletados = await db.collection('prestamos').countDocuments({ estado: 'Completado' });
    
    const totalACobrar = await db.collection('prestamos').aggregate([
      { $match: { estado: { $in: ['Activo', 'Mora'] } } },
      { $group: { _id: null, total: { $sum: '$saldoPendiente' } } }
    ]).toArray();
    
    const cobrosVencidos = await db.collection('cobros').countDocuments({ 
      estado: 'Vencido',
      fechaCobro: { $lt: new Date() }
    });
    
    console.log(`👥 Clientes: ${totalClientes}`);
    console.log(`🚴 Cobradores: ${totalCobradores}`);
    console.log(`💰 Préstamos: ${totalPrestamos} (${countPrestamosActivos} activos, ${prestamosCompletados} completados)`);
    console.log(`📋 Cobros: ${totalCobros}`);
    console.log(`👤 Usuarios: ${totalUsuarios}`);
    console.log(`💵 Total a Cobrar: $${totalACobrar.length > 0 ? totalACobrar[0].total.toLocaleString() : '0'}`);
    console.log(`⚠️ Cobros Vencidos: ${cobrosVencidos}`);
    
    console.log('\n✅ ¡MIGRACIÓN COMPLETA EXITOSA!');
    console.log('🔑 Usuario Admin: admin');
    console.log('🔑 Contraseña Admin: 741741');
    
    if (totalCobradores > 0) {
      console.log('\n🚴 Cobradores disponibles:');
      const cobradores = await db.collection('cobradores').find({}, { projection: { nombre: 1, usuario: 1 } }).toArray();
      cobradores.forEach(cobrador => {
        console.log(`   - ${cobrador.nombre} (usuario: ${cobrador.usuario})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error durante la migración completa:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

// Ejecutar migración completa
console.log('🚀 Iniciando migración COMPLETA de datos del sistema anterior...');
console.log('⚠️  ADVERTENCIA: Esto eliminará todos los datos actuales');
console.log('📊 Migrando datos completos con clientes, préstamos y cobros reales');
console.log('');

migrarDatosCompletos().catch(console.error);