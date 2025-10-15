DROP PROCEDURE IF EXISTS `main`.`getNamespaceView`;

CREATE PROCEDURE getNamespaceView(
  IN p_namespaceId INT,
  IN p_ownerId INT
)
BEGIN
  DECLARE jsonResult TEXT;
  DECLARE procedureError TEXT;

  -- Verify namespace exists and belongs to owner
  IF NOT EXISTS (
    SELECT 1 FROM NamespaceOwner
    WHERE namespaceId = p_namespaceId 
    AND ownerId = p_ownerId
  ) THEN
    SELECT JSON_OBJECT('procedureError', 'RESOURCE_NOT_FOUND')
    INTO procedureError;
  ELSE
    -- Build the complete namespace view JSON
    SELECT JSON_OBJECT(
      'id', n.id,
      'name', n.name,
      'avatarId', n.avatarId,
      'hasRecordsToSettle', CAST(EXISTS(
        SELECT 1 FROM PaymentEvent
        WHERE namespaceId = p_namespaceId
        AND settlementId IS NULL
      ) AS JSON),
      'invitations', (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', i.id,
            'email', i.email,
            'namespaceId', i.namespaceId,
            'accepted', i.accepted,
            'rejected', i.rejected,
            'created', i.created,
            'edited', i.edited,
            'createdBy', i.createdBy,
            'editedBy', i.editedBy,
            'invitationKey', i.invitationKey
          )
        )
        FROM Invitation i
        WHERE i.namespaceId = p_namespaceId
        AND i.accepted = 0
      ),
      'users', (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', u.id,
            'name', u.name,
            'namespaceId', u.namespaceId,
            'ownerId', u.ownerId,
            'avatarId', u.avatarId
          )
        )
        FROM `User` u
        WHERE u.namespaceId = p_namespaceId
      ),
      'ownerUsers', (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', u.id,
            'name', u.name,
            'namespaceId', u.namespaceId,
            'ownerId', u.ownerId,
            'avatarId', u.avatarId
          )
        )
        FROM `User` u
        WHERE u.namespaceId = p_namespaceId
        AND u.ownerId = p_ownerId
      ),
      'paymentEvents', (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', pe.id,
            'created', pe.created,
            'edited', pe.edited,
            'createdBy', JSON_OBJECT(
              'id', cu.id,
              'name', cu.name,
              'namespaceId', cu.namespaceId,
              'ownerId', cu.ownerId,
              'avatarId', cu.avatarId
            ),
            'editedBy', JSON_OBJECT(
              'id', eu.id,
              'name', eu.name,
              'namespaceId', eu.namespaceId,
              'ownerId', eu.ownerId,
              'avatarId', eu.avatarId
            ),
            'namespace', JSON_OBJECT(
              'id', n.id,
              'name', n.name,
              'avatarId', n.avatarId
            ),
            'settlementId', pe.settlementId,
            'settledOn', s.created,
            'description', pe.description,
            'notes', pe.notes,
            'paidBy', pe.paidBy,
            'benefitors', pe.benefitors
          )
        )
        FROM PaymentEvent pe
        INNER JOIN `User` cu ON pe.createdBy = cu.id
        INNER JOIN `User` eu ON pe.editedBy = eu.id
        INNER JOIN Namespace n ON pe.namespaceId = n.id
        LEFT JOIN Settlement s ON pe.settlementId = s.id
        WHERE pe.namespaceId = p_namespaceId
        ORDER BY pe.created DESC
      ),
      'settlements', (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'settlement', JSON_OBJECT(
              'id', s.id,
              'created', s.created,
              'createdBy', s.createdBy,
              'edited', s.edited,
              'editedBy', s.editedBy,
              'namespaceId', s.namespaceId
            ),
            'settledBy', JSON_OBJECT(
              'id', u.id,
              'name', u.name,
              'namespaceId', u.namespaceId,
              'ownerId', u.ownerId,
              'avatarId', u.avatarId
            ),
            'isAllSettled', (
              SELECT CASE WHEN COUNT(*) = SUM(CASE WHEN sd.settled = 1 THEN 1 ELSE 0 END)
                THEN TRUE ELSE FALSE END
              FROM SettlementDebt sd
              WHERE sd.settlementId = s.id
            ),
            'settleRecords', (
              SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                  'id', sd.id,
                  'created', sd.created,
                  'edited', sd.edited,
                  'createdBy', JSON_OBJECT(
                    'id', sdc.id,
                    'name', sdc.name,
                    'namespaceId', sdc.namespaceId,
                    'ownerId', sdc.ownerId,
                    'avatarId', sdc.avatarId
                  ),
                  'editedBy', JSON_OBJECT(
                    'id', sde.id,
                    'name', sde.name,
                    'namespaceId', sde.namespaceId,
                    'ownerId', sde.ownerId,
                    'avatarId', sde.avatarId
                  ),
                  'settled', sd.settled,
                  'settlementId', sd.settlementId,
                  'data', sd.data,
                  'settledOn', sd.settledOn,
                  'settledBy', IF(sd.settledBy IS NOT NULL,
                    JSON_OBJECT(
                      'id', sdb.id,
                      'name', sdb.name,
                      'namespaceId', sdb.namespaceId,
                      'ownerId', sdb.ownerId,
                      'avatarId', sdb.avatarId
                    ),
                    NULL
                  )
                )
              )
              FROM SettlementDebt sd
              INNER JOIN `User` sdc ON sd.createdBy = sdc.id
              INNER JOIN `User` sde ON sd.editedBy = sde.id
              LEFT JOIN `User` sdb ON sd.settledBy = sdb.id
              WHERE sd.settlementId = s.id
            )
          )
        )
        FROM Settlement s
        INNER JOIN `User` u ON s.createdBy = u.id
        WHERE s.namespaceId = p_namespaceId
        ORDER BY s.created DESC
      )
    )
    FROM Namespace n
    WHERE n.id = p_namespaceId
    INTO jsonResult;
  END IF;

  -- Return result
  SELECT procedureError;
  SELECT jsonResult;
END;
