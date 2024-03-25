-- main.Invitation definition

CREATE TABLE `Invitation` (
  `namespaceId` bigint NOT NULL,
  `accepted` tinyint(1) NOT NULL,
  `rejected` tinyint(1) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `created` datetime NOT NULL,
  `edited` datetime NOT NULL,
  `createdBy` bigint NOT NULL,
  `editedBy` bigint NOT NULL,
  `invitationKey` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1220 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;