CREATE TABLE `Owner` (
  `key` varchar(100) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `hash` varchar(100) NOT NULL,
  `avatarId` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1857 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
