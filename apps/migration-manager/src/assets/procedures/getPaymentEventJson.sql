DROP PROCEDURE IF EXISTS `main`.`getPaymentEventJson`;

CREATE PROCEDURE getPaymentEventJson(
    IN p_paymentEventId BIGINT,
    OUT p_jsonResult TEXT
)
BEGIN
    DECLARE paidByJson JSON;
    DECLARE benefitorsJson JSON;

    -- Get paidBy nodes (type 'P')
    SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
            'userId', pn.userId,
            'amount', pn.amount,
            'currency', pn.currency
        )
    ) INTO paidByJson
    FROM PaymentNode pn
    WHERE pn.paymentEventId = p_paymentEventId
    AND pn.type = 'P';

    -- Get benefitors nodes (type 'B')
    SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
            'userId', pn.userId,
            'amount', pn.amount,
            'currency', pn.currency
        )
    ) INTO benefitorsJson
    FROM PaymentNode pn
    WHERE pn.paymentEventId = p_paymentEventId
    AND pn.type = 'B';

    -- Build final JSON result
    SELECT JSON_OBJECT(
        'id', r.id,
        'namespaceId', r.namespaceId,
        'created', r.created,
        'edited', r.edited,
        'createdBy', r.createdBy,
        'editedBy', r.editedBy,
        'settlementId', r.settlementId,
        'paidBy', COALESCE(paidByJson, JSON_ARRAY()),
        'benefitors', COALESCE(benefitorsJson, JSON_ARRAY()),
        'description', r.description,
        'notes', r.notes
    ) INTO p_jsonResult
    FROM PaymentEvent r
    WHERE r.id = p_paymentEventId
    LIMIT 1;
END;
