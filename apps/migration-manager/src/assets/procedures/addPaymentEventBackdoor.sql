DROP PROCEDURE IF EXISTS `main`.`addPaymentEventBackdoor`;

CREATE PROCEDURE `main`.`addPaymentEventBackdoor`(
   argNamespaceId Bigint,
   argUserId BigInt,
   argPaidBy TEXT,
   argBenefitors TEXT,
   argDescription TEXT,
   argNotes TEXT,
   argCreated datetime,
   argEdited datetime
)
BEGIN

    DECLARE jsonResult TEXT;
    DECLARE procedureError TEXT;

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
        argCreated,
        argEdited,
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

    SELECT procedureError;
    SELECT jsonResult;
END
