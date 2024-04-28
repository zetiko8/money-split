CREATE PROCEDURE createOwner (
   argUsername varchar(100),
   argHash varchar(100),
   argAvatarColor varchar(100),
   argAvatarUrl varchar(100),
   argOwnerKey varchar(100)
) 
   BEGIN
	   
  	   DECLARE ERROR varchar(100);
  	   DECLARE AVATAR_ID BigInt;
	   
	   if (
	   	(
	   	SELECT COUNT(*)  FROM Owner o 
	   	WHERE o.username = argUsername
	   	)
	   ) THEN 
	  	SET ERROR = "OWNER_USERNAME_ALREADY_EXISTS";
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
	  	 
	  	 SELECT 
	  	 	o.`key`,
	  	 	o.id,
	  	 	o.username,
	  	 	o.avatarId 
	  	 FROM Owner o 
	 	 WHERE o.id = LAST_INSERT_ID();
	   END IF;
	  
	 SELECT ERROR; 
   END