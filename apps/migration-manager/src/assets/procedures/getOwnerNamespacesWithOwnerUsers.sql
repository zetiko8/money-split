DROP PROCEDURE IF EXISTS `main`.`getOwnerNamespacesWithOwnerUsers`;

CREATE PROCEDURE `main`.`getOwnerNamespacesWithOwnerUsers` (
   argOwnerId varchar(100)
) 
  BEGIN
	   
  DECLARE jsonResult TEXT;
  DECLARE procedureError TEXT;
 
  SELECT (
    SELECT COALESCE(
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'id', n.id,
          'name', n.name,
          'avatarId', n.avatarId,
          'ownerUsers', (
            SELECT JSON_ARRAYAGG(
              JSON_OBJECT(
                'id', u.id,
                'name', u.name,
                'namespaceId', u.namespaceId,
                'ownerId', u.ownerId,
                'avatarId', u.avatarId
              )
            )
            FROM `User` u
            WHERE u.namespaceId = n.id
            AND u.ownerId = argOwnerId
          )
        )
      ), JSON_ARRAY()
    )
	  FROM NamespaceOwner no2 
	  INNER JOIN Namespace n 
	  ON n.id = no2.namespaceId
	  WHERE no2.ownerId = argOwnerId
  ) INTO jsonResult;
  	 
  SELECT procedureError;
  SELECT jsonResult;
END