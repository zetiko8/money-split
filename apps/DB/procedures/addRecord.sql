DROP PROCEDURE IF EXISTS `main`.`addRecord`;

CREATE PROCEDURE `main`.`addRecord`(
   argNamespaceId Bigint,
   argOwnerId BigInt,
   argUserId BigInt,
   argData text
)
BEGIN

	  DECLARE jsonResult TEXT;
	  DECLARE procedureError TEXT;

	  IF (
	  	(
	  	SELECT COUNT(*)
	  	FROM NamespaceOwner nsow
	   	WHERE nsow.namespaceId = argNamespaceId
	   	AND nsow.ownerId = argOwnerId
	   	) = 0
	  ) THEN
	  	SELECT JSON_OBJECT('procedureError', 'UNAUTHORIZED')
	  	INTO procedureError;
	  ELSEIF (
	  	(
	  	SELECT COUNT(*)
	  	FROM `User` usr
	   	WHERE usr.namespaceId = argNamespaceId
	   	AND usr.ownerId = argOwnerId
	   	AND usr.id = argUserId
	   	) = 0
	  ) THEN
	  	SELECT JSON_OBJECT('procedureError', 'UNAUTHORIZED')
	  	INTO procedureError;
	  ELSE
          INSERT INTO `Record`(
                               created,
                               edited,
                               createdBy,
                               editedBy,
                               data,
                               namespaceId,
                               settlementId
          ) VALUES (
                    NOW(),
                    NOW(),
                    argUserId,
                    argUserId,
                    argData,
                    argNamespaceId,
                    NULL
                    );

	  	  SELECT (SELECT
	  	  	JSON_OBJECT(
	  	  		'id', r.id,
	  	  		'namespaceId', r.namespaceId,
	  	  		'created', r.created,
	  	  		'edited', r.edited,
	  	  		'createdBy', r.createdBy,
	  	  		'editedBy', r.editedBy,
	  	  		'settlementId', r.settlementId,
	  	  		'data', r.data
	  	  	)
		  FROM `Record` r
	      WHERE r.id = LAST_INSERT_ID()
	  	  LIMIT 1
	  	  ) INTO jsonResult;
	 END IF;

  	 SELECT procedureError;
  	 SELECT jsonResult;
   END