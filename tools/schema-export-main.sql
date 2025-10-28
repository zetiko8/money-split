-- Database Schema Export
-- Database: main
-- Generated: 2025-10-28T20:04:02.197Z
-- ================================================

-- Table: Avatar
CREATE TABLE `Avatar` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `color` varchar(100) DEFAULT NULL,
  `dataUrl` blob,
  `url` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2264 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: Invitation
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
) ENGINE=InnoDB AUTO_INCREMENT=1245 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: Migration
CREATE TABLE `Migration` (
  `id` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: Namespace
CREATE TABLE `Namespace` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `avatarId` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=580 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: NamespaceOwner
CREATE TABLE `NamespaceOwner` (
  `ownerId` bigint NOT NULL,
  `namespaceId` bigint NOT NULL,
  PRIMARY KEY (`ownerId`,`namespaceId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: Owner
CREATE TABLE `Owner` (
  `key` varchar(100) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `hash` varchar(100) NOT NULL,
  `avatarId` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1908 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: OwnerRole
CREATE TABLE `OwnerRole` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `OwnerId` bigint NOT NULL,
  `role` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: PaymentEvent
CREATE TABLE `PaymentEvent` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created` datetime NOT NULL,
  `edited` datetime NOT NULL,
  `createdBy` bigint NOT NULL,
  `editedBy` bigint NOT NULL,
  `namespaceId` bigint DEFAULT NULL,
  `settlementId` bigint DEFAULT NULL,
  `description` varchar(100) DEFAULT NULL,
  `notes` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1052 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: PaymentNode
CREATE TABLE `PaymentNode` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `paymentEventId` bigint NOT NULL,
  `userId` bigint NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(10) NOT NULL,
  `type` varchar(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_payment_event` (`paymentEventId`),
  CONSTRAINT `fk_payment_node_payment_event` FOREIGN KEY (`paymentEventId`) REFERENCES `PaymentEvent` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1141 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: Record
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

-- Table: Settlement
CREATE TABLE `Settlement` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created` datetime NOT NULL,
  `createdBy` bigint NOT NULL,
  `edited` datetime NOT NULL,
  `editedBy` bigint NOT NULL,
  `namespaceId` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=97 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: SettlementDebt
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

-- Table: User
CREATE TABLE `User` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `namespaceId` bigint NOT NULL,
  `ownerId` bigint NOT NULL,
  `avatarId` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Users_FK` (`namespaceId`)
) ENGINE=InnoDB AUTO_INCREMENT=1650 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

