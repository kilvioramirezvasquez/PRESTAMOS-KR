-- MySQL dump 10.13  Distrib 5.7.36, for Linux (x86_64)
--
-- Host: localhost    Database: prestamos
-- ------------------------------------------------------
-- Server version	5.7.36-0ubuntu0.18.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `recargas`
--

DROP TABLE IF EXISTS `recargas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `recargas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `numero` varchar(12) ,
  `telefonia` varchar(8) ,
  `precio` int(11) ,
  `id_cobrador` int(11) ,
  `unix_fecha` int(11) ,
  `estado` varchar(3) ,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `accesos`
--

DROP TABLE IF EXISTS `accesos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `accesos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user` int(11) ,
  `estado` int(11) ,
  `timeint` varchar(50) ,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `acreedores`
--

DROP TABLE IF EXISTS `acreedores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `acreedores` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` text ,
  `cliente` int(11) ,
  `cedula` text ,
  `telefono` varchar(12) ,
  `email` text ,
  `fecha` datetime ,
  `status` int(1) NOT NULL DEFAULT '1',
  `user_id` int(11) ,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ciudad`
--

DROP TABLE IF EXISTS `ciudad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ciudad` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` text ,
  `postal` varchar(8) ,
  `region` text ,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=3212 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `clientes`
--

DROP TABLE IF EXISTS `clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `clientes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` text ,
  `email` text CHARACTER SET utf8 ,
  `telefono` varchar(14) ,
  `direccion` text ,
  `ciudad` int(4) ,
  `nota` text ,
  `date_reg` int(11) ,
  `user_id` int(11) ,
  `status` int(11) NOT NULL DEFAULT '1',
  `ruta` int(11) ,
  `cedula` varchar(14) ,
  `tel2` varchar(14) ,
  `referencias` text ,
  `cobrador_id` int(11) ,
  `acceso` tinyint(1) ,
  `user` varchar(20) ,
  `pass` varchar(20) ,
  `latitud` float NOT NULL DEFAULT '0',
  `longitud` float NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=119 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cobradores`
--

DROP TABLE IF EXISTS `cobradores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cobradores` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` text ,
  `direccion` text ,
  `telefono` varchar(14) ,
  `cedula` varchar(16) ,
  `user` text ,
  `pass` text ,
  `status` int(2) NOT NULL DEFAULT '1',
  `user_id` int(11) ,
  `datetime` int(11) ,
  `fecha_reg` datetime ,
  `email` varchar(50) ,
  `permisos` text ,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `configuracion`
--

DROP TABLE IF EXISTS `configuracion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `configuracion` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `emp_nombre` text ,
  `emp_logo` text ,
  `emp_direccion` text ,
  `emp_direccion2` text ,
  `emp_telefono` varchar(16) ,
  `general_interes` text ,
  `general_ganancias` text ,
  `last_update` int(11) ,
  `dias_proroga` int(11) ,
  `email_general` text ,
  `email_atrasos` text ,
  `email_cobros` text ,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `creditos`
--

DROP TABLE IF EXISTS `creditos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `creditos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `prestamo_id` int(11) ,
  `user_id` int(11) ,
  `fecha_reg` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_prox_pago` datetime ,
  `monto` float ,
  `fecha_pago` datetime ,
  `num_cuota` int(11) ,
  `interes` decimal(10,2) ,
  `mora` decimal(10,2) ,
  `bal_anterior` decimal(10,2) ,
  `bal_final` decimal(10,2) ,
  `faltantes` decimal(10,2) ,
  `tipo` int(11) ,
  `m` tinyint(1) NOT NULL COMMENT 'Generomora',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3754 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `creditos_intereses`
--

DROP TABLE IF EXISTS `creditos_intereses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `creditos_intereses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `credito_id` int(11) ,
  `prestamo_id` int(11) ,
  `user_id` int(11) ,
  `fecha` datetime ,
  `dias_mora` int(11) ,
  `tipo` varchar(9) ,
  `total` double ,
  `fecha_pago` datetime ,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `creditos_pagos`
--

