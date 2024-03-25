-- main.Record definition

CREATE TABLE `Record` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created` datetime NOT NULL,
  `edited` datetime NOT NULL,
  `createdBy` bigint NOT NULL,
  `editedBy` bigint NOT NULL,
  `data` text NOT NULL,
  `namespaceId` bigint DEFAULT NULL,
  `settlementId` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Record_FK` (`createdBy`),
  KEY `Record_FK_1` (`editedBy`)
) ENGINE=InnoDB AUTO_INCREMENT=800 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;