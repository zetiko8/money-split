DROP PROCEDURE IF EXISTS `main`.`setDebtIsSettled`;

CREATE PROCEDURE setDebtIsSettled(
  IN p_byUser BIGINT,
  IN p_debtId BIGINT,
  IN p_isSettled BOOLEAN
)
BEGIN
  DECLARE jsonResult TEXT;
  DECLARE procedureError TEXT;
  DECLARE v_now DATETIME;

  SET v_now = NOW();

  -- Check if debt exists
  IF NOT EXISTS (
    SELECT 1 FROM SettlementDebt
    WHERE id = p_debtId
  ) THEN
    SELECT JSON_OBJECT('procedureError', 'RESOURCE_NOT_FOUND')
    INTO procedureError;
  ELSE
    -- Update the debt settlement status
    UPDATE `SettlementDebt`
    SET settled = p_isSettled,
        settledOn = IF(p_isSettled = 1, v_now, NULL),
        settledBy = IF(p_isSettled = 1, p_byUser, NULL),
        edited = v_now,
        editedBy = p_byUser
    WHERE id = p_debtId;

    -- Return success
    SELECT JSON_OBJECT('success', TRUE)
    INTO jsonResult;
  END IF;

  -- Return result
  SELECT procedureError;
  SELECT jsonResult;
END;
