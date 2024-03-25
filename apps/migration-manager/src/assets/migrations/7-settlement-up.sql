-- main.Settlement definition

CREATE TABLE `Settlement` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created` datetime NOT NULL,
  `createdBy` bigint NOT NULL,
  `edited` datetime NOT NULL,
  `editedBy` bigint NOT NULL,
  `namespaceId` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=97 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;