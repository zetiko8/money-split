DELIMITER //

DROP PROCEDURE IF EXISTS `main`.`getPaymentEventJson`;

CREATE PROCEDURE getPaymentEventJson(
    IN p_paymentEventId BIGINT,
    OUT p_jsonResult TEXT
)
BEGIN
    SELECT (
        SELECT JSON_OBJECT(
            'id', r.id,
            'namespaceId', r.namespaceId,
            'created', r.created,
            'edited', r.edited,
            'createdBy', r.createdBy,
            'editedBy', r.editedBy,
            'settlementId', r.settlementId,
            'paidBy', r.paidBy,
            'benefitors', r.benefitors,
            'description', r.description,
            'notes', r.notes
        )
        FROM PaymentEvent r
        WHERE r.id = p_paymentEventId
        LIMIT 1
    ) INTO p_jsonResult;
END //

DELIMITER ;
