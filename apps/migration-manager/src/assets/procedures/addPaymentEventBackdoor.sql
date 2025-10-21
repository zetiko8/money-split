DROP PROCEDURE IF EXISTS `main`.`addPaymentEventBackdoor`;

CREATE PROCEDURE `main`.`addPaymentEventBackdoor`(
   argNamespaceId Bigint,
   argUserId BigInt,
   argPaidBy JSON,
   argBenefitors JSON,
   argDescription TEXT,
   argNotes TEXT,
   argCreated datetime,
   argEdited datetime
)
BEGIN

    DECLARE jsonResult TEXT;
    DECLARE procedureError TEXT;
    DECLARE newPaymentEventId BIGINT;
    DECLARE i INT DEFAULT 0;
    DECLARE nodeCount INT;
    DECLARE nodeUserId BIGINT;
    DECLARE nodeAmount DECIMAL(10,2);
    DECLARE nodeCurrency VARCHAR(10);

    INSERT INTO `PaymentEvent`(
        created,
        edited,
        createdBy,
        editedBy,
        namespaceId,
        settlementId,
        description,
        notes
    ) VALUES (
        argCreated,
        argEdited,
        argUserId,
        argUserId,
        argNamespaceId,
        NULL,
        argDescription,
        argNotes
    );

    SET newPaymentEventId = LAST_INSERT_ID();

    -- Insert paidBy nodes (type 'P')
    SET nodeCount = JSON_LENGTH(argPaidBy);
    SET i = 0;
    WHILE i < nodeCount DO
        SET nodeUserId = JSON_EXTRACT(argPaidBy, CONCAT('$[', i, '].userId'));
        SET nodeAmount = JSON_EXTRACT(argPaidBy, CONCAT('$[', i, '].amount'));
        SET nodeCurrency = JSON_UNQUOTE(JSON_EXTRACT(argPaidBy, CONCAT('$[', i, '].currency')));
        
        INSERT INTO `PaymentNode`(paymentEventId, userId, amount, currency, type)
        VALUES (newPaymentEventId, nodeUserId, nodeAmount, nodeCurrency, 'P');
        
        SET i = i + 1;
    END WHILE;

    -- Insert benefitors nodes (type 'B')
    SET nodeCount = JSON_LENGTH(argBenefitors);
    SET i = 0;
    WHILE i < nodeCount DO
        SET nodeUserId = JSON_EXTRACT(argBenefitors, CONCAT('$[', i, '].userId'));
        SET nodeAmount = JSON_EXTRACT(argBenefitors, CONCAT('$[', i, '].amount'));
        SET nodeCurrency = JSON_UNQUOTE(JSON_EXTRACT(argBenefitors, CONCAT('$[', i, '].currency')));
        
        INSERT INTO `PaymentNode`(paymentEventId, userId, amount, currency, type)
        VALUES (newPaymentEventId, nodeUserId, nodeAmount, nodeCurrency, 'B');
        
        SET i = i + 1;
    END WHILE;

    CALL getPaymentEventJson(newPaymentEventId, jsonResult);

    SELECT procedureError;
    SELECT jsonResult;
END
