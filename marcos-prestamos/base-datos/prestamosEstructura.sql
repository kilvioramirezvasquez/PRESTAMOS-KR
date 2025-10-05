-- phpMyAdmin SQL Dump
-- version 4.9.5deb2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Dec 21, 2020 at 10:49 AM
-- Server version: 8.0.22-0ubuntu0.20.04.3
-- PHP Version: 7.4.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `prestamos`
--

-- --------------------------------------------------------

--
-- Table structure for table `accesos`
--

CREATE TABLE `accesos` (
  `id` int NOT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user` int NOT NULL,
  `estado` int NOT NULL,
  `timeint` varchar(50) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `acreedores`
--

CREATE TABLE `acreedores` (
  `id` int NOT NULL,
  `nombre` text NOT NULL,
  `cliente` int NOT NULL,
  `cedula` text NOT NULL,
  `telefono` varchar(12) NOT NULL,
  `email` text NOT NULL,
  `fecha` datetime NOT NULL,
  `status` int NOT NULL DEFAULT '1',
  `user_id` int NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `ciudad`
--

CREATE TABLE `ciudad` (
  `id` int NOT NULL,
  `nombre` text NOT NULL,
  `postal` varchar(8) NOT NULL,
  `region` text NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `clientes`
--

CREATE TABLE `clientes` (
  `id` int NOT NULL,
  `name` text NOT NULL,
  `email` text CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `telefono` varchar(14) NOT NULL,
  `direccion` text NOT NULL,
  `ciudad` int NOT NULL,
  `nota` text CHARACTER SET latin1 COLLATE latin1_swedish_ci,
  `date_reg` int NOT NULL,
  `user_id` int NOT NULL,
  `status` int NOT NULL DEFAULT '1',
  `ruta` int NOT NULL,
  `cedula` varchar(14) NOT NULL,
  `tel2` varchar(14) NOT NULL,
  `referencias` text NOT NULL,
  `cobrador_id` int DEFAULT NULL,
  `acceso` tinyint(1) DEFAULT NULL,
  `user` varchar(20) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `pass` varchar(20) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `cobradores`
--

CREATE TABLE `cobradores` (
  `id` int NOT NULL,
  `nombre` text NOT NULL,
  `direccion` text NOT NULL,
  `telefono` varchar(14) NOT NULL,
  `cedula` varchar(16) NOT NULL,
  `user` text NOT NULL,
  `pass` text NOT NULL,
  `status` int NOT NULL DEFAULT '1',
  `user_id` int NOT NULL,
  `datetime` int NOT NULL,
  `fecha_reg` datetime NOT NULL,
  `email` varchar(50) NOT NULL,
  `permisos` text CHARACTER SET latin1 COLLATE latin1_swedish_ci
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `configuracion`
--

CREATE TABLE `configuracion` (
  `id` int NOT NULL,
  `emp_nombre` text NOT NULL,
  `emp_logo` text NOT NULL,
  `emp_direccion` text NOT NULL,
  `emp_direccion2` text NOT NULL,
  `emp_telefono` varchar(16) NOT NULL,
  `general_interes` text NOT NULL,
  `general_ganancias` text NOT NULL,
  `last_update` int NOT NULL,
  `dias_proroga` int NOT NULL,
  `email_general` text NOT NULL,
  `email_atrasos` text NOT NULL,
  `email_cobros` text NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `creditos`
--

CREATE TABLE `creditos` (
  `id` int NOT NULL,
  `prestamo_id` int NOT NULL,
  `user_id` int NOT NULL,
  `fecha_reg` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_prox_pago` datetime NOT NULL,
  `monto` float NOT NULL,
  `fecha_pago` datetime NOT NULL,
  `num_cuota` int NOT NULL,
  `interes` decimal(10,2) NOT NULL,
  `mora` decimal(10,2) NOT NULL,
  `bal_anterior` decimal(10,2) NOT NULL,
  `bal_final` decimal(10,2) NOT NULL,
  `faltantes` decimal(10,2) NOT NULL,
  `tipo` int NOT NULL,
  `m` tinyint(1) NOT NULL COMMENT 'Generomora'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `creditos_intereses`
--

CREATE TABLE `creditos_intereses` (
  `id` int NOT NULL,
  `credito_id` int NOT NULL,
  `prestamo_id` int NOT NULL,
  `user_id` int NOT NULL,
  `fecha` datetime NOT NULL,
  `dias_mora` int NOT NULL,
  `tipo` varchar(9) NOT NULL,
  `total` double NOT NULL,
  `fecha_pago` datetime NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `creditos_pagos`
--

CREATE TABLE `creditos_pagos` (
  `id` int NOT NULL,
  `fecha` datetime NOT NULL,
  `prestamo_id` int NOT NULL,
  `credito_id` int NOT NULL,
  `user_id` int NOT NULL,
  `num_cuota` int NOT NULL,
  `pago_cuota` int NOT NULL,
  `pago_interes` double NOT NULL,
  `pago_total` double NOT NULL,
  `tipo` varchar(4) NOT NULL,
  `bal_anterior` decimal(10,2) NOT NULL,
  `bal_final` decimal(10,2) NOT NULL,
  `cobrador_id` int NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `movimientos`
--

CREATE TABLE `movimientos` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `afectado_id` int NOT NULL,
  `tipo` text NOT NULL,
  `ip` varchar(20) NOT NULL,
  `descrip` text NOT NULL,
  `datetime` int NOT NULL,
  `fecha` datetime NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `notarios`
--

CREATE TABLE `notarios` (
  `id` int NOT NULL,
  `nombre` text NOT NULL,
  `ciudad` tinyint NOT NULL,
  `matricula` varchar(25) NOT NULL,
  `user_id` int NOT NULL,
  `datetime` int NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `prestamos`
--

CREATE TABLE `prestamos` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `acreedor_id` int NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_inic` datetime NOT NULL,
  `dias_pago` int NOT NULL,
  `total` double NOT NULL,
  `status` int NOT NULL,
  `saldado` int NOT NULL,
  `nota` varchar(150) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `monto_cuotas` double NOT NULL,
  `total_cuotas` int NOT NULL,
  `porc_interes` double NOT NULL,
  `porc_mora` double DEFAULT NULL,
  `proroga` int DEFAULT NULL,
  `fecha_revision` datetime NOT NULL,
  `dias_vencimiento` int NOT NULL,
  `calculo_porc_interes` decimal(10,2) NOT NULL,
  `cod` varchar(12) NOT NULL,
  `type` int NOT NULL,
  `garantias` text NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `prestamos_solicitudes`
--

CREATE TABLE `prestamos_solicitudes` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `acreedor_id` int NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_inic` datetime NOT NULL,
  `dias_pago` int NOT NULL,
  `total` double NOT NULL,
  `status` int NOT NULL,
  `saldado` int NOT NULL,
  `nota` varchar(150) NOT NULL,
  `monto_cuotas` double NOT NULL,
  `total_cuotas` int NOT NULL,
  `porc_interes` double NOT NULL,
  `porc_mora` double NOT NULL,
  `proroga` int NOT NULL,
  `fecha_revision` datetime NOT NULL,
  `dias_vencimiento` int NOT NULL,
  `calculo_porc_interes` decimal(10,2) NOT NULL,
  `cod` varchar(12) NOT NULL,
  `type` int NOT NULL,
  `garantias` text NOT NULL,
  `cl_cedula` varchar(15) NOT NULL,
  `cl_name` text NOT NULL,
  `cl_email` varchar(50) NOT NULL,
  `cl_telefono` varchar(14) NOT NULL,
  `cl_tel2` varchar(14) NOT NULL,
  `cl_direccion` text NOT NULL,
  `cl_ciudad` int NOT NULL,
  `cl_ruta` int NOT NULL,
  `cl_nota` text NOT NULL,
  `cl_referencias` text NOT NULL,
  `respuesta` text NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `rutas`
--

CREATE TABLE `rutas` (
  `id` int NOT NULL,
  `nombre` text NOT NULL,
  `cobrador_id` int NOT NULL,
  `descripcion` text CHARACTER SET latin1 COLLATE latin1_swedish_ci,
  `user_id` int NOT NULL,
  `telefono` varchar(14) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `status` int NOT NULL DEFAULT '1',
  `fecha_reg` datetime DEFAULT NULL,
  `datetime` int DEFAULT NULL,
  `color` varchar(15) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `testigos`
--

CREATE TABLE `testigos` (
  `id` int NOT NULL,
  `nombre` text NOT NULL,
  `cedula` text NOT NULL,
  `user_id` int NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int NOT NULL,
  `name` text NOT NULL,
  `type` int NOT NULL,
  `user` varchar(20) NOT NULL,
  `pass` varchar(50) NOT NULL,
  `email` text NOT NULL,
  `direccion` text NOT NULL,
  `telefono` varchar(14) NOT NULL,
  `permisos` text CHARACTER SET latin1 COLLATE latin1_swedish_ci,
  `fecha_registro` int NOT NULL,
  `fecha_login` int NOT NULL,
  `status` int NOT NULL DEFAULT '1',
  `nota` text CHARACTER SET latin1 COLLATE latin1_swedish_ci,
  `user_id` int NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `accesos`
--
ALTER TABLE `accesos`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `acreedores`
--
ALTER TABLE `acreedores`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ciudad`
--
ALTER TABLE `ciudad`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cobradores`
--
ALTER TABLE `cobradores`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `configuracion`
--
ALTER TABLE `configuracion`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `creditos`
--
ALTER TABLE `creditos`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `creditos_intereses`
--
ALTER TABLE `creditos_intereses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `creditos_pagos`
--
ALTER TABLE `creditos_pagos`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `movimientos`
--
ALTER TABLE `movimientos`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notarios`
--
ALTER TABLE `notarios`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `prestamos`
--
ALTER TABLE `prestamos`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `prestamos_solicitudes`
--
ALTER TABLE `prestamos_solicitudes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `rutas`
--
ALTER TABLE `rutas`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `testigos`
--
ALTER TABLE `testigos`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `accesos`
--
ALTER TABLE `accesos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `acreedores`
--
ALTER TABLE `acreedores`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ciudad`
--
ALTER TABLE `ciudad`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cobradores`
--
ALTER TABLE `cobradores`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `configuracion`
--
ALTER TABLE `configuracion`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `creditos`
--
ALTER TABLE `creditos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `creditos_intereses`
--
ALTER TABLE `creditos_intereses`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `creditos_pagos`
--
ALTER TABLE `creditos_pagos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `movimientos`
--
ALTER TABLE `movimientos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notarios`
--
ALTER TABLE `notarios`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `prestamos`
--
ALTER TABLE `prestamos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `prestamos_solicitudes`
--
ALTER TABLE `prestamos_solicitudes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rutas`
--
ALTER TABLE `rutas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `testigos`
--
ALTER TABLE `testigos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
