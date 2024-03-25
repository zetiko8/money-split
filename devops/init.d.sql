-- main.Avatar definition

CREATE TABLE `Avatar` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `color` varchar(100) DEFAULT NULL,
  `dataUrl` blob,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=202 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- main.Namespace definition

CREATE TABLE `Namespace` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=153 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- main.NamespaceOwner definition

CREATE TABLE `NamespaceOwner` (
  `ownerId` bigint NOT NULL,
  `namespaceId` bigint NOT NULL,
  PRIMARY KEY (`ownerId`,`namespaceId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- main.Owner definition

CREATE TABLE `Owner` (
  `key` varchar(100) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `hash` varchar(100) NOT NULL,
  `avatarId` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=384 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- main.Record definition

CREATE TABLE `Record` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created` datetime NOT NULL,
  `edited` datetime NOT NULL,
  `createdBy` bigint NOT NULL,
  `editedBy` bigint NOT NULL,
  `data` text NOT NULL,
  `namespaceId` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Record_FK` (`createdBy`),
  KEY `Record_FK_1` (`editedBy`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- main.`User` definition

CREATE TABLE `User` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `namespaceId` bigint NOT NULL,
  `ownerId` bigint NOT NULL,
  `avatarId` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Users_FK` (`namespaceId`)
) ENGINE=InnoDB AUTO_INCREMENT=212 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;