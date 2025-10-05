# Configuración Específica - INVMARCOS

## Datos de Conexión Principal

```json
{
    "code_num": "invmarcos",
    "db": "prestamos_invmarcos",
    "db_host": "prestamov2.ddns.net",
    "db_port": "3306",
    "db_user": "p_invmarcos",
    "db_pass": "invmarcos*9#10H75_10$6;52",
    "serv": "http://prestamov2.ddns.net:8000",
    "empr": "invmarcos",
    "recarga_user": "invmarcos",
    "recarga_pass": "wsxmarcos",
    "recarga_account_id": "OPT",
    "recarga_hash": "OPT"
}
```

## Datos de Conexión Local

```json
{
    "code_num": "invmarcos_local",
    "db": "prestamos_invmarcos",
    "db_host": "localhost",
    "db_port": "3306",
    "db_user": "p_invmarcos_app",
    "db_pass": "App12345!",
    "serv": "http://prestamov2.ddns.net:8000",
    "empr": "invmarcos",
    "recarga_user": "invmarcos",
    "recarga_pass": "wsxmarcos",
    "recarga_account_id": "OPT",
    "recarga_hash": "OPT"
}
```

## Configuración Web - getCODE.php

```php
$CODE["marcos"]['SERV']  = "https://invmarcos.ddns.net/WS/";
$CODE["marcos"]['EMPR']  = "Inversiones Marcos";
$CODE["marcos"]['OTHER'] = "";
```

## Configuración de Servidor - getCli.php

```php
if(substr_count($serv,"invmarcos.ddns.net")>0) {
    $dbHost = "localhost";
    $dbUser = "p_invmarcos";
    $dbPass = "invmarcos*9#10H75_10$6;52";
    $db = "prestamos_invmarcos";
    $dir = "invmarcos";
    $EMP = "marcos";
}
```

## Esquema de Base de Datos

### Tablas Principales Identificadas:

1. **clientes**
   - id, name, email, telefono
   - direccion, ciudad, cedula
   - referencias, cobrador_id
   - latitud, longitud
   - user, pass, acceso

2. **prestamos**
   - id, user_id, acreedor_id
   - fecha, fecha_inic, dias_pago
   - total, saldo, status
   - monto_cuotas, total_cuotas
   - porc_interes, porc_mora

3. **creditos_pagos**
   - id, fecha, prestamo_id, credito_id
   - user_id, num_cuota
   - pago_cuota, pago_interes, pago_total
   - bal_anterior, bal_final
   - cobrador_id, tipo_pago

4. **cobradores**
   - id, nombre, user, pass
   - status, user_id, datetime

5. **prestamo_pre_solicitud**
   - id, nombre, cedula, direccion
   - telefono, tipo, monto
   - nombre_garante, telefono_garante
   - fecha, estado, aprobado, cobrador_id

6. **recargas**
   - id, numero, telefonia, precio
   - id_cobrador, unix_fecha, estado

## URLs y Endpoints

### Servicios Web
- **Principal**: https://invmarcos.ddns.net/WS/
- **API**: http://prestamov2.ddns.net:8000
- **GraphQL**: http://prestamov2.ddns.net:8000/graphql

### Endpoints de API Identificados:
- `/prestamos` - Gestión de préstamos
- `/clientes_asignados` - Clientes por cobrador
- `/cobros_pendientes` - Cobros pendientes
- `/pagos_realizados` - Historial de pagos
- `/recargas` - Sistema de recargas
- `/solicitud_prestamos` - Nuevas solicitudes
- `/sincronizar` - Sincronización de datos
- `/login` - Autenticación

## Usuarios del Sistema

### Usuario Principal
- **Username**: marcos
- **Code**: invmarcos_local / invmarcos
- **Empresa**: Inversiones Marcos

### Credenciales de Recargas
- **Usuario**: invmarcos
- **Contraseña**: wsxmarcos
- **Gateway**: gateway01.esmps.net

## Configuración de Servidor

### Puerto de API
```
Port: 8000
Host: prestamov2.ddns.net
```

### Base de Datos MySQL
```
Host: prestamov2.ddns.net (remoto)
Host: localhost (local)
Port: 3306
Database: prestamos_invmarcos
```

## Archivos de Log
- server.err - Errores del servidor
- server.log - Log general
- server.out - Salida del servidor

## Integración con Servicios Externos

### Gateway de Recargas
- **URL**: https://gateway01.esmps.net/Web_Services/WS_Rest_Integration.svc/
- **Servicios**: TopUpRequest, ReverseRequest, BalanceRequest
- **Autenticación**: UserID + UserPassword + AccountID

---
*Configuración extraída el 4 de octubre de 2025*