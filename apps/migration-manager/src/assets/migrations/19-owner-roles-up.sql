CREATE TABLE `OwnerRole` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `OwnerId` bigint NOT NULL,
  `role`    varchar(100) not null,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;