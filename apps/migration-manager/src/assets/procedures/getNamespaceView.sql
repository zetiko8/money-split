DROP PROCEDURE IF EXISTS `main`.`getNamespaceView`;

CREATE PROCEDURE getNamespaceView(
  IN p_namespaceId INT,
  IN p_ownerId INT
)
BEGIN
  DECLARE jsonResult TEXT;
  DECLARE procedureError TEXT;

  -- Verify namespace exists and belongs to owner
  IF NOT EXISTS (
    SELECT 1 FROM NamespaceOwner
    WHERE namespaceId = p_namespaceId 
    AND ownerId = p_ownerId
  ) THEN
    SELECT JSON_OBJECT('procedureError', 'RESOURCE_NOT_FOUND')
    INTO procedureError;
  ELSE
    -- Build the complete namespace view JSON
    SELECT JSON_OBJECT(
      'id', n.id,
      'name', n.name,
      'avatarId', n.avatarId,
      'invitations', (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', i.id,
            'email', i.email,
            'namespaceId', i.namespaceId,
            'accepted', i.accepted,
            'rejected', i.rejected,
            'created', i.created,
            'edited', i.edited,
            'createdBy', i.createdBy,
            'editedBy', i.editedBy,
            'invitationKey', i.invitationKey
          )
        )
        FROM Invitation i
        WHERE i.namespaceId = p_namespaceId
        AND i.accepted = 0
      ),
      'users', (
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
        WHERE u.namespaceId = p_namespaceId
      ),
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
        WHERE u.namespaceId = p_namespaceId
        AND u.ownerId = p_ownerId
      )
    )
    FROM Namespace n
    WHERE n.id = p_namespaceId
    INTO jsonResult;
  END IF;

  -- Return result
  SELECT procedureError;
  SELECT jsonResult;
END;
