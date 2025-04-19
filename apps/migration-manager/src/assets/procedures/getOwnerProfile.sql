DROP PROCEDURE IF EXISTS `main`.`getOwnerProfile`;

CREATE PROCEDURE `main`.`getOwnerProfile`(
   inOwnerId BigInt
)
BEGIN
	   
	  DECLARE jsonResult TEXT;
	  DECLARE procedureError TEXT;
  
    call readOwnerProfile(
            inOwnerId,
            jsonResult
         );
  
  	 SELECT procedureError;
  	 SELECT jsonResult;
END