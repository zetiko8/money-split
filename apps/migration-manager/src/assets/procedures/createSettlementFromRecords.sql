DROP PROCEDURE IF EXISTS `main`.`createSettlementFromRecords`;

CREATE PROCEDURE createSettlementFromRecords(
  IN p_byUser BIGINT,
  IN p_namespaceId BIGINT,
  IN p_paymentEventIds JSON,
  IN p_settleRecords JSON
)
BEGIN
  DECLARE jsonResult TEXT;
  DECLARE procedureError TEXT;
  DECLARE v_now DATETIME;
  DECLARE v_settlementId BIGINT;
  DECLARE v_idx INT DEFAULT 0;
  DECLARE v_count INT;
  DECLARE v_recordData JSON;
  DECLARE v_paymentEventId BIGINT;
  DECLARE v_alreadySettled INT;

  SET v_now = NOW();

  -- Verify namespace exists and user has access
  IF NOT EXISTS (
    SELECT 1 FROM NamespaceOwner
    WHERE namespaceId = p_namespaceId 
    AND ownerId = (SELECT ownerId FROM `User` WHERE id = p_byUser)
  ) THEN
    SELECT JSON_OBJECT('procedureError', 'RESOURCE_NOT_FOUND')
    INTO procedureError;
  ELSE
    -- Check if any payment events are already settled
    SELECT COUNT(*) INTO v_alreadySettled
    FROM PaymentEvent
    WHERE JSON_CONTAINS(p_paymentEventIds, CAST(id AS JSON))
    AND settlementId IS NOT NULL;

    IF v_alreadySettled > 0 THEN
      SELECT JSON_OBJECT('procedureError', 'USER_ACTION_CONFLICT')
      INTO procedureError;
    ELSE
      -- Create the settlement
      INSERT INTO `Settlement` (created, edited, createdBy, editedBy, namespaceId)
      VALUES (v_now, v_now, p_byUser, p_byUser, p_namespaceId);

      SET v_settlementId = LAST_INSERT_ID();

      -- Insert settlement debt records
      SET v_count = JSON_LENGTH(p_settleRecords);
      WHILE v_idx < v_count DO
        SET v_recordData = JSON_EXTRACT(p_settleRecords, CONCAT('$[', v_idx, ']'));
        
        INSERT INTO `SettlementDebt` 
        (created, edited, createdBy, editedBy, namespaceId, settlementId, settled, data, settledOn, settledBy)
        VALUES (v_now, v_now, p_byUser, p_byUser, p_namespaceId, v_settlementId, 0, v_recordData, NULL, NULL);

        SET v_idx = v_idx + 1;
      END WHILE;

      -- Link payment events to settlement
      SET v_idx = 0;
      SET v_count = JSON_LENGTH(p_paymentEventIds);
      WHILE v_idx < v_count DO
        SET v_paymentEventId = JSON_EXTRACT(p_paymentEventIds, CONCAT('$[', v_idx, ']'));
        
        UPDATE PaymentEvent
        SET settlementId = v_settlementId,
            edited = v_now,
            editedBy = p_byUser
        WHERE id = v_paymentEventId;

        SET v_idx = v_idx + 1;
      END WHILE;

      -- Return the created settlement
      SELECT JSON_OBJECT(
        'id', v_settlementId,
        'created', v_now,
        'edited', v_now,
        'createdBy', p_byUser,
        'editedBy', p_byUser,
        'namespaceId', p_namespaceId
      )
      INTO jsonResult;
    END IF;
  END IF;

  -- Return result
  SELECT procedureError;
  SELECT jsonResult;
END;
