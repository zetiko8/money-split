CREATE PROCEDURE createInvitation (
   email varchar(100),
   ownerId BigInt,
   invitationKey varchar(100),
   namespaceId BigInt
) 
   BEGIN
	   
  	   DECLARE ERROR varchar(100);
	   
	   if (
	   	(
	   	SELECT COUNT(*)  FROM Invitation i 
	   	WHERE i.email = email
	   	AND i.namespaceId  = namespaceId
	   	)
	   ) THEN 
	  	SET ERROR = "RESOURCE_ALREADY_EXISTS";
	   ELSE
		INSERT INTO `Invitation` 
		(
		`email`,
		`created`, 
		`edited`, 
		`namespaceId`, 
		`createdBy`, 
		`editedBy`, 
		`accepted`, 
		`rejected`, 
		`invitationKey`
		) 
		VALUES(
		email, 
		CURRENT_TIMESTAMP(), 
		CURRENT_TIMESTAMP(), 
		namespaceId, 
		ownerId, 
		ownerId, 
		0, 
		0, 
		invitationKey
		);
	   END IF;
	  
	 SELECT ERROR;
	 SELECT * FROM Invitation i 
	 WHERE i.id = LAST_INSERT_ID() 
	 ; 
   END