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
        'createdBy', JSON_OBJECT(
                    'id', created_u.id,
                    'namespaceId', pe.namespaceId,
                    'ownerId', created_u.ownerId,
                    'name', created_u.name,
                    'avatarId', created_u.avatarId
                   ),
        'editedBy', JSON_OBJECT(
                    'id', edited_u.id,
                    'namespaceId', pe.namespaceId,
                    'ownerId', edited_u.ownerId,
                    'name', edited_u.name,
                    'avatarId', edited_u.avatarId
                   ),
        'created', pe.created,
        'edited', pe.edited,
        'settlementId', pe.settlementId,
        'settledOn', settlement.createdBy,
        'paidBy', pe.paidBy,
        'benefitors', pe.benefitors,
        'description', pe.description,
        'notes', pe.notes
      )
    ),
    '[]'
  ) as jsonResult
  FROM PaymentEvent pe
  JOIN `User` created_u
    ON pe.createdBy = created_u.id
  JOIN `Owner` created_o
    ON created_u.ownerId = created_o.id
  JOIN `User` edited_u
    ON pe.editedBy = edited_u.id
  JOIN `Owner` edited_o
    ON edited_u.ownerId = edited_o.id
  LEFT JOIN Settlement settlement
    ON pe.settlementId = settlement.id
  WHERE pe.namespaceId = p_namespaceId
  ORDER BY pe.created DESC;
END //

DELIMITER ;
