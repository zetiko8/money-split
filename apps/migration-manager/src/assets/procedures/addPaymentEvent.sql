DROP PROCEDURE IF EXISTS `main`.`addPaymentEvent`;

CREATE PROCEDURE `main`.`addPaymentEvent`(
   argNamespaceId Bigint,
   argOwnerId BigInt,
   argUserId BigInt,
   argPaidBy TEXT,
   argBenefitors TEXT,
   argDescription TEXT,
   argNotes TEXT
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
        INSERT INTO `PaymentEvent`(
            created,
            edited,
            createdBy,
            editedBy,
            namespaceId,
            settlementId,
            paidBy,
            benefitors,
            description,
            notes
        ) VALUES (
            NOW(),
            NOW(),
            argUserId,
            argUserId,
            argNamespaceId,
            NULL,
            argPaidBy,
            argBenefitors,
            argDescription,
            argNotes
        );

        CALL getPaymentEventJson(LAST_INSERT_ID(), jsonResult);
    END IF;

    SELECT procedureError;
    SELECT jsonResult;
END
