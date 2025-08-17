DROP PROCEDURE IF EXISTS `main`.`editNamespaceSettings`;

CREATE PROCEDURE `main`.`editNamespaceSettings`(
   inOwnerId    BIGINT,
   inNamespaceId    BIGINT,
   inNamespaceName VARCHAR(100),
   inAvatarColor    VARCHAR(100),
   inAvatarUrl VARCHAR(100)
)
BEGIN
  DECLARE jsonResult TEXT;
  DECLARE procedureError TEXT;
  DECLARE procedureErrorDetails TEXT;

  DECLARE avatarId BIGINT;

  if (
    -- check if another namespace of this owner has the same name
    (SELECT COUNT(*)  FROM NamespaceOwner no2
    INNER JOIN Namespace n
    ON n.id = no2.namespaceId
    WHERE no2.ownerId = inOwnerId
    AND n.name = inNamespaceName
    AND n.id != inNamespaceId) > 0
  ) THEN
    SELECT JSON_OBJECT('procedureError', 'RESOURCE_ALREADY_EXISTS')
      INTO procedureError;
    SELECT JSON_OBJECT('procedureErrorDetails', 'Another namespace of this owner has the same name')
      INTO procedureErrorDetails;
    SELECT procedureError;
    SELECT jsonResult;
    SELECT procedureErrorDetails;
  ELSE
    call createAvatar(
            inAvatarColor,
            inAvatarUrl,
            avatarId
    );

    UPDATE Namespace
    SET name = inNamespaceName,
        avatarId = avatarId
    WHERE id = inNamespaceId;

    call getNamespaceSettingsInner(
            inNamespaceId,
            jsonResult
         );

  	 SELECT procedureError;
  	 SELECT jsonResult;
  END IF;

END