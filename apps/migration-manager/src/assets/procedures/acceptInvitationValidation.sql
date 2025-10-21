DROP PROCEDURE IF EXISTS `main`.`acceptInvitationValidation`;

CREATE PROCEDURE acceptInvitationValidation (
   IN p_invitationKey varchar(100),
   IN p_ownerId BigInt,
   IN p_name varchar(100)
) 
BEGIN
  DECLARE procedureError TEXT;
  DECLARE jsonResult TEXT;
  DECLARE v_namespaceId BigInt;
  DECLARE v_invitationAccepted BOOLEAN;
  DECLARE v_invitationRejected BOOLEAN;
  DECLARE v_duplicateNameCount INT;
  DECLARE v_ownerAlreadyInNamespace INT;

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
      -- Check if owner is already in the namespace
      SELECT COUNT(*)
      INTO v_ownerAlreadyInNamespace
      FROM NamespaceOwner no
      WHERE no.namespaceId = v_namespaceId
      AND no.ownerId = p_ownerId;
      
      IF v_ownerAlreadyInNamespace > 0 THEN
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
        END IF;
      END IF;
    END IF;
  END IF;

  SELECT JSON_OBJECT('success', 1)
    INTO jsonResult;
  
  -- Return result
  SELECT procedureError;
  SELECT jsonResult;
END;
