import { query } from "../connection/connection"

async function deleteOwner(
    username: string
) {
    await query(
        `DELETE FROM Owner WHERE username = "${username}"`
    )
}

export const OWNER_SERVICE = {
    deleteOwner,
}