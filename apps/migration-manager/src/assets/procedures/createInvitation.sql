DROP PROCEDURE IF EXISTS `main`.`createInvitation`;

CREATE PROCEDURE createInvitation (
   IN p_email varchar(100),
   IN p_ownerId BigInt,
   IN p_invitationKey varchar(100),
   IN p_namespaceId BigInt
) 
   BEGIN
    DECLARE jsonResult TEXT;
    DECLARE procedureError TEXT;

    -- Check if this email was already invited to the namespace
	   IF (
	   	(
	   	SELECT COUNT(*)  FROM Invitation i 
	   	WHERE i.email = p_email
	   	AND i.namespaceId  = p_namespaceId
	   	)
	   ) THEN 
      SELECT JSON_OBJECT('procedureError', 'RESOURCE_ALREADY_EXISTS')
      INTO procedureError;
  -- Check if namespace exists and belongs to the inviter
  ELSEIF NOT EXISTS (
    SELECT 1 FROM NamespaceOwner n
     WHERE n.namespaceId = p_namespaceId
       AND n.ownerId = p_ownerId
  ) THEN
    SELECT JSON_OBJECT('procedureError', 'INVALID_REQUEST')
    INTO procedureError;
	ELSE
	  -- insert
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
		p_email,
		CURRENT_TIMESTAMP(), 
		CURRENT_TIMESTAMP(), 
		p_namespaceId,
		p_ownerId,
		p_ownerId,
		0, 
		0, 
		p_invitationKey
		);

    -- Get inserted invitation as JSON
    CALL getInvitationJson(LAST_INSERT_ID(), jsonResult);
	END IF;

  -- Return results
  SELECT procedureError;
  SELECT jsonResult;
END;