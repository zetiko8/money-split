DROP PROCEDURE IF EXISTS `main`.`getNamespaceSettings`;

CREATE PROCEDURE `main`.`getNamespaceSettings`(
   inNamespaceId    BIGINT
)
BEGIN
  DECLARE jsonResult TEXT;
  DECLARE procedureError TEXT;

  IF (
    (
    SELECT COUNT(*)
    FROM Namespace ns
    WHERE ns.id = inNamespaceId
    ) = 0
  ) THEN
    SELECT JSON_OBJECT('procedureError', 'UNAUTHORIZED')
    INTO procedureError;
    SELECT procedureError;
    SELECT jsonResult;
  ELSE
    call getNamespaceSettingsInner(
            inNamespaceId,
            jsonResult
         );
    SELECT procedureError;
    SELECT jsonResult;
  END IF;

END