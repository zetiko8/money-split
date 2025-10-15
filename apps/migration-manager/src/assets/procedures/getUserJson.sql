DROP PROCEDURE IF EXISTS `main`.`getUserJson`;

CREATE PROCEDURE getUserJson(
    IN p_userId BIGINT,
    OUT p_jsonResult TEXT
)
BEGIN
    SELECT (
        SELECT JSON_OBJECT(
            'id', r.id,
            'namespaceId', r.namespaceId,
            'ownerId', r.ownerId,
            'name', r.name,
            'avatarId', r.avatarId
        )
        FROM `User` r
        WHERE r.id = p_userId
        LIMIT 1
    ) INTO p_jsonResult;
END;
