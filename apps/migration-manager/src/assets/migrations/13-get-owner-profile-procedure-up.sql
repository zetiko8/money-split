CREATE PROCEDURE getOwnerProfile (
   inOwnerId BigInt
) 
   BEGIN
	   
	  DECLARE jsonResult TEXT;
	   
  	  SELECT (SELECT
  	  	JSON_OBJECT(
  	  		'owner', JSON_OBJECT(
  	  			'key', o.`key`, 
  	  			'id', o.id,
  	  			'username', o.username, 
  	  			'avatarId', o.avatarId
  	  		),
  	  		'users', (
  	  			SELECT JSON_ARRAYAGG(
		  	  	JSON_OBJECT(
		  	  		'user', JSON_OBJECT(
		  	  			'id', u.id, 
		  	  			'name', u.name,
		  	  			'avatarId', u.avatarId,
		  	  			'namespaceId', u.namespaceId,
		  	  			'ownerId', u.ownerId
		  	  		),
		  	  		'avatar', JSON_OBJECT(
		  	  			'id', a.id ,
		    			'color', a.color ,
		    			'url', a.url
		  	  		)
		  	  	)
		  	  ) 
		  	  FROM `User` u
		  	  JOIN Avatar a
		  	  ON u.avatarId = a.id
		  	  WHERE u.ownerId = inOwnerId
  	  		),
  	  		'avatar', (
  	  			SELECT JSON_OBJECT(
  	  				'id', a2.id,
  	  				'color', a2.color,
  	  				'url', a2.url
  	  			)
  	    	  	FROM Avatar a2
  	  		    WHERE a2.id = o.avatarId
  	  		    LIMIT 1			
  	  		)
  	  	)
  	  FROM `Owner` o
  	  WHERE o.id = inOwnerId
  	  LIMIT 1
  	  ) INTO jsonResult;
  	 
  	 SELECT jsonResult;
   END