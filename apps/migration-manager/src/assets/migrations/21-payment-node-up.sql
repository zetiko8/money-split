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
) ENGINE=InnoDB AUTO_INCREMENT=1009 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

alter table PaymentEvent
    drop column paidBy;

alter table PaymentEvent
    drop column benefitors;
    