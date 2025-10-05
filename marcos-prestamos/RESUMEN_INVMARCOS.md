# Resumen de Datos - INVERSIONES MARCOS (invmarcos)

## Información General
- **Empresa**: Inversiones Marcos  
- **Código del Sistema**: invmarcos / invmarcos_local
- **Usuario Principal**: marcos
- **Sitio Web**: invmarcos.ddns.net
- **Servidor API**: prestamov2.ddns.net:8000

## Configuración de Base de Datos

### Configuración Principal (invmarcos)
- **Base de Datos**: prestamos_invmarcos
- **Host**: prestamov2.ddns.net
- **Puerto**: 3306
- **Usuario**: p_invmarcos
- **Contraseña**: invmarcos*9#10H75_10$6;52

### Configuración Local (invmarcos_local)  
- **Base de Datos**: prestamos_invmarcos
- **Host**: localhost
- **Puerto**: 3306
- **Usuario**: p_invmarcos_app
- **Contraseña**: App12345!

## Configuración de Recargas
- **Usuario Recargas**: invmarcos
- **Contraseña Recargas**: wsxmarcos
- **Account ID**: OPT
- **Hash**: OPT

## Servicios Web
- **Servicio Principal**: https://invmarcos.ddns.net/WS/
- **API GraphQL**: http://prestamov2.ddns.net:8000

## Estructura del Sistema

### Módulos Principales
1. **Préstamos** - Gestión de préstamos y créditos
2. **Clientes** - Administración de clientes asignados
3. **Cobradores** - Gestión de cobradores y rutas
4. **Pagos Realizados** - Registro de pagos y transacciones
5. **Cobros Pendientes** - Control de cobros por realizar
6. **Recargas** - Sistema de recargas telefónicas
7. **Solicitudes de Préstamos** - Nuevas solicitudes
8. **Sincronización** - Sincronización de datos

### Modelos de Datos Principales

#### Cliente
- ID, Nombre, Email, Teléfono
- Dirección, Ciudad, Cédula
- Referencias, Cobrador ID
- Coordenadas (Latitud, Longitud)
- Usuario y contraseña de acceso

#### Prestamo
- ID, Usuario ID, Acreedor ID
- Fechas (inicio, pago, revisión)
- Montos (total, saldo, cuotas)
- Porcentajes (interés, mora)
- Estado y notas

#### Cobrador
- ID, Nombre, Usuario, Pass
- Estado, User ID, Datetime

#### Pagos Realizados
- ID, Fecha, Prestamo ID, Crédito ID
- Montos de pago (cuota, interés, total)
- Balance anterior y final
- Tipo de pago

## Archivos Copiados

### Configuración
- code.json - Configuración completa del sistema
- config.json - Configuración específica del servidor
- getCli.php - Script de configuración de clientes

### API Completa
- Toda la carpeta prestamos-api con:
  - Controladores (Go)
  - Modelos de datos
  - Rutas y middleware
  - Base de datos y utilidades

### Base de Datos
- prestamosEstructura.sql - Estructura de tablas
- prestamosDatos.sql - Datos de ejemplo
- prestamos.sql - Script principal
- prestamos_default.sql - Configuración por defecto

### Scripts Web
- getCODE.php - Códigos de empresas y servicios

## Funcionalidades Identificadas

1. **Gestión de Préstamos**
   - Crear, editar, eliminar préstamos
   - Cálculo de intereses y cuotas
   - Control de pagos y saldos

2. **Administración de Clientes**
   - Registro completo de clientes
   - Asignación a cobradores
   - Geolocalización

3. **Sistema de Cobros**
   - Rutas de cobradores
   - Cobros pendientes
   - Registro de pagos

4. **Recargas Telefónicas**
   - Integración con gateway de recargas
   - Balance de cuenta
   - Reversos de transacciones

5. **Autenticación y Seguridad**
   - Sistema JWT para autenticación
   - Múltiples usuarios y permisos
   - Configuración por empresa

## Logs de Actividad Reciente
- Usuario 'marcos' ha iniciado sesión usando code 'invmarcos_local'
- Sistema activo con conexiones a base de datos local
- API funcionando en puerto 8000

## Notas Importantes
- El sistema maneja múltiples empresas con códigos únicos
- Hay configuración tanto local como remota
- Sistema completo de préstamos con funcionalidades avanzadas
- API REST con GraphQL integrado
- Base de datos MySQL con estructura completa

---
*Resumen generado el 4 de octubre de 2025*