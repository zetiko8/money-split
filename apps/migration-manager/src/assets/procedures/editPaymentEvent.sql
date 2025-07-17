DELIMITER //

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
      paidBy = p_paidBy,
      benefitors = p_benefitors,
      description = p_description,
      notes = p_notes,
      edited = NOW(),
      editedBy = p_userId
    WHERE id = p_paymentEventId;

    -- Get updated payment event as JSON
    CALL getPaymentEventJson(p_paymentEventId, jsonResult);
  END IF;

  -- Return results
  SELECT procedureError;
  SELECT jsonResult;
END //

DELIMITER ;
