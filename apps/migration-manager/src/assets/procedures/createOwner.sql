DROP PROCEDURE IF EXISTS `main`.`createOwner`;

CREATE PROCEDURE `main`.`createOwner`(
   argUsername varchar(100),
   argHash varchar(100),
   argAvatarColor varchar(100),
   argAvatarUrl varchar(100),
   argOwnerKey varchar(100)
)
BEGIN

  DECLARE jsonResult TEXT;
  DECLARE procedureError TEXT;

  DECLARE AVATAR_ID BigInt;

  IF (
    (
    SELECT COUNT(*)  FROM Owner o
    WHERE o.username = argUsername
    )
   ) THEN
    SELECT JSON_OBJECT('procedureError', 'OWNER_USERNAME_ALREADY_EXISTS')
    INTO procedureError;
  ELSE
    INSERT INTO `Avatar`
    (
     `color`,
     `url`
    )
    VALUES(
     argAvatarColor,
     argAvatarUrl
    );

    SET AVATAR_ID = LAST_INSERT_ID();

    INSERT INTO `Owner`
    (
      `key`,
      `username`,
      `hash`,
      `avatarId`
    )
    VALUES(
      argOwnerKey,
      argUsername,
      argHash,
      AVATAR_ID
    );

    SELECT (
        SELECT JSON_OBJECT(
          'key', o.`key`,
          'id', o.id,
          'username', o.username,
          'avatarId', o.avatarId
        )
        FROM `Owner` o
        WHERE o.id = LAST_INSERT_ID()
        LIMIT 1
    ) INTO jsonResult;

   END IF;

  -- Return result
  SELECT procedureError;
  SELECT jsonResult;
END;