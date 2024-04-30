CREATE PROCEDURE getInvitationView (
   argInvitationKey varchar(100)
) 
   BEGIN
	   
	  DECLARE jsonResult TEXT;
	  DECLARE procedureError TEXT;
	 
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
	  	  		'namespace', (
	  	  			SELECT JSON_OBJECT(
	  	  				'id', n.id,
	  	  				'name', n.name,
	  	  				'avatarId', n.avatarId
	  	  			)
	  	    	  	FROM Namespace n
	  	  		    WHERE n.id = i.namespaceId
	  	  		    LIMIT 1			
  	  			)
	  	  		
	  	  	)
		  FROM Invitation i 
	      WHERE invitationKey = argInvitationKey
	  	  LIMIT 1
	  	  ) INTO jsonResult;
	 END IF;
  	 
  	 SELECT procedureError;
  	 SELECT jsonResult;
   END