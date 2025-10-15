DROP PROCEDURE IF EXISTS `main`.`getAvatarById`;

CREATE PROCEDURE `main`.`getAvatarById`(
   argId BIGINT
)
BEGIN

  DECLARE jsonResult TEXT;
  DECLARE procedureError TEXT;

  IF (
    (
    SELECT COUNT(*)
      FROM Avatar o
     WHERE o.id = argId
    ) = 0
   ) THEN
    SELECT JSON_OBJECT('procedureError', 'RESOURCE_NOT_FOUND')
    INTO procedureError;
  ELSE

    SELECT (
        SELECT JSON_OBJECT(
          'id', o.id,
          'color', o.color,
          'url', o.url
        )
        FROM `Avatar` o
        WHERE o.id = argId
        LIMIT 1
    ) INTO jsonResult;

   END IF;

  -- Return result
  SELECT procedureError;
  SELECT jsonResult;
END;