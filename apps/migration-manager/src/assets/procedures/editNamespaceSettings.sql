DROP PROCEDURE IF EXISTS `main`.`editNamespaceSettings`;

CREATE PROCEDURE `main`.`editNamespaceSettings`(
   inNamespaceId    BIGINT,
   inNamespaceName VARCHAR(100),
   inAvatarColor    VARCHAR(100),
   inAvatarUrl VARCHAR(100)
)
BEGIN
  DECLARE jsonResult TEXT;
  DECLARE procedureError TEXT;

  DECLARE avatarId BIGINT;

  if (
    (SELECT COUNT(*)  FROM NamespaceOwner no2
    INNER JOIN Namespace n
    ON n.id = no2.namespaceId
    WHERE no2.ownerId = ownerId
    AND n.name = inNamespaceName
    AND n.id != inNamespaceId) > 0
  ) THEN
    SELECT JSON_OBJECT('procedureError', 'RESOURCE_ALREADY_EXISTS')
    INTO procedureError;
    SELECT procedureError;
    SELECT jsonResult;
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