DROP PROCEDURE IF EXISTS `main`.`getSettlementListView`;

CREATE PROCEDURE getSettlementListView(
  IN p_namespaceId INT
)
BEGIN
  DECLARE jsonResult TEXT;
  DECLARE procedureError TEXT;

  SELECT (
    SELECT COALESCE(
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'settlement', JSON_OBJECT(
                          'id', s.id,
                          'created', s.created,
                          'edited', s.edited,
                          'createdBy', s.createdBy,
                          'editedBy', s.editedBy
                        ),
          'settledBy', JSON_OBJECT(
                              'id', u.id,
                              'namespaceId', u.namespaceId,
                              'ownerId', u.ownerId,
                              'name', u.name,
                              'avatarId', u.avatarId
                          )
        )
      ), JSON_ARRAY()
    )
	  FROM Settlement s
	  JOIN `User` u
	  ON u.id = s.createdBy
	  WHERE s.namespaceId = p_namespaceId
  ) INTO jsonResult;

  -- Return result
  SELECT procedureError;
  SELECT jsonResult;
END;
