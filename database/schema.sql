CREATE DATABASE `stylishoes` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci */;

-- stylishoes.users definition
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(150) NOT NULL,
  `date_creation` timestamp NULL DEFAULT current_timestamp(),
  `name` varchar(100) NOT NULL,
  `lastname` varchar(100) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `admin` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE = InnoDB AUTO_INCREMENT = 4 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_uca1400_ai_ci;

-- stylishoes.categories definition
CREATE TABLE IF NOT EXISTS `categories` (
  `id_category` tinyint(4) NOT NULL AUTO_INCREMENT,
  `name` enum('women', 'men', 'unisex') DEFAULT NULL,
  PRIMARY KEY (`id_category`)
) ENGINE = InnoDB AUTO_INCREMENT = 4 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_uca1400_ai_ci;

-- stylishoes.products definition
CREATE TABLE IF NOT EXISTS `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_category` tinyint(4) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` int(11) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `size` varchar(255) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 14 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_uca1400_ai_ci;

-- stylishoes.purchases definition
CREATE TABLE IF NOT EXISTS`purchases` (
  `id_purchase` int(11) NOT NULL AUTO_INCREMENT,
  `id_customer` int(11) NOT NULL,
  `total` decimal(10, 2) NOT NULL,
  `date` datetime DEFAULT current_timestamp(),
  `status` enum('Approved', 'Cancelled') DEFAULT 'Approved',
  PRIMARY KEY (`id_purchase`),
  KEY `fk_purchases_users` (`id_customer`),
  CONSTRAINT `fk_purchases_users` FOREIGN KEY (`id_customer`) REFERENCES `users` (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 6 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_uca1400_ai_ci;