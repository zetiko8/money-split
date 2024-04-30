CREATE PROCEDURE acceptInvitation (
   argInvitationKey varchar(100),
   argOwnerId BigInt,
   argName varchar(100)
) 
   BEGIN
	   
	  DECLARE jsonResult TEXT;
	  DECLARE procedureError TEXT;
	  DECLARE namespaceId BigInt;
	  DECLARE ownerAvatarId BigInt;
	 
	  IF (
	  	(
	  	SELECT COUNT(*) 
	  	FROM Invitation i 
	   	WHERE i.invitationKey = argInvitationKey
	   	) = 0
	  ) THEN 
	  	SELECT JSON_OBJECT('procedureError', 'RESOURCE_NOT_FOUND')
	  	INTO procedureError;
	  ELSE 
	      UPDATE Invitation
	      SET accepted = 1, 
	      editedBy = argOwnerId,
	      edited = CURRENT_TIMESTAMP()
	      WHERE invitationKey = argInvitationKey;
		 
	  	  SELECT (SELECT
	  	  	JSON_OBJECT(
	  	  		'id', i.id,
	  	  		'email', i.email,
	  	  		'created', i.created,
	  	  		'edited', i.edited,
	  	  		'createdBy', i.createdBy,
	  	  		'editedBy', i.editedBy,
	  	  		'accepted', IF(i.accepted = 1, cast(TRUE as json), cast(FALSE as json)),
	  	  		'rejected', IF(i.rejected = 1, cast(TRUE as json), cast(FALSE as json)),
	  	  		'invitationKey', i.invitationKey,
	  	  		'namespaceId', i.namespaceId
	  	  	)
		  FROM Invitation i 
	      WHERE invitationKey = argInvitationKey
	  	  LIMIT 1
	  	  ) INTO jsonResult;
	  	 
	  	  SELECT JSON_EXTRACT(
	    	jsonResult,
	    	'$.namespaceId'
		  ) INTO namespaceId;
		 
		  INSERT INTO NamespaceOwner 
	      (
	      	`ownerId`,
	      	`namespaceId`
	      )
	      VALUES (
	      	argOwnerId,
	      	namespaceId
	      );
	     
	     SELECT o.avatarId
	     INTO ownerAvatarId
	     FROM Owner o 
	     WHERE o.id = argOwnerId;
	    
		 INSERT INTO `User`
		 (`name`, namespaceId, ownerId, avatarId)
	     VALUES (argName, namespaceId, argOwnerId, ownerAvatarId);
	 END IF;
  	 
  	 SELECT procedureError;
  	 SELECT jsonResult;
   END