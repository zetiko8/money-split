DROP PROCEDURE IF EXISTS `main`.`testDispose`;

CREATE PROCEDURE `main`.`testDispose`(
   argOwnerId BigInt
)
BEGIN

    DROP TEMPORARY TABLE IF EXISTS namespaceIds;
    CREATE TEMPORARY TABLE namespaceIds AS
    (
        SELECT ns.namespaceId
        FROM `NamespaceOwner` ns
        WHERE ns.ownerId = argOwnerId
    );

    DELETE FROM `NamespaceOwner` nso
    WHERE nso.namespaceId = (
        SELECT ns.namespaceId
        FROM namespaceIds ns
        WHERE ns.namespaceId = nso.namespaceId
        );

    DELETE FROM `Invitation` nso
    WHERE nso.namespaceId = (
        SELECT ns.namespaceId
        FROM namespaceIds ns
        WHERE ns.namespaceId = nso.namespaceId
        );

    DELETE FROM `Record` nso
    WHERE nso.namespaceId = (
        SELECT ns.namespaceId
        FROM namespaceIds ns
        WHERE ns.namespaceId = nso.namespaceId
        );

    DELETE FROM `SettlementDebt` nso
    WHERE nso.namespaceId = (
        SELECT ns.namespaceId
        FROM namespaceIds ns
        WHERE ns.namespaceId = nso.namespaceId
        );

    DELETE FROM `User` nso
    WHERE nso.namespaceId = (
        SELECT ns.namespaceId
        FROM namespaceIds ns
        WHERE ns.namespaceId = nso.namespaceId
        );

    DELETE FROM `Avatar` nso
    WHERE nso.id = (
        SELECT ns.avatarId
        FROM `Owner` ns
        WHERE ns.id = argOwnerId
        );

    DELETE FROM `Namespace` nso
    WHERE nso.id = (
        SELECT ns.namespaceId
        FROM namespaceIds ns
        WHERE ns.namespaceId = nso.id
        );

    DELETE FROM `Owner`
    WHERE id = argOwnerId;
END