-- main.NamespaceOwner definition

CREATE TABLE `NamespaceOwner` (
  `ownerId` bigint NOT NULL,
  `namespaceId` bigint NOT NULL,
  PRIMARY KEY (`ownerId`,`namespaceId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;