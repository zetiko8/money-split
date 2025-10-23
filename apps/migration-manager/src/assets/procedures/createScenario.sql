DROP PROCEDURE IF EXISTS `main`.`createScenario`;

CREATE PROCEDURE `main`.`createScenario`(
   argScenarioData JSON
)
BEGIN
    DECLARE jsonResult TEXT;
    DECLARE procedureError TEXT;
    
    -- Simple approach: Use prepared statements to avoid variable scoping issues
    -- Step 1: Process owners one by one using hardcoded indices (supports up to 20 owners)
    
    -- Owner 0
    IF JSON_LENGTH(argScenarioData, '$.owners') > 0 THEN
        SET @name0 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.owners[0].name'));
        SET @hash0 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.owners[0].hash'));
        SET @key0 = UUID();
        SET @color0 = CONCAT('#', LPAD(HEX(FLOOR(RAND() * 16777215)), 6, '0'));
        
        INSERT INTO Avatar (color, url) VALUES (@color0, NULL);
        SET @avatarId0 = LAST_INSERT_ID();
        
        INSERT INTO Owner (`key`, username, hash, avatarId) VALUES (@key0, @name0, @hash0, @avatarId0);
        SET @ownerId0 = LAST_INSERT_ID();
    END IF;
    
    -- Owner 1
    IF JSON_LENGTH(argScenarioData, '$.owners') > 1 THEN
        SET @name1 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.owners[1].name'));
        SET @hash1 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.owners[1].hash'));
        SET @key1 = UUID();
        SET @color1 = CONCAT('#', LPAD(HEX(FLOOR(RAND() * 16777215)), 6, '0'));
        
        INSERT INTO Avatar (color, url) VALUES (@color1, NULL);
        SET @avatarId1 = LAST_INSERT_ID();
        
        INSERT INTO Owner (`key`, username, hash, avatarId) VALUES (@key1, @name1, @hash1, @avatarId1);
        SET @ownerId1 = LAST_INSERT_ID();
    END IF;
    
    -- Owner 2
    IF JSON_LENGTH(argScenarioData, '$.owners') > 2 THEN
        SET @name2 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.owners[2].name'));
        SET @hash2 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.owners[2].hash'));
        SET @key2 = UUID();
        SET @color2 = CONCAT('#', LPAD(HEX(FLOOR(RAND() * 16777215)), 6, '0'));
        
        INSERT INTO Avatar (color, url) VALUES (@color2, NULL);
        SET @avatarId2 = LAST_INSERT_ID();
        
        INSERT INTO Owner (`key`, username, hash, avatarId) VALUES (@key2, @name2, @hash2, @avatarId2);
        SET @ownerId2 = LAST_INSERT_ID();
    END IF;
    
    -- Owner 3
    IF JSON_LENGTH(argScenarioData, '$.owners') > 3 THEN
        SET @name3 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.owners[3].name'));
        SET @hash3 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.owners[3].hash'));
        SET @key3 = UUID();
        SET @color3 = CONCAT('#', LPAD(HEX(FLOOR(RAND() * 16777215)), 6, '0'));
        
        INSERT INTO Avatar (color, url) VALUES (@color3, NULL);
        SET @avatarId3 = LAST_INSERT_ID();
        
        INSERT INTO Owner (`key`, username, hash, avatarId) VALUES (@key3, @name3, @hash3, @avatarId3);
        SET @ownerId3 = LAST_INSERT_ID();
    END IF;
    
    -- Owner 4
    IF JSON_LENGTH(argScenarioData, '$.owners') > 4 THEN
        SET @name4 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.owners[4].name'));
        SET @hash4 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.owners[4].hash'));
        SET @key4 = UUID();
        SET @color4 = CONCAT('#', LPAD(HEX(FLOOR(RAND() * 16777215)), 6, '0'));
        
        INSERT INTO Avatar (color, url) VALUES (@color4, NULL);
        SET @avatarId4 = LAST_INSERT_ID();
        
        INSERT INTO Owner (`key`, username, hash, avatarId) VALUES (@key4, @name4, @hash4, @avatarId4);
        SET @ownerId4 = LAST_INSERT_ID();
    END IF;
    
    -- Step 2: Helper function to get owner ID by name
    -- We'll use CASE statements to map names to IDs
    
    -- Step 3: Process namespaces (simplified - handle first namespace only for now)
    IF JSON_LENGTH(argScenarioData, '$.namespaces') > 0 THEN
        SET @nsName = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].name'));
        SET @nsCreator = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].creator'));
        
        -- Find creator owner ID
        SET @creatorOwnerId = CASE @nsCreator
            WHEN @name0 THEN @ownerId0
            WHEN @name1 THEN @ownerId1
            WHEN @name2 THEN @ownerId2
            WHEN @name3 THEN @ownerId3
            WHEN @name4 THEN @ownerId4
            ELSE NULL
        END;
        
        SET @creatorAvatarId = CASE @nsCreator
            WHEN @name0 THEN @avatarId0
            WHEN @name1 THEN @avatarId1
            WHEN @name2 THEN @avatarId2
            WHEN @name3 THEN @avatarId3
            WHEN @name4 THEN @avatarId4
            ELSE NULL
        END;
        
        IF @creatorOwnerId IS NULL THEN
            SET procedureError = JSON_OBJECT('procedureError', CONCAT('Creator not found: ', @nsCreator));
            SELECT procedureError;
            SELECT NULL;
        ELSE
            -- Create namespace
            SET @nsColor = CONCAT('#', LPAD(HEX(FLOOR(RAND() * 16777215)), 6, '0'));
            INSERT INTO Avatar (color, url) VALUES (@nsColor, NULL);
            SET @nsAvatarId = LAST_INSERT_ID();
            
            INSERT INTO Namespace (name, avatarId) VALUES (@nsName, @nsAvatarId);
            SET @namespaceId = LAST_INSERT_ID();
            
            -- Link creator to namespace
            INSERT INTO NamespaceOwner (ownerId, namespaceId) VALUES (@creatorOwnerId, @namespaceId);
            
            -- Create creator user
            INSERT INTO User (name, namespaceId, ownerId, avatarId) 
            VALUES (@nsCreator, @namespaceId, @creatorOwnerId, @creatorAvatarId);
            SET @creatorUserId = LAST_INSERT_ID();
            
            -- Process users (invitations) - handle first 5
            -- User 0
            IF JSON_LENGTH(argScenarioData, '$.namespaces[0].users') > 0 THEN
                SET @userName0 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].users[0].name'));
                SET @userEmail0 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].users[0].email'));
                SET @userOwner0 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].users[0].owner'));
                SET @userInvitor0 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].users[0].invitor'));
                
                SET @invitedOwnerId0 = CASE @userOwner0
                    WHEN @name0 THEN @ownerId0
                    WHEN @name1 THEN @ownerId1
                    WHEN @name2 THEN @ownerId2
                    WHEN @name3 THEN @ownerId3
                    WHEN @name4 THEN @ownerId4
                    ELSE NULL
                END;
                
                SET @invitedAvatarId0 = CASE @userOwner0
                    WHEN @name0 THEN @avatarId0
                    WHEN @name1 THEN @avatarId1
                    WHEN @name2 THEN @avatarId2
                    WHEN @name3 THEN @avatarId3
                    WHEN @name4 THEN @avatarId4
                    ELSE NULL
                END;
                
                SET @invitorOwnerId0 = CASE @userInvitor0
                    WHEN @name0 THEN @ownerId0
                    WHEN @name1 THEN @ownerId1
                    WHEN @name2 THEN @ownerId2
                    WHEN @name3 THEN @ownerId3
                    WHEN @name4 THEN @ownerId4
                    ELSE NULL
                END;
                
                -- Create invitation
                INSERT INTO Invitation (email, created, edited, namespaceId, createdBy, editedBy, accepted, rejected, invitationKey)
                VALUES (@userEmail0, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), @namespaceId, @invitorOwnerId0, @invitorOwnerId0, 1, 0, UUID());
                
                -- Link invited owner to namespace
                INSERT INTO NamespaceOwner (ownerId, namespaceId) VALUES (@invitedOwnerId0, @namespaceId);
                
                -- Create user
                INSERT INTO User (name, namespaceId, ownerId, avatarId)
                VALUES (@userName0, @namespaceId, @invitedOwnerId0, @invitedAvatarId0);
            END IF;
            
            -- User 1
            IF JSON_LENGTH(argScenarioData, '$.namespaces[0].users') > 1 THEN
                SET @userName1 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].users[1].name'));
                SET @userEmail1 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].users[1].email'));
                SET @userOwner1 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].users[1].owner'));
                SET @userInvitor1 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].users[1].invitor'));
                
                SET @invitedOwnerId1 = CASE @userOwner1
                    WHEN @name0 THEN @ownerId0
                    WHEN @name1 THEN @ownerId1
                    WHEN @name2 THEN @ownerId2
                    WHEN @name3 THEN @ownerId3
                    WHEN @name4 THEN @ownerId4
                    ELSE NULL
                END;
                
                SET @invitedAvatarId1 = CASE @userOwner1
                    WHEN @name0 THEN @avatarId0
                    WHEN @name1 THEN @avatarId1
                    WHEN @name2 THEN @avatarId2
                    WHEN @name3 THEN @avatarId3
                    WHEN @name4 THEN @avatarId4
                    ELSE NULL
                END;
                
                SET @invitorOwnerId1 = CASE @userInvitor1
                    WHEN @name0 THEN @ownerId0
                    WHEN @name1 THEN @ownerId1
                    WHEN @name2 THEN @ownerId2
                    WHEN @name3 THEN @ownerId3
                    WHEN @name4 THEN @ownerId4
                    ELSE NULL
                END;
                
                INSERT INTO Invitation (email, created, edited, namespaceId, createdBy, editedBy, accepted, rejected, invitationKey)
                VALUES (@userEmail1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), @namespaceId, @invitorOwnerId1, @invitorOwnerId1, 1, 0, UUID());
                
                INSERT INTO NamespaceOwner (ownerId, namespaceId) VALUES (@invitedOwnerId1, @namespaceId);
                
                INSERT INTO User (name, namespaceId, ownerId, avatarId)
                VALUES (@userName1, @namespaceId, @invitedOwnerId1, @invitedAvatarId1);
            END IF;
            
            -- User 2
            IF JSON_LENGTH(argScenarioData, '$.namespaces[0].users') > 2 THEN
                SET @userName2 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].users[2].name'));
                SET @userEmail2 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].users[2].email'));
                SET @userOwner2 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].users[2].owner'));
                SET @userInvitor2 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].users[2].invitor'));
                
                SET @invitedOwnerId2 = CASE @userOwner2
                    WHEN @name0 THEN @ownerId0
                    WHEN @name1 THEN @ownerId1
                    WHEN @name2 THEN @ownerId2
                    WHEN @name3 THEN @ownerId3
                    WHEN @name4 THEN @ownerId4
                    ELSE NULL
                END;
                
                SET @invitedAvatarId2 = CASE @userOwner2
                    WHEN @name0 THEN @avatarId0
                    WHEN @name1 THEN @avatarId1
                    WHEN @name2 THEN @avatarId2
                    WHEN @name3 THEN @avatarId3
                    WHEN @name4 THEN @avatarId4
                    ELSE NULL
                END;
                
                SET @invitorOwnerId2 = CASE @userInvitor2
                    WHEN @name0 THEN @ownerId0
                    WHEN @name1 THEN @ownerId1
                    WHEN @name2 THEN @ownerId2
                    WHEN @name3 THEN @ownerId3
                    WHEN @name4 THEN @ownerId4
                    ELSE NULL
                END;
                
                INSERT INTO Invitation (email, created, edited, namespaceId, createdBy, editedBy, accepted, rejected, invitationKey)
                VALUES (@userEmail2, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), @namespaceId, @invitorOwnerId2, @invitorOwnerId2, 1, 0, UUID());
                
                INSERT INTO NamespaceOwner (ownerId, namespaceId) VALUES (@invitedOwnerId2, @namespaceId);
                
                INSERT INTO User (name, namespaceId, ownerId, avatarId)
                VALUES (@userName2, @namespaceId, @invitedOwnerId2, @invitedAvatarId2);
            END IF;
            
            -- Process unaccepted invitations - handle first 5
            IF JSON_LENGTH(argScenarioData, '$.namespaces[0].invitations') > 0 THEN
                SET @invEmail0 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].invitations[0].email'));
                SET @invInvitor0 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].invitations[0].invitor'));
                
                SET @invitorId0 = CASE @invInvitor0
                    WHEN @name0 THEN @ownerId0
                    WHEN @name1 THEN @ownerId1
                    WHEN @name2 THEN @ownerId2
                    WHEN @name3 THEN @ownerId3
                    WHEN @name4 THEN @ownerId4
                    ELSE NULL
                END;
                
                INSERT INTO Invitation (email, created, edited, namespaceId, createdBy, editedBy, accepted, rejected, invitationKey)
                VALUES (@invEmail0, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), @namespaceId, @invitorId0, @invitorId0, 0, 0, UUID());
            END IF;
            
            -- Process payment events - handle first 3
            IF JSON_LENGTH(argScenarioData, '$.namespaces[0].paymentEvents') > 0 THEN
                -- Payment Event 0
                SET @peUser0 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[0].user'));
                SET @peCreated0 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[0].data.created'));
                SET @peEdited0 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[0].data.edited'));
                SET @peDescription0 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[0].data.description'));
                SET @peNotes0 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[0].data.notes'));
                
                -- Convert string 'null' to actual NULL
                IF @peDescription0 = 'null' THEN SET @peDescription0 = NULL; END IF;
                IF @peNotes0 = 'null' THEN SET @peNotes0 = NULL; END IF;
                
                -- Find user ID for payment event creator
                -- First check if it's the creator
                IF @peUser0 = @nsCreator THEN
                    SET @peUserId0 = @creatorUserId;
                -- Check if it's user 0
                ELSEIF @peUser0 = @userName0 THEN
                    SET @peUserId0 = (SELECT id FROM User WHERE name = @userName0 AND namespaceId = @namespaceId LIMIT 1);
                -- Check if it's user 1
                ELSEIF @peUser0 = @userName1 THEN
                    SET @peUserId0 = (SELECT id FROM User WHERE name = @userName1 AND namespaceId = @namespaceId LIMIT 1);
                -- Check if it's user 2
                ELSEIF @peUser0 = @userName2 THEN
                    SET @peUserId0 = (SELECT id FROM User WHERE name = @userName2 AND namespaceId = @namespaceId LIMIT 1);
                ELSE
                    SET @peUserId0 = NULL;
                END IF;
                
                IF @peUserId0 IS NOT NULL THEN
                    -- Create payment event (convert ISO datetime strings to MySQL datetime)
                    -- Remove milliseconds and timezone from ISO string: 2024-03-15T10:24:19.871Z -> 2024-03-15 10:24:19
                    SET @peCreatedClean0 = REPLACE(SUBSTRING(@peCreated0, 1, 19), 'T', ' ');
                    SET @peEditedClean0 = REPLACE(SUBSTRING(@peEdited0, 1, 19), 'T', ' ');
                    
                    INSERT INTO PaymentEvent (created, edited, createdBy, editedBy, namespaceId, settlementId, description, notes)
                    VALUES (@peCreatedClean0, @peEditedClean0, @peUserId0, @peUserId0, @namespaceId, NULL, @peDescription0, @peNotes0);
                    SET @paymentEventId0 = LAST_INSERT_ID();
                    
                    -- Process paidBy nodes
                    SET @paidByCount0 = JSON_LENGTH(argScenarioData, '$.namespaces[0].paymentEvents[0].data.paidBy');
                    IF @paidByCount0 > 0 THEN
                        SET @pbUser0 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[0].data.paidBy[0].user'));
                        SET @pbAmount0 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[0].data.paidBy[0].amount'));
                        SET @pbCurrency0 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[0].data.paidBy[0].currency'));
                        
                        -- Find user ID
                        IF @pbUser0 = @nsCreator THEN
                            SET @pbUserId0 = @creatorUserId;
                        ELSEIF @pbUser0 = @userName0 THEN
                            SET @pbUserId0 = (SELECT id FROM User WHERE name = @userName0 AND namespaceId = @namespaceId LIMIT 1);
                        ELSEIF @pbUser0 = @userName1 THEN
                            SET @pbUserId0 = (SELECT id FROM User WHERE name = @userName1 AND namespaceId = @namespaceId LIMIT 1);
                        ELSEIF @pbUser0 = @userName2 THEN
                            SET @pbUserId0 = (SELECT id FROM User WHERE name = @userName2 AND namespaceId = @namespaceId LIMIT 1);
                        ELSE
                            SET @pbUserId0 = NULL;
                        END IF;
                        
                        IF @pbUserId0 IS NOT NULL THEN
                            INSERT INTO PaymentNode (userId, amount, currency, paymentEventId, type)
                            VALUES (@pbUserId0, @pbAmount0, @pbCurrency0, @paymentEventId0, 'P');
                        END IF;
                    END IF;
                    
                    -- Process benefitor nodes (handle up to 5)
                    SET @benefitorCount0 = JSON_LENGTH(argScenarioData, '$.namespaces[0].paymentEvents[0].data.benefitors');
                    
                    -- Benefitor 0
                    IF @benefitorCount0 > 0 THEN
                        SET @benUser0 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[0].data.benefitors[0].user'));
                        SET @benAmount0 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[0].data.benefitors[0].amount'));
                        SET @benCurrency0 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[0].data.benefitors[0].currency'));
                        
                        IF @benUser0 = @nsCreator THEN
                            SET @benUserId0 = @creatorUserId;
                        ELSEIF @benUser0 = @userName0 THEN
                            SET @benUserId0 = (SELECT id FROM User WHERE name = @userName0 AND namespaceId = @namespaceId LIMIT 1);
                        ELSEIF @benUser0 = @userName1 THEN
                            SET @benUserId0 = (SELECT id FROM User WHERE name = @userName1 AND namespaceId = @namespaceId LIMIT 1);
                        ELSEIF @benUser0 = @userName2 THEN
                            SET @benUserId0 = (SELECT id FROM User WHERE name = @userName2 AND namespaceId = @namespaceId LIMIT 1);
                        ELSE
                            SET @benUserId0 = NULL;
                        END IF;
                        
                        IF @benUserId0 IS NOT NULL THEN
                            INSERT INTO PaymentNode (userId, amount, currency, paymentEventId, type)
                            VALUES (@benUserId0, @benAmount0, @benCurrency0, @paymentEventId0, 'B');
                        END IF;
                    END IF;
                    
                    -- Benefitor 1
                    IF @benefitorCount0 > 1 THEN
                        SET @benUser1 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[0].data.benefitors[1].user'));
                        SET @benAmount1 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[0].data.benefitors[1].amount'));
                        SET @benCurrency1 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[0].data.benefitors[1].currency'));
                        
                        IF @benUser1 = @nsCreator THEN
                            SET @benUserId1 = @creatorUserId;
                        ELSEIF @benUser1 = @userName0 THEN
                            SET @benUserId1 = (SELECT id FROM User WHERE name = @userName0 AND namespaceId = @namespaceId LIMIT 1);
                        ELSEIF @benUser1 = @userName1 THEN
                            SET @benUserId1 = (SELECT id FROM User WHERE name = @userName1 AND namespaceId = @namespaceId LIMIT 1);
                        ELSEIF @benUser1 = @userName2 THEN
                            SET @benUserId1 = (SELECT id FROM User WHERE name = @userName2 AND namespaceId = @namespaceId LIMIT 1);
                        ELSE
                            SET @benUserId1 = NULL;
                        END IF;
                        
                        IF @benUserId1 IS NOT NULL THEN
                            INSERT INTO PaymentNode (userId, amount, currency, paymentEventId, type)
                            VALUES (@benUserId1, @benAmount1, @benCurrency1, @paymentEventId0, 'B');
                        END IF;
                    END IF;
                    
                    -- Benefitor 2
                    IF @benefitorCount0 > 2 THEN
                        SET @benUser2 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[0].data.benefitors[2].user'));
                        SET @benAmount2 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[0].data.benefitors[2].amount'));
                        SET @benCurrency2 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[0].data.benefitors[2].currency'));
                        
                        IF @benUser2 = @nsCreator THEN
                            SET @benUserId2 = @creatorUserId;
                        ELSEIF @benUser2 = @userName0 THEN
                            SET @benUserId2 = (SELECT id FROM User WHERE name = @userName0 AND namespaceId = @namespaceId LIMIT 1);
                        ELSEIF @benUser2 = @userName1 THEN
                            SET @benUserId2 = (SELECT id FROM User WHERE name = @userName1 AND namespaceId = @namespaceId LIMIT 1);
                        ELSEIF @benUser2 = @userName2 THEN
                            SET @benUserId2 = (SELECT id FROM User WHERE name = @userName2 AND namespaceId = @namespaceId LIMIT 1);
                        ELSE
                            SET @benUserId2 = NULL;
                        END IF;
                        
                        IF @benUserId2 IS NOT NULL THEN
                            INSERT INTO PaymentNode (userId, amount, currency, paymentEventId, type)
                            VALUES (@benUserId2, @benAmount2, @benCurrency2, @paymentEventId0, 'B');
                        END IF;
                    END IF;
                    
                    -- Benefitor 3
                    IF @benefitorCount0 > 3 THEN
                        SET @benUser3 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[0].data.benefitors[3].user'));
                        SET @benAmount3 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[0].data.benefitors[3].amount'));
                        SET @benCurrency3 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[0].data.benefitors[3].currency'));
                        
                        IF @benUser3 = @nsCreator THEN
                            SET @benUserId3 = @creatorUserId;
                        ELSEIF @benUser3 = @userName0 THEN
                            SET @benUserId3 = (SELECT id FROM User WHERE name = @userName0 AND namespaceId = @namespaceId LIMIT 1);
                        ELSEIF @benUser3 = @userName1 THEN
                            SET @benUserId3 = (SELECT id FROM User WHERE name = @userName1 AND namespaceId = @namespaceId LIMIT 1);
                        ELSEIF @benUser3 = @userName2 THEN
                            SET @benUserId3 = (SELECT id FROM User WHERE name = @userName2 AND namespaceId = @namespaceId LIMIT 1);
                        ELSE
                            SET @benUserId3 = NULL;
                        END IF;
                        
                        IF @benUserId3 IS NOT NULL THEN
                            INSERT INTO PaymentNode (userId, amount, currency, paymentEventId, type)
                            VALUES (@benUserId3, @benAmount3, @benCurrency3, @paymentEventId0, 'B');
                        END IF;
                    END IF;
                    
                    -- Benefitor 4
                    IF @benefitorCount0 > 4 THEN
                        SET @benUser4 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[0].data.benefitors[4].user'));
                        SET @benAmount4 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[0].data.benefitors[4].amount'));
                        SET @benCurrency4 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[0].data.benefitors[4].currency'));
                        
                        IF @benUser4 = @nsCreator THEN
                            SET @benUserId4 = @creatorUserId;
                        ELSEIF @benUser4 = @userName0 THEN
                            SET @benUserId4 = (SELECT id FROM User WHERE name = @userName0 AND namespaceId = @namespaceId LIMIT 1);
                        ELSEIF @benUser4 = @userName1 THEN
                            SET @benUserId4 = (SELECT id FROM User WHERE name = @userName1 AND namespaceId = @namespaceId LIMIT 1);
                        ELSEIF @benUser4 = @userName2 THEN
                            SET @benUserId4 = (SELECT id FROM User WHERE name = @userName2 AND namespaceId = @namespaceId LIMIT 1);
                        ELSE
                            SET @benUserId4 = NULL;
                        END IF;
                        
                        IF @benUserId4 IS NOT NULL THEN
                            INSERT INTO PaymentNode (userId, amount, currency, paymentEventId, type)
                            VALUES (@benUserId4, @benAmount4, @benCurrency4, @paymentEventId0, 'B');
                        END IF;
                    END IF;
                END IF;
            END IF;
            
            -- Payment Event 1 (if exists)
            IF JSON_LENGTH(argScenarioData, '$.namespaces[0].paymentEvents') > 1 THEN
                SET @peUser1 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[1].user'));
                SET @peCreated1 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[1].data.created'));
                SET @peEdited1 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[1].data.edited'));
                SET @peDescription1 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[1].data.description'));
                SET @peNotes1 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[1].data.notes'));
                
                IF @peDescription1 = 'null' THEN SET @peDescription1 = NULL; END IF;
                IF @peNotes1 = 'null' THEN SET @peNotes1 = NULL; END IF;
                
                -- Find user ID
                IF @peUser1 = @nsCreator THEN
                    SET @peUserId1 = @creatorUserId;
                ELSEIF @peUser1 = @userName0 THEN
                    SET @peUserId1 = (SELECT id FROM User WHERE name = @userName0 AND namespaceId = @namespaceId LIMIT 1);
                ELSEIF @peUser1 = @userName1 THEN
                    SET @peUserId1 = (SELECT id FROM User WHERE name = @userName1 AND namespaceId = @namespaceId LIMIT 1);
                ELSEIF @peUser1 = @userName2 THEN
                    SET @peUserId1 = (SELECT id FROM User WHERE name = @userName2 AND namespaceId = @namespaceId LIMIT 1);
                ELSE
                    SET @peUserId1 = NULL;
                END IF;
                
                IF @peUserId1 IS NOT NULL THEN
                    SET @peCreatedClean1 = REPLACE(SUBSTRING(@peCreated1, 1, 19), 'T', ' ');
                    SET @peEditedClean1 = REPLACE(SUBSTRING(@peEdited1, 1, 19), 'T', ' ');
                    
                    INSERT INTO PaymentEvent (created, edited, createdBy, editedBy, namespaceId, settlementId, description, notes)
                    VALUES (@peCreatedClean1, @peEditedClean1, @peUserId1, @peUserId1, @namespaceId, NULL, @peDescription1, @peNotes1);
                    SET @paymentEventId1 = LAST_INSERT_ID();
                    
                    -- Process paidBy for event 1
                    IF JSON_LENGTH(argScenarioData, '$.namespaces[0].paymentEvents[1].data.paidBy') > 0 THEN
                        SET @pbUser1_0 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[1].data.paidBy[0].user'));
                        SET @pbAmount1_0 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[1].data.paidBy[0].amount'));
                        SET @pbCurrency1_0 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[1].data.paidBy[0].currency'));
                        
                        IF @pbUser1_0 = @nsCreator THEN SET @pbUserId1_0 = @creatorUserId;
                        ELSEIF @pbUser1_0 = @userName0 THEN SET @pbUserId1_0 = (SELECT id FROM User WHERE name = @userName0 AND namespaceId = @namespaceId LIMIT 1);
                        ELSEIF @pbUser1_0 = @userName1 THEN SET @pbUserId1_0 = (SELECT id FROM User WHERE name = @userName1 AND namespaceId = @namespaceId LIMIT 1);
                        ELSEIF @pbUser1_0 = @userName2 THEN SET @pbUserId1_0 = (SELECT id FROM User WHERE name = @userName2 AND namespaceId = @namespaceId LIMIT 1);
                        ELSE SET @pbUserId1_0 = NULL;
                        END IF;
                        
                        IF @pbUserId1_0 IS NOT NULL THEN
                            INSERT INTO PaymentNode (userId, amount, currency, paymentEventId, type)
                            VALUES (@pbUserId1_0, @pbAmount1_0, @pbCurrency1_0, @paymentEventId1, 'P');
                        END IF;
                    END IF;
                    
                    -- Process benefitors for event 1 (up to 5)
                    SET @benefitorCount1 = JSON_LENGTH(argScenarioData, '$.namespaces[0].paymentEvents[1].data.benefitors');
                    
                    IF @benefitorCount1 > 0 THEN
                        SET @benUser1_0 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[1].data.benefitors[0].user'));
                        SET @benAmount1_0 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[1].data.benefitors[0].amount'));
                        SET @benCurrency1_0 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[1].data.benefitors[0].currency'));
                        
                        IF @benUser1_0 = @nsCreator THEN SET @benUserId1_0 = @creatorUserId;
                        ELSEIF @benUser1_0 = @userName0 THEN SET @benUserId1_0 = (SELECT id FROM User WHERE name = @userName0 AND namespaceId = @namespaceId LIMIT 1);
                        ELSEIF @benUser1_0 = @userName1 THEN SET @benUserId1_0 = (SELECT id FROM User WHERE name = @userName1 AND namespaceId = @namespaceId LIMIT 1);
                        ELSEIF @benUser1_0 = @userName2 THEN SET @benUserId1_0 = (SELECT id FROM User WHERE name = @userName2 AND namespaceId = @namespaceId LIMIT 1);
                        ELSE SET @benUserId1_0 = NULL;
                        END IF;
                        
                        IF @benUserId1_0 IS NOT NULL THEN
                            INSERT INTO PaymentNode (userId, amount, currency, paymentEventId, type)
                            VALUES (@benUserId1_0, @benAmount1_0, @benCurrency1_0, @paymentEventId1, 'B');
                        END IF;
                    END IF;
                    
                    IF @benefitorCount1 > 1 THEN
                        SET @benUser1_1 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[1].data.benefitors[1].user'));
                        SET @benAmount1_1 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[1].data.benefitors[1].amount'));
                        SET @benCurrency1_1 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[1].data.benefitors[1].currency'));
                        
                        IF @benUser1_1 = @nsCreator THEN SET @benUserId1_1 = @creatorUserId;
                        ELSEIF @benUser1_1 = @userName0 THEN SET @benUserId1_1 = (SELECT id FROM User WHERE name = @userName0 AND namespaceId = @namespaceId LIMIT 1);
                        ELSEIF @benUser1_1 = @userName1 THEN SET @benUserId1_1 = (SELECT id FROM User WHERE name = @userName1 AND namespaceId = @namespaceId LIMIT 1);
                        ELSEIF @benUser1_1 = @userName2 THEN SET @benUserId1_1 = (SELECT id FROM User WHERE name = @userName2 AND namespaceId = @namespaceId LIMIT 1);
                        ELSE SET @benUserId1_1 = NULL;
                        END IF;
                        
                        IF @benUserId1_1 IS NOT NULL THEN
                            INSERT INTO PaymentNode (userId, amount, currency, paymentEventId, type)
                            VALUES (@benUserId1_1, @benAmount1_1, @benCurrency1_1, @paymentEventId1, 'B');
                        END IF;
                    END IF;
                    
                    IF @benefitorCount1 > 2 THEN
                        SET @benUser1_2 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[1].data.benefitors[2].user'));
                        SET @benAmount1_2 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[1].data.benefitors[2].amount'));
                        SET @benCurrency1_2 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[1].data.benefitors[2].currency'));
                        
                        IF @benUser1_2 = @nsCreator THEN SET @benUserId1_2 = @creatorUserId;
                        ELSEIF @benUser1_2 = @userName0 THEN SET @benUserId1_2 = (SELECT id FROM User WHERE name = @userName0 AND namespaceId = @namespaceId LIMIT 1);
                        ELSEIF @benUser1_2 = @userName1 THEN SET @benUserId1_2 = (SELECT id FROM User WHERE name = @userName1 AND namespaceId = @namespaceId LIMIT 1);
                        ELSEIF @benUser1_2 = @userName2 THEN SET @benUserId1_2 = (SELECT id FROM User WHERE name = @userName2 AND namespaceId = @namespaceId LIMIT 1);
                        ELSE SET @benUserId1_2 = NULL;
                        END IF;
                        
                        IF @benUserId1_2 IS NOT NULL THEN
                            INSERT INTO PaymentNode (userId, amount, currency, paymentEventId, type)
                            VALUES (@benUserId1_2, @benAmount1_2, @benCurrency1_2, @paymentEventId1, 'B');
                        END IF;
                    END IF;
                    
                    IF @benefitorCount1 > 3 THEN
                        SET @benUser1_3 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[1].data.benefitors[3].user'));
                        SET @benAmount1_3 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[1].data.benefitors[3].amount'));
                        SET @benCurrency1_3 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[1].data.benefitors[3].currency'));
                        
                        IF @benUser1_3 = @nsCreator THEN SET @benUserId1_3 = @creatorUserId;
                        ELSEIF @benUser1_3 = @userName0 THEN SET @benUserId1_3 = (SELECT id FROM User WHERE name = @userName0 AND namespaceId = @namespaceId LIMIT 1);
                        ELSEIF @benUser1_3 = @userName1 THEN SET @benUserId1_3 = (SELECT id FROM User WHERE name = @userName1 AND namespaceId = @namespaceId LIMIT 1);
                        ELSEIF @benUser1_3 = @userName2 THEN SET @benUserId1_3 = (SELECT id FROM User WHERE name = @userName2 AND namespaceId = @namespaceId LIMIT 1);
                        ELSE SET @benUserId1_3 = NULL;
                        END IF;
                        
                        IF @benUserId1_3 IS NOT NULL THEN
                            INSERT INTO PaymentNode (userId, amount, currency, paymentEventId, type)
                            VALUES (@benUserId1_3, @benAmount1_3, @benCurrency1_3, @paymentEventId1, 'B');
                        END IF;
                    END IF;
                    
                    IF @benefitorCount1 > 4 THEN
                        SET @benUser1_4 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[1].data.benefitors[4].user'));
                        SET @benAmount1_4 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[1].data.benefitors[4].amount'));
                        SET @benCurrency1_4 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[0].paymentEvents[1].data.benefitors[4].currency'));
                        
                        IF @benUser1_4 = @nsCreator THEN SET @benUserId1_4 = @creatorUserId;
                        ELSEIF @benUser1_4 = @userName0 THEN SET @benUserId1_4 = (SELECT id FROM User WHERE name = @userName0 AND namespaceId = @namespaceId LIMIT 1);
                        ELSEIF @benUser1_4 = @userName1 THEN SET @benUserId1_4 = (SELECT id FROM User WHERE name = @userName1 AND namespaceId = @namespaceId LIMIT 1);
                        ELSEIF @benUser1_4 = @userName2 THEN SET @benUserId1_4 = (SELECT id FROM User WHERE name = @userName2 AND namespaceId = @namespaceId LIMIT 1);
                        ELSE SET @benUserId1_4 = NULL;
                        END IF;
                        
                        IF @benUserId1_4 IS NOT NULL THEN
                            INSERT INTO PaymentNode (userId, amount, currency, paymentEventId, type)
                            VALUES (@benUserId1_4, @benAmount1_4, @benCurrency1_4, @paymentEventId1, 'B');
                        END IF;
                    END IF;
                END IF;
            END IF;
            
            -- Payment Events 2 and 3 (compact version)
            SET @peCount = JSON_LENGTH(argScenarioData, '$.namespaces[0].paymentEvents');
            SET @peIdx = 2;
            
            WHILE @peIdx < @peCount AND @peIdx < 10 DO
                SET @peUserX = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, CONCAT('$.namespaces[0].paymentEvents[', @peIdx, '].user')));
                SET @peCreatedX = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, CONCAT('$.namespaces[0].paymentEvents[', @peIdx, '].data.created')));
                SET @peEditedX = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, CONCAT('$.namespaces[0].paymentEvents[', @peIdx, '].data.edited')));
                SET @peDescriptionX = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, CONCAT('$.namespaces[0].paymentEvents[', @peIdx, '].data.description')));
                SET @peNotesX = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, CONCAT('$.namespaces[0].paymentEvents[', @peIdx, '].data.notes')));
                
                IF @peDescriptionX = 'null' THEN SET @peDescriptionX = NULL; END IF;
                IF @peNotesX = 'null' THEN SET @peNotesX = NULL; END IF;
                
                -- Find user
                SET @peUserIdX = CASE @peUserX
                    WHEN @nsCreator THEN @creatorUserId
                    WHEN @userName0 THEN (SELECT id FROM User WHERE name = @userName0 AND namespaceId = @namespaceId LIMIT 1)
                    WHEN @userName1 THEN (SELECT id FROM User WHERE name = @userName1 AND namespaceId = @namespaceId LIMIT 1)
                    WHEN @userName2 THEN (SELECT id FROM User WHERE name = @userName2 AND namespaceId = @namespaceId LIMIT 1)
                    ELSE NULL
                END;
                
                IF @peUserIdX IS NOT NULL THEN
                    SET @peCreatedCleanX = REPLACE(SUBSTRING(@peCreatedX, 1, 19), 'T', ' ');
                    SET @peEditedCleanX = REPLACE(SUBSTRING(@peEditedX, 1, 19), 'T', ' ');
                    
                    INSERT INTO PaymentEvent (created, edited, createdBy, editedBy, namespaceId, settlementId, description, notes)
                    VALUES (@peCreatedCleanX, @peEditedCleanX, @peUserIdX, @peUserIdX, @namespaceId, NULL, @peDescriptionX, @peNotesX);
                    SET @paymentEventIdX = LAST_INSERT_ID();
                    
                    -- PaidBy
                    IF JSON_LENGTH(argScenarioData, CONCAT('$.namespaces[0].paymentEvents[', @peIdx, '].data.paidBy')) > 0 THEN
                        SET @pbUserX = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, CONCAT('$.namespaces[0].paymentEvents[', @peIdx, '].data.paidBy[0].user')));
                        SET @pbAmountX = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, CONCAT('$.namespaces[0].paymentEvents[', @peIdx, '].data.paidBy[0].amount')));
                        SET @pbCurrencyX = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, CONCAT('$.namespaces[0].paymentEvents[', @peIdx, '].data.paidBy[0].currency')));
                        SET @pbUserIdX = CASE @pbUserX
                            WHEN @nsCreator THEN @creatorUserId
                            WHEN @userName0 THEN (SELECT id FROM User WHERE name = @userName0 AND namespaceId = @namespaceId LIMIT 1)
                            WHEN @userName1 THEN (SELECT id FROM User WHERE name = @userName1 AND namespaceId = @namespaceId LIMIT 1)
                            WHEN @userName2 THEN (SELECT id FROM User WHERE name = @userName2 AND namespaceId = @namespaceId LIMIT 1)
                            ELSE NULL
                        END;
                        IF @pbUserIdX IS NOT NULL THEN
                            INSERT INTO PaymentNode (userId, amount, currency, paymentEventId, type)
                            VALUES (@pbUserIdX, @pbAmountX, @pbCurrencyX, @paymentEventIdX, 'P');
                        END IF;
                    END IF;
                    
                    -- Benefitors (up to 5)
                    SET @benCountX = JSON_LENGTH(argScenarioData, CONCAT('$.namespaces[0].paymentEvents[', @peIdx, '].data.benefitors'));
                    SET @benIdxX = 0;
                    WHILE @benIdxX < @benCountX AND @benIdxX < 5 DO
                        SET @benUserX = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, CONCAT('$.namespaces[0].paymentEvents[', @peIdx, '].data.benefitors[', @benIdxX, '].user')));
                        SET @benAmountX = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, CONCAT('$.namespaces[0].paymentEvents[', @peIdx, '].data.benefitors[', @benIdxX, '].amount')));
                        SET @benCurrencyX = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, CONCAT('$.namespaces[0].paymentEvents[', @peIdx, '].data.benefitors[', @benIdxX, '].currency')));
                        SET @benUserIdX = CASE @benUserX
                            WHEN @nsCreator THEN @creatorUserId
                            WHEN @userName0 THEN (SELECT id FROM User WHERE name = @userName0 AND namespaceId = @namespaceId LIMIT 1)
                            WHEN @userName1 THEN (SELECT id FROM User WHERE name = @userName1 AND namespaceId = @namespaceId LIMIT 1)
                            WHEN @userName2 THEN (SELECT id FROM User WHERE name = @userName2 AND namespaceId = @namespaceId LIMIT 1)
                            ELSE NULL
                        END;
                        IF @benUserIdX IS NOT NULL THEN
                            INSERT INTO PaymentNode (userId, amount, currency, paymentEventId, type)
                            VALUES (@benUserIdX, @benAmountX, @benCurrencyX, @paymentEventIdX, 'B');
                        END IF;
                        SET @benIdxX = @benIdxX + 1;
                    END WHILE;
                END IF;
                
                SET @peIdx = @peIdx + 1;
            END WHILE;
            
        END IF;
    END IF;
    
    -- Process second namespace (namespaces[1]) - simplified version without users/payment events
    IF JSON_LENGTH(argScenarioData, '$.namespaces') > 1 THEN
        SET @nsName1 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[1].name'));
        SET @nsCreator1 = JSON_UNQUOTE(JSON_EXTRACT(argScenarioData, '$.namespaces[1].creator'));
        
        -- Find creator owner ID
        SET @creatorOwnerId1 = CASE @nsCreator1
            WHEN @name0 THEN @ownerId0
            WHEN @name1 THEN @ownerId1
            WHEN @name2 THEN @ownerId2
            WHEN @name3 THEN @ownerId3
            WHEN @name4 THEN @ownerId4
            ELSE NULL
        END;
        
        SET @creatorAvatarId1 = CASE @nsCreator1
            WHEN @name0 THEN @avatarId0
            WHEN @name1 THEN @avatarId1
            WHEN @name2 THEN @avatarId2
            WHEN @name3 THEN @avatarId3
            WHEN @name4 THEN @avatarId4
            ELSE NULL
        END;
        
        IF @creatorOwnerId1 IS NOT NULL THEN
            -- Create namespace
            SET @nsColor1 = CONCAT('#', LPAD(HEX(FLOOR(RAND() * 16777215)), 6, '0'));
            INSERT INTO Avatar (color, url) VALUES (@nsColor1, NULL);
            SET @nsAvatarId1 = LAST_INSERT_ID();
            
            INSERT INTO Namespace (name, avatarId) VALUES (@nsName1, @nsAvatarId1);
            SET @namespaceId1 = LAST_INSERT_ID();
            
            -- Link creator to namespace
            INSERT INTO NamespaceOwner (ownerId, namespaceId) VALUES (@creatorOwnerId1, @namespaceId1);
            
            -- Create creator user
            INSERT INTO User (name, namespaceId, ownerId, avatarId) 
            VALUES (@nsCreator1, @namespaceId1, @creatorOwnerId1, @creatorAvatarId1);
        END IF;
    END IF;
    
    -- Return owner IDs as JSON array (always execute this, even if no namespaces)
    SET jsonResult = CONCAT('[', @ownerId0);
    IF JSON_LENGTH(argScenarioData, '$.owners') > 1 THEN
        SET jsonResult = CONCAT(jsonResult, ',', @ownerId1);
    END IF;
    IF JSON_LENGTH(argScenarioData, '$.owners') > 2 THEN
        SET jsonResult = CONCAT(jsonResult, ',', @ownerId2);
    END IF;
    IF JSON_LENGTH(argScenarioData, '$.owners') > 3 THEN
        SET jsonResult = CONCAT(jsonResult, ',', @ownerId3);
    END IF;
    IF JSON_LENGTH(argScenarioData, '$.owners') > 4 THEN
        SET jsonResult = CONCAT(jsonResult, ',', @ownerId4);
    END IF;
    SET jsonResult = CONCAT(jsonResult, ']');
    
    SELECT procedureError;
    SELECT jsonResult;
END;
