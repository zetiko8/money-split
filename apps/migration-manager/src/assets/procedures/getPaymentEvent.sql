DROP PROCEDURE IF EXISTS `main`.`getPaymentEvent`;

CREATE PROCEDURE getPaymentEvent(
  IN p_namespaceId INT,
  IN p_ownerId INT,
  IN p_paymentEventId INT
)
BEGIN
  DECLARE jsonResult TEXT;
  DECLARE procedureError TEXT;

  -- Verify namespace exists and belongs to owner
  IF NOT EXISTS (
    SELECT 1 FROM NamespaceOwner
    WHERE namespaceId = p_namespaceId 
    AND ownerId = p_ownerId
  ) THEN
    SELECT JSON_OBJECT('procedureError', 'RESOURCE_NOT_FOUND')
    INTO procedureError;

  -- Verify payment event exists and belongs to namespace
  ELSEIF NOT EXISTS (
    SELECT 1 FROM PaymentEvent 
    WHERE id = p_paymentEventId 
    AND namespaceId = p_namespaceId
  ) THEN
    SELECT JSON_OBJECT('procedureError', 'RESOURCE_NOT_FOUND')
    INTO procedureError;
  ELSE
    -- Get payment event JSON using shared procedure
    CALL getPaymentEventJson(p_paymentEventId, jsonResult);
  END IF;

  -- Return result
  SELECT procedureError;
  SELECT jsonResult;
END;
