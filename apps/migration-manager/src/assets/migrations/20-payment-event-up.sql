CREATE TABLE `PaymentEvent` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created` datetime NOT NULL,
  `edited` datetime NOT NULL,
  `createdBy` bigint NOT NULL,
  `editedBy` bigint NOT NULL,
  `paidBy` text NOT NULL,
  `benefitors` text NOT NULL,
  `namespaceId` bigint DEFAULT NULL,
  `settlementId` bigint DEFAULT NULL,
  `description` varchar(100) NULL,
  `notes` varchar(500) NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1008 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;