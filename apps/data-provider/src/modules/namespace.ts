import { query } from "../connection/connection";
import { insertSql } from "../connection/helper";
import { NamespaceOwnerEntity } from "../types";

export async function addOwnerToNamespace (
    ownerId: number,
    namespaceId: number,
) {
    await query(insertSql(
        'NamespaceOwner',
        NamespaceOwnerEntity,
        { ownerId, namespaceId }
      ));
}

export const NAMESPACE_SERVICE = {
    deleteNamespace: async (
        namespaceId: number
    ) => {
        await query(
            `DELETE FROM \`Namespace\`
            WHERE id = ${namespaceId}
            `
        )
    },
    deleteNamespaceByName: async (
        namespaceName: string
    ) => {
        await query(
            `DELETE FROM \`Namespace\`
            WHERE name = "${namespaceName}"
            `
        )
    }
}