CREATE PROCEDURE createNamespace1 (
   namespaceName varchar(100),
   ownerId BigInt,
   avatarColor varchar(100),
   avatarUrl varchar(100),
   ownerUsername varchar(100),
   ownerAvatarId BigInt
) 
   BEGIN
	   
  	   DECLARE ERROR varchar(100);
  	   DECLARE AVATAR_ID BigInt;
  	   DECLARE NAMESPACE_ID BigInt;
	   
	   if (
	   	(SELECT COUNT(*)  FROM NamespaceOwner no2 
	   	INNER JOIN Namespace n 
	   	ON n.id = no2.namespaceId
	   	WHERE no2.ownerId = ownerId
	   	AND n.name = namespaceName) > 0
	   ) THEN 
	  	SET ERROR = "RESOURCE_ALREADY_EXISTS";
	   ELSE
		   	INSERT INTO `Avatar`
		   	(`color`, `url`)
		   	VALUES (avatarColor, avatarUrl);
		   
		   set AVATAR_ID = LAST_INSERT_ID();
	   
		   INSERT INTO `Namespace` 
		   (`name`, `avatarId`)
		   VALUES (namespaceName, AVATAR_ID);
		  
		   set NAMESPACE_ID = LAST_INSERT_ID();
		    
		   SELECT * FROM `Namespace` ns
		   WHERE ns.id = NAMESPACE_ID;
		  
		   INSERT INTO `NamespaceOwner`
		   (`ownerId`, `namespaceId`)
		   VALUES (ownerId, LAST_INSERT_ID());
		  
		  INSERT INTO `User`
		  (`name`, namespaceId, ownerId, avatarId)
		  VALUES (ownerUsername, NAMESPACE_ID, ownerId, ownerAvatarId);
	   END IF;
	  
	  SELECT ERROR;
   END