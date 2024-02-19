import { AvatarData } from "@angular-monorepo/entities";
import { lastInsertId, query } from "../connection/connection"
import { insertSql, selectOneWhereSql } from "../connection/helper"
import { AvatarEntity, EntityPropertyType } from "../types"

export const AVATAR_SERVICE = {
    createAvatar: async (
        color: string,
        dataUrl: string,
    ) => {
        await query(insertSql(
            'Avatar',
            AvatarEntity,
            { color, dataUrl }
        ));

        const id = await lastInsertId();

        return await AVATAR_SERVICE.getById(id);
    },
    getById: async (
        id: number,
    ) => {
        const avatar = await selectOneWhereSql<AvatarData>(
            'Avatar',
            'id',
            EntityPropertyType.ID,
            id,
            AvatarEntity,
        );

        return avatar;
    }
}