-- main.Avatar definition

CREATE TABLE `Avatar` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `color` varchar(100) DEFAULT NULL,
  `dataUrl` blob,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2186 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;