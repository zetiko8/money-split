DROP PROCEDURE IF EXISTS `main`.`getNamespacePaymentEvents`;

DELIMITER //

CREATE PROCEDURE `main`.`getNamespacePaymentEvents`(
  IN p_namespaceId BIGINT,
  IN p_ownerId BIGINT
)
BEGIN
  DECLARE jsonResult TEXT;
  DECLARE procedureError TEXT;

  -- Check if namespace exists
  IF NOT EXISTS (
    SELECT 1 FROM Namespace 
    WHERE id = p_namespaceId
  ) THEN
    SELECT JSON_OBJECT('procedureError', 'INVALID_REQUEST')
    INTO procedureError;
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = procedureError;
  END IF;

  -- Check if owner has access to namespace
  IF NOT EXISTS (
    SELECT 1 FROM NamespaceOwner 
    WHERE namespaceId = p_namespaceId
    AND ownerId = p_ownerId
  ) THEN
    SELECT JSON_OBJECT('procedureError', 'UNAUTHORIZED')
    INTO procedureError;
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = procedureError;
  END IF;

  SELECT procedureError;
  -- Get payment events
  SELECT COALESCE(
    JSON_ARRAYAGG(
      JSON_OBJECT(
        'id', pe.id,
        'namespaceId', pe.namespaceId,
        'created', pe.created,
        'edited', pe.edited,
        'createdBy', pe.createdBy,
        'editedBy', pe.editedBy,
        'settlementId', pe.settlementId,
        'paidBy', pe.paidBy,
        'benefitors', pe.benefitors,
        'description', pe.description,
        'notes', pe.notes
      )
    ),
    '[]'
  ) as jsonResult
  FROM PaymentEvent pe
  WHERE pe.namespaceId = p_namespaceId
  ORDER BY pe.created DESC;
END //

DELIMITER ;
