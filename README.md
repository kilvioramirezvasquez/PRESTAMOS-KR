# Prestasy-KR - Sistema de Préstamos y Cobradores

Un sistema completo para la gestión de préstamos, clientes y cobradores con interfaz web moderna y API REST robusta.

## 🚀 Características

### Backend (Node.js + Express + MongoDB)
- ✅ **API REST completa** con autenticación JWT
- ✅ **Sistema de roles** (Admin, Gerente, Cobrador)
- ✅ **Validación de datos** con express-validator
- ✅ **Middleware de seguridad** (helmet, rate limiting, CORS)
- ✅ **Sistema de logging** y auditoría
- ✅ **Paginación** en todas las consultas
- ✅ **Índices optimizados** en MongoDB
- ✅ **Testing** con Jest y Supertest
- ✅ **Geolocalización** para cobros
- ✅ **Manejo de errores** centralizado

### Frontend (React + TypeScript + Tailwind CSS)
- ✅ **Interfaz moderna** y responsiva
- ✅ **Autenticación** completa con contexto React
- ✅ **Dashboard** con estadísticas en tiempo real
- ✅ **Navegación** protegida por roles
- ✅ **Notificaciones** con react-hot-toast
- ✅ **TypeScript** para tipado estático

## 📊 Funcionalidades del Sistema

### Gestión de Usuarios
- Registro y autenticación de usuarios
- Control de acceso basado en roles
- Perfil de usuario y configuración

### Gestión de Clientes
- CRUD completo de clientes
- Asignación de cobradores por zona
- Estados: activo, inactivo, mora
- Búsqueda y filtrado avanzado

### Gestión de Préstamos
- Creación de préstamos con intereses
- Cálculo automático de cuotas
- Seguimiento de pagos pendientes
- Estados: activo, pagado, mora
- Fechas de vencimiento automáticas

### Sistema de Cobros
- Registro de pagos con geolocalización
- Múltiples métodos de pago
- Actualización automática de saldos
- Historial completo de transacciones

### Dashboard y Reportes
- Estadísticas en tiempo real
- Cobros por día/período
- Alertas de mora
- Resumen por cobrador

## 🛠️ Tecnologías

### Backend
- **Node.js 18+** - Runtime de JavaScript
- **Express.js** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación por tokens
- **bcryptjs** - Hash de contraseñas
- **express-validator** - Validación de datos
- **helmet** - Seguridad HTTP
- **express-rate-limit** - Limitación de requests
- **Jest** - Testing framework

### Frontend
- **React 18** - Librería de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool moderna
- **Tailwind CSS** - Framework CSS
- **React Router** - Navegación SPA
- **Axios** - Cliente HTTP
- **React Hot Toast** - Notificaciones
- **Lucide React** - Iconos
- **date-fns** - Manejo de fechas

## 🚀 Instalación y Configuración

### Requisitos Previos
- Node.js 18+
- MongoDB 6+
- npm o yarn

### Opción 1: Instalación Manual

#### Backend
```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tus configuraciones
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Opción 2: Docker (Recomendado)

```bash
# Clonar el repositorio
git clone <tu-repo>
cd sistema-prestamos

# Ejecutar con Docker Compose
docker-compose up -d

# Ver logs
docker-compose logs -f
```

## 🔧 Configuración

### Variables de Entorno (Backend)

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sistema-prestamos
JWT_SECRET=tu_secreto_super_seguro_cambialo
```

### Variables de Entorno (Frontend)

```env
VITE_API_URL=http://localhost:5000/api
```

## 👤 Usuarios Demo

El sistema incluye usuarios demo para pruebas:

- **Admin**: admin@demo.com / admin123
- **Gerente**: gerente@demo.com / gerente123  
- **Cobrador**: cobrador@demo.com / cobrador123

## 📖 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/profile` - Perfil del usuario

### Clientes
- `GET /api/clientes` - Listar clientes (paginado)
- `POST /api/clientes` - Crear cliente
- `GET /api/clientes/:id` - Obtener cliente
- `PUT /api/clientes/:id` - Actualizar cliente

### Préstamos
- `GET /api/prestamos` - Listar préstamos (paginado)
- `POST /api/prestamos` - Crear préstamo
- `GET /api/prestamos/:id` - Obtener préstamo
- `PATCH /api/prestamos/:id/estado` - Cambiar estado

### Cobros
- `GET /api/cobros` - Listar cobros (paginado)
- `POST /api/cobros` - Registrar cobro
- `GET /api/cobros/prestamo/:id` - Cobros de un préstamo

### Dashboard
- `GET /api/dashboard/estadisticas` - Estadísticas generales
- `GET /api/dashboard/resumen` - Resumen diario
- `GET /api/dashboard/cobradores` - Stats por cobrador

## 🧪 Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm run test
```

## 📦 Deployment

### Producción con Docker

```bash
# Build y deploy
docker-compose -f docker-compose.prod.yml up -d

# Actualizar
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d --force-recreate
```

### Consideraciones de Seguridad

1. **Cambiar JWT_SECRET** en producción
2. **Configurar HTTPS** con certificados SSL
3. **Configurar firewall** para MongoDB
4. **Backup regular** de la base de datos
5. **Monitoreo** de logs y errores

## 🔍 Estructura del Proyecto

```
sistema-prestamos/
├── backend/
│   ├── middleware/          # Middlewares personalizados
│   ├── models/             # Modelos de MongoDB
│   ├── routes/             # Rutas de la API
│   ├── utils/              # Utilidades (logger, etc.)
│   ├── tests/              # Tests unitarios
│   └── server.js           # Servidor principal
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── contexts/       # Contextos de React
│   │   ├── pages/          # Páginas principales
│   │   ├── services/       # Servicios API
│   │   └── types/          # Tipos TypeScript
│   └── public/             # Assets estáticos
├── docker-compose.yml      # Configuración Docker
└── README.md              # Documentación
```

## 🤝 Contribuir

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Licencia

Distribuido bajo la Licencia MIT. Ver `LICENSE` para más información.

## 📞 Soporte

- **Issues**: [GitHub Issues](enlace-a-issues)
- **Email**: soporte@sistemaprestamos.com
- **Documentación**: [Wiki del proyecto](enlace-a-wiki)

---

⭐ **¡Si te ha sido útil este proyecto, no olvides darle una estrella!** ⭐