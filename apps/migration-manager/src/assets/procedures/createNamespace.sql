DROP PROCEDURE IF EXISTS `main`.`createNamespace`;

CREATE PROCEDURE createNamespace(
   IN namespaceName varchar(100),
   IN ownerId BIGINT,
   IN avatarColor varchar(100),
   IN avatarUrl varchar(100),
   IN ownerUsername varchar(100),
   IN ownerAvatarId BIGINT
)
BEGIN
  DECLARE jsonResult TEXT;
  DECLARE procedureError TEXT;

  DECLARE AVATAR_ID BigInt;
  DECLARE NAMESPACE_ID BigInt;

  -- Verify namespace exists and belongs to owner
  IF (
	   	(SELECT COUNT(*)
	   	FROM NamespaceOwner no2
	   	INNER JOIN Namespace n
	   	ON n.id = no2.namespaceId
	   	WHERE no2.ownerId = ownerId
	   	AND n.name = namespaceName) > 0
  ) THEN
    SELECT JSON_OBJECT('procedureError', 'RESOURCE_ALREADY_EXISTS')
    INTO procedureError;
  ELSE

    INSERT INTO `Avatar`
    (`color`, `url`)
    VALUES (avatarColor, avatarUrl);

     set AVATAR_ID = LAST_INSERT_ID();

     INSERT INTO `Namespace`
     (`name`, `avatarId`)
     VALUES (namespaceName, AVATAR_ID);

     set NAMESPACE_ID = LAST_INSERT_ID();

     INSERT INTO `NamespaceOwner`
     (`ownerId`, `namespaceId`)
     VALUES (ownerId, LAST_INSERT_ID());

    INSERT INTO `User`
    (`name`, namespaceId, ownerId, avatarId)
    VALUES (ownerUsername, NAMESPACE_ID, ownerId, ownerAvatarId);

    SELECT (
        SELECT JSON_OBJECT(
            'id', n.id,
            'name', n.name,
            'avatarId', n.avatarId
        )
        FROM `Namespace` n
        WHERE n.id = NAMESPACE_ID
        LIMIT 1
    ) INTO jsonResult;

  END IF;

  -- Return result
  SELECT procedureError;
  SELECT jsonResult;
END;
