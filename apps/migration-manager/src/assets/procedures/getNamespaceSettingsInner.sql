DROP PROCEDURE IF EXISTS `main`.`getNamespaceSettingsInner`;

CREATE PROCEDURE `main`.`getNamespaceSettingsInner`(
  inNamespaceId    BIGINT,
  OUT jsonResult   TEXT
)
BEGIN
  SELECT JSON_OBJECT(
      'namespaceName', n.name,
      'avatarColor', a.color,
      'avatarImage', a.dataUrl,
      'avatarUrl', a.url
    )
    INTO jsonResult
  FROM Namespace n
  LEFT JOIN Avatar a ON n.avatarId = a.id
  WHERE n.id = inNamespaceId
  LIMIT 1;
END