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