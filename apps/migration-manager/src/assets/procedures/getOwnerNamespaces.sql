DROP PROCEDURE IF EXISTS `main`.`getOwnerNamespaces`;

CREATE PROCEDURE `main`.`getOwnerNamespaces` (
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
          'avatarId', n.avatarId
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