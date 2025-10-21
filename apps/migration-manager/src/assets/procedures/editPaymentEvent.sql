DROP PROCEDURE IF EXISTS `main`.`editPaymentEvent`;

CREATE PROCEDURE editPaymentEvent(
  IN p_namespaceId INT,
  IN p_ownerId INT,
  IN p_userId INT,
  IN p_paymentEventId INT,
  IN p_paidBy JSON,
  IN p_benefitors JSON,
  IN p_description VARCHAR(255),
  IN p_notes VARCHAR(255)
)
BEGIN
  DECLARE jsonResult TEXT;
  DECLARE procedureError TEXT;
  DECLARE i INT DEFAULT 0;
  DECLARE nodeCount INT;
  DECLARE nodeUserId BIGINT;
  DECLARE nodeAmount DECIMAL(10,2);
  DECLARE nodeCurrency VARCHAR(10);

  -- Check if payment event exists
  IF NOT EXISTS (
    SELECT 1 FROM PaymentEvent 
    WHERE id = p_paymentEventId
  ) THEN
    SELECT JSON_OBJECT('procedureError', 'INVALID_REQUEST')
    INTO procedureError;
  -- Check if payment event belongs to the namespace
  ELSEIF NOT EXISTS (
    SELECT 1 FROM PaymentEvent 
    WHERE id = p_paymentEventId 
    AND namespaceId = p_namespaceId
  ) THEN
    SELECT JSON_OBJECT('procedureError', 'INVALID_REQUEST')
    INTO procedureError;
  ELSE
    -- Update payment event
    UPDATE PaymentEvent
    SET 
      description = p_description,
      notes = p_notes,
      edited = NOW(),
      editedBy = p_userId
    WHERE id = p_paymentEventId;

    -- Delete existing payment nodes
    DELETE FROM PaymentNode WHERE paymentEventId = p_paymentEventId;

    -- Insert paidBy nodes (type 'P')
    SET nodeCount = JSON_LENGTH(p_paidBy);
    SET i = 0;
    WHILE i < nodeCount DO
      SET nodeUserId = JSON_EXTRACT(p_paidBy, CONCAT('$[', i, '].userId'));
      SET nodeAmount = JSON_EXTRACT(p_paidBy, CONCAT('$[', i, '].amount'));
      SET nodeCurrency = JSON_UNQUOTE(JSON_EXTRACT(p_paidBy, CONCAT('$[', i, '].currency')));
      
      INSERT INTO `PaymentNode`(paymentEventId, userId, amount, currency, type)
      VALUES (p_paymentEventId, nodeUserId, nodeAmount, nodeCurrency, 'P');
      
      SET i = i + 1;
    END WHILE;

    -- Insert benefitors nodes (type 'B')
    SET nodeCount = JSON_LENGTH(p_benefitors);
    SET i = 0;
    WHILE i < nodeCount DO
      SET nodeUserId = JSON_EXTRACT(p_benefitors, CONCAT('$[', i, '].userId'));
      SET nodeAmount = JSON_EXTRACT(p_benefitors, CONCAT('$[', i, '].amount'));
      SET nodeCurrency = JSON_UNQUOTE(JSON_EXTRACT(p_benefitors, CONCAT('$[', i, '].currency')));
      
      INSERT INTO `PaymentNode`(paymentEventId, userId, amount, currency, type)
      VALUES (p_paymentEventId, nodeUserId, nodeAmount, nodeCurrency, 'B');
      
      SET i = i + 1;
    END WHILE;

    -- Get updated payment event as JSON
    CALL getPaymentEventJson(p_paymentEventId, jsonResult);
  END IF;

  -- Return results
  SELECT procedureError;
  SELECT jsonResult;
END;
