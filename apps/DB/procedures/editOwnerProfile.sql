DROP PROCEDURE IF EXISTS `main`.`editOwnerProfile`;

CREATE PROCEDURE `main`.`editOwnerProfile`(
   argOwnerId       BigInt,
   argAvatarUrl     varchar(100),
   argAvatarColor   varchar(100)
)
BEGIN
	   
	  DECLARE jsonResult TEXT;
	  DECLARE procedureError TEXT;
	  DECLARE AVATAR_ID bigint;

	  call createAvatar(
              argAvatarColor,
              argAvatarUrl,
              AVATAR_ID
           );

	UPDATE `Owner`
	SET
	    avatarId = AVATAR_ID
	WHERE id = argOwnerId;

	UPDATE `User`
    SET
	    avatarId = AVATAR_ID
	WHERE ownerId = argOwnerId;

    call readOwnerProfile(
            argOwnerId,
            jsonResult
         );
  
    SELECT procedureError;
  	SELECT jsonResult;
END