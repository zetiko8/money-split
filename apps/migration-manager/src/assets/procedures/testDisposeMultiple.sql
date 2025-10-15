DROP PROCEDURE IF EXISTS `main`.`testDisposeMultiple`;

CREATE PROCEDURE `main`.`testDisposeMultiple`(
   IN argOwnerUsernames TEXT
)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE currentUsername VARCHAR(255);
    DECLARE currentOwnerId BIGINT;
    DECLARE cur CURSOR FOR 
        SELECT TRIM(value) 
        FROM JSON_TABLE(
            argOwnerUsernames,
            '$[*]' COLUMNS(value VARCHAR(255) PATH '$')
        ) AS jt;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    -- Open cursor and loop through usernames
    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO currentUsername;
        IF done THEN
            LEAVE read_loop;
        END IF;

        -- Find owner ID by username
        SELECT id INTO currentOwnerId
        FROM `Owner`
        WHERE username = currentUsername
        LIMIT 1;

        -- If owner exists, call testDispose
        IF currentOwnerId IS NOT NULL THEN
            CALL testDispose(currentOwnerId);
            SET currentOwnerId = NULL; -- Reset for next iteration
        END IF;
    END LOOP;

    CLOSE cur;
END
