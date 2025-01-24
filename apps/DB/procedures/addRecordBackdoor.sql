DROP PROCEDURE IF EXISTS `main`.`addRecordBackdoor`;

CREATE PROCEDURE `main`.`addRecordBackdoor`(
   argNamespaceId Bigint,
   argAddingOwnerId BigInt,
   argAddingUserId BigInt,
   argCreated datetime,
   argEdited datetime,
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
	   	AND nsow.ownerId = argAddingOwnerId
	   	) = 0
	  ) THEN
	  	SELECT JSON_OBJECT('procedureError', 'UNAUTHORIZED')
	  	INTO procedureError;
	  ELSEIF (
	  	(
	  	SELECT COUNT(*)
	  	FROM `User` usr
	   	WHERE usr.namespaceId = argNamespaceId
	   	AND usr.ownerId = argAddingOwnerId
	   	AND usr.id = argAddingUserId
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
                    argCreated,
                    argEdited,
                    argAddingUserId,
                    argAddingUserId,
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