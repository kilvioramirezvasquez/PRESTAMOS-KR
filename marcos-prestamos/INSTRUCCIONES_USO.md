# Instrucciones para Usar los Datos de INVMARCOS

## Contenido del Directorio

El directorio `d:\marcos-prestamos` contiene toda la información extraída del sistema de préstamos de INVERSIONES MARCOS (invmarcos).

### Estructura de Archivos:

```
d:\marcos-prestamos\
├── RESUMEN_INVMARCOS.md           # Resumen completo del sistema
├── api\                           # API completa del sistema
│   └── prestamos-api\            # Código fuente de la API en Go
├── base-datos\                   # Scripts de base de datos
│   ├── prestamosEstructura.sql   # Estructura de tablas
│   ├── prestamosDatos.sql        # Datos de ejemplo
│   ├── prestamos.sql             # Script principal
│   └── prestamos_default.sql     # Configuración por defecto
├── configuracion\                # Archivos de configuración
│   ├── code.json                 # Configuración de múltiples empresas
│   ├── config.json               # Configuración del servidor
│   ├── getCli.php                # Script PHP de configuración
│   └── CONFIGURACION_INVMARCOS.md # Detalles específicos de invmarcos
├── scripts\                      # Scripts de utilidad (vacío)
└── web\                          # Archivos web
    └── getCODE.php               # Códigos de empresas para app móvil
```

## Información Clave de INVMARCOS

### Datos de Conexión:
- **Base de Datos**: prestamos_invmarcos
- **Host Remoto**: prestamov2.ddns.net:3306
- **Usuario Remoto**: p_invmarcos
- **Contraseña Remoto**: invmarcos*9#10H75_10$6;52
- **Host Local**: localhost:3306
- **Usuario Local**: p_invmarcos_app
- **Contraseña Local**: App12345!

### Servicios:
- **Web**: https://invmarcos.ddns.net
- **API**: http://prestamov2.ddns.net:8000
- **GraphQL**: http://prestamov2.ddns.net:8000/graphql

### Usuario del Sistema:
- **Nombre**: marcos
- **Empresa**: Inversiones Marcos
- **Código**: invmarcos / invmarcos_local

## Módulos del Sistema

### 1. Gestión de Préstamos
- Crear y administrar préstamos
- Cálculo automático de intereses
- Control de pagos y saldos
- Historial completo de transacciones

### 2. Administración de Clientes
- Registro completo de clientes
- Información de contacto y referencias
- Asignación a cobradores específicos
- Geolocalización con coordenadas

### 3. Sistema de Cobradores
- Gestión de rutas de cobro
- Asignación de clientes por cobrador
- Control de cobros pendientes
- Registro de pagos realizados

### 4. Recargas Telefónicas
- Integración con gateway de recargas
- Balance de cuenta en tiempo real
- Reversos de transacciones
- Histórico de recargas

### 5. Reportes y Análisis
- Pagos realizados por período
- Cobros pendientes por cobrador
- Solicitudes de préstamos nuevos
- Sincronización de datos

## Tecnologías Utilizadas

### Backend:
- **Lenguaje**: Go (Golang)
- **Framework**: Gorilla Mux
- **Base de Datos**: MySQL
- **API**: REST + GraphQL
- **Autenticación**: JWT

### Frontend Web:
- **Lenguaje**: PHP
- **Base de Datos**: MySQL
- **JavaScript**: Vanilla JS + bibliotecas

### Móvil:
- APK disponible (_cobros.apk, cobros.apk)
- Integración con API REST

## Cómo Usar los Datos

### 1. Configurar Base de Datos:
```sql
-- Ejecutar en MySQL
source d:\marcos-prestamos\base-datos\prestamosEstructura.sql
source d:\marcos-prestamos\base-datos\prestamosDatos.sql
```

### 2. Configurar API:
```bash
cd d:\marcos-prestamos\api\prestamos-api
go mod tidy
go build -o server main.go
./server
```

### 3. Archivos de Configuración:
- Revisar `configuracion\code.json` para settings de DB
- Modificar `configuracion\config.json` según ambiente
- Ajustar `configuracion\getCli.php` para web

### 4. Datos de Prueba:
- Usuario: marcos
- Contraseña: (revisar en base de datos)
- Código de empresa: invmarcos_local

## Funcionalidades Principales

### API Endpoints:
- `POST /login` - Autenticación
- `GET /prestamos` - Lista de préstamos
- `GET /clientes_asignados` - Clientes por cobrador
- `GET /cobros_pendientes` - Cobros pendientes
- `GET /pagos_realizados` - Historial de pagos
- `POST /recargas` - Sistema de recargas
- `POST /solicitud_prestamos` - Nuevas solicitudes

### Base de Datos:
- Tablas principales: clientes, prestamos, cobradores
- Tablas de transacciones: creditos_pagos, recargas
- Tablas de control: prestamo_pre_solicitud

### Seguridad:
- Autenticación JWT
- Configuración por empresa (multi-tenant)
- Control de acceso por usuario

## Notas Importantes

1. **Contraseñas Sensibles**: Las contraseñas están expuestas en los archivos de configuración. Cambiarlas en producción.

2. **Multi-Empresa**: El sistema maneja múltiples empresas con códigos únicos.

3. **Geolocalización**: Los clientes incluyen coordenadas para mapas.

4. **Integración Externa**: Sistema de recargas integrado con gateway externo.

5. **Logs**: Revisar archivos server.err y server.log para diagnósticos.

## Soporte y Mantenimiento

- El sistema está activo y funcional
- Logs recientes muestran actividad del usuario 'marcos'
- Base de datos local y remota configuradas
- API corriendo en puerto 8000

---
*Instrucciones generadas el 4 de octubre de 2025*
*Todos los datos han sido extraídos del sistema original y están listos para usar*