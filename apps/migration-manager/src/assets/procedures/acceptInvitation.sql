DROP PROCEDURE IF EXISTS `main`.`acceptInvitation`;

CREATE PROCEDURE acceptInvitation (
   IN p_invitationKey varchar(100),
   IN p_ownerId BigInt,
   IN p_name varchar(100)
) 
BEGIN
  DECLARE jsonResult TEXT;
  DECLARE procedureError TEXT;
  DECLARE v_namespaceId BigInt;
  DECLARE v_ownerAvatarId BigInt;
  DECLARE v_invitationAccepted BOOLEAN;
  DECLARE v_invitationRejected BOOLEAN;
  DECLARE v_duplicateNameCount INT;

  -- Check if invitation exists
  IF NOT EXISTS (
    SELECT 1 FROM Invitation i 
    WHERE i.invitationKey = p_invitationKey
  ) THEN 
    SELECT JSON_OBJECT('procedureError', 'RESOURCE_NOT_FOUND')
    INTO procedureError;
  ELSE 
    -- Get invitation status and namespaceId
    SELECT i.accepted, i.rejected, i.namespaceId
    INTO v_invitationAccepted, v_invitationRejected, v_namespaceId
    FROM Invitation i
    WHERE i.invitationKey = p_invitationKey;
    
    -- Check if invitation is already accepted
    IF v_invitationAccepted = 1 THEN
      SELECT JSON_OBJECT('procedureError', 'INVALID_REQUEST')
      INTO procedureError;
    -- Check if invitation is already rejected
    ELSEIF v_invitationRejected = 1 THEN
      SELECT JSON_OBJECT('procedureError', 'INVALID_REQUEST')
      INTO procedureError;
    ELSE
      -- Check for duplicate user name in namespace
      SELECT COUNT(*)
      INTO v_duplicateNameCount
      FROM `User` u
      WHERE u.namespaceId = v_namespaceId
      AND u.name = p_name;
      
      IF v_duplicateNameCount > 0 THEN
        SELECT JSON_OBJECT('procedureError', 'INVALID_REQUEST')
        INTO procedureError;
      ELSE
        -- All validations passed, proceed with acceptance
        UPDATE Invitation
        SET accepted = 1, 
        editedBy = p_ownerId,
        edited = CURRENT_TIMESTAMP()
        WHERE invitationKey = p_invitationKey;
       
        -- Get updated invitation as JSON
        SELECT JSON_OBJECT(
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
        INTO jsonResult
        FROM Invitation i 
        WHERE invitationKey = p_invitationKey
        LIMIT 1;
       
        -- Add owner to namespace
        INSERT INTO NamespaceOwner 
        (
          `ownerId`,
          `namespaceId`
        )
        VALUES (
          p_ownerId,
          v_namespaceId
        );
       
        -- Get owner's avatar
        SELECT o.avatarId
        INTO v_ownerAvatarId
        FROM Owner o 
        WHERE o.id = p_ownerId;
      
        -- Create user in namespace
        INSERT INTO `User`
        (`name`, namespaceId, ownerId, avatarId)
        VALUES (p_name, v_namespaceId, p_ownerId, v_ownerAvatarId);
      END IF;
    END IF;
  END IF;
  
  -- Return results
  SELECT procedureError;
  SELECT jsonResult;
END;
