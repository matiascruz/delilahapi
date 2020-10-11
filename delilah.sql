-- phpMyAdmin SQL Dump
-- version 4.8.2
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:3306
-- Tiempo de generación: 11-10-2020 a las 19:37:46
-- Versión del servidor: 5.7.21
-- Versión de PHP: 7.2.7

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `delilah`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `dishes`
--

CREATE TABLE `dishes` (
  `dish_id` int(11) NOT NULL,
  `dish_name` varchar(255) NOT NULL,
  `dish_desc` text,
  `dish_price` int(11) NOT NULL,
  `dish_availability` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `dishes`
--

INSERT INTO `dishes` (`dish_id`, `dish_name`, `dish_desc`, `dish_price`, `dish_availability`) VALUES
(1, 'Hamburguesa Clásica', 'Hamburguesa de ternera, lechuga, tomate, cebolla y queso', 300, 'available'),
(2, 'Pizza Mozzarella', 'Salsa de tomate secreta y doble queso mozzarella. Chimichurri especial.', 200, 'available'),
(3, 'Pizza Especial', 'Salsa de tomate secreta, doble queso mozzarella y jamón cocido. Chimichurri especial.', 250, 'available'),
(5, 'Sándwich de Salmón', 'Salmón grillado, queso crema y palta en pan pita.', 400, 'available'),
(6, 'Wok de pollo', 'Tiras de pollo salteado con verduras, brotes de soja y salsa teriyaki.', 450, 'available');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orders`
--

CREATE TABLE `orders` (
  `order_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `order_datetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `order_status` varchar(100) NOT NULL,
  `order_paymentMethod` varchar(100) NOT NULL,
  `order_ammount` int(11) NOT NULL,
  `order_comments` text,
  `order_address` varchar(255) NOT NULL,
  `order_phone` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `orders`
--

INSERT INTO `orders` (`order_id`, `user_id`, `order_datetime`, `order_status`, `order_paymentMethod`, `order_ammount`, `order_comments`, `order_address`, `order_phone`) VALUES
(12, 9, '2020-10-11 14:38:03', 'nuevo', 'cash', 1000, '', 'Falsa 123', '2615895678'),
(13, 14, '2020-10-11 14:39:51', 'nuevo', 'cash', 450, '', 'San Martin 1110', '2615679845'),
(14, 14, '2020-10-09 13:33:21', 'entregado', 'cash', 850, '', 'San Martin 1110', '2615679845');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orders_det`
--

CREATE TABLE `orders_det` (
  `det_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `dish_id` int(11) NOT NULL,
  `dish_quantity` int(11) NOT NULL,
  `dish_price` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `orders_det`
--

INSERT INTO `orders_det` (`det_id`, `order_id`, `dish_id`, `dish_quantity`, `dish_price`) VALUES
(15, 12, 1, 2, 300),
(16, 12, 5, 1, 400),
(17, 13, 2, 1, 200),
(18, 13, 3, 1, 250),
(19, 14, 5, 1, 400),
(20, 14, 6, 1, 450);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `user_alias` varchar(255) NOT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `user_last` varchar(255) DEFAULT NULL,
  `user_email` varchar(255) NOT NULL,
  `user_phone` varchar(255) DEFAULT NULL,
  `user_address` varchar(255) DEFAULT NULL,
  `user_pass` varchar(255) NOT NULL,
  `user_role` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`user_id`, `user_alias`, `user_name`, `user_last`, `user_email`, `user_phone`, `user_address`, `user_pass`, `user_role`) VALUES
(7, 'matata', 'Matias A.', 'Cruz', 'matcuz@gmail.com', '2616802034', 'Gutierrez 434', '$2b$10$sUSr8x57dxzMamBSI7rRUeGBalGg//1v/GSLvI0rYY11QdzBM1XGm', 'admin'),
(9, 'walt', 'Walter', 'Motanque', 'test@test.com', '2615895678', 'Calle falsa 123', '$2b$10$uSnF50FY71Tc7bCPcnEZie.ZNyJYuP5d2M6vwguR3MubjOcPJaydO', 'user'),
(13, 'juanita', 'Juana', 'Margura', 'juana@gmail.com', '2614909056', 'Pedro Molina 7690', '$2b$10$DWHlehXrPxQ/GnzJW60ADOznbKINIQ.v176ZoiMlo6vK2.0CwAve2', 'user'),
(14, 'pelota', 'Maria', 'Pelota', 'pelota@gmail.com', '2615679845', 'San Martin 1110', '$2b$10$WiD6ZLeoW6SaDdtQsdGzYO83qc70La.aMmRgjRtUDe/IAaXWB0MoK', 'user'),
(15, 'nole', 'Papá', 'Noel', 'santa@gmail.com', '2616456545', 'Polo Norte 456', '$2b$10$E8SUObiHc7D2lG8szlU4jel0syQL41M0ANHNeWV/pH9MasyySf/0e', 'user');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `dishes`
--
ALTER TABLE `dishes`
  ADD PRIMARY KEY (`dish_id`);

--
-- Indices de la tabla `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`);

--
-- Indices de la tabla `orders_det`
--
ALTER TABLE `orders_det`
  ADD PRIMARY KEY (`det_id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `dishes`
--
ALTER TABLE `dishes`
  MODIFY `dish_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `orders_det`
--
ALTER TABLE `orders_det`
  MODIFY `det_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
