-- main.SettlementDebt definition

CREATE TABLE `SettlementDebt` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created` datetime NOT NULL,
  `edited` datetime NOT NULL,
  `createdBy` bigint NOT NULL,
  `editedBy` bigint NOT NULL,
  `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `namespaceId` bigint DEFAULT NULL,
  `settlementId` bigint DEFAULT NULL,
  `settled` tinyint(1) NOT NULL,
  `settledOn` datetime DEFAULT NULL,
  `settledBy` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Record_FK` (`createdBy`) USING BTREE,
  KEY `Record_FK_1` (`editedBy`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=283 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;