DROP PROCEDURE IF EXISTS `main`.`getInvitationJson`;

CREATE PROCEDURE getInvitationJson(
    IN p_invitationId BIGINT,
    OUT p_jsonResult TEXT
)
BEGIN
    SELECT (
        SELECT JSON_OBJECT(
            'id', i.id,
            'email', i.email,
            'created', i.created,
            'edited', i.edited,
            'createdBy', i.createdBy,
            'editedBy', i.editedBy,
            'accepted', CAST(i.accepted AS JSON),
            'rejected', CAST(i.rejected AS JSON),
            'invitationKey', i.invitationKey,
            'namespaceId', i.namespaceId
        )
        FROM Invitation i
        WHERE i.id = p_invitationId
        LIMIT 1
    ) INTO p_jsonResult;
END;
