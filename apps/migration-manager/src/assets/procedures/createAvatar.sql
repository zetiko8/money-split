DROP PROCEDURE IF EXISTS `main`.`createAvatar`;

CREATE PROCEDURE `main`.`createAvatar`(
   argAvatarColor       varchar(100),
   argAvatarUrl         varchar(100),
   OUT outAvatarId      bigint
)
BEGIN

      DECLARE AVATAR_ID bigint;

	  INSERT INTO `Avatar`(
            `color`,
            `url`
      )
      VALUES(
            argAvatarColor,
            argAvatarUrl
      );

      SET outAvatarId = LAST_INSERT_ID();
END