DROP TABLE IF EXISTS `creditos_pagos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `creditos_pagos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` datetime ,
  `prestamo_id` int(11) ,
  `credito_id` int(11) ,
  `user_id` int(11) ,
  `num_cuota` int(11) ,
  `pago_cuota` int(11) ,
  `pago_interes` double ,
  `pago_total` double ,
  `tipo` varchar(4) ,
  `bal_anterior` decimal(10,2) ,
  `bal_final` decimal(10,2) ,
  `cobrador_id` int(11) ,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=4028 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `movimientos`
--

DROP TABLE IF EXISTS `movimientos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `movimientos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) ,
  `afectado_id` int(11) ,
  `tipo` text ,
  `ip` varchar(20) ,
  `descrip` text ,
  `datetime` int(11) ,
  `fecha` datetime ,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=4474 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notarios`
--

DROP TABLE IF EXISTS `notarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` text ,
  `ciudad` tinyint(3) ,
  `matricula` varchar(25) ,
  `user_id` int(11) ,
  `datetime` int(11) ,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `prestamo_pre_solicitud`
--

DROP TABLE IF EXISTS `prestamo_pre_solicitud`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `prestamo_pre_solicitud` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(20) ,
  `cedula` varchar(20) ,
  `direccion` text ,
  `telefono` varchar(20) ,
  `nombre_garante` varchar(20) ,
  `telefono_garante` varchar(20) ,
  `monto` float ,
  `tipo` varchar(10) ,
  `fecha` int(11) DEFAULT NULL,
  `estado` varchar(10) DEFAULT NULL,
  `aprobado` tinyint(1) DEFAULT NULL,
  `cobrador_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `prestamos`
--

DROP TABLE IF EXISTS `prestamos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `prestamos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) ,
  `acreedor_id` int(11) ,
  `fecha` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_inic` datetime ,
  `dias_pago` int(11) ,
  `total` double ,
  `status` int(11) ,
  `saldado` int(11) ,
  `nota` varchar(150) ,
  `monto_cuotas` double ,
  `total_cuotas` int(11) ,
  `porc_interes` double ,
  `porc_mora` double ,
  `proroga` int(11) ,
  `fecha_revision` datetime ,
  `dias_vencimiento` int(11) ,
  `calculo_porc_interes` decimal(10,2) ,
  `cod` varchar(12) ,
  `type` int(1) ,
  `garantias` text ,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=299 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `prestamos_solicitudes`
--

DROP TABLE IF EXISTS `prestamos_solicitudes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `prestamos_solicitudes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) ,
  `acreedor_id` int(11) ,
  `fecha` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_inic` datetime ,
  `dias_pago` int(11) ,
  `total` double ,
  `status` int(11) ,
  `saldado` int(11) ,
  `nota` varchar(150) ,
  `monto_cuotas` double ,
  `total_cuotas` int(11) ,
  `porc_interes` double ,
  `porc_mora` double ,
  `proroga` int(11) ,
  `fecha_revision` datetime ,
  `dias_vencimiento` int(11) ,
  `calculo_porc_interes` decimal(10,2) ,
  `cod` varchar(12) ,
  `type` int(1) ,
  `garantias` text ,
  `cl_cedula` varchar(15) ,
  `cl_name` text ,
  `cl_email` varchar(50) ,
  `cl_telefono` varchar(14) ,
  `cl_tel2` varchar(14) ,
  `cl_direccion` text ,
  `cl_ciudad` int(11) ,
  `cl_ruta` int(11) ,
  `cl_nota` text ,
  `cl_referencias` text ,
  `respuesta` text ,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rutas`
--

DROP TABLE IF EXISTS `rutas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rutas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` text ,
  `cobrador_id` int(11) ,
  `descripcion` text ,
  `user_id` int(11) ,
  `telefono` varchar(14) ,
  `status` int(2) NOT NULL DEFAULT '1',
  `fecha_reg` datetime ,
  `datetime` int(11) ,
  `color` varchar(15) ,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `testigos`
--

DROP TABLE IF EXISTS `testigos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `testigos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` text ,
  `cedula` text ,
  `user_id` int(11) ,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` text ,
  `type` int(11) ,
  `user` varchar(20) ,
  `pass` varchar(50) ,
  `email` text ,
  `direccion` text ,
  `telefono` varchar(14) ,
  `permisos` text ,
  `fecha_registro` int(11) ,
  `fecha_login` int(11) ,
  `status` int(11) NOT NULL DEFAULT '1',
  `nota` text ,
  `user_id` int(11) ,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-12-11 20:41:46