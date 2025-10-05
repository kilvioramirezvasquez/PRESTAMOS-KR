// Script de inicialización de MongoDB
db = db.getSiblingDB('sistema-prestamos');

// Crear usuario administrador por defecto
db.usuarios.insertOne({
  nombre: 'Administrador',
  email: 'admin@demo.com',
  password: '$2b$12$LQv3c1yqBFVFXJSD1T8oEuwGcF7I.7DKS2Yc4hSjP1QKKNlGHD6g6', // admin123
  rol: 'admin',
  activo: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Crear cobrador demo
db.usuarios.insertOne({
  nombre: 'Juan Pérez',
  email: 'cobrador@demo.com',
  password: '$2b$12$LQv3c1yqBFVFXJSD1T8oEuwGcF7I.7DKS2Yc4hSjP1QKKNlGHD6g6', // cobrador123
  rol: 'cobrador',
  zona: 'Centro',
  telefono: '3001234567',
  activo: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Crear gerente demo
db.usuarios.insertOne({
  nombre: 'María García',
  email: 'gerente@demo.com',
  password: '$2b$12$LQv3c1yqBFVFXJSD1T8oEuwGcF7I.7DKS2Yc4hSjP1QKKNlGHD6g6', // gerente123
  rol: 'gerente',
  telefono: '3009876543',
  activo: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

print('Usuarios demo creados exitosamente');