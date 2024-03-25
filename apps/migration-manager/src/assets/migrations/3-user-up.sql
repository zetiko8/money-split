-- main.`User` definition

CREATE TABLE `User` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `namespaceId` bigint NOT NULL,
  `ownerId` bigint NOT NULL,
  `avatarId` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Users_FK` (`namespaceId`)
) ENGINE=InnoDB AUTO_INCREMENT=1597 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;